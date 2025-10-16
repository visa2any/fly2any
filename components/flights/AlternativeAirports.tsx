'use client';

import React, { useState, useMemo } from 'react';
import {
  getAlternativeAirports,
  getCheapestTransport,
  getFastestTransport,
  calculateTotalCost,
  type AlternativeAirport,
  type TransportOption
} from '@/lib/airports/alternatives';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingDown,
  Clock,
  DollarSign,
  Train,
  Bus,
  Car,
  Navigation,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AlternativeAirportsProps {
  originAirport: string;
  destinationAirport: string;
  currentPrice: number;
  onAirportSelect: (origin: string, destination: string) => void;
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
}

interface AlternativeOption {
  type: 'origin' | 'destination';
  airport: AlternativeAirport;
  estimatedPrice: number;
  savings: number;
  savingsPercent: number;
  cheapestTransport: TransportOption;
  fastestTransport: TransportOption;
  totalCost: number;
}

const translations = {
  en: {
    title: 'Save More with Nearby Airports',
    subtitle: 'Consider these alternative airports for better deals',
    noAlternatives: 'No nearby airports with better prices found',
    origin: 'Origin',
    destination: 'Destination',
    savings: 'Save',
    distance: 'miles away',
    totalCost: 'Total Cost',
    flightPrice: 'Flight Price',
    transport: 'Transport',
    roundTrip: 'round-trip',
    bestDeal: 'Best Deal',
    recommended: 'Recommended',
    switchAirport: 'Switch to this airport',
    transportOptions: 'Transport Options',
    cheapest: 'Cheapest',
    fastest: 'Fastest',
    duration: 'Duration',
    cost: 'Cost',
    viewMore: 'View alternatives',
    viewLess: 'Hide alternatives',
    transportTypes: {
      train: 'Train',
      bus: 'Bus',
      uber: 'Uber',
      taxi: 'Taxi',
      shuttle: 'Shuttle'
    },
    includingTransport: 'Including transport costs',
    perPerson: 'per person',
    comparedTo: 'compared to'
  },
  pt: {
    title: 'Economize Mais com Aeroportos Próximos',
    subtitle: 'Considere esses aeroportos alternativos para melhores ofertas',
    noAlternatives: 'Nenhum aeroporto próximo com melhores preços encontrado',
    origin: 'Origem',
    destination: 'Destino',
    savings: 'Economize',
    distance: 'milhas de distância',
    totalCost: 'Custo Total',
    flightPrice: 'Preço do Voo',
    transport: 'Transporte',
    roundTrip: 'ida e volta',
    bestDeal: 'Melhor Oferta',
    recommended: 'Recomendado',
    switchAirport: 'Mudar para este aeroporto',
    transportOptions: 'Opções de Transporte',
    cheapest: 'Mais Barato',
    fastest: 'Mais Rápido',
    duration: 'Duração',
    cost: 'Custo',
    viewMore: 'Ver alternativas',
    viewLess: 'Ocultar alternativas',
    transportTypes: {
      train: 'Trem',
      bus: 'Ônibus',
      uber: 'Uber',
      taxi: 'Táxi',
      shuttle: 'Transfer'
    },
    includingTransport: 'Incluindo custos de transporte',
    perPerson: 'por pessoa',
    comparedTo: 'comparado a'
  },
  es: {
    title: 'Ahorra Más con Aeropuertos Cercanos',
    subtitle: 'Considera estos aeropuertos alternativos para mejores ofertas',
    noAlternatives: 'No se encontraron aeropuertos cercanos con mejores precios',
    origin: 'Origen',
    destination: 'Destino',
    savings: 'Ahorra',
    distance: 'millas de distancia',
    totalCost: 'Costo Total',
    flightPrice: 'Precio del Vuelo',
    transport: 'Transporte',
    roundTrip: 'ida y vuelta',
    bestDeal: 'Mejor Oferta',
    recommended: 'Recomendado',
    switchAirport: 'Cambiar a este aeropuerto',
    transportOptions: 'Opciones de Transporte',
    cheapest: 'Más Barato',
    fastest: 'Más Rápido',
    duration: 'Duración',
    cost: 'Costo',
    viewMore: 'Ver alternativas',
    viewLess: 'Ocultar alternativas',
    transportTypes: {
      train: 'Tren',
      bus: 'Autobús',
      uber: 'Uber',
      taxi: 'Taxi',
      shuttle: 'Transfer'
    },
    includingTransport: 'Incluyendo costos de transporte',
    perPerson: 'por persona',
    comparedTo: 'comparado con'
  }
};

