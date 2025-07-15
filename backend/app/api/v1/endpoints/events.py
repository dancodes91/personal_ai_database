"""
Event management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import openai

from ....core.database import get_db
from ....core.config import settings
from ....models import Event, EventParticipation, Contact, ContactInterest
from ....services.vector_store import vector_store

router = APIRouter()

# Pydantic models
class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    event_type: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    max_participants: Optional[int] = None

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    max_participants: Optional[int] = None
    status: Optional[str] = None

class ParticipationCreate(BaseModel):
    contact_id: int
    participation_status: str = "invited"
    interest_level: Optional[int] = None
    notes: Optional[str] = None

class EventResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    event_type: Optional[str]
    location: Optional[str]
    event_date: Optional[datetime]
    max_participants: Optional[int]
    status: str
    created_at: datetime
    updated_at: datetime
    participant_count: int
    participants: List[dict]

    class Config:
        from_attributes = True

@router.post("/", response_model=EventResponse)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    """Create a new event"""
    try:
        db_event = Event(
            name=event.name,
            description=event.description,
            event_type=event.event_type,
            location=event.location,
            event_date=event.event_date,
            max_participants=event.max_participants
        )
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        
        return format_event_response(db_event)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create event: {str(e)}")

@router.get("/", response_model=List[EventResponse])
def get_events(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all events with optional filtering"""
    query = db.query(Event)
    
    if status:
        query = query.filter(Event.status == status)
    if event_type:
        query = query.filter(Event.event_type == event_type)
    
    events = query.offset(skip).limit(limit).all()
    return [format_event_response(event) for event in events]

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return format_event_response(event)

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, event_update: EventUpdate, db: Session = Depends(get_db)):
    """Update an event"""
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        update_data = event_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)
        
        db.commit()
        db.refresh(event)
        
        return format_event_response(event)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update event: {str(e)}")

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event"""
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        db.delete(event)
        db.commit()
        
        return {"message": "Event deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete event: {str(e)}")

@router.post("/{event_id}/participants")
def add_participant(event_id: int, participation: ParticipationCreate, db: Session = Depends(get_db)):
    """Add a participant to an event"""
    try:
        # Check if event exists
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Check if contact exists
        contact = db.query(Contact).filter(Contact.id == participation.contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        # Check if already participating
        existing = db.query(EventParticipation).filter(
            EventParticipation.event_id == event_id,
            EventParticipation.contact_id == participation.contact_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Contact already participating in this event")
        
        # Create participation
        db_participation = EventParticipation(
            event_id=event_id,
            contact_id=participation.contact_id,
            participation_status=participation.participation_status,
            interest_level=participation.interest_level,
            notes=participation.notes
        )
        db.add(db_participation)
        db.commit()
        
        return {"message": "Participant added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add participant: {str(e)}")

@router.put("/{event_id}/participants/{contact_id}")
def update_participation(
    event_id: int, 
    contact_id: int, 
    participation_status: str,
    interest_level: Optional[int] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update participant status"""
    try:
        participation = db.query(EventParticipation).filter(
            EventParticipation.event_id == event_id,
            EventParticipation.contact_id == contact_id
        ).first()
        
        if not participation:
            raise HTTPException(status_code=404, detail="Participation not found")
        
        participation.participation_status = participation_status
        if interest_level is not None:
            participation.interest_level = interest_level
        if notes is not None:
            participation.notes = notes
        
        db.commit()
        
        return {"message": "Participation updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update participation: {str(e)}")

@router.delete("/{event_id}/participants/{contact_id}")
def remove_participant(event_id: int, contact_id: int, db: Session = Depends(get_db)):
    """Remove a participant from an event"""
    try:
        participation = db.query(EventParticipation).filter(
            EventParticipation.event_id == event_id,
            EventParticipation.contact_id == contact_id
        ).first()
        
        if not participation:
            raise HTTPException(status_code=404, detail="Participation not found")
        
        db.delete(participation)
        db.commit()
        
        return {"message": "Participant removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to remove participant: {str(e)}")

@router.post("/{event_id}/recommend-participants")
async def recommend_participants(
    event_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get AI-powered participant recommendations for an event"""
    try:
        # Get event details
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Create search query based on event details
        search_terms = []
        if event.event_type:
            search_terms.append(event.event_type)
        if event.description:
            search_terms.append(event.description)
        if event.location:
            search_terms.append(f"location {event.location}")
        
        search_query = " ".join(search_terms)
        
        # Get current participants to exclude them
        current_participants = db.query(EventParticipation.contact_id).filter(
            EventParticipation.event_id == event_id
        ).all()
        current_participant_ids = [p.contact_id for p in current_participants]
        
        # Use vector search to find relevant contacts
        if search_query and settings.openai_api_key:
            vector_results = vector_store.search_contacts(search_query, limit * 2)  # Get more to filter
            
            # Filter out current participants and format results
            recommendations = []
            for result in vector_results:
                if result["contact_id"] not in current_participant_ids:
                    contact = db.query(Contact).filter(Contact.id == result["contact_id"]).first()
                    if contact:
                        recommendations.append({
                            "contact": {
                                "id": contact.id,
                                "name": f"{contact.first_name} {contact.last_name or ''}".strip(),
                                "email": contact.email,
                                "phone": contact.phone,
                                "job_title": contact.job_title,
                                "company": contact.company,
                                "location": contact.location,
                                "interests": [
                                    {"category": i.interest_category, "value": i.interest_value} 
                                    for i in contact.interests
                                ]
                            },
                            "similarity_score": result["similarity_score"],
                            "match_reason": result["matched_text"]
                        })
                        
                        if len(recommendations) >= limit:
                            break
        else:
            # Fallback: get contacts with relevant interests
            recommendations = []
            if event.event_type:
                # Find contacts with interests related to event type
                relevant_contacts = db.query(Contact).join(ContactInterest).filter(
                    ContactInterest.interest_value.ilike(f"%{event.event_type}%")
                ).filter(
                    ~Contact.id.in_(current_participant_ids)
                ).limit(limit).all()
                
                for contact in relevant_contacts:
                    recommendations.append({
                        "contact": {
                            "id": contact.id,
                            "name": f"{contact.first_name} {contact.last_name or ''}".strip(),
                            "email": contact.email,
                            "phone": contact.phone,
                            "job_title": contact.job_title,
                            "company": contact.company,
                            "location": contact.location,
                            "interests": [
                                {"category": i.interest_category, "value": i.interest_value} 
                                for i in contact.interests
                            ]
                        },
                        "similarity_score": 0.7,  # Default score
                        "match_reason": f"Interest in {event.event_type}"
                    })
        
        return {
            "event_id": event_id,
            "event_name": event.name,
            "recommendations": recommendations,
            "total_recommendations": len(recommendations)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

def format_event_response(event: Event) -> dict:
    """Format event for response"""
    participants = []
    for participation in event.participations:
        contact = participation.contact
        participants.append({
            "contact_id": contact.id,
            "name": f"{contact.first_name} {contact.last_name or ''}".strip(),
            "email": contact.email,
            "participation_status": participation.participation_status,
            "interest_level": participation.interest_level,
            "notes": participation.notes
        })
    
    return {
        "id": event.id,
        "name": event.name,
        "description": event.description,
        "event_type": event.event_type,
        "location": event.location,
        "event_date": event.event_date,
        "max_participants": event.max_participants,
        "status": event.status,
        "created_at": event.created_at,
        "updated_at": event.updated_at,
        "participant_count": len(participants),
        "participants": participants
    }
