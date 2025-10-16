'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AirportAutocomplete } from '@/components/search/AirportAutocomplete';
import { Plane, PlaneTakeoff, PlaneLanding } from 'lucide-react';

type Language = 'en' | 'pt' | 'es';
type TripType = 'roundtrip' | 'oneway';
type TravelClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

const content = {
  en: {
    title: 'Find Your Perfect Flight',
    subtitle: 'Search and compare flights from hundreds of airlines',
    tripType: {
      roundtrip: 'Round Trip',
      oneway: 'One Way',
    },
    from: 'From',
    to: 'To',
    departure: 'Departure',
    return: 'Return',
    passengers: 'Passengers',
    class: 'Class',
    classes: {
      ECONOMY: 'Economy',
      PREMIUM_ECONOMY: 'Premium Economy',
      BUSINESS: 'Business',
      FIRST: 'First Class',
    },
    adults: 'Adults',
    children: 'Children',
    infants: 'Infants',
    search: 'Search Flights',
    directFlights: 'Direct flights only',
    errors: {
      originRequired: 'Please select an origin airport',
      destinationRequired: 'Please select a destination airport',
      departureDateRequired: 'Please select a departure date',
      departureDatePast: 'Departure date must be in the future',
      returnDateRequired: 'Please select a return date for round trip',
      returnDateInvalid: 'Return date must be after departure date',
    },
  },
  pt: {
    title: 'Encontre Seu Voo Perfeito',
    subtitle: 'Busque e compare voos de centenas de companhias aéreas',
    tripType: {
      roundtrip: 'Ida e Volta',
      oneway: 'Somente Ida',
    },
    from: 'De',
    to: 'Para',
    departure: 'Ida',
    return: 'Volta',
    passengers: 'Passageiros',
    class: 'Classe',
    classes: {
      ECONOMY: 'Econômica',
      PREMIUM_ECONOMY: 'Econômica Premium',
      BUSINESS: 'Executiva',
      FIRST: 'Primeira Classe',
    },
    adults: 'Adultos',
    children: 'Crianças',
    infants: 'Bebês',
    search: 'Buscar Voos',
    directFlights: 'Apenas voos diretos',
    errors: {
      originRequired: 'Por favor, selecione um aeroporto de origem',
      destinationRequired: 'Por favor, selecione um aeroporto de destino',
      departureDateRequired: 'Por favor, selecione uma data de partida',
      departureDatePast: 'A data de partida deve ser no futuro',
      returnDateRequired: 'Por favor, selecione uma data de retorno',
      returnDateInvalid: 'A data de retorno deve ser após a data de partida',
    },
  },
  es: {
    title: 'Encuentra Tu Vuelo Perfecto',
    subtitle: 'Busca y compara vuelos de cientos de aerolíneas',
    tripType: {
      roundtrip: 'Ida y Vuelta',
      oneway: 'Solo Ida',
    },
    from: 'De',
    to: 'Para',
    departure: 'Ida',
    return: 'Vuelta',
    passengers: 'Pasajeros',
    class: 'Clase',
    classes: {
      ECONOMY: 'Económica',
      PREMIUM_ECONOMY: 'Económica Premium',
      BUSINESS: 'Ejecutiva',
      FIRST: 'Primera Clase',
    },
    adults: 'Adultos',
    children: 'Niños',
    infants: 'Bebés',
    search: 'Buscar Vuelos',
    directFlights: 'Solo vuelos directos',
    errors: {
      originRequired: 'Por favor, seleccione un aeropuerto de origen',
      destinationRequired: 'Por favor, seleccione un aeropuerto de destino',
      departureDateRequired: 'Por favor, seleccione una fecha de salida',
      departureDatePast: 'La fecha de salida debe ser en el futuro',
      returnDateRequired: 'Por favor, seleccione una fecha de retorno',
      returnDateInvalid: 'La fecha de retorno debe ser después de la fecha de salida',
    },
  },
};

