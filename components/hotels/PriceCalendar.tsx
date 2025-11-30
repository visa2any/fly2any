'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface PriceData {
  date: string;
  price: number;
  available: boolean;
  trend?: 'up' | 'down' | 'stable';
  cheapest?: boolean;
}

interface PriceCalendarProps {
  hotelId?: string;
  latitude: number;
  longitude: number;
  basePrice?: number;
  currency?: string;
  nights?: number;
  adults?: number;
  children?: number;
  onDateSelect?: (checkin: string, checkout: string, price: number) => void;
  className?: string;
}

export function PriceCalendar({
  hotelId,
  latitude,
  longitude,
  basePrice = 0,
  currency = 'USD',
  nights = 1,
  adults = 2,
  children = 0,
  onDateSelect,
  className = '',
}: PriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [priceData, setPriceData] = useState<Map<string, PriceData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState<string | null>(null);
  const [selectedCheckout, setSelectedCheckout] = useState<string | null>(null);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{ date: Date | null; isCurrentMonth: boolean }> = [];

    // Previous month padding
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding
    const remainingDays = 42 - days.length;
    for (let i = 0; i < remainingDays; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  // Simulate price fetching (in production, this would call the API)
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);

      // Generate simulated prices for demonstration
      // In production, this would call /api/hotels/calendar-rates
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const newPriceData = new Map<string, PriceData>();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Base price variation factors
      const weekendMultiplier = 1.2;
      const demandVariation = 0.15;

      let minPrice = Infinity;
      const prices: { date: string; price: number }[] = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dateStr = date.toISOString().split('T')[0];

        // Skip past dates
        if (date < today) {
          newPriceData.set(dateStr, {
            date: dateStr,
            price: 0,
            available: false,
          });
          continue;
        }

        // Calculate price variation
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
        const randomVariation = 1 + (Math.random() - 0.5) * demandVariation * 2;

        let price = basePrice || 150;
        price *= isWeekend ? weekendMultiplier : 1;
        price *= randomVariation;
        price = Math.round(price);

        if (price < minPrice) minPrice = price;
        prices.push({ date: dateStr, price });

        newPriceData.set(dateStr, {
          date: dateStr,
          price,
          available: true,
        });
      }

      // Mark cheapest dates and add trends
      let prevPrice = 0;
      for (const { date, price } of prices) {
        const data = newPriceData.get(date);
        if (data && data.available) {
          data.cheapest = price === minPrice;
          data.trend = prevPrice === 0 ? 'stable' :
            price > prevPrice * 1.05 ? 'up' :
              price < prevPrice * 0.95 ? 'down' : 'stable';
          prevPrice = price;
        }
      }

      setPriceData(newPriceData);
      setLoading(false);
    };

    fetchPrices();
  }, [currentMonth, basePrice]);

  // Get cheapest dates
  const cheapestDates = useMemo(() => {
    const available = Array.from(priceData.values())
      .filter(d => d.available && d.price > 0)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
    return available;
  }, [priceData]);

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const data = priceData.get(dateStr);

    if (!data?.available) return;

    if (!selectedCheckin || (selectedCheckin && selectedCheckout)) {
      // Start new selection
      setSelectedCheckin(dateStr);
      setSelectedCheckout(null);
    } else {
      // Complete selection
      if (new Date(dateStr) > new Date(selectedCheckin)) {
        setSelectedCheckout(dateStr);

        // Calculate total price for the stay
        const checkinDate = new Date(selectedCheckin);
        const checkoutDate = new Date(dateStr);
        let totalPrice = 0;
        const current = new Date(checkinDate);

        while (current < checkoutDate) {
          const currentStr = current.toISOString().split('T')[0];
          const dayData = priceData.get(currentStr);
          if (dayData?.price) totalPrice += dayData.price;
          current.setDate(current.getDate() + 1);
        }

        onDateSelect?.(selectedCheckin, dateStr, totalPrice);
      } else {
        // Reset and start new selection
        setSelectedCheckin(dateStr);
        setSelectedCheckout(null);
      }
    }
  };

  const isInRange = (date: Date) => {
    if (!selectedCheckin || !selectedCheckout) return false;
    const dateStr = date.toISOString().split('T')[0];
    return dateStr > selectedCheckin && dateStr < selectedCheckout;
  };

  const formatPrice = (price: number) => {
    if (currency === 'USD') return `$${price}`;
    return `${price} ${currency}`;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Price Calendar</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingDown className="w-4 h-4 text-green-500" />
          <span>Lowest prices highlighted</span>
        </div>
      </div>

      {/* Cheapest Dates Banner */}
      {cheapestDates.length > 0 && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-100 flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-green-700">
            <strong>Best prices:</strong>{' '}
            {cheapestDates.map((d, i) => (
              <span key={d.date}>
                {i > 0 && ', '}
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' '}({formatPrice(d.price)})
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Month Navigation */}
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={currentMonth <= new Date()}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h4 className="font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 pb-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day.date) {
                return <div key={index} className="h-16" />;
              }

              const dateStr = day.date.toISOString().split('T')[0];
              const data = priceData.get(dateStr);
              const isSelected = dateStr === selectedCheckin || dateStr === selectedCheckout;
              const inRange = isInRange(day.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = day.date < today;

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day.date!)}
                  disabled={!data?.available}
                  className={`h-16 rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : inRange
                        ? 'bg-blue-100 text-blue-800'
                        : data?.cheapest
                          ? 'bg-green-50 border-2 border-green-300 hover:bg-green-100'
                          : data?.available
                            ? 'hover:bg-gray-100'
                            : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className={`font-medium ${isPast ? 'text-gray-400' : ''}`}>
                    {day.date.getDate()}
                  </span>
                  {data?.available && data.price > 0 && (
                    <span className={`text-xs ${
                      isSelected ? 'text-blue-100' :
                        data.cheapest ? 'text-green-600 font-semibold' : 'text-gray-500'
                    }`}>
                      {formatPrice(data.price)}
                    </span>
                  )}
                  {data?.trend && data.available && (
                    <div className="mt-0.5">
                      {data.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-500" />}
                      {data.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedCheckin && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600">Check-in: </span>
              <span className="font-medium text-gray-900">
                {new Date(selectedCheckin).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              {selectedCheckout && (
                <>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="text-gray-600">Check-out: </span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedCheckout).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </>
              )}
            </div>
            {!selectedCheckout && (
              <span className="text-blue-600 text-xs">Select checkout date</span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-200 border border-green-400"></div>
          <span>Cheapest</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-green-500" />
          <span>Price dropped</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-red-400" />
          <span>Price increased</span>
        </div>
      </div>
    </div>
  );
}

export default PriceCalendar;
