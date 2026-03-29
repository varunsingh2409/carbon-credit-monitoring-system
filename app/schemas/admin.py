from datetime import datetime

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
