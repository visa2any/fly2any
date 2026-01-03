"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, Loader2, Plus, Star, MapPin, AlertCircle, Users, ChevronDown, ChevronUp, Minus, X, Plane, Landmark, Edit3, Calendar, ArrowUpDown, Filter, Check, Sparkles } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import { useUnifiedSearchSafe } from "../unified-search";
import PremiumDateRangePicker from "@/components/common/PremiumDateRangePicker";
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

  // ═══ UNIFIED SEARCH RESULTS ═══
  // Consume pre-fetched results from unified search (when user searched from Flights tab)
  const unifiedContext = useUnifiedSearchSafe();
  const unifiedHotelResults = unifiedContext?.products?.hotels?.results;
  const unifiedHotelStatus = unifiedContext?.products?.hotels?.status;
  const hasUnifiedResults = unifiedHotelResults && unifiedHotelResults.length > 0;

  // Use unified results if available, otherwise use local search results
  const searchLoading = state.ui.searchLoading || unifiedHotelStatus === "loading";
  const searchResults = hasUnifiedResults ? unifiedHotelResults : state.ui.searchResults;

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
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price');
  const [filterStars, setFilterStars] = useState<number>(0); // 0 = all, 3/4/5 = min stars
  const [filterRefundable, setFilterRefundable] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  // Auto-collapse form when search results arrive (local or unified)
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !searchLoading) {
      const timer = setTimeout(() => setFormCollapsed(true), 500);
      return () => clearTimeout(timer);
    }
  }, [searchResults, searchLoading]);

  // Log when unified results are received
  useEffect(() => {
    if (hasUnifiedResults) {
      console.log("[HotelSearchPanel] Received unified results:", unifiedHotelResults?.length);
    }
  }, [hasUnifiedResults, unifiedHotelResults]);

  // Expand form when there's an error
  useEffect(() => {
    if (error) setFormCollapsed(false);
  }, [error]);

  // ═══ SYNC FROM TRIP CONTEXT ═══
  // Auto-populate from Flight search when switching tabs
  useEffect(() => {
    setParams(prev => ({
      ...prev,
      location: state.destination || prev.location,
      checkIn: state.startDate || prev.checkIn,
      checkOut: state.endDate || prev.checkOut,
      adults: state.travelers?.adults ?? prev.adults,
      children: state.travelers?.children ?? prev.children,
    }));
  }, [state.destination, state.startDate, state.endDate, state.travelers]);
  // ═══ END SYNC ═══

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
    setVisibleCount(10); // Reset pagination
    try {
      // API expects location with {lat,lng} AND/OR {query: "city name"}
      // Always include query for Amadeus search support
      const locationPayload = selectedDestination?.location
        ? { ...selectedDestination.location, query: params.location }  // {lat, lng, query}
        : { query: params.location };   // wrap string in query object

      const body = {
        location: locationPayload,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: {
          adults: params.adults,
          children: params.children,
        },
        rooms: params.rooms,
      };
      const res = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.hint || "Search failed");
      // API returns { success, data: hotels[], meta } - hotels are in data.data
      setSearchResults(false, data.data || data.hotels || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults(false, null);
    }
  };

  const handleAddHotel = (hotel: any) => {
    // Extract price - API returns lowestPrice: { amount, currency } or lowestPricePerNight as number
    const totalPrice = hotel.lowestPrice?.amount
      ? parseFloat(hotel.lowestPrice.amount)
      : (hotel.lowestPricePerNight ? hotel.lowestPricePerNight * nights : 0);

    // Extract image URL - API returns images: [{ url, alt }] array
    const imageUrl = hotel.thumbnail
      || hotel.images?.[0]?.url
      || hotel.image
      || (typeof hotel.images?.[0] === 'string' ? hotel.images[0] : null);

    // Location string
    const locationStr = typeof hotel.location === 'object'
      ? (hotel.location?.city || hotel.location?.address || params.location)
      : (hotel.location || hotel.address || params.location);

    const item: Omit<HotelItem, "id" | "sortOrder" | "createdAt"> = {
      type: "hotel",
      price: totalPrice,
      currency: "USD", // Force USD
      date: params.checkIn,
      name: hotel.name || "Hotel",
      location: locationStr,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights,
      roomType: hotel.rates?.[0]?.roomType || hotel.roomType || "Standard Room",
      stars: hotel.rating || hotel.stars || 4,
      amenities: hotel.amenities || [],
      image: imageUrl,
      guests: totalGuests,
      apiSource: hotel.source || "liteapi",
      apiOfferId: hotel.id,
    };
    addItem(item);
  };

  return (
    <div className="p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
          <Building2 className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-900">Find Hotels</h3>
          <p className="text-[9px] text-gray-400">Search and add to quote</p>
        </div>
      </div>

      {/* Collapsed Search Summary */}
      <AnimatePresence mode="wait">
        {formCollapsed && searchResults && searchResults.length > 0 ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{params.location || "Destination"}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{params.checkIn} → {params.checkOut}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{totalGuests}</span>
                  </div>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => setFormCollapsed(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-purple-600 border border-purple-200 shadow-sm"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </motion.button>
            </div>
            <div className="mt-2 pt-2 border-t border-purple-100 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700">{searchResults.length} hotels found</span>
              <button type="button" onClick={() => setFormCollapsed(false)} className="text-xs text-gray-500 hover:text-purple-600 flex items-center gap-1">
                <ChevronDown className="w-3 h-3" /> Show form
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Collapse button when results exist */}
            {searchResults && searchResults.length > 0 && (
              <motion.button
                type="button"
                onClick={() => setFormCollapsed(true)}
                className="w-full flex items-center justify-between px-3 py-2 mb-2 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 transition-all"
              >
                <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search Form</span>
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            )}

            <form onSubmit={handleSearch} className="space-y-2">
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

        {/* Dates - Single Range Picker */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Building2 className="w-2.5 h-2.5 text-white" />
            </div>
            Check-in &amp; Check-out
          </label>
          <PremiumDateRangePicker
            startDate={params.checkIn}
            endDate={params.checkOut}
            onChangeStart={(date) => setParams(prev => ({ ...prev, checkIn: date }))}
            onChangeEnd={(date) => setParams(prev => ({ ...prev, checkOut: date }))}
            minDate={minDate}
            startPlaceholder="Check-in"
            endPlaceholder="Check-out"
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
          </motion.div>
        )}
      </AnimatePresence>

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
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {/* Unified Search Banner */}
            {hasUnifiedResults && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-700">Pre-loaded from your flight search</span>
              </motion.div>
            )}
            {/* Sticky Filter Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-100 p-1.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-700">{searchResults.length} hotels</span>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-400 mr-1">Sort:</span>
                  {(['price', 'rating', 'name'] as const).map(s => (
                    <button key={s} onClick={() => setSortBy(s)} className={`text-[9px] px-1.5 py-0.5 rounded font-medium transition-all ${sortBy === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s === 'price' ? 'Price' : s === 'rating' ? 'Rating' : 'Name'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Filter className="w-3 h-3 text-gray-400" />
                {[3, 4, 5].map(s => (
                  <button key={s} onClick={() => setFilterStars(filterStars === s ? 0 : s)} className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 transition-all ${filterStars === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s}★+
                  </button>
                ))}
                <button onClick={() => setFilterRefundable(!filterRefundable)} className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 transition-all ${filterRefundable ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {filterRefundable && <Check className="w-2.5 h-2.5" />}Free Cancel
                </button>
              </div>
            </div>
            {/* Filtered & Sorted Results */}
            {(() => {
              const filtered = searchResults
                .filter((h: any) => filterStars === 0 || (h.rating || h.stars || 4) >= filterStars)
                .filter((h: any) => !filterRefundable || h.refundable)
                .sort((a: any, b: any) => {
                  if (sortBy === 'price') return (a.lowestPrice?.amount || a.lowestPricePerNight || 9999) - (b.lowestPrice?.amount || b.lowestPricePerNight || 9999);
                  if (sortBy === 'rating') return (b.reviewScore || 0) - (a.reviewScore || 0);
                  return (a.name || '').localeCompare(b.name || '');
                });
              const visible = filtered.slice(0, visibleCount);
              const remaining = filtered.length - visibleCount;
              return (
                <>
                  <div className="space-y-1.5">
                    {visible.map((hotel: any, idx: number) => (
                      <HotelCard key={hotel.id || idx} hotel={hotel} nights={nights} onAdd={() => handleAddHotel(hotel)} />
                    ))}
                  </div>
                  {remaining > 0 && (
                    <button onClick={() => setVisibleCount(v => v + 10)} className="w-full py-2 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all">
                      Load More ({remaining} remaining)
                    </button>
                  )}
                  {filtered.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No hotels match filters</p>}
                </>
              );
            })()}
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
  const totalPrice = hotel.lowestPrice?.amount ? parseFloat(hotel.lowestPrice.amount) : (hotel.lowestPricePerNight ? hotel.lowestPricePerNight * nights : 0);
  const perNight = hotel.lowestPricePerNight || (totalPrice > 0 ? totalPrice / nights : 0);
  const stars = hotel.rating || hotel.stars || 4;
  const score = hotel.reviewScore || 0;
  const img = hotel.thumbnail || hotel.images?.[0]?.url || hotel.image;
  const loc = typeof hotel.location === 'object' ? (hotel.location?.city || hotel.location?.address || '') : (hotel.location || hotel.address || '');
  const amenities = (hotel.amenities || []).slice(0, 2);
  const board = hotel.boardType && hotel.boardType !== 'RO' ? ({ BB: 'B&B', HB: 'Half', FB: 'Full', AI: 'All-Inc' }[hotel.boardType] || hotel.boardType) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }} className="bg-white border border-gray-100 rounded-xl p-2 hover:border-purple-200 hover:shadow-md transition-all group">
      <div className="flex gap-2.5">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg bg-purple-50 overflow-hidden flex-shrink-0 relative">
          {img ? <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <Building2 className="w-6 h-6 text-purple-200 absolute inset-0 m-auto" />}
          {hotel.refundable && <span className="absolute top-0.5 left-0.5 bg-green-500 text-white text-[6px] font-bold px-1 rounded">FREE</span>}
        </div>

        {/* Info - Compact 2 rows */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          {/* Row 1: Name + Stars + Score */}
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-gray-900 text-xs truncate max-w-[120px]">{hotel.name}</h4>
            <div className="flex items-center gap-0.5 flex-shrink-0">{Array.from({ length: Math.min(stars, 5) }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}</div>
            {score > 0 && <span className="text-[8px] font-bold text-white bg-purple-600 px-1 py-px rounded flex-shrink-0">{score.toFixed(1)}</span>}
          </div>
          {/* Row 2: Location + Amenities + Board */}
          <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
            <span className="flex items-center gap-0.5 truncate max-w-[80px]"><MapPin className="w-2.5 h-2.5" />{loc}</span>
            {amenities.map((a: string, i: number) => <span key={i} className="bg-gray-100 px-1 py-px rounded truncate max-w-[60px]">{a}</span>)}
            {board && <span className="bg-blue-100 text-blue-700 px-1 py-px rounded font-medium">{board}</span>}
          </div>
        </div>

        {/* Price + Add */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            {totalPrice > 0 ? (<><p className="text-sm font-black text-gray-900">${Math.round(totalPrice)}</p><p className="text-[8px] text-gray-400">${Math.round(perNight)}/n</p></>) : <p className="text-[10px] text-gray-400">On request</p>}
          </div>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onAdd} className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-3.5 h-3.5" /></motion.button>
        </div>
      </div>
    </motion.div>
  );
}
