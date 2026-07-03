'use client';

import React, { useState, useEffect } from 'react';
import { CareerProfile, getCareerProfile, updateCareerProfile } from '@/lib/api';

const TagInput = ({ label, value, onChange }: { label: string, value: string[], onChange: (val: string[]) => void }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, idx) => (
          <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full flex items-center border border-blue-500/30">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-white">&times;</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter"
        className="w-full bg-[#111318] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
      />
    </div>
  );
};

export default function CareerProfilePage() {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareerProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await updateCareerProfile(profile);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProfile(prev => prev ? { ...prev, [name]: checked } : null);
    } else {
      setProfile(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setProfile(prev => prev ? { ...prev, preferredEmploymentTypes: selectedValues } : null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0b0e] h-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0b0e] h-full text-white">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={loadProfile} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0e] h-full">
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Career Profile</h1>
          <p className="text-gray-400">Configure your preferences for personalized job recommendations.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl transition-all">
            {success}
          </div>
        )}

        {profile && (
          <form onSubmit={handleSubmit} className="space-y-8 bg-[#111318] p-8 rounded-2xl border border-gray-800/60 shadow-lg">
            
            {/* Basic Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName || ''}
                    onChange={handleChange}
                    className="w-full bg-[#0a0b0e] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-300">Professional Headline</label>
                  <input
                    type="text"
                    name="headline"
                    value={profile.headline || ''}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-[#0a0b0e] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-300">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={profile.yearsOfExperience || 0}
                    onChange={handleChange}
                    className="w-full bg-[#0a0b0e] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-300">Minimum Salary (USD)</label>
                  <input
                    type="number"
                    name="minimumSalary"
                    value={profile.minimumSalary || 0}
                    onChange={handleChange}
                    className="w-full bg-[#0a0b0e] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Preferences</h2>
              
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="remoteOnly"
                  name="remoteOnly"
                  checked={profile.remoteOnly || false}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-700 bg-[#0a0b0e] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#111318]"
                />
                <label htmlFor="remoteOnly" className="text-sm font-medium text-gray-300 cursor-pointer">
                  Remote Only
                </label>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-300">Preferred Employment Types</label>
                <select
                  multiple
                  value={profile.preferredEmploymentTypes || []}
                  onChange={handleMultiSelect}
                  className="w-full bg-[#0a0b0e] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 min-h-[100px]"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
                <p className="text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TagInput
                  label="Preferred Roles"
                  value={profile.preferredRoles || []}
                  onChange={(val) => setProfile({ ...profile, preferredRoles: val })}
                />
                <TagInput
                  label="Skills"
                  value={profile.skills || []}
                  onChange={(val) => setProfile({ ...profile, skills: val })}
                />
                <TagInput
                  label="Preferred Locations"
                  value={profile.preferredLocations || []}
                  onChange={(val) => setProfile({ ...profile, preferredLocations: val })}
                />
                <TagInput
                  label="Preferred Companies"
                  value={profile.preferredCompanies || []}
                  onChange={(val) => setProfile({ ...profile, preferredCompanies: val })}
                />
                <TagInput
                  label="Excluded Keywords"
                  value={profile.excludedKeywords || []}
                  onChange={(val) => setProfile({ ...profile, excludedKeywords: val })}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
