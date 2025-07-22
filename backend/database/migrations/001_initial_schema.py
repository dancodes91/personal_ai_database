"""
Initial database schema migration
Creates all the core tables for the Personal AI Database
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine, text
from app.core.config import settings


def upgrade():
    """Create initial database schema"""
    try:
        engine = create_engine(settings.database_url)
        
        with engine.connect() as conn:
            # Create contacts table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100),
                    email VARCHAR(255),
                    phone VARCHAR(20),
                    job_title VARCHAR(200),
                    company VARCHAR(200),
                    location VARCHAR(200),
                    age INTEGER,
                    has_pets BOOLEAN DEFAULT FALSE,
                    business_needs TEXT,
                    personal_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create audio_recordings table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS audio_recordings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contact_id INTEGER,
                    file_path VARCHAR(500) NOT NULL,
                    file_name VARCHAR(255) NOT NULL,
                    duration_seconds INTEGER,
                    transcription TEXT,
                    processed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (contact_id) REFERENCES contacts (id)
                )
            """))
            
            # Create contact_interests table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS contact_interests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contact_id INTEGER NOT NULL,
                    interest_category VARCHAR(100),
                    interest_value VARCHAR(200),
                    confidence_score REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (contact_id) REFERENCES contacts (id)
                )
            """))
            
            # Create contact_skills table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS contact_skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contact_id INTEGER NOT NULL,
                    skill_name VARCHAR(200),
                    skill_level VARCHAR(50),
                    years_experience INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (contact_id) REFERENCES contacts (id)
                )
            """))
            
            # Create events table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    event_type VARCHAR(100),
                    location VARCHAR(200),
                    event_date TIMESTAMP,
                    max_participants INTEGER,
                    status VARCHAR(50) DEFAULT 'planned',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create event_participations table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS event_participations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id INTEGER NOT NULL,
                    contact_id INTEGER NOT NULL,
                    participation_status VARCHAR(50) DEFAULT 'invited',
                    interest_level INTEGER,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (event_id) REFERENCES events (id),
                    FOREIGN KEY (contact_id) REFERENCES contacts (id)
                )
            """))
            
            # Create query_history table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS query_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    query_text TEXT NOT NULL,
                    results_count INTEGER,
                    execution_time_ms INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create indexes for better performance
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(first_name, last_name)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_contacts_location ON contacts(location)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_contacts_job_title ON contacts(job_title)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_audio_contact ON audio_recordings(contact_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_interests_contact ON contact_interests(contact_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_skills_contact ON contact_skills(contact_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_participations_event ON event_participations(event_id)"))
            
            conn.commit()
            
        print("Database schema created successfully!")
            
    except Exception as e:
        print(f"Error creating database schema: {e}")
        raise


def downgrade():
    """Drop all tables"""
    try:
        engine = create_engine(settings.database_url)
        
        with engine.connect() as conn:
            tables = [
                'event_participations',
                'events', 
                'query_history',
                'contact_skills',
                'contact_interests',
                'audio_recordings',
                'contacts'
            ]
            
            for table in tables:
                conn.execute(text(f"DROP TABLE IF EXISTS {table}"))
            
            conn.commit()
            
        print("Database schema dropped successfully!")
            
    except Exception as e:
        print(f"Error dropping database schema: {e}")
        raise


if __name__ == "__main__":
    upgrade()
