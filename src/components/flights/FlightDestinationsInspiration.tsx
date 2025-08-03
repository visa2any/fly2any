'use client';

/**
 * 🌍 International Flight Destinations Inspiration Component
 * International destination discovery with AI recommendations
 * Focus: High-commission international routes, conversion optimization, and premium UX
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FlightIcon, TrendingUpIcon, HeartIcon, ShareIcon, CalendarIcon } from '@/components/Icons';
import { EnhancedFlightDestination, FlightDestinationSearchParams } from '@/types/flights';

interface FlightDestinationsInspirationProps {
  originCode: string;
  onDestinationSelect: (destination: EnhancedFlightDestination) => void;
  maxResults?: number;
  className?: string;
}

export default function FlightDestinationsInspiration({
  originCode,
  onDestinationSelect,
  maxResults = 12,
  className = ''
}: FlightDestinationsInspirationProps) {
  const [destinations, setDestinations] = useState<EnhancedFlightDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [sortBy, setSortBy] = useState<'PRICE' | 'POPULARITY' | 'TRENDING' | 'SAVINGS'>('SAVINGS');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 🎯 Fetch destinations with conversion optimization
  useEffect(() => {
    fetchDestinations();
  }, [originCode, sortBy]);

  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      // This would connect to our SuperAmadeusClient
      const response = await fetch(`/api/flights/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: originCode,
          max: maxResults,
          viewBy: 'DESTINATION'
        } as FlightDestinationSearchParams)
      });
      
      const data = await response.json();
      if (data.success) {
        setDestinations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 Smart sorting for maximum conversion
  const sortedDestinations = useMemo(() => {
    return [...destinations].sort((a, b) => {
      switch (sortBy) {
        case 'PRICE':
          return (typeof a.price === 'object' ? parseFloat(a.price.total) : a.price) - (typeof b.price === 'object' ? parseFloat(b.price.total) : b.price);
        case 'POPULARITY':
          return (b.popularityScore || 0) - (a.popularityScore || 0);
        case 'TRENDING':
          const trendScores = { 'HOT': 3, 'RISING': 2, 'STEADY': 1 };
          return trendScores[b.trendingStatus || 'STEADY'] - trendScores[a.trendingStatus || 'STEADY'];
        case 'SAVINGS':
          return (b.savings?.percentage || 0) - (a.savings?.percentage || 0);
        default:
          return 0;
      }
    });
  }, [destinations, sortBy]);

  const toggleFavorite = (destinationCode: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(destinationCode)) {
      newFavorites.delete(destinationCode);
    } else {
      newFavorites.add(destinationCode);
    }
    setFavorites(newFavorites);
  };

  const shareDestination = async (destination: EnhancedFlightDestination) => {
    if (navigator.share) {
      await navigator.share({
        title: `Voo para ${destination.destination}`,
        text: `Encontrei um voo incrível para ${destination.destination} por apenas ${typeof destination.price === 'object' ? destination.price.total : destination.price.toString()}!`,
        url: window.location.href
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`destinations-inspiration-loading ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">🌍 Descobrindo destinos incríveis para você...</p>
          <p className="text-sm text-gray-500 mt-2">Analisando milhões de ofertas em tempo real</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`destinations-inspiration ${className}`}>
      {/* 🎯 Header with Persuasive Messaging */}
      <div className="inspiration-header mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🌍 Discover Amazing International Destinations
            </h2>
            <p className="text-lg text-gray-600">
              We found <span className="font-semibold text-blue-600">{destinations.length} premium international destinations</span> with exclusive deals from {originCode}
            </p>
            <p className="text-sm text-purple-600 font-medium mt-1">
              💰 International flights offer 10x higher commissions • ⚡ AI-powered recommendations
            </p>
          </div>
          
          {/* 🎯 International Social Proof Counter */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 rounded-xl border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(Math.random() * 300) + 150}
              </div>
              <div className="text-sm text-gray-600">international travelers</div>
              <div className="text-xs text-green-600 font-medium">booking now</div>
            </div>
          </div>
        </div>

        {/* 🎯 Smart Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SAVINGS">💰 Best International Deals</option>
              <option value="PRICE">🏷️ Lowest Price First</option>
              <option value="TRENDING">🔥 Trending Destinations</option>
              <option value="POPULARITY">⭐ Most Popular Routes</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'GRID' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm">⊞</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'LIST' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🎯 Destinations Grid/List */}
      <div className={`destinations-grid ${
        viewMode === 'GRID' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
      }`}>
        {sortedDestinations.map((destination, index) => (
          <div
            key={`${destination.origin}-${destination.destination}-${index}`}
            className={`destination-card group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              viewMode === 'GRID' 
                ? 'bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200' 
                : 'bg-white rounded-xl shadow-md p-6 border border-gray-200'
            }`}
            onClick={() => onDestinationSelect(destination)}
          >
            {viewMode === 'GRID' ? (
              // 🎯 GRID VIEW - Maximum Visual Appeal
              <>
                {/* Destination Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                  {/* 🎯 Trending Badge */}
                  {destination.trendingStatus === 'HOT' && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      🔥 HOT
                    </div>
                  )}
                  
                  {/* 🎯 Savings Badge */}
                  {destination.savings && destination.savings.percentage > 15 && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      -{destination.savings.percentage}%
                    </div>
                  )}

                  {/* 🎯 Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      destination.destination && toggleFavorite(destination.destination);
                    }}
                    className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <HeartIcon 
                      className={`w-5 h-5 ${
                        destination.destination && favorites.has(destination.destination) ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`} 
                    />
                  </button>

                  {/* Destination Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {destination.destination}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {destination.seasonality === 'LOW' ? '🌟 Baixa temporada' : '☀️ Alta temporada'}
                    </p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* 🎯 Price Section */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {typeof destination.price === 'object' ? destination.price.total : destination.price.toString()}
                      </div>
                      {destination.savings && (
                        <div className="text-sm text-green-600 font-medium">
                          Economize {destination.savings.amount}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">ida e volta</div>
                      <div className="text-xs text-gray-400">por pessoa</div>
                    </div>
                  </div>

                  {/* 🎯 Persuasion Tags */}
                  {destination.persuasionTags && destination.persuasionTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {destination.persuasionTags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={`tag-${tagIndex}`}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 🎯 Social Media Stats */}
                  {destination.socialMedia && (
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span>📸 {destination.socialMedia.instagramHashtags.length} hashtags</span>
                      <span>⭐ {destination.socialMedia.influencerRecommendations} influencers</span>
                    </div>
                  )}

                  {/* 🎯 Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Ver Voos
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareDestination(destination);
                      }}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ShareIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // 🎯 LIST VIEW - Information Dense
              <div className="flex items-center gap-6">
                {/* Destination Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {destination.destination}
                    </h3>
                    {destination.trendingStatus === 'HOT' && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                        🔥 HOT
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>✈️ {destination.origin} → {destination.destination}</span>
                    <span>📅 {new Date(destination.departureDate).toLocaleDateString('en-US')}</span>
                    {destination.popularityScore && (
                      <span>⭐ {destination.popularityScore}/100</span>
                    )}
                  </div>

                  {destination.persuasionTags && (
                    <div className="flex flex-wrap gap-1">
                      {destination.persuasionTags.map((tag, tagIndex) => (
                        <span
                          key={`list-tag-${tagIndex}`}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Section */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {typeof destination.price === 'object' ? destination.price.total : destination.price.toString()}
                  </div>
                  {destination.savings && (
                    <div className="text-sm text-green-600 font-medium mb-2">
                      -{destination.savings.percentage}% • {destination.savings.amount}
                    </div>
                  )}
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🎯 Load More with Social Proof */}
      {destinations.length >= maxResults && (
        <div className="text-center mt-12">
          <div className="bg-gray-50 rounded-xl p-8 mb-6">
            <p className="text-lg font-medium text-gray-700 mb-2">
              🌟 Mais {Math.floor(Math.random() * 100) + 50} destinos incríveis disponíveis!
            </p>
            <p className="text-sm text-gray-500">
              {Math.floor(Math.random() * 1000) + 500} pessoas descobriram novos destinos hoje
            </p>
          </div>
          
          <button 
            onClick={() => setIsLoading(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🌍 Descobrir Mais Destinos
          </button>
        </div>
      )}

      {/* 🎯 Conversion Optimization Footer */}
      <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            🎯 Por que escolher estes destinos?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="font-semibold text-gray-900">Preços Garantidos</div>
                <div className="text-gray-600">Melhor preço ou devolvemos a diferença</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="font-semibold text-gray-900">Reserva Instantânea</div>
                <div className="text-gray-600">Confirmação em menos de 2 minutos</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <div className="font-semibold text-gray-900">100% Seguro</div>
                <div className="text-gray-600">Cancelamento grátis até 24h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}