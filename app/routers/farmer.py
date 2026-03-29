from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.carbon import CarbonSequestration, CarbonVerification
from app.models.farm import Farm
from app.models.farmer import Farmer
from app.models.measurement import MeasurementResult, SoilMeasurement
from app.models.season import Season
from app.models.user import User
from app.schemas.carbon import CarbonSequestrationResponse
from app.schemas.farmer_dashboard import (
    FarmerDashboardResponse,
    FarmerDashboardStats,
    FarmerFarmDashboard,
    FarmerSeasonCarbonData,
    FarmerSeasonDashboard,
    RecentMeasurementItem,
)

router = APIRouter()

FarmerUser = Annotated[User, Depends(require_role(["farmer"]))]


def _normalize_nutrient_name(name: str) -> str:
    return name.strip().lower().replace("-", "_").replace(" ", "_")


def _get_farmer_profile(db: Session, user_id: int) -> Farmer:
    stmt = (
        select(Farmer)
        .options(
            selectinload(Farmer.farms)
            .selectinload(Farm.seasons)
            .selectinload(Season.carbon_sequestration)
            .selectinload(CarbonSequestration.verification)
        )
        .where(Farmer.user_id == user_id)
    )
    farmer = db.scalar(stmt)
    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found for the current user",
        )
    return farmer


def _build_verification_status(
    sequestration: CarbonSequestration,
    verification: CarbonVerification | None,
) -> str:
    if verification is not None:
        return verification.verification_status
    return sequestration.status


@router.get("/dashboard", response_model=FarmerDashboardResponse)
def get_farmer_dashboard(
    current_user: FarmerUser,
    db: Session = Depends(get_db),
) -> FarmerDashboardResponse:
    farmer = _get_farmer_profile(db, current_user.user_id)

    farm_ids = [farm.farm_id for farm in farmer.farms]
    total_farms = len(farm_ids)
    active_seasons = 0
    pending_verifications = 0
    total_credits = 0.0
    farm_items: list[FarmerFarmDashboard] = []

    for farm in sorted(farmer.farms, key=lambda item: (item.farm_name.lower(), item.farm_id)):
        season_items: list[FarmerSeasonDashboard] = []

        for season in sorted(
            farm.seasons,
            key=lambda item: (item.start_date, item.season_id),
            reverse=True,
        ):
            if season.status == "active":
                active_seasons += 1

            carbon_data = None
            sequestration = season.carbon_sequestration
            if sequestration is not None:
                verification_status = _build_verification_status(
                    sequestration,
                    sequestration.verification,
                )
                carbon_data = FarmerSeasonCarbonData(
                    baseline_carbon=float(sequestration.baseline_carbon),
                    current_carbon=float(sequestration.current_carbon),
                    net_increase=float(sequestration.net_carbon_increase),
                    estimated_credit=float(sequestration.estimated_carbon_credit),
                    verification_status=verification_status,
                )
                total_credits += float(sequestration.estimated_carbon_credit)
                if verification_status == "pending":
                    pending_verifications += 1

            season_items.append(
                FarmerSeasonDashboard(
                    season_id=season.season_id,
                    season_name=season.season_name,
                    start_date=season.start_date,
                    end_date=season.end_date,
                    crop_type=season.crop_type,
                    status=season.status,
                    carbon_data=carbon_data,
                )
            )

        farm_items.append(
            FarmerFarmDashboard(
                farm_id=farm.farm_id,
                farm_name=farm.farm_name,
                location=farm.location,
                total_area_hectares=float(farm.total_area_hectares),
                soil_type=farm.soil_type,
                baseline_carbon=float(farm.baseline_carbon),
                seasons=season_items,
            )
        )

    recent_measurements: list[RecentMeasurementItem] = []
    if farm_ids:
        measurement_stmt = (
            select(SoilMeasurement)
            .options(
                joinedload(SoilMeasurement.farm),
                selectinload(SoilMeasurement.results).joinedload(MeasurementResult.nutrient),
            )
            .where(SoilMeasurement.farm_id.in_(farm_ids))
            .order_by(
                SoilMeasurement.measurement_date.desc(),
                SoilMeasurement.measurement_id.desc(),
            )
            .limit(10)
        )
        measurements = list(db.scalars(measurement_stmt).all())

        for measurement in measurements:
            nutrient_values: dict[str, float] = {}
            for result in measurement.results:
                nutrient_name = _normalize_nutrient_name(result.nutrient.nutrient_name)
                nutrient_values[nutrient_name] = float(result.measured_value)

            recent_measurements.append(
                RecentMeasurementItem(
                    date=measurement.measurement_date,
                    farm=measurement.farm.farm_name,
                    depth=float(measurement.depth_cm),
                    organicCarbon=nutrient_values.get("organic_carbon"),
                    nitrogen=nutrient_values.get("nitrogen"),
                )
            )

    return FarmerDashboardResponse(
        farmer_id=farmer.farmer_id,
        stats=FarmerDashboardStats(
            totalFarms=total_farms,
            activeSeasons=active_seasons,
            pendingVerifications=pending_verifications,
            totalCredits=round(total_credits, 2),
        ),
        farms=farm_items,
        recentMeasurements=recent_measurements,
    )


@router.get("/carbon-reports", response_model=list[CarbonSequestrationResponse])
def get_farmer_carbon_reports(
    current_user: FarmerUser,
    farm_id: int = Query(..., gt=0),
    db: Session = Depends(get_db),
) -> list[CarbonSequestration]:
    farmer = db.scalar(
        select(Farmer).where(Farmer.user_id == current_user.user_id)
    )
    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found for the current user",
        )

    farm = db.scalar(
        select(Farm).where(Farm.farm_id == farm_id, Farm.farmer_id == farmer.farmer_id)
    )
    if farm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or does not belong to the current farmer",
        )

    stmt = (
        select(CarbonSequestration)
        .where(CarbonSequestration.farm_id == farm_id)
        .order_by(
            CarbonSequestration.calculation_date.desc(),
            CarbonSequestration.sequestration_id.desc(),
        )
    )
    return list(db.scalars(stmt).all())
