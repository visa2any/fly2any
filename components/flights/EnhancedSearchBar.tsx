'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Plane, Calendar, Users, ChevronDown, ArrowLeftRight, PlaneTakeoff, PlaneLanding, CalendarDays, CalendarCheck, ArrowRight, Sparkles, Armchair, X, Hotel, Car, Map, MapPin, Building2, Plus, Minus, Activity, Package, Shield, Check, Globe, Navigation, LogIn, LogOut, BedDouble, Moon, User, Baby } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { typography, spacing, colors, dimensions, layout, borderRadius, zIndex } from '@/lib/design-system';
import PremiumDatePicker from './PremiumDatePicker';
import { InlineAirportAutocomplete } from './InlineAirportAutocomplete';
import MultiAirportSelector, { Airport as MultiAirport } from '@/components/common/MultiAirportSelector';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

type ServiceType = 'flights' | 'hotels' | 'cars' | 'tours' | 'activities' | 'transfers' | 'packages' | 'insurance';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface EnhancedSearchBarProps {
  // Flight-specific props
  origin?: string;  // Can be single code "JFK" or comma-separated "JFK,EWR,LGA"
  destination?: string;  // Can be single code "LAX" or comma-separated "LAX,SNA,ONT"
  departureDate?: string;
  returnDate?: string;
  passengers?: PassengerCounts;
  cabinClass?: 'economy' | 'premium' | 'business' | 'first';

  // Hotel-specific props
  hotelDestination?: string;  // City or place name for hotel search
  hotelCheckIn?: string;  // Check-in date (YYYY-MM-DD)
  hotelCheckOut?: string;  // Check-out date (YYYY-MM-DD)
  hotelAdults?: number;  // Number of adults
  hotelChildren?: number;  // Number of children
  hotelRooms?: number;  // Number of rooms
  hotelLat?: number;  // Location latitude (for preserving search context)
  hotelLng?: number;  // Location longitude (for preserving search context)
  hotelDistricts?: string;  // Comma-separated district names (for preserving popular areas)

  // Common props
  lang?: 'en' | 'pt' | 'es';
  defaultService?: ServiceType;  // Default tab to show (flights, hotels, cars, tours)
  
  // Callbacks
  onSearchSubmit?: () => void;  // Called when search is submitted (for mobile auto-collapse)

  // Layout options
  hideTabs?: boolean;  // Hide the service tabs (for Journey page)
  journeyMode?: boolean;  // When true, redirects to /journey/builder instead of /flights/results
}

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  emoji: string;
}

