"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Car, Loader2, Plus, MapPin, AlertCircle, Users, ChevronDown, ChevronUp, Minus, X, Plane, Clock, Edit3, Calendar, Sparkles } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import { useUnifiedSearchSafe } from "../unified-search/index";
import PremiumDatePicker from "@/components/common/PremiumDatePicker";

interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  type: 'city' | 'airport';
  emoji?: string;
}

export default function CarSearchPanel() {
  const { state, addItem, setSearchResults } = useQuoteWorkspace();

  // ═══ UNIFIED SEARCH RESULTS ═══
  const unifiedContext = useUnifiedSearchSafe();
  const unifiedCarResults = unifiedContext?.products?.cars?.results;
  const unifiedCarStatus = unifiedContext?.products?.cars?.status;
  const hasUnifiedResults = unifiedCarResults && unifiedCarResults.length > 0;

  // Use unified results if available, otherwise use local search results
  const searchLoading = state.ui.searchLoading || unifiedCarStatus === "loading";
  const searchResults = hasUnifiedResults ? unifiedCarResults : state.ui.searchResults;

  const [params, setParams] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    dropoffDate: "",
    pickupTime: "10:00",
    dropoffTime: "10:00",
    sameDropoff: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff' | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);

  // Filter & pagination state
  const [sortBy, setSortBy] = useState<'price' | 'size' | 'name'>('price');
  const [filterCategory, setFilterCategory] = useState<'all' | 'economy' | 'compact' | 'midsize' | 'suv' | 'luxury'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  // ═══ SYNC FROM TRIP CONTEXT ═══
  useEffect(() => {
    setParams(prev => ({
      ...prev,
      pickupLocation: state.destination || prev.pickupLocation,
      dropoffLocation: prev.sameDropoff ? (state.destination || prev.pickupLocation) : prev.dropoffLocation,
      pickupDate: state.startDate || prev.pickupDate,
      dropoffDate: state.endDate || prev.dropoffDate,
    }));
  }, [state.destination, state.startDate, state.endDate]);
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
    if (hasUnifiedResults && unifiedContext?.hasNewResults?.cars) {
      unifiedContext.markResultsSeen("cars");
    }
  }, [hasUnifiedResults, unifiedContext]);

  // Expand form when there's an error
  useEffect(() => {
    if (error) setFormCollapsed(false);
  }, [error]);

  const pickupRef = useRef<HTMLDivElement>(null);
  const dropoffRef = useRef<HTMLDivElement>(null);

  const days = params.pickupDate && params.dropoffDate
    ? Math.max(1, Math.ceil((new Date(params.dropoffDate).getTime() - new Date(params.pickupDate).getTime()) / 86400000))
    : 0;

  const minDate = new Date().toISOString().split("T")[0];

  // Fetch popular destinations on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/hotels/suggestions?popular=true');
        const data = await res.json();
        if (data.success && data.data) {
          setPopularDestinations(data.data.filter((d: any) => d.type === 'city' || d.type === 'airport'));
        }
      } catch (err) {
        console.error('Error fetching popular destinations:', err);
      }
    };
    fetchPopular();
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const query = activeField === 'pickup' ? params.pickupLocation : params.dropoffLocation;
    if (!query?.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/hotels/suggestions?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSuggestions(data.data.filter((d: any) => d.type === 'city' || d.type === 'airport'));
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [params.pickupLocation, params.dropoffLocation, activeField]);

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

  const handleSelectLocation = (dest: LocationSuggestion, field: 'pickup' | 'dropoff') => {
    if (field === 'pickup') {
      setParams({ ...params, pickupLocation: dest.name, dropoffLocation: params.sameDropoff ? dest.name : params.dropoffLocation });
      setShowPickupSuggestions(false);
    } else {
      setParams({ ...params, dropoffLocation: dest.name });
      setShowDropoffSuggestions(false);
    }
  };

  const displaySuggestions = (activeField === 'pickup' ? params.pickupLocation : params.dropoffLocation)?.trim().length >= 2
    ? suggestions
    : popularDestinations;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!params.pickupLocation || !params.pickupDate || !params.dropoffDate) {
      setError("Please fill in all required fields");
      return;
    }
    setSearchResults(true, null);
    try {
      const query = new URLSearchParams({
        pickupLocation: params.pickupLocation,
        dropoffLocation: params.sameDropoff ? params.pickupLocation : params.dropoffLocation,
        pickupDate: params.pickupDate,
        dropoffDate: params.dropoffDate,
        pickupTime: params.pickupTime,
        dropoffTime: params.dropoffTime,
      });
      const res = await fetch(`/api/cars?${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setSearchResults(false, data.data || data.cars || data.results || []);
      setVisibleCount(10); // Reset pagination on new search
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults(false, null);
    }
  };

  const handleAddCar = (car: any) => {
    // Handle both Amadeus API format and featured cars format
    // CarItem type expects: company, carType, carClass, features, image
    const carCompany = car.vehicle?.company || car.company || car.provider || 'Car Rental';
    const carTypeValue = car.vehicle?.description || car.model || car.name || 'Vehicle';
    const carClass = car.vehicle?.category || car.type || car.category || 'Standard';
    const carPrice = parseFloat(car.price?.total) || car.price?.amount || car.pricePerDay || 0;
    const carImage = car.vehicle?.imageURL || car.vehicle?.image || car.photoUrl || car.image;
    const carFeatures = car.features || car.vehicle?.features || [];

    addItem({
      type: "car",
      price: carPrice,
      currency: "USD", // Force USD
      date: params.pickupDate,
      company: carCompany,
      carType: carTypeValue,
      carClass: carClass,
      pickupLocation: params.pickupLocation,
      dropoffLocation: params.sameDropoff ? params.pickupLocation : params.dropoffLocation,
      pickupDate: params.pickupDate,
      dropoffDate: params.dropoffDate,
      days,
      features: carFeatures,
      image: carImage,
      apiSource: "cars",
      apiOfferId: car.id,
    });
  };

  return (
    <div className="p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
          <Car className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-900">Find Car Rentals</h3>
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
            className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-100 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <Car className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{params.pickupLocation || "Location"}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{params.pickupDate} → {params.dropoffDate}</span>
                    <span>{days} days</span>
                  </div>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => setFormCollapsed(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-cyan-600 border border-cyan-200 shadow-sm"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </motion.button>
            </div>
            <div className="mt-2 pt-2 border-t border-cyan-100 flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-700">{searchResults.length} cars found</span>
              <button type="button" onClick={() => setFormCollapsed(false)} className="text-xs text-gray-500 hover:text-cyan-600 flex items-center gap-1">
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
                className="w-full flex items-center justify-between px-3 py-2 mb-2 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-cyan-50 border border-gray-200 hover:border-cyan-200 transition-all"
              >
                <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search Form</span>
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            )}

            <form onSubmit={handleSearch} className="space-y-2">
        {/* Pickup Location */}
        <div className="relative" ref={pickupRef}>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <MapPin className="w-2.5 h-2.5 text-white" />
            </div>
            Pickup Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={params.pickupLocation}
              onChange={(e) => { setParams({ ...params, pickupLocation: e.target.value }); setActiveField('pickup'); }}
              onFocus={() => { setShowPickupSuggestions(true); setActiveField('pickup'); }}
              placeholder="Airport or city"
              className={`w-full pl-10 pr-8 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${showPickupSuggestions ? "border-cyan-400 ring-4 ring-cyan-100" : "border-gray-200 hover:border-gray-300"}`}
            />
            {loadingSuggestions && activeField === 'pickup' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />}
          </div>

          <AnimatePresence>
            {showPickupSuggestions && displaySuggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                  {displaySuggestions.map((dest) => (
                    <button key={dest.id} type="button" onClick={() => handleSelectLocation(dest, 'pickup')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-cyan-50 text-left transition-all">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {dest.type === 'airport' ? <Plane className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{dest.name}</p>
                        <p className="text-xs text-gray-500">{dest.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Same Dropoff Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={params.sameDropoff} onChange={(e) => setParams({ ...params, sameDropoff: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
          <span className="text-xs font-medium text-gray-600">Return to same location</span>
        </label>

        {/* Dropoff Location (if different) */}
        {!params.sameDropoff && (
          <div className="relative" ref={dropoffRef}>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <MapPin className="w-2.5 h-2.5 text-white" />
              </div>
              Dropoff Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={params.dropoffLocation}
                onChange={(e) => { setParams({ ...params, dropoffLocation: e.target.value }); setActiveField('dropoff'); }}
                onFocus={() => { setShowDropoffSuggestions(true); setActiveField('dropoff'); }}
                placeholder="Airport or city"
                className={`w-full pl-10 pr-8 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${showDropoffSuggestions ? "border-cyan-400 ring-4 ring-cyan-100" : "border-gray-200 hover:border-gray-300"}`}
              />
            </div>

            <AnimatePresence>
              {showDropoffSuggestions && displaySuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                    {displaySuggestions.map((dest) => (
                      <button key={dest.id} type="button" onClick={() => handleSelectLocation(dest, 'dropoff')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-cyan-50 text-left transition-all">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          {dest.type === 'airport' ? <Plane className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{dest.name}</p>
                          <p className="text-xs text-gray-500">{dest.country}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <PremiumDatePicker label="Pickup Date" value={params.pickupDate} onChange={(date) => setParams({ ...params, pickupDate: date })} minDate={minDate} placeholder="Pickup" />
          <PremiumDatePicker label="Dropoff Date" value={params.dropoffDate} onChange={(date) => setParams({ ...params, dropoffDate: date })} minDate={params.pickupDate || minDate} placeholder="Dropoff" />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <Clock className="w-3 h-3" /> Pickup Time
            </label>
            <input type="time" value={params.pickupTime} onChange={(e) => setParams({ ...params, pickupTime: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <Clock className="w-3 h-3" /> Dropoff Time
            </label>
            <input type="time" value={params.dropoffTime} onChange={(e) => setParams({ ...params, dropoffTime: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium" />
          </div>
        </div>

        {days > 0 && <div className="text-center text-sm text-cyan-600 font-bold">{days} day{days > 1 ? "s" : ""}</div>}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}

        <motion.button type="submit" disabled={searchLoading} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50">
          {searchLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</> : <><Search className="w-5 h-5" /> Search Cars</>}
        </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {!searchLoading && searchResults && searchResults.length > 0 && (() => {
          // Filter & sort logic
          const getCarCategory = (car: any) => {
            const cat = (car.vehicle?.category || car.type || car.category || '').toLowerCase();
            if (cat.includes('economy') || cat.includes('mini')) return 'economy';
            if (cat.includes('compact')) return 'compact';
            if (cat.includes('midsize') || cat.includes('mid-size') || cat.includes('intermediate')) return 'midsize';
            if (cat.includes('suv') || cat.includes('crossover') || cat.includes('4x4')) return 'suv';
            if (cat.includes('luxury') || cat.includes('premium') || cat.includes('fullsize')) return 'luxury';
            return 'compact';
          };
          const getCarPrice = (car: any) => parseFloat(car.price?.total) || car.price?.amount || car.pricePerDay || 0;
          const getCarName = (car: any) => car.vehicle?.description || car.vehicle?.name || car.model || car.name || '';
          const getCarSize = (car: any) => {
            const cat = getCarCategory(car);
            return { economy: 1, compact: 2, midsize: 3, suv: 4, luxury: 5 }[cat] || 2;
          };

          const filtered = filterCategory === 'all' ? searchResults : searchResults.filter((car: any) => getCarCategory(car) === filterCategory);
          const sorted = [...filtered].sort((a: any, b: any) => {
            if (sortBy === 'price') return getCarPrice(a) - getCarPrice(b);
            if (sortBy === 'size') return getCarSize(a) - getCarSize(b);
            return getCarName(a).localeCompare(getCarName(b));
          });
          const visible = sorted.slice(0, visibleCount);
          const remaining = sorted.length - visibleCount;

          return (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {/* Unified Search Banner */}
              {hasUnifiedResults && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl"
                >
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-medium text-cyan-700">Pre-loaded from your flight search</span>
                </motion.div>
              )}
              {/* Sticky Filter Bar */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">{filtered.length} car{filtered.length !== 1 ? 's' : ''}</span>
                  <div className="flex gap-1">
                    {(['price', 'size', 'name'] as const).map((s) => (
                      <button key={s} type="button" onClick={() => setSortBy(s)} className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${sortBy === s ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(['all', 'economy', 'compact', 'midsize', 'suv', 'luxury'] as const).map((f) => (
                    <button key={f} type="button" onClick={() => { setFilterCategory(f); setVisibleCount(10); }} className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${filterCategory === f ? 'bg-cyan-100 text-cyan-700 border border-cyan-300' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Car Cards */}
              {visible.map((car: any, idx: number) => (
                <motion.div key={car.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} className="bg-white border-2 border-gray-100 rounded-2xl p-3 hover:border-cyan-200 hover:shadow-lg transition-all group">
                  <div className="flex gap-3">
                    <div className="w-20 h-16 rounded-xl bg-cyan-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {car.vehicle?.imageURL || car.vehicle?.image || car.photoUrl || car.image ? <img src={car.vehicle?.imageURL || car.vehicle?.image || car.photoUrl || car.image} alt={getCarName(car)} className="w-full h-full object-contain" /> : <Car className="w-8 h-8 text-cyan-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate text-sm">{getCarName(car) || 'Car Rental'}</h4>
                      <p className="text-xs text-gray-500">{car.vehicle?.category || car.type || car.category || 'Standard'}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-lg font-black text-gray-900">${getCarPrice(car)}</p>
                      <motion.button whileHover={{ scale: 1.15, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => handleAddCar(car)} className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Load More Button */}
              {remaining > 0 && (
                <motion.button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 10)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-gray-100 hover:bg-cyan-50 text-gray-700 hover:text-cyan-700 font-semibold text-sm rounded-xl border border-gray-200 hover:border-cyan-200 transition-all"
                >
                  Load More ({remaining} remaining)
                </motion.button>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
