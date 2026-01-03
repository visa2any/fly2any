"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bus, Loader2, Plus, MapPin, AlertCircle, Users, ChevronDown, ChevronUp, Minus, X, Plane, Clock, Car, Star, Edit3, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import { useUnifiedSearchSafe } from "../unified-search/index";
import PremiumDatePicker from "@/components/common/PremiumDatePicker";

interface TransferLocation {
  id: string;
  name: string;
  displayName: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  type: 'airport' | 'city' | 'hotel' | 'landmark' | 'area' | 'venue';
  emoji?: string;
  code?: string;
}

export default function TransfersSearchPanel() {
  const { state, addItem, setSearchResults } = useQuoteWorkspace();

  // ═══ UNIFIED SEARCH RESULTS ═══
  const unifiedContext = useUnifiedSearchSafe();
  const unifiedTransferResults = unifiedContext?.products?.transfers?.results;
  const unifiedTransferStatus = unifiedContext?.products?.transfers?.status;
  const hasUnifiedResults = unifiedTransferResults && unifiedTransferResults.length > 0;

  // Use unified results if available, otherwise use local search results
  const searchLoading = state.ui.searchLoading || unifiedTransferStatus === "loading";
  const searchResults = hasUnifiedResults ? unifiedTransferResults : state.ui.searchResults;

  const [params, setParams] = useState({
    pickup: "",
    dropoff: "",
    date: "",
    time: "10:00",
    passengers: 1,
  });

  const [selectedPickup, setSelectedPickup] = useState<TransferLocation | null>(null);
  const [selectedDropoff, setSelectedDropoff] = useState<TransferLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<TransferLocation[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<TransferLocation[]>([]);
  const [popularLocations, setPopularLocations] = useState<TransferLocation[]>([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDropoff, setLoadingDropoff] = useState(false);
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff' | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'capacity' | 'name'>('price');
  const [filterType, setFilterType] = useState<'all' | 'private' | 'shared'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  const pickupRef = useRef<HTMLDivElement>(null);
  const dropoffRef = useRef<HTMLDivElement>(null);

  // ═══ SYNC FROM TRIP CONTEXT ═══
  useEffect(() => {
    setParams(prev => ({
      ...prev,
      dropoff: state.destination || prev.dropoff,
      date: state.startDate || prev.date,
      passengers: state.travelers?.total || prev.passengers,
    }));
  }, [state.destination, state.startDate, state.travelers]);
  // ═══ END SYNC ═══

  // Auto-collapse form when search results arrive
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !searchLoading) {
      const timer = setTimeout(() => setFormCollapsed(true), 500);
      return () => clearTimeout(timer);
    }
  }, [searchResults, searchLoading]);

  // Mark unified results as seen when this tab is viewed
  useEffect(() => {
    if (hasUnifiedResults && unifiedContext?.hasNewResults?.transfers) {
      unifiedContext.markResultsSeen("transfers");
    }
  }, [hasUnifiedResults, unifiedContext]);

  // Expand form when there's an error
  useEffect(() => {
    if (error) setFormCollapsed(false);
  }, [error]);

  const minDate = new Date().toISOString().split("T")[0];

  // Fetch popular locations on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/transfers/locations');
        const data = await res.json();
        if (data.success && data.data) {
          setPopularLocations(data.data);
        }
      } catch (err) {
        console.error('Error fetching popular locations:', err);
      }
    };
    fetchPopular();
  }, []);

  // Fetch pickup suggestions as user types
  useEffect(() => {
    if (!params.pickup?.trim() || params.pickup.length < 2) {
      setPickupSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingPickup(true);
      try {
        const res = await fetch(`/api/transfers/locations?query=${encodeURIComponent(params.pickup)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setPickupSuggestions(data.data);
        }
      } catch (err) {
        console.error('Error fetching pickup suggestions:', err);
      } finally {
        setLoadingPickup(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [params.pickup]);

  // Fetch dropoff suggestions as user types
  useEffect(() => {
    if (!params.dropoff?.trim() || params.dropoff.length < 2) {
      setDropoffSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingDropoff(true);
      try {
        const res = await fetch(`/api/transfers/locations?query=${encodeURIComponent(params.dropoff)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setDropoffSuggestions(data.data);
        }
      } catch (err) {
        console.error('Error fetching dropoff suggestions:', err);
      } finally {
        setLoadingDropoff(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [params.dropoff]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (pickupRef.current && !pickupRef.current.contains(target)) setShowPickupSuggestions(false);
      if (dropoffRef.current && !dropoffRef.current.contains(target)) setShowDropoffSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectPickup = (loc: TransferLocation) => {
    setParams({ ...params, pickup: loc.displayName || loc.name });
    setSelectedPickup(loc);
    setShowPickupSuggestions(false);
  };

  const handleSelectDropoff = (loc: TransferLocation) => {
    setParams({ ...params, dropoff: loc.displayName || loc.name });
    setSelectedDropoff(loc);
    setShowDropoffSuggestions(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'airport': return <Plane className="w-4 h-4 text-blue-500" />;
      case 'hotel': return <MapPin className="w-4 h-4 text-purple-500" />;
      case 'landmark': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'area': return <MapPin className="w-4 h-4 text-green-500" />;
      default: return <MapPin className="w-4 h-4 text-orange-500" />;
    }
  };

  const displayPickupSuggestions = params.pickup?.trim().length >= 2 ? pickupSuggestions : popularLocations;
  const displayDropoffSuggestions = params.dropoff?.trim().length >= 2 ? dropoffSuggestions : popularLocations;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPickup || !selectedDropoff) {
      setError("Please select pickup and drop-off locations from suggestions");
      return;
    }

    if (!params.date) {
      setError("Please select a transfer date");
      return;
    }

    setSearchResults(true, null);
    setVisibleCount(10);

    try {
      const query = new URLSearchParams({
        pickup: selectedPickup.code || selectedPickup.displayName || selectedPickup.name,
        dropoff: selectedDropoff.code || selectedDropoff.displayName || selectedDropoff.name,
        date: params.date,
        time: params.time,
        passengers: params.passengers.toString(),
      });

      // Add GPS coordinates if available
      if (selectedPickup.latitude && selectedPickup.longitude) {
        query.append('pickupLat', selectedPickup.latitude.toString());
        query.append('pickupLng', selectedPickup.longitude.toString());
      }
      if (selectedDropoff.latitude && selectedDropoff.longitude) {
        query.append('dropoffLat', selectedDropoff.latitude.toString());
        query.append('dropoffLng', selectedDropoff.longitude.toString());
        query.append('dropoffCity', selectedDropoff.city);
        query.append('dropoffCountry', selectedDropoff.countryCode);
      }

      const res = await fetch(`/api/transfers/search?${query}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || data.message || "Search failed");

      setSearchResults(false, data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults(false, null);
    }
  };

  const handleAddTransfer = (transfer: any) => {
    // TransferItem type expects: provider, vehicleType, pickupLocation, dropoffLocation, pickupTime, passengers, meetAndGreet
    // Note: transfer.provider can be an object with {name, code, logoUrl, rating, termsUrl} from the API
    const providerName = typeof transfer.provider === 'object'
      ? transfer.provider?.name
      : transfer.provider;

    addItem({
      type: "transfer",
      price: parseFloat(transfer.price?.amount) || 0,
      currency: "USD", // Force USD
      date: params.date,
      provider: providerName || transfer.supplier || transfer.name || "Transfer Service",
      pickupLocation: params.pickup,
      dropoffLocation: params.dropoff,
      pickupTime: params.time,
      passengers: params.passengers,
      vehicleType: transfer.vehicle?.name || transfer.transferType || "Private Transfer",
      meetAndGreet: transfer.meetAndGreet ?? false,
      apiSource: "viator",
      apiOfferId: transfer.offerId || transfer.id,
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
          <Bus className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Find Transfers</h3>
          <p className="text-[10px] text-gray-400">Airport pickups & drop-offs</p>
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
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                  <Bus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span className="truncate">{params.pickup || "Pickup"}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{params.dropoff || "Dropoff"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{params.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{params.time}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{params.passengers} pax</span>
                  </div>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => setFormCollapsed(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-amber-600 border border-amber-200 shadow-sm"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </motion.button>
            </div>
            <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700">{searchResults.length} transfers found</span>
              <button type="button" onClick={() => setFormCollapsed(false)} className="text-xs text-gray-500 hover:text-amber-600 flex items-center gap-1">
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
                className="w-full flex items-center justify-between px-3 py-2 mb-2 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 transition-all"
              >
                <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search Form</span>
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            )}

            <form onSubmit={handleSearch} className="space-y-3">
        {/* Pickup Location */}
        <div className="relative" ref={pickupRef}>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <MapPin className="w-2.5 h-2.5 text-white" />
            </div>
            Pickup Location
          </label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={params.pickup}
              onChange={(e) => {
                setParams({ ...params, pickup: e.target.value });
                setSelectedPickup(null);
              }}
              onFocus={() => { setShowPickupSuggestions(true); setActiveField('pickup'); }}
              placeholder="Airport, hotel or address"
              className={`w-full pl-10 pr-8 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                showPickupSuggestions ? "border-amber-400 ring-4 ring-amber-100" : "border-gray-200 hover:border-gray-300"
              }`}
            />
            {loadingPickup && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
            )}
          </div>

          <AnimatePresence>
            {showPickupSuggestions && displayPickupSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                  {displayPickupSuggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectPickup(loc)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {loc.emoji ? <span>{loc.emoji}</span> : getTypeIcon(loc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {loc.displayName || loc.name}
                        </p>
                        <p className="text-xs text-gray-500">{loc.city}, {loc.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dropoff Location */}
        <div className="relative" ref={dropoffRef}>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <MapPin className="w-2.5 h-2.5 text-white" />
            </div>
            Drop-off Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={params.dropoff}
              onChange={(e) => {
                setParams({ ...params, dropoff: e.target.value });
                setSelectedDropoff(null);
              }}
              onFocus={() => { setShowDropoffSuggestions(true); setActiveField('dropoff'); }}
              placeholder="Hotel, address or landmark"
              className={`w-full pl-10 pr-8 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                showDropoffSuggestions ? "border-amber-400 ring-4 ring-amber-100" : "border-gray-200 hover:border-gray-300"
              }`}
            />
            {loadingDropoff && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
            )}
          </div>

          <AnimatePresence>
            {showDropoffSuggestions && displayDropoffSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                  {displayDropoffSuggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectDropoff(loc)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {loc.emoji ? <span>{loc.emoji}</span> : getTypeIcon(loc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {loc.displayName || loc.name}
                        </p>
                        <p className="text-xs text-gray-500">{loc.city}, {loc.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2">
          <PremiumDatePicker
            label="Transfer Date"
            value={params.date}
            onChange={(date) => setParams({ ...params, date })}
            minDate={minDate}
            placeholder="Select date"
          />
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <Clock className="w-3 h-3" /> Pickup Time
            </label>
            <input
              type="time"
              value={params.time}
              onChange={(e) => setParams({ ...params, time: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
            />
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <Users className="w-3 h-3" /> Passengers
          </label>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setParams({ ...params, passengers: Math.max(1, params.passengers - 1) })}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </motion.button>
            <span className="w-8 text-center font-bold text-gray-900">{params.passengers}</span>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setParams({ ...params, passengers: Math.min(20, params.passengers + 1) })}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
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
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
        >
          {searchLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" /> Search Transfers
            </>
          )}
        </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {!searchLoading && searchResults && searchResults.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Unified Search Banner */}
            {hasUnifiedResults && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-700">Pre-loaded from your flight search</span>
              </motion.div>
            )}
            {/* Sticky Filter Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl p-2 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">{searchResults.filter((t: any) => filterType === 'all' || (filterType === 'private' ? t.transferType?.toLowerCase().includes('private') : t.transferType?.toLowerCase().includes('shared'))).length} transfers</span>
                <div className="flex gap-1">
                  {(['price', 'capacity', 'name'] as const).map((s) => (
                    <button key={s} onClick={() => setSortBy(s)} className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${sortBy === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s === 'price' ? 'Price' : s === 'capacity' ? 'Capacity' : 'Name'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                {(['all', 'private', 'shared'] as const).map((f) => (
                  <button key={f} onClick={() => { setFilterType(f); setVisibleCount(10); }} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all ${filterType === f ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {f === 'all' ? 'All' : f === 'private' ? 'Private' : 'Shared'}
                  </button>
                ))}
              </div>
            </div>
            {(() => {
              const filtered = searchResults.filter((t: any) => filterType === 'all' || (filterType === 'private' ? t.transferType?.toLowerCase().includes('private') : t.transferType?.toLowerCase().includes('shared')));
              const sorted = [...filtered].sort((a: any, b: any) => {
                if (sortBy === 'price') return (parseFloat(a.price?.amount) || 0) - (parseFloat(b.price?.amount) || 0);
                if (sortBy === 'capacity') return (b.maxPassengers || 0) - (a.maxPassengers || 0);
                return (a.name || '').localeCompare(b.name || '');
              });
              return sorted.slice(0, visibleCount);
            })().map((transfer: any, idx: number) => (
              <motion.div
                key={transfer.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white border-2 border-gray-100 rounded-2xl p-3 hover:border-amber-200 hover:shadow-lg transition-all group"
              >
                <div className="flex gap-3">
                  <div className="w-20 h-16 rounded-xl bg-amber-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {transfer.vehicle?.imageURL ? (
                      <img
                        src={transfer.vehicle.imageURL}
                        alt={transfer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Car className="w-8 h-8 text-amber-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate text-sm">{transfer.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {transfer.icon && <span className="text-sm">{transfer.icon}</span>}
                      <span className="text-xs text-gray-500">{transfer.transferType}</span>
                      {transfer.duration && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {transfer.duration}
                        </span>
                      )}
                      {transfer.maxPassengers && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {transfer.maxPassengers}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-lg font-black text-gray-900">
                      ${transfer.price?.amount || 0}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddTransfer(transfer)}
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                {/* Features */}
                {transfer.features && transfer.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {transfer.features.slice(0, 3).map((feature: string, i: number) => (
                      <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
            {/* Load More */}
            {(() => {
              const filtered = searchResults.filter((t: any) => filterType === 'all' || (filterType === 'private' ? t.transferType?.toLowerCase().includes('private') : t.transferType?.toLowerCase().includes('shared')));
              return visibleCount < filtered.length ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVisibleCount((v) => v + 10)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700 font-semibold text-sm rounded-xl border border-gray-200 hover:border-amber-200 transition-all"
                >
                  Load More ({filtered.length - visibleCount} remaining)
                </motion.button>
              ) : null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
