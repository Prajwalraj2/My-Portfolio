from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4o"
    # Model provider for LangChain init_chat_model (e.g. "openai"). Model string is
    # f"{model_provider}:{openai_model}", so switching providers later is a config change.
    model_provider: str = "openai"
    environment: str = "development"
    port: int = 8001

    # API Gateway for fetching portfolio data + tool calls
    api_gateway_url: str = "http://127.0.0.1:8000"
    # Service API key (pk_live_…) — lets the agent's tools call the gateway (book_meeting etc.)
    gateway_api_key: str = ""

    # Default timezone for showing meeting slots when the visitor's tz is unknown.
    default_timezone: str = "Asia/Kolkata"

    # Cache settings
    context_cache_ttl: int = 300  # 5 minutes

    @property
    def model_string(self) -> str:
        return f"{self.model_provider}:{self.openai_model}"
    
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
