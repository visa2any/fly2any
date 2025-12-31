"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { DollarSign, Percent, TrendingUp, Users, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { useQuoteWorkspace, useQuotePricing, useQuoteItems } from "../QuoteWorkspaceProvider";
import type { Currency, ProductType } from "../types/quote-workspace.types";

// Product icons mapping
const productLabels: Record<ProductType, string> = {
  flight: "Flights",
  hotel: "Hotels",
  car: "Car Rentals",
  activity: "Activities",
  transfer: "Transfers",
  insurance: "Insurance",
  custom: "Custom Items",
};

export default function PricingZone() {
  const { state, setMarkup, setCurrency } = useQuoteWorkspace();
  const pricing = useQuotePricing();
  const items = useQuoteItems();
  const [breakdownOpen, setBreakdownOpen] = useState(true);

  // Calculate breakdown by product type
  const breakdown = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + item.price;
    return acc;
  }, {} as Record<ProductType, number>);

  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: pricing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-5">
      {/* Total Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5 shadow-xl"
      >
        <p className="text-sm text-gray-300 mb-1">Quote Total</p>
        <AnimatedTotal amount={pricing.total} currency={pricing.currency} />
        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            {state.travelers.total} travelers
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Per person</p>
            <p className="text-lg font-bold">{formatPrice(pricing.perPerson)}</p>
          </div>
        </div>
      </motion.div>

      {/* Markup Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">Your Markup</span>
          </div>
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold">
            {pricing.markupPercent}%
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={pricing.markupPercent}
          onChange={(e) => setMarkup(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        {/* Quick presets */}
        <div className="flex gap-2 mt-3">
          {[10, 15, 20, 25].map((p) => (
            <button
              key={p}
              onClick={() => setMarkup(p)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                pricing.markupPercent === p
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Profit Display */}
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Your profit
            </span>
            <span className="text-xl font-bold text-emerald-600">
              +{formatPrice(pricing.markupAmount)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Breakdown Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <button
          onClick={() => setBreakdownOpen(!breakdownOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">Price Breakdown</span>
          </div>
          {breakdownOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <motion.div
          initial={false}
          animate={{ height: breakdownOpen ? "auto" : 0 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 space-y-2">
            {/* Product breakdown */}
            {(Object.keys(breakdown) as ProductType[]).map((type) => (
              <div key={type} className="flex justify-between text-sm py-1.5">
                <span className="text-gray-600">{productLabels[type]}</span>
                <span className="font-medium text-gray-900">{formatPrice(breakdown[type])}</span>
              </div>
            ))}

            {items.length === 0 && (
              <p className="text-sm text-gray-400 py-2 text-center">No items added yet</p>
            )}

            {items.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatPrice(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 text-emerald-600">
                    <span>+ Markup ({pricing.markupPercent}%)</span>
                    <span className="font-medium">+{formatPrice(pricing.markupAmount)}</span>
                  </div>
                  {pricing.taxes > 0 && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="font-medium">{formatPrice(pricing.taxes)}</span>
                    </div>
                  )}
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-sm py-1 text-red-600">
                      <span>Discount</span>
                      <span className="font-medium">-{formatPrice(pricing.discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(pricing.total)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Currency Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Currency</span>
          </div>
          <select
            value={pricing.currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>
      </motion.div>
    </div>
  );
}

// Animated total component
function AnimatedTotal({ amount, currency }: { amount: number; currency: string }) {
  const [displayValue, setDisplayValue] = useState(amount);
  const prevAmount = useRef(amount);

  useEffect(() => {
    const controls = animate(prevAmount.current, amount, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (value) => setDisplayValue(value),
    });

    prevAmount.current = amount;

    return () => controls.stop();
  }, [amount]);

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayValue);

  return (
    <motion.p
      key={amount}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      className="text-4xl font-bold tracking-tight"
    >
      {formatted}
    </motion.p>
  );
}
