from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AdminStatisticsResponse(BaseModel):
    total_farms: int
    total_farmers: int
    total_seasons: int
    pending_verifications: int
    total_carbon_credits_issued: float
    active_seasons: int


class MonthlyCreditsItem(BaseModel):
    month: str
    credits: float


class AdminImplementationEntityCount(BaseModel):
    label: str
    table_name: str
    count: int


class AdminImplementationColumn(BaseModel):
    name: str
    data_type: str
    nullable: bool
    is_primary_key: bool = False
    foreign_key: str | None = None
    default_value: str | None = None


class AdminImplementationConstraint(BaseModel):
    name: str
    kind: str
    definition: str


class AdminImplementationIndex(BaseModel):
    name: str
    columns: list[str]
    unique: bool = False


class AdminImplementationTableDetail(BaseModel):
    label: str
    table_name: str
    purpose: str
    query: str
    row_count: int
    columns: list[AdminImplementationColumn]
    constraints: list[AdminImplementationConstraint]
    indexes: list[AdminImplementationIndex]
    preview_rows: list[dict[str, Any]]


class AdminImplementationFlowStep(BaseModel):
    step: int
    title: str
    source: str
    destination: str
    protocol: str
    method: str
    endpoint: str
    payload: dict[str, Any] | None = None
    stored_tables: list[str] = []
    outcome: str
    evidence_points: list[str]


class AdminImplementationSummaryResponse(BaseModel):
    thingspeak_base_url: str
    thingspeak_channel_id: int | None = None
    health_endpoint: str
    docs_endpoint: str
    api_touchpoints: list[str]
    network_flow: list[str]
    dbms_highlights: list[str]
    database_entities: list[AdminImplementationEntityCount]
    cndc_flow: list[AdminImplementationFlowStep]
    table_details: list[AdminImplementationTableDetail]


class AdminUserItem(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    status: str
    created_at: datetime


class AdminCarbonCalculationResponse(BaseModel):
    sequestration_id: int
    farm_id: int
    season_id: int
    baseline_carbon: float
    current_carbon: float
    net_carbon_increase: float
    estimated_carbon_credit: float
    status: str
    calculation_date: datetime
    flag: str | None = None
    manual_review: bool | None = None
    review_reason: str | None = None


class AdminThingSpeakSyncRequest(BaseModel):
    season_id: int = Field(gt=0)
    results: int | None = Field(default=None, ge=1, le=100)
    sensor_id: str | None = Field(default=None, min_length=1, max_length=50)
    default_depth_cm: float | None = Field(default=None, gt=0)
