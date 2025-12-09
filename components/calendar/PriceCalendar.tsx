'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { usePriceCalendar, DatePrice } from './hooks/usePriceCalendar';
import { PriceCalendarDay } from './PriceCalendarDay';
import { PriceCalendarLegend } from './PriceCalendarLegend';

interface PriceCalendarProps {
  origin: string;
  destination: string;
  selectedDate: string | null; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  adults?: number;
  cabinClass?: string;
  range?: number; // Days before/after (default: 15)
  className?: string;
}

export function PriceCalendar({
  origin,
  destination,
  selectedDate,
  onDateSelect,
  adults = 1,
  cabinClass = 'economy',
  range = 15,
  className = '',
}: PriceCalendarProps) {
  // Use selected date as center, or today if no date selected
  const centerDate = selectedDate || new Date().toISOString().split('T')[0];

  // Current viewing month (for navigation)
  const [currentMonth, setCurrentMonth] = useState(() => new Date(centerDate));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Fetch calendar data
  const { data, isLoading, error, coverage } = usePriceCalendar({
    origin,
    destination,
    centerDate,
    range,
    adults,
    cabinClass,
    enabled: !!origin && !!destination,
  });

  // Build price map for fast lookup
  const priceMap = useMemo(() => {
    if (!data) return new Map<string, DatePrice>();

    const map = new Map<string, DatePrice>();
    data.dates.forEach(datePrice => {
      map.set(datePrice.date, datePrice);
    });
    return map;
  }, [data]);

  // Determine price levels (quintiles)
  const priceLevels = useMemo(() => {
    if (!data || !data.minPrice || !data.maxPrice) return null;

    const prices = data.dates
      .filter(d => d.available && d.price > 0)
      .map(d => d.price)
      .sort((a, b) => a - b);

    if (prices.length === 0) return null;

    const quintile = (q: number) => {
      const index = Math.floor(prices.length * q);
      return prices[Math.min(index, prices.length - 1)];
    };

    return {
      lowest: data.minPrice,
      low: quintile(0.2),
      medium: quintile(0.5),
      high: quintile(0.8),
      highest: data.maxPrice,
    };
  }, [data]);

  // Get price level for a given price
  const getPriceLevel = (price: number): 'lowest' | 'low' | 'medium' | 'high' | 'highest' | null => {
    if (!priceLevels) return null;

    if (price <= priceLevels.low) return 'lowest';
    if (price <= priceLevels.medium) return 'low';
    if (price <= priceLevels.high) return 'medium';
    if (price < priceLevels.highest) return 'high';
    return 'highest';
  };

  // Generate calendar grid for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateSelect = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    // Haptic feedback for mobile
    if ('vibrate' in navigator) navigator.vibrate(10);
    onDateSelect(dateStr);
  }, [onDateSelect]);

  // Smooth month transition with animation
  const animateMonthChange = useCallback((direction: 'left' | 'right', newMonth: Date) => {
    setTransitionDirection(direction);
    setIsTransitioning(true);

    // Apply the new month after a brief delay for animation
    setTimeout(() => {
      setCurrentMonth(newMonth);
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 150);
  }, []);

  const goToPreviousMonth = useCallback(() => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    animateMonthChange('right', newMonth);
  }, [currentMonth, animateMonthChange]);

  const goToNextMonth = useCallback(() => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    animateMonthChange('left', newMonth);
  }, [currentMonth, animateMonthChange]);

  // Touch swipe handlers for mobile navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNextMonth(); // Swipe left = next month
      } else {
        goToPreviousMonth(); // Swipe right = previous month
      }
    }
    touchStartX.current = null;
  }, [goToNextMonth, goToPreviousMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Premium loading skeleton with staggered animation
  if (isLoading && !data) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-4 md:p-6 ${className}`}>
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-6 w-36 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          {/* Day names */}
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>
          {/* Calendar grid with staggered pulse */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg animate-pulse"
                style={{ animationDelay: `${(i % 7) * 50}ms` }}
              />
            ))}
          </div>
          {/* Legend skeleton */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-10 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to load calendar</h3>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={calendarRef}
      className={`bg-white rounded-2xl shadow-xl p-4 md:p-6 touch-pan-y ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 md:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 active:scale-95 rounded-lg transition-all touch-manipulation"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg md:text-xl font-bold text-gray-900 select-none">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 md:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 active:scale-95 rounded-lg transition-all touch-manipulation"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names - shorter on mobile */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, i) => (
          <div
            key={day}
            className="text-center text-[10px] md:text-xs font-semibold text-gray-500 py-1.5 md:py-2"
          >
            <span className="md:hidden">{day.charAt(0)}</span>
            <span className="hidden md:inline">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid with smooth transition animation */}
      <div
        className={`grid grid-cols-7 gap-1 mb-4 transition-all duration-150 ease-out ${
          isTransitioning
            ? transitionDirection === 'left'
              ? 'opacity-0 -translate-x-4'
              : 'opacity-0 translate-x-4'
            : 'opacity-100 translate-x-0'
        }`}
      >
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = day.toISOString().split('T')[0];
          const priceData = priceMap.get(dateStr) || null;
          const isSelected = selectedDate === dateStr;
          const isToday = day.toDateString() === today.toDateString();
          const isPast = day < today;
          const priceLevel = priceData?.available && priceData.price > 0
            ? getPriceLevel(priceData.price)
            : null;

          return (
            <PriceCalendarDay
              key={dateStr}
              date={day}
              priceData={priceData}
              isSelected={isSelected}
              isToday={isToday}
              isPast={isPast}
              priceLevel={priceLevel}
              onSelect={handleDateSelect}
              currency={data?.currency}
            />
          );
        })}
      </div>

      {/* Legend */}
      <PriceCalendarLegend
        minPrice={data?.minPrice || null}
        maxPrice={data?.maxPrice || null}
        averagePrice={data?.averagePrice || null}
        currency={data?.currency}
        coverage={coverage}
      />

      {/* Savings tip */}
      {data?.cheapestDate && selectedDate !== data.cheapestDate && data.minPrice && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900 mb-0.5">
                Save ${((data.averagePrice || data.minPrice) - data.minPrice).toFixed(0)} by flying on{' '}
                {new Date(data.cheapestDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-green-700">
                Cheapest price: ${data.minPrice.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
