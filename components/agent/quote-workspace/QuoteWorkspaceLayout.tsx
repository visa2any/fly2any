"use client";

import { ReactNode, useState, useCallback, useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";
// Framer Motion removed - panel always visible
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";

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
  const { state, setDiscoveryPanelWidth } = useQuoteWorkspace();
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
    <div className="fixed inset-0 top-auto lg:left-16 bg-gray-50/50 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 120px)', top: '120px' }}>
      {/* Compact Header */}
      <header className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        {header}
      </header>

      {/* Main Layout - Zero gaps */}
      <main className="flex-1 min-h-0 flex">
        {/* Left: Discovery Panel */}
        <aside className="hidden lg:flex flex-shrink-0 bg-white border-r border-gray-100 z-30">
          <div className="relative flex" style={{ width: panelWidth }}>
            <div
              style={{ width: panelWidth }}
              className="h-full overflow-y-auto overflow-x-visible scrollbar-thin scrollbar-thumb-gray-200 bg-white"
            >
              {discovery}
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={handleResizeStart}
              className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group z-10 ${
                isResizing ? "bg-indigo-500" : "hover:bg-indigo-400"
              } transition-colors`}
            >
              <div className={`absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-12 flex items-center justify-center rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                isResizing ? "bg-indigo-500 opacity-100" : "bg-gray-200"
              }`}>
                <GripVertical className={`w-3 h-3 ${isResizing ? "text-white" : "text-gray-400"}`} />
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Itinerary Canvas - Full width, no padding */}
        <section className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-gray-50/80 to-white">
          <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-200">
            {itinerary}
          </div>
        </section>

        {/* Right: Pricing - Full height */}
        <aside className="hidden lg:flex flex-shrink-0 w-64 flex-col bg-white border-l border-gray-100 overflow-hidden">
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
