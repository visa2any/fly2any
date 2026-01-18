'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  children: ReactNode;
  resultCount: number;
  activeFilterCount: number;
  title?: string;
}

/**
 * MobileFilterSheet - Bottom sheet component for mobile filter UI
 *
 * Features:
 * - Slide-up animation with spring physics
 * - Backdrop with blur effect
 * - Handle bar for visual affordance
 * - Apply/Clear action buttons
 * - Live result count display
 * - Scroll locking when open
 * - WCAG compliant interactions
 */
export function MobileFilterSheet({
  isOpen,
  onClose,
  onApply,
  onClear,
  children,
  resultCount,
  activeFilterCount,
  title = 'Filters',
}: MobileFilterSheetProps) {
  // Lock body scroll when sheet is open (iOS-safe implementation)
  useEffect(() => {
    if (isOpen) {
      // Lock scroll without position:fixed (which breaks mobile scroll)
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Prevent iOS bounce
    } else {
      // Restore scroll
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      // Ensure cleanup even if component unmounts unexpectedly
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[101]"
            style={{ maxHeight: '85vh' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-sheet-title"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" aria-hidden="true" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2
                  id="filter-sheet-title"
                  className="text-xl font-bold text-gray-900"
                >
                  {title}
                </h2>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-primary-500 text-white text-xs font-bold rounded-full shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="overflow-y-auto px-6 py-4"
              style={{
                maxHeight: 'calc(85vh - 240px)',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>

            {/* Footer Actions - with bottom nav padding */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3" style={{ paddingBottom: 'calc(16px + 56px + env(safe-area-inset-bottom, 0px))' }}>
              <button
                onClick={onClear}
                className="flex-1 min-h-[44px] px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Clear all filters"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 min-h-[48px] px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] transition-all shadow-lg"
                style={{ boxShadow: '0 4px 14px rgba(214, 58, 53, 0.3)' }}
                aria-label={`Apply filters and show ${resultCount} results`}
              >
                Show {resultCount} Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
