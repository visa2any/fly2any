/**
 * Currency Conversion Service
 *
 * Features:
 * - Currency symbol mapping for 30+ currencies
 * - Exchange rate fetching from ExchangeRate-API (free tier)
 * - Automatic rate caching for 1 hour
 * - Conversion functions with proper formatting
 * - Support for international pricing display
 */

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface CurrencyCode {
  code: string;
  symbol: string;
  name: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
  lastUpdated: number; // timestamp
}

export interface ConversionResult {
  amount: number;
  currency: string;
  formatted: string;
}

// ===========================
// CURRENCY SYMBOL MAPPING
// ===========================

export const CURRENCIES: Record<string, CurrencyCode> = {
  // Major Currencies
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', symbolPosition: 'before', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', symbolPosition: 'before', decimalPlaces: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', symbolPosition: 'before', decimalPlaces: 0 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', symbolPosition: 'before', decimalPlaces: 2 },

  // Americas
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', symbolPosition: 'before', decimalPlaces: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', symbolPosition: 'before', decimalPlaces: 2 },
  ARS: { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', symbolPosition: 'before', decimalPlaces: 2 },
  CLP: { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', symbolPosition: 'before', decimalPlaces: 0 },
  COP: { code: 'COP', symbol: 'CO$', name: 'Colombian Peso', symbolPosition: 'before', decimalPlaces: 0 },

  // Europe
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', symbolPosition: 'before', decimalPlaces: 2 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', symbolPosition: 'after', decimalPlaces: 2 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', symbolPosition: 'after', decimalPlaces: 2 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', symbolPosition: 'after', decimalPlaces: 2 },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', symbolPosition: 'after', decimalPlaces: 2 },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', symbolPosition: 'after', decimalPlaces: 2 },

  // Asia-Pacific
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', symbolPosition: 'before', decimalPlaces: 0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', symbolPosition: 'before', decimalPlaces: 0 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', symbolPosition: 'before', decimalPlaces: 0 },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', symbolPosition: 'before', decimalPlaces: 2 },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', symbolPosition: 'before', decimalPlaces: 0 },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', symbolPosition: 'before', decimalPlaces: 2 },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', symbolPosition: 'after', decimalPlaces: 0 },

  // South Asia
  PKR: { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', symbolPosition: 'before', decimalPlaces: 0 },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', symbolPosition: 'before', decimalPlaces: 0 },

  // Middle East & Africa
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', symbolPosition: 'before', decimalPlaces: 2 },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', symbolPosition: 'before', decimalPlaces: 2 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', symbolPosition: 'before', decimalPlaces: 2 },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', symbolPosition: 'before', decimalPlaces: 2 },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', symbolPosition: 'before', decimalPlaces: 0 },

  // Eastern Europe
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', symbolPosition: 'after', decimalPlaces: 2 },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', symbolPosition: 'before', decimalPlaces: 2 },
};

// ===========================
// CACHE MANAGEMENT
// ===========================

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let cachedRates: ExchangeRates | null = null;

/**
 * Check if cached rates are still valid
 */
function isCacheValid(): boolean {
  if (!cachedRates) return false;
  const now = Date.now();
  return (now - cachedRates.lastUpdated) < CACHE_DURATION;
}

/**
 * Get cached rates if valid
 */
function getCachedRates(): ExchangeRates | null {
  if (isCacheValid()) {
    return cachedRates;
  }
  return null;
}

/**
 * Cache exchange rates
 */
function setCachedRates(rates: ExchangeRates): void {
  cachedRates = rates;
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCurrencyCache(): void {
  cachedRates = null;
}

// ===========================
// EXCHANGE RATE FETCHING
// ===========================

/**
 * Fetch exchange rates from ExchangeRate-API
 * Free tier: 1,500 requests/month
 * @param baseCurrency - Base currency code (default: USD)
 */
export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
  // Check cache first
  const cached = getCachedRates();
  if (cached && cached.base === baseCurrency) {
    console.log('✓ Using cached exchange rates');
    return cached;
  }

  try {
    console.log(`📡 Fetching exchange rates for ${baseCurrency}...`);

    // Using ExchangeRate-API free tier
    // Alternative: https://api.exchangerate-api.com/v4/latest/{baseCurrency}
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
      }
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();

    const exchangeRates: ExchangeRates = {
      base: data.base || baseCurrency,
      date: data.date || new Date().toISOString().split('T')[0],
      rates: data.rates || {},
      lastUpdated: Date.now(),
    };

    // Cache the rates
    setCachedRates(exchangeRates);

    console.log(`✓ Fetched rates for ${Object.keys(exchangeRates.rates).length} currencies`);
    return exchangeRates;
  } catch (error) {
    console.error('❌ Error fetching exchange rates:', error);

    // Return cached rates even if expired, as fallback
    if (cachedRates && cachedRates.base === baseCurrency) {
      console.log('⚠️ Using expired cached rates as fallback');
      return cachedRates;
    }

    // Ultimate fallback: return base currency only
    return {
      base: baseCurrency,
      date: new Date().toISOString().split('T')[0],
      rates: { [baseCurrency]: 1 },
      lastUpdated: Date.now(),
    };
  }
}

// ===========================
// CURRENCY CONVERSION
// ===========================

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param from - Source currency code
 * @param to - Target currency code
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  // If same currency, return original amount
  if (from === to) {
    return amount;
  }

  try {
    const rates = await fetchExchangeRates(from);

    const targetRate = rates.rates[to];
    if (!targetRate) {
      console.warn(`⚠️ No exchange rate found for ${to}, returning original amount`);
      return amount;
    }

    return amount * targetRate;
  } catch (error) {
    console.error('❌ Currency conversion error:', error);
    return amount; // Return original amount on error
  }
}

/**
 * Convert and format currency amount
 * @param amount - Amount to convert
 * @param from - Source currency code
 * @param to - Target currency code
 */
export async function convertAndFormat(
  amount: number,
  from: string,
  to: string
): Promise<ConversionResult> {
  const convertedAmount = await convertCurrency(amount, from, to);
  const formatted = formatCurrency(convertedAmount, to);

  return {
    amount: convertedAmount,
    currency: to,
    formatted,
  };
}

// ===========================
// CURRENCY FORMATTING
// ===========================

/**
 * Get currency symbol
 * @param currencyCode - Currency code (e.g., 'USD', 'EUR')
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES[currencyCode.toUpperCase()];
  return currency?.symbol || currencyCode;
}

/**
 * Get currency info
 * @param currencyCode - Currency code
 */
export function getCurrencyInfo(currencyCode: string): CurrencyCode | null {
  return CURRENCIES[currencyCode.toUpperCase()] || null;
}

/**
 * Format currency amount with proper symbol and decimal places
 * @param amount - Amount to format
 * @param currencyCode - Currency code
 * @param options - Formatting options
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: {
    showCode?: boolean; // Show currency code (e.g., "USD 100")
    compact?: boolean; // Use compact notation (e.g., "$1.2K")
    precision?: number; // Override default decimal places
  }
): string {
  const currency = CURRENCIES[currencyCode.toUpperCase()];

  if (!currency) {
    // Fallback for unknown currencies
    return `${currencyCode} ${amount.toFixed(2)}`;
  }

  const decimalPlaces = options?.precision ?? currency.decimalPlaces;
  let formattedAmount = amount.toFixed(decimalPlaces);

  // Compact notation for large amounts
  if (options?.compact && amount >= 1000) {
    if (amount >= 1000000) {
      formattedAmount = (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      formattedAmount = (amount / 1000).toFixed(1) + 'K';
    }
  } else {
    // Add thousand separators
    const parts = formattedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formattedAmount = parts.join('.');
  }

  // Build final formatted string
  let result = '';

  if (currency.symbolPosition === 'before') {
    result = `${currency.symbol}${formattedAmount}`;
  } else {
    result = `${formattedAmount}${currency.symbol}`;
  }

  // Optionally add currency code
  if (options?.showCode) {
    result = `${result} ${currency.code}`;
  }

  return result;
}

/**
 * Format price range in a currency
 * @param min - Minimum price
 * @param max - Maximum price
 * @param currencyCode - Currency code
 */
export function formatPriceRange(
  min: number,
  max: number,
  currencyCode: string
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const currency = CURRENCIES[currencyCode.toUpperCase()];
  const decimals = currency?.decimalPlaces ?? 2;

  if (min === max) {
    return formatCurrency(min, currencyCode);
  }

  // For ranges, we can omit the symbol on the second value if same currency
  return `${symbol}${min.toFixed(decimals)} - ${symbol}${max.toFixed(decimals)}`;
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Get list of all supported currencies
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  return Object.values(CURRENCIES);
}

/**
 * Get popular currencies (most commonly used for flight bookings)
 */
export function getPopularCurrencies(): CurrencyCode[] {
  const popularCodes = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'BRL', 'MXN', 'CHF'];
  return popularCodes.map(code => CURRENCIES[code]).filter(Boolean);
}

/**
 * Detect user's currency based on locale or country
 * @param locale - User's locale (e.g., 'en-US', 'pt-BR')
 */
export function detectUserCurrency(locale?: string): string {
  if (!locale && typeof navigator !== 'undefined') {
    locale = navigator.language;
  }

  if (!locale) return 'USD'; // Default fallback

  // Map locales to currencies
  const localeToCurrency: Record<string, string> = {
    'en-US': 'USD', 'en-CA': 'CAD', 'en-GB': 'GBP', 'en-AU': 'AUD', 'en-NZ': 'NZD',
    'pt-BR': 'BRL', 'pt-PT': 'EUR',
    'es-ES': 'EUR', 'es-MX': 'MXN', 'es-AR': 'ARS', 'es-CL': 'CLP', 'es-CO': 'COP',
    'fr-FR': 'EUR', 'fr-CA': 'CAD', 'fr-CH': 'CHF',
    'de-DE': 'EUR', 'de-CH': 'CHF', 'de-AT': 'EUR',
    'it-IT': 'EUR', 'it-CH': 'CHF',
    'ja-JP': 'JPY',
    'zh-CN': 'CNY', 'zh-HK': 'HKD', 'zh-TW': 'TWD',
    'ko-KR': 'KRW',
    'ar-SA': 'SAR', 'ar-AE': 'AED',
    'ru-RU': 'RUB',
    'tr-TR': 'TRY',
    'pl-PL': 'PLN',
    'cs-CZ': 'CZK',
    'sv-SE': 'SEK', 'nb-NO': 'NOK', 'da-DK': 'DKK',
    'th-TH': 'THB',
    'id-ID': 'IDR',
    'vi-VN': 'VND',
    'ms-MY': 'MYR',
    'hi-IN': 'INR',
  };

  const currency = localeToCurrency[locale];
  if (currency) return currency;

  // Try just the country code (e.g., 'en-US' -> 'US')
  const countryCode = locale.split('-')[1];
  if (countryCode) {
    const countryToCurrency: Record<string, string> = {
      'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'CA': 'CAD', 'AU': 'AUD', 'NZ': 'NZD',
      'BR': 'BRL', 'MX': 'MXN', 'AR': 'ARS', 'CL': 'CLP', 'CO': 'COP',
      'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR',
      'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK',
      'SA': 'SAR', 'AE': 'AED', 'RU': 'RUB', 'TR': 'TRY',
    };
    const detectedCurrency = countryToCurrency[countryCode];
    if (detectedCurrency) return detectedCurrency;
  }

  return 'USD'; // Final fallback
}

/**
 * Get exchange rate between two currencies
 * @param from - Source currency
 * @param to - Target currency
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  try {
    const rates = await fetchExchangeRates(from);
    return rates.rates[to] || 1;
  } catch (error) {
    console.error('❌ Error getting exchange rate:', error);
    return 1;
  }
}

// ===========================
// CLIENT-SIDE HOOKS
// ===========================

/**
 * Format currency for display in React components
 * This is a synchronous version that uses the currency symbol without conversion
 * Use this when you already have the price in the correct currency
 */
export function formatPrice(
  amount: number | string,
  currencyCode: string,
  options?: {
    showCode?: boolean;
    compact?: boolean;
    precision?: number;
  }
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${getCurrencySymbol(currencyCode)}0`;

  return formatCurrency(numAmount, currencyCode, options);
}

/**
 * Export default currency for backward compatibility
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * Smart rounding for display prices by currency
 * Rounds to psychologically appealing price points
 */
export function roundForDisplay(amount: number, currencyCode: string): number {
  const currency = CURRENCIES[currencyCode.toUpperCase()];
  if (!currency) return Math.round(amount);

  // Zero decimal currencies - round to nearest 10/100/1000
  if (currency.decimalPlaces === 0) {
    if (amount >= 10000) return Math.round(amount / 1000) * 1000;
    if (amount >= 1000) return Math.round(amount / 100) * 100;
    if (amount >= 100) return Math.round(amount / 10) * 10;
    return Math.round(amount);
  }

  // Standard currencies - round to .99 or .00
  const whole = Math.floor(amount);
  const decimal = amount - whole;
  if (decimal >= 0.5) return whole + 0.99;
  return whole;
}

/**
 * Currency service singleton
 */
export const CurrencyService = {
  // Conversion
  convert: convertCurrency,
  convertAndFormat,

  // Formatting
  format: formatCurrency,
  formatPrice,
  formatRange: formatPriceRange,

  // Info
  getSymbol: getCurrencySymbol,
  getInfo: getCurrencyInfo,
  getSupportedCurrencies,
  getPopularCurrencies,

  // Rates
  fetchRates: fetchExchangeRates,
  getRate: getExchangeRate,

  // Utilities
  detect: detectUserCurrency,
  clearCache: clearCurrencyCache,
  roundForDisplay,
};

export default CurrencyService;
