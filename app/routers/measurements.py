from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.measurement import (
    MeasurementCreate,
    MeasurementResponse,
    ThingSpeakIngestionRequest,
    ThingSpeakIngestionResponse,
)
from app.services.measurement_service import MeasurementServiceError, create_measurement
from app.services.thingspeak_service import (
    ThingSpeakIntegrationError,
    import_measurements_from_thingspeak,
)

router = APIRouter()

SensorOrAdminUser = Annotated[User, Depends(require_role(["sensor", "admin"]))]


@router.post("/measurements", response_model=MeasurementResponse, status_code=status.HTTP_201_CREATED)
def ingest_measurement(
    measurement_data: MeasurementCreate,
    _: SensorOrAdminUser,
    db: Session = Depends(get_db),
) -> MeasurementResponse:
    try:
        result = create_measurement(db, measurement_data)
        return MeasurementResponse(**result)
    except MeasurementServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    except ValueError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while ingesting the measurement",
        ) from exc


@router.post(
    "/measurements/thingspeak/import",
    response_model=ThingSpeakIngestionResponse,
    status_code=status.HTTP_200_OK,
)
def import_measurements(
    request_data: ThingSpeakIngestionRequest,
    _: SensorOrAdminUser,
    db: Session = Depends(get_db),
) -> ThingSpeakIngestionResponse:
    try:
        result = import_measurements_from_thingspeak(db, request_data)
        return ThingSpeakIngestionResponse(**result)
    except ThingSpeakIntegrationError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    except ValueError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while importing ThingSpeak data",
        ) from exc
