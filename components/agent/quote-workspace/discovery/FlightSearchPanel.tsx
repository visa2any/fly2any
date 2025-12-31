"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plane, ArrowRight, Loader2, Plus, Calendar, Users, AlertCircle } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { FlightItem, FlightSearchParams } from "../types/quote-workspace.types";

export default function FlightSearchPanel() {
  const { state, addItem, setSearchResults } = useQuoteWorkspace();
  const { searchLoading, searchResults } = state.ui;

  // Search form state
  const [params, setParams] = useState<FlightSearchParams>({
    origin: "",
    destination: state.destination ? state.destination.split(",")[0] : "",
    departureDate: state.startDate || "",
    returnDate: state.endDate || "",
    adults: state.travelers.adults,
    children: state.travelers.children,
    infants: state.travelers.infants,
    cabinClass: "economy",
    tripType: "roundtrip",
  });

  const [error, setError] = useState<string | null>(null);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!params.origin || !params.destination || !params.departureDate) {
      setError("Please fill in origin, destination, and departure date");
      return;
    }

    setSearchResults(true, null);

    try {
      const query = new URLSearchParams({
        origin: params.origin.toUpperCase(),
        destination: params.destination.toUpperCase(),
        departureDate: params.departureDate,
        ...(params.returnDate && params.tripType === "roundtrip" && { returnDate: params.returnDate }),
        adults: params.adults.toString(),
        children: params.children.toString(),
        infants: params.infants.toString(),
        cabinClass: params.cabinClass,
      });

      const res = await fetch(`/api/flights/search?${query}`);
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
    const flightItem: Omit<FlightItem, "id" | "sortOrder" | "createdAt"> = {
      type: "flight",
      price: flight.price?.total || flight.price?.amount || 0,
      currency: "USD",
      date: params.departureDate,
      airline: flight.airline || flight.segments?.[0]?.airline || "Unknown",
      flightNumber: flight.flightNumber || flight.segments?.[0]?.flightNumber || "",
      origin: params.origin.toUpperCase(),
      originCity: flight.segments?.[0]?.departureCity || params.origin,
      destination: params.destination.toUpperCase(),
      destinationCity: flight.segments?.[flight.segments?.length - 1]?.arrivalCity || params.destination,
      departureTime: flight.departureTime || flight.segments?.[0]?.departureTime || "",
      arrivalTime: flight.arrivalTime || flight.segments?.[flight.segments?.length - 1]?.arrivalTime || "",
      duration: flight.duration || "",
      stops: flight.stops ?? (flight.segments?.length - 1) ?? 0,
      cabinClass: params.cabinClass as any,
      passengers: params.adults + params.children + params.infants,
      baggage: flight.baggage,
      apiSource: flight.source || "amadeus",
      apiOfferId: flight.id,
    };

    addItem(flightItem);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Trip Type */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setParams({ ...params, tripType: "roundtrip" })}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
              params.tripType === "roundtrip"
                ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
            }`}
          >
            Round Trip
          </button>
          <button
            type="button"
            onClick={() => setParams({ ...params, tripType: "oneway" })}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
              params.tripType === "oneway"
                ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
            }`}
          >
            One Way
          </button>
        </div>

        {/* Origin & Destination */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="text"
              value={params.origin}
              onChange={(e) => setParams({ ...params, origin: e.target.value })}
              placeholder="JFK"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
              maxLength={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="text"
              value={params.destination}
              onChange={(e) => setParams({ ...params, destination: e.target.value })}
              placeholder="CDG"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
              maxLength={3}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Depart</label>
            <input
              type="date"
              value={params.departureDate}
              onChange={(e) => setParams({ ...params, departureDate: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          {params.tripType === "roundtrip" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Return</label>
              <input
                type="date"
                value={params.returnDate}
                onChange={(e) => setParams({ ...params, returnDate: e.target.value })}
                min={params.departureDate || new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Adults</label>
            <input
              type="number"
              value={params.adults}
              onChange={(e) => setParams({ ...params, adults: parseInt(e.target.value) || 1 })}
              min={1}
              max={9}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Children</label>
            <input
              type="number"
              value={params.children}
              onChange={(e) => setParams({ ...params, children: parseInt(e.target.value) || 0 })}
              min={0}
              max={9}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Infants</label>
            <input
              type="number"
              value={params.infants}
              onChange={(e) => setParams({ ...params, infants: parseInt(e.target.value) || 0 })}
              min={0}
              max={params.adults}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Cabin Class */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
          <select
            value={params.cabinClass}
            onChange={(e) => setParams({ ...params, cabinClass: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Search Button */}
        <motion.button
          type="submit"
          disabled={searchLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
        >
          {searchLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search Flights
            </>
          )}
        </motion.button>
      </form>

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
            <p className="text-sm text-gray-500">
              {searchResults.length} flights found
            </p>
            {searchResults.slice(0, 10).map((flight: any, idx: number) => (
              <FlightResultCard
                key={flight.id || idx}
                flight={flight}
                onAdd={() => handleAddFlight(flight)}
              />
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

// Flight Result Card
function FlightResultCard({ flight, onAdd }: { flight: any; onAdd: () => void }) {
  const price = flight.price?.total || flight.price?.amount || 0;
  const airline = flight.airline || flight.segments?.[0]?.airline || "Unknown";
  const duration = flight.duration || "";
  const stops = flight.stops ?? (flight.segments?.length - 1) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Flight Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{airline}</span>
            {flight.flightNumber && (
              <span className="text-xs text-gray-400">{flight.flightNumber}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {duration && <span>{duration}</span>}
            <span>•</span>
            <span>{stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}</span>
          </div>
        </div>

        {/* Price & Add */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              ${typeof price === "number" ? price.toLocaleString() : price}
            </p>
            <p className="text-xs text-gray-400">/person</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="w-9 h-9 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full hover:bg-primary-600 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
