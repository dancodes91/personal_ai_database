"""
Query and search endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import openai
import json

from ....core.database import get_db
from ....core.config import settings
from ....models import Contact, ContactInterest, ContactSkill, QueryHistory
from ....services.vector_store import vector_store

router = APIRouter()

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    limit: Optional[int] = 10
    use_vector_search: Optional[bool] = True

class QueryResponse(BaseModel):
    query: str
    results: List[Dict[Any, Any]]
    results_count: int
    execution_time_ms: int
    search_method: str
    explanation: Optional[str] = None

class QueryHistoryResponse(BaseModel):
    id: int
    query_text: str
    results_count: int
    execution_time_ms: int
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=QueryResponse)
async def natural_language_query(
    query_request: QueryRequest,
    db: Session = Depends(get_db)
):
    """Process natural language queries about contacts"""
    
    start_time = datetime.now()
    search_method = "database"
    explanation = None
    
    try:
        # Try vector search first if enabled and OpenAI is configured
        if query_request.use_vector_search and settings.openai_api_key:
            try:
                vector_results = vector_store.search_contacts(
                    query_request.query, 
                    query_request.limit
                )
                
                if vector_results:
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
                                "contact": format_contact_for_response(contact),
                                "similarity_score": vector_result["similarity_score"],
                                "match_reason": vector_result["matched_text"]
                            })
                    
                    search_method = "vector_search"
                    explanation = f"Semantic search found {len(formatted_results)} relevant contacts"
                    
                    # Calculate execution time
                    execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
                    
                    # Save to query history
                    save_query_history(db, query_request.query, len(formatted_results), execution_time)
                    
                    return QueryResponse(
                        query=query_request.query,
                        results=formatted_results,
                        results_count=len(formatted_results),
                        execution_time_ms=execution_time,
                        search_method=search_method,
                        explanation=explanation
                    )
            except Exception as e:
                print(f"Vector search failed, falling back to database search: {e}")
        
        # Fallback to database search with AI parsing
        parsed_query = await parse_natural_language_query(query_request.query)
        results = execute_parsed_query(db, parsed_query, query_request.limit)
        
        # Calculate execution time
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Save to query history
        save_query_history(db, query_request.query, len(results), execution_time)
        
        # Format results for response
        formatted_results = []
        for contact in results:
            formatted_results.append({
                "contact": format_contact_for_response(contact),
                "similarity_score": 0.8,  # Default score for database search
                "match_reason": "Database query match"
            })
        
        return QueryResponse(
            query=query_request.query,
            results=formatted_results,
            results_count=len(results),
            execution_time_ms=execution_time,
            search_method=search_method,
            explanation=parsed_query.get("explanation", "Database search completed")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

async def parse_natural_language_query(query: str) -> dict:
    """Parse natural language query using OpenAI to understand intent"""
    
    # Check if OpenAI API key is available
    if not settings.openai_api_key:
        # Fallback to simple keyword search
        return {
            "type": "search",
            "filters": {
                "keyword": query
            },
            "explanation": f"Simple keyword search for: {query}"
        }
    
    try:
        client = openai.OpenAI(api_key=settings.openai_api_key)
        
        parsing_prompt = f"""
        Parse this natural language query about contacts and return a JSON object with search criteria:

        Query: "{query}"

        Return a JSON object with these possible fields:
        - "type": "search" (always this for now)
        - "filters": object with possible fields:
          - "keyword": string (general keyword search across all fields)
          - "name": string (partial match for first_name or last_name)
          - "email": string (partial match)
          - "job_title": string (partial match)
          - "company": string (partial match)
          - "location": string (partial match)
          - "age_min": integer
          - "age_max": integer
          - "has_pets": boolean
          - "interests": array of strings (interest values to match)
          - "skills": array of strings (skill names to match)
          - "business_needs": string (partial match)
        - "explanation": string (brief explanation of what the query is looking for)

        Examples:
        - "Find people in marketing" -> {{"type": "search", "filters": {{"job_title": "marketing"}}, "explanation": "Looking for contacts with marketing in their job title"}}
        - "Who has pets in New York?" -> {{"type": "search", "filters": {{"has_pets": true, "location": "New York"}}, "explanation": "Looking for contacts who have pets and are located in New York"}}
        - "Show me musicians" -> {{"type": "search", "filters": {{"interests": ["music"], "skills": ["music"]}}, "explanation": "Looking for contacts interested in music or with music skills"}}
        - "Find John" -> {{"type": "search", "filters": {{"name": "John"}}, "explanation": "Looking for contacts named John"}}

        Return only valid JSON without any additional text or formatting.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert at parsing natural language queries into structured search criteria. Always return valid JSON."},
                {"role": "user", "content": parsing_prompt}
            ],
            temperature=0.1
        )
        
        result = response.choices[0].message.content.strip()
        
        # Clean up the response
        if result.startswith('```json'):
            result = result[7:]
        if result.endswith('```'):
            result = result[:-3]
        
        return json.loads(result)
        
    except Exception as e:
        # Fallback to simple keyword search
        return {
            "type": "search",
            "filters": {
                "keyword": query
            },
            "explanation": f"Simple keyword search for: {query}"
        }

def execute_parsed_query(db: Session, parsed_query: dict, limit: int = 10) -> List[Contact]:
    """Execute the parsed query against the database"""
    
    query = db.query(Contact)
    filters = parsed_query.get("filters", {})
    
    # Apply filters
    conditions = []
    
    # General keyword search
    if "keyword" in filters:
        keyword_term = f"%{filters['keyword']}%"
        conditions.append(
            or_(
                Contact.first_name.ilike(keyword_term),
                Contact.last_name.ilike(keyword_term),
                Contact.email.ilike(keyword_term),
                Contact.job_title.ilike(keyword_term),
                Contact.company.ilike(keyword_term),
                Contact.location.ilike(keyword_term),
                Contact.business_needs.ilike(keyword_term),
                Contact.personal_notes.ilike(keyword_term)
            )
        )
    
    # Name filter
    if "name" in filters:
        name_term = f"%{filters['name']}%"
        conditions.append(
            or_(
                Contact.first_name.ilike(name_term),
                Contact.last_name.ilike(name_term)
            )
        )
    
    # Email filter
    if "email" in filters:
        email_term = f"%{filters['email']}%"
        conditions.append(Contact.email.ilike(email_term))
    
    # Job title filter
    if "job_title" in filters:
        job_term = f"%{filters['job_title']}%"
        conditions.append(Contact.job_title.ilike(job_term))
    
    # Company filter
    if "company" in filters:
        company_term = f"%{filters['company']}%"
        conditions.append(Contact.company.ilike(company_term))
    
    # Location filter
    if "location" in filters:
        location_term = f"%{filters['location']}%"
        conditions.append(Contact.location.ilike(location_term))
    
    # Age filters
    if "age_min" in filters:
        conditions.append(Contact.age >= filters["age_min"])
    if "age_max" in filters:
        conditions.append(Contact.age <= filters["age_max"])
    
    # Pets filter
    if "has_pets" in filters:
        conditions.append(Contact.has_pets == filters["has_pets"])
    
    # Business needs filter
    if "business_needs" in filters:
        business_term = f"%{filters['business_needs']}%"
        conditions.append(Contact.business_needs.ilike(business_term))
    
    # Apply all conditions
    if conditions:
        query = query.filter(and_(*conditions))
    
    # Handle interests filter
    if "interests" in filters and filters["interests"]:
        interest_conditions = []
        for interest in filters["interests"]:
            interest_term = f"%{interest}%"
            interest_conditions.append(
                Contact.interests.any(
                    or_(
                        ContactInterest.interest_category.ilike(interest_term),
                        ContactInterest.interest_value.ilike(interest_term)
                    )
                )
            )
        if interest_conditions:
            query = query.filter(or_(*interest_conditions))
    
    # Handle skills filter
    if "skills" in filters and filters["skills"]:
        skill_conditions = []
        for skill in filters["skills"]:
            skill_term = f"%{skill}%"
            skill_conditions.append(
                Contact.skills.any(ContactSkill.skill_name.ilike(skill_term))
            )
        if skill_conditions:
            query = query.filter(or_(*skill_conditions))
    
    # Execute query with limit
    return query.limit(limit).all()

@router.get("/history", response_model=List[QueryHistoryResponse])
async def get_query_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get query history"""
    history = db.query(QueryHistory)\
        .order_by(QueryHistory.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return history

@router.get("/suggestions")
async def get_query_suggestions(db: Session = Depends(get_db)):
    """Get query suggestions based on available data"""
    
    # Get some statistics to generate suggestions
    total_contacts = db.query(Contact).count()
    
    # Top locations
    top_locations = db.query(Contact.location, func.count(Contact.id).label('count'))\
        .filter(Contact.location.isnot(None))\
        .group_by(Contact.location)\
        .order_by(func.count(Contact.id).desc())\
        .limit(3).all()
    
    # Top companies
    top_companies = db.query(Contact.company, func.count(Contact.id).label('count'))\
        .filter(Contact.company.isnot(None))\
        .group_by(Contact.company)\
        .order_by(func.count(Contact.id).desc())\
        .limit(3).all()
    
    # Top job titles
    top_jobs = db.query(Contact.job_title, func.count(Contact.id).label('count'))\
        .filter(Contact.job_title.isnot(None))\
        .group_by(Contact.job_title)\
        .order_by(func.count(Contact.id).desc())\
        .limit(3).all()
    
    suggestions = [
        "Show me all contacts",
        "Who has pets?",
        "Find people interested in music",
        "Show me contacts with business needs",
        "Find musicians and artists",
        "Who works in technology?",
        "Show me people in healthcare",
    ]
    
    # Add location-based suggestions
    for location, count in top_locations:
        suggestions.append(f"Find people in {location}")
    
    # Add company-based suggestions
    for company, count in top_companies:
        suggestions.append(f"Show me people from {company}")
    
    # Add job-based suggestions
    for job, count in top_jobs:
        suggestions.append(f"Find {job}s")
    
    return {
        "suggestions": suggestions[:12],  # Limit to 12 suggestions
        "total_contacts": total_contacts,
        "stats": {
            "top_locations": [{"location": loc, "count": count} for loc, count in top_locations],
            "top_companies": [{"company": comp, "count": count} for comp, count in top_companies],
            "top_jobs": [{"job_title": job, "count": count} for job, count in top_jobs]
        }
    }

def save_query_history(db: Session, query_text: str, results_count: int, execution_time_ms: int):
    """Save query to history"""
    try:
        query_history = QueryHistory(
            query_text=query_text,
            results_count=results_count,
            execution_time_ms=execution_time_ms
        )
        db.add(query_history)
        db.commit()
    except Exception as e:
        print(f"Failed to save query history: {e}")

def format_contact_for_response(contact: Contact) -> dict:
    """Format contact for query response"""
    return {
        "id": contact.id,
        "name": f"{contact.first_name} {contact.last_name or ''}".strip(),
        "email": contact.email,
        "phone": contact.phone,
        "job_title": contact.job_title,
        "company": contact.company,
        "location": contact.location,
        "age": contact.age,
        "has_pets": contact.has_pets,
        "business_needs": contact.business_needs,
        "interests": [
            {"category": i.interest_category, "value": i.interest_value} 
            for i in contact.interests
        ],
        "skills": [
            {"name": s.skill_name, "level": s.skill_level, "years": s.years_experience} 
            for s in contact.skills
        ]
    }
