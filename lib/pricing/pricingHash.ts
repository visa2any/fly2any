/**
 * Pricing Hash Module
 * 
 * Generates and validates SHA-256 pricing hashes to detect tampering or drift.
 * 
 * NO TRUSTING THE CLIENT - All calculations happen server-side.
 * NO ROUNDING AMBIGUITY - All currency values fixed at 2 decimals.
 */

import { createHash } from 'crypto';

// ========================================
// TYPES
// ========================================

/**
 * Input for pricing hash generation
 * All values must be normalized before hashing
 */
export interface PricingHashInput {
  version: number; // Hash format version
  timestamp: string; // ISO 8601 UTC
  basePrice: string; // "2999.99" (fixed 2 decimals)
  markupPercentage: string; // "15.00" (fixed 2 decimals)
  passengerCount: number; // Integer
  flightId: string; // Amadeus flight ID
  aircraftType: string; // Aircraft type
  route: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
  };
  addOns: Array<{
    id: string;
    name: string;
    price: string; // "99.99" (fixed 2 decimals)
  }>;
  discountCode?: string; // Optional discount code
}

/**
 * Calculated pricing from backend
 */
export interface CalculatedPricing {
  basePrice: number;
  markupPercentage: number;
  markupAmount: number;
  subtotal: number;
  commissionPercentage: number;
  commissionAmount: number;
  processingFee: number;
  taxPercentage: number;
  taxAmount: number;
  platformFee: number;
  total: number;
  agentCommissionPercentage: number;
  agentCommissionAmount: number;
  discountCode?: string;
  discountAmount: number;
  currency: string;
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

/**
 * Validation result
 */
export type ValidationResult =
  | { success: true }
  | {
      success: false;
      errorCode: string;
      severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
      retryable: boolean;
      message: string;
      correlationId: string;
      timestamp: number;
      details: {
        frontendHash: string;
        expectedHash: string;
        frontendInput: PricingHashInput;
        backendCalculated: CalculatedPricing;
        mismatchReason: string;
      };
    };

// ========================================
// FUNCTIONS
// ========================================

/**
 * Generate pricing hash from normalized input
 * 
 * @param input - Normalized pricing input
 * @returns Pricing hash (format: PRICING-XXXXXXXXXXXXXXXX)
 */
export function generatePricingHash(input: PricingHashInput): string {
  // 1. Sort keys deterministically
  const sorted = Object.keys(input).sort().reduce((acc, key) => {
    (acc as any)[key] = input[key as keyof PricingHashInput];
    return acc;
  }, {} as any);

  // 2. Convert to JSON (no spaces, deterministic)
  const json = JSON.stringify(sorted);

  // 3. Generate SHA-256 hash
  const hash = createHash('sha256')
    .update(json)
    .digest('hex')
    .toUpperCase();

  // 4. Return formatted hash (first 16 chars)
  return `PRICING-${hash.substring(0, 16)}`;
}

/**
 * Normalize pricing values for hash generation
 * 
 * @param values - Raw pricing values
 * @returns Normalized pricing hash input
 */
export function normalizePricingForHash(values: {
  basePrice: number;
  markupPercentage: number;
  passengerCount: number;
  flightId: string;
  aircraftType: string;
  route: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
  };
  addOns: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  discountCode?: string;
}): PricingHashInput {
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    basePrice: values.basePrice.toFixed(2),
    markupPercentage: values.markupPercentage.toFixed(2),
    passengerCount: values.passengerCount,
    flightId: values.flightId,
    aircraftType: values.aircraftType,
    route: values.route,
    addOns: values.addOns.map(addon => ({
      id: addon.id,
      name: addon.name,
      price: addon.price.toFixed(2),
    })),
    discountCode: values.discountCode,
  };
}

/**
 * Validate pricing hash against backend calculation
 * 
 * @param frontendHash - Hash from frontend
 * @param backendCalculated - Backend-calculated pricing
 * @param frontendInput - Frontend input used to generate hash
 * @returns Validation result
 */
export function validatePricingHash(
  frontendHash: string,
  backendCalculated: CalculatedPricing,
  frontendInput: PricingHashInput
): ValidationResult {
  // 1. Generate expected hash from backend data
  const expectedInput: PricingHashInput = {
    version: 1,
    timestamp: frontendInput.timestamp,
    basePrice: backendCalculated.basePrice.toFixed(2),
    markupPercentage: frontendInput.markupPercentage,
    passengerCount: frontendInput.passengerCount,
    flightId: frontendInput.flightId,
    aircraftType: frontendInput.aircraftType,
    route: frontendInput.route,
    addOns: frontendInput.addOns,
    discountCode: frontendInput.discountCode,
  };

  const expectedHash = generatePricingHash(expectedInput);

  // 2. Compare hashes
  if (frontendHash !== expectedHash) {
    // 3. Detect mismatch reason
    const mismatchReason = detectMismatchReason(frontendInput, backendCalculated);

    return {
      success: false,
      errorCode: 'QUOTE_PRICING_MISMATCH',
      severity: 'CRITICAL',
      retryable: false,
      message: 'Pricing verification failed. Please reload and try again.',
      correlationId: generateCorrelationId(),
      timestamp: Date.now(),
      details: {
        frontendHash,
        expectedHash,
        frontendInput,
        backendCalculated,
        mismatchReason,
      },
    };
  }

  return { success: true };
}

/**
 * Detect reason for pricing hash mismatch
 * 
 * @param frontendInput - Frontend input
 * @param backendCalculated - Backend-calculated pricing
 * @returns Mismatch reason
 */
function detectMismatchReason(
  frontendInput: PricingHashInput,
  backendCalculated: CalculatedPricing
): string {
  const frontendBasePrice = parseFloat(frontendInput.basePrice);
  const backendBasePrice = backendCalculated.basePrice;

  // Check base price mismatch
  if (Math.abs(frontendBasePrice - backendBasePrice) > 0.01) {
    const change = backendBasePrice - frontendBasePrice;
    const percentChange = (change / frontendBasePrice) * 100;
    return `Base price changed from $${frontendBasePrice.toFixed(2)} to $${backendBasePrice.toFixed(2)} (${change > 0 ? '+' : ''}$${change.toFixed(2)}, ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%)`;
  }

  // Check add-ons mismatch
  // This is a basic check; in production, you'd compare add-on details
  if (frontendInput.addOns.length !== (backendCalculated.addOns?.length || 0)) {
    return 'Add-ons changed';
  }

  // Default mismatch reason
  return 'Pricing calculation mismatch';
}

/**
 * Generate correlation ID
 * 
 * @returns Correlation ID (format: CORR-YYYYMMDD-XXXXXXXX)
 */
function generateCorrelationId(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `CORR-${dateStr}-${random}`;
}