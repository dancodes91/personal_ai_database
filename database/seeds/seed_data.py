#!/usr/bin/env python3
"""
Seed data for Personal AI Database
Creates sample contacts, events, and other data for testing
"""
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine, text
from app.core.config import settings


def seed_contacts(conn):
    """Seed sample contacts"""
    contacts = [
        {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'phone': '+1-555-0123',
            'job_title': 'Software Engineer',
            'company': 'Tech Corp',
            'location': 'San Francisco, CA',
            'age': 30,
            'has_pets': False,
            'business_needs': 'Looking for AI consulting opportunities',
            'personal_notes': 'Met at tech conference. Interested in AI and machine learning.'
        },
        {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane.smith@example.com',
            'phone': '+1-555-0456',
            'job_title': 'Marketing Manager',
            'company': 'Creative Agency',
            'location': 'New York, NY',
            'age': 28,
            'has_pets': True,
            'business_needs': 'Event marketing and promotion services',
            'personal_notes': 'Great at digital marketing campaigns. Has experience with music events.'
        },
        {
            'first_name': 'Michael',
            'last_name': 'Johnson',
            'email': 'michael.j@example.com',
            'phone': '+1-555-0789',
            'job_title': 'Music Therapist',
            'company': 'Healing Arts Center',
            'location': 'Los Angeles, CA',
            'age': 35,
            'has_pets': False,
            'business_needs': 'Expanding music therapy programs',
            'personal_notes': 'Specializes in music therapy for elderly. Perfect for Sing with Me events.'
        },
        {
            'first_name': 'Sarah',
            'last_name': 'Williams',
            'email': 'sarah.w@example.com',
            'phone': '+1-555-0321',
            'job_title': 'Nurse',
            'company': 'Community Hospital',
            'location': 'Chicago, IL',
            'age': 32,
            'has_pets': True,
            'business_needs': 'Healthcare coordination for events',
            'personal_notes': 'Works with elderly patients. Very interested in community outreach.'
        },
        {
            'first_name': 'David',
            'last_name': 'Brown',
            'email': 'david.brown@example.com',
            'phone': '+1-555-0654',
            'job_title': 'Musician',
            'company': 'Freelance',
            'location': 'Nashville, TN',
            'age': 29,
            'has_pets': False,
            'business_needs': 'Performance opportunities and music lessons',
            'personal_notes': 'Professional guitarist and singer. Loves community music programs.'
        },
        {
            'first_name': 'Emily',
            'last_name': 'Davis',
            'email': 'emily.davis@example.com',
            'phone': '+1-555-0987',
            'job_title': 'Social Worker',
            'company': 'City Services',
            'location': 'Seattle, WA',
            'age': 31,
            'has_pets': True,
            'business_needs': 'Community program partnerships',
            'personal_notes': 'Coordinates community programs. Has connections with nursing homes.'
        }
    ]
    
    for contact in contacts:
        conn.execute(text("""
            INSERT INTO contacts (first_name, last_name, email, phone, job_title, company, location, age, has_pets, business_needs, personal_notes)
            VALUES (:first_name, :last_name, :email, :phone, :job_title, :company, :location, :age, :has_pets, :business_needs, :personal_notes)
        """), contact)
    
    print(f"Seeded {len(contacts)} contacts")


def seed_interests(conn):
    """Seed contact interests"""
    interests = [
        {'contact_id': 1, 'interest_category': 'Technology', 'interest_value': 'Artificial Intelligence', 'confidence_score': 0.9},
        {'contact_id': 1, 'interest_category': 'Technology', 'interest_value': 'Machine Learning', 'confidence_score': 0.8},
        {'contact_id': 1, 'interest_category': 'Hobbies', 'interest_value': 'Photography', 'confidence_score': 0.7},
        
        {'contact_id': 2, 'interest_category': 'Marketing', 'interest_value': 'Digital Marketing', 'confidence_score': 0.9},
        {'contact_id': 2, 'interest_category': 'Music', 'interest_value': 'Event Planning', 'confidence_score': 0.8},
        {'contact_id': 2, 'interest_category': 'Arts', 'interest_value': 'Creative Design', 'confidence_score': 0.7},
        
        {'contact_id': 3, 'interest_category': 'Music', 'interest_value': 'Music Therapy', 'confidence_score': 0.95},
        {'contact_id': 3, 'interest_category': 'Healthcare', 'interest_value': 'Elderly Care', 'confidence_score': 0.9},
        {'contact_id': 3, 'interest_category': 'Music', 'interest_value': 'Piano', 'confidence_score': 0.8},
        
        {'contact_id': 4, 'interest_category': 'Healthcare', 'interest_value': 'Patient Care', 'confidence_score': 0.9},
        {'contact_id': 4, 'interest_category': 'Community', 'interest_value': 'Volunteer Work', 'confidence_score': 0.8},
        {'contact_id': 4, 'interest_category': 'Healthcare', 'interest_value': 'Geriatric Care', 'confidence_score': 0.85},
        
        {'contact_id': 5, 'interest_category': 'Music', 'interest_value': 'Guitar', 'confidence_score': 0.95},
        {'contact_id': 5, 'interest_category': 'Music', 'interest_value': 'Singing', 'confidence_score': 0.9},
        {'contact_id': 5, 'interest_category': 'Community', 'interest_value': 'Music Education', 'confidence_score': 0.8},
        
        {'contact_id': 6, 'interest_category': 'Social Work', 'interest_value': 'Community Programs', 'confidence_score': 0.9},
        {'contact_id': 6, 'interest_category': 'Healthcare', 'interest_value': 'Senior Services', 'confidence_score': 0.85},
        {'contact_id': 6, 'interest_category': 'Community', 'interest_value': 'Outreach Programs', 'confidence_score': 0.8},
    ]
    
    for interest in interests:
        conn.execute(text("""
            INSERT INTO contact_interests (contact_id, interest_category, interest_value, confidence_score)
            VALUES (:contact_id, :interest_category, :interest_value, :confidence_score)
        """), interest)
    
    print(f"Seeded {len(interests)} interests")


def seed_skills(conn):
    """Seed contact skills"""
    skills = [
        {'contact_id': 1, 'skill_name': 'Python Programming', 'skill_level': 'Expert', 'years_experience': 8},
        {'contact_id': 1, 'skill_name': 'Machine Learning', 'skill_level': 'Advanced', 'years_experience': 5},
        {'contact_id': 1, 'skill_name': 'Data Analysis', 'skill_level': 'Advanced', 'years_experience': 6},
        
        {'contact_id': 2, 'skill_name': 'Digital Marketing', 'skill_level': 'Expert', 'years_experience': 7},
        {'contact_id': 2, 'skill_name': 'Content Creation', 'skill_level': 'Advanced', 'years_experience': 5},
        {'contact_id': 2, 'skill_name': 'Event Management', 'skill_level': 'Intermediate', 'years_experience': 3},
        
        {'contact_id': 3, 'skill_name': 'Music Therapy', 'skill_level': 'Expert', 'years_experience': 10},
        {'contact_id': 3, 'skill_name': 'Piano', 'skill_level': 'Advanced', 'years_experience': 15},
        {'contact_id': 3, 'skill_name': 'Group Facilitation', 'skill_level': 'Advanced', 'years_experience': 8},
        
        {'contact_id': 4, 'skill_name': 'Patient Care', 'skill_level': 'Expert', 'years_experience': 9},
        {'contact_id': 4, 'skill_name': 'Geriatric Nursing', 'skill_level': 'Advanced', 'years_experience': 6},
        {'contact_id': 4, 'skill_name': 'Care Coordination', 'skill_level': 'Advanced', 'years_experience': 5},
        
        {'contact_id': 5, 'skill_name': 'Guitar', 'skill_level': 'Expert', 'years_experience': 12},
        {'contact_id': 5, 'skill_name': 'Vocal Performance', 'skill_level': 'Advanced', 'years_experience': 10},
        {'contact_id': 5, 'skill_name': 'Music Composition', 'skill_level': 'Intermediate', 'years_experience': 5},
        
        {'contact_id': 6, 'skill_name': 'Case Management', 'skill_level': 'Expert', 'years_experience': 8},
        {'contact_id': 6, 'skill_name': 'Program Development', 'skill_level': 'Advanced', 'years_experience': 6},
        {'contact_id': 6, 'skill_name': 'Community Outreach', 'skill_level': 'Advanced', 'years_experience': 7},
    ]
    
    for skill in skills:
        conn.execute(text("""
            INSERT INTO contact_skills (contact_id, skill_name, skill_level, years_experience)
            VALUES (:contact_id, :skill_name, :skill_level, :years_experience)
        """), skill)
    
    print(f"Seeded {len(skills)} skills")


