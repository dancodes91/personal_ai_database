'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '@/lib/constants';
import AdminLayout from '@/components/AdminLayout';

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  max_participants: number;
  current_participants: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        setError('Event not found');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/events');
      } else {
        setError('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Loading..." subtitle="Please wait">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !event) {
    return (
      <AdminLayout title="Error" subtitle="Event not found">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">{error || 'Event not found'}</div>
          <Link
            href="/events"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={event.title} subtitle="Event Details">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Events
          </Link>
          
          <div className="flex space-x-3">
            <Link
              href={`/events/${event.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Event
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Event
            </button>
          </div>
        </div>

        {/* Event Details Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Date & Time</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(event.event_date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(event.event_date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Location</div>
                    <div className="text-sm text-gray-600">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <TagIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Event Type</div>
                    <div className="text-sm text-gray-600">{event.event_type}</div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <UserGroupIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Participants</div>
                    <div className="text-sm text-gray-600">
                      {event.current_participants} / {event.max_participants} registered
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(event.current_participants / event.max_participants) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Created</div>
                    <div className="text-sm text-gray-600">
                      {new Date(event.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}

            {/* Notes */}
            {event.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {event.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Manage Participants
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Duplicate Event
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <TagIcon className="w-4 h-4 mr-2" />
              Export Details
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
