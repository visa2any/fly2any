'use client';

/**
 * Compact Currency Selector
 *
 * A minimalist currency selector for headers and search bars
 * Integrates with CurrencyContext for global state management
 */

import { useState } from 'react';
import { getPopularCurrencies, getCurrencyInfo, type CurrencyCode } from '@/lib/services/currency';

export interface CurrencySelectorCompactProps {
  value: string;
  onChange: (currency: string) => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'button';
}

export function CurrencySelectorCompact({
  value,
  onChange,
  className = '',
  variant = 'default',
}: CurrencySelectorCompactProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popularCurrencies = getPopularCurrencies();
  const currentCurrency = getCurrencyInfo(value);

  const handleSelect = (currency: string) => {
    onChange(currency);
    setIsOpen(false);
  };

  // Minimal variant (just currency code)
  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
        >
          {value}
          <svg
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
              {popularCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleSelect(curr.code)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors ${
                    value === curr.code ? 'bg-primary-50 text-primary-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-base">{curr.symbol}</span>
                    <span className="font-medium">{curr.code}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Button variant (styled button)
  if (variant === 'button') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:border-primary-500 transition-all text-sm font-medium text-gray-700 shadow-sm"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{currentCurrency?.symbol || value}</span>
          <span className="font-semibold">{value}</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Popular Currencies
                </div>
                {popularCurrencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleSelect(curr.code)}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                      value === curr.code ? 'bg-primary-50 text-primary-700 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{curr.symbol}</span>
                        <div>
                          <div className="font-medium text-sm">{curr.code}</div>
                          <div className="text-xs text-gray-500">{curr.name}</div>
                        </div>
                      </div>
                      {value === curr.code && (
                        <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-all"
      >
        <span className="text-sm font-semibold text-gray-700">{currentCurrency?.symbol || value}</span>
        <span className="text-xs font-medium text-gray-600">{value}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            <div className="p-1.5">
              {popularCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleSelect(curr.code)}
                  className={`w-full text-left px-2.5 py-2 rounded hover:bg-gray-100 transition-colors ${
                    value === curr.code ? 'bg-primary-50 text-primary-700' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base w-6">{curr.symbol}</span>
                      <div>
                        <div className="font-semibold text-sm">{curr.code}</div>
                        <div className="text-xs text-gray-500 truncate">{curr.name}</div>
                      </div>
                    </div>
                    {value === curr.code && (
                      <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CurrencySelectorCompact;
