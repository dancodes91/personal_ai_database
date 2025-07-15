"""
Configuration settings for the Personal AI Database
"""
import os
from typing import Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./personal_ai_database.db"
    
    # ChromaDB
    chroma_persist_directory: str = "./chroma_db"
    chroma_collection_name: str = "contacts_embeddings"
    
    # OpenAI
    openai_api_key: Optional[str] = None
    
    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # File Upload
    upload_dir: str = "./uploads"
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    
    # API
    api_v1_str: str = "/api/v1"
    project_name: str = "Personal AI Database"
    
    class Config:
        env_file = ".env"


settings = Settings()
