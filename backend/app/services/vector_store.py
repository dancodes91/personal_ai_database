"""
ChromaDB vector store service for semantic search
"""
import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional
import openai
from ..core.config import settings


class VectorStoreService:
    """Service for managing vector embeddings with ChromaDB"""
    
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=settings.chroma_persist_directory,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        self.openai_client = openai.OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI"""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")
        
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            raise Exception(f"Failed to generate embedding: {str(e)}")
    
    def add_contact_embedding(self, contact_id: int, contact_data: Dict[str, Any]):
        """Add or update contact embedding in vector store"""
        # Create searchable text from contact data
        text_parts = []
        
        if contact_data.get('first_name'):
            text_parts.append(contact_data['first_name'])
        if contact_data.get('last_name'):
            text_parts.append(contact_data['last_name'])
        if contact_data.get('job_title'):
            text_parts.append(f"Job: {contact_data['job_title']}")
        if contact_data.get('company'):
            text_parts.append(f"Company: {contact_data['company']}")
        if contact_data.get('location'):
            text_parts.append(f"Location: {contact_data['location']}")
        if contact_data.get('business_needs'):
            text_parts.append(f"Business needs: {contact_data['business_needs']}")
        if contact_data.get('personal_notes'):
            text_parts.append(f"Notes: {contact_data['personal_notes']}")
        
        # Add interests
        if contact_data.get('interests'):
            for interest in contact_data['interests']:
                if isinstance(interest, dict):
                    text_parts.append(f"Interest: {interest.get('interest_value', '')}")
                else:
                    text_parts.append(f"Interest: {interest}")
        
        # Add skills
        if contact_data.get('skills'):
            for skill in contact_data['skills']:
                if isinstance(skill, dict):
                    text_parts.append(f"Skill: {skill.get('skill_name', '')}")
                else:
                    text_parts.append(f"Skill: {skill}")
        
        searchable_text = " ".join(text_parts)
        
        if not searchable_text.strip():
            return  # Skip if no meaningful text
        
        try:
            # Generate embedding
            embedding = self.generate_embedding(searchable_text)
            
            # Store in ChromaDB
            self.collection.upsert(
                ids=[str(contact_id)],
                embeddings=[embedding],
                documents=[searchable_text],
                metadatas=[{
                    "contact_id": contact_id,
                    "name": f"{contact_data.get('first_name', '')} {contact_data.get('last_name', '')}".strip(),
                    "job_title": contact_data.get('job_title', ''),
                    "company": contact_data.get('company', ''),
                    "location": contact_data.get('location', ''),
                }]
            )
        except Exception as e:
            print(f"Error adding contact embedding: {e}")
    
    def search_contacts(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search contacts using semantic similarity"""
        if not self.openai_client:
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            if results['ids'] and results['ids'][0]:
                for i, contact_id in enumerate(results['ids'][0]):
                    formatted_results.append({
                        "contact_id": int(contact_id),
                        "similarity_score": 1 - results['distances'][0][i],  # Convert distance to similarity
                        "metadata": results['metadatas'][0][i],
                        "matched_text": results['documents'][0][i]
                    })
            
            return formatted_results
        except Exception as e:
            print(f"Error searching contacts: {e}")
            return []
    
    def delete_contact_embedding(self, contact_id: int):
        """Delete contact embedding from vector store"""
        try:
            self.collection.delete(ids=[str(contact_id)])
        except Exception as e:
            print(f"Error deleting contact embedding: {e}")
    
    def get_similar_contacts(self, contact_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Find contacts similar to a given contact"""
        try:
            # Get the contact's embedding
            result = self.collection.get(
                ids=[str(contact_id)],
                include=["embeddings", "documents"]
            )
            
            if not result['embeddings'] or not result['embeddings'][0]:
                return []
            
            contact_embedding = result['embeddings'][0]
            
            # Search for similar contacts
            results = self.collection.query(
                query_embeddings=[contact_embedding],
                n_results=limit + 1,  # +1 because it will include the contact itself
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results and exclude the original contact
            formatted_results = []
            if results['ids'] and results['ids'][0]:
                for i, similar_contact_id in enumerate(results['ids'][0]):
                    if int(similar_contact_id) != contact_id:  # Exclude self
                        formatted_results.append({
                            "contact_id": int(similar_contact_id),
                            "similarity_score": 1 - results['distances'][0][i],
                            "metadata": results['metadatas'][0][i],
                            "matched_text": results['documents'][0][i]
                        })
            
            return formatted_results[:limit]
        except Exception as e:
            print(f"Error finding similar contacts: {e}")
            return []
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store collection"""
        try:
            count = self.collection.count()
            return {
                "total_embeddings": count,
                "collection_name": settings.chroma_collection_name,
                "persist_directory": settings.chroma_persist_directory
            }
        except Exception as e:
            print(f"Error getting collection stats: {e}")
            return {"total_embeddings": 0}


# Global instance
vector_store = VectorStoreService()
