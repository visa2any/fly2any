"use client";

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED TRIP CONTEXT - Single source of truth for search orchestration
// ═══════════════════════════════════════════════════════════════════════════════

export interface TripContextState {
  // Core trip data (shared across all tabs)
  origin: string | null;
  originCode: string | null;
  destination: string | null;
  destinationCode: string | null;
  startDate: string | null;
  endDate: string | null;
  travelers: {
    adults: number;
    children: number;
    infants: number;
    total: number;
  };

  // Search toggles - which products to search
  searchProducts: {
    flights: boolean;
    hotels: boolean;
    cars: boolean;
    activities: boolean;
    transfers: boolean;
  };

  // Search state tracking
  lastUpdated: number | null;
  isDirty: boolean; // Has context changed since last search?
}

type TripAction =
  | { type: "SET_ORIGIN"; payload: { name: string; code: string } }
  | { type: "SET_DESTINATION"; payload: { name: string; code: string } }
  | { type: "SET_DATES"; payload: { start: string; end: string } }
  | { type: "SET_TRAVELERS"; payload: TripContextState["travelers"] }
  | { type: "TOGGLE_PRODUCT"; payload: keyof TripContextState["searchProducts"] }
  | { type: "SET_PRODUCTS"; payload: Partial<TripContextState["searchProducts"]> }
  | { type: "SYNC_FROM_FLIGHTS"; payload: Partial<TripContextState> }
  | { type: "MARK_CLEAN" }
  | { type: "RESET" };

const initialState: TripContextState = {
  origin: null,
  originCode: null,
  destination: null,
  destinationCode: null,
  startDate: null,
  endDate: null,
  travelers: { adults: 1, children: 0, infants: 0, total: 1 },
  searchProducts: {
    flights: true,
    hotels: true,
    cars: false,
    activities: false,
    transfers: false,
  },
  lastUpdated: null,
  isDirty: false,
};

function tripReducer(state: TripContextState, action: TripAction): TripContextState {
  const now = Date.now();

  switch (action.type) {
    case "SET_ORIGIN":
      return { ...state, origin: action.payload.name, originCode: action.payload.code, lastUpdated: now, isDirty: true };

    case "SET_DESTINATION":
      return { ...state, destination: action.payload.name, destinationCode: action.payload.code, lastUpdated: now, isDirty: true };

    case "SET_DATES":
      return { ...state, startDate: action.payload.start, endDate: action.payload.end, lastUpdated: now, isDirty: true };

    case "SET_TRAVELERS":
      return { ...state, travelers: action.payload, lastUpdated: now, isDirty: true };

    case "TOGGLE_PRODUCT":
      return {
        ...state,
        searchProducts: { ...state.searchProducts, [action.payload]: !state.searchProducts[action.payload] },
      };

    case "SET_PRODUCTS":
      return { ...state, searchProducts: { ...state.searchProducts, ...action.payload } };

    case "SYNC_FROM_FLIGHTS":
      // Bulk sync from flight search - most common entry point
      return { ...state, ...action.payload, lastUpdated: now, isDirty: true };

    case "MARK_CLEAN":
      return { ...state, isDirty: false };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT & PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

interface TripContextValue {
  state: TripContextState;

  // Actions
  setOrigin: (name: string, code: string) => void;
  setDestination: (name: string, code: string) => void;
  setDates: (start: string, end: string) => void;
  setTravelers: (travelers: TripContextState["travelers"]) => void;
  toggleProduct: (product: keyof TripContextState["searchProducts"]) => void;
  setProducts: (products: Partial<TripContextState["searchProducts"]>) => void;
  syncFromFlights: (data: Partial<TripContextState>) => void;
  markClean: () => void;
  reset: () => void;

  // Computed helpers
  isReady: boolean; // Has minimum required data for search?
  hasDestination: boolean;
  selectedProductCount: number;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  const setOrigin = useCallback((name: string, code: string) => {
    dispatch({ type: "SET_ORIGIN", payload: { name, code } });
  }, []);

  const setDestination = useCallback((name: string, code: string) => {
    dispatch({ type: "SET_DESTINATION", payload: { name, code } });
  }, []);

  const setDates = useCallback((start: string, end: string) => {
    dispatch({ type: "SET_DATES", payload: { start, end } });
  }, []);

  const setTravelers = useCallback((travelers: TripContextState["travelers"]) => {
    dispatch({ type: "SET_TRAVELERS", payload: travelers });
  }, []);

  const toggleProduct = useCallback((product: keyof TripContextState["searchProducts"]) => {
    dispatch({ type: "TOGGLE_PRODUCT", payload: product });
  }, []);

  const setProducts = useCallback((products: Partial<TripContextState["searchProducts"]>) => {
    dispatch({ type: "SET_PRODUCTS", payload: products });
  }, []);

  const syncFromFlights = useCallback((data: Partial<TripContextState>) => {
    dispatch({ type: "SYNC_FROM_FLIGHTS", payload: data });
  }, []);

  const markClean = useCallback(() => {
    dispatch({ type: "MARK_CLEAN" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Computed
  const isReady = !!(state.destination && state.startDate);
  const hasDestination = !!state.destination;
  const selectedProductCount = Object.values(state.searchProducts).filter(Boolean).length;

  return (
    <TripContext.Provider value={{
      state,
      setOrigin,
      setDestination,
      setDates,
      setTravelers,
      toggleProduct,
      setProducts,
      syncFromFlights,
      markClean,
      reset,
      isReady,
      hasDestination,
      selectedProductCount,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTripContext must be used within TripContextProvider");
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS FOR TAB-SPECIFIC USE
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook for Flights tab - primary data entry point */
export function useFlightsTripSync() {
  const { state, syncFromFlights } = useTripContext();

  const syncFlightSearch = useCallback((params: {
    origin?: string;
    originCode?: string;
    destination?: string;
    destinationCode?: string;
    departDate?: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
  }) => {
    syncFromFlights({
      origin: params.origin || null,
      originCode: params.originCode || null,
      destination: params.destination || null,
      destinationCode: params.destinationCode || null,
      startDate: params.departDate || null,
      endDate: params.returnDate || null,
      travelers: {
        adults: params.adults || 1,
        children: params.children || 0,
        infants: params.infants || 0,
        total: (params.adults || 1) + (params.children || 0) + (params.infants || 0),
      },
    });
  }, [syncFromFlights]);

  return { tripState: state, syncFlightSearch };
}

/** Hook for Hotels tab - consumes shared context */
export function useHotelsTripContext() {
  const { state } = useTripContext();
  return {
    destination: state.destination,
    destinationCode: state.destinationCode,
    checkIn: state.startDate,
    checkOut: state.endDate,
    guests: state.travelers.total,
    rooms: Math.ceil(state.travelers.total / 2), // Simple room calc
  };
}

/** Hook for Cars tab - consumes shared context */
export function useCarsTripContext() {
  const { state } = useTripContext();
  return {
    pickupLocation: state.destination,
    pickupDate: state.startDate,
    dropoffDate: state.endDate,
  };
}

/** Hook for Activities tab - consumes shared context */
export function useActivitiesTripContext() {
  const { state } = useTripContext();
  return {
    destination: state.destination,
    destinationCode: state.destinationCode,
    date: state.startDate,
    participants: state.travelers.total,
  };
}
