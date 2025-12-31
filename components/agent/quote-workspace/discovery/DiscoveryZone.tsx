"use client";

import { Plane, Building2, Car, Compass, Bus, Shield, Package } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import FlightSearchPanel from "./FlightSearchPanel";
import HotelSearchPanel from "./HotelSearchPanel";
import type { ProductType } from "../types/quote-workspace.types";

const PRODUCT_TABS: { type: ProductType; icon: typeof Plane; label: string }[] = [
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
      {/* Product Type Tabs - TOP */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b border-gray-100 bg-gray-50/50">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {PRODUCT_TABS.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === type
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "flight" && <FlightSearchPanel />}
        {activeTab === "hotel" && <HotelSearchPanel />}
        {activeTab === "car" && <ComingSoon label="Cars" icon={Car} />}
        {activeTab === "activity" && <ComingSoon label="Activities" icon={Compass} />}
        {activeTab === "transfer" && <ComingSoon label="Transfers" icon={Bus} />}
        {activeTab === "insurance" && <ComingSoon label="Insurance" icon={Shield} />}
        {activeTab === "custom" && <ComingSoon label="Custom" icon={Package} />}
      </div>
    </div>
  );
}

function ComingSoon({ label, icon: Icon }: { label: string; icon: typeof Plane }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
      <Icon className="w-6 h-6 text-gray-300 mb-2" />
      <p className="text-xs text-gray-400">{label} — Coming Soon</p>
    </div>
  );
}
