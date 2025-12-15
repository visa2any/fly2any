/**
 * Flight Markup Configuration
 *
 * Defines markup strategy for Duffel NDC flights.
 *
 * Strategy:
 * - Apply MAX($22 minimum, 7% of flight price)
 * - This ensures $15+ net profit after Duffel costs
 *
 * Duffel Cost Breakdown (per booking):
 * - $3 per order fee
 * - 1% managed content fee
 * - 2.9% payment processing (international cards)
 * = Total: $3 + 3.9% of fare
 *
 * Profit Calculation:
 * - Markup: MAX($22, price × 7%)
 * - Duffel Cost: $3 + (price × 3.9%)
 * - Net Profit: Markup - Duffel Cost
 *
 * Examples:
 * | Flight Price | Markup    | Duffel Cost | Net Profit |
 * |--------------|-----------|-------------|------------|
 * | $100         | $22 (min) | $6.90       | $15.10     |
 * | $200         | $22 (min) | $10.80      | $11.20     |
 * | $300         | $22 (min) | $14.70      | $7.30      |
 * | $350         | $24.50    | $16.65      | $7.85      |
 * | $500         | $35.00    | $22.50      | $12.50     |
 *
 * IMPORTANT: Ancillary services add additional profit:
 * - Baggage: 25% markup
 * - Seats: 25% markup
 * - CFAR: 29% markup
 * See: lib/config/ancillary-markup.ts
 */

export const FLIGHT_MARKUP = {
  // Duffel flights markup configuration
  duffel: {
    // Percentage-based markup
    percentage: 0.07, // 7%

    // Minimum markup (whichever is higher)
    minimumAmount: 22, // $22 minimum

    // Maximum markup cap (for very expensive flights)
    maximumAmount: 200, // $200 cap

    // Currency
    currency: 'USD',
  },

  // Consolidator flights (commission-based, no customer markup needed)
  consolidator: {
    // No markup applied - we earn commission from airline
    percentage: 0,
    minimumAmount: 0,
    maximumAmount: 0,
    currency: 'USD',
  },
} as const;

/**
 * Duffel cost structure (for profit calculations)
 *
 * Payment Model: Balance with Markup Collection
 * - Customer pays full amount (NET + markup) to Duffel
 * - Duffel pays airline the NET amount
 * - Duffel tracks your markup and pays it out to you
 * - You only pay the $3 per order fee
 */
export const DUFFEL_COSTS = {
  perOrderFee: 3.0,           // $3 per booking (ONLY fee when using balance + markup)
  managedContentPct: 0,       // No % fee with balance payment
  paymentProcessingPct: 0,    // No card processing fee (Duffel handles)
  totalVariablePct: 0,        // No variable fees
} as const;

/**
 * Consolidator cost structure
 */
export const CONSOLIDATOR_COSTS = {
  flatFee: 5.0, // $5 per booking (regardless of price)
} as const;

/**
 * Routing threshold
 */
export const ROUTING_THRESHOLD = {
  // Flights under this price → Duffel (ancillary opportunity)
  // Flights at or above this price → Consolidator (if has commission)
  priceThreshold: 500, // $500
} as const;

/**
 * Apply markup to a Duffel flight price
 *
 * Formula: MAX(minimum, price × percentage)
 *
 * @param netPrice - The NET price from Duffel (what we pay)
 * @returns Object with customer price, markup amount, and net profit
 */
export function applyFlightMarkup(netPrice: number): {
  customerPrice: number;
  markupAmount: number;
  netPrice: number;
  duffelCost: number;
  netProfit: number;
  markupPercentage: number;
} {
  const config = FLIGHT_MARKUP.duffel;

  // Calculate percentage-based markup
  let markupAmount = netPrice * config.percentage;

  // Apply minimum bound
  markupAmount = Math.max(markupAmount, config.minimumAmount);

  // Apply maximum cap
  markupAmount = Math.min(markupAmount, config.maximumAmount);

  // Round to 2 decimal places
  markupAmount = Math.round(markupAmount * 100) / 100;

  // Calculate customer price
  const customerPrice = Math.round((netPrice + markupAmount) * 100) / 100;

  // Calculate Duffel costs
  const duffelCost = DUFFEL_COSTS.perOrderFee + (netPrice * DUFFEL_COSTS.totalVariablePct);

  // Calculate net profit
  const netProfit = Math.round((markupAmount - duffelCost) * 100) / 100;

  // Calculate effective markup percentage
  const effectiveMarkupPct = netPrice > 0 ? (markupAmount / netPrice) * 100 : 0;

  return {
    customerPrice,
    markupAmount,
    netPrice,
    duffelCost: Math.round(duffelCost * 100) / 100,
    netProfit,
    markupPercentage: Math.round(effectiveMarkupPct * 10) / 10,
  };
}

/**
 * Check if a flight should be routed to Duffel or Consolidator
 *
 * @param totalFare - Total flight fare
 * @param hasCommission - Whether airline has negotiated commission
 * @returns Routing channel and reason
 */
export function determineRoutingChannel(
  totalFare: number,
  hasCommission: boolean
): {
  channel: 'DUFFEL' | 'CONSOLIDATOR';
  reason: string;
} {
  // Rule 1: Under $500 → Always Duffel (ancillary opportunity)
  if (totalFare < ROUTING_THRESHOLD.priceThreshold) {
    return {
      channel: 'DUFFEL',
      reason: 'under_500_ancillary_opportunity',
    };
  }

  // Rule 2: $500+ with commission → Consolidator
  if (hasCommission) {
    return {
      channel: 'CONSOLIDATOR',
      reason: 'over_500_has_commission',
    };
  }

  // Rule 3: $500+ without commission → Duffel
  return {
    channel: 'DUFFEL',
    reason: 'over_500_no_commission',
  };
}

/**
 * Get markup summary for display/reporting
 */
export function getFlightMarkupSummary() {
  return {
    duffel: `${FLIGHT_MARKUP.duffel.percentage * 100}% or $${FLIGHT_MARKUP.duffel.minimumAmount} minimum (max $${FLIGHT_MARKUP.duffel.maximumAmount})`,
    consolidator: 'Commission-based (no customer markup)',
    routingThreshold: `$${ROUTING_THRESHOLD.priceThreshold}`,
    duffelCosts: `$${DUFFEL_COSTS.perOrderFee} + ${DUFFEL_COSTS.totalVariablePct * 100}%`,
    consolidatorCosts: `$${CONSOLIDATOR_COSTS.flatFee} flat`,
  };
}

/**
 * Calculate estimated profit for a Duffel booking
 */
export function estimateDuffelProfit(
  flightPrice: number,
  estimatedAncillaryRevenue: number = 0
): {
  flightProfit: number;
  ancillaryProfit: number;
  totalProfit: number;
  breakdown: {
    markup: number;
    duffelCost: number;
    ancillaryMarkup: number;
  };
} {
  const flightMarkup = applyFlightMarkup(flightPrice);

  // Ancillary profit (average 25% markup already applied)
  const ancillaryProfit = estimatedAncillaryRevenue * 0.25;

  return {
    flightProfit: flightMarkup.netProfit,
    ancillaryProfit: Math.round(ancillaryProfit * 100) / 100,
    totalProfit: Math.round((flightMarkup.netProfit + ancillaryProfit) * 100) / 100,
    breakdown: {
      markup: flightMarkup.markupAmount,
      duffelCost: flightMarkup.duffelCost,
      ancillaryMarkup: Math.round(ancillaryProfit * 100) / 100,
    },
  };
}
