'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  label?: string;
  minDate?: string;
  maxDate?: string;
  usFormat?: boolean; // If true, display as MM/DD/YYYY
  useDropdowns?: boolean; // If true, use dropdown selectors for easier year selection
  yearRange?: { start: number; end: number }; // Custom year range for dropdowns
}

export function DateInput({
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
  required = false,
  error,
  label,
  minDate,
  maxDate,
  usFormat = true,
  useDropdowns = false,
  yearRange,
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');

  // Convert ISO to US format for display
  useEffect(() => {
    if (value) {
      const [valueYear, valueMonth, valueDay] = value.split('-');

      if (useDropdowns) {
        setYear(valueYear || '');
        setMonth(valueMonth || '');
        setDay(valueDay || '');
      }

      if (usFormat) {
        setDisplayValue(`${valueMonth}/${valueDay}/${valueYear}`);
      } else {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue('');
      if (useDropdowns) {
        setYear('');
        setMonth('');
        setDay('');
      }
    }
  }, [value, usFormat, useDropdowns]);

  // Update parent when dropdown values change
  useEffect(() => {
    if (useDropdowns && month && day && year) {
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      if (isoDate !== value) {
        onChange(isoDate);
      }
    }
  }, [month, day, year, useDropdowns]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (usFormat) {
      // Handle US format input (MM/DD/YYYY)
      setDisplayValue(inputValue);

      // Auto-format as user types
      const cleaned = inputValue.replace(/\D/g, '');

      if (cleaned.length >= 2) {
        const month = cleaned.slice(0, 2);
        const day = cleaned.slice(2, 4);
        const year = cleaned.slice(4, 8);

        let formatted = month;
        if (cleaned.length >= 3) {
          formatted += '/' + day;
        }
        if (cleaned.length >= 5) {
          formatted += '/' + year;
        }

        setDisplayValue(formatted);

        // Convert to ISO format if complete
        if (cleaned.length === 8) {
          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          onChange(isoDate);
        }
      }
    } else {
      onChange(inputValue);
    }
  };

  // Also support HTML5 date input for fallback
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const defaultYearStart = yearRange?.start || (currentYear - 100);
  const defaultYearEnd = yearRange?.end || currentYear;
  const years = Array.from({ length: defaultYearEnd - defaultYearStart + 1 }, (_, i) => defaultYearEnd - i);

  // Generate day options based on selected month/year
  const getDaysInMonth = (m: string, y: string) => {
    if (!m || !y) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };
  const daysInMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-primary-500" />
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}

      {useDropdowns ? (
        /* Dropdown Selectors */
        <div className="grid grid-cols-3 gap-2">
          {/* Month */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required={required}
            className={`px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              error ? 'border-error-500' : 'border-gray-300'
            }`}
          >
            <option value="">Month</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Day */}
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required={required}
            className={`px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              error ? 'border-error-500' : 'border-gray-300'
            }`}
          >
            <option value="">Day</option>
            {days.map(d => (
              <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>
            ))}
          </select>

          {/* Year */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required={required}
            className={`px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              error ? 'border-error-500' : 'border-gray-300'
            }`}
          >
            <option value="">Year</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="relative">
          {/* Calendar Icon */}
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />

        {/* Styled Date Input (HTML5 date picker with custom styling) */}
        <input
          type="date"
          value={value}
          onChange={handleDateInputChange}
          min={minDate}
          max={maxDate}
          required={required}
          className={`
            w-full pl-10 pr-3 py-2 text-sm border rounded-lg transition-all
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? 'border-error-500' : 'border-gray-300'}
            [&::-webkit-calendar-picker-indicator]:opacity-0
            [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:inset-0
            [&::-webkit-calendar-picker-indicator]:w-full
            [&::-webkit-calendar-picker-indicator]:h-full
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
          `}
          style={{
            colorScheme: 'light',
          }}
        />

        {/* Display formatted value overlay (for US format visualization) */}
        {usFormat && value && (
          <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-900">
            {(() => {
              const [year, month, day] = value.split('-');
              return `${month}/${day}/${year}`;
            })()}
          </div>
        )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-error-500 mt-1">{error}</p>
      )}

      {/* Helper Text */}
      {!error && !useDropdowns && usFormat && (
        <p className="text-xs text-gray-500 mt-1">Format: MM/DD/YYYY</p>
      )}
    </div>
  );
}
