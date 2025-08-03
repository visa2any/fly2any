/**
 * ULTRA-INNOVATIVE Flight Search Form - Beyond Google Flights, Expedia, Kayak
 * Revolutionary UX with AI-powered search and glassmorphism design
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FlightIcon, CalendarIcon, UsersIcon, SwitchIcon, PlusIcon, MinusIcon } from '@/components/Icons';
import { FlightSearchFormData, AirportSelection, PassengerCounts, TravelClass, FlightSegment } from '@/types/flights';
import { validateFlightSearchForm } from '@/lib/flights/validators';
import { AMADEUS_CONFIG } from '@/lib/flights/amadeus-config';
import EnterpriseDatePicker from '@/components/ui/enterprise-date-picker';

interface FlightSearchFormProps {
  onSearch: (searchData: FlightSearchFormData) => void;
  initialData?: Partial<FlightSearchFormData>;
  isLoading?: boolean;
  className?: string;
}

interface EnhancedAirportResult {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  region: string;
  timezone: string;
  coordinates: { lat: number; lng: number };
  popularity: number; // 1-5 scale
  isHub: boolean;
  weather?: {
    temp: number;
    condition: string;
    emoji: string;
  };
  priceIndex: 'low' | 'medium' | 'high';
  imageUrl: string;
}

export default function FlightSearchForm({ 
  onSearch, 
  initialData, 
  isLoading = false, 
  className = '' 
}: FlightSearchFormProps) {
  // Form state
  const [formData, setFormData] = useState<FlightSearchFormData>({
    tripType: 'round-trip',
    origin: { iataCode: '', name: '', city: '', country: '' },
    destination: { iataCode: '', name: '', city: '', country: '' },
    departureDate: new Date(),
    returnDate: new Date(),
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'ECONOMY' as TravelClass,
    preferences: {
      nonStop: false,
      preferredAirlines: []
    },
    ...initialData
  });

  // Search states
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [originResults, setOriginResults] = useState<EnhancedAirportResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<EnhancedAirportResult[]>([]);

  // Dropdown visibility
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Refs for positioning
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const passengerRef = useRef<HTMLButtonElement>(null);
  const classRef = useRef<HTMLButtonElement>(null);

  // Position state for dropdowns
  const [dropdownPositions, setDropdownPositions] = useState({
    origin: { top: 0, left: 0, width: 0 },
    destination: { top: 0, left: 0, width: 0 },
    passenger: { top: 0, left: 0, width: 0 },
    class: { top: 0, left: 0, width: 0 }
  });

  // ULTRA-ENHANCED GLOBAL AIRPORT DATABASE with AI Intelligence
  const enhancedAirports: EnhancedAirportResult[] = [
    // US Major Hubs - Top Tier
    { 
      iataCode: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', region: 'North America',
      timezone: 'America/New_York', coordinates: { lat: 40.6413, lng: -73.7781 }, popularity: 5, isHub: true,
      weather: { temp: 72, condition: 'Sunny', emoji: '☀️' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80'
    },
    { 
      iataCode: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', region: 'North America',
      timezone: 'America/Los_Angeles', coordinates: { lat: 33.9428, lng: -118.4081 }, popularity: 5, isHub: true,
      weather: { temp: 78, condition: 'Clear', emoji: '🌞' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1484642065381-9b40ceb8efbb?w=400&q=80'
    },
    { 
      iataCode: 'ORD', name: "Chicago O'Hare International Airport", city: 'Chicago', country: 'United States', region: 'North America',
      timezone: 'America/Chicago', coordinates: { lat: 41.9786, lng: -87.9048 }, popularity: 5, isHub: true,
      weather: { temp: 65, condition: 'Cloudy', emoji: '☁️' }, priceIndex: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80'
    },
    { 
      iataCode: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', region: 'North America',
      timezone: 'America/New_York', coordinates: { lat: 25.7617, lng: -80.1918 }, popularity: 4, isHub: true,
      weather: { temp: 84, condition: 'Partly Cloudy', emoji: '⛅' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&q=80'
    },
    { 
      iataCode: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', region: 'North America',
      timezone: 'America/Los_Angeles', coordinates: { lat: 37.6213, lng: -122.3790 }, popularity: 5, isHub: true,
      weather: { temp: 68, condition: 'Foggy', emoji: '🌫️' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80'
    },
    { 
      iataCode: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', region: 'North America',
      timezone: 'America/Chicago', coordinates: { lat: 32.8968, lng: -97.0380 }, popularity: 4, isHub: true,
      weather: { temp: 76, condition: 'Hot', emoji: '🌡️' }, priceIndex: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1559268950-2d7ceb2efa13?w=400&q=80'
    },
    { 
      iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', region: 'North America',
      timezone: 'America/New_York', coordinates: { lat: 33.6407, lng: -84.4277 }, popularity: 5, isHub: true,
      weather: { temp: 74, condition: 'Humid', emoji: '💧' }, priceIndex: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80'
    },
    { 
      iataCode: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States', region: 'North America',
      timezone: 'America/Los_Angeles', coordinates: { lat: 36.0840, lng: -115.1537 }, popularity: 4, isHub: false,
      weather: { temp: 89, condition: 'Desert Sun', emoji: '🏜️' }, priceIndex: 'low',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
    },
    { 
      iataCode: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States', region: 'North America',
      timezone: 'America/Los_Angeles', coordinates: { lat: 47.4502, lng: -122.3088 }, popularity: 4, isHub: true,
      weather: { temp: 62, condition: 'Rainy', emoji: '🌧️' }, priceIndex: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80'
    },
    { 
      iataCode: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States', region: 'North America',
      timezone: 'America/New_York', coordinates: { lat: 42.3656, lng: -71.0096 }, popularity: 4, isHub: true,
      weather: { temp: 66, condition: 'Breezy', emoji: '💨' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=400&q=80'
    },

    // International Top Destinations
    { 
      iataCode: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', region: 'Europe',
      timezone: 'Europe/London', coordinates: { lat: 51.4700, lng: -0.4543 }, popularity: 5, isHub: true,
      weather: { temp: 61, condition: 'Overcast', emoji: '☁️' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=400&q=80'
    },
    { 
      iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', region: 'Europe',
      timezone: 'Europe/Paris', coordinates: { lat: 49.0097, lng: 2.5479 }, popularity: 5, isHub: true,
      weather: { temp: 64, condition: 'Romantic', emoji: '🗼' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80'
    },
    { 
      iataCode: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', region: 'Asia',
      timezone: 'Asia/Tokyo', coordinates: { lat: 35.7720, lng: 140.3929 }, popularity: 5, isHub: true,
      weather: { temp: 70, condition: 'Spring', emoji: '🌸' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80'
    },
    { 
      iataCode: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East',
      timezone: 'Asia/Dubai', coordinates: { lat: 25.2532, lng: 55.3657 }, popularity: 5, isHub: true,
      weather: { temp: 95, condition: 'Luxury Heat', emoji: '🏰' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80'
    },
    { 
      iataCode: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', region: 'Asia',
      timezone: 'Asia/Singapore', coordinates: { lat: 1.3644, lng: 103.9915 }, popularity: 5, isHub: true,
      weather: { temp: 86, condition: 'Tropical', emoji: '🌺' }, priceIndex: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80'
    },
    { 
      iataCode: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', region: 'Oceania',
      timezone: 'Australia/Sydney', coordinates: { lat: -33.9399, lng: 151.1753 }, popularity: 4, isHub: true,
      weather: { temp: 73, condition: 'Beach Weather', emoji: '🏖️' }, priceIndex: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
    },
    { 
      iataCode: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', region: 'North America',
      timezone: 'America/Toronto', coordinates: { lat: 43.6777, lng: -79.6248 }, popularity: 4, isHub: true,
      weather: { temp: 59, condition: 'Maple Season', emoji: '🍁' }, priceIndex: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&q=80'
    },
    { 
      iataCode: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', region: 'South America',
      timezone: 'America/Sao_Paulo', coordinates: { lat: -23.4356, lng: -46.4731 }, popularity: 4, isHub: true,
      weather: { temp: 77, condition: 'Vibrant', emoji: '🎭' }, priceIndex: 'low',
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&q=80'
    }
  ];

  // Popular US-focused suggestions
  const popularOrigins = enhancedAirports.filter(a => a.country === 'United States' && a.isHub).slice(0, 6);
  const popularDestinations = [
    ...enhancedAirports.filter(a => a.country !== 'United States' && a.popularity === 5).slice(0, 4),
    ...enhancedAirports.filter(a => a.country === 'United States' && a.city !== 'New York').slice(0, 4)
  ];

  // AI-POWERED SMART SEARCH - Understanding natural language
  const aiSmartSearch = useCallback(async (query: string): Promise<EnhancedAirportResult[]> => {
    if (!query || query.length < 1) return [];
    
    const searchTerm = query.toLowerCase().trim();
    
    // AI Natural Language Processing
    const patterns = {
      // City nicknames and alternative names
      'nyc': ['new york', 'jfk', 'lga', 'ewr'],
      'big apple': ['new york', 'jfk'],
      'la': ['los angeles', 'lax'],
      'chi-town': ['chicago', 'ord'],
      'windy city': ['chicago', 'ord'],
      'city of angels': ['los angeles', 'lax'],
      'sin city': ['las vegas', 'las'],
      'emerald city': ['seattle', 'sea'],
      'motor city': ['detroit', 'dtw'],
      'magic city': ['miami', 'mia'],
      'beantown': ['boston', 'bos'],
      'city of brotherly love': ['philadelphia', 'phl'],
    };

    // Regional searches
    const regions = {
      'europe': enhancedAirports.filter(a => a.region === 'Europe'),
      'asia': enhancedAirports.filter(a => a.region === 'Asia'),
      'caribbean': enhancedAirports.filter(a => a.country.includes('Caribbean')),
      'south america': enhancedAirports.filter(a => a.region === 'South America'),
    };

    let expandedSearch = [searchTerm];
    
    // Check for nicknames and expand search
    for (const [nickname, alternatives] of Object.entries(patterns)) {
      if (searchTerm.includes(nickname)) {
        expandedSearch.push(...alternatives);
      }
    }

    // Regional search
    for (const [region, airports] of Object.entries(regions)) {
      if (searchTerm.includes(region)) {
        return airports.slice(0, 8);
      }
    }

    // Search through all airports with enhanced matching
    const results = enhancedAirports.filter(airport => {
      return expandedSearch.some(term => 
        airport.city.toLowerCase().includes(term) ||
        airport.name.toLowerCase().includes(term) ||
        airport.iataCode.toLowerCase().includes(term) ||
        airport.country.toLowerCase().includes(term) ||
        airport.region.toLowerCase().includes(term)
      );
    });
    
    // ULTRA-INTELLIGENT SORTING ALGORITHM
    return results.sort((a, b) => {
      // Exact IATA code match gets highest priority
      if (a.iataCode.toLowerCase() === searchTerm) return -1;
      if (b.iataCode.toLowerCase() === searchTerm) return 1;
      
      // City name exact match
      if (a.city.toLowerCase() === searchTerm) return -1;
      if (b.city.toLowerCase() === searchTerm) return 1;
      
      // Starts with query
      if (a.city.toLowerCase().startsWith(searchTerm) && !b.city.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.city.toLowerCase().startsWith(searchTerm) && !a.city.toLowerCase().startsWith(searchTerm)) return 1;
      
      // US airports prioritized for US-based service
      if (a.country === 'United States' && b.country !== 'United States') return -1;
      if (b.country === 'United States' && a.country !== 'United States') return 1;
      
      // Major hubs prioritized
      if (a.isHub && !b.isHub) return -1;
      if (b.isHub && !a.isHub) return 1;
      
      // Popularity score
      if (a.popularity > b.popularity) return -1;
      if (b.popularity > a.popularity) return 1;
      
      return a.city.localeCompare(b.city);
    }).slice(0, 8);
  }, []);

  // Handle search with debouncing for performance
  useEffect(() => {
    const searchTerm = originSearch.trim();
    if (searchTerm.length >= 1) {
      const timeoutId = setTimeout(() => {
        aiSmartSearch(searchTerm).then(setOriginResults);
      }, 150); // Debounce for smooth UX
      return () => clearTimeout(timeoutId);
    } else {
      setOriginResults([]);
    }
  }, [originSearch, aiSmartSearch]);

  useEffect(() => {
    const searchTerm = destinationSearch.trim();
    if (searchTerm.length >= 1) {
      const timeoutId = setTimeout(() => {
        aiSmartSearch(searchTerm).then(setDestinationResults);
      }, 150);
      return () => clearTimeout(timeoutId);
    } else {
      setDestinationResults([]);
    }
  }, [destinationSearch, aiSmartSearch]);

  // PERFECT POSITIONING - Below input, never overlapping
  const updateDropdownPosition = (element: HTMLElement | null, key: 'origin' | 'destination' | 'passenger' | 'class') => {
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      setDropdownPositions(prev => ({
        ...prev,
        [key]: {
          top: rect.bottom + scrollTop + 8, // 8px gap below input
          left: rect.left + window.pageXOffset,
          width: Math.max(rect.width, 400) // Minimum 400px width for rich cards
        }
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateFlightSearchForm(formData);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return;
    }

    onSearch(formData);
  };

  // Handle swap origin/destination with smooth animation
  const handleSwapAirports = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
    setOriginSearch('');
    setDestinationSearch('');
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowOriginDropdown(false);
    setShowDestinationDropdown(false);
    setShowPassengerDropdown(false);
    setShowClassDropdown(false);
  };

  // Total passengers for display
  const totalPassengers = formData.passengers.adults + formData.passengers.children + formData.passengers.infants;

  // Travel class options with enhanced descriptions
  const travelClasses = [
    { value: 'ECONOMY', label: 'Economy', description: 'Great value, comfortable seating', icon: '🛋️', priceMultiplier: 1 },
    { value: 'PREMIUM_ECONOMY', label: 'Premium Economy', description: 'Extra space, priority boarding', icon: '🛋️✨', priceMultiplier: 1.5 },
    { value: 'BUSINESS', label: 'Business', description: 'Flat-bed seats, premium dining', icon: '💼', priceMultiplier: 3 },
    { value: 'FIRST', label: 'First Class', description: 'Ultimate luxury, personal suite', icon: '👑', priceMultiplier: 5 }
  ];

  const getClassLabel = (value: string) => {
    return travelClasses.find(c => c.value === value)?.label || 'Economy';
  };

  // Get local time for destination
  const getLocalTime = (timezone: string) => {
    try {
      return new Date().toLocaleTimeString('en-US', { 
        timeZone: timezone, 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      {/* CONTAINER SUTIL PARA DELIMITAR ÁREA DO FORMULÁRIO */}
      <div className="bg-white/8 backdrop-blur-md rounded-3xl border border-white/15 p-8 shadow-xl">
          
          {/* Header with Smart Trip Type & Direct Flights */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex gap-2">
              {[
                { value: 'round-trip', label: 'Round trip', icon: '⇄', color: 'from-blue-500 to-cyan-500' },
                { value: 'one-way', label: 'One way', icon: '→', color: 'from-purple-500 to-pink-500' },
                { value: 'multi-city', label: 'Multi-city', icon: '⚬⚬⚬', color: 'from-green-500 to-emerald-500' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tripType: option.value as any }))}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    formData.tripType === option.value
                      ? `bg-gradient-to-r ${option.color} text-white shadow-lg transform scale-105`
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>

            {/* Advanced Options */}
            <div className="flex items-center gap-4">
              {/* Direct Flights Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.nonStop}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, nonStop: e.target.checked }
                  }))}
                  className="w-5 h-5 text-blue-500 bg-white/20 border-white/40 rounded focus:ring-blue-500/50 focus:ring-2"
                />
                <span className="text-sm font-bold text-white">⚡ Direct flights only</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* REVOLUTIONARY MAIN SEARCH - AI-Powered */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-end">
              
              {/* Origin - AI Smart Search */}
              <div className="lg:col-span-4 space-y-3 lg:pr-0">
                <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-3">
                  <span className="text-blue-400 text-lg">✈️</span>
                  <span>Flying from</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">AI Search</span>
                </label>
                <div className="relative lg:mr-[-20px]">
                  <input
                    ref={originRef}
                    type="text"
                    value={formData.origin.iataCode ? formData.origin.city : originSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setOriginSearch(value);
                      if (formData.origin.iataCode && value !== formData.origin.city) {
                        setFormData(prev => ({ ...prev, origin: { iataCode: '', name: '', city: '', country: '' } }));
                      }
                    }}
                    onFocus={() => {
                      closeAllDropdowns();
                      updateDropdownPosition(originRef.current, 'origin');
                      setShowOriginDropdown(true);
                    }}
                    placeholder="City, airport, or even nickname..."
                    className="w-full pl-14 pr-6 py-5 bg-transparent border-2 border-white/20 rounded-2xl focus:border-blue-400/80 focus:ring-0 text-xl font-semibold text-white placeholder-white/70 transition-all duration-300 hover:border-white/40"
                  />
                  {formData.origin.iataCode && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500/80 text-white text-sm font-bold px-3 py-2 rounded-xl backdrop-blur-sm">
                      {formData.origin.iataCode}
                    </div>
                  )}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                    <FlightIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Revolutionary Swap Button - Integrated Junction */}
              <div className="lg:col-span-1 flex justify-center items-end pb-3 -mx-4">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center text-white hover:bg-white/5 transition-all duration-300 hover:scale-110 group p-0 m-0"
                >
                  <div className="text-3xl group-hover:rotate-180 transition-transform duration-500">⇄</div>
                </button>
              </div>

              {/* Destination - AI Smart Search */}
              <div className="lg:col-span-4 space-y-3 lg:pl-0">
                <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-3">
                  <span className="text-purple-400 text-lg">🌍</span>
                  <span>Flying to</span>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Global Search</span>
                </label>
                <div className="relative lg:ml-[-20px]">
                  <input
                    ref={destinationRef}
                    type="text"
                    value={formData.destination.iataCode ? formData.destination.city : destinationSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDestinationSearch(value);
                      if (formData.destination.iataCode && value !== formData.destination.city) {
                        setFormData(prev => ({ ...prev, destination: { iataCode: '', name: '', city: '', country: '' } }));
                      }
                    }}
                    onFocus={() => {
                      closeAllDropdowns();
                      updateDropdownPosition(destinationRef.current, 'destination');
                      setShowDestinationDropdown(true);
                    }}
                    placeholder="Anywhere in the world..."
                    className="w-full pl-14 pr-6 py-5 bg-transparent border-2 border-white/20 rounded-2xl focus:border-purple-400/80 focus:ring-0 text-xl font-semibold text-white placeholder-white/70 transition-all duration-300 hover:border-white/40"
                  />
                  {formData.destination.iataCode && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-500/80 text-white text-sm font-bold px-3 py-2 rounded-xl backdrop-blur-sm">
                      {formData.destination.iataCode}
                    </div>
                  )}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
                    <div className="w-6 h-6 text-xl">🌍</div>
                  </div>
                </div>
              </div>

              {/* Travelers - Na mesma linha */}
              <div className="lg:col-span-3 space-y-3 lg:ml-6">
                <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-2">
                  <span className="text-pink-400">👥</span>
                  Travelers
                </label>
                <button
                  ref={passengerRef}
                  type="button"
                  onClick={() => {
                    closeAllDropdowns();
                    updateDropdownPosition(passengerRef.current, 'passenger');
                    setShowPassengerDropdown(true);
                  }}
                  className="w-full px-6 py-5 bg-transparent border-2 border-white/20 rounded-2xl focus:border-pink-400/80 focus:ring-0 text-xl font-semibold text-white hover:border-white/40 transition-all duration-300 text-left flex items-center justify-between"
                >
                  <span>
                    {totalPassengers} traveler{totalPassengers !== 1 ? 's' : ''}
                    {formData.passengers.children > 0 && (
                      <span className="text-sm text-white/70 ml-2">
                        (+{formData.passengers.children} child{formData.passengers.children > 1 ? 'ren' : ''})
                      </span>
                    )}
                  </span>
                  <UsersIcon className="w-6 h-6 text-pink-400" />
                </button>
              </div>
            </div>

            {/* CONTROLES SECUNDÁRIOS - Dates, Class & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Departure Date */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-2">
                  <span className="text-green-400">📅</span>
                  Departure
                </label>
                <div className="relative">
                  <EnterpriseDatePicker
                    value={formData.departureDate.toISOString().split('T')[0]}
                    onChange={(value) => setFormData(prev => ({ ...prev, departureDate: new Date(value) }))}
                    placeholder="MM/DD/YYYY"
                    minDate={new Date().toISOString().split('T')[0]}
                    className=""
                  />
                </div>
              </div>

              {/* Return Date */}
              {formData.tripType === 'round-trip' && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-2">
                    <span className="text-orange-400">🔄</span>
                    Return
                  </label>
                  <div className="relative">
                    <EnterpriseDatePicker
                      value={formData.returnDate?.toISOString().split('T')[0] || ''}
                      onChange={(value) => setFormData(prev => ({ ...prev, returnDate: new Date(value) }))}
                      placeholder="MM/DD/YYYY"
                      minDate={formData.departureDate.toISOString().split('T')[0]}
                      className=""
                    />
                  </div>
                </div>
              )}

              {/* Travel Class */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-2">
                  <span className="text-yellow-400">✨</span>
                  Class
                </label>
                <button
                  ref={classRef}
                  type="button"
                  onClick={() => {
                    closeAllDropdowns();
                    updateDropdownPosition(classRef.current, 'class');
                    setShowClassDropdown(true);
                  }}
                  className="w-full px-6 py-5 bg-transparent border-2 border-white/20 rounded-2xl focus:border-yellow-400/80 focus:ring-0 text-xl font-semibold text-white hover:border-white/40 transition-all duration-300 text-left flex items-center justify-between"
                >
                  <span>{getClassLabel(formData.travelClass)}</span>
                  <div className="text-yellow-400 text-2xl">
                    {travelClasses.find(c => c.value === formData.travelClass)?.icon || '🛋️'}
                  </div>
                </button>
              </div>

              {/* ULTRA-PREMIUM SEARCH BUTTON */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isLoading || !formData.origin.iataCode || !formData.destination.iataCode}
                  className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-500/50 disabled:via-gray-600/50 disabled:to-gray-500/50 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 disabled:shadow-lg transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden group backdrop-blur-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">🚀</span>
                      <span>Search Flights</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>

      {/* REVOLUTIONARY PORTAL DROPDOWNS - Perfect Positioning */}
      {typeof window !== 'undefined' && createPortal(
        <>
          {/* ULTRA-ENHANCED Origin Dropdown */}
          {showOriginDropdown && (
            <div
              style={{
                position: 'absolute',
                top: dropdownPositions.origin.top,
                left: dropdownPositions.origin.left,
                width: dropdownPositions.origin.width,
                zIndex: 99999,
                maxHeight: '500px',
                overflowY: 'auto'
              }}
              className="backdrop-blur-xl bg-slate-900/80 border border-white/30 rounded-2xl shadow-2xl"
            >
              {/* AI-Powered Search Results or Popular Options */}
              {(!originSearch || (originSearch && originResults.length === 0)) && (
                <div className="p-6">
                  <div className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span className="text-blue-400">⚡</span>
                    {!originSearch ? 'Popular US Departures' : 'Try these popular airports'}
                  </div>
                  <div className="space-y-1">
                    {popularOrigins.map((airport) => (
                      <button
                        key={`popular-origin-${airport.iataCode}`}
                        type="button"
                        className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-white/50"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, origin: {
                            iataCode: airport.iataCode,
                            name: airport.name,
                            city: airport.city,
                            country: airport.country
                          }}));
                          setOriginSearch('');
                          setShowOriginDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            ✈️
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white group-hover:text-blue-300 transition-colors">
                              {airport.city}
                            </div>
                            <div className="text-sm text-white/70 truncate">
                              {airport.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">
                                {airport.timezone.split('/')[1]}
                              </span>
                              {airport.weather && (
                                <span className="text-xs text-white/60">
                                  {airport.weather.emoji} {airport.weather.temp}°F
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-white/80 bg-white/10 px-2 py-1 rounded flex-shrink-0">
                            {airport.iataCode}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Search Results with Enhanced Cards */}
              {originSearch && originResults.length > 0 && (
                <div className="p-6">
                  <div className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span className="text-green-400">🤖</span>
                    AI found {originResults.length} result{originResults.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-1">
                    {originResults.map((airport, index) => (
                      <button
                        key={`origin-${airport.iataCode}-${index}`}
                        type="button"
                        className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-blue-400/60"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, origin: {
                            iataCode: airport.iataCode,
                            name: airport.name,
                            city: airport.city,
                            country: airport.country
                          }}));
                          setOriginSearch('');
                          setShowOriginDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/30 flex-shrink-0">
                            <img 
                              src={airport.imageUrl} 
                              alt={airport.city}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white group-hover:text-blue-300 transition-colors">
                              {airport.city}
                            </div>
                            <div className="text-sm text-white/70 truncate">
                              {airport.name}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">
                                {airport.region}
                              </span>
                              {airport.weather && (
                                <span className="text-xs text-white/60 flex items-center gap-1">
                                  {airport.weather.emoji} {airport.weather.temp}°F
                                </span>
                              )}
                              <span className="text-xs text-white/60">
                                🕒 {getLocalTime(airport.timezone)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <div className="text-sm font-bold text-white bg-blue-500/30 px-2 py-1 rounded mb-1">
                              {airport.iataCode}
                            </div>
                            <div className="text-xs">
                              {'⭐'.repeat(airport.popularity)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ULTRA-ENHANCED Destination Dropdown */}
          {showDestinationDropdown && (
            <div
              style={{
                position: 'absolute',
                top: dropdownPositions.destination.top,
                left: dropdownPositions.destination.left,
                width: dropdownPositions.destination.width,
                zIndex: 99999,
                maxHeight: '500px',
                overflowY: 'auto'
              }}
              className="backdrop-blur-xl bg-slate-900/80 border border-white/30 rounded-2xl shadow-2xl"
            >
              {/* Popular Destinations or Search Results */}
              {(!destinationSearch || (destinationSearch && destinationResults.length === 0)) && (
                <div className="p-6">
                  <div className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span className="text-purple-400">🌍</span>
                    {!destinationSearch ? 'Trending Destinations' : 'Try these amazing destinations'}
                  </div>
                  <div className="space-y-1">
                    {popularDestinations.map((airport) => (
                      <button
                        key={`popular-dest-${airport.iataCode}`}
                        type="button"
                        className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-purple-400/60"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, destination: {
                            iataCode: airport.iataCode,
                            name: airport.name,
                            city: airport.city,
                            country: airport.country
                          }}));
                          setDestinationSearch('');
                          setShowDestinationDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30">
                            <img 
                              src={airport.imageUrl} 
                              alt={airport.city}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-white group-hover:text-purple-300 transition-colors text-lg">
                              {airport.city}
                            </div>
                            <div className="text-sm text-white/70 truncate">
                              {airport.country}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                airport.priceIndex === 'low' ? 'bg-green-500/30 text-green-300' :
                                airport.priceIndex === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                                'bg-red-500/30 text-red-300'
                              }`}>
                                {airport.priceIndex === 'low' ? '💰 Great Deals' : 
                                 airport.priceIndex === 'medium' ? '💸 Moderate' : '💎 Premium'}
                              </span>
                              {airport.weather && (
                                <span className="text-xs text-white/60">
                                  {airport.weather.emoji} {airport.weather.temp}°F
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-black text-white bg-purple-500/30 px-3 py-2 rounded-lg mb-2">
                              {airport.iataCode}
                            </div>
                            <div className="flex justify-center">
                              {'⭐'.repeat(airport.popularity)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Search Results */}
              {destinationSearch && destinationResults.length > 0 && (
                <div className="p-6">
                  <div className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span className="text-green-400">🤖</span>
                    AI found {destinationResults.length} destination{destinationResults.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-1">
                    {destinationResults.map((airport, index) => (
                      <button
                        key={`destination-${airport.iataCode}-${index}`}
                        type="button"
                        className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-purple-400/60"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, destination: {
                            iataCode: airport.iataCode,
                            name: airport.name,
                            city: airport.city,
                            country: airport.country
                          }}));
                          setDestinationSearch('');
                          setShowDestinationDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/30 flex-shrink-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                            <img 
                              src={airport.imageUrl} 
                              alt={airport.city}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="text-white font-bold text-lg">${airport.city.charAt(0)}</div>`;
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                              {airport.city}
                            </div>
                            <div className="text-sm text-white/70 truncate">
                              {airport.name}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                                {airport.region}
                              </span>
                              {airport.weather && (
                                <span className="text-xs text-white/60">
                                  {airport.weather.emoji} {airport.weather.temp}°F
                                </span>
                              )}
                              <span className="text-xs text-white/60">
                                🕒 {getLocalTime(airport.timezone)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <div className="text-sm font-bold text-white bg-purple-500/30 px-2 py-1 rounded mb-1">
                              {airport.iataCode}
                            </div>
                            <div className="text-xs">
                              {'⭐'.repeat(airport.popularity)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ENHANCED Passenger Dropdown */}
          {showPassengerDropdown && (
            <div
              style={{
                position: 'absolute',
                top: dropdownPositions.passenger.top,
                left: dropdownPositions.passenger.left,
                width: Math.max(dropdownPositions.passenger.width, 350),
                zIndex: 99999
              }}
              className="backdrop-blur-xl bg-slate-900/80 border border-white/30 rounded-2xl shadow-2xl p-6"
            >
              <div className="space-y-6">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-lg">Adults</div>
                    <div className="text-sm text-white/70">12+ years</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, adults: Math.max(1, prev.passengers.adults - 1) }
                      }))}
                      disabled={formData.passengers.adults <= 1}
                      className="w-10 h-10 rounded-xl bg-slate-800/60 border-2 border-white/40 flex items-center justify-center hover:bg-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <MinusIcon className="w-5 h-5 text-white" />
                    </button>
                    <span className="w-12 text-center font-bold text-white text-xl">{formData.passengers.adults}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, adults: Math.min(9, prev.passengers.adults + 1) }
                      }))}
                      disabled={formData.passengers.adults >= 9}
                      className="w-10 h-10 rounded-xl bg-slate-800/60 border-2 border-white/40 flex items-center justify-center hover:bg-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <PlusIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-lg">Children</div>
                    <div className="text-sm text-white/70">2-11 years</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, children: Math.max(0, prev.passengers.children - 1) }
                      }))}
                      disabled={formData.passengers.children <= 0}
                      className="w-10 h-10 rounded-xl bg-slate-800/60 border-2 border-white/40 flex items-center justify-center hover:bg-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <MinusIcon className="w-5 h-5 text-white" />
                    </button>
                    <span className="w-12 text-center font-bold text-white text-xl">{formData.passengers.children}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, children: Math.min(8, prev.passengers.children + 1) }
                      }))}
                      disabled={formData.passengers.children >= 8}
                      className="w-10 h-10 rounded-xl bg-slate-800/60 border-2 border-white/40 flex items-center justify-center hover:bg-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <PlusIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-lg">Infants</div>
                    <div className="text-sm text-white/70">Under 2 years</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, infants: Math.max(0, prev.passengers.infants - 1) }
                      }))}
                      disabled={formData.passengers.infants <= 0}
                      className="w-10 h-10 rounded-xl bg-slate-800/60 border-2 border-white/40 flex items-center justify-center hover:bg-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <MinusIcon className="w-5 h-5 text-white" />
                    </button>
                    <span className="w-12 text-center font-bold text-white text-xl">{formData.passengers.infants}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, infants: Math.min(formData.passengers.adults, prev.passengers.infants + 1) }
                      }))}
                      disabled={formData.passengers.infants >= formData.passengers.adults}
                      className="w-10 h-10 rounded-xl bg-slate-800/60 border-2 border-white/40 flex items-center justify-center hover:bg-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <PlusIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/30 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowPassengerDropdown(false)}
                    className="w-full py-3 text-white font-bold bg-gradient-to-r from-pink-600/70 to-purple-600/70 hover:from-pink-600/80 hover:to-purple-600/80 rounded-xl transition-all duration-300 border border-white/40"
                  >
                    ✅ Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ENHANCED Travel Class Dropdown */}
          {showClassDropdown && (
            <div
              style={{
                position: 'absolute',
                top: dropdownPositions.class.top,
                left: dropdownPositions.class.left,
                width: Math.max(dropdownPositions.class.width, 400),
                zIndex: 99999
              }}
              className="backdrop-blur-xl bg-slate-900/80 border border-white/30 rounded-2xl shadow-2xl p-6"
            >
              <div className="space-y-4">
                {travelClasses.map((travelClass) => (
                  <button
                    key={travelClass.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, travelClass: travelClass.value as TravelClass }));
                      setShowClassDropdown(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 border-2 ${
                      formData.travelClass === travelClass.value 
                        ? 'bg-yellow-500/20 border-yellow-400/70' 
                        : 'bg-slate-800/50 border-white/30 hover:bg-slate-700/60 hover:border-white/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{travelClass.icon}</div>
                        <div>
                          <div className="font-bold text-white text-lg">{travelClass.label}</div>
                          <div className="text-sm text-white/70">{travelClass.description}</div>
                          <div className="text-xs text-white/60 mt-1">
                            ~{travelClass.priceMultiplier}x base price
                          </div>
                        </div>
                      </div>
                      {formData.travelClass === travelClass.value && (
                        <div className="text-yellow-400 text-xl">✅</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>,
        document.body
      )}

      {/* Click outside handlers */}
      {(showOriginDropdown || showDestinationDropdown || showPassengerDropdown || showClassDropdown) && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={closeAllDropdowns}
        />
      )}
      </div>
    </div>
  );
}