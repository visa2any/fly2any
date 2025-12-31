"use client";

import { ReactNode, useState, useCallback, useRef, useEffect } from "react";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, ChevronRight, ChevronLeft, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";
import type { ProductType } from "./types/quote-workspace.types";

const productIcons: { type: ProductType; icon: typeof Plane; label: string; color: string }[] = [
  { type: "flight", icon: Plane, label: "Flights", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
  { type: "hotel", icon: Building2, label: "Hotels", color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
  { type: "car", icon: Car, label: "Cars", color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100" },
  { type: "activity", icon: Compass, label: "Activities", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
  { type: "transfer", icon: Bus, label: "Transfers", color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
  { type: "insurance", icon: Shield, label: "Insurance", color: "text-rose-600 bg-rose-50 hover:bg-rose-100" },
  { type: "custom", icon: Package, label: "Custom", color: "text-gray-600 bg-gray-100 hover:bg-gray-200" },
];

interface QuoteWorkspaceLayoutProps {
  header: ReactNode;
  discovery: ReactNode;
  itinerary: ReactNode;
  pricing: ReactNode;
  footer: ReactNode;
  overlays?: ReactNode;
}

export default function QuoteWorkspaceLayout({
  header,
  discovery,
  itinerary,
  pricing,
  footer,
  overlays,
}: QuoteWorkspaceLayoutProps) {
  const { state, setActiveTab, toggleSidebar, setDiscoveryPanelWidth } = useQuoteWorkspace();
  const isExpanded = state.ui.sidebarExpanded;
  const activeTab = state.ui.activeTab;
  const panelWidth = state.ui.discoveryPanelWidth;

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: panelWidth });

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = { startX: e.clientX, startWidth: panelWidth };
  }, [panelWidth]);

  // Handle resize move and end
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeRef.current.startX;
      const newWidth = resizeRef.current.startWidth + delta;
      setDiscoveryPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setDiscoveryPanelWidth]);

  return (
    <div className="h-screen bg-gray-50/50 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <header className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        {header}
      </header>

      {/* Main Layout */}
      <main className="flex-1 min-h-0 flex">
        {/* Left: Icon Rail + Expandable Panel */}
        <aside className="hidden lg:flex flex-shrink-0 bg-white border-r border-gray-100 overflow-hidden">
          {/* Icon Rail - Always Visible */}
          <div className="w-14 flex flex-col border-r border-gray-100 bg-gray-50/50">
            {/* Product Icons */}
            <div className="flex-1 py-2 space-y-1">
              {productIcons.map(({ type, icon: Icon, label, color }) => {
                const isActive = activeTab === type;
                return (
                  <div key={type} className="relative group px-2">
                    <button
                      onClick={() => {
                        setActiveTab(type);
                        if (!isExpanded) toggleSidebar();
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                        isActive ? color : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Expand Toggle */}
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={toggleSidebar}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expandable Panel with Resizable Width */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: panelWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative flex"
              >
                {/* Panel Content */}
                <div
                  style={{ width: panelWidth }}
                  className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 bg-white"
                >
                  {discovery}
                </div>

                {/* Resize Handle */}
                <div
                  onMouseDown={handleResizeStart}
                  className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group z-10 ${
                    isResizing ? "bg-blue-500" : "hover:bg-blue-400"
                  } transition-colors`}
                >
                  {/* Visual indicator on hover */}
                  <div className={`absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-12 flex items-center justify-center rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                    isResizing ? "bg-blue-500 opacity-100" : "bg-gray-200"
                  }`}>
                    <GripVertical className={`w-3 h-3 ${isResizing ? "text-white" : "text-gray-400"}`} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Center: Itinerary Canvas - Maximum Space */}
        <section className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-gray-50/80 to-white">
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-200">
            {itinerary}
          </div>
        </section>

        {/* Right: Pricing - Compact */}
        <aside className="hidden lg:flex flex-shrink-0 w-72 flex-col bg-white border-l border-gray-100 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {pricing}
          </div>
        </aside>
      </main>

      {/* Minimal Footer */}
      <footer className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100">
        {footer}
      </footer>

      {/* Resize overlay to prevent selection during drag */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}

      {overlays}
    </div>
  );
}