// Popular airports data (same as InlineAirportAutocomplete for consistency)
const popularAirports: Airport[] = [
  // North America - USA
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', emoji: '🗽' },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', emoji: '🌴' },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', emoji: '🏖️' },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', emoji: '🌉' },
  { code: 'ORD', name: 'O\'Hare Intl', city: 'Chicago', country: 'USA', emoji: '🏙️' },
  { code: 'DEN', name: 'Denver Intl', city: 'Denver', country: 'USA', emoji: '🏔️' },
  { code: 'ATL', name: 'Hartsfield-Jackson', city: 'Atlanta', country: 'USA', emoji: '🍑' },
  { code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle', country: 'USA', emoji: '☕' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA', emoji: '🤠' },
  { code: 'HNL', name: 'Daniel K. Inouye Intl', city: 'Honolulu', country: 'USA', emoji: '🌺' },
  { code: 'OGG', name: 'Kahului Airport', city: 'Maui', country: 'USA', emoji: '🏝️' },

  // North America - Canada
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada', emoji: '🇨🇦' },
  { code: 'YVR', name: 'Vancouver Intl', city: 'Vancouver', country: 'Canada', emoji: '🏔️' },

  // Mexico & Central America
  { code: 'MEX', name: 'Mexico City Intl', city: 'Mexico City', country: 'Mexico', emoji: '🌮' },
  { code: 'CUN', name: 'Cancún Intl', city: 'Cancún', country: 'Mexico', emoji: '🏝️' },
  { code: 'PVR', name: 'Lic. Gustavo Díaz Ordaz Intl', city: 'Puerto Vallarta', country: 'Mexico', emoji: '🌊' },
  { code: 'CZM', name: 'Cozumel Intl', city: 'Cozumel', country: 'Mexico', emoji: '🏖️' },
  { code: 'SJD', name: 'Los Cabos Intl', city: 'Los Cabos', country: 'Mexico', emoji: '🌅' },
  { code: 'GDL', name: 'Guadalajara Intl', city: 'Guadalajara', country: 'Mexico', emoji: '🎺' },
  { code: 'PTY', name: 'Tocumen Intl', city: 'Panama City', country: 'Panama', emoji: '🚢' },
  { code: 'SJO', name: 'Juan Santamaría Intl', city: 'San José', country: 'Costa Rica', emoji: '🌋' },
  { code: 'BZE', name: 'Philip S. W. Goldson Intl', city: 'Belize City', country: 'Belize', emoji: '🐠' },

  // South America
  { code: 'GRU', name: 'São Paulo/Guarulhos Intl', city: 'São Paulo', country: 'Brazil', emoji: '🇧🇷' },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão Intl', city: 'Rio de Janeiro', country: 'Brazil', emoji: '🏖️' },
  { code: 'EZE', name: 'Ministro Pistarini Intl', city: 'Buenos Aires', country: 'Argentina', emoji: '🥩' },
  { code: 'BOG', name: 'El Dorado Intl', city: 'Bogotá', country: 'Colombia', emoji: '☕' },
  { code: 'LIM', name: 'Jorge Chávez Intl', city: 'Lima', country: 'Peru', emoji: '🦙' },
  { code: 'SCL', name: 'Arturo Merino Benítez Intl', city: 'Santiago', country: 'Chile', emoji: '🏔️' },

  // Caribbean
  { code: 'PUJ', name: 'Punta Cana Intl', city: 'Punta Cana', country: 'Dominican Republic', emoji: '🏖️' },
  { code: 'SJU', name: 'Luis Muñoz Marín Intl', city: 'San Juan', country: 'Puerto Rico', emoji: '🏝️' },
  { code: 'NAS', name: 'Lynden Pindling Intl', city: 'Nassau', country: 'Bahamas', emoji: '🐠' },
  { code: 'MBJ', name: 'Sangster Intl', city: 'Montego Bay', country: 'Jamaica', emoji: '🎵' },
  { code: 'CUR', name: 'Curaçao Intl', city: 'Willemstad', country: 'Curaçao', emoji: '🎨' },
  { code: 'AUA', name: 'Queen Beatrix Intl', city: 'Aruba', country: 'Aruba', emoji: '🌴' },
  { code: 'BGI', name: 'Grantley Adams Intl', city: 'Bridgetown', country: 'Barbados', emoji: '🏖️' },
  { code: 'SXM', name: 'Princess Juliana Intl', city: 'Philipsburg', country: 'St. Maarten', emoji: '🛬' },
  { code: 'GCM', name: 'Owen Roberts Intl', city: 'George Town', country: 'Cayman Islands', emoji: '🏝️' },

  // Europe - Western
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', emoji: '🇬🇧' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', emoji: '🗼' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', emoji: '🇩🇪' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', emoji: '🌷' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', emoji: '🇪🇸' },
  { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', emoji: '🏖️' },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', emoji: '🏛️' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', emoji: '🏔️' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', emoji: '🍀' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', emoji: '🍺' },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', emoji: '🇵🇹' },
  { code: 'VIE', name: 'Vienna Intl', city: 'Vienna', country: 'Austria', emoji: '🎻' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', emoji: '🇩🇰' },
  { code: 'ATH', name: 'Athens Intl', city: 'Athens', country: 'Greece', emoji: '🏛️' },
  { code: 'PRG', name: 'Václav Havel Airport', city: 'Prague', country: 'Czech Republic', emoji: '🏰' },

  // Asia-Pacific
  { code: 'NRT', name: 'Narita Intl', city: 'Tokyo', country: 'Japan', emoji: '🗾' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', emoji: '🗼' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', emoji: '🇸🇬' },
  { code: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong', country: 'Hong Kong', emoji: '🏙️' },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', emoji: '🦘' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', emoji: '🏙️' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', emoji: '🛕' },
  { code: 'ICN', name: 'Incheon Intl', city: 'Seoul', country: 'South Korea', emoji: '🇰🇷' },
  { code: 'DEL', name: 'Indira Gandhi Intl', city: 'New Delhi', country: 'India', emoji: '🇮🇳' },
  { code: 'DPS', name: 'Ngurah Rai Intl', city: 'Bali', country: 'Indonesia', emoji: '🏝️' },
  { code: 'MNL', name: 'Ninoy Aquino Intl', city: 'Manila', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'TPE', name: 'Taiwan Taoyuan Intl', city: 'Taipei', country: 'Taiwan', emoji: '🇹🇼' },
  { code: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur', country: 'Malaysia', emoji: '🇲🇾' },
  { code: 'PVG', name: 'Shanghai Pudong Intl', city: 'Shanghai', country: 'China', emoji: '🏙️' },
  { code: 'PEK', name: 'Beijing Capital Intl', city: 'Beijing', country: 'China', emoji: '🇨🇳' },

  // Middle East
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', emoji: '🏙️' },

  // Special/Beach destinations
  { code: 'MLE', name: 'Velana Intl', city: 'Malé', country: 'Maldives', emoji: '🏝️' },
];

// Lookup airport by code
function lookupAirportByCode(code: string): Airport | null {
  if (!code) return null;
  const upperCode = code.toUpperCase().trim();
  return popularAirports.find(airport => airport.code === upperCode) || null;
}

export default function EnhancedSearchBar({
  // Flight props
  origin: initialOrigin = '',
  destination: initialDestination = '',
  departureDate: initialDepartureDate = '',
  returnDate: initialReturnDate = '',
  passengers: initialPassengers = { adults: 1, children: 0, infants: 0 },
  cabinClass: initialCabinClass = 'economy',

  // Hotel props
  hotelDestination: initialHotelDestination = '',
  hotelCheckIn: initialHotelCheckIn = '',
  hotelCheckOut: initialHotelCheckOut = '',
  hotelAdults: initialHotelAdults = 2,
  hotelChildren: initialHotelChildren = 0,
  hotelRooms: initialHotelRooms = 1,
  hotelLat: initialHotelLat,
  hotelLng: initialHotelLng,
  hotelDistricts: initialHotelDistricts = '',

  // Common props
  lang = 'en',
  defaultService = 'flights',
  onSearchSubmit,
  hideTabs = false,
  journeyMode = false,
}: EnhancedSearchBarProps) {
  const t = useTranslations('FlightSearch');
  const router = useRouter();

  // Parse comma-separated airport codes into arrays
  const parseAirportCodes = (codes: string): string[] => {
    if (!codes) return [];
    return codes.split(',').map(code => code.trim()).filter(code => code.length > 0);
  };

  // Parse comma-separated date strings into Date arrays
  const parseDateString = (dateString: string): Date[] => {
    if (!dateString) return [];
    const dates = dateString.split(',').map(d => d.trim()).filter(d => d.length > 0);
    return dates.map(d => new Date(d + 'T00:00:00')); // Add time to ensure correct timezone
  };

  // Detect if we should use multi-date mode based on initial props
  const detectMultiDateMode = (): boolean => {
    return initialDepartureDate?.includes(',') || initialReturnDate?.includes(',');
  };

  const isMultiDateMode = detectMultiDateMode();

  // Service type state (defaults to defaultService prop)
  const [serviceType, setServiceType] = useState<ServiceType>(defaultService);

  // Transition for non-blocking updates
  const [, startTransition] = useTransition();

  // Form state
  const [origin, setOrigin] = useState<string[]>(parseAirportCodes(initialOrigin));
  const [destination, setDestination] = useState<string[]>(parseAirportCodes(initialDestination));
  const [departureDate, setDepartureDate] = useState(isMultiDateMode ? '' : initialDepartureDate);
  const [departureDates, setDepartureDates] = useState<Date[]>(isMultiDateMode ? parseDateString(initialDepartureDate) : []);
  const [returnDate, setReturnDate] = useState(isMultiDateMode ? '' : initialReturnDate);
  const [returnDates, setReturnDates] = useState<Date[]>(isMultiDateMode ? parseDateString(initialReturnDate) : []);
  const [useFlexibleDates, setUseFlexibleDates] = useState(isMultiDateMode); // Auto-enable if comma-separated dates detected
  const [passengers, setPassengers] = useState(initialPassengers);
  const [cabinClass, setCabinClass] = useState(initialCabinClass);
  // DEFAULT TO ROUND-TRIP for home page
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [directFlights, setDirectFlights] = useState(false);
  const [includeSeparateTickets, setIncludeSeparateTickets] = useState(true); // "Hacker Fares" - default ON for best prices

  // Independent nonstop filters for outbound and return flights
  const [fromNonstop, setFromNonstop] = useState(false);
  const [toNonstop, setToNonstop] = useState(false);

  // Hotel-specific state (initialized from props)
  const [hotelDestination, setHotelDestination] = useState(initialHotelDestination);
  // Initialize hotel location from props if available
  const [hotelLocation, setHotelLocation] = useState<{ lat: number; lng: number } | null>(
    initialHotelLat && initialHotelLng ? { lat: initialHotelLat, lng: initialHotelLng } : null
  );
  const [checkInDate, setCheckInDate] = useState(initialHotelCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialHotelCheckOut);
  const [hotelAdults, setHotelAdults] = useState(initialHotelAdults);
  const [hotelChildren, setHotelChildren] = useState(initialHotelChildren);
  const [hotelChildAges, setHotelChildAges] = useState<number[]>([]); // Ages for accurate pricing (0-17)
  const [hotelInfants, setHotelInfants] = useState(0); // Infants under 2 (0-1 years, FREE at most hotels!)
  const [hotelRooms, setHotelRooms] = useState(initialHotelRooms);
  const [hotelSuggestions, setHotelSuggestions] = useState<any[]>([]);
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [showHotelGuestPicker, setShowHotelGuestPicker] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [isLoadingHotelSuggestions, setIsLoadingHotelSuggestions] = useState(false);
  const [showHotelCheckInPicker, setShowHotelCheckInPicker] = useState(false);
  const [showHotelCheckOutPicker, setShowHotelCheckOutPicker] = useState(false);
  const [showHotelDateRangePicker, setShowHotelDateRangePicker] = useState(false); // Unified date range picker
  const [popularDistricts, setPopularDistricts] = useState<Array<{ id: string; name: string; city: string; location: { lat: number; lng: number } }>>([]);

  // Multi-select districts state - parse from comma-separated string if provided
  // Using explicit arrow function lazy initializer for reliable prop access
  const [selectedDistricts, setSelectedDistricts] = useState<Array<{ id: string; name: string; location: { lat: number; lng: number } }>>(() => {
    console.log('🔥 Initializing selectedDistricts from prop:', initialHotelDistricts);
    if (!initialHotelDistricts) return [];
    const parsed = initialHotelDistricts.split(',').map(name => name.trim()).filter(name => name).map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      location: initialHotelLat && initialHotelLng ? { lat: initialHotelLat, lng: initialHotelLng } : { lat: 0, lng: 0 }
    }));
    console.log('🔥 Parsed districts:', parsed);
    return parsed;
  });

  // Selected destination details for enhanced display
  // Initialize from props if destination was provided (e.g., from results page)
  const [selectedDestinationDetails, setSelectedDestinationDetails] = useState<{
    name: string;
    country: string;
    emoji?: string;
    type?: string;
    categories?: string[];
  } | null>(initialHotelDestination ? {
    name: initialHotelDestination,
    country: '', // Will be empty when coming from results page
    type: 'city'
  } : null);

  // Car rental-specific state
  const [carPickupLocation, setCarPickupLocation] = useState('');
  const [carDropoffLocation, setCarDropoffLocation] = useState('');
  const [sameDropoffLocation, setSameDropoffLocation] = useState(false); // Return to same location
  const [carPickupDate, setCarPickupDate] = useState('');
  const [carDropoffDate, setCarDropoffDate] = useState('');
  const [carPickupTime, setCarPickupTime] = useState('10:00');
  const [carDropoffTime, setCarDropoffTime] = useState('10:00');
  const [showCarPickupDatePicker, setShowCarPickupDatePicker] = useState(false);
  const [showCarDropoffDatePicker, setShowCarDropoffDatePicker] = useState(false);

  // Transfer location suggestions state
  const [transferSuggestions, setTransferSuggestions] = useState<any[]>([]);
  const [showTransferPickupSuggestions, setShowTransferPickupSuggestions] = useState(false);
  const [showTransferDropoffSuggestions, setShowTransferDropoffSuggestions] = useState(false);
  const [isLoadingTransferSuggestions, setIsLoadingTransferSuggestions] = useState(false);
  const transferSuggestionsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calendar price display state
  const [calendarPrices, setCalendarPrices] = useState<{ [date: string]: number }>({});
  const [loadingCalendarPrices, setLoadingCalendarPrices] = useState(false);
  const fetchingCalendarPricesRef = useRef(false); // Deduplication guard
  const preFetchTimerRef = useRef<NodeJS.Timeout | null>(null); // Pre-fetch debounce timer
  const hotelSuggestionsTimerRef = useRef<NodeJS.Timeout | null>(null); // Hotel suggestions debounce timer

  // Multi-city flights state (only for one-way mode)
  interface AdditionalFlight {
    id: string;
    origin: string[];
    destination: string[];
    departureDate: string;
    nonstop: boolean;
  }
  const [additionalFlights, setAdditionalFlights] = useState<AdditionalFlight[]>([]);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null); // Accordion: track which flight card is expanded (mobile)
  const [additionalFlightDatePickerOpen, setAdditionalFlightDatePickerOpen] = useState<string | null>(null); // Track which flight's date picker is open
  const additionalFlightDateRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({}); // Refs for each additional flight date button

  // UI state
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'departure' | 'return'>('departure');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Refs
  const passengerRef = useRef<HTMLDivElement>(null);
  const departureDateRef = useRef<HTMLButtonElement>(null);
  const returnDateRef = useRef<HTMLButtonElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const hotelDestinationRef = useRef<HTMLDivElement>(null);
  const hotelCheckInRef = useRef<HTMLButtonElement>(null);
  const hotelCheckOutRef = useRef<HTMLButtonElement>(null);
  const hotelDateRangeRef = useRef<HTMLButtonElement>(null); // Unified date range button ref
  const carPickupDateRef = useRef<HTMLButtonElement>(null);
  const carDropoffDateRef = useRef<HTMLButtonElement>(null);

  // Set default dates for hotels and minDate (prevent hydration errors)
  // Only set default dates if not provided via props (e.g., from results page)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    // Format dates in local timezone to avoid off-by-one errors
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setMinDate(formatLocalDate(today));

    // Only set defaults if not provided via props
    if (!initialHotelCheckIn) {
      setCheckInDate(formatLocalDate(tomorrow));
    }
    if (!initialHotelCheckOut) {
      setCheckOutDate(formatLocalDate(dayAfter));
    }
  }, [initialHotelCheckIn, initialHotelCheckOut]);

  // Debug: Log state preservation from props
  useEffect(() => {
    console.log('🏨 EnhancedSearchBar mounted with props:', {
      destination: initialHotelDestination,
      districts: initialHotelDistricts,
      lat: initialHotelLat,
      lng: initialHotelLng,
      checkIn: initialHotelCheckIn,
      checkOut: initialHotelCheckOut,
    });
    console.log('🏨 Initial state values:', {
      hotelDestination,
      selectedDistricts,
      hotelLocation,
      checkInDate,
      checkOutDate,
    });
  }, []); // Empty deps - only run on mount

  // Fetch popular districts when a hotel destination is selected
  useEffect(() => {
    if (!hotelDestination || !hotelLocation) {
      setPopularDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        const response = await fetch(`/api/hotels/districts?city=${encodeURIComponent(hotelDestination)}`);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setPopularDistricts(data.data.slice(0, 8));
        } else {
          setPopularDistricts([]);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        setPopularDistricts([]);
      }
    };

    const delayFetch = setTimeout(fetchDistricts, 300);
    return () => clearTimeout(delayFetch);
  }, [hotelDestination, hotelLocation]);

  // Debounced hotel suggestions fetch - moved out of event handler for INP optimization
  useEffect(() => {
    if (hotelSuggestionsTimerRef.current) {
      clearTimeout(hotelSuggestionsTimerRef.current);
    }

    hotelSuggestionsTimerRef.current = setTimeout(() => {
      fetchHotelSuggestions(hotelDestination);
    }, 300);

    return () => {
      if (hotelSuggestionsTimerRef.current) {
        clearTimeout(hotelSuggestionsTimerRef.current);
      }
    };
  }, [hotelDestination]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Handle passenger dropdown - ONLY close on Done button or outside click
      if (passengerRef.current) {
        const clickedInside = passengerRef.current.contains(target);

        if (!clickedInside) {
          // Clicked outside - close dropdown
          setShowPassengerDropdown(false);
        }
        // If clicked inside, DO NOT close (we'll handle Done button separately)
      }

      if (originRef.current && !originRef.current.contains(target)) {
        setShowOriginDropdown(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(target)) {
        setShowDestinationDropdown(false);
      }

      // Close transfer suggestions when clicking outside
      const transferPickupInput = target.closest('[data-transfer-pickup]');
      const transferDropoffInput = target.closest('[data-transfer-dropoff]');
      if (!transferPickupInput && showTransferPickupSuggestions) {
        setShowTransferPickupSuggestions(false);
      }
      if (!transferDropoffInput && showTransferDropoffSuggestions) {
        setShowTransferDropoffSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTransferPickupSuggestions, showTransferDropoffSuggestions]);

  // Fetch calendar prices from cheapest-dates API (only when calendar opens)
  const fetchCalendarPrices = async () => {
    // 🔒 Deduplication guard - prevent concurrent fetches
    if (fetchingCalendarPricesRef.current) {
      console.log('⏭️  Skipping duplicate calendar price fetch (already in progress)');
      return;
    }

    fetchingCalendarPricesRef.current = true;
    setLoadingCalendarPrices(true);
    try {
      const originCode = origin[0] || '';
      const destCode = destination[0] || '';

      if (!originCode || !destCode) {
        setCalendarPrices({});
        return;
      }

      // 🎯 SMART FETCHING: Round-trip mode fetches BOTH directions for complete price guide
      console.log('📅 Fetching calendar prices for', originCode, '→', destCode, `(${tripType} mode)`);

      let pricesMap: { [date: string]: number } = {};

      if (tripType === 'roundtrip') {
        // 🔄 ROUND-TRIP MODE: Fetch BOTH directions in parallel
        // This shows prices for both outbound (JFK→GRU) and return (GRU→JFK) dates
        console.log('🔄 Round-trip mode: Fetching prices for BOTH directions');

        const [forwardRes, reverseRes] = await Promise.all([
          fetch(`/api/cheapest-dates?origin=${originCode}&destination=${destCode}&daysAhead=30`),
          fetch(`/api/cheapest-dates?origin=${destCode}&destination=${originCode}&daysAhead=30`)
        ]);

        if (!forwardRes.ok || !reverseRes.ok) {
          console.warn('⚠️ Failed to fetch calendar prices:', {
            forward: forwardRes.status,
            reverse: reverseRes.status
          });
          setCalendarPrices({});
          return;
        }

        const [forwardData, reverseData] = await Promise.all([
          forwardRes.json(),
          reverseRes.json()
        ]);

        // Merge prices from BOTH directions
        // Forward direction (e.g., JFK→GRU) for departure dates
        if (forwardData.prices) {
          Object.entries(forwardData.prices).forEach(([date, price]) => {
            pricesMap[date] = price as number;
          });
        }

        // Reverse direction (e.g., GRU→JFK) for return dates
        // Don't override - add prices that aren't already in the map
        if (reverseData.prices) {
          Object.entries(reverseData.prices).forEach(([date, price]) => {
            if (!pricesMap[date]) {
              pricesMap[date] = price as number;
            }
          });
        }

        console.log('✅ Round-trip calendar prices loaded:', {
          outbound: `${originCode}→${destCode}`,
          outboundDates: Object.keys(forwardData.prices || {}).length,
          return: `${destCode}→${originCode}`,
          returnDates: Object.keys(reverseData.prices || {}).length,
          totalUniqueDates: Object.keys(pricesMap).length
        });

      } else {
        // 🔵 ONE-WAY MODE: Only fetch selected direction
        console.log('🔵 One-way mode: Fetching prices for single direction only');

        const res = await fetch(
          `/api/cheapest-dates?origin=${originCode}&destination=${destCode}&daysAhead=30`
        );

        if (!res.ok) {
          console.warn('⚠️ Failed to fetch calendar prices:', res.status);
          setCalendarPrices({});
          return;
        }

        const data = await res.json();

        if (data.prices) {
          pricesMap = data.prices;
        } else if (data.data && Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            if (item.departureDate && item.price?.total) {
              pricesMap[item.departureDate] = parseFloat(item.price.total);
            }
          });
        }

        console.log('✅ One-way calendar prices loaded:', Object.keys(pricesMap).length, 'dates');
      }

      console.log('📊 Setting calendar prices in state:', {
        mode: tripType,
        totalDates: Object.keys(pricesMap).length,
        sampleDates: Object.keys(pricesMap).slice(0, 5)
      });
      setCalendarPrices(pricesMap);
    } catch (error) {
      console.error('❌ Failed to load calendar prices:', error);
      setCalendarPrices({}); // Graceful fallback
    } finally {
      setLoadingCalendarPrices(false);
      fetchingCalendarPricesRef.current = false; // Release lock
    }
  };

  // Close all dropdowns when one opens
  const closeAllDropdowns = () => {
    setShowOriginDropdown(false);
    setShowDestinationDropdown(false);
    setShowPassengerDropdown(false);
    setShowDatePicker(false);
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  // 🚀 PHASE 1: Smart Pre-fetching
  // Pre-load calendar prices when user completes origin + destination
  // This makes calendar opening feel INSTANT
  useEffect(() => {
    // Only for flight searches
    if (serviceType !== 'flights') return;

    // Need both origin and destination
    const originCode = origin[0];
    const destCode = destination[0];

    if (!originCode || !destCode) {
      // Clear timer if user clears fields
      if (preFetchTimerRef.current) {
        clearTimeout(preFetchTimerRef.current);
        preFetchTimerRef.current = null;
      }
      return;
    }

    // Clear any existing timer
    if (preFetchTimerRef.current) {
      clearTimeout(preFetchTimerRef.current);
    }

    // Debounce: Wait 500ms after user stops typing
    preFetchTimerRef.current = setTimeout(() => {
      console.log('🔥 Smart pre-fetch triggered:', originCode, '→', destCode);
      // Pre-load calendar prices in background (non-blocking)
      fetchCalendarPrices();
    }, 500);

    // Cleanup
    return () => {
      if (preFetchTimerRef.current) {
        clearTimeout(preFetchTimerRef.current);
      }
    };
  }, [origin, destination, serviceType]);

  // 🔄 PHASE 2: Refresh calendar when tab becomes visible
  // This ensures calendar shows updated prices when user returns from search results tab
  useEffect(() => {
    if (serviceType !== 'flights') return;

    const handleVisibilityChange = () => {
      // Only refresh if tab becomes visible AND we have origin+destination
      if (!document.hidden && origin[0] && destination[0]) {
        console.log('🔄 Tab visible again - refreshing calendar prices');
        fetchCalendarPrices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [serviceType, origin, destination]);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    // Parse YYYY-MM-DD format and create date in local timezone to avoid off-by-one errors
    // new Date("2024-12-03") interprets as UTC midnight, causing wrong date in negative UTC timezones
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return '';
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', delta: number) => {
    setPassengers(prev => {
      const newValue = Math.max(type === 'adults' ? 1 : 0, prev[type] + delta);
      return { ...prev, [type]: newValue };
    });
  };

  const handleOriginChange = (codes: string[], airports: MultiAirport[]) => {
    setOrigin(codes);
    // Clear error when user makes changes
    if (errors.origin) {
      const newErrors = { ...errors };
      delete newErrors.origin;
      setErrors(newErrors);
    }
  };

  const handleDestinationChange = (codes: string[], airports: MultiAirport[]) => {
    setDestination(codes);
    // Clear error when user makes changes
    if (errors.destination) {
      const newErrors = { ...errors };
      delete newErrors.destination;
      setErrors(newErrors);
    }
  };

  const handleDatePickerChange = (departure: string, returnDate?: string) => {
    setDepartureDate(departure);
    if (returnDate) {
      setReturnDate(returnDate);
    } else if (datePickerType === 'departure') {
      // Don't clear return date if only selecting departure
    }
    // Clear date errors when user makes changes
    if (errors.departureDate) {
      const newErrors = { ...errors };
      delete newErrors.departureDate;
      setErrors(newErrors);
    }
  };

  // Multi-date selection handler for flexible dates mode
  const handleMultiDateChange = (dates: Date[]) => {
    if (datePickerType === 'departure') {
      setDepartureDates(dates);
      // Clear date errors when user makes changes
      if (errors.departureDate) {
        const newErrors = { ...errors };
        delete newErrors.departureDate;
        setErrors(newErrors);
      }
    } else {
      setReturnDates(dates);
    }
  };

  // Multi-city flight handlers
  const handleAddFlight = () => {
    if (additionalFlights.length >= 4) return; // Max 5 flights total (1 main + 4 additional)

    // Auto-fill origin from previous destination
    const lastDestination = additionalFlights.length > 0
      ? additionalFlights[additionalFlights.length - 1].destination
      : destination;

    // Take only the LAST airport from the destination array to avoid multi-airport origins
    // (for multi-city, the next flight should start from the last destination)
    const newOrigin = Array.isArray(lastDestination) && lastDestination.length > 0
      ? [lastDestination[lastDestination.length - 1]]
      : lastDestination;

    // Smart date increment (+3 days from previous)
    const lastDate = additionalFlights.length > 0
      ? additionalFlights[additionalFlights.length - 1].departureDate
      : departureDate;

    // Append T00:00:00 to ensure date is parsed as local midnight, not UTC
    const newDate = lastDate ? new Date(lastDate + 'T00:00:00') : new Date();
    newDate.setDate(newDate.getDate() + 3);
    // Format as YYYY-MM-DD without timezone conversion
    const newDateString = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;

    const newFlight: AdditionalFlight = {
      id: `flight-${Date.now()}`,
      origin: newOrigin,
      destination: [],
      departureDate: newDateString,
      nonstop: false,
    };

    console.log('➕ Adding new flight:', {
      previousDestination: lastDestination,
      newOrigin,
      newDate: newDateString
    });

    setAdditionalFlights([...additionalFlights, newFlight]);
    setExpandedFlightId(newFlight.id); // Auto-expand newly added flight (mobile UX)
  };

  const handleRemoveFlight = (id: string) => {
    setAdditionalFlights(additionalFlights.filter(f => f.id !== id));
    if (expandedFlightId === id) setExpandedFlightId(null); // Collapse if removed flight was expanded
  };

  const handleUpdateAdditionalFlight = (id: string, updates: Partial<AdditionalFlight>) => {
    setAdditionalFlights(additionalFlights.map(f =>
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const handleOpenDatePicker = (type: 'departure' | 'return') => {
    closeAllDropdowns();
    setAdditionalFlightDatePickerOpen(null); // Close any open additional flight date pickers
    setDatePickerType(type);
    setShowDatePicker(true);

    // 🔄 FORCE REFRESH calendar prices when opening date picker
    // Critical for round-trip: ensures both departure AND return dates show cached prices
    // Bypass pre-fetch lock to guarantee fresh data
    fetchingCalendarPricesRef.current = false; // Release lock
    fetchCalendarPrices();
  };

  // Validate form before search
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!origin || origin.length === 0) {
      newErrors.origin = t('errors.originRequired');
    }

    if (!destination || destination.length === 0) {
      newErrors.destination = t('errors.destinationRequired');
    }

    // Check if any origin code matches any destination code
    if (origin && destination && origin.length > 0 && destination.length > 0) {
      const hasOverlap = origin.some(code => destination.includes(code));
      if (hasOverlap) {
        newErrors.destination = t('errors.sameAirports');
      }
    }

    // Departure date validation
    if (useFlexibleDates) {
      if (!departureDates || departureDates.length === 0) {
        newErrors.departureDate = t('errors.departureDateRequired');
      }
    } else {
      if (!departureDate) {
        newErrors.departureDate = t('errors.departureDateRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    // Trigger mobile auto-collapse
    onSearchSubmit?.();
    // Hotels search
    if (serviceType === 'hotels') {
      if (!hotelDestination || !checkInDate || !checkOutDate) {
        setErrors({ hotel: 'Please fill all required fields' });
        return;
      }

      setIsLoading(true);

      // Build comprehensive guest data including child ages and infants
      // CRITICAL: Accurate ages are required for correct pricing
      // - Infants (0-2): FREE at most hotels
      // - Children (3-17): Age-based pricing
      const allChildAges = [
        ...Array(hotelInfants).fill(1), // Infants under 2: default to age 1 (FREE at most hotels!)
        ...hotelChildAges.slice(0, hotelChildren) // Actual child ages from selectors
      ];

      const hotelParams = new URLSearchParams({
        destination: hotelDestination,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: hotelAdults.toString(),
        children: (hotelChildren + hotelInfants).toString(), // Total count
        rooms: hotelRooms.toString(),
        ...(hotelLocation && hotelLocation.lat && hotelLocation.lng && {
          lat: hotelLocation.lat.toString(),
          lng: hotelLocation.lng.toString(),
        }),
      });

      // Add child ages as comma-separated string for accurate pricing
      if (allChildAges.length > 0) {
        hotelParams.set('childAges', allChildAges.join(','));
      }

      // Add selected districts if any (multi-select)
      if (selectedDistricts.length > 0) {
        hotelParams.set('districts', selectedDistricts.map(d => d.name).join(','));
        // Use first selected district's location for more precise search
        hotelParams.set('lat', selectedDistricts[0].location.lat.toString());
        hotelParams.set('lng', selectedDistricts[0].location.lng.toString());
      }

      const url = `/hotels/results?${hotelParams.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');

      setTimeout(() => setIsLoading(false), 500);
      return;
    }

    // Car rentals search
    if (serviceType === 'cars') {
      if (!carPickupLocation || !carPickupDate || !carDropoffDate) {
        setErrors({ car: 'Please fill all required fields' });
        return;
      }

      setIsLoading(true);

      const carParams = new URLSearchParams({
        pickup: carPickupLocation,
        dropoff: sameDropoffLocation ? carPickupLocation : (carDropoffLocation || carPickupLocation),
        pickupDate: carPickupDate,
        dropoffDate: carDropoffDate,
        pickupTime: carPickupTime,
        dropoffTime: carDropoffTime,
      });

      const url = `/cars/results?${carParams.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');

      setTimeout(() => setIsLoading(false), 500);
      return;
    }

    // Flights search (existing logic)
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Check if multi-city (one-way with additional flights)
    const isMultiCity = tripType === 'oneway' && additionalFlights.length > 0;

    // Determine if we should request nonstop flights from the API
    // For round-trip: only if BOTH fromNonstop AND toNonstop are enabled
    // For one-way: if fromNonstop is enabled
    const shouldRequestNonstopFromAPI = tripType === 'roundtrip'
      ? (fromNonstop && toNonstop)
      : fromNonstop;

    const params = new URLSearchParams({
      from: origin.join(','),  // Join multiple codes with comma
      to: destination.join(','),  // Join multiple codes with comma
      departure: useFlexibleDates
        ? departureDates.map(date => format(date, 'yyyy-MM-dd')).join(',')
        : formatDateForInput(departureDate),
      useFlexibleDates: useFlexibleDates.toString(),
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      infants: passengers.infants.toString(),
      class: cabinClass,
      direct: directFlights.toString(),
      // API-level nonstop filter - tells Amadeus/Duffel to only return nonstop flights
      nonStop: shouldRequestNonstopFromAPI.toString(),
      // Client-side nonstop filters - for additional fine-grained filtering
      fromNonstop: fromNonstop.toString(),
      toNonstop: (tripType === 'roundtrip' && toNonstop).toString(),
      multiCity: isMultiCity.toString(),
      // Mixed-carrier "Hacker Fares" - combine different airlines for cheaper prices
      includeSeparateTickets: (tripType === 'roundtrip' && includeSeparateTickets).toString(),
    });

    // Add multi-city flight data if present
    if (isMultiCity) {
      // Serialize additional flights as JSON
      const multiCityFlights = additionalFlights.map(f => ({
        from: f.origin.join(','),
        to: f.destination.join(','),
        date: f.departureDate,
        nonstop: f.nonstop
      }));
      params.append('additionalFlights', JSON.stringify(multiCityFlights));

      console.log('🛫 Multi-city search:', {
        flight1: { from: origin, to: destination, date: departureDate, nonstop: fromNonstop },
        additionalFlights: multiCityFlights
      });
    }

    // Add return date for round trips
    if (tripType === 'roundtrip') {
      if (useFlexibleDates && returnDates.length > 0) {
        params.append('return', returnDates.map(date => format(date, 'yyyy-MM-dd')).join(','));
      } else if (returnDate) {
        params.append('return', formatDateForInput(returnDate));
      }
    }

    console.log('🔍 Searching with params:', Object.fromEntries(params));

    // Journey mode: redirect to journey builder, otherwise flights results
    if (journeyMode) {
      const url = `/journey/builder?${params.toString()}`;
      router.push(url);
    } else {
      // Open results page in NEW WINDOW/TAB
      const url = `/flights/results?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    // Reset loading after a short delay
    setTimeout(() => setIsLoading(false), 500);
  };

  // Hotel destination autocomplete
  const fetchHotelSuggestions = async (query: string) => {
    if (query.length < 2) {
      setHotelSuggestions([]);
      setShowHotelSuggestions(false);
      return;
    }

    setIsLoadingHotelSuggestions(true);
    setShowHotelSuggestions(true);

    try {
      const response = await fetch(`/api/hotels/suggestions?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        setHotelSuggestions(data.data.slice(0, 5));
      } else {
        setHotelSuggestions([]);
      }
    } catch {
      setHotelSuggestions([]);
    } finally {
      setIsLoadingHotelSuggestions(false);
    }
  };

  const handleHotelDestinationChange = (value: string) => {
    setHotelDestination(value);
  };

  const handleHotelSuggestionSelect = (suggestion: any) => {
    const nameValue = suggestion.name?.trim() || suggestion.city?.trim() || '';

    console.log('🏨 Suggestion selected:', {
      suggestion: suggestion,
      nameValue: nameValue,
      suggestion_name: suggestion.name,
      suggestion_city: suggestion.city,
    });

    if (!nameValue) {
      console.warn('⚠️ No name value extracted from suggestion');
      return;
    }

    console.log('✅ Setting hotelDestination to:', nameValue);

    // Update all state synchronously to ensure immediate input update
    setHotelDestination(nameValue);
    setShowHotelSuggestions(false);
    setHotelLocation({
      lat: suggestion.location?.lat || suggestion.latitude,
      lng: suggestion.location?.lng || suggestion.longitude
    });
    setSelectedDestinationDetails({
      name: nameValue,
      country: suggestion.country || '',
      emoji: suggestion.emoji,
      type: suggestion.type || 'city',
      categories: suggestion.categories,
    });
    setSelectedDistricts([]);
  };

  // Toggle district selection (multi-select)
  const toggleDistrictSelection = (district: { id: string; name: string; location: { lat: number; lng: number } }) => {
    setSelectedDistricts(prev => {
      const isSelected = prev.some(d => d.id === district.id);
      if (isSelected) {
        return prev.filter(d => d.id !== district.id);
      } else {
        return [...prev, { id: district.id, name: district.name, location: district.location }];
      }
    });
  };

  // Clear destination and selections
  const clearHotelDestination = () => {
    setHotelDestination('');
    setHotelLocation(null);
    setSelectedDestinationDetails(null);
    setSelectedDistricts([]);
    setPopularDistricts([]);
  };

  // Transfer location suggestion functions
  const fetchTransferSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setTransferSuggestions([]);
      return;
    }

    setIsLoadingTransferSuggestions(true);

    try {
      const response = await fetch(`/api/hotels/suggestions?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        // Combine cities with airports for transfers
        const suggestions = data.data.slice(0, 5).map((s: any) => ({
          ...s,
          // Add airport suffix for clearer transfer suggestions
          displayName: s.type === 'airport' ? `${s.name} Airport` : s.name
        }));
        setTransferSuggestions(suggestions);
      } else {
        setTransferSuggestions([]);
      }
    } catch {
      setTransferSuggestions([]);
    } finally {
      setIsLoadingTransferSuggestions(false);
    }
  };

  const handleTransferPickupChange = (value: string) => {
    setCarPickupLocation(value);
    if (transferSuggestionsTimerRef.current) {
      clearTimeout(transferSuggestionsTimerRef.current);
    }
    if (value.length >= 2) {
      transferSuggestionsTimerRef.current = setTimeout(() => {
        fetchTransferSuggestions(value);
        setShowTransferPickupSuggestions(true);
        setShowTransferDropoffSuggestions(false);
      }, 300);
    } else {
      setShowTransferPickupSuggestions(false);
      setTransferSuggestions([]);
    }
  };

  const handleTransferDropoffChange = (value: string) => {
    setCarDropoffLocation(value);
    if (transferSuggestionsTimerRef.current) {
      clearTimeout(transferSuggestionsTimerRef.current);
    }
    if (value.length >= 2) {
      transferSuggestionsTimerRef.current = setTimeout(() => {
        fetchTransferSuggestions(value);
        setShowTransferDropoffSuggestions(true);
        setShowTransferPickupSuggestions(false);
      }, 300);
    } else {
      setShowTransferDropoffSuggestions(false);
      setTransferSuggestions([]);
    }
  };

  const handleTransferSuggestionSelect = (suggestion: any, field: 'pickup' | 'dropoff') => {
    const nameValue = suggestion.displayName || suggestion.name || suggestion.city || '';
    if (field === 'pickup') {
      setCarPickupLocation(nameValue);
      setShowTransferPickupSuggestions(false);
    } else {
      setCarDropoffLocation(nameValue);
      setShowTransferDropoffSuggestions(false);
    }
    setTransferSuggestions([]);
  };

  // Debug logging for hotel suggestions state
  useEffect(() => {
    console.log('🔄 Hotel suggestions state changed:', {
      suggestions: hotelSuggestions,
      count: hotelSuggestions.length,
      showDropdown: showHotelSuggestions,
      loading: isLoadingHotelSuggestions
    });
  }, [hotelSuggestions, showHotelSuggestions, isLoadingHotelSuggestions]);

  // Close hotel suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hotelDestinationRef.current && !hotelDestinationRef.current.contains(event.target as Node)) {
        console.log('🔒 Closing suggestions dropdown (clicked outside)');
        setShowHotelSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Cleanup debounce timer on unmount
      if (hotelSuggestionsTimerRef.current) {
        clearTimeout(hotelSuggestionsTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white shadow-lg lg:shadow-xl border-b border-neutral-100">
      {/* Container with max-width matching results page (Priceline-style) */}
      <MaxWidthContainer
        className="px-0 lg:px-8"
        style={{
          paddingTop: spacing.lg,
          paddingBottom: spacing.lg,
        }}
      >
        {/* ============================================
            SERVICE TYPE TABS - Apple-Class Pill Style
            Fixed ordering for hydration compatibility
            Mobile: Horizontally scrollable with touch support
            Can be hidden via hideTabs prop (for Journey page)
            ============================================ */}
        {!hideTabs && (
        <div
          className="mobile-scroll-x mb-4 p-1.5 bg-neutral-100/80 backdrop-blur-sm rounded-2xl gap-1.5 md:gap-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Flights Tab - FIRST */}
          <button
            type="button"
            onClick={() => setServiceType('flights')}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all duration-300 relative flex-shrink-0 whitespace-nowrap touch-manipulation rounded-xl ${
              serviceType === 'flights'
                ? 'bg-white text-primary-600 shadow-lg shadow-primary-500/15'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50 active:scale-95'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
              serviceType === 'flights'
                ? 'bg-primary-50'
                : 'bg-neutral-200/50'
            }`}>
              <Plane size={14} className={serviceType === 'flights' ? 'text-primary-600' : 'text-neutral-500'} />
            </div>
            <span className="text-[13px] sm:text-sm tracking-tight">{t('flights')}</span>
          </button>

          {/* Hotels Tab - SECOND */}
          <button
            type="button"
            onClick={() => setServiceType('hotels')}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all duration-300 relative flex-shrink-0 whitespace-nowrap touch-manipulation rounded-xl ${
              serviceType === 'hotels'
                ? 'bg-white text-primary-600 shadow-lg shadow-primary-500/15'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50 active:scale-95'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
              serviceType === 'hotels'
                ? 'bg-primary-50'
                : 'bg-neutral-200/50'
            }`}>
              <Hotel size={14} className={serviceType === 'hotels' ? 'text-primary-600' : 'text-neutral-500'} />
            </div>
            <span className="text-[13px] sm:text-sm tracking-tight">{t('hotels')}</span>
          </button>

          {/* Journey Tab - AI Trip Builder (Coming Soon) */}
          <div className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold relative flex-shrink-0 whitespace-nowrap rounded-xl text-neutral-400 cursor-default">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary-100/60 to-amber-100/60">
              <Sparkles size={14} className="text-primary-400" />
            </div>
            <span className="text-[13px] sm:text-sm tracking-tight bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent font-bold">Journey</span>
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[8px] font-bold rounded-full shadow-sm">Soon</span>
          </div>

          {/* ============================================
              COMING SOON TABS - Apple-Class Style
              Cars, Tours, Packages, Insurance
              ============================================ */}

          {/* Cars Tab - COMING SOON */}
          <button
            type="button"
            onClick={() => {
              // Show coming soon toast/notification
              if (typeof window !== 'undefined') {
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 animate-fade-in flex items-center gap-2 text-sm font-medium';
                toast.innerHTML = '<span class="text-lg">🚗</span> Car Rentals coming soon!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-300 relative text-neutral-400 hover:text-neutral-500 cursor-pointer flex-shrink-0 whitespace-nowrap rounded-xl hover:bg-white/30 active:scale-95"
          >
            <Car size={13} className="text-neutral-400" />
            <span className="text-xs tracking-tight">{t('cars')}</span>
            <span className="text-[8px] bg-gradient-to-r from-amber-400 to-orange-400 text-white px-1.5 py-0.5 rounded-full font-bold leading-none shadow-sm">Soon</span>
          </button>

          {/* Tours Tab - ACTIVE */}
          <button
            type="button"
            onClick={() => router.push('/tours')}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all duration-300 relative flex-shrink-0 whitespace-nowrap touch-manipulation rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-white/50 active:scale-95"
          >
            <div className="p-1.5 rounded-lg transition-colors duration-300 bg-orange-100/80">
              <Map size={14} className="text-orange-600" />
            </div>
            <span className="text-[13px] sm:text-sm tracking-tight">{t('tours')}</span>
          </button>

          {/* Activities Tab - ACTIVE */}
          <button
            type="button"
            onClick={() => router.push('/activities')}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all duration-300 relative flex-shrink-0 whitespace-nowrap touch-manipulation rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-white/50 active:scale-95"
          >
            <div className="p-1.5 rounded-lg transition-colors duration-300 bg-purple-100/80">
              <Activity size={14} className="text-purple-600" />
            </div>
            <span className="text-[13px] sm:text-sm tracking-tight">{t('activities')}</span>
          </button>

          {/* Transfers Tab - ACTIVE */}
          <button
            type="button"
            onClick={() => setServiceType('transfers')}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all duration-300 relative flex-shrink-0 whitespace-nowrap touch-manipulation rounded-xl ${
              serviceType === 'transfers'
                ? 'bg-white text-primary-600 shadow-lg shadow-primary-500/15'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50 active:scale-95'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
              serviceType === 'transfers' ? 'bg-teal-50' : 'bg-teal-100/80'
            }`}>
              <Navigation size={14} className={serviceType === 'transfers' ? 'text-teal-600' : 'text-teal-600'} />
            </div>
            <span className="text-[13px] sm:text-sm tracking-tight">Transfers</span>
          </button>

          {/* Packages Tab - COMING SOON */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 animate-fade-in flex items-center gap-2 text-sm font-medium';
                toast.innerHTML = '<span class="text-lg">📦</span> Travel Packages coming soon!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-300 relative text-neutral-400 hover:text-neutral-500 cursor-pointer flex-shrink-0 whitespace-nowrap rounded-xl hover:bg-white/30 active:scale-95"
          >
            <Package size={13} className="text-neutral-400" />
            <span className="text-xs tracking-tight">{t('packages')}</span>
            <span className="text-[8px] bg-gradient-to-r from-amber-400 to-orange-400 text-white px-1.5 py-0.5 rounded-full font-bold leading-none shadow-sm">Soon</span>
          </button>

          {/* Insurance Tab - COMING SOON */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 animate-fade-in flex items-center gap-2 text-sm font-medium';
                toast.innerHTML = '<span class="text-lg">🛡️</span> Travel Insurance coming soon!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-300 relative text-neutral-400 hover:text-neutral-500 cursor-pointer flex-shrink-0 whitespace-nowrap rounded-xl hover:bg-white/30 active:scale-95 mr-2"
          >
            <Shield size={13} className="text-neutral-400" />
            <span className="text-xs tracking-tight">{t('insurance')}</span>
            <span className="text-[8px] bg-gradient-to-r from-amber-400 to-orange-400 text-white px-1.5 py-0.5 rounded-full font-bold leading-none shadow-sm">Soon</span>
          </button>
        </div>
        )}

        {/* Desktop: Clean Single-line Layout */}
        <div className="hidden lg:block">
          {/* FLIGHTS FIELDS */}
          {serviceType === 'flights' && (
          <>
          {/* Search Fields Row */}
          <div className="flex items-center gap-3">
          {/* From Airport */}
          <div ref={originRef} className="flex-1 relative">
            {/* Custom label with Nonstop checkbox */}
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <PlaneTakeoff size={13} className="text-primary-500" />
                <span>From</span>
              </label>

              {/* Nonstop checkbox aligned to the right */}
              <label className="flex items-center gap-1 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={fromNonstop}
                  onChange={(e) => setFromNonstop(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#D63A35] focus:ring-[#D63A35] cursor-pointer"
                />
                <span className="text-xs font-normal text-gray-600 group-hover:text-gray-900">Nonstop</span>
              </label>
            </div>

            <MultiAirportSelector
              placeholder="Select airports"
              value={origin}
              onChange={handleOriginChange}
              maxDisplay={1}
              lang={lang}
              testId="origin-input"
            />
            {errors.origin && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.origin}
              </p>
            )}

            {/* Swap Button - Centered between From and To */}
            <button
              type="button"
              onClick={() => {
                const temp = origin;
                setOrigin(destination);
                setDestination(temp);
              }}
              className="absolute right-[-16px] top-[42px] z-10 p-1 bg-white border border-gray-300 text-gray-400 hover:text-[#D63A35] hover:border-[#D63A35] hover:bg-primary-50 rounded-full transition-all shadow-sm hover:shadow-md"
              aria-label="Swap airports"
              title="Swap airports"
            >
              <ArrowLeftRight size={12} />
            </button>
          </div>

          {/* To Airport */}
          <div ref={destinationRef} className="flex-1">
            {/* Custom label with Nonstop checkbox */}
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <PlaneLanding size={13} className="text-primary-500" />
                <span>To</span>
              </label>

              {/* Nonstop checkbox aligned to the right - disabled for one-way trips */}
              <label className={`flex items-center gap-1 cursor-pointer group ${tripType === 'oneway' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="checkbox"
                  checked={toNonstop}
                  onChange={(e) => setToNonstop(e.target.checked)}
                  disabled={tripType === 'oneway'}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#D63A35] focus:ring-[#D63A35] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-xs font-normal text-gray-600 group-hover:text-gray-900">Nonstop</span>
              </label>
            </div>

            <MultiAirportSelector
              placeholder="Select airports"
              value={destination}
              onChange={handleDestinationChange}
              maxDisplay={1}
              lang={lang}
              testId="destination-input"
            />
            {errors.destination && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.destination}
              </p>
            )}
          </div>

          {/* Depart Date */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <CalendarDays size={13} className="text-primary-500" />
                <span>Depart</span>
              </label>

              {/* Multi-Dates Toggle - Disabled when multi-city flights added */}
              <label className={`flex items-center gap-1.5 group ${additionalFlights.length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={useFlexibleDates}
                  disabled={additionalFlights.length > 0}
                  onChange={(e) => {
                    setUseFlexibleDates(e.target.checked);
                    if (e.target.checked) {
                      setDepartureDate('');
                      setReturnDate('');
                    } else {
                      setDepartureDates([]);
                      setReturnDates([]);
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#D63A35] focus:ring-[#D63A35] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-xs font-normal text-gray-600 group-hover:text-gray-900">Multi-Dates</span>
              </label>
            </div>

            {!useFlexibleDates ? (
              <button
                ref={departureDateRef}
                type="button"
                onClick={() => handleOpenDatePicker('departure')}
                className={`w-full relative px-4 py-3.5 h-[52px] bg-white border rounded-xl hover:border-primary-400 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer shadow-sm hover:shadow-md ${
                  errors.departureDate ? 'border-red-500' : 'border-neutral-200'
                }`}
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-sm font-medium text-gray-900">
                  {departureDate ? formatDateForDisplay(departureDate) : 'Select date'}
                </span>
              </button>
            ) : (
              <button
                ref={departureDateRef}
                type="button"
                onClick={() => handleOpenDatePicker('departure')}
                className={`w-full relative px-4 py-3.5 min-h-[52px] bg-white border rounded-xl hover:border-primary-400 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer shadow-sm hover:shadow-md ${
                  errors.departureDate ? 'border-red-500' : 'border-neutral-200'
                }`}
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <div className="pl-8 flex flex-wrap gap-1.5 items-center">
                  {departureDates.length > 0 ? (
                    departureDates.map((date, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-[#FEF2F2] text-[#D63A35] text-sm font-medium"
                      >
                        {format(date, 'MMM d')}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-gray-500">Select dates (up to 3)</span>
                  )}
                </div>
              </button>
            )}

            {errors.departureDate && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.departureDate}
              </p>
            )}
          </div>

          {/* Return Date */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <CalendarCheck size={13} className="text-primary-500" />
                <span>Return</span>
              </label>

              {/* One-way Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={tripType === 'oneway'}
                  onChange={(e) => {
                    setTripType(e.target.checked ? 'oneway' : 'roundtrip');
                    if (e.target.checked) {
                      setReturnDate('');
                      setReturnDates([]);
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#D63A35] focus:ring-[#D63A35] cursor-pointer"
                />
                <ArrowRight size={12} className="text-gray-500" />
                <span className="text-xs font-normal text-gray-600 group-hover:text-gray-900">One-way</span>
              </label>
            </div>

            {tripType === 'roundtrip' ? (
              !useFlexibleDates ? (
                <button
                  ref={returnDateRef}
                  type="button"
                  onClick={() => handleOpenDatePicker('return')}
                  className="w-full relative px-4 py-3.5 h-[52px] bg-white border border-neutral-200 rounded-xl hover:border-primary-400 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer shadow-sm hover:shadow-md"
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <span className="block pl-8 text-sm font-medium text-gray-900">
                    {returnDate ? formatDateForDisplay(returnDate) : 'Select date'}
                  </span>
                </button>
              ) : (
                <button
                  ref={returnDateRef}
                  type="button"
                  onClick={() => handleOpenDatePicker('return')}
                  className="w-full relative px-4 py-3.5 min-h-[52px] bg-white border border-neutral-200 rounded-xl hover:border-primary-400 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer shadow-sm hover:shadow-md"
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <div className="pl-8 flex flex-wrap gap-1.5 items-center">
                    {returnDates.length > 0 ? (
                      returnDates.map((date, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-[#FEF2F2] text-[#D63A35] text-sm font-medium"
                        >
                          {format(date, 'MMM d')}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-medium text-gray-500">Select dates (up to 3)</span>
                    )}
                  </div>
                </button>
              )
            ) : (
              <div className="relative w-full px-4 py-3.5 h-[52px] bg-neutral-50 border border-neutral-200 rounded-xl cursor-not-allowed flex items-center">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" size={20} />
                <span className="block pl-8 text-sm text-neutral-400 italic">
                  One-way trip
                </span>
              </div>
            )}
          </div>


          {/* Combined Travelers + Class Dropdown */}
          <div ref={passengerRef} className="relative flex-shrink-0 w-52">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
              <Users size={13} className="text-primary-500" />
              <span>Travelers</span>
              <span className="text-gray-400">&</span>
              <Armchair size={13} className="text-secondary-500" />
              <span>Class</span>
            </label>
            <button
              type="button"
              onClick={() => {
                closeAllDropdowns();
                setShowPassengerDropdown(!showPassengerDropdown);
              }}
              className="w-full relative px-4 py-3.5 h-[52px] bg-white border border-neutral-200 rounded-xl hover:border-primary-400 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] text-left shadow-sm hover:shadow-md"
            >
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <span className="block pl-7 text-sm font-medium text-neutral-800 pr-7">
                {totalPassengers}, {t(cabinClass as any)}
              </span>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-transform duration-200 ${showPassengerDropdown ? 'rotate-180' : ''}`} size={16} />
            </button>

            {showPassengerDropdown && (
              <div
                className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-dropdown animate-in fade-in slide-in-from-top-2 duration-200 p-3"
                style={{ width: '280px' }}
              >
                {/* Adults */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">{t('adults')}</div>
                    <div className="text-gray-500 text-[10px]">{t('age18')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePassengerChange('adults', -1);
                      }}
                      disabled={passengers.adults <= 1}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#D63A35] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#D63A35] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-900 text-xs">
                      {passengers.adults}
                    </span>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePassengerChange('adults', 1);
                      }}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#D63A35] flex items-center justify-center text-gray-700 hover:text-[#D63A35] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">{t('children')}</div>
                    <div className="text-gray-500 text-[10px]">{t('age2to17')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePassengerChange('children', -1);
                      }}
                      disabled={passengers.children <= 0}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#D63A35] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#D63A35] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-900 text-xs">
                      {passengers.children}
                    </span>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePassengerChange('children', 1);
                      }}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#D63A35] flex items-center justify-center text-gray-700 hover:text-[#D63A35] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">{t('infants')}</div>
                    <div className="text-gray-500 text-[10px]">{t('ageUnder2')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePassengerChange('infants', -1);
                      }}
                      disabled={passengers.infants <= 0}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#D63A35] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#D63A35] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-900 text-xs">
                      {passengers.infants}
                    </span>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePassengerChange('infants', 1);
                      }}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#D63A35] flex items-center justify-center text-gray-700 hover:text-[#D63A35] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Cabin Class Section */}
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-xs mb-2">
                    <Sparkles size={14} className="text-secondary-500" />
                    <span>Cabin Class</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['economy', 'premium', 'business', 'first'] as const).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCabinClass(cls);
                        }}
                        className={`px-2.5 py-2 rounded-lg border transition-all text-[10px] font-medium ${
                          cabinClass === cls
                            ? 'border-[#D63A35] bg-[#FEF2F2] text-[#D63A35]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {cls === 'economy' && '💺'}
                        {cls === 'premium' && '✨'}
                        {cls === 'business' && '💼'}
                        {cls === 'first' && '👑'}
                        {' '}
                        {t(cls as any)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Done Button - Mobile-First Primary */}
                <button
                  onClick={() => setShowPassengerDropdown(false)}
                  className="mobile-btn-primary text-sm"
                >
                  {t('done')}
                </button>
              </div>
            )}
          </div>

          {/* Search Button - Desktop Primary CTA - Level-6 Ultra-Premium Apple-Class */}
          <div className="flex-shrink-0">
            <label className="mobile-label opacity-0">Search</label>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="min-h-[52px] py-4 px-10 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm tracking-[0.01em] active:scale-[0.97]"
              style={{
                boxShadow: '0 4px 6px rgba(231, 64, 53, 0.15), 0 10px 20px rgba(231, 64, 53, 0.20), 0 -2px 6px rgba(231, 64, 53, 0.05)',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('searching')}</span>
                </>
              ) : (
                <span>{t('search')}</span>
              )}
            </button>
          </div>
          </div>

          {/* Multi-city additional flights - ONLY shown when One-way is selected */}
          {tripType === 'oneway' && (
            <div className="mt-4 space-y-3">
              {/* Initial "Add Another Flight" button - ONLY shown when no additional flights */}
              {additionalFlights.length === 0 && (
                <button
                  type="button"
                  onClick={handleAddFlight}
                  className="mobile-btn-secondary border-2 border-dashed border-gray-300 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50"
                >
                  <Plane size={16} />
                  <span>+ Add Another Flight</span>
                </button>
              )}

              {/* Render additional flights - EXACT COPY of main form structure */}
              {additionalFlights.map((flight, index) => (
                <div key={flight.id} className="flex items-center gap-3">
                  {/* From Airport - EXACT COPY */}
                  <div className="flex-1 relative">
                    {/* Custom label with Nonstop checkbox */}
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <Plane size={13} className="text-primary-500" />
                        <span>Flight {index + 2}</span>
                      </label>

                      {/* Nonstop checkbox aligned to the right */}
                      <label className="flex items-center gap-1 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={flight.nonstop}
                          onChange={(e) => handleUpdateAdditionalFlight(flight.id, { nonstop: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-[#D63A35] focus:ring-[#D63A35] cursor-pointer"
                        />
                        <span className="text-xs font-normal text-gray-600 group-hover:text-gray-900">Nonstop</span>
                      </label>
                    </div>

                    <MultiAirportSelector
                      placeholder="Select airports"
                      value={flight.origin}
                      onChange={(codes) => handleUpdateAdditionalFlight(flight.id, { origin: codes })}
                      maxDisplay={1}
                      lang={lang}
                    />

                    {/* Swap Button - Centered between From and To - EXACT COPY */}
                    <button
                      type="button"
                      onClick={() => {
                        const temp = flight.origin;
                        handleUpdateAdditionalFlight(flight.id, {
                          origin: flight.destination,
                          destination: temp
                        });
                      }}
                      className="absolute right-[-16px] top-[42px] z-10 p-1 bg-white border border-gray-300 text-gray-400 hover:text-[#D63A35] hover:border-[#D63A35] hover:bg-primary-50 rounded-full transition-all shadow-sm hover:shadow-md"
                      aria-label="Swap airports"
                      title="Swap airports"
                    >
                      <ArrowLeftRight size={12} />
                    </button>
                  </div>

                  {/* To Airport - EXACT COPY */}
                  <div className="flex-1">
                    {/* Custom label */}
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <PlaneLanding size={13} className="text-primary-500" />
                        <span>To</span>
                      </label>
                    </div>

                    <MultiAirportSelector
                      placeholder="Select airports"
                      value={flight.destination}
                      onChange={(codes) => handleUpdateAdditionalFlight(flight.id, { destination: codes })}
                      maxDisplay={1}
                      lang={lang}
                    />
                  </div>

                  {/* Depart Date - EXACT COPY */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <CalendarDays size={13} className="text-primary-500" />
                        <span>Depart</span>
                      </label>
                    </div>

                    <button
                      ref={(el) => { additionalFlightDateRefs.current[flight.id] = el; }}
                      type="button"
                      onClick={() => {
                        setShowDatePicker(false); // Close main date picker
                        setAdditionalFlightDatePickerOpen(flight.id);
                      }}
                      className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all cursor-pointer"
                    >
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <span className="block pl-8 text-sm font-medium text-gray-900">
                        {flight.departureDate ? formatDateForDisplay(flight.departureDate) : 'Select date'}
                      </span>
                    </button>
                  </div>

                  {/* Action Buttons - Occupy same space as Return + Travelers + Search in main form */}
                  <div style={{ flex: '1 1 402px' }}>
                    {/* Empty label space for alignment with input fields above */}
                    <div className="mb-2 h-[20px]" />

                    <div className="flex items-center gap-2 w-full">
                      {/* Add Another Flight Button */}
                      {index === additionalFlights.length - 1 && additionalFlights.length < 4 && (
                        <button
                          type="button"
                          onClick={handleAddFlight}
                          className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-[#D63A35] text-gray-600 hover:text-[#D63A35] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-primary-50 whitespace-nowrap"
                        >
                          <Plane size={14} />
                          <span>Add Another Flight</span>
                        </button>
                      )}

                      {/* Delete This Flight Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFlight(flight.id)}
                        className="flex-1 px-4 py-3 border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                        title="Remove this flight"
                      >
                        Delete This Flight
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
          )}

          {/* HOTELS FIELDS */}
          {serviceType === 'hotels' && (
          <>
          {/* Search Fields Row - Apple-Class Mobile: Stacked, Desktop: Horizontal */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-2">
            {/* Hotel Destination - Apple-Class Display */}
            <div ref={hotelDestinationRef} className="w-full lg:flex-1 relative">
              <label className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 mb-1.5">
                <Building2 size={12} className="text-neutral-500" />
                <span>Destination</span>
              </label>

              {/* Apple-Class Selected Destination Display */}
              {selectedDestinationDetails && hotelDestination === selectedDestinationDetails.name ? (
                <div
                  onClick={() => {
                    setShowHotelSuggestions(true);
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-primary-300 rounded-xl cursor-pointer transition-all hover:border-primary-400 hover:shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Destination Emoji or Globe Icon */}
                      <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm">
                        {selectedDestinationDetails.emoji ? (
                          <span className="text-lg">{selectedDestinationDetails.emoji}</span>
                        ) : (
                          <Globe className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-neutral-800 text-[13px] leading-tight truncate">
                          {selectedDestinationDetails.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1 truncate">
                          <Navigation className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{selectedDestinationDetails.country || 'Selected'}</span>
                          {selectedDestinationDetails.type && (
                            <span className="px-1 py-px bg-primary-100 text-primary-600 text-[8px] rounded capitalize font-semibold flex-shrink-0">
                              {selectedDestinationDetails.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearHotelDestination();
                      }}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={hotelDestination}
                  onChange={(e) => {
                    handleHotelDestinationChange(e.target.value);
                    if (selectedDestinationDetails && e.target.value !== selectedDestinationDetails.name) {
                      setSelectedDestinationDetails(null);
                    }
                  }}
                  onFocus={() => {
                    if (hotelDestination.length >= 2) {
                      setShowHotelSuggestions(true);
                    }
                  }}
                  placeholder="City, hotel, or landmark"
                  className={`w-full px-3 py-2.5 bg-white border rounded-xl hover:border-primary-400 transition-all text-[13px] font-medium text-neutral-800 placeholder:text-neutral-400 ${
                    errors.hotel ? 'border-error-400' : 'border-neutral-200'
                  }`}
                />
              )}
              {errors.hotel && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.hotel}
                </p>
              )}

              {/* Enhanced Suggestions Dropdown - World-Class Design */}
              {showHotelSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-white via-blue-50/30 to-white border-2 border-blue-100 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto backdrop-blur-xl"
                     style={{
                       boxShadow: '0 20px 60px -15px rgba(0, 135, 255, 0.3), 0 10px 30px -10px rgba(0, 0, 0, 0.1)'
                     }}>
                  {isLoadingHotelSuggestions ? (
                    <div className="p-6 flex flex-col items-center justify-center gap-3">
                      <div className="relative w-12 h-10">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Finding destinations...</p>
                    </div>
                  ) : hotelSuggestions.length > 0 ? (
                    <div className="py-2">
                      {hotelSuggestions.map((suggestion, index) => {
                        // Category badge colors
                        const getCategoryColor = (category: string) => {
                          const colors: Record<string, string> = {
                            'Beach': 'bg-cyan-100 text-cyan-700 border-cyan-200',
                            'City': 'bg-primary-100 text-indigo-700 border-indigo-200',
                            'Mountain': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                            'Historic': 'bg-amber-100 text-amber-700 border-amber-200',
                            'Luxury': 'bg-purple-100 text-purple-700 border-purple-200',
                            'Romantic': 'bg-pink-100 text-pink-700 border-pink-200',
                            'Adventure': 'bg-orange-100 text-orange-700 border-orange-200',
                            'Cultural': 'bg-violet-100 text-violet-700 border-violet-200',
                          };
                          return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
                        };

                        // Popularity stars
                        const renderStars = (popularity: number = 0) => {
                          const fullStars = Math.floor(popularity / 2);
                          const hasHalfStar = popularity % 2 >= 1;
                          return (
                            <div className="flex items-center gap-0.5">
                              {[...Array(fullStars)].map((_, i) => (
                                <span key={i} className="text-yellow-400 text-xs">★</span>
                              ))}
                              {hasHalfStar && <span className="text-yellow-400 text-xs">⯨</span>}
                              {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                                <span key={`empty-${i}`} className="text-gray-300 text-xs">★</span>
                              ))}
                            </div>
                          );
                        };

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleHotelSuggestionSelect(suggestion);
                            }}
                            className="group w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-info-50 hover:to-cyan-50 transition-all duration-300 flex items-center gap-2 border-b border-gray-100 last:border-b-0 hover:scale-[1.01] active:scale-[0.99]"
                            style={{
                              transformOrigin: 'center'
                            }}
                          >
                            {/* Emoji/Flag - Large & Prominent */}
                            <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-info-50 to-cyan-50 group-hover:from-blue-100 group-hover:to-cyan-100 transition-all duration-300 group-hover:scale-110"
                                 style={{
                                   boxShadow: '0 4px 12px rgba(0, 135, 255, 0.1)'
                                 }}>
                              <div className="text-4xl leading-none">
                                {suggestion.emoji || '🏙️'}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* City Name & Flag */}
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors break-words">
                                  {suggestion.name}
                                </h3>
                                {suggestion.flag && (
                                  <span className="text-xl flex-shrink-0">{suggestion.flag}</span>
                                )}
                              </div>

                              {/* Location & Type */}
                              {(suggestion.city || suggestion.country) && (
                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                  <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                                  <span className="truncate">
                                    {[suggestion.city, suggestion.country].filter(Boolean).join(', ')}
                                  </span>
                                  {suggestion.continent && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
                                      {suggestion.continent}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Categories & Popularity */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Categories (max 2 shown) */}
                                {suggestion.categories?.slice(0, 2).map((category: string, i: number) => (
                                  <span key={i}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(category)}`}>
                                    {category}
                                  </span>
                                ))}

                                {/* Popularity Stars */}
                                {suggestion.popularity && suggestion.popularity >= 8 && (
                                  <div className="flex items-center gap-1 ml-auto">
                                    {renderStars(suggestion.popularity)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Hover Arrow Indicator */}
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                              <svg className="w-5 h-5 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-sm font-medium text-gray-600">No destinations found</p>
                      <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Dates Row - Apple-Class Unified Date Range on mobile */}
            <div className="flex flex-row gap-2 w-full lg:contents">
            {/* Unified Date Range Button - Apple-Class Mobile (shows on mobile only as unified) */}
            <button
              ref={hotelDateRangeRef}
              type="button"
              onClick={() => setShowHotelDateRangePicker(true)}
              className="w-full lg:hidden px-3 py-2.5 rounded-xl cursor-pointer transition-all bg-white border border-neutral-200 hover:border-primary-400 hover:shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                {/* Check-in side */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${checkInDate ? 'bg-emerald-500' : 'bg-neutral-100'}`}>
                      <LogIn className={`w-3 h-3 ${checkInDate ? 'text-white' : 'text-neutral-400'}`} />
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Check-in</span>
                  </div>
                  <div className={`text-[13px] font-bold ${checkInDate ? 'text-neutral-800' : 'text-neutral-400'}`}>
                    {checkInDate ? formatDateForDisplay(checkInDate) : 'Select'}
                  </div>
                </div>

                {/* Arrow divider */}
                <div className="flex flex-col items-center px-1">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                  {checkInDate && checkOutDate && (
                    <span className="text-[9px] font-semibold text-primary-500">
                      {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))}n
                    </span>
                  )}
                </div>

                {/* Check-out side */}
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Check-out</span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${checkOutDate ? 'bg-orange-500' : 'bg-neutral-100'}`}>
                      <LogOut className={`w-3 h-3 ${checkOutDate ? 'text-white' : 'text-neutral-400'}`} />
                    </div>
                  </div>
                  <div className={`text-[13px] font-bold ${checkOutDate ? 'text-neutral-800' : 'text-neutral-400'}`}>
                    {checkOutDate ? formatDateForDisplay(checkOutDate) : 'Select'}
                  </div>
                </div>
              </div>
            </button>

            {/* Desktop: Separate Check-in/Check-out buttons (hidden on mobile) */}
            {/* Check-in Date - Apple-Class Desktop */}
            <div className="hidden lg:block flex-1">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 mb-1.5">
                <CalendarDays size={12} className="text-neutral-500" />
                <span>Check-in</span>
              </label>
              <button
                ref={hotelCheckInRef}
                type="button"
                onClick={() => setShowHotelCheckInPicker(true)}
                className={`w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  checkInDate
                    ? 'bg-emerald-50 border border-emerald-300 hover:border-emerald-400 hover:shadow-sm'
                    : 'bg-white border border-neutral-200 hover:border-primary-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    checkInDate ? 'bg-emerald-500' : 'bg-neutral-100'
                  }`}>
                    <Calendar className={`w-3.5 h-3.5 ${checkInDate ? 'text-white' : 'text-neutral-400'}`} />
                  </div>
                  <div className="text-left flex-1">
                    {checkInDate ? (
                      <>
                        <div className="font-bold text-neutral-800 text-[13px] leading-tight">
                          {formatDateForDisplay(checkInDate)}
                        </div>
                        <div className="text-[10px] text-neutral-500">Check-in</div>
                      </>
                    ) : (
                      <span className="text-[13px] text-neutral-400">Select date</span>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Check-out Date - Apple-Class Desktop */}
            <div className="hidden lg:block flex-1">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 mb-1.5">
                <CalendarCheck size={12} className="text-neutral-500" />
                <span>Check-out</span>
              </label>
              <button
                ref={hotelCheckOutRef}
                type="button"
                onClick={() => setShowHotelCheckOutPicker(true)}
                className={`w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  checkOutDate
                    ? 'bg-orange-50 border border-orange-300 hover:border-orange-400 hover:shadow-sm'
                    : 'bg-white border border-neutral-200 hover:border-primary-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    checkOutDate ? 'bg-orange-500' : 'bg-neutral-100'
                  }`}>
                    <Calendar className={`w-3.5 h-3.5 ${checkOutDate ? 'text-white' : 'text-neutral-400'}`} />
                  </div>
                  <div className="text-left flex-1">
                    {checkOutDate ? (
                      <>
                        <div className="font-bold text-neutral-800 text-[13px] leading-tight">
                          {formatDateForDisplay(checkOutDate)}
                        </div>
                        <div className="text-[10px] text-neutral-500">Check-out</div>
                      </>
                    ) : (
                      <span className="text-[13px] text-neutral-400">Select date</span>
                    )}
                  </div>
                </div>
              </button>
            </div>
            </div>{/* End Dates Row wrapper */}

            {/* Guests & Rooms - Apple-Class Styling */}
            <div className="relative w-full lg:w-64 lg:flex-shrink-0">
              <label className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 mb-1.5">
                <Users size={12} className="text-neutral-500" />
                <span>Guests & Rooms</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl hover:border-primary-400 hover:shadow-sm transition-all text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shadow-sm">
                    <Users className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-800 text-[13px] leading-tight truncate">
                      {hotelAdults + hotelChildren + hotelInfants} guest{(hotelAdults + hotelChildren + hotelInfants) > 1 ? 's' : ''} · {hotelRooms} room{hotelRooms > 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {hotelAdults} adult{hotelAdults > 1 ? 's' : ''}{hotelChildren > 0 ? ` · ${hotelChildren} child` : ''}{hotelInfants > 0 ? ` · ${hotelInfants} infant` : ''}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-neutral-400 transition-transform flex-shrink-0 ${showPassengerDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Guests & Rooms Dropdown - Apple-Class */}
              {showPassengerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 p-2.5 bg-white border border-neutral-200 rounded-xl shadow-lg z-50">
                  {/* Row 1: Adults & Infants */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Adults */}
                    <div className="text-center p-2 bg-neutral-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <User size={12} className="text-neutral-500" />
                        <span className="text-[10px] font-semibold text-neutral-600">Adults</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => setHotelAdults(Math.max(1, hotelAdults - 1))} className="w-6 h-6 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center transition-colors active:scale-95">
                          <Minus size={12} className="text-neutral-600" />
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold text-neutral-800">{hotelAdults}</span>
                        <button type="button" onClick={() => setHotelAdults(hotelAdults + 1)} className="w-6 h-6 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center transition-colors active:scale-95">
                          <Plus size={12} className="text-neutral-600" />
                        </button>
                      </div>
                    </div>
                    {/* Infants */}
                    <div className="text-center p-2 bg-emerald-50/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Baby size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-semibold text-neutral-600">Infants</span>
                        <span className="text-emerald-600 text-[8px] font-bold">FREE</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => setHotelInfants(Math.max(0, hotelInfants - 1))} className="w-6 h-6 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition-colors active:scale-95">
                          <Minus size={12} className="text-emerald-600" />
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold text-neutral-800">{hotelInfants}</span>
                        <button type="button" onClick={() => setHotelInfants(hotelInfants + 1)} className="w-6 h-6 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition-colors active:scale-95">
                          <Plus size={12} className="text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Row 2: Children & Rooms */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Children */}
                    <div className="text-center p-2 bg-violet-50/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users size={12} className="text-violet-500" />
                        <span className="text-[10px] font-semibold text-neutral-600">Children</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => { const n = Math.max(0, hotelChildren - 1); setHotelChildren(n); setHotelChildAges(prev => prev.slice(0, n)); }} className="w-6 h-6 rounded-lg bg-white border border-violet-200 hover:bg-violet-100 flex items-center justify-center transition-colors active:scale-95">
                          <Minus size={12} className="text-violet-600" />
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold text-neutral-800">{hotelChildren}</span>
                        <button type="button" onClick={() => { const n = hotelChildren + 1; setHotelChildren(n); setHotelChildAges(prev => [...prev, 8]); }} className="w-6 h-6 rounded-lg bg-white border border-violet-200 hover:bg-violet-100 flex items-center justify-center transition-colors active:scale-95">
                          <Plus size={12} className="text-violet-600" />
                        </button>
                      </div>
                    </div>
                    {/* Rooms */}
                    <div className="text-center p-2 bg-primary-50/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BedDouble size={12} className="text-primary-500" />
                        <span className="text-[10px] font-semibold text-neutral-600">Rooms</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => setHotelRooms(Math.max(1, hotelRooms - 1))} className="w-6 h-6 rounded-lg bg-white border border-primary-200 hover:bg-primary-100 flex items-center justify-center transition-colors active:scale-95">
                          <Minus size={12} className="text-primary-600" />
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold text-neutral-800">{hotelRooms}</span>
                        <button type="button" onClick={() => setHotelRooms(hotelRooms + 1)} className="w-6 h-6 rounded-lg bg-white border border-primary-200 hover:bg-primary-100 flex items-center justify-center transition-colors active:scale-95">
                          <Plus size={12} className="text-primary-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Child Ages - Apple-Class */}
                  {hotelChildren > 0 && (
                    <div className="mb-2 bg-violet-50/50 rounded-lg p-2 border border-violet-100">
                      <p className="text-[9px] font-semibold text-violet-600 mb-1 flex items-center gap-1 uppercase tracking-wide">
                        <Baby size={10} className="text-violet-500" />
                        Child Ages
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from({ length: hotelChildren }).map((_, index) => (
                          <select
                            key={index}
                            value={hotelChildAges[index] || 8}
                            onChange={(e) => {
                              const newAges = [...hotelChildAges];
                              newAges[index] = parseInt(e.target.value);
                              setHotelChildAges(newAges);
                            }}
                            className="px-1.5 py-0.5 border border-violet-200 rounded-md text-[11px] font-semibold focus:ring-1 focus:ring-violet-400 bg-white text-neutral-700"
                          >
                            {Array.from({ length: 16 }, (_, i) => i + 2).map(age => (
                              <option key={age} value={age}>{age}y</option>
                            ))}
                          </select>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Done Button - Apple-Class */}
                  <button onClick={() => setShowPassengerDropdown(false)} className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-[12px] active:scale-[0.98]">
                    Done
                  </button>
                </div>
              )}

            </div>

            {/* Search Button - Apple-Class */}
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <label className="hidden lg:block text-[11px] font-semibold text-neutral-600 mb-1.5 opacity-0">Search</label>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full lg:w-auto py-3 lg:py-2.5 px-8 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-[13px] touch-manipulation active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Search Hotels</span>
                )}
              </button>
            </div>
          </div>

          {/* 📍 POPULAR AREAS - Matches Filter Bar Style (same row, horizontal scroll) */}
          {(popularDistricts.length > 0 || selectedDistricts.length > 0) && hotelDestination && (
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-hide -mx-2 px-2 lg:mx-0 lg:px-0">
              {/* Popular Label - Same style as Filter button */}
              <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary-100 text-secondary-700 font-bold text-[11px]">
                <MapPin className="w-3 h-3" />
                Popular:
              </div>

              {/* District Pills - Match filter bar pill style exactly */}
              {popularDistricts.length > 0 ? (
                popularDistricts.map((district) => {
                  const isSelected = selectedDistricts.some(d =>
                    (d.id && district.id && d.id.toLowerCase() === district.id.toLowerCase()) ||
                    (d.name && district.name && d.name.toLowerCase() === district.name.toLowerCase())
                  );
                  return (
                    <button
                      key={district.id}
                      type="button"
                      onClick={() => toggleDistrictSelection(district)}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                      {district.name}
                    </button>
                  );
                })
              ) : (
                selectedDistricts.map((district) => (
                  <button
                    key={district.id}
                    type="button"
                    onClick={() => setSelectedDistricts(selectedDistricts.filter(d => d.id !== district.id))}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all active:scale-95 whitespace-nowrap bg-primary-500 text-white"
                  >
                    <Check className="w-3 h-3 inline mr-1" />
                    {district.name}
                  </button>
                ))
              )}

              {/* Clear Button */}
              {selectedDistricts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedDistricts([])}
                  className="flex-shrink-0 px-2 py-1.5 text-[11px] text-neutral-400 hover:text-error-500 font-medium transition-colors whitespace-nowrap"
                >
                  <X className="w-3 h-3 inline" /> Clear
                </button>
              )}
            </div>
          )}
          </>
          )}

          {/* CAR RENTAL FIELDS */}
          {serviceType === 'cars' && (
          <>
          {/* Search Fields Row */}
          <div className="flex items-end gap-3">
            {/* Pickup Location */}
            <div className="flex-1">
              <div className="flex items-center justify-between h-[28px] mb-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Car size={13} className="text-gray-600" />
                  <span>Pickup Location</span>
                </label>
              </div>
              <div className="h-[56px]">
                <InlineAirportAutocomplete
                  value={carPickupLocation}
                  onChange={(codes) => setCarPickupLocation(codes[0] || '')}
                  placeholder="Airport code (e.g., MIA)"
                />
              </div>
            </div>

            {/* Dropoff Location */}
            <div className="flex-1">
              <div className="flex items-center justify-between h-[28px] mb-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Car size={13} className="text-gray-600" />
                  <span>Dropoff Location</span>
                </label>

                {/* Same location checkbox aligned to the right */}
                <label className="flex items-center gap-1 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sameDropoffLocation}
                    onChange={(e) => {
                      setSameDropoffLocation(e.target.checked);
                      if (e.target.checked) {
                        setCarDropoffLocation('');
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#D63A35] focus:ring-[#D63A35] cursor-pointer"
                  />
                  <span className="text-xs font-normal text-gray-600 group-hover:text-gray-900">Same location</span>
                </label>
              </div>
              <div className="h-[56px]">
                {!sameDropoffLocation ? (
                  <InlineAirportAutocomplete
                    value={carDropoffLocation || carPickupLocation}
                    onChange={(codes) => setCarDropoffLocation(codes[0] || '')}
                    placeholder="Airport code (e.g., MIA)"
                  />
                ) : (
                  <div className="relative w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed h-full flex items-center">
                    <Car className="absolute left-3 text-gray-300" size={20} />
                    <span className="block pl-8 text-sm text-gray-400 italic">
                      Same as pickup
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup Date */}
            <div className="flex-1">
              <div className="flex items-center justify-between h-[28px] mb-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <CalendarDays size={13} className="text-primary-500" />
                  <span>Pickup Date</span>
                </label>

                {/* Pickup Time aligned to the right */}
                <select
                  value={carPickupTime}
                  onChange={(e) => setCarPickupTime(e.target.value)}
                  className="px-2 py-0.5 bg-white border border-gray-300 rounded-md hover:border-[#D63A35] transition-all text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#D63A35]"
                >
                  {['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(time => (
                    <option key={`pickup-${time}`} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <button
                ref={carPickupDateRef}
                type="button"
                onClick={() => setShowCarPickupDatePicker(true)}
                className="w-full relative px-4 py-4 bg-white border rounded-lg hover:border-[#D63A35] transition-all cursor-pointer border-gray-300"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-sm font-medium text-gray-900">
                  {carPickupDate ? formatDateForDisplay(carPickupDate) : 'Select date'}
                </span>
              </button>
            </div>

            {/* Dropoff Date */}
            <div className="flex-1">
              <div className="flex items-center justify-between h-[28px] mb-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <CalendarCheck size={13} className="text-primary-500" />
                  <span>Dropoff Date</span>
                </label>

                {/* Dropoff Time aligned to the right */}
                <select
                  value={carDropoffTime}
                  onChange={(e) => setCarDropoffTime(e.target.value)}
                  className="px-2 py-0.5 bg-white border border-gray-300 rounded-md hover:border-[#D63A35] transition-all text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#D63A35]"
                >
                  {['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(time => (
                    <option key={`dropoff-${time}`} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <button
                ref={carDropoffDateRef}
                type="button"
                onClick={() => setShowCarDropoffDatePicker(true)}
                className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all cursor-pointer"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-sm font-medium text-gray-900">
                  {carDropoffDate ? formatDateForDisplay(carDropoffDate) : 'Select date'}
                </span>
              </button>
            </div>

            {/* Search Button */}
            <div className="flex-shrink-0">
              <div className="h-[28px] mb-2" />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="py-4 px-10 bg-[#D63A35] hover:bg-[#0077E6] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm h-[56px]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>{t('searchCars')}</span>
                )}
              </button>
            </div>
          </div>
          </>
          )}

          {/* TOURS FIELDS */}
          {serviceType === 'tours' && (
          <>
          {/* Search Fields Row */}
          <div className="flex items-center gap-3">
            {/* Tour Destination with Autocomplete */}
            <div className="flex-1 relative" ref={hotelDestinationRef}>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <MapPin size={13} className="text-orange-600" />
                <span>Destination</span>
              </label>
              <input
                type="text"
                value={hotelDestination}
                onChange={(e) => handleHotelDestinationChange(e.target.value)}
                onFocus={() => {
                  if (hotelDestination.length >= 2) {
                    setShowHotelSuggestions(true);
                  }
                }}
                placeholder="City or attraction"
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm font-medium"
              />
              {/* Suggestions Dropdown */}
              {showHotelSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  {isLoadingHotelSuggestions ? (
                    <div className="p-4 flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">Finding destinations...</span>
                    </div>
                  ) : hotelSuggestions.length > 0 ? (
                    <div className="py-2">
                      {hotelSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleHotelSuggestionSelect(suggestion);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-all flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                        >
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-100 text-xl">
                            {suggestion.emoji || '🏙️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{suggestion.name}</div>
                            <div className="text-xs text-gray-500">{suggestion.country}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : hotelDestination.length >= 2 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No destinations found</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Tour Date */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <CalendarDays size={13} className="text-primary-500" />
                <span>Date</span>
              </label>
              <button
                type="button"
                onClick={() => setShowHotelCheckInPicker(true)}
                className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all cursor-pointer"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-sm font-medium text-gray-900">
                  {checkInDate ? formatDateForDisplay(checkInDate) : 'Select date'}
                </span>
              </button>
            </div>

            {/* Travelers */}
            <div className="flex-1 relative">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Users size={13} className="text-primary-500" />
                <span>Travelers</span>
              </label>
              <button
                type="button"
                onClick={() => setShowHotelGuestPicker(!showHotelGuestPicker)}
                className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all cursor-pointer"
              >
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-sm font-medium text-gray-900">
                  {hotelAdults + hotelChildren} {hotelAdults + hotelChildren === 1 ? 'Traveler' : 'Travelers'}
                </span>
              </button>

              {/* Guest Picker Dropdown */}
              {showHotelGuestPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Adults</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHotelAdults(Math.max(1, hotelAdults - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{hotelAdults}</span>
                      <button
                        type="button"
                        onClick={() => setHotelAdults(hotelAdults + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Children</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHotelChildren(Math.max(0, hotelChildren - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{hotelChildren}</span>
                      <button
                        type="button"
                        onClick={() => setHotelChildren(hotelChildren + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Done Button */}
                  <button
                    onClick={() => setShowHotelGuestPicker(false)}
                    className="w-full py-2 bg-[#D63A35] hover:bg-[#0077E6] text-white font-semibold rounded-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-700 mb-2 opacity-0">Search</label>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="py-4 px-10 bg-[#D63A35] hover:bg-[#0077E6] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>{t('searchTours')}</span>
                )}
              </button>
            </div>
          </div>
          </>
          )}

          {/* ACTIVITIES FIELDS */}
          {serviceType === 'activities' && (
          <>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-2">
            {/* Activity or Destination with Autocomplete */}
            <div className="flex-1 relative" ref={hotelDestinationRef}>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <MapPin size={13} className="text-purple-600" />
                <span>{lang === 'en' ? 'Activity or Destination' : lang === 'pt' ? 'Atividade ou Destino' : 'Actividad o Destino'}</span>
              </label>
              <input
                type="text"
                value={hotelDestination}
                onChange={(e) => handleHotelDestinationChange(e.target.value)}
                onFocus={() => {
                  if (hotelDestination.length >= 2) {
                    setShowHotelSuggestions(true);
                  }
                }}
                placeholder={lang === 'en' ? 'e.g., Scuba Diving, Paris, Bungee Jump' : lang === 'pt' ? 'ex: Mergulho, Paris, Bungee Jump' : 'ej: Buceo, París, Bungee Jump'}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium"
              />
              {/* Suggestions Dropdown */}
              {showHotelSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  {isLoadingHotelSuggestions ? (
                    <div className="p-4 flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">Finding destinations...</span>
                    </div>
                  ) : hotelSuggestions.length > 0 ? (
                    <div className="py-2">
                      {hotelSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleHotelSuggestionSelect(suggestion);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-all flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                        >
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-100 text-xl">
                            {suggestion.emoji || '🏙️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{suggestion.name}</div>
                            <div className="text-xs text-gray-500">{suggestion.country}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : hotelDestination.length >= 2 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No destinations found</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Activity Date */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Calendar size={13} className="text-gray-600" />
                <span>{lang === 'en' ? 'Activity Date' : lang === 'pt' ? 'Data da Atividade' : 'Fecha de Actividad'}</span>
              </label>
              <button
                type="button"
                ref={hotelCheckInRef}
                onClick={() => setShowHotelCheckInPicker(true)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={18} className="text-gray-600 group-hover:text-[#D63A35] transition-colors" />
                  <span className="font-medium text-sm text-gray-800">
                    {checkInDate ? formatDateForDisplay(checkInDate) : lang === 'en' ? 'Select date' : lang === 'pt' ? 'Selecionar data' : 'Seleccionar fecha'}
                  </span>
                </div>
                <ChevronDown size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Participants */}
            <div className="flex-1 relative">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Users size={13} className="text-primary-500" />
                <span>{lang === 'en' ? 'Participants' : lang === 'pt' ? 'Participantes' : 'Participantes'}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowHotelGuestPicker(!showHotelGuestPicker)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Users size={18} className="text-gray-600 group-hover:text-[#D63A35] transition-colors" />
                  <span className="font-medium text-sm text-gray-800">
                    {hotelAdults + hotelChildren} {lang === 'en' ? (hotelAdults + hotelChildren === 1 ? 'participant' : 'participants') : lang === 'pt' ? (hotelAdults + hotelChildren === 1 ? 'participante' : 'participantes') : (hotelAdults + hotelChildren === 1 ? 'participante' : 'participantes')}
                  </span>
                </div>
                <ChevronDown size={18} className="text-gray-400" />
              </button>

              {/* Participants Picker Dropdown */}
              {showHotelGuestPicker && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] p-4 space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{lang === 'en' ? 'Adults' : lang === 'pt' ? 'Adultos' : 'Adultos'}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHotelAdults(Math.max(1, hotelAdults - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{hotelAdults}</span>
                      <button
                        type="button"
                        onClick={() => setHotelAdults(hotelAdults + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{lang === 'en' ? 'Children' : lang === 'pt' ? 'Crianças' : 'Niños'}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHotelChildren(Math.max(0, hotelChildren - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{hotelChildren}</span>
                      <button
                        type="button"
                        onClick={() => setHotelChildren(hotelChildren + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Done Button */}
                  <button
                    onClick={() => setShowHotelGuestPicker(false)}
                    className="w-full py-2 bg-[#D63A35] hover:bg-[#0077E6] text-white font-semibold rounded-lg transition-all"
                  >
                    {lang === 'en' ? 'Done' : lang === 'pt' ? 'Concluído' : 'Listo'}
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-700 mb-2 opacity-0">Search</label>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="py-4 px-10 bg-[#D63A35] hover:bg-[#0077E6] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>{t('searchActivities')}</span>
                )}
              </button>
            </div>
          </div>
          </>
          )}

          {/* TRANSFERS FIELDS */}
          {serviceType === 'transfers' && (
          <>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-2">
            {/* Pickup Location with Autocomplete */}
            <div className="flex-1 relative" data-transfer-pickup>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <LogIn size={13} className="text-teal-600" />
                <span>Pickup Location</span>
              </label>
              <input
                type="text"
                value={carPickupLocation}
                onChange={(e) => handleTransferPickupChange(e.target.value)}
                onFocus={() => {
                  if (carPickupLocation.length >= 2) {
                    fetchTransferSuggestions(carPickupLocation);
                    setShowTransferPickupSuggestions(true);
                    setShowTransferDropoffSuggestions(false);
                  }
                }}
                placeholder="Airport, hotel, or address"
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
              />
              {/* Pickup Suggestions Dropdown */}
              {showTransferPickupSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  {isLoadingTransferSuggestions ? (
                    <div className="p-4 flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">Finding locations...</span>
                    </div>
                  ) : transferSuggestions.length > 0 ? (
                    <div className="py-2">
                      {transferSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTransferSuggestionSelect(suggestion, 'pickup');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-all flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                        >
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-100 text-xl">
                            {suggestion.emoji || '📍'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{suggestion.displayName || suggestion.name}</div>
                            <div className="text-xs text-gray-500">{suggestion.country}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : carPickupLocation.length >= 2 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No locations found</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Dropoff Location with Autocomplete */}
            <div className="flex-1 relative" data-transfer-dropoff>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <LogOut size={13} className="text-teal-600" />
                <span>Dropoff Location</span>
              </label>
              <input
                type="text"
                value={carDropoffLocation}
                onChange={(e) => handleTransferDropoffChange(e.target.value)}
                onFocus={() => {
                  if (carDropoffLocation.length >= 2) {
                    fetchTransferSuggestions(carDropoffLocation);
                    setShowTransferDropoffSuggestions(true);
                    setShowTransferPickupSuggestions(false);
                  }
                }}
                placeholder="Airport, hotel, or address"
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
              />
              {/* Dropoff Suggestions Dropdown */}
              {showTransferDropoffSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  {isLoadingTransferSuggestions ? (
                    <div className="p-4 flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">Finding locations...</span>
                    </div>
                  ) : transferSuggestions.length > 0 ? (
                    <div className="py-2">
                      {transferSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTransferSuggestionSelect(suggestion, 'dropoff');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-all flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                        >
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-100 text-xl">
                            {suggestion.emoji || '📍'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{suggestion.displayName || suggestion.name}</div>
                            <div className="text-xs text-gray-500">{suggestion.country}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : carDropoffLocation.length >= 2 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No locations found</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Calendar size={13} className="text-teal-600" />
                <span>Date & Time</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={carPickupDate}
                  onChange={(e) => setCarPickupDate(e.target.value)}
                  min={minDate}
                  className="flex-1 px-3 py-4 bg-white border border-gray-300 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
                />
                <input
                  type="time"
                  value={carPickupTime}
                  onChange={(e) => setCarPickupTime(e.target.value)}
                  className="w-28 px-3 py-4 bg-white border border-gray-300 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="w-32">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Users size={13} className="text-teal-600" />
                <span>Passengers</span>
              </label>
              <select
                value={hotelAdults}
                onChange={(e) => setHotelAdults(parseInt(e.target.value))}
                className="w-full px-3 py-4 bg-white border border-gray-300 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
              >
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-700 mb-2 opacity-0">Search</label>
              <button
                type="button"
                onClick={() => {
                  if (!carPickupLocation || !carDropoffLocation || !carPickupDate) {
                    setErrors({ transfer: 'Please fill pickup, dropoff, and date' });
                    return;
                  }
                  setIsLoading(true);
                  const params = new URLSearchParams({
                    pickup: carPickupLocation,
                    dropoff: carDropoffLocation,
                    date: carPickupDate,
                    time: carPickupTime,
                    passengers: hotelAdults.toString(),
                  });
                  router.push(`/transfers/results?${params.toString()}`);
                  setTimeout(() => setIsLoading(false), 500);
                }}
                disabled={isLoading}
                className="py-4 px-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm"
              >
                {isLoading ? (
                  <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Searching...</span></>
                ) : (
                  <span>Search Transfers</span>
                )}
              </button>
            </div>
          </div>
          </>
          )}

          {/* PACKAGES FIELDS */}
          {serviceType === 'packages' && (
          <>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-2">
            {/* Destination */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <MapPin size={13} className="text-gray-600" />
                <span>{lang === 'en' ? 'Destination' : lang === 'pt' ? 'Destino' : 'Destino'}</span>
              </label>
              <input
                type="text"
                value={hotelDestination}
                onChange={(e) => setHotelDestination(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., Cancun, Maldives, Dubai' : lang === 'pt' ? 'ex: Cancun, Maldivas, Dubai' : 'ej: Cancún, Maldivas, Dubái'}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] focus:outline-none focus:ring-2 focus:ring-[#D63A35] transition-all text-sm font-medium"
              />
            </div>

            {/* Check-in Date */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Calendar size={13} className="text-gray-600" />
                <span>{lang === 'en' ? 'Departure Date' : lang === 'pt' ? 'Data de Partida' : 'Fecha de Salida'}</span>
              </label>
              <button
                type="button"
                ref={hotelCheckInRef}
                onClick={() => setShowHotelCheckInPicker(true)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={18} className="text-gray-600 group-hover:text-[#D63A35] transition-colors" />
                  <span className="font-medium text-sm text-gray-800">
                    {checkInDate ? formatDateForDisplay(checkInDate) : lang === 'en' ? 'Select date' : lang === 'pt' ? 'Selecionar data' : 'Seleccionar fecha'}
                  </span>
                </div>
                <ChevronDown size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Travelers */}
            <div className="flex-1 relative">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Users size={13} className="text-primary-500" />
                <span>{lang === 'en' ? 'Travelers' : lang === 'pt' ? 'Viajantes' : 'Viajeros'}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowHotelGuestPicker(!showHotelGuestPicker)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Users size={18} className="text-gray-600 group-hover:text-[#D63A35] transition-colors" />
                  <span className="font-medium text-sm text-gray-800">
                    {hotelAdults + hotelChildren} {lang === 'en' ? (hotelAdults + hotelChildren === 1 ? 'traveler' : 'travelers') : lang === 'pt' ? (hotelAdults + hotelChildren === 1 ? 'viajante' : 'viajantes') : (hotelAdults + hotelChildren === 1 ? 'viajero' : 'viajeros')}
                  </span>
                </div>
                <ChevronDown size={18} className="text-gray-400" />
              </button>

              {/* Travelers Picker Dropdown - reuse hotel guest picker */}
              {showHotelGuestPicker && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{lang === 'en' ? 'Adults' : lang === 'pt' ? 'Adultos' : 'Adultos'}</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setHotelAdults(Math.max(1, hotelAdults - 1))} className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"><Minus size={16} /></button>
                      <span className="w-8 text-center font-semibold">{hotelAdults}</span>
                      <button type="button" onClick={() => setHotelAdults(hotelAdults + 1)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"><Plus size={16} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{lang === 'en' ? 'Children' : lang === 'pt' ? 'Crianças' : 'Niños'}</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setHotelChildren(Math.max(0, hotelChildren - 1))} className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"><Minus size={16} /></button>
                      <span className="w-8 text-center font-semibold">{hotelChildren}</span>
                      <button type="button" onClick={() => setHotelChildren(hotelChildren + 1)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#D63A35] hover:bg-primary-50 flex items-center justify-center transition-all"><Plus size={16} /></button>
                    </div>
                  </div>
                  <button onClick={() => setShowHotelGuestPicker(false)} className="w-full py-2 bg-[#D63A35] hover:bg-[#0077E6] text-white font-semibold rounded-lg transition-all">{lang === 'en' ? 'Done' : lang === 'pt' ? 'Concluído' : 'Listo'}</button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-700 mb-2 opacity-0">Search</label>
              <button type="button" onClick={handleSearch} disabled={isLoading} className="py-4 px-10 bg-[#D63A35] hover:bg-[#0077E6] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm">
                {isLoading ? (<><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Searching...</span></>) : (<span>{t('searchPackages')}</span>)}
              </button>
            </div>
          </div>
          </>
          )}

          {/* INSURANCE FIELDS */}
          {serviceType === 'insurance' && (
          <>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-2">
            {/* Trip Destination */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <MapPin size={13} className="text-gray-600" />
                <span>{lang === 'en' ? 'Trip Destination' : lang === 'pt' ? 'Destino da Viagem' : 'Destino del Viaje'}</span>
              </label>
              <input
                type="text"
                value={hotelDestination}
                onChange={(e) => setHotelDestination(e.target.value)}
                placeholder={lang === 'en' ? 'Where are you traveling?' : lang === 'pt' ? 'Para onde você está viajando?' : '¿A dónde viajas?'}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] focus:outline-none focus:ring-2 focus:ring-[#D63A35] transition-all text-sm font-medium"
              />
            </div>

            {/* Trip Start Date */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Calendar size={13} className="text-gray-600" />
                <span>{lang === 'en' ? 'Trip Start Date' : lang === 'pt' ? 'Data de Início' : 'Fecha de Inicio'}</span>
              </label>
              <button
                type="button"
                ref={hotelCheckInRef}
                onClick={() => setShowHotelCheckInPicker(true)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={18} className="text-gray-600 group-hover:text-[#D63A35] transition-colors" />
                  <span className="font-medium text-sm text-gray-800">
                    {checkInDate ? formatDateForDisplay(checkInDate) : lang === 'en' ? 'Select date' : lang === 'pt' ? 'Selecionar data' : 'Seleccionar fecha'}
                  </span>
                </div>
                <ChevronDown size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Trip Cost */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Shield size={13} className="text-gray-600" />
                <span>{lang === 'en' ? 'Trip Cost' : lang === 'pt' ? 'Custo da Viagem' : 'Costo del Viaje'}</span>
              </label>
              <input
                type="text"
                placeholder={lang === 'en' ? '$2,000' : lang === 'pt' ? 'R$ 10.000' : '$2,000'}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#D63A35] focus:outline-none focus:ring-2 focus:ring-[#D63A35] transition-all text-sm font-medium"
              />
            </div>

            {/* Get Quote Button */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-700 mb-2 opacity-0">Quote</label>
              <button type="button" onClick={handleSearch} disabled={isLoading} className="py-4 px-10 bg-[#D63A35] hover:bg-[#0077E6] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm">
                {isLoading ? (<><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Loading...</span></>) : (<span>{t('searchInsurance')}</span>)}
              </button>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Premium Date Picker */}
        <PremiumDatePicker
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          value={departureDate}
          returnValue={returnDate}
          onChange={handleDatePickerChange}
          type={useFlexibleDates ? 'multi' : (tripType === 'oneway' ? 'single' : 'range')}
          selectedDates={useFlexibleDates ? (datePickerType === 'departure' ? departureDates : returnDates) : undefined}
          onMultiChange={useFlexibleDates ? handleMultiDateChange : undefined}
          maxDates={3}
          anchorEl={datePickerType === 'departure' ? departureDateRef.current : returnDateRef.current}
          prices={calendarPrices}
          loadingPrices={loadingCalendarPrices}
        />

        {/* Premium Date Pickers for Hotels */}
        <PremiumDatePicker
          isOpen={showHotelCheckInPicker}
          onClose={() => setShowHotelCheckInPicker(false)}
          value={checkInDate}
          onChange={(date) => {
            setCheckInDate(date);
            setCheckOutDate(''); // Clear checkout when changing check-in
            // DON'T close the picker yet - automatically switch to checkout selection
            setShowHotelCheckInPicker(false);
            // Open checkout picker so user can complete the date range
            setTimeout(() => setShowHotelCheckOutPicker(true), 100);
          }}
          type="single"
          anchorEl={hotelCheckInRef.current}
        />

        <PremiumDatePicker
          isOpen={showHotelCheckOutPicker}
          onClose={() => setShowHotelCheckOutPicker(false)}
          value={checkOutDate}
          onChange={(date) => {
            setCheckOutDate(date);
            // ONLY NOW close the picker - after both dates selected
            setShowHotelCheckOutPicker(false);
          }}
          type="single"
          minDate={checkInDate ? new Date(new Date(checkInDate).getTime() + 24 * 60 * 60 * 1000) : undefined} // Prevent selecting same day or earlier for checkout
          anchorEl={hotelCheckOutRef.current}
        />

        {/* Unified Date Range Picker for Hotels (Mobile) - Opens once, selects check-in then check-out */}
        <PremiumDatePicker
          label="Select Stay Dates"
          isOpen={showHotelDateRangePicker}
          onClose={() => setShowHotelDateRangePicker(false)}
          value={checkInDate}
          returnValue={checkOutDate}
          onChange={(departure, returnDate) => {
            setCheckInDate(departure);
            if (returnDate) {
              setCheckOutDate(returnDate);
            }
            // Auto-close handled by PremiumDatePicker when both dates selected
          }}
          type="range"
          anchorEl={hotelDateRangeRef.current}
        />

        {/* Premium Date Pickers for Car Rentals */}
        <PremiumDatePicker
          isOpen={showCarPickupDatePicker}
          onClose={() => setShowCarPickupDatePicker(false)}
          value={carPickupDate}
          onChange={(date) => {
            setCarPickupDate(date);
            setShowCarPickupDatePicker(false);
          }}
          type="single"
          anchorEl={carPickupDateRef.current}
        />

        <PremiumDatePicker
          isOpen={showCarDropoffDatePicker}
          onClose={() => setShowCarDropoffDatePicker(false)}
          value={carDropoffDate}
          onChange={(date) => {
            setCarDropoffDate(date);
            setShowCarDropoffDatePicker(false);
          }}
          type="single"
          anchorEl={carDropoffDateRef.current}
        />

        {/* Premium Date Pickers for Additional Flights */}
        {additionalFlights.map((flight) => (
          <PremiumDatePicker
            key={`datepicker-${flight.id}`}
            isOpen={additionalFlightDatePickerOpen === flight.id}
            onClose={() => setAdditionalFlightDatePickerOpen(null)}
            value={flight.departureDate}
            onChange={(date) => {
              handleUpdateAdditionalFlight(flight.id, { departureDate: date });
              setAdditionalFlightDatePickerOpen(null);
            }}
            type="single"
            anchorEl={additionalFlightDateRefs.current[flight.id]}
            prices={calendarPrices}
          />
        ))}

        {/* Mobile/Tablet: Apple-Class Stacked layout */}
        <div className="lg:hidden space-y-3 px-0">
          {/* FLIGHTS MOBILE FIELDS */}
          {serviceType === 'flights' && (
          <>
          {/* Airports - Apple-Class Mobile Grid */}
          <div className="space-y-1.5">
            {/* Labels row: From, To, One-way aligned */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                <PlaneTakeoff size={13} className="text-neutral-500" />
                <span>{t('from')}</span>
              </label>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                  <PlaneLanding size={13} className="text-neutral-500" />
                  <span>{t('to')}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer group touch-manipulation">
                  <input
                    type="checkbox"
                    checked={tripType === 'oneway'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTripType('oneway');
                        setReturnDate('');
                      } else {
                        setTripType('roundtrip');
                        if (errors.returnDate) {
                          const newErrors = { ...errors };
                          delete newErrors.returnDate;
                          setErrors(newErrors);
                        }
                      }
                    }}
                    className="w-4 h-4 rounded-md border-neutral-300 text-primary-500 focus:ring-primary-400 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-neutral-500 group-hover:text-primary-500 transition-colors">
                    {t('oneWay')}
                  </span>
                </label>
              </div>
            </div>
            {/* Inputs row */}
            <div className="grid grid-cols-2 gap-2">
              <MultiAirportSelector
                placeholder="Select airports"
                value={origin}
                onChange={handleOriginChange}
                maxDisplay={2}
                lang={lang}
                testId="origin-input"
              />
              <MultiAirportSelector
                placeholder="Select airports"
                value={destination}
                onChange={handleDestinationChange}
                maxDisplay={2}
                lang={lang}
                testId="destination-input"
              />
            </div>
          </div>

          {/* Dates - Apple-Class with Multi-Dates Toggle */}
          <div className="space-y-1.5">
            {/* Labels row: Depart, Return/Add Flight, Multi-Dates aligned */}
            <div className="grid grid-cols-2 gap-2">
              {/* Depart label - with Multi-Dates toggle for one-way */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                  <CalendarDays size={13} className="text-neutral-500" />
                  <span>{t('depart')}</span>
                </label>
                {/* Multi-Dates toggle for one-way */}
                {tripType === 'oneway' && (
                  <label className={`flex items-center gap-1.5 touch-manipulation ${additionalFlights.length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} group`}>
                    <input
                      type="checkbox"
                      checked={useFlexibleDates}
                      disabled={additionalFlights.length > 0}
                      onChange={(e) => {
                        setUseFlexibleDates(e.target.checked);
                        if (e.target.checked) {
                          setDepartureDate('');
                        } else {
                          setDepartureDates([]);
                        }
                      }}
                      className="w-4 h-4 rounded-md border-neutral-300 text-primary-500 focus:ring-primary-400 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className="text-[11px] font-semibold text-neutral-500 group-hover:text-primary-500 transition-colors">
                      Multi-Dates
                    </span>
                  </label>
                )}
              </div>
              {tripType === 'roundtrip' ? (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                    <CalendarCheck size={13} className="text-neutral-500" />
                    <span>{t('return')}</span>
                  </label>
                  {/* Multi-Dates Toggle - Disabled when multi-city flights added */}
                  <label className={`flex items-center gap-1.5 touch-manipulation ${additionalFlights.length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} group`}>
                    <input
                      type="checkbox"
                      checked={useFlexibleDates}
                      disabled={additionalFlights.length > 0}
                      onChange={(e) => {
                        setUseFlexibleDates(e.target.checked);
                        if (e.target.checked) {
                          setDepartureDate('');
                          setReturnDate('');
                        } else {
                          setDepartureDates([]);
                          setReturnDates([]);
                        }
                      }}
                      className="w-4 h-4 rounded-md border-neutral-300 text-primary-500 focus:ring-primary-400 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className="text-[11px] font-semibold text-neutral-500 group-hover:text-primary-500 transition-colors">
                      Multi-Dates
                    </span>
                  </label>
                </div>
              ) : (
                /* One-way: Show "+ Add Flight" label */
                additionalFlights.length === 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                    <Plane size={13} className="text-neutral-400" />
                    <span>Add Flight</span>
                  </label>
                )
              )}
            </div>
            {/* Inputs row - Apple-Class date pickers */}
            <div className="grid grid-cols-2 gap-2">
              {/* Departure Date Button */}
              {!useFlexibleDates ? (
                <button
                  type="button"
                  onClick={() => handleOpenDatePicker('departure')}
                  className={`relative w-full px-3 py-3 min-h-[48px] bg-white border-2 rounded-xl text-left transition-all duration-200 touch-manipulation active:scale-[0.98] ${errors.departureDate ? 'border-red-400' : 'border-neutral-200 hover:border-primary-400'}`}
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <span className="pl-6 text-sm font-semibold text-neutral-800 truncate">
                    {departureDate ? formatDateForDisplay(departureDate) : 'Select date'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenDatePicker('departure')}
                  className={`relative w-full px-3 py-2.5 bg-white border-2 rounded-xl text-left min-h-[48px] transition-all duration-200 touch-manipulation active:scale-[0.98] ${errors.departureDate ? 'border-red-400' : 'border-neutral-200 hover:border-primary-400'}`}
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <div className="pl-6 flex flex-wrap gap-1 items-center">
                    {departureDates.length > 0 ? (
                      departureDates.map((date, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold">
                          {format(date, 'MMM d')}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-neutral-400">Select dates</span>
                    )}
                  </div>
                </button>
              )}
              {/* Return Date Button OR Add Another Flight button (one-way) */}
              {tripType === 'roundtrip' ? (
                !useFlexibleDates ? (
                  <button
                    type="button"
                    onClick={() => handleOpenDatePicker('return')}
                    className={`relative w-full px-3 py-3 min-h-[48px] bg-white border-2 rounded-xl text-left transition-all duration-200 touch-manipulation active:scale-[0.98] ${errors.returnDate ? 'border-red-400' : 'border-neutral-200 hover:border-primary-400'}`}
                  >
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <span className="pl-6 text-sm font-semibold text-neutral-800 truncate">
                      {returnDate ? formatDateForDisplay(returnDate) : 'Select date'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenDatePicker('return')}
                    className={`relative w-full px-3 py-2.5 bg-white border-2 rounded-xl text-left min-h-[48px] transition-all duration-200 touch-manipulation active:scale-[0.98] ${errors.returnDate ? 'border-red-400' : 'border-neutral-200 hover:border-primary-400'}`}
                  >
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <div className="pl-6 flex flex-wrap gap-1 items-center">
                      {returnDates.length > 0 ? (
                        returnDates.map((date, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold">
                            {format(date, 'MMM d')}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-neutral-400">Select dates</span>
                      )}
                    </div>
                  </button>
                )
              ) : (
                /* One-way: Add Another Flight button in same row as date */
                additionalFlights.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddFlight}
                    className="relative w-full px-3 py-3 bg-white border-2 border-dashed border-neutral-300 rounded-xl hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 text-neutral-500 flex items-center justify-center gap-1.5 transition-all duration-200 touch-manipulation active:scale-[0.98]"
                  >
                    <Plus size={16} />
                    <span className="text-sm font-semibold">Add Flight</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Mobile: Additional Flights - Apple-Class Accordion */}
          {tripType === 'oneway' && additionalFlights.length > 0 && (
            <div className="space-y-2">
              {/* Progress indicator */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-semibold text-neutral-500">{additionalFlights.length + 1}/5 flights</span>
                <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${((additionalFlights.length + 1) / 5) * 100}%` }} />
                </div>
              </div>

              {/* Render additional flights - Apple-Class Accordion */}
              {additionalFlights.map((flight, index) => {
                const isExpanded = expandedFlightId === flight.id;
                const hasData = flight.origin.length > 0 && flight.destination.length > 0;
                return (
                  <div key={flight.id} className="bg-neutral-50 rounded-xl overflow-hidden border-2 border-neutral-200">
                    {/* COLLAPSED HEADER - Always visible, tap to expand */}
                    <button
                      type="button"
                      onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] touch-manipulation active:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[11px] font-bold text-primary-600">{index + 2}</span>
                        </div>
                        {hasData ? (
                          <span className="text-xs font-semibold text-neutral-800 truncate">
                            {flight.origin[0]} → {flight.destination[0]} • {flight.departureDate ? format(new Date(flight.departureDate + 'T00:00:00'), 'MMM d') : '--'}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">Tap to configure</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {flight.nonstop && <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg">Direct</span>}
                        <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* EXPANDED CONTENT - Only one at a time */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-2 space-y-2 border-t border-neutral-200 bg-white">
                        {/* Inline: From → To in single row */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 min-w-0">
                            <MultiAirportSelector
                              placeholder="From"
                              value={flight.origin}
                              onChange={(codes) => handleUpdateAdditionalFlight(flight.id, { origin: codes })}
                              maxDisplay={1}
                              lang={lang}
                            />
                          </div>
                          <ArrowRight size={14} className="text-neutral-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <MultiAirportSelector
                              placeholder="To"
                              value={flight.destination}
                              onChange={(codes) => handleUpdateAdditionalFlight(flight.id, { destination: codes })}
                              maxDisplay={1}
                              lang={lang}
                            />
                          </div>
                        </div>

                        {/* Date + Options + Actions - Apple-Class row */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="date"
                              value={formatDateForInput(flight.departureDate)}
                              onChange={(e) => handleUpdateAdditionalFlight(flight.id, { departureDate: e.target.value })}
                              min={minDate}
                              className="w-full px-3 py-2 text-xs font-semibold border-2 border-neutral-200 rounded-xl bg-white focus:border-primary-400 outline-none transition-colors"
                            />
                          </div>
                          <label className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 rounded-xl cursor-pointer flex-shrink-0 touch-manipulation active:scale-95">
                            <input
                              type="checkbox"
                              checked={flight.nonstop}
                              onChange={(e) => handleUpdateAdditionalFlight(flight.id, { nonstop: e.target.checked })}
                              className="w-4 h-4 rounded-md border-neutral-300 text-primary-500 focus:ring-primary-400"
                            />
                            <span className="text-[10px] font-semibold text-neutral-600">Direct</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveFlight(flight.id)}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                            aria-label="Remove flight"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add another flight - Apple-Class */}
              {additionalFlights.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddFlight}
                  className="w-full px-3 py-2.5 border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 text-neutral-500 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 min-h-[44px] touch-manipulation active:scale-[0.98]"
                >
                  <Plus size={14} />
                  <span>Add Flight {additionalFlights.length + 2}</span>
                </button>
              )}
            </div>
          )}

          {/* MOBILE: Travelers & Class + Flight Options - Apple-Class Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Travelers & Class - Apple-Class Button */}
            <div ref={passengerRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassengerDropdown(!showPassengerDropdown);
                }}
                className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white border-2 border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:border-primary-400 transition-all duration-200 touch-manipulation active:scale-[0.98]"
              >
                <Users size={14} className="text-primary-500" />
                <span className="font-bold text-neutral-800">{totalPassengers}</span>
                <span className="text-neutral-300">|</span>
                <span className="text-neutral-600">{t(cabinClass as any)}</span>
                <ChevronDown size={12} className={`text-neutral-400 transition-transform ${showPassengerDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Passenger & Class Dropdown - Apple-Class Mobile Bottom Sheet */}
              {showPassengerDropdown && serviceType === 'flights' && (
                <>
                  {/* Mobile Backdrop Overlay */}
                  <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-modal-backdrop md:hidden animate-in fade-in duration-200"
                    onClick={() => setShowPassengerDropdown(false)}
                    aria-hidden="true"
                  />
                  <div className="fixed md:absolute inset-x-0 bottom-0 md:bottom-auto md:left-0 md:right-auto md:top-full md:mt-2 bg-white/95 backdrop-blur-xl border-t md:border border-neutral-200 rounded-t-3xl md:rounded-2xl shadow-2xl z-modal md:min-w-[280px] max-h-[70vh] md:max-h-none overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 md:slide-in-from-top-2 md:fade-in safe-area-bottom">
                    {/* Drag Handle */}
                    <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-3 mb-2 md:hidden" />
                    <div className="px-4 py-3 pb-6 md:pb-3 space-y-3">
                  {/* Adults Row */}
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-semibold text-neutral-700">Adults <span className="text-neutral-400 font-normal">18+</span></span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handlePassengerChange('adults', -1)} disabled={passengers.adults <= 1} className="w-8 h-8 rounded-full border-2 border-neutral-200 hover:border-primary-400 disabled:opacity-30 flex items-center justify-center text-sm font-bold text-neutral-600 transition-colors touch-manipulation active:scale-95">−</button>
                      <span className="w-6 text-center text-sm font-bold text-neutral-800">{passengers.adults}</span>
                      <button type="button" onClick={() => handlePassengerChange('adults', 1)} className="w-8 h-8 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center text-sm font-bold text-neutral-600 transition-colors touch-manipulation active:scale-95">+</button>
                    </div>
                  </div>

                  {/* Children Row */}
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-semibold text-neutral-700">Children <span className="text-neutral-400 font-normal">2-17</span></span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handlePassengerChange('children', -1)} disabled={passengers.children <= 0} className="w-8 h-8 rounded-full border-2 border-neutral-200 hover:border-primary-400 disabled:opacity-30 flex items-center justify-center text-sm font-bold text-neutral-600 transition-colors touch-manipulation active:scale-95">−</button>
                      <span className="w-6 text-center text-sm font-bold text-neutral-800">{passengers.children}</span>
                      <button type="button" onClick={() => handlePassengerChange('children', 1)} className="w-8 h-8 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center text-sm font-bold text-neutral-600 transition-colors touch-manipulation active:scale-95">+</button>
                    </div>
                  </div>

                  {/* Infants Row */}
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-semibold text-neutral-700">Infants <span className="text-neutral-400 font-normal">&lt;2</span></span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handlePassengerChange('infants', -1)} disabled={passengers.infants <= 0} className="w-8 h-8 rounded-full border-2 border-neutral-200 hover:border-primary-400 disabled:opacity-30 flex items-center justify-center text-sm font-bold text-neutral-600 transition-colors touch-manipulation active:scale-95">−</button>
                      <span className="w-6 text-center text-sm font-bold text-neutral-800">{passengers.infants}</span>
                      <button type="button" onClick={() => handlePassengerChange('infants', 1)} className="w-8 h-8 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center text-sm font-bold text-neutral-600 transition-colors touch-manipulation active:scale-95">+</button>
                    </div>
                  </div>

                  {/* Cabin Class - Apple-Class Chips */}
                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                      {(['economy', 'premium', 'business', 'first'] as const).map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setCabinClass(cls)}
                          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 touch-manipulation active:scale-95 ${
                            cabinClass === cls
                              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {t(cls)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Done Button - Apple-Class */}
                  <button
                    type="button"
                    onClick={() => setShowPassengerDropdown(false)}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/25 transition-all duration-200 touch-manipulation active:scale-[0.98]"
                  >
                    Done
                  </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Vertical divider */}
            <div className="h-4 w-px bg-neutral-200 flex-shrink-0" />

            {/* Direct Flights - Apple-Class Chip */}
            <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 min-h-[36px] px-3 py-1.5 bg-neutral-100 rounded-xl touch-manipulation active:scale-95 hover:bg-neutral-200 transition-colors">
              <input
                type="checkbox"
                checked={directFlights}
                onChange={(e) => setDirectFlights(e.target.checked)}
                className="w-4 h-4 rounded-md border-neutral-300 text-primary-500 focus:ring-primary-400 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">Direct</span>
            </label>

            {/* Separate Tickets - Apple-Class Chip (round trips only) */}
            {tripType === 'roundtrip' && (
              <>
                <div className="h-4 w-px bg-neutral-200 flex-shrink-0" />
                <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 min-h-[36px] px-3 py-1.5 bg-amber-50 rounded-xl touch-manipulation active:scale-95 hover:bg-amber-100 transition-colors" title="Find cheaper fares by combining different airlines">
                  <input
                    type="checkbox"
                    checked={includeSeparateTickets}
                    onChange={(e) => setIncludeSeparateTickets(e.target.checked)}
                    className="w-4 h-4 rounded-md border-amber-300 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-neutral-600 whitespace-nowrap">Split</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded-md">$</span>
                </label>
              </>
            )}
          </div>

          {/* Search Button - Apple-Class Primary */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-[15px] rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-200 touch-manipulation active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('searching')}</span>
              </>
            ) : (
              <span>{t('search')}</span>
            )}
          </button>
          </>
          )}

          {/* HOTELS MOBILE FIELDS */}
          {serviceType === 'hotels' && (
          <>
          {/* Row 1: Destination + Guests & Rooms on same row */}
          <div className="flex gap-2">
            {/* Hotel Destination - Takes most space */}
            <div ref={hotelDestinationRef} className="relative flex-1 min-w-0">
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                Destination
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                  type="text"
                  value={hotelDestination}
                  onChange={(e) => {
                    console.log('📱 Mobile input onChange event:', e.target.value);
                    handleHotelDestinationChange(e.target.value);
                  }}
                  onFocus={() => {
                    console.log('📱 Mobile input onFocus event, current value:', hotelDestination);
                    if (hotelDestination.length >= 2) {
                      console.log('✅ Opening mobile suggestions (value length >= 2)');
                      setShowHotelSuggestions(true);
                    } else {
                      console.log('⚠️ Not opening mobile suggestions (value too short)');
                    }
                  }}
                  placeholder="City, hotel, landmark"
                  className={`w-full pl-9 pr-3 py-2.5 bg-white border-2 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-neutral-800 ${
                    errors.hotel ? 'border-red-400' : 'border-neutral-200'
                  }`}
                />
              </div>
              {errors.hotel && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.hotel}
                </p>
              )}

              {/* Mobile Suggestions Dropdown */}
              {showHotelSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-2xl z-dropdown max-h-64 overflow-y-auto">
                  {isLoadingHotelSuggestions ? (
                    <div className="p-4 text-center text-neutral-500 text-sm">Loading...</div>
                  ) : hotelSuggestions.length > 0 ? (
                    <div className="py-2">
                      {hotelSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleHotelSuggestionSelect(suggestion);
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            handleHotelSuggestionSelect(suggestion);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-primary-50 active:bg-primary-100 transition-colors flex items-start gap-3 touch-manipulation min-h-[48px]"
                        >
                          <Building2 size={14} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-neutral-800 text-sm">
                              {suggestion.name}
                            </div>
                            {(suggestion.city || suggestion.country) && (
                              <div className="text-xs text-neutral-500 truncate">
                                {[suggestion.city, suggestion.country].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-neutral-500 text-sm">No results found</div>
                  )}
                </div>
              )}
            </div>

            {/* Guests & Rooms - Compact button on same row */}
            <div className="relative flex-shrink-0">
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                Guests
              </label>
              <button
                type="button"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-400 transition-all text-xs font-semibold text-neutral-800 whitespace-nowrap touch-manipulation active:scale-[0.98]"
              >
                <Users className="text-primary-500" size={14} />
                <span className="font-bold">{hotelAdults + hotelChildren}</span>
                <span className="text-neutral-300">|</span>
                <BedDouble className="text-neutral-400" size={14} />
                <span>{hotelRooms}</span>
                <ChevronDown className="text-neutral-400" size={12} />
              </button>

              {/* Guests & Rooms Dropdown - Apple-Class Mobile Bottom Sheet */}
              {showPassengerDropdown && (
                <div className="fixed md:absolute inset-x-0 bottom-0 md:bottom-auto md:right-0 md:left-auto md:top-full md:mt-2 bg-white/95 backdrop-blur-xl border-t md:border border-neutral-200 rounded-t-3xl md:rounded-2xl shadow-2xl z-modal md:w-64 p-4 space-y-3">
                  {/* Drag Handle */}
                  <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-2 md:hidden" />
                  {/* Adults */}
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-semibold text-neutral-700">Adults</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHotelAdults(Math.max(1, hotelAdults - 1))}
                        className="w-7 h-7 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center transition-colors text-neutral-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center font-bold text-neutral-800">{hotelAdults}</span>
                      <button
                        type="button"
                        onClick={() => setHotelAdults(hotelAdults + 1)}
                        className="w-7 h-7 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center transition-colors text-neutral-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-semibold text-neutral-700">Children</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHotelChildren(Math.max(0, hotelChildren - 1))}
                        className="w-7 h-7 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center transition-colors text-neutral-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center font-bold text-neutral-800">{hotelChildren}</span>
                      <button
                        type="button"
                        onClick={() => setHotelChildren(hotelChildren + 1)}
                        className="w-7 h-7 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center transition-colors text-neutral-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-semibold text-neutral-700">Rooms</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHotelRooms(Math.max(1, hotelRooms - 1))}
                        className="w-7 h-7 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center transition-colors text-neutral-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center font-bold text-neutral-800">{hotelRooms}</span>
                      <button
                        type="button"
                        onClick={() => setHotelRooms(hotelRooms + 1)}
                        className="w-7 h-7 rounded-full border-2 border-neutral-200 hover:border-primary-400 flex items-center justify-center transition-colors text-neutral-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Done Button - Apple-Class */}
                  <button
                    onClick={() => setShowPassengerDropdown(false)}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-primary-500/25 touch-manipulation active:scale-[0.98]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Popular Districts Quick-Select (Mobile) - Match filter bar style */}
          {popularDistricts.length > 0 && !showHotelSuggestions && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-2 px-2">
              <span className="flex-shrink-0 px-2 py-1 text-[11px] font-bold text-secondary-700 bg-secondary-100 rounded-lg">Popular:</span>
              {popularDistricts.slice(0, 6).map((district) => {
                const isSelected = selectedDistricts.some(d => d.id?.toLowerCase() === district.id?.toLowerCase());
                return (
                  <button
                    key={district.id}
                    type="button"
                    onClick={() => toggleDistrictSelection(district)}
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all active:scale-95 whitespace-nowrap ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {district.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Check-in and Check-out Dates - Unified Date Range Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Stay Dates
            </label>
            <button
              type="button"
              onClick={() => setShowHotelDateRangePicker(true)}
              className="w-full px-3 py-2.5 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-400 transition-all touch-manipulation active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                {/* Check-in */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${checkInDate ? 'bg-emerald-500' : 'bg-neutral-100'}`}>
                      <LogIn className={`w-3 h-3 ${checkInDate ? 'text-white' : 'text-neutral-400'}`} />
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase">Check-in</span>
                  </div>
                  <div className={`text-[13px] font-bold ${checkInDate ? 'text-neutral-800' : 'text-neutral-400'}`}>
                    {checkInDate ? formatDateForDisplay(checkInDate) : 'Select'}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center px-1">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                  {checkInDate && checkOutDate && (
                    <span className="text-[9px] font-semibold text-primary-500">
                      {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))}n
                    </span>
                  )}
                </div>

                {/* Check-out */}
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase">Check-out</span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${checkOutDate ? 'bg-orange-500' : 'bg-neutral-100'}`}>
                      <LogOut className={`w-3 h-3 ${checkOutDate ? 'text-white' : 'text-neutral-400'}`} />
                    </div>
                  </div>
                  <div className={`text-[13px] font-bold ${checkOutDate ? 'text-neutral-800' : 'text-neutral-400'}`}>
                    {checkOutDate ? formatDateForDisplay(checkOutDate) : 'Select'}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Search Button - Apple-Class Primary */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-[15px] rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-200 touch-manipulation active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Searching...</span>
              </>
            ) : (
              <span>Search Hotels</span>
            )}
          </button>
          </>
          )}
        </div>
      </MaxWidthContainer>
    </div>
  );
}
