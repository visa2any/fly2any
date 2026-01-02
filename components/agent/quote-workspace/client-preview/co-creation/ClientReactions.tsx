"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HelpCircle, RefreshCw, MessageCircle, Check } from "lucide-react";
import { ReactionType, REACTION_CONFIG } from "./types";

interface ClientReactionsProps {
  itemId: string;
  currentReaction?: ReactionType;
  onReact: (itemId: string, type: ReactionType | null) => void;
  onSuggest: (itemId: string) => void;
  variant?: "inline" | "floating";
  disabled?: boolean;
}

const iconMap = {
  Heart,
  HelpCircle,
  RefreshCw,
};

/**
 * CLIENT REACTIONS - Light, Non-Intrusive Feedback
 *
 * UX Philosophy:
 * - One-tap reactions (no forms, no friction)
 * - Visual confirmation without disruption
 * - Optional deeper engagement via "suggest"
 */
export default function ClientReactions({
  itemId,
  currentReaction,
  onReact,
  onSuggest,
  variant = "inline",
  disabled = false,
}: ClientReactionsProps) {
  const [showAll, setShowAll] = useState(false);
  const [justReacted, setJustReacted] = useState(false);

  const handleReact = (type: ReactionType) => {
    if (disabled) return;

    // Toggle off if same reaction
    const newReaction = currentReaction === type ? null : type;
    onReact(itemId, newReaction);

    if (newReaction) {
      setJustReacted(true);
      setTimeout(() => setJustReacted(false), 1500);
    }
    setShowAll(false);
  };

  // Inline variant: minimal, hover-reveal
  if (variant === "inline") {
    return (
      <div className="relative group">
        <div className="flex items-center gap-1">
          {/* Primary: Love button (always visible) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReact("love")}
            disabled={disabled}
            className={`p-1.5 rounded-full transition-all ${
              currentReaction === "love"
                ? "bg-rose-100 text-rose-500"
                : "text-gray-300 hover:text-rose-400 hover:bg-rose-50"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${currentReaction === "love" ? "fill-current" : ""}`}
            />
          </motion.button>

          {/* Secondary actions (reveal on hover) */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSuggest(itemId)}
              disabled={disabled}
              className="p-1.5 rounded-full text-gray-300 hover:text-blue-400 hover:bg-blue-50 transition-all"
              title="Share a thought"
            >
              <MessageCircle className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Micro-feedback on reaction */}
        <AnimatePresence>
          {justReacted && currentReaction && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute -top-8 left-0 px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${REACTION_CONFIG[currentReaction].bgColor} ${REACTION_CONFIG[currentReaction].color}`}
            >
              <Check className="w-3 h-3 inline mr-0.5" />
              {REACTION_CONFIG[currentReaction].label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Floating variant: card-style for item cards
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm"
    >
      {Object.entries(REACTION_CONFIG).map(([type, config]) => {
        const Icon = iconMap[config.icon as keyof typeof iconMap];
        const isActive = currentReaction === type;

        return (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReact(type as ReactionType)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? `${config.bgColor} ${config.color} ${config.borderColor} border`
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">{config.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

/**
 * REACTION INDICATOR - Shows current reaction status
 * For agent view to see client sentiment
 */
export function ReactionIndicator({ reaction }: { reaction?: ReactionType }) {
  if (!reaction) return null;

  const config = REACTION_CONFIG[reaction];
  const Icon = iconMap[config.icon as keyof typeof iconMap];

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bgColor} ${config.color}`}
    >
      <Icon className="w-3 h-3 fill-current" />
      <span>{config.label}</span>
    </div>
  );
}
