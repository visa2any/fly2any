"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Sparkles,
  ArrowRight,
  Plane,
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
  isWithinInterval,
} from "date-fns";

// Level 6 Ultra-Premium Date Range Picker - Apple-class design
interface PremiumDateRangePickerProps {
  departureDate: string;
  returnDate: string;
  onDepartureDateChange: (date: string) => void;
  onReturnDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  tripType?: "roundtrip" | "oneway";
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const springConfig = { stiffness: 400, damping: 30 };

export default function PremiumDateRangePicker({
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  minDate,
  maxDate,
  disabled = false,
  tripType = "roundtrip",
  className = "",
}: PremiumDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingReturn, setSelectingReturn] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() =>
    departureDate ? parseISO(departureDate) : new Date()
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDeparture = departureDate ? parseISO(departureDate) : null;
  const selectedReturn = returnDate ? parseISO(returnDate) : null;
  const minDateParsed = minDate ? parseISO(minDate) : null;
  const maxDateParsed = maxDate ? parseISO(maxDate) : null;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectingReturn(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        setSelectingReturn(false);
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

  // Check if date is disabled
  const isDateDisabled = (date: Date) => {
    if (minDateParsed && isBefore(date, minDateParsed)) return true;
    if (maxDateParsed && isAfter(date, maxDateParsed)) return true;
    // When selecting return, can't select before departure
    if (selectingReturn && selectedDeparture && isBefore(date, selectedDeparture)) return true;
    return false;
  };

  // Check if date is in selected range
  const isInRange = (date: Date) => {
    if (!selectedDeparture) return false;
    const endDate = hoveredDate && selectingReturn ? hoveredDate : selectedReturn;
    if (!endDate) return false;
    if (isSameDay(date, selectedDeparture) || isSameDay(date, endDate)) return false;
    return isWithinInterval(date, {
      start: selectedDeparture,
      end: endDate,
    });
  };

  // Handle date selection
  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!selectingReturn) {
      // Selecting departure
      onDepartureDateChange(format(date, "yyyy-MM-dd"));
      if (tripType === "roundtrip") {
        // Clear return if it's before new departure
        if (selectedReturn && isBefore(selectedReturn, date)) {
          onReturnDateChange("");
        }
        setSelectingReturn(true);
      } else {
        setIsOpen(false);
      }
    } else {
      // Selecting return
      if (selectedDeparture && isBefore(date, selectedDeparture)) {
        // User clicked a date before departure - reset and set as new departure
        onDepartureDateChange(format(date, "yyyy-MM-dd"));
        onReturnDateChange("");
        setSelectingReturn(true);
      } else {
        onReturnDateChange(format(date, "yyyy-MM-dd"));
        setIsOpen(false);
        setSelectingReturn(false);
      }
    }
  };

  // Navigation
  const goToPrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  const goToNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Clear dates
  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDepartureDateChange("");
    onReturnDateChange("");
    setSelectingReturn(false);
  };

  // Open calendar in specific mode
  const openCalendar = (mode: "departure" | "return") => {
    if (disabled) return;
    setIsOpen(true);
    setSelectingReturn(mode === "return" && tripType === "roundtrip");
    if (mode === "return" && selectedDeparture) {
      setCurrentMonth(selectedDeparture);
    } else if (selectedDeparture) {
      setCurrentMonth(selectedDeparture);
    }
  };

  const monthVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Display - Two boxes */}
      <div className="flex gap-2">
        {/* Departure */}
        <motion.button
          type="button"
          onClick={() => openCalendar("departure")}
          whileHover={{ scale: disabled ? 1 : 1.01 }}
          whileTap={{ scale: disabled ? 1 : 0.99 }}
          className={`flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border-2 rounded-xl text-left transition-all ${
            isOpen && !selectingReturn
              ? "border-indigo-500 ring-4 ring-indigo-100 shadow-lg"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isOpen && !selectingReturn
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
              : "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
          }`}>
            <Plane className="w-4 h-4 -rotate-45" />
          </div>
          <div className="flex-1 min-w-0">
            {selectedDeparture ? (
              <div>
                <p className="text-sm font-bold text-gray-900">{format(selectedDeparture, "EEE, MMM d")}</p>
                <p className="text-[10px] text-gray-500">{format(selectedDeparture, "yyyy")}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Depart</p>
            )}
          </div>
        </motion.button>

        {/* Return */}
        <motion.button
          type="button"
          onClick={() => openCalendar("return")}
          whileHover={{ scale: disabled || tripType === "oneway" ? 1 : 1.01 }}
          whileTap={{ scale: disabled || tripType === "oneway" ? 1 : 0.99 }}
          disabled={tripType === "oneway"}
          className={`flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border-2 rounded-xl text-left transition-all ${
            tripType === "oneway" ? "opacity-40 cursor-not-allowed" : ""
          } ${
            isOpen && selectingReturn
              ? "border-indigo-500 ring-4 ring-indigo-100 shadow-lg"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          } ${disabled ? "opacity-50 cursor-not-allowed" : tripType === "oneway" ? "" : "cursor-pointer"}`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isOpen && selectingReturn
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
              : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
          }`}>
            <Plane className="w-4 h-4 rotate-45" />
          </div>
          <div className="flex-1 min-w-0">
            {selectedReturn ? (
              <div>
                <p className="text-sm font-bold text-gray-900">{format(selectedReturn, "EEE, MMM d")}</p>
                <p className="text-[10px] text-gray-500">{format(selectedReturn, "yyyy")}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">{tripType === "oneway" ? "One-way" : "Return"}</p>
            )}
          </div>
        </motion.button>

        {/* Clear button */}
        <AnimatePresence>
          {(selectedDeparture || selectedReturn) && !disabled && (
            <motion.button
              type="button"
              onClick={clearDates}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors self-center"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", ...springConfig }}
            className="absolute z-[100] mt-2 left-0 right-0 min-w-[320px] bg-white rounded-2xl border border-gray-200 overflow-hidden"
            style={{
              boxShadow: `0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08), 0 20px 25px -5px rgba(0,0,0,0.06), 0 0 0 1px rgba(99,102,241,0.1)`,
            }}
          >
            {/* Header - Show what we're selecting */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !selectingReturn
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}>
                  Departure
                </div>
                {tripType === "roundtrip" && (
                  <>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectingReturn
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "bg-white text-gray-500 border border-gray-200"
                    }`}>
                      Return
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Month Navigation */}
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
                  <h3 className="text-sm font-black text-gray-900">{format(currentMonth, "MMMM")}</h3>
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
                <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-3">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDeparture = selectedDeparture && isSameDay(day, selectedDeparture);
                const isReturn = selectedReturn && isSameDay(day, selectedReturn);
                const isTodayDate = isToday(day);
                const isDisabled = isDateDisabled(day);
                const inRange = isInRange(day);

                return (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    onMouseEnter={() => selectingReturn && setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    disabled={isDisabled || !isCurrentMonth}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.005 }}
                    whileHover={!isDisabled && isCurrentMonth ? { scale: 1.15, y: -2 } : {}}
                    whileTap={!isDisabled && isCurrentMonth ? { scale: 0.9 } : {}}
                    className={`relative w-9 h-9 mx-auto rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
                      !isCurrentMonth
                        ? "text-gray-200 cursor-default"
                        : isDisabled
                          ? "text-gray-300 cursor-not-allowed"
                          : isDeparture || isReturn
                            ? "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/40"
                            : inRange
                              ? "bg-indigo-100 text-indigo-700"
                              : isTodayDate
                                ? "text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 ring-2 ring-indigo-200"
                                : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {format(day, "d")}
                    {(isDeparture || isReturn) && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    {isTodayDate && !isDeparture && !isReturn && (
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

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
              <div className="text-xs text-gray-500">
                {selectingReturn ? (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    Select return date
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    Select departure date
                  </span>
                )}
              </div>
              <motion.button
                type="button"
                onClick={() => { setIsOpen(false); setSelectingReturn(false); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
