from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CarbonVerificationRead(BaseModel):
    verification_id: int
    sequestration_id: int
    verifier_id: int | None = None
    verification_date: datetime
    verification_status: str
    verifier_comments: str | None = None
    approved_carbon_credit: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)