export default function FlightsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [tripType, setTripType] = useState<TripType>('roundtrip');
  const [travelClass, setTravelClass] = useState<TravelClass>('ECONOMY');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [directFlights, setDirectFlights] = useState(false);

  // Form field states
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Error and loading states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const t = content[lang];

  // Extract airport code from formatted string (e.g., "JFK - New York" -> "JFK")
  // Also handles manual 3-letter code entry (e.g., "jfk" -> "JFK")
  const extractAirportCode = (value: string): string => {
    if (!value) return '';

    // Trim and uppercase the input
    const trimmed = value.trim().toUpperCase();

    // Check if it's already a 3-letter code
    if (/^[A-Z]{3}$/.test(trimmed)) {
      return trimmed;
    }

    // Try to extract from formatted string (e.g., "JFK - New York")
    const match = trimmed.match(/^([A-Z]{3})/);
    if (match) {
      return match[1];
    }

    // If input is 3 letters (even if lowercase), accept it
    if (trimmed.length === 3 && /^[A-Z]{3}$/.test(trimmed)) {
      return trimmed;
    }

    // Return as-is if nothing matches (will be caught by validation)
    return trimmed;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate origin
    if (!from || from.trim() === '') {
      newErrors.from = t.errors.originRequired;
    }

    // Validate destination
    if (!to || to.trim() === '') {
      newErrors.to = t.errors.destinationRequired;
    }

    // Validate departure date
    if (!departureDate) {
      newErrors.departureDate = t.errors.departureDateRequired;
    } else {
      const departure = new Date(departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departure < today) {
        newErrors.departureDate = t.errors.departureDatePast;
      }
    }

    // Validate return date for round trip
    if (tripType === 'roundtrip') {
      if (!returnDate) {
        newErrors.returnDate = t.errors.returnDateRequired;
      } else if (departureDate && returnDate) {
        const departure = new Date(departureDate);
        const returnD = new Date(returnDate);

        if (returnD <= departure) {
          newErrors.returnDate = t.errors.returnDateInvalid;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle search submission
  const handleSearch = async () => {
    console.log('🔍 SEARCH INITIATED');
    console.log('📋 Form Values:', { from, to, departureDate, returnDate, tripType });

    // Validate form
    const isValid = validateForm();
    console.log('✅ Validation result:', isValid);

    if (!isValid) {
      console.log('❌ Validation failed, errors:', errors);
      return;
    }

    setIsLoading(true);
    console.log('⏳ Loading state set to true');

    try {
      // Extract airport codes
      const originCode = extractAirportCode(from);
      const destinationCode = extractAirportCode(to);

      console.log('🛫 Extracted airport codes:', {
        from,
        originCode,
        to,
        destinationCode
      });

      // Validate extracted codes
      if (!originCode || originCode.length !== 3) {
        const errorMsg = `Invalid origin airport code: "${originCode}". Please select a valid airport from the dropdown or enter a 3-letter code (e.g., JFK).`;
        console.error('❌', errorMsg);
        alert(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!destinationCode || destinationCode.length !== 3) {
        const errorMsg = `Invalid destination airport code: "${destinationCode}". Please select a valid airport from the dropdown or enter a 3-letter code (e.g., LAX).`;
        console.error('❌', errorMsg);
        alert(errorMsg);
        setIsLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        from: originCode,
        to: destinationCode,
        departure: departureDate,
        adults: adults.toString(),
        children: children.toString(),
        infants: infants.toString(),
        class: travelClass.toLowerCase(),
      });

      // Add return date for round trip
      if (tripType === 'roundtrip' && returnDate) {
        params.append('return', returnDate);
      }

      // Add direct flights filter if selected
      if (directFlights) {
        params.append('direct', 'true');
      }

      const url = `/flights/results?${params.toString()}`;
      console.log('🚀 Navigating to results page:', url);
      console.log('📦 Full URL params:', Object.fromEntries(params));

      // Navigate in same window for proper layout and navigation
      router.push(url);
    } catch (error) {
      console.error('💥 Error during search:', error);
      alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <Image
              src="/fly2any-logo.png"
              alt="Fly2Any Travel"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </a>

          {/* Language Switcher */}
          <div className="flex gap-2">
            {(['en', 'pt', 'es'] as Language[]).map((language) => (
              <button
                key={language}
                onClick={() => setLang(language)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  lang === language
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
          {/* Trip Type Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setTripType('roundtrip')}
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                tripType === 'roundtrip'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.tripType.roundtrip}
            </button>
            <button
              onClick={() => setTripType('oneway')}
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                tripType === 'oneway'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.tripType.oneway}
            </button>
          </div>

          {/* Flight Search Inputs */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* From */}
            <div>
              <AirportAutocomplete
                label={t.from}
                placeholder="JFK - New York"
                value={from}
                onChange={(value) => {
                  setFrom(value);
                  if (errors.from) {
                    setErrors({ ...errors, from: '' });
                  }
                }}
                icon={<PlaneTakeoff className="w-5 h-5" />}
              />
              {errors.from && (
                <p className="mt-1 text-sm text-red-600">{errors.from}</p>
              )}
            </div>

            {/* To */}
            <div>
              <AirportAutocomplete
                label={t.to}
                placeholder="LAX - Los Angeles"
                value={to}
                onChange={(value) => {
                  setTo(value);
                  if (errors.to) {
                    setErrors({ ...errors, to: '' });
                  }
                }}
                icon={<PlaneLanding className="w-5 h-5" />}
              />
              {errors.to && (
                <p className="mt-1 text-sm text-red-600">{errors.to}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Departure Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.departure}
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => {
                  setDepartureDate(e.target.value);
                  if (errors.departureDate) {
                    setErrors({ ...errors, departureDate: '' });
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.departureDate ? 'border-red-500' : 'border-gray-200'
                } focus:border-blue-500 focus:outline-none transition-colors`}
              />
              {errors.departureDate && (
                <p className="mt-1 text-sm text-red-600">{errors.departureDate}</p>
              )}
            </div>

            {/* Return Date */}
            {tripType === 'roundtrip' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.return}
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => {
                    setReturnDate(e.target.value);
                    if (errors.returnDate) {
                      setErrors({ ...errors, returnDate: '' });
                    }
                  }}
                  min={departureDate || new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.returnDate ? 'border-red-500' : 'border-gray-200'
                  } focus:border-blue-500 focus:outline-none transition-colors`}
                />
                {errors.returnDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.returnDate}</p>
                )}
              </div>
            )}
          </div>

          {/* Passengers and Class */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Passengers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.passengers}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t.adults}</label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t.children}</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t.infants}</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={infants}
                    onChange={(e) => setInfants(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                </div>
              </div>
            </div>

            {/* Travel Class */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.class}
              </label>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value as TravelClass)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="ECONOMY">{t.classes.ECONOMY}</option>
                <option value="PREMIUM_ECONOMY">{t.classes.PREMIUM_ECONOMY}</option>
                <option value="BUSINESS">{t.classes.BUSINESS}</option>
                <option value="FIRST">{t.classes.FIRST}</option>
              </select>
            </div>
          </div>

          {/* Direct Flights Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={directFlights}
                onChange={(e) => setDirectFlights(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t.directFlights}</span>
            </label>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching...
              </span>
            ) : (
              <>
                <Plane className="inline-block w-5 h-5 mr-2" />
                {t.search}
              </>
            )}
          </button>
        </div>

        {/* Results will appear here */}
        <div className="text-center text-gray-500">
          <p className="text-lg">Search results will appear here</p>
        </div>
      </main>
    </div>
  );
}
