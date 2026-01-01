"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Sparkles,
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

// Level 6 Ultra-Premium Date Picker - Apple-class design with advanced animations
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

// Premium spring animation config
const springConfig = { stiffness: 400, damping: 30 };
const softSpring = { stiffness: 200, damping: 25 };

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
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 300 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLButtonElement>(null);

  // Portal mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position when opening - always open down
  const openDropdown = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      // Always position below the input
      setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: Math.max(300, rect.width) });
    }
    setIsOpen(true);
  };

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

  // Navigation with direction tracking
  const goToPrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  const goToNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  const goToToday = () => {
    const today = new Date();
    setDirection(today > currentMonth ? 1 : -1);
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

  // Month animation variants
  const monthVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Input Button - Ultra Premium */}
      <motion.button
        ref={inputRef}
        type="button"
        onClick={() => !disabled && (isOpen ? setIsOpen(false) : openDropdown())}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
        className={`
          w-full flex items-center gap-2.5 px-3 py-2.5
          bg-white border-2 rounded-xl text-left
          transition-all duration-200 ease-out
          ${isOpen
            ? "border-indigo-500 ring-4 ring-indigo-100 shadow-lg shadow-indigo-500/10"
            : error
              ? "border-red-400 ring-2 ring-red-500/10"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          }
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"}
        `}
      >
        {/* Calendar Icon with Animation */}
        <motion.div
          animate={{
            rotate: isOpen ? 5 : 0,
            scale: isOpen ? 1.05 : 1,
          }}
          transition={{ type: "spring", ...springConfig }}
          className={`
            w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${isOpen
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
              : "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-500"
            }
          `}
        >
          <CalendarIcon className="w-4.5 h-4.5" />
        </motion.div>

        <div className="flex-1 min-w-0">
          {selectedDate ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", ...softSpring }}
            >
              <p className="text-sm font-bold text-gray-900">
                {format(selectedDate, "EEE, MMM d")}
              </p>
              <p className="text-[10px] text-gray-500 font-medium">
                {format(selectedDate, "yyyy")}
              </p>
            </motion.div>
          ) : (
            <p className="text-sm text-gray-400 font-medium">{placeholder}</p>
          )}
        </div>

        {/* Clear button with animation */}
        <AnimatePresence>
          {selectedDate && !disabled && (
            <motion.button
              type="button"
              onClick={clearDate}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.8 }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="mt-1.5 text-xs text-red-600 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Calendar Dropdown - Portal to body for z-index fix */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", ...springConfig }}
              className="fixed z-[9999] bg-white rounded-2xl border border-gray-200 overflow-hidden"
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                minWidth: 300,
                boxShadow: `
                  0 4px 6px -1px rgba(0, 0, 0, 0.05),
                  0 10px 15px -3px rgba(0, 0, 0, 0.08),
                  0 20px 25px -5px rgba(0, 0, 0, 0.06),
                  0 0 0 1px rgba(99, 102, 241, 0.1)
                `,
              }}
            >
            {/* Header with Gradient */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <motion.button
                type="button"
                onClick={goToPrevMonth}
                whileHover={{ scale: 1.15, x: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={format(currentMonth, "MMM yyyy")}
                  custom={direction}
                  variants={monthVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="text-center"
                >
                  <h3 className="text-sm font-black text-gray-900">
                    {format(currentMonth, "MMMM")}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{format(currentMonth, "yyyy")}</p>
                </motion.div>
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={goToNextMonth}
                whileHover={{ scale: 1.15, x: 2 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 px-3 pt-3 pb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid with Staggered Animation */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-3">
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
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.01, type: "spring", ...softSpring }}
                    whileHover={!isDisabled && isCurrentMonth ? { scale: 1.2, y: -2 } : {}}
                    whileTap={!isDisabled && isCurrentMonth ? { scale: 0.9 } : {}}
                    className={`
                      relative w-9 h-9 mx-auto rounded-xl text-sm font-semibold
                      flex items-center justify-center
                      transition-all duration-150 ease-out
                      ${!isCurrentMonth
                        ? "text-gray-200 cursor-default"
                        : isDisabled
                          ? "text-gray-300 cursor-not-allowed"
                          : isSelected
                            ? "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/40"
                            : isTodayDate
                              ? "text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 ring-2 ring-indigo-200"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    {format(day, "d")}

                    {/* Selected day glow effect */}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    {/* Today sparkle indicator */}
                    {isTodayDate && !isSelected && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-0.5 -right-0.5"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer with Premium Styling */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
              <motion.button
                type="button"
                onClick={goToToday}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Today
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}
