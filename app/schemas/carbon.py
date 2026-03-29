from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CarbonCalculationRequest(BaseModel):
    season_id: int = Field(gt=0)


class CarbonSequestrationResponse(BaseModel):
    sequestration_id: int
    farm_id: int
    season_id: int
    baseline_carbon: Decimal
    current_carbon: Decimal
    net_carbon_increase: Decimal
    estimated_carbon_credit: Decimal
    status: str
    calculation_date: datetime

    model_config = ConfigDict(from_attributes=True)
