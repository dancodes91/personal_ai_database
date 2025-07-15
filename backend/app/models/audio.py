"""
Audio recording database models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class AudioRecording(Base):
    __tablename__ = "audio_recordings"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    duration_seconds = Column(Integer)
    transcription = Column(Text)
    processed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    contact = relationship("Contact", back_populates="audio_recordings")
