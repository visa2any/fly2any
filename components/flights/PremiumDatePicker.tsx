'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

interface PremiumDatePickerProps {
  label?: string;
  value?: string | null;
  returnValue?: string | null;
  onChange: (departure: string, returnDate?: string) => void;
  minDate?: Date;
  type?: 'single' | 'range' | 'multi';
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  prices?: { [date: string]: number };
  loadingPrices?: boolean;
  // Multi-date selection props
  selectedDates?: Date[];
  onMultiChange?: (dates: Date[]) => void;
  maxDates?: number;
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

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_OF_WEEK_FULL = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PremiumDatePicker({
  label,
  value,
  returnValue,
  onChange,
  minDate, // No default - allow selecting any date unless explicitly restricted
  type = 'range',
  isOpen,
  onClose,
  anchorEl,
  prices,
  loadingPrices = false,
  // Multi-date props
  selectedDates: initialSelectedDates = [],
  onMultiChange,
  maxDates = 3
}: PremiumDatePickerProps) {
  // Helper to parse date string without timezone conversion
  // "2024-12-03" should create Dec 3 in LOCAL timezone, not UTC
  const parseDateString = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    // Parse YYYY-MM-DD format and create date in local timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [selectedDeparture, setSelectedDeparture] = useState<Date | null>(
    parseDateString(value)
  );
  const [selectedReturn, setSelectedReturn] = useState<Date | null>(
    parseDateString(returnValue)
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Multi-date selection state
  const [multiDates, setMultiDates] = useState<Date[]>(initialSelectedDates);

  // Initialize currentMonth on client-side only to prevent hydration mismatch
  useEffect(() => {
    if (!currentMonth) {
      setCurrentMonth(new Date());
    }
  }, [currentMonth]);

  // Sync state with props when they change
  useEffect(() => {
    setSelectedDeparture(parseDateString(value));
  }, [value]);

  useEffect(() => {
    setSelectedReturn(parseDateString(returnValue));
  }, [returnValue]);

  // Sync multi-dates with prop
  useEffect(() => {
    if (type === 'multi') {
      setMultiDates(initialSelectedDates);
    }
  }, [initialSelectedDates, type]);

  // Helper to check if a date is in multi-selection
  const isDateInMulti = (date: Date): boolean => {
    return multiDates.some(d =>
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  };

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

    if (minDate && newDate < minDate) return;

    if (type === 'single') {
      setSelectedDeparture(newDate);
    } else {
      if (!selectedDeparture || (selectedDeparture && selectedReturn)) {
        setSelectedDeparture(newDate);
        setSelectedReturn(null);
      } else {
        // Return date must be after departure date (at least 1 day)
        if (newDate > selectedDeparture) {
          setSelectedReturn(newDate);
        } else {
          // Invalid return date - start new selection
          setSelectedDeparture(newDate);
          setSelectedReturn(null);
        }
      }
    }
  };

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
    const dateStr = formatDateString(date);
    const isToday = date.getTime() === today.getTime();
    // Always disable past dates, and respect minDate if provided (e.g., departure date for return picker)
    const isPastDate = date < today;
    const isBelowMinDate = minDate ? date < minDate : false;
    const isDisabled = isPastDate || isBelowMinDate;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday

    let isSelected = false;
    let isInRange = false;
    let isRangeStart = false;
    let isRangeEnd = false;

    if (type === 'multi') {
      // Multi-date mode: check if date is in selection
      isSelected = isDateInMulti(date);
    } else if (selectedDeparture) {
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

    if (type === 'multi') {
      // Multi-date mode: Toggle date selection
      const dateExists = isDateInMulti(day.date);

      if (dateExists) {
        // Remove date from selection
        const newDates = multiDates.filter(d =>
          !(d.getFullYear() === day.date.getFullYear() &&
            d.getMonth() === day.date.getMonth() &&
            d.getDate() === day.date.getDate())
        );
        setMultiDates(newDates);
      } else {
        // Add date if under max limit
        if (multiDates.length < maxDates) {
          const newDates = [...multiDates, day.date].sort((a, b) => a.getTime() - b.getTime());
          setMultiDates(newDates);
        }
      }
    } else if (type === 'single') {
      // One-way mode: Select date and wait for Apply button
      setSelectedDeparture(day.date);
      // User must click Apply - consistent with other modes
    } else {
      // Range selection logic
      if (!selectedDeparture || (selectedDeparture && selectedReturn)) {
        // Start new selection
        setSelectedDeparture(day.date);
        setSelectedReturn(null);
      } else {
        // Complete the range - checkout must be at least 1 day after checkin
        // Clicking on departure date or earlier starts a new selection
        if (day.date > selectedDeparture) {
          // Valid return date - at least 1 day after departure
          setSelectedReturn(day.date);

          const finalDeparture = selectedDeparture;
          const finalReturn = day.date;

          // Round-trip mode: Auto-apply and close after selecting both dates
          setTimeout(() => {
            const departureStr = formatDateString(finalDeparture);
            const returnStr = formatDateString(finalReturn);
            onChange(departureStr, returnStr);
            onClose();
          }, 100);
        } else {
          // Invalid return date (same day or earlier) - start new selection
          // This prevents customers from accidentally selecting checkout before checkin
          setSelectedDeparture(day.date);
          setSelectedReturn(null);
          // Don't auto-close - user needs to select return date
        }
      }
    }
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

  const handleClear = () => {
    setSelectedDeparture(null);
    setSelectedReturn(null);
    if (type === 'multi') {
      setMultiDates([]);
    }
  };

  const handleApply = () => {
    if (type === 'multi') {
      // Multi-date mode: call onMultiChange
      if (onMultiChange && multiDates.length > 0) {
        onMultiChange(multiDates);
        onClose();
      }
    } else if (selectedDeparture) {
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
        <div className="flex items-center justify-between mb-2 px-1">
          {index === 0 && (
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <div className={`flex-1 text-center ${index === 1 ? 'ml-10' : ''}`}>
            <div className="font-bold text-gray-900 text-sm">
              {monthName} {year}
            </div>
            {loadingPrices && index === 0 && (
              <div className="text-xs text-slate-500 mt-0.5 animate-pulse">
                Loading prices...
              </div>
            )}
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
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-1"
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
                  ${day.isWeekend && day.isCurrentMonth && !day.isDisabled && !day.isSelected ? 'bg-gradient-to-br from-info-50 to-primary-50' : ''}
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
                <div className="flex flex-col items-center justify-center h-full gap-0.5">
                  <span className={`text-sm font-medium ${
                    day.price && day.isCurrentMonth && !day.isDisabled
                      ? 'mb-0.5'
                      : ''
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {day.price && day.isCurrentMonth && !day.isDisabled && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-medium tracking-normal ${
                        day.isSelected
                          ? 'bg-white/90 text-[#0087FF] shadow-sm'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      } transition-all duration-200`}
                    >
                      $ {Math.round(day.price)}
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
  if (!currentMonth) return null; // Wait for client-side initialization

  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Backdrop - darker on mobile for bottom sheet effect */}
      <div
        className="fixed inset-0 z-modal-backdrop bg-black/30 md:bg-transparent"
        onClick={onClose}
      />

      {/* Calendar container - Centered modal on mobile, positioned dropdown on desktop */}
      <div
        ref={containerRef}
        style={isMobile ? {
          position: 'fixed',
          left: '0.5rem',
          right: '0.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1400,
          maxWidth: 'calc(100vw - 1rem)'
        } : {
          position: 'fixed',
          top: `${position.top}px`,
          left: `${Math.max(8, Math.min(position.left, window.innerWidth - 360))}px`,
          zIndex: 1400,
          maxWidth: 'min(95vw, 700px)'
        }}
        className={`
          bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100
          animate-in duration-300 ease-out
          ${isMobile
            ? 'rounded-2xl max-h-[80vh] overflow-y-auto slide-in-from-bottom-2'
            : 'rounded-xl fade-in slide-in-from-top-1'
          }
        `}
      >
        {/* Mobile Drag Handle - Apple-class */}
        <div className="md:hidden w-8 h-1 bg-neutral-300 rounded-full mx-auto mt-1.5 mb-0.5" />

        {/* Header - Apple-Class Ultra Compact */}
        <div className="flex items-center justify-between px-3 py-1 border-b border-neutral-100 sticky top-0 md:static bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-500" />
            <span className="font-semibold text-neutral-800 text-[13px]">
              {label || (type === 'single' ? 'Select Date' : 'Select Dates')}
              {type === 'multi' && (
                <span className="text-[9px] text-primary-500 font-medium ml-1">(max 3)</span>
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors active:scale-95"
            aria-label="Close calendar"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Quick date shortcuts - Apple-Class Compact */}
        {type === 'range' && (
          <div className="px-2 py-1 border-b border-neutral-100 md:hidden">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              <button onClick={() => handleQuickDate('weekend')} className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-600 rounded-full whitespace-nowrap active:scale-95 hover:bg-primary-50 hover:text-primary-600 transition-colors">Weekend</button>
              <button onClick={() => handleQuickDate('nextWeek')} className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-600 rounded-full whitespace-nowrap active:scale-95 hover:bg-primary-50 hover:text-primary-600 transition-colors">Next Week</button>
              <button onClick={() => handleQuickDate('nextMonth')} className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-600 rounded-full whitespace-nowrap active:scale-95 hover:bg-primary-50 hover:text-primary-600 transition-colors">Month</button>
              <button onClick={() => handleQuickDate('flexible')} className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-600 rounded-full whitespace-nowrap active:scale-95 hover:bg-primary-50 hover:text-primary-600 transition-colors">±3 Days</button>
            </div>
          </div>
        )}

        {/* Calendar grid */}
        <div className="p-2 md:p-3">
          {/* Desktop: side-by-side months */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-3">
            {renderMonth(currentMonth, 0)}
            {renderMonth(getNextMonth(currentMonth), 1)}
          </div>

          {/* Mobile: Apple-Class Ultra-Compact Single Month */}
          <div className="md:hidden">
            {/* Month Navigation - Apple-Class Minimal */}
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={handlePreviousMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200 active:scale-95 transition-all touch-manipulation"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-600" />
              </button>
              <h3 className="text-[13px] font-bold text-neutral-800 tracking-tight">
                {MONTHS_SHORT[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200 active:scale-95 transition-all touch-manipulation"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>
            </div>

            {/* Day headers - Apple-Class Minimal */}
            <div className="grid grid-cols-7">
              {DAYS_OF_WEEK.map((day, i) => (
                <div
                  key={`mobile-${day}-${i}`}
                  className={`text-center text-[9px] font-semibold py-0.5 ${
                    i === 0 || i === 6 ? 'text-primary-500' : 'text-neutral-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid - Apple-Class 36px cells */}
            <div className="grid grid-cols-7 gap-[1px]">
              {getDaysInMonth(currentMonth).map((day, dayIndex) => {
                const isMultiSelected = type === 'multi' && isDateInMulti(day.date);
                return (
                  <button
                    key={`mobile-day-${dayIndex}`}
                    onClick={() => handleDateClick(day)}
                    disabled={day.isDisabled}
                    className={`
                      relative min-h-[36px] transition-all duration-100
                      flex flex-col items-center justify-center
                      ${!day.isCurrentMonth ? 'opacity-15' : ''}
                      ${day.isDisabled ? 'cursor-not-allowed opacity-25' : 'cursor-pointer active:scale-95'}
                      ${day.isSelected || isMultiSelected
                        ? 'bg-primary-500 text-white rounded-[10px] shadow-sm'
                        : day.isInRange
                        ? 'bg-primary-100/70'
                        : day.isToday
                        ? 'bg-primary-50 rounded-[10px] ring-1 ring-primary-400'
                        : day.isWeekend && day.isCurrentMonth
                        ? 'bg-neutral-50'
                        : 'hover:bg-neutral-100 rounded-[10px]'
                      }
                      ${day.isRangeStart && !day.isRangeEnd ? 'rounded-l-[10px] rounded-r-none' : ''}
                      ${day.isRangeEnd && !day.isRangeStart ? 'rounded-r-[10px] rounded-l-none' : ''}
                      ${day.isInRange && !day.isRangeStart && !day.isRangeEnd ? 'rounded-none' : ''}
                      touch-manipulation
                    `}
                  >
                    <span className={`text-[13px] font-semibold leading-none ${
                      day.isSelected || isMultiSelected ? 'text-white' : day.isCurrentMonth ? 'text-neutral-800' : 'text-neutral-300'
                    }`}>
                      {day.date.getDate()}
                    </span>
                    {day.price && day.isCurrentMonth && !day.isDisabled && (
                      <span className={`text-[7px] font-bold leading-none mt-px ${
                        day.isSelected || isMultiSelected ? 'text-white/80' : 'text-success-600'
                      }`}>
                        ${Math.round(day.price)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection Summary - Apple-Class Compact Card */}
          {(selectedDeparture || selectedReturn || (type === 'multi' && multiDates.length > 0)) && (
            <div className="mt-1.5 p-1.5 bg-neutral-50 rounded-xl border border-neutral-100 md:mt-3 md:mx-1 md:p-2.5">
              <div className="text-xs">
                {type === 'multi' ? (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-primary-500" />
                      <span className="font-semibold text-neutral-700 text-[10px]">Selected ({multiDates.length}/{maxDates})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {multiDates.map((date, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white text-primary-600 font-semibold text-[9px] shadow-sm"
                        >
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : type === 'single' ? (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    <div>
                      <div className="font-semibold text-neutral-800 text-[11px]">
                        {selectedDeparture?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {selectedDeparture && (
                      <div className="flex-1 text-center px-2 py-1 bg-emerald-50 rounded-lg">
                        <div className="text-[8px] text-emerald-600 font-medium uppercase tracking-wide">Check-in</div>
                        <div className="font-bold text-neutral-800 text-[11px]">
                          {selectedDeparture.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    )}
                    {selectedDeparture && (
                      <div className="text-neutral-300 font-bold text-[10px]">→</div>
                    )}
                    {selectedReturn ? (
                      <div className="flex-1 text-center px-2 py-1 bg-orange-50 rounded-lg">
                        <div className="text-[8px] text-orange-600 font-medium uppercase tracking-wide">Check-out</div>
                        <div className="font-bold text-neutral-800 text-[11px]">
                          {selectedReturn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 text-center px-2 py-1 bg-neutral-100 rounded-lg">
                        <div className="text-[8px] text-neutral-400 font-medium uppercase tracking-wide">Check-out</div>
                        <div className="text-[10px] text-neutral-400">Select</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions - Apple-Class Compact */}
        <div className="flex items-center gap-2 px-3 py-1.5 md:p-2.5 border-t border-neutral-100 bg-white/95 backdrop-blur-sm rounded-b-2xl md:rounded-b-xl">
          <button
            onClick={handleClear}
            className="px-3 py-2 md:py-1.5 text-[11px] font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all active:scale-95 touch-manipulation"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            disabled={
              type === 'multi'
                ? multiDates.length === 0
                : (!selectedDeparture || (type === 'range' && !selectedReturn))
            }
            className="flex-1 py-2 md:py-1.5 text-[12px] font-bold text-white bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm active:scale-[0.98] touch-manipulation"
          >
            {type === 'range' && !selectedReturn && selectedDeparture
              ? 'Select Check-out'
              : type === 'multi' && multiDates.length > 0
              ? `Done (${multiDates.length})`
              : 'Done'
            }
          </button>
        </div>
      </div>
    </>
  );
}
