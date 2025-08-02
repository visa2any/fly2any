'use client';

/**
 * Flight Results List Component
 * Displays list of flight offers with sorting and filtering
 */

import React, { useState, useMemo } from 'react';
import { 
  ProcessedFlightOffer, 
  FlightFilters, 
  FlightSortOptions,
  ProcessedJourney,
  ProcessedSegment 
} from '@/types/flights';
import { 
  FlightIcon, 
  ClockIcon, 
  CalendarIcon,
  PlusIcon,
  MinusIcon,
  StarIcon,
  CheckIcon,
  XIcon,
  FilterIcon
} from '@/components/Icons';
import { 
  formatStops, 
  formatTravelClass, 
  getTimeOfDay,
  formatTimeOfDay
} from '@/lib/flights/formatters';
import {
  filterFlightOffers,
  sortFlightOffers,
  hasPreferredFeatures,
  getFlightQualityScore,
  getStopsEmoji,
  getTimeOfDayEmoji
} from '@/lib/flights/helpers';

interface FlightResultsListProps {
  offers: ProcessedFlightOffer[];
  onOfferSelect: (offer: ProcessedFlightOffer) => void;
  filters?: FlightFilters;
  onFiltersChange?: (filters: FlightFilters) => void;
  sortOptions?: FlightSortOptions;
  onSortChange?: (sort: FlightSortOptions) => void;
  isLoading?: boolean;
  className?: string;
}

