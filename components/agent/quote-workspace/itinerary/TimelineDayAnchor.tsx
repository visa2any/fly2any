"use client";

import { format, parseISO } from "date-fns";
import { MapPin, Plane, Sun, Palmtree, PartyPopper, Camera, Sparkles, Heart, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useViewMode } from "./ViewModeContext";
import { getDayOneLinerSeeded, type ToneProfile, type DayMood } from "./ToneSystem";
import { generateDaySubtitle, getDayCity, type ProductType } from "./ItemRoleSystem";

interface TimelineDayAnchorProps {
  date: string;
  dayNumber: number;
  location?: string;
  label?: "arrival" | "departure" | "free" | "park" | "explore" | "celebration";
  isFirst?: boolean;
  isLast?: boolean;
  itemCount?: number;
  tone?: ToneProfile;
  /** Items for this day - used to generate semantic subtitle */
  dayItems?: { type: ProductType; details?: any }[];
}

// Map label to DayMood for tone system
const labelToMood: Record<string, DayMood> = {
  arrival: "arrival",
  departure: "departure",
  free: "free",
  park: "explore",
  explore: "explore",
  celebration: "celebration",
};

// Agent view label config (compact, functional)
const labelConfig = {
  arrival: { text: "Arrival Day", icon: Plane, color: "text-blue-600 bg-blue-50 border-blue-200" },
  departure: { text: "Departure Day", icon: Plane, color: "text-orange-600 bg-orange-50 border-orange-200" },
  free: { text: "Free Day", icon: Sun, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  park: { text: "Park Day", icon: Palmtree, color: "text-purple-600 bg-purple-50 border-purple-200" },
  explore: { text: "Explore Day", icon: Camera, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  celebration: { text: "Special Day", icon: PartyPopper, color: "text-pink-600 bg-pink-50 border-pink-200" },
};

// Client view emotional labels (aspirational, elegant)
const clientLabelConfig = {
  arrival: { text: "Your Journey Begins", icon: Sparkles, gradient: "from-blue-500 to-indigo-500" },
  departure: { text: "Farewell for Now", icon: Heart, gradient: "from-orange-500 to-rose-500" },
  free: { text: "Time to Explore", icon: Compass, gradient: "from-emerald-500 to-teal-500" },
  park: { text: "Adventure Awaits", icon: Palmtree, gradient: "from-purple-500 to-pink-500" },
  explore: { text: "Discovery Day", icon: Camera, gradient: "from-cyan-500 to-blue-500" },
  celebration: { text: "A Special Day", icon: PartyPopper, gradient: "from-pink-500 to-rose-500" },
};

export default function TimelineDayAnchor({
  date,
  dayNumber,
  location,
  label,
  isFirst,
  isLast,
  itemCount = 0,
  tone = "family",
  dayItems = [],
}: TimelineDayAnchorProps) {
  const { viewMode } = useViewMode();

  // Safe date parsing with fallback
  const safeParseDate = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const parsedDate = safeParseDate(date);
  const weekday = parsedDate ? format(parsedDate, "EEEE") : "Day";
  const shortDate = parsedDate ? format(parsedDate, "MMM d") : "";
  const isClientView = viewMode === "client";

  // Generate semantic subtitle from day items
  const semanticSubtitle = dayItems.length > 0
    ? generateDaySubtitle(dayItems, isFirst, isLast)
    : null;

  // Get city from items (fallback to location prop)
  const dayCity = getDayCity(dayItems) || location;

  // Get emotional one-liner for client view
  const mood: DayMood = label ? labelToMood[label] : isFirst ? "arrival" : isLast ? "departure" : "explore";
  const oneLiner = getDayOneLinerSeeded(tone, mood, dayNumber);

  // Agent view labels
  const labelInfo = label ? labelConfig[label] : null;
  const LabelIcon = labelInfo?.icon;

  // Client view labels
  const clientLabel = label ? clientLabelConfig[label] : null;
  const ClientLabelIcon = clientLabel?.icon;

  // Client View - Elegant, emotional design
  if (isClientView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: dayNumber * 0.08, type: "spring", stiffness: 100 }}
        className="relative"
      >
        {/* Main Day Card */}
        <div className={`relative rounded-2xl overflow-hidden ${
          isFirst || isLast
            ? "bg-gradient-to-br from-gray-50 to-white shadow-md border border-gray-100"
            : "bg-white/80"
        }`}>
          <div className="px-4 py-3">
            {/* Day Number + Date Row */}
            <div className="flex items-center gap-3">
              {/* Day Circle - Premium gradient */}
              <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                isFirst
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  : isLast
                    ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white"
                    : "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
              }`}>
                {dayNumber}
                {/* Subtle glow for first/last */}
                {(isFirst || isLast) && (
                  <div className={`absolute inset-0 rounded-xl blur-md opacity-30 -z-10 ${
                    isFirst ? "bg-blue-400" : "bg-orange-400"
                  }`} />
                )}
              </div>

              {/* Date Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-gray-900">{weekday}</h3>
                  <span className="text-sm text-gray-400">{shortDate}</span>
                </div>

                {/* Emotional One-liner */}
                <p className="text-sm text-gray-500 mt-0.5 italic">
                  {oneLiner}
                </p>
              </div>

              {/* Client Label Badge */}
              {clientLabel && ClientLabelIcon && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${clientLabel.gradient} text-white text-xs font-medium shadow-sm`}>
                  <ClientLabelIcon className="w-3.5 h-3.5" />
                  <span>{clientLabel.text}</span>
                </div>
              )}
            </div>

            {/* Location - subtle, elegant */}
            {location && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 pl-14">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Agent View - Compact, functional
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

        {/* Secondary Line: City • Semantic Subtitle */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {dayCity && (
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <MapPin className="w-3 h-3 text-gray-400" />
              {dayCity}
            </span>
          )}
          {dayCity && semanticSubtitle && (
            <span className="text-gray-300">•</span>
          )}
          {semanticSubtitle && (
            <span className="text-sm text-gray-500 italic">
              {semanticSubtitle}
            </span>
          )}
        </div>

        {/* Label Badge (if applicable) */}
        {labelInfo && LabelIcon && (
          <div className="mt-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${labelInfo.color}`}>
              <LabelIcon className="w-3.5 h-3.5" />
              {labelInfo.text}
            </span>
          </div>
        )}

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
