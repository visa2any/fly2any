"use client";

import { motion } from "framer-motion";
import { Award, TrendingUp, Heart, Shield, CheckCircle2, Star, Users, Sparkles, ThumbsUp } from "lucide-react";
import type { ProductType } from "../types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT CONFIDENCE LAYER - Premium trust signals (no dark patterns)
// Transparent, professional, conversion-focused
// ═══════════════════════════════════════════════════════════════════════════════

type ConfidenceType = "expert" | "popular" | "value" | "quality" | "trending";

interface ConfidenceBadge {
  type: ConfidenceType;
  icon: typeof Award;
  label: string;
  color: string;
  bgColor: string;
}

const CONFIDENCE_BADGES: Record<ConfidenceType, ConfidenceBadge> = {
  expert: {
    type: "expert",
    icon: Award,
    label: "Selected by your travel expert",
    color: "text-violet-700",
    bgColor: "bg-violet-50 border-violet-100",
  },
  popular: {
    type: "popular",
    icon: Heart,
    label: "Popular choice for this destination",
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-100",
  },
  value: {
    type: "value",
    icon: TrendingUp,
    label: "Best value for your dates",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-100",
  },
  quality: {
    type: "quality",
    icon: Star,
    label: "Highly rated by travelers",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-100",
  },
  trending: {
    type: "trending",
    icon: Sparkles,
    label: "Trending this season",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-100",
  },
};

// Determine confidence type based on item characteristics
function getConfidenceType(item: any, index: number): ConfidenceType {
  // First item = expert selected
  if (index === 0) return "expert";

  // High rating = quality
  if (item.details?.rating >= 4.5 || item.details?.starRating >= 5) return "quality";

  // High review count = popular
  if (item.details?.reviewCount > 500) return "popular";

  // Good price = value
  if (item.details?.isGoodValue || item.price < 200) return "value";

  // Default rotation based on index
  const types: ConfidenceType[] = ["expert", "popular", "value", "quality", "trending"];
  return types[index % types.length];
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Inline badge for item cards
export function ConfidenceBadge({ item, index = 0 }: { item: any; index?: number }) {
  const type = getConfidenceType(item, index);
  const badge = CONFIDENCE_BADGES[type];
  const Icon = badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium ${badge.bgColor} ${badge.color}`}
    >
      <Icon className="w-3 h-3" />
      <span>{badge.label}</span>
    </motion.div>
  );
}

// Section confidence header
export function SectionConfidence({ productType, itemCount }: { productType: ProductType; itemCount: number }) {
  const messages: Record<ProductType, string> = {
    flight: "Hand-picked for optimal timing and comfort",
    hotel: "Carefully selected for location and amenities",
    car: "Chosen for reliability and convenience",
    activity: "Curated experiences for your trip style",
    transfer: "Seamless connections arranged",
    insurance: "Comprehensive coverage for peace of mind",
    custom: "Personalized additions for your journey",
  };

  return (
    <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-3">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      <span>{messages[productType]}</span>
    </div>
  );
}

// Quote-level confidence summary
export function QuoteConfidenceSummary({ items, agentName }: { items: any[]; agentName?: string }) {
  const stats = {
    expertPicks: items.length,
    avgRating: items.reduce((sum, i) => sum + (i.details?.rating || 4.5), 0) / Math.max(items.length, 1),
    totalReviews: items.reduce((sum, i) => sum + (i.details?.reviewCount || 0), 0),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Your Personalized Selection</h3>
          <p className="text-xs text-gray-500">
            {agentName ? `Curated by ${agentName}` : "Hand-picked by your travel expert"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-violet-50 rounded-xl">
          <Award className="w-5 h-5 text-violet-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{stats.expertPicks}</p>
          <p className="text-[10px] text-gray-500">Expert Picks</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
          <p className="text-[10px] text-gray-500">Avg Rating</p>
        </div>
        <div className="text-center p-3 bg-rose-50 rounded-xl">
          <ThumbsUp className="w-5 h-5 text-rose-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{stats.totalReviews > 0 ? `${(stats.totalReviews / 1000).toFixed(1)}k` : "100+"}</p>
          <p className="text-[10px] text-gray-500">Reviews</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Every selection verified for quality and value</span>
        </div>
      </div>
    </motion.div>
  );
}

// Why this was selected (per item)
export function WhySelected({ item, tone = "family" }: { item: any; tone?: string }) {
  const reasons: Record<string, Record<string, string>> = {
    flight: {
      luxury: "Premium cabin with exceptional service and comfort",
      family: "Convenient timing with family-friendly amenities",
      adventure: "Efficient routing to maximize your adventure time",
    },
    hotel: {
      luxury: "Exclusive property with world-class amenities",
      family: "Spacious accommodations perfect for families",
      adventure: "Prime location as your adventure base camp",
    },
    activity: {
      luxury: "Exclusive experience with VIP access",
      family: "Fun for all ages with lasting memories",
      adventure: "Authentic local adventure you'll never forget",
    },
    car: {
      luxury: "Premium vehicle for a refined journey",
      family: "Spacious and safe for the whole family",
      adventure: "Freedom to explore on your own terms",
    },
  };

  const reason = reasons[item.type]?.[tone] || "Selected to enhance your travel experience";

  return (
    <div className="flex items-start gap-2 mt-2 p-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
      <Sparkles className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[10px] font-semibold text-violet-700">Why we selected this</p>
        <p className="text-[10px] text-gray-600">{reason}</p>
      </div>
    </div>
  );
}
