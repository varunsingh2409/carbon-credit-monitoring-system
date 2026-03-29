from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.farm import Farm


class Farmer(Base):
    __tablename__ = "farmer"

    farmer_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"),
        unique=True,
        nullable=True,
    )
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(15), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    registration_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        server_default=func.current_date(),
    )

    user: Mapped[User | None] = relationship(
        "User",
        back_populates="farmer_profile",
        lazy="select",
    )

    farms: Mapped[list[Farm]] = relationship(
        "Farm",
        back_populates="farmer",
        lazy="select",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"Farmer(farmer_id={self.farmer_id!r}, user_id={self.user_id!r}, "
            f"name={self.first_name!r} {self.last_name!r})"
        )
