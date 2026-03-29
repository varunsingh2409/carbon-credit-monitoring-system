from datetime import datetime, timedelta, timezone
from typing import Any

from app.auth.jwt_handler import create_access_token as jwt_create_access_token
from app.auth.password import hash_password, verify_password


def get_password_hash(password: str) -> str:
    return hash_password(password)


def create_access_token(subject: str | dict[str, Any], expires_delta: timedelta | None = None) -> str:
    if not isinstance(subject, dict):
        raise ValueError(
            "create_access_token requires a payload dict containing sub, user_id, and role"
        )

    payload = subject.copy()

    if expires_delta is not None:
        payload["exp"] = datetime.now(timezone.utc) + expires_delta

    return jwt_create_access_token(payload)
