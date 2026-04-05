from __future__ import annotations

from calendar import month_abbr
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.auth.password import hash_password
from app.core.config import settings
from app.db.session import get_db
from app.models.carbon import CarbonSequestration, CarbonVerification
from app.models.farm import Farm
from app.models.farmer import Farmer
from app.models.measurement import MeasurementResult, Nutrient, SoilMeasurement
from app.models.season import Season
from app.models.user import User
from app.schemas.admin import (
    AdminCarbonCalculationResponse,
    AdminImplementationEntityCount,
    AdminImplementationSummaryResponse,
    AdminStatisticsResponse,
    AdminThingSpeakSyncRequest,
    AdminUserItem,
    MonthlyCreditsItem,
)
from app.schemas.carbon import CarbonCalculationRequest
from app.schemas.measurement import (
    ThingSpeakFieldMapping,
    ThingSpeakIngestionRequest,
    ThingSpeakIngestionResponse,
)
from app.schemas.user import UserCreate
from app.services.carbon_calculator import (
    CarbonCalculationError,
    calculate_carbon_sequestration,
)
from app.services.thingspeak_service import (
    ThingSpeakIntegrationError,
    import_measurements_from_thingspeak,
)

router = APIRouter(dependencies=[Depends(require_role(["admin"]))])


def _month_key(value: datetime) -> tuple[int, int]:
    return value.year, value.month


def _subtract_months(year: int, month: int, count: int) -> tuple[int, int]:
    month_index = (year * 12 + month - 1) - count
    return month_index // 12, month_index % 12 + 1


def _build_default_thingspeak_mappings() -> list[ThingSpeakFieldMapping]:
    return [
        ThingSpeakFieldMapping(field_id=1, target="Nitrogen"),
        ThingSpeakFieldMapping(field_id=2, target="Phosphorus"),
        ThingSpeakFieldMapping(field_id=3, target="Potassium"),
        ThingSpeakFieldMapping(field_id=4, target="Moisture"),
        ThingSpeakFieldMapping(field_id=5, target="Organic_Carbon"),
        ThingSpeakFieldMapping(field_id=6, target="depth_cm"),
    ]


@router.get("/statistics", response_model=AdminStatisticsResponse)
def get_admin_statistics(db: Session = Depends(get_db)) -> AdminStatisticsResponse:
    total_farms = int(db.scalar(select(func.count(Farm.farm_id))) or 0)
    total_farmers = int(db.scalar(select(func.count(Farmer.farmer_id))) or 0)
    total_seasons = int(db.scalar(select(func.count(Season.season_id))) or 0)
    pending_verifications = int(
        db.scalar(
            select(func.count(CarbonSequestration.sequestration_id)).where(
                CarbonSequestration.status == "pending"
            )
        )
        or 0
    )
    active_seasons = int(
        db.scalar(
            select(func.count(Season.season_id)).where(Season.status == "active")
        )
        or 0
    )
    total_carbon_credits_issued = float(
        db.scalar(
            select(func.coalesce(func.sum(CarbonVerification.approved_carbon_credit), 0)).where(
                CarbonVerification.verification_status == "approved"
            )
        )
        or 0
    )

    return AdminStatisticsResponse(
        total_farms=total_farms,
        total_farmers=total_farmers,
        total_seasons=total_seasons,
        pending_verifications=pending_verifications,
        total_carbon_credits_issued=round(total_carbon_credits_issued, 2),
        active_seasons=active_seasons,
    )


@router.get("/implementation-summary", response_model=AdminImplementationSummaryResponse)
def get_admin_implementation_summary(
    db: Session = Depends(get_db),
) -> AdminImplementationSummaryResponse:
    entity_counts = [
        AdminImplementationEntityCount(
            label="Users",
            table_name="users",
            count=int(db.scalar(select(func.count(User.user_id))) or 0),
        ),
        AdminImplementationEntityCount(
            label="Farms",
            table_name="farm",
            count=int(db.scalar(select(func.count(Farm.farm_id))) or 0),
        ),
        AdminImplementationEntityCount(
            label="Seasons",
            table_name="season",
            count=int(db.scalar(select(func.count(Season.season_id))) or 0),
        ),
        AdminImplementationEntityCount(
            label="Nutrients",
            table_name="nutrient",
            count=int(db.scalar(select(func.count(Nutrient.nutrient_id))) or 0),
        ),
        AdminImplementationEntityCount(
            label="Measurements",
            table_name="soil_measurement",
            count=int(
                db.scalar(select(func.count(SoilMeasurement.measurement_id))) or 0
            ),
        ),
        AdminImplementationEntityCount(
            label="Results",
            table_name="measurement_result",
            count=int(
                db.scalar(select(func.count(MeasurementResult.measurement_id))) or 0
            ),
        ),
        AdminImplementationEntityCount(
            label="Carbon Records",
            table_name="carbon_sequestration",
            count=int(
                db.scalar(
                    select(func.count(CarbonSequestration.sequestration_id))
                )
                or 0
            ),
        ),
        AdminImplementationEntityCount(
            label="Verifications",
            table_name="carbon_verification",
            count=int(
                db.scalar(select(func.count(CarbonVerification.verification_id))) or 0
            ),
        ),
    ]

    return AdminImplementationSummaryResponse(
        thingspeak_base_url=settings.THINGSPEAK_BASE_URL,
        thingspeak_channel_id=settings.THINGSPEAK_CHANNEL_ID,
        health_endpoint="/health",
        docs_endpoint="/docs",
        api_touchpoints=[
            "/api/auth/login",
            "/api/admin/statistics",
            "/api/admin/sync-thingspeak",
            "/api/admin/trigger-carbon-calculation",
            "/api/verifier/approve/{id}",
        ],
        network_flow=[
            "ThingSpeak sends field data to the application over HTTP using JSON-friendly payloads.",
            "FastAPI exposes REST endpoints for login, ingestion, calculation, and verification.",
            "JWT-based role protection secures admin, verifier, and farmer workflows.",
            "The React frontend consumes those endpoints and updates dashboards from live responses.",
        ],
        dbms_highlights=[
            "PostgreSQL stores normalized entities for users, farms, seasons, nutrients, and carbon records.",
            "Foreign keys connect users -> farmer -> farm -> season -> measurement workflow.",
            "Measurement tables separate event rows from nutrient result rows for relational integrity.",
            "Check constraints and unique constraints protect area, depth, season status, and duplicate measurement logic.",
            "Indexes support fast filtering by season status, measurement date, and sequestration status.",
        ],
        database_entities=entity_counts,
    )


