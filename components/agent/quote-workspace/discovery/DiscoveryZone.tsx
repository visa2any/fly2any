"use client";

import { Plane, Building2, Car, Compass, Bus, Shield, Package } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import FlightSearchPanel from "./FlightSearchPanel";
import HotelSearchPanel from "./HotelSearchPanel";

export default function DiscoveryZone() {
  const { state } = useQuoteWorkspace();
  const activeTab = state.ui.activeTab;

  return (
    <div className="flex flex-col h-full">
      {/* Panel Content - No tabs, handled by icon rail */}
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
