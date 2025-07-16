'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  HeartIcon,
  AcademicCapIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';

interface AnalyticsData {
  overview: {
    total_contacts: number;
    total_events: number;
    avg_interests_per_contact: number;
    avg_skills_per_contact: number;
    contacts_change: number;
    events_change: number;
  };
  growth_data: Array<{
    period: string;
    contacts: number;
  }>;
  event_participation: Array<{
    event_type: string;
    participant_count: number;
  }>;
  demographics: {
    top_locations: Array<{
      location: string;
      count: number;
    }>;
    top_companies: Array<{
      company: string;
      count: number;
    }>;
    top_job_titles: Array<{
      job_title: string;
      count: number;
    }>;
  };
  interests_skills: {
    top_interests: Array<{
      interest: string;
      category: string;
      count: number;
    }>;
    top_skills: Array<{
      skill: string;
      count: number;
      avg_experience: number;
    }>;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: AnalyticsData = {
        overview: {
          total_contacts: 6,
          total_events: 4,
          avg_interests_per_contact: 3.0,
          avg_skills_per_contact: 3.0,
          contacts_change: 15.2,
          events_change: 25.0,
        },
        growth_data: [
          { period: 'Week 1', contacts: 2 },
          { period: 'Week 2', contacts: 4 },
          { period: 'Week 3', contacts: 5 },
          { period: 'Week 4', contacts: 6 },
        ],
        event_participation: [
          { event_type: 'Sing with Me', participant_count: 8 },
          { event_type: 'Workshop', participant_count: 5 },
          { event_type: 'Training', participant_count: 3 },
        ],
        demographics: {
          top_locations: [
            { location: 'Los Angeles, CA', count: 2 },
            { location: 'San Francisco, CA', count: 1 },
            { location: 'Chicago, IL', count: 1 },
            { location: 'New York, NY', count: 1 },
            { location: 'Nashville, TN', count: 1 },
          ],
          top_companies: [
            { company: 'Freelance', count: 1 },
            { company: 'Tech Corp', count: 1 },
            { company: 'Creative Agency', count: 1 },
            { company: 'Healing Arts Center', count: 1 },
            { company: 'Community Hospital', count: 1 },
          ],
          top_job_titles: [
            { job_title: 'Music Therapist', count: 1 },
            { job_title: 'Software Engineer', count: 1 },
            { job_title: 'Marketing Manager', count: 1 },
            { job_title: 'Nurse', count: 1 },
            { job_title: 'Musician', count: 1 },
          ],
        },
        interests_skills: {
          top_interests: [
            { interest: 'Music Therapy', category: 'Music', count: 2 },
            { interest: 'Elderly Care', category: 'Healthcare', count: 2 },
            { interest: 'Community Programs', category: 'Community', count: 2 },
            { interest: 'Artificial Intelligence', category: 'Technology', count: 1 },
            { interest: 'Digital Marketing', category: 'Marketing', count: 1 },
          ],
          top_skills: [
            { skill: 'Music Therapy', count: 1, avg_experience: 10 },
            { skill: 'Patient Care', count: 1, avg_experience: 9 },
            { skill: 'Python Programming', count: 1, avg_experience: 8 },
            { skill: 'Digital Marketing', count: 1, avg_experience: 7 },
            { skill: 'Guitar', count: 1, avg_experience: 12 },
          ],
        },
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <AdminLayout title="Analytics" subtitle="Insights and trends from your contact database">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout title="Analytics" subtitle="Insights and trends from your contact database">
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analytics data will appear once you have contacts in your database.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" subtitle="Insights and trends from your contact database">
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex justify-end">
          <div className="flex rounded-md shadow-sm">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' },
            ].map((option, index) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 text-sm font-medium border ${
                  timeRange === option.value
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${
                  index === 0 ? 'rounded-l-md' : ''
                } ${
                  index === 3 ? 'rounded-r-md' : ''
                } ${
                  index > 0 ? '-ml-px' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analytics.overview.total_contacts}
                      </div>
                      {analytics.overview.contacts_change !== 0 && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor(analytics.overview.contacts_change)}`}>
                          {getChangeIcon(analytics.overview.contacts_change)}
                          <span className="ml-1">{formatPercentage(analytics.overview.contacts_change)}</span>
                        </div>
                      )}
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
                  <CalendarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analytics.overview.total_events}
                      </div>
                      {analytics.overview.events_change !== 0 && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor(analytics.overview.events_change)}`}>
                          {getChangeIcon(analytics.overview.events_change)}
                          <span className="ml-1">{formatPercentage(analytics.overview.events_change)}</span>
                        </div>
                      )}
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
                  <HeartIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Interests</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analytics.overview.avg_interests_per_contact.toFixed(1)}
                      </div>
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
                  <AcademicCapIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Skills</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analytics.overview.avg_skills_per_contact.toFixed(1)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Growth Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Growth</h3>
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {analytics.growth_data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500">{item.period}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{item.contacts}</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((item.contacts / Math.max(...analytics.growth_data.map(d => d.contacts))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Participation */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Event Participation</h3>
              <CalendarIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {analytics.event_participation.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-900">{item.event_type}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{item.participant_count}</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((item.participant_count / Math.max(...analytics.event_participation.map(d => d.participant_count))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Locations */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Top Locations</h3>
              <MapPinIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {analytics.demographics.top_locations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-900">{location.location}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{location.count}</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((location.count / Math.max(...analytics.demographics.top_locations.map(l => l.count))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Top Companies</h3>
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {analytics.demographics.top_companies.map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-900">{company.company}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{company.count}</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((company.count / Math.max(...analytics.demographics.top_companies.map(c => c.count))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Job Titles */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Top Job Titles</h3>
              <BriefcaseIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {analytics.demographics.top_job_titles.map((job, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-900">{job.job_title}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{job.count}</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((job.count / Math.max(...analytics.demographics.top_job_titles.map(j => j.count))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interests and Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Interests */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Popular Interests</h3>
              <HeartIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {analytics.interests_skills.top_interests.map((interest, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-900">{interest.interest}</div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {interest.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{interest.count}</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((interest.count / Math.max(...analytics.interests_skills.top_interests.map(i => i.count))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Skills */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Popular Skills</h3>
              <AcademicCapIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {analytics.interests_skills.top_skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-900">{skill.skill}</div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {skill.avg_experience}y avg
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{skill.count}</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((skill.count / Math.max(...analytics.interests_skills.top_skills.map(s => s.count))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Network Composition</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {analytics.demographics.top_locations[0]?.location} has the most contacts ({analytics.demographics.top_locations[0]?.count})</li>
                <li>• {analytics.demographics.top_job_titles[0]?.job_title} is the most common profession</li>
                <li>• Average of {analytics.overview.avg_interests_per_contact.toFixed(1)} interests per contact</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Event Engagement</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {analytics.event_participation[0]?.event_type} events have highest participation</li>
                <li>• {analytics.interests_skills.top_interests[0]?.interest} is the most popular interest</li>
                <li>• {analytics.interests_skills.top_skills[0]?.skill} is the most common skill</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
