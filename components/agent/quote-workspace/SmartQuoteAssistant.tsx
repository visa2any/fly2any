"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Plus, AlertTriangle, TrendingUp, MapPin, Car, Building2, Compass, Bus, Sparkles, X } from "lucide-react";
import { useQuoteWorkspace, useQuoteItems } from "./QuoteWorkspaceProvider";
import type { QuoteItem, ProductType } from "./types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// SMART QUOTE ASSISTANT - AI-driven non-blocking suggestions
// Suggests missing products, flags issues, recommends upsells
// ═══════════════════════════════════════════════════════════════════════════════

interface Suggestion {
  id: string;
  type: "missing" | "warning" | "upsell" | "experience";
  icon: typeof Lightbulb;
  title: string;
  description: string;
  action?: { label: string; tab: ProductType };
  priority: number; // 1 = high, 3 = low
}

// Destination-based experience recommendations
const DESTINATION_EXPERIENCES: Record<string, string[]> = {
  paris: ["Eiffel Tower Skip-the-Line", "Louvre Museum Tour", "Seine River Cruise", "Montmartre Walking Tour"],
  london: ["Tower of London", "Westminster Abbey", "Thames River Cruise", "Harry Potter Studio Tour"],
  rome: ["Colosseum Fast Track", "Vatican Museums", "Trastevere Food Tour", "Pompeii Day Trip"],
  tokyo: ["Tsukiji Fish Market", "Mt. Fuji Day Trip", "Shibuya Walking Tour", "Traditional Tea Ceremony"],
  "new york": ["Statue of Liberty", "Broadway Show", "Central Park Bike Tour", "9/11 Memorial"],
  miami: ["Everglades Airboat", "Art Deco Walking Tour", "Key West Day Trip", "South Beach Food Tour"],
  orlando: ["Disney VIP Tour", "Universal Express", "Kennedy Space Center", "Airboat Safari"],
  cancun: ["Chichen Itza", "Xcaret Park", "Isla Mujeres Catamaran", "Cenote Snorkeling"],
  dubai: ["Burj Khalifa At The Top", "Desert Safari", "Dubai Marina Cruise", "Old Dubai Walking Tour"],
  barcelona: ["Sagrada Familia Fast Track", "Park Güell", "Tapas Walking Tour", "Montserrat Day Trip"],
};

// Tone-based upsell suggestions
const TONE_UPSELLS: Record<string, { type: ProductType; title: string; desc: string }[]> = {
  luxury: [
    { type: "transfer", title: "Private Airport Transfer", desc: "VIP meet & greet service" },
    { type: "activity", title: "Private Guided Tour", desc: "Exclusive access, personal guide" },
  ],
  family: [
    { type: "activity", title: "Family-Friendly Activity", desc: "Fun for all ages" },
    { type: "car", title: "Family SUV Rental", desc: "Space for everyone" },
  ],
  adventure: [
    { type: "activity", title: "Adventure Experience", desc: "Thrilling local activities" },
    { type: "car", title: "4x4 Vehicle", desc: "Go off the beaten path" },
  ],
};

