from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.password import hash_password
from app.models.farmer import Farmer
from app.models.user import User
from app.schemas.user import UserCreate


class CRUDUser:
    def get_by_username(self, db: Session, username: str) -> User | None:
        return db.scalar(select(User).where(User.username == username))

    def create(self, db: Session, obj_in: UserCreate) -> User:
        user = User(
            username=obj_in.username,
            email=obj_in.email,
            password_hash=hash_password(obj_in.password),
            role=obj_in.role,
            is_active=True,
        )
        db.add(user)
        db.flush()

        if user.role == "farmer":
            db.add(
                Farmer(
                    user_id=user.user_id,
                    first_name=obj_in.first_name,
                    last_name=obj_in.last_name,
                )
            )

        db.commit()
        db.refresh(user)
        return user


user = CRUDUser()
