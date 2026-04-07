from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.schema import (
    CheckConstraint,
    ForeignKeyConstraint,
    PrimaryKeyConstraint,
    UniqueConstraint,
)

from app.core.config import settings
from app.models.carbon import CarbonSequestration, CarbonVerification
from app.models.farm import Farm
from app.models.farmer import Farmer
from app.models.measurement import MeasurementResult, Nutrient, SoilMeasurement
from app.models.season import Season
from app.models.user import User
from app.schemas.admin import (
    AdminImplementationColumn,
    AdminImplementationConstraint,
    AdminImplementationEntityCount,
    AdminImplementationFlowStep,
    AdminImplementationIndex,
    AdminImplementationSummaryResponse,
    AdminImplementationTableDetail,
)


@dataclass(frozen=True)
class _TableBlueprint:
    label: str
    model: Any
    purpose: str
    preview_columns: tuple[str, ...]
    sort_column: str
    sort_desc: bool = False
    limit: int = 8


TABLE_BLUEPRINTS: tuple[_TableBlueprint, ...] = (
    _TableBlueprint(
        label="Users",
        model=User,
        purpose="Authentication accounts, role assignment, and active-session eligibility.",
        preview_columns=("user_id", "username", "role", "is_active", "created_at"),
        sort_column="user_id",
    ),
    _TableBlueprint(
        label="Farmers",
        model=Farmer,
        purpose="Field-operator profiles linked one-to-one with authenticated farmer accounts.",
        preview_columns=(
            "farmer_id",
            "user_id",
            "first_name",
            "last_name",
            "registration_date",
        ),
        sort_column="farmer_id",
    ),
    _TableBlueprint(
        label="Farms",
        model=Farm,
        purpose="Farm identity, location, area, and baseline carbon used during credit calculation.",
        preview_columns=(
            "farm_id",
            "farmer_id",
            "farm_name",
            "location",
            "total_area_hectares",
            "baseline_carbon",
        ),
        sort_column="farm_id",
    ),
    _TableBlueprint(
        label="Seasons",
        model=Season,
        purpose="Crop-cycle windows that anchor every measurement batch, calculation run, and verification state.",
        preview_columns=(
            "season_id",
            "farm_id",
            "season_name",
            "crop_type",
            "status",
            "start_date",
            "end_date",
        ),
        sort_column="season_id",
    ),
    _TableBlueprint(
        label="Nutrients",
        model=Nutrient,
        purpose="Lookup catalog for measurable parameters and their expected operating ranges.",
        preview_columns=(
            "nutrient_id",
            "nutrient_name",
            "unit",
            "optimal_range_min",
            "optimal_range_max",
        ),
        sort_column="nutrient_id",
    ),
    _TableBlueprint(
        label="Soil Measurements",
        model=SoilMeasurement,
        purpose="Measurement events imported or submitted for a farm-season pair, with timestamp and depth.",
        preview_columns=(
            "measurement_id",
            "farm_id",
            "season_id",
            "measurement_date",
            "depth_cm",
            "sensor_id",
        ),
        sort_column="measurement_id",
        sort_desc=True,
    ),
    _TableBlueprint(
        label="Measurement Results",
        model=MeasurementResult,
        purpose="Bridge table that stores individual nutrient values for each measurement event.",
        preview_columns=("measurement_id", "nutrient_id", "measured_value"),
        sort_column="measurement_id",
        sort_desc=True,
    ),
    _TableBlueprint(
        label="Carbon Sequestration",
        model=CarbonSequestration,
        purpose="Calculated carbon-credit records produced from verified seasonal organic-carbon evidence.",
        preview_columns=(
            "sequestration_id",
            "farm_id",
            "season_id",
            "estimated_carbon_credit",
            "status",
            "calculation_date",
        ),
        sort_column="sequestration_id",
        sort_desc=True,
    ),
    _TableBlueprint(
        label="Carbon Verification",
        model=CarbonVerification,
        purpose="Verifier approvals or rejections, including approved credits and timestamped comments.",
        preview_columns=(
            "verification_id",
            "sequestration_id",
            "verifier_id",
            "verification_status",
            "approved_carbon_credit",
            "verification_date",
        ),
        sort_column="verification_id",
        sort_desc=True,
    ),
)


