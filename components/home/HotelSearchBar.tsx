'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Search, X, Loader2, Building2, Plane, Landmark, Star, Filter, ChevronDown, ChevronUp, DollarSign, Wifi, Car, Dumbbell, UtensilsCrossed, Globe, Check, Navigation, Dog, Baby, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCityData } from '@/lib/data/city-locations';

interface HotelSearchBarProps {
  lang?: 'en' | 'pt' | 'es';
}

interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  location: { lat: number; lng: number };
  type: 'city' | 'landmark' | 'airport' | 'neighborhood' | 'poi';
  placeId?: string;
  emoji?: string; // Visual icon for enhanced display
}

interface SelectedDistrict {
  id: string;
  name: string;
  location: { lat: number; lng: number };
}

// Get icon for location type
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'airport': return <Plane className="w-5 h-5 text-primary-500" />;
    case 'landmark': return <Landmark className="w-5 h-5 text-amber-600" />;
    case 'poi': return <Star className="w-5 h-5 text-purple-600" />;
    case 'neighborhood': return <Building2 className="w-5 h-5 text-green-600" />;
    default: return <MapPin className="w-5 h-5 text-orange-600" />;
  }
};

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
    childAge: 'Age',
    childAgeHint: 'Age at check-in',
    infant: 'Infant (0-2)',
    infantFree: 'Usually FREE',
    child: 'Child',
    rooms: 'Rooms',
    done: 'Done',
    popularDestinations: 'Popular Destinations',
    pets: 'Traveling with pets?',
    petFriendly: 'Pet-friendly hotels',
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
    childAge: 'Idade',
    childAgeHint: 'Idade no check-in',
    infant: 'Bebê (0-2)',
    infantFree: 'Geralmente GRÁTIS',
    child: 'Criança',
    rooms: 'Quartos',
    done: 'Concluído',
    popularDestinations: 'Destinos Populares',
    pets: 'Viajando com pets?',
    petFriendly: 'Hotéis pet-friendly',
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
    childAge: 'Edad',
    childAgeHint: 'Edad al registrarse',
    infant: 'Bebé (0-2)',
    infantFree: 'Generalmente GRATIS',
    child: 'Niño',
    rooms: 'Habitaciones',
    done: 'Listo',
    popularDestinations: 'Destinos Populares',
    pets: '¿Viaja con mascotas?',
    petFriendly: 'Hoteles pet-friendly',
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
  const [childAges, setChildAges] = useState<number[]>([]); // Array of child ages
  const [rooms, setRooms] = useState(1);
  const [petFriendly, setPetFriendly] = useState(false); // Pet-friendly filter

  // UI State
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [hotelChains, setHotelChains] = useState<Array<{ chainId: number; name: string; code?: string }>>([]);
  const [hotelTypes, setHotelTypes] = useState<Array<{ typeId: number; name: string }>>([]);
  const [facilities, setFacilities] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedChains, setSelectedChains] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedStarRating, setSelectedStarRating] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Popular Districts State
  const [popularDistricts, setPopularDistricts] = useState<Array<{ id: string; name: string; city: string; location: { lat: number; lng: number } }>>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Multi-select Districts State
  const [selectedDistricts, setSelectedDistricts] = useState<SelectedDistrict[]>([]);

  // Selected destination details for enhanced display
  const [selectedDestinationDetails, setSelectedDestinationDetails] = useState<{
    name: string;
    country: string;
    emoji?: string;
    type?: string;
  } | null>(null);

  const destinationRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set default dates (tomorrow and day after) - client-side only to prevent hydration errors
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    setCheckIn(tomorrow.toISOString().split('T')[0]);
    setCheckOut(dayAfter.toISOString().split('T')[0]);
  }, []);

  // Fetch popular destinations on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch('/api/hotels/suggestions?popular=true');
        const data = await response.json();
        if (data.success && data.data) {
          setPopularDestinations(data.data);
        }
      } catch (error) {
        console.error('Error fetching popular destinations:', error);
      }
    };
    fetchPopular();
  }, []);

  // Fetch advanced filter data (chains, types, facilities)
  useEffect(() => {
    const fetchAdvancedFiltersData = async () => {
      try {
        // Fetch all filter data in parallel
        const [chainsRes, typesRes, facilitiesRes] = await Promise.all([
          fetch('/api/hotels/chains'),
          fetch('/api/hotels/types'),
          fetch('/api/hotels/facilities'),
        ]);

        const [chainsData, typesData, facilitiesData] = await Promise.all([
          chainsRes.json(),
          typesRes.json(),
          facilitiesRes.json(),
        ]);

        if (chainsData.success && chainsData.data) {
          setHotelChains(chainsData.data);
        }
        if (typesData.success && typesData.data) {
          setHotelTypes(typesData.data);
        }
        if (facilitiesData.success && facilitiesData.data) {
          setFacilities(facilitiesData.data);
        }
      } catch (error) {
        console.error('Error fetching advanced filter data:', error);
      }
    };
    fetchAdvancedFiltersData();
  }, []);

  // Fetch popular districts when a city is selected
  useEffect(() => {
    if (!destination) {
      setPopularDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        // First try local data for instant response
        const localCityData = getCityData(destination);
        if (localCityData && localCityData.popularDistricts.length > 0) {
          const localDistricts = localCityData.popularDistricts.map((district, idx) => ({
            id: `${destination.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
            name: district,
            city: destination,
            location: localCityData.center,
          }));
          setPopularDistricts(localDistricts.slice(0, 8));
          setLoadingDistricts(false);
          return;
        }

        // Fallback to API if local data not available
        const response = await fetch(`/api/hotels/districts?city=${encodeURIComponent(destination)}`);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setPopularDistricts(data.data.slice(0, 8)); // Limit to 8 districts
        } else {
          setPopularDistricts([]);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        // Try local data as final fallback
        const localCityData = getCityData(destination);
        if (localCityData && localCityData.popularDistricts.length > 0) {
          const localDistricts = localCityData.popularDistricts.map((district, idx) => ({
            id: `${destination.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
            name: district,
            city: destination,
            location: localCityData.center,
          }));
          setPopularDistricts(localDistricts.slice(0, 8));
        } else {
          setPopularDistricts([]);
        }
      } finally {
        setLoadingDistricts(false);
      }
    };

    // Fetch immediately, no delay needed for local data
    fetchDistricts();
  }, [destination]);

  // Fetch suggestions from API
  useEffect(() => {
    if (destinationQuery.length < 2) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      setSelectedIndex(-1);
      try {
        const response = await fetch(`/api/hotels/suggestions?query=${encodeURIComponent(destinationQuery)}`);
        const data = await response.json();

        if (data.success && data.data) {
          setSuggestions(data.data.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200); // Faster debounce for better UX
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

  const handleSelectLocation = useCallback((suggestion: LocationSuggestion) => {
    // Use city name for destination (better UX - shows full city name in input)
    const fullDestinationName = suggestion.type === 'city'
      ? suggestion.name
      : `${suggestion.name}, ${suggestion.city}`;

    setDestination(fullDestinationName);
    setDestinationQuery(fullDestinationName);
    setSelectedLocation({ lat: suggestion.location.lat, lng: suggestion.location.lng });
    setShowDestinationDropdown(false);
    setSelectedIndex(-1);
    // Clear selected districts when changing destination
    setSelectedDistricts([]);
    // Store destination details for enhanced display
    setSelectedDestinationDetails({
      name: fullDestinationName,
      country: suggestion.country,
      emoji: suggestion.emoji,
      type: suggestion.type,
    });
  }, []);

  // Toggle district selection (multi-select)
  const toggleDistrictSelection = useCallback((district: { id: string; name: string; location: { lat: number; lng: number } }) => {
    setSelectedDistricts(prev => {
      const isSelected = prev.some(d => d.id === district.id);
      if (isSelected) {
        return prev.filter(d => d.id !== district.id);
      } else {
        return [...prev, { id: district.id, name: district.name, location: district.location }];
      }
    });
  }, []);

  // Clear destination and all selections
  const clearDestination = useCallback(() => {
    setDestinationQuery('');
    setDestination('');
    setSelectedLocation(null);
    setSelectedDistricts([]);
    setSelectedDestinationDetails(null);
    setPopularDistricts([]);
  }, []);

  // Keyboard navigation for suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = suggestions.length > 0 ? suggestions : popularDestinations;
    if (!showDestinationDropdown || items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          handleSelectLocation(items[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDestinationDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showDestinationDropdown, suggestions, popularDestinations, selectedIndex, handleSelectLocation]);

  const handleSearch = async () => {
    if (!destination || !checkIn || !checkOut) {
      alert(lang === 'en' ? 'Please fill all required fields' :
            lang === 'pt' ? 'Por favor, preencha todos os campos obrigatórios' :
            'Por favor, complete todos los campos obligatorios');
      return;
    }

    // SAFETY CHECK: Validate dates before search
    const today = new Date().toISOString().split('T')[0];
    if (checkIn < today) {
      alert(lang === 'en' ? 'Check-in date cannot be in the past' :
            lang === 'pt' ? 'A data de check-in não pode estar no passado' :
            'La fecha de check-in no puede estar en el pasado');
      return;
    }
    if (checkOut <= checkIn) {
      alert(lang === 'en' ? 'Check-out must be after check-in' :
            lang === 'pt' ? 'O check-out deve ser após o check-in' :
            'El check-out debe ser después del check-in');
      return;
    }

    setIsSearching(true);

    // Build search query with advanced filters
    const queryParams: Record<string, string> = {
      destination: destination,
      checkIn: checkIn,
      checkOut: checkOut,
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString(),
    };

    // Add child ages if children are present (critical for accurate pricing)
    if (children > 0 && childAges.length > 0) {
      queryParams.childAges = childAges.join(',');
    }

    // Add pet-friendly filter
    if (petFriendly) {
      queryParams.petFriendly = 'true';
    }

    // Add location coordinates if available
    if (selectedLocation) {
      queryParams.lat = selectedLocation.lat.toString();
      queryParams.lng = selectedLocation.lng.toString();
    }

    // Add selected districts if any (multi-select)
    if (selectedDistricts.length > 0) {
      queryParams.districts = selectedDistricts.map(d => d.name).join(',');
      // Use first selected district's location for more precise search
      queryParams.lat = selectedDistricts[0].location.lat.toString();
      queryParams.lng = selectedDistricts[0].location.lng.toString();
    }

    // Add advanced filters if any are selected
    if (selectedChains.length > 0) {
      queryParams.chains = selectedChains.join(',');
    }
    if (selectedTypes.length > 0) {
      queryParams.types = selectedTypes.join(',');
    }
    if (selectedStarRating.length > 0) {
      queryParams.stars = selectedStarRating.join(',');
    }
    if (selectedAmenities.length > 0) {
      queryParams.amenities = selectedAmenities.join(',');
    }
    if (minPrice) {
      queryParams.minPrice = minPrice;
    }
    if (maxPrice) {
      queryParams.maxPrice = maxPrice;
    }

    const query = new URLSearchParams(queryParams);

    // Navigate to results page
    router.push(`/hotels/results?${query.toString()}`);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-100 p-6 md:p-8"
    >
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
          {t.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Destination */}
        <div ref={destinationRef} className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {t.destination}
          </label>
          <div className="relative">
            {/* Enhanced Selected Destination Display */}
            {selectedDestinationDetails && destinationQuery === selectedDestinationDetails.name ? (
              <div
                onClick={() => {
                  setShowDestinationDropdown(true);
                  inputRef.current?.focus();
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 cursor-pointer transition-all hover:border-orange-500 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Destination Emoji or Globe Icon */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
                      {selectedDestinationDetails.emoji ? (
                        <span className="text-xl">{selectedDestinationDetails.emoji}</span>
                      ) : (
                        <Globe className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg leading-tight flex items-center gap-2">
                        {selectedDestinationDetails.name}
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {selectedDestinationDetails.country || 'Destination selected'}
                        {selectedDestinationDetails.type && (
                          <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full capitalize">
                            {selectedDestinationDetails.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDestination();
                    }}
                    className="p-2 hover:bg-orange-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                {/* Selected Districts Display */}
                {selectedDistricts.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-orange-200 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">Areas:</span>
                    {selectedDistricts.map(district => (
                      <span
                        key={district.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-semibold text-orange-700 border border-orange-200"
                      >
                        <MapPin className="w-3 h-3" />
                        {district.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDistrictSelection(district);
                          }}
                          className="ml-0.5 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={destinationQuery}
                  onChange={(e) => {
                    setDestinationQuery(e.target.value);
                    setShowDestinationDropdown(true);
                    if (selectedDestinationDetails && e.target.value !== selectedDestinationDetails.name) {
                      setSelectedDestinationDetails(null);
                    }
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="New York, Paris, London..."
                  autoComplete="off"
                  className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                />
                {loadingSuggestions && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {destinationQuery && !loadingSuggestions && (
                  <button
                    onClick={clearDestination}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {showDestinationDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto"
              >
                {/* Suggestions from API */}
                {suggestions.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Destinations
                    </div>
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={suggestion.id || idx}
                        onClick={() => handleSelectLocation(suggestion)}
                        className={`w-full px-4 py-3 transition-colors flex items-center gap-3 text-left ${
                          selectedIndex === idx ? 'bg-orange-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Emoji Display - Large and Prominent */}
                        {suggestion.emoji && (
                          <span className="text-3xl flex-shrink-0" aria-hidden="true">
                            {suggestion.emoji}
                          </span>
                        )}

                        {/* Type Icon - Small, only if no emoji */}
                        {!suggestion.emoji && getTypeIcon(suggestion.type)}

                        {/* Location Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
                            {suggestion.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {suggestion.city !== suggestion.name ? `${suggestion.city}, ` : ''}{suggestion.country}
                          </div>
                        </div>

                        {/* Type Badge */}
                        <span className="text-xs text-gray-400 capitalize flex-shrink-0 flex items-center gap-1">
                          {!suggestion.emoji && <span>•</span>}
                          {suggestion.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Destinations - Horizontal scrolling pills */}
                {suggestions.length === 0 && !loadingSuggestions && popularDestinations.length > 0 && (
                  <div className="py-1.5">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {t.popularDestinations}
                    </div>
                    <div className="flex gap-1.5 px-3 overflow-x-auto scrollbar-hide">
                      {popularDestinations.map((dest, idx) => (
                        <button
                          key={dest.id || idx}
                          onClick={() => handleSelectLocation(dest)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                            selectedIndex === idx
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700'
                          }`}
                        >
                          {dest.emoji && <span className="text-sm">{dest.emoji}</span>}
                          {dest.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback Popular Cities - Horizontal scrolling pills */}
                {suggestions.length === 0 && !loadingSuggestions && popularDestinations.length === 0 && (
                  <div className="py-1.5">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                      {t.popularDestinations}
                    </div>
                    <div className="flex gap-1.5 px-3 overflow-x-auto scrollbar-hide">
                      {POPULAR_CITIES.map((city, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectLocation({
                            id: `popular-${idx}`,
                            name: city.name,
                            city: city.name,
                            country: '',
                            location: { lat: city.lat, lng: city.lng },
                            type: 'city'
                          })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                            selectedIndex === idx
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700'
                          }`}
                        >
                          <span className="text-sm">{city.emoji}</span>
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Date Range Picker - Premium Calendar Experience */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            {t.checkIn} - {t.checkOut}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder={t.checkIn}
            />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder={t.checkOut}
            />
          </div>
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
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900">{t.children}</span>
                      <p className="text-xs text-gray-500">{t.childAgeHint}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newCount = Math.max(0, children - 1);
                          setChildren(newCount);
                          setChildAges(prev => prev.slice(0, newCount));
                        }}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold text-gray-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900">{children}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newCount = Math.min(10, children + 1);
                          setChildren(newCount);
                          setChildAges(prev => [...prev, 8]); // Default age 8
                        }}
                        className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors flex items-center justify-center font-bold text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Child Age Selectors */}
                  {children > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        <Info className="w-3.5 h-3.5" />
                        <span>{t.infant}: {t.infantFree}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: children }).map((_, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center gap-1.5">
                              {(childAges[idx] ?? 8) <= 2 ? (
                                <Baby className="w-4 h-4 text-pink-500" />
                              ) : (
                                <Users className="w-4 h-4 text-info-500" />
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                {t.child} {idx + 1}
                              </span>
                            </div>
                            <select
                              value={childAges[idx] ?? 8}
                              onChange={(e) => {
                                const newAges = [...childAges];
                                newAges[idx] = parseInt(e.target.value);
                                setChildAges(newAges);
                              }}
                              className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 focus:border-orange-500 focus:outline-none bg-white"
                            >
                              <option value={0}>0 {lang === 'en' ? 'yr' : lang === 'pt' ? 'ano' : 'año'}</option>
                              <option value={1}>1 {lang === 'en' ? 'yr' : lang === 'pt' ? 'ano' : 'año'}</option>
                              <option value={2}>2 {lang === 'en' ? 'yrs' : lang === 'pt' ? 'anos' : 'años'}</option>
                              {[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(age => (
                                <option key={age} value={age}>{age} {lang === 'en' ? 'yrs' : lang === 'pt' ? 'anos' : 'años'}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      {/* Show infant count if any */}
                      {childAges.filter(age => age <= 2).length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {childAges.filter(age => age <= 2).length} {lang === 'en' ? 'infant(s) - usually stay FREE!' : lang === 'pt' ? 'bebê(s) - geralmente ficam GRÁTIS!' : 'bebé(s) - generalmente gratis!'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pet-Friendly Toggle */}
                <div className="flex items-center justify-between mb-4 py-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Dog className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="font-semibold text-gray-900">{t.pets}</span>
                      <p className="text-xs text-gray-500">{t.petFriendly}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPetFriendly(!petFriendly)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      petFriendly ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        petFriendly ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
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
            type="submit"
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

      {/* 📍 POPULAR AREAS - Dedicated Row Below All Fields (Multi-Select) */}
      <AnimatePresence>
        {popularDistricts.length > 0 && destination && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-slate-50 via-orange-50/30 to-amber-50/30 rounded-xl border border-orange-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Popular Areas in {destination}
                  </span>
                  <span className="text-xs text-gray-400">(select multiple)</span>
                </div>
                {selectedDistricts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDistricts([])}
                    className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable Districts */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {loadingDistricts ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Loading areas...</span>
                  </div>
                ) : (
                  <>
                    {popularDistricts.map((district) => {
                      const isSelected = selectedDistricts.some(d => d.id === district.id);
                      return (
                        <button
                          key={district.id}
                          type="button"
                          onClick={() => toggleDistrictSelection(district)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105'
                              : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-700 border border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5" />
                          )}
                          {district.name}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Selected Districts Summary */}
              {selectedDistricts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-orange-200/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {selectedDistricts.length} area{selectedDistricts.length > 1 ? 's' : ''} selected:
                    </span>
                    {selectedDistricts.map(d => (
                      <span key={d.id} className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Toggle */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            console.log('Advanced Filters clicked! Current state:', showAdvancedFilters);
            setShowAdvancedFilters(!showAdvancedFilters);
            console.log('Advanced Filters new state will be:', !showAdvancedFilters);
          }}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Advanced Filters</span>
          {showAdvancedFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {(selectedChains.length > 0 || selectedTypes.length > 0 || selectedStarRating.length > 0 || selectedAmenities.length > 0 || minPrice || maxPrice) && (
            <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
              {[
                selectedChains.length,
                selectedTypes.length,
                selectedStarRating.length,
                selectedAmenities.length,
                minPrice ? 1 : 0,
                maxPrice ? 1 : 0
              ].reduce((a, b) => a + b, 0)} active
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Star className="w-4 h-4 inline mr-1" />
                  Star Rating
                </label>
                <div className="flex flex-wrap gap-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => {
                        if (selectedStarRating.includes(stars)) {
                          setSelectedStarRating(selectedStarRating.filter(s => s !== stars));
                        } else {
                          setSelectedStarRating([...selectedStarRating, stars]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
                        selectedStarRating.includes(stars)
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      {stars} ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price Range (per night)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min price"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max price"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Popular Amenities */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Popular Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 1, name: 'WiFi', icon: Wifi },
                    { id: 2, name: 'Parking', icon: Car },
                    { id: 3, name: 'Gym', icon: Dumbbell },
                    { id: 4, name: 'Restaurant', icon: UtensilsCrossed },
                  ].map((amenity) => {
                    const Icon = amenity.icon;
                    return (
                      <button
                        key={amenity.id}
                        onClick={() => {
                          if (selectedAmenities.includes(amenity.id)) {
                            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity.id));
                          } else {
                            setSelectedAmenities([...selectedAmenities, amenity.id]);
                          }
                        }}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all flex items-center gap-2 justify-center ${
                          selectedAmenities.includes(amenity.id)
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {amenity.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hotel Chains (if available) */}
              {hotelChains.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Hotel Chains
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {hotelChains.slice(0, 12).map((chain) => (
                      <button
                        key={chain.chainId}
                        onClick={() => {
                          if (selectedChains.includes(chain.chainId)) {
                            setSelectedChains(selectedChains.filter(c => c !== chain.chainId));
                          } else {
                            setSelectedChains([...selectedChains, chain.chainId]);
                          }
                        }}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                          selectedChains.includes(chain.chainId)
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {chain.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel Types (if available) */}
              {hotelTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Property Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {hotelTypes.slice(0, 8).map((type) => (
                      <button
                        key={type.typeId}
                        onClick={() => {
                          if (selectedTypes.includes(type.typeId)) {
                            setSelectedTypes(selectedTypes.filter(t => t !== type.typeId));
                          } else {
                            setSelectedTypes([...selectedTypes, type.typeId]);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedTypes.includes(type.typeId)
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters Button */}
              {(selectedChains.length > 0 || selectedTypes.length > 0 || selectedStarRating.length > 0 || selectedAmenities.length > 0 || minPrice || maxPrice) && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedChains([]);
                      setSelectedTypes([]);
                      setSelectedStarRating([]);
                      setSelectedAmenities([]);
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
