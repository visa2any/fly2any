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
      className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-neutral-200 p-4 md:p-5"
    >
      {/* Title - Compact */}
      <div className="mb-3">
        <h2 className="text-lg md:text-xl font-bold text-primary-600">
          {t.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Destination */}
        <div ref={destinationRef} className="relative">
          <label className="block text-[11px] font-bold text-neutral-500 mb-1 uppercase tracking-wide">
            <MapPin className="w-3 h-3 inline mr-0.5" />
            {t.destination}
          </label>
          <div className="relative">
            {/* Selected Destination - Apple-Class compact */}
            {selectedDestinationDetails && destinationQuery === selectedDestinationDetails.name ? (
              <div
                onClick={() => {
                  setShowDestinationDropdown(true);
                  inputRef.current?.focus();
                }}
                className="w-full px-3 py-2 rounded-lg border border-primary-300 bg-primary-50/50 cursor-pointer transition-all hover:border-primary-400"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                      {selectedDestinationDetails.emoji ? (
                        <span className="text-base">{selectedDestinationDetails.emoji}</span>
                      ) : (
                        <Globe className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-800 text-sm leading-tight flex items-center gap-1">
                        {selectedDestinationDetails.name}
                        <Check className="w-3 h-3 text-success-500" />
                      </div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5" />
                        {selectedDestinationDetails.country || 'Selected'}
                        {selectedDestinationDetails.type && (
                          <span className="px-1 py-0.5 bg-primary-100 text-primary-600 text-[9px] font-bold rounded capitalize">
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
                    className="p-1 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>
                {/* Selected Districts - Compact */}
                {selectedDistricts.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-primary-200 flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] text-neutral-400 font-bold">Areas:</span>
                    {selectedDistricts.map(district => (
                      <span
                        key={district.id}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded text-[10px] font-semibold text-primary-600 border border-primary-200"
                      >
                        {district.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDistrictSelection(district);
                          }}
                          className="hover:text-error-500"
                        >
                          <X className="w-2.5 h-2.5" />
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
                  className="w-full px-3 py-2 pr-8 rounded-lg border border-neutral-200 focus:border-primary-500 focus:outline-none transition-colors text-neutral-800 text-sm font-medium"
                />
                {loadingSuggestions && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
                )}
                {destinationQuery && !loadingSuggestions && (
                  <button
                    onClick={clearDestination}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Dropdown - Apple-Class */}
          <AnimatePresence>
            {showDestinationDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-soft-lg border border-neutral-200 overflow-hidden max-h-[320px] overflow-y-auto"
              >
                {/* Suggestions from API - Compact */}
                {suggestions.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-0.5 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      Destinations
                    </div>
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={suggestion.id || idx}
                        onClick={() => handleSelectLocation(suggestion)}
                        className={`w-full px-2 py-1.5 transition-colors flex items-center gap-2 text-left ${
                          selectedIndex === idx ? 'bg-primary-50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        {/* Emoji */}
                        {suggestion.emoji && (
                          <span className="text-xl flex-shrink-0">{suggestion.emoji}</span>
                        )}
                        {!suggestion.emoji && getTypeIcon(suggestion.type)}

                        {/* Info */}
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-800 text-sm leading-tight">
                            {suggestion.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                            <span>{suggestion.city !== suggestion.name ? `${suggestion.city}, ` : ''}{suggestion.country}</span>
                          </div>
                        </div>

                        {/* Type Badge */}
                        <span className="text-[9px] text-neutral-400 capitalize font-medium">
                          {suggestion.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Destinations - Apple-Class horizontal scrolling pills */}
                {suggestions.length === 0 && !loadingSuggestions && popularDestinations.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-0.5 text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" />
                      {t.popularDestinations}
                    </div>
                    <div className="flex gap-1 px-2 pb-1 overflow-x-auto scrollbar-hide">
                      {popularDestinations.map((dest, idx) => (
                        <button
                          key={dest.id || idx}
                          onClick={() => handleSelectLocation(dest)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                            selectedIndex === idx
                              ? 'bg-primary-500 text-white'
                              : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-600'
                          }`}
                        >
                          {dest.emoji && <span className="text-xs">{dest.emoji}</span>}
                          {dest.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback Popular Cities - Apple-Class horizontal pills */}
                {suggestions.length === 0 && !loadingSuggestions && popularDestinations.length === 0 && (
                  <div className="py-1">
                    <div className="px-2 py-0.5 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      {t.popularDestinations}
                    </div>
                    <div className="flex gap-1 px-2 pb-1 overflow-x-auto scrollbar-hide">
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
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                            selectedIndex === idx
                              ? 'bg-primary-500 text-white'
                              : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-600'
                          }`}
                        >
                          <span className="text-xs">{city.emoji}</span>
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

        {/* Date Range - Apple-Class Compact */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-500 mb-1 uppercase tracking-wide">
            <Calendar className="w-3 h-3 inline mr-0.5" />
            {t.checkIn} - {t.checkOut}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="px-2.5 py-2 rounded-lg border border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:outline-none transition-colors text-sm font-medium text-neutral-800"
              placeholder={t.checkIn}
            />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn}
              className="px-2.5 py-2 rounded-lg border border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:outline-none transition-colors text-sm font-medium text-neutral-800"
              placeholder={t.checkOut}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
        {/* Guests & Rooms - Apple-Class */}
        <div ref={guestsRef} className="relative">
          <label className="block text-[11px] font-bold text-neutral-500 mb-1 uppercase tracking-wide">
            <Users className="w-3 h-3 inline mr-0.5" />
            {t.guests}
          </label>
          <button
            onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:outline-none transition-colors text-left text-sm font-medium text-neutral-800"
          >
            {adults} {adults === 1 ? t.adults.slice(0, -1) : t.adults}, {children} {t.children}, {rooms} {rooms === 1 ? t.rooms.slice(0, -1) : t.rooms}
          </button>

          {/* Guests Dropdown - Apple-Class */}
          <AnimatePresence>
            {showGuestsDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-soft-lg border border-neutral-200 p-3"
              >
                {/* Adults */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-neutral-800 text-sm">{t.adults}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center font-bold text-neutral-700 text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-800 text-sm">{adults}</span>
                    <button
                      onClick={() => setAdults(Math.min(20, adults + 1))}
                      className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors flex items-center justify-center font-bold text-white text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children - Compact */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-800 text-sm">{t.children}</span>
                      <p className="text-[10px] text-neutral-400">{t.childAgeHint}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newCount = Math.max(0, children - 1);
                          setChildren(newCount);
                          setChildAges(prev => prev.slice(0, newCount));
                        }}
                        className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center font-bold text-neutral-700 text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-neutral-800 text-sm">{children}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newCount = Math.min(10, children + 1);
                          setChildren(newCount);
                          setChildAges(prev => [...prev, 8]);
                        }}
                        className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors flex items-center justify-center font-bold text-white text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Child Age Selectors - Compact */}
                  {children > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-secondary-600 bg-secondary-50 px-2 py-1 rounded">
                        <Info className="w-3 h-3" />
                        <span>{t.infant}: {t.infantFree}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Array.from({ length: children }).map((_, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-neutral-50 rounded p-1.5">
                            <div className="flex items-center gap-1">
                              {(childAges[idx] ?? 8) <= 2 ? (
                                <Baby className="w-3 h-3 text-pink-500" />
                              ) : (
                                <Users className="w-3 h-3 text-info-500" />
                              )}
                              <span className="text-[11px] font-medium text-neutral-600">
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
                              className="flex-1 px-1.5 py-0.5 text-[11px] rounded border border-neutral-200 focus:border-primary-500 focus:outline-none bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(age => (
                                <option key={age} value={age}>{age} yr{age !== 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      {childAges.filter(age => age <= 2).length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-success-600 bg-success-50 px-2 py-1 rounded">
                          <Check className="w-3 h-3" />
                          <span>{childAges.filter(age => age <= 2).length} infant(s) - FREE!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pet-Friendly Toggle - Compact */}
                <div className="flex items-center justify-between mb-3 py-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Dog className="w-4 h-4 text-secondary-500" />
                    <div>
                      <span className="font-semibold text-neutral-800 text-sm">{t.pets}</span>
                      <p className="text-[10px] text-neutral-400">{t.petFriendly}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPetFriendly(!petFriendly)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      petFriendly ? 'bg-primary-500' : 'bg-neutral-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        petFriendly ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Rooms - Compact */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-neutral-800 text-sm">{t.rooms}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center font-bold text-neutral-700 text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-800 text-sm">{rooms}</span>
                    <button
                      onClick={() => setRooms(Math.min(10, rooms + 1))}
                      className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors flex items-center justify-center font-bold text-white text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuestsDropdown(false)}
                  className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-semibold text-neutral-800 text-sm transition-colors"
                >
                  {t.done}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Button - Apple-Class + Fly2Any */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 text-white font-bold text-sm rounded-lg shadow-primary hover:shadow-lg transition-all active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                {t.search}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Popular Areas - Apple-Class horizontal scroll */}
      <AnimatePresence>
        {popularDistricts.length > 0 && destination && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-[11px] font-bold text-neutral-600">
                    Popular in {destination}
                  </span>
                  <span className="text-[9px] text-neutral-400">(multi)</span>
                </div>
                {selectedDistricts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDistricts([])}
                    className="text-[10px] text-neutral-400 hover:text-error-500 flex items-center gap-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                    Clear
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {loadingDistricts ? (
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-[10px]">Loading...</span>
                  </div>
                ) : (
                  popularDistricts.map((district) => {
                    const isSelected = selectedDistricts.some(d => d.id === district.id);
                    return (
                      <button
                        key={district.id}
                        type="button"
                        onClick={() => toggleDistrictSelection(district)}
                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {district.name}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected Summary */}
              {selectedDistricts.length > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-neutral-200">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] font-bold text-success-600 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      {selectedDistricts.length} selected:
                    </span>
                    {selectedDistricts.map(d => (
                      <span key={d.id} className="text-[9px] text-neutral-600 bg-white px-1.5 py-0.5 rounded border border-success-200">
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

      {/* Advanced Filters Toggle - Apple-Class */}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 hover:text-primary-600 transition-colors"
        >
          <Filter className="w-3 h-3" />
          <span>Advanced Filters</span>
          {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {(selectedChains.length > 0 || selectedTypes.length > 0 || selectedStarRating.length > 0 || selectedAmenities.length > 0 || minPrice || maxPrice) && (
            <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded text-[10px] font-bold">
              {[selectedChains.length, selectedTypes.length, selectedStarRating.length, selectedAmenities.length, minPrice ? 1 : 0, maxPrice ? 1 : 0].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters Panel - Apple-Class + Fly2Any */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-white/80 rounded-lg border border-neutral-200 space-y-3">
              {/* Star Rating - Horizontal scroll pills */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                  <Star className="w-3 h-3 inline mr-0.5" />
                  Star Rating
                </label>
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => {
                        if (selectedStarRating.includes(stars)) {
                          setSelectedStarRating(selectedStarRating.filter(s => s !== stars));
                        } else {
                          setSelectedStarRating([...selectedStarRating, stars]);
                        }
                      }}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                        selectedStarRating.includes(stars)
                          ? 'bg-primary-500 text-white'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-600'
                      }`}
                    >
                      {stars} ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range - Compact */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                  <DollarSign className="w-3 h-3 inline mr-0.5" />
                  Price Range (per night)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:border-primary-500 focus:outline-none transition-colors text-sm font-medium text-neutral-800"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:border-primary-500 focus:outline-none transition-colors text-sm font-medium text-neutral-800"
                  />
                </div>
              </div>

              {/* Popular Amenities - Horizontal scroll pills */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                  Popular Amenities
                </label>
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
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
                        type="button"
                        onClick={() => {
                          if (selectedAmenities.includes(amenity.id)) {
                            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity.id));
                          } else {
                            setSelectedAmenities([...selectedAmenities, amenity.id]);
                          }
                        }}
                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                          selectedAmenities.includes(amenity.id)
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-600'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {amenity.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hotel Chains - Horizontal scroll pills */}
              {hotelChains.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                    <Building2 className="w-3 h-3 inline mr-0.5" />
                    Hotel Chains
                  </label>
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {hotelChains.slice(0, 12).map((chain) => (
                      <button
                        key={chain.chainId}
                        type="button"
                        onClick={() => {
                          if (selectedChains.includes(chain.chainId)) {
                            setSelectedChains(selectedChains.filter(c => c !== chain.chainId));
                          } else {
                            setSelectedChains([...selectedChains, chain.chainId]);
                          }
                        }}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                          selectedChains.includes(chain.chainId)
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-600'
                        }`}
                      >
                        {chain.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel Types - Horizontal scroll pills */}
              {hotelTypes.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                    Property Type
                  </label>
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {hotelTypes.slice(0, 8).map((type) => (
                      <button
                        key={type.typeId}
                        type="button"
                        onClick={() => {
                          if (selectedTypes.includes(type.typeId)) {
                            setSelectedTypes(selectedTypes.filter(t => t !== type.typeId));
                          } else {
                            setSelectedTypes([...selectedTypes, type.typeId]);
                          }
                        }}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                          selectedTypes.includes(type.typeId)
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-600'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters Button - Compact */}
              {(selectedChains.length > 0 || selectedTypes.length > 0 || selectedStarRating.length > 0 || selectedAmenities.length > 0 || minPrice || maxPrice) && (
                <div className="pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChains([]);
                      setSelectedTypes([]);
                      setSelectedStarRating([]);
                      setSelectedAmenities([]);
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-semibold text-sm rounded-lg transition-colors"
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
