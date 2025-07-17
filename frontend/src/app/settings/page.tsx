'use client';

import { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  KeyIcon,
  CircleStackIcon,
  BellIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';

interface Settings {
  openai_api_key: string;
  database_url: string;
  notifications_enabled: boolean;
  auto_process_audio: boolean;
  max_file_size: number;
  backup_enabled: boolean;
  backup_frequency: string;
}

function PasswordChangeSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('You must be logged in to change password');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-4">Change Password</h4>
      <form onSubmit={handlePasswordChange}>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}
          
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Confirm new password"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <KeyIcon className="w-4 h-4 mr-2" />
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    openai_api_key: '',
    database_url: 'sqlite:///./personal_ai_database.db',
    notifications_enabled: true,
    auto_process_audio: true,
    max_file_size: 50,
    backup_enabled: false,
    backup_frequency: 'daily',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'database' | 'security'>('general');

  const handleSave = async () => {
    setLoading(true);
    try {
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        openai_api_key: '',
        database_url: 'sqlite:///./personal_ai_database.db',
        notifications_enabled: true,
        auto_process_audio: true,
        max_file_size: 50,
        backup_enabled: false,
        backup_frequency: 'daily',
      });
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon },
    { id: 'database', name: 'Database', icon: CircleStackIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  return (
    <AdminLayout title="Settings" subtitle="Configure your Personal AI Database">
      <div className="space-y-6">
        {/* Save Status */}
        {saved && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Settings saved successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'general' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">General Settings</h3>
              
              <div className="space-y-6">
                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Enable Notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Receive notifications for new contacts and events
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, notifications_enabled: !prev.notifications_enabled }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings.notifications_enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Process Audio */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Auto-process Audio Files
                      </label>
                      <p className="text-sm text-gray-500">
                        Automatically transcribe and extract data from uploaded audio
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, auto_process_audio: !prev.auto_process_audio }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings.auto_process_audio ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.auto_process_audio ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Max File Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.max_file_size}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_file_size: parseInt(e.target.value) }))}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum size for uploaded audio files
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">API Configuration</h3>
              
              <div className="space-y-6">
                {/* OpenAI API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    OpenAI API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={settings.openai_api_key}
                      onChange={(e) => setSettings(prev => ({ ...prev, openai_api_key: e.target.value }))}
                      placeholder="sk-..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <KeyIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Required for audio transcription and data extraction features
                  </p>
                </div>

                {/* API Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">API Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">OpenAI Connection</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        settings.openai_api_key ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {settings.openai_api_key ? 'Connected' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Whisper (Transcription)</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        settings.openai_api_key ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {settings.openai_api_key ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">GPT-4 (Data Extraction)</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        settings.openai_api_key ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {settings.openai_api_key ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* API Usage */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Usage Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Keep your API key secure and never share it</li>
                    <li>• Monitor your OpenAI usage to avoid unexpected charges</li>
                    <li>• Audio processing costs vary based on file length</li>
                    <li>• Data extraction uses GPT-4 which has higher costs</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Database Configuration</h3>
              
              <div className="space-y-6">
                {/* Database URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Database URL
                  </label>
                  <input
                    type="text"
                    value={settings.database_url}
                    onChange={(e) => setSettings(prev => ({ ...prev, database_url: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    SQLite (local) or PostgreSQL connection string
                  </p>
                </div>

                {/* Database Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Database Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">6</div>
                      <div className="text-sm text-gray-500">Total Contacts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">4</div>
                      <div className="text-sm text-gray-500">Total Events</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">18</div>
                      <div className="text-sm text-gray-500">Total Interests</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">18</div>
                      <div className="text-sm text-gray-500">Total Skills</div>
                    </div>
                  </div>
                </div>

                {/* Backup Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Enable Automatic Backups
                      </label>
                      <p className="text-sm text-gray-500">
                        Automatically backup your database
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, backup_enabled: !prev.backup_enabled }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.backup_enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.backup_enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.backup_enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={settings.backup_frequency}
                        onChange={(e) => setSettings(prev => ({ ...prev, backup_frequency: e.target.value }))}
                        className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Database Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Database Actions</h4>
                  <div className="space-y-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <CircleStackIcon className="w-4 h-4 mr-2" />
                      Export Database
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Create Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Security & Privacy</h3>
              
              <div className="space-y-6">
                {/* Password Update */}
                <PasswordChangeSection />

                {/* Data Privacy */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-900">Data Privacy</h4>
                      <div className="mt-2 text-sm text-blue-800">
                        <ul className="space-y-1">
                          <li>• All data is stored locally on your device</li>
                          <li>• Audio files are processed securely via OpenAI API</li>
                          <li>• No personal data is shared with third parties</li>
                          <li>• You have full control over your data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Security Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-900">Local Data Storage</span>
                      </div>
                      <span className="text-sm text-green-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-900">HTTPS Encryption</span>
                      </div>
                      <span className="text-sm text-green-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-900">API Key Encryption</span>
                      </div>
                      <span className="text-sm text-green-600">Enabled</span>
                    </div>
                  </div>
                </div>

                {/* Data Management */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Data Management</h4>
                  <div className="space-y-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Export All Data
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete All Data
                    </button>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-900">Important</h4>
                      <div className="mt-2 text-sm text-yellow-800">
                        <p>
                          Deleting all data is permanent and cannot be undone. Make sure to create a backup before performing this action.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
