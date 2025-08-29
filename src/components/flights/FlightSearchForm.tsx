/**
 * ULTRA-INNOVATIVE Flight Search Form - Beyond Google Flights, Expedia, Kayak
 * Revolutionary UX with AI-powered search and glassmorphism design
 */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { FlightIcon, CalendarIcon, UsersIcon, SwitchIcon, PlusIcon, MinusIcon } from '@/components/Icons';
import { FlightSearchFormData, AirportSelection, PassengerCounts, TravelClass, FlightSegment } from '@/types/flights';
import { validateFlightSearchForm } from '@/lib/flights/validators';
import { AMADEUS_CONFIG } from '@/lib/flights/amadeus-config';
import EnterpriseDatePicker from '@/components/ui/enterprise-date-picker';

// Import all comprehensive airport databases
import { US_AIRPORTS_DATABASE } from '@/lib/airports/us-airports-database';
import { BRAZIL_AIRPORTS_DATABASE } from '@/lib/airports/brazil-airports-database';
import { SOUTH_AMERICA_AIRPORTS_DATABASE } from '@/lib/airports/south-america-airports-database';
import { NORTH_CENTRAL_AMERICA_AIRPORTS_DATABASE } from '@/lib/airports/north-central-america-airports-database';
import { ASIA_AIRPORTS_DATABASE } from '@/lib/airports/asia-airports-database';
import { EUROPE_AIRPORTS_DATABASE } from '@/lib/airports/europe-airports-database';
import { AFRICA_AIRPORTS_DATABASE } from '@/lib/airports/africa-airports-database';
import { OCEANIA_AIRPORTS_DATABASE } from '@/lib/airports/oceania-airports-database';

