from decimal import Decimal, ROUND_HALF_UP

from fastapi import status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.carbon import CarbonSequestration
from app.models.farm import Farm
from app.models.measurement import MeasurementResult, Nutrient, SoilMeasurement
from app.models.season import Season

ORGANIC_CARBON_NUTRIENT = "organic_carbon"
CONVERSION_FACTOR = Decimal("3.67")
KILOGRAMS_PER_METRIC_TON = Decimal("1000")
DECIMAL_PRECISION = Decimal("0.01")
ALLOWED_SEASON_STATUSES = {"active", "completed"}


class CarbonCalculationError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def _quantize(value: Decimal) -> Decimal:
    return value.quantize(DECIMAL_PRECISION, rounding=ROUND_HALF_UP)


def calculate_carbon_sequestration(db: Session, season_id: int) -> dict:
    season = db.get(Season, season_id)
    if season is None:
        raise CarbonCalculationError(
            status.HTTP_404_NOT_FOUND,
            f"Season with id {season_id} was not found",
        )

    if season.status not in ALLOWED_SEASON_STATUSES:
        raise CarbonCalculationError(
            status.HTTP_409_CONFLICT,
            "Carbon sequestration can only be calculated for active or completed seasons",
        )

    farm = db.get(Farm, season.farm_id)
    if farm is None:
        raise CarbonCalculationError(
            status.HTTP_404_NOT_FOUND,
            f"Farm with id {season.farm_id} was not found",
        )

    existing_record = db.scalar(
        select(CarbonSequestration).where(CarbonSequestration.season_id == season_id)
    )
    if existing_record is not None:
        raise CarbonCalculationError(
            status.HTTP_409_CONFLICT,
            "Carbon sequestration has already been calculated for this season",
        )

    measurement_stmt = (
        select(
            func.count(MeasurementResult.measurement_id).label("measurement_count"),
            func.avg(MeasurementResult.measured_value).label("average_current_carbon"),
        )
        .select_from(MeasurementResult)
        .join(Nutrient, Nutrient.nutrient_id == MeasurementResult.nutrient_id)
        .join(
            SoilMeasurement,
            SoilMeasurement.measurement_id == MeasurementResult.measurement_id,
        )
        .where(SoilMeasurement.season_id == season_id)
        .where(func.lower(Nutrient.nutrient_name) == ORGANIC_CARBON_NUTRIENT)
    )
    measurement_stats = db.execute(measurement_stmt).one()

    measurement_count = int(measurement_stats.measurement_count or 0)
    average_current_carbon = measurement_stats.average_current_carbon

    if measurement_count < 3 or average_current_carbon is None:
        raise CarbonCalculationError(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Insufficient data",
        )

    baseline_carbon = _quantize(Decimal(str(farm.baseline_carbon)))
    current_carbon = _quantize(Decimal(str(average_current_carbon)))
    net_carbon_increase = _quantize(current_carbon - baseline_carbon)

    if net_carbon_increase <= Decimal("0"):
        estimated_carbon_credit = Decimal("0.00")
    else:
        estimated_carbon_credit = _quantize(
            (
                net_carbon_increase
                * Decimal(str(farm.total_area_hectares))
                * CONVERSION_FACTOR
            )
            / KILOGRAMS_PER_METRIC_TON
        )

    manual_review_required = current_carbon > (baseline_carbon * Decimal("10"))
    no_sequestration = net_carbon_increase <= Decimal("0")

    try:
        sequestration_record = CarbonSequestration(
            farm_id=farm.farm_id,
            season_id=season.season_id,
            baseline_carbon=baseline_carbon,
            current_carbon=current_carbon,
            net_carbon_increase=net_carbon_increase,
            estimated_carbon_credit=estimated_carbon_credit,
            status="pending",
        )
        db.add(sequestration_record)

        season.status = "completed"
        db.flush()
        db.commit()
        db.refresh(sequestration_record)
    except IntegrityError as exc:
        db.rollback()
        raise CarbonCalculationError(
            status.HTTP_409_CONFLICT,
            "Carbon sequestration could not be stored because a record already exists for this season",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise CarbonCalculationError(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to calculate carbon sequestration",
        ) from exc

    result = {
        "sequestration_id": sequestration_record.sequestration_id,
        "farm_id": sequestration_record.farm_id,
        "season_id": sequestration_record.season_id,
        "baseline_carbon": sequestration_record.baseline_carbon,
        "current_carbon": sequestration_record.current_carbon,
        "net_carbon_increase": sequestration_record.net_carbon_increase,
        "estimated_carbon_credit": sequestration_record.estimated_carbon_credit,
        "status": sequestration_record.status,
        "calculation_date": sequestration_record.calculation_date,
    }

    if no_sequestration:
        result["flag"] = "no sequestration"
    if manual_review_required:
        result["manual_review"] = True
        result["review_reason"] = (
            "Current carbon exceeds 10 times the baseline carbon and should be reviewed manually"
        )

    return result
