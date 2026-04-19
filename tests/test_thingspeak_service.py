import pytest
from fastapi import status

from app.schemas.measurement import ThingSpeakFieldMapping, ThingSpeakIngestionRequest
from app.services import thingspeak_service
from app.services.measurement_service import MeasurementServiceError
from app.services.thingspeak_service import (
    DUPLICATE_MEASUREMENT_CONFLICT_DETAIL,
    ThingSpeakIntegrationError,
    import_measurements_from_thingspeak,
)


def _request_data() -> ThingSpeakIngestionRequest:
    return ThingSpeakIngestionRequest(
        farm_id=5,
        season_id=4,
        sensor_id="THINGSPEAK-3313997",
        results=1,
        default_depth_cm=10,
        field_mappings=[
            ThingSpeakFieldMapping(field_id=1, target="Nitrogen"),
            ThingSpeakFieldMapping(field_id=5, target="Organic_Carbon"),
            ThingSpeakFieldMapping(field_id=6, target="depth_cm"),
        ],
    )


def _valid_feed() -> list[dict[str, str | int]]:
    return [
        {
            "entry_id": 101,
            "created_at": "2026-04-19T12:00:00Z",
            "field1": "31.8",
            "field5": "1098.0",
            "field6": "10.0",
        }
    ]


def test_thingspeak_duplicate_conflict_is_reported_as_skipped(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(thingspeak_service, "_ensure_standard_nutrients", lambda db, request: None)
    monkeypatch.setattr(thingspeak_service, "_fetch_thingspeak_feeds", lambda url: _valid_feed())

    def raise_duplicate_conflict(db: object, measurement: object) -> dict:
        raise MeasurementServiceError(
            status.HTTP_409_CONFLICT,
            DUPLICATE_MEASUREMENT_CONFLICT_DETAIL,
        )

    monkeypatch.setattr(thingspeak_service, "create_measurement", raise_duplicate_conflict)

    result = import_measurements_from_thingspeak(object(), _request_data())

    assert result["imported_count"] == 0
    assert result["skipped_count"] == 1
    assert result["skipped_entries"][0].entry_id == 101
    assert "already stored" in result["skipped_entries"][0].reason


def test_thingspeak_non_duplicate_conflict_is_not_masked_as_skipped(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(thingspeak_service, "_ensure_standard_nutrients", lambda db, request: None)
    monkeypatch.setattr(thingspeak_service, "_fetch_thingspeak_feeds", lambda url: _valid_feed())

    def raise_closed_season_conflict(db: object, measurement: object) -> dict:
        raise MeasurementServiceError(
            status.HTTP_409_CONFLICT,
            "Measurements can only be ingested for active seasons",
        )

    monkeypatch.setattr(thingspeak_service, "create_measurement", raise_closed_season_conflict)

    with pytest.raises(ThingSpeakIntegrationError) as exc_info:
        import_measurements_from_thingspeak(object(), _request_data())

    assert exc_info.value.status_code == status.HTTP_409_CONFLICT
    assert exc_info.value.detail == "Measurements can only be ingested for active seasons"
