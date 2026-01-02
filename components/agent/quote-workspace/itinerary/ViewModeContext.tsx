"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Extended view modes: agent (operational), client (preview), journey (story-driven)
type ViewMode = "agent" | "client" | "journey";

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isAgentView: boolean;
  isClientView: boolean;
  isJourneyView: boolean;
  // Client/Journey are both "client-facing" modes
  isClientFacing: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("agent");

  const toggleViewMode = () => {
    // Cycle: agent → client → journey → agent
    setViewMode((prev) =>
      prev === "agent" ? "client" : prev === "client" ? "journey" : "agent"
    );
  };

  const value: ViewModeContextType = {
    viewMode,
    setViewMode,
    toggleViewMode,
    isAgentView: viewMode === "agent",
    isClientView: viewMode === "client",
    isJourneyView: viewMode === "journey",
    isClientFacing: viewMode === "client" || viewMode === "journey",
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}

// View Mode Toggle Component - 3 modes
export function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();

  const modes = [
    { key: "agent", label: "Agent", icon: "⚙️" },
    { key: "client", label: "Client", icon: "👁️" },
    { key: "journey", label: "Journey", icon: "✨" },
  ] as const;

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 border border-gray-200">
      {modes.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => setViewMode(key)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            viewMode === key
              ? key === "journey"
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm"
                : "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>{icon}</span>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Compact toggle for tight spaces
export function ViewModeToggleCompact() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 text-[10px]">
      {["agent", "client", "journey"].map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode as any)}
          className={`px-2 py-1 rounded-md transition-all capitalize ${
            viewMode === mode
              ? mode === "journey"
                ? "bg-violet-500 text-white"
                : "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

export default ViewModeContext;