const TransportIcon: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  switch (type) {
    case 'train':
      return <Train className={className} />;
    case 'bus':
      return <Bus className={className} />;
    case 'uber':
    case 'taxi':
      return <Car className={className} />;
    case 'shuttle':
      return <Navigation className={className} />;
    default:
      return <Car className={className} />;
  }
};

const AlternativeAirports: React.FC<AlternativeAirportsProps> = ({
  originAirport,
  destinationAirport,
  currentPrice,
  onAirportSelect,
  currency = 'USD',
  lang = 'en'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = translations[lang];

  // Calculate alternative options for both origin and destination
  const alternatives = useMemo(() => {
    const options: AlternativeOption[] = [];
    const SAVINGS_THRESHOLD = 0.15; // 15% minimum savings

    // Get origin alternatives
    const originAlts = getAlternativeAirports(originAirport);
    if (originAlts) {
      originAlts.alternatives.forEach((alt) => {
        const priceDiff = alt.typicalPriceDifference / 100;
        const estimatedPrice = currentPrice * (1 + priceDiff);
        const savings = currentPrice - estimatedPrice;
        const savingsPercent = (savings / currentPrice) * 100;

        // Only show if savings exceed threshold
        if (savingsPercent >= SAVINGS_THRESHOLD * 100) {
          const cheapestTransport = getCheapestTransport(alt);
          const fastestTransport = getFastestTransport(alt);
          const totalCost = calculateTotalCost(estimatedPrice, cheapestTransport.cost, true);

          options.push({
            type: 'origin',
            airport: alt,
            estimatedPrice,
            savings,
            savingsPercent,
            cheapestTransport,
            fastestTransport,
            totalCost
          });
        }
      });
    }

    // Get destination alternatives
    const destAlts = getAlternativeAirports(destinationAirport);
    if (destAlts) {
      destAlts.alternatives.forEach((alt) => {
        const priceDiff = alt.typicalPriceDifference / 100;
        const estimatedPrice = currentPrice * (1 + priceDiff);
        const savings = currentPrice - estimatedPrice;
        const savingsPercent = (savings / currentPrice) * 100;

        // Only show if savings exceed threshold
        if (savingsPercent >= SAVINGS_THRESHOLD * 100) {
          const cheapestTransport = getCheapestTransport(alt);
          const fastestTransport = getFastestTransport(alt);
          const totalCost = calculateTotalCost(estimatedPrice, cheapestTransport.cost, true);

          options.push({
            type: 'destination',
            airport: alt,
            estimatedPrice,
            savings,
            savingsPercent,
            cheapestTransport,
            fastestTransport,
            totalCost
          });
        }
      });
    }

    // Sort by total cost (including transport)
    return options
      .sort((a, b) => a.totalCost - b.totalCost)
      .slice(0, 3); // Show top 3 alternatives
  }, [originAirport, destinationAirport, currentPrice]);

  const formatCurrency = (amount: number): string => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
    return `${symbol}${Math.round(amount)}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (alternatives.length === 0) {
    return null; // Don't show widget if no alternatives meet the threshold
  }

  const bestDeal = alternatives[0];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <>
              {t.viewLess}
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              {t.viewMore}
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Best Deal Preview (Always Visible) */}
      {!isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-300 dark:border-green-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                  {t.bestDeal}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {bestDeal.type === 'origin' ? t.origin : t.destination}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                {bestDeal.airport.code} - {bestDeal.airport.name}
              </h4>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{bestDeal.airport.distanceFromMain} {t.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TransportIcon type={bestDeal.cheapestTransport.type} />
                  <span>{formatDuration(bestDeal.cheapestTransport.duration)}</span>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {t.savings} {formatCurrency(bestDeal.savings)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({Math.round(bestDeal.savingsPercent)}% {t.comparedTo} {originAirport}-{destinationAirport})
                </span>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{t.flightPrice}:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(bestDeal.estimatedPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t.transport} ({t.roundTrip}):
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(bestDeal.cheapestTransport.cost * 2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">{t.totalCost}:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {formatCurrency(bestDeal.totalCost)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const newOrigin = bestDeal.type === 'origin' ? bestDeal.airport.code : originAirport;
                const newDest = bestDeal.type === 'destination' ? bestDeal.airport.code : destinationAirport;
                onAirportSelect(newOrigin, newDest);
              }}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              {t.switchAirport}
            </button>
          </div>
        </div>
      )}

      {/* Expanded View - All Alternatives */}
      {isExpanded && (
        <div className="space-y-4">
          {alternatives.map((option, index) => {
            const isBestDeal = index === 0;

            return (
              <div
                key={`${option.type}-${option.airport.code}`}
                className={`bg-white dark:bg-gray-800 rounded-lg p-5 border-2 transition-all ${
                  isBestDeal
                    ? 'border-green-300 dark:border-green-700 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800'
                }`}
              >
                {/* Airport Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isBestDeal && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                          {t.bestDeal}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                        {option.type === 'origin' ? t.origin : t.destination}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                      {option.airport.code} - {option.airport.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.airport.city}, {option.airport.country}
                    </p>
                  </div>

                  {/* Savings Badge */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
                      <TrendingDown className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        {formatCurrency(option.savings)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(option.savingsPercent)}% {t.savings.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Airport Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{option.airport.distanceFromMain} {t.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{formatDuration(option.cheapestTransport.duration)} {t.transport.toLowerCase()}</span>
                  </div>
                </div>

                {/* Transport Options */}
                <div className="mb-4">
                  <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    {t.transportOptions}
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Cheapest Option */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                          {t.cheapest}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <TransportIcon type={option.cheapestTransport.type} className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {t.transportTypes[option.cheapestTransport.type as keyof typeof t.transportTypes]}
                        </span>
                      </div>
                      {option.cheapestTransport.provider && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {option.cheapestTransport.provider}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatDuration(option.cheapestTransport.duration)}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(option.cheapestTransport.cost)}
                        </span>
                      </div>
                    </div>

                    {/* Fastest Option */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                          {t.fastest}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <TransportIcon type={option.fastestTransport.type} className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {t.transportTypes[option.fastestTransport.type as keyof typeof t.transportTypes]}
                        </span>
                      </div>
                      {option.fastestTransport.provider && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {option.fastestTransport.provider}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatDuration(option.fastestTransport.duration)}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(option.fastestTransport.cost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{t.flightPrice}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(option.estimatedPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t.transport} ({t.roundTrip}):
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(option.cheapestTransport.cost * 2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">{t.totalCost}:</span>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400 text-xl">
                          {formatCurrency(option.totalCost)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t.perPerson}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Comparison Bar */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t.comparedTo} {originAirport}-{destinationAirport}</span>
                  </div>
                  <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-600 rounded-full transition-all"
                      style={{ width: `${100 - option.savingsPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow">
                        {Math.round(100 - option.savingsPercent)}% of original price
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    const newOrigin = option.type === 'origin' ? option.airport.code : originAirport;
                    const newDest = option.type === 'destination' ? option.airport.code : destinationAirport;
                    onAirportSelect(newOrigin, newDest);
                  }}
                  className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                    isBestDeal
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  {t.switchAirport}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            {t.includingTransport}. {lang === 'en' && 'Prices and travel times are estimates and may vary.'}
            {lang === 'pt' && 'Preços e tempos de viagem são estimativas e podem variar.'}
            {lang === 'es' && 'Los precios y tiempos de viaje son estimaciones y pueden variar.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlternativeAirports;
