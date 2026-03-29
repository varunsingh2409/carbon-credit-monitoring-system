from datetime import date

from pydantic import BaseModel, ConfigDict


class SeasonBase(BaseModel):
    season_name: str
    start_date: date
    end_date: date
    crop_type: str | None = None
    status: str = "active"


class SeasonRead(SeasonBase):
    season_id: int
    farm_id: int

    model_config = ConfigDict(from_attributes=True)
