'use client';

import { useState, useEffect } from 'react';

// Supported currencies with display info (matches middleware country mappings)
export const currencies = {
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  // South America
  ARS: { symbol: 'AR$', name: 'Argentine Peso', flag: '🇦🇷' },
  CLP: { symbol: 'CL$', name: 'Chilean Peso', flag: '🇨🇱' },
  COP: { symbol: 'CO$', name: 'Colombian Peso', flag: '🇨🇴' },
  PEN: { symbol: 'S/', name: 'Peruvian Sol', flag: '🇵🇪' },
  // Europe
  CHF: { symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  PLN: { symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱' },
  // Asia
  CNY: { symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  KRW: { symbol: '₩', name: 'Korean Won', flag: '🇰🇷' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  THB: { symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  // Middle East
  AED: { symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal', flag: '🇸🇦' },
  ILS: { symbol: '₪', name: 'Israeli Shekel', flag: '🇮🇱' },
  // Africa
  ZAR: { symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
} as const;

export type CurrencyCode = keyof typeof currencies;
export const defaultCurrency: CurrencyCode = 'USD';

export function getCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return defaultCurrency;

  const cookies = document.cookie.split(';');
  const currCookie = cookies.find(c => c.trim().startsWith('fly2any_currency='));

  if (currCookie) {
    const curr = currCookie.split('=')[1].trim();
    // Return if known currency, otherwise fallback to USD
    if (curr in currencies) return curr as CurrencyCode;
    // Log unknown currency for debugging
    console.warn(`Unknown currency from cookie: ${curr}, falling back to USD`);
  }

  return defaultCurrency;
}

export function setCurrency(currency: CurrencyCode): void {
  if (typeof window === 'undefined') return;

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `fly2any_currency=${currency}; path=/; max-age=${maxAge}; SameSite=Lax`;
  localStorage.setItem('fly2any_currency', currency);

  // Dispatch event for components to react without reload
  window.dispatchEvent(new CustomEvent('currencyChange', { detail: currency }));
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(defaultCurrency);

  useEffect(() => {
    setCurrencyState(getCurrency());

    const handleChange = (e: CustomEvent<CurrencyCode>) => {
      setCurrencyState(e.detail);
    };

    window.addEventListener('currencyChange', handleChange as EventListener);
    return () => window.removeEventListener('currencyChange', handleChange as EventListener);
  }, []);

  const changeCurrency = (curr: CurrencyCode) => {
    setCurrency(curr);
    setCurrencyState(curr);
  };

  return {
    currency,
    setCurrency: changeCurrency,
    currencyInfo: currencies[currency],
  };
}
