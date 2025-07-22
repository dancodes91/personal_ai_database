"""
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine
from app.models import Contact, ContactInterest, ContactSkill, AudioRecording, Event, EventParticipation, QueryHistory
from app.api.v1.api import api_router
from database.migrate import run_initial_migration

# Create database tables
Contact.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.project_name,
    description="AI-powered contact management and networking system with ChromaDB integration",
    version="2.0.0",
    openapi_url=f"{settings.api_v1_str}/openapi.json"
)

# Setup DB migration on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    run_initial_migration()
    yield

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],#settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.api_v1_str)

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.project_name}",
        "version": "2.0.0",
        "docs": f"{settings.api_v1_str}/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # Use import string format for reload to work
        host=settings.api_host, 
        port=settings.api_port, 
        reload=settings.debug
    )
