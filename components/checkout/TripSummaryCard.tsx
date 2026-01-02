"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Building2, Car, Compass, Bus, Shield, ChevronDown, Users, Calendar, MapPin } from "lucide-react";
import type { CheckoutItem, TravelerInfo } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// TRIP SUMMARY CARD - Always visible, no recalculation surprises
// ═══════════════════════════════════════════════════════════════════════════════

const ITEM_ICONS: Record<CheckoutItem["type"], typeof Plane> = {
  flight: Plane,
  hotel: Building2,
  car: Car,
  activity: Compass,
  transfer: Bus,
  insurance: Shield,
};

const ITEM_COLORS: Record<CheckoutItem["type"], string> = {
  flight: "text-blue-600 bg-blue-50",
  hotel: "text-purple-600 bg-purple-50",
  car: "text-cyan-600 bg-cyan-50",
  activity: "text-emerald-600 bg-emerald-50",
  transfer: "text-amber-600 bg-amber-50",
  insurance: "text-rose-600 bg-rose-50",
};

interface TripSummaryCardProps {
  items: CheckoutItem[];
  travelers: TravelerInfo;
  startDate: string;
  endDate: string;
  currency?: string;
}

export default function TripSummaryCard({
  items,
  travelers,
  startDate,
  endDate,
  currency = "USD",
}: TripSummaryCardProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const totalTravelers = travelers.adults + travelers.children + travelers.infants;
  const perPerson = totalTravelers > 0 ? total / totalTravelers : total;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const travelerText = () => {
    const parts: string[] = [];
    if (travelers.adults > 0) parts.push(`${travelers.adults} Adult${travelers.adults > 1 ? "s" : ""}`);
    if (travelers.children > 0) parts.push(`${travelers.children} Child${travelers.children > 1 ? "ren" : ""}`);
    if (travelers.infants > 0) parts.push(`${travelers.infants} Infant${travelers.infants > 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Your Trip Summary</h2>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {items.map((item) => {
          const Icon = ITEM_ICONS[item.type];
          const colorClass = ITEM_COLORS[item.type];
          const isExpanded = expandedItems.has(item.id);

          return (
            <div key={item.id} className="px-5 py-3">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(item.price)}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && item.details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 ml-12 p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                      {Object.entries(item.details).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-gray-500">{k}</span>
                          <span className="text-gray-700 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Trip Info */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Users className="w-3.5 h-3.5" />
          <span>{travelerText()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(startDate)} – {formatDate(endDate)}</span>
        </div>
      </div>

      {/* Total - Crystal Clear */}
      <div className="px-5 py-4 bg-gray-900 text-white">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-gray-300">Total</span>
          <div className="text-right">
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(total)} <span className="text-sm font-normal text-gray-400">{currency}</span></p>
            <p className="text-xs text-gray-400">{formatCurrency(perPerson)} per person</p>
          </div>
        </div>
      </div>
    </div>
  );
}
