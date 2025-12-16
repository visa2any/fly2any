'use client';

/**
 * Journey Timeline - Core Visual Experience
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plane, Building2, Sparkles, AlertTriangle } from 'lucide-react';
import { Journey, JourneyDay } from '@/lib/journey/types';
import { TimelineFlightCard } from './TimelineFlightCard';
import { TimelineHotelCard } from './TimelineHotelCard';
import { TimelineExperienceCard } from './TimelineExperienceCard';
import { TimelineEmptySlot } from './TimelineEmptySlot';
import { format, parseISO } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

interface JourneyTimelineProps {
  journey: Journey;
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  onAddExperience: (dayIndex: number, timeSlot: string) => void;
  onRemoveExperience: (dayIndex: number, experienceId: string) => void;
  onAcceptSuggestion: (dayIndex: number, experienceId: string) => void;
  onSelectFlight?: () => void;
  onSelectHotel?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function JourneyTimeline({
  journey,
  selectedDayIndex,
  onSelectDay,
  onAddExperience,
  onRemoveExperience,
  onAcceptSuggestion,
  onSelectFlight,
  onSelectHotel,
}: JourneyTimelineProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
      } else {
        newSet.add(dayIndex);
      }
      return newSet;
    });
    onSelectDay(dayIndex);
  };

  return (
    <div className="w-full">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D63A35]" />
          <h2 className="text-lg font-semibold text-gray-900">Your Journey</h2>
        </div>
        <span className="text-sm text-gray-500">
          {journey.duration} days • {journey.origin.code} → {journey.destination.code}
        </span>
      </div>

      {/* Warnings */}
      {journey.warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {journey.warnings.slice(0, 2).map((warning) => (
            <div
              key={warning.id}
              className={`flex items-start gap-3 p-3 rounded-xl ${
                warning.severity === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : warning.severity === 'warning'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  warning.severity === 'error'
                    ? 'text-red-500'
                    : warning.severity === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-500'
                }`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{warning.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{warning.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Days List */}
      <div className="space-y-3">
        {journey.days.map((day, index) => (
          <DayContainer
            key={day.dayNumber}
            day={day}
            dayIndex={index}
            isExpanded={expandedDays.has(index)}
            isSelected={selectedDayIndex === index}
            onToggle={() => toggleDay(index)}
            onAddExperience={(timeSlot) => onAddExperience(index, timeSlot)}
            onRemoveExperience={(id) => onRemoveExperience(index, id)}
            onAcceptSuggestion={(id) => onAcceptSuggestion(index, id)}
            onSelectFlight={onSelectFlight}
            onSelectHotel={onSelectHotel}
            pace={journey.preferences.pace}
          />
        ))}
      </div>

      {/* Timeline Connector Visual */}
      <div className="absolute left-8 top-24 bottom-8 w-0.5 bg-gradient-to-b from-[#D63A35] via-gray-200 to-[#D63A35] hidden lg:block" />
    </div>
  );
}

// ============================================================================
// DAY CONTAINER
// ============================================================================

interface DayContainerProps {
  day: JourneyDay;
  dayIndex: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onAddExperience: (timeSlot: string) => void;
  onRemoveExperience: (id: string) => void;
  onAcceptSuggestion: (id: string) => void;
  onSelectFlight?: () => void;
  onSelectHotel?: () => void;
  pace: 'relaxed' | 'balanced' | 'intensive';
}

function DayContainer({
  day,
  dayIndex,
  isExpanded,
  isSelected,
  onToggle,
  onAddExperience,
  onRemoveExperience,
  onAcceptSuggestion,
  onSelectFlight,
  onSelectHotel,
  pace,
}: DayContainerProps) {
  const formattedDate = format(parseISO(day.date), 'EEE, MMM d');

  // Get day badge
  const getDayBadge = () => {
    if (day.isArrivalDay) return { text: 'Arrival', color: 'bg-green-100 text-green-700' };
    if (day.isDepartureDay) return { text: 'Departure', color: 'bg-blue-100 text-blue-700' };
    return null;
  };

  const badge = getDayBadge();

  // Count items
  const flightCount = day.segments.filter((s) => s.type === 'outbound-flight' || s.type === 'return-flight').length;
  const experienceCount = day.experiences.filter((e) => e.status === 'added' || e.status === 'booked').length;
  const suggestionCount = day.experiences.filter((e) => e.status === 'suggested').length;

  // Get available slots based on pace
  const getAvailableSlots = (): string[] => {
    if (day.isArrivalDay) {
      return pace !== 'relaxed' ? ['afternoon', 'evening'] : ['evening'];
    }
    if (day.isDepartureDay) {
      return pace === 'intensive' ? ['morning', 'afternoon'] : ['morning'];
    }
    switch (pace) {
      case 'relaxed':
        return ['morning', 'evening'];
      case 'balanced':
        return ['morning', 'afternoon', 'evening'];
      case 'intensive':
        return ['morning', 'afternoon', 'evening', 'night'];
      default:
        return ['morning', 'afternoon', 'evening'];
    }
  };

  const availableSlots = getAvailableSlots();
  const usedSlots = new Set(day.experiences.map((e) => e.timeSlot));

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all duration-200 ${
        isSelected ? 'border-[#D63A35] shadow-lg' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Day Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {/* Day Number Circle */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
              isSelected ? 'bg-[#D63A35] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {day.dayNumber}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">Day {day.dayNumber}</span>
              {badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                  {badge.text}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
            {flightCount > 0 && (
              <span className="flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" />
                {flightCount}
              </span>
            )}
            {day.accommodation && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                1
              </span>
            )}
            {experienceCount > 0 && (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D63A35]" />
                {experienceCount}
              </span>
            )}
            {suggestionCount > 0 && (
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                {suggestionCount} suggested
              </span>
            )}
          </div>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Day Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Flight Segments */}
          {day.segments
            .filter((s) => s.type === 'outbound-flight' || s.type === 'return-flight')
            .map((segment) => (
              <TimelineFlightCard
                key={segment.id}
                segment={segment as any}
                onClick={onSelectFlight}
              />
            ))}

          {/* Hotel */}
          {day.segments
            .filter((s) => s.type === 'hotel')
            .map((segment) => (
              <TimelineHotelCard
                key={segment.id}
                segment={segment as any}
                onClick={onSelectHotel}
              />
            ))}

          {/* Experiences - Sorted by time slot */}
          {day.experiences
            .sort((a, b) => {
              const order = ['morning', 'afternoon', 'evening', 'night'];
              return order.indexOf(a.timeSlot) - order.indexOf(b.timeSlot);
            })
            .map((experience) => (
              <TimelineExperienceCard
                key={experience.id}
                experience={experience}
                onAccept={() => onAcceptSuggestion(experience.id)}
                onDismiss={() => onRemoveExperience(experience.id)}
              />
            ))}

          {/* Empty Slots */}
          {availableSlots
            .filter((slot) => !usedSlots.has(slot as any))
            .map((slot) => (
              <TimelineEmptySlot
                key={slot}
                timeSlot={slot}
                onClick={() => onAddExperience(slot)}
              />
            ))}

          {/* Day Notes */}
          {day.notes && (
            <div className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3">
              {day.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JourneyTimeline;
