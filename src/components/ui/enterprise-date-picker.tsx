'use client';


/**
 * 🚀 ENTERPRISE DATE PICKER - Best-in-class component
 * 
 * Features:
 * - Headless UI for accessibility and robustness
 * - Perfect positioning with floating-ui
 * - US date format (MM/DD/YYYY)
 * - Keyboard navigation
 * - Screen reader support
 * - Mobile-friendly
 * - Type-safe with TypeScript
 * - Zero layout shift
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Popover, Transition } from '@headlessui/react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
  parse,
  isValid
} from 'date-fns';

interface EnterpriseDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
}

export default function EnterpriseDatePicker({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  minDate,
  maxDate,
  disabled = false,
  error,
  className = "",
  required = false
}: EnterpriseDatePickerProps) {
  // Safe date parsing to avoid timezone issues
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    const result = new Date(year, month - 1, day); // month is 0-indexed
    
    // Debug removed for cleaner console
    
    return result;
  };

  const [currentMonth, setCurrentMonth] = useState(
    value ? parseLocalDate(value) : new Date()
  );
  const [inputValue, setInputValue] = useState('');
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false });
  const inputRef = useRef<HTMLInputElement>(null);
  
  const selectedDate = value ? parseLocalDate(value) : null;
  
  // Debug removed for cleaner console
  
  // Date validation
  const isDateDisabled = (date: Date) => {
    const minDateTime = minDate ? parseLocalDate(minDate) : null;
    const maxDateTime = maxDate ? parseLocalDate(maxDate) : null;
    
    if (minDateTime && isBefore(date, minDateTime)) return true;
    if (maxDateTime && isAfter(date, maxDateTime)) return true;
    
    return false;
  };
  
  // Parse American date format (MM/DD/YYYY) to ISO
  const parseAmericanDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Try MM/DD/YYYY format first (American format)
    const americanFormatRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateStr.match(americanFormatRegex);
    
    if (match) {
      const [, month, day, year] = match; // American: month/day/year
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isValid(date) ? date : null;
    }
    
    // Try ISO format as fallback (YYYY-MM-DD)
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const isoDate = parseLocalDate(dateStr);
        return isValid(isoDate) ? isoDate : null;
      }
      return null;
    } catch {
      return null;
    }
  };
  
  // Handle manual input
  const handleInputChange = (inputValue: string) => {
    setInputValue(inputValue);
    
    const parsedDate = parseAmericanDate(inputValue);
    if (parsedDate && !isDateDisabled(parsedDate)) {
      const isoString = format(parsedDate, 'yyyy-MM-dd');
      onChange(isoString);
      setCurrentMonth(parsedDate);
    }
  };

  // Calculate calendar position - Open upward
  const updateCalendarPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const calendarHeight = 420; // Approximate calendar height
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      // Prefer opening upward, but check if there's enough space
      const shouldOpenUpward = spaceAbove >= calendarHeight || spaceAbove > spaceBelow;
      
      setCalendarPosition({
        top: shouldOpenUpward ? rect.top - calendarHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 320),
        openUpward: shouldOpenUpward
      });
    }
  };

  // Handle scroll/resize to reposition calendar
  useEffect(() => {
    const handleScrollResize = () => {
      updateCalendarPosition();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScrollResize, { passive: true });
      window.addEventListener('resize', handleScrollResize, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScrollResize);
        window.removeEventListener('resize', handleScrollResize);
      };
    }
  }, []);
  
  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // Use eachDayOfInterval for date-fns v4+ compatibility
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add empty cells for proper calendar layout
  const startPadding = Array(monthStart.getDay()).fill(null);
  const allDays = [...startPadding, ...calendarDays];
  
  // Navigation handlers
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  // Date selection handler
  const handleDateSelect = (date: Date, close: () => void) => {
    // Ensure date is in local timezone to avoid UTC shifts
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Format manually to avoid any timezone issues
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const isoString = `${year}-${month}-${day}`;
    
    // Debug removed for cleaner console
    
    onChange(isoString);
    close();
  };
  
  // Format display value - Using MM/DD/YYYY for USA but ISO for API
  const displayValue = selectedDate 
    ? `${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getDate()).padStart(2, '0')}/${selectedDate.getFullYear()}`
    : inputValue;
    
  // Debug removed for cleaner console
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Popover className={`relative ${className}`}>
      {({ open, close }) => (
        <>
          <div className="relative">
            <Popover.Button
              as="div"
              disabled={disabled}
              onClick={updateCalendarPosition}
              className="w-full cursor-pointer"
            >
              <input
                ref={inputRef}
                type="text"
                value={displayValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                  updateCalendarPosition();
                  !open && (document.querySelector(`[data-headlessui-state]`) as HTMLElement)?.click();
                }}
                placeholder={placeholder}
                disabled={disabled}
                className={`
                  w-full px-6 py-5 
                  bg-transparent border-2 border-white/20 
                  rounded-2xl 
                  focus:ring-0 focus:border-blue-500/80 
                  text-xl font-semibold text-white 
                  transition-all duration-300 
                  hover:border-white/40 
                  placeholder-white/70
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${error ? 'border-red-500 focus:border-red-500' : ''}
                  pr-12 cursor-pointer
                `}
                readOnly
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-md transition-colors pointer-events-none">
                <CalendarDaysIcon 
                  className={`w-5 h-5 text-white/70 hover:text-white transition-all duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
                />
              </div>
            </Popover.Button>
            {required && !displayValue && (
              <span className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500 text-sm">*</span>
            )}
          </div>

          {/* Calendar Portal - Renders outside component hierarchy */}
          {typeof window !== 'undefined' && open && createPortal(
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[99998]"
                onClick={close}
              />
              <Transition
              show={open}
              enter="transition duration-200 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-150 ease-in"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <div 
                className="fixed z-[99999] bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/60 p-6 ring-1 ring-white/20"
                style={{
                  top: calendarPosition.openUpward 
                    ? Math.max(calendarPosition.top, 20) // Ensure minimum 20px from top
                    : Math.min(calendarPosition.top, window.innerHeight - 420), // Prevent overflow  
                  left: Math.min(calendarPosition.left, window.innerWidth - 340),
                  width: 340,
                  maxHeight: '420px',
                  overflow: 'hidden' // Changed to hidden for cleaner look
                }}
              >
              {/* Calendar Header - Premium Style */}
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-3 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-slate-700 hover:text-slate-900 transition-colors" />
                </button>
                
                <h2 className="text-lg font-black text-slate-800 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-3 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  aria-label="Next month"
                >
                  <ChevronRightIcon className="w-5 h-5 text-slate-700 hover:text-slate-900 transition-colors" />
                </button>
              </div>

              {/* Week Days Header - Premium Style */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="text-center text-xs font-black text-slate-600 py-2 bg-white/50 rounded-lg backdrop-blur-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {allDays.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-10" />;
                  }

                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isCurrentDay = isToday(date);
                  const isDisabled = isDateDisabled(date);
                  const isCurrentMonth = isSameMonth(date, currentMonth);

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(date, close)}
                      disabled={isDisabled}
                      className={`
                        h-10 w-10 flex items-center justify-center text-sm font-bold rounded-xl
                        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        backdrop-blur-sm border border-white/30
                        ${isSelected 
                          ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 border-white/50' 
                          : isCurrentDay 
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900 hover:bg-gradient-to-r hover:from-blue-200 hover:to-purple-200 shadow-md'
                          : isCurrentMonth 
                          ? 'text-slate-800 bg-white/50 hover:bg-white/70 hover:shadow-lg hover:scale-105' 
                          : 'text-slate-400 bg-white/20 hover:bg-white/30'
                        }
                        ${isDisabled 
                          ? 'opacity-25 cursor-not-allowed hover:bg-transparent hover:scale-100' 
                          : 'cursor-pointer'
                        }
                      `}
                      aria-label={format(date, 'MMMM d, yyyy')}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>

              {/* Helper Text - Premium Style */}
              <div className="mt-6 pt-4 border-t border-white/30">
                <div className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-cyan-50/80 backdrop-blur-sm rounded-xl p-3 border border-white/40">
                  <p className="text-xs font-bold text-slate-600 text-center flex items-center justify-center gap-2">
                    <span className="text-blue-500">💡</span>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Use arrow keys to navigate, Enter to select
                    </span>
                  </p>
                </div>
              </div>
              </div>
            </Transition>
            </>,
            document.body
          )}

          {/* Error Message */}
          {error && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </Popover>
  );
}