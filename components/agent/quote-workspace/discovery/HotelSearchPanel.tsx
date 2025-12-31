"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, Loader2, Plus, Star, MapPin, AlertCircle, Users, ChevronDown, Minus, X, Plane, Landmark } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import PremiumDatePicker from "@/components/common/PremiumDatePicker";
import type { HotelItem, HotelSearchParams } from "../types/quote-workspace.types";

interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  location: { lat: number; lng: number };
  type: 'city' | 'landmark' | 'airport' | 'neighborhood' | 'poi';
  placeId?: string;
  emoji?: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'airport': return <Plane className="w-4 h-4 text-blue-500" />;
    case 'landmark': return <Landmark className="w-4 h-4 text-amber-500" />;
    case 'poi': return <Star className="w-4 h-4 text-purple-500" />;
    case 'neighborhood': return <Building2 className="w-4 h-4 text-green-500" />;
    default: return <MapPin className="w-4 h-4 text-orange-500" />;
  }
};

export default function HotelSearchPanel() {
  const { state, addItem, setSearchResults } = useQuoteWorkspace();
  const searchLoading = state.ui.searchLoading;
  const searchResults = state.ui.searchResults;

  const [params, setParams] = useState<HotelSearchParams>({
    location: state.destination || "",
    checkIn: state.startDate || "",
    checkOut: state.endDate || "",
    rooms: 1,
    adults: state.travelers.adults,
    children: state.travelers.children,
  });

  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<LocationSuggestion | null>(null);

  const suggestRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  const nights = params.checkIn && params.checkOut
    ? Math.max(1, Math.ceil((new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / 86400000))
    : 0;

  const totalGuests = params.adults + params.children;
  const minDate = new Date().toISOString().split("T")[0];

  // Fetch popular destinations on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/hotels/suggestions?popular=true');
        const data = await res.json();
        if (data.success && data.data) {
          setPopularDestinations(data.data);
        }
      } catch (err) {
        console.error('Error fetching popular destinations:', err);
      }
    };
    fetchPopular();
  }, []);

  // Fetch suggestions as user types (debounced)
  useEffect(() => {
    if (!params.location.trim() || params.location.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/hotels/suggestions?query=${encodeURIComponent(params.location)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSuggestions(data.data);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [params.location]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (suggestRef.current && !suggestRef.current.contains(target)) setShowSuggestions(false);
      if (guestRef.current && !guestRef.current.contains(target)) setShowGuestDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectDestination = (dest: LocationSuggestion) => {
    setParams({ ...params, location: dest.name });
    setSelectedDestination(dest);
    setShowSuggestions(false);
  };

  const displaySuggestions = params.location.trim().length >= 2 ? suggestions : popularDestinations;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!params.location || !params.checkIn || !params.checkOut) {
      setError("Please fill in all required fields");
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
      if (!res.ok) throw new Error(data.error || "Search failed");
      setSearchResults(false, data.hotels || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults(false, null);
    }
  };

  const handleAddHotel = (hotel: any) => {
    const item: Omit<HotelItem, "id" | "sortOrder" | "createdAt"> = {
      type: "hotel",
      price: hotel.price?.total || hotel.price?.amount || (hotel.price?.perNight ? hotel.price.perNight * nights : 0) || 0,
      currency: "USD",
      date: params.checkIn,
      name: hotel.name || "Hotel",
      location: hotel.location || hotel.address || params.location,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights,
      roomType: hotel.roomType || "Standard Room",
      stars: hotel.stars || 4,
      amenities: hotel.amenities || [],
      image: hotel.image || hotel.images?.[0],
      guests: totalGuests,
      apiSource: "liteapi",
      apiOfferId: hotel.id,
    };
    addItem(item);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Find Hotels</h3>
          <p className="text-[10px] text-gray-400">Search and add to quote</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        {/* Destination with API Autocomplete */}
        <div className="relative" ref={suggestRef}>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <MapPin className="w-2.5 h-2.5 text-white" />
            </div>
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={params.location}
              onChange={(e) => { setParams({ ...params, location: e.target.value }); setSelectedDestination(null); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="City, airport, or landmark"
              className={`w-full pl-10 pr-8 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${showSuggestions ? "border-purple-400 ring-4 ring-purple-100" : "border-gray-200 hover:border-gray-300"}`}
            />
            {loadingSuggestions && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 animate-spin" />}
            {params.location && !loadingSuggestions && (
              <button type="button" onClick={() => { setParams({ ...params, location: "" }); setSelectedDestination(null); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showSuggestions && displaySuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-2 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase px-2">
                    {params.location.trim().length >= 2 ? "Search Results" : "Popular Destinations"}
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                  {displaySuggestions.map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handleSelectDestination(dest)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-left transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                        {dest.emoji ? <span className="text-lg">{dest.emoji}</span> : getTypeIcon(dest.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{dest.name}</p>
                        <p className="text-xs text-gray-500 truncate">{dest.city !== dest.name ? `${dest.city}, ` : ''}{dest.country}</p>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-full">
                        {dest.type}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <PremiumDatePicker
            label="Check-in"
            value={params.checkIn}
            onChange={(date) => setParams({ ...params, checkIn: date })}
            minDate={minDate}
            placeholder="Check-in"
          />
          <PremiumDatePicker
            label="Check-out"
            value={params.checkOut}
            onChange={(date) => setParams({ ...params, checkOut: date })}
            minDate={params.checkIn || minDate}
            placeholder="Check-out"
          />
        </div>

        {nights > 0 && (
          <div className="text-center text-sm text-purple-600 font-bold">{nights} night{nights > 1 ? "s" : ""}</div>
        )}

        {/* Guests */}
        <div className="relative" ref={guestRef}>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Users className="w-2.5 h-2.5 text-white" />
            </div>
            Guests &amp; Rooms
          </label>
          <button
            type="button"
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            className={`w-full flex items-center justify-between px-3 py-2.5 border-2 rounded-xl text-sm font-medium transition-all bg-white ${showGuestDropdown ? "border-indigo-400 ring-4 ring-indigo-100" : "border-gray-200 hover:border-gray-300"}`}
          >
            <span className="font-semibold text-gray-900">{params.rooms} room{params.rooms > 1 ? "s" : ""} • {totalGuests} guest{totalGuests > 1 ? "s" : ""}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showGuestDropdown ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showGuestDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 space-y-3"
              >
                <GuestRow label="Rooms" value={params.rooms} min={1} onChange={(v) => setParams({ ...params, rooms: v })} />
                <GuestRow label="Adults" sub="12+ years" value={params.adults} min={1} onChange={(v) => setParams({ ...params, adults: v })} />
                <GuestRow label="Children" sub="2-12 years" value={params.children} min={0} onChange={(v) => setParams({ ...params, children: v })} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={searchLoading}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
        >
          {searchLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</> : <><Search className="w-5 h-5" /> Search Hotels</>}
        </motion.button>
      </form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {searchLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                  <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        {!searchLoading && searchResults && searchResults.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-sm text-gray-500">{searchResults.length} hotels found</p>
            {searchResults.slice(0, 10).map((hotel: any, idx: number) => (
              <HotelCard key={hotel.id || idx} hotel={hotel} nights={nights} onAdd={() => handleAddHotel(hotel)} />
            ))}
          </motion.div>
        )}
        {!searchLoading && searchResults && searchResults.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hotels found</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuestRow({ label, sub, value, min, onChange }: { label: string; sub?: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-purple-100 flex items-center justify-center disabled:opacity-30">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(10, value + 1))} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-purple-100 flex items-center justify-center">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function HotelCard({ hotel, nights, onAdd }: { hotel: any; nights: number; onAdd: () => void }) {
  const price = hotel.price?.total || hotel.price?.amount || (hotel.price?.perNight ? hotel.price.perNight * nights : 0) || 0;
  const stars = hotel.stars || hotel.rating || 4;
  const imageUrl = hotel.image || hotel.images?.[0];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} className="bg-white border-2 border-gray-100 rounded-2xl p-3 hover:border-purple-200 hover:shadow-lg transition-all group">
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-xl bg-purple-100 overflow-hidden flex-shrink-0">
          {imageUrl ? <img src={imageUrl} alt={hotel.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-8 h-8 text-purple-300" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate text-sm">{hotel.name}</h4>
          <div className="flex items-center gap-1 mt-0.5">{Array.from({ length: stars }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
          <p className="text-xs text-gray-500 truncate mt-1">{hotel.location || hotel.address}</p>
        </div>
        <div className="flex flex-col items-end justify-between">
          <div className="text-right">
            <p className="text-lg font-black text-gray-900">${typeof price === "number" ? price.toLocaleString() : price}</p>
            <p className="text-[10px] text-gray-400">total</p>
          </div>
          <motion.button whileHover={{ scale: 1.15, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onAdd} className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
