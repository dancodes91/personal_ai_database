'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';
import { contactsApi } from '@/lib/api';

interface ContactForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  company: string;
  location: string;
  age: number | '';
  notes: string;
  interests: Array<{ category: string; value: string }>;
  skills: Array<{ name: string; level: string; experience: number | '' }>;
}

export default function NewContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ContactForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    company: '',
    location: '',
    age: '',
    notes: '',
    interests: [],
    skills: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactsApi.create({
        ...form,
        age: form.age === '' ? undefined : Number(form.age),
        interests: form.interests.map(interest => ({
          interest_category: interest.category,
          interest_value: interest.value,
        })),
        skills: form.skills.map(skill => ({
          skill_name: skill.name,
          skill_level: skill.level,
          years_experience: skill.experience === '' ? undefined : Number(skill.experience),
        })),
      });

      router.push('/contacts');
    } catch (error) {
      console.error('Failed to create contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    setForm(prev => ({
      ...prev,
      interests: [...prev.interests, { category: '', value: '' }],
    }));
  };

  const removeInterest = (index: number) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const updateInterest = (index: number, field: 'category' | 'value', value: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.map((interest, i) =>
        i === index ? { ...interest, [field]: value } : interest
      ),
    }));
  };

  const addSkill = () => {
    setForm(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 'Beginner', experience: '' }],
    }));
  };

  const removeSkill = (index: number) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const updateSkill = (index: number, field: 'name' | 'level' | 'experience', value: string | number) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  return (
    <AdminLayout title="Add New Contact" subtitle="Create a new contact in your database">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                  />
                  <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm(prev => ({ ...prev, last_name: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john.doe@example.com"
                  />
                  <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1-555-0123"
                  />
                  <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.job_title}
                    onChange={(e) => setForm(prev => ({ ...prev, job_title: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Software Engineer"
                  />
                  <BuildingOfficeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tech Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="San Francisco, CA"
                  />
                  <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={(e) => setForm(prev => ({ ...prev, age: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes about this contact..."
              />
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Interests</h3>
              <button
                type="button"
                onClick={addInterest}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Interest
              </button>
            </div>

            <div className="space-y-4">
              {form.interests.map((interest, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={interest.category}
                      onChange={(e) => updateInterest(index, 'category', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Category (e.g., Music, Technology)"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={interest.value}
                      onChange={(e) => updateInterest(index, 'value', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Interest (e.g., Piano, AI)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {form.interests.length === 0 && (
                <p className="text-gray-500 text-sm">No interests added yet. Click "Add Interest" to get started.</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Skills</h3>
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>

            <div className="space-y-4">
              {form.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Skill name (e.g., Python, Guitar)"
                    />
                  </div>
                  <div className="w-32">
                    <select
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={skill.experience}
                      onChange={(e) => updateSkill(index, 'experience', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Years"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {form.skills.length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet. Click "Add Skill" to get started.</p>
              )}
            </div>
          </div>

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
              disabled={loading || !form.first_name}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
