from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.carbon import CarbonSequestration, CarbonVerification
from app.models.farm import Farm
from app.models.farmer import Farmer
from app.models.measurement import MeasurementResult, SoilMeasurement
from app.models.season import Season
from app.models.user import User
from app.schemas.verifier import (
    ApproveSequestrationRequest,
    PendingVerificationItem,
    RejectSequestrationRequest,
    SequestrationDetailResponse,
    VerificationActionResponse,
    VerificationMeasurementDetail,
    VerificationMeasurementNutrient,
    VerificationRecordInfo,
)
from app.services.verification_service import (
    VerificationServiceError,
    approve_sequestration,
    reject_sequestration,
)

router = APIRouter()

VerifierUser = Annotated[User, Depends(require_role(["verifier"]))]


def _build_farmer_name(farmer: Farmer) -> str:
    return f"{farmer.first_name} {farmer.last_name}".strip()


@router.get("/pending-verifications", response_model=list[PendingVerificationItem])
def get_pending_verifications(
    _: VerifierUser,
    db: Session = Depends(get_db),
) -> list[PendingVerificationItem]:
    measurement_count_subquery = (
        select(
            SoilMeasurement.season_id.label("season_id"),
            func.count(SoilMeasurement.measurement_id).label("measurement_count"),
        )
        .group_by(SoilMeasurement.season_id)
        .subquery()
    )

    stmt = (
        select(
            CarbonSequestration,
            Farm.farm_name,
            Farmer.first_name,
            Farmer.last_name,
            Season.season_name,
            Farm.location,
            Farm.total_area_hectares,
            func.coalesce(measurement_count_subquery.c.measurement_count, 0),
        )
        .join(Farm, CarbonSequestration.farm_id == Farm.farm_id)
        .join(Farmer, Farm.farmer_id == Farmer.farmer_id)
        .join(Season, CarbonSequestration.season_id == Season.season_id)
        .outerjoin(
            measurement_count_subquery,
            measurement_count_subquery.c.season_id == CarbonSequestration.season_id,
        )
        .where(CarbonSequestration.status == "pending")
        .order_by(
            CarbonSequestration.calculation_date.asc(),
            CarbonSequestration.sequestration_id.asc(),
        )
    )

    rows = db.execute(stmt).all()
    return [
        PendingVerificationItem(
            sequestration_id=sequestration.sequestration_id,
            farm_name=farm_name,
            farmer_name=f"{first_name} {last_name}".strip(),
            season_name=season_name,
            location=location,
            area_hectares=float(area_hectares),
            baseline_carbon=float(sequestration.baseline_carbon),
            current_carbon=float(sequestration.current_carbon),
            net_carbon_increase=float(sequestration.net_carbon_increase),
            estimated_carbon_credit=float(sequestration.estimated_carbon_credit),
            calculation_date=sequestration.calculation_date,
            measurement_count=int(measurement_count),
        )
        for (
            sequestration,
            farm_name,
            first_name,
            last_name,
            season_name,
            location,
            area_hectares,
            measurement_count,
        ) in rows
    ]


@router.get("/sequestration/{sequestration_id}", response_model=SequestrationDetailResponse)
def get_sequestration_detail(
    sequestration_id: int,
    _: VerifierUser,
    db: Session = Depends(get_db),
) -> SequestrationDetailResponse:
    stmt = (
        select(CarbonSequestration)
        .options(
            joinedload(CarbonSequestration.farm).joinedload(Farm.farmer),
            selectinload(CarbonSequestration.season)
            .selectinload(Season.measurements)
            .selectinload(SoilMeasurement.results)
            .joinedload(MeasurementResult.nutrient),
            joinedload(CarbonSequestration.verification).joinedload(CarbonVerification.verifier),
        )
        .where(CarbonSequestration.sequestration_id == sequestration_id)
    )
    sequestration = db.scalar(stmt)
    if sequestration is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sequestration record not found",
        )

    if sequestration.farm is None or sequestration.farm.farmer is None or sequestration.season is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated farm, farmer, or season data is missing",
        )

    measurements = sorted(
        sequestration.season.measurements,
        key=lambda item: (item.measurement_date, item.measurement_id),
        reverse=True,
    )
    measurement_items = [
        VerificationMeasurementDetail(
            measurement_id=measurement.measurement_id,
            measurement_date=measurement.measurement_date,
            depth_cm=float(measurement.depth_cm),
            latitude=float(measurement.latitude) if measurement.latitude is not None else None,
            longitude=float(measurement.longitude) if measurement.longitude is not None else None,
            sensor_id=measurement.sensor_id,
            nutrients=[
                VerificationMeasurementNutrient(
                    nutrient_name=result.nutrient.nutrient_name,
                    measured_value=float(result.measured_value),
                    unit=result.nutrient.unit,
                )
                for result in sorted(
                    measurement.results,
                    key=lambda item: item.nutrient.nutrient_name.lower(),
                )
            ],
        )
        for measurement in measurements
    ]

    verification_info = None
    if sequestration.verification is not None:
        verification_info = VerificationRecordInfo(
            verification_id=sequestration.verification.verification_id,
            verifier_id=sequestration.verification.verifier_id,
            verification_date=sequestration.verification.verification_date,
            verification_status=sequestration.verification.verification_status,
            verifier_comments=sequestration.verification.verifier_comments,
            approved_carbon_credit=(
                float(sequestration.verification.approved_carbon_credit)
                if sequestration.verification.approved_carbon_credit is not None
                else None
            ),
        )

    return SequestrationDetailResponse(
        sequestration_id=sequestration.sequestration_id,
        farm_id=sequestration.farm_id,
        farm_name=sequestration.farm.farm_name,
        farmer_name=_build_farmer_name(sequestration.farm.farmer),
        season_id=sequestration.season_id,
        season_name=sequestration.season.season_name,
        location=sequestration.farm.location,
        area_hectares=float(sequestration.farm.total_area_hectares),
        baseline_carbon=float(sequestration.baseline_carbon),
        current_carbon=float(sequestration.current_carbon),
        net_carbon_increase=float(sequestration.net_carbon_increase),
        estimated_carbon_credit=float(sequestration.estimated_carbon_credit),
        status=sequestration.status,
        calculation_date=sequestration.calculation_date,
        measurement_count=len(measurement_items),
        measurements=measurement_items,
        verification=verification_info,
    )


@router.post("/approve/{sequestration_id}", response_model=VerificationActionResponse)
def approve_sequestration_endpoint(
    sequestration_id: int,
    payload: ApproveSequestrationRequest,
    current_user: VerifierUser,
    db: Session = Depends(get_db),
) -> VerificationActionResponse:
    try:
        result = approve_sequestration(
            db=db,
            sequestration_id=sequestration_id,
            verifier_id=current_user.user_id,
            approved_credit=payload.approved_carbon_credit,
            comments=payload.verifier_comments,
        )
        return VerificationActionResponse(**result)
    except VerificationServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("/reject/{sequestration_id}", response_model=VerificationActionResponse)
def reject_sequestration_endpoint(
    sequestration_id: int,
    payload: RejectSequestrationRequest,
    current_user: VerifierUser,
    db: Session = Depends(get_db),
) -> VerificationActionResponse:
    try:
        result = reject_sequestration(
            db=db,
            sequestration_id=sequestration_id,
            verifier_id=current_user.user_id,
            comments=payload.verifier_comments,
        )
        return VerificationActionResponse(**result)
    except VerificationServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
