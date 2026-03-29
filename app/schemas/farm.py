from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class FarmBase(BaseModel):
    farm_name: str
    location: str
    total_area_hectares: Decimal
    soil_type: str | None = None
    baseline_carbon: Decimal = Decimal("0.00")


class FarmRead(FarmBase):
    farm_id: int
    farmer_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
