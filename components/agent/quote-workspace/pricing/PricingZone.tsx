"use client";

import { useState } from "react";
import { TrendingUp, ChevronDown, Users, Target, DollarSign, Minus, Plus, Paperclip } from "lucide-react";
import { useQuoteWorkspace, useQuotePricing, useQuoteItems } from "../QuoteWorkspaceProvider";
import AgentTrustPreview from "../AgentTrustPreview";
import SmartQuoteAssistant from "../SmartQuoteAssistant";
import QuoteDifferentiationScore from "../QuoteDifferentiationScore";
import DocumentAttachments from "../overlays/DocumentAttachments";
import QuoteAnalyticsMini from "./QuoteAnalyticsMini";
import { usePredictiveBundling, SuggestionsPanel } from "../predictive-bundling";
import type { Currency, ProductType } from "../types/quote-workspace.types";

const productLabels: Record<ProductType, string> = {
  flight: "Flights", hotel: "Hotels", car: "Cars", activity: "Activities",
  tour: "Tours", transfer: "Transfers", insurance: "Insurance", custom: "Custom",
};

// US-market first, then global — all from Currency type
const CURRENCIES: { code: Currency; label: string; flag: string }[] = [
  { code: "USD", label: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", label: "Euro", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", flag: "🇬🇧" },
  { code: "CAD", label: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", label: "Australian Dollar", flag: "🇦🇺" },
  { code: "MXN", label: "Mexican Peso", flag: "🇲🇽" },
  { code: "BRL", label: "Brazilian Real", flag: "🇧🇷" },
  { code: "JPY", label: "Japanese Yen", flag: "🇯🇵" },
  { code: "CHF", label: "Swiss Franc", flag: "🇨🇭" },
  { code: "INR", label: "Indian Rupee", flag: "🇮🇳" },
  { code: "NZD", label: "NZ Dollar", flag: "🇳🇿" },
  { code: "SGD", label: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", label: "HK Dollar", flag: "🇭🇰" },
  { code: "AED", label: "UAE Dirham", flag: "🇦🇪" },
  { code: "THB", label: "Thai Baht", flag: "🇹🇭" },
  { code: "ILS", label: "Israeli Shekel", flag: "🇮🇱" },
  { code: "COP", label: "Colombian Peso", flag: "🇨🇴" },
  { code: "CLP", label: "Chilean Peso", flag: "🇨🇱" },
  { code: "ARS", label: "Argentine Peso", flag: "🇦🇷" },
  { code: "DKK", label: "Danish Krone", flag: "🇩🇰" },
  { code: "NOK", label: "Norwegian Krone", flag: "🇳🇴" },
  { code: "SEK", label: "Swedish Krona", flag: "🇸🇪" },
  { code: "PLN", label: "Polish Złoty", flag: "🇵🇱" },
  { code: "CZK", label: "Czech Koruna", flag: "🇨🇿" },
  { code: "ZAR", label: "South African Rand", flag: "🇿🇦" },
  { code: "TRY", label: "Turkish Lira", flag: "🇹🇷" },
];

export default function PricingZone() {
  const { state, setMarkup, setCurrency, addDocument, removeDocument } = useQuoteWorkspace();
  const pricing = useQuotePricing();
  const items = useQuoteItems();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showMarkup, setShowMarkup] = useState(true);
  const [showProfitCalc, setShowProfitCalc] = useState(false);
  const [targetProfit, setTargetProfit] = useState("");
  const bundling = usePredictiveBundling();

  const breakdown = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + item.price;
    return acc;
  }, {} as Record<ProductType, number>);

  const rate = pricing.conversionRate ?? 1;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: pricing.currency, maximumFractionDigits: 0 }).format(n * rate);

  const handleProfitTarget = () => {
    const target = parseFloat(targetProfit);
    if (isNaN(target) || target <= 0) return;
    if (pricing.subtotal <= 0) return;
    const required = Math.round((target / pricing.subtotal) * 100);
    setMarkup(Math.min(100, Math.max(0, required)));
    setShowProfitCalc(false);
    setTargetProfit("");
  };

  return (
    <div className="p-3 space-y-3">
      {/* Total */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl p-3 shadow-lg shadow-primary-500/20">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] text-primary-200 uppercase tracking-wide">Total</span>
          <div className="flex items-center gap-1 text-[10px] text-primary-200">
            <Users className="w-3 h-3" />{state.travelers.total}
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{fmt(pricing.total)}</p>
        <p className="text-xs text-primary-200">{fmt(pricing.perPerson)}/person</p>
      </div>

      {/* Markup + Profit Calculator — Collapsible */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <button onClick={() => setShowMarkup(!showMarkup)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
          <span>Markup</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-600">{pricing.markupPercent}% · +{fmt(pricing.markupAmount)}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMarkup ? "rotate-180" : ""}`} />
          </div>
        </button>

        {showMarkup && (
          <div className="px-3 pb-3 space-y-2">
            {/* +/- percent buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMarkup(Math.max(0, pricing.markupPercent - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-lg font-bold text-emerald-600">{pricing.markupPercent}</span>
                <span className="text-xs font-bold text-emerald-600">%</span>
              </div>
              <button
                onClick={() => setMarkup(Math.min(100, pricing.markupPercent + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {/* Profit Target Toggle */}
              <button
                onClick={() => setShowProfitCalc(!showProfitCalc)}
                title="Set profit target"
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${showProfitCalc ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                <Target className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profit Target Calculator */}
            {showProfitCalc && (
              <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-[10px] text-indigo-600 font-semibold mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  I want to earn...
                </p>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="500"
                      value={targetProfit}
                      onChange={(e) => setTargetProfit(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleProfitTarget()}
                      className="w-full pl-5 pr-2 py-1.5 text-xs border border-indigo-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>
                  <button
                    onClick={handleProfitTarget}
                    disabled={pricing.subtotal <= 0}
                    className="px-2 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {pricing.subtotal <= 0 && (
                  <p className="text-[10px] text-indigo-400 mt-1">Add items first to calculate markup.</p>
                )}
              </div>
            )}

            <input
              type="range" min={0} max={100} step={1}
              value={pricing.markupPercent}
              onChange={(e) => setMarkup(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex gap-1">
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
            <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />Profit
              </span>
              <span className="text-sm font-bold text-emerald-600">+{fmt(pricing.markupAmount)}</span>
            </div>
          </div>
        )}
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
              <div key={t} className="flex justify-between">
                <span className="text-gray-500">{productLabels[t]}</span>
                <span className="font-medium">{fmt(breakdown[t])}</span>
              </div>
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

      {/* Currency - Full list */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[10px] font-medium text-gray-500">Currency</span>
          <select
            value={pricing.currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="text-xs font-medium bg-transparent border-0 focus:ring-0 text-gray-700 cursor-pointer max-w-[140px]"
          >
            {CURRENCIES.map(({ code, label, flag }) => (
              <option key={code} value={code}>{flag} {code} — {label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Predictive Bundling */}
      <SuggestionsPanel
        suggestions={bundling.suggestions}
        onAccept={bundling.accept}
        onDismiss={bundling.dismiss}
        isEnabled={bundling.isEnabled}
        onToggle={bundling.toggle}
      />

      {/* Document Attachments */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-50">
          <Paperclip className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Attachments
          </span>
          {state.documents.length > 0 && (
            <span className="ml-auto text-[10px] font-bold text-gray-400">
              {state.documents.length}
            </span>
          )}
        </div>
        <div className="px-3 py-2">
          <DocumentAttachments
            documents={state.documents}
            onAdd={addDocument}
            onRemove={removeDocument}
          />
        </div>
      </div>

      {/* Smart Quote Assistant */}
      <SmartQuoteAssistant />

      {/* Quote Differentiation Score */}
      <QuoteDifferentiationScore />

      {/* Agent Trust Preview */}
      <AgentTrustPreview />

      {/* Quick Analytics */}
      <QuoteAnalyticsMini />
    </div>
  );
}
