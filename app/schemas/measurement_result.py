from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class MeasurementResultRead(BaseModel):
    measurement_id: int
    nutrient_id: int
    measured_value: Decimal

    model_config = ConfigDict(from_attributes=True)
