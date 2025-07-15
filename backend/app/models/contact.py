"""
Contact-related database models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100))
    email = Column(String(255))
    phone = Column(String(20))
    job_title = Column(String(200))
    company = Column(String(200))
    location = Column(String(200))
    age = Column(Integer)
    has_pets = Column(Boolean, default=False)
    business_needs = Column(Text)
    personal_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    audio_recordings = relationship("AudioRecording", back_populates="contact")
    interests = relationship("ContactInterest", back_populates="contact", cascade="all, delete-orphan")
    skills = relationship("ContactSkill", back_populates="contact", cascade="all, delete-orphan")
    event_participations = relationship("EventParticipation", back_populates="contact")


class ContactInterest(Base):
    __tablename__ = "contact_interests"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"))
    interest_category = Column(String(100))
    interest_value = Column(String(200))
    confidence_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    contact = relationship("Contact", back_populates="interests")


class ContactSkill(Base):
    __tablename__ = "contact_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"))
    skill_name = Column(String(200))
    skill_level = Column(String(50))
    years_experience = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    contact = relationship("Contact", back_populates="skills")
