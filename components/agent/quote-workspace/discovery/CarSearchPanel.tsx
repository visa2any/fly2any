"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Car, Loader2, Plus, MapPin, AlertCircle, Users, ChevronDown, Minus, X, Plane, Clock } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
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
  const searchLoading = state.ui.searchLoading;
  const searchResults = state.ui.searchResults;

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults(false, null);
    }
  };

  const handleAddCar = (car: any) => {
    addItem({
      type: "car",
      price: parseFloat(car.price?.total) || car.price?.amount || 0,
      currency: car.price?.currency || "USD",
      date: params.pickupDate,
      name: `${car.vehicle?.description || car.vehicle?.name || car.name || 'Car Rental'}`,
      pickupLocation: params.pickupLocation,
      dropoffLocation: params.sameDropoff ? params.pickupLocation : params.dropoffLocation,
      pickupDate: params.pickupDate,
      dropoffDate: params.dropoffDate,
      days,
      vehicleType: car.vehicle?.category || car.category || 'Standard',
      image: car.vehicle?.imageURL || car.vehicle?.image || car.image,
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

      {/* Results */}
      <AnimatePresence mode="wait">
        {!searchLoading && searchResults && searchResults.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-sm text-gray-500">{searchResults.length} cars found</p>
            {searchResults.slice(0, 10).map((car: any, idx: number) => (
              <motion.div key={car.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} className="bg-white border-2 border-gray-100 rounded-2xl p-3 hover:border-cyan-200 hover:shadow-lg transition-all group">
                <div className="flex gap-3">
                  <div className="w-20 h-16 rounded-xl bg-cyan-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {car.vehicle?.imageURL || car.vehicle?.image || car.image ? <img src={car.vehicle?.imageURL || car.vehicle?.image || car.image} alt={car.vehicle?.description || car.name} className="w-full h-full object-contain" /> : <Car className="w-8 h-8 text-cyan-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate text-sm">{car.vehicle?.description || car.vehicle?.name || car.name}</h4>
                    <p className="text-xs text-gray-500">{car.vehicle?.category || car.category}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-lg font-black text-gray-900">${car.price?.total || car.price?.amount || 0}</p>
                    <motion.button whileHover={{ scale: 1.15, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => handleAddCar(car)} className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
