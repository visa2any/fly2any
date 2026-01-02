"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, Users, Mountain, Briefcase, Heart, Check, ChevronDown } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { ToneProfile } from "../itinerary/ToneSystem";

// ============================================
// SMART PRESETS - One-Click Workflow Modes
// ============================================

export interface QuotePreset {
  id: ToneProfile;
  name: string;
  icon: typeof Crown;
  color: string;
  gradient: string;
  description: string;
  config: {
    markupPercent: number;
    copyTone: ToneProfile;
    emphasis: "price" | "experience" | "value" | "efficiency";
    defaultFilters: {
      hotelStars?: number;
      cabinClass?: string;
      activityTypes?: string[];
    };
  };
}

export const QUOTE_PRESETS: QuotePreset[] = [
  {
    id: "luxury",
    name: "Luxury",
    icon: Crown,
    color: "text-amber-600",
    gradient: "from-amber-500 to-yellow-600",
    description: "Premium experience, higher margins",
    config: {
      markupPercent: 25,
      copyTone: "luxury",
      emphasis: "experience",
      defaultFilters: { hotelStars: 5, cabinClass: "business" },
    },
  },
  {
    id: "family",
    name: "Family",
    icon: Users,
    color: "text-blue-600",
    gradient: "from-blue-500 to-indigo-600",
    description: "Value-focused, kid-friendly",
    config: {
      markupPercent: 15,
      copyTone: "family",
      emphasis: "value",
      defaultFilters: { hotelStars: 4, activityTypes: ["family", "outdoor"] },
    },
  },
  {
    id: "adventure",
    name: "Adventure",
    icon: Mountain,
    color: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
    description: "Active experiences, flexibility",
    config: {
      markupPercent: 18,
      copyTone: "adventure",
      emphasis: "experience",
      defaultFilters: { activityTypes: ["adventure", "outdoor", "tours"] },
    },
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    color: "text-gray-700",
    gradient: "from-gray-600 to-gray-800",
    description: "Efficiency, reliability, professionalism",
    config: {
      markupPercent: 20,
      copyTone: "business",
      emphasis: "efficiency",
      defaultFilters: { hotelStars: 4, cabinClass: "business" },
    },
  },
  {
    id: "romantic",
    name: "Romantic",
    icon: Heart,
    color: "text-rose-600",
    gradient: "from-rose-500 to-pink-600",
    description: "Couples, honeymoons, special occasions",
    config: {
      markupPercent: 22,
      copyTone: "romantic",
      emphasis: "experience",
      defaultFilters: { hotelStars: 5, activityTypes: ["romantic", "spa", "dining"] },
    },
  },
];

interface SmartPresetsProps {
  variant?: "dropdown" | "pills" | "compact";
  onPresetChange?: (preset: QuotePreset) => void;
}

export default function SmartPresets({ variant = "pills", onPresetChange }: SmartPresetsProps) {
  const { state, dispatch } = useQuoteWorkspace();
  const [activePreset, setActivePreset] = useState<ToneProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const applyPreset = useCallback((preset: QuotePreset) => {
    setActivePreset(preset.id);

    // Apply markup
    dispatch({ type: "SET_MARKUP", payload: preset.config.markupPercent });

    // Store preset for copy tone
    localStorage.setItem("fly2any_quote_preset", preset.id);

    onPresetChange?.(preset);
    setIsOpen(false);
  }, [dispatch, onPresetChange]);

  // Compact pill variant
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        {QUOTE_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`p-1.5 rounded-lg transition-all ${
                isActive
                  ? `bg-gradient-to-r ${preset.gradient} text-white shadow-md`
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
              title={`${preset.name} Mode`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown variant
  if (variant === "dropdown") {
    const current = QUOTE_PRESETS.find((p) => p.id === activePreset);
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
        >
          {current ? (
            <>
              <current.icon className={`w-4 h-4 ${current.color}`} />
              <span className="text-sm font-medium">{current.name}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Select Mode</span>
            </>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                {QUOTE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isActive = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                        isActive ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${preset.gradient} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                        <p className="text-xs text-gray-500">{preset.description}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Pills variant (default)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 font-medium">Mode:</span>
      {QUOTE_PRESETS.map((preset) => {
        const Icon = preset.icon;
        const isActive = activePreset === preset.id;
        return (
          <motion.button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? `bg-gradient-to-r ${preset.gradient} text-white shadow-md`
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {preset.name}
          </motion.button>
        );
      })}
    </div>
  );
}

// Hook for accessing current preset
export function useCurrentPreset(): QuotePreset | null {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("fly2any_quote_preset") : null;
  return QUOTE_PRESETS.find((p) => p.id === stored) || null;
}
