"use client";

import { motion } from "framer-motion";
import { Coffee, Sunset, Moon, Sparkles, Utensils, Wine, Music, Star } from "lucide-react";
import { useViewMode } from "./ViewModeContext";
import { type ToneProfile } from "./ToneSystem";

type FreeTimeType = "morning" | "afternoon" | "evening" | "night" | "full_day";

interface FreeTimeBlockProps {
  type: FreeTimeType;
  dayNumber: number;
  tone?: ToneProfile;
  location?: string;
  agentNote?: string;
}

// Emotional copy by time of day and tone
const freeTimeCopy: Record<ToneProfile, Record<FreeTimeType, {
  title: string;
  subtitle: string;
  icon: typeof Coffee;
  gradient: string;
  suggestions: string[];
}>> = {
  luxury: {
    morning: {
      title: "Morning at Leisure",
      subtitle: "Begin your day at your own pace",
      icon: Coffee,
      gradient: "from-amber-100 to-orange-50",
      suggestions: ["Enjoy a leisurely breakfast", "Visit the spa", "Stroll through local markets"],
    },
    afternoon: {
      title: "Afternoon Freedom",
      subtitle: "Time unfolds at your pleasure",
      icon: Sparkles,
      gradient: "from-blue-50 to-indigo-50",
      suggestions: ["Discover hidden boutiques", "Savor a long lunch", "Return to the pool"],
    },
    evening: {
      title: "Evening Elegance",
      subtitle: "As the sun sets, possibilities await",
      icon: Sunset,
      gradient: "from-orange-100 to-rose-50",
      suggestions: ["Cocktails with a view", "Fine dining experience", "Evening entertainment"],
    },
    night: {
      title: "Evening at Leisure",
      subtitle: "The night is yours to enjoy",
      icon: Moon,
      gradient: "from-indigo-100 to-purple-50",
      suggestions: ["Nightcap at the bar", "Stargazing", "In-room relaxation"],
    },
    full_day: {
      title: "A Day of Your Own",
      subtitle: "Craft your perfect day",
      icon: Star,
      gradient: "from-purple-50 to-pink-50",
      suggestions: ["Sleep in", "Explore at will", "Perhaps a surprise awaits"],
    },
  },
  family: {
    morning: {
      title: "Good Morning!",
      subtitle: "Fuel up for the day ahead",
      icon: Coffee,
      gradient: "from-yellow-100 to-orange-50",
      suggestions: ["Family breakfast", "Morning swim", "Pack for adventure"],
    },
    afternoon: {
      title: "Free Time!",
      subtitle: "What will you do?",
      icon: Sparkles,
      gradient: "from-green-50 to-emerald-50",
      suggestions: ["Pool time!", "Ice cream break", "Explore the area"],
    },
    evening: {
      title: "Evening Fun",
      subtitle: "Wind down the adventure",
      icon: Sunset,
      gradient: "from-orange-100 to-pink-50",
      suggestions: ["Family dinner", "Sunset watching", "Games night"],
    },
    night: {
      title: "Goodnight Time",
      subtitle: "Rest up for tomorrow",
      icon: Moon,
      gradient: "from-blue-100 to-purple-50",
      suggestions: ["Story time", "Early bedtime", "Plan tomorrow's fun"],
    },
    full_day: {
      title: "Free Day!",
      subtitle: "No plans means all the fun",
      icon: Star,
      gradient: "from-cyan-50 to-blue-50",
      suggestions: ["Sleep in!", "Spontaneous adventures", "Family bonding"],
    },
  },
  adventure: {
    morning: {
      title: "Dawn Prep",
      subtitle: "Gear up for what's next",
      icon: Coffee,
      gradient: "from-amber-100 to-yellow-50",
      suggestions: ["Early fuel-up", "Check your gear", "Scout the area"],
    },
    afternoon: {
      title: "Downtime",
      subtitle: "Recover and recharge",
      icon: Sparkles,
      gradient: "from-teal-50 to-cyan-50",
      suggestions: ["Rest those legs", "Local exploration", "Prep for evening"],
    },
    evening: {
      title: "Golden Hour",
      subtitle: "The adventure continues",
      icon: Sunset,
      gradient: "from-orange-100 to-red-50",
      suggestions: ["Sunset chase", "Local eats", "Night prep"],
    },
    night: {
      title: "Base Camp Evening",
      subtitle: "Recover for tomorrow's mission",
      icon: Moon,
      gradient: "from-slate-100 to-gray-50",
      suggestions: ["Refuel", "Gear check", "Early sleep"],
    },
    full_day: {
      title: "Recovery Day",
      subtitle: "Even warriors need rest",
      icon: Star,
      gradient: "from-emerald-50 to-teal-50",
      suggestions: ["Sleep in", "Light exploration", "Tomorrow we conquer"],
    },
  },
  business: {
    morning: {
      title: "Morning Prep",
      subtitle: "Prepare for the day",
      icon: Coffee,
      gradient: "from-gray-100 to-slate-50",
      suggestions: ["Review materials", "Morning routine", "Coffee meeting"],
    },
    afternoon: {
      title: "Flexible Time",
      subtitle: "Between commitments",
      icon: Sparkles,
      gradient: "from-blue-50 to-gray-50",
      suggestions: ["Catch up on emails", "Local networking", "Light lunch"],
    },
    evening: {
      title: "After Hours",
      subtitle: "Business or pleasure",
      icon: Sunset,
      gradient: "from-indigo-50 to-purple-50",
      suggestions: ["Client dinner", "Networking event", "Personal time"],
    },
    night: {
      title: "Evening",
      subtitle: "Wind down",
      icon: Moon,
      gradient: "from-slate-100 to-gray-100",
      suggestions: ["Prep for tomorrow", "Light reading", "Rest"],
    },
    full_day: {
      title: "Open Schedule",
      subtitle: "Flexible day",
      icon: Star,
      gradient: "from-gray-50 to-white",
      suggestions: ["Work remotely", "Site visits", "Personal errands"],
    },
  },
  romantic: {
    morning: {
      title: "Lazy Morning",
      subtitle: "No rush, just us",
      icon: Coffee,
      gradient: "from-rose-100 to-pink-50",
      suggestions: ["Breakfast in bed", "Couples massage", "Morning stroll"],
    },
    afternoon: {
      title: "Afternoon Together",
      subtitle: "Time for two",
      icon: Sparkles,
      gradient: "from-pink-50 to-rose-50",
      suggestions: ["Explore hand in hand", "Couples spa", "Wine tasting"],
    },
    evening: {
      title: "Sunset Romance",
      subtitle: "Magic hour for two",
      icon: Sunset,
      gradient: "from-orange-100 to-rose-100",
      suggestions: ["Sunset cocktails", "Romantic dinner", "Evening walk"],
    },
    night: {
      title: "Starlit Evening",
      subtitle: "Just the two of you",
      icon: Moon,
      gradient: "from-purple-100 to-pink-50",
      suggestions: ["Stargazing", "Nightcap", "Private time"],
    },
    full_day: {
      title: "Day for Us",
      subtitle: "No agenda, just love",
      icon: Star,
      gradient: "from-pink-50 to-purple-50",
      suggestions: ["Sleep in together", "Spontaneous adventure", "Quality time"],
    },
  },
};

