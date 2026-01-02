"use client";

import { motion } from "framer-motion";
import { Check, Shield, Clock, Sparkles, Users } from "lucide-react";
import { pricePsychology, getValuePerDay } from "./USConversionCopy";

interface ClientPricingPanelProps {
  total: number;
  perPerson: number;
  travelers: number;
  tripDays: number;
  currency?: string;
  inclusions?: string[];
}

/**
 * CLIENT PRICING PANEL - US Conversion Psychology
 * Value-focused, reduces line-item anxiety
 * Shows inclusions, not just costs
 */
export default function ClientPricingPanel({
  total,
  perPerson,
  travelers,
  tripDays,
  currency = "USD",
  inclusions = [],
}: ClientPricingPanelProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  const allInclusions = [...pricePsychology.inclusions.always, ...inclusions];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl overflow-hidden"
    >
      {/* Header: Value Framing */}
      <div className="p-5 text-center border-b border-white/10">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {pricePsychology.valueFraming.headline}
        </p>
        <p className="text-3xl font-bold tracking-tight">{fmt(total)}</p>
        <p className="text-sm text-gray-400 mt-1">
          {fmt(perPerson)} {pricePsychology.valueFraming.perPerson}
        </p>
        {tripDays > 0 && (
          <p className="text-xs text-emerald-400 mt-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            {getValuePerDay(total, tripDays)}
          </p>
        )}
      </div>

      {/* Travelers */}
      <div className="px-5 py-3 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Users className="w-4 h-4" />
          <span>{travelers} Traveler{travelers > 1 ? "s" : ""}</span>
        </div>
        <span className="text-xs text-gray-500">{tripDays} days</span>
      </div>

      {/* What's Included - Reduces Anxiety */}
      <div className="p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {pricePsychology.inclusions.headline}
        </p>
        <ul className="space-y-2">
          {allInclusions.slice(0, 6).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Confidence */}
      <div className="px-5 pb-5">
        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">{pricePsychology.priceConfidence.noHidden}</span>
          </div>
          <p className="text-xs text-gray-400 pl-6">
            {pricePsychology.priceConfidence.transparent}
          </p>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="px-5 pb-5 flex items-center justify-center gap-4 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>SSL Secured</span>
        </div>
        <div className="w-px h-3 bg-gray-700" />
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>24/7 Support</span>
        </div>
      </div>
    </motion.div>
  );
}
