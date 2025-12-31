"use client";

import { motion } from "framer-motion";
import { Plane, Building2, Car, Compass, Bus, Shield, Package } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { ProductType } from "../types/quote-workspace.types";
import FlightSearchPanel from "./FlightSearchPanel";
import HotelSearchPanel from "./HotelSearchPanel";

// Tab configuration
const tabs: { type: ProductType; icon: typeof Plane; label: string }[] = [
  { type: "flight", icon: Plane, label: "Flights" },
  { type: "hotel", icon: Building2, label: "Hotels" },
  { type: "car", icon: Car, label: "Cars" },
  { type: "activity", icon: Compass, label: "Activities" },
  { type: "transfer", icon: Bus, label: "Transfers" },
  { type: "insurance", icon: Shield, label: "Insurance" },
  { type: "custom", icon: Package, label: "Custom" },
];

export default function DiscoveryZone() {
  const { state, setActiveTab } = useQuoteWorkspace();
  const activeTab = state.ui.activeTab;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto scrollbar-none">
          {tabs.map(({ type, icon: Icon, label }) => {
            const isActive = activeTab === type;
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "flight" && <FlightSearchPanel />}
        {activeTab === "hotel" && <HotelSearchPanel />}
        {activeTab === "car" && <ComingSoonPanel type="car" />}
        {activeTab === "activity" && <ComingSoonPanel type="activity" />}
        {activeTab === "transfer" && <ComingSoonPanel type="transfer" />}
        {activeTab === "insurance" && <ComingSoonPanel type="insurance" />}
        {activeTab === "custom" && <ComingSoonPanel type="custom" />}
      </div>
    </div>
  );
}

// Placeholder for tabs not yet implemented
function ComingSoonPanel({ type }: { type: ProductType }) {
  const config = {
    car: { icon: Car, label: "Car Rentals", gradient: "from-cyan-500 to-blue-600" },
    activity: { icon: Compass, label: "Activities", gradient: "from-emerald-500 to-teal-600" },
    transfer: { icon: Bus, label: "Transfers", gradient: "from-amber-500 to-orange-600" },
    insurance: { icon: Shield, label: "Insurance", gradient: "from-rose-500 to-pink-600" },
    custom: { icon: Package, label: "Custom Items", gradient: "from-gray-600 to-gray-800" },
  };

  const { icon: Icon, label, gradient } = config[type as keyof typeof config] || config.custom;

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-6 text-center">
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{label}</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Live {label.toLowerCase()} search coming in Phase 2. For now, use the Flights and Hotels tabs.
      </p>
    </div>
  );
}
