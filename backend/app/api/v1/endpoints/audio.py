"""
Audio processing endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import os
import aiofiles
import openai
from datetime import datetime

from ....core.database import get_db
from ....core.config import settings
from ....models import AudioRecording, Contact, ContactInterest, ContactSkill
from ....services.vector_store import vector_store

router = APIRouter()

# Pydantic models
class AudioProcessingResponse(BaseModel):
    id: int
    file_name: str
    transcription: Optional[str]
    extracted_data: Optional[dict]
    contact_id: Optional[int]
    processed_at: Optional[datetime]

class TranscriptionRequest(BaseModel):
    audio_id: int

@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    contact_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload audio file"""
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.mp3', '.wav', '.m4a', '.flac')):
            raise HTTPException(status_code=400, detail="Unsupported audio format")
        
        # Create upload directory if it doesn't exist
        os.makedirs(settings.upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.upload_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create database record
        audio_record = AudioRecording(
            contact_id=contact_id,
            file_path=file_path,
            file_name=file.filename,
            duration_seconds=None  # Could be calculated if needed
        )
        db.add(audio_record)
        db.commit()
        db.refresh(audio_record)
        
        return {
            "id": audio_record.id,
            "file_name": audio_record.file_name,
            "file_path": audio_record.file_path,
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/transcribe/{audio_id}")
async def transcribe_audio(audio_id: int, db: Session = Depends(get_db)):
    """Transcribe audio file using OpenAI Whisper"""
    try:
        # Get audio record
        audio_record = db.query(AudioRecording).filter(AudioRecording.id == audio_id).first()
        if not audio_record:
            raise HTTPException(status_code=404, detail="Audio record not found")
        
        if not settings.openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Check if file exists
        if not os.path.exists(audio_record.file_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        # Transcribe using OpenAI Whisper
        client = openai.OpenAI(api_key=settings.openai_api_key)
        
        with open(audio_record.file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        
        # Update database record
        audio_record.transcription = transcript.text
        audio_record.processed_at = datetime.now()
        db.commit()
        
        return {
            "id": audio_record.id,
            "transcription": transcript.text,
            "message": "Transcription completed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@router.post("/extract/{audio_id}")
async def extract_contact_data(audio_id: int, db: Session = Depends(get_db)):
    """Extract contact information from transcribed audio"""
    try:
        # Get audio record
        audio_record = db.query(AudioRecording).filter(AudioRecording.id == audio_id).first()
        if not audio_record:
            raise HTTPException(status_code=404, detail="Audio record not found")
        
        if not audio_record.transcription:
            raise HTTPException(status_code=400, detail="Audio must be transcribed first")
        
        if not settings.openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Extract structured data using GPT
        client = openai.OpenAI(api_key=settings.openai_api_key)
        
        extraction_prompt = f"""
        Extract contact information from this conversation transcript and return it as JSON:

        Transcript: "{audio_record.transcription}"

        Extract the following information if available:
        - first_name: string
        - last_name: string
        - email: string
        - phone: string
        - job_title: string
        - company: string
        - location: string (city, state/country)
        - age: integer
        - has_pets: boolean
        - business_needs: string (what they need help with)
        - personal_notes: string (interesting personal details)
        - interests: array of objects with "interest_category" and "interest_value"
        - skills: array of objects with "skill_name", "skill_level", and "years_experience"

        Return only valid JSON without any additional text or formatting.
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert at extracting structured contact information from conversations. Always return valid JSON."},
                {"role": "user", "content": extraction_prompt}
            ],
            temperature=0.1
        )
        
        # Parse extracted data
        import json
        try:
            extracted_data = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            # Fallback: try to clean the response
            content = response.choices[0].message.content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            extracted_data = json.loads(content)
        
        # Create or update contact if we have enough information
        contact = None
        if extracted_data.get('first_name'):
            # Check if contact already linked to this audio
            if audio_record.contact_id:
                contact = db.query(Contact).filter(Contact.id == audio_record.contact_id).first()
            
            if not contact:
                # Create new contact
                contact = Contact(
                    first_name=extracted_data.get('first_name', ''),
                    last_name=extracted_data.get('last_name'),
                    email=extracted_data.get('email'),
                    phone=extracted_data.get('phone'),
                    job_title=extracted_data.get('job_title'),
                    company=extracted_data.get('company'),
                    location=extracted_data.get('location'),
                    age=extracted_data.get('age'),
                    has_pets=extracted_data.get('has_pets', False),
                    business_needs=extracted_data.get('business_needs'),
                    personal_notes=extracted_data.get('personal_notes')
                )
                db.add(contact)
                db.flush()
                
                # Add interests
                for interest_data in extracted_data.get('interests', []):
                    if interest_data.get('interest_value'):
                        interest = ContactInterest(
                            contact_id=contact.id,
                            interest_category=interest_data.get('interest_category', 'General'),
                            interest_value=interest_data['interest_value'],
                            confidence_score=0.8  # AI extracted
                        )
                        db.add(interest)
                
                # Add skills
                for skill_data in extracted_data.get('skills', []):
                    if skill_data.get('skill_name'):
                        skill = ContactSkill(
                            contact_id=contact.id,
                            skill_name=skill_data['skill_name'],
                            skill_level=skill_data.get('skill_level'),
                            years_experience=skill_data.get('years_experience')
                        )
                        db.add(skill)
                
                # Link audio to contact
                audio_record.contact_id = contact.id
                
                db.commit()
                db.refresh(contact)
                
                # Add to vector store
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
        
        return {
            "id": audio_record.id,
            "extracted_data": extracted_data,
            "contact_id": contact.id if contact else None,
            "message": "Data extraction completed successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Data extraction failed: {str(e)}")

@router.get("/", response_model=List[dict])
def get_audio_recordings(
    skip: int = 0,
    limit: int = 100,
    contact_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get audio recordings"""
    query = db.query(AudioRecording)
    
    if contact_id:
        query = query.filter(AudioRecording.contact_id == contact_id)
    
    recordings = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": r.id,
            "file_name": r.file_name,
            "contact_id": r.contact_id,
            "duration_seconds": r.duration_seconds,
            "has_transcription": bool(r.transcription),
            "processed_at": r.processed_at,
            "created_at": r.created_at
        } for r in recordings
    ]

@router.get("/{audio_id}")
def get_audio_recording(audio_id: int, db: Session = Depends(get_db)):
    """Get specific audio recording"""
    recording = db.query(AudioRecording).filter(AudioRecording.id == audio_id).first()
    if not recording:
        raise HTTPException(status_code=404, detail="Audio recording not found")
    
    return {
        "id": recording.id,
        "file_name": recording.file_name,
        "file_path": recording.file_path,
        "contact_id": recording.contact_id,
        "duration_seconds": recording.duration_seconds,
        "transcription": recording.transcription,
        "processed_at": recording.processed_at,
        "created_at": recording.created_at
    }

@router.delete("/{audio_id}")
def delete_audio_recording(audio_id: int, db: Session = Depends(get_db)):
    """Delete audio recording"""
    try:
        recording = db.query(AudioRecording).filter(AudioRecording.id == audio_id).first()
        if not recording:
            raise HTTPException(status_code=404, detail="Audio recording not found")
        
        # Delete file if it exists
        if os.path.exists(recording.file_path):
            os.remove(recording.file_path)
        
        # Delete database record
        db.delete(recording)
        db.commit()
        
        return {"message": "Audio recording deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete recording: {str(e)}")
