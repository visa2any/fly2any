/**
 * Price utility functions for USD-based market
 */

/**
 * Parse price string to numeric value (USD format)
 * Handles both $1,234.56 and 1234.56 formats
 */
export function parsePrice(priceString: string): number {
  if (!priceString) return 0;
  
  // Remove currency symbols and convert to number
  // For USD: $1,234.56 -> 1234.56
  const numericString = priceString
    .replace(/[$,\s]/g, '') // Remove $, commas, and spaces
    .replace(/[^\d.]/g, ''); // Keep only digits and decimal point
  
  return parseFloat(numericString) || 0;
}

/**
 * Format number as USD currency
 */
export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Get price from flight offer (standardized for USD market)
 */
export function getFlightPrice(flight: any): number {
  if (typeof flight.totalPrice === 'string') {
    return parsePrice(flight.totalPrice);
  }
  return flight.totalPrice || 0;
}

/**
 * Calculate average price from flight offers
 */
export function calculateAveragePrice(flights: any[]): number {
  if (!flights.length) return 0;
  
  const total = flights.reduce((sum, flight) => sum + getFlightPrice(flight), 0);
  return total / flights.length;
}

/**
 * Format price range for display
 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatUSD(min)} - ${formatUSD(max)}`;
}

/**
 * Calculate savings amount
 */
export function calculateSavings(originalPrice: number, currentPrice: number): number {
  return Math.max(0, originalPrice - currentPrice);
}

/**
 * Calculate percentage savings
 */
export function calculateSavingsPercentage(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}