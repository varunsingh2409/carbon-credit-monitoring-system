from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import CurrentUser
from app.db.session import get_db
from app.models.measurement import SoilMeasurement
from app.schemas.soil_measurement import SoilMeasurementRead

router = APIRouter()


@router.get("/", response_model=list[SoilMeasurementRead])
def list_measurements(_: CurrentUser, db: Session = Depends(get_db)) -> list[SoilMeasurement]:
    stmt = select(SoilMeasurement).options(selectinload(SoilMeasurement.results)).order_by(SoilMeasurement.measurement_id)
    return list(db.scalars(stmt).all())


@router.get("/{measurement_id}", response_model=SoilMeasurementRead)
def get_measurement(measurement_id: int, _: CurrentUser, db: Session = Depends(get_db)) -> SoilMeasurement:
    stmt = select(SoilMeasurement).options(selectinload(SoilMeasurement.results)).where(SoilMeasurement.measurement_id == measurement_id)
    measurement = db.scalar(stmt)
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return measurement
