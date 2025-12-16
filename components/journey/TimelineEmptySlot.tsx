'use client';

/**
 * Timeline Empty Slot
 * Fly2Any Travel Operating System
 */

import React from 'react';
import { Plus, Sun, Sunset, Moon, MoonStar } from 'lucide-react';

interface TimelineEmptySlotProps {
  timeSlot: string;
  onClick: () => void;
}

// Time slot icons
const TIME_ICONS: Record<string, React.ElementType> = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
  night: MoonStar,
};

// Time slot labels
const TIME_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

export function TimelineEmptySlot({ timeSlot, onClick }: TimelineEmptySlotProps) {
  const Icon = TIME_ICONS[timeSlot] || Sun;
  const label = TIME_LABELS[timeSlot] || timeSlot;

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-[#D63A35] hover:bg-red-50/30 transition-colors group"
    >
      <div className="flex items-center justify-center gap-3">
        <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#D63A35] transition-colors" />
        <span className="text-sm text-gray-500 group-hover:text-[#D63A35] transition-colors">
          {label}
        </span>
        <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#D63A35] transition-colors" />
        <span className="text-sm text-gray-500 group-hover:text-[#D63A35] transition-colors">
          Add experience
        </span>
      </div>
    </button>
  );
}

export default TimelineEmptySlot;