FLOW_STEPS: tuple[AdminImplementationFlowStep, ...] = (
    AdminImplementationFlowStep(
        step=1,
        title="External Soil Feed Arrives",
        source="Field sensor or scripted batch sender",
        destination="ThingSpeak channel",
        subject_focus="IoT uplink and source-to-cloud data transmission",
        protocol="HTTP form write",
        method="POST",
        endpoint="https://api.thingspeak.com/update",
        transport_stack="HTTPS -> HTTP POST -> TCP/IP -> Internet",
        data_format="ThingSpeak field payload (field1-field6)",
        security="ThingSpeak channel write key authorizes ingestion",
        payload={
            "field1": 32.4,
            "field2": 18.1,
            "field3": 142.6,
            "field4": 26.3,
            "field5": 1680.0,
            "field6": 20.0,
        },
        response_payload={"entry_id": 1842, "status": 200},
        stored_tables=[],
        outcome=(
            "ThingSpeak stores a channel feed that becomes the external communication source "
            "for the carbon-credit workflow."
        ),
        cndc_reason=(
            "This step demonstrates sender, receiver, protocol, and structured data transfer "
            "across a public network before the application processes anything."
        ),
        evidence_points=[
            "Proves CNDC with real network ingress before the web app touches the data.",
            "Uses a public IoT-style service instead of local mock payloads.",
        ],
    ),
    AdminImplementationFlowStep(
        step=2,
        title="Admin Requests Import",
        source="Admin panel",
        destination="FastAPI backend",
        subject_focus="Client-server request/response with protected REST API",
        protocol="HTTPS JSON",
        method="POST",
        endpoint="/api/admin/sync-thingspeak",
        transport_stack="HTTPS -> JSON REST -> FastAPI service",
        data_format="JSON request body and JSON import summary",
        security="JWT bearer token with admin role validation",
        payload={"season_id": 4, "results": 5},
        response_payload={
            "channel_id": settings.THINGSPEAK_CHANNEL_ID or 0,
            "imported_count": 5,
            "skipped_count": 0,
        },
        stored_tables=["soil_measurement", "measurement_result", "nutrient"],
        outcome=(
            "FastAPI reads ThingSpeak over HTTP, validates mappings, and writes normalized rows "
            "into measurement tables."
        ),
        cndc_reason=(
            "This step proves authenticated browser-to-server communication and shows that one "
            "network request can trigger cloud retrieval plus multiple database writes."
        ),
        evidence_points=[
            "JWT protects the endpoint so only admins can trigger import.",
            "A single request fans out into multiple relational inserts.",
        ],
    ),
    AdminImplementationFlowStep(
        step=3,
        title="Dashboards Read Database State",
        source="React dashboards",
        destination="FastAPI REST APIs",
        subject_focus="Application-layer REST retrieval for role-based dashboards",
        protocol="HTTPS JSON",
        method="GET",
        endpoint="/api/farmer/dashboard",
        transport_stack="HTTPS -> HTTP GET -> JSON response",
        data_format="JSON response body consumed by React",
        security="JWT bearer token with role-based route checks",
        payload=None,
        response_payload={"active_seasons": 1, "pending_verifications": 1, "recentMeasurements": 5},
        stored_tables=["farm", "season", "soil_measurement", "measurement_result"],
        outcome=(
            "Farmer and verifier screens render current measurements and workflow status from live "
            "database-backed responses."
        ),
        cndc_reason=(
            "This step demonstrates classic request-response communication where stored data is "
            "serialized into API messages and then rendered in the client."
        ),
        evidence_points=[
            "Shows client-server communication beyond the landing page.",
            "Confirms the DBMS layer drives real UI state.",
        ],
    ),
    AdminImplementationFlowStep(
        step=4,
        title="Carbon Calculation Is Triggered",
        source="Admin panel",
        destination="Carbon calculation service",
        subject_focus="Service orchestration between UI request and backend computation",
        protocol="HTTPS JSON",
        method="POST",
        endpoint="/api/admin/trigger-carbon-calculation",
        transport_stack="HTTPS -> JSON REST -> calculation service -> PostgreSQL",
        data_format="JSON request body and calculated result payload",
        security="JWT bearer token with admin authorization",
        payload={"season_id": 4},
        response_payload={
            "sequestration_id": 12,
            "estimated_carbon_credit": 22.64,
            "status": "pending",
        },
        stored_tables=["carbon_sequestration", "season"],
        outcome=(
            "The backend calculates carbon-credit estimates from organic-carbon evidence and "
            "persists a single season-level sequestration record."
        ),
        cndc_reason=(
            "This step shows remote-service invocation: the browser sends a command, the backend "
            "processes data, and a persistent result is returned and stored."
        ),
        evidence_points=[
            "Ties analytical logic directly to relational state transitions.",
            "Creates a verifier-ready work item instead of a transient frontend result.",
        ],
    ),
    AdminImplementationFlowStep(
        step=5,
        title="Verifier Approves Or Rejects",
        source="Verifier dashboard",
        destination="Verification workflow",
        subject_focus="Role-based approval message with auditable acknowledgement",
        protocol="HTTPS JSON",
        method="POST",
        endpoint="/api/verifier/approve/{id}",
        transport_stack="HTTPS -> JSON REST -> verification workflow -> PostgreSQL",
        data_format="JSON decision payload and confirmation response",
        security="JWT bearer token with verifier authorization",
        payload={
            "approved_carbon_credit": 2.07,
            "verifier_comments": "Measurement trail and farm area align with the reported credit.",
        },
        response_payload={
            "verification_id": 7,
            "status": "verified",
            "message": "Verification approved",
        },
        stored_tables=["carbon_verification", "carbon_sequestration", "season"],
        outcome=(
            "A protected approval call stores the decision permanently and updates the overall "
            "workflow status for downstream dashboards."
        ),
        cndc_reason=(
            "This step demonstrates human-in-the-loop communication where an authenticated message "
            "produces an acknowledgement and permanent workflow history."
        ),
        evidence_points=[
            "Makes the human-governance step visible in CNDC and DBMS terms.",
            "Persists auditable workflow history instead of only changing UI labels.",
        ],
    ),
)


