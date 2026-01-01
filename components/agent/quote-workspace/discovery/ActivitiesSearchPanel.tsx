"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Compass, Loader2, Plus, MapPin, AlertCircle, Users, ChevronDown, ChevronUp, Minus, X, Star, Clock, Ticket, Edit3, Calendar } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import PremiumDatePicker from "@/components/common/PremiumDatePicker";

interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  type: 'city' | 'airport' | 'landmark' | 'neighborhood' | 'poi';
  emoji?: string;
  latitude?: number;
  longitude?: number;
}

export default function ActivitiesSearchPanel() {
  const { state, addItem, setSearchResults } = useQuoteWorkspace();
  const searchLoading = state.ui.searchLoading;
  const searchResults = state.ui.searchResults;

  const [params, setParams] = useState({
    destination: "",
    date: "",
    participants: 1,
    type: "all" as "all" | "tours" | "activities",
  });

  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [formCollapsed, setFormCollapsed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-collapse form when search results arrive
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !searchLoading) {
      const timer = setTimeout(() => setFormCollapsed(true), 500);
      return () => clearTimeout(timer);
    }
  }, [searchResults, searchLoading]);

  // Expand form when there's an error
  useEffect(() => {
    if (error) setFormCollapsed(false);
  }, [error]);

  const minDate = new Date().toISOString().split("T")[0];

  // Fetch popular destinations on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/hotels/suggestions?popular=true');
        const data = await res.json();
        if (data.success && data.data) {
          setPopularDestinations(data.data.filter((d: any) => d.type === 'city'));
        }
      } catch (err) {
        console.error('Error fetching popular destinations:', err);
      }
    };
    fetchPopular();
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (!params.destination?.trim() || params.destination.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/hotels/suggestions?query=${encodeURIComponent(params.destination)}`);
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
  }, [params.destination]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectLocation = (dest: LocationSuggestion) => {
    setParams({ ...params, destination: dest.name });
    setSelectedLocation(dest);
    setShowSuggestions(false);
  };

  const displaySuggestions = params.destination?.trim().length >= 2 ? suggestions : popularDestinations;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'airport': return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'landmark': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'neighborhood': return <MapPin className="w-4 h-4 text-green-500" />;
      case 'poi': return <Ticket className="w-4 h-4 text-purple-500" />;
      default: return <MapPin className="w-4 h-4 text-orange-500" />;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedLocation) {
      setError("Please select a destination from the suggestions");
      return;
    }

    if (!selectedLocation.latitude || !selectedLocation.longitude) {
      setError("Location coordinates not available");
      return;
    }

    setSearchResults(true, null);

    try {
      const query = new URLSearchParams({
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
        radius: "20",
        type: params.type,
      });

      const res = await fetch(`/api/activities/search?${query}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || data.message || "Search failed");

      setSearchResults(false, data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults(false, null);
    }
  };

  const handleAddActivity = (activity: any) => {
    // ActivityItem type expects: name, location, description, duration, participants, includes, image
    addItem({
      type: "activity",
      price: parseFloat(activity.price?.amount) || 0,
      currency: activity.price?.currencyCode || "USD",
      date: params.date || new Date().toISOString().split("T")[0],
      name: activity.name || "Activity",
      location: params.destination,
      participants: params.participants,
      duration: activity.duration || "Varies",
      description: activity.shortDescription || activity.description || "Experience this amazing activity",
      image: activity.pictures?.[0]?.url || null,
      includes: activity.includes || activity.inclusions || [],
      apiSource: "viator",
      apiOfferId: activity.id,
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Compass className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Find Activities & Tours</h3>
          <p className="text-[10px] text-gray-400">Search and add to quote</p>
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
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{params.destination || "Destination"}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{params.date || "Any date"}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{params.participants} pax</span>
                  </div>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => setFormCollapsed(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-emerald-600 border border-emerald-200 shadow-sm"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </motion.button>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700">{searchResults.length} activities found</span>
              <button type="button" onClick={() => setFormCollapsed(false)} className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1">
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
                className="w-full flex items-center justify-between px-3 py-2 mb-2 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-all"
              >
                <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search Form</span>
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            )}

            <form onSubmit={handleSearch} className="space-y-3">
        {/* Destination */}
        <div className="relative" ref={containerRef}>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="w-2.5 h-2.5 text-white" />
            </div>
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={params.destination}
              onChange={(e) => {
                setParams({ ...params, destination: e.target.value });
                setSelectedLocation(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="City or attraction"
              className={`w-full pl-10 pr-8 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                showSuggestions ? "border-emerald-400 ring-4 ring-emerald-100" : "border-gray-200 hover:border-gray-300"
              }`}
            />
            {loadingSuggestions && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
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
                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                  {displaySuggestions.map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handleSelectLocation(dest)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-50 text-left transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getTypeIcon(dest.type)}
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

        {/* Date & Participants */}
        <div className="grid grid-cols-2 gap-2">
          <PremiumDatePicker
            label="Activity Date"
            value={params.date}
            onChange={(date) => setParams({ ...params, date })}
            minDate={minDate}
            placeholder="Select date"
          />

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <Users className="w-3 h-3" /> Participants
            </label>
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setParams({ ...params, participants: Math.max(1, params.participants - 1) })}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </motion.button>
              <span className="w-8 text-center font-bold text-gray-900">{params.participants}</span>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setParams({ ...params, participants: Math.min(20, params.participants + 1) })}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Activity Type Filter */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <Ticket className="w-3 h-3" /> Type
          </label>
          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "tours", label: "Tours" },
              { value: "activities", label: "Activities" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setParams({ ...params, type: option.value as any })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  params.type === option.value
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
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
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
        >
          {searchLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" /> Search Activities
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
            <p className="text-sm text-gray-500">{searchResults.length} activities found</p>
            {searchResults.slice(0, 10).map((activity: any, idx: number) => (
              <motion.div
                key={activity.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white border-2 border-gray-100 rounded-2xl p-3 hover:border-emerald-200 hover:shadow-lg transition-all group"
              >
                <div className="flex gap-3">
                  <div className="w-20 h-16 rounded-xl bg-emerald-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {activity.pictures?.[0]?.url ? (
                      <img
                        src={activity.pictures[0].url}
                        alt={activity.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Compass className="w-8 h-8 text-emerald-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate text-sm">{activity.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {activity.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">{activity.rating}</span>
                        </div>
                      )}
                      {activity.categories?.[0] && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          {activity.categories[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-lg font-black text-gray-900">
                      ${activity.price?.amount || 0}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddActivity(activity)}
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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
