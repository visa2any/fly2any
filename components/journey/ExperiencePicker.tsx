'use client';

/**
 * Experience Picker Modal
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 * Beautiful infographic-style design
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Utensils,
  Landmark,
  Map,
  Ticket,
  ShoppingBag,
  Sparkles,
  Star,
  Clock,
  MapPin,
  Bus,
  Dumbbell,
  Music,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { JourneyExperience, ExperienceType, TimeSlot, InterestType } from '@/lib/journey/types';
import { AIExperienceEngine } from '@/lib/journey/services/AIExperienceEngine';

// ============================================================================
// TYPES
// ============================================================================

interface ExperiencePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (experience: JourneyExperience) => void;
  destinationCode: string;
  timeSlot: TimeSlot;
  interests: InterestType[];
}

// ============================================================================
// PREMIUM COLOR SYSTEM
// ============================================================================

interface CategoryStyle {
  icon: React.ElementType;
  label: string;
  gradient: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
}

const CATEGORY_STYLES: Record<ExperienceType, CategoryStyle> = {
  restaurant: {
    icon: Utensils,
    label: 'Dining',
    gradient: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    accentColor: 'bg-orange-500',
  },
  attraction: {
    icon: Landmark,
    label: 'Attractions',
    gradient: 'from-blue-500 to-indigo-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    accentColor: 'bg-blue-500',
  },
  tour: {
    icon: Map,
    label: 'Tours',
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    accentColor: 'bg-emerald-500',
  },
  activity: {
    icon: Dumbbell,
    label: 'Activities',
    gradient: 'from-purple-500 to-violet-500',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    accentColor: 'bg-purple-500',
  },
  show: {
    icon: Music,
    label: 'Shows & Events',
    gradient: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    accentColor: 'bg-pink-500',
  },
  transport: {
    icon: Bus,
    label: 'Transport',
    gradient: 'from-slate-500 to-gray-600',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
    accentColor: 'bg-slate-500',
  },
  shopping: {
    icon: ShoppingBag,
    label: 'Shopping',
    gradient: 'from-fuchsia-500 to-pink-500',
    bgLight: 'bg-fuchsia-50',
    textColor: 'text-fuchsia-600',
    borderColor: 'border-fuchsia-200',
    accentColor: 'bg-fuchsia-500',
  },
  wellness: {
    icon: Heart,
    label: 'Wellness',
    gradient: 'from-cyan-500 to-sky-500',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    accentColor: 'bg-cyan-500',
  },
};

const TIME_STYLES: Record<TimeSlot, { label: string; gradient: string; icon: string }> = {
  morning: { label: 'Morning', gradient: 'from-amber-400 to-orange-400', icon: '🌅' },
  afternoon: { label: 'Afternoon', gradient: 'from-sky-400 to-blue-400', icon: '☀️' },
  evening: { label: 'Evening', gradient: 'from-purple-400 to-pink-400', icon: '🌆' },
  night: { label: 'Night', gradient: 'from-indigo-500 to-violet-600', icon: '🌙' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ExperiencePicker({
  isOpen,
  onClose,
  onSelect,
  destinationCode,
  timeSlot,
  interests,
}: ExperiencePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ExperienceType | 'all'>('all');

  // Generate suggestions
  const suggestions = useMemo(() => {
    const mockDay = {
      dayNumber: 1,
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: 'Mon',
      isArrivalDay: false,
      isDepartureDay: false,
      segments: [],
      experiences: [],
    };

    const result = AIExperienceEngine.getSuggestions(
      mockDay,
      destinationCode,
      { pace: 'balanced', interests },
      []
    );

    return result.experiences;
  }, [destinationCode, interests]);

  // Filter experiences
  const filteredExperiences = useMemo(() => {
    return suggestions.filter((exp) => {
      if (selectedType !== 'all' && exp.type !== selectedType) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          exp.name.toLowerCase().includes(query) ||
          exp.description?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [suggestions, selectedType, searchQuery]);

  // Group by type for infographic display
  const groupedByType = useMemo(() => {
    const groups: Record<ExperienceType, JourneyExperience[]> = {} as any;
    filteredExperiences.forEach(exp => {
      if (!groups[exp.type]) groups[exp.type] = [];
      groups[exp.type].push(exp);
    });
    return groups;
  }, [filteredExperiences]);

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return 'All day';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!isOpen) return null;

  const timeStyle = TIME_STYLES[timeSlot];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">

        {/* Premium Header with Gradient */}
        <div className={`bg-gradient-to-r ${timeStyle.gradient} px-5 py-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{timeStyle.icon}</span>
              <div>
                <h2 className="font-bold text-lg">Add {timeStyle.label} Experience</h2>
                <p className="text-white/80 text-sm">{destinationCode} • AI-Powered Suggestions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences, tours, restaurants..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Category Pills - Horizontal Scroll */}
        <div className="px-4 py-2.5 overflow-x-auto scrollbar-hide border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedType === 'all'
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              All
            </button>
            {(Object.keys(CATEGORY_STYLES) as ExperienceType[]).map((type) => {
              const style = CATEGORY_STYLES[type];
              const Icon = style.icon;
              const count = groupedByType[type]?.length || 0;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedType === type
                      ? `bg-gradient-to-r ${style.gradient} text-white shadow-md`
                      : `${style.bgLight} ${style.textColor} hover:brightness-95`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {style.label}
                  {count > 0 && (
                    <span className={`ml-1 text-xs ${selectedType === type ? 'text-white/80' : 'opacity-60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results - Compact Vertical Cards */}
        <div className="flex-1 overflow-y-auto">
          {filteredExperiences.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-medium">No experiences found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search or filter</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredExperiences.map((exp) => {
                const style = CATEGORY_STYLES[exp.type];
                const Icon = style.icon;
                return (
                  <button
                    key={exp.id}
                    onClick={() => {
                      onSelect({ ...exp, timeSlot, status: 'added' });
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border ${style.borderColor} ${style.bgLight}/30 hover:${style.bgLight} text-left transition-all group active:scale-[0.99]`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Category Icon */}
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-[15px] truncate">
                            {exp.name}
                          </h3>
                          {exp.rating && exp.rating >= 4.7 && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                              TOP
                            </span>
                          )}
                        </div>

                        {/* Compact Meta Row */}
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className={`${style.textColor} font-medium`}>
                            {style.label}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-0.5 text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDuration(exp.duration)}
                          </span>
                          {exp.rating && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center gap-0.5 text-gray-500">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {exp.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price & Arrow */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {exp.price.amount === 0 ? (
                          <span className="text-emerald-600 font-bold text-sm">Free</span>
                        ) : (
                          <span className="font-bold text-gray-900">
                            ${exp.price.amount}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 ${style.textColor} opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {filteredExperiences.length} available
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                AI curated
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Tap to add to your journey
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExperiencePicker;
