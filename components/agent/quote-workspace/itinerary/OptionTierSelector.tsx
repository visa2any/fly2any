"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Copy, Check, Layers, Crown, Star, Sparkles } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { QuoteOptionTier, QuoteOption } from "../types/quote-workspace.types";

const TIER_CONFIG: Record<QuoteOptionTier, { label: string; icon: typeof Star; color: string; bg: string; border: string }> = {
  standard: { label: "Good", icon: Star, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  recommended: { label: "Better", icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  premium: { label: "Best", icon: Crown, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
};

export default function OptionTierSelector() {
  const { state, addOption, removeOption, setActiveOption, duplicateToOption } = useQuoteWorkspace();
  const { options, activeOptionId } = state;
  const [showAddMenu, setShowAddMenu] = useState(false);

  const isMultiOption = options.length > 0;

  const handleAddTier = (tier: QuoteOptionTier, label: string) => {
    addOption(tier, label);
    setShowAddMenu(false);
  };

  const handleDuplicate = (sourceId: string | null) => {
    const usedTiers = options.map(o => o.tier);
    const nextTier: QuoteOptionTier = !usedTiers.includes("recommended")
      ? "recommended"
      : !usedTiers.includes("premium")
      ? "premium"
      : "standard";
    const label = `Option ${String.fromCharCode(65 + options.length)}`;
    duplicateToOption(sourceId, nextTier, label);
  };

  if (!isMultiOption) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 border-b border-gray-100 bg-white">
        <button
          onClick={() => handleAddTier("standard", "Option A")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          title="Create multiple quote options for the client to choose from"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Create Options (Good / Better / Best)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white overflow-x-auto scrollbar-none">
      {/* Option tabs */}
      {options.map((option) => {
        const config = TIER_CONFIG[option.tier];
        const Icon = config.icon;
        const isActive = activeOptionId === option.id;
        return (
          <motion.button
            key={option.id}
            layout
            onClick={() => setActiveOption(option.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
              isActive
                ? `${config.bg} ${config.color} ${config.border} border shadow-sm`
                : "text-gray-500 hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{option.label}</span>
            <span className="text-[10px] font-normal opacity-70">
              ({option.items.length} items)
            </span>
            {/* Remove button */}
            {isActive && options.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(option.id);
                }}
                className="ml-1 p-0.5 rounded hover:bg-white/50 transition-colors"
                title="Remove this option"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {/* Duplicate button */}
            {isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate(option.id);
                }}
                className="ml-0.5 p-0.5 rounded hover:bg-white/50 transition-colors"
                title="Duplicate this option"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
          </motion.button>
        );
      })}

      {/* Add option */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <AnimatePresence>
          {showAddMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowAddMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
              >
                {(Object.entries(TIER_CONFIG) as [QuoteOptionTier, typeof TIER_CONFIG.standard][]).map(([tier, config]) => {
                  const Icon = config.icon;
                  const already = options.some(o => o.tier === tier);
                  return (
                    <button
                      key={tier}
                      onClick={() => handleAddTier(tier, `Option ${String.fromCharCode(65 + options.length)}`)}
                      disabled={already}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                        already
                          ? "text-gray-300 cursor-not-allowed"
                          : `text-gray-700 hover:${config.bg}`
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${already ? "text-gray-300" : config.color}`} />
                      {config.label}
                      {already && <Check className="w-3 h-3 ml-auto text-gray-300" />}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
