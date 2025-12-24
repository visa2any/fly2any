'use client';

/**
 * Currency Context Provider
 *
 * Provides global currency state management for the application
 * Handles user currency preference with localStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  detectUserCurrency,
  convertCurrency,
  formatPrice,
  getCurrencySymbol,
  getPopularCurrencies,
  type CurrencyCode,
} from '@/lib/services/currency';

// ===========================
// TYPES
// ===========================

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convert: (amount: number, from: string) => Promise<number>;
  format: (amount: number | string, sourceCurrency?: string) => string;
  getSymbol: (currency?: string) => string;
  popularCurrencies: CurrencyCode[];
  isLoading: boolean;
}

// ===========================
// CONTEXT
// ===========================

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// ===========================
// PROVIDER
// ===========================

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [popularCurrencies, setPopularCurrencies] = useState<CurrencyCode[]>([]);

  // Initialize currency from localStorage or detect from locale
  useEffect(() => {
    const initializeCurrency = () => {
      try {
        // Try to get from localStorage
        const savedCurrency = localStorage.getItem('preferred-currency');
        if (savedCurrency) {
          setCurrencyState(savedCurrency);
        } else {
          // Detect from user locale
          const detected = detectUserCurrency();
          setCurrencyState(detected);
        }

        // Load popular currencies
        const popular = getPopularCurrencies();
        setPopularCurrencies(popular);
      } catch (error) {
        console.error('Error initializing currency:', error);
        setCurrencyState('USD'); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  // Update currency and persist to localStorage
  const setCurrency = (newCurrency: string) => {
    try {
      setCurrencyState(newCurrency);
      localStorage.setItem('preferred-currency', newCurrency);
      console.log(`✓ Currency set to ${newCurrency}`);
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  };

  // Convert amount from source currency to user's preferred currency
  const convert = async (amount: number, from: string): Promise<number> => {
    if (from === currency) {
      return amount;
    }
    return await convertCurrency(amount, from, currency);
  };

  // Format amount in user's preferred currency
  const format = (amount: number | string, sourceCurrency?: string): string => {
    const targetCurrency = sourceCurrency || currency;
    return formatPrice(amount, targetCurrency);
  };

  // Get currency symbol
  const getSymbol = (curr?: string): string => {
    return getCurrencySymbol(curr || currency);
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    convert,
    format,
    getSymbol,
    popularCurrencies,
    isLoading,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

// ===========================
// HOOK
// ===========================

// Default fallback for when used outside provider (SSR safety)
const defaultCurrencyContext: CurrencyContextType = {
  currency: 'USD',
  setCurrency: () => {},
  convert: async (amount: number) => amount,
  format: (amount: number | string) => `$${typeof amount === 'string' ? amount : amount.toFixed(2)}`,
  getSymbol: () => '$',
  popularCurrencies: [],
  isLoading: false,
};

export function useCurrency() {
  const context = useContext(CurrencyContext);
  // Return default instead of throwing - prevents SSR/hydration crashes
  if (context === undefined) {
    return defaultCurrencyContext;
  }
  return context;
}

// ===========================
// OPTIONAL: Currency Selector Component
// ===========================

export function CurrencySelector({ className = '' }: { className?: string }) {
  const { currency, setCurrency, popularCurrencies, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-200 rounded w-16 h-8 ${className}`} />;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:border-primary-500 transition-all text-sm font-medium text-gray-700"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{currency}</span>
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
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Popular Currencies
              </div>
              {popularCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                    currency === curr.code ? 'bg-primary-50 text-primary-700 font-semibold' : ''
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
                    {currency === curr.code && (
                      <svg
                        className="w-5 h-5 text-primary-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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

export default CurrencyProvider;
