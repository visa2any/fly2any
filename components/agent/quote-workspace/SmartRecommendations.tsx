"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Shield, Car, Utensils, Camera, Luggage, ChevronRight,
  X, Plus, Check, AlertTriangle, TrendingUp, Zap
} from "lucide-react";
import { useQuoteWorkspace, useQuoteItems, useQuotePricing } from "./QuoteWorkspaceProvider";

interface Recommendation {
  id: string;
  type: "insurance" | "transfer" | "activity" | "upgrade" | "addon";
  title: string;
  description: string;
  reason: string;
  price: number;
  originalPrice?: number;
  icon: React.ReactNode;
  priority: "high" | "medium" | "low";
  data?: any;
}

export default function SmartRecommendations() {
  const { state, addItem } = useQuoteWorkspace();
  const items = useQuoteItems();
  const { subtotal: totalValue } = useQuotePricing();
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Generate smart recommendations based on current quote
  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];
    const hasFlights = items.some((i) => i.type === "flight");
    const hasHotels = items.some((i) => i.type === "hotel");
    const hasInsurance = items.some((i) => i.type === "insurance");
    const hasTransfers = items.some((i) => i.type === "transfer");
    const hasActivities = items.some((i) => i.type === "activity");
    const travelers = state.travelers.total;

    // Travel Insurance - High priority if missing
    if (!hasInsurance && totalValue > 500) {
      recs.push({
        id: "rec-insurance",
        type: "insurance",
        title: "Travel Insurance",
        description: `Comprehensive coverage for ${travelers} traveler${travelers > 1 ? "s" : ""}`,
        reason: `Protect a $${totalValue.toLocaleString()} trip investment`,
        price: Math.round(totalValue * 0.05),
        icon: <Shield className="w-5 h-5" />,
        priority: "high",
        data: {
          provider: "Allianz Travel",
          planName: "AllTrips Premier",
          coverage: "Comprehensive",
          travelers,
        },
      });
    }

    // Airport Transfers - If has flights but no transfers
    if (hasFlights && !hasTransfers) {
      recs.push({
        id: "rec-transfer",
        type: "transfer",
        title: "Airport Transfer",
        description: "Private car service to/from airport",
        reason: "Seamless arrival & departure experience",
        price: 65 * travelers,
        icon: <Car className="w-5 h-5" />,
        priority: "medium",
        data: {
          provider: "Private Transfers",
          vehicleType: travelers > 3 ? "SUV" : "Sedan",
          pickupLocation: "Airport",
          passengers: travelers,
        },
      });
    }

    // Activities - If staying 3+ nights with no activities
    if (hasHotels && !hasActivities && state.duration && state.duration >= 3) {
      recs.push({
        id: "rec-activity",
        type: "activity",
        title: "Local Experience",
        description: `Curated activities for ${state.destination || "your destination"}`,
        reason: "Make the trip memorable",
        price: 89 * travelers,
        icon: <Camera className="w-5 h-5" />,
        priority: "medium",
      });
    }

    // Meal Plan Upgrade - If has hotels
    if (hasHotels && totalValue > 2000) {
      recs.push({
        id: "rec-mealplan",
        type: "upgrade",
        title: "Meal Plan Upgrade",
        description: "All-inclusive dining package",
        reason: "Convenience & savings on dining",
        price: 45 * state.duration! * travelers,
        originalPrice: 65 * state.duration! * travelers,
        icon: <Utensils className="w-5 h-5" />,
        priority: "low",
      });
    }

    // Priority Boarding - If has flights
    if (hasFlights && travelers <= 4) {
      recs.push({
        id: "rec-priority",
        type: "addon",
        title: "Priority Boarding",
        description: "Early boarding + extra legroom",
        reason: "Stress-free boarding experience",
        price: 35 * travelers,
        icon: <Zap className="w-5 h-5" />,
        priority: "low",
      });
    }

    // Extra Baggage - For longer trips
    if (hasFlights && state.duration && state.duration >= 7) {
      recs.push({
        id: "rec-baggage",
        type: "addon",
        title: "Extra Baggage",
        description: "Additional 23kg checked bag",
        reason: `${state.duration} days = more packing needed`,
        price: 45 * travelers,
        icon: <Luggage className="w-5 h-5" />,
        priority: "low",
      });
    }

    return recs.filter((r) => !dismissedIds.has(r.id));
  }, [items, state, dismissedIds]);

  const handleAddRecommendation = (rec: Recommendation) => {
    // Add item to quote based on type
    const newItem: any = {
      id: `${rec.type}-${Date.now()}`,
      type: rec.type === "upgrade" || rec.type === "addon" ? "custom" : rec.type,
      price: rec.price,
      currency: "USD",
      date: state.startDate || new Date().toISOString(),
      name: rec.title,
      description: rec.description,
      ...rec.data,
    };

    addItem(newItem);
    setDismissedIds((prev) => new Set([...prev, rec.id]));
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  if (recommendations.length === 0) return null;

  const highPriority = recommendations.filter((r) => r.priority === "high");
  const otherRecs = recommendations.filter((r) => r.priority !== "high");

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-purple-900">Smart Suggestions</span>
          <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
            {recommendations.length}
          </span>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-purple-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* High Priority */}
              {highPriority.map((rec) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-purple-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-xl text-red-600">
                      {rec.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded uppercase">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <div className="flex items-center gap-2 text-xs text-amber-600">
                        <AlertTriangle className="w-3 h-3" />
                        {rec.reason}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">+${rec.price}</p>
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => handleDismiss(rec.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleAddRecommendation(rec)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Other Recommendations */}
              {otherRecs.map((rec) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-white/80 rounded-xl p-3 border border-purple-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                      {rec.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{rec.title}</h4>
                      <p className="text-xs text-gray-500">{rec.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">+${rec.price}</p>
                        {rec.originalPrice && (
                          <p className="text-xs text-gray-400 line-through">${rec.originalPrice}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddRecommendation(rec)}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Upsell Insight */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-emerald-700">
                  <span className="font-semibold">Pro tip:</span> Clients who add insurance have 40% higher satisfaction
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
