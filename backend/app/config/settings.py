from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pharma Complaint AI"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    APP_VERSION: str = "1.0.0"
    API_VERSION: str = "v1"

    # JWT Authentication configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | List[str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database configuration
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432

    @property
    def sqlalchemy_database_uri(self) -> str:
        """Constructs the asyncpg URI for SQLAlchemy 2.0."""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # AI & Model Configuration
    GROQ_API_KEY: str
    MODEL_NAME: str = "llama3-8b-8192"
    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.2

    # Storage Configuration
    UPLOAD_DIRECTORY: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 20

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
