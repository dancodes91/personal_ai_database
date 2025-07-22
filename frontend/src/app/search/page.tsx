'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ClockIcon,
  UserIcon,
  LightBulbIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';
import { queryApi } from '@/lib/api';
import { QueryResult, QuerySuggestions } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult | null>(null);
  const [suggestions, setSuggestions] = useState<QuerySuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadSuggestions();
    loadHistory();
    
    // Check for query parameter and perform search
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      handleSearch(urlQuery);
    }
  }, [searchParams]);

  const loadSuggestions = async () => {
    try {
      const response = await queryApi.getSuggestions();
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await queryApi.getHistory({ limit: 10 });
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSearch = async (searchQuery?: string) => {
    const queryText = searchQuery || query;
    if (!queryText.trim()) return;

    setLoading(true);
    try {
      const response = await queryApi.search(queryText);
      setResults(response.data);
      loadHistory(); // Refresh history
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <AdminLayout title="Search & Query" subtitle="Ask natural language questions about your contacts">
      <div className="space-y-6">
        {/* Search Interface */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Ask anything about your contacts
            </h3>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="e.g., Find music therapists in Los Angeles, Who has pets?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  onClick={() => handleSearch()}
                  disabled={loading || !query.trim()}
                  className="mr-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>

            {/* Search Method Toggle */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <SparklesIcon className="w-4 h-4 mr-1" />
                <span>AI-powered semantic search</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{results.results_count} results</span>
                <span>•</span>
                <span>{formatExecutionTime(results.execution_time_ms)}</span>
                <span>•</span>
                <span className="capitalize">{results.search_method.replace('_', ' ')}</span>
              </div>
            </div>

            {results.explanation && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">{results.explanation}</p>
              </div>
            )}

            {results.results.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try rephrasing your query or using different keywords.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {result.contact.first_name} {result.contact.last_name}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {Math.round(result.similarity_score * 100)}% match
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            {result.contact.job_title && (
                              <p><span className="font-medium">Job:</span> {result.contact.job_title}</p>
                            )}
                            {result.contact.company && (
                              <p><span className="font-medium">Company:</span> {result.contact.company}</p>
                            )}
                            {result.contact.location && (
                              <p><span className="font-medium">Location:</span> {result.contact.location}</p>
                            )}
                          </div>
                          <div>
                            {result.contact.email && (
                              <p><span className="font-medium">Email:</span> {result.contact.email}</p>
                            )}
                            {result.contact.phone && (
                              <p><span className="font-medium">Phone:</span> {result.contact.phone}</p>
                            )}
                          </div>
                        </div>

                        {/* Interests and Skills */}
                        <div className="mt-3 space-y-2">
                          {result.contact.interests && result.contact.interests.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Interests: </span>
                              <div className="inline-flex flex-wrap gap-1">
                                {result.contact.interests.slice(0, 5).map((interest, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {interest.interest_value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {result.contact.skills && result.contact.skills.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Skills: </span>
                              <div className="inline-flex flex-wrap gap-1">
                                {result.contact.skills.slice(0, 5).map((skill, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {skill.skill_name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {result.match_reason && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            <span className="font-medium">Match reason:</span> {result.match_reason}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        <Link
                          href={`/contacts/${result.contact.id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Suggestions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <LightBulbIcon className="w-5 h-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Query Suggestions</h3>
            </div>
            
            {suggestions ? (
              <div className="space-y-2">
                {suggestions.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <div className="animate-pulse space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Queries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Recent Queries</h3>
            </div>
            
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button
                      onClick={() => handleSuggestionClick(item.query_text)}
                      className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600 truncate"
                    >
                      {item.query_text}
                    </button>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{item.results_count} results</span>
                      <span>•</span>
                      <span>{formatExecutionTime(item.execution_time_ms)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent queries</p>
            )}
          </div>
        </div>

        {/* Database Stats */}
        {suggestions && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Database Overview</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Top Locations</h4>
                <div className="space-y-1">
                  {suggestions.stats.top_locations.map((location, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-900">{location.location}</span>
                      <span className="text-gray-500">{location.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Top Companies</h4>
                <div className="space-y-1">
                  {suggestions.stats.top_companies.map((company, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-900">{company.company}</span>
                      <span className="text-gray-500">{company.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Top Job Titles</h4>
                <div className="space-y-1">
                  {suggestions.stats.top_jobs.map((job, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-900">{job.job_title}</span>
                      <span className="text-gray-500">{job.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600">{suggestions.total_contacts}</span>
                <span className="text-sm text-gray-500 ml-2">total contacts in your database</span>
              </div>
            </div>
          </div>
        )}

        {/* Search Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Natural Language Queries:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• "Find music therapists in California"</li>
                <li>• "Who works in healthcare?"</li>
                <li>• "Show me people with pets"</li>
                <li>• "Find contacts interested in AI"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Specific Searches:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• "Musicians in Nashville"</li>
                <li>• "Social workers with community experience"</li>
                <li>• "People who might need signage"</li>
                <li>• "Contacts for Sing with Me events"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
