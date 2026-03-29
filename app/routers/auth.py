from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.jwt_handler import create_access_token
from app.auth.password import hash_password, verify_password
from app.db.session import get_db
from app.models.farmer import Farmer
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse

router = APIRouter()


async def parse_login_request(request: Request) -> UserLogin:
    content_type = request.headers.get("content-type", "")

    try:
        if (
            "application/x-www-form-urlencoded" in content_type
            or "multipart/form-data" in content_type
        ):
            form_data = await request.form()
            payload = {
                "username": form_data.get("username"),
                "password": form_data.get("password"),
            }
        else:
            payload = await request.json()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid login payload",
        ) from exc

    try:
        return UserLogin.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc


def _build_token_response(user: User) -> Token:
    access_token = create_access_token(
        {
            "sub": user.username,
            "user_id": user.user_id,
            "role": user.role,
        }
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    existing_user = db.scalar(
        select(User).where(
            or_(User.username == user_in.username, User.email == user_in.email)
        )
    )
    if existing_user:
        detail = (
            "Username is already registered"
            if existing_user.username == user_in.username
            else "Email is already registered"
        )
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
        is_active=True,
    )

    try:
        db.add(new_user)
        db.flush()

        if new_user.role == "farmer":
            farmer_profile = Farmer(
                user_id=new_user.user_id,
                first_name=user_in.first_name,
                last_name=user_in.last_name,
            )
            db.add(farmer_profile)

        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to register user with the provided details",
        ) from exc

    db.refresh(new_user)
    return UserResponse.model_validate(new_user)


@router.post("/login", response_model=Token)
def login(
    user_in: UserLogin = Depends(parse_login_request),
    db: Session = Depends(get_db),
) -> Token:
    user = db.scalar(select(User).where(User.username == user_in.username))
    if user is None or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    return _build_token_response(user)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
