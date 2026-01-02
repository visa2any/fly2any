"use client";

import { Star, ThumbsUp, Clock, Shield, Award, TrendingUp } from "lucide-react";
import type { QuoteItem } from "../types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// ITEM QUALITY SIGNALS - Visual trust indicators per product type
// ═══════════════════════════════════════════════════════════════════════════════

interface QualitySignal {
  icon: typeof Star;
  label: string;
  value: string;
  color: string;
}

function getFlightSignals(item: QuoteItem): QualitySignal[] {
  const details = item.details || {};
  const signals: QualitySignal[] = [];

  // On-time performance
  if (details.onTimePerformance) {
    signals.push({
      icon: Clock,
      label: "On-time",
      value: `${details.onTimePerformance}%`,
      color: details.onTimePerformance >= 80 ? "text-emerald-600" : "text-amber-600",
    });
  }

  // Direct flight indicator
  if (details.stops === 0) {
    signals.push({
      icon: TrendingUp,
      label: "Direct",
      value: "Non-stop",
      color: "text-blue-600",
    });
  }

  // Flexible fare
  if (details.fareRules?.changeable) {
    signals.push({
      icon: Shield,
      label: "Flexible",
      value: "Free changes",
      color: "text-violet-600",
    });
  }

  return signals.slice(0, 2);
}

function getHotelSignals(item: QuoteItem): QualitySignal[] {
  const details = item.details || {};
  const signals: QualitySignal[] = [];

  // Star rating
  if (details.starRating) {
    signals.push({
      icon: Star,
      label: "Rating",
      value: `${details.starRating}★`,
      color: details.starRating >= 4 ? "text-amber-500" : "text-gray-500",
    });
  }

  // Guest rating
  if (details.guestRating) {
    signals.push({
      icon: ThumbsUp,
      label: "Guests",
      value: `${details.guestRating}/10`,
      color: details.guestRating >= 8 ? "text-emerald-600" : "text-blue-600",
    });
  }

  // Review count
  if (details.reviewCount) {
    signals.push({
      icon: Award,
      label: "Reviews",
      value: `${details.reviewCount}+`,
      color: "text-gray-600",
    });
  }

  return signals.slice(0, 2);
}

function getActivitySignals(item: QuoteItem): QualitySignal[] {
  const details = item.details || {};
  const signals: QualitySignal[] = [];

  // Rating
  if (details.rating) {
    signals.push({
      icon: Star,
      label: "Rating",
      value: `${details.rating}`,
      color: details.rating >= 4.5 ? "text-amber-500" : "text-gray-500",
    });
  }

  // Review count
  if (details.reviewCount) {
    signals.push({
      icon: ThumbsUp,
      label: "Reviews",
      value: `${details.reviewCount}`,
      color: "text-blue-600",
    });
  }

  // Best seller
  if (details.isBestSeller || details.reviewCount > 500) {
    signals.push({
      icon: Award,
      label: "Popular",
      value: "Best Seller",
      color: "text-emerald-600",
    });
  }

  return signals.slice(0, 2);
}

function getCarSignals(item: QuoteItem): QualitySignal[] {
  const details = item.details || {};
  const signals: QualitySignal[] = [];

  // Supplier rating
  if (details.supplierRating) {
    signals.push({
      icon: Star,
      label: "Supplier",
      value: `${details.supplierRating}/5`,
      color: "text-amber-500",
    });
  }

  // Insurance included
  if (details.insuranceIncluded) {
    signals.push({
      icon: Shield,
      label: "Insurance",
      value: "Included",
      color: "text-emerald-600",
    });
  }

  // Unlimited mileage
  if (details.unlimitedMileage) {
    signals.push({
      icon: TrendingUp,
      label: "Mileage",
      value: "Unlimited",
      color: "text-blue-600",
    });
  }

  return signals.slice(0, 2);
}

export function getItemQualitySignals(item: QuoteItem): QualitySignal[] {
  switch (item.type) {
    case "flight":
      return getFlightSignals(item);
    case "hotel":
      return getHotelSignals(item);
    case "activity":
      return getActivitySignals(item);
    case "car":
      return getCarSignals(item);
    default:
      return [];
  }
}

// Component to render signals
export default function ItemQualitySignals({ item }: { item: QuoteItem }) {
  const signals = getItemQualitySignals(item);

  if (signals.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      {signals.map((signal, i) => {
        const Icon = signal.icon;
        return (
          <div
            key={i}
            className={`inline-flex items-center gap-0.5 text-[9px] font-medium ${signal.color}`}
            title={signal.label}
          >
            <Icon className="w-2.5 h-2.5" />
            <span>{signal.value}</span>
          </div>
        );
      })}
    </div>
  );
}

// Compact star rating only
export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}
