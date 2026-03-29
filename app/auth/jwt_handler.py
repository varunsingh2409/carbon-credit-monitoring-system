from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.core.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

REQUIRED_CLAIMS = {"sub", "user_id", "role", "exp"}


def create_access_token(data: dict) -> str:
    payload = data.copy()
    if "exp" not in payload:
        payload["exp"] = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    missing_claims = [claim for claim in ("sub", "user_id", "role") if claim not in payload]
    if missing_claims:
        raise ValueError(
            f"Missing required token fields: {', '.join(sorted(missing_claims))}"
        )

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    missing_claims = REQUIRED_CLAIMS.difference(payload)
    if missing_claims:
        raise JWTError(
            f"Token is missing required claims: {', '.join(sorted(missing_claims))}"
        )
    return payload
