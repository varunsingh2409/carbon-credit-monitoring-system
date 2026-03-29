from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ALLOWED_ROLES = {"farmer", "verifier", "admin", "sensor"}


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=100)
    password: str = Field(min_length=8, max_length=128)
    role: str
    first_name: str | None = Field(default=None, max_length=50)
    last_name: str | None = Field(default=None, max_length=50)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        username = value.strip()
        if not username:
            raise ValueError("Username cannot be empty")
        return username

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip().lower()
        if "@" not in email or "." not in email.split("@")[-1]:
            raise ValueError("Email must be a valid email address")
        return email

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        role = value.strip().lower()
        if role not in ALLOWED_ROLES:
            raise ValueError(
                f"Role must be one of: {', '.join(sorted(ALLOWED_ROLES))}"
            )
        return role

    @field_validator("first_name", "last_name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        name = value.strip()
        return name or None

    @model_validator(mode="after")
    def validate_farmer_names(self) -> "UserCreate":
        if self.role == "farmer" and (not self.first_name or not self.last_name):
            raise ValueError(
                "first_name and last_name are required when role is farmer"
            )
        return self


class UserLogin(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        username = value.strip()
        if not username:
            raise ValueError("Username cannot be empty")
        return username


class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
