#!/usr/bin/env python3
"""
Database setup script for Personal AI Database
Initializes the database and seeds it with sample data
Run from backend directory: python setup_database.py
"""
import sys
import os
from pathlib import Path
import subprocess

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))


def create_directories():
    """Create necessary directories"""
    directories = [
        Path("./uploads"),              # backend/uploads
        Path("./.chromadb"),            # backend/.chromadb
        Path("../database"),            # database (from backend)
        Path("../database/migrations"), # database/migrations
        Path("../database/seeds")       # database/seeds
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {directory.resolve()}")


def initialize_database():
    """Initialize the database with schema and seed data"""
    print("Initializing database...")
    
    # Run migration from project root
    result = subprocess.run([
        sys.executable, "../database/migrate.py", "init"
    ], capture_output=True, text=True, cwd=Path(__file__).parent)
    
    if result.returncode != 0:
        print(f"Migration failed: {result.stderr}")
        return False
    
    print("✓ Database schema created successfully!")
    
    # Run seeding from project root
    result = subprocess.run([
        sys.executable, "../database/seeds/seed_data.py"
    ], capture_output=True, text=True, cwd=Path(__file__).parent)
    
    if result.returncode != 0:
        print(f"Seeding failed: {result.stderr}")
        return False
    
    print("✓ Database seeded successfully!")
    return True


def create_env_file():
    """Create .env file if it doesn't exist"""
    env_path = Path(".env")  # Current directory (backend)
    
    if not env_path.exists():
        env_content = """# Database Configuration
DATABASE_URL=sqlite:///./personal_ai_database.db

# OpenAI API Configuration (Required for audio processing)
OPENAI_API_KEY=your_openai_api_key_here

# ChromaDB Configuration
CHROMA_PERSIST_DIRECTORY=./.chromadb
ANONYMIZED_TELEMETRY=False

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"""
        
        with open(env_path, 'w') as f:
            f.write(env_content)
        
        print(f"✓ Created .env file: {env_path.resolve()}")
        print("⚠️  Please edit the .env file and add your OpenAI API key!")
    else:
        print(f"✓ .env file already exists: {env_path.resolve()}")


def check_database_file():
    """Check if database file exists and create if needed"""
    db_path = Path("./personal_ai_database.db")
    if db_path.exists():
        print(f"✓ Database file exists: {db_path.resolve()}")
    else:
        print(f"✓ Database file will be created: {db_path.resolve()}")


def main():
    """Main setup function"""
    print("🚀 Setting up Personal AI Database from backend directory...")
    print("=" * 60)
    
    try:
        # Create directories
        print("\n1. Creating directories...")
        create_directories()
        
        # Create .env file
        print("\n2. Creating configuration...")
        create_env_file()
        
        # Check database file
        print("\n3. Checking database...")
        check_database_file()
        
        # Initialize database
        print("\n4. Initializing database...")
        if initialize_database():
            print("\n" + "=" * 60)
            print("✅ Database setup completed successfully!")
            print("\nFiles created:")
            print(f"  📁 Database: {Path('./personal_ai_database.db').resolve()}")
            print(f"  📁 ChromaDB: {Path('./.chromadb').resolve()}")
            print(f"  📁 Uploads: {Path('./uploads').resolve()}")
            print(f"  📄 Config: {Path('./.env').resolve()}")
            
            print("\nNext steps:")
            print("1. Edit .env file and add your OpenAI API key")
            print("2. Install dependencies: pip install -r requirements.txt")
            print("3. Start backend server: python main.py")
            print("4. In another terminal, start frontend:")
            print("   cd ../frontend && npm install && npm run dev")
            
            print("\nYour Personal AI Database will be available at:")
            print("- Backend API: http://localhost:8000")
            print("- API Docs: http://localhost:8000/docs")
            print("- Frontend: http://localhost:3000")
            
            print("\n🎵 Ready to Sing with Me! 🎵")
        else:
            print("\n❌ Database setup failed!")
            return 1
            
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
