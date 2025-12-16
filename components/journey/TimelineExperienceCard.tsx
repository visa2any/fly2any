'use client';

/**
 * Timeline Experience Card
 * Fly2Any Travel Operating System
 */

import React from 'react';
import {
  Utensils,
  Landmark,
  Map,
  Ticket,
  ShoppingBag,
  Sparkles,
  Check,
  X,
  Clock,
  Star,
} from 'lucide-react';
import { JourneyExperience, ExperienceType, TimeSlot } from '@/lib/journey/types';

interface TimelineExperienceCardProps {
  experience: JourneyExperience;
  onAccept?: () => void;
  onDismiss?: () => void;
  onClick?: () => void;
}

// Icon map for experience types
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

// Time slot labels
const TIME_LABELS: Record<TimeSlot, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

export function TimelineExperienceCard({
  experience,
  onAccept,
  onDismiss,
  onClick,
}: TimelineExperienceCardProps) {
  const Icon = TYPE_ICONS[experience.type] || Sparkles;
  const isSuggested = experience.status === 'suggested';
  const isAdded = experience.status === 'added' || experience.status === 'booked';

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl transition-colors ${
        isSuggested
          ? 'border-2 border-dashed border-yellow-300 bg-yellow-50/50'
          : isAdded
          ? 'border-2 border-[#D63A35]/20 bg-red-50/30'
          : 'border-2 border-gray-200 bg-white'
      } ${onClick ? 'cursor-pointer hover:border-gray-300' : ''}`}
    >
      {/* AI Badge */}
      {experience.source === 'ai' && isSuggested && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
          <Sparkles className="w-3 h-3" />
          AI Suggestion
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isSuggested ? 'bg-yellow-100' : 'bg-[#D63A35]/10'
          }`}
        >
          <Icon className={`w-5 h-5 ${isSuggested ? 'text-yellow-700' : 'text-[#D63A35]'}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{experience.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{experience.location.name}</p>
            </div>

            {/* Status Actions */}
            {isSuggested && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept?.();
                  }}
                  className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                  title="Accept suggestion"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss?.();
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  title="Dismiss suggestion"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          {experience.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{experience.description}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {/* Time Slot */}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {TIME_LABELS[experience.timeSlot]} • {formatDuration(experience.duration)}
            </span>

            {/* Rating */}
            {experience.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {experience.rating.toFixed(1)}
              </span>
            )}

            {/* AI Confidence */}
            {isSuggested && experience.aiConfidence && (
              <span className="text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">
                {experience.aiConfidence}% match
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-2 flex items-center justify-between">
            {experience.tags && experience.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {experience.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <span className={`font-semibold ${experience.price.isEstimate ? 'text-gray-600' : 'text-gray-900'}`}>
              {experience.price.amount === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                <>
                  {experience.price.currency} {experience.price.amount}
                  {experience.price.isEstimate && <span className="text-xs font-normal ml-1">(est.)</span>}
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineExperienceCard;