def _serialize_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def _format_default_value(column: Any) -> str | None:
    if column.server_default is not None:
        return str(column.server_default.arg)
    if column.default is not None:
        arg = column.default.arg
        if callable(arg):
            return getattr(arg, "__name__", "callable")
        return str(arg)
    return None


def _build_columns(table: Any) -> list[AdminImplementationColumn]:
    columns: list[AdminImplementationColumn] = []

    for column in table.columns:
        foreign_key = None
        if column.foreign_keys:
            foreign_key = next(iter(column.foreign_keys)).target_fullname

        columns.append(
            AdminImplementationColumn(
                name=column.name,
                data_type=str(column.type),
                nullable=column.nullable,
                is_primary_key=bool(column.primary_key),
                foreign_key=foreign_key,
                default_value=_format_default_value(column),
            )
        )

    return columns


def _build_constraints(table: Any) -> list[AdminImplementationConstraint]:
    constraints: list[AdminImplementationConstraint] = []

    primary_key_columns = [column.name for column in table.primary_key.columns]
    if primary_key_columns:
        constraints.append(
            AdminImplementationConstraint(
                name=table.primary_key.name or f"pk_{table.name}",
                kind="PRIMARY KEY",
                definition=f"PRIMARY KEY ({', '.join(primary_key_columns)})",
            )
        )

    named_constraints = sorted(
        table.constraints,
        key=lambda constraint: (constraint.name or constraint.__class__.__name__),
    )

    for constraint in named_constraints:
        if isinstance(constraint, PrimaryKeyConstraint):
            continue

        column_names = [column.name for column in getattr(constraint, "columns", [])]

        if isinstance(constraint, CheckConstraint):
            kind = "CHECK"
            definition = str(constraint.sqltext)
        elif isinstance(constraint, UniqueConstraint):
            kind = "UNIQUE"
            definition = f"UNIQUE ({', '.join(column_names)})"
        elif isinstance(constraint, ForeignKeyConstraint):
            kind = "FOREIGN KEY"
            source_columns = ", ".join(element.parent.name for element in constraint.elements)
            target_columns = ", ".join(element.column.name for element in constraint.elements)
            target_table = constraint.elements[0].column.table.name
            on_delete_actions = {
                str(element.ondelete)
                for element in constraint.elements
                if element.ondelete is not None
            }
            on_delete = (
                f" ON DELETE {next(iter(on_delete_actions))}"
                if len(on_delete_actions) == 1
                else ""
            )
            definition = (
                f"FOREIGN KEY ({source_columns}) REFERENCES "
                f"{target_table} ({target_columns}){on_delete}"
            )
        else:
            continue

        constraints.append(
            AdminImplementationConstraint(
                name=constraint.name or f"{table.name}_{kind.lower()}",
                kind=kind,
                definition=definition,
            )
        )

    return constraints


