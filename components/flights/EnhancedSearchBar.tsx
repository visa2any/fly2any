'use client';

import { useState, useRef, useEffect } from 'react';
import { Plane, Calendar, Users, ChevronDown, ArrowLeftRight, PlaneTakeoff, PlaneLanding, CalendarDays, CalendarCheck, ArrowRight, Sparkles, Armchair, X, Hotel, Car, Map, Building2, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { typography, spacing, colors, dimensions, layout, borderRadius, zIndex } from '@/lib/design-system';
import PremiumDatePicker from './PremiumDatePicker';
import { InlineAirportAutocomplete } from './InlineAirportAutocomplete';
import MultiAirportSelector, { Airport as MultiAirport } from '@/components/common/MultiAirportSelector';
import MultiDatePicker from '@/components/common/MultiDatePicker';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

type ServiceType = 'flights' | 'hotels' | 'cars' | 'tours';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface EnhancedSearchBarProps {
  origin?: string;  // Can be single code "JFK" or comma-separated "JFK,EWR,LGA"
  destination?: string;  // Can be single code "LAX" or comma-separated "LAX,SNA,ONT"
  departureDate?: string;
  returnDate?: string;
  passengers?: PassengerCounts;
  cabinClass?: 'economy' | 'premium' | 'business' | 'first';
  lang?: 'en' | 'pt' | 'es';
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

const content = {
  en: {
    // Service tabs
    flights: 'Flights',
    hotels: 'Hotels',
    cars: 'Car Rentals',
    tours: 'Tours & Activities',

    from: 'From',
    to: 'To',
    depart: 'Depart',
    return: 'Return',
    travelers: 'Travelers',
    class: 'Class',
    search: 'Search Flights',
    searchHotels: 'Search Hotels',
    searchCars: 'Search Cars',
    searchTours: 'Search Tours',
    searching: 'Searching...',
    oneWay: 'One-way',
    roundTrip: 'Round-trip',
    adults: 'Adults',
    children: 'Children',
    infants: 'Infants',
    economy: 'Economy',
    premium: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
    done: 'Done',
    guest: 'Guest',
    guests: 'Guests',
    age18: '18+ years',
    age2to17: '2-17 years',
    ageUnder2: 'Under 2 years',
    directOnly: 'Direct flights only',
    errors: {
      originRequired: 'Please select origin',
      destinationRequired: 'Please select destination',
      departureDateRequired: 'Please select departure date',
      sameAirports: 'Origin and destination must be different',
    },
  },
  pt: {
    // Service tabs
    flights: 'Voos',
    hotels: 'Hotéis',
    cars: 'Aluguel de Carros',
    tours: 'Passeios e Atividades',

    from: 'De',
    to: 'Para',
    depart: 'Ida',
    return: 'Volta',
    travelers: 'Viajantes',
    class: 'Classe',
    search: 'Buscar Voos',
    searchHotels: 'Buscar Hotéis',
    searchCars: 'Buscar Carros',
    searchTours: 'Buscar Passeios',
    searching: 'Buscando...',
    oneWay: 'Só ida',
    roundTrip: 'Ida e volta',
    adults: 'Adultos',
    children: 'Crianças',
    infants: 'Bebês',
    economy: 'Econômica',
    premium: 'Econômica Premium',
    business: 'Executiva',
    first: 'Primeira Classe',
    done: 'Pronto',
    guest: 'Passageiro',
    guests: 'Passageiros',
    age18: '18+ anos',
    age2to17: '2-17 anos',
    ageUnder2: 'Menos de 2 anos',
    directOnly: 'Apenas voos diretos',
    errors: {
      originRequired: 'Selecione a origem',
      destinationRequired: 'Selecione o destino',
      departureDateRequired: 'Selecione a data de ida',
      sameAirports: 'Origem e destino devem ser diferentes',
    },
  },
  es: {
    // Service tabs
    flights: 'Vuelos',
    hotels: 'Hoteles',
    cars: 'Alquiler de Autos',
    tours: 'Tours y Actividades',

    from: 'Desde',
    to: 'Hasta',
    depart: 'Salida',
    return: 'Regreso',
    travelers: 'Viajeros',
    class: 'Clase',
    search: 'Buscar Vuelos',
    searchHotels: 'Buscar Hoteles',
    searchCars: 'Buscar Autos',
    searchTours: 'Buscar Tours',
    searching: 'Buscando...',
    oneWay: 'Solo ida',
    roundTrip: 'Ida y vuelta',
    adults: 'Adultos',
    children: 'Niños',
    infants: 'Bebés',
    economy: 'Económica',
    premium: 'Económica Premium',
    business: 'Ejecutiva',
    first: 'Primera Clase',
    done: 'Listo',
    guest: 'Pasajero',
    guests: 'Pasajeros',
    age18: '18+ años',
    age2to17: '2-17 años',
    ageUnder2: 'Menos de 2 años',
    directOnly: 'Solo vuelos directos',
    errors: {
      originRequired: 'Seleccione origen',
      destinationRequired: 'Seleccione destino',
      departureDateRequired: 'Seleccione fecha de salida',
      sameAirports: 'Origen y destino deben ser diferentes',
    },
  },
};

export default function EnhancedSearchBar({
  origin: initialOrigin = '',
  destination: initialDestination = '',
  departureDate: initialDepartureDate = '',
  returnDate: initialReturnDate = '',
  passengers: initialPassengers = { adults: 1, children: 0, infants: 0 },
  cabinClass: initialCabinClass = 'economy',
  lang = 'en',
}: EnhancedSearchBarProps) {
  const t = content[lang];
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

  // Service type state
  const [serviceType, setServiceType] = useState<ServiceType>('flights');

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
  const [openMultiDatePicker, setOpenMultiDatePicker] = useState<'departure' | 'return' | null>(null); // Track which multi-date picker is open

  // Independent nonstop filters for outbound and return flights
  const [fromNonstop, setFromNonstop] = useState(false);
  const [toNonstop, setToNonstop] = useState(false);

  // Hotel-specific state
  const [hotelDestination, setHotelDestination] = useState('');
  const [hotelLocation, setHotelLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [hotelAdults, setHotelAdults] = useState(2);
  const [hotelChildren, setHotelChildren] = useState(0);
  const [hotelRooms, setHotelRooms] = useState(1);
  const [hotelSuggestions, setHotelSuggestions] = useState<any[]>([]);
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [isLoadingHotelSuggestions, setIsLoadingHotelSuggestions] = useState(false);
  const [showHotelCheckInPicker, setShowHotelCheckInPicker] = useState(false);
  const [showHotelCheckOutPicker, setShowHotelCheckOutPicker] = useState(false);

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

  // Calendar price display state
  const [calendarPrices, setCalendarPrices] = useState<{ [date: string]: number }>({});
  const [loadingCalendarPrices, setLoadingCalendarPrices] = useState(false);
  const fetchingCalendarPricesRef = useRef(false); // Deduplication guard
  const preFetchTimerRef = useRef<NodeJS.Timeout | null>(null); // Pre-fetch debounce timer

  // Multi-city flights state (only for one-way mode)
  interface AdditionalFlight {
    id: string;
    origin: string[];
    destination: string[];
    departureDate: string;
    nonstop: boolean;
  }
  const [additionalFlights, setAdditionalFlights] = useState<AdditionalFlight[]>([]);
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
  const carPickupDateRef = useRef<HTMLButtonElement>(null);
  const carDropoffDateRef = useRef<HTMLButtonElement>(null);

  // Set default dates for hotels
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    setCheckInDate(tomorrow.toISOString().split('T')[0]);
    setCheckOutDate(dayAfter.toISOString().split('T')[0]);
  }, []);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const date = new Date(dateString);
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

    const newDate = new Date(lastDate || new Date());
    newDate.setDate(newDate.getDate() + 3);
    const newDateString = newDate.toISOString().split('T')[0];

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
  };

  const handleRemoveFlight = (id: string) => {
    setAdditionalFlights(additionalFlights.filter(f => f.id !== id));
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
      newErrors.origin = t.errors.originRequired;
    }

    if (!destination || destination.length === 0) {
      newErrors.destination = t.errors.destinationRequired;
    }

    // Check if any origin code matches any destination code
    if (origin && destination && origin.length > 0 && destination.length > 0) {
      const hasOverlap = origin.some(code => destination.includes(code));
      if (hasOverlap) {
        newErrors.destination = t.errors.sameAirports;
      }
    }

    // Departure date validation
    if (useFlexibleDates) {
      if (!departureDates || departureDates.length === 0) {
        newErrors.departureDate = t.errors.departureDateRequired;
      }
    } else {
      if (!departureDate) {
        newErrors.departureDate = t.errors.departureDateRequired;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    // Hotels search
    if (serviceType === 'hotels') {
      if (!hotelDestination || !checkInDate || !checkOutDate) {
        setErrors({ hotel: 'Please fill all required fields' });
        return;
      }

      setIsLoading(true);

      const hotelParams = new URLSearchParams({
        destination: hotelDestination,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: hotelAdults.toString(),
        children: hotelChildren.toString(),
        rooms: hotelRooms.toString(),
        ...(hotelLocation && hotelLocation.lat && hotelLocation.lng && {
          lat: hotelLocation.lat.toString(),
          lng: hotelLocation.lng.toString(),
        }),
      });

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
      fromNonstop: fromNonstop.toString(),
      toNonstop: (tripType === 'roundtrip' && toNonstop).toString(),
      multiCity: isMultiCity.toString()
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

    // Open results page in NEW WINDOW/TAB
    const url = `/flights/results?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');

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
        setHotelSuggestions(data.data.slice(0, 5)); // Show top 5 suggestions
      } else {
        setHotelSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching hotel suggestions:', error);
      setHotelSuggestions([]);
    } finally {
      setIsLoadingHotelSuggestions(false);
    }
  };

  const handleHotelDestinationChange = (value: string) => {
    setHotelDestination(value);
    fetchHotelSuggestions(value);
  };

  const handleHotelSuggestionSelect = (suggestion: any) => {
    setHotelDestination(suggestion.name || suggestion.city_name);
    setHotelLocation({
      lat: suggestion.latitude,
      lng: suggestion.longitude
    });
    setShowHotelSuggestions(false);
  };

  // Close hotel suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hotelDestinationRef.current && !hotelDestinationRef.current.contains(event.target as Node)) {
        setShowHotelSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 bg-white shadow-md" style={{ zIndex: zIndex.STICKY }}>
      {/* Container with max-width matching results page (Priceline-style) */}
      <MaxWidthContainer
        style={{
          padding: `${spacing.lg} ${spacing.xl}`,
        }}
      >
        {/* ============================================
            SERVICE TYPE TABS - Option A: Minimal Icon Tabs
            ============================================ */}
        <div className="flex items-center gap-6 mb-4 border-b border-gray-200">
          {/* Flights Tab */}
          <button
            type="button"
            onClick={() => setServiceType('flights')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all duration-200 relative ${
              serviceType === 'flights'
                ? 'text-[#0087FF]'
                : 'text-gray-600 hover:text-[#0087FF]'
            }`}
          >
            <Plane size={18} className={serviceType === 'flights' ? 'text-[#0087FF]' : 'text-gray-500'} />
            <span className="hidden sm:inline">{t.flights}</span>
            {serviceType === 'flights' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0087FF] rounded-t-sm" />
            )}
          </button>

          {/* Hotels Tab */}
          <button
            type="button"
            onClick={() => setServiceType('hotels')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all duration-200 relative ${
              serviceType === 'hotels'
                ? 'text-[#0087FF]'
                : 'text-gray-600 hover:text-[#0087FF]'
            }`}
          >
            <Hotel size={18} className={serviceType === 'hotels' ? 'text-[#0087FF]' : 'text-gray-500'} />
            <span className="hidden sm:inline">{t.hotels}</span>
            {serviceType === 'hotels' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0087FF] rounded-t-sm" />
            )}
          </button>

          {/* Cars Tab */}
          <button
            type="button"
            onClick={() => setServiceType('cars')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all duration-200 relative ${
              serviceType === 'cars'
                ? 'text-[#0087FF]'
                : 'text-gray-600 hover:text-[#0087FF]'
            }`}
          >
            <Car size={18} className={serviceType === 'cars' ? 'text-[#0087FF]' : 'text-gray-500'} />
            <span className="hidden sm:inline">{t.cars}</span>
            {serviceType === 'cars' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0087FF] rounded-t-sm" />
            )}
          </button>

          {/* Tours Tab */}
          <button
            type="button"
            onClick={() => setServiceType('tours')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all duration-200 relative ${
              serviceType === 'tours'
                ? 'text-[#0087FF]'
                : 'text-gray-600 hover:text-[#0087FF]'
            }`}
          >
            <Map size={18} className={serviceType === 'tours' ? 'text-[#0087FF]' : 'text-gray-500'} />
            <span className="hidden sm:inline">{t.tours}</span>
            {serviceType === 'tours' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0087FF] rounded-t-sm" />
            )}
          </button>
        </div>

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
                <PlaneTakeoff size={13} className="text-gray-600" />
                <span>From</span>
              </label>

              {/* Nonstop checkbox aligned to the right */}
              <label className="flex items-center gap-1 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={fromNonstop}
                  onChange={(e) => setFromNonstop(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] cursor-pointer"
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
              className="absolute right-[-16px] top-[42px] z-10 p-1 bg-white border border-gray-300 text-gray-400 hover:text-[#0087FF] hover:border-[#0087FF] hover:bg-blue-50 rounded-full transition-all shadow-sm hover:shadow-md"
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
                <PlaneLanding size={13} className="text-gray-600" />
                <span>To</span>
              </label>

              {/* Nonstop checkbox aligned to the right - disabled for one-way trips */}
              <label className={`flex items-center gap-1 cursor-pointer group ${tripType === 'oneway' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="checkbox"
                  checked={toNonstop}
                  onChange={(e) => setToNonstop(e.target.checked)}
                  disabled={tripType === 'oneway'}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
                <CalendarDays size={13} className="text-gray-600" />
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
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-xs font-normal text-gray-600 group-hover:text-gray-900">Multi-Dates</span>
              </label>
            </div>

            {!useFlexibleDates ? (
              <button
                ref={departureDateRef}
                type="button"
                onClick={() => handleOpenDatePicker('departure')}
                className={`w-full relative px-4 py-4 bg-white border rounded-lg hover:border-[#0087FF] transition-all cursor-pointer ${
                  errors.departureDate ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-base font-medium text-gray-900">
                  {departureDate ? formatDateForDisplay(departureDate) : 'Select date'}
                </span>
              </button>
            ) : (
              <MultiDatePicker
                key="departure-dates"
                selectedDates={departureDates}
                onDatesChange={setDepartureDates}
                maxDates={3}
                minDate={new Date()}
                label=""
                headerLabel="Select Departure Dates"
                placeholder="Select up to 3 dates"
                isOpen={openMultiDatePicker === 'departure'}
                onOpenChange={(isOpen) => {
                  setOpenMultiDatePicker(isOpen ? 'departure' : null);
                }}
              />
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
                <CalendarCheck size={13} className="text-gray-600" />
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
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] cursor-pointer"
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
                  className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#0087FF] transition-all cursor-pointer"
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <span className="block pl-8 text-base font-medium text-gray-900">
                    {returnDate ? formatDateForDisplay(returnDate) : 'Select date'}
                  </span>
                </button>
              ) : (
                <MultiDatePicker
                  key="return-dates"
                  selectedDates={returnDates}
                  onDatesChange={setReturnDates}
                  maxDates={3}
                  minDate={new Date()}
                  label=""
                  headerLabel="Select Return Dates"
                  placeholder="Select up to 3 dates"
                  isOpen={openMultiDatePicker === 'return'}
                  onOpenChange={(isOpen) => {
                    setOpenMultiDatePicker(isOpen ? 'return' : null);
                  }}
                />
              )
            ) : (
              <div className="relative w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <span className="block pl-8 text-base text-gray-400 italic">
                  One-way trip
                </span>
              </div>
            )}
          </div>


          {/* Combined Travelers + Class Dropdown */}
          <div ref={passengerRef} className="relative flex-shrink-0 w-52">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
              <Users size={13} className="text-gray-600" />
              <span>Travelers</span>
              <span className="text-gray-400">&</span>
              <Armchair size={13} className="text-gray-600" />
              <span>Class</span>
            </label>
            <button
              type="button"
              onClick={() => {
                closeAllDropdowns();
                setShowPassengerDropdown(!showPassengerDropdown);
              }}
              className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#0087FF] transition-all text-left"
            >
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <span className="block pl-7 text-sm font-medium text-gray-900 pr-7">
                {totalPassengers}, {t[cabinClass]}
              </span>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 ${showPassengerDropdown ? 'rotate-180' : ''}`} size={16} />
            </button>

            {showPassengerDropdown && (
              <div
                className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-dropdown animate-in fade-in slide-in-from-top-2 duration-200 p-3"
                style={{ width: '280px' }}
              >
                {/* Adults */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">{t.adults}</div>
                    <div className="text-gray-500 text-[10px]">{t.age18}</div>
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
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
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
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">{t.children}</div>
                    <div className="text-gray-500 text-[10px]">{t.age2to17}</div>
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
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
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
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">{t.infants}</div>
                    <div className="text-gray-500 text-[10px]">{t.ageUnder2}</div>
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
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
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
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Cabin Class Section */}
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-xs mb-2">
                    <Sparkles size={14} className="text-gray-600" />
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
                            ? 'border-[#0087FF] bg-[#E6F3FF] text-[#0087FF]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {cls === 'economy' && '💺'}
                        {cls === 'premium' && '✨'}
                        {cls === 'business' && '💼'}
                        {cls === 'first' && '👑'}
                        {' '}
                        {t[cls]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Done Button */}
                <button
                  onClick={() => setShowPassengerDropdown(false)}
                  className="w-full py-2 bg-[#0087FF] hover:bg-[#0077E6] text-white font-semibold rounded-lg transition-all duration-200 ease-in-out text-xs shadow-sm hover:shadow-md"
                >
                  {t.done}
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
              className="py-4 px-10 bg-[#0087FF] hover:bg-[#0077E6] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-base"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t.searching}</span>
                </>
              ) : (
                <span>{t.search}</span>
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
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 hover:border-[#0087FF] text-gray-600 hover:text-[#0087FF] rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 hover:bg-blue-50"
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
                        <Plane size={13} className="text-gray-600" />
                        <span>Flight {index + 2}</span>
                      </label>

                      {/* Nonstop checkbox aligned to the right */}
                      <label className="flex items-center gap-1 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={flight.nonstop}
                          onChange={(e) => handleUpdateAdditionalFlight(flight.id, { nonstop: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] cursor-pointer"
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
                      className="absolute right-[-16px] top-[42px] z-10 p-1 bg-white border border-gray-300 text-gray-400 hover:text-[#0087FF] hover:border-[#0087FF] hover:bg-blue-50 rounded-full transition-all shadow-sm hover:shadow-md"
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
                        <PlaneLanding size={13} className="text-gray-600" />
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
                        <CalendarDays size={13} className="text-gray-600" />
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
                      className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#0087FF] transition-all cursor-pointer"
                    >
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <span className="block pl-8 text-base font-medium text-gray-900">
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
                          className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-[#0087FF] text-gray-600 hover:text-[#0087FF] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-blue-50 whitespace-nowrap"
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
          {/* Search Fields Row */}
          <div className="flex items-center gap-3">
            {/* Hotel Destination */}
            <div ref={hotelDestinationRef} className="flex-1 relative">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Building2 size={13} className="text-gray-600" />
                <span>Destination</span>
              </label>
              <input
                type="text"
                value={hotelDestination}
                onChange={(e) => handleHotelDestinationChange(e.target.value)}
                onFocus={() => hotelDestination.length >= 2 && setShowHotelSuggestions(true)}
                placeholder="City, hotel, or landmark"
                className={`w-full px-4 py-4 bg-white border rounded-lg hover:border-[#0087FF] transition-all text-base font-medium ${
                  errors.hotel ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.hotel && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.hotel}
                </p>
              )}

              {/* Suggestions Dropdown */}
              {showHotelSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  {isLoadingHotelSuggestions ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                  ) : hotelSuggestions.length > 0 ? (
                    <div className="py-2">
                      {hotelSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleHotelSuggestionSelect(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-start gap-3"
                        >
                          <Building2 size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {suggestion.name || suggestion.city_name}
                            </div>
                            {suggestion.country_name && (
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.country_name}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                  )}
                </div>
              )}
            </div>

            {/* Check-in Date */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <CalendarDays size={13} className="text-gray-600" />
                <span>Check-in</span>
              </label>
              <button
                ref={hotelCheckInRef}
                type="button"
                onClick={() => setShowHotelCheckInPicker(true)}
                className="w-full relative px-4 py-4 bg-white border rounded-lg hover:border-[#0087FF] transition-all cursor-pointer border-gray-300"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-base font-medium text-gray-900">
                  {checkInDate ? formatDateForDisplay(checkInDate) : 'Select date'}
                </span>
              </button>
            </div>

            {/* Check-out Date */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <CalendarCheck size={13} className="text-gray-600" />
                <span>Check-out</span>
              </label>
              <button
                ref={hotelCheckOutRef}
                type="button"
                onClick={() => setShowHotelCheckOutPicker(true)}
                className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#0087FF] transition-all cursor-pointer"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-base font-medium text-gray-900">
                  {checkOutDate ? formatDateForDisplay(checkOutDate) : 'Select date'}
                </span>
              </button>
            </div>

            {/* Guests & Rooms */}
            <div className="relative flex-shrink-0 w-52">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <Users size={13} className="text-gray-600" />
                <span>Guests & Rooms</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#0087FF] transition-all text-left flex items-center justify-between"
              >
                <span className="text-base font-medium text-gray-900">
                  {hotelAdults + hotelChildren} guests, {hotelRooms} room{hotelRooms > 1 ? 's' : ''}
                </span>
                <ChevronDown size={20} className="text-gray-400" />
              </button>

              {/* Guests & Rooms Dropdown */}
              {showPassengerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Adults</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHotelAdults(Math.max(1, hotelAdults - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{hotelAdults}</span>
                      <button
                        type="button"
                        onClick={() => setHotelAdults(hotelAdults + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
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
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{hotelChildren}</span>
                      <button
                        type="button"
                        onClick={() => setHotelChildren(hotelChildren + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Rooms</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHotelRooms(Math.max(1, hotelRooms - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{hotelRooms}</span>
                      <button
                        type="button"
                        onClick={() => setHotelRooms(hotelRooms + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Done Button */}
                  <button
                    onClick={() => setShowPassengerDropdown(false)}
                    className="w-full py-2 bg-[#0087FF] hover:bg-[#0077E6] text-white font-semibold rounded-lg transition-all duration-200 ease-in-out text-xs shadow-sm hover:shadow-md"
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
                className="py-4 px-10 bg-[#0087FF] hover:bg-[#0077E6] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-base"
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
            </div>
          </div>
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
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] cursor-pointer"
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
                    <span className="block pl-8 text-base text-gray-400 italic">
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
                  <CalendarDays size={13} className="text-gray-600" />
                  <span>Pickup Date</span>
                </label>

                {/* Pickup Time aligned to the right */}
                <select
                  value={carPickupTime}
                  onChange={(e) => setCarPickupTime(e.target.value)}
                  className="px-2 py-0.5 bg-white border border-gray-300 rounded-md hover:border-[#0087FF] transition-all text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0087FF]"
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
                className="w-full relative px-4 py-4 bg-white border rounded-lg hover:border-[#0087FF] transition-all cursor-pointer border-gray-300"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-base font-medium text-gray-900">
                  {carPickupDate ? formatDateForDisplay(carPickupDate) : 'Select date'}
                </span>
              </button>
            </div>

            {/* Dropoff Date */}
            <div className="flex-1">
              <div className="flex items-center justify-between h-[28px] mb-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <CalendarCheck size={13} className="text-gray-600" />
                  <span>Dropoff Date</span>
                </label>

                {/* Dropoff Time aligned to the right */}
                <select
                  value={carDropoffTime}
                  onChange={(e) => setCarDropoffTime(e.target.value)}
                  className="px-2 py-0.5 bg-white border border-gray-300 rounded-md hover:border-[#0087FF] transition-all text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0087FF]"
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
                className="w-full relative px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-[#0087FF] transition-all cursor-pointer"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <span className="block pl-8 text-base font-medium text-gray-900">
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
                className="py-4 px-10 bg-[#0087FF] hover:bg-[#0077E6] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-base h-[56px]"
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
                  <span>{t.searchCars}</span>
                )}
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
          type="range"
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
            setShowHotelCheckInPicker(false);
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
            setShowHotelCheckOutPicker(false);
          }}
          type="single"
          anchorEl={hotelCheckOutRef.current}
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

        {/* Mobile/Tablet: Stacked layout */}
        <div className="lg:hidden space-y-3">
          {/* FLIGHTS MOBILE FIELDS */}
          {serviceType === 'flights' && (
          <>
          {/* Trip Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setTripType('roundtrip');
                if (errors.returnDate) {
                  const newErrors = { ...errors };
                  delete newErrors.returnDate;
                  setErrors(newErrors);
                }
              }}
              className={`flex-1 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${
                tripType === 'roundtrip'
                  ? 'bg-white text-[#0087FF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.roundTrip}
            </button>
            <button
              type="button"
              onClick={() => {
                setTripType('oneway');
                setReturnDate('');
              }}
              className={`flex-1 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${
                tripType === 'oneway'
                  ? 'bg-white text-[#0087FF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.oneWay}
            </button>
          </div>

          {/* Airports */}
          <div className="space-y-3">
            <MultiAirportSelector
              label={t.from}
              placeholder="Select airports"
              value={origin}
              onChange={handleOriginChange}
              maxDisplay={2}
              lang={lang}
            />
            <MultiAirportSelector
              label={t.to}
              placeholder="Select airports"
              value={destination}
              onChange={handleDestinationChange}
              maxDisplay={2}
              lang={lang}
            />
          </div>

          {/* Dates */}
          <div className={`grid gap-3 ${tripType === 'roundtrip' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Depart Date with Inline Flex */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {t.depart}
              </label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={formatDateForInput(departureDate)}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900"
                  />
                </div>
            </div>
            {tripType === 'roundtrip' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {t.return}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={formatDateForInput(returnDate)}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={formatDateForInput(departureDate)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>


          {/* Combined Travelers & Class */}
          <div ref={passengerRef} className="relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Travelers & Class
            </label>
            <button
              onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              className="w-full flex items-center gap-2 pl-8 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-xs font-semibold text-gray-900"
            >
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <span className="flex-1 text-left">{totalPassengers}, {t[cabinClass]}</span>
              <ChevronDown className="text-gray-400" size={12} />
            </button>
          </div>

          {/* Direct Flights Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={directFlights}
              onChange={(e) => setDirectFlights(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] cursor-pointer"
            />
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              {t.directOnly}
            </span>
          </label>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full py-3 bg-[#0087FF] hover:bg-[#0077E6] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.searching}</span>
              </>
            ) : (
              <span>{t.search}</span>
            )}
          </button>
          </>
          )}

          {/* HOTELS MOBILE FIELDS */}
          {serviceType === 'hotels' && (
          <>
          {/* Hotel Destination */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Destination
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={hotelDestination}
                onChange={(e) => handleHotelDestinationChange(e.target.value)}
                onFocus={() => hotelDestination.length >= 2 && setShowHotelSuggestions(true)}
                placeholder="City, hotel, or landmark"
                className={`w-full pl-9 pr-3 py-2 bg-gray-50 border-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900 ${
                  errors.hotel ? 'border-red-500' : 'border-gray-200'
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {isLoadingHotelSuggestions ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                ) : hotelSuggestions.length > 0 ? (
                  <div className="py-2">
                    {hotelSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleHotelSuggestionSelect(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-start gap-3"
                      >
                        <Building2 size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-xs truncate">
                            {suggestion.name || suggestion.city_name}
                          </div>
                          {suggestion.country_name && (
                            <div className="text-[10px] text-gray-500 truncate">
                              {suggestion.country_name}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Check-in and Check-out Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Check-in
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Check-out
              </label>
              <div className="relative">
                <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Guests & Rooms */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Guests & Rooms
            </label>
            <button
              type="button"
              onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              className="w-full flex items-center gap-2 pl-8 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-xs font-semibold text-gray-900"
            >
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <span className="flex-1 text-left">{hotelAdults + hotelChildren} guests, {hotelRooms} room{hotelRooms > 1 ? 's' : ''}</span>
              <ChevronDown className="text-gray-400" size={12} />
            </button>

            {/* Guests & Rooms Dropdown */}
            {showPassengerDropdown && (
              <div className="absolute left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Adults</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHotelAdults(Math.max(1, hotelAdults - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{hotelAdults}</span>
                    <button
                      type="button"
                      onClick={() => setHotelAdults(hotelAdults + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
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
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{hotelChildren}</span>
                    <button
                      type="button"
                      onClick={() => setHotelChildren(hotelChildren + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Rooms</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHotelRooms(Math.max(1, hotelRooms - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{hotelRooms}</span>
                    <button
                      type="button"
                      onClick={() => setHotelRooms(hotelRooms + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#0087FF] hover:bg-blue-50 flex items-center justify-center transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Done Button */}
                <button
                  onClick={() => setShowPassengerDropdown(false)}
                  className="w-full py-2 bg-[#0087FF] hover:bg-[#0077E6] text-white font-semibold rounded-lg transition-all duration-200 ease-in-out text-xs shadow-sm hover:shadow-md"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full py-3 bg-[#0087FF] hover:bg-[#0077E6] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </>
          )}
        </div>
      </MaxWidthContainer>
    </div>
  );
}
