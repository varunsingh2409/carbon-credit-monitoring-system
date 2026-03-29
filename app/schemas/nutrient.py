from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class NutrientRead(BaseModel):
    nutrient_id: int
    nutrient_name: str
    unit: str
    optimal_range_min: Decimal | None = None
    optimal_range_max: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)
