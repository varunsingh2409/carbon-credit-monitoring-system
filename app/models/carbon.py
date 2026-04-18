from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.season import Season
    from app.models.user import User


class CarbonSequestration(Base):
    __tablename__ = "carbon_sequestration"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'verified', 'rejected')",
            name="ck_carbon_sequestration_status",
        ),
        CheckConstraint(
            "baseline_carbon >= 0",
            name="ck_carbon_sequestration_baseline_non_negative",
        ),
        CheckConstraint(
            "current_carbon >= 0",
            name="ck_carbon_sequestration_current_non_negative",
        ),
        CheckConstraint(
            "estimated_carbon_credit >= 0",
            name="ck_carbon_sequestration_credit_non_negative",
        ),
        CheckConstraint(
            "net_carbon_increase = current_carbon - baseline_carbon",
            name="ck_carbon_sequestration_net_matches_snapshot",
        ),
        Index("idx_carbon_sequestration_status", "status"),
        Index("idx_carbon_sequestration_farm_id", "farm_id"),
        Index("idx_carbon_sequestration_status_date", "status", "calculation_date"),
    )

    sequestration_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farm.farm_id", ondelete="CASCADE"),
        nullable=False,
    )
    season_id: Mapped[int] = mapped_column(
        ForeignKey("season.season_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    calculation_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )
    baseline_carbon: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    current_carbon: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    net_carbon_increase: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    estimated_carbon_credit: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        server_default="pending",
    )

    farm: Mapped[Farm] = relationship(
        "Farm",
        back_populates="carbon_sequestrations",
        lazy="select",
    )

    season: Mapped[Season] = relationship(
        "Season",
        back_populates="carbon_sequestration",
        lazy="select",
    )

    verification: Mapped[CarbonVerification | None] = relationship(
        "CarbonVerification",
        back_populates="sequestration",
        uselist=False,
        lazy="select",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"CarbonSequestration(sequestration_id={self.sequestration_id!r}, "
            f"farm_id={self.farm_id!r}, season_id={self.season_id!r}, "
            f"estimated_carbon_credit={self.estimated_carbon_credit!r}, status={self.status!r})"
        )


class CarbonVerification(Base):
    __tablename__ = "carbon_verification"
    __table_args__ = (
        CheckConstraint(
            "verification_status IN ('approved', 'rejected')",
            name="ck_carbon_verification_status",
        ),
        CheckConstraint(
            "verifier_comments IS NOT NULL AND length(trim(verifier_comments)) > 0",
            name="ck_carbon_verification_comments_non_empty",
        ),
        CheckConstraint(
            "("
            "verification_status = 'approved' "
            "AND approved_carbon_credit IS NOT NULL "
            "AND approved_carbon_credit >= 0"
            ") OR ("
            "verification_status = 'rejected' "
            "AND approved_carbon_credit IS NULL"
            ")",
            name="ck_carbon_verification_credit_matches_status",
        ),
        Index("idx_carbon_verification_verifier_id", "verifier_id"),
        Index(
            "idx_carbon_verification_status_date",
            "verification_status",
            "verification_date",
        ),
    )

    verification_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sequestration_id: Mapped[int] = mapped_column(
        ForeignKey("carbon_sequestration.sequestration_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    verifier_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    verification_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )
    verification_status: Mapped[str] = mapped_column(String(20), nullable=False)
    verifier_comments: Mapped[str] = mapped_column(nullable=False)
    approved_carbon_credit: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    sequestration: Mapped[CarbonSequestration] = relationship(
        "CarbonSequestration",
        back_populates="verification",
        lazy="select",
    )

    verifier: Mapped[User | None] = relationship(
        "User",
        back_populates="verifications",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"CarbonVerification(verification_id={self.verification_id!r}, "
            f"sequestration_id={self.sequestration_id!r}, verifier_id={self.verifier_id!r}, "
            f"verification_status={self.verification_status!r})"
        )
