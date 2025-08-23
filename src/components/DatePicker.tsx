'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  iconColor?: string;
  error?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  inputClassName?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  dayNumber: number;
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
  label,
  iconColor = '#6b7280',
  error,
  minDate,
  maxDate,
  className = '',
  inputClassName = ''
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [displayValue, setDisplayValue] = useState('');
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isClient, setIsClient] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setDisplayValue(formatDateUS(date));
    } else {
      setSelectedDate(null);
      setDisplayValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside the container
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Also check if the click is not on the calendar portal
        const isCalendarClick = target.closest('[data-datepicker-calendar]');
        if (!isCalendarClick) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDateUS = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    
    return false;
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Dias do mês anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
        dayNumber: date.getDate()
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && 
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate();
      const isDisabled = isDateDisabled(date);

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected: !!isSelected,
        isDisabled,
        dayNumber: day
      });
    }

    // Dias do próximo mês para completar o grid
    const remainingDays = 42 - days.length; // 6 semanas x 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
        dayNumber: day
      });
    }

    return days;
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isDisabled || !day.isCurrentMonth) return;
    
    const selectedDate = new Date(day.date);
    selectedDate.setHours(0, 0, 0, 0);
    
    setSelectedDate(selectedDate);
    setDisplayValue(formatDateUS(selectedDate));
    onChange(formatDateISO(selectedDate));
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const updateCalendarPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 400; // approximate height
      
      // Determine if calendar should appear above or below
      const showAbove = spaceBelow < calendarHeight && spaceAbove > spaceBelow;
      
      setCalendarPosition({
        top: showAbove 
          ? rect.top + window.scrollY - calendarHeight - 4
          : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const handleToggleOpen = () => {
    if (!isOpen) {
      updateCalendarPosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };
  
  // Update position on scroll
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        updateCalendarPosition();
      };
      
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen]);

  const calendarDays = generateCalendarDays();

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px'
        }}>
          <CalendarIcon style={{ width: '14px', height: '14px', color: iconColor }} />
          {label}
        </label>
      )}
      
      <div
        onClick={handleToggleOpen}
        className={`w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl sm:rounded-2xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 text-sm sm:text-base font-bold text-slate-900 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/80 cursor-pointer flex items-center justify-between group ${className} ${inputClassName} ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
      >
        <span className={`${displayValue ? 'text-gray-900' : 'text-gray-500'} text-sm sm:text-base font-bold`}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon 
          className={`w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-all duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>

      {error && (
        <span className="text-red-500 text-xs mt-1 block">
          {error}
        </span>
      )}

      {/* Calendar Dropdown */}
      {isOpen && isClient && typeof window !== 'undefined' && createPortal(
        <div
          data-datepicker-calendar="true"
          className="fixed bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-[99999] p-5"
          style={{
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`,
            width: `${Math.max(calendarPosition.width, 320)}px`,
            maxHeight: '400px',
            overflow: 'auto'
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 text-gray-700" />
            </button>
            
            <h3 className="text-base font-semibold text-gray-900 text-center flex-1">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowRightIcon className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-500 py-2 px-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(day)}
                disabled={day.isDisabled}
                style={{
                  width: '36px',
                  height: '36px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: day.isToday ? '700' : '500',
                  cursor: day.isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  background: day.isSelected 
                    ? iconColor
                    : day.isToday 
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'transparent',
                  color: day.isSelected 
                    ? 'white'
                    : day.isToday 
                    ? '#2563eb'
                    : day.isDisabled 
                    ? '#d1d5db'
                    : day.isCurrentMonth 
                    ? '#1f2937' 
                    : '#9ca3af',
                  opacity: day.isCurrentMonth ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (!day.isDisabled && !day.isSelected) {
                    e.currentTarget.style.background = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!day.isDisabled && !day.isSelected) {
                    e.currentTarget.style.background = day.isToday ? 'rgba(59, 130, 246, 0.1)' : 'transparent';
                  }
                }}
              >
                {day.dayNumber}
              </button>
            ))}
          </div>

          {/* Footer com dica */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              💡 Please select a date from today onwards
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}