from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.measurement import Nutrient
from app.core.config import settings
from app.schemas.measurement import (
    MeasurementCreate,
    NutrientMeasurement,
    ThingSpeakIngestionRequest,
    ThingSpeakSkippedEntry,
)
from app.services.measurement_service import MeasurementServiceError, create_measurement

THING_SPEAK_SPECIAL_TARGETS = {"depth_cm", "latitude", "longitude"}
STANDARD_NUTRIENT_DEFINITIONS: dict[str, dict[str, float | str | None]] = {
    "nitrogen": {"name": "Nitrogen", "unit": "ppm", "min": 20.0, "max": 50.0},
    "phosphorus": {"name": "Phosphorus", "unit": "ppm", "min": 15.0, "max": 30.0},
    "potassium": {"name": "Potassium", "unit": "ppm", "min": 120.0, "max": 250.0},
    "moisture": {"name": "Moisture", "unit": "%", "min": 10.0, "max": 80.0},
    "organic_carbon": {
        "name": "Organic_Carbon",
        "unit": "kg/ha",
        "min": 500.0,
        "max": 2000.0,
    },
    "ph": {"name": "pH", "unit": "pH", "min": 6.0, "max": 7.5},
}


class ThingSpeakIntegrationError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


@dataclass
class _ThingSpeakEntryBuildError:
    entry_id: int | None
    reason: str


def _parse_float(value: Any) -> float | None:
    if value is None:
        return None

    value_text = str(value).strip()
    if not value_text:
        return None

    try:
        return float(value_text)
    except ValueError:
        return None


def _parse_entry_id(value: Any) -> int | None:
    if value is None:
        return None

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _parse_created_at(value: Any) -> datetime | None:
    if value is None:
        return None

    value_text = str(value).strip()
    if not value_text:
        return None

    try:
        return datetime.fromisoformat(value_text.replace("Z", "+00:00"))
    except ValueError:
        return None


def _resolve_channel_id(request_data: ThingSpeakIngestionRequest) -> int:
    channel_id = request_data.channel_id or settings.THINGSPEAK_CHANNEL_ID
    if channel_id is None:
        raise ThingSpeakIntegrationError(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "ThingSpeak channel_id is required in the request or THINGSPEAK_CHANNEL_ID setting",
        )

    return channel_id


def _ensure_standard_nutrients(db: Session, request_data: ThingSpeakIngestionRequest) -> None:
    requested_targets = {
        mapping.target.lower()
        for mapping in request_data.field_mappings
        if mapping.target.lower() not in THING_SPEAK_SPECIAL_TARGETS
    }
    standard_targets = requested_targets.intersection(STANDARD_NUTRIENT_DEFINITIONS.keys())
    if not standard_targets:
        return

    existing_targets = {
        value
        for value in db.scalars(
            select(func.lower(Nutrient.nutrient_name)).where(
                func.lower(Nutrient.nutrient_name).in_(standard_targets)
            )
        ).all()
    }

    created_any = False
    for target in standard_targets:
        if target in existing_targets:
            continue

        definition = STANDARD_NUTRIENT_DEFINITIONS[target]
        db.add(
            Nutrient(
                nutrient_name=str(definition["name"]),
                unit=str(definition["unit"]),
                optimal_range_min=definition["min"],
                optimal_range_max=definition["max"],
            )
        )
        created_any = True

    if created_any:
        db.commit()


def _build_thingspeak_url(
    channel_id: int,
    read_api_key: str | None,
    results: int,
) -> str:
    query_params: dict[str, str | int] = {"results": results}
    if read_api_key:
        query_params["api_key"] = read_api_key

    base_url = settings.THINGSPEAK_BASE_URL.rstrip("/")
    return f"{base_url}/channels/{channel_id}/feeds.json?{urlencode(query_params)}"


