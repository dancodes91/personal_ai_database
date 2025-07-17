'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import {
  CloudArrowUpIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  UserPlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';
import { audioApi } from '@/lib/api';
import { AudioRecording } from '@/types';

interface ProcessingStatus {
  [key: number]: {
    transcribing: boolean;
    extracting: boolean;
    completed: boolean;
    error?: string;
  };
}

export default function AudioProcessingPage() {
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({});
  const [selectedTranscription, setSelectedTranscription] = useState<{
    id: number;
    fileName: string;
    transcription: string;
  } | null>(null);
  const [loadingTranscription, setLoadingTranscription] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const response = await audioApi.getAll();
      setRecordings(response.data);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        const response = await audioApi.upload(file);
        const newRecording = {
          id: response.data.id,
          file_name: response.data.file_name,
          has_transcription: false,
          created_at: new Date().toISOString(),
        } as AudioRecording;
        
        setRecordings(prev => [newRecording, ...prev]);
        
        // Auto-start processing
        processRecording(newRecording.id);
        
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
    
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac']
    },
    multiple: true
  });

  const processRecording = async (recordingId: number) => {
    setProcessingStatus(prev => ({
      ...prev,
      [recordingId]: { transcribing: true, extracting: false, completed: false }
    }));

    try {
      // Step 1: Transcribe
      await audioApi.transcribe(recordingId);
      
      setProcessingStatus(prev => ({
        ...prev,
        [recordingId]: { transcribing: false, extracting: true, completed: false }
      }));

      // Step 2: Extract data
      const extractResponse = await audioApi.extractData(recordingId);
      
      setProcessingStatus(prev => ({
        ...prev,
        [recordingId]: { transcribing: false, extracting: false, completed: true }
      }));

      // Refresh recordings to show updated status
      loadRecordings();
      
    } catch (error) {
      console.error('Processing failed:', error);
      setProcessingStatus(prev => ({
        ...prev,
        [recordingId]: { 
          transcribing: false, 
          extracting: false, 
          completed: false, 
          error: 'Processing failed' 
        }
      }));
    }
  };

  const handleDeleteRecording = async (recordingId: number) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      try {
        await audioApi.delete(recordingId);
        setRecordings(recordings.filter(r => r.id !== recordingId));
        setProcessingStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[recordingId];
          return newStatus;
        });
      } catch (error) {
        console.error('Failed to delete recording:', error);
      }
    }
  };

  const getStatusIcon = (recording: AudioRecording) => {
    const status = processingStatus[recording.id];
    
    if (status?.error) {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    }
    
    if (status?.transcribing) {
      return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
    
    if (status?.extracting) {
      return <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />;
    }
    
    if (status?.completed || recording.has_transcription) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    
    return <ClockIcon className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (recording: AudioRecording) => {
    const status = processingStatus[recording.id];
    
    if (status?.error) return status.error;
    if (status?.transcribing) return 'Transcribing...';
    if (status?.extracting) return 'Extracting data...';
    if (status?.completed || recording.has_transcription) return 'Processed';
    
    return 'Pending';
  };

  const handleViewTranscription = async (recording: AudioRecording) => {
    setLoadingTranscription(true);
    try {
      const response = await audioApi.getById(recording.id);
      setSelectedTranscription({
        id: recording.id,
        fileName: recording.file_name,
        transcription: response.data.transcription || 'No transcription available'
      });
    } catch (error) {
      console.error('Failed to load transcription:', error);
      alert('Failed to load transcription. Please try again.');
    } finally {
      setLoadingTranscription(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const RecordingCard = ({ recording }: { recording: AudioRecording }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <MicrophoneIcon className="w-8 h-8 text-purple-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {recording.file_name}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(recording.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon(recording)}
          <button
            onClick={() => handleDeleteRecording(recording.id)}
            className="text-red-400 hover:text-red-600"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span className={`font-medium ${
            processingStatus[recording.id]?.error ? 'text-red-600' :
            processingStatus[recording.id]?.completed || recording.has_transcription ? 'text-green-600' :
            processingStatus[recording.id]?.transcribing || processingStatus[recording.id]?.extracting ? 'text-blue-600' :
            'text-gray-600'
          }`}>
            {getStatusText(recording)}
          </span>
        </div>
        
        {recording.duration_seconds && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">Duration:</span>
            <span className="text-gray-900">
              {Math.floor(recording.duration_seconds / 60)}:{(recording.duration_seconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
        
        {recording.contact_id && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">Contact:</span>
            <span className="text-blue-600">Created</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-2">
        {!recording.has_transcription && !processingStatus[recording.id]?.transcribing && !processingStatus[recording.id]?.extracting && (
          <button
            onClick={() => processRecording(recording.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            Process
          </button>
        )}
        
        {recording.has_transcription && (
          <button 
            onClick={() => handleViewTranscription(recording)}
            disabled={loadingTranscription}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            {loadingTranscription ? 'Loading...' : 'View Transcript'}
          </button>
        )}
        
        <Link
          href={`/audio/${recording.id}`}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
          <EyeIcon className="w-4 h-4 mr-1" />
          View Details
        </Link>
        
        {recording.contact_id && (
          <Link
            href={`/contacts/${recording.contact_id}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            <UserPlusIcon className="w-4 h-4 mr-1" />
            View Contact
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout title="Audio Processing" subtitle="Upload and process audio recordings from your Sing with Me sessions">
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Audio Files</h3>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            
            {uploading ? (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop files here' : 'Drag & drop audio files here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports MP3, WAV, M4A, FLAC (max 50MB each)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Processing Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MicrophoneIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Recordings</dt>
                    <dd className="text-lg font-medium text-gray-900">{recordings.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Transcribed</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {recordings.filter(r => r.has_transcription).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserPlusIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Contacts Created</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {recordings.filter(r => r.contact_id).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.values(processingStatus).filter(s => s.transcribing || s.extracting).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recordings List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Recordings</h3>
            <div className="text-sm text-gray-500">
              {recordings.length} recordings
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <MicrophoneIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recordings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your first audio recording to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </div>
          )}
        </div>

        {/* Processing Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">How Audio Processing Works</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>Upload audio files from your "Sing with Me" sessions</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>AI transcribes the audio using OpenAI Whisper</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>GPT-4 extracts contact information (name, interests, skills, etc.)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">4.</span>
              <span>New contacts are automatically created in your database</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">5.</span>
              <span>Contact data is indexed for semantic search and recommendations</span>
            </div>
          </div>
        </div>

        {/* Transcription Modal */}
        {selectedTranscription && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Audio Transcription
                  </h3>
                  <button
                    onClick={() => setSelectedTranscription(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">File:</span> {selectedTranscription.fileName}
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Transcription:</h4>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {selectedTranscription.transcription}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTranscription.transcription);
                      alert('Transcription copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Copy Text
                  </button>
                  <button
                    onClick={() => setSelectedTranscription(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