export default function FlightResultsList({
  offers,
  onOfferSelect,
  filters = {},
  onFiltersChange,
  sortOptions = { sortBy: 'price', sortOrder: 'asc' },
  onSortChange,
  isLoading = false,
  className = ''
}: FlightResultsListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOffers, setExpandedOffers] = useState<Set<string>>(new Set());

  // Apply filters and sorting
  const processedOffers = useMemo(() => {
    let result = [...offers];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = filterFlightOffers(result, filters);
    }
    
    // Apply sorting
    result = sortFlightOffers(result, sortOptions);
    
    return result;
  }, [offers, filters, sortOptions]);

  // Toggle offer details
  const toggleOfferDetails = (offerId: string) => {
    setExpandedOffers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(offerId)) {
        newSet.delete(offerId);
      } else {
        newSet.add(offerId);
      }
      return newSet;
    });
  };

  // Render segment details
  const renderSegment = (segment: ProcessedSegment, isReturn = false) => (
    <div key={segment.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
      {/* Airline */}
      <div className="flex items-center space-x-2">
        <img 
          src={segment.airline.logo} 
          alt={segment.airline.name}
          className="w-8 h-8 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/airline-default.png';
          }}
        />
        <div className="text-sm">
          <div className="font-medium">{segment.flightNumber}</div>
          <div className="text-gray-600">{segment.aircraft.name}</div>
        </div>
      </div>

      {/* Route */}
      <div className="flex-1 flex items-center justify-between">
        <div className="text-center">
          <div className="font-bold text-lg">{segment.departure.time}</div>
          <div className="text-sm text-gray-600">{segment.departure.iataCode}</div>
          <div className="text-xs text-gray-500">{segment.departure.date}</div>
        </div>
        
        <div className="flex-1 px-4">
          <div className="text-center text-sm text-gray-600">
            {segment.duration}
          </div>
          <div className="border-t border-gray-300 relative">
            <FlightIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 bg-white" />
          </div>
        </div>
        
        <div className="text-center">
          <div className="font-bold text-lg">{segment.arrival.time}</div>
          <div className="text-sm text-gray-600">{segment.arrival.iataCode}</div>
          <div className="text-xs text-gray-500">{segment.arrival.date}</div>
        </div>
      </div>

      {/* Class */}
      <div className="text-sm">
        <div className="font-medium">{formatTravelClass(segment.cabin)}</div>
      </div>
    </div>
  );

  // Render journey
  const renderJourney = (journey: ProcessedJourney, title: string) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      
      {/* Journey summary */}
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div>
            <span className="font-bold text-lg">{journey.departure.time}</span>
            <span className="text-sm text-gray-600 ml-2">{journey.departure.iataCode}</span>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <div>{journey.duration}</div>
            <div className="flex items-center space-x-1">
              <span>{getStopsEmoji(journey.stops)}</span>
              <span>{formatStops(journey.stops)}</span>
            </div>
          </div>
          
          <div>
            <span className="font-bold text-lg">{journey.arrival.time}</span>
            <span className="text-sm text-gray-600 ml-2">{journey.arrival.iataCode}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {getTimeOfDayEmoji(getTimeOfDay(journey.departure.time))} {formatTimeOfDay(getTimeOfDay(journey.departure.time))}
          </div>
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-2">
        {journey.segments.map(segment => renderSegment(segment))}
      </div>

      {/* Layovers */}
      {journey.layovers && journey.layovers.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">Conexões</h5>
          {journey.layovers.map((layover, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
              <ClockIcon className="w-4 h-4" />
              <span>Conexão em {layover.airport}: {layover.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render flight offer card
  const renderFlightOffer = (offer: ProcessedFlightOffer) => {
    const isExpanded = expandedOffers.has(offer.id);
    const qualityScore = getFlightQualityScore(offer, offers);
    const features = hasPreferredFeatures(offer);

    return (
      <div key={offer.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        
        {/* Main offer summary */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            
            {/* Flight route summary */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
              
              {/* Outbound */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FlightIcon className="w-4 h-4" />
                  <span>Ida</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="font-bold text-lg">{offer.outbound.departure.time}</div>
                    <div className="text-sm text-gray-600">{offer.outbound.departure.iataCode}</div>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-600">{offer.outbound.duration}</div>
                    <div className="border-t border-gray-300 relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                        <span className="text-xs text-gray-500">{formatStops(offer.outbound.stops)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-bold text-lg">{offer.outbound.arrival.time}</div>
                    <div className="text-sm text-gray-600">{offer.outbound.arrival.iataCode}</div>
                  </div>
                </div>
              </div>

              {/* Return (if applicable) */}
              {offer.inbound && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FlightIcon className="w-4 h-4 transform rotate-180" />
                    <span>Volta</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="font-bold text-lg">{offer.inbound.departure.time}</div>
                      <div className="text-sm text-gray-600">{offer.inbound.departure.iataCode}</div>
                    </div>
                    
                    <div className="flex-1 text-center">
                      <div className="text-sm text-gray-600">{offer.inbound.duration}</div>
                      <div className="border-t border-gray-300 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                          <span className="text-xs text-gray-500">{formatStops(offer.inbound.stops)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-bold text-lg">{offer.inbound.arrival.time}</div>
                      <div className="text-sm text-gray-600">{offer.inbound.arrival.iataCode}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price and action */}
              <div className="text-center lg:text-right space-y-3">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{offer.totalPrice}</div>
                  <div className="text-sm text-gray-600">
                    {offer.currency} • {offer.numberOfBookableSeats} assentos restantes
                  </div>
                </div>
                
                {/* Quality score */}
                <div className="flex items-center justify-center lg:justify-end space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{qualityScore}/100</span>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => onOfferSelect(offer)}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Selecionar
                  </button>
                  
                  <button
                    onClick={() => toggleOfferDetails(offer.id)}
                    className="w-full px-6 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>{isExpanded ? 'Menos detalhes' : 'Mais detalhes'}</span>
                    {isExpanded ? <MinusIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <CheckIcon className="w-3 h-3 mr-1" />
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Airlines */}
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
            <span>Operado por:</span>
            <div className="flex space-x-2">
              {offer.validatingAirlines.slice(0, 2).map((airline, index) => (
                <span key={index} className="font-medium">{airline}</span>
              ))}
              {offer.validatingAirlines.length > 2 && (
                <span>+{offer.validatingAirlines.length - 2} mais</span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
            
            {/* Outbound journey details */}
            {renderJourney(offer.outbound, 'Voo de ida')}
            
            {/* Return journey details */}
            {offer.inbound && renderJourney(offer.inbound, 'Voo de volta')}
            
            {/* Additional info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Informações da reserva</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center space-x-2">
                    {offer.instantTicketingRequired ? <CheckIcon className="w-4 h-4 text-green-500" /> : <XIcon className="w-4 h-4 text-red-500" />}
                    <span>{offer.instantTicketingRequired ? 'Confirmação instantânea' : 'Confirmação manual'}</span>
                  </li>
                  <li>Data limite para emissão: {new Date(offer.lastTicketingDate).toLocaleDateString('pt-BR')}</li>
                  <li>Assentos disponíveis: {offer.numberOfBookableSeats}</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Avaliação do voo</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Qualidade geral</span>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{qualityScore}/100</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full"
                      style={{ width: `${qualityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`flight-results-loading ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-1/2 ml-auto"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (processedOffers.length === 0) {
    return (
      <div className={`flight-results-empty ${className}`}>
        <div className="text-center py-12">
          <FlightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum voo encontrado</h3>
          <p className="text-gray-600 mb-4">
            Não encontramos voos que correspondam aos seus critérios de busca.
          </p>
          <button
            onClick={() => onFiltersChange?.({})}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flight-results-list ${className}`}>
      
      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {processedOffers.length} {processedOffers.length === 1 ? 'voo encontrado' : 'voos encontrados'}
          </h2>
          {offers.length !== processedOffers.length && (
            <p className="text-sm text-gray-600 mt-1">
              {offers.length - processedOffers.length} voos filtrados
            </p>
          )}
        </div>

        {/* Sort options */}
        <div className="flex items-center space-x-4">
          <select
            value={`${sortOptions.sortBy}-${sortOptions.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [any, 'asc' | 'desc'];
              onSortChange?.({ sortBy, sortOrder });
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="duration-asc">Menor duração</option>
            <option value="duration-desc">Maior duração</option>
            <option value="departure-asc">Partida mais cedo</option>
            <option value="departure-desc">Partida mais tarde</option>
            <option value="stops-asc">Menos paradas</option>
            <option value="stops-desc">Mais paradas</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Results list */}
      <div className="space-y-4">
        {processedOffers.map(renderFlightOffer)}
      </div>

      {/* Load more (if needed) */}
      {processedOffers.length < offers.length && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Carregar mais resultados
          </button>
        </div>
      )}
    </div>
  );
}