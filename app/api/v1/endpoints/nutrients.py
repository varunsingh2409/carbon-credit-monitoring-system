from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.db.session import get_db
from app.models.measurement import Nutrient
from app.schemas.nutrient import NutrientRead

router = APIRouter()


@router.get("/", response_model=list[NutrientRead])
def list_nutrients(_: CurrentUser, db: Session = Depends(get_db)) -> list[Nutrient]:
    return list(db.scalars(select(Nutrient).order_by(Nutrient.nutrient_id)).all())
