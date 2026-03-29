from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_verifier
from app.db.session import get_db
from app.models.carbon import CarbonVerification
from app.schemas.carbon_verification import CarbonVerificationRead

router = APIRouter()


@router.get("/", response_model=list[CarbonVerificationRead], dependencies=[Depends(require_verifier)])
def list_verifications(_: CurrentUser, db: Session = Depends(get_db)) -> list[CarbonVerification]:
    return list(db.scalars(select(CarbonVerification).order_by(CarbonVerification.verification_id)).all())


@router.get("/{verification_id}", response_model=CarbonVerificationRead, dependencies=[Depends(require_verifier)])
def get_verification(verification_id: int, _: CurrentUser, db: Session = Depends(get_db)) -> CarbonVerification:
    verification = db.get(CarbonVerification, verification_id)
    if not verification:
        raise HTTPException(status_code=404, detail="Verification record not found")
    return verification
