'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, addDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  lang?: 'en' | 'pt' | 'es';
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const translations = {
  en: {
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    selectCheckIn: 'Select check-in',
    selectCheckOut: 'Select check-out',
    nights: 'nights',
    night: 'night',
    clear: 'Clear',
    done: 'Done',
  },
  pt: {
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    selectCheckIn: 'Selecione entrada',
    selectCheckOut: 'Selecione saída',
    nights: 'noites',
    night: 'noite',
    clear: 'Limpar',
    done: 'Feito',
  },
  es: {
    checkIn: 'Entrada',
    checkOut: 'Salida',
    selectCheckIn: 'Seleccionar entrada',
    selectCheckOut: 'Seleccionar salida',
    nights: 'noches',
    night: 'noche',
    clear: 'Limpiar',
    done: 'Listo',
  },
};

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  lang = 'en',
  minDate,
  maxDate,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [tempRange, setTempRange] = useState<DateRange | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  // Parse dates
  const checkInDate = checkIn ? new Date(checkIn + 'T00:00:00') : undefined;
  const checkOutDate = checkOut ? new Date(checkOut + 'T00:00:00') : undefined;
  const today = startOfDay(new Date());
  const effectiveMinDate = minDate || today;

  // Calculate nights
  const nights = checkInDate && checkOutDate
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Initialize temp range when opening
  useEffect(() => {
    if (isOpen) {
      setTempRange({
        from: checkInDate,
        to: checkOutDate,
      });
      // If no check-in, start with check-in selection
      setSelectionMode(checkInDate ? 'checkOut' : 'checkIn');
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle date selection
  const handleSelect = useCallback((range: DateRange | undefined) => {
    if (!range) return;

    if (selectionMode === 'checkIn') {
      // User is selecting check-in date
      if (range.from) {
        setTempRange({ from: range.from, to: undefined });
        onCheckInChange(format(range.from, 'yyyy-MM-dd'));
        onCheckOutChange(''); // Clear checkout when changing check-in
        // Automatically switch to checkout selection - calendar STAYS OPEN!
        setSelectionMode('checkOut');
        // DO NOT CLOSE CALENDAR - user must select checkout
      }
    } else {
      // User is selecting check-out date
      // The user must pick a date AFTER check-in
      if (range.from && !range.to) {
        // User clicked a single date while in checkout mode
        const clickedDate = range.from;
        if (tempRange?.from && isAfter(clickedDate, tempRange.from)) {
          // Valid checkout date selected
          setTempRange({ from: tempRange.from, to: clickedDate });
          onCheckOutChange(format(clickedDate, 'yyyy-MM-dd'));
          // ONLY NOW close the calendar - after both dates selected
          setTimeout(() => setIsOpen(false), 200);
        }
      } else if (range.to && range.from) {
        // Ensure checkout is after checkin
        if (isAfter(range.to, range.from)) {
          setTempRange(range);
          onCheckOutChange(format(range.to, 'yyyy-MM-dd'));
          // Close calendar after both dates selected
          setTimeout(() => setIsOpen(false), 200);
        }
      }
    }
  }, [selectionMode, tempRange, onCheckInChange, onCheckOutChange]);

  // Get disabled dates for checkout (all dates <= checkin)
  const disabledDays = useCallback(() => {
    const disabled: any[] = [];

    // Always disable dates before today (no past dates ever)
    disabled.push({ before: effectiveMinDate });

    // CRITICAL: In checkout mode, disable dates ON OR BEFORE checkin
    // This prevents selecting same day or earlier for checkout
    if (selectionMode === 'checkOut' && tempRange?.from) {
      // Disable everything up to and including check-in date
      // Only dates AFTER check-in are selectable
      disabled.push({ before: addDays(tempRange.from, 1) });
      // Also explicitly disable the check-in date itself
      disabled.push(tempRange.from);
    }

    // Disable dates after maxDate if specified
    if (maxDate) {
      disabled.push({ after: maxDate });
    }

    return disabled;
  }, [selectionMode, tempRange?.from, effectiveMinDate, maxDate]);

  // Clear dates
  const handleClear = () => {
    setTempRange(undefined);
    onCheckInChange('');
    onCheckOutChange('');
    setSelectionMode('checkIn');
  };

  // Format display date
  const formatDisplayDate = (date: Date | undefined, placeholder: string) => {
    if (!date) return placeholder;
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-all shadow-sm"
      >
        <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {/* Check-in */}
          <div className="flex-1 text-left">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{t.checkIn}</div>
            <div className={`text-sm font-bold truncate ${checkInDate ? 'text-gray-900' : 'text-gray-400'}`}>
              {formatDisplayDate(checkInDate, t.selectCheckIn)}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 px-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Check-out */}
          <div className="flex-1 text-left">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{t.checkOut}</div>
            <div className={`text-sm font-bold truncate ${checkOutDate ? 'text-gray-900' : 'text-gray-400'}`}>
              {formatDisplayDate(checkOutDate, t.selectCheckOut)}
            </div>
          </div>
        </div>

        {/* Nights badge */}
        {nights > 0 && (
          <div className="flex-shrink-0 px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
            {nights} {nights === 1 ? t.night : t.nights}
          </div>
        )}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSelectionMode('checkIn')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  selectionMode === 'checkIn'
                    ? 'bg-white/25 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.checkIn}: {tempRange?.from ? format(tempRange.from, 'MMM d') : '—'}
              </button>
              <ChevronRight className="w-4 h-4 text-white/50" />
              <button
                type="button"
                onClick={() => tempRange?.from && setSelectionMode('checkOut')}
                disabled={!tempRange?.from}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  selectionMode === 'checkOut'
                    ? 'bg-white/25 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {t.checkOut}: {tempRange?.to ? format(tempRange.to, 'MMM d') : '—'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selection Mode Indicator */}
          <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
            <p className="text-sm text-orange-700 font-medium text-center">
              {selectionMode === 'checkIn'
                ? '👆 Select your check-in date'
                : '👆 Now select your check-out date'}
            </p>
          </div>

          {/* Calendar */}
          <div className="p-4">
            <DayPicker
              mode="range"
              selected={tempRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={disabledDays()}
              fromMonth={effectiveMinDate}
              toMonth={maxDate}
              showOutsideDays={false}
              classNames={{
                months: 'flex flex-col sm:flex-row gap-4',
                month: 'flex-1',
                caption: 'flex justify-center items-center h-10 relative',
                caption_label: 'text-sm font-bold text-gray-900',
                nav: 'flex items-center gap-1',
                nav_button: 'p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell: 'flex-1 text-gray-500 font-medium text-xs text-center py-2',
                row: 'flex w-full',
                cell: 'flex-1 text-center p-0.5',
                day: 'w-full aspect-square flex items-center justify-center text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors cursor-pointer',
                day_selected: 'bg-orange-500 text-white hover:bg-orange-600',
                day_today: 'font-bold text-orange-600 ring-1 ring-orange-300',
                day_disabled: 'text-gray-300 cursor-not-allowed hover:bg-transparent',
                day_range_start: 'bg-orange-500 text-white rounded-l-lg rounded-r-none',
                day_range_end: 'bg-orange-500 text-white rounded-r-lg rounded-l-none',
                day_range_middle: 'bg-orange-100 text-orange-900 rounded-none',
                day_outside: 'text-gray-300',
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === 'left'
                    ? <ChevronLeft className="w-4 h-4 text-gray-600" />
                    : <ChevronRight className="w-4 h-4 text-gray-600" />,
              }}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t.clear}
            </button>

            {nights > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-bold text-orange-600">{nights}</span> {nights === 1 ? t.night : t.nights} selected
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={!tempRange?.from || !tempRange?.to}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
            >
              {t.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
