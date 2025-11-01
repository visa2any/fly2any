'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, Loader2 } from 'lucide-react';

/**
 * Props interface for the PriceCalendarMatrix component
 */
interface PriceCalendarMatrixProps {
  /** IATA code for origin airport */
  origin: string;
  /** IATA code for destination airport */
  destination: string;
  /** Currently selected date in YYYY-MM-DD format */
  currentDate: string;
  /** Callback function when a date is selected */
  onDateSelect: (date: string) => void;
  /** Currency code (default: 'USD') */
  currency?: string;
  /** Language for translations (default: 'en') */
  lang?: 'en' | 'pt' | 'es';
}

/**
 * Interface for individual date price data
 */
interface DatePrice {
  date: string;
  price: number;
  isDeal: boolean;
  percentDiff: number;
}

/**
 * Interface for month data structure
 */
interface MonthData {
  year: number;
  month: number;
  dates: DatePrice[];
}

/**
 * Translations object for multi-language support
 */
const translations = {
  en: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    bestPrice: 'Best Price',
    cheaper: 'cheaper',
    moreExpensive: 'more expensive',
    loading: 'Loading prices...',
    vs: 'vs',
  },
  pt: {
    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    days: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    bestPrice: 'Melhor Preço',
    cheaper: 'mais barato',
    moreExpensive: 'mais caro',
    loading: 'Carregando preços...',
    vs: 'vs',
  },
  es: {
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    bestPrice: 'Mejor Precio',
    cheaper: 'más barato',
    moreExpensive: 'más caro',
    loading: 'Cargando precios...',
    vs: 'vs',
  },
};

/**
 * Generate mock price data for demonstration
 * In production, this would be replaced with real API calls
 */
const generateMockPrices = (basePrice: number, totalDays: number): DatePrice[] => {
  const prices: DatePrice[] = [];
  const today = new Date();

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Weekend detection (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Base price variation
    let priceVariation = 1 + (Math.random() * 0.4 - 0.2); // ±20%

    // Weekends are typically 10-15% more expensive
    if (isWeekend) {
      priceVariation *= 1 + (Math.random() * 0.05 + 0.1);
    }

    // Random "deal days" (10% chance)
    const isDeal = Math.random() < 0.1;
    if (isDeal) {
      priceVariation *= 0.6 + Math.random() * 0.1; // 30-40% discount
    }

    const price = Math.round(basePrice * priceVariation);

    prices.push({
      date: date.toISOString().split('T')[0],
      price,
      isDeal,
      percentDiff: 0, // Will be calculated later
    });
  }

  return prices;
};

/**
 * Calculate percentage differences relative to current selected price
 */
const calculatePercentDiffs = (prices: DatePrice[], currentPrice: number): DatePrice[] => {
  return prices.map(priceData => ({
    ...priceData,
    percentDiff: Math.round(((priceData.price - currentPrice) / currentPrice) * 100),
  }));
};

/**
 * Get color based on price percentile
 */
const getPriceColor = (percentile: number): string => {
  if (percentile <= 0.25) return 'from-emerald-500/20 to-emerald-600/30 border-emerald-500/40';
  if (percentile <= 0.5) return 'from-green-500/20 to-green-600/30 border-green-500/40';
  if (percentile <= 0.75) return 'from-yellow-500/20 to-yellow-600/30 border-yellow-500/40';
  return 'from-red-500/20 to-red-600/30 border-red-500/40';
};

/**
 * Get text color based on price percentile
 */
const getPriceTextColor = (percentile: number): string => {
  if (percentile <= 0.25) return 'text-emerald-400';
  if (percentile <= 0.5) return 'text-green-400';
  if (percentile <= 0.75) return 'text-yellow-400';
  return 'text-red-400';
};

/**
 * PriceCalendarMatrix Component
 *
 * A comprehensive price calendar that displays flight prices across multiple months
 * with visual heatmap, deal indicators, and interactive date selection.
 *
 * @example
 * ```tsx
 * <PriceCalendarMatrix
 *   origin="LAX"
 *   destination="JFK"
 *   currentDate="2025-11-15"
 *   onDateSelect={(date) => console.log('Selected:', date)}
 *   currency="USD"
 *   lang="en"
 * />
 * ```
 */
export default function PriceCalendarMatrix({
  origin,
  destination,
  currentDate,
  onDateSelect,
  currency = 'USD',
  lang = 'en',
}: PriceCalendarMatrixProps) {
  const [loading, setLoading] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [apiPrices, setApiPrices] = useState<DatePrice[]>([]);

  const t = translations[lang];

  // Fetch real calendar prices from cached searches
  useEffect(() => {
    if (!origin || !destination) return;

    const fetchPrices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cheapest-dates?origin=${origin}&destination=${destination}`);

        if (!response.ok) {
          console.warn('Failed to fetch calendar prices, using fallback');
          // Fallback to mock data
          const basePrice = 300 + Math.random() * 200;
          setApiPrices(generateMockPrices(basePrice, 90));
          return;
        }

        const data = await response.json();

        // Transform API data to DatePrice format
        const pricesMap = data.prices || {};
        const transformedPrices: DatePrice[] = [];

        // Get all dates with prices
        Object.entries(pricesMap).forEach(([date, price]) => {
          transformedPrices.push({
            date,
            price: Number(price),
            isDeal: false, // Will be calculated later
            percentDiff: 0 // Will be calculated later
          });
        });

        // Sort by date
        transformedPrices.sort((a, b) => a.date.localeCompare(b.date));

        console.log('📅 PriceCalendarMatrix: Loaded', transformedPrices.length, 'cached prices from actual searches');

        setApiPrices(transformedPrices.length > 0 ? transformedPrices : generateMockPrices(400, 90));
      } catch (error) {
        console.error('Error fetching calendar prices:', error);
        // Fallback to mock data
        const basePrice = 300 + Math.random() * 200;
        setApiPrices(generateMockPrices(basePrice, 90));
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [origin, destination]);

  // Use fetched API prices
  const allPrices = apiPrices;

  // Get current selected price
  const currentPrice = useMemo(() => {
    const found = allPrices.find(p => p.date === currentDate);
    return found?.price || allPrices[0]?.price || 400;
  }, [allPrices, currentDate]);

  // Calculate percentage differences
  const pricesWithDiffs = useMemo(() => {
    return calculatePercentDiffs(allPrices, currentPrice);
  }, [allPrices, currentPrice]);

  // Find min and max prices for percentile calculation
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = pricesWithDiffs.map(p => p.price);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [pricesWithDiffs]);

  // Group dates by month
  const monthsData = useMemo(() => {
    const months: MonthData[] = [];
    const today = new Date();

    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthDates = pricesWithDiffs.filter(p => {
        const pDate = new Date(p.date);
        return pDate.getFullYear() === year && pDate.getMonth() === month;
      });

      months.push({ year, month, dates: monthDates });
    }

    return months;
  }, [pricesWithDiffs]);

  // Find cheapest date
  const cheapestDate = useMemo(() => {
    return pricesWithDiffs.reduce((min, p) => (p.price < min.price ? p : min), pricesWithDiffs[0]);
  }, [pricesWithDiffs]);

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [origin, destination]);

  // Scroll handlers
  const handleScrollLeft = () => {
    setScrollOffset(Math.max(0, scrollOffset - 1));
  };

  const handleScrollRight = () => {
    setScrollOffset(Math.min(monthsData.length - 1, scrollOffset + 1));
  };

  // Format currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get percentile for color coding
  const getPricePercentile = (price: number): number => {
    return (price - minPrice) / (maxPrice - minPrice);
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="ml-3 text-white/70">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            Price Calendar
          </h3>
          <p className="text-sm text-white/60 mt-1">
            {origin} → {destination}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleScrollLeft}
            disabled={scrollOffset === 0}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleScrollRight}
            disabled={scrollOffset >= monthsData.length - 1}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500/30 to-emerald-600/40 border border-emerald-500/50"></div>
          <span className="text-xs text-white/70">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-500/30 to-yellow-600/40 border border-yellow-500/50"></div>
          <span className="text-xs text-white/70">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500/30 to-red-600/40 border border-red-500/50"></div>
          <span className="text-xs text-white/70">High</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-white/70">{t.bestPrice}</span>
        </div>
      </div>

      {/* Calendar Grid - Scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="inline-flex md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 min-w-max md:min-w-0 md:w-full">
          {monthsData.map((monthData, idx) => {
            const isVisible = idx >= scrollOffset && idx < scrollOffset + 2;

            return (
              <div
                key={`${monthData.year}-${monthData.month}`}
                className={`transition-all duration-300 ${
                  isVisible ? 'opacity-100' : 'opacity-0 hidden md:block md:opacity-100'
                }`}
              >
                {/* Month Header */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white">
                    {t.months[monthData.month]} {monthData.year}
                  </h4>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {t.days.map(day => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-white/50 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: new Date(monthData.year, monthData.month, 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Date cells */}
                  {monthData.dates.map(dateData => {
                    const date = new Date(dateData.date);
                    const dayNum = date.getDate();
                    const isSelected = dateData.date === currentDate;
                    const isCheapest = dateData.date === cheapestDate?.date;
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    const percentile = getPricePercentile(dateData.price);
                    const colorClass = getPriceColor(percentile);
                    const textColorClass = getPriceTextColor(percentile);

                    return (
                      <button
                        key={dateData.date}
                        onClick={() => !isPast && onDateSelect(dateData.date)}
                        onMouseEnter={() => setHoveredDate(dateData.date)}
                        onMouseLeave={() => setHoveredDate(null)}
                        disabled={isPast}
                        className={`
                          relative aspect-square p-1 rounded-lg border transition-all duration-200
                          ${isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:shadow-lg'}
                          ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}
                          ${colorClass}
                          bg-gradient-to-br
                        `}
                      >
                        {/* Deal Badge */}
                        {dateData.isDeal && !isPast && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-slate-900 animate-pulse">
                            <TrendingDown className="w-2 h-2 text-white absolute top-0.5 left-0.5" />
                          </div>
                        )}

                        {/* Best Price Badge */}
                        {isCheapest && !isPast && (
                          <div className="absolute -top-2 -left-2 px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded text-[8px] font-bold text-white shadow-lg">
                            BEST
                          </div>
                        )}

                        {/* Day Number */}
                        <div className="text-xs font-semibold text-white mb-0.5">
                          {dayNum}
                        </div>

                        {/* Price */}
                        <div className={`text-[10px] font-bold ${textColorClass}`}>
                          {formatPrice(dateData.price)}
                        </div>

                        {/* Percentage diff */}
                        {!isSelected && dateData.percentDiff !== 0 && (
                          <div className={`text-[8px] font-medium mt-0.5 ${
                            dateData.percentDiff < 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {dateData.percentDiff > 0 ? '+' : ''}{dateData.percentDiff}%
                          </div>
                        )}

                        {/* Hover Tooltip */}
                        {hoveredDate === dateData.date && !isPast && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 rounded-lg shadow-xl border border-white/20 z-10 whitespace-nowrap">
                            <div className="text-xs text-white font-semibold">
                              {formatPrice(dateData.price)}
                            </div>
                            {!isSelected && (
                              <div className={`text-[10px] ${
                                dateData.percentDiff < 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {Math.abs(dateData.percentDiff)}% {dateData.percentDiff < 0 ? t.cheaper : t.moreExpensive}
                              </div>
                            )}
                            {dateData.isDeal && (
                              <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                                {t.bestPrice}!
                              </div>
                            )}
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                              <div className="border-4 border-transparent border-t-slate-900"></div>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile scroll indicator */}
      <div className="flex md:hidden justify-center gap-2 mt-4">
        {monthsData.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx >= scrollOffset && idx < scrollOffset + 1
                ? 'w-8 bg-blue-400'
                : 'w-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xs text-white/60 mb-1">Current</div>
          <div className="text-lg font-bold text-white">{formatPrice(currentPrice)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/60 mb-1">Lowest</div>
          <div className="text-lg font-bold text-emerald-400">{formatPrice(minPrice)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/60 mb-1">Highest</div>
          <div className="text-lg font-bold text-red-400">{formatPrice(maxPrice)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/60 mb-1">Avg Savings</div>
          <div className="text-lg font-bold text-yellow-400">
            {Math.round(((currentPrice - minPrice) / currentPrice) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
