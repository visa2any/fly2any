'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HotelSearchBarProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: 'Find Your Perfect Hotel',
    destination: 'Where are you going?',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests & Rooms',
    search: 'Search Hotels',
    adults: 'Adults',
    children: 'Children',
    rooms: 'Rooms',
    done: 'Done',
    popularDestinations: 'Popular Destinations',
  },
  pt: {
    title: 'Encontre Seu Hotel Perfeito',
    destination: 'Para onde você vai?',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Hóspedes e Quartos',
    search: 'Buscar Hotéis',
    adults: 'Adultos',
    children: 'Crianças',
    rooms: 'Quartos',
    done: 'Concluído',
    popularDestinations: 'Destinos Populares',
  },
  es: {
    title: 'Encuentra Tu Hotel Perfecto',
    destination: '¿A dónde vas?',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Huéspedes y Habitaciones',
    search: 'Buscar Hoteles',
    adults: 'Adultos',
    children: 'Niños',
    rooms: 'Habitaciones',
    done: 'Listo',
    popularDestinations: 'Destinos Populares',
  },
};

const POPULAR_CITIES = [
  { name: 'New York', emoji: '🗽', lat: 40.7128, lng: -74.0060 },
  { name: 'Paris', emoji: '🗼', lat: 48.8566, lng: 2.3522 },
  { name: 'London', emoji: '🏴󐁧󐁢󐁥󐁮󐁧󐁿', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', emoji: '🗾', lat: 35.6762, lng: 139.6503 },
  { name: 'Dubai', emoji: '🏙️', lat: 25.2048, lng: 55.2708 },
  { name: 'Barcelona', emoji: '🏖️', lat: 41.3851, lng: 2.1734 },
];

export function HotelSearchBar({ lang = 'en' }: HotelSearchBarProps) {
  const router = useRouter();
  const t = translations[lang];

  // Search State
  const [destination, setDestination] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // UI State
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const destinationRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  // Set default dates (tomorrow and day after)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    setCheckIn(tomorrow.toISOString().split('T')[0]);
    setCheckOut(dayAfter.toISOString().split('T')[0]);
  }, []);

  // Fetch suggestions from API
  useEffect(() => {
    if (destinationQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/hotels/suggestions?query=${encodeURIComponent(destinationQuery)}`);
        const data = await response.json();

        if (data.success && data.data) {
          setSuggestions(data.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [destinationQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setShowGuestsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (city: any, name: string) => {
    setDestination(name);
    setDestinationQuery(name);
    setSelectedLocation({ lat: city.lat, lng: city.lng });
    setShowDestinationDropdown(false);
  };

  const handleSearch = async () => {
    if (!destination || !checkIn || !checkOut) {
      alert(lang === 'en' ? 'Please fill all required fields' :
            lang === 'pt' ? 'Por favor, preencha todos os campos obrigatórios' :
            'Por favor, complete todos los campos obligatorios');
      return;
    }

    setIsSearching(true);

    // Build search query
    const query = new URLSearchParams({
      destination: destination,
      checkIn: checkIn,
      checkOut: checkOut,
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString(),
      ...(selectedLocation && {
        lat: selectedLocation.lat.toString(),
        lng: selectedLocation.lng.toString(),
      }),
    });

    // Navigate to results page
    router.push(`/hotels/results?${query.toString()}`);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-100 p-6 md:p-8">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
          {t.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination */}
        <div ref={destinationRef} className="relative lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {t.destination}
          </label>
          <div className="relative">
            <input
              type="text"
              value={destinationQuery}
              onChange={(e) => {
                setDestinationQuery(e.target.value);
                setShowDestinationDropdown(true);
              }}
              onFocus={() => setShowDestinationDropdown(true)}
              placeholder="New York, Paris, London..."
              className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
            />
            {loadingSuggestions && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            )}
            {destinationQuery && !loadingSuggestions && (
              <button
                onClick={() => {
                  setDestinationQuery('');
                  setDestination('');
                  setSelectedLocation(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {showDestinationDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden"
              >
                {/* Suggestions from API */}
                {suggestions.length > 0 && (
                  <div className="py-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectLocation(suggestion.location, suggestion.name)}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                      >
                        <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900">{suggestion.name}</div>
                          <div className="text-sm text-gray-600">
                            {suggestion.city}, {suggestion.country}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Cities */}
                {suggestions.length === 0 && !loadingSuggestions && (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t.popularDestinations}
                    </div>
                    {POPULAR_CITIES.map((city, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectLocation(city, city.name)}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                      >
                        <span className="text-2xl">{city.emoji}</span>
                        <span className="font-semibold text-gray-900">{city.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Check-in */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            {t.checkIn}
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
          />
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            {t.checkOut}
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Guests & Rooms */}
        <div ref={guestsRef} className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            {t.guests}
          </label>
          <button
            onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:outline-none transition-colors text-left font-medium text-gray-900"
          >
            {adults} {adults === 1 ? t.adults.slice(0, -1) : t.adults}, {children} {t.children}, {rooms} {rooms === 1 ? t.rooms.slice(0, -1) : t.rooms}
          </button>

          {/* Guests Dropdown */}
          <AnimatePresence>
            {showGuestsDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-100 p-4"
              >
                {/* Adults */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">{t.adults}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">{adults}</span>
                    <button
                      onClick={() => setAdults(Math.min(20, adults + 1))}
                      className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors flex items-center justify-center font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">{t.children}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">{children}</span>
                    <button
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors flex items-center justify-center font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">{t.rooms}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">{rooms}</span>
                    <button
                      onClick={() => setRooms(Math.min(10, rooms + 1))}
                      className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors flex items-center justify-center font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuestsDropdown(false)}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-900 transition-colors"
                >
                  {t.done}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                {t.search}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
