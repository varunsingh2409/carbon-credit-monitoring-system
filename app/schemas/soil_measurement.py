from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.measurement_result import MeasurementResultRead


class SoilMeasurementRead(BaseModel):
    measurement_id: int
    farm_id: int
    season_id: int
    measurement_date: datetime
    depth_cm: Decimal
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    sensor_id: str | None = None
    results: list[MeasurementResultRead] = []

    model_config = ConfigDict(from_attributes=True)
