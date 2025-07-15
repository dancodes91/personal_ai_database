# Personal AI Database

A comprehensive AI-powered database system for managing contacts, processing audio recordings, and organizing events. This system helps you catalog and organize information about individuals you've met, including their skills, experiences, and contact details.

## Features

### Core Functionality
- **Contact Management**: Store and organize contact information with skills, interests, and personal notes
- **Audio Processing**: Upload audio recordings and automatically extract contact information using AI
- **Natural Language Queries**: Search your contacts using natural language questions
- **Event Planning**: Create events and get AI-powered participant recommendations
- **Dashboard Analytics**: View statistics and insights about your contact network

### AI-Powered Features
- **Speech-to-Text**: Automatic transcription of audio recordings using OpenAI Whisper
- **Information Extraction**: Extract structured contact data from conversations using GPT
- **Smart Queries**: Natural language search with intelligent result ranking
- **Event Recommendations**: AI-suggested participants based on interests and criteria

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: Database ORM
- **SQLite/PostgreSQL**: Database storage
- **OpenAI API**: AI processing (GPT-4, Whisper)
- **Pydantic**: Data validation

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Material-UI**: Professional UI components
- **Axios**: HTTP client for API calls

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- OpenAI API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal_ai_database
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up environment variables in .env**
   ```
   DATABASE_URL=sqlite:///./personal_ai_database.db
   SECRET_KEY=your-secret-key-here
   OPENAI_API_KEY=your-openai-api-key
   ```

6. **Run the backend server**
   ```bash
   cd backend
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## Usage Guide

### 1. Contact Management
- **Add Contacts**: Manually create contact entries with personal information
- **Edit/Update**: Modify contact details, add interests and skills
- **Search**: Find contacts using the search functionality

### 2. Audio Processing
- **Upload Audio**: Drag and drop audio files (MP3, WAV, M4A, OGG)
- **Process**: Click "Process" to transcribe and extract contact information
- **Review**: Check extracted data and link to existing contacts

### 3. Natural Language Queries
- **Ask Questions**: Use natural language to search contacts
  - "Who works in marketing?"
  - "Find people with pets in New York"
  - "Show me musicians"
- **View Results**: Get formatted results with contact details
- **Query History**: Review previous searches

### 4. Event Planning
- **Create Events**: Set up events with details and participant limits
- **Get Recommendations**: Use AI to suggest suitable participants
- **Manage Participants**: Add/remove participants and track status

## API Documentation

The API documentation is automatically generated and available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

#### Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

#### Audio Processing
- `POST /api/audio/upload` - Upload audio file
- `POST /api/audio/{id}/process` - Process audio for data extraction
- `GET /api/audio/{id}/transcription` - Get transcription

#### Queries
- `POST /api/query` - Natural language query
- `GET /api/query/suggestions` - Get query suggestions

#### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `POST /api/events/recommend-participants` - Get participant recommendations

## Configuration

### Database Configuration
- **SQLite** (default): Suitable for development and small deployments
- **PostgreSQL**: Recommended for production use

Update `DATABASE_URL` in `.env`:
```
# SQLite
DATABASE_URL=sqlite:///./personal_ai_database.db

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/personal_ai_database
```

### OpenAI Configuration
Set your OpenAI API key in `.env`:
```
OPENAI_API_KEY=sk-your-api-key-here
```

## Development

### Backend Development
- **Code Structure**: Modular design with separate routers for different features
- **Database Models**: SQLAlchemy models in `backend/models.py`
- **API Routes**: Organized in `backend/routers/`
- **Testing**: Run tests with `pytest`

### Frontend Development
- **Component Structure**: Organized by pages and reusable components
- **State Management**: React hooks for local state
- **API Integration**: Centralized API calls in `src/services/api.ts`
- **Styling**: Material-UI with custom theming

### Adding New Features
1. **Backend**: Add new models, routes, and business logic
2. **Frontend**: Create components and integrate with API
3. **Types**: Update TypeScript interfaces in `src/types/`

## Deployment

### Production Deployment
1. **Backend**: Deploy using Docker, Heroku, or cloud providers
2. **Frontend**: Build and serve static files
3. **Database**: Use PostgreSQL for production
4. **Environment**: Set production environment variables

### Docker Deployment (Optional)
Create `Dockerfile` for containerized deployment:
```dockerfile
# Backend Dockerfile example
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["python", "main.py"]
```

## Troubleshooting

### Common Issues
1. **OpenAI API Errors**: Check API key and quota
2. **Database Connection**: Verify DATABASE_URL format
3. **CORS Issues**: Ensure frontend URL is in CORS origins
4. **Audio Processing**: Check file format and size limits

### Logs and Debugging
- Backend logs: Check console output when running the server
- Frontend logs: Use browser developer tools
- API errors: Check network tab in browser dev tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation
- Review API endpoints at `/docs`
- Create an issue in the repository

## Roadmap

### Planned Features
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Enhanced dashboard with charts
- **Integration APIs**: Connect with CRM systems
- **Real-time Processing**: Live audio transcription
- **Social Media Integration**: Import contacts from social platforms

### Version History
- **v1.0.0**: Initial release with core functionality
- Contact management, audio processing, queries, events
- AI-powered features with OpenAI integration
- Modern web interface with Material-UI
