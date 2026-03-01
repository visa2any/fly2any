"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Car, Camera, Luggage, Zap, Utensils, X, Plus, ChevronDown } from "lucide-react";
import { useQuoteWorkspace, useQuoteItems, useQuotePricing } from "./QuoteWorkspaceProvider";

interface Recommendation {
  id: string;
  type: "insurance" | "transfer" | "activity" | "upgrade" | "addon";
  title: string;
  reason: string;
  price: number;
  icon: React.ReactNode;
  priority: "high" | "medium" | "low";
  data?: any;
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-amber-400", medium: "bg-blue-400", low: "bg-gray-300",
};

export default function SmartRecommendations() {
  const { state, addItem } = useQuoteWorkspace();
  const items = useQuoteItems();
  const { subtotal: totalValue } = useQuotePricing();
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];
    const hasFlights = items.some((i) => i.type === "flight");
    const hasHotels = items.some((i) => i.type === "hotel");
    const hasInsurance = items.some((i) => i.type === "insurance");
    const hasTransfers = items.some((i) => i.type === "transfer");
    const hasActivities = items.some((i) => i.type === "activity");
    const travelers = state.travelers.total;
    const duration = state.startDate && state.endDate
      ? Math.ceil((new Date(state.endDate).getTime() - new Date(state.startDate).getTime()) / 86400000)
      : 0;

    if (!hasInsurance && totalValue > 500)
      recs.push({ id: "rec-insurance", type: "insurance", title: "Travel Insurance", reason: `Protect $${totalValue.toLocaleString()}`, price: Math.round(totalValue * 0.05), icon: <Shield className="w-3.5 h-3.5" />, priority: "high", data: { provider: "Allianz Travel", planName: "AllTrips Premier", coverage: "Comprehensive", travelers } });

    if (hasFlights && !hasTransfers)
      recs.push({ id: "rec-transfer", type: "transfer", title: "Airport Transfer", reason: "Seamless arrival", price: 65 * travelers, icon: <Car className="w-3.5 h-3.5" />, priority: "medium", data: { provider: "Private Transfers", vehicleType: travelers > 3 ? "SUV" : "Sedan", pickupLocation: "Airport", passengers: travelers } });

    if (hasHotels && !hasActivities && duration >= 3)
      recs.push({ id: "rec-activity", type: "activity", title: "Local Experience", reason: "Make it memorable", price: 89 * travelers, icon: <Camera className="w-3.5 h-3.5" />, priority: "medium" });

    if (hasHotels && totalValue > 2000)
      recs.push({ id: "rec-mealplan", type: "upgrade", title: "Meal Plan", reason: "All-inclusive dining", price: 45 * (duration || 1) * travelers, icon: <Utensils className="w-3.5 h-3.5" />, priority: "low" });

    if (hasFlights && travelers <= 4)
      recs.push({ id: "rec-priority", type: "addon", title: "Priority Boarding", reason: "Skip the queue", price: 35 * travelers, icon: <Zap className="w-3.5 h-3.5" />, priority: "low" });

    if (hasFlights && duration >= 7)
      recs.push({ id: "rec-baggage", type: "addon", title: "Extra Baggage", reason: `${duration} days trip`, price: 45 * travelers, icon: <Luggage className="w-3.5 h-3.5" />, priority: "low" });

    return recs.filter((r) => !dismissedIds.has(r.id));
  }, [items, state, dismissedIds, totalValue]);

  const handleAdd = (rec: Recommendation) => {
    addItem({
      id: `${rec.type}-${Date.now()}`,
      type: rec.type === "upgrade" || rec.type === "addon" ? "custom" : rec.type,
      price: rec.price,
      currency: "USD",
      date: state.startDate || new Date().toISOString(),
      name: rec.title,
      ...rec.data,
    } as any);
    setDismissedIds((prev) => new Set([...prev, rec.id]));
  };

  const handleDismiss = (id: string) => setDismissedIds((prev) => new Set([...prev, id]));

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Compact header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Smart Suggestions</span>
          <span className="px-1.5 py-px bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full">
            {recommendations.length}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-1">
              {recommendations.map((rec) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[rec.priority]}`} />
                  <span className="text-gray-500 flex-shrink-0">{rec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{rec.title}</p>
                    <p className="text-[9px] text-gray-400 truncate">{rec.reason}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 flex-shrink-0">+${rec.price}</span>
                  <button
                    onClick={() => handleAdd(rec)}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDismiss(rec.id)} className="flex-shrink-0 text-gray-300 hover:text-gray-500">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
