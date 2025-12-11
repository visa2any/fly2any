/**
 * Fare Reconciliation Types
 *
 * Type definitions for fare comparison testing between UI and API
 */

export interface UIFareData {
  /** DOM-captured price string (e.g., "$299.00") */
  priceString: string;
  /** Parsed price value */
  priceValue: number;
  /** Currency code */
  currency: string;
  /** Fare family/tier name (Basic, Standard, Plus, Flex) */
  fareFamily: string;
  /** Fare description text */
  description: string;
  /** Icons displayed on the fare tile */
  icons: string[];
  /** Cabin class */
  cabinClass: string;
  /** Baggage allowance */
  baggage: {
    carryOn: string;
    checked: string;
  };
  /** Change/refund policy */
  policies: {
    changeable: boolean;
    refundable: boolean;
    changeDescription?: string;
    refundDescription?: string;
  };
  /** Ancillary services displayed */
  ancillaries: string[];
  /** Raw DOM HTML for debugging */
  rawHtml?: string;
}

export interface APIFareData {
  /** Offer ID */
  offerId: string;
  /** Base price from API */
  basePrice: number;
  /** Total price including taxes */
  totalPrice: number;
  /** Currency code */
  currency: string;
  /** Calculated customer price (with markup) */
  customerPrice: number;
  /** Markup amount applied */
  markupAmount: number;
  /** Fare family name */
  fareFamily: string;
  /** Cabin class */
  cabinClass: string;
  /** Baggage details per segment */
  baggage: {
    carryOn?: { quantity: number; weight?: number };
    checked?: { quantity: number; weight?: number };
  };
  /** Fare rules */
  fareRules: {
    changeable: boolean;
    refundable: boolean;
    changeFee?: number;
    refundFee?: number;
  };
  /** Traveler pricing breakdown */
  travelerPricing: Array<{
    travelerId: string;
    travelerType: string;
    price: number;
  }>;
  /** Raw API response for debugging */
  rawResponse?: object;
}

export interface FareComparisonResult {
  /** Unique test ID */
  testId: string;
  /** Timestamp of comparison */
  timestamp: string;
  /** Search parameters used */
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    cabinClass: string;
  };
  /** UI fare data captured */
  uiFare: UIFareData;
  /** API fare data fetched */
  apiFare: APIFareData;
  /** Comparison results */
  comparison: {
    /** Price match within tolerance */
    priceMatch: boolean;
    /** Price difference (UI - API) */
    priceDifference: number;
    /** Percentage difference */
    percentageDifference: number;
    /** Fare family match */
    fareFamilyMatch: boolean;
    /** Cabin class match */
    cabinClassMatch: boolean;
    /** Baggage match */
    baggageMatch: boolean;
    /** Policy match */
    policyMatch: boolean;
    /** Overall pass/fail */
    passed: boolean;
    /** Failure reasons */
    failures: string[];
  };
  /** Screenshots */
  screenshots?: {
    uiCapture?: string;
    apiResponse?: string;
  };
}

export interface ReconciliationReport {
  /** Report ID */
  reportId: string;
  /** Report generation timestamp */
  generatedAt: string;
  /** Test run configuration */
  config: {
    environment: string;
    baseUrl: string;
    apiEndpoint: string;
    priceTolerance: number;
    markupStrategy: {
      percentage: number;
      minimum: number;
      maximum: number;
    };
  };
  /** Summary statistics */
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    passRate: number;
    avgPriceDifference: number;
    maxPriceDifference: number;
    minPriceDifference: number;
  };
  /** Individual test results */
  results: FareComparisonResult[];
  /** Failure analysis */
  failures: {
    byType: Record<string, number>;
    byRoute: Record<string, number>;
    byFareFamily: Record<string, number>;
  };
  /** Recommendations */
  recommendations: string[];
}

export interface TestScenario {
  /** Scenario name */
  name: string;
  /** Search parameters */
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    directOnly?: boolean;
  };
  /** Expected fare families to test */
  expectedFareFamilies?: string[];
  /** Price range expectation */
  priceRange?: {
    min: number;
    max: number;
  };
  /** Tags for filtering */
  tags: string[];
}

// Markup calculation constants (from flight-markup.ts)
export const MARKUP_CONFIG = {
  percentage: 0.07,
  minimum: 22,
  maximum: 200,
  currency: 'USD',
} as const;

// Tolerance thresholds
export const COMPARISON_THRESHOLDS = {
  /** Price difference tolerance in currency units */
  priceTolerance: 0.01,
  /** Percentage difference tolerance */
  percentageTolerance: 0.1,
} as const;

