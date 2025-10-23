'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

interface PremiumDatePickerProps {
  label?: string;
  value?: string | null;
  returnValue?: string | null;
  onChange: (departure: string, returnDate?: string) => void;
  minDate?: Date;
  type?: 'single' | 'range';
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  prices?: { [date: string]: number };
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
  isWeekend: boolean;
  price?: number;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PremiumDatePicker({
  label,
  value,
  returnValue,
  onChange,
  minDate = new Date(),
  type = 'range',
  isOpen,
  onClose,
  anchorEl,
  prices
}: PremiumDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDeparture, setSelectedDeparture] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [selectedReturn, setSelectedReturn] = useState<Date | null>(
    returnValue ? new Date(returnValue) : null
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Sync state with props when they change
  useEffect(() => {
    if (value) {
      setSelectedDeparture(new Date(value));
    } else {
      setSelectedDeparture(null);
    }
  }, [value]);

  useEffect(() => {
    if (returnValue) {
      setSelectedReturn(new Date(returnValue));
    } else {
      setSelectedReturn(null);
    }
  }, [returnValue]);

  // Calculate position relative to anchor element - ALWAYS BELOW
  useEffect(() => {
    if (isOpen && anchorEl) {
      const calculatePosition = () => {
        if (!containerRef.current) return;

        const anchorRect = anchorEl.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Position flush below the anchor element
        // Using fixed positioning, so we use viewport coordinates directly (no scroll offset needed)
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

      // Calculate position immediately and on a delay to handle rendering
      calculatePosition();
      const timer = setTimeout(calculatePosition, 50);

      // Recalculate on scroll or resize
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isOpen, anchorEl]);

  // Handle clicks outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (!selectedDeparture && !selectedReturn) return;

      const currentDate = selectedReturn || selectedDeparture || new Date();

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          adjustDate(currentDate, -1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          adjustDate(currentDate, 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          adjustDate(currentDate, -7);
          break;
        case 'ArrowDown':
          event.preventDefault();
          adjustDate(currentDate, 7);
          break;
        case 'Enter':
          event.preventDefault();
          handleApply();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedDeparture, selectedReturn]);

  const adjustDate = (baseDate: Date, days: number) => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + days);

    if (newDate < minDate) return;

    if (type === 'single') {
      setSelectedDeparture(newDate);
    } else {
      if (!selectedDeparture || (selectedDeparture && selectedReturn)) {
        setSelectedDeparture(newDate);
        setSelectedReturn(null);
      } else {
        if (newDate > selectedDeparture) {
          setSelectedReturn(newDate);
        } else {
          setSelectedReturn(selectedDeparture);
          setSelectedDeparture(newDate);
        }
      }
    }
  };

  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
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
    const dateStr = formatDateString(date);
    const isToday = date.getTime() === today.getTime();
    const isDisabled = date < minDate;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday

    let isSelected = false;
    let isInRange = false;
    let isRangeStart = false;
    let isRangeEnd = false;

    if (selectedDeparture) {
      const departureTime = selectedDeparture.getTime();
      const dateTime = date.getTime();

      if (type === 'single') {
        isSelected = dateTime === departureTime;
      } else {
        if (selectedReturn) {
          const returnTime = selectedReturn.getTime();
          isRangeStart = dateTime === departureTime;
          isRangeEnd = dateTime === returnTime;
          isInRange = dateTime > departureTime && dateTime < returnTime;
          isSelected = isRangeStart || isRangeEnd;
        } else {
          isSelected = dateTime === departureTime;
          // Show preview range on hover
          if (hoverDate && hoverDate > selectedDeparture) {
            const hoverTime = hoverDate.getTime();
            if (dateTime > departureTime && dateTime <= hoverTime) {
              isInRange = true;
            }
          }
        }
      }
    }

    return {
      date,
      isCurrentMonth,
      isToday,
      isSelected,
      isInRange,
      isRangeStart,
      isRangeEnd,
      isDisabled,
      isWeekend,
      price: prices?.[dateStr]
    };
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isDisabled) return;

