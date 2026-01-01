"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
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
  Zap,
  Star,
  TrendingUp,
} from "lucide-react";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import MultiAirportSelector from "@/components/common/MultiAirportSelector";
import PremiumDatePicker from "@/components/common/PremiumDatePicker";
// import PremiumDateRangePicker from "@/components/common/PremiumDateRangePicker";
import type { FlightItem, FlightSearchParams } from "../types/quote-workspace.types";

// Cabin class options with premium styling
const CABIN_CLASSES = [
  { value: "economy", label: "Economy", icon: "Y", color: "from-gray-400 to-gray-500" },
  { value: "premium_economy", label: "Premium Economy", icon: "W", color: "from-blue-400 to-blue-500" },
  { value: "business", label: "Business", icon: "C", color: "from-purple-400 to-purple-500" },
  { value: "first", label: "First Class", icon: "F", color: "from-amber-400 to-amber-500" },
] as const;

// Premium spring animation config
const springConfig = { stiffness: 400, damping: 30 };
const softSpring = { stiffness: 200, damping: 25 };

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
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-collapse form when search results arrive
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !searchLoading) {
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
    const itineraries = flight.itineraries || [];
    const outbound = itineraries[0] || { segments: flight.segments || [] };
    const inbound = itineraries[1];
    const outSegs = outbound.segments || [];
    const inSegs = inbound?.segments || [];
    const outStops = outSegs.length > 0 ? outSegs.length - 1 : 0;

    const flightItem: Omit<FlightItem, "id" | "sortOrder" | "createdAt"> = {
      type: "flight",
      price: Number(flight.price?.total || flight.price?.amount || flight.totalPrice || 0),
      currency: "USD",
      date: params.useMultiDate ? format(params.departureDates[0], "yyyy-MM-dd") : params.departureDate,
      airline: flight.validatingAirlineCodes?.[0] || outSegs[0]?.carrierCode || flight.airline || "Airline",
      flightNumber: outSegs[0]?.number || outSegs[0]?.flightNumber || flight.flightNumber || "",
      origin: outSegs[0]?.departure?.iataCode || params.origin[0],
      originCity: outSegs[0]?.departure?.iataCode || params.origin[0],
      destination: outSegs[outSegs.length - 1]?.arrival?.iataCode || params.destination[0],
      destinationCity: outSegs[outSegs.length - 1]?.arrival?.iataCode || params.destination[0],
      departureTime: outSegs[0]?.departure?.at?.slice(11, 16) || "",
      arrivalTime: outSegs[outSegs.length - 1]?.arrival?.at?.slice(11, 16) || "",
      duration: outbound.duration?.replace("PT", "").toLowerCase() || flight.duration || "",
      stops: outStops,
      cabinClass: params.cabinClass,
      passengers: totalPassengers,
      baggage: flight.baggage,
      apiSource: flight.source || "amadeus",
      apiOfferId: flight.id,
      // Return flight data
      returnDate: inbound ? params.returnDate : undefined,
      returnDepartureTime: inSegs[0]?.departure?.at?.slice(11, 16),
      returnArrivalTime: inSegs[inSegs.length - 1]?.arrival?.at?.slice(11, 16),
      returnDuration: inbound?.duration?.replace("PT", "").toLowerCase(),
      returnStops: inSegs.length > 0 ? inSegs.length - 1 : undefined,
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
      {/* Collapsed Search Summary - Ultra Premium */}
      <AnimatePresence mode="wait">
        {formCollapsed && searchResults && searchResults.length > 0 ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ type: "spring", ...softSpring }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative overflow-hidden rounded-2xl"
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-white/70" />

            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: isHovered
                  ? "0 0 0 2px rgba(99, 102, 241, 0.3), 0 4px 20px rgba(99, 102, 241, 0.15)"
                  : "0 0 0 1px rgba(99, 102, 241, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
              transition={{ duration: 0.3 }}
            />

            <div className="relative p-4">
              <div className="flex items-center justify-between gap-3">
                {/* Route Summary with Premium Animation */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <motion.div
                    animate={{ rotate: isHovered ? 15 : 0 }}
                    transition={{ type: "spring", ...springConfig }}
                    className="relative"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                      <Plane className="w-5 h-5" />
                    </div>
                    {/* Pulse ring */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <span className="truncate">{searchSummary.from}</span>
                      <motion.div
                        animate={{ x: isHovered ? 4 : 0 }}
                        transition={{ type: "spring", ...springConfig }}
                      >
                        <ArrowRight className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      </motion.div>
                      <span className="truncate">{searchSummary.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {searchSummary.date}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {totalPassengers}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="capitalize">{params.cabinClass.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button - Premium */}
                <motion.button
                  type="button"
                  onClick={() => setFormCollapsed(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-sm font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex-shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </motion.button>
              </div>

              {/* Results count with premium styling */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-3 pt-3 border-t border-indigo-100/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
                    <Zap className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-bold text-green-700">
                      {searchResults.length} flights
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">found</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormCollapsed(false)}
                  className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                  Show form
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", ...softSpring }}
          >
            {/* Collapse header if results exist */}
            {searchResults && searchResults.length > 0 && (
              <motion.button
                type="button"
                onClick={() => setFormCollapsed(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-between px-4 py-2.5 mb-3 bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-xl text-sm text-gray-600 hover:from-indigo-50 hover:to-purple-50/80 border border-gray-200 hover:border-indigo-200 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 group-hover:text-indigo-600 transition-colors" />
                  <span className="font-medium group-hover:text-indigo-700 transition-colors">Search Form</span>
                </span>
                <ChevronUp className="w-4 h-4 group-hover:text-indigo-600 transition-colors" />
              </motion.button>
            )}

            {/* Search Form - Ultra Premium Compact Layout */}
            <form ref={formRef} onSubmit={handleSearch} className="space-y-3">
              {/* ROW 1: From + To with One-way toggle */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Plane className="w-2.5 h-2.5 text-white -rotate-45" />
                    </div>
                    From
                  </label>
                  <MultiAirportSelector
                    placeholder="Origin"
                    value={params.origin}
                    onChange={(codes) => setParams({ ...params, origin: codes })}
                    maxDisplay={1}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Plane className="w-2.5 h-2.5 text-white rotate-45" />
                      </div>
                      To
                    </label>
                    <motion.button
                      type="button"
                      onClick={() => setParams({ ...params, tripType: params.tripType === "oneway" ? "roundtrip" : "oneway", returnDate: "" })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm ${
                        params.tripType === "oneway"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-indigo-500/30"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      One-way
                    </motion.button>
                  </div>
                  <MultiAirportSelector
                    placeholder="Destination"
                    value={params.destination}
                    onChange={(codes) => setParams({ ...params, destination: codes })}
                    maxDisplay={1}
                  />
                </div>
              </div>

              {/* ROW 2: Dates - Range Picker or Multi-Date Mode */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Calendar className="w-2.5 h-2.5 text-white" />
                    </div>
                    Travel Dates
                  </label>
                  {/* Premium Toggle: Multi-date mode */}
                  <motion.button
                    type="button"
                    onClick={() => setParams({ ...params, useMultiDate: !params.useMultiDate, departureFlex: 0, departureDate: "", returnDate: "", departureDates: [] })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      params.useMultiDate
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    Multi-Date
                  </motion.button>
                </div>

                {!params.useMultiDate ? (
                  /* Standard Date Pickers */
                  <div className="grid grid-cols-2 gap-2">
                    <PremiumDatePicker
                      value={params.departureDate}
                      onChange={(date) => setParams({ ...params, departureDate: date })}
                      minDate={getMinDate()}
                      placeholder="Depart"
                    />
                    {params.tripType === "roundtrip" && (
                      <PremiumDatePicker
                        value={params.returnDate || ""}
                        onChange={(date) => setParams({ ...params, returnDate: date })}
                        minDate={params.departureDate || getMinDate()}
                        placeholder="Return"
                      />
                    )}
                    {params.tripType === "oneway" && (
                      <div className="flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-xl">
                        One-way
                      </div>
                    )}
                  </div>
                ) : (
                  /* Multi-Date Mode */
                  <div className="space-y-2">
                    {params.departureDates.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex flex-wrap gap-1"
                      >
                        {params.departureDates.map((date, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-[11px] font-semibold border border-purple-200 shadow-sm"
                          >
                            {format(date, "MMM d")}
                            <button
                              type="button"
                              onClick={() => removeMultiDate(idx)}
                              className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </motion.span>
                        ))}
                      </motion.div>
                    )}
                    {params.departureDates.length < 7 && (
                      <motion.div whileHover={{ scale: 1.01 }} className="relative">
                        <div className="flex items-center gap-2 p-2.5 bg-white border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-50/50 cursor-pointer text-xs text-purple-600 font-medium transition-all">
                          <Plus className="w-3.5 h-3.5" />
                          Add date ({7 - params.departureDates.length} left)
                        </div>
                        <input
                          type="date"
                          min={getMinDate()}
                          onChange={(e) => { addMultiDate(e.target.value); e.target.value = ""; }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </motion.div>
                    )}
                    {/* Trip Duration for multi-date */}
                    {params.tripType === "roundtrip" && (
                      <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white rounded-xl px-3 py-2 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">Duration</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.button
                            type="button"
                            onClick={() => setParams({ ...params, tripDuration: Math.max(1, params.tripDuration - 1) })}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900">{params.tripDuration}n</span>
                          <motion.button
                            type="button"
                            onClick={() => setParams({ ...params, tripDuration: Math.min(30, params.tripDuration + 1) })}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ROW 3: Travelers + Class + Direct - Premium Styling */}
              <div className="flex items-center gap-2">
                {/* Travelers Dropdown */}
                <div className="relative flex-1">
                  <motion.button
                    type="button"
                    onClick={() => { setShowPassengerDropdown(!showPassengerDropdown); setShowClassDropdown(false); }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 border-2 rounded-xl text-sm font-medium transition-all bg-white ${
                      showPassengerDropdown
                        ? "border-indigo-400 ring-4 ring-indigo-100 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-semibold">{totalPassengers}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: showPassengerDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {showPassengerDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowPassengerDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ type: "spring", ...springConfig }}
                          className="absolute z-20 mt-2 left-0 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-900/10 p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <Users className="w-5 h-5 text-indigo-600" />
                            <span className="font-bold text-gray-900">Passengers</span>
                          </div>

                          {[
                            { key: "adults", label: "Adults", sub: "12+ years", icon: "👤" },
                            { key: "children", label: "Children", sub: "2-12 years", icon: "👦" },
                            { key: "infants", label: "Infants", sub: "Under 2", icon: "👶" },
                          ].map(({ key, label, sub, icon }) => (
                            <div key={key} className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{icon}</span>
                                <div>
                                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                                  <p className="text-xs text-gray-400">{sub}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <motion.button
                                  type="button"
                                  onClick={() => updatePassenger(key as any, -1)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-indigo-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition-colors"
                                  disabled={key === "adults" ? params.adults <= 1 : (params as any)[key] <= 0}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </motion.button>
                                <span className="w-6 text-center font-bold text-gray-900">{(params as any)[key]}</span>
                                <motion.button
                                  type="button"
                                  onClick={() => updatePassenger(key as any, 1)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-indigo-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition-colors"
                                  disabled={(params as any)[key] >= 9 || (key === "infants" && params.infants >= params.adults)}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                            </div>
                          ))}

                          <motion.button
                            type="button"
                            onClick={() => setShowPassengerDropdown(false)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold mt-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
                          >
                            Done
                          </motion.button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Class Dropdown */}
                <div className="relative flex-1">
                  <motion.button
                    type="button"
                    onClick={() => { setShowClassDropdown(!showClassDropdown); setShowPassengerDropdown(false); }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 border-2 rounded-xl text-sm font-medium transition-all bg-white ${
                      showClassDropdown
                        ? "border-indigo-400 ring-4 ring-indigo-100 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <span className="truncate text-xs font-semibold">
                      {CABIN_CLASSES.find((c) => c.value === params.cabinClass)?.label || "Economy"}
                    </span>
                    <motion.div
                      animate={{ rotate: showClassDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {showClassDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowClassDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ type: "spring", ...springConfig }}
                          className="absolute z-20 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl shadow-gray-900/10 overflow-hidden"
                        >
                          {CABIN_CLASSES.map((cabin, idx) => (
                            <motion.button
                              key={cabin.value}
                              type="button"
                              onClick={() => { setParams({ ...params, cabinClass: cabin.value }); setShowClassDropdown(false); }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all ${
                                params.cabinClass === cabin.value
                                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${cabin.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                  {cabin.icon}
                                </div>
                                <span className="font-semibold">{cabin.label}</span>
                              </div>
                              {params.cabinClass === cabin.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center"
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Direct Toggle - Premium */}
                <motion.button
                  type="button"
                  onClick={() => setParams({ ...params, directFlights: !params.directFlights })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex-shrink-0 flex items-center gap-1.5 ${
                    params.directFlights
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                      : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${params.directFlights ? "text-white" : ""}`} />
                  Direct
                </motion.button>
              </div>

              {/* Error Message - Premium */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl text-sm text-red-700"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Button - Ultra Premium */}
              <motion.button
                type="submit"
                disabled={searchLoading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full overflow-hidden rounded-2xl disabled:opacity-50 transition-all group"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ opacity: 0.5 }}
                />

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-center gap-2 py-3.5 font-bold text-white shadow-xl shadow-indigo-500/30">
                  {searchLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Searching best deals...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Search Flights</span>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-5 bg-gray-200 rounded-lg w-20 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded-lg w-12 animate-pulse ml-auto" />
                  </div>
                </div>
              </motion.div>
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
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{searchResults.length} flights found</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Best prices
              </div>
            </div>
            {searchResults.slice(0, 10).map((flight: any, idx: number) => (
              <FlightResultCard key={flight.id || idx} flight={flight} onAdd={() => handleAddFlight(flight)} index={idx} />
            ))}
          </motion.div>
        )}

        {!searchLoading && searchResults && searchResults.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Plane className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            </motion.div>
            <p className="text-gray-600 font-semibold">No flights found</p>
            <p className="text-sm text-gray-400 mt-1">Try different dates or airports</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Flight Result Card - Ultra-Compact with Return Flight Support
function FlightResultCard({ flight, onAdd, index }: { flight: any; onAdd: () => void; index: number }) {
  // Data extraction
  const price = Number(flight.price?.total || flight.price?.amount || flight.totalPrice || 0);
  const airline = flight.validatingAirlineCodes?.[0] || flight.airline || flight.carrierCode ||
    flight.segments?.[0]?.carrierCode || flight.itineraries?.[0]?.segments?.[0]?.carrierCode || "XX";

  // Itineraries - outbound and return
  const itineraries = flight.itineraries || [];
  const outbound = itineraries[0] || { segments: flight.segments || [], duration: flight.duration || "" };
  const inbound = itineraries[1];
  const isRoundtrip = !!inbound;

  // Helper functions
  const formatTime = (dateStr: string) => {
    if (!dateStr) return "--:--";
    const time = dateStr.includes("T") ? dateStr.slice(11, 16) : dateStr;
    return time || "--:--";
  };

  const parseDuration = (dur: string) => {
    if (!dur) return "";
    const match = dur.match(/PT(\d+H)?(\d+M)?/i);
    if (!match) return dur.toLowerCase().replace("pt", "");
    const h = match[1]?.replace(/h/i, "h") || "";
    const m = match[2]?.replace(/m/i, "m") || "";
    return `${h}${m ? " " + m : ""}`.trim();
  };

  const getStops = (segments: any[]) => segments?.length ? segments.length - 1 : 0;
  const getStopsStyle = (stops: number) =>
    stops === 0 ? "bg-emerald-100 text-emerald-700" : stops === 1 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";

  // Outbound data
  const outSegs = outbound.segments || [];
  const outDep = outSegs[0]?.departure || {};
  const outArr = outSegs[outSegs.length - 1]?.arrival || {};
  const outStops = getStops(outSegs);
  const outDur = parseDuration(outbound.duration);
  const flightNum = outSegs[0]?.number || outSegs[0]?.flightNumber || flight.flightNumber || "";

  // Inbound data
  const inSegs = inbound?.segments || [];
  const inDep = inSegs[0]?.departure || {};
  const inArr = inSegs[inSegs.length - 1]?.arrival || {};
  const inStops = getStops(inSegs);
  const inDur = parseDuration(inbound?.duration || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all"
    >
      {/* Main Row - Outbound */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Airline Logo + Info */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <AirlineLogo code={airline} size="sm" className="flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">{airline}</p>
            {flightNum && <p className="text-[10px] text-gray-500">{flightNum}</p>}
          </div>
        </div>

        {/* Outbound Flight */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[8px] font-bold text-indigo-600 uppercase w-8">→ OUT</span>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{formatTime(outDep.at)}</p>
            <p className="text-[9px] font-semibold text-gray-600">{outDep.iataCode || "---"}</p>
          </div>
          <div className="flex-1 px-1 min-w-[50px]">
            <div className="relative h-px bg-gradient-to-r from-gray-300 via-indigo-400 to-gray-300">
              <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-indigo-500 bg-white rounded-full" />
            </div>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="text-[8px] text-gray-500">{outDur}</span>
              <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${getStopsStyle(outStops)}`}>
                {outStops === 0 ? "Direct" : `${outStops}stop`}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{formatTime(outArr.at)}</p>
            <p className="text-[9px] font-semibold text-gray-600">{outArr.iataCode || "---"}</p>
          </div>
        </div>

        {/* Price + Add */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-right">
            <p className="text-base font-black text-gray-900 bg-yellow-100 px-1.5 py-0.5 rounded">
              ${price > 0 ? Math.round(price) : "N/A"}
            </p>
            <p className="text-[8px] text-gray-400">/person</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Best badge */}
        {index === 0 && (
          <div className="absolute top-1 right-1">
            <span className="text-[7px] font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded-full flex items-center gap-0.5">
              <Star className="w-2 h-2 fill-amber-500" /> BEST
            </span>
          </div>
        )}
      </div>

      {/* Return Row - If Roundtrip */}
      {isRoundtrip && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-t border-gray-100">
          <div className="min-w-[100px]" /> {/* Spacer for alignment */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[8px] font-bold text-orange-600 uppercase w-8">← RET</span>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{formatTime(inDep.at)}</p>
              <p className="text-[9px] font-semibold text-gray-600">{inDep.iataCode || "---"}</p>
            </div>
            <div className="flex-1 px-1 min-w-[50px]">
              <div className="relative h-px bg-gradient-to-r from-gray-300 via-orange-400 to-gray-300">
                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-orange-500 bg-white rounded-full rotate-180" />
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-[8px] text-gray-500">{inDur}</span>
                <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${getStopsStyle(inStops)}`}>
                  {inStops === 0 ? "Direct" : `${inStops}stop`}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{formatTime(inArr.at)}</p>
              <p className="text-[9px] font-semibold text-gray-600">{inArr.iataCode || "---"}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
