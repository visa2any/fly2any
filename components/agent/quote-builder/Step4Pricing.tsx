"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Percent, Calculator, TrendingUp, Plane, Building2, Compass, Bus, Car, Shield, Package, Info, Tag, Receipt } from "lucide-react";
import { QuoteData } from "../QuoteBuilder";

interface Step4PricingProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  agentMarkupDefault: number;
  onNext: () => void;
  onPrev: () => void;
}

const PRODUCT_CONFIG = [
  { key: "flights", costKey: "flightsCost", label: "Flights", icon: Plane, gradient: "from-blue-500 to-indigo-600" },
  { key: "hotels", costKey: "hotelsCost", label: "Hotels", icon: Building2, gradient: "from-purple-500 to-pink-600" },
  { key: "activities", costKey: "activitiesCost", label: "Activities", icon: Compass, gradient: "from-emerald-500 to-teal-600" },
  { key: "transfers", costKey: "transfersCost", label: "Transfers", icon: Bus, gradient: "from-amber-500 to-orange-600" },
  { key: "carRentals", costKey: "carRentalsCost", label: "Car Rentals", icon: Car, gradient: "from-cyan-500 to-blue-600" },
  { key: "insurance", costKey: "insuranceCost", label: "Insurance", icon: Shield, gradient: "from-rose-500 to-pink-600" },
  { key: "customItems", costKey: "customItemsCost", label: "Custom Items", icon: Package, gradient: "from-gray-600 to-gray-800" },
];

export default function QuoteBuilderStep4Pricing({
  quoteData,
  updateQuoteData,
  agentMarkupDefault,
  onNext,
  onPrev,
}: Step4PricingProps) {
  const [pricing, setPricing] = useState({
    agentMarkupPercent: quoteData.agentMarkupPercent || 15,
    taxes: quoteData.taxes || 0,
    fees: quoteData.fees || 0,
    discount: quoteData.discount || 0,
    currency: quoteData.currency || "USD",
  });

  useEffect(() => {
    const costs = PRODUCT_CONFIG.reduce((acc, p) => {
      acc[p.costKey] = (quoteData as any)[p.key].reduce((sum: number, item: any) => sum + (item.price || 0), 0);
      return acc;
    }, {} as Record<string, number>);

    const subtotal = Object.values(costs).reduce((a, b) => a + b, 0);
    const agentMarkup = (subtotal * pricing.agentMarkupPercent) / 100;
    const total = subtotal + agentMarkup + pricing.taxes + pricing.fees - pricing.discount;

    updateQuoteData({
      ...costs,
      subtotal,
      agentMarkup,
      agentMarkupPercent: pricing.agentMarkupPercent,
      taxes: pricing.taxes,
      fees: pricing.fees,
      discount: pricing.discount,
      total: Math.max(0, total),
      currency: pricing.currency,
    });
  }, [quoteData.flights, quoteData.hotels, quoteData.activities, quoteData.transfers, quoteData.carRentals, quoteData.insurance, quoteData.customItems, pricing]);

  const handleChange = (field: string, value: number | string) => {
    setPricing((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (quoteData.subtotal === 0) {
      alert("Please add at least one product to the quote");
      return;
    }
    onNext();
  };

  const fmt = (n: number) => `${pricing.currency === "USD" ? "$" : pricing.currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Calculator className="w-7 h-7 text-emerald-500" />
          Pricing & Markup
        </h2>
        <p className="text-gray-600">Set your markup and calculate the final price</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gray-400" />
            Cost Breakdown
          </h3>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
            {PRODUCT_CONFIG.map(({ key, costKey, label, icon: Icon, gradient }) => {
              const cost = (quoteData as any)[costKey];
              const count = (quoteData as any)[key].length;
              if (cost <= 0) return null;
              return (
                <div key={key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{label} ({count})</span>
                  </div>
                  <span className="font-semibold text-gray-900">{fmt(cost)}</span>
                </div>
              );
            })}

            {quoteData.subtotal === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No products added yet</p>
              </div>
            )}

            {quoteData.subtotal > 0 && (
              <>
                <div className="border-t border-gray-200 pt-3 mt-3" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Base Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">{fmt(quoteData.subtotal)}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Markup & Adjustments */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Percent className="w-5 h-5 text-gray-400" />
            Markup & Adjustments
          </h3>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 shadow-sm">
            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select
                value={pricing.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>

            {/* Agent Markup Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Agent Markup
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={pricing.agentMarkupPercent}
                  onChange={(e) => handleChange("agentMarkupPercent", parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="w-16 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <span className="text-lg font-bold text-emerald-600">{pricing.agentMarkupPercent}%</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Your markup:
                  </span>
                  <span className="text-lg font-bold text-emerald-600">+{fmt(quoteData.agentMarkup)}</span>
                </div>
              </div>
            </div>

            {/* Taxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Taxes & Fees
              </label>
              <input
                type="number"
                value={pricing.taxes || ""}
                onChange={(e) => handleChange("taxes", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                Discount (Optional)
              </label>
              <input
                type="number"
                value={pricing.discount || ""}
                onChange={(e) => handleChange("discount", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Total Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 via-primary-700 to-rose-600 text-white rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Total Quote Price</p>
            <p className="text-4xl font-bold">{fmt(quoteData.total)}</p>
            <p className="text-sm opacity-75 mt-2">
              {quoteData.travelers} {quoteData.travelers === 1 ? "traveler" : "travelers"} • {quoteData.duration} {quoteData.duration === 1 ? "day" : "days"}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4 text-center">
            <p className="text-xs opacity-80">Per Person</p>
            <p className="text-2xl font-bold">{fmt(quoteData.total / Math.max(1, quoteData.travelers))}</p>
          </div>
        </div>
      </motion.div>

      {/* Earnings Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Your Estimated Earnings</p>
          <p className="text-xs text-blue-700 mt-1">
            With {pricing.agentMarkupPercent}% markup, you'll earn approximately <strong>{fmt(quoteData.agentMarkup)}</strong> from this quote.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button onClick={onPrev} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button onClick={handleNext} className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2">
          Next: Review & Send
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
