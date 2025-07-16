'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';
import { eventsApi } from '@/lib/api';

interface EventForm {
  title: string;
  description: string;
  event_type: string;
  location: string;
  start_date: string;
  end_date: string;
  max_participants: number | '';
  status: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    event_type: 'Sing with Me',
    location: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    status: 'planned',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await eventsApi.create({
        name: form.title,
        description: form.description,
        event_type: form.event_type,
        location: form.location,
        event_date: new Date(form.start_date).toISOString(),
        max_participants: form.max_participants === '' ? undefined : Number(form.max_participants),
      });

      router.push('/events');
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    'Sing with Me',
    'Workshop',
    'Training',
    'Community Event',
    'Music Therapy',
    'Performance',
    'Other',
  ];

  const statusOptions = [
    { value: 'planned', label: 'Planned', color: 'bg-blue-100 text-blue-800' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  // Set default end date when start date changes
  const handleStartDateChange = (startDate: string) => {
    setForm(prev => {
      const newForm = { ...prev, start_date: startDate };
      
      // If no end date is set, default to 2 hours after start
      if (!prev.end_date && startDate) {
        const start = new Date(startDate);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
        newForm.end_date = end.toISOString().slice(0, 16); // Format for datetime-local input
      }
      
      return newForm;
    });
  };

  return (
    <AdminLayout title="Create New Event" subtitle="Plan a new event for your community">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Event Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sing with Me - Sunset Manor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the event, its purpose, and what participants can expect..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    value={form.event_type}
                    onChange={(e) => setForm(prev => ({ ...prev, event_type: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sunset Manor, 123 Oak Street, San Francisco, CA"
                  />
                  <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Date & Time</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    value={form.start_date}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    value={form.end_date}
                    onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                    min={form.start_date}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {form.start_date && form.end_date && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Duration:</strong> {
                    Math.round((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / (1000 * 60 * 60 * 100)) / 10
                  } hours
                </p>
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Participants</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Participants
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={form.max_participants}
                    onChange={(e) => setForm(prev => ({ ...prev, max_participants: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="15"
                  />
                  <UserGroupIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty for unlimited participants
                </p>
              </div>

              {/* AI Recommendations Preview */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center mb-2">
                  <SparklesIcon className="w-5 h-5 text-blue-500 mr-2" />
                  <h4 className="text-sm font-medium text-blue-900">AI Participant Recommendations</h4>
                </div>
                <p className="text-sm text-blue-800">
                  After creating this event, you'll be able to get AI-powered recommendations for participants based on:
                </p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Event type and interests alignment</li>
                  <li>• Location proximity</li>
                  <li>• Previous event participation</li>
                  <li>• Skills and experience relevance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Event Type Specific Information */}
          {form.event_type === 'Sing with Me' && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-900 mb-4">Sing with Me Event Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                <div>
                  <h4 className="font-medium mb-2">Recommended Participants:</h4>
                  <ul className="space-y-1">
                    <li>• Music therapists</li>
                    <li>• Musicians and singers</li>
                    <li>• Healthcare workers</li>
                    <li>• Community volunteers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Preparation Checklist:</h4>
                  <ul className="space-y-1">
                    <li>• Prepare song sheets</li>
                    <li>• Bring instruments if needed</li>
                    <li>• Coordinate with facility staff</li>
                    <li>• Plan interactive activities</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.title || !form.location || !form.start_date || !form.end_date}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