def _build_indexes(table: Any) -> list[AdminImplementationIndex]:
    indexes = sorted(table.indexes, key=lambda index: index.name or "")

    return [
        AdminImplementationIndex(
            name=index.name or f"idx_{table.name}",
            columns=[column.name for column in index.columns],
            unique=bool(index.unique),
        )
        for index in indexes
    ]


def _build_query(blueprint: _TableBlueprint) -> str:
    direction = "DESC" if blueprint.sort_desc else "ASC"
    return (
        f"SELECT {', '.join(blueprint.preview_columns)} "
        f"FROM {blueprint.model.__table__.name} "
        f"ORDER BY {blueprint.sort_column} {direction} "
        f"LIMIT {blueprint.limit};"
    )


def _build_preview_rows(db: Session, blueprint: _TableBlueprint) -> list[dict[str, Any]]:
    table = blueprint.model.__table__
    selected_columns = [table.c[column_name] for column_name in blueprint.preview_columns]
    sort_column = table.c[blueprint.sort_column]
    ordering = sort_column.desc() if blueprint.sort_desc else sort_column.asc()

    rows = db.execute(select(*selected_columns).order_by(ordering).limit(blueprint.limit)).all()

    return [
        {
            column_name: _serialize_value(value)
            for column_name, value in zip(blueprint.preview_columns, row, strict=False)
        }
        for row in rows
    ]


def _build_table_detail(
    db: Session,
    blueprint: _TableBlueprint,
) -> AdminImplementationTableDetail:
    table = blueprint.model.__table__

    return AdminImplementationTableDetail(
        label=blueprint.label,
        table_name=table.name,
        purpose=blueprint.purpose,
        query=_build_query(blueprint),
        row_count=int(db.scalar(select(func.count()).select_from(blueprint.model)) or 0),
        columns=_build_columns(table),
        constraints=_build_constraints(table),
        indexes=_build_indexes(table),
        preview_rows=_build_preview_rows(db, blueprint),
    )


def build_implementation_summary(db: Session) -> AdminImplementationSummaryResponse:
    table_details = [_build_table_detail(db, blueprint) for blueprint in TABLE_BLUEPRINTS]
    database_entities = [
        AdminImplementationEntityCount(
            label=table_detail.label,
            table_name=table_detail.table_name,
            count=table_detail.row_count,
        )
        for table_detail in table_details
    ]

    return AdminImplementationSummaryResponse(
        thingspeak_base_url=settings.THINGSPEAK_BASE_URL,
        thingspeak_channel_id=settings.THINGSPEAK_CHANNEL_ID,
        health_endpoint="/health",
        docs_endpoint="/docs",
        api_touchpoints=[
            "/api/auth/login",
            "/api/farmer/dashboard",
            "/api/admin/sync-thingspeak",
            "/api/admin/trigger-carbon-calculation",
            "/api/verifier/approve/{id}",
        ],
        network_flow=[
            "Communication starts from a sender node such as a field sensor, admin client, or verifier client.",
            "Messages travel over the Internet using HTTPS and application-layer HTTP requests.",
            "The system exchanges structured data as ThingSpeak form fields and JSON request-response bodies.",
            "Security is enforced with channel write authorization and JWT bearer tokens on protected APIs.",
            "Validated messages are persisted in PostgreSQL, making the communication outcome queryable and auditable.",
        ],
        dbms_highlights=[
            "The schema is normalized across users, farmers, farms, seasons, measurements, carbon records, and verification history.",
            "Check constraints protect season status, measurement depth, farm area, and verification states.",
            "Unique constraints prevent duplicate season-level sequestration rows and duplicate measurement imports.",
            "Indexes support fast filtering by role, season status, measurement date, and sequestration status.",
            "The website now surfaces real row previews and exact constraint definitions instead of only descriptive copy.",
        ],
        database_entities=database_entities,
        cndc_flow=list(FLOW_STEPS),
        table_details=table_details,
    )
