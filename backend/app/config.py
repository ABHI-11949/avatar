from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # HeyGen API
    HEYGEN_API_KEY: str
    HEYGEN_API_URL: str = "https://api.heygen.com/v1"

    # Default Avatar Settings
    DEFAULT_AVATAR_ID: str
    DEFAULT_VOICE_ID: str

    # Server
    PORT: int = 8000
    ENV: str = "development"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
