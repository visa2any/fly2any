'use client';

import { useState } from 'react';

interface DatePrice {
  date: Date;
  price: number;
  available: boolean;
}

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
  priceData?: DatePrice[];
}

export function PriceDatePicker({ label, value, onChange, minDate, priceData }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
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
  };

  const getPriceForDate = (date: Date): number | null => {
    if (!priceData) {
      // Generate mock prices for demo
      const basePrice = 200;
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const randomVariation = Math.random() * 200 - 100;
      return Math.round(basePrice + (isWeekend ? 100 : 0) + randomVariation);
    }
    const priceInfo = priceData.find(p => p.date.toDateString() === date.toDateString());
    return priceInfo?.price || null;
  };

  const getPriceLevel = (price: number): 'low' | 'medium' | 'high' => {
    if (price < 250) return 'low';
    if (price < 350) return 'medium';
    return 'high';
  };

  const handleSelectDate = (date: Date) => {
    const formatted = date.toISOString().split('T')[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left flex items-center justify-between bg-white hover:border-gray-400"
      >
        <span className="font-semibold text-lg text-gray-900">
          {value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full mb-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-4 w-full md:w-96">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="font-bold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days with prices */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const price = getPriceForDate(day);
              const priceLevel = price ? getPriceLevel(price) : 'medium';
              const isToday = day.toDateString() === today.toDateString();
              const isSelected = value && day.toDateString() === new Date(value).toDateString();
              const isPast = day < today;
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              const bgColors = {
                low: 'bg-success/10 hover:bg-success/20 border-success/30',
                medium: 'bg-warning/10 hover:bg-warning/20 border-warning/30',
                high: 'bg-error/10 hover:bg-error/20 border-error/30',
              };

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isPast && handleSelectDate(day)}
                  disabled={isPast}
                  className={`aspect-square p-1 rounded-lg border-2 transition-all text-center relative ${
                    isPast
                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                      : isSelected
                      ? 'bg-primary-600 border-primary-600 text-white font-bold'
                      : bgColors[priceLevel]
                  } ${isWeekend && !isPast && !isSelected ? 'ring-1 ring-gray-300' : ''}`}
                >
                  <div className={`text-sm ${isToday && !isSelected ? 'font-bold' : ''} ${!isPast && !isSelected ? 'text-gray-900' : ''}`}>
                    {day.getDate()}
                  </div>
                  {price && !isPast && !isSelected && (
                    <div className="text-[9px] font-semibold mt-0.5 text-gray-700">
                      ${price}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Price legend */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success/20 border border-success/30 rounded"></div>
              <span className="text-gray-600">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning/20 border border-warning/30 rounded"></div>
              <span className="text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-error/20 border border-error/30 rounded"></div>
              <span className="text-gray-600">High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
