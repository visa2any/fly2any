"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUnifiedSearch, type UnifiedSearchReturn } from "./useUnifiedSearch";

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SEARCH CONTEXT PROVIDER
// Single source of truth for multi-product search orchestration
// ═══════════════════════════════════════════════════════════════════════════════

const UnifiedSearchContext = createContext<UnifiedSearchReturn | null>(null);

export function UnifiedSearchProvider({ children }: { children: ReactNode }) {
  const unifiedSearch = useUnifiedSearch();

  return (
    <UnifiedSearchContext.Provider value={unifiedSearch}>
      {children}
    </UnifiedSearchContext.Provider>
  );
}

export function useUnifiedSearchContext() {
  const context = useContext(UnifiedSearchContext);
  if (!context) {
    throw new Error("useUnifiedSearchContext must be used within UnifiedSearchProvider");
  }
  return context;
}

// Optional: Safe hook that returns null if not within provider
export function useUnifiedSearchSafe() {
  return useContext(UnifiedSearchContext);
}
