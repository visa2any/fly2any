"use client";

import { Plane, Building2 } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";

export default function EmptyItinerary() {
  const { state, setActiveTab, dispatch } = useQuoteWorkspace();

  const openPanel = (tab: "flight" | "hotel") => {
    setActiveTab(tab);
    if (!state.ui.sidebarExpanded) {
      dispatch({ type: "SET_UI", payload: { sidebarExpanded: true } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Plane className="w-5 h-5 text-blue-600" />
        </div>
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-purple-600" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">Your itinerary is empty</p>
      <p className="text-xs text-gray-400 mb-4">Click an icon to search & add</p>
      <div className="flex gap-2">
        <button onClick={() => openPanel("flight")} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">+ Flight</button>
        <button onClick={() => openPanel("hotel")} className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">+ Hotel</button>
      </div>
    </div>
  );
}
