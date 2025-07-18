'use client';

import { useState, useEffect, useRef } from 'react';
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
  maxDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [displayValue, setDisplayValue] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setDisplayValue(formatDateBR(date));
    } else {
      setSelectedDate(null);
      setDisplayValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateBR = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
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
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
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
    
    setSelectedDate(day.date);
    setDisplayValue(formatDateBR(day.date));
    onChange(formatDateISO(day.date));
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

  const calendarDays = generateCalendarDays();

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
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
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '14px 16px',
          border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '16px',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          outline: 'none'
        }}
      >
        <span style={{ 
          color: displayValue ? '#1f2937' : '#9ca3af',
          fontSize: '16px'
        }}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon 
          style={{ 
            width: '16px', 
            height: '16px', 
            color: '#6b7280',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }} 
        />
      </div>

      {error && (
        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            marginBottom: '4px',
            padding: '20px',
            minWidth: '320px'
          }}
        >
          {/* Header do Calendário */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              style={{
                padding: '8px',
                background: 'none',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <ArrowLeftIcon style={{ width: '16px', height: '16px', color: '#374151' }} />
            </button>
            
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0,
              textAlign: 'center',
              flex: 1
            }}>
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              style={{
                padding: '8px',
                background: 'none',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <ArrowRightIcon style={{ width: '16px', height: '16px', color: '#374151' }} />
            </button>
          </div>

          {/* Dias da Semana */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px',
            marginBottom: '8px'
          }}>
            {weekDays.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  padding: '8px 4px'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid do Calendário */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px'
          }}>
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
              💡 Selecione uma data a partir de hoje
            </span>
          </div>
        </div>
      )}
    </div>
  );
}