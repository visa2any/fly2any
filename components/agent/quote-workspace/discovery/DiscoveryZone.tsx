"use client";

import { Plane, Building2, Car, Compass, Bus, Shield, Package } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { ProductType } from "../types/quote-workspace.types";
import FlightSearchPanel from "./FlightSearchPanel";
import HotelSearchPanel from "./HotelSearchPanel";

const tabs: { type: ProductType; icon: typeof Plane; label: string; color: string }[] = [
  { type: "flight", icon: Plane, label: "Flights", color: "text-blue-600 bg-blue-50" },
  { type: "hotel", icon: Building2, label: "Hotels", color: "text-purple-600 bg-purple-50" },
  { type: "car", icon: Car, label: "Cars", color: "text-cyan-600 bg-cyan-50" },
  { type: "activity", icon: Compass, label: "Activities", color: "text-emerald-600 bg-emerald-50" },
  { type: "transfer", icon: Bus, label: "Transfers", color: "text-amber-600 bg-amber-50" },
  { type: "insurance", icon: Shield, label: "Insurance", color: "text-rose-600 bg-rose-50" },
  { type: "custom", icon: Package, label: "Custom", color: "text-gray-600 bg-gray-100" },
];

export default function DiscoveryZone() {
  const { state, setActiveTab } = useQuoteWorkspace();
  const activeTab = state.ui.activeTab;

  return (
    <div className="flex flex-col h-full">
      {/* Compact Icon Tabs */}
      <div className="flex-shrink-0 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex gap-0.5">
          {tabs.map(({ type, icon: Icon, label, color }) => {
            const isActive = activeTab === type;
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                title={label}
                className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive ? color : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden 2xl:inline text-[10px]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
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
    <div className="flex flex-col items-center justify-center h-48 text-center p-4">
      <Icon className="w-8 h-8 text-gray-300 mb-2" />
      <p className="text-xs text-gray-400">{label} — Coming Soon</p>
    </div>
  );
}
