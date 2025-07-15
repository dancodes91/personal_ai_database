"""
Contact management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ....core.database import get_db
from ....models import Contact, ContactInterest, ContactSkill
from ....services.vector_store import vector_store

router = APIRouter()

# Pydantic models
class ContactInterestCreate(BaseModel):
    interest_category: str
    interest_value: str
    confidence_score: Optional[float] = None

class ContactSkillCreate(BaseModel):
    skill_name: str
    skill_level: Optional[str] = None
    years_experience: Optional[int] = None

class ContactCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    age: Optional[int] = None
    has_pets: Optional[bool] = False
    business_needs: Optional[str] = None
    personal_notes: Optional[str] = None
    interests: Optional[List[ContactInterestCreate]] = []
    skills: Optional[List[ContactSkillCreate]] = []

class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    age: Optional[int] = None
    has_pets: Optional[bool] = None
    business_needs: Optional[str] = None
    personal_notes: Optional[str] = None
    interests: Optional[List[ContactInterestCreate]] = None
    skills: Optional[List[ContactSkillCreate]] = None

class ContactResponse(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    job_title: Optional[str]
    company: Optional[str]
    location: Optional[str]
    age: Optional[int]
    has_pets: Optional[bool]
    business_needs: Optional[str]
    personal_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    interests: List[dict]
    skills: List[dict]

    class Config:
        from_attributes = True

@router.post("/", response_model=ContactResponse)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """Create a new contact"""
    try:
        # Create contact
        db_contact = Contact(
            first_name=contact.first_name,
            last_name=contact.last_name,
            email=contact.email,
            phone=contact.phone,
            job_title=contact.job_title,
            company=contact.company,
            location=contact.location,
            age=contact.age,
            has_pets=contact.has_pets,
            business_needs=contact.business_needs,
            personal_notes=contact.personal_notes
        )
        db.add(db_contact)
        db.flush()  # Get the ID
        
        # Add interests
        for interest_data in contact.interests or []:
            interest = ContactInterest(
                contact_id=db_contact.id,
                interest_category=interest_data.interest_category,
                interest_value=interest_data.interest_value,
                confidence_score=interest_data.confidence_score
            )
            db.add(interest)
        
        # Add skills
        for skill_data in contact.skills or []:
            skill = ContactSkill(
                contact_id=db_contact.id,
                skill_name=skill_data.skill_name,
                skill_level=skill_data.skill_level,
                years_experience=skill_data.years_experience
            )
            db.add(skill)
        
        db.commit()
        db.refresh(db_contact)
        
        # Add to vector store
        contact_data = {
            "first_name": db_contact.first_name,
            "last_name": db_contact.last_name,
            "job_title": db_contact.job_title,
            "company": db_contact.company,
            "location": db_contact.location,
            "business_needs": db_contact.business_needs,
            "personal_notes": db_contact.personal_notes,
            "interests": [{"interest_value": i.interest_value} for i in db_contact.interests],
            "skills": [{"skill_name": s.skill_name} for s in db_contact.skills]
        }
        vector_store.add_contact_embedding(db_contact.id, contact_data)
        
        return format_contact_response(db_contact)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create contact: {str(e)}")

@router.get("/", response_model=List[ContactResponse])
def get_contacts(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all contacts with optional search"""
    query = db.query(Contact)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Contact.first_name.ilike(search_term)) |
            (Contact.last_name.ilike(search_term)) |
            (Contact.email.ilike(search_term)) |
            (Contact.job_title.ilike(search_term)) |
            (Contact.company.ilike(search_term)) |
            (Contact.location.ilike(search_term))
        )
    
    contacts = query.offset(skip).limit(limit).all()
    return [format_contact_response(contact) for contact in contacts]

@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Get a specific contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return format_contact_response(contact)

@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, contact_update: ContactUpdate, db: Session = Depends(get_db)):
    """Update a contact"""
    try:
        contact = db.query(Contact).filter(Contact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        # Update basic fields
        update_data = contact_update.dict(exclude_unset=True, exclude={"interests", "skills"})
        for field, value in update_data.items():
            setattr(contact, field, value)
        
        # Update interests if provided
        if contact_update.interests is not None:
            # Delete existing interests
            db.query(ContactInterest).filter(ContactInterest.contact_id == contact_id).delete()
            
            # Add new interests
            for interest_data in contact_update.interests:
                interest = ContactInterest(
                    contact_id=contact_id,
                    interest_category=interest_data.interest_category,
                    interest_value=interest_data.interest_value,
                    confidence_score=interest_data.confidence_score
                )
                db.add(interest)
        
        # Update skills if provided
        if contact_update.skills is not None:
            # Delete existing skills
            db.query(ContactSkill).filter(ContactSkill.contact_id == contact_id).delete()
            
            # Add new skills
            for skill_data in contact_update.skills:
                skill = ContactSkill(
                    contact_id=contact_id,
                    skill_name=skill_data.skill_name,
                    skill_level=skill_data.skill_level,
                    years_experience=skill_data.years_experience
                )
                db.add(skill)
        
        db.commit()
        db.refresh(contact)
        
        # Update vector store
        contact_data = {
            "first_name": contact.first_name,
            "last_name": contact.last_name,
            "job_title": contact.job_title,
            "company": contact.company,
            "location": contact.location,
            "business_needs": contact.business_needs,
            "personal_notes": contact.personal_notes,
            "interests": [{"interest_value": i.interest_value} for i in contact.interests],
            "skills": [{"skill_name": s.skill_name} for s in contact.skills]
        }
        vector_store.add_contact_embedding(contact.id, contact_data)
        
        return format_contact_response(contact)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update contact: {str(e)}")

@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Delete a contact"""
    try:
        contact = db.query(Contact).filter(Contact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        # Delete from vector store
        vector_store.delete_contact_embedding(contact_id)
        
        # Delete from database (cascade will handle related records)
        db.delete(contact)
        db.commit()
        
        return {"message": "Contact deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete contact: {str(e)}")

@router.get("/{contact_id}/similar")
def get_similar_contacts(contact_id: int, limit: int = 5, db: Session = Depends(get_db)):
    """Get contacts similar to the specified contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    try:
        similar_results = vector_store.get_similar_contacts(contact_id, limit)
        return {
            "original_contact": format_contact_response(contact),
            "similar_contacts": similar_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find similar contacts: {str(e)}")

def format_contact_response(contact: Contact) -> dict:
    """Format contact for response"""
    return {
        "id": contact.id,
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": contact.email,
        "phone": contact.phone,
        "job_title": contact.job_title,
        "company": contact.company,
        "location": contact.location,
        "age": contact.age,
        "has_pets": contact.has_pets,
        "business_needs": contact.business_needs,
        "personal_notes": contact.personal_notes,
        "created_at": contact.created_at,
        "updated_at": contact.updated_at,
        "interests": [
            {
                "id": i.id,
                "interest_category": i.interest_category,
                "interest_value": i.interest_value,
                "confidence_score": i.confidence_score
            } for i in contact.interests
        ],
        "skills": [
            {
                "id": s.id,
                "skill_name": s.skill_name,
                "skill_level": s.skill_level,
                "years_experience": s.years_experience
            } for s in contact.skills
        ]
    }