export default function FreeTimeBlock({
  type,
  dayNumber,
  tone = "family",
  location,
  agentNote,
}: FreeTimeBlockProps) {
  const { viewMode } = useViewMode();
  const isClientView = viewMode === "client";
  const config = freeTimeCopy[tone][type];
  const Icon = config.icon;

  // Client View - Elegant, aspirational
  if (isClientView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`relative rounded-xl bg-gradient-to-br ${config.gradient} border border-gray-100 overflow-hidden`}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '16px 16px',
        }} />

        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">{config.title}</h4>
              <p className="text-xs text-gray-500">{config.subtitle}</p>
            </div>
          </div>

          {/* Suggestions - Soft highlight chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {config.suggestions.map((suggestion, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs bg-white/60 backdrop-blur-sm text-gray-600 rounded-full border border-white/50"
              >
                {suggestion}
              </span>
            ))}
          </div>

          {/* Location hint */}
          {location && (
            <p className="mt-2 text-xs text-gray-400 italic">
              Near {location}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Agent View - Compact, functional
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-lg bg-gray-50 border border-dashed border-gray-200 p-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600">{config.title}</p>
          <p className="text-[10px] text-gray-400">{config.subtitle}</p>
        </div>
        {agentNote && (
          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
            Note: {agentNote}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Helper to determine free time type based on context
export function determineFreeTimeType(
  prevItemTime?: string,
  nextItemTime?: string,
  hasItems?: boolean
): FreeTimeType {
  if (!hasItems) return "full_day";

  // Parse times to determine which segment
  if (prevItemTime && nextItemTime) {
    const prevHour = parseInt(prevItemTime.split(":")[0]) || 12;
    const nextHour = parseInt(nextItemTime.split(":")[0]) || 12;

    if (prevHour < 12 && nextHour >= 12) return "morning";
    if (prevHour >= 12 && prevHour < 17 && nextHour >= 17) return "afternoon";
    if (prevHour >= 17) return "evening";
  }

  // Default based on last item
  if (prevItemTime) {
    const hour = parseInt(prevItemTime.split(":")[0]) || 12;
    if (hour >= 17) return "evening";
    if (hour >= 12) return "afternoon";
    return "morning";
  }

  return "afternoon";
}
