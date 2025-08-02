'use client';

/**
 * 📅 Flight Cheapest Dates Component
 * Máxima persuasão através de price psychology e urgency
 * Focus: FOMO, Price Anchoring, Urgency, and Flexibility Rewards
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CalendarIcon, TrendingDownIcon, TrendingUpIcon, ClockIcon, ZapIcon } from '@/components/Icons';
import { EnhancedFlightDate, FlightDateSearchParams } from '@/types/flights';

interface FlightCheapestDatesProps {
  origin: string;
  destination: string;
  preferredDate?: string;
  onDateSelect: (date: EnhancedFlightDate) => void;
  className?: string;
}

export default function FlightCheapestDates({
  origin,
  destination,
  preferredDate,
  onDateSelect,
  className = ''
}: FlightCheapestDatesProps) {
  const [dates, setDates] = useState<EnhancedFlightDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'LIST'>('CALENDAR');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCheapestDates();
  }, [origin, destination]);

  const fetchCheapestDates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/flights/cheapest-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureDate: preferredDate,
          viewBy: 'DATE'
        } as FlightDateSearchParams)
      });
      
      const data = await response.json();
      if (data.success) {
        setDates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cheapest dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 Calculate savings insights
  const priceAnalysis = useMemo(() => {
    if (dates.length === 0) return null;

    const prices = dates.map(d => typeof d.price === 'object' ? parseFloat(d.price.total) : d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxSavings = maxPrice - minPrice;

    return {
      minPrice,
      maxPrice,
      avgPrice,
      maxSavings,
      bestDate: dates.find(d => (typeof d.price === 'object' ? parseFloat(d.price.total) : d.price) === minPrice),
      worstDate: dates.find(d => (typeof d.price === 'object' ? parseFloat(d.price.total) : d.price) === maxPrice)
    };
  }, [dates]);

  const togglePriceAlert = (dateString: string) => {
    const newAlerts = new Set(priceAlerts);
    if (newAlerts.has(dateString)) {
      newAlerts.delete(dateString);
    } else {
      newAlerts.add(dateString);
    }
    setPriceAlerts(newAlerts);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      full: date.toLocaleDateString('pt-BR')
    };
  };

  if (isLoading) {
    return (
      <div className={`cheapest-dates-loading ${className}`}>
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="inline-flex items-center gap-3 mb-4">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-700">Analisando preços...</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">Comparando milhões de combinações de datas</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cheapest-dates ${className}`}>
      {/* 🎯 Header with Price Psychology */}
      <div className="dates-header mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              📅 Quando viajar é mais barato?
            </h2>
            <p className="text-lg text-gray-600">
              <span className="font-semibold text-blue-600">{origin}</span> → <span className="font-semibold text-blue-600">{destination}</span>
            </p>
          </div>

          {/* 🎯 Savings Highlight */}
          {priceAnalysis && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 rounded-xl border border-green-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Economize até</div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {priceAnalysis.maxSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-green-600 font-medium">sendo flexível!</div>
              </div>
            </div>
          )}
        </div>

        {/* 🎯 Quick Stats Bar */}
        {priceAnalysis && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {priceAnalysis.minPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">Menor preço</div>
                <div className="text-xs text-green-600 font-medium">
                  {priceAnalysis.bestDate?.departureDate && formatDate(priceAnalysis.bestDate.departureDate).full}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">
                  R$ {priceAnalysis.avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">Preço médio</div>
                <div className="text-xs text-gray-500">nos próximos meses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  R$ {priceAnalysis.maxPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">Maior preço</div>
                <div className="text-xs text-red-600 font-medium">evite esta data!</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(((priceAnalysis.maxPrice - priceAnalysis.minPrice) / priceAnalysis.maxPrice) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Economia máxima</div>
                <div className="text-xs text-blue-600 font-medium">com flexibilidade</div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'CALENDAR' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📅 Calendário
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'LIST' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📋 Lista
            </button>
          </div>

          <div className="text-sm text-gray-500">
            💡 <strong>Dica:</strong> Preços mudam constantemente - reserve quando encontrar uma boa oferta!
          </div>
        </div>
      </div>

      {/* 🎯 Dates Display */}
      {viewMode === 'CALENDAR' ? (
        // 📅 CALENDAR VIEW - Visual Price Comparison
        <div className="dates-calendar">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {dates.map((date, index) => {
              const formatted = formatDate(date.departureDate || date.date || '');
              const price = typeof date.price === 'object' ? parseFloat(date.price.total) : date.price;
              const isLowest = priceAnalysis && price === priceAnalysis.minPrice;
              const isHighest = priceAnalysis && price === priceAnalysis.maxPrice;
              const isSelected = selectedDate === date.departureDate || date.date || '';

              return (
                <div
                  key={`date-${index}`}
                  className={`date-card relative cursor-pointer transition-all duration-300 transform hover:scale-105 rounded-2xl overflow-hidden border-2 ${
                    isSelected
                      ? 'border-blue-500 shadow-xl'
                      : isLowest
                      ? 'border-green-400 shadow-lg'
                      : isHighest
                      ? 'border-red-400 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg'
                  }`}
                  onClick={() => {
                    setSelectedDate(date.departureDate || date.date || '');
                    onDateSelect(date);
                  }}
                >
                  {/* 🎯 Price Trend Indicator */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                    date.priceChange?.trend === 'RISING' ? 'bg-red-400' :
                    date.priceChange?.trend === 'FALLING' ? 'bg-green-400' : 'bg-gray-300'
                  }`} />

                  {/* 🎯 Special Badges */}
                  {isLowest && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      💰 MELHOR
                    </div>
                  )}
                  {date.priceChange?.historicalLow && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      🔥 MÍNIMA
                    </div>
                  )}

                  <div className="p-4">
                    {/* Date Info */}
                    <div className="text-center mb-3">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatted.day}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatted.weekday}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatted.month}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-3">
                      <div className={`text-lg font-bold ${
                        isLowest ? 'text-green-600' : isHighest ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </div>
                      
                      {/* 🎯 Price Change Indicator */}
                      {date.priceChange && (
                        <div className={`text-xs flex items-center justify-center gap-1 ${
                          date.priceChange.trend === 'RISING' ? 'text-red-600' :
                          date.priceChange.trend === 'FALLING' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {date.priceChange.trend === 'RISING' ? (
                            <TrendingUpIcon className="w-3 h-3" />
                          ) : date.priceChange.trend === 'FALLING' ? (
                            <TrendingDownIcon className="w-3 h-3" />
                          ) : null}
                          {date.priceChange.trend !== 'STABLE' && `${date.priceChange.percentage}%`}
                        </div>
                      )}
                    </div>

                    {/* 🎯 Urgency Level */}
                    {date.bookingUrgency && date.bookingUrgency.level > 7 && (
                      <div className="text-center">
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          date.bookingUrgency.level >= 9 ? 'bg-red-100 text-red-700' :
                          date.bookingUrgency.level >= 8 ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          ⚡ Urgente
                        </div>
                      </div>
                    )}

                    {/* 🎯 Weather Score */}
                    {date.weatherForecast && (
                      <div className="text-center mt-2">
                        <div className="text-xs text-gray-500">
                          {date.weatherForecast.condition} {date.weatherForecast.temperature}°C
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 🎯 Price Alert Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePriceAlert(date.departureDate || date.date || '');
                    }}
                    className={`absolute bottom-2 right-2 p-1 rounded-full transition-colors ${
                      priceAlerts.has(date.departureDate || date.date || '')
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <ClockIcon className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // 📋 LIST VIEW - Detailed Information
        <div className="dates-list space-y-4">
          {dates.map((date, index) => {
            const formatted = formatDate(date.departureDate || date.date || '');
            const price = typeof date.price === 'object' ? parseFloat(date.price.total) : date.price;
            const isLowest = priceAnalysis && price === priceAnalysis.minPrice;

            return (
              <div
                key={`list-date-${index}`}
                className={`date-list-item p-6 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  isLowest
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onDateSelect(date)}
              >
                <div className="flex items-center justify-between">
                  {/* Date & Route Info */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatted.day}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatted.weekday}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatted.month}
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {origin} → {destination}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {formatted.full}
                      </div>

                      {/* 🎯 Enhanced Information */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {date.demandLevel && (
                          <span className={`px-2 py-1 rounded-full ${
                            date.demandLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                            date.demandLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {date.demandLevel === 'HIGH' ? '🔥 Alta demanda' :
                             date.demandLevel === 'MEDIUM' ? '⚡ Demanda média' :
                             '✅ Baixa demanda'}
                          </span>
                        )}

                        {date.weatherForecast && (
                          <span>
                            🌤️ {date.weatherForecast.condition} {date.weatherForecast.temperature}°C
                          </span>
                        )}

                        {date.eventBasedPricing?.hasEvents && (
                          <span>🎉 Eventos na cidade</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="text-right">
                    <div className={`text-3xl font-bold mb-1 ${
                      isLowest ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </div>

                    {/* 🎯 Price Analysis */}
                    {date.priceChange && (
                      <div className={`text-sm mb-2 ${
                        date.priceChange.trend === 'RISING' ? 'text-red-600' :
                        date.priceChange.trend === 'FALLING' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {date.priceChange.prediction}
                      </div>
                    )}

                    {/* 🎯 Flexibility Bonus */}
                    {date.flexibilityBonus && (
                      <div className="text-sm text-green-600 font-medium mb-3">
                        {date.flexibilityBonus.message}
                      </div>
                    )}

                    {/* 🎯 Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePriceAlert(date.departureDate || date.date || '');
                        }}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          priceAlerts.has(date.departureDate || date.date || '')
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {priceAlerts.has(date.departureDate || date.date || '') ? '🔔 Alerta Ativo' : '⏰ Criar Alerta'}
                      </button>
                      
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Ver Voos
                      </button>
                    </div>
                  </div>
                </div>

                {/* 🎯 Urgency Message */}
                {date.bookingUrgency && date.bookingUrgency.level > 6 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700">
                      <ZapIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {date.bookingUrgency.message}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 🎯 Conversion Footer */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            💡 Dicas para Economizar Ainda Mais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold text-gray-900 mb-2">Seja Flexível</div>
              <div className="text-gray-600">Viajar +/- 3 dias pode economizar até R$ 500</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">⏰</div>
              <div className="font-semibold text-gray-900 mb-2">Reserve Cedo</div>
              <div className="text-gray-600">Antecipação de 2-3 meses garante melhores preços</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🔔</div>
              <div className="font-semibold text-gray-900 mb-2">Alertas de Preço</div>
              <div className="text-gray-600">Receba notificações quando o preço baixar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}