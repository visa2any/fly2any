"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sunrise, Sun, Sunset, Moon, Clock } from "lucide-react";

type TimeSegment = "morning" | "afternoon" | "evening" | "night" | "flexible";

interface TimeOfDaySegmentProps {
  segment: TimeSegment;
  children: ReactNode;
  itemCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const segmentConfig: Record<TimeSegment, {
  label: string;
  timeRange: string;
  icon: typeof Sunrise;
  gradient: string;
  accentColor: string;
  bgColor: string;
}> = {
  morning: {
    label: "Morning",
    timeRange: "6:00 AM – 12:00 PM",
    icon: Sunrise,
    gradient: "from-amber-400 to-orange-400",
    accentColor: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  afternoon: {
    label: "Afternoon",
    timeRange: "12:00 PM – 6:00 PM",
    icon: Sun,
    gradient: "from-yellow-400 to-amber-400",
    accentColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  evening: {
    label: "Evening",
    timeRange: "6:00 PM – 10:00 PM",
    icon: Sunset,
    gradient: "from-orange-400 to-rose-400",
    accentColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  night: {
    label: "Night",
    timeRange: "10:00 PM – 6:00 AM",
    icon: Moon,
    gradient: "from-indigo-400 to-purple-400",
    accentColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  flexible: {
    label: "Flexible",
    timeRange: "Anytime",
    icon: Clock,
    gradient: "from-gray-400 to-slate-400",
    accentColor: "text-gray-600",
    bgColor: "bg-gray-50",
  },
};

export default function TimeOfDaySegment({
  segment,
  children,
  itemCount = 0,
  collapsed = false,
  onToggleCollapse,
}: TimeOfDaySegmentProps) {
  const config = segmentConfig[segment];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Segment Header */}
      <div
        className={`flex items-center gap-3 py-2 px-3 rounded-lg ${config.bgColor} cursor-pointer transition-all hover:shadow-sm`}
        onClick={onToggleCollapse}
      >
        {/* Time Icon */}
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>

        {/* Label & Time Range */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${config.accentColor}`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-400">
              {config.timeRange}
            </span>
          </div>
        </div>

        {/* Item Count Badge */}
        {itemCount > 0 && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.accentColor} border border-current/20`}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        )}

        {/* Collapse Indicator */}
        {onToggleCollapse && (
          <motion.div
            animate={{ rotate: collapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Segment Content */}
      <motion.div
        initial={false}
        animate={{
          height: collapsed ? 0 : "auto",
          opacity: collapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="pl-11 pt-2 space-y-2">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper to determine time segment from a time string
export function getTimeSegment(time?: string): TimeSegment {
  if (!time) return "flexible";

  // Parse time string (e.g., "14:30", "2:30 PM", "14:30:00")
  let hours: number;

  if (time.includes(":")) {
    const parts = time.split(":");
    hours = parseInt(parts[0], 10);

    // Handle 12-hour format
    if (time.toLowerCase().includes("pm") && hours !== 12) {
      hours += 12;
    } else if (time.toLowerCase().includes("am") && hours === 12) {
      hours = 0;
    }
  } else {
    return "flexible";
  }

  if (hours >= 6 && hours < 12) return "morning";
  if (hours >= 12 && hours < 18) return "afternoon";
  if (hours >= 18 && hours < 22) return "evening";
  return "night";
}

// Helper to parse departure/arrival times from various formats
export function parseFlightTime(flight: any): { departure: TimeSegment; arrival: TimeSegment } {
  const depTime = flight.departureTime || flight.departure?.time;
  const arrTime = flight.arrivalTime || flight.arrival?.time;

  return {
    departure: getTimeSegment(depTime),
    arrival: getTimeSegment(arrTime),
  };
}
