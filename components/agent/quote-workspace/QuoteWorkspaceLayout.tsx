"use client";

import { ReactNode, useState, useCallback, useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";
import { useViewMode } from "./itinerary/ViewModeContext";
import { useAgentShortcuts, CommandPalette, ShortcutsOverlay, SaveToast } from "./velocity";

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
  const { state, setDiscoveryPanelWidth, dispatch, undo, redo } = useQuoteWorkspace();
  const { toggleViewMode } = useViewMode();
  const panelWidth = state.ui.discoveryPanelWidth;

  // Velocity UX State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Keyboard Shortcuts
  const { showShortcutHint } = useAgentShortcuts({
    onTogglePreview: toggleViewMode,
    onSave: () => {
      dispatch({ type: "SET_SAVING", payload: true });
      setTimeout(() => {
        dispatch({ type: "SET_SAVING", payload: false });
        dispatch({ type: "SET_LAST_SAVED", payload: new Date().toISOString() });
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000);
      }, 500);
    },
    onSearch: () => {
      const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
      searchInput?.focus();
    },
    onCommandPalette: () => setCommandPaletteOpen(true),
    onUndo: undo,
    onRedo: redo,
  });

  // Listen for command palette open event
  useEffect(() => {
    const handler = () => setCommandPaletteOpen(true);
    window.addEventListener("open-command-palette", handler);
    return () => window.removeEventListener("open-command-palette", handler);
  }, []);

  // Command palette actions
  const handleCommandAction = useCallback((commandId: string) => {
    if (commandId.startsWith("nav-")) {
      const tab = commandId.replace("nav-", "") + "s";
      dispatch({ type: "SET_ACTIVE_TAB", payload: tab.replace("ss", "s") as any });
    } else if (commandId === "preview") {
      toggleViewMode();
    } else if (commandId === "save") {
      dispatch({ type: "SET_SAVING", payload: true });
    } else if (commandId.startsWith("preset-")) {
      const presetId = commandId.replace("preset-", "");
      // Apply preset logic
      localStorage.setItem("fly2any_quote_preset", presetId);
    }
    setCommandPaletteOpen(false);
  }, [dispatch, toggleViewMode]);

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState(false);
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
    <>
    {/* Print styles: only show itinerary canvas (agent view).
        Client preview overlay has its own print styles that take precedence when open. */}
    <style>{`
      @media print {
        /* Reset the fixed workspace container so content flows for print */
        .fixed.inset-0 {
          position: static !important;
          overflow: visible !important;
          height: auto !important;
        }
        /* Hide non-printable workspace elements */
        header.print\\:hidden, aside.print\\:hidden, footer.print\\:hidden, .print\\:hidden {
          display: none !important;
        }
        /* Show and reset itinerary canvas for print */
        #quote-print-area {
          display: block !important;
          position: static !important;
          overflow: visible !important;
          width: 100% !important;
          height: auto !important;
          background: white !important;
        }
        #quote-print-area > * {
          overflow: visible !important;
        }
        /* Client preview overlay — overrides above when present */
        #quote-client-preview {
          display: block !important;
          position: static !important;
          overflow: visible !important;
          background: white !important;
        }
        #quote-client-preview * {
          display: revert !important;
        }
        #quote-client-preview-header {
          display: none !important;
        }
      }
    `}</style>
    <div className="fixed inset-0 lg:left-16 bg-gray-50 flex flex-col overflow-hidden">
      {/* Full Header */}
      <header className="flex-shrink-0 z-40 print:hidden">
        {header}
      </header>

      {/* Main Layout - Zero gaps */}
      <main className="flex-1 min-h-0 flex">
        {/* Left: Discovery Panel */}
        <aside className="hidden lg:flex flex-shrink-0 bg-white border-r border-gray-100 z-30 print:hidden">
          <div className="relative flex overflow-hidden" style={{ width: panelWidth }}>
            {/* Scrollable content - Premium thin scrollbar */}
            <div
              style={{ width: panelWidth }}
              className="h-full overflow-y-auto overflow-x-hidden bg-white scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent pr-2"
            >
              {discovery}
            </div>

            {/* Premium Resize Handle - Offset left to avoid scrollbar */}
            <div
              onMouseDown={handleResizeStart}
              onMouseEnter={() => setIsHoveringHandle(true)}
              onMouseLeave={() => !isResizing && setIsHoveringHandle(false)}
              className="absolute right-3 top-0 bottom-0 w-3 cursor-col-resize z-40 flex items-center justify-center group"
            >
              {/* Visible handle bar */}
              <motion.div
                initial={false}
                animate={{
                  width: isResizing ? 4 : isHoveringHandle ? 3 : 2,
                  backgroundColor: isResizing ? '#6366f1' : isHoveringHandle ? '#a5b4fc' : '#e5e7eb',
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="h-full rounded-full"
              />

              {/* Grip icon indicator */}
              <AnimatePresence>
                {(isHoveringHandle || isResizing) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-lg shadow-lg border ${
                      isResizing
                        ? 'bg-indigo-500 border-indigo-400'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <GripVertical
                      size={14}
                      className={isResizing ? 'text-white' : 'text-gray-400'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Center: Itinerary Canvas - ZERO PADDING for full-width banner */}
        <section
          id="quote-print-area"
          className="flex-1 flex flex-col min-h-0 min-w-0 overflow-x-hidden bg-gradient-to-b from-gray-50/80 to-white"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {itinerary}
          </div>
        </section>

        {/* Right: Pricing - Full height */}
        <aside className="hidden lg:flex flex-shrink-0 w-64 flex-col bg-white border-l border-gray-100 overflow-hidden print:hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
            {pricing}
          </div>
        </aside>
      </main>

      {/* Minimal Footer */}
      <footer className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 print:hidden">
        {footer}
      </footer>

      {/* Resize overlay to prevent selection during drag */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none" />
      )}

      {overlays}

      {/* Velocity UX Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onAction={handleCommandAction}
      />
      <ShortcutsOverlay visible={showShortcutHint} variant="compact" />
      <SaveToast visible={showSaveToast} status="saved" />

      {/* Accessibility announcement */}
      <div id="shortcut-announcement" className="sr-only" aria-live="polite" />
    </div>
    </>
  );
}
