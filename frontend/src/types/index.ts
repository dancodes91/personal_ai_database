export interface Contact {
  id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  company?: string;
  location?: string;
  age?: number;
  has_pets?: boolean;
  business_needs?: string;
  personal_notes?: string;
  created_at: string;
  updated_at: string;
  interests: ContactInterest[];
  skills: ContactSkill[];
}

export interface ContactInterest {
  id: number;
  interest_category: string;
  interest_value: string;
  confidence_score?: number;
}

export interface ContactSkill {
  id: number;
  skill_name: string;
  skill_level?: string;
  years_experience?: number;
}

export interface ContactCreate {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  company?: string;
  location?: string;
  age?: number;
  has_pets?: boolean;
  business_needs?: string;
  personal_notes?: string;
  interests?: ContactInterestCreate[];
  skills?: ContactSkillCreate[];
}

export interface ContactInterestCreate {
  interest_category: string;
  interest_value: string;
  confidence_score?: number;
}

export interface ContactSkillCreate {
  skill_name: string;
  skill_level?: string;
  years_experience?: number;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  event_type?: string;
  location?: string;
  event_date?: string;
  max_participants?: number;
  status: string;
  created_at: string;
  updated_at: string;
  participant_count: number;
  participants: EventParticipant[];
}

export interface EventParticipant {
  contact_id: number;
  name: string;
  email?: string;
  participation_status: string;
  interest_level?: number;
  notes?: string;
}

export interface EventCreate {
  name: string;
  description?: string;
  event_type?: string;
  location?: string;
  event_date?: string;
  max_participants?: number;
}

export interface AudioRecording {
  id: number;
  file_name: string;
  contact_id?: number;
  duration_seconds?: number;
  has_transcription: boolean;
  processed_at?: string;
  created_at: string;
}

export interface QueryResult {
  query: string;
  results: SearchResult[];
  results_count: number;
  execution_time_ms: number;
  search_method: string;
  explanation?: string;
}

export interface SearchResult {
  contact: Contact;
  similarity_score: number;
  match_reason: string;
}

export interface QuerySuggestions {
  suggestions: string[];
  total_contacts: number;
  stats: {
    top_locations: Array<{ location: string; count: number }>;
    top_companies: Array<{ company: string; count: number }>;
    top_jobs: Array<{ job_title: string; count: number }>;
  };
}

export interface DashboardStats {
  total_contacts: number;
  total_events: number;
  total_recordings: number;
  recent_contacts: Contact[];
  upcoming_events: Event[];
  top_locations: Array<{ location: string; count: number }>;
  top_companies: Array<{ company: string; count: number }>;
}

export interface ParticipantRecommendation {
  contact: Contact;
  similarity_score: number;
  match_reason: string;
}
