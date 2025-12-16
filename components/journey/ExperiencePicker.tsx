'use client';

/**
 * Experience Picker Modal
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
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
  Filter,
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
// CONSTANTS
// ============================================================================

const TYPE_ICONS: Record<ExperienceType, React.ElementType> = {
  restaurant: Utensils,
  attraction: Landmark,
  tour: Map,
  activity: Ticket,
  show: Ticket,
  transport: Map,
  shopping: ShoppingBag,
  wellness: Sparkles,
};

const TYPE_LABELS: Record<ExperienceType, string> = {
  restaurant: 'Dining',
  attraction: 'Attractions',
  tour: 'Tours',
  activity: 'Activities',
  show: 'Shows',
  transport: 'Transport',
  shopping: 'Shopping',
  wellness: 'Wellness',
};

const TIME_LABELS: Record<TimeSlot, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
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
    // Create a mock day for the AI engine
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
      // Type filter
      if (selectedType !== 'all' && exp.type !== selectedType) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          exp.name.toLowerCase().includes(query) ||
          exp.description?.toLowerCase().includes(query) ||
          exp.type.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [suggestions, selectedType, searchQuery]);

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Add Experience</h2>
            <p className="text-xs text-gray-500">{TIME_LABELS[timeSlot]} • {destinationCode}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-0 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Type Filters */}
        <div className="px-4 py-2 border-b border-gray-100 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === 'all'
                  ? 'bg-[#D63A35] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {(Object.keys(TYPE_LABELS) as ExperienceType[]).map((type) => {
              const Icon = TYPE_ICONS[type];
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedType === type
                      ? 'bg-[#D63A35] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredExperiences.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No experiences found</p>
              <p className="text-sm text-gray-400">Try a different search or filter</p>
            </div>
          ) : (
            filteredExperiences.map((exp) => {
              const Icon = TYPE_ICONS[exp.type];
              return (
                <button
                  key={exp.id}
                  onClick={() => {
                    onSelect({ ...exp, timeSlot, status: 'added' });
                    onClose();
                  }}
                  className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#D63A35] bg-white text-left transition-all group"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-red-50 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-[#D63A35] transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate group-hover:text-[#D63A35] transition-colors">
                        {exp.name}
                      </h3>
                      {exp.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                          {exp.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(exp.duration)}
                        </span>
                        {exp.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {exp.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {exp.location.name}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      {exp.price.amount === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        <span className="font-semibold text-gray-900">
                          ${exp.price.amount}
                        </span>
                      )}
                      {exp.price.isEstimate && (
                        <p className="text-xs text-gray-400">est.</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {filteredExperiences.length} experience{filteredExperiences.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExperiencePicker;
