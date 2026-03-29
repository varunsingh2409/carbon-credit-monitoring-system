from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class PendingVerificationItem(BaseModel):
    sequestration_id: int
    farm_name: str
    farmer_name: str
    season_name: str
    location: str
    area_hectares: float
    baseline_carbon: float
    current_carbon: float
    net_carbon_increase: float
    estimated_carbon_credit: float
    calculation_date: datetime
    measurement_count: int


class VerificationMeasurementNutrient(BaseModel):
    nutrient_name: str
    measured_value: float
    unit: str


class VerificationMeasurementDetail(BaseModel):
    measurement_id: int
    measurement_date: datetime
    depth_cm: float
    latitude: float | None = None
    longitude: float | None = None
    sensor_id: str | None = None
    nutrients: list[VerificationMeasurementNutrient]


class VerificationRecordInfo(BaseModel):
    verification_id: int
    verifier_id: int | None = None
    verification_date: datetime
    verification_status: str
    verifier_comments: str | None = None
    approved_carbon_credit: float | None = None


class SequestrationDetailResponse(BaseModel):
    sequestration_id: int
    farm_id: int
    farm_name: str
    farmer_name: str
    season_id: int
    season_name: str
    location: str
    area_hectares: float
    baseline_carbon: float
    current_carbon: float
    net_carbon_increase: float
    estimated_carbon_credit: float
    status: str
    calculation_date: datetime
    measurement_count: int
    measurements: list[VerificationMeasurementDetail]
    verification: VerificationRecordInfo | None = None


class ApproveSequestrationRequest(BaseModel):
    approved_carbon_credit: float = Field(ge=0)
    verifier_comments: str = Field(min_length=1, max_length=2000)

    @field_validator("verifier_comments")
    @classmethod
    def validate_comments(cls, value: str) -> str:
        comment = value.strip()
        if not comment:
            raise ValueError("verifier_comments cannot be empty")
        return comment


class RejectSequestrationRequest(BaseModel):
    verifier_comments: str = Field(min_length=1, max_length=2000)

    @field_validator("verifier_comments")
    @classmethod
    def validate_comments(cls, value: str) -> str:
        comment = value.strip()
        if not comment:
            raise ValueError("verifier_comments cannot be empty")
        return comment


class VerificationActionResponse(BaseModel):
    message: str
    sequestration_id: int
    verification_id: int
    status: str