def _fetch_thingspeak_feeds(url: str) -> list[dict[str, Any]]:
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "CarbonCreditMonitoringSystem/1.0",
        },
    )

    try:
        with urlopen(request, timeout=settings.THINGSPEAK_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        raise ThingSpeakIntegrationError(
            status.HTTP_502_BAD_GATEWAY,
            f"ThingSpeak request failed with HTTP {exc.code}",
        ) from exc
    except URLError as exc:
        raise ThingSpeakIntegrationError(
            status.HTTP_502_BAD_GATEWAY,
            "ThingSpeak could not be reached from the backend service",
        ) from exc
    except json.JSONDecodeError as exc:
        raise ThingSpeakIntegrationError(
            status.HTTP_502_BAD_GATEWAY,
            "ThingSpeak returned an invalid JSON response",
        ) from exc

    feeds = payload.get("feeds")
    if not isinstance(feeds, list):
        raise ThingSpeakIntegrationError(
            status.HTTP_502_BAD_GATEWAY,
            "ThingSpeak response did not contain a valid feeds array",
        )

    return [feed for feed in feeds if isinstance(feed, dict)]


def _build_measurement_from_feed(
    request_data: ThingSpeakIngestionRequest,
    feed: dict[str, Any],
) -> MeasurementCreate | _ThingSpeakEntryBuildError:
    entry_id = _parse_entry_id(feed.get("entry_id"))
    depth_cm = request_data.default_depth_cm
    latitude = request_data.default_latitude
    longitude = request_data.default_longitude
    nutrients: list[NutrientMeasurement] = []

    for mapping in request_data.field_mappings:
        raw_value = feed.get(f"field{mapping.field_id}")
        numeric_value = _parse_float(raw_value)
        if numeric_value is None:
            continue

        normalized_target = mapping.target.lower()
        if normalized_target == "depth_cm":
            depth_cm = numeric_value
            continue

        if normalized_target == "latitude":
            latitude = numeric_value
            continue

        if normalized_target == "longitude":
            longitude = numeric_value
            continue

        nutrients.append(
            NutrientMeasurement(
                nutrient_name=mapping.target,
                measured_value=numeric_value,
            )
        )

    if depth_cm is None:
        return _ThingSpeakEntryBuildError(
            entry_id=entry_id,
            reason="No usable depth_cm value was found for this ThingSpeak entry",
        )

    if not nutrients:
        return _ThingSpeakEntryBuildError(
            entry_id=entry_id,
            reason="No mapped nutrient values were found for this ThingSpeak entry",
        )

    created_at = _parse_created_at(feed.get("created_at"))
    if feed.get("created_at") is not None and created_at is None:
        return _ThingSpeakEntryBuildError(
            entry_id=entry_id,
            reason="ThingSpeak created_at could not be parsed into a timestamp",
        )

    return MeasurementCreate(
        farm_id=request_data.farm_id,
        season_id=request_data.season_id,
        depth_cm=depth_cm,
        latitude=latitude,
        longitude=longitude,
        sensor_id=request_data.sensor_id,
        measurement_date=created_at,
        nutrients=nutrients,
    )


def import_measurements_from_thingspeak(
    db: Session,
    request_data: ThingSpeakIngestionRequest,
) -> dict[str, Any]:
    _ensure_standard_nutrients(db, request_data)
    channel_id = _resolve_channel_id(request_data)
    read_api_key = request_data.read_api_key or settings.THINGSPEAK_READ_API_KEY
    url = _build_thingspeak_url(channel_id, read_api_key, request_data.results)
    feeds = _fetch_thingspeak_feeds(url)

    if not feeds:
        raise ThingSpeakIntegrationError(
            status.HTTP_404_NOT_FOUND,
            "ThingSpeak returned no feeds for the requested channel",
        )

    imported_measurement_ids: list[int] = []
    skipped_entries: list[ThingSpeakSkippedEntry] = []

    for feed in feeds:
        entry_id = _parse_entry_id(feed.get("entry_id"))
        measurement_candidate = _build_measurement_from_feed(request_data, feed)

        if isinstance(measurement_candidate, _ThingSpeakEntryBuildError):
            skipped_entries.append(
                ThingSpeakSkippedEntry(
                    entry_id=measurement_candidate.entry_id,
                    reason=measurement_candidate.reason,
                )
            )
            continue

        try:
            result = create_measurement(db, measurement_candidate)
            imported_measurement_ids.append(result["measurement_id"])
        except MeasurementServiceError as exc:
            if exc.status_code == status.HTTP_409_CONFLICT and request_data.skip_duplicates:
                skipped_entries.append(
                    ThingSpeakSkippedEntry(
                        entry_id=entry_id,
                        reason="This ThingSpeak entry was already imported or conflicts with existing measurement data",
                    )
                )
                continue

            raise ThingSpeakIntegrationError(exc.status_code, exc.detail) from exc

    imported_count = len(imported_measurement_ids)
    skipped_count = len(skipped_entries)

    if imported_count == 0:
        message = "ThingSpeak import completed, but no new measurements were stored"
    elif skipped_count == 0:
        message = "ThingSpeak import completed successfully"
    else:
        message = "ThingSpeak import completed with partial success"

    return {
        "channel_id": channel_id,
        "imported_count": imported_count,
        "skipped_count": skipped_count,
        "imported_measurement_ids": imported_measurement_ids,
        "skipped_entries": skipped_entries,
        "message": message,
    }
