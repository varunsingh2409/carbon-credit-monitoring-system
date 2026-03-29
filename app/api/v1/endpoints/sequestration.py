from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.db.session import get_db
from app.models.carbon import CarbonSequestration
from app.schemas.carbon_sequestration import CarbonSequestrationRead

router = APIRouter()


@router.get("/", response_model=list[CarbonSequestrationRead])
def list_sequestration(_: CurrentUser, db: Session = Depends(get_db)) -> list[CarbonSequestration]:
    return list(db.scalars(select(CarbonSequestration).order_by(CarbonSequestration.sequestration_id)).all())


@router.get("/{sequestration_id}", response_model=CarbonSequestrationRead)
def get_sequestration(sequestration_id: int, _: CurrentUser, db: Session = Depends(get_db)) -> CarbonSequestration:
    record = db.get(CarbonSequestration, sequestration_id)
    if not record:
        raise HTTPException(status_code=404, detail="Sequestration record not found")
    return record
