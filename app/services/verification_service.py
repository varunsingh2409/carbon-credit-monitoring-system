from decimal import Decimal

from fastapi import status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.models.carbon import CarbonSequestration, CarbonVerification
from app.models.season import Season


class VerificationServiceError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def _get_pending_sequestration(db: Session, sequestration_id: int) -> CarbonSequestration:
    stmt = (
        select(CarbonSequestration)
        .options(
            joinedload(CarbonSequestration.season),
            joinedload(CarbonSequestration.verification),
        )
        .where(CarbonSequestration.sequestration_id == sequestration_id)
        .with_for_update()
    )
    sequestration = db.scalar(stmt)
    if sequestration is None:
        raise VerificationServiceError(
            status.HTTP_404_NOT_FOUND,
            "Sequestration record not found",
        )

    if sequestration.status != "pending":
        raise VerificationServiceError(
            status.HTTP_409_CONFLICT,
            "Only pending sequestration records can be verified",
        )

    if sequestration.verification is not None:
        raise VerificationServiceError(
            status.HTTP_409_CONFLICT,
            "This sequestration already has a verification record",
        )

    if sequestration.season is None:
        raise VerificationServiceError(
            status.HTTP_404_NOT_FOUND,
            "Associated season was not found",
        )

    return sequestration


def approve_sequestration(
    db: Session,
    sequestration_id: int,
    verifier_id: int,
    approved_credit: float,
    comments: str,
) -> dict:
    sequestration = _get_pending_sequestration(db, sequestration_id)
    season: Season = sequestration.season

    try:
        sequestration.status = "verified"
        season.status = "verified"

        verification = CarbonVerification(
            sequestration_id=sequestration.sequestration_id,
            verifier_id=verifier_id,
            verification_status="approved",
            verifier_comments=comments,
            approved_carbon_credit=Decimal(str(approved_credit)),
        )
        db.add(verification)
        db.flush()
        db.commit()
        db.refresh(verification)
    except IntegrityError as exc:
        db.rollback()
        raise VerificationServiceError(
            status.HTTP_409_CONFLICT,
            "The sequestration could not be approved because it was updated by another transaction",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise VerificationServiceError(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to approve sequestration",
        ) from exc

    return {
        "message": "Sequestration approved successfully",
        "sequestration_id": sequestration.sequestration_id,
        "verification_id": verification.verification_id,
        "status": sequestration.status,
    }


def reject_sequestration(
    db: Session,
    sequestration_id: int,
    verifier_id: int,
    comments: str,
) -> dict:
    sequestration = _get_pending_sequestration(db, sequestration_id)
    season: Season = sequestration.season

    try:
        sequestration.status = "rejected"
        # Season status is constrained to active/completed/verified, so rejected cases remain completed.
        season.status = "completed"

        verification = CarbonVerification(
            sequestration_id=sequestration.sequestration_id,
            verifier_id=verifier_id,
            verification_status="rejected",
            verifier_comments=comments,
            approved_carbon_credit=None,
        )
        db.add(verification)
        db.flush()
        db.commit()
        db.refresh(verification)
    except IntegrityError as exc:
        db.rollback()
        raise VerificationServiceError(
            status.HTTP_409_CONFLICT,
            "The sequestration could not be rejected because it was updated by another transaction",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise VerificationServiceError(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to reject sequestration",
        ) from exc

    return {
        "message": "Sequestration rejected successfully",
        "sequestration_id": sequestration.sequestration_id,
        "verification_id": verification.verification_id,
        "status": sequestration.status,
    }
