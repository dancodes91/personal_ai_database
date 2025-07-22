import axios from 'axios';
import {
  Contact,
  ContactCreate,
  Event,
  EventCreate,
  AudioRecording,
  QueryResult,
  QuerySuggestions,
  DashboardStats,
  ParticipantRecommendation
} from '@/types';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contact API
export const contactsApi = {
  getAll: (params?: { skip?: number; limit?: number; search?: string }) =>
    api.get<Contact[]>('/contacts', { params }),
  
  getById: (id: number) =>
    api.get<Contact>(`/contacts/${id}`),
  
  create: (contact: ContactCreate) =>
    api.post<Contact>('/contacts', contact),
  
  update: (id: number, contact: Partial<ContactCreate>) =>
    api.put<Contact>(`/contacts/${id}`, contact),
  
  delete: (id: number) =>
    api.delete(`/contacts/${id}`),
  
  getSimilar: (id: number, limit?: number) =>
    api.get(`/contacts/${id}/similar`, { params: { limit } }),
};

// Events API
export const eventsApi = {
  getAll: (params?: { skip?: number; limit?: number; status?: string; event_type?: string }) =>
    api.get<Event[]>('/events', { params }),
  
  getById: (id: number) =>
    api.get<Event>(`/events/${id}`),
  
  create: (event: EventCreate) =>
    api.post<Event>('/events', event),
  
  update: (id: number, event: Partial<EventCreate & { status?: string }>) =>
    api.put<Event>(`/events/${id}`, event),
  
  delete: (id: number) =>
    api.delete(`/events/${id}`),
  
  addParticipant: (eventId: number, contactId: number, data?: { participation_status?: string; interest_level?: number; notes?: string }) =>
    api.post(`/events/${eventId}/participants`, { contact_id: contactId, ...data }),
  
  updateParticipation: (eventId: number, contactId: number, data: { participation_status: string; interest_level?: number; notes?: string }) =>
    api.put(`/events/${eventId}/participants/${contactId}`, data),
  
  removeParticipant: (eventId: number, contactId: number) =>
    api.delete(`/events/${eventId}/participants/${contactId}`),
  
  getRecommendations: (eventId: number, limit?: number) =>
    api.post<{ event_id: number; event_name: string; recommendations: ParticipantRecommendation[]; total_recommendations: number }>(`/events/${eventId}/recommend-participants`, { limit }),
};

// Audio API
export const audioApi = {
  getAll: (params?: { skip?: number; limit?: number; contact_id?: number }) =>
    api.get<AudioRecording[]>('/audio', { params }),
  
  getById: (id: number) =>
    api.get<AudioRecording & { transcription?: string; file_path?: string }>(`/audio/${id}`),
  
  upload: (file: File, contactId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (contactId) {
      formData.append('contact_id', contactId.toString());
    }
    return api.post<{ id: number; file_name: string; message: string }>('/audio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  transcribe: (id: number) =>
    api.post<{ id: number; transcription: string; message: string }>(`/audio/transcribe/${id}`),
  
  extractData: (id: number) =>
    api.post<{ id: number; extracted_data: any; contact_id?: number; message: string }>(`/audio/extract/${id}`),
  
  delete: (id: number) =>
    api.delete(`/audio/${id}`),
};

// Query API
export const queryApi = {
  search: (query: string, limit?: number, useVectorSearch?: boolean) =>
    api.post<QueryResult>('/query', { query, limit, use_vector_search: useVectorSearch }),
  
  getHistory: (params?: { skip?: number; limit?: number }) =>
    api.get('/query/history', { params }),
  
  getSuggestions: () =>
    api.get<QuerySuggestions>('/query/suggestions'),
};

// Vector Search API
export const vectorSearchApi = {
  semantic: (query: string, limit?: number) =>
    api.post<{ query: string; results: any[]; total_results: number }>('/search/semantic', { query, limit }),
  
  similar: (contactId: number, limit?: number) =>
    api.get(`/search/similar/${contactId}`, { params: { limit } }),
  
  stats: () =>
    api.get('/search/stats'),
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const [contactsRes, eventsRes, audioRes] = await Promise.all([
      contactsApi.getAll({ limit: 5 }),
      eventsApi.getAll({ limit: 5 }),
      audioApi.getAll({ limit: 5 })
    ]);

    const suggestions = await queryApi.getSuggestions();

    return {
      total_contacts: suggestions.data.total_contacts,
      total_events: eventsRes.data.length,
      total_recordings: audioRes.data.length,
      recent_contacts: contactsRes.data.slice(0, 5),
      upcoming_events: eventsRes.data.filter(e => e.status === 'planned').slice(0, 5),
      top_locations: suggestions.data.stats.top_locations,
      top_companies: suggestions.data.stats.top_companies,
    };
  },
};

export default api;
