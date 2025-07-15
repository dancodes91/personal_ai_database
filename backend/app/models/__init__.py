"""
Database models for Personal AI Database
"""
from .contact import Contact, ContactInterest, ContactSkill
from .audio import AudioRecording
from .event import Event, EventParticipation
from .query import QueryHistory

__all__ = [
    "Contact",
    "ContactInterest", 
    "ContactSkill",
    "AudioRecording",
    "Event",
    "EventParticipation",
    "QueryHistory"
]
