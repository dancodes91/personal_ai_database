"""
Configuration settings for the Personal AI Database
"""
import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./personal_ai_database.db"
    postgres_url: Optional[str] = None  # Alternative PostgreSQL URL
    
    # ChromaDB
    chroma_persist_directory: str = "./.chromadb"
    chroma_collection_name: str = "contacts_embeddings"
    
    # OpenAI
    openai_api_key: Optional[str] = None
    
    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # User Authentication
    user_email: str = "aaa@gmail.com"
    user_password: str = "12345"
    
    # CORS - loaded from .env as comma-separated string
    allowed_origins: str = "https://personal-ai-database.vercel.app,https://personal-ai-database.vercel.app/"
    
    # File Upload
    upload_dir: str = "./uploads"
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    
    # API Configuration
    api_v1_str: str = "/api/v1"
    project_name: str = "Personal AI Database"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    model_config = {"env_file": ".env", "extra": "ignore"}
    
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins as a list from comma-separated string"""
        return [origin.strip() for origin in self.allowed_origins.split(',')]


settings = Settings()
