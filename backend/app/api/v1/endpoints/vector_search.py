"""
Vector search endpoints using ChromaDB
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from ....core.database import get_db
from ....services.vector_store import vector_store
from ....models import Contact

router = APIRouter()


class VectorSearchRequest(BaseModel):
    query: str
    limit: int = 10


class VectorSearchResponse(BaseModel):
    query: str
    results: List[Dict[str, Any]]
    total_results: int


@router.post("/semantic", response_model=VectorSearchResponse)
async def semantic_search(
    search_request: VectorSearchRequest,
    db: Session = Depends(get_db)
):
    """Perform semantic search using ChromaDB"""
    try:
        # Search using vector store
        vector_results = vector_store.search_contacts(
            search_request.query, 
            search_request.limit
        )
        
        # Get full contact details from database
        contact_ids = [result["contact_id"] for result in vector_results]
        contacts = db.query(Contact).filter(Contact.id.in_(contact_ids)).all()
        
        # Create contact lookup
        contact_lookup = {contact.id: contact for contact in contacts}
        
        # Format results with full contact data
        formatted_results = []
        for vector_result in vector_results:
            contact_id = vector_result["contact_id"]
            if contact_id in contact_lookup:
                contact = contact_lookup[contact_id]
                formatted_results.append({
                    "contact": {
                        "id": contact.id,
                        "name": f"{contact.first_name} {contact.last_name or ''}".strip(),
                        "email": contact.email,
                        "phone": contact.phone,
                        "job_title": contact.job_title,
                        "company": contact.company,
                        "location": contact.location,
                        "has_pets": contact.has_pets,
                        "business_needs": contact.business_needs,
                    },
                    "similarity_score": vector_result["similarity_score"],
                    "matched_text": vector_result["matched_text"]
                })
        
        return VectorSearchResponse(
            query=search_request.query,
            results=formatted_results,
            total_results=len(formatted_results)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/similar/{contact_id}")
async def find_similar_contacts(
    contact_id: int,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Find contacts similar to a given contact"""
    try:
        # Check if contact exists
        contact = db.query(Contact).filter(Contact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        # Find similar contacts
        similar_results = vector_store.get_similar_contacts(contact_id, limit)
        
        # Get full contact details
        similar_contact_ids = [result["contact_id"] for result in similar_results]
        similar_contacts = db.query(Contact).filter(Contact.id.in_(similar_contact_ids)).all()
        
        # Create lookup
        contact_lookup = {contact.id: contact for contact in similar_contacts}
        
        # Format results
        formatted_results = []
        for result in similar_results:
            contact_id = result["contact_id"]
            if contact_id in contact_lookup:
                similar_contact = contact_lookup[contact_id]
                formatted_results.append({
                    "contact": {
                        "id": similar_contact.id,
                        "name": f"{similar_contact.first_name} {similar_contact.last_name or ''}".strip(),
                        "email": similar_contact.email,
                        "phone": similar_contact.phone,
                        "job_title": similar_contact.job_title,
                        "company": similar_contact.company,
                        "location": similar_contact.location,
                    },
                    "similarity_score": result["similarity_score"],
                    "matched_text": result["matched_text"]
                })
        
        return {
            "original_contact": {
                "id": contact.id,
                "name": f"{contact.first_name} {contact.last_name or ''}".strip(),
            },
            "similar_contacts": formatted_results,
            "total_results": len(formatted_results)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find similar contacts: {str(e)}")


@router.get("/stats")
async def get_vector_store_stats():
    """Get vector store statistics"""
    try:
        stats = vector_store.get_collection_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
