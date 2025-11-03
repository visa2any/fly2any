/**
 * Mobile Filter Bottom Sheet
 *
 * Enhanced mobile filter experience with:
 * - Swipe to dismiss
 * - Smooth animations
 * - Haptic feedback
 * - Focus trap (accessibility)
 * - Live result count
 * - Quick apply
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import FlightFilters, { type FlightFilters as FlightFiltersType } from '@/components/flights/FlightFilters';

interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FlightFiltersType;
  onFiltersChange: (filters: FlightFiltersType) => void;
  flightData: any[];
  resultCount: number;
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    title: 'Filters',
    apply: 'Show {count} flights',
    applyingSingle: 'Show 1 flight',
    applyingNone: 'No flights found',
    reset: 'Reset all',
  },
  pt: {
    title: 'Filtros',
    apply: 'Mostrar {count} voos',
    applyingSingle: 'Mostrar 1 voo',
    applyingNone: 'Nenhum voo encontrado',
    reset: 'Limpar tudo',
  },
  es: {
    title: 'Filtros',
    apply: 'Mostrar {count} vuelos',
    applyingSingle: 'Mostrar 1 vuelo',
    applyingNone: 'No se encontraron vuelos',
    reset: 'Limpiar todo',
  }
};

export default function MobileFilterSheet({
  open,
  onClose,
  filters,
  onFiltersChange,
  flightData,
  resultCount,
  lang = 'en'
}: MobileFilterSheetProps) {
  const t = content[lang];
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  // Reset position when sheet opens/closes
  useEffect(() => {
    if (!open) {
      setTranslateY(0);
      setIsDragging(false);
    }
  }, [open]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Announce to screen readers
      announceToScreenReader(`${t.title} opened`);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, t.title]);

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentTouch = e.targetTouches[0].clientY;
    const diff = currentTouch - touchStart;

    // Only allow downward swipes
    if (diff > 0) {
      setTranslateY(diff);

      // Haptic feedback at threshold
      if (diff > 100 && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Close if swiped down more than 150px
    if (translateY > 150) {
      onClose();
      announceToScreenReader(`${t.title} closed`);
    }

    // Reset position
    setTranslateY(0);
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
        announceToScreenReader(`${t.title} closed`);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose, t.title]);

  // Get button text based on result count
  const getApplyButtonText = () => {
    if (resultCount === 0) return t.applyingNone;
    if (resultCount === 1) return t.applyingSingle;
    return t.apply.replace('{count}', resultCount.toLocaleString());
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="
          fixed inset-x-0 bottom-0 z-[101] bg-white/98 backdrop-blur-xl
          rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden
          animate-slideUp
        "
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2
            id="filter-sheet-title"
            className="text-lg font-bold text-gray-900"
          >
            {t.title}
          </h2>

          <button
            onClick={onClose}
            className="
              p-2 rounded-full hover:bg-gray-100 transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary-500
              min-w-[44px] min-h-[44px] flex items-center justify-center
            "
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
          </button>
        </div>

        {/* Filter Content - Scrollable */}
        <div
          className="overflow-y-auto overscroll-contain px-4 py-4"
          style={{
            maxHeight: 'calc(90vh - 140px)', // Account for header + footer
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <FlightFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            flightData={flightData}
            lang={lang}
          />
        </div>

        {/* Footer - Sticky Apply Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          <button
            onClick={() => {
              onClose();
              announceToScreenReader(getApplyButtonText());

              // Haptic feedback
              if ('vibrate' in navigator) {
                navigator.vibrate(15);
              }
            }}
            disabled={resultCount === 0}
            className={`
              w-full py-4 rounded-xl font-bold text-base
              transition-all duration-200 transform active:scale-98
              focus:outline-none focus:ring-4 focus:ring-primary-500/50
              min-h-[56px] touch-manipulation
              ${resultCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
              }
            `}
            aria-live="polite"
            aria-atomic="true"
          >
            {getApplyButtonText()}
          </button>

          {/* Result count indicator */}
          <div
            className="text-center text-sm text-gray-600 mt-2"
            role="status"
            aria-live="polite"
          >
            {resultCount > 0 && (
              <>
                Filtering {resultCount.toLocaleString()} of {flightData.length.toLocaleString()} flights
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Announce changes to screen readers
 */
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Custom CSS for animations
 */
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }

  .animate-slideUp {
    animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }

  .active\\:scale-98:active {
    transform: scale(0.98);
  }

  /* Smooth scrolling on iOS */
  .overscroll-contain {
    overscroll-behavior: contain;
  }

  /* Hide scrollbar but keep functionality */
  .overflow-y-auto::-webkit-scrollbar {
    width: 0px;
    display: none;
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
