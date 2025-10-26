'use client';

import { Calendar, Users, Armchair, ChevronDown, PlaneTakeoff } from 'lucide-react';
import { format } from 'date-fns';
import { colors, borderRadius } from '@/lib/design-system';

interface CompactSearchSummaryProps {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  onExpand: () => void;
  isMultiCity?: boolean;
  multiCityLegs?: Array<{
    origin: string;
    destination: string;
    date: string;
  }>;
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    modifySearch: 'Modify Search',
    guest: 'Guest',
    guests: 'Guests',
    economy: 'Economy',
    premium: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
    flights: 'Flights',
    leg: 'Leg',
  },
  pt: {
    modifySearch: 'Modificar Busca',
    guest: 'Passageiro',
    guests: 'Passageiros',
    economy: 'Econômica',
    premium: 'Econômica Premium',
    business: 'Executiva',
    first: 'Primeira Classe',
    flights: 'Voos',
    leg: 'Trecho',
  },
  es: {
    modifySearch: 'Modificar Búsqueda',
    guest: 'Pasajero',
    guests: 'Pasajeros',
    economy: 'Económica',
    premium: 'Económica Premium',
    business: 'Ejecutiva',
    first: 'Primera Clase',
    flights: 'Vuelos',
    leg: 'Tramo',
  },
};

// Airport data with city names and emojis
interface AirportData {
  city: string;
  emoji: string;
}

const airportDatabase: { [key: string]: AirportData } = {
  // United States
  JFK: { city: 'New York', emoji: '🗽' },
  EWR: { city: 'Newark', emoji: '🗽' },
  LGA: { city: 'New York', emoji: '🗽' },
  LAX: { city: 'Los Angeles', emoji: '🌴' },
  SNA: { city: 'Orange County', emoji: '🌴' },
  ONT: { city: 'Ontario', emoji: '🌴' },
  MIA: { city: 'Miami', emoji: '🏖️' },
  FLL: { city: 'Fort Lauderdale', emoji: '🏖️' },
  SFO: { city: 'San Francisco', emoji: '🌉' },
  OAK: { city: 'Oakland', emoji: '🌉' },
  SJC: { city: 'San Jose', emoji: '🌉' },
  ORD: { city: 'Chicago', emoji: '🏙️' },
  MDW: { city: 'Chicago', emoji: '🏙️' },
  ATL: { city: 'Atlanta', emoji: '🍑' },
  DFW: { city: 'Dallas', emoji: '🤠' },
  DEN: { city: 'Denver', emoji: '🏔️' },
  SEA: { city: 'Seattle', emoji: '🌲' },
  BOS: { city: 'Boston', emoji: '🦞' },
  LAS: { city: 'Las Vegas', emoji: '🎰' },
  PHX: { city: 'Phoenix', emoji: '🌵' },

  // Europe
  LHR: { city: 'London', emoji: '🇬🇧' },
  LGW: { city: 'London', emoji: '🇬🇧' },
  STN: { city: 'London', emoji: '🇬🇧' },
  CDG: { city: 'Paris', emoji: '🗼' },
  ORY: { city: 'Paris', emoji: '🗼' },
  BCN: { city: 'Barcelona', emoji: '🇪🇸' },
  MAD: { city: 'Madrid', emoji: '🇪🇸' },
  FCO: { city: 'Rome', emoji: '🏛️' },
  FRA: { city: 'Frankfurt', emoji: '🇩🇪' },
  AMS: { city: 'Amsterdam', emoji: '🇳🇱' },

  // Middle East & Asia
  DXB: { city: 'Dubai', emoji: '🏙️' },
  NRT: { city: 'Tokyo', emoji: '🗾' },
  HND: { city: 'Tokyo', emoji: '🗾' },
  SIN: { city: 'Singapore', emoji: '🇸🇬' },

  // Other
  YYZ: { city: 'Toronto', emoji: '🇨🇦' },
  SYD: { city: 'Sydney', emoji: '🦘' },
  GRU: { city: 'São Paulo', emoji: '🇧🇷' },
  GIG: { city: 'Rio de Janeiro', emoji: '🇧🇷' },
  MEX: { city: 'Mexico City', emoji: '🌮' },
  CUN: { city: 'Cancún', emoji: '🏝️' },
};

// Get airport emoji
const getAirportEmoji = (code: string | undefined | null): string => {
  if (!code) return '✈️';
  const data = airportDatabase[code.toUpperCase()];
  return data?.emoji || '✈️';
};

