"use client";

import { format, parseISO, differenceInDays } from "date-fns";
import { MapPin, Plane, Sun, Moon, Palmtree, PartyPopper, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineDayAnchorProps {
  date: string;
  dayNumber: number;
  location?: string;
  label?: "arrival" | "departure" | "free" | "park" | "explore" | "celebration";
  isFirst?: boolean;
  isLast?: boolean;
  itemCount?: number;
}

const labelConfig = {
  arrival: { text: "Arrival Day", icon: Plane, color: "text-blue-600 bg-blue-50 border-blue-200" },
  departure: { text: "Departure Day", icon: Plane, color: "text-orange-600 bg-orange-50 border-orange-200" },
  free: { text: "Free Day", icon: Sun, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  park: { text: "Park Day", icon: Palmtree, color: "text-purple-600 bg-purple-50 border-purple-200" },
  explore: { text: "Explore Day", icon: Camera, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  celebration: { text: "Special Day", icon: PartyPopper, color: "text-pink-600 bg-pink-50 border-pink-200" },
};

export default function TimelineDayAnchor({
  date,
  dayNumber,
  location,
  label,
  isFirst,
  isLast,
  itemCount = 0,
}: TimelineDayAnchorProps) {
  const parsedDate = parseISO(date);
  const weekday = format(parsedDate, "EEEE");
  const fullDate = format(parsedDate, "MMMM d, yyyy");
  const shortDate = format(parsedDate, "MMM d");

  const labelInfo = label ? labelConfig[label] : null;
  const LabelIcon = labelInfo?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: dayNumber * 0.05 }}
      className="relative flex items-start gap-4 pb-2"
    >
      {/* Day Number Circle - Timeline Node */}
      <div className="relative z-10 flex-shrink-0">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${
          isFirst
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
            : isLast
            ? "bg-gradient-to-br from-orange-500 to-red-600 text-white"
            : "bg-gradient-to-br from-gray-800 to-gray-900 text-white"
        }`}>
          {dayNumber}
        </div>
        {/* Pulse effect for first/last day */}
        {(isFirst || isLast) && (
          <div className={`absolute inset-0 rounded-2xl animate-ping opacity-20 ${
            isFirst ? "bg-blue-500" : "bg-orange-500"
          }`} />
        )}
      </div>

      {/* Day Info */}
      <div className="flex-1 min-w-0 pt-1">
        {/* Primary Line: Day + Weekday + Date */}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-gray-900">
            Day {dayNumber}
          </h3>
          <span className="text-gray-400">—</span>
          <span className="text-base font-medium text-gray-700">{weekday}</span>
          <span className="text-sm text-gray-400">{shortDate}</span>
        </div>

        {/* Secondary Line: Location + Label */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {location && (
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {location}
            </span>
          )}

          {labelInfo && LabelIcon && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${labelInfo.color}`}>
              <LabelIcon className="w-3.5 h-3.5" />
              {labelInfo.text}
            </span>
          )}
        </div>

        {/* Items count indicator */}
        {itemCount > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            {itemCount} {itemCount === 1 ? "experience" : "experiences"} planned
          </p>
        )}
      </div>
    </motion.div>
  );
}
