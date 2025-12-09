'use client';

import { DatePrice } from './hooks/usePriceCalendar';

interface PriceCalendarDayProps {
  date: Date;
  priceData: DatePrice | null;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
  priceLevel: 'lowest' | 'low' | 'medium' | 'high' | 'highest' | null;
  onSelect: (date: Date) => void;
  currency?: string;
}

export function PriceCalendarDay({
  date,
  priceData,
  isSelected,
  isToday,
  isPast,
  priceLevel,
  onSelect,
  currency = 'USD',
}: PriceCalendarDayProps) {
  const dayOfMonth = date.getDate();
  const hasPrice = priceData?.available && priceData.price > 0;
  const isWeekend = priceData?.isWeekend || false;
  const isCheapest = priceData?.isCheapest || false;
  const isApproximate = priceData?.approximate || false;

  // Price level colors (Google Flights style)
  const priceColors = {
    lowest: 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200',
    low: 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100',
    medium: 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100',
    high: 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100',
    highest: 'bg-red-100 border-red-400 text-red-900 hover:bg-red-200',
  };

  const getColorClass = () => {
    if (isPast) return 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed';
    if (isSelected) return 'bg-blue-600 border-blue-700 text-white shadow-lg ring-2 ring-blue-300';
    if (!hasPrice) return 'bg-white border-gray-200 text-gray-400 hover:border-gray-300';
    if (priceLevel) return priceColors[priceLevel];
    return 'bg-white border-gray-200 text-gray-700 hover:border-gray-400';
  };

  const handleClick = () => {
    if (!isPast) {
      onSelect(date);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isPast && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect(date);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isPast}
      className={`
        relative aspect-square p-1 md:p-2
        rounded-lg border-2 transition-all duration-150 ease-out
        touch-manipulation active:scale-95
        ${getColorClass()}
        ${!isPast && 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'}
        ${isWeekend && !isPast && !isSelected ? 'ring-1 ring-gray-300' : ''}
        ${isCheapest && !isSelected ? 'ring-2 ring-green-500' : ''}
      `}
      aria-label={
        hasPrice
          ? `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, $${priceData.price.toFixed(0)}${isApproximate ? ' (approximate)' : ''}`
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      aria-selected={isSelected}
      aria-disabled={isPast}
      tabIndex={isPast ? -1 : 0}
    >
      {/* Day number */}
      <div
        className={`
          text-xs md:text-sm font-semibold mb-0.5
          ${isToday && !isSelected ? 'text-blue-600' : ''}
        `}
      >
        {dayOfMonth}
      </div>

      {/* Price (if available) */}
      {hasPrice && !isSelected && (
        <div className="text-[9px] md:text-[10px] font-bold leading-tight">
          ${priceData.price.toFixed(0)}
        </div>
      )}

      {/* Cheapest badge */}
      {isCheapest && !isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-md">
          ✓
        </div>
      )}

      {/* Approximate indicator */}
      {isApproximate && hasPrice && !isSelected && (
        <div className="absolute -bottom-0.5 -right-0.5 text-[8px] text-gray-400">
          ~
        </div>
      )}

      {/* Weekend indicator (subtle dot) */}
      {isWeekend && !isPast && !isSelected && !hasPrice && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full" />
      )}
    </button>
  );
}