interface FlightSearchFormProps {
  onSearch: (searchData: FlightSearchFormData) => void;
  initialData?: Partial<FlightSearchFormData>;
  isLoading?: boolean;
  className?: string;
  openInNewTab?: boolean; // Add option to control behavior
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
  className = '',
  openInNewTab = false 
}: FlightSearchFormProps) {
  // Form state
  const [formData, setFormData] = useState<FlightSearchFormData>({
    tripType: 'round-trip',
    origin: { iataCode: '', name: '', city: '', country: '' },
    destination: { iataCode: '', name: '', city: '', country: '' },
    departureDate: new Date(),
    returnDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Next day by default
    segments: [
      {
        origin: { iataCode: '', name: '', city: '', country: '' },
        destination: { iataCode: '', name: '', city: '', country: '' },
        departureDate: new Date()
      },
      {
        origin: { iataCode: '', name: '', city: '', country: '' },
        destination: { iataCode: '', name: '', city: '', country: '' },
        departureDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // Next day by default
      }
    ],
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'ECONOMY' as TravelClass,
    preferences: {
      nonStop: false,
      flexibleDates: { enabled: false, days: 2 },
      preferredAirlines: []
    },
    ...initialData
  });

  // Search states
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [originResults, setOriginResults] = useState<EnhancedAirportResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<EnhancedAirportResult[]>([]);
  
  // Multi-city segment search states
  const [segmentSearches, setSegmentSearches] = useState<{ origin: string; destination: string }[]>([
    { origin: '', destination: '' },
    { origin: '', destination: '' }
  ]);
  const [segmentResults, setSegmentResults] = useState<{ 
    origin: EnhancedAirportResult[]; 
    destination: EnhancedAirportResult[] 
  }[]>([
    { origin: [], destination: [] },
    { origin: [], destination: [] }
  ]);

  // Dropdown visibility
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  
  // Multi-city segment dropdown visibility
  const [segmentDropdowns, setSegmentDropdowns] = useState<{
    [key: string]: boolean;
  }>({});

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

  // CONSOLIDATED GLOBAL AIRPORT DATABASE from all comprehensive databases
  const createEnhancedAirportsDatabase = useCallback((): EnhancedAirportResult[] => {
    const allAirports: EnhancedAirportResult[] = [];

    // Helper function to convert database airport to enhanced format
    const convertToEnhanced = (airport: any, defaultImageUrl: string): EnhancedAirportResult => {
      // Determine popularity based on passenger count and category
      let popularity = 3; // Default
      if (airport.category === 'major_hub' && airport.passengerCount > 50) popularity = 5;
      else if (airport.category === 'major_hub') popularity = 4;
      else if (airport.category === 'hub' && airport.passengerCount > 20) popularity = 4;
      else if (airport.category === 'hub') popularity = 3;
      else if (airport.passengerCount > 10) popularity = 3;
      else popularity = 2;

      // Determine price index based on region and country
      let priceIndex: 'low' | 'medium' | 'high' = 'medium';
      const highPriceCountries = ['United States', 'United Kingdom', 'Switzerland', 'Norway', 'Japan', 'Australia'];
      const lowPriceCountries = ['India', 'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'Egypt', 'Morocco', 'Brazil', 'Mexico'];
      
      if (airport.country && highPriceCountries.includes(airport.country)) priceIndex = 'high';
      else if (airport.country && lowPriceCountries.includes(airport.country)) priceIndex = 'low';

      // Generate weather emoji based on region/location
      const getWeatherEmoji = (country: string, city: string): string => {
        const weatherMap: { [key: string]: string } = {
          'United Arab Emirates': '🏜️', 'Egypt': '☀️', 'Morocco': '🌞',
          'Norway': '❄️', 'Iceland': '🌨️', 'Finland': '🌨️',
          'United Kingdom': '☁️', 'Ireland': '🌧️', 'Netherlands': '🌦️',
          'Thailand': '🌺', 'Singapore': '🌺', 'Malaysia': '🌺',
          'Australia': '🏖️', 'New Zealand': '🌿', 'Fiji': '🏝️',
          'Japan': '🌸', 'South Korea': '🌸', 'China': '🏮',
          'Brazil': '🎭', 'Argentina': '🥩', 'Chile': '🍷',
          'India': '🕌', 'Pakistan': '🕌', 'Bangladesh': '🕌'
        };
        return weatherMap[country] || '🌤️';
      };

      return {
        iataCode: airport.iataCode,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        region: airport.region || 'Unknown',
        timezone: airport.timezone,
        coordinates: { 
          lat: airport.coordinates?.latitude || 0, 
          lng: airport.coordinates?.longitude || 0 
        },
        popularity,
        isHub: airport.category === 'major_hub' || airport.category === 'hub',
        weather: {
          temp: 72, // Default temp
          condition: 'Clear',
          emoji: getWeatherEmoji(airport.country || '', airport.city || '')
        },
        priceIndex,
        imageUrl: defaultImageUrl
      };
    };

    // Image URLs by region for variety
    const imageUrls = {
      'North America': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80',
      'South America': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&q=80',
      'Europe': 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=400&q=80',
      'Asia': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
      'Africa': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80',
      'Oceania': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
      'Middle East': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80'
    };

    // Convert all airport databases
    US_AIRPORTS_DATABASE.forEach(airport => {
      allAirports.push(convertToEnhanced(airport, imageUrls['North America']));
    });

    BRAZIL_AIRPORTS_DATABASE.forEach(airport => {
      allAirports.push(convertToEnhanced(airport, imageUrls['South America']));
    });

    SOUTH_AMERICA_AIRPORTS_DATABASE.forEach(airport => {
      allAirports.push(convertToEnhanced(airport, imageUrls['South America']));
    });

    NORTH_CENTRAL_AMERICA_AIRPORTS_DATABASE.forEach(airport => {
      allAirports.push(convertToEnhanced(airport, imageUrls['North America']));
    });

    ASIA_AIRPORTS_DATABASE.forEach(airport => {
      allAirports.push(convertToEnhanced(airport, imageUrls['Asia']));
    });

    EUROPE_AIRPORTS_DATABASE.forEach(airport => {
      allAirports.push(convertToEnhanced(airport, imageUrls['Europe']));
    });

    AFRICA_AIRPORTS_DATABASE.forEach(airport => {
      allAirports.push(convertToEnhanced(airport, imageUrls['Africa']));
    });

    OCEANIA_AIRPORTS_DATABASE.forEach(airport => {
      allAirports.push(convertToEnhanced(airport, imageUrls['Oceania']));
    });

    return allAirports.sort((a, b) => {
      // Sort by popularity first, then by passenger count (implied by category)
      if (a.popularity !== b.popularity) return b.popularity - a.popularity;
      if (a.isHub !== b.isHub) return a.isHub ? -1 : 1;
      return (a.city || '').localeCompare(b.city || '');
    });
  }, []);

  // Memoize the enhanced airports database
  const enhancedAirports = useMemo(() => createEnhancedAirportsDatabase(), [createEnhancedAirportsDatabase]);

  // Popular US-focused suggestions
  const popularOrigins = enhancedAirports.filter((a: any) => a.country === 'United States' && a.isHub).slice(0, 6);
  const popularDestinations = [
    ...enhancedAirports.filter((a: any) => a.country !== 'United States' && a.popularity === 5).slice(0, 4),
    ...enhancedAirports.filter((a: any) => a.country === 'United States' && a.city !== 'New York').slice(0, 4)
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
      'europe': enhancedAirports.filter((a: any) => a.region === 'Europe'),
      'asia': enhancedAirports.filter((a: any) => a.region === 'Asia'),
      'caribbean': enhancedAirports.filter((a: any) => a.country?.includes('Caribbean')),
      'south america': enhancedAirports.filter((a: any) => a.region === 'South America'),
    };

    const expandedSearch = [searchTerm];
    
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
    const results = enhancedAirports.filter((airport: any) => {
      return expandedSearch.some(term => 
        airport.city?.toLowerCase().includes(term) ||
        airport.name?.toLowerCase().includes(term) ||
        airport.iataCode?.toLowerCase().includes(term) ||
        airport.country?.toLowerCase().includes(term) ||
        airport.region?.toLowerCase().includes(term)
      );
    });
    
    // ULTRA-INTELLIGENT SORTING ALGORITHM
    return results.sort((a: any, b: any) => {
      // Exact IATA code match gets highest priority
      if (a.iataCode?.toLowerCase() === searchTerm) return -1;
      if (b.iataCode?.toLowerCase() === searchTerm) return 1;
      
      // City name exact match
      if (a.city?.toLowerCase() === searchTerm) return -1;
      if (b.city?.toLowerCase() === searchTerm) return 1;
      
      // Starts with query
      if (a.city?.toLowerCase().startsWith(searchTerm) && !b.city?.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.city?.toLowerCase().startsWith(searchTerm) && !a.city?.toLowerCase().startsWith(searchTerm)) return 1;
      
      // US airports prioritized for US-based service
      if (a.country === 'United States' && b.country !== 'United States') return -1;
      if (b.country === 'United States' && a.country !== 'United States') return 1;
      
      // Major hubs prioritized
      if (a.isHub && !b.isHub) return -1;
      if (b.isHub && !a.isHub) return 1;
      
      // Popularity score
      if (a.popularity > b.popularity) return -1;
      if (b.popularity > a.popularity) return 1;
      
      return (a.city || '').localeCompare(b.city || '');
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

  // Multi-city segment search effects
  useEffect(() => {
    segmentSearches.forEach((search: any, index: number) => {
      if (search.origin.trim().length >= 1) {
        const timeoutId = setTimeout(() => {
          aiSmartSearch(search.origin).then(results => {
            setSegmentResults((prev: any) => prev.map((result: any, i: number) => 
              i === index ? { ...result, origin: results } : result
            ));
          });
        }, 150);
        return () => clearTimeout(timeoutId);
      }
      
      if (search.destination.trim().length >= 1) {
        const timeoutId = setTimeout(() => {
          aiSmartSearch(search.destination).then(results => {
            setSegmentResults((prev: any) => prev.map((result: any, i: number) => 
              i === index ? { ...result, destination: results } : result
            ));
          });
        }, 150);
        return () => clearTimeout(timeoutId);
      }
    });
  }, [segmentSearches, aiSmartSearch]);

  // PERFECT POSITIONING - Below input, never overlapping
  const updateDropdownPosition = (element: HTMLElement | null, key: 'origin' | 'destination' | 'passenger' | 'class') => {
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      setDropdownPositions((prev: any) => ({
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
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const errors = validateFlightSearchForm(formData);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return;
    }

    // Additional validation for multi-city
    if (formData.tripType === 'multi-city') {
      const dateErrors = validateDateSequence();
      if (dateErrors.length > 0) {
        console.error('Date sequence errors:', dateErrors);
        return;
      }
    }

    // Close all dropdowns 
    closeAllDropdowns();
    
    // Build URL parameters for the flights page
    const searchParams = new URLSearchParams();
    
    // Basic search parameters
    if (formData.tripType) searchParams.append('tripType', formData.tripType);
    if (formData.origin?.iataCode) searchParams.append('from', formData.origin.iataCode);
    if (formData.destination?.iataCode) searchParams.append('to', formData.destination.iataCode);
    if (formData.departureDate) searchParams.append('departure', formData.departureDate.toISOString().split('T')[0]);
    if (formData.returnDate) searchParams.append('return', formData.returnDate.toISOString().split('T')[0]);
    
    // Passenger counts
    searchParams.append('adults', formData.passengers.adults.toString());
    if (formData.passengers.children > 0) searchParams.append('children', formData.passengers.children.toString());
    if (formData.passengers.infants > 0) searchParams.append('infants', formData.passengers.infants.toString());
    
    // Travel preferences
    if (formData.travelClass) searchParams.append('class', formData.travelClass);
    if (formData.preferences?.nonStop) searchParams.append('direct', 'true');
    if (formData.preferences?.flexibleDates) {
      const flexDates = formData.preferences.flexibleDates;
      // Check if it's legacy format with enabled/days properties
      if ('enabled' in flexDates && flexDates.enabled) {
        searchParams.append('flexibleDates', 'true');
        searchParams.append('flexibleDays', (flexDates as any).days.toString());
      } else {
        // Enhanced flexible dates format
        searchParams.append('flexibleDates', 'true');
      }
    }
    searchParams.append('currency', 'USD'); // Default currency
    
    // Multi-city segments
    if (formData.tripType === 'multi-city' && formData.segments) {
      searchParams.append('segments', JSON.stringify(formData.segments));
    }
    
    if (openInNewTab) {
      // 🚀 ULTRA-PREMIUM: Open our revolutionary results page in new tab
      const ultraSearchUrl = `/flights/results?${searchParams.toString()}`;
      console.log('🚀 Opening ULTRA-PREMIUM Results:', ultraSearchUrl);
      
      const newTab = window.open(ultraSearchUrl, '_blank', 'noopener,noreferrer');
      if (newTab) {
        newTab.focus();
        
        // Advanced analytics tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'ultra_search_initiated', {
            route: `${formData.origin?.iataCode || 'UNK'}-${formData.destination?.iataCode || 'UNK'}`,
            trip_type: formData.tripType,
            passengers: formData.passengers.adults,
            class: formData.travelClass
          });
        }
      } else {
        // Fallback if popup blocked
        console.warn('🚨 Popup blocked, redirecting current tab');
        window.location.href = ultraSearchUrl;
      }
    } else if (onSearch) {
      // Call the onSearch function for same-page search
      onSearch(formData);
    } else {
      // Fallback: redirect to ultra-premium results in current tab
      const ultraSearchUrl = `/flights/results?${searchParams.toString()}`;
      window.location.href = ultraSearchUrl;
    }
  };

  // Handle swap origin/destination with smooth animation
  const handleSwapAirports = () => {
    setFormData((prev: any) => ({
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
    setSegmentDropdowns({});
  };

  // Multi-City segment management functions
  const addSegment = () => {
    if (formData.segments && formData.segments.length < 6) {
      const lastSegment = formData.segments[formData.segments.length - 1];
      const newSegment: FlightSegment = {
        origin: { iataCode: '', name: '', city: '', country: '' },
        destination: { iataCode: '', name: '', city: '', country: '' },
        departureDate: new Date(lastSegment.departureDate.getTime() + 24 * 60 * 60 * 1000) // Next day
      };
      
      setFormData((prev: any) => ({
        ...prev,
        segments: [...(prev.segments || []), newSegment]
      }));
      
      setSegmentSearches((prev: any) => [...prev, { origin: '', destination: '' }]);
      setSegmentResults((prev: any) => [...prev, { origin: [], destination: [] }]);
    }
  };

  const removeSegment = (index: number) => {
    if (formData.segments && formData.segments.length > 2) {
      setFormData((prev: any) => ({
        ...prev,
        segments: prev.segments?.filter((_: any, i: number) => i !== index)
      }));
      
      setSegmentSearches((prev: any) => prev.filter((_: any, i: number) => i !== index));
      setSegmentResults((prev: any) => prev.filter((_: any, i: number) => i !== index));
    }
  };

  const updateSegment = (index: number, field: keyof FlightSegment, value: any) => {
    setFormData((prev: any) => {
      const newSegments = prev.segments?.map((segment: any, i: number) => 
        i === index ? { ...segment, [field]: value } : segment
      );
      
      // 🧠 SMART AUTO-CONNECTION: When destination of a flight is set, auto-fill origin of next flight
      if (field === 'destination' && value?.iataCode && newSegments && index < newSegments.length - 1) {
        const nextSegment = newSegments[index + 1];
        if (!nextSegment.origin?.iataCode) {
          newSegments[index + 1] = {
            ...nextSegment,
            origin: value // Auto-connect destination → next origin
          };
          console.log(`🔗 Auto-connected Flight ${index + 1} → Flight ${index + 2}: ${value.city || 'Unknown'}`);
        }
      }
      
      return {
        ...prev,
        segments: newSegments
      };
    });
  };

  const updateSegmentSearch = (index: number, field: 'origin' | 'destination', value: string) => {
    setSegmentSearches((prev: any) => prev.map((search: any, i: number) => 
      i === index ? { ...search, [field]: value } : search
    ));
  };

  // Validate date sequence for multi-city with connection time
  const validateDateSequence = (): string[] => {
    const errors: string[] = [];
    if (formData.tripType === 'multi-city' && formData.segments) {
      for (let i = 1; i < formData.segments.length; i++) {
        const prevDate = formData.segments[i - 1].departureDate;
        const currentDate = formData.segments[i].departureDate;
        
        if (currentDate <= prevDate) {
          errors.push(`Flight ${i + 1} departure date must be after Flight ${i} departure date`);
        } else {
          // Check for minimum connection time (at least 2 hours for domestic, 3 hours for international)
          const timeDiff = currentDate.getTime() - prevDate.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // For same day connections, ensure minimum 3 hours
          if (prevDate.toDateString() === currentDate.toDateString() && hoursDiff < 3) {
            errors.push(`Flight ${i + 1} needs at least 3 hours connection time from Flight ${i}`);
          }
        }
      }
    }
    return errors;
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
              ].map((option: any) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, tripType: option.value as any }))}
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ 
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
            {/* REVOLUTIONARY MAIN SEARCH - AI-Powered (Hidden for Multi-City) */}
            {formData.tripType !== 'multi-city' && (
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
                      value={formData.origin?.iataCode ? formData.origin.city : originSearch}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setOriginSearch(value);
                        if (formData.origin?.iataCode && value !== formData.origin?.city) {
                          setFormData((prev: any) => ({ ...prev, origin: { iataCode: '', name: '', city: '', country: '' } }));
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
                    {formData.origin?.iataCode && (
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
                      value={formData.destination?.iataCode ? formData.destination.city : destinationSearch}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setDestinationSearch(value);
                        if (formData.destination?.iataCode && value !== formData.destination?.city) {
                          setFormData((prev: any) => ({ ...prev, destination: { iataCode: '', name: '', city: '', country: '' } }));
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
                    {formData.destination?.iataCode && (
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
            )}

            {/* CONTROLES SECUNDÁRIOS - For Regular Trips Only */}
            {formData.tripType !== 'multi-city' && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${formData.tripType === 'round-trip' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} items-start`}>
                
                {/* Departure Date */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-3">
                    <span className="text-green-400 text-lg">📅</span>
                    <span>Departure</span>
                  </label>
                  <div className="relative">
                    <EnterpriseDatePicker
                      value={formData.departureDate.toLocaleDateString('sv-SE')}
                      onChange={(value) => {
                        const [year, month, day] = value.split('-').map(Number);
                        const localDate = new Date(year, month - 1, day);
                        setFormData((prev: any) => {
                          // If return date is same or before new departure date, set it to next day
                          const newReturnDate = prev.returnDate && prev.returnDate <= localDate 
                            ? new Date(localDate.getTime() + 24 * 60 * 60 * 1000)
                            : prev.returnDate;
                          
                          return { 
                            ...prev, 
                            departureDate: localDate,
                            returnDate: newReturnDate
                          };
                        });
                      }}
                      placeholder="MM/DD/YYYY"
                      minDate={new Date().toLocaleDateString('sv-SE')}
                      className=""
                    />
                  </div>
                  
                  {/* Enhanced Departure Flexibility */}
                  <div className="flex items-center gap-2 ml-2">
                    <input
                      type="checkbox"
                      id="flexible-departure"
                      checked={formData.preferences.enhancedFlexibility?.departure?.enabled || ('enabled' in (formData.preferences.flexibleDates || {}) ? (formData.preferences.flexibleDates as any).enabled : false) || false}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => {
                          const currentEnhanced = prev.preferences.enhancedFlexibility;
                          const legacyDays = ('days' in (prev.preferences.flexibleDates || {}) ? (prev.preferences.flexibleDates as any).days : 2) || 2;
                          
                          return {
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              enhancedFlexibility: {
                                ...currentEnhanced,
                                departure: {
                                  enabled: e.target.checked,
                                  days: currentEnhanced?.departure?.days || legacyDays,
                                  priorityLevel: 'medium'
                                },
                                searchStrategy: 'optimized'
                              },
                              // Keep legacy support
                              flexibleDates: {
                                enabled: e.target.checked,
                                days: currentEnhanced?.departure?.days || legacyDays
                              }
                            }
                          };
                        });
                      }}
                      className="w-3 h-3 text-green-400 bg-transparent border border-white/30 rounded focus:ring-green-400 focus:ring-1"
                    />
                    <label htmlFor="flexible-departure" className="text-xs text-white/80 cursor-pointer">
                      Flexible ±
                    </label>
                    {(formData.preferences.enhancedFlexibility?.departure?.enabled || ('enabled' in (formData.preferences.flexibleDates || {}) ? (formData.preferences.flexibleDates as any).enabled : false)) && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const currentDays = formData.preferences.enhancedFlexibility?.departure?.days || ('days' in (formData.preferences.flexibleDates || {}) ? (formData.preferences.flexibleDates as any).days : 2) || 2;
                            const newDays = Math.max(1, currentDays - 1);
                            setFormData((prev: any) => {
                              const currentEnhanced = prev.preferences.enhancedFlexibility;
                              return {
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  enhancedFlexibility: {
                                    ...currentEnhanced,
                                    departure: {
                                      ...currentEnhanced?.departure,
                                      enabled: true,
                                      days: newDays,
                                      priorityLevel: 'medium'
                                    }
                                  },
                                  flexibleDates: { enabled: true, days: newDays }
                                }
                              };
                            });
                          }}
                          disabled={(formData.preferences.enhancedFlexibility?.departure?.days || ('days' in (formData.preferences.flexibleDates || {}) ? (formData.preferences.flexibleDates as any).days : 2) || 2) === 1}
                          className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white bg-black/20 rounded text-xs disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="text-xs text-white/80 min-w-[1rem] text-center">
                          {formData.preferences.enhancedFlexibility?.departure?.days || ('days' in (formData.preferences.flexibleDates || {}) ? (formData.preferences.flexibleDates as any).days : 2) || 2}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentDays = formData.preferences.enhancedFlexibility?.departure?.days || ('days' in (formData.preferences.flexibleDates || {}) ? (formData.preferences.flexibleDates as any).days : 2) || 2;
                            const newDays = Math.min(7, currentDays + 1);
                            setFormData((prev: any) => {
                              const currentEnhanced = prev.preferences.enhancedFlexibility;
                              return {
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  enhancedFlexibility: {
                                    ...currentEnhanced,
                                    departure: {
                                      ...currentEnhanced?.departure,
                                      enabled: true,
                                      days: newDays,
                                      priorityLevel: 'medium'
                                    }
                                  },
                                  flexibleDates: { enabled: true, days: newDays }
                                }
                              };
                            });
                          }}
                          disabled={(formData.preferences.enhancedFlexibility?.departure?.days || ('days' in (formData.preferences.flexibleDates || {}) ? (formData.preferences.flexibleDates as any).days : 2) || 2) === 7}
                          className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white bg-black/20 rounded text-xs disabled:opacity-30"
                        >
                          +
                        </button>
                        <span className="text-xs text-white/60">days</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Return Date */}
                {formData.tripType === 'round-trip' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-3">
                      <span className="text-orange-400 text-lg">🔄</span>
                      <span>Return</span>
                    </label>
                    <div className="relative">
                      <EnterpriseDatePicker
                        value={formData.returnDate?.toLocaleDateString('sv-SE') || ''}
                        onChange={(value) => {
                          const [year, month, day] = value.split('-').map(Number);
                          const localDate = new Date(year, month - 1, day);
                          setFormData((prev: any) => ({ ...prev, returnDate: localDate }));
                        }}
                        placeholder="MM/DD/YYYY"
                        minDate={new Date(formData.departureDate.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE')}
                        className=""
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="checkbox"
                        id="flexible-return"
                        checked={formData.preferences.enhancedFlexibility?.return?.enabled || false}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setFormData((prev: any) => {
                            const currentEnhanced = prev.preferences.enhancedFlexibility;
                            const departureDays = currentEnhanced?.departure?.days || ('days' in (prev.preferences.flexibleDates || {}) ? (prev.preferences.flexibleDates as any).days : 2) || 2;
                            
                            return {
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                enhancedFlexibility: {
                                  departure: currentEnhanced?.departure || {
                                    enabled: false,
                                    days: 2,
                                    priorityLevel: 'medium' as const
                                  },
                                  return: {
                                    enabled: e.target.checked,
                                    days: currentEnhanced?.return?.days || departureDays,
                                    priorityLevel: 'medium' as const
                                  },
                                  searchStrategy: 'optimized' as const,
                                  maxSearches: currentEnhanced?.maxSearches || 25,
                                  cacheResults: currentEnhanced?.cacheResults || true
                                }
                              }
                            };
                          });
                        }}
                        className="w-3 h-3 text-orange-400 bg-transparent border border-white/30 rounded focus:ring-orange-400 focus:ring-1"
                      />
                      <label htmlFor="flexible-return" className="text-xs text-white/80 cursor-pointer">
                        Flexible ±
                      </label>
                      {formData.preferences.enhancedFlexibility?.return?.enabled && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const currentDays = formData.preferences.enhancedFlexibility?.return?.days || 2;
                              const newDays = Math.max(1, currentDays - 1);
                              setFormData((prev: any) => {
                                const currentEnhanced = prev.preferences.enhancedFlexibility;
                                return {
                                  ...prev,
                                  preferences: {
                                    ...prev.preferences,
                                    enhancedFlexibility: {
                                      departure: currentEnhanced?.departure || {
                                        enabled: false,
                                        days: 2,
                                        priorityLevel: 'medium' as const
                                      },
                                      return: {
                                        ...currentEnhanced?.return,
                                        enabled: true,
                                        days: newDays,
                                        priorityLevel: 'medium' as const
                                      },
                                      searchStrategy: currentEnhanced?.searchStrategy || 'optimized' as const,
                                      maxSearches: currentEnhanced?.maxSearches || 25,
                                      cacheResults: currentEnhanced?.cacheResults || true
                                    }
                                  }
                                };
                              });
                            }}
                            disabled={(formData.preferences.enhancedFlexibility?.return?.days || 2) === 1}
                            className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white bg-black/20 rounded text-xs disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className="text-xs text-white/80 min-w-[1rem] text-center">
                            {formData.preferences.enhancedFlexibility?.return?.days || 2}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentDays = formData.preferences.enhancedFlexibility?.return?.days || 2;
                              const newDays = Math.min(7, currentDays + 1);
                              setFormData((prev: any) => {
                                const currentEnhanced = prev.preferences.enhancedFlexibility;
                                return {
                                  ...prev,
                                  preferences: {
                                    ...prev.preferences,
                                    enhancedFlexibility: {
                                      departure: currentEnhanced?.departure || {
                                        enabled: false,
                                        days: 2,
                                        priorityLevel: 'medium' as const
                                      },
                                      return: {
                                        ...currentEnhanced?.return,
                                        enabled: true,
                                        days: newDays,
                                        priorityLevel: 'medium' as const
                                      },
                                      searchStrategy: currentEnhanced?.searchStrategy || 'optimized' as const,
                                      maxSearches: currentEnhanced?.maxSearches || 25,
                                      cacheResults: currentEnhanced?.cacheResults || true
                                    }
                                  }
                                };
                              });
                            }}
                            disabled={(formData.preferences.enhancedFlexibility?.return?.days || 2) === 7}
                            className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white bg-black/20 rounded text-xs disabled:opacity-30"
                          >
                            +
                          </button>
                          <span className="text-xs text-white/60">days</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Travel Class */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-white/90 ml-2 flex items-center gap-2">
                    <span className="text-yellow-400">✨</span>
                    Class
                  </label>
                  <div className="relative">
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
                </div>

                {/* ULTRA-PREMIUM SEARCH BUTTON */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-white/90 ml-2 opacity-0 pointer-events-none">
                    Search
                  </label>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.origin?.iataCode || !formData.destination?.iataCode}
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
            )}

            {/* 🚀 MULTI-CITY SEGMENTS INTERFACE - Dynamic & Intelligent */}
            {formData.tripType === 'multi-city' && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="text-green-400">🗺️</span>
                    Your Multi-City Journey
                    <span className="text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                      {formData.segments?.length || 0} flights
                    </span>
                  </h3>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={addSegment}
                      disabled={!formData.segments || formData.segments.length >= 6}
                      className="px-4 py-2 bg-gradient-to-r from-green-600/70 to-emerald-600/70 hover:from-green-600/80 hover:to-emerald-600/80 disabled:from-gray-500/50 disabled:to-gray-600/50 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Flight
                    </button>
                  </div>
                </div>

                {/* 🗺️ ROUTE PREVIEW - Visual Journey Map */}
                {formData.segments && formData.segments.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-cyan-400 text-lg">🌐</span>
                      <h4 className="text-lg font-bold text-white">Route Preview</h4>
                    </div>
                    
                    <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
                      {formData.segments.map((segment: any, index: number) => (
                        <div key={`route-${index}`} className="flex items-center gap-2 flex-shrink-0">
                          {/* Origin */}
                          <div className="text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                              segment.origin?.iataCode 
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' 
                                : 'bg-gray-500/30 text-gray-400 border-2 border-dashed border-gray-400'
                            }`}>
                              {segment.origin?.iataCode || '?'}
                            </div>
                            <div className="text-xs text-white/70 mt-1 max-w-20 truncate">
                              {segment.origin?.city || 'Select'}
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-green-400 text-xl animate-pulse">→</div>
                            <div className="text-xs text-white/60">
                              Flight {index + 1}
                            </div>
                          </div>
                          
                          {/* Show destination for last segment */}
                          {index === (formData.segments?.length || 0) - 1 && (
                            <div className="text-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                                segment.destination?.iataCode 
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                                  : 'bg-gray-500/30 text-gray-400 border-2 border-dashed border-gray-400'
                              }`}>
                                {segment.destination?.iataCode || '?'}
                              </div>
                              <div className="text-xs text-white/70 mt-1 max-w-20 truncate">
                                {segment.destination?.city || 'Select'}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Route Summary */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>
                          {formData.segments?.filter(s => s.origin?.iataCode && s.destination?.iataCode).length || 0} / {formData.segments?.length || 0} flights configured
                        </span>
                        <span>
                          {formData.segments.length > 1 
                            ? `${formData.segments.length - 1} connections` 
                            : 'Direct journey'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Flight Segments */}
                <div className="space-y-4">
                  {formData.segments?.map((segment: any, index: number) => (
                    <div key={`segment-${index}`} className="relative">
                      {/* Connection Line for segments after the first */}
                      {index > 0 && (
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-white/80 font-medium">
                              {segment.origin?.iataCode && formData.segments && formData.segments[index - 1]?.destination?.iataCode === segment.origin.iataCode
                                ? `✅ Connected from ${formData.segments[index - 1]?.destination?.city || 'Previous flight'}`
                                : `⚠️ Connection required`
                              }
                            </span>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                        {/* Segment Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              index === formData.segments!.length - 1 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                              'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                Flight {index + 1}
                                {index === 0 && <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded-full">Departure</span>}
                                {index === formData.segments!.length - 1 && <span className="text-xs bg-red-500/30 text-red-300 px-2 py-1 rounded-full">Final</span>}
                                {index > 0 && index < formData.segments!.length - 1 && <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">Connection</span>}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-white/70">
                                <span>
                                  {segment.departureDate.toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                {/* Connection Time Indicator */}
                                {index > 0 && formData.segments && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-orange-400">⏱️</span>
                                    {(() => {
                                      const prevDate = formData.segments[index - 1].departureDate;
                                      const currentDate = segment.departureDate;
                                      const hoursDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60);
                                      
                                      if (prevDate.toDateString() === currentDate.toDateString()) {
                                        return `${hoursDiff.toFixed(1)}h connection`;
                                      } else {
                                        const daysDiff = Math.floor(hoursDiff / 24);
                                        return `${daysDiff}d ${(hoursDiff % 24).toFixed(0)}h layover`;
                                      }
                                    })()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          {formData.segments && formData.segments.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeSegment(index)}
                              className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 hover:border-red-400/60 rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 transition-all duration-300"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      {/* Segment Form */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* From */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90 flex items-center gap-2">
                            <span className="text-blue-400">✈️</span>
                            From
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={segment.origin?.iataCode ? segment.origin.city : segmentSearches[index]?.origin || ''}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                updateSegmentSearch(index, 'origin', value);
                                if (segment.origin?.iataCode && value !== segment.origin?.city) {
                                  updateSegment(index, 'origin', { iataCode: '', name: '', city: '', country: '' });
                                }
                              }}
                              onFocus={() => {
                                closeAllDropdowns();
                                setSegmentDropdowns({ [`segment-${index}-origin`]: true });
                              }}
                              placeholder="City or airport..."
                              className="w-full px-4 py-3 bg-transparent border-2 border-white/20 rounded-xl focus:border-blue-400/80 focus:ring-0 text-white placeholder-white/70 transition-all duration-300 hover:border-white/40"
                            />
                            {segment.origin?.iataCode && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500/80 text-white text-xs font-bold px-2 py-1 rounded">
                                {segment.origin.iataCode}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* To */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90 flex items-center gap-2">
                            <span className="text-purple-400">🌍</span>
                            To
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={segment.destination?.iataCode ? segment.destination.city : segmentSearches[index]?.destination || ''}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                updateSegmentSearch(index, 'destination', value);
                                if (segment.destination?.iataCode && value !== segment.destination?.city) {
                                  updateSegment(index, 'destination', { iataCode: '', name: '', city: '', country: '' });
                                }
                              }}
                              onFocus={() => {
                                closeAllDropdowns();
                                setSegmentDropdowns({ [`segment-${index}-destination`]: true });
                              }}
                              placeholder="City or airport..."
                              className="w-full px-4 py-3 bg-transparent border-2 border-white/20 rounded-xl focus:border-purple-400/80 focus:ring-0 text-white placeholder-white/70 transition-all duration-300 hover:border-white/40"
                            />
                            {segment.destination?.iataCode && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-500/80 text-white text-xs font-bold px-2 py-1 rounded">
                                {segment.destination.iataCode}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90 flex items-center gap-2">
                            <span className="text-green-400">📅</span>
                            Departure
                          </label>
                          <EnterpriseDatePicker
                            value={segment.departureDate.toLocaleDateString('sv-SE')}
                            onChange={(value) => {
                              const [year, month, day] = value.split('-').map(Number);
                              const localDate = new Date(year, month - 1, day);
                              updateSegment(index, 'departureDate', localDate);
                            }}
                            placeholder="MM/DD/YYYY"
                            minDate={index === 0 ? new Date().toLocaleDateString('sv-SE') : 
                              formData.segments?.[index - 1]?.departureDate.toLocaleDateString('sv-SE')}
                            className=""
                          />
                          
                          {/* Multi-City Segment Flexibility */}
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              id={`flexible-segment-${index}`}
                              checked={
                                formData.preferences.multiCityFlexibility?.segments?.find(s => s.segmentIndex === index)?.departure?.enabled || false
                              }
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setFormData((prev: any) => {
                                  const currentMultiCity = prev.preferences.multiCityFlexibility;
                                  const currentSegments = currentMultiCity?.segments || [];
                                  const existingSegmentIndex = currentSegments.findIndex((s: any) => s.segmentIndex === index);
                                  
                                  let updatedSegments;
                                  if (existingSegmentIndex >= 0) {
                                    // Update existing segment
                                    updatedSegments = [...currentSegments];
                                    updatedSegments[existingSegmentIndex] = {
                                      ...updatedSegments[existingSegmentIndex],
                                      departure: {
                                        enabled: e.target.checked,
                                        days: updatedSegments[existingSegmentIndex].departure.days || 2,
                                        priorityLevel: 'medium' as const
                                      }
                                    };
                                  } else {
                                    // Add new segment
                                    updatedSegments = [
                                      ...currentSegments,
                                      {
                                        segmentIndex: index,
                                        departure: {
                                          enabled: e.target.checked,
                                          days: 2,
                                          priorityLevel: 'medium' as const,
                                          dependsOnPrevious: index > 0
                                        },
                                        constraints: {
                                          minLayoverHours: 2,
                                          maxLayoverHours: 24
                                        }
                                      }
                                    ];
                                  }
                                  
                                  return {
                                    ...prev,
                                    preferences: {
                                      ...prev.preferences,
                                      multiCityFlexibility: {
                                        segments: updatedSegments
                                      }
                                    }
                                  };
                                });
                              }}
                              className="w-3 h-3 text-green-400 bg-transparent border border-white/30 rounded focus:ring-green-400 focus:ring-1"
                            />
                            <label htmlFor={`flexible-segment-${index}`} className="text-xs text-white/80 cursor-pointer">
                              Flexible ±
                            </label>
                            {formData.preferences.multiCityFlexibility?.segments?.find(s => s.segmentIndex === index)?.departure?.enabled && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev: any) => {
                                      const currentMultiCity = prev.preferences.multiCityFlexibility;
                                      const currentSegments = currentMultiCity?.segments || [];
                                      const segmentIndex = currentSegments.findIndex((s: any) => s.segmentIndex === index);
                                      
                                      if (segmentIndex >= 0) {
                                        const currentDays = currentSegments[segmentIndex].departure.days;
                                        const newDays = Math.max(1, currentDays - 1);
                                        
                                        const updatedSegments = [...currentSegments];
                                        updatedSegments[segmentIndex] = {
                                          ...updatedSegments[segmentIndex],
                                          departure: {
                                            ...updatedSegments[segmentIndex].departure,
                                            days: newDays
                                          }
                                        };
                                        
                                        return {
                                          ...prev,
                                          preferences: {
                                            ...prev.preferences,
                                            multiCityFlexibility: {
                                              segments: updatedSegments
                                            }
                                          }
                                        };
                                      }
                                      return prev;
                                    });
                                  }}
                                  disabled={(formData.preferences.multiCityFlexibility?.segments?.find(s => s.segmentIndex === index)?.departure?.days || 2) === 1}
                                  className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white bg-black/20 rounded text-xs disabled:opacity-30"
                                >
                                  −
                                </button>
                                <span className="text-xs text-white/80 min-w-[1rem] text-center">
                                  {formData.preferences.multiCityFlexibility?.segments?.find(s => s.segmentIndex === index)?.departure?.days || 2}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev: any) => {
                                      const currentMultiCity = prev.preferences.multiCityFlexibility;
                                      const currentSegments = currentMultiCity?.segments || [];
                                      const segmentIndex = currentSegments.findIndex((s: any) => s.segmentIndex === index);
                                      
                                      if (segmentIndex >= 0) {
                                        const currentDays = currentSegments[segmentIndex].departure.days;
                                        const newDays = Math.min(7, currentDays + 1);
                                        
                                        const updatedSegments = [...currentSegments];
                                        updatedSegments[segmentIndex] = {
                                          ...updatedSegments[segmentIndex],
                                          departure: {
                                            ...updatedSegments[segmentIndex].departure,
                                            days: newDays
                                          }
                                        };
                                        
                                        return {
                                          ...prev,
                                          preferences: {
                                            ...prev.preferences,
                                            multiCityFlexibility: {
                                              segments: updatedSegments
                                            }
                                          }
                                        };
                                      }
                                      return prev;
                                    });
                                  }}
                                  disabled={(formData.preferences.multiCityFlexibility?.segments?.find(s => s.segmentIndex === index)?.departure?.days || 2) === 7}
                                  className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white bg-black/20 rounded text-xs disabled:opacity-30"
                                >
                                  +
                                </button>
                                <span className="text-xs text-white/60">days</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>

                {/* MULTI-CITY COMMON CONTROLS - Travelers, Class & Search */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                  
                  {/* Travelers */}
                  <div className="space-y-3">
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

                  {/* MULTI-CITY SEARCH BUTTON */}
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isLoading || !formData.segments?.every(s => s.origin?.iataCode && s.destination?.iataCode)}
                      className="w-full px-8 py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:from-gray-500/50 disabled:via-gray-600/50 disabled:to-gray-500/50 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-lg transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden group backdrop-blur-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Searching...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-2xl">🗺️</span>
                          <span>Search Multi-City</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    {popularOrigins.map((airport: any) => (
                      <button
                        key={`popular-origin-${airport.iataCode}`}
                        type="button"
                        className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-white/50"
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, origin: {
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
                    {originResults.map((airport: any, index: number) => (
                      <button
                        key={`origin-${airport.iataCode}-${index}`}
                        type="button"
                        className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-blue-400/60"
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, origin: {
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
                    {popularDestinations.map((airport: any) => (
                      <button
                        key={`popular-dest-${airport.iataCode}`}
                        type="button"
                        className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-purple-400/60"
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, destination: {
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
                    {destinationResults.map((airport: any, index: number) => (
                      <button
                        key={`destination-${airport.iataCode}-${index}`}
                        type="button"
                        className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-purple-400/60"
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, destination: {
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
                      onClick={() => setFormData((prev: any) => ({
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
                      onClick={() => setFormData((prev: any) => ({
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
                      onClick={() => setFormData((prev: any) => ({
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
                      onClick={() => setFormData((prev: any) => ({
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
                      onClick={() => setFormData((prev: any) => ({
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
                      onClick={() => setFormData((prev: any) => ({
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
                {travelClasses.map((travelClass: any) => (
                  <button
                    key={travelClass.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => ({ ...prev, travelClass: travelClass.value as TravelClass }));
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

          {/* MULTI-CITY SEGMENT DROPDOWNS */}
          {Object.entries(segmentDropdowns).map(([key, isVisible]) => {
            if (!isVisible) return null;
            
            const [, segmentIndex, field] = key.split('-');
            const index = parseInt(segmentIndex);
            const isOrigin = field === 'origin';
            const searchValue = segmentSearches[index]?.[field as 'origin' | 'destination'] || '';
            const results = segmentResults[index]?.[field as 'origin' | 'destination'] || [];
            
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  top: 0, // Will be dynamically positioned
                  left: 0,
                  width: 400,
                  zIndex: 99999,
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
                className="backdrop-blur-xl bg-slate-900/80 border border-white/30 rounded-2xl shadow-2xl p-6"
              >
                {/* Search Results */}
                {searchValue && results.length > 0 && (
                  <div>
                    <div className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                      <span className="text-green-400">🤖</span>
                      AI found {results.length} result{results.length !== 1 ? 's' : ''}
                    </div>
                    <div className="space-y-2">
                      {results.map((airport: any, airportIndex: number) => (
                        <button
                          key={`${key}-${airport.iataCode}-${airportIndex}`}
                          type="button"
                          className="w-full text-left p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30 hover:border-blue-400/60"
                          onClick={() => {
                            updateSegment(index, isOrigin ? 'origin' : 'destination', {
                              iataCode: airport.iataCode,
                              name: airport.name,
                              city: airport.city,
                              country: airport.country
                            });
                            updateSegmentSearch(index, field as 'origin' | 'destination', '');
                            setSegmentDropdowns({});
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/30 flex-shrink-0">
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
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">
                                  {airport.region}
                                </span>
                                {airport.weather && (
                                  <span className="text-xs text-white/60">
                                    {airport.weather.emoji} {airport.weather.temp}°F
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-white bg-blue-500/30 px-2 py-1 rounded flex-shrink-0">
                              {airport.iataCode}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Options */}
                {(!searchValue || results.length === 0) && (
                  <div>
                    <div className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                      <span className={isOrigin ? "text-blue-400" : "text-purple-400"}>
                        {isOrigin ? "✈️" : "🌍"}
                      </span>
                      {isOrigin ? 'Popular Departures' : 'Popular Destinations'}
                    </div>
                    <div className="space-y-2">
                      {(isOrigin ? popularOrigins : popularDestinations).slice(0, 6).map((airport: any) => (
                        <button
                          key={`${key}-popular-${airport.iataCode}`}
                          type="button"
                          className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 group border border-white/30"
                          onClick={() => {
                            updateSegment(index, isOrigin ? 'origin' : 'destination', {
                              iataCode: airport.iataCode,
                              name: airport.name,
                              city: airport.city,
                              country: airport.country
                            });
                            updateSegmentSearch(index, field as 'origin' | 'destination', '');
                            setSegmentDropdowns({});
                          }}  
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-xl">
                              {isOrigin ? '✈️' : '🌍'}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-white group-hover:text-blue-300 transition-colors">
                                {airport.city}
                              </div>
                              <div className="text-sm text-white/70 truncate">
                                {airport.country}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-white/80 bg-white/10 px-2 py-1 rounded">
                              {airport.iataCode}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>,
        document.body
      )}

      {/* Click outside handlers */}
      {(showOriginDropdown || showDestinationDropdown || showPassengerDropdown || showClassDropdown || Object.values(segmentDropdowns).some(Boolean)) && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={closeAllDropdowns}
        />
      )}

      </div>
    </div>
  );
}