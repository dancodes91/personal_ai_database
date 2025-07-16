#!/usr/bin/env python3
"""
Database migration runner for Personal AI Database
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.core.config import settings
from sqlalchemy import create_engine
import importlib.util


def run_migration(migration_file: str, action: str = "upgrade"):
    """Run a specific migration file"""
    migration_path = Path(__file__).parent / "migrations" / migration_file
    
    if not migration_path.exists():
        print(f"Migration file {migration_file} not found!")
        return False
    
    # Load the migration module
    spec = importlib.util.spec_from_file_location("migration", migration_path)
    migration_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration_module)
    
    try:
        if action == "upgrade":
            migration_module.upgrade()
        elif action == "downgrade":
            migration_module.downgrade()
        else:
            print(f"Unknown action: {action}")
            return False
        
        print(f"Migration {migration_file} {action} completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error running migration {migration_file}: {e}")
        return False


def create_database():
    """Create the database file if it doesn't exist"""
    if settings.database_url.startswith("sqlite"):
        # Extract database path from URL
        db_path = settings.database_url.replace("sqlite:///", "")
        db_dir = Path(db_path).parent
        
        # Create directory if it doesn't exist
        db_dir.mkdir(parents=True, exist_ok=True)
        
        # Create database file if it doesn't exist
        if not Path(db_path).exists():
            engine = create_engine(settings.database_url)
            engine.connect().close()
            print(f"Created database file: {db_path}")
        else:
            print(f"Database file already exists: {db_path}")


def main():
    """Main migration runner"""
    if len(sys.argv) < 2:
        print("Usage: python migrate.py <command> [migration_file]")
        print("Commands:")
        print("  init     - Create database and run initial migration")
        print("  upgrade  - Run upgrade migration")
        print("  downgrade - Run downgrade migration")
        print("  reset    - Drop all tables and recreate")
        return
    
    command = sys.argv[1]
    
    if command == "init":
        print("Initializing database...")
        create_database()
        run_migration("001_initial_schema.py", "upgrade")
        
    elif command == "upgrade":
        migration_file = sys.argv[2] if len(sys.argv) > 2 else "001_initial_schema.py"
        run_migration(migration_file, "upgrade")
        
    elif command == "downgrade":
        migration_file = sys.argv[2] if len(sys.argv) > 2 else "001_initial_schema.py"
        run_migration(migration_file, "downgrade")
        
    elif command == "reset":
        print("Resetting database...")
        run_migration("001_initial_schema.py", "downgrade")
        run_migration("001_initial_schema.py", "upgrade")
        
    else:
        print(f"Unknown command: {command}")


if __name__ == "__main__":
    main()
