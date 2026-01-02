"use client";

import { useState } from "react";
import { TrendingUp, ChevronDown, Users } from "lucide-react";
import { useQuoteWorkspace, useQuotePricing, useQuoteItems } from "../QuoteWorkspaceProvider";
import AgentTrustPreview from "../AgentTrustPreview";
import SmartQuoteAssistant from "../SmartQuoteAssistant";
import QuoteDifferentiationScore from "../QuoteDifferentiationScore";
import { usePredictiveBundling, SuggestionsPanel } from "../predictive-bundling";
import type { Currency, ProductType } from "../types/quote-workspace.types";

const productLabels: Record<ProductType, string> = {
  flight: "Flights", hotel: "Hotels", car: "Cars", activity: "Activities",
  transfer: "Transfers", insurance: "Insurance", custom: "Custom",
};

export default function PricingZone() {
  const { state, setMarkup, setCurrency } = useQuoteWorkspace();
  const pricing = useQuotePricing();
  const items = useQuoteItems();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const bundling = usePredictiveBundling();

  const breakdown = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + item.price;
    return acc;
  }, {} as Record<ProductType, number>);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: pricing.currency, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="p-3 space-y-3">
      {/* Total - Compact */}
      <div className="bg-gray-900 text-white rounded-xl p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Total</span>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Users className="w-3 h-3" />{state.travelers.total}
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{fmt(pricing.total)}</p>
        <p className="text-xs text-gray-400">{fmt(pricing.perPerson)}/person</p>
      </div>

      {/* Markup - Tactile + Manual Input */}
      <div className="bg-white border border-gray-100 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Markup</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={pricing.markupPercent}
              onChange={(e) => setMarkup(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-12 px-1.5 py-0.5 text-sm font-bold text-emerald-600 text-right bg-emerald-50 border border-emerald-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <span className="text-sm font-bold text-emerald-600">%</span>
          </div>
        </div>
        <input
          type="range" min={0} max={50} step={1}
          value={pricing.markupPercent}
          onChange={(e) => setMarkup(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex gap-1 mt-2">
          {[10, 15, 20, 25, 30].map((p) => (
            <button
              key={p}
              onClick={() => setMarkup(p)}
              className={`flex-1 py-1 text-[10px] font-semibold rounded transition-colors ${
                pricing.markupPercent === p ? "bg-emerald-100 text-emerald-700" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
        {/* Profit */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" />Profit</span>
          <span className="text-sm font-bold text-emerald-600">+{fmt(pricing.markupAmount)}</span>
        </div>
      </div>

      {/* Breakdown - Collapsible */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
          <span>Breakdown</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
        </button>
        {showBreakdown && (
          <div className="px-3 pb-3 space-y-1 text-[11px]">
            {(Object.keys(breakdown) as ProductType[]).map((t) => (
              <div key={t} className="flex justify-between"><span className="text-gray-500">{productLabels[t]}</span><span className="font-medium">{fmt(breakdown[t])}</span></div>
            ))}
            {items.length === 0 && <p className="text-gray-400 text-center py-2">No items</p>}
            {items.length > 0 && (
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{fmt(pricing.subtotal)}</span></div>
                <div className="flex justify-between text-emerald-600"><span>+ {pricing.markupPercent}%</span><span>+{fmt(pricing.markupAmount)}</span></div>
                <div className="flex justify-between font-semibold pt-1 border-t border-gray-100"><span>Total</span><span>{fmt(pricing.total)}</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Currency - Inline */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
        <span className="text-[10px] font-medium text-gray-500">Currency</span>
        <select
          value={pricing.currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="text-xs font-medium bg-transparent border-0 focus:ring-0 text-gray-700 cursor-pointer"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="CAD">CAD</option>
          <option value="AUD">AUD</option>
        </select>
      </div>

      {/* Predictive Bundling - Smart suggestions */}
      <SuggestionsPanel
        suggestions={bundling.suggestions}
        onAccept={bundling.accept}
        onDismiss={bundling.dismiss}
        isEnabled={bundling.isEnabled}
        onToggle={bundling.toggle}
      />

      {/* Smart Quote Assistant - AI suggestions */}
      <SmartQuoteAssistant />

      {/* Quote Differentiation Score - Agent insights */}
      <QuoteDifferentiationScore />

      {/* Agent Trust Preview - What client sees */}
      <AgentTrustPreview />
    </div>
  );
}
