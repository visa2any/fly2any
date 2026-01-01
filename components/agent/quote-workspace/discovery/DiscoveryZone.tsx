"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, MapPin, Calendar, Users, Search, Sparkles } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import FlightSearchPanel from "./FlightSearchPanel";
import HotelSearchPanel from "./HotelSearchPanel";
import CarSearchPanel from "./CarSearchPanel";
import ActivitiesSearchPanel from "./ActivitiesSearchPanel";
import TransfersSearchPanel from "./TransfersSearchPanel";
import PremiumDatePicker from "@/components/common/PremiumDatePicker";
import type { ProductType } from "../types/quote-workspace.types";

const PRODUCT_TABS: {
  type: ProductType;
  icon: typeof Plane;
  label: string;
  gradient: string;
  shadowColor: string;
}[] = [
  { type: "flight", icon: Plane, label: "Flights", gradient: "from-blue-500 to-indigo-600", shadowColor: "shadow-blue-500/30" },
  { type: "hotel", icon: Building2, label: "Hotels", gradient: "from-purple-500 to-pink-600", shadowColor: "shadow-purple-500/30" },
  { type: "car", icon: Car, label: "Cars", gradient: "from-cyan-500 to-blue-600", shadowColor: "shadow-cyan-500/30" },
  { type: "activity", icon: Compass, label: "Activities", gradient: "from-emerald-500 to-teal-600", shadowColor: "shadow-emerald-500/30" },
  { type: "transfer", icon: Bus, label: "Transfers", gradient: "from-amber-500 to-orange-600", shadowColor: "shadow-amber-500/30" },
  { type: "insurance", icon: Shield, label: "Insurance", gradient: "from-rose-500 to-pink-600", shadowColor: "shadow-rose-500/30" },
  { type: "custom", icon: Package, label: "Custom", gradient: "from-gray-600 to-gray-800", shadowColor: "shadow-gray-500/30" },
];

export default function DiscoveryZone() {
  const { state, setActiveTab } = useQuoteWorkspace();
  const activeTab = state.ui.activeTab;

  return (
    <div className="flex flex-col h-full">
      {/* Product Type Tabs - Icon Only with Hover Tooltips */}
      <div className="flex-shrink-0 px-2 py-2 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/80">
        <div className="flex gap-1.5 justify-center">
          {PRODUCT_TABS.map(({ type, icon: Icon, label, gradient, shadowColor }) => {
            const isActive = activeTab === type;
            return (
              <div key={type} className="relative group">
                <motion.button
                  onClick={() => setActiveTab(type)}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg ${shadowColor}`
                      : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradient} opacity-40 blur-md`}
                    />
                  )}
                  <Icon className="relative w-5 h-5" />
                </motion.button>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  {label}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Content with Premium Transition */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {activeTab === "flight" && <FlightSearchPanel />}
          {activeTab === "hotel" && <HotelSearchPanel />}
          {activeTab === "car" && <CarSearchPanel />}
          {activeTab === "activity" && <ActivitiesSearchPanel />}
          {activeTab === "transfer" && <TransfersSearchPanel />}
          {activeTab === "insurance" && <InsuranceSearchPanel />}
          {activeTab === "custom" && <CustomItemPanel />}
        </motion.div>
      </div>
    </div>
  );
}

// Generic Search Panel for Coming Soon Products - Premium Pattern
function GenericSearchPanel({
  type,
  label,
  icon: Icon,
  gradient,
  fields
}: {
  type: string;
  label: string;
  icon: typeof Plane;
  gradient: string;
  fields: { key: string; label: string; type: "text" | "date" | "number"; placeholder?: string; minDateKey?: string }[];
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Find {label}</h3>
          <p className="text-[10px] text-gray-400">Search and add to quote</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            {field.type === "date" ? (
              <PremiumDatePicker
                label={field.label}
                value={formData[field.key] || ""}
                onChange={(date) => setFormData({ ...formData, [field.key]: date })}
                minDate={field.minDateKey ? formData[field.minDateKey] || minDate : minDate}
                placeholder={field.placeholder || field.label}
              />
            ) : (
              <>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    {field.type === "text" ? <MapPin className="w-2.5 h-2.5 text-white" /> : <Users className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Search Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${gradient} text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all`}
      >
        <Search className="w-5 h-5" />
        Search {label}
      </motion.button>

      {/* Coming Soon Badge */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`}
            />
          ))}
        </div>
        <span className="text-[10px] text-gray-400 font-medium">API Integration Coming Soon</span>
      </div>
    </motion.div>
  );
}


// Insurance Search Panel
function InsuranceSearchPanel() {
  return (
    <GenericSearchPanel
      type="insurance"
      label="Travel Insurance"
      icon={Shield}
      gradient="from-rose-500 to-pink-600"
      fields={[
        { key: "destination", label: "Destination", type: "text", placeholder: "Country or region" },
        { key: "startDate", label: "Trip Start", type: "date" },
        { key: "endDate", label: "Trip End", type: "date", minDateKey: "startDate" },
        { key: "travelers", label: "Travelers", type: "number", placeholder: "Number of travelers" },
      ]}
    />
  );
}

// Custom Item Panel
function CustomItemPanel() {
  return (
    <GenericSearchPanel
      type="custom"
      label="Custom Items"
      icon={Package}
      gradient="from-gray-600 to-gray-800"
      fields={[
        { key: "name", label: "Item Name", type: "text", placeholder: "Service or product name" },
        { key: "description", label: "Description", type: "text", placeholder: "Brief description" },
        { key: "price", label: "Price (USD)", type: "number", placeholder: "0.00" },
      ]}
    />
  );
}
