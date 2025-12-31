"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, Loader2, Plus, Star, MapPin, AlertCircle } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { HotelItem, HotelSearchParams } from "../types/quote-workspace.types";

export default function HotelSearchPanel() {
  const { state, addItem, setSearchResults } = useQuoteWorkspace();
  const { searchLoading, searchResults } = state.ui;

  // Search form state
  const [params, setParams] = useState<HotelSearchParams>({
    location: state.destination || "",
    checkIn: state.startDate || "",
    checkOut: state.endDate || "",
    rooms: 1,
    adults: state.travelers.adults,
    children: state.travelers.children,
  });

  const [error, setError] = useState<string | null>(null);

  // Calculate nights
  const nights =
    params.checkIn && params.checkOut
      ? Math.max(1, Math.ceil((new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!params.location || !params.checkIn || !params.checkOut) {
      setError("Please fill in location, check-in, and check-out dates");
      return;
    }

    setSearchResults(true, null);

    try {
      const query = new URLSearchParams({
        location: params.location,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        rooms: params.rooms.toString(),
        adults: params.adults.toString(),
        children: params.children.toString(),
      });

      const res = await fetch(`/api/hotels/search?${query}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }

      setSearchResults(false, data.hotels || []);
    } catch (err: any) {
      setError(err.message || "Failed to search hotels");
      setSearchResults(false, null);
    }
  };

  // Add hotel to quote
  const handleAddHotel = (hotel: any) => {
    const hotelItem: Omit<HotelItem, "id" | "sortOrder" | "createdAt"> = {
      type: "hotel",
      price: hotel.price?.total || hotel.price?.amount || (hotel.price?.perNight * nights) || 0,
      currency: "USD",
      date: params.checkIn,
      name: hotel.name || "Hotel",
      location: hotel.location || hotel.address || params.location,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights: nights,
      roomType: hotel.roomType || hotel.room?.type || "Standard Room",
      stars: hotel.stars || hotel.rating || 4,
      amenities: hotel.amenities || [],
      image: hotel.image || hotel.images?.[0],
      guests: params.adults + params.children,
      apiSource: "liteapi",
      apiOfferId: hotel.id,
    };

    addItem(hotelItem);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={params.location}
              onChange={(e) => setParams({ ...params, location: e.target.value })}
              placeholder="City or destination"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Check-in</label>
            <input
              type="date"
              value={params.checkIn}
              onChange={(e) => setParams({ ...params, checkIn: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Check-out</label>
            <input
              type="date"
              value={params.checkOut}
              onChange={(e) => setParams({ ...params, checkOut: e.target.value })}
              min={params.checkIn || new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Nights indicator */}
        {nights > 0 && (
          <div className="text-center text-sm text-primary-600 font-medium">
            {nights} night{nights > 1 ? "s" : ""}
          </div>
        )}

        {/* Guests */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Rooms</label>
            <input
              type="number"
              value={params.rooms}
              onChange={(e) => setParams({ ...params, rooms: parseInt(e.target.value) || 1 })}
              min={1}
              max={10}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Adults</label>
            <input
              type="number"
              value={params.adults}
              onChange={(e) => setParams({ ...params, adults: parseInt(e.target.value) || 1 })}
              min={1}
              max={10}
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
              max={10}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
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
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
        >
          {searchLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search Hotels
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
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
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
              {searchResults.length} hotels found
            </p>
            {searchResults.slice(0, 10).map((hotel: any, idx: number) => (
              <HotelResultCard
                key={hotel.id || idx}
                hotel={hotel}
                nights={nights}
                onAdd={() => handleAddHotel(hotel)}
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
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hotels found</p>
            <p className="text-sm text-gray-400">Try different dates or location</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hotel Result Card
function HotelResultCard({ hotel, nights, onAdd }: { hotel: any; nights: number; onAdd: () => void }) {
  const price = hotel.price?.total || hotel.price?.amount || (hotel.price?.perNight * nights) || 0;
  const stars = hotel.stars || hotel.rating || 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-3 hover:border-primary-300 hover:shadow-md transition-all group"
    >
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
          {hotel.image || hotel.images?.[0] ? (
            <img
              src={hotel.image || hotel.images?.[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">{hotel.name}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">
            {hotel.location || hotel.address}
          </p>
        </div>

        {/* Price & Add */}
        <div className="flex flex-col items-end justify-between">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              ${typeof price === "number" ? price.toLocaleString() : price}
            </p>
            <p className="text-xs text-gray-400">total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full hover:bg-primary-600 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
