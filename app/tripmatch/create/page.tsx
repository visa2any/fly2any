'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Settings,
  Eye,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Globe,
  Lock,
  Shield,
  Crown,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';

interface TripFormData {
  title: string;
  description: string;
  destination: string;
  destinationCode: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  category: string;
  visibility: 'public' | 'private';
  maxMembers: number;
  minMembers: number;
  estimatedPricePerPerson: number;
  coverImageUrl: string;
  tags: string[];
  rules: string;
}

const CATEGORIES = [
  { value: 'party', label: 'Party', emoji: '🎉', color: 'from-purple-500 to-pink-500' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔️', color: 'from-orange-500 to-red-500' },
  { value: 'girls_trip', label: 'Girls Trip', emoji: '💃', color: 'from-pink-500 to-rose-500' },
  { value: 'guys_trip', label: 'Guys Trip', emoji: '🏀', color: 'from-blue-500 to-cyan-500' },
  { value: 'cultural', label: 'Cultural', emoji: '🎭', color: 'from-amber-500 to-yellow-500' },
  { value: 'wellness', label: 'Wellness', emoji: '🧘', color: 'from-green-500 to-emerald-500' },
  { value: 'luxury', label: 'Luxury', emoji: '👑', color: 'from-yellow-500 to-amber-600' },
  { value: 'budget', label: 'Budget', emoji: '💰', color: 'from-teal-500 to-cyan-500' },
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1565023281550-db6c3a6f6c29?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
];

export default function CreateTripPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({
    title: '',
    description: '',
    destination: '',
    destinationCode: '',
    destinationCountry: '',
    startDate: '',
    endDate: '',
    category: 'adventure',
    visibility: 'public',
    maxMembers: 12,
    minMembers: 4,
    estimatedPricePerPerson: 1500,
    coverImageUrl: SAMPLE_IMAGES[0],
    tags: [],
    rules: '',
  });

  const updateFormData = (updates: Partial<TripFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleCreateTrip = async () => {
    try {
      setCreating(true);

      const response = await fetch('/api/tripmatch/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Trip created successfully!');
        router.push(`/tripmatch/trips/${data.data.id}`);
      } else {
        alert(data.error || 'Failed to create trip');
      }
    } catch (err) {
      alert('Network error. Please try again.');
      console.error('Error creating trip:', err);
    } finally {
      setCreating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title &&
          formData.destination &&
          formData.startDate &&
          formData.endDate &&
          formData.category
        );
      case 2:
        return formData.maxMembers >= formData.minMembers && formData.estimatedPricePerPerson > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getDurationDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculatePotentialEarnings = () => {
    const potentialMembers = formData.maxMembers - 1;
    const baseCredits = 50;
    let multiplier = 1.0;

    if (potentialMembers >= 12) multiplier = 2.0;
    else if (potentialMembers >= 8) multiplier = 1.5;

    return Math.floor(potentialMembers * baseCredits * multiplier);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Create New Trip</h1>
          <p className="text-white/60">Build your dream group travel experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                    currentStep >= step
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      currentStep > step ? 'bg-purple-600' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-white/60">
            <span>Basic Info</span>
            <span>Settings</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                Basic Information
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Trip Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="🏝️ Amazing Beach Adventure"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Describe your trip..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Destination <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => updateFormData({ destination: e.target.value })}
                        placeholder="Ibiza, Spain"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Airport Code
                    </label>
                    <input
                      type="text"
                      value={formData.destinationCode}
                      onChange={(e) => updateFormData({ destinationCode: e.target.value })}
                      placeholder="IBZ"
                      maxLength={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 uppercase"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => updateFormData({ startDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => updateFormData({ endDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-white mb-3">
                    Trip Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => updateFormData({ category: cat.value })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.category === cat.value
                            ? `bg-gradient-to-br ${cat.color} border-transparent text-white`
                            : 'bg-white/5 border-white/20 text-white/60 hover:border-white/40'
                        }`}
                      >
                        <div className="text-3xl mb-2">{cat.emoji}</div>
                        <div className="text-sm font-bold">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Cover Image</label>
                  <div className="grid grid-cols-3 gap-3">
                    {SAMPLE_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateFormData({ coverImageUrl: img })}
                        className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          formData.coverImageUrl === img
                            ? 'border-purple-500 ring-2 ring-purple-500/50'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${img})` }}
                        />
                        {formData.coverImageUrl === img && (
                          <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                            <Check className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Settings */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-400" />
                Trip Settings
              </h2>

              <div className="space-y-6">
                {/* Group Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Minimum Members
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                      <input
                        type="number"
                        value={formData.minMembers}
                        onChange={(e) =>
                          updateFormData({ minMembers: parseInt(e.target.value) })
                        }
                        min={2}
                        max={formData.maxMembers}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Maximum Members <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                      <input
                        type="number"
                        value={formData.maxMembers}
                        onChange={(e) =>
                          updateFormData({ maxMembers: parseInt(e.target.value) })
                        }
                        min={formData.minMembers}
                        max={50}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Estimated Price Per Person (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                    <input
                      type="number"
                      value={formData.estimatedPricePerPerson}
                      onChange={(e) =>
                        updateFormData({ estimatedPricePerPerson: parseInt(e.target.value) })
                      }
                      min={100}
                      step={50}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <p className="text-sm text-white/60 mt-2">
                    Total trip value: ${formData.estimatedPricePerPerson * formData.maxMembers}
                  </p>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Visibility</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateFormData({ visibility: 'public' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.visibility === 'public'
                          ? 'bg-purple-600 border-transparent text-white'
                          : 'bg-white/5 border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      <Globe className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-bold">Public</div>
                      <div className="text-xs opacity-80 mt-1">Anyone can see and join</div>
                    </button>
                    <button
                      onClick={() => updateFormData({ visibility: 'private' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.visibility === 'private'
                          ? 'bg-purple-600 border-transparent text-white'
                          : 'bg-white/5 border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      <Lock className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-bold">Private</div>
                      <div className="text-xs opacity-80 mt-1">Invite-only</div>
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Tags (comma separated)
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      onChange={(e) =>
                        updateFormData({ tags: e.target.value.split(',').map((t) => t.trim()) })
                      }
                      placeholder="beach, party, summer"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Trip Rules & Guidelines
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                    <textarea
                      value={formData.rules}
                      onChange={(e) => updateFormData({ rules: e.target.value })}
                      placeholder="No solo travelers. Must be 21+. etc."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Preview Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                <div
                  className="h-64 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${formData.coverImageUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-500/90 text-white text-xs font-bold rounded-full uppercase">
                        {formData.category.replace('_', ' ')}
                      </span>
                      {formData.visibility === 'public' && (
                        <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          PUBLIC
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">{formData.title}</h2>
                    <div className="flex items-center gap-4 text-white/90 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {formData.destination}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {getDurationDays()} days
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formData.maxMembers} spots
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-white/60 mb-1">Price Per Person</p>
                      <p className="text-2xl font-bold text-white">
                        ${formData.estimatedPricePerPerson}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4">
                      <p className="text-sm text-white/80 mb-1">Potential Earnings</p>
                      <p className="text-2xl font-bold text-white">
                        ${Math.floor(calculatePotentialEarnings() / 10)}
                      </p>
                      <p className="text-xs text-white/80">({calculatePotentialEarnings()} credits)</p>
                    </div>
                  </div>

                  {formData.description && (
                    <div className="mb-4">
                      <p className="text-sm font-bold text-white mb-2">Description</p>
                      <p className="text-white/80 text-sm">{formData.description}</p>
                    </div>
                  )}

                  {formData.tags.length > 0 && formData.tags[0] !== '' && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation */}
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Ready to Publish?</h3>
                    <p className="text-sm text-white/80">
                      Your trip will be {formData.visibility} and visible to{' '}
                      {formData.visibility === 'public' ? 'everyone' : 'invited members only'}. You
                      can edit trip details anytime before the trip starts.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleCreateTrip}
              disabled={creating || !canProceed()}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg"
            >
              {creating ? 'Creating...' : 'Create Trip'}
              <Crown className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
