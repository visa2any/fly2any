"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Search,
  Plane,
  Loader2,
  Plus,
  Calendar,
  Users,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Minus,
  Clock,
  Sparkles,
  Edit3,
  ArrowRight,
} from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import MultiAirportSelector from "@/components/common/MultiAirportSelector";
import PremiumDatePicker from "@/components/common/PremiumDatePicker";
import type { FlightItem, FlightSearchParams } from "../types/quote-workspace.types";

// Cabin class options
const CABIN_CLASSES = [
  { value: "economy", label: "Economy", icon: "Y" },
  { value: "premium_economy", label: "Premium Economy", icon: "W" },
  { value: "business", label: "Business", icon: "C" },
  { value: "first", label: "First Class", icon: "F" },
] as const;

export default function FlightSearchPanel() {
  const { state, addItem, setSearchResults } = useQuoteWorkspace();
  const { searchLoading, searchResults } = state.ui;

  // Search form state with all advanced features
  const [params, setParams] = useState<FlightSearchParams>({
    origin: [],
    destination: state.destination ? [state.destination.split(",")[0]] : [],
    departureDate: state.startDate || "",
    departureDates: [],
    useMultiDate: false,
    returnDate: state.endDate || "",
    departureFlex: 0,
    returnFlex: 0,
    tripDuration: 7,
    adults: state.travelers.adults,
    children: state.travelers.children,
    infants: state.travelers.infants,
    cabinClass: "economy",
    tripType: "roundtrip",
    directFlights: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-collapse form when search results arrive
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !searchLoading) {
      // Delay collapse to allow user to see results loaded
      const timer = setTimeout(() => setFormCollapsed(true), 500);
      return () => clearTimeout(timer);
    }
  }, [searchResults, searchLoading]);

  // Expand form when clicking edit or when there's an error
  useEffect(() => {
    if (error) setFormCollapsed(false);
  }, [error]);

  // Get minimum date (today)
  const getMinDate = () => new Date().toISOString().split("T")[0];

  // Total passengers
  const totalPassengers = params.adults + params.children + params.infants;

  // Validate form
  const validateForm = (): boolean => {
    if (params.origin.length === 0) {
      setError("Please select at least one origin airport");
      return false;
    }
    if (params.destination.length === 0) {
      setError("Please select at least one destination airport");
      return false;
    }
    if (params.useMultiDate) {
      if (params.departureDates.length === 0) {
        setError("Please select at least one departure date");
        return false;
      }
    } else {
      if (!params.departureDate) {
        setError("Please select a departure date");
        return false;
      }
    }
    if (params.tripType === "roundtrip" && !params.returnDate && !params.useMultiDate) {
      setError("Please select a return date for round trip");
      return false;
    }
    return true;
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSearchResults(true, null);

    try {
      const queryParams = new URLSearchParams({
        origin: params.origin.join(","),
        destination: params.destination.join(","),
        departureDate: params.useMultiDate
          ? params.departureDates.map((d) => format(d, "yyyy-MM-dd")).join(",")
          : params.departureDate,
        useMultiDate: params.useMultiDate.toString(),
        adults: params.adults.toString(),
        children: params.children.toString(),
        infants: params.infants.toString(),
        travelClass: params.cabinClass,
        tripType: params.tripType,
        nonStop: params.directFlights.toString(),
        departureFlex: params.departureFlex.toString(),
      });

      if (params.tripType === "roundtrip" && params.returnDate) {
        queryParams.append("returnDate", params.returnDate);
        queryParams.append("tripDuration", params.tripDuration.toString());
      }

      const res = await fetch(`/api/flights/search?${queryParams}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }

      setSearchResults(false, data.flights || []);
    } catch (err: any) {
      setError(err.message || "Failed to search flights");
      setSearchResults(false, null);
    }
  };

  // Add flight to quote
  const handleAddFlight = (flight: any) => {
    const segmentCount = flight.segments?.length || flight.itineraries?.[0]?.segments?.length || 1;
    const safeStops = typeof flight.stops === "number" ? flight.stops : Math.max(0, segmentCount - 1);

    const flightItem: Omit<FlightItem, "id" | "sortOrder" | "createdAt"> = {
      type: "flight",
      price: Number(flight.price?.total || flight.price?.amount || flight.totalPrice || 0),
      currency: "USD",
      date: params.useMultiDate
        ? format(params.departureDates[0], "yyyy-MM-dd")
        : params.departureDate,
      airline: flight.validatingAirlineCodes?.[0] || flight.airline || flight.carrierCode ||
        flight.segments?.[0]?.carrierCode || flight.segments?.[0]?.airline || "Airline",
      flightNumber: flight.flightNumber || flight.segments?.[0]?.flightNumber ||
        flight.segments?.[0]?.number || "",
      origin: params.origin[0],
      originCity: flight.segments?.[0]?.departureCity ||
        flight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || params.origin[0],
      destination: params.destination[0],
      destinationCity: flight.segments?.[segmentCount - 1]?.arrivalCity ||
        flight.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode || params.destination[0],
      departureTime: flight.departureTime || flight.segments?.[0]?.departure?.at?.slice(11, 16) ||
        flight.itineraries?.[0]?.segments?.[0]?.departure?.at?.slice(11, 16) || "",
      arrivalTime: flight.arrivalTime || flight.segments?.[segmentCount - 1]?.arrival?.at?.slice(11, 16) ||
        flight.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.at?.slice(11, 16) || "",
      duration: flight.duration || flight.totalDuration ||
        flight.itineraries?.[0]?.duration?.replace("PT", "").toLowerCase() || "",
      stops: safeStops,
      cabinClass: params.cabinClass,
      passengers: totalPassengers,
      baggage: flight.baggage,
      apiSource: flight.source || "amadeus",
      apiOfferId: flight.id,
    };

    addItem(flightItem);
  };

  // Update passenger count
  const updatePassenger = (type: "adults" | "children" | "infants", delta: number) => {
    const newValue = params[type] + delta;
    if (type === "adults" && newValue < 1) return;
    if (newValue < 0) return;
    if (newValue > 9) return;
    if (type === "infants" && newValue > params.adults) return;
    setParams({ ...params, [type]: newValue });
  };

  // Add multi-date
  const addMultiDate = (dateStr: string) => {
    if (!dateStr) return;
    const newDate = new Date(dateStr + "T00:00:00");
    const exists = params.departureDates.some(
      (d) => format(d, "yyyy-MM-dd") === format(newDate, "yyyy-MM-dd")
    );
    if (!exists && params.departureDates.length < 7) {
      setParams({
        ...params,
        departureDates: [...params.departureDates, newDate].sort((a, b) => a.getTime() - b.getTime()),
      });
    }
  };

  // Remove multi-date
  const removeMultiDate = (index: number) => {
    setParams({
      ...params,
      departureDates: params.departureDates.filter((_, i) => i !== index),
    });
  };

  // Generate search summary for collapsed view
  const searchSummary = useMemo(() => {
    const from = params.origin.length > 0 ? params.origin.join(", ") : "Origin";
    const to = params.destination.length > 0 ? params.destination.join(", ") : "Destination";
    const date = params.useMultiDate
      ? params.departureDates.length > 0
        ? `${params.departureDates.length} dates`
        : "Dates"
      : params.departureDate
        ? format(new Date(params.departureDate + "T00:00:00"), "MMM d")
        : "Date";
    return { from, to, date };
  }, [params]);

  return (
    <div className="p-4 space-y-4">
      {/* Collapsed Search Summary */}
      <AnimatePresence mode="wait">
        {formCollapsed && searchResults && searchResults.length > 0 ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100"
          >
            <div className="flex items-center justify-between gap-2">
              {/* Route Summary */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Plane className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <span className="truncate">{searchSummary.from}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{searchSummary.to}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{searchSummary.date}</span>
                    <span>•</span>
                    <span>{totalPassengers} pax</span>
                    <span>•</span>
                    <span className="capitalize">{params.cabinClass.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
              {/* Edit Button */}
              <button
                type="button"
                onClick={() => setFormCollapsed(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors flex-shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
            {/* Results count */}
            <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600">
                {searchResults.length} flights found
              </span>
              <button
                type="button"
                onClick={() => setFormCollapsed(false)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <ChevronDown className="w-3 h-3" />
                Show form
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Collapse header if results exist */}
            {searchResults && searchResults.length > 0 && (
              <button
                type="button"
                onClick={() => setFormCollapsed(true)}
                className="w-full flex items-center justify-between px-3 py-2 mb-3 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="font-medium">Search Form</span>
                </span>
                <ChevronUp className="w-4 h-4" />
              </button>
            )}

            {/* Search Form - Compact Layout */}
            <form ref={formRef} onSubmit={handleSearch} className="space-y-3">
              {/* ROW 1: From + To with One-way toggle */}
              <div className="grid grid-cols-2 gap-2">
                <MultiAirportSelector
                  label="From"
                  placeholder="Origin"
                  value={params.origin}
                  onChange={(codes) => setParams({ ...params, origin: codes })}
                  maxDisplay={1}
                />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-600">To</span>
                    <button
                      type="button"
                      onClick={() => setParams({ ...params, tripType: params.tripType === "oneway" ? "roundtrip" : "oneway", returnDate: "" })}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                        params.tripType === "oneway"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      One-way
                    </button>
                  </div>
                  <MultiAirportSelector
                    placeholder="Destination"
                    value={params.destination}
                    onChange={(codes) => setParams({ ...params, destination: codes })}
                    maxDisplay={1}
                  />
                </div>
              </div>

              {/* ROW 2: Dates with independent flex controls */}
              <div className="grid grid-cols-2 gap-2">
                {/* Departure */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-600">Departure</span>
                    <button
                      type="button"
                      onClick={() => setParams({ ...params, departureFlex: params.departureFlex === 0 ? 3 : 0 })}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        params.departureFlex > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {params.departureFlex > 0 ? `±${params.departureFlex}d` : "Flex"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={params.departureDate}
                      min={getMinDate()}
                      onChange={(e) => setParams({ ...params, departureDate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Return */}
                <div className={params.tripType === "oneway" ? "opacity-40 pointer-events-none" : ""}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-600">Return</span>
                    <button
                      type="button"
                      onClick={() => setParams({ ...params, returnFlex: params.returnFlex === 0 ? 3 : 0 })}
                      disabled={params.tripType === "oneway"}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        params.returnFlex > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {params.returnFlex > 0 ? `±${params.returnFlex}d` : "Flex"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={params.returnDate || ""}
                      min={params.departureDate || getMinDate()}
                      onChange={(e) => setParams({ ...params, returnDate: e.target.value })}
                      disabled={params.tripType === "oneway"}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* ROW 3: Travelers + Class + Direct */}
              <div className="flex items-center gap-2">
                {/* Travelers */}
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => { setShowPassengerDropdown(!showPassengerDropdown); setShowClassDropdown(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors bg-white"
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{totalPassengers}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showPassengerDropdown ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showPassengerDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowPassengerDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 mt-1 left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-3 space-y-2"
                        >
                          {[
                            { key: "adults", label: "Adults", sub: "12+" },
                            { key: "children", label: "Children", sub: "2-12" },
                            { key: "infants", label: "Infants", sub: "<2" },
                          ].map(({ key, label, sub }) => (
                            <div key={key} className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium">{label}</span>
                                <span className="text-xs text-gray-400 ml-1">{sub}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => updatePassenger(key as any, -1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-blue-500 disabled:opacity-30" disabled={key === "adults" ? params.adults <= 1 : (params as any)[key] <= 0}>
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center font-bold text-sm">{(params as any)[key]}</span>
                                <button type="button" onClick={() => updatePassenger(key as any, 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-blue-500 disabled:opacity-30" disabled={(params as any)[key] >= 9 || (key === "infants" && params.infants >= params.adults)}>
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={() => setShowPassengerDropdown(false)} className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold mt-2">Done</button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Class */}
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => { setShowClassDropdown(!showClassDropdown); setShowPassengerDropdown(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors bg-white"
                  >
                    <span className="truncate text-xs">{CABIN_CLASSES.find((c) => c.value === params.cabinClass)?.label || "Economy"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showClassDropdown ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showClassDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowClassDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                        >
                          {CABIN_CLASSES.map((cabin) => (
                            <button
                              key={cabin.value}
                              type="button"
                              onClick={() => { setParams({ ...params, cabinClass: cabin.value }); setShowClassDropdown(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${params.cabinClass === cabin.value ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                            >
                              <span className="font-medium">{cabin.label}</span>
                              {params.cabinClass === cabin.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Direct Toggle */}
                <button
                  type="button"
                  onClick={() => setParams({ ...params, directFlights: !params.directFlights })}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${
                    params.directFlights
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Direct
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Search Button */}
              <motion.button
                type="submit"
                disabled={searchLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all text-sm"
              >
                {searchLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Searching...</> : <><Search className="w-4 h-4" />Search Flights</>}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {searchLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </motion.div>
        )}

        {!searchLoading && searchResults && searchResults.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-gray-500">{searchResults.length} flights found</p>
            {searchResults.slice(0, 10).map((flight: any, idx: number) => (
              <FlightResultCard key={flight.id || idx} flight={flight} onAdd={() => handleAddFlight(flight)} />
            ))}
          </motion.div>
        )}

        {!searchLoading && searchResults && searchResults.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No flights found</p>
            <p className="text-sm text-gray-400">Try different dates or airports</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Flight Result Card - Level 6 Ultra-Premium
function FlightResultCard({ flight, onAdd }: { flight: any; onAdd: () => void }) {
  // Safe data extraction with fallbacks
  const price = Number(flight.price?.total || flight.price?.amount || flight.totalPrice || 0);
  const airline = flight.validatingAirlineCodes?.[0] || flight.airline || flight.carrierCode ||
    flight.segments?.[0]?.carrierCode || flight.segments?.[0]?.airline || flight.marketingCarrier || "Airline";
  const flightNum = flight.flightNumber || flight.segments?.[0]?.flightNumber ||
    flight.segments?.[0]?.number || "";
  const duration = flight.duration || flight.totalDuration ||
    flight.itineraries?.[0]?.duration?.replace("PT", "").toLowerCase() || "";
  const segmentCount = flight.segments?.length || flight.itineraries?.[0]?.segments?.length || 1;
  const stops = typeof flight.stops === "number" ? flight.stops : Math.max(0, segmentCount - 1);

  // Times
  const depTime = flight.departureTime || flight.segments?.[0]?.departure?.at?.slice(11, 16) ||
    flight.itineraries?.[0]?.segments?.[0]?.departure?.at?.slice(11, 16) || "";
  const arrTime = flight.arrivalTime ||
    flight.segments?.[segmentCount - 1]?.arrival?.at?.slice(11, 16) ||
    flight.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.at?.slice(11, 16) || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all group"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Airline & Flight Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {airline.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-semibold text-gray-900">{airline}</span>
              {flightNum && <span className="text-xs text-gray-400 ml-1">{flightNum}</span>}
            </div>
          </div>
          {/* Times & Route */}
          <div className="flex items-center gap-2 text-sm">
            {depTime && arrTime ? (
              <>
                <span className="font-medium text-gray-800">{depTime}</span>
                <div className="flex-1 flex items-center gap-1 px-2">
                  <div className="h-px flex-1 bg-gray-300" />
                  <span className="text-xs text-gray-500 px-1">
                    {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
                  </span>
                  <div className="h-px flex-1 bg-gray-300" />
                </div>
                <span className="font-medium text-gray-800">{arrTime}</span>
              </>
            ) : (
              <span className="text-gray-500">
                {duration || `${stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}`}
              </span>
            )}
          </div>
          {duration && <p className="text-xs text-gray-400 mt-0.5">{duration}</p>}
        </div>

        {/* Price & Add */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              ${price > 0 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A"}
            </p>
            <p className="text-xs text-gray-400">/person</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