// Get city name for airport code
const getCityName = (code: string | undefined | null): string => {
  if (!code) return '';
  const data = airportDatabase[code.toUpperCase()];
  return data?.city || '';
};

// Format airport display: "City (CODE)" or just "CODE" if city unknown
const formatAirportDisplay = (code: string | undefined | null): string => {
  if (!code) return '';
  const city = getCityName(code);
  const upperCode = code.toUpperCase();
  return city ? `${city} (${upperCode})` : upperCode;
};

const getCabinClassName = (cabin: string, lang: 'en' | 'pt' | 'es'): string => {
  const t = translations[lang];
  const cabinMap: { [key: string]: string } = {
    economy: t.economy,
    premium: t.premium,
    business: t.business,
    first: t.first,
  };
  return cabinMap[cabin.toLowerCase()] || t.economy;
};

const formatCompactDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM d');
  } catch {
    return dateString;
  }
};

export default function CompactSearchSummary({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  children,
  infants,
  cabinClass,
  onExpand,
  isMultiCity = false,
  multiCityLegs = [],
  lang = 'en',
}: CompactSearchSummaryProps) {
  const t = translations[lang];
  const totalPassengers = adults + children + infants;
  const passengerText = totalPassengers === 1 ? `1 ${t.guest}` : `${totalPassengers} ${t.guests}`;
  const cabinText = getCabinClassName(cabinClass, lang);

  // Multi-city display
  if (isMultiCity && multiCityLegs.length > 0) {
    return (
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div
          className="mx-auto"
          style={{
            maxWidth: '1440px',
            padding: '0 24px',
          }}
        >
          <div className="py-3">
            {/* Primary Summary Line */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 flex-wrap flex-1">
                {/* Multi-city route summary */}
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <PlaneTakeoff className="w-5 h-5 text-primary-600" />
                  <span className="text-base sm:text-lg">
                    {multiCityLegs.map((leg, idx) => (
                      <span key={idx}>
                        {getAirportEmoji(leg.origin)} <span className="font-semibold">{formatAirportDisplay(leg.origin)}</span>
                        {idx < multiCityLegs.length - 1 && ' → '}
                      </span>
                    ))}
                  </span>
                </div>

                {/* Trip details */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {multiCityLegs.length} {t.flights}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {passengerText}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Armchair className="w-4 h-4" />
                    {cabinText}
                  </span>
                </div>
              </div>

              {/* Modify Search Button */}
              <button
                onClick={onExpand}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-md whitespace-nowrap"
              >
                {t.modifySearch}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Secondary Line - Individual Legs */}
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap pl-8">
              {multiCityLegs.map((leg, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <span className="font-medium">{t.leg} {idx + 1}:</span>
                  {formatAirportDisplay(leg.origin)} → {formatAirportDisplay(leg.destination)}
                  <span className="text-gray-400">•</span>
                  {formatCompactDate(leg.date)}
                  {idx < multiCityLegs.length - 1 && <span className="text-gray-300 ml-2">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Round-trip or One-way display
  const isRoundTrip = !!returnDate;

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div
        className="mx-auto"
        style={{
          maxWidth: '1440px',
          padding: '0 24px',
        }}
      >
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Trip Summary */}
          <div className="flex items-center gap-4 flex-wrap flex-1">
            {/* Route */}
            <div className="flex items-center gap-2 text-gray-900">
              <span className="text-base sm:text-lg">
                {getAirportEmoji(origin)} <span className="font-semibold">{formatAirportDisplay(origin)}</span>
              </span>
              <span className="text-gray-400 text-base sm:text-lg">
                {isRoundTrip ? '⇄' : '→'}
              </span>
              <span className="text-base sm:text-lg">
                {getAirportEmoji(destination)} <span className="font-semibold">{formatAirportDisplay(destination)}</span>
              </span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {formatCompactDate(departureDate)}
                {isRoundTrip && ` - ${formatCompactDate(returnDate)}`}
              </span>
            </div>

            {/* Passengers */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{passengerText}</span>
            </div>

            {/* Cabin Class */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Armchair className="w-4 h-4" />
              <span>{cabinText}</span>
            </div>
          </div>

          {/* Modify Search Button */}
          <button
            onClick={onExpand}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-md whitespace-nowrap"
          >
            {t.modifySearch}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