def seed_events(conn):
    """Seed sample events"""
    now = datetime.now()
    events = [
        {
            'name': 'Sing with Me - Sunset Manor',
            'description': 'Monthly music therapy session at Sunset Manor nursing home. Interactive singing and music activities for residents.',
            'event_type': 'Sing with Me',
            'location': 'Sunset Manor, 123 Oak Street, San Francisco, CA',
            'event_date': now + timedelta(days=7),
            'max_participants': 15,
            'status': 'planned'
        },
        {
            'name': 'Community Music Workshop',
            'description': 'Teaching basic music skills to community members. Focus on guitar and singing basics.',
            'event_type': 'Workshop',
            'location': 'Community Center, 456 Main Street, Los Angeles, CA',
            'event_date': now + timedelta(days=14),
            'max_participants': 20,
            'status': 'planned'
        },
        {
            'name': 'Sing with Me - Golden Years Center',
            'description': 'Weekly music session focusing on classic songs and group singing activities.',
            'event_type': 'Sing with Me',
            'location': 'Golden Years Center, 789 Elm Avenue, Chicago, IL',
            'event_date': now + timedelta(days=21),
            'max_participants': 12,
            'status': 'planned'
        },
        {
            'name': 'Music Therapy Training',
            'description': 'Training session for volunteers interested in music therapy techniques.',
            'event_type': 'Training',
            'location': 'Healing Arts Center, 321 Pine Road, Los Angeles, CA',
            'event_date': now + timedelta(days=28),
            'max_participants': 10,
            'status': 'planned'
        }
    ]
    
    for event in events:
        conn.execute(text("""
            INSERT INTO events (name, description, event_type, location, event_date, max_participants, status)
            VALUES (:name, :description, :event_type, :location, :event_date, :max_participants, :status)
        """), event)
    
    print(f"Seeded {len(events)} events")


def seed_event_participants(conn):
    """Seed event participants"""
    participants = [
        # Event 1 participants
        {'event_id': 1, 'contact_id': 3, 'participation_status': 'confirmed', 'interest_level': 9, 'notes': 'Lead music therapist'},
        {'event_id': 1, 'contact_id': 5, 'participation_status': 'confirmed', 'interest_level': 8, 'notes': 'Musician support'},
        {'event_id': 1, 'contact_id': 4, 'participation_status': 'invited', 'interest_level': 7, 'notes': 'Healthcare liaison'},
        
        # Event 2 participants
        {'event_id': 2, 'contact_id': 5, 'participation_status': 'confirmed', 'interest_level': 10, 'notes': 'Workshop instructor'},
        {'event_id': 2, 'contact_id': 2, 'participation_status': 'confirmed', 'interest_level': 8, 'notes': 'Event coordinator'},
        
        # Event 3 participants
        {'event_id': 3, 'contact_id': 3, 'participation_status': 'confirmed', 'interest_level': 9, 'notes': 'Session leader'},
        {'event_id': 3, 'contact_id': 6, 'participation_status': 'confirmed', 'interest_level': 8, 'notes': 'Community liaison'},
        
        # Event 4 participants
        {'event_id': 4, 'contact_id': 3, 'participation_status': 'confirmed', 'interest_level': 10, 'notes': 'Training instructor'},
        {'event_id': 4, 'contact_id': 4, 'participation_status': 'invited', 'interest_level': 6, 'notes': 'Healthcare perspective'},
        {'event_id': 4, 'contact_id': 6, 'participation_status': 'invited', 'interest_level': 7, 'notes': 'Community programs expert'},
    ]
    
    for participant in participants:
        conn.execute(text("""
            INSERT INTO event_participations (event_id, contact_id, participation_status, interest_level, notes)
            VALUES (:event_id, :contact_id, :participation_status, :interest_level, :notes)
        """), participant)
    
    print(f"Seeded {len(participants)} event participants")


def seed_query_history(conn):
    """Seed sample query history"""
    queries = [
        {'query_text': 'Find music therapists', 'results_count': 1, 'execution_time_ms': 45},
        {'query_text': 'Who works in healthcare?', 'results_count': 2, 'execution_time_ms': 32},
        {'query_text': 'Show me people in Los Angeles', 'results_count': 2, 'execution_time_ms': 28},
        {'query_text': 'Find musicians for community events', 'results_count': 2, 'execution_time_ms': 52},
        {'query_text': 'Who has experience with elderly care?', 'results_count': 3, 'execution_time_ms': 38},
    ]
    
    for query in queries:
        conn.execute(text("""
            INSERT INTO query_history (query_text, results_count, execution_time_ms)
            VALUES (:query_text, :results_count, :execution_time_ms)
        """), query)
    
    print(f"Seeded {len(queries)} query history entries")


def main():
    """Main seeding function"""
    try:
        engine = create_engine(settings.database_url)
        
        with engine.connect() as conn:
            print("Starting database seeding...")
            
            # Clear existing data
            tables = ['event_participations', 'query_history', 'contact_skills', 'contact_interests', 'events', 'contacts']
            for table in tables:
                conn.execute(text(f"DELETE FROM {table}"))
            
            # Seed data
            seed_contacts(conn)
            seed_interests(conn)
            seed_skills(conn)
            seed_events(conn)
            seed_event_participants(conn)
            seed_query_history(conn)
            
            conn.commit()
            print("Database seeding completed successfully!")
            
    except Exception as e:
        print(f"Error seeding database: {e}")
        raise


if __name__ == "__main__":
    main()
