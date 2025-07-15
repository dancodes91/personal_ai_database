"""
Event-related database models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    event_type = Column(String(100))  # e.g., "Sing with Me", "Community Outreach"
    location = Column(String(200))
    event_date = Column(DateTime(timezone=True))
    max_participants = Column(Integer)
    status = Column(String(50), default="planned")  # planned, active, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    participations = relationship("EventParticipation", back_populates="event", cascade="all, delete-orphan")


class EventParticipation(Base):
    __tablename__ = "event_participations"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"))
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"))
    participation_status = Column(String(50), default="invited")  # invited, confirmed, attended, declined
    interest_level = Column(Integer)  # 1-10 scale
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="participations")
    contact = relationship("Contact", back_populates="event_participations")
