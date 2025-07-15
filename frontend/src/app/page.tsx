'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  MicrophoneIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '@/lib/api';
import { DashboardStats } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Personal AI Database</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/contacts" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Contacts
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Events
              </Link>
              <Link href="/audio" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Audio
              </Link>
              <Link href="/search" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Search
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your Personal AI Database</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.total_contacts || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.total_events || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MicrophoneIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Audio Recordings</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.total_recordings || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Top Locations</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.top_locations?.length || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/contacts/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Contact
              </Link>
              <Link href="/events/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Event
              </Link>
              <Link href="/audio/upload" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                <MicrophoneIcon className="h-4 w-4 mr-2" />
                Upload Audio
              </Link>
              <Link href="/search" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Search Contacts
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Contacts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Contacts</h3>
              {stats?.recent_contacts && stats.recent_contacts.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{contact.job_title} at {contact.company}</p>
                      </div>
                      <Link href={`/contacts/${contact.id}`} className="text-blue-600 hover:text-blue-900 text-sm">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No contacts yet. Add your first contact!</p>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upcoming Events</h3>
              {stats?.upcoming_events && stats.upcoming_events.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcoming_events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.name}</p>
                        <p className="text-sm text-gray-500">
                          {event.event_type} • {event.participant_count} participants
                        </p>
                      </div>
                      <Link href={`/events/${event.id}`} className="text-blue-600 hover:text-blue-900 text-sm">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming events. Create your first event!</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Locations */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Locations</h3>
              {stats?.top_locations && stats.top_locations.length > 0 ? (
                <div className="space-y-2">
                  {stats.top_locations.map((location, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-900">{location.location}</span>
                      <span className="text-sm text-gray-500">{location.count} contacts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No location data available</p>
              )}
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Companies</h3>
              {stats?.top_companies && stats.top_companies.length > 0 ? (
                <div className="space-y-2">
                  {stats.top_companies.map((company, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-900">{company.company}</span>
                      <span className="text-sm text-gray-500">{company.count} contacts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No company data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
