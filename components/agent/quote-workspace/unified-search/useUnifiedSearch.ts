"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { ProductType } from "../types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED MULTI-SEARCH HOOK
// Single search action → parallel product queries → progressive results
// ═══════════════════════════════════════════════════════════════════════════════

export type SearchScope = {
  flights: boolean;
  hotels: boolean;
  cars: boolean;
  activities: boolean;
  transfers: boolean;
};

export type SearchStatus = "idle" | "loading" | "success" | "error";

export interface ProductSearchState {
  status: SearchStatus;
  results: any[] | null;
  error: string | null;
  count: number;
  timestamp: number | null;
}

export interface UnifiedSearchState {
  // Shared trip context
  context: {
    origin: string | null;
    originCode: string | null;
    destination: string | null;
    destinationCode: string | null;
    startDate: string | null;
    endDate: string | null;
    travelers: { adults: number; children: number; infants: number; total: number };
    cabinClass: string;
  };
  // Search scope (which products to search)
  scope: SearchScope;
  // Per-product search states
  products: Record<keyof SearchScope, ProductSearchState>;
  // Global state
  isSearching: boolean;
  lastSearchTime: number | null;
  sessionId: string;
}

const initialProductState: ProductSearchState = {
  status: "idle",
  results: null,
  error: null,
  count: 0,
  timestamp: null,
};

const initialState: UnifiedSearchState = {
  context: {
    origin: null,
    originCode: null,
    destination: null,
    destinationCode: null,
    startDate: null,
    endDate: null,
    travelers: { adults: 1, children: 0, infants: 0, total: 1 },
    cabinClass: "economy",
  },
  scope: {
    flights: true,
    hotels: false,
    cars: false,
    activities: false,
    transfers: false,
  },
  products: {
    flights: { ...initialProductState },
    hotels: { ...initialProductState },
    cars: { ...initialProductState },
    activities: { ...initialProductState },
    transfers: { ...initialProductState },
  },
  isSearching: false,
  lastSearchTime: null,
  sessionId: "",
};

// API endpoints for each product type
const SEARCH_ENDPOINTS: Record<keyof SearchScope, string> = {
  flights: "/api/flights/search",
  hotels: "/api/hotels/search",
  cars: "/api/cars",
  activities: "/api/activities/search",
  transfers: "/api/transfers/search",
};

export function useUnifiedSearch() {
  const [state, setState] = useState<UnifiedSearchState>(() => ({
    ...initialState,
    sessionId: `session-${Date.now()}`,
  }));

  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const { setActiveTab } = useQuoteWorkspace();

  // Ref to always get latest state in callbacks (avoids stale closure issues)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const updateContext = useCallback((updates: Partial<UnifiedSearchState["context"]>) => {
    setState((prev) => ({
      ...prev,
      context: { ...prev.context, ...updates },
    }));
  }, []);

  const syncFromFlightForm = useCallback((params: {
    origin?: string;
    originCode?: string;
    destination?: string;
    destinationCode?: string;
    departDate?: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: string;
  }) => {
    setState((prev) => ({
      ...prev,
      context: {
        origin: params.origin || prev.context.origin,
        originCode: params.originCode || prev.context.originCode,
        destination: params.destination || prev.context.destination,
        destinationCode: params.destinationCode || prev.context.destinationCode,
        startDate: params.departDate || prev.context.startDate,
        endDate: params.returnDate || prev.context.endDate,
        travelers: {
          adults: params.adults ?? prev.context.travelers.adults,
          children: params.children ?? prev.context.travelers.children,
          infants: params.infants ?? prev.context.travelers.infants,
          total: (params.adults ?? prev.context.travelers.adults) +
                 (params.children ?? prev.context.travelers.children) +
                 (params.infants ?? prev.context.travelers.infants),
        },
        cabinClass: params.cabinClass || prev.context.cabinClass,
      },
    }));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCOPE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const toggleScope = useCallback((product: keyof SearchScope) => {
    setState((prev) => ({
      ...prev,
      scope: { ...prev.scope, [product]: !prev.scope[product] },
    }));
  }, []);

  const setScope = useCallback((scope: Partial<SearchScope>) => {
    setState((prev) => ({
      ...prev,
      scope: { ...prev.scope, ...scope },
    }));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // PARALLEL SEARCH EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  const executeSearch = useCallback(async (overrideContext?: Partial<UnifiedSearchState["context"]>) => {
    // Get current state, with optional context override for sync calls
    const currentState = stateRef.current;
    const context = overrideContext ? { ...currentState.context, ...overrideContext } : currentState.context;
    const scope = currentState.scope;

    // Validate minimum context
    if (!context.destination && !context.destinationCode) {
      console.warn("Unified search: No destination specified");
      return;
    }

    // Cancel any pending requests
    abortControllers.current.forEach((controller) => controller.abort());
    abortControllers.current.clear();

    // Determine which products to search
    const productsToSearch = Object.entries(scope)
      .filter(([, enabled]) => enabled)
      .map(([product]) => product as keyof SearchScope);

    if (productsToSearch.length === 0) return;

    // Set loading state
    setState((prev) => ({
      ...prev,
      isSearching: true,
      products: productsToSearch.reduce(
        (acc, product) => ({
          ...acc,
          [product]: { ...prev.products[product], status: "loading", error: null },
        }),
        prev.products
      ),
    }));

    // Build search params per product
    const buildParams = (product: keyof SearchScope) => {
      const base = {
        checkIn: context.startDate,
        checkOut: context.endDate,
        adults: context.travelers.adults,
        children: context.travelers.children,
      };

      switch (product) {
        case "flights":
          return {
            origin: context.originCode || context.origin,
            destination: context.destinationCode || context.destination,
            departureDate: context.startDate,
            returnDate: context.endDate,
            adults: context.travelers.adults,
            children: context.travelers.children,
            infants: context.travelers.infants,
            travelClass: context.cabinClass,
          };
        case "hotels":
          return {
            ...base,
            query: context.destinationCode || context.destination,
            rooms: Math.ceil(context.travelers.total / 2),
            guests: context.travelers.total,
          };
        case "cars":
          return {
            pickupLocation: context.destinationCode || context.destination,
            dropoffLocation: context.destinationCode || context.destination,
            pickupDate: context.startDate,
            dropoffDate: context.endDate,
          };
        case "activities":
          return {
            query: context.destinationCode || context.destination,
            date: context.startDate,
            participants: context.travelers.total,
          };
        case "transfers":
          return {
            pickup: context.originCode || context.origin,
            dropoff: context.destinationCode || context.destination,
            date: context.startDate,
            passengers: context.travelers.total,
          };
        default:
          return base;
      }
    };

    // Execute searches in parallel (non-blocking)
    const searchPromises = productsToSearch.map(async (product) => {
      const controller = new AbortController();
      abortControllers.current.set(product, controller);

      try {
        const params = buildParams(product);
        const queryString = new URLSearchParams(
          Object.entries(params).reduce((acc, [k, v]) => {
            if (v !== null && v !== undefined) acc[k] = String(v);
            return acc;
          }, {} as Record<string, string>)
        ).toString();

        const response = await fetch(`${SEARCH_ENDPOINTS[product]}?${queryString}`, {
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`${product} search failed`);

        const data = await response.json();
        const results = data.data || data.results || data.offers || [];

        // Update state progressively (stream-like)
        setState((prev) => ({
          ...prev,
          products: {
            ...prev.products,
            [product]: {
              status: "success",
              results,
              error: null,
              count: results.length,
              timestamp: Date.now(),
            },
          },
        }));

        return { product, success: true, count: results.length };
      } catch (error: any) {
        if (error.name === "AbortError") return { product, success: false, aborted: true };

        setState((prev) => ({
          ...prev,
          products: {
            ...prev.products,
            [product]: {
              status: "error",
              results: null,
              error: "Results unavailable — you can retry or add manually",
              count: 0,
              timestamp: Date.now(),
            },
          },
        }));

        return { product, success: false, error: error.message };
      }
    });

    // Wait for all (but don't block UI - each updates progressively)
    await Promise.allSettled(searchPromises);

    // Mark search complete
    setState((prev) => ({
      ...prev,
      isSearching: false,
      lastSearchTime: Date.now(),
    }));
  }, []); // No dependencies - always reads latest from stateRef

  // ═══════════════════════════════════════════════════════════════════════════
  // RETRY SINGLE PRODUCT
  // ═══════════════════════════════════════════════════════════════════════════

  const retryProduct = useCallback(async (product: keyof SearchScope) => {
    // Save previous scope from ref
    const prevScope = stateRef.current.scope;

    // Set scope to only this product
    setState((prev) => ({
      ...prev,
      scope: { flights: false, hotels: false, cars: false, activities: false, transfers: false, [product]: true },
    }));

    // Wait for state to update before executing search
    await new Promise(resolve => setTimeout(resolve, 0));
    await executeSearch();

    // Restore previous scope
    setState((prev) => ({ ...prev, scope: prevScope }));
  }, [executeSearch]);

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const goToProduct = useCallback((product: keyof SearchScope) => {
    const tabMap: Record<keyof SearchScope, ProductType> = {
      flights: "flight",
      hotels: "hotel",
      cars: "car",
      activities: "activity",
      transfers: "transfer",
    };
    setActiveTab(tabMap[product]);
  }, [setActiveTab]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  const computed = useMemo(() => {
    const enabledProducts = Object.entries(state.scope).filter(([, v]) => v).length;
    const loadingProducts = Object.values(state.products).filter((p) => p.status === "loading").length;
    const readyProducts = Object.values(state.products).filter((p) => p.status === "success").length;
    const totalResults = Object.values(state.products).reduce((sum, p) => sum + p.count, 0);

    return {
      enabledProducts,
      loadingProducts,
      readyProducts,
      totalResults,
      isReady: state.context.destination !== null && state.context.startDate !== null,
      hasResults: totalResults > 0,
    };
  }, [state]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR/RESET
  // ═══════════════════════════════════════════════════════════════════════════

  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      products: {
        flights: { ...initialProductState },
        hotels: { ...initialProductState },
        cars: { ...initialProductState },
        activities: { ...initialProductState },
        transfers: { ...initialProductState },
      },
    }));
  }, []);

  const reset = useCallback(() => {
    abortControllers.current.forEach((c) => c.abort());
    abortControllers.current.clear();
    setState({ ...initialState, sessionId: `session-${Date.now()}` });
  }, []);

  return {
    // State
    state,
    context: state.context,
    scope: state.scope,
    products: state.products,
    isSearching: state.isSearching,
    computed,

    // Context actions
    updateContext,
    syncFromFlightForm,

    // Scope actions
    toggleScope,
    setScope,

    // Search actions
    executeSearch,
    retryProduct,
    clearResults,
    reset,

    // Navigation
    goToProduct,
  };
}

export type UnifiedSearchReturn = ReturnType<typeof useUnifiedSearch>;
