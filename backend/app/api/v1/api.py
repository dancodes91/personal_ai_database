"""
API v1 router
"""
from fastapi import APIRouter
from .endpoints import contacts, audio, query, events, vector_search, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
api_router.include_router(query.router, prefix="/query", tags=["query"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(vector_search.router, prefix="/search", tags=["vector-search"])
