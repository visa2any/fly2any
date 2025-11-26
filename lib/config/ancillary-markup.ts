/**
 * Ancillary Services Markup Configuration
 *
 * Defines markup percentages for NDC ancillary services.
 * These markups are applied to the NET cost from Duffel API.
 *
 * Revenue Model:
 * - Customer pays: NET price + (NET price × markup%)
 * - Your profit: NET price × markup%
 *
 * Example with 25% baggage markup:
 * - Duffel NET: $40
 * - Customer pays: $40 + ($40 × 0.25) = $50
 * - Your profit: $10
 */

export const ANCILLARY_MARKUP = {
  // Baggage markup: 25%
  baggage: {
    percentage: 0.25, // 25%
    minMarkup: 3,     // Minimum $3 markup (for very cheap bags)
    maxMarkup: 50,    // Maximum $50 markup (cap for expensive bags)
  },

  // CFAR (Cancel For Any Reason) markup: 29%
  cfar: {
    percentage: 0.29, // 29%
    minMarkup: 5,     // Minimum $5 markup
    maxMarkup: 100,   // Maximum $100 markup
  },

  // Seat selection markup: 25%
  seats: {
    percentage: 0.25, // 25%
    minMarkup: 2,     // Minimum $2 markup (for free/cheap seats)
    maxMarkup: 75,    // Maximum $75 markup (cap for first class)
  },
} as const;

/**
 * Apply markup to a price
 *
 * @param netPrice - The NET price from airline/Duffel
 * @param serviceType - Type of service ('baggage', 'cfar', 'seats')
 * @returns Object with customer price, markup amount, and net price
 */
export function applyMarkup(
  netPrice: number,
  serviceType: 'baggage' | 'cfar' | 'seats'
): {
  customerPrice: number;
  markupAmount: number;
  netPrice: number;
  markupPercentage: number;
} {
  const config = ANCILLARY_MARKUP[serviceType];

  // Calculate markup
  let markupAmount = netPrice * config.percentage;

  // Apply min/max bounds
  markupAmount = Math.max(markupAmount, config.minMarkup);
  markupAmount = Math.min(markupAmount, config.maxMarkup);

  // Round to 2 decimal places
  markupAmount = Math.round(markupAmount * 100) / 100;

  const customerPrice = Math.round((netPrice + markupAmount) * 100) / 100;

  return {
    customerPrice,
    markupAmount,
    netPrice,
    markupPercentage: config.percentage * 100,
  };
}

/**
 * Apply markup to a price string (e.g., "45.00")
 */
export function applyMarkupToString(
  netPriceString: string,
  serviceType: 'baggage' | 'cfar' | 'seats'
): {
  customerPrice: string;
  markupAmount: number;
  netPrice: number;
} {
  const netPrice = parseFloat(netPriceString);
  const result = applyMarkup(netPrice, serviceType);

  return {
    customerPrice: result.customerPrice.toFixed(2),
    markupAmount: result.markupAmount,
    netPrice: result.netPrice,
  };
}

/**
 * Get markup summary for reporting/admin
 */
export function getMarkupSummary() {
  return {
    baggage: `${ANCILLARY_MARKUP.baggage.percentage * 100}% (min $${ANCILLARY_MARKUP.baggage.minMarkup}, max $${ANCILLARY_MARKUP.baggage.maxMarkup})`,
    cfar: `${ANCILLARY_MARKUP.cfar.percentage * 100}% (min $${ANCILLARY_MARKUP.cfar.minMarkup}, max $${ANCILLARY_MARKUP.cfar.maxMarkup})`,
    seats: `${ANCILLARY_MARKUP.seats.percentage * 100}% (min $${ANCILLARY_MARKUP.seats.minMarkup}, max $${ANCILLARY_MARKUP.seats.maxMarkup})`,
  };
}
