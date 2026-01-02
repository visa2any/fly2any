"use client";

import { motion } from "framer-motion";
import { Sparkles, Sun, Sunset, Sunrise, PartyPopper, Compass } from "lucide-react";
import { getDayChapterTitle, getMicroCopy } from "./EmotionalCopySystem";
import type { ToneProfile } from "../itinerary/ToneSystem";

type DayMood = "arrival" | "departure" | "explore" | "free" | "celebration";

interface DayChapterProps {
  dayNumber: number;
  totalDays: number;
  date: string;
  mood: DayMood;
  tone: ToneProfile;
  location?: string;
  isFirst?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}

// Get mood-specific icon and gradient
const moodConfig: Record<DayMood, { icon: typeof Sun; gradient: string; accent: string }> = {
  arrival: {
    icon: Sunrise,
    gradient: "from-blue-400 via-indigo-400 to-purple-400",
    accent: "text-indigo-600"
  },
  departure: {
    icon: Sunset,
    gradient: "from-orange-400 via-rose-400 to-pink-400",
    accent: "text-rose-600"
  },
  explore: {
    icon: Compass,
    gradient: "from-emerald-400 via-teal-400 to-cyan-400",
    accent: "text-emerald-600"
  },
  free: {
    icon: Sun,
    gradient: "from-amber-400 via-yellow-400 to-orange-400",
    accent: "text-amber-600"
  },
  celebration: {
    icon: PartyPopper,
    gradient: "from-pink-400 via-purple-400 to-indigo-400",
    accent: "text-purple-600"
  },
};

// Get chapter position for title selection
function getChapterPosition(dayNumber: number, totalDays: number): "first" | "middle" | "last" {
  if (dayNumber === 1) return "first";
  if (dayNumber === totalDays) return "last";
  return "middle";
}

// Get contextual micro-copy based on mood
function getMicroCopyContext(mood: DayMood): "arrival" | "morning" | "afternoon" | "evening" | "departure" {
  switch (mood) {
    case "arrival": return "arrival";
    case "departure": return "departure";
    case "free": return "morning";
    default: return "afternoon";
  }
}

export default function DayChapter({
  dayNumber,
  totalDays,
  date,
  mood,
  tone,
  location,
  isFirst,
  isLast,
  children,
}: DayChapterProps) {
  const config = moodConfig[mood];
  const Icon = config.icon;
  const position = getChapterPosition(dayNumber, totalDays);
  const chapterTitle = getDayChapterTitle(tone, position, dayNumber);
  const microCopy = getMicroCopy(getMicroCopyContext(mood), dayNumber);

  // Format date display
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        day: d.toLocaleDateString("en-US", { weekday: "long" }),
        date: d.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
      };
    } catch {
      return { day: "", date: dateStr };
    }
  };
  const formattedDate = formatDate(date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayNumber * 0.08 }}
      className="relative"
    >
      {/* Chapter Header */}
      <div className="relative mb-4">
        {/* Decorative gradient bar */}
        <div className={`absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r ${config.gradient} opacity-30`} />

        {/* Chapter badge */}
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: dayNumber * 0.08 + 0.1, type: "spring" }}
            className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-lg border border-gray-100"
          >
            {/* Day number badge */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md`}>
              <span className="text-white font-black text-lg">{dayNumber}</span>
            </div>

            {/* Chapter info */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg tracking-tight">{chapterTitle}</h3>
                <Icon className={`w-4 h-4 ${config.accent}`} />
              </div>
              <p className="text-xs text-gray-500">
                {formattedDate.day} • {formattedDate.date}
                {location && <span className="ml-2 text-gray-400">• {location}</span>}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Emotional micro-copy */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: dayNumber * 0.08 + 0.2 }}
        className={`text-center text-sm ${config.accent} italic mb-4 flex items-center justify-center gap-1`}
      >
        <Sparkles className="w-3 h-3" />
        {microCopy}
      </motion.p>

      {/* Day content (items) */}
      <div className="space-y-3">
        {children}
      </div>

      {/* Visual separator between days */}
      {!isLast && (
        <div className="flex items-center justify-center mt-6 mb-2">
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-200" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
