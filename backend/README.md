# Personal AI Database - Backend Setup Guide

This is the backend API for the Personal AI Database system, built with FastAPI and supporting both SQLite (development) and PostgreSQL (production).

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install required packages
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=sqlite:///./personal_ai_database.db

# OpenAI API Configuration (Required for audio processing)
OPENAI_API_KEY=your_openai_api_key_here

# ChromaDB Configuration
CHROMA_PERSIST_DIRECTORY=./.chromadb

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Initialize Database

Run the database setup script from the backend directory:

```bash
# From backend directory
python setup_database.py
```

This will:
- Create the SQLite database file
- Run all migrations to set up tables
- Populate with sample data
- Initialize ChromaDB for vector search

### 4. Start the Server

```bash
# From backend directory
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/          # API route handlers
│   │   │   ├── contacts.py
│   │   │   ├── events.py
│   │   │   ├── audio.py
│   │   │   └── query.py
│   │   └── api.py             # API router setup
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   └── database.py        # Database connection
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   └── services/              # Business logic
├── uploads/                   # Audio file storage
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
└── README.md                 # This file
```

## 🗄️ Database Setup

### SQLite (Development - Default)
- Database file: `personal_ai_database.db`
- Automatically created when you run the setup script
- No additional setup required

### PostgreSQL (Production)
To use PostgreSQL instead of SQLite:

1. Install PostgreSQL and create a database
2. Update your `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/personal_ai_database
   ```
3. Run the setup script again

### ChromaDB (Vector Search)
- Directory: `.chromadb/`
- Automatically initialized for semantic search
- Stores embeddings for AI-powered contact search

## 🔧 API Endpoints

### Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/{id}` - Get specific contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/{id}` - Get specific event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Audio Processing
- `POST /api/audio/upload` - Upload audio file
- `POST /api/audio/{id}/transcribe` - Transcribe audio
- `POST /api/audio/{id}/extract` - Extract contact data
- `GET /api/audio` - List audio recordings

### Search & Query
- `POST /api/query/search` - Natural language search
- `GET /api/query/suggestions` - Get search suggestions
- `GET /api/query/history` - Search history

## 🤖 AI Features

### Audio Processing
1. **Upload**: Audio files are stored in `uploads/` directory
2. **Transcription**: Uses OpenAI Whisper API
3. **Data Extraction**: Uses GPT-4 to extract contact information
4. **Contact Creation**: Automatically creates contacts from extracted data

### Semantic Search
- Uses ChromaDB for vector similarity search
- Embeds contact information for intelligent matching
- Supports natural language queries like "Find music therapists in LA"

## 🔑 API Keys Setup

### OpenAI API Key (Required)
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to your `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

### Features requiring OpenAI:
- Audio transcription (Whisper)
- Contact data extraction (GPT-4)
- Semantic search embeddings

## 🧪 Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

### Database Migrations
```bash
# Create new migration
python -c "from database.migrate import create_migration; create_migration('migration_name')"

# Run migrations
python database/migrate.py
```

### Adding Sample Data
```bash
# Run seed script
python database/seeds/seed_data.py
```

## 🚨 Troubleshooting

### Common Issues

**1. Database file not found**
```bash
# Run the setup script
python setup_database.py
```

**2. ChromaDB directory missing**
```bash
# The setup script will create this automatically
# Or create manually:
mkdir .chromadb
```

**3. OpenAI API errors**
- Check your API key in `.env`
- Ensure you have credits in your OpenAI account
- Verify the key has access to Whisper and GPT-4

**4. Port already in use**
```bash
# Use a different port
uvicorn main:app --port 8001
```

**5. CORS errors from frontend**
- Check `ALLOWED_ORIGINS` in `.env`
- Ensure frontend URL is included

### Logs and Debugging
- Set `DEBUG=True` in `.env` for detailed logs
- Check console output for error messages
- API documentation available at `/docs` endpoint

## 📦 Dependencies

Key packages used:
- **FastAPI**: Modern web framework
- **SQLAlchemy**: Database ORM
- **ChromaDB**: Vector database for search
- **OpenAI**: AI processing (Whisper, GPT-4)
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

## 🔒 Security Notes

- Keep your `.env` file secure and never commit it
- OpenAI API key should be kept private
- In production, use environment variables instead of `.env` file
- Consider rate limiting for API endpoints
- Use HTTPS in production

## 📈 Production Deployment

### Environment Variables
Set these in your production environment:
```bash
DATABASE_URL=postgresql://user:pass@host/db
OPENAI_API_KEY=your-production-key
CHROMA_PERSIST_DIRECTORY=/app/chromadb
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
```

### Docker Deployment
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🆘 Support

If you encounter issues:
1. Check this README for common solutions
2. Verify your `.env` configuration
3. Ensure all dependencies are installed
4. Check the API documentation at `/docs`
5. Review console logs for error details

---

**Happy coding! 🎵 Sing with Me! 🎵**