@router.get("/monthly-credits", response_model=list[MonthlyCreditsItem])
def get_monthly_credits(db: Session = Depends(get_db)) -> list[MonthlyCreditsItem]:
    now = datetime.utcnow()
    start_year, start_month = _subtract_months(now.year, now.month, 5)

    rows = db.execute(
        select(
            CarbonVerification.verification_date,
            CarbonVerification.approved_carbon_credit,
        ).where(
            CarbonVerification.verification_status == "approved",
            CarbonVerification.approved_carbon_credit.is_not(None),
        )
    ).all()

    month_windows: list[tuple[int, int]] = [
        _subtract_months(now.year, now.month, offset) for offset in range(5, -1, -1)
    ]
    month_totals = {month_key: 0.0 for month_key in month_windows}

    for verification_date, approved_credit in rows:
        if verification_date is None:
            continue
        key = _month_key(verification_date)
        if key < (start_year, start_month):
            continue
        if key in month_totals:
            month_totals[key] += float(approved_credit)

    return [
        MonthlyCreditsItem(
            month=month_abbr[month],
            credits=round(month_totals[(year, month)], 2),
        )
        for year, month in month_windows
    ]


@router.post(
    "/trigger-carbon-calculation",
    response_model=AdminCarbonCalculationResponse,
    status_code=status.HTTP_201_CREATED,
)
def trigger_carbon_calculation(
    payload: CarbonCalculationRequest,
    db: Session = Depends(get_db),
) -> AdminCarbonCalculationResponse:
    season = db.get(Season, payload.season_id)
    if season is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Season with id {payload.season_id} was not found",
        )

    try:
        result = calculate_carbon_sequestration(db, payload.season_id)
        return AdminCarbonCalculationResponse(**result)
    except CarbonCalculationError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post(
    "/sync-thingspeak",
    response_model=ThingSpeakIngestionResponse,
    status_code=status.HTTP_200_OK,
)
def sync_thingspeak_measurements(
    payload: AdminThingSpeakSyncRequest,
    db: Session = Depends(get_db),
) -> ThingSpeakIngestionResponse:
    season = db.get(Season, payload.season_id)
    if season is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Season with id {payload.season_id} was not found",
        )

    sensor_id = payload.sensor_id or settings.THINGSPEAK_SENSOR_ID
    if not sensor_id:
        if settings.THINGSPEAK_CHANNEL_ID is not None:
            sensor_id = f"THINGSPEAK-{settings.THINGSPEAK_CHANNEL_ID}"
        else:
            sensor_id = "THINGSPEAK-SENSOR"

    default_depth_cm = payload.default_depth_cm
    if default_depth_cm is None:
        default_depth_cm = settings.THINGSPEAK_DEFAULT_DEPTH_CM or 10.0

    results = payload.results or settings.THINGSPEAK_IMPORT_RESULTS

    request_data = ThingSpeakIngestionRequest(
        farm_id=season.farm_id,
        season_id=season.season_id,
        sensor_id=sensor_id,
        results=results,
        default_depth_cm=default_depth_cm,
        field_mappings=_build_default_thingspeak_mappings(),
    )

    try:
        result = import_measurements_from_thingspeak(db, request_data)
        return ThingSpeakIngestionResponse(**result)
    except ThingSpeakIntegrationError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.get("/users", response_model=list[AdminUserItem])
def get_all_users(db: Session = Depends(get_db)) -> list[AdminUserItem]:
    users = list(db.scalars(select(User).order_by(User.created_at.desc(), User.user_id.desc())).all())
    return [
        AdminUserItem(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            role=user.role,
            status="active" if user.is_active else "inactive",
            created_at=user.created_at,
        )
        for user in users
    ]


@router.post("/users", response_model=AdminUserItem, status_code=status.HTTP_201_CREATED)
def create_user_as_admin(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> AdminUserItem:
    existing_user = db.scalar(
        select(User).where(
            or_(User.username == user_in.username, User.email == user_in.email)
        )
    )
    if existing_user:
        detail = (
            "Username is already registered"
            if existing_user.username == user_in.username
            else "Email is already registered"
        )
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
        is_active=True,
    )

    try:
        db.add(new_user)
        db.flush()

        if new_user.role == "farmer":
            db.add(
                Farmer(
                    user_id=new_user.user_id,
                    first_name=user_in.first_name,
                    last_name=user_in.last_name,
                )
            )

        db.commit()
        db.refresh(new_user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create user with the provided details",
        ) from exc

    return AdminUserItem(
        user_id=new_user.user_id,
        username=new_user.username,
        email=new_user.email,
        role=new_user.role,
        status="active" if new_user.is_active else "inactive",
        created_at=new_user.created_at,
    )
