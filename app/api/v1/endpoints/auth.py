from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt_handler import create_access_token
from app.auth.password import verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserResponse

router = APIRouter()


@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Token:
    user = db.scalar(select(User).where(User.username == form_data.username))
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    token = create_access_token(
        {
            "sub": user.username,
            "user_id": user.user_id,
            "role": user.role,
        }
    )
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )
