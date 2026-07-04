'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CareerProfile, getCareerProfile, updateCareerProfile, uploadCareerResume } from '@/lib/api';

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
      <label className="text-xs font-bold text-foreground/90">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, idx) => (
          <span key={idx} className="px-3 py-1 bg-primary-glow text-primary text-xs font-semibold rounded-full flex items-center border border-primary/20 shadow-sm animate-in fade-in duration-100">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-foreground opacity-75 hover:opacity-100 font-bold">&times;</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter"
        className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary placeholder:text-muted-text text-sm transition-all shadow-inner"
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
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }

    setUploadingResume(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedProfile = await uploadCareerResume(file);
      setProfile(updatedProfile);
      setSuccess('Resume uploaded and parsed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      <div className="flex-1 flex items-center justify-center bg-background h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background h-full text-foreground px-4 text-center">
        <p className="text-accent-red font-semibold mb-4">{error}</p>
        <button onClick={loadProfile} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold cursor-pointer text-xs shadow-sm">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background h-full">
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Career Profile</h1>
          <p className="text-muted-text text-sm font-medium">Configure matching parameters, upload active resume PDF, and tweak AI matching variables.</p>
        </div>

        {error && (
          <div className="mb-6 p-4.5 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-xl text-xs font-semibold shadow-sm animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4.5 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-xl text-xs font-semibold shadow-sm animate-in fade-in duration-200">
            {success}
          </div>
        )}

        {profile && (
          <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-2xl border border-card-border shadow-sm">
            
            {/* Basic Info */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground border-b border-card-border pb-3">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-foreground/90">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName || ''}
                    onChange={handleChange}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary text-sm shadow-inner"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-foreground/90">Professional Headline</label>
                  <input
                    type="text"
                    name="headline"
                    value={profile.headline || ''}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary text-sm placeholder:text-muted-text shadow-inner"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-foreground/90">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={profile.yearsOfExperience || 0}
                    onChange={handleChange}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary text-sm shadow-inner"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-foreground/90">Minimum Salary Requirement (USD)</label>
                  <input
                    type="number"
                    name="minimumSalary"
                    value={profile.minimumSalary || 0}
                    onChange={handleChange}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary text-sm shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Resume & AI Matcher Preferences */}
            <div className="space-y-6 pt-4">
              <h2 className="text-lg font-bold text-foreground border-b border-card-border pb-3">Resume & AI Matching</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resume Upload */}
                <div className="flex flex-col space-y-2 bg-sidebar border border-card-border p-5 rounded-xl">
                  <label className="text-xs font-bold text-foreground/90">Resume PDF</label>
                  <p className="text-[11px] text-muted-text font-medium leading-relaxed">Upload resume profile PDF. TraceLM matches resume context to scraped board listings.</p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleResumeUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="flex items-center space-x-2 bg-primary-glow text-primary hover:bg-primary/20 border border-primary/20 hover:border-primary/35 px-4 py-2.5 rounded-xl transition-all font-bold text-xs disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {uploadingResume ? (
                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      )}
                      <span>{uploadingResume ? 'Processing...' : 'Upload PDF'}</span>
                    </button>
                    
                    {profile.resumeFileName ? (
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-foreground font-semibold truncate max-w-[180px]">{profile.resumeFileName}</span>
                        <span className="text-[9px] text-accent-green font-bold flex items-center mt-1 uppercase tracking-wider bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded w-max">
                          Parsed & Active
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-text italic font-medium">No active file</span>
                    )}
                  </div>
                </div>

                {/* Additional preferences notes */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-foreground/90">Matcher Guidelines</label>
                  <p className="text-[11px] text-muted-text font-medium leading-relaxed font-medium">Write parameters in your own words. The LLM will factor guidelines into scoring weights.</p>
                  <textarea
                    name="additionalNotes"
                    value={profile.additionalNotes || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, additionalNotes: e.target.value } : null)}
                    placeholder="e.g. Focus on modern tech stacks using React/Next.js and Go. I'm looking for a collaborative team environment and want to avoid finance/crypto domains."
                    rows={4}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary resize-none text-sm placeholder:text-muted-text mt-1 shadow-inner leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Preferences checkboxes */}
            <div className="space-y-6 pt-4">
              <h2 className="text-lg font-bold text-foreground border-b border-card-border pb-3">Preferences</h2>
              
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="remoteOnly"
                  name="remoteOnly"
                  checked={profile.remoteOnly || false}
                  onChange={handleChange}
                  className="w-4.5 h-4.5 rounded border-input-border bg-input-bg text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
                />
                <label htmlFor="remoteOnly" className="text-xs font-bold text-foreground/90 cursor-pointer">
                  Remote Only Positions
                </label>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-foreground/90">Preferred Employment Types</label>
                <select
                  multiple
                  value={profile.preferredEmploymentTypes || []}
                  onChange={handleMultiSelect}
                  className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary min-h-[120px] text-sm shadow-inner"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
                <p className="text-[10px] text-muted-text font-semibold">Hold Ctrl (Windows) or Cmd (Mac) to select multiple types</p>
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

            <div className="pt-6 border-t border-card-border flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-background font-bold rounded-xl transition-all shadow-[0_2px_8px_var(--primary-glow)] hover:shadow-[0_4px_12px_var(--primary-glow)] cursor-pointer text-sm"
              >
                {saving ? 'Saving Preferences...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
