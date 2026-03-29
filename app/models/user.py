from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, DateTime, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.farmer import Farmer
    from app.models.carbon import CarbonVerification


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('farmer', 'verifier', 'admin', 'sensor')",
            name="ck_users_role",
        ),
        Index("idx_users_username", "username"),
        Index("idx_users_role", "role"),
    )

    user_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="true"
    )

    farmer_profile: Mapped[Farmer | None] = relationship(
        "Farmer",
        back_populates="user",
        uselist=False,
        lazy="select",
        passive_deletes=True,
    )

    verifications: Mapped[list[CarbonVerification]] = relationship(
        "CarbonVerification",
        back_populates="verifier",
        lazy="select",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"User(user_id={self.user_id!r}, username={self.username!r}, "
            f"email={self.email!r}, role={self.role!r}, is_active={self.is_active!r})"
        )
