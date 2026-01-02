"use client";

import { Plane, Building2, Car, Compass, Bus, MapPin, Calendar, Users, Zap, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTripContext, type TripContextState } from "./TripContext";
import { format, parseISO } from "date-fns";

// ═══════════════════════════════════════════════════════════════════════════════
// TRIP CONTEXT BAR - Compact shared context display + product toggles
// Non-blocking, appears when context has data
// ═══════════════════════════════════════════════════════════════════════════════

const productConfig: Record<keyof TripContextState["searchProducts"], { icon: typeof Plane; label: string; color: string }> = {
  flights: { icon: Plane, label: "Flights", color: "bg-blue-500" },
  hotels: { icon: Building2, label: "Hotels", color: "bg-violet-500" },
  cars: { icon: Car, label: "Cars", color: "bg-sky-500" },
  activities: { icon: Compass, label: "Activities", color: "bg-emerald-500" },
  transfers: { icon: Bus, label: "Transfers", color: "bg-amber-500" },
};

export default function TripContextBar() {
  const { state, toggleProduct, isReady, hasDestination } = useTripContext();

  // Don't render if no context data
  if (!hasDestination) return null;

  const formatDate = (d: string | null) => {
    if (!d) return null;
    try { return format(parseISO(d), "MMM d"); } catch { return d; }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className="mb-3 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 px-4 py-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Trip Summary */}
            <div className="flex items-center gap-4 text-sm">
              {/* Destination */}
              {state.destination && (
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span className="font-medium">{state.destination}</span>
                </div>
              )}

              {/* Dates */}
              {state.startDate && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{formatDate(state.startDate)}</span>
                  {state.endDate && <span>– {formatDate(state.endDate)}</span>}
                </div>
              )}

              {/* Travelers */}
              {state.travelers.total > 0 && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>{state.travelers.total}</span>
                </div>
              )}

              {/* Sync indicator */}
              {isReady && (
                <div className="flex items-center gap-1 text-emerald-600 text-xs">
                  <Zap className="w-3 h-3" />
                  <span>Context synced</span>
                </div>
              )}
            </div>

            {/* Right: Product Toggles */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-2">Search:</span>
              {(Object.keys(productConfig) as Array<keyof typeof productConfig>).map((key) => {
                const { icon: Icon, label, color } = productConfig[key];
                const isActive = state.searchProducts[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggleProduct(key)}
                    className={`relative flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? `${color} text-white shadow-sm`
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    title={`Toggle ${label} search`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{label}</span>
                    {isActive && (
                      <Check className="w-2.5 h-2.5 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPACT VARIANT - For tight spaces
// ═══════════════════════════════════════════════════════════════════════════════
export function TripContextBadge() {
  const { state, hasDestination } = useTripContext();
  if (!hasDestination) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs">
      <MapPin className="w-3 h-3 text-primary-500" />
      <span className="font-medium text-gray-700">{state.destination}</span>
      {state.travelers.total > 1 && (
        <span className="text-gray-400">• {state.travelers.total} travelers</span>
      )}
    </div>
  );
}
