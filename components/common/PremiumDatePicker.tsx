"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";

// Level 6 Ultra-Premium Date Picker - Apple-class design
interface PremiumDatePickerProps {
  label?: string;
  value: string; // ISO date string YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function PremiumDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  error,
  disabled = false,
  className = "",
}: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() =>
    value ? parseISO(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLButtonElement>(null);

  // Parse dates
  const selectedDate = value ? parseISO(value) : null;
  const minDateParsed = minDate ? parseISO(minDate) : null;
  const maxDateParsed = maxDate ? parseISO(maxDate) : null;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Check if date is selectable
  const isDateDisabled = (date: Date) => {
    if (minDateParsed && isBefore(date, minDateParsed)) return true;
    if (maxDateParsed && isAfter(date, maxDateParsed)) return true;
    return false;
  };

  // Handle date selection
  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  // Navigation
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (!isDateDisabled(today)) {
      onChange(format(today, "yyyy-MM-dd"));
    }
  };

  // Clear date
  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">
          {label}
        </label>
      )}

      {/* Input Button */}
      <button
        ref={inputRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center gap-2.5 px-3.5 py-2.5
          bg-white border rounded-xl text-left
          transition-all duration-200 ease-out
          ${isOpen
            ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg"
            : error
              ? "border-red-400 ring-2 ring-red-500/10"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          }
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"}
        `}
      >
        <div className={`
          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${isOpen ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}
        `}>
          <CalendarIcon className="w-4.5 h-4.5" />
        </div>

        <div className="flex-1 min-w-0">
          {selectedDate ? (
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {format(selectedDate, "EEEE")}
              </p>
              <p className="text-xs text-gray-500">
                {format(selectedDate, "MMMM d, yyyy")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">{placeholder}</p>
          )}
        </div>

        {/* Clear button */}
        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={clearDate}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      )}

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="
              absolute z-50 mt-2 left-0 right-0 min-w-[300px]
              bg-white rounded-2xl
              border border-gray-200
              shadow-xl shadow-gray-900/10
            "
            style={{
              boxShadow: `
                0 4px 6px -1px rgba(0, 0, 0, 0.05),
                0 10px 15px -3px rgba(0, 0, 0, 0.08),
                0 20px 25px -5px rgba(0, 0, 0, 0.06)
              `,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <motion.button
                type="button"
                onClick={goToPrevMonth}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <motion.div
                key={format(currentMonth, "MMM yyyy")}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h3 className="text-sm font-bold text-gray-900">
                  {format(currentMonth, "MMMM")}
                </h3>
                <p className="text-xs text-gray-500">{format(currentMonth, "yyyy")}</p>
              </motion.div>

              <motion.button
                type="button"
                onClick={goToNextMonth}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 px-3 pt-3 pb-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const isDisabled = isDateDisabled(day);

                return (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    disabled={isDisabled || !isCurrentMonth}
                    whileHover={!isDisabled && isCurrentMonth ? { scale: 1.15 } : {}}
                    whileTap={!isDisabled && isCurrentMonth ? { scale: 0.95 } : {}}
                    className={`
                      relative w-9 h-9 mx-auto rounded-xl text-sm font-medium
                      flex items-center justify-center
                      transition-all duration-150 ease-out
                      ${!isCurrentMonth
                        ? "text-gray-300 cursor-default"
                        : isDisabled
                          ? "text-gray-300 cursor-not-allowed"
                          : isSelected
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                            : isTodayDate
                              ? "text-blue-600 font-bold bg-blue-50 hover:bg-blue-100"
                              : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {format(day, "d")}
                    {/* Today dot indicator */}
                    {isTodayDate && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                type="button"
                onClick={goToToday}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200/70 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
