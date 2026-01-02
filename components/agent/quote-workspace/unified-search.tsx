"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, AlertCircle } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SEARCH CONTEXT - Shared search state across all Discovery tabs
// ═══════════════════════════════════════════════════════════════════════════════

export type SearchProductKey = "flights" | "hotels" | "cars" | "activities" | "transfers";
export type SearchStatusValue = "idle" | "loading" | "success" | "error";

export interface UnifiedSearchState {
  status: Record<SearchProductKey, SearchStatusValue>;
  resultCounts: Record<SearchProductKey, number>;
  hasNewResults: Record<SearchProductKey, boolean>;
  results: Record<SearchProductKey, any[] | null>;
}

interface UnifiedSearchContextValue extends UnifiedSearchState {
  setProductStatus: (product: SearchProductKey, status: SearchStatusValue) => void;
  setProductResults: (product: SearchProductKey, count: number, data?: any[]) => void;
  markResultsSeen: (product: SearchProductKey) => void;
  getProductResults: (product: SearchProductKey) => any[] | null;
  resetAll: () => void;
}

const defaultState: UnifiedSearchState = {
  status: {
    flights: "idle",
    hotels: "idle",
    cars: "idle",
    activities: "idle",
    transfers: "idle",
  },
  resultCounts: {
    flights: 0,
    hotels: 0,
    cars: 0,
    activities: 0,
    transfers: 0,
  },
  hasNewResults: {
    flights: false,
    hotels: false,
    cars: false,
    activities: false,
    transfers: false,
  },
  results: {
    flights: null,
    hotels: null,
    cars: null,
    activities: null,
    transfers: null,
  },
};

const UnifiedSearchContext = createContext<UnifiedSearchContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

export function UnifiedSearchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UnifiedSearchState>(defaultState);

  const setProductStatus = useCallback((product: SearchProductKey, status: SearchStatusValue) => {
    setState((prev) => ({
      ...prev,
      status: { ...prev.status, [product]: status },
    }));
  }, []);

  const setProductResults = useCallback((product: SearchProductKey, count: number, data?: any[]) => {
    setState((prev) => ({
      ...prev,
      resultCounts: { ...prev.resultCounts, [product]: count },
      hasNewResults: { ...prev.hasNewResults, [product]: count > 0 },
      status: { ...prev.status, [product]: count > 0 ? "success" : "error" },
      results: { ...prev.results, [product]: data || null },
    }));
  }, []);

  const getProductResults = useCallback((product: SearchProductKey) => {
    return state.results[product];
  }, [state.results]);

  const markResultsSeen = useCallback((product: SearchProductKey) => {
    setState((prev) => ({
      ...prev,
      hasNewResults: { ...prev.hasNewResults, [product]: false },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <UnifiedSearchContext.Provider
      value={{
        ...state,
        setProductStatus,
        setProductResults,
        markResultsSeen,
        getProductResults,
        resetAll,
      }}
    >
      {children}
    </UnifiedSearchContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useUnifiedSearchContext() {
  const context = useContext(UnifiedSearchContext);
  if (!context) {
    throw new Error("useUnifiedSearchContext must be used within UnifiedSearchProvider");
  }
  return context;
}

// Safe version that doesn't throw - for components that may be outside provider
export function useUnifiedSearchSafe(): UnifiedSearchContextValue | null {
  return useContext(UnifiedSearchContext);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB RESULT INDICATOR COMPONENT
// Shows loading/success/count badge on product tabs
// ═══════════════════════════════════════════════════════════════════════════════

interface TabResultIndicatorProps {
  product: SearchProductKey;
  className?: string;
}

export function TabResultIndicator({ product, className = "" }: TabResultIndicatorProps) {
  const context = useUnifiedSearchSafe();

  // If no context (outside provider), render nothing
  if (!context) return null;

  const { status, resultCounts, hasNewResults } = context;
  const productStatus = status[product];
  const count = resultCounts[product];
  const isNew = hasNewResults[product];

  // Don't show anything for idle or flights (flights tab manages its own results)
  if (productStatus === "idle" || product === "flights") return null;

  return (
    <AnimatePresence mode="wait">
      {productStatus === "loading" && (
        <motion.div
          key="loading"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm ${className}`}
        >
          <Loader2 className="w-2.5 h-2.5 text-indigo-500 animate-spin" />
        </motion.div>
      )}

      {productStatus === "success" && count > 0 && (
        <motion.div
          key="success"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold shadow-lg ${
            isNew
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse"
              : "bg-white border border-gray-200 text-gray-700"
          } ${className}`}
        >
          {count > 99 ? "99+" : count}
        </motion.div>
      )}

      {productStatus === "error" && (
        <motion.div
          key="error"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shadow-sm ${className}`}
        >
          <AlertCircle className="w-2.5 h-2.5 text-white" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT RESULT BADGE - Inline badge showing "12 found" or "Loading..."
// ═══════════════════════════════════════════════════════════════════════════════

interface ProductResultBadgeProps {
  product: SearchProductKey;
  className?: string;
}

export function ProductResultBadge({ product, className = "" }: ProductResultBadgeProps) {
  const context = useUnifiedSearchSafe();
  if (!context) return null;

  const { status, resultCounts } = context;
  const productStatus = status[product];
  const count = resultCounts[product];

  if (productStatus === "idle") return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${className}`}>
      {productStatus === "loading" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
          <span className="text-gray-400">Searching...</span>
        </>
      )}
      {productStatus === "success" && count > 0 && (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-green-600">{count} found</span>
        </>
      )}
      {productStatus === "success" && count === 0 && (
        <span className="text-gray-400">No results</span>
      )}
      {productStatus === "error" && (
        <>
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span className="text-red-500">Error</span>
        </>
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default UnifiedSearchProvider;
