'use client';

import { Plane, Calendar, Users, Armchair } from 'lucide-react';
import { spacing, typography, colors, dimensions } from '@/lib/design-system';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface SearchSummaryBarProps {
  // Route information
  origin: string;
  destination: string;

  // Date information
  departureDate: string;
  returnDate?: string;

  // Passenger information
  passengers: PassengerCounts;

  // Cabin class
  cabinClass: 'economy' | 'premium' | 'business' | 'first';

  // Callbacks
  onModifySearch: () => void;

  // Language support
  lang?: 'en' | 'pt' | 'es';

  // Optional sticky behavior
  sticky?: boolean;
}

const content = {
  en: {
    modifySearch: 'Modify Search',
    adult: 'Adult',
    adults: 'Adults',
    child: 'Child',
    children: 'Children',
    infant: 'Infant',
    infants: 'Infants',
    economy: 'Economy',
    premium: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
    roundTrip: 'Round Trip',
    oneWay: 'One Way',
  },
  pt: {
    modifySearch: 'Modificar Busca',
    adult: 'Adulto',
    adults: 'Adultos',
    child: 'Criança',
    children: 'Crianças',
    infant: 'Bebê',
    infants: 'Bebês',
    economy: 'Econômica',
    premium: 'Econômica Premium',
    business: 'Executiva',
    first: 'Primeira Classe',
    roundTrip: 'Ida e Volta',
    oneWay: 'Só Ida',
  },
  es: {
    modifySearch: 'Modificar Búsqueda',
    adult: 'Adulto',
    adults: 'Adultos',
    child: 'Niño',
    children: 'Niños',
    infant: 'Bebé',
    infants: 'Bebés',
    economy: 'Económica',
    premium: 'Económica Premium',
    business: 'Ejecutiva',
    first: 'Primera Clase',
    roundTrip: 'Ida y Vuelta',
    oneWay: 'Solo Ida',
  },
};

const cabinClassMap = {
  economy: { en: 'Economy', pt: 'Econômica', es: 'Económica' },
  premium: { en: 'Premium Economy', pt: 'Econômica Premium', es: 'Económica Premium' },
  business: { en: 'Business', pt: 'Executiva', es: 'Ejecutiva' },
  first: { en: 'First Class', pt: 'Primeira Classe', es: 'Primera Clase' },
};

export default function SearchSummaryBar({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers,
  cabinClass,
  onModifySearch,
  lang = 'en',
  sticky = true,
}: SearchSummaryBarProps) {
  const t = content[lang];

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', options);
  };

  // Get passenger count text
  const getPassengerText = () => {
    const parts: string[] = [];

    if (passengers.adults > 0) {
      const label = passengers.adults === 1 ? t.adult : t.adults;
      parts.push(`${passengers.adults} ${label}`);
    }

    if (passengers.children > 0) {
      const label = passengers.children === 1 ? t.child : t.children;
      parts.push(`${passengers.children} ${label}`);
    }

    if (passengers.infants > 0) {
      const label = passengers.infants === 1 ? t.infant : t.infants;
      parts.push(`${passengers.infants} ${label}`);
    }

    return parts.join(', ');
  };

  const stickyClasses = sticky
    ? 'sticky top-0 z-40'
    : '';

  return (
    <div className={`${stickyClasses} bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm`} style={{ minHeight: dimensions.header.compact }}>
      <div className="max-w-7xl mx-auto px-3 py-2">
        {/* Desktop Layout - Ultra-Compact Single Line */}
        <div className="hidden lg:flex items-center justify-between gap-3">
          {/* Left Section - Search Summary */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Route */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary-50 to-blue-50 px-2 py-1 rounded border border-primary-200">
              <Plane className="w-3.5 h-3.5 text-primary-600 transform rotate-45" />
              <span className="font-semibold text-gray-900" style={{ fontSize: typography.card.title.size }}>{origin}</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-semibold text-gray-900" style={{ fontSize: typography.card.title.size }}>{destination}</span>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-gray-300" />

            {/* Dates */}
            <div className="flex items-center gap-1.5 text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-medium" style={{ fontSize: typography.card.body.size }}>
                {formatDate(departureDate)}
                {returnDate && (
                  <>
                    <span className="mx-1 text-gray-400">→</span>
                    {formatDate(returnDate)}
                  </>
                )}
              </span>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-gray-300" />

            {/* Passengers */}
            <div className="flex items-center gap-1.5 text-gray-700">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-medium" style={{ fontSize: typography.card.body.size }}>{getPassengerText()}</span>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-gray-300" />

            {/* Cabin Class */}
            <div className="flex items-center gap-1.5 text-gray-700">
              <Armchair className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-medium" style={{ fontSize: typography.card.body.size }}>{cabinClassMap[cabinClass][lang]}</span>
            </div>
          </div>

          {/* Right Section - Modify Button */}
          <button
            onClick={onModifySearch}
            className="flex-shrink-0 px-4 py-1.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            style={{ fontSize: typography.card.body.size }}
          >
            {t.modifySearch}
          </button>
        </div>

        {/* Mobile & Tablet Layout - Ultra-Compact */}
        <div className="lg:hidden space-y-2">
          {/* Route Section */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary-50 to-blue-50 px-2 py-1 rounded border border-primary-200 flex-1">
              <Plane className="w-3 h-3 text-primary-600 transform rotate-45 flex-shrink-0" />
              <span className="font-semibold text-gray-900" style={{ fontSize: typography.card.body.size }}>{origin}</span>
              <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-semibold text-gray-900" style={{ fontSize: typography.card.body.size }}>{destination}</span>
            </div>

            {/* Modify Button */}
            <button
              onClick={onModifySearch}
              className="flex-shrink-0 px-3 py-1 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded transition-all duration-200"
              style={{ fontSize: typography.card.meta.size }}
            >
              {t.modifySearch}
            </button>
          </div>

          {/* Info Grid - Compact */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* Dates */}
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur px-2 py-1 rounded border border-gray-200">
              <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate" style={{ fontSize: typography.card.meta.size }}>
                  {formatDate(departureDate).split(',')[0]}
                </div>
                {returnDate && (
                  <div className="text-gray-600 truncate" style={{ fontSize: typography.card.meta.size }}>
                    {formatDate(returnDate).split(',')[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Passengers */}
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur px-2 py-1 rounded border border-gray-200">
              <Users className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="font-medium text-gray-900 truncate" style={{ fontSize: typography.card.meta.size }}>{getPassengerText()}</span>
            </div>

            {/* Cabin Class */}
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur px-2 py-1 rounded border border-gray-200">
              <Armchair className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="font-medium text-gray-900 truncate" style={{ fontSize: typography.card.meta.size }}>{cabinClassMap[cabinClass][lang]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
