'use client';

/**
 * Profile Edit Modal Component
 *
 * Modal for editing user profile information
 * Features: Basic info, travel preferences, interests, languages
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any; // Current profile data
  onSave: () => void; // Callback to refresh profile
}

const TRAVEL_STYLES = [
  'Adventure', 'Backpacking', 'Luxury', 'Budget', 'Cultural',
  'Beach', 'City', 'Nature', 'Food', 'Photography', 'Solo', 'Group'
];

const INTERESTS = [
  'Hiking', 'Photography', 'Food & Dining', 'Museums', 'Nightlife',
  'Shopping', 'Sports', 'Music', 'Art', 'History', 'Architecture',
  'Wildlife', 'Festivals', 'Local Culture', 'Water Sports', 'Skiing'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
];

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '56+'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export default function ProfileEditModal({ isOpen, onClose, profile, onSave }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    locationCity: '',
    locationCountry: '',
    ageRange: '',
    gender: '',
    travelStyle: [] as string[],
    interests: [] as string[],
    languagesSpoken: [] as string[],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        locationCity: profile.locationCity || '',
        locationCountry: profile.locationCountry || '',
        ageRange: profile.ageRange || '',
        gender: profile.gender || '',
        travelStyle: profile.travelStyle || [],
        interests: profile.interests || [],
        languagesSpoken: profile.languagesSpoken || [],
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch('/api/tripmatch/profiles/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        onSave(); // Refresh profile
        onClose();
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.locationCity}
                    onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.locationCountry}
                    onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="USA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Age Range
                  </label>
                  <select
                    value={formData.ageRange}
                    onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select age range</option>
                    {AGE_RANGES.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Travel Style</h3>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setFormData({
                      ...formData,
                      travelStyle: toggleArrayItem(formData.travelStyle, style)
                    })}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      formData.travelStyle.includes(style)
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => setFormData({
                      ...formData,
                      interests: toggleArrayItem(formData.interests, interest)
                    })}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      formData.interests.includes(interest)
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setFormData({
                      ...formData,
                      languagesSpoken: toggleArrayItem(formData.languagesSpoken, lang)
                    })}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      formData.languagesSpoken.includes(lang)
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
