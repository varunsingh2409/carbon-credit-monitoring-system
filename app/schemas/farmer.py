from datetime import date

from pydantic import BaseModel, ConfigDict


class FarmerBase(BaseModel):
    first_name: str
    last_name: str
    phone: str | None = None
    address: str | None = None


class FarmerRead(FarmerBase):
    farmer_id: int
    user_id: int | None = None
    registration_date: date

    model_config = ConfigDict(from_attributes=True)
