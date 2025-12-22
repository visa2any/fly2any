'use client';

import { useState, useEffect } from 'react';

// Supported currencies with display info
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
} as const;

export type CurrencyCode = keyof typeof currencies;
export const defaultCurrency: CurrencyCode = 'USD';

export function getCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return defaultCurrency;

  const cookies = document.cookie.split(';');
  const currCookie = cookies.find(c => c.trim().startsWith('fly2any_currency='));

  if (currCookie) {
    const curr = currCookie.split('=')[1].trim() as CurrencyCode;
    if (curr in currencies) return curr;
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
