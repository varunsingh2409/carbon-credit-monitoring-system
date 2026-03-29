from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.db.session import get_db
from app.models.farm import Farm
from app.schemas.farm import FarmRead

router = APIRouter()


@router.get("/", response_model=list[FarmRead])
def list_farms(_: CurrentUser, db: Session = Depends(get_db)) -> list[Farm]:
    return list(db.scalars(select(Farm).order_by(Farm.farm_id)).all())


@router.get("/{farm_id}", response_model=FarmRead)
def get_farm(farm_id: int, _: CurrentUser, db: Session = Depends(get_db)) -> Farm:
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm
