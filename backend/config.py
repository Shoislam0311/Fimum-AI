from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # OpenRouter Configuration
    OPENROUTER_API_KEY: str = "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"
    OPENROUTER_REFERER: str = "https://fimum.ai"
    OPENROUTER_TITLE: str = "Fimum AI"
    
    # Supabase Configuration
    SUPABASE_URL: str = "postgresql://postgres:Alexander#B:03@db.zlzzazqkpzabqogwsuij.supabase.co:5432/postgres"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenphenFrcHphYnFvZ3dzdWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4OTU4NTMsImV4cCI6MjA3MjQ3MTg1M30.jiPP1675pH_2J3_QP5iwN-6U-LJ1dhvGD0iJysdxutU"
    SUPABASE_STORAGE_URL: str = "https://zlzzazqkpzabqogwsuij.supabase.co/storage/v1"
    
    # Auth Configuration
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()