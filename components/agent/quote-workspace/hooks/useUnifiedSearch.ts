"use client";

import { useState, useCallback, useRef } from "react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import { useUnifiedSearchSafe, type SearchProductKey } from "../unified-search";

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED MULTI-SEARCH HOOK - Single search → All products ready
// ═══════════════════════════════════════════════════════════════════════════════

export interface SearchScope {
  flights: boolean;
  hotels: boolean;
  cars: boolean;
  activities: boolean;
  transfers: boolean;
}

export interface SearchStatus {
  flights: "idle" | "loading" | "success" | "error";
  hotels: "idle" | "loading" | "success" | "error";
  cars: "idle" | "loading" | "success" | "error";
  activities: "idle" | "loading" | "success" | "error";
  transfers: "idle" | "loading" | "success" | "error";
}

export interface SearchResults {
  flights: any[] | null;
  hotels: any[] | null;
  cars: any[] | null;
  activities: any[] | null;
  transfers: any[] | null;
}

export interface TripContext {
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass?: string;
}

const DEFAULT_SCOPE: SearchScope = {
  flights: true,
  hotels: false,
  cars: false,
  activities: false,
  transfers: false,
};

export function useUnifiedSearch() {
  const { state, setDestination, setDates, setTravelers } = useQuoteWorkspace();

  // Get shared context for tab indicators (optional - may be null if outside provider)
  const unifiedContext = useUnifiedSearchSafe();

  const [scope, setScope] = useState<SearchScope>(DEFAULT_SCOPE);
  const [status, setStatus] = useState<SearchStatus>({
    flights: "idle",
    hotels: "idle",
    cars: "idle",
    activities: "idle",
    transfers: "idle",
  });
  const [results, setResults] = useState<SearchResults>({
    flights: null,
    hotels: null,
    cars: null,
    activities: null,
    transfers: null,
  });
  const [resultCounts, setResultCounts] = useState<Record<keyof SearchScope, number>>({
    flights: 0,
    hotels: 0,
    cars: 0,
    activities: 0,
    transfers: 0,
  });

  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Toggle a product in search scope
  const toggleScope = useCallback((product: keyof SearchScope) => {
    setScope(prev => ({ ...prev, [product]: !prev[product] }));
  }, []);

  // Set entire scope at once
  const setScopeAll = useCallback((newScope: Partial<SearchScope>) => {
    setScope(prev => ({ ...prev, ...newScope }));
  }, []);

  // Get count of selected products
  const selectedCount = Object.values(scope).filter(Boolean).length;

  // Cancel any running searches for a product
  const cancelSearch = useCallback((product: keyof SearchScope) => {
    const controller = abortControllers.current.get(product);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(product);
    }
  }, []);

  // Execute unified search
  const executeUnifiedSearch = useCallback(async (tripContext: TripContext) => {
    // Sync trip context to workspace state
    if (tripContext.destination) {
      setDestination(tripContext.destination);
    }
    if (tripContext.startDate && tripContext.endDate) {
      setDates(tripContext.startDate, tripContext.endDate);
    }
    setTravelers({
      adults: tripContext.adults,
      children: tripContext.children,
      infants: tripContext.infants,
      total: tripContext.adults + tripContext.children + tripContext.infants,
    });

    // Prepare parallel searches based on scope
    const searchPromises: Promise<void>[] = [];

    // FLIGHTS
    if (scope.flights) {
      cancelSearch("flights");
      const controller = new AbortController();
      abortControllers.current.set("flights", controller);
      setStatus(prev => ({ ...prev, flights: "loading" }));

      searchPromises.push(
        searchFlights(tripContext, controller.signal)
          .then(data => {
            setResults(prev => ({ ...prev, flights: data }));
            setResultCounts(prev => ({ ...prev, flights: data?.length || 0 }));
            setStatus(prev => ({ ...prev, flights: "success" }));
          })
          .catch(err => {
            if (err.name !== "AbortError") {
              setStatus(prev => ({ ...prev, flights: "error" }));
            }
          })
      );
    }

    // HOTELS (parallel)
    if (scope.hotels && tripContext.destination) {
      cancelSearch("hotels");
      const controller = new AbortController();
      abortControllers.current.set("hotels", controller);
      setStatus(prev => ({ ...prev, hotels: "loading" }));
      unifiedContext?.setProductStatus("hotels", "loading");

      searchPromises.push(
        searchHotels(tripContext, controller.signal)
          .then(data => {
            setResults(prev => ({ ...prev, hotels: data }));
            setResultCounts(prev => ({ ...prev, hotels: data?.length || 0 }));
            setStatus(prev => ({ ...prev, hotels: "success" }));
            unifiedContext?.setProductResults("hotels", data?.length || 0);
          })
          .catch(err => {
            if (err.name !== "AbortError") {
              setStatus(prev => ({ ...prev, hotels: "error" }));
              unifiedContext?.setProductStatus("hotels", "error");
            }
          })
      );
    }

    // CARS (parallel)
    if (scope.cars && tripContext.destination) {
      cancelSearch("cars");
      const controller = new AbortController();
      abortControllers.current.set("cars", controller);
      setStatus(prev => ({ ...prev, cars: "loading" }));
      unifiedContext?.setProductStatus("cars", "loading");

      searchPromises.push(
        searchCars(tripContext, controller.signal)
          .then(data => {
            setResults(prev => ({ ...prev, cars: data }));
            setResultCounts(prev => ({ ...prev, cars: data?.length || 0 }));
            setStatus(prev => ({ ...prev, cars: "success" }));
            unifiedContext?.setProductResults("cars", data?.length || 0);
          })
          .catch(err => {
            if (err.name !== "AbortError") {
              setStatus(prev => ({ ...prev, cars: "error" }));
              unifiedContext?.setProductStatus("cars", "error");
            }
          })
      );
    }

    // ACTIVITIES (parallel)
    if (scope.activities && tripContext.destination) {
      cancelSearch("activities");
      const controller = new AbortController();
      abortControllers.current.set("activities", controller);
      setStatus(prev => ({ ...prev, activities: "loading" }));
      unifiedContext?.setProductStatus("activities", "loading");

      searchPromises.push(
        searchActivities(tripContext, controller.signal)
          .then(data => {
            setResults(prev => ({ ...prev, activities: data }));
            setResultCounts(prev => ({ ...prev, activities: data?.length || 0 }));
            setStatus(prev => ({ ...prev, activities: "success" }));
            unifiedContext?.setProductResults("activities", data?.length || 0);
          })
          .catch(err => {
            if (err.name !== "AbortError") {
              setStatus(prev => ({ ...prev, activities: "error" }));
              unifiedContext?.setProductStatus("activities", "error");
            }
          })
      );
    }

    // TRANSFERS (parallel)
    if (scope.transfers && tripContext.destination) {
      cancelSearch("transfers");
      const controller = new AbortController();
      abortControllers.current.set("transfers", controller);
      setStatus(prev => ({ ...prev, transfers: "loading" }));
      unifiedContext?.setProductStatus("transfers", "loading");

      searchPromises.push(
        searchTransfers(tripContext, controller.signal)
          .then(data => {
            setResults(prev => ({ ...prev, transfers: data }));
            setResultCounts(prev => ({ ...prev, transfers: data?.length || 0 }));
            setStatus(prev => ({ ...prev, transfers: "success" }));
            unifiedContext?.setProductResults("transfers", data?.length || 0);
          })
          .catch(err => {
            if (err.name !== "AbortError") {
              setStatus(prev => ({ ...prev, transfers: "error" }));
              unifiedContext?.setProductStatus("transfers", "error");
            }
          })
      );
    }

    // All searches run in parallel - don't await all, let them stream
    await Promise.allSettled(searchPromises);
  }, [scope, setDestination, setDates, setTravelers, cancelSearch]);

  // Clear all results
  const clearResults = useCallback(() => {
    setResults({ flights: null, hotels: null, cars: null, activities: null, transfers: null });
    setResultCounts({ flights: 0, hotels: 0, cars: 0, activities: 0, transfers: 0 });
    setStatus({ flights: "idle", hotels: "idle", cars: "idle", activities: "idle", transfers: "idle" });
  }, []);

  return {
    scope,
    toggleScope,
    setScopeAll,
    selectedCount,
    status,
    results,
    resultCounts,
    executeUnifiedSearch,
    clearResults,
    isSearching: Object.values(status).some(s => s === "loading"),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API SEARCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function searchFlights(ctx: TripContext, signal: AbortSignal): Promise<any[]> {
  const params = new URLSearchParams({
    origin: ctx.originCode || ctx.origin,
    destination: ctx.destinationCode || ctx.destination,
    departureDate: ctx.startDate,
    adults: ctx.adults.toString(),
    children: ctx.children.toString(),
    infants: ctx.infants.toString(),
    travelClass: ctx.cabinClass || "economy",
    tripType: ctx.endDate && ctx.endDate !== ctx.startDate ? "roundtrip" : "oneway",
  });
  if (ctx.endDate && ctx.endDate !== ctx.startDate) {
    params.append("returnDate", ctx.endDate);
  }

  const res = await fetch(`/api/flights/search?${params}`, { signal });
  if (!res.ok) throw new Error("Flight search failed");
  const data = await res.json();
  return data.flights || [];
}

async function searchHotels(ctx: TripContext, signal: AbortSignal): Promise<any[]> {
  const params = new URLSearchParams({
    location: ctx.destination,
    checkIn: ctx.startDate,
    checkOut: ctx.endDate || ctx.startDate,
    adults: ctx.adults.toString(),
    children: ctx.children.toString(),
    rooms: "1",
  });

  const res = await fetch(`/api/hotels/search?${params}`, { signal });
  if (!res.ok) throw new Error("Hotel search failed");
  const data = await res.json();
  return data.hotels || [];
}

async function searchCars(ctx: TripContext, signal: AbortSignal): Promise<any[]> {
  const params = new URLSearchParams({
    pickupLocation: ctx.destination,
    pickupDate: ctx.startDate,
    dropoffDate: ctx.endDate || ctx.startDate,
    pickupTime: "10:00",
    dropoffTime: "10:00",
  });

  const res = await fetch(`/api/cars/search?${params}`, { signal });
  if (!res.ok) throw new Error("Car search failed");
  const data = await res.json();
  return data.cars || [];
}

async function searchActivities(ctx: TripContext, signal: AbortSignal): Promise<any[]> {
  const params = new URLSearchParams({
    destination: ctx.destination,
    date: ctx.startDate,
    participants: (ctx.adults + ctx.children).toString(),
  });

  const res = await fetch(`/api/activities/search?${params}`, { signal });
  if (!res.ok) throw new Error("Activities search failed");
  const data = await res.json();
  return data.activities || [];
}

async function searchTransfers(ctx: TripContext, signal: AbortSignal): Promise<any[]> {
  const params = new URLSearchParams({
    destination: ctx.destination,
    date: ctx.startDate,
    passengers: (ctx.adults + ctx.children).toString(),
  });

  const res = await fetch(`/api/transfers/search?${params}`, { signal });
  if (!res.ok) throw new Error("Transfers search failed");
  const data = await res.json();
  return data.transfers || [];
}

export default useUnifiedSearch;
