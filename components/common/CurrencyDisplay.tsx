'use client';

/**
 * Currency Display Component
 *
 * Properly formats and displays currency amounts with correct symbols
 * Supports currency conversion and internationalization
 */

import { formatPrice, getCurrencySymbol, getCurrencyInfo } from '@/lib/services/currency';

export interface CurrencyDisplayProps {
  amount: number | string;
  currency: string;
  className?: string;
  showCode?: boolean;
  compact?: boolean;
  precision?: number;
}

/**
 * Display formatted currency amount
 */
export function CurrencyDisplay({
  amount,
  currency,
  className = '',
  showCode = false,
  compact = false,
  precision,
}: CurrencyDisplayProps) {
  const formatted = formatPrice(amount, currency, { showCode, compact, precision });

  return <span className={className}>{formatted}</span>;
}

/**
 * Display currency symbol only
 */
export function CurrencySymbol({ currency, className = '' }: { currency: string; className?: string }) {
  const symbol = getCurrencySymbol(currency);
  return <span className={className}>{symbol}</span>;
}

/**
 * Display price range
 */
export function PriceRange({
  min,
  max,
  currency,
  className = '',
}: {
  min: number;
  max: number;
  currency: string;
  className?: string;
}) {
  const symbol = getCurrencySymbol(currency);
  const currencyInfo = getCurrencyInfo(currency);
  const decimals = currencyInfo?.decimalPlaces ?? 2;

  if (min === max) {
    return <CurrencyDisplay amount={min} currency={currency} className={className} />;
  }

  return (
    <span className={className}>
      {symbol}
      {min.toFixed(decimals)} - {symbol}
      {max.toFixed(decimals)}
    </span>
  );
}

export default CurrencyDisplay;
