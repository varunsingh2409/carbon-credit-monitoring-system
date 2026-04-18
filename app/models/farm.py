from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.farmer import Farmer
    from app.models.season import Season
    from app.models.measurement import SoilMeasurement
    from app.models.carbon import CarbonSequestration


class Farm(Base):
    __tablename__ = "farm"
    __table_args__ = (
        CheckConstraint("length(trim(farm_name)) > 0", name="ck_farm_name_non_empty"),
        CheckConstraint("length(trim(location)) > 0", name="ck_farm_location_non_empty"),
        CheckConstraint("total_area_hectares > 0", name="ck_farm_total_area_hectares_positive"),
        CheckConstraint("baseline_carbon >= 0", name="ck_farm_baseline_carbon_non_negative"),
        CheckConstraint(
            "soil_type IS NULL OR length(trim(soil_type)) > 0",
            name="ck_farm_soil_type_non_empty",
        ),
        Index("idx_farm_farmer_id", "farmer_id"),
        Index("idx_farm_location", "location"),
    )

    farm_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(
        ForeignKey("farmer.farmer_id", ondelete="CASCADE"),
        nullable=False,
    )
    farm_name: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    total_area_hectares: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    soil_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    baseline_carbon: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        server_default=text("0.00"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )

    farmer: Mapped[Farmer] = relationship(
        "Farmer",
        back_populates="farms",
        lazy="select",
    )

    seasons: Mapped[list[Season]] = relationship(
        "Season",
        back_populates="farm",
        lazy="select",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    measurements: Mapped[list[SoilMeasurement]] = relationship(
        "SoilMeasurement",
        back_populates="farm",
        lazy="select",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    carbon_sequestrations: Mapped[list[CarbonSequestration]] = relationship(
        "CarbonSequestration",
        back_populates="farm",
        lazy="select",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"Farm(farm_id={self.farm_id!r}, farm_name={self.farm_name!r}, "
            f"location={self.location!r}, area={self.total_area_hectares!r})"
        )