function generateSuggestions(items: QuoteItem[], state: any): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const types = new Set(items.map(i => i.type));
  const dest = state.destination?.toLowerCase() || "";
  const tone = detectTripTone(items, state);

  // 1. Missing product suggestions
  if (types.has("flight") && !types.has("hotel")) {
    suggestions.push({
      id: "missing-hotel",
      type: "missing",
      icon: Building2,
      title: "Add Accommodation",
      description: "Flight booked but no hotel. Add a stay?",
      action: { label: "Search Hotels", tab: "hotel" },
      priority: 1,
    });
  }

  if (types.has("flight") && !types.has("transfer")) {
    suggestions.push({
      id: "missing-transfer",
      type: "missing",
      icon: Bus,
      title: "Airport Transfer",
      description: "Smooth arrival with private transfer",
      action: { label: "Add Transfer", tab: "transfer" },
      priority: 2,
    });
  }

  if ((types.has("hotel") || types.has("flight")) && !types.has("car") && state.travelers?.total <= 4) {
    suggestions.push({
      id: "missing-car",
      type: "missing",
      icon: Car,
      title: "Consider Car Rental",
      description: "Freedom to explore at your own pace",
      action: { label: "Search Cars", tab: "car" },
      priority: 3,
    });
  }

  // 2. Warning suggestions
  const hotels = items.filter(i => i.type === "hotel");
  const flights = items.filter(i => i.type === "flight");

  if (flights.length > 0 && hotels.length === 0 && items.length >= 2) {
    suggestions.push({
      id: "warning-no-stay",
      type: "warning",
      icon: AlertTriangle,
      title: "No Accommodation",
      description: "Quote includes flights but no hotel",
      priority: 1,
    });
  }

  // Check for activity gap (no activities for multi-day trip)
  const activities = items.filter(i => i.type === "activity");
  if (hotels.length > 0 && activities.length === 0) {
    const nights = hotels.reduce((sum, h) => sum + ((h as any).nights || 0), 0);
    if (nights >= 2) {
      suggestions.push({
        id: "experience-gap",
        type: "experience",
        icon: Compass,
        title: "Add Experiences",
        description: `${nights} nights without activities planned`,
        action: { label: "Browse Activities", tab: "activity" },
        priority: 2,
      });
    }
  }

  // 3. Destination-based experience suggestions
  const destKey = Object.keys(DESTINATION_EXPERIENCES).find(d => dest.includes(d));
  if (destKey && activities.length < 2) {
    const experiences = DESTINATION_EXPERIENCES[destKey];
    suggestions.push({
      id: "dest-experience",
      type: "experience",
      icon: Sparkles,
      title: `Popular in ${destKey.charAt(0).toUpperCase() + destKey.slice(1)}`,
      description: experiences.slice(0, 2).join(", "),
      action: { label: "Explore", tab: "activity" },
      priority: 2,
    });
  }

  // 4. Tone-based upsells
  const upsells = TONE_UPSELLS[tone] || TONE_UPSELLS.family;
  const relevantUpsell = upsells.find(u => !types.has(u.type));
  if (relevantUpsell && items.length >= 2) {
    suggestions.push({
      id: `upsell-${relevantUpsell.type}`,
      type: "upsell",
      icon: TrendingUp,
      title: relevantUpsell.title,
      description: relevantUpsell.desc,
      action: { label: "Add", tab: relevantUpsell.type },
      priority: 3,
    });
  }

  // Sort by priority and limit
  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

function detectTripTone(items: QuoteItem[], state: any): string {
  // Simple detection based on hotel stars and travelers
  const hotels = items.filter(i => i.type === "hotel");
  const maxStars = hotels.reduce((max, h) => Math.max(max, (h as any).starRating || 0), 0);

  if (maxStars >= 5) return "luxury";
  if (state.travelers?.children > 0 || state.travelers?.total >= 4) return "family";
  return "adventure";
}

export default function SmartQuoteAssistant() {
  const { state, setActiveTab } = useQuoteWorkspace();
  const items = useQuoteItems();

  const suggestions = useMemo(() => generateSuggestions(items, state), [items, state]);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-1">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Smart Suggestions</span>
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative p-2.5 rounded-xl border transition-all hover:shadow-sm ${
                s.type === "warning"
                  ? "bg-amber-50/50 border-amber-100 hover:border-amber-200"
                  : s.type === "upsell"
                    ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-200"
                    : "bg-blue-50/50 border-blue-100 hover:border-blue-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  s.type === "warning" ? "bg-amber-100" : s.type === "upsell" ? "bg-emerald-100" : "bg-blue-100"
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${
                    s.type === "warning" ? "text-amber-600" : s.type === "upsell" ? "text-emerald-600" : "text-blue-600"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{s.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{s.description}</p>
                  {s.action && (
                    <button
                      onClick={() => setActiveTab(s.action!.tab)}
                      className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors ${
                        s.type === "upsell"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                      {s.action.label}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Compact inline version for tight spaces
export function SmartSuggestionBadge() {
  const items = useQuoteItems();
  const { state } = useQuoteWorkspace();
  const suggestions = useMemo(() => generateSuggestions(items, state), [items, state]);

  if (suggestions.length === 0) return null;

  const topSuggestion = suggestions[0];
  const Icon = topSuggestion.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${
      topSuggestion.type === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
    }`}>
      <Icon className="w-3 h-3" />
      <span>{topSuggestion.title}</span>
    </div>
  );
}
