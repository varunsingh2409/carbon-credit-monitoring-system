from decimal import Decimal

from fastapi import status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.farm import Farm
from app.models.measurement import MeasurementResult, Nutrient, SoilMeasurement
from app.models.season import Season
from app.schemas.measurement import MeasurementCreate


class MeasurementServiceError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def _to_decimal(value: float | None) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(value))


def create_measurement(db: Session, measurement_data: MeasurementCreate) -> dict:
    farm = db.get(Farm, measurement_data.farm_id)
    if farm is None:
        raise MeasurementServiceError(
            status.HTTP_404_NOT_FOUND,
            f"Farm with id {measurement_data.farm_id} was not found",
        )

    season = db.get(Season, measurement_data.season_id)
    if season is None:
        raise MeasurementServiceError(
            status.HTTP_404_NOT_FOUND,
            f"Season with id {measurement_data.season_id} was not found",
        )

    if season.farm_id != measurement_data.farm_id:
        raise MeasurementServiceError(
            status.HTTP_400_BAD_REQUEST,
            "The provided season does not belong to the specified farm",
        )

    if season.status != "active":
        raise MeasurementServiceError(
            status.HTTP_409_CONFLICT,
            "Measurements can only be ingested for active seasons",
        )

    normalized_names = [item.nutrient_name.lower() for item in measurement_data.nutrients]
    nutrient_stmt = select(Nutrient).where(
        func.lower(Nutrient.nutrient_name).in_(normalized_names)
    )
    nutrient_records = list(db.scalars(nutrient_stmt).all())
    nutrient_map = {nutrient.nutrient_name.lower(): nutrient for nutrient in nutrient_records}

    missing_nutrients = sorted(
        {
            item.nutrient_name
            for item in measurement_data.nutrients
            if item.nutrient_name.lower() not in nutrient_map
        }
    )
    if missing_nutrients:
        raise MeasurementServiceError(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            f"Unknown nutrient names: {', '.join(missing_nutrients)}",
        )

    warnings: list[str] = []
    for item in measurement_data.nutrients:
        nutrient = nutrient_map[item.nutrient_name.lower()]
        measured_value = _to_decimal(item.measured_value)

        if nutrient.optimal_range_min is not None and measured_value < nutrient.optimal_range_min:
            warnings.append(
                f"{nutrient.nutrient_name} is below the optimal minimum of {nutrient.optimal_range_min}"
            )
        if nutrient.optimal_range_max is not None and measured_value > nutrient.optimal_range_max:
            warnings.append(
                f"{nutrient.nutrient_name} is above the optimal maximum of {nutrient.optimal_range_max}"
            )

    try:
        measurement_kwargs = {
            "farm_id": measurement_data.farm_id,
            "season_id": measurement_data.season_id,
            "depth_cm": _to_decimal(measurement_data.depth_cm),
            "latitude": _to_decimal(measurement_data.latitude),
            "longitude": _to_decimal(measurement_data.longitude),
            "sensor_id": measurement_data.sensor_id,
        }
        if measurement_data.measurement_date is not None:
            measurement_kwargs["measurement_date"] = measurement_data.measurement_date

        measurement = SoilMeasurement(
            **measurement_kwargs,
        )
        db.add(measurement)
        db.flush()
        measurement_id = measurement.measurement_id

        for item in measurement_data.nutrients:
            nutrient = nutrient_map[item.nutrient_name.lower()]
            db.add(
                MeasurementResult(
                    measurement_id=measurement_id,
                    nutrient_id=nutrient.nutrient_id,
                    measured_value=_to_decimal(item.measured_value),
                )
            )

        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise MeasurementServiceError(
            status.HTTP_409_CONFLICT,
            "Measurement could not be stored because it conflicts with existing data",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise MeasurementServiceError(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to store measurement data",
        ) from exc

    message = "Measurement created successfully"
    response_status = "success"
    if warnings:
        response_status = "success_with_warnings"
        message = f"{message}. Range warnings: {'; '.join(warnings)}"

    return {
        "measurement_id": measurement_id,
        "status": response_status,
        "message": message,
    }
