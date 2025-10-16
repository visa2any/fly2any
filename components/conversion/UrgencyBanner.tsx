'use client';

import { useState } from 'react';

interface Props {
  message: string;
  type?: 'deal' | 'warning' | 'info';
  closeable?: boolean;
}

export function UrgencyBanner({ message, type = 'deal', closeable = true }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles = {
    deal: 'bg-gradient-to-r from-secondary-500 to-error text-white',
    warning: 'bg-warning text-gray-900',
    info: 'bg-primary-500 text-white',
  };

  return (
    <div className={`${styles[type]} py-3 px-4 relative animate-slideDown`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        <span className="text-2xl">⚡</span>
        <span className="font-semibold text-sm md:text-base">{message}</span>
        <span className="text-2xl">⚡</span>

        {closeable && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
