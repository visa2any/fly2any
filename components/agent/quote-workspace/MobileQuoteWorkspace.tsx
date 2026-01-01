"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Search, List, DollarSign, Send, Menu, X, Plus, Plane, Building2,
  Car, Camera, Bus, ChevronRight, Clock, Users, MapPin, CheckCircle2
} from "lucide-react";
import { useQuoteWorkspace, useQuoteItems, useQuotePricing } from "./QuoteWorkspaceProvider";

type MobileTab = "search" | "itinerary" | "pricing";

export default function MobileQuoteWorkspace() {
  const { state, updateTripDetails } = useQuoteWorkspace();
  const items = useQuoteItems();
  const pricing = useQuotePricing();
  const [activeTab, setActiveTab] = useState<MobileTab>("itinerary");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchType, setSearchType] = useState<"flight" | "hotel" | "car" | "activity" | "transfer">("flight");

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: pricing.currency, maximumFractionDigits: 0 }).format(n);

  const tabs = [
    { id: "search" as MobileTab, label: "Search", icon: <Search className="w-5 h-5" /> },
    { id: "itinerary" as MobileTab, label: "Itinerary", icon: <List className="w-5 h-5" />, badge: items.length },
    { id: "pricing" as MobileTab, label: "Pricing", icon: <DollarSign className="w-5 h-5" /> },
  ];

  const quickAddOptions = [
    { type: "flight" as const, label: "Flight", icon: <Plane className="w-5 h-5" />, color: "bg-blue-500" },
    { type: "hotel" as const, label: "Hotel", icon: <Building2 className="w-5 h-5" />, color: "bg-purple-500" },
    { type: "car" as const, label: "Car", icon: <Car className="w-5 h-5" />, color: "bg-orange-500" },
    { type: "activity" as const, label: "Activity", icon: <Camera className="w-5 h-5" />, color: "bg-green-500" },
    { type: "transfer" as const, label: "Transfer", icon: <Bus className="w-5 h-5" />, color: "bg-cyan-500" },
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col lg:hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-100 safe-area-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <input
                type="text"
                value={state.tripName}
                onChange={(e) => updateTripDetails({ tripName: e.target.value })}
                placeholder="Trip Name"
                className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none w-full"
              />
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                {state.destination && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {state.destination}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {state.duration || 0} days
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {state.travelers.total}
                </span>
              </div>
            </div>
            <button className="p-2 bg-fly2any-red text-white rounded-xl">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{fmt(pricing.total)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Your Profit</p>
            <p className="text-lg font-bold text-emerald-600">+{fmt(pricing.markupAmount)}</p>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-4"
            >
              {/* Search Type Selector */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
                {quickAddOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => setSearchType(opt.type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      searchType === opt.type
                        ? `${opt.color} text-white`
                        : "bg-white border border-gray-200 text-gray-700"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Search Form Placeholder */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <p className="text-center text-gray-500 py-8">
                  {searchType.charAt(0).toUpperCase() + searchType.slice(1)} search form
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "itinerary" && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-4 pb-24"
            >
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <List className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No items yet</p>
                  <p className="text-sm text-gray-500">
                    Use the search tab to add flights, hotels, and more
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          item.type === "flight"
                            ? "bg-blue-100 text-blue-600"
                            : item.type === "hotel"
                            ? "bg-purple-100 text-purple-600"
                            : item.type === "car"
                            ? "bg-orange-100 text-orange-600"
                            : item.type === "activity"
                            ? "bg-green-100 text-green-600"
                            : "bg-cyan-100 text-cyan-600"
                        }`}
                      >
                        {item.type === "flight" && <Plane className="w-5 h-5" />}
                        {item.type === "hotel" && <Building2 className="w-5 h-5" />}
                        {item.type === "car" && <Car className="w-5 h-5" />}
                        {item.type === "activity" && <Camera className="w-5 h-5" />}
                        {item.type === "transfer" && <Bus className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {(item as any).name || (item as any).airline || "Item"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {item.date && new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">{fmt(item.price)}</p>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "pricing" && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-4"
            >
              {/* Pricing Summary Card */}
              <div className="bg-gray-900 text-white rounded-2xl p-5 mb-4">
                <div className="text-center mb-4">
                  <p className="text-gray-400 text-sm">Quote Total</p>
                  <p className="text-4xl font-bold">{fmt(pricing.total)}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {fmt(pricing.perPerson)} per person
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-gray-400 text-xs">Subtotal</p>
                    <p className="font-semibold">{fmt(pricing.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Your Markup</p>
                    <p className="font-semibold text-emerald-400">+{fmt(pricing.markupAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Markup Slider */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">Markup</span>
                  <span className="text-2xl font-bold text-emerald-600">{pricing.markupPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={pricing.markupPercent}
                  className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-2 mt-4">
                  {[10, 15, 20, 25, 30].map((p) => (
                    <button
                      key={p}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pricing.markupPercent === p
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Items Total</span>
                    <span className="font-medium">{fmt(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>+ Markup ({pricing.markupPercent}%)</span>
                    <span className="font-medium">+{fmt(pricing.markupAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">{fmt(pricing.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Quick Add Button */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowQuickAdd(false)}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setShowQuickAdd(!showQuickAdd)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-fly2any-red text-white rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
      >
        <motion.div animate={{ rotate: showQuickAdd ? 45 : 0 }}>
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-40 right-4 z-50 space-y-2"
          >
            {quickAddOptions.map((opt, idx) => (
              <motion.button
                key={opt.type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  setSearchType(opt.type);
                  setActiveTab("search");
                  setShowQuickAdd(false);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 ${opt.color} text-white rounded-xl shadow-lg`}
              >
                {opt.icon}
                <span className="font-medium">{opt.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <nav className="flex-shrink-0 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
                activeTab === tab.id
                  ? "text-fly2any-red"
                  : "text-gray-400"
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-fly2any-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
