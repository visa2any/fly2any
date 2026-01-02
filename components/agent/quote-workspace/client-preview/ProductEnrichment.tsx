"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Info } from "lucide-react";
import { getProductHeadline, getSelectionReason } from "./EmotionalCopySystem";
import type { ToneProfile } from "../itinerary/ToneSystem";
import type { ProductType } from "../types/quote-workspace.types";

interface ProductEnrichmentProps {
  type: ProductType;
  tone: ToneProfile;
  itemId: string; // Used as seed for deterministic selection
  showHeadline?: boolean;
  showReason?: boolean;
  highlights?: string[];
  children: React.ReactNode;
}

// Convert itemId to numeric seed for consistent selection
function idToSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default function ProductEnrichment({
  type,
  tone,
  itemId,
  showHeadline = true,
  showReason = true,
  highlights,
  children,
}: ProductEnrichmentProps) {
  const seed = idToSeed(itemId);
  const headline = getProductHeadline(tone, type, seed);
  const selectionReason = getSelectionReason(type, seed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Emotional Headline */}
      {showHeadline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <p className="text-sm font-medium text-gray-700 italic">{headline}</p>
        </motion.div>
      )}

      {/* The actual product card */}
      <div>{children}</div>

      {/* Why This Was Selected + Highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 border border-gray-100"
      >
        {/* Selection Reason */}
        {showReason && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                Why we selected this for you
              </p>
              <p className="text-xs text-gray-600">{selectionReason}</p>
            </div>
          </div>
        )}

        {/* Key Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Key Highlights
            </p>
            <div className="flex flex-wrap gap-1.5">
              {highlights.slice(0, 5).map((highlight, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Simpler wrapper for inline enrichment
export function EnrichedHeadline({
  type,
  tone,
  itemId,
}: {
  type: ProductType;
  tone: ToneProfile;
  itemId: string;
}) {
  const seed = idToSeed(itemId);
  const headline = getProductHeadline(tone, type, seed);

  return (
    <div className="flex items-center gap-1.5 mb-1">
      <Sparkles className="w-3 h-3 text-amber-500" />
      <p className="text-xs font-medium text-gray-600 italic">{headline}</p>
    </div>
  );
}

export function SelectionReason({
  type,
  itemId,
}: {
  type: ProductType;
  itemId: string;
}) {
  const seed = idToSeed(itemId);
  const reason = getSelectionReason(type, seed);

  return (
    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
      <p className="text-[10px] text-gray-500">{reason}</p>
    </div>
  );
}
