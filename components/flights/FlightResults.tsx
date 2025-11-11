'use client';

import { useState } from 'react';
import { FlightCardCompact } from './FlightCardCompact';
import { ErrorState, getErrorType } from '@/components/common/ErrorState';
import { NoFlightsFound } from '@/components/common/EmptyState';
import { SearchLoadingState } from '@/components/common/LoadingStates';

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
    base?: string;
    grandTotal?: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
        terminal?: string;
      };
      arrival: {
        iataCode: string;
        at: string;
        terminal?: string;
      };
      carrierCode: string;
      number: string;
      duration: string;
      aircraft?: { code: string };
      numberOfStops?: number;
    }>;
  }>;
  travelerPricings?: Array<{
    fareDetailsBySegment: Array<{
      cabin: string;
    }>;
  }>;
  validatingAirlineCodes?: string[];
  numberOfBookableSeats?: number;
  badges?: Array<{
    type: string;
    text: string;
    color: string;
    icon?: string;
  }>;
  score?: number;
}

interface FlightResultsProps {
  offers: FlightOffer[];
  onSelectFlight: (offer: FlightOffer) => void;
  isLoading: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  onModifySearch?: () => void;
  lang: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    results: 'Search Results',
    noResults: 'No flights found. Try different search criteria.',
    loading: 'Searching flights...',
    from: 'From',
    to: 'To',
    duration: 'Duration',
    stops: 'stops',
    nonstop: 'Non-stop',
    selectFlight: 'Select Flight',
    perPerson: 'per person',
  },
  pt: {
    results: 'Resultados da Busca',
    noResults: 'Nenhum voo encontrado. Tente outros critérios de busca.',
    loading: 'Buscando voos...',
    from: 'De',
    to: 'Para',
    duration: 'Duração',
    stops: 'paradas',
    nonstop: 'Direto',
    selectFlight: 'Selecionar Voo',
    perPerson: 'por pessoa',
  },
  es: {
    results: 'Resultados de Búsqueda',
    noResults: 'No se encontraron vuelos. Intente con otros criterios de búsqueda.',
    loading: 'Buscando vuelos...',
    from: 'De',
    to: 'Para',
    duration: 'Duración',
    stops: 'paradas',
    nonstop: 'Directo',
    selectFlight: 'Seleccionar Vuelo',
    perPerson: 'por persona',
  },
};

export default function FlightResults({
  offers,
  onSelectFlight,
  isLoading,
  error,
  onRetry,
  onModifySearch,
  lang
}: FlightResultsProps) {
  const t = content[lang];
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        type={getErrorType(error as Error)}
        onRetry={onRetry}
      />
    );
  }

  // Loading state with enhanced UI
  if (isLoading) {
    return <SearchLoadingState message={t.loading} />;
  }

  // Empty state with helpful suggestions
  if (!offers || offers.length === 0) {
    return (
      <NoFlightsFound
        onModifySearch={
          onModifySearch || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))
        }
      />
    );
  }

  const handleSelectFlight = (id: string) => {
    setSelectedOfferId(id);
    const offer = offers.find(o => o.id === id);
    if (offer) {
      onSelectFlight(offer);
    }
  };

  return (
    <div>
      {/* Results Header with count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {t.results} <span className="text-primary-600">({offers.length})</span>
        </h2>
        <div className="text-sm text-gray-600">
          💡 <span className="font-semibold">Pro tip:</span> Expand cards for detailed info
        </div>
      </div>

      {/* Compact Flight Cards - More visible per screen */}
      <div className="space-y-2">
        {offers.map((offer) => (
          <FlightCardCompact
            key={offer.id}
            id={offer.id}
            itineraries={offer.itineraries}
            price={offer.price}
            numberOfBookableSeats={offer.numberOfBookableSeats}
            validatingAirlineCodes={offer.validatingAirlineCodes}
            travelerPricings={offer.travelerPricings}
            badges={offer.badges}
            score={offer.score}
            onSelect={handleSelectFlight}
            isNavigating={selectedOfferId === offer.id}
          />
        ))}
      </div>

      {/* Results footer with helpful info */}
      {offers.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-blue-600 text-lg">💡</span>
            <div>
              <div className="font-semibold text-blue-900 mb-1">Why Fly2Any?</div>
              <ul className="text-blue-800 text-xs space-y-0.5">
                <li>• Real-time pricing from 500+ airlines</li>
                <li>• TruePrice™ shows all costs upfront - no surprises</li>
                <li>• FlightIQ™ scores help you find the best value</li>
                <li>• 24/7 customer support in English, Portuguese & Spanish</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
