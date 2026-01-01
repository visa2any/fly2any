"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  ArrowRight,
  Check,
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

interface PremiumDateRangePickerProps {
  startDate: string;
  endDate: string;
  onChangeStart: (date: string) => void;
  onChangeEnd: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const springConfig = { stiffness: 400, damping: 30 };

export default function PremiumDateRangePicker({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  minDate,
  maxDate,
  startPlaceholder = "Depart",
  endPlaceholder = "Return",
  disabled = false,
  className = "",
}: PremiumDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() =>
    startDate ? parseISO(startDate) : new Date()
  );
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 340 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openDropdown = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 340;
      let left = rect.left;
      if (left + dropdownWidth > viewportWidth - 16) {
        left = viewportWidth - dropdownWidth - 16;
      }
      setDropdownPos({ top: rect.bottom + 8, left: Math.max(16, left), width: dropdownWidth });
    }
    setSelectingEnd(!!startDate && !endDate);
    setIsOpen(true);
  };

  const startDateParsed = startDate ? parseISO(startDate) : null;
  const endDateParsed = endDate ? parseISO(endDate) : null;
  const minDateParsed = minDate ? parseISO(minDate) : null;
  const maxDateParsed = maxDate ? parseISO(maxDate) : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const isDateDisabled = (date: Date) => {
    if (minDateParsed && isBefore(date, minDateParsed)) return true;
    if (maxDateParsed && isAfter(date, maxDateParsed)) return true;
    if (selectingEnd && startDateParsed && isBefore(date, startDateParsed)) return true;
    return false;
  };

  const isInRange = (date: Date) => {
    if (!startDateParsed) return false;
    const endToUse = endDateParsed || hoverDate;
    if (!endToUse) return false;
    try {
      return isWithinInterval(date, { start: startDateParsed, end: endToUse });
    } catch {
      return false;
    }
  };

  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    if (!selectingEnd) {
      onChangeStart(format(date, "yyyy-MM-dd"));
      onChangeEnd("");
      setSelectingEnd(true);
    } else {
      if (startDateParsed && isBefore(date, startDateParsed)) {
        onChangeStart(format(date, "yyyy-MM-dd"));
        onChangeEnd("");
      } else {
        onChangeEnd(format(date, "yyyy-MM-dd"));
        setSelectingEnd(false);
        setIsOpen(false);
      }
    }
  };

  const goToPrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeStart("");
    onChangeEnd("");
    setSelectingEnd(false);
  };

  const monthVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        ref={inputRef}
        onClick={() => !disabled && (isOpen ? setIsOpen(false) : openDropdown())}
        className={`flex items-center gap-1.5 px-2 py-2 bg-white border-2 rounded-xl cursor-pointer transition-all duration-200 ${
          isOpen ? "border-indigo-500 ring-4 ring-indigo-100 shadow-lg" : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
      >
        <div className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${isOpen && !selectingEnd ? "bg-indigo-50 ring-2 ring-indigo-200" : ""}`}>
          <CalendarIcon className={`w-4 h-4 flex-shrink-0 ${startDateParsed ? "text-indigo-600" : "text-gray-400"}`} />
          <span className={`text-sm font-semibold truncate ${startDateParsed ? "text-gray-900" : "text-gray-400"}`}>
            {startDateParsed ? format(startDateParsed, "MMM d") : startPlaceholder}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <div className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${isOpen && selectingEnd ? "bg-purple-50 ring-2 ring-purple-200" : ""}`}>
          <CalendarIcon className={`w-4 h-4 flex-shrink-0 ${endDateParsed ? "text-purple-600" : "text-gray-400"}`} />
          <span className={`text-sm font-semibold truncate ${endDateParsed ? "text-gray-900" : "text-gray-400"}`}>
            {endDateParsed ? format(endDateParsed, "MMM d") : endPlaceholder}
          </span>
        </div>
        {(startDateParsed || endDateParsed) && !disabled && (
          <motion.button type="button" onClick={clearDates} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", ...springConfig }}
              className="fixed z-[9999] bg-white rounded-2xl border border-gray-200 overflow-hidden"
              style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08), 0 20px 25px -5px rgba(0,0,0,0.06)" }}
            >
              <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${selectingEnd ? "bg-purple-500" : "bg-indigo-500"} animate-pulse`} />
                  {selectingEnd ? "Select return date" : "Select departure date"}
                </p>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <motion.button type="button" onClick={goToPrevMonth} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md">
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div key={format(currentMonth, "MMM yyyy")} custom={direction} variants={monthVariants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="text-center">
                    <h3 className="text-sm font-black text-gray-900">{format(currentMonth, "MMMM yyyy")}</h3>
                  </motion.div>
                </AnimatePresence>
                <motion.button type="button" onClick={goToNextMonth} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md">
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="grid grid-cols-7 px-3 pt-3 pb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 px-3 pb-3">
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isStart = startDateParsed && isSameDay(day, startDateParsed);
                  const isEnd = endDateParsed && isSameDay(day, endDateParsed);
                  const inRange = isInRange(day);
                  const isTodayDate = isToday(day);
                  const isDisabled = isDateDisabled(day);

                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      onMouseEnter={() => selectingEnd && startDateParsed && setHoverDate(day)}
                      onMouseLeave={() => setHoverDate(null)}
                      disabled={isDisabled || !isCurrentMonth}
                      whileHover={!isDisabled && isCurrentMonth ? { scale: 1.15 } : {}}
                      whileTap={!isDisabled && isCurrentMonth ? { scale: 0.9 } : {}}
                      className={`relative w-9 h-9 mx-auto rounded-lg text-sm font-semibold flex items-center justify-center transition-all
                        ${!isCurrentMonth ? "text-gray-200" : ""}
                        ${isDisabled && isCurrentMonth ? "text-gray-300 cursor-not-allowed" : ""}
                        ${isStart ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/40 rounded-r-none" : ""}
                        ${isEnd ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/40 rounded-l-none" : ""}
                        ${inRange && !isStart && !isEnd ? "bg-indigo-100 text-indigo-700 rounded-none" : ""}
                        ${!isStart && !isEnd && !inRange && isCurrentMonth && !isDisabled ? "text-gray-700 hover:bg-gray-100" : ""}
                        ${isTodayDate && !isStart && !isEnd ? "ring-2 ring-indigo-300" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {startDateParsed && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">{format(startDateParsed, "MMM d")}</span>}
                  {startDateParsed && endDateParsed && <ArrowRight className="w-3 h-3" />}
                  {endDateParsed && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">{format(endDateParsed, "MMM d")}</span>}
                </div>
                <motion.button type="button" onClick={() => setIsOpen(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md">
                  <Check className="w-3 h-3" /> Done
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
