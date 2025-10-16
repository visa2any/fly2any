'use client';

import { useState, useRef, useEffect } from 'react';
import { Plane, Calendar, Users, ChevronDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { typography, spacing, colors, dimensions, layout, borderRadius } from '@/lib/design-system';
import PremiumDatePicker from './PremiumDatePicker';
import { InlineAirportAutocomplete } from './InlineAirportAutocomplete';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface EnhancedSearchBarProps {
  origin?: string;
  destination?: string;
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

const content = {
  en: {
    from: 'From',
    to: 'To',
    depart: 'Depart',
    return: 'Return',
    travelers: 'Travelers',
    class: 'Class',
    search: 'Search Flights',
    oneWay: 'One-way',
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
  },
  pt: {
    from: 'De',
    to: 'Para',
    depart: 'Ida',
    return: 'Volta',
    travelers: 'Viajantes',
    class: 'Classe',
    search: 'Buscar Voos',
    oneWay: 'Só ida',
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
  },
  es: {
    from: 'Desde',
    to: 'Hasta',
    depart: 'Salida',
    return: 'Regreso',
    travelers: 'Viajeros',
    class: 'Clase',
    search: 'Buscar Vuelos',
    oneWay: 'Solo ida',
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

  // Form state
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [originCode, setOriginCode] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [departureDate, setDepartureDate] = useState(initialDepartureDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [cabinClass, setCabinClass] = useState(initialCabinClass);

  // UI state
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'departure' | 'return'>('departure');

  // Refs
  const passengerRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);
  const departureDateRef = useRef<HTMLDivElement>(null);
  const returnDateRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false);
      }
      if (classRef.current && !classRef.current.contains(event.target as Node)) {
        setShowClassDropdown(false);
      }
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close all dropdowns when one opens
  const closeAllDropdowns = () => {
    setShowOriginDropdown(false);
    setShowDestinationDropdown(false);
    setShowPassengerDropdown(false);
    setShowClassDropdown(false);
    setShowDatePicker(false);
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

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

  const handleOriginChange = (value: string, airport?: Airport) => {
    setOrigin(value);
    if (airport) {
      setOriginCode(airport.code);
    }
    console.log('Origin changed:', value, airport);
  };

  const handleDestinationChange = (value: string, airport?: Airport) => {
    setDestination(value);
    if (airport) {
      setDestinationCode(airport.code);
    }
    console.log('Destination changed:', value, airport);
  };

  const handleDatePickerChange = (departure: string, returnDate?: string) => {
    setDepartureDate(departure);
    if (returnDate) {
      setReturnDate(returnDate);
    } else if (datePickerType === 'departure') {
      // Don't clear return date if only selecting departure
    }
  };

  const handleOpenDatePicker = (type: 'departure' | 'return') => {
    closeAllDropdowns();
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  const handleSearch = () => {
    // Use airport codes if available, otherwise fallback to the full value
    const fromCode = originCode || origin;
    const toCode = destinationCode || destination;

    const params = new URLSearchParams({
      from: fromCode,
      to: toCode,
      departure: formatDateForInput(departureDate),
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      infants: passengers.infants.toString(),
      class: cabinClass,
    });

    if (returnDate) {
      params.append('return', formatDateForInput(returnDate));
    }

    console.log('🔍 Searching with codes:', { from: fromCode, to: toCode });
    router.push(`/flights/results?${params.toString()}`);
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md">
      {/* Container with max-width matching results page (Priceline-style) */}
      <div
        className="mx-auto"
        style={{
          maxWidth: layout.container.maxWidth,
          padding: `${spacing.lg} ${spacing.xl}`,
        }}
      >
        {/* Desktop: Single-line horizontal layout (Priceline style) */}
        <div className="hidden lg:flex items-stretch gap-3">
          {/* Origin Airport */}
          <div ref={originRef} className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.from}
            </label>
            <InlineAirportAutocomplete
              value={origin}
              onChange={handleOriginChange}
              placeholder="New York (JFK)"
              onClose={() => setShowOriginDropdown(false)}
            />
          </div>

          {/* Swap Arrow */}
          <div className="flex items-end pb-2.5">
            <button
              onClick={() => {
                const temp = origin;
                const tempCode = originCode;
                setOrigin(destination);
                setOriginCode(destinationCode);
                setDestination(temp);
                setDestinationCode(tempCode);
              }}
              className="p-2 text-gray-400 hover:text-[#0087FF] hover:bg-[#E6F3FF] rounded-lg transition-all duration-200 ease-in-out"
              aria-label="Swap airports"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Destination Airport */}
          <div ref={destinationRef} className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.to}
            </label>
            <InlineAirportAutocomplete
              value={destination}
              onChange={handleDestinationChange}
              placeholder="Los Angeles (LAX)"
              onClose={() => setShowDestinationDropdown(false)}
            />
          </div>

          {/* Departure Date */}
          <div ref={departureDateRef} className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.depart}
            </label>
            <button
              onClick={() => handleOpenDatePicker('departure')}
              className="w-full text-left relative"
            >
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <div className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 focus:border-[#0087FF] focus:ring-2 focus:ring-[#E6F3FF] outline-none transition-all duration-200 ease-in-out text-sm font-semibold text-gray-900 cursor-pointer">
                {departureDate ? formatDateForDisplay(departureDate) : 'Select date'}
              </div>
            </button>
          </div>

          {/* Return Date */}
          <div ref={returnDateRef} className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.return}
            </label>
            <button
              onClick={() => handleOpenDatePicker('return')}
              className="w-full text-left relative"
            >
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <div className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 focus:border-[#0087FF] focus:ring-2 focus:ring-[#E6F3FF] outline-none transition-all duration-200 ease-in-out text-sm font-semibold text-gray-900 cursor-pointer">
                {returnDate ? formatDateForDisplay(returnDate) : t.oneWay}
              </div>
            </button>
          </div>

          {/* Passengers Dropdown */}
          <div ref={passengerRef} className="relative flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.travelers}
            </label>
            <button
              onClick={() => {
                closeAllDropdowns();
                setShowPassengerDropdown(!showPassengerDropdown);
              }}
              className="w-full flex items-center gap-2 pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 focus:border-[#0087FF] focus:ring-2 focus:ring-[#E6F3FF] outline-none transition-all duration-200 ease-in-out text-sm font-semibold text-gray-900"
            >
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <span className="flex-1 text-left">
                {totalPassengers} {totalPassengers === 1 ? t.guest : t.guests}
              </span>
              <ChevronDown className={`text-gray-400 transition-transform duration-200 ${showPassengerDropdown ? 'rotate-180' : ''}`} size={16} />
            </button>

            {showPassengerDropdown && (
              <div
                className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-[80] animate-in fade-in slide-in-from-top-2 duration-200 p-3"
                style={{ width: '260px' }}
              >
                {/* Adults */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">{t.adults}</div>
                    <div className="text-gray-500 text-[10px]">{t.age18}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePassengerChange('adults', -1)}
                      disabled={passengers.adults <= 1}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-900 text-xs">
                      {passengers.adults}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('adults', 1)}
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
                      onClick={() => handlePassengerChange('children', -1)}
                      disabled={passengers.children <= 0}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-900 text-xs">
                      {passengers.children}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('children', 1)}
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
                      onClick={() => handlePassengerChange('infants', -1)}
                      disabled={passengers.infants <= 0}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-900 text-xs">
                      {passengers.infants}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('infants', 1)}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-[#0087FF] flex items-center justify-center text-gray-700 hover:text-[#0087FF] font-bold transition-all duration-200 ease-in-out text-sm hover:scale-105"
                    >
                      +
                    </button>
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

          {/* Cabin Class Dropdown */}
          <div ref={classRef} className="relative flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.class}
            </label>
            <button
              onClick={() => {
                closeAllDropdowns();
                setShowClassDropdown(!showClassDropdown);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 focus:border-[#0087FF] focus:ring-2 focus:ring-[#E6F3FF] outline-none transition-all duration-200 ease-in-out text-sm font-semibold text-gray-900"
            >
              <span className="truncate">{t[cabinClass]}</span>
              <ChevronDown className={`text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${showClassDropdown ? 'rotate-180' : ''}`} size={16} />
            </button>

            {showClassDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-[80] min-w-[180px] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                {(['economy', 'premium', 'business', 'first'] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      setCabinClass(cls);
                      setShowClassDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 transition-all duration-200 ease-in-out text-xs ${
                      cabinClass === cls
                        ? 'bg-[#E6F3FF] text-[#0087FF] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t[cls]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="px-8 py-2.5 bg-[#0087FF] hover:bg-[#0077E6] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out text-sm whitespace-nowrap"
            >
              {t.search}
            </button>
          </div>
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
        />

        {/* Mobile/Tablet: Stacked layout */}
        <div className="lg:hidden space-y-3">
          {/* Airports */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {t.from}
              </label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  placeholder="JFK"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {t.to}
              </label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  placeholder="LAX"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
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
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900 cursor-pointer"
                />
              </div>
            </div>
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
          </div>

          {/* Passengers & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div ref={passengerRef} className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {t.travelers}
              </label>
              <button
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="w-full flex items-center gap-2 pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900"
              >
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <span className="flex-1 text-left">{totalPassengers}</span>
                <ChevronDown className="text-gray-400" size={14} />
              </button>
            </div>

            <div ref={classRef} className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {t.class}
              </label>
              <button
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-gray-900"
              >
                <span className="truncate text-xs">{t[cabinClass]}</span>
                <ChevronDown className="text-gray-400 flex-shrink-0 ml-1" size={14} />
              </button>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full py-3 bg-[#0087FF] hover:bg-[#0077E6] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out text-sm"
          >
            {t.search}
          </button>
        </div>
      </div>
    </div>
  );
}