/**
 * Calculate expected customer price with markup
 */
export function calculateExpectedPrice(basePrice: number): {
  customerPrice: number;
  markupAmount: number;
  markupPercentage: number;
} {
  let markupAmount = basePrice * MARKUP_CONFIG.percentage;
  markupAmount = Math.max(markupAmount, MARKUP_CONFIG.minimum);
  markupAmount = Math.min(markupAmount, MARKUP_CONFIG.maximum);
  markupAmount = Math.round(markupAmount * 100) / 100;

  const customerPrice = Math.round((basePrice + markupAmount) * 100) / 100;
  const markupPercentage = basePrice > 0 ? (markupAmount / basePrice) * 100 : 0;

  return {
    customerPrice,
    markupAmount,
    markupPercentage: Math.round(markupPercentage * 10) / 10,
  };
}

/**
 * Parse price string from UI
 */
export function parsePriceString(priceString: string): { value: number; currency: string } {
  const cleanedString = priceString.trim();
  const currencyMatch = cleanedString.match(/^([A-Z]{3}|\$|€|£)/);
  const currency = currencyMatch
    ? (currencyMatch[1] === '$' ? 'USD' : currencyMatch[1] === '€' ? 'EUR' : currencyMatch[1] === '£' ? 'GBP' : currencyMatch[1])
    : 'USD';

  const numericValue = parseFloat(cleanedString.replace(/[^0-9.]/g, ''));

  return {
    value: isNaN(numericValue) ? 0 : numericValue,
    currency,
  };
}

/**
 * Compare two fare data objects
 */
export function compareFares(
  uiFare: UIFareData,
  apiFare: APIFareData,
  tolerance: number = COMPARISON_THRESHOLDS.priceTolerance
): FareComparisonResult['comparison'] {
  const failures: string[] = [];

  // Price comparison
  const priceDifference = uiFare.priceValue - apiFare.customerPrice;
  const percentageDifference = apiFare.customerPrice > 0
    ? (priceDifference / apiFare.customerPrice) * 100
    : 0;
  const priceMatch = Math.abs(priceDifference) <= tolerance;

  if (!priceMatch) {
    failures.push(`Price mismatch: UI=$${uiFare.priceValue}, API=$${apiFare.customerPrice}, diff=$${priceDifference.toFixed(2)}`);
  }

  // Fare family comparison
  const fareFamilyMatch = uiFare.fareFamily.toLowerCase() === apiFare.fareFamily.toLowerCase();
  if (!fareFamilyMatch) {
    failures.push(`Fare family mismatch: UI="${uiFare.fareFamily}", API="${apiFare.fareFamily}"`);
  }

  // Cabin class comparison
  const cabinClassMatch = uiFare.cabinClass.toLowerCase() === apiFare.cabinClass.toLowerCase();
  if (!cabinClassMatch) {
    failures.push(`Cabin class mismatch: UI="${uiFare.cabinClass}", API="${apiFare.cabinClass}"`);
  }

  // Baggage comparison
  const baggageMatch = compareBaggage(uiFare.baggage, apiFare.baggage);
  if (!baggageMatch) {
    failures.push(`Baggage mismatch: UI=${JSON.stringify(uiFare.baggage)}, API=${JSON.stringify(apiFare.baggage)}`);
  }

  // Policy comparison
  const policyMatch = uiFare.policies.changeable === apiFare.fareRules.changeable &&
                      uiFare.policies.refundable === apiFare.fareRules.refundable;
  if (!policyMatch) {
    failures.push(`Policy mismatch: UI changeable=${uiFare.policies.changeable}/refundable=${uiFare.policies.refundable}, API changeable=${apiFare.fareRules.changeable}/refundable=${apiFare.fareRules.refundable}`);
  }

  return {
    priceMatch,
    priceDifference: Math.round(priceDifference * 100) / 100,
    percentageDifference: Math.round(percentageDifference * 100) / 100,
    fareFamilyMatch,
    cabinClassMatch,
    baggageMatch,
    policyMatch,
    passed: priceMatch && fareFamilyMatch && cabinClassMatch && baggageMatch && policyMatch,
    failures,
  };
}

function compareBaggage(
  uiBaggage: UIFareData['baggage'],
  apiBaggage: APIFareData['baggage']
): boolean {
  // Simplified baggage comparison
  const uiChecked = parseInt(uiBaggage.checked.replace(/[^0-9]/g, '')) || 0;
  const apiChecked = apiBaggage.checked?.quantity || 0;
  return uiChecked === apiChecked;
}
