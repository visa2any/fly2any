'use client';

import { useState } from 'react';
import { Plane, Calendar, Users, Armchair, Search } from 'lucide-react';
import { typography, spacing, colors } from '@/lib/design-system';

interface CompactSearchBarProps {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  onSearch: (params: any) => void;
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    from: 'From',
    to: 'To',
    depart: 'Depart',
    return: 'Return',
    travelers: 'Travelers',
    class: 'Class',
    search: 'Search',
    oneWay: 'One-way',
  },
  pt: {
    from: 'De',
    to: 'Para',
    depart: 'Ida',
    return: 'Volta',
    travelers: 'Viajantes',
    class: 'Classe',
    search: 'Buscar',
    oneWay: 'Só ida',
  },
  es: {
    from: 'Desde',
    to: 'Hasta',
    depart: 'Salida',
    return: 'Regreso',
    travelers: 'Viajeros',
    class: 'Clase',
    search: 'Buscar',
    oneWay: 'Solo ida',
  },
};

/**
 * Compact 2-line search bar (like Priceline)
 * Line 1: Route (From/To) + Dates (Depart/Return)
 * Line 2: Passengers + Class + Search Button
 */
export default function CompactSearchBar({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers,
  cabinClass,
  onSearch,
  lang = 'en',
}: CompactSearchBarProps) {
  const t = content[lang];
  const [isExpanded, setIsExpanded] = useState(false);

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 py-3">
        {/* 2-LINE COMPACT SEARCH (like Priceline) */}
        <div className="max-w-7xl mx-auto space-y-2">
          {/* LINE 1: Route + Dates */}
          <div className="flex items-center gap-2">
            {/* From/To */}
            <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-400 transition-colors cursor-pointer">
              <Plane className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{t.from}</div>
                  <div className="font-semibold text-gray-900 truncate" style={{ fontSize: typography.card.body.size }}>{origin}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{t.to}</div>
                  <div className="font-semibold text-gray-900 truncate" style={{ fontSize: typography.card.body.size }}>{destination}</div>
                </div>
              </div>
            </div>

            {/* Depart Date */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-400 transition-colors cursor-pointer">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <div className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{t.depart}</div>
                <div className="font-semibold text-gray-900 whitespace-nowrap" style={{ fontSize: typography.card.body.size }}>{formatDate(departureDate)}</div>
              </div>
            </div>

            {/* Return Date */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-400 transition-colors cursor-pointer">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <div className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{returnDate ? t.return : t.oneWay}</div>
                <div className="font-semibold text-gray-900 whitespace-nowrap" style={{ fontSize: typography.card.body.size }}>
                  {returnDate ? formatDate(returnDate) : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* LINE 2: Travelers + Class + Search */}
          <div className="flex items-center gap-2">
            {/* Travelers */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-400 transition-colors cursor-pointer">
              <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <div className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{t.travelers}</div>
                <div className="font-semibold text-gray-900 whitespace-nowrap" style={{ fontSize: typography.card.body.size }}>
                  {totalPassengers} {totalPassengers === 1 ? 'traveler' : 'travelers'}
                </div>
              </div>
            </div>

            {/* Class */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-400 transition-colors cursor-pointer">
              <Armchair className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <div className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{t.class}</div>
                <div className="font-semibold text-gray-900 whitespace-nowrap capitalize" style={{ fontSize: typography.card.body.size }}>
                  {cabinClass}
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={() => onSearch({ origin, destination, departureDate, returnDate, passengers, cabinClass })}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              style={{ fontSize: typography.card.body.size }}
            >
              <Search className="w-4 h-4" />
              <span>{t.search}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
