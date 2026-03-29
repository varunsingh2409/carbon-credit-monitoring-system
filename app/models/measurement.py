from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.season import Season


class Nutrient(Base):
    __tablename__ = "nutrient"

    nutrient_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nutrient_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    optimal_range_min: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    optimal_range_max: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)

    measurement_results: Mapped[list[MeasurementResult]] = relationship(
        "MeasurementResult",
        back_populates="nutrient",
        lazy="select",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"Nutrient(nutrient_id={self.nutrient_id!r}, "
            f"nutrient_name={self.nutrient_name!r}, unit={self.unit!r})"
        )


class SoilMeasurement(Base):
    __tablename__ = "soil_measurement"
    __table_args__ = (
        CheckConstraint("depth_cm > 0", name="ck_soil_measurement_depth_positive"),
        UniqueConstraint(
            "farm_id",
            "season_id",
            "measurement_date",
            "depth_cm",
            name="uq_soil_measurement",
        ),
        Index("idx_soil_measurement_farm_season", "farm_id", "season_id"),
        Index("idx_soil_measurement_date", "measurement_date"),
    )

    measurement_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farm.farm_id", ondelete="CASCADE"),
        nullable=False,
    )
    season_id: Mapped[int] = mapped_column(
        ForeignKey("season.season_id", ondelete="CASCADE"),
        nullable=False,
    )
    measurement_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )
    depth_cm: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 7), nullable=True)
    sensor_id: Mapped[str | None] = mapped_column(String(50), nullable=True)

    farm: Mapped[Farm] = relationship(
        "Farm",
        back_populates="measurements",
        lazy="select",
    )

    season: Mapped[Season] = relationship(
        "Season",
        back_populates="measurements",
        lazy="select",
    )

    results: Mapped[list[MeasurementResult]] = relationship(
        "MeasurementResult",
        back_populates="measurement",
        lazy="select",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"SoilMeasurement(measurement_id={self.measurement_id!r}, farm_id={self.farm_id!r}, "
            f"season_id={self.season_id!r}, measurement_date={self.measurement_date!r}, "
            f"depth_cm={self.depth_cm!r}, sensor_id={self.sensor_id!r})"
        )


class MeasurementResult(Base):
    __tablename__ = "measurement_result"
    __table_args__ = (
        Index("idx_measurement_result_nutrient_id", "nutrient_id"),
    )

    measurement_id: Mapped[int] = mapped_column(
        ForeignKey("soil_measurement.measurement_id", ondelete="CASCADE"),
        primary_key=True,
    )
    nutrient_id: Mapped[int] = mapped_column(
        ForeignKey("nutrient.nutrient_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    measured_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    measurement: Mapped[SoilMeasurement] = relationship(
        "SoilMeasurement",
        back_populates="results",
        lazy="select",
    )

    nutrient: Mapped[Nutrient] = relationship(
        "Nutrient",
        back_populates="measurement_results",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"MeasurementResult(measurement_id={self.measurement_id!r}, "
            f"nutrient_id={self.nutrient_id!r}, measured_value={self.measured_value!r})"
        )
