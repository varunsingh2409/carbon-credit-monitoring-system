from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.db.session import get_db
from app.models.farmer import Farmer
from app.schemas.farmer import FarmerRead

router = APIRouter()


@router.get("/", response_model=list[FarmerRead])
def list_farmers(_: CurrentUser, db: Session = Depends(get_db)) -> list[Farmer]:
    return list(db.scalars(select(Farmer).order_by(Farmer.farmer_id)).all())


@router.get("/{farmer_id}", response_model=FarmerRead)
def get_farmer(farmer_id: int, _: CurrentUser, db: Session = Depends(get_db)) -> Farmer:
    farmer = db.get(Farmer, farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer
