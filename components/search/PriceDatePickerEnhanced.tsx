'use client';

import { useState } from 'react';
import { PriceCalendar } from '@/components/calendar/PriceCalendar';
import { Calendar } from 'lucide-react';

interface PriceDatePickerEnhancedProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  origin?: string;
  destination?: string;
  adults?: number;
  cabinClass?: string;
  minDate?: string;
  className?: string;
  showCalendarByDefault?: boolean;
}

export function PriceDatePickerEnhanced({
  label,
  value,
  onChange,
  origin,
  destination,
  adults = 1,
  cabinClass = 'economy',
  minDate,
  className = '',
  showCalendarByDefault = false,
}: PriceDatePickerEnhancedProps) {
  const [isOpen, setIsOpen] = useState(showCalendarByDefault);
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleCalendarDateSelect = (dateStr: string) => {
    onChange(dateStr);
    setShowPriceCalendar(false);
  };

  const togglePriceCalendar = () => {
    setShowPriceCalendar(!showPriceCalendar);
  };

  // Determine if we can show the price calendar
  const canShowPriceCalendar = origin && destination && origin.length === 3 && destination.length === 3;

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        {/* Date input */}
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
        <input
          type="date"
          value={value}
          onChange={handleDateChange}
          min={minDate || new Date().toISOString().split('T')[0]}
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-semibold"
          aria-label={label}
        />
      </div>

      {/* View Price Calendar button */}
      {canShowPriceCalendar && (
        <button
          type="button"
          onClick={togglePriceCalendar}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          {showPriceCalendar ? 'Hide' : 'View'} Price Calendar
        </button>
      )}

      {/* Price Calendar Modal/Popup */}
      {showPriceCalendar && canShowPriceCalendar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowPriceCalendar(false)}
          />

          {/* Calendar Modal */}
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Choose Your Date
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPriceCalendar(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close calendar"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Route info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{origin}</span>
                  {' → '}
                  <span className="font-semibold text-gray-900">{destination}</span>
                  <span className="mx-2">•</span>
                  <span>{adults} {adults === 1 ? 'passenger' : 'passengers'}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{cabinClass}</span>
                </div>
              </div>

              {/* Price Calendar */}
              <PriceCalendar
                origin={origin}
                destination={destination}
                selectedDate={value}
                onDateSelect={handleCalendarDateSelect}
                adults={adults}
                cabinClass={cabinClass}
                range={15}
              />

              {/* Close button */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPriceCalendar(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