    if (type === 'single') {
      // One-way mode: Select date and auto-close
      setSelectedDeparture(day.date);

      // Auto-apply and close after state updates
      setTimeout(() => {
        const departureStr = formatDateString(day.date);
        onChange(departureStr);
        onClose();
      }, 100);
    } else {
      // Range selection logic
      if (!selectedDeparture || (selectedDeparture && selectedReturn)) {
        // Start new selection
        setSelectedDeparture(day.date);
        setSelectedReturn(null);
      } else {
        // Complete the range
        let finalDeparture = selectedDeparture;
        let finalReturn = day.date;

        if (day.date > selectedDeparture) {
          setSelectedReturn(day.date);
        } else if (day.date < selectedDeparture) {
          // Swap dates if return is before departure
          setSelectedReturn(selectedDeparture);
          setSelectedDeparture(day.date);
          finalDeparture = day.date;
          finalReturn = selectedDeparture;
        } else {
          // Same date clicked - start new selection
          setSelectedDeparture(day.date);
          setSelectedReturn(null);
          return; // Don't auto-close
        }

        // Round-trip mode: Auto-apply and close after selecting both dates
        setTimeout(() => {
          const departureStr = formatDateString(finalDeparture);
          const returnStr = formatDateString(finalReturn);
          onChange(departureStr, returnStr);
          onClose();
        }, 100);
      }
    }
  };

  const handlePreviousMonth = () => {
    setSlideDirection('right');
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
      setSlideDirection(null);
    }, 150);
  };

  const handleNextMonth = () => {
    setSlideDirection('left');
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
      setSlideDirection(null);
    }, 150);
  };

  const handleClear = () => {
    setSelectedDeparture(null);
    setSelectedReturn(null);
  };

  const handleApply = () => {
    if (selectedDeparture) {
      const departureStr = formatDateString(selectedDeparture);
      const returnStr = selectedReturn ? formatDateString(selectedReturn) : undefined;
      onChange(departureStr, returnStr);
      onClose();
    }
  };

  const getNextMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1);
  };

  // Quick date shortcuts
  const handleQuickDate = (type: 'weekend' | 'nextWeek' | 'nextMonth' | 'flexible') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (type) {
      case 'weekend':
        // Next weekend (Friday to Sunday)
        const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
        const friday = new Date(today);
        friday.setDate(today.getDate() + daysUntilFriday);
        const sunday = new Date(friday);
        sunday.setDate(friday.getDate() + 2);
        setSelectedDeparture(friday);
        setSelectedReturn(sunday);
        break;

      case 'nextWeek':
        // Next Monday for 7 days
        const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() + daysUntilMonday);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);
        setSelectedDeparture(monday);
        setSelectedReturn(nextMonday);
        break;

      case 'nextMonth':
        // 30 days from now
        const departure = new Date(today);
        departure.setDate(today.getDate() + 7);
        const returnDate = new Date(departure);
        returnDate.setDate(departure.getDate() + 30);
        setSelectedDeparture(departure);
        setSelectedReturn(returnDate);
        break;

      case 'flexible':
        // 3 days from now for a week
        const flexDeparture = new Date(today);
        flexDeparture.setDate(today.getDate() + 3);
        const flexReturn = new Date(flexDeparture);
        flexReturn.setDate(flexDeparture.getDate() + 7);
        setSelectedDeparture(flexDeparture);
        setSelectedReturn(flexReturn);
        break;
    }
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
            const isHovered = hoverDate?.getTime() === day.date.getTime();

            return (
              <button
                key={dayIndex}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => !day.isDisabled && setHoverDate(day.date)}
                onMouseLeave={() => setHoverDate(null)}
                disabled={day.isDisabled}
                className={`
                  relative aspect-square w-full rounded-md transition-all duration-200
                  ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${day.isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                  ${day.isWeekend && day.isCurrentMonth && !day.isDisabled && !day.isSelected ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}
                  ${
                    day.isSelected
                      ? 'bg-[#0087FF] text-white font-semibold shadow-md scale-105 z-10'
                      : day.isInRange
                      ? 'bg-gradient-to-r from-[#E6F3FF] to-[#CCE7FF]'
                      : isHovered && !day.isDisabled
                      ? 'bg-[#F0F9FF] scale-105 shadow-sm'
                      : 'hover:bg-[#F0F9FF]'
                  }
                  ${day.isRangeStart ? 'rounded-r-none' : ''}
                  ${day.isRangeEnd ? 'rounded-l-none' : ''}
                  ${day.isToday && !day.isSelected ? 'ring-2 ring-[#0087FF] ring-inset' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm font-medium">
                    {day.date.getDate()}
                  </span>
                  {day.price && day.isCurrentMonth && !day.isDisabled && (
                    <span
                      className={`text-[10px] mt-0.5 ${
                        day.isSelected ? 'text-white' : 'text-[#0087FF]'
                      } font-medium`}
                    >
                      ${day.price}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />

      {/* Calendar container - positioned fixed relative to viewport */}
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
              {label || (type === 'single' ? 'Select Date' : 'Select Dates')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close calendar"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Quick date shortcuts */}
        {type === 'range' && (
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickDate('weekend')}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
              >
                This Weekend
              </button>
              <button
                onClick={() => handleQuickDate('nextWeek')}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
              >
                Next Week
              </button>
              <button
                onClick={() => handleQuickDate('nextMonth')}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
              >
                Next Month
              </button>
              <button
                onClick={() => handleQuickDate('flexible')}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
              >
                Flexible (±3)
              </button>
            </div>
          </div>
        )}

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
          {(selectedDeparture || selectedReturn) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-2">
                {type === 'single' ? (
                  <div>
                    <span className="font-medium text-gray-900">Selected:</span>{' '}
                    {selectedDeparture?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {selectedDeparture && (
                      <div>
                        <span className="font-medium text-gray-900">Depart:</span>{' '}
                        {selectedDeparture.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                    {selectedReturn && (
                      <div>
                        <span className="font-medium text-gray-900">Return:</span>{' '}
                        {selectedReturn.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedDeparture || (type === 'range' && !selectedReturn)}
            className="px-5 py-1.5 text-xs font-medium text-white bg-[#0087FF] hover:bg-[#0077E6] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
