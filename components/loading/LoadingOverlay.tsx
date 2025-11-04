'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import LoadingSpinner from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
  transparent?: boolean;
  showSpinner?: boolean;
  children?: React.ReactNode;
}

export default function LoadingOverlay({
  isOpen,
  message = 'Loading...',
  transparent = false,
  showSpinner = true,
  children,
}: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const overlay = (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center',
        transparent
          ? 'bg-white/50 backdrop-blur-sm'
          : 'bg-white/90 backdrop-blur-md'
      )}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4 p-8">
        {showSpinner && (
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            {/* Spinning ring */}
            <div className="w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            {/* Inner dot */}
            <div className="absolute inset-4 bg-primary-50 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {message && (
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-900">{message}</p>
            {children}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

// Specialized variants
export function PaymentLoadingOverlay({ isOpen }: { isOpen: boolean }) {
  return (
    <LoadingOverlay
      isOpen={isOpen}
      message="Processing your payment..."
    >
      <p className="text-sm text-gray-600">This may take a few moments</p>
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Secure payment processing</span>
      </div>
    </LoadingOverlay>
  );
}

export function BookingLoadingOverlay({ isOpen }: { isOpen: boolean }) {
  return (
    <LoadingOverlay
      isOpen={isOpen}
      message="Confirming your booking..."
    >
      <p className="text-sm text-gray-600">Almost there!</p>
    </LoadingOverlay>
  );
}
