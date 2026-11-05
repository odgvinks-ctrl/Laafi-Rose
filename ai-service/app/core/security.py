from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mistral_api_key: str
    qdrant_url: str
    qdrant_collection: str = "laafi_rose"

    class Config:
        env_file = ".env"


settings = Settings()