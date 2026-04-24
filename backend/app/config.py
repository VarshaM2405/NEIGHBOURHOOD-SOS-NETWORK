from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SOS Network"
    FIREBASE_CREDENTIALS: str = "serviceAccountKey.json"

    class Config:
        env_file = ".env"
settings = Settings()