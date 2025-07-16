#!/usr/bin/env python3
"""
Utility script to index all existing contacts in the vector store
"""
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models import Contact
from app.services.vector_store import vector_store

def index_all_contacts():
    """Index all existing contacts in the vector store"""
    db = SessionLocal()
    
    try:
        # Get all contacts
        contacts = db.query(Contact).all()
        print(f"Found {len(contacts)} contacts to index")
        
        indexed_count = 0
        failed_count = 0
        
        for contact in contacts:
            try:
                # Prepare contact data for indexing
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
                
                # Add to vector store
                vector_store.add_contact_embedding(contact.id, contact_data)
                indexed_count += 1
                print(f"Indexed contact {contact.id}: {contact.first_name} {contact.last_name or ''}")
                
            except Exception as e:
                failed_count += 1
                print(f"Failed to index contact {contact.id}: {e}")
        
        print(f"\nIndexing complete:")
        print(f"Successfully indexed: {indexed_count}")
        print(f"Failed: {failed_count}")
        
        # Get final stats
        stats = vector_store.get_collection_stats()
        print(f"Vector store now contains {stats['total_embeddings']} embeddings")
        
    except Exception as e:
        print(f"Error during indexing: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting contact indexing...")
    index_all_contacts()
    print("Done!")
