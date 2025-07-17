'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MicrophoneIcon,
  DocumentTextIcon,
  UserPlusIcon,
  PlayIcon,
  TrashIcon,
  ArrowLeftIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';
import { audioApi, contactsApi } from '@/lib/api';
import { AudioRecording, Contact } from '@/types';

interface AudioRecordingDetail extends AudioRecording {
  transcription?: string;
  file_path?: string;
}

export default function AudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const audioId = parseInt(params.id as string);
  
  const [recording, setRecording] = useState<AudioRecordingDetail | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecording();
  }, [audioId]);

  const loadRecording = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await audioApi.getById(audioId);
      setRecording(response.data);
      
      // Load associated contact if exists
      if (response.data.contact_id) {
        try {
          const contactResponse = await contactsApi.getById(response.data.contact_id);
          setContact(contactResponse.data);
        } catch (contactError) {
          console.error('Failed to load associated contact:', contactError);
        }
      }
    } catch (error) {
      console.error('Failed to load recording:', error);
      setError('Failed to load recording details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recording) return;
    
    if (confirm(`Are you sure you want to delete "${recording.file_name}"?`)) {
      try {
        await audioApi.delete(recording.id);
        router.push('/audio');
      } catch (error) {
        console.error('Failed to delete recording:', error);
        alert('Failed to delete recording. Please try again.');
      }
    }
  };

  const handleTranscribe = async () => {
    if (!recording) return;
    
    try {
      await audioApi.transcribe(recording.id);
      // Reload to get updated transcription
      loadRecording();
    } catch (error) {
      console.error('Failed to transcribe recording:', error);
      alert('Failed to transcribe recording. Please try again.');
    }
  };

  const handleExtractData = async () => {
    if (!recording) return;
    
    try {
      await audioApi.extractData(recording.id);
      // Reload to get updated contact info
      loadRecording();
    } catch (error) {
      console.error('Failed to extract data:', error);
      alert('Failed to extract contact data. Please try again.');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AdminLayout title="Audio Recording Details" subtitle="Loading recording information...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !recording) {
    return (
      <AdminLayout title="Audio Recording Details" subtitle="Error loading recording">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">{error || 'Recording not found'}</div>
          <button
            onClick={() => router.push('/audio')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Audio
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={recording.file_name}
      subtitle="Audio Recording Details"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/audio')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Audio
          </button>
          
          <div className="flex space-x-3">
            {!recording.has_transcription && (
              <button
                onClick={handleTranscribe}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Transcribe
              </button>
            )}
            
            {recording.has_transcription && !recording.contact_id && (
              <button
                onClick={handleExtractData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Extract Contact
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Recording Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MicrophoneIcon className="h-12 w-12 text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {recording.file_name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Audio recording from Sing with Me session
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              {/* Duration */}
              {recording.duration_seconds && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Duration
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDuration(recording.duration_seconds)}
                  </dd>
                </div>
              )}

              {/* Created Date */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Created
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(recording.created_at).toLocaleString()}
                </dd>
              </div>

              {/* Processing Status */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Processing Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recording.has_transcription ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {recording.has_transcription ? 'Transcribed' : 'Not Transcribed'}
                    </span>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recording.contact_id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {recording.contact_id ? 'Contact Created' : 'No Contact'}
                    </span>
                  </div>
                </dd>
              </div>

              {/* Processed Date */}
              {recording.processed_at && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Processed</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(recording.processed_at).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Associated Contact */}
        {contact && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Associated Contact
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {contact.first_name} {contact.last_name || ''}
                  </h4>
                  {contact.job_title && (
                    <p className="text-sm text-gray-500">
                      {contact.job_title}
                      {contact.company && ` at ${contact.company}`}
                    </p>
                  )}
                  {contact.location && (
                    <p className="text-sm text-gray-500">{contact.location}</p>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Contact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transcription */}
        {recording.transcription && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Transcription
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {recording.transcription}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(recording.transcription || '');
                    alert('Transcription copied to clipboard!');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Copy Text
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing Instructions */}
        {!recording.has_transcription && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Next Steps</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <span className="font-medium">1.</span>
                <span>Click "Transcribe" to convert the audio to text using AI</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">2.</span>
                <span>After transcription, click "Extract Contact" to create a contact record</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">3.</span>
                <span>The contact will be automatically added to your database and indexed for search</span>
              </div>
            </div>
          </div>
        )}

        {/* File Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">File Information</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">File Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {recording.file_name}
                </dd>
              </div>
              
              {recording.file_path && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">File Path</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono text-xs">
                    {recording.file_path}
                  </dd>
                </div>
              )}
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Recording ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {recording.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
