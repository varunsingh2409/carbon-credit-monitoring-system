from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.measurement import SoilMeasurement
    from app.models.carbon import CarbonSequestration


class Season(Base):
    __tablename__ = "season"
    __table_args__ = (
        CheckConstraint("length(trim(season_name)) > 0", name="ck_season_name_non_empty"),
        CheckConstraint("end_date > start_date", name="chk_season_dates"),
        CheckConstraint(
            "status IN ('active', 'completed', 'verified')",
            name="ck_season_status",
        ),
        CheckConstraint(
            "crop_type IS NULL OR length(trim(crop_type)) > 0",
            name="ck_season_crop_type_non_empty",
        ),
        Index("idx_season_farm_id", "farm_id"),
        Index("idx_season_status", "status"),
        Index("idx_season_farm_status", "farm_id", "status"),
    )

    season_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farm.farm_id", ondelete="CASCADE"),
        nullable=False,
    )
    season_name: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    crop_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default="active",
    )

    farm: Mapped[Farm] = relationship(
        "Farm",
        back_populates="seasons",
        lazy="select",
    )

    measurements: Mapped[list[SoilMeasurement]] = relationship(
        "SoilMeasurement",
        back_populates="season",
        lazy="select",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    carbon_sequestration: Mapped[CarbonSequestration | None] = relationship(
        "CarbonSequestration",
        back_populates="season",
        uselist=False,
        lazy="select",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"Season(season_id={self.season_id!r}, season_name={self.season_name!r}, "
            f"crop_type={self.crop_type!r}, status={self.status!r})"
        )
