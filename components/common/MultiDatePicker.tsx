'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export interface MultiDatePickerProps {
  selectedDates: Date[];
  onDatesChange: (dates: Date[]) => void;
  maxDates?: number;
  minDate?: Date;
  label?: string;  // Optional label above the input field
  headerLabel?: string;  // Label shown in the calendar popup header
  placeholder?: string;
  className?: string;
  isOpen?: boolean;  // Controlled open state
  onOpenChange?: (isOpen: boolean) => void;  // Callback when open state changes
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isWeekend: boolean;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MultiDatePicker({
  selectedDates,
  onDatesChange,
  maxDates = 7,
  minDate = new Date(),
  label = '',
  headerLabel = 'Select Dates',
  placeholder = 'Select dates',
  className = '',
  isOpen: controlledIsOpen,
  onOpenChange,
}: MultiDatePickerProps) {
  // Use controlled state if provided, otherwise use internal state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalIsOpen(value);
    }
  };

  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Initialize currentMonth on client-side only to prevent hydration mismatch
  useEffect(() => {
    if (!currentMonth) {
      setCurrentMonth(new Date());
    }
  }, [currentMonth]);

  // Calculate position relative to anchor element
  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const calculatePosition = () => {
        if (!containerRef.current || !anchorRef.current) return;

        const anchorRect = anchorRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        let top = anchorRect.bottom;
        let left = anchorRect.left;

        // Adjust if calendar goes off-screen horizontally
        if (left + containerRect.width > viewportWidth) {
          left = viewportWidth - containerRect.width - 16;
        }
        if (left < 16) {
          left = 16;
        }

        setPosition({ top, left });
      };

      calculatePosition();
      const timer = setTimeout(calculatePosition, 50);

      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isOpen]);

  // Handle clicks outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatDateString = (date: Date): string => {
    // Use local date components to avoid timezone conversion issues
    // toISOString() converts to UTC which causes off-by-one errors for users in negative UTC timezones
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(createCalendarDay(date, false, today));
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(createCalendarDay(date, true, today));
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(createCalendarDay(date, false, today));
    }

    return days;
  };

  const createCalendarDay = (
    date: Date,
    isCurrentMonth: boolean,
    today: Date
  ): CalendarDay => {
    const isToday = date.getTime() === today.getTime();
    const isDisabled = date < minDate;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Check if this date is in selectedDates
    const isSelected = selectedDates.some(
      selectedDate => selectedDate.getTime() === date.getTime()
    );

    return {
      date,
      isCurrentMonth,
      isToday,
      isSelected,
      isDisabled,
      isWeekend,
    };
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isDisabled) return;

    const dateTime = day.date.getTime();
    const isAlreadySelected = selectedDates.some(d => d.getTime() === dateTime);

    if (isAlreadySelected) {
      // Deselect the date
      onDatesChange(selectedDates.filter(d => d.getTime() !== dateTime));
    } else {
      // Select the date if we haven't reached max
      if (selectedDates.length < maxDates) {
        onDatesChange([...selectedDates, day.date]);
      }
    }
  };

  const handleRemoveDate = (dateToRemove: Date) => {
    onDatesChange(selectedDates.filter(d => d.getTime() !== dateToRemove.getTime()));
  };

  const handleClearAll = () => {
    onDatesChange([]);
  };

  const handlePreviousMonth = () => {
    if (!currentMonth) return;
    setSlideDirection('right');
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
      setSlideDirection(null);
    }, 150);
  };

  const handleNextMonth = () => {
    if (!currentMonth) return;
    setSlideDirection('left');
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
      setSlideDirection(null);
    }, 150);
  };

  const getNextMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1);
  };

  const renderMonth = (monthDate: Date, index: number) => {
    const days = getDaysInMonth(monthDate);
    const monthName = MONTHS[monthDate.getMonth()];
    const year = monthDate.getFullYear();

    return (
      <div
        key={index}
        className={`transition-all duration-300 ${
          slideDirection === 'left'
            ? 'opacity-0 -translate-x-4'
            : slideDirection === 'right'
            ? 'opacity-0 translate-x-4'
            : 'opacity-100 translate-x-0'
        }`}
      >
        {/* Month header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {index === 0 && (
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <div className={`flex-1 text-center font-bold text-gray-900 text-sm ${index === 1 ? 'ml-10' : ''}`}>
            {monthName} {year}
          </div>
          {index === 1 && (
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {index === 0 && <div className="w-10" />}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-1.5"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, dayIndex) => {
            return (
              <button
                key={dayIndex}
                onClick={() => handleDateClick(day)}
                disabled={day.isDisabled}
                className={`
                  relative aspect-square w-full rounded-md transition-all duration-200
                  ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${day.isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                  ${day.isWeekend && day.isCurrentMonth && !day.isDisabled && !day.isSelected ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}
                  ${
                    day.isSelected
                      ? 'bg-[#0087FF] text-white font-semibold shadow-md scale-105 z-10'
                      : 'hover:bg-[#F0F9FF] hover:scale-105 hover:shadow-sm'
                  }
                  ${day.isToday && !day.isSelected ? 'ring-2 ring-[#0087FF] ring-inset' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm font-medium">
                    {day.date.getDate()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Sort dates chronologically for display
  const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());

  // Wait for client-side initialization
  if (!currentMonth) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Selected Dates Display - FIXED HEIGHT, NO VERTICAL GROWTH */}
      <div
        ref={anchorRef}
        className="relative h-[50px] w-full rounded-lg border border-gray-300 bg-white px-4 transition-all hover:border-[#0087FF] focus-within:border-[#0087FF] cursor-pointer overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center h-full gap-2">
          <Calendar className="w-[18px] h-[18px] text-gray-400 flex-shrink-0" />

          {selectedDates.length === 0 ? (
            <span className="text-sm text-gray-500">{placeholder}</span>
          ) : (
            <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
              {sortedDates.map((date, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#0087FF] bg-opacity-10 text-[#0087FF] rounded text-xs font-medium hover:bg-opacity-20 transition-colors flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDate(date);
                  }}
                >
                  <span className="whitespace-nowrap">{format(date, 'MMM d')}</span>
                  <X className="w-3 h-3 cursor-pointer hover:text-[#0077E6]" />
                </div>
              ))}
            </div>
          )}

          {selectedDates.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {selectedDates.length}/{maxDates}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                title="Clear all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Popup - EXACT SAME AS PremiumDatePicker */}
      {isOpen && (
        <>
          {/* Backdrop - Click to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar container */}
          <div
            ref={containerRef}
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 100
            }}
            className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-300 ease-out"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0087FF]" />
                <span className="font-semibold text-gray-900 text-sm">
                  {headerLabel}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close calendar"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Info bar */}
            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  Choose up to {maxDates} dates • {selectedDates.length} selected
                </div>
                {selectedDates.length >= maxDates && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                    Max reached
                  </span>
                )}
              </div>
            </div>

            {/* Calendar grid */}
            <div className="p-4">
              {/* Desktop: side-by-side months */}
              <div className="hidden md:grid md:grid-cols-2 md:gap-4">
                {renderMonth(currentMonth, 0)}
                {renderMonth(getNextMonth(currentMonth), 1)}
              </div>

              {/* Mobile: single month */}
              <div className="md:hidden">
                {renderMonth(currentMonth, 0)}
              </div>

              {/* Selection summary */}
              {selectedDates.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900">Selected dates:</span>{' '}
                    {sortedDates.map((date, index) => (
                      <span key={index}>
                        {date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        {index < sortedDates.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-2 p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-1.5 text-xs font-medium text-white bg-[#0087FF] hover:bg-[#0077E6] rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
