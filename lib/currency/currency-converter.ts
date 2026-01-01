// Multi-Currency Support Utility
// Auto-convert prices based on client's preferred currency

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY" | "CNY" | "INR" | "MXN" | "BRL";

interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<CurrencyCode, number>;
}

// Static fallback rates (updated periodically)
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.15,
  BRL: 4.97,
};

// Currency display configuration
export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; name: string; decimals: number; locale: string }> = {
  USD: { symbol: "$", name: "US Dollar", decimals: 2, locale: "en-US" },
  EUR: { symbol: "€", name: "Euro", decimals: 2, locale: "de-DE" },
  GBP: { symbol: "£", name: "British Pound", decimals: 2, locale: "en-GB" },
  CAD: { symbol: "C$", name: "Canadian Dollar", decimals: 2, locale: "en-CA" },
  AUD: { symbol: "A$", name: "Australian Dollar", decimals: 2, locale: "en-AU" },
  CHF: { symbol: "CHF", name: "Swiss Franc", decimals: 2, locale: "de-CH" },
  JPY: { symbol: "¥", name: "Japanese Yen", decimals: 0, locale: "ja-JP" },
  CNY: { symbol: "¥", name: "Chinese Yuan", decimals: 2, locale: "zh-CN" },
  INR: { symbol: "₹", name: "Indian Rupee", decimals: 0, locale: "en-IN" },
  MXN: { symbol: "MX$", name: "Mexican Peso", decimals: 2, locale: "es-MX" },
  BRL: { symbol: "R$", name: "Brazilian Real", decimals: 2, locale: "pt-BR" },
};

// Cache for exchange rates
let cachedRates: ExchangeRates | null = null;
let cacheExpiry: number = 0;

/**
 * Fetch latest exchange rates from Open Exchange Rates API
 */
async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();

  // Return cached rates if still valid (1 hour cache)
  if (cachedRates && cacheExpiry > now) {
    return cachedRates.rates;
  }

  try {
    const apiKey = process.env.OPEN_EXCHANGE_RATES_API_KEY;
    if (!apiKey) {
      console.warn("[CURRENCY] No API key, using fallback rates");
      return FALLBACK_RATES;
    }

    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const data = await response.json();

    // Extract only our supported currencies
    const rates: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;
    for (const code of Object.keys(CURRENCY_CONFIG) as CurrencyCode[]) {
      rates[code] = data.rates[code] || FALLBACK_RATES[code];
    }

    cachedRates = {
      base: "USD",
      date: new Date().toISOString(),
      rates,
    };
    cacheExpiry = now + 3600000; // 1 hour

    return rates;
  } catch (error) {
    console.error("[CURRENCY] Fetch error:", error);
    return FALLBACK_RATES;
  }
}

/**
 * Convert amount between currencies
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  const rates = await fetchExchangeRates();

  // Convert to USD first, then to target currency
  const amountInUSD = fromCurrency === "USD" ? amount : amount / rates[fromCurrency];
  const convertedAmount = toCurrency === "USD" ? amountInUSD : amountInUSD * rates[toCurrency];

  return convertedAmount;
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options?: { compact?: boolean; showSymbol?: boolean }
): string {
  const config = CURRENCY_CONFIG[currency];
  const { compact = false, showSymbol = true } = options || {};

  const formatter = new Intl.NumberFormat(config.locale, {
    style: showSymbol ? "currency" : "decimal",
    currency: showSymbol ? currency : undefined,
    maximumFractionDigits: config.decimals,
    minimumFractionDigits: compact ? 0 : config.decimals,
    notation: compact && amount >= 10000 ? "compact" : "standard",
  });

  return formatter.format(amount);
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) return 1;

  const rates = await fetchExchangeRates();
  const fromRate = fromCurrency === "USD" ? 1 : rates[fromCurrency];
  const toRate = toCurrency === "USD" ? 1 : rates[toCurrency];

  return toRate / fromRate;
}

/**
 * Convert all prices in quote to target currency
 */
export async function convertQuotePricing(
  quote: {
    total: number;
    subtotal: number;
    taxes: number;
    fees: number;
    discount: number;
    currency: CurrencyCode;
    flights?: { price: number }[];
    hotels?: { price: number }[];
    activities?: { price: number }[];
    transfers?: { price: number }[];
    carRentals?: { price: number }[];
    customItems?: { price: number }[];
  },
  targetCurrency: CurrencyCode
): Promise<{
  total: number;
  subtotal: number;
  taxes: number;
  fees: number;
  discount: number;
  currency: CurrencyCode;
  exchangeRate: number;
  originalCurrency: CurrencyCode;
  originalTotal: number;
}> {
  const rate = await getExchangeRate(quote.currency, targetCurrency);

  return {
    total: quote.total * rate,
    subtotal: quote.subtotal * rate,
    taxes: quote.taxes * rate,
    fees: quote.fees * rate,
    discount: quote.discount * rate,
    currency: targetCurrency,
    exchangeRate: rate,
    originalCurrency: quote.currency,
    originalTotal: quote.total,
  };
}

/**
 * Detect user's preferred currency based on locale/country
 */
export function detectCurrency(
  countryCode?: string,
  acceptLanguage?: string
): CurrencyCode {
  const countryToCurrency: Record<string, CurrencyCode> = {
    US: "USD",
    GB: "GBP",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    CA: "CAD",
    AU: "AUD",
    CH: "CHF",
    JP: "JPY",
    CN: "CNY",
    IN: "INR",
    MX: "MXN",
    BR: "BRL",
  };

  if (countryCode && countryToCurrency[countryCode.toUpperCase()]) {
    return countryToCurrency[countryCode.toUpperCase()];
  }

  // Try to detect from Accept-Language header
  if (acceptLanguage) {
    const lang = acceptLanguage.split(",")[0].split("-")[1]?.toUpperCase();
    if (lang && countryToCurrency[lang]) {
      return countryToCurrency[lang];
    }
  }

  return "USD";
}
