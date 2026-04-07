from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.admin import AdminImplementationSummaryResponse
from app.services.implementation_service import build_implementation_summary

router = APIRouter()


@router.get("/evidence", response_model=AdminImplementationSummaryResponse)
def get_implementation_evidence(
    db: Session = Depends(get_db),
) -> AdminImplementationSummaryResponse:
    return build_implementation_summary(db)
