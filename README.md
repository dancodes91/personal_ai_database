# Personal AI Database 🎵

A comprehensive AI-powered database system for managing contacts from "Sing with Me" sessions and community events. This system processes audio recordings to extract contact information and provides intelligent search capabilities for networking and event planning.

## 🌟 Features

### 🎯 Core Functionality
- **Contact Management**: Comprehensive contact database with interests, skills, and notes
- **Event Planning**: Create and manage "Sing with Me" events with AI participant recommendations
- **Audio Processing**: Upload audio recordings and automatically extract contact information
- **AI Search**: Natural language search across your contact database
- **Analytics**: Insights and trends from your contact network

### 🤖 AI-Powered Features
- **Audio Transcription**: OpenAI Whisper for speech-to-text conversion
- **Data Extraction**: GPT-4 extracts structured contact data from conversations
- **Semantic Search**: ChromaDB enables intelligent contact matching
- **Event Recommendations**: AI suggests participants based on interests and skills

### 💻 Modern Admin Interface
- **Professional Dashboard**: Clean, responsive admin panel
- **Rich Forms**: Dynamic contact and event creation with validation
- **Multiple Views**: Grid and list views for different use cases
- **Real-time Search**: Instant filtering and search across all data
- **Mobile Friendly**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+** for backend
- **Node.js 18+** for frontend
- **OpenAI API Key** for AI features (optional but recommended)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd personal_ai_database

# Navigate to backend and run setup script
cd backend
python setup_database.py
```

This script will:
- ✅ Create all necessary directories
- ✅ Generate SQLite database with schema
- ✅ Populate with realistic sample data
- ✅ Initialize ChromaDB for vector search
- ✅ Create configuration files

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure your OpenAI API key (optional)
# Edit .env file and add: OPENAI_API_KEY=sk-your-key-here

# Start the backend server
python main.py
```

Backend will be available at: **http://localhost:8000**
API Documentation: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## 📁 Project Structure

```
personal_ai_database/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/endpoints/     # API route handlers
│   │   ├── core/              # Configuration & database
│   │   ├── models/            # SQLAlchemy models
│   │   └── schemas/           # Pydantic schemas
│   ├── database/
│   │   ├── migrations/        # Database schema migrations
│   │   └── seeds/             # Sample data
│   ├── uploads/               # Audio file storage
│   ├── .chromadb/             # Vector database
│   ├── main.py                # Application entry point
│   └── requirements.txt       # Python dependencies
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/               # Next.js 13+ app router
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities and API client
│   │   └── types/             # TypeScript definitions
│   └── package.json           # Node.js dependencies
├── setup_database.py          # Automated setup script
└── README.md                  # This file
```

## 🎯 Usage Guide

### Contact Management
1. **View Contacts**: Navigate to `/contacts` to see all contacts
2. **Add Contact**: Click "Add Contact" to create new contacts manually
3. **Search Contacts**: Use the search bar for real-time filtering
4. **Contact Details**: Click on any contact to view full information

### Event Planning
1. **Create Events**: Go to `/events` and click "Create Event"
2. **Event Types**: Choose from "Sing with Me", Workshop, Training, etc.
3. **AI Recommendations**: Get participant suggestions based on interests
4. **Manage Participants**: Track attendance and engagement

### Audio Processing
1. **Upload Audio**: Drag & drop audio files from your "Sing with Me" sessions
2. **Auto Processing**: AI transcribes and extracts contact information
3. **Review Results**: Check extracted data before creating contacts
4. **Bulk Processing**: Handle multiple recordings efficiently

### Smart Search
1. **Natural Language**: Ask questions like "Find music therapists in LA"
2. **Semantic Search**: AI understands context and intent
3. **Filter Results**: Refine searches by location, skills, interests
4. **Save Queries**: Access frequently used searches quickly

## 🔧 Configuration

### Environment Variables

Backend configuration in `backend/.env`:

```env
# Database
DATABASE_URL=sqlite:///./personal_ai_database.db

# OpenAI API (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# ChromaDB
CHROMA_PERSIST_DIRECTORY=./.chromadb

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Database Options

**SQLite (Default)**:
- Perfect for development and small deployments
- No additional setup required
- Database file: `personal_ai_database.db`

**PostgreSQL (Production)**:
- Better for larger datasets and concurrent users
- Update `DATABASE_URL` in `.env`
- Run setup script again after configuration

## 🤖 AI Features Setup

### OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `backend/.env`: `OPENAI_API_KEY=sk-your-key-here`
3. Restart the backend server

### Features Enabled with API Key:
- **Audio Transcription**: Convert speech to text
- **Data Extraction**: Extract structured contact information
- **Semantic Search**: Intelligent contact matching
- **Event Recommendations**: AI-powered participant suggestions

## 📊 Sample Data

The system comes with realistic sample data:
- **6 Contacts**: Music therapists, nurses, musicians, social workers
- **4 Events**: "Sing with Me" sessions, workshops, training events
- **18 Interests**: Music therapy, elderly care, community programs
- **18 Skills**: Professional skills with experience levels

## 🛠️ Development

### Backend Development
```bash
cd backend

# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload

# Run tests
pytest
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Database Management
```bash
# Run migrations
python database/migrate.py

# Add sample data
python database/seeds/seed_data.py

# Reset database
python setup_database.py
```

## 🚨 Troubleshooting

### Common Issues

**Database not found**:
```bash
python setup_database.py
```

**ChromaDB directory missing**:
```bash
mkdir backend/.chromadb
```

**OpenAI API errors**:
- Check your API key in `backend/.env`
- Ensure you have credits in your OpenAI account
- Verify API key permissions

**Port conflicts**:
```bash
# Backend on different port
uvicorn main:app --port 8001

# Frontend on different port
npm run dev -- --port 3001
```

**CORS errors**:
- Check `ALLOWED_ORIGINS` in `backend/.env`
- Ensure frontend URL is included

## 📈 Production Deployment

### Backend (FastAPI)
```bash
# Install production dependencies
pip install -r requirements.txt

# Set production environment variables
export DATABASE_URL=postgresql://user:pass@host/db
export OPENAI_API_KEY=your-production-key
export DEBUG=False

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)
```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel/Netlify
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔒 Security

- Keep your `.env` file secure and never commit it
- Use strong API keys and rotate them regularly
- Enable HTTPS in production
- Consider rate limiting for API endpoints
- Regularly backup your database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check this README for common solutions
2. Review the backend README in `backend/README.md`
3. Check API documentation at `/docs`
4. Review console logs for error details

---

**🎵 Built with ❤️ for the "Sing with Me" community! 🎵**

*Connecting hearts through music and technology.*
