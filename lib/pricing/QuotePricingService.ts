/**
 * Unified Quote Pricing Service
 * 
 * Single Source of Truth (SSOT) for all pricing calculations
 * - Used by both frontend and backend
 * - Handles all product types consistently
 * - Ensures pricing invariants always hold
 * 
 * CRITICAL: This is the ONLY place where pricing logic lives
 * All other code must use this service, never calculate independently
 */

export interface PriceInput {
  price: number;
  priceType: 'total' | 'per_person' | 'per_night' | 'per_unit';
  priceAppliesTo?: number; // Number of people/units covered by this price
  nights?: number; // For per_night calculations
}

export interface PricingContext {
  travelers: number;
  rooms?: number;
  currency: string;
  agentMarkupPercent: number;
  taxes: number;
  fees: number;
  discount: number;
  productType?: string;
}

export interface PriceBreakdown {
  basePrice: number;
  productMarkup: number;
  productMarkupPercent: number;
  subtotal: number;
  agentMarkup: number;
  agentMarkupPercent: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  perPerson: number;
  currency: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Product-specific markup rules
 * - Flights: MAX($22, 7%) capped at $200
 * - Transfers/Tours: MAX($35, 35%)
 * - Hotels: No markup (room pricing)
 * - Activities: No markup (per-person pricing)
 */
const PRODUCT_MARKUP_RULES: Record<string, { minMarkup: number; percent: number; maxMarkup: number; appliesTo: 'net_price' | 'total' | 'higher' }> = {
  flight: {
    minMarkup: 22,
    percent: 0.07,
    maxMarkup: 200,
    appliesTo: 'net_price'
  },
  transfer: {
    minMarkup: 35,
    percent: 0.35,
    maxMarkup: Infinity, // No cap
    appliesTo: 'higher'
  },
  tour: {
    minMarkup: 35,
    percent: 0.35,
    maxMarkup: Infinity, // No cap
    appliesTo: 'higher'
  },
  activity: {
    minMarkup: 0,
    percent: 0.0,
    maxMarkup: 0,
    appliesTo: 'total'
  },
  hotel: {
    minMarkup: 0,
    percent: 0.0,
    maxMarkup: 0,
    appliesTo: 'total'
  },
};

/**
 * Calculate final price for a single item
 * 
 * This function:
 * 1. Interprets priceType to get base price
 * 2. Applies product-specific markup rules
 * 3. Returns item-level breakdown
 * 
 * CRITICAL FIX #1: Hotels priced per_night do NOT multiply by guests
 * - Hotel APIs return per-room, per-night pricing
 * - The price already covers all guests in the room
 * - We only multiply by nights, NOT by travelers
 */
export function calculateItemPrice(
  input: PriceInput,
  context: PricingContext
): PriceBreakdown {
  const productType = context.productType || 'unknown';
  const markupRule = PRODUCT_MARKUP_RULES[productType];

  // Step 1: Calculate base price based on priceType
  let basePrice = input.price;

  switch (input.priceType) {
    case 'per_person':
      // Per-person items: multiply by number of travelers
      basePrice = input.price * (input.priceAppliesTo || context.travelers);
      break;

    case 'per_night':
      // CRITICAL FIX #1: Per-night items multiply by nights ONLY
      // - Hotels: price is per room per night
      // - Does NOT multiply by guests
      // - priceAppliesTo indicates who the room accommodates, NOT multiplication factor
      basePrice = input.price * (input.nights || 1);
      break;

    case 'per_unit':
      // Per-unit items: price covers the entire unit (car, transfer, etc.)
      basePrice = input.price;
      break;

    case 'total':
    default:
      // Total items: price already covers everything (flights, etc.)
      basePrice = input.price;
      break;
  }

  // Step 2: Apply product-specific markup
  let productMarkup = 0;

  if (markupRule) {
    if (markupRule.appliesTo === 'higher') {
      // Use higher of minMarkup or percentage
      const minMarkupAmount = markupRule.minMarkup;
      const percentMarkupAmount = basePrice * markupRule.percent;
      productMarkup = Math.max(minMarkupAmount, percentMarkupAmount);
    } else if (markupRule.appliesTo === 'net_price') {
      // Apply percentage with min/max caps
      productMarkup = basePrice * markupRule.percent;
      productMarkup = Math.max(markupRule.minMarkup, productMarkup);
      productMarkup = Math.min(markupRule.maxMarkup, productMarkup);
    }
    // appliesTo: 'total' means no product markup
  }

  const subtotal = basePrice + productMarkup;

  // Return item breakdown (agent markup applied at quote level)
  return {
    basePrice,
    productMarkup,
    productMarkupPercent: basePrice > 0 ? (productMarkup / basePrice) * 100 : 0,
    subtotal,
    agentMarkup: 0, // Applied at quote level
    agentMarkupPercent: 0,
    taxes: 0, // Applied at quote level
    fees: 0, // Applied at quote level
    discount: 0, // Applied at quote level
    total: subtotal,
    perPerson: context.travelers > 0 ? subtotal / context.travelers : subtotal,
    currency: context.currency,
  };
}

/**
 * Calculate quote-level pricing
 * 
 * This function:
 * 1. Calculates each item's price (with product markup)
 * 2. Aggregates to quote subtotal
 * 3. Applies agent markup (only ONCE)
 * 4. Adds taxes, fees, discounts
 * 5. Returns complete breakdown
 * 
 * CRITICAL FIX #2: Prevent double markup
 * - Product markup is already in item totals
 * - Agent markup only applies to BASE prices, not marked-up prices
 * - This ensures: Total = Base + ProductMarkup + AgentMarkup + Taxes - Discount
 */
export function calculateQuotePricing(
  items: Array<{ price: number; priceType: PriceInput['priceType']; priceAppliesTo?: number; nights?: number; type?: string }>,
  context: PricingContext
): PriceBreakdown {
  if (!items || items.length === 0) {
    return {
      basePrice: 0,
      productMarkup: 0,
      productMarkupPercent: 0,
      subtotal: 0,
      agentMarkup: 0,
      agentMarkupPercent: context.agentMarkupPercent,
      taxes: context.taxes,
      fees: context.fees,
      discount: context.discount,
      total: context.taxes + context.fees - context.discount,
      perPerson: 0,
      currency: context.currency,
    };
  }

  // Step 1: Calculate each item's price (with product markup)
  const itemPrices = items.map(item =>
    calculateItemPrice(
      {
        price: item.price,
        priceType: item.priceType,
        priceAppliesTo: item.priceAppliesTo,
        nights: item.nights,
      },
      {
        ...context,
        productType: item.type || 'unknown',
      }
    )
  );

  // Step 2: Aggregate BASE prices (before any markup)
  const totalBasePrice = itemPrices.reduce((sum, ip) => sum + ip.basePrice, 0);

  // Step 3: Aggregate PRODUCT markups
  const totalProductMarkup = itemPrices.reduce((sum, ip) => sum + ip.productMarkup, 0);

  // Step 4: Calculate subtotal (base + product markup)
  const subtotal = totalBasePrice + totalProductMarkup;

  // Step 5: Apply AGENT markup to BASE prices only (CRITICAL FIX #2)
  // - Agent markup applies to base price, not to already-marked-up prices
  // - This prevents double markup: Base × (1 + ProductMarkup%) × (1 + AgentMarkup%)
  const agentMarkup = totalBasePrice * (context.agentMarkupPercent / 100);

  // Step 6: Calculate final total
  const total = subtotal + agentMarkup + context.taxes + context.fees - context.discount;

  // Step 7: Calculate per-person
  const perPerson = context.travelers > 0 ? total / context.travelers : total;

  return {
    basePrice: totalBasePrice,
    productMarkup: totalProductMarkup,
    productMarkupPercent: totalBasePrice > 0 ? (totalProductMarkup / totalBasePrice) * 100 : 0,
    subtotal,
    agentMarkup,
    agentMarkupPercent: context.agentMarkupPercent,
    taxes: context.taxes,
    fees: context.fees,
    discount: context.discount,
    total,
    perPerson,
    currency: context.currency,
  };
}

/**
 * Validate pricing integrity
 * 
 * Ensures all pricing invariants hold:
 * - Total = subtotal + agentMarkup + taxes + fees - discount
 * - PerPerson × travelers = total
 * - No negative values (except discount)
 */
export function validatePricing(breakdown: PriceBreakdown, travelers: number): ValidationResult {
  const errors: string[] = [];

  // Invariant 1: Total calculation
  const expectedTotal = breakdown.subtotal + breakdown.agentMarkup + breakdown.taxes + breakdown.fees - breakdown.discount;
  if (Math.abs(breakdown.total - expectedTotal) > 0.01) {
    errors.push(`Total mismatch: ${breakdown.total} != ${expectedTotal} (diff: ${(breakdown.total - expectedTotal).toFixed(2)})`);
  }

  // Invariant 2: Per-person calculation
  const expectedPerPerson = travelers > 0 ? breakdown.total / travelers : breakdown.total;
  if (Math.abs(breakdown.perPerson - expectedPerPerson) > 0.01) {
    errors.push(`Per-person mismatch: ${breakdown.perPerson} != ${expectedPerPerson.toFixed(2)}`);
  }

  // Invariant 3: No negative values
  if (breakdown.basePrice < 0) errors.push('Base price cannot be negative');
  if (breakdown.total < 0) errors.push('Total cannot be negative');
  if (breakdown.subtotal < 0) errors.push('Subtotal cannot be negative');
  if (breakdown.agentMarkup < 0) errors.push('Agent markup cannot be negative');
  if (breakdown.productMarkup < 0) errors.push('Product markup cannot be negative');

  // Invariant 4: Markup percentages reasonable
  if (breakdown.agentMarkupPercent < 0 || breakdown.agentMarkupPercent > 100) {
    errors.push(`Agent markup percent invalid: ${breakdown.agentMarkupPercent}%`);
  }
  if (breakdown.productMarkupPercent < 0) {
    errors.push(`Product markup percent invalid: ${breakdown.productMarkupPercent}%`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format pricing for Agent View display
 * Shows detailed breakdown including both markups
 */
export function formatForAgentView(breakdown: PriceBreakdown) {
  return {
    subtotal: breakdown.subtotal,
    basePrice: breakdown.basePrice,
    productMarkup: breakdown.productMarkup,
    agentMarkup: breakdown.agentMarkup,
    agentMarkupPercent: breakdown.agentMarkupPercent,
    taxes: breakdown.taxes,
    fees: breakdown.fees,
    discount: breakdown.discount,
    total: breakdown.total,
    perPerson: breakdown.perPerson,
    currency: breakdown.currency,
  };
}

/**
 * Format pricing for Client View display
 * Shows simplified total (hides markup details)
 */
export function formatForClientView(breakdown: PriceBreakdown) {
  return {
    total: breakdown.total,
    perPerson: breakdown.perPerson,
    currency: breakdown.currency,
  };
}
