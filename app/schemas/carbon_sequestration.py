from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CarbonSequestrationRead(BaseModel):
    sequestration_id: int
    farm_id: int
    season_id: int
    calculation_date: datetime
    baseline_carbon: Decimal
    current_carbon: Decimal
    net_carbon_increase: Decimal
    estimated_carbon_credit: Decimal
    status: str

    model_config = ConfigDict(from_attributes=True)
