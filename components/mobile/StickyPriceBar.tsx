'use client';

import { useState, useEffect } from 'react';
import { ArrowUpDown, SlidersHorizontal, ChevronDown, TrendingDown } from 'lucide-react';

interface StickyPriceBarProps {
  bestPrice?: number;
  totalResults?: number;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  isVisible?: boolean;
}

/**
 * STICKY PRICE BAR - Mobile Only
 *
 * Design Goals:
 * - Appears on scroll down (hides header clutter)
 * - Shows best available price at all times
 * - Quick access to filter and sort
 * - Minimal height (48px)
 * - Premium shadow and blur effect
 * - Smooth slide-in animation
 *
 * Positioning:
 * - Sticks to top on scroll
 * - Replaces collapsed search bar
 * - Z-index above cards, below sheets
 */

export function StickyPriceBar({
  bestPrice,
  totalResults = 0,
  onFilterClick,
  onSortClick,
  isVisible = true,
}: StickyPriceBarProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isSticky, setIsSticky] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Become sticky after scrolling 100px
      setIsSticky(currentScrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format price
  const formatPrice = (price: number) => {
    return `$${Math.round(price)}`;
  };

  if (!isVisible) return null;

  return (
    <div
      className={`sticky top-0 z-30 transition-all duration-300 ${
        isSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg" />

      {/* Content */}
      <div className="relative flex items-center justify-between px-4 py-2.5 h-12">
        {/* Left: Best Price */}
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-gray-500 leading-none">
              Best Price
            </span>
            <span className="text-lg font-bold text-primary-600 leading-tight">
              {bestPrice ? formatPrice(bestPrice) : '---'}
            </span>
          </div>
          {totalResults > 0 && (
            <span className="text-xs text-gray-500 ml-1">
              ({totalResults} flights)
            </span>
          )}
        </div>

        {/* Right: Filter & Sort Buttons */}
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={onFilterClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-700" />
            <span className="text-xs font-semibold text-gray-700">Filter</span>
          </button>

          {/* Sort Button */}
          <button
            onClick={onSortClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
          >
            <ArrowUpDown className="w-4 h-4 text-gray-700" />
            <span className="text-xs font-semibold text-gray-700">Sort</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * SORT BOTTOM SHEET - Mobile
 * Companion component for quick sorting
 */

interface SortOption {
  id: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

interface SortSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort?: string;
  onSortChange?: (sortId: string) => void;
}

export function SortSheet({
  isOpen,
  onClose,
  currentSort = 'best',
  onSortChange,
}: SortSheetProps) {
  const sortOptions: SortOption[] = [
    {
      id: 'best',
      label: 'Best Value',
      description: 'Optimized price, duration, and quality',
    },
    {
      id: 'cheapest',
      label: 'Cheapest First',
      description: 'Lowest price available',
    },
    {
      id: 'fastest',
      label: 'Fastest First',
      description: 'Shortest total duration',
    },
    {
      id: 'earliest',
      label: 'Earliest Departure',
      description: 'Departs earliest in the day',
    },
    {
      id: 'latest',
      label: 'Latest Departure',
      description: 'Departs latest in the day',
    },
  ];

  const handleSelect = (sortId: string) => {
    if (onSortChange) {
      onSortChange(sortId);
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Close after short delay
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
        style={{
          maxHeight: '60vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Sort By</h3>
        </div>

        {/* Sort Options */}
        <div className="overflow-y-auto px-4 py-2">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors mb-2 ${
                currentSort === option.id
                  ? 'bg-primary-50 border-2 border-primary-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 text-sm">
                  {option.label}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {option.description}
                </div>
              </div>

              {currentSort === option.id && (
                <div className="flex-shrink-0 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
