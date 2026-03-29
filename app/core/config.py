from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Carbon Credit Monitoring System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    SECRET_KEY: str = "change_this_to_a_long_random_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "postgresql+psycopg2://carbon_app_user:your_password@localhost:5432/carbon_credit_db"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    THINGSPEAK_BASE_URL: str = "https://api.thingspeak.com"
    THINGSPEAK_CHANNEL_ID: int | None = None
    THINGSPEAK_READ_API_KEY: str | None = None
    THINGSPEAK_TIMEOUT_SECONDS: int = 15
    THINGSPEAK_SENSOR_ID: str | None = None
    THINGSPEAK_DEFAULT_DEPTH_CM: float | None = None
    THINGSPEAK_IMPORT_RESULTS: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
