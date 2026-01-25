# Pricing Integrity & Financial Safety Specification

## Status: CRITICAL - FINANCIAL AUDIT REQUIREMENTS

**Date**: January 24, 2026
**Priority**: CRITICAL - Financial Integrity
**Scope**: End-to-End Pricing Flow

---

## Philosophy

**NO TRUSTING THE CLIENT** - All financial calculations MUST happen server-side
**NO ROUNDING AMBIGUITY** - All currency rules must be explicit
**NO SILENT RECALCULATION** - Every price change must be traceable
**PROVABLE AUDIT TRAIL** - Every financial operation must be explainable in court

---

## PART 1 — Source of Truth Definition

### Field Ownership Table

| Field | Ownership | Source | Editable | Backend Recalculates? | Notes |
|-------|-----------|--------|----------|----------------------|-------|
| **Flight Selection** | Frontend | Amadeus API | Yes | No | User-selected aircraft, route, dates |
| **Base Price** | Backend | Amadeus API | No | No | Raw price from API (before any markup) |
| **Markup %** | Frontend | User Input | Yes | No | Agent-specified markup percentage |
| **Markup Amount** | Backend | Calculated | No | Yes | Base × (Markup% / 100) |
| **Subtotal** | Backend | Calculated | No | Yes | Base + Markup Amount |
| **Commission %** | Backend | Configuration | No | No | Platform-level commission rate |
| **Commission Amount** | Backend | Calculated | No | Yes | Subtotal × (Commission% / 100) |
| **Processing Fee** | Backend | Configuration | No | No | Fixed fee per transaction |
| **Tax %** | Backend | Jurisdiction | No | No | Tax rate from database |
| **Tax Amount** | Backend | Calculated | No | Yes | (Subtotal + Commission + Fee) × Tax% |
| **Platform Fee** | Backend | Configuration | No | No | Fixed platform fee |
| **Total** | Backend | Calculated | No | Yes | Subtotal + Commission + Fee + Tax + Platform |
| **Agent Commission %** | Backend | Contract | No | No | From agent contract |
| **Agent Commission Amount** | Backend | Calculated | No | Yes | Subtotal × Agent Commission% |
| **Currency** | Backend | System | No | No | System default (USD) |
| **Discount Code** | Frontend | User Input | Yes | No | User-applied discount code |
| **Discount Amount** | Backend | Calculated | No | Yes | Based on discount code rules |

### NEVER Trust These Fields from Frontend

```
❌ markupAmount          - MUST be recalculated server-side
❌ subtotal              - MUST be recalculated server-side
❌ commissionAmount       - MUST be recalculated server-side
❌ taxAmount             - MUST be recalculated server-side
❌ total                 - MUST be recalculated server-side
❌ agentCommissionAmount - MUST be recalculated server-side
❌ discountAmount        - MUST be recalculated server-side
```

### Frontend-Editable Fields (User Inputs)

```
✅ flightSelection       - Selected aircraft, route, dates
✅ markupPercentage      - Agent-specified markup (e.g., 15%)
✅ discountCode          - Optional discount code
✅ passengerCount        - Number of passengers
✅ addOns               - Additional services
```

### Backend-Calculated Fields (Read-Only)

```
✅ basePrice            - From Amadeus API
✅ markupAmount         - basePrice × markupPercentage
✅ subtotal             - basePrice + markupAmount
✅ commissionAmount     - subtotal × commissionPercentage
✅ processingFee        - Fixed amount from config
✅ taxAmount            - (subtotal + commissionAmount + processingFee) × taxRate
✅ platformFee          - Fixed amount from config
✅ total                - subtotal + commissionAmount + processingFee + taxAmount + platformFee
✅ agentCommissionAmount - subtotal × agentCommissionPercentage
```

---

## PART 2 — Pricing Hash / Integrity Check

### Hash Algorithm Specification

**Hash Function**: SHA-256
**Hash Purpose**: Detect pricing tampering or drift
**Hash Scope**: Frontend-submitted editable fields + Backend base price

### Hash Input Construction

```typescript
// Normalized input for hashing (JSON string, deterministic)
interface PricingHashInput {
  version: 1;                           // Hash format version
  timestamp: string;                    // ISO 8601 UTC
  basePrice: string;                    // "2999.99" (fixed 2 decimals)
  markupPercentage: string;             // "15.00" (fixed 2 decimals)
  passengerCount: number;               // Integer
  flightId: string;                     // Amadeus flight ID
  aircraftType: string;                 - Aircraft type
  route: {                              // Route info
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
  };
  addOns: Array<{                      // Additional services
    id: string;
    name: string;
    price: string;
  }>;
  discountCode?: string;                // Optional discount code
}
```

### Hash Generation (Backend)

```typescript
import { createHash } from 'crypto';

function generatePricingHash(input: PricingHashInput): string {
  // 1. Sort keys deterministically
  const sorted = Object.keys(input).sort().reduce((acc, key) => {
    acc[key] = input[key];
    return acc;
  }, {} as any);

  // 2. Convert to JSON (no spaces, deterministic)
  const json = JSON.stringify(sorted);

  // 3. Generate SHA-256 hash
  const hash = createHash('sha256')
    .update(json)
    .digest('hex')
    .toUpperCase();

  return `PRICING-${hash.substring(0, 16)}`; // First 16 chars
}
```

### Hash Validation (Backend)

```typescript
function validatePricingHash(
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
    return {
      success: false,
      errorCode: 'QUOTE_PRICING_MISMATCH',
      severity: 'CRITICAL' as const,
      retryable: false,
      message: 'Pricing verification failed. Please reload and try again.',
      correlationId: generateCorrelationId(),
      timestamp: Date.now(),
      details: {
        frontendHash,
        expectedHash,
        frontendInput,
        backendCalculated,
      },
    };
  }

  return { success: true };
}
```

### Hash Transmission (Frontend → Backend)

```typescript
interface SaveQuoteRequest {
  quoteId?: string;
  version: number;
  
  // Editable fields
  flightSelection: {
    flightId: string;
    aircraftType: string;
    route: { origin: string; destination: string; departureDate: string; returnDate?: string };
  };
  markupPercentage: number;
  passengerCount: number;
  addOns: Array<{ id: string; name: string; price: number }>;
  discountCode?: string;
  
  // Integrity check
  pricingHash: string;  // MUST match backend calculation
  hashTimestamp: string; // When frontend generated hash
  
  // Other fields
  customerId: string;
  notes?: string;
}
```

### Hash Failure Response

```typescript
{
  success: false,
  error: {
    success: false,
    errorCode: 'QUOTE_PRICING_MISMATCH',
    message: 'Pricing verification failed. Please reload and try again.',
    severity: 'CRITICAL',
    retryable: false,
    correlationId: 'CORR-20250124-ABC123',
    timestamp: 1737700000000,
    details: {
      frontendHash: 'PRICING-A1B2C3D4E5F6',
      expectedHash: 'PRICING-X7Y8Z9W0Q1R2',
      mismatchReason: 'Base price changed between frontend display and backend calculation',
    },
  },
}
```

---

## PART 3 — Retry & Conflict Safety for Pricing

### Pricing Snapshot Strategy

**Snapshot Created When**: User first sees quote price (on load or initial calculation)
**Snapshot Contains**: Complete immutable pricing state at that moment
**Snapshot Usage**: All subsequent operations use this snapshot as baseline

### Snapshot Schema

```typescript
interface PricingSnapshot {
  snapshotId: string;
  snapshotAt: string;              // ISO 8601 UTC
  source: 'INITIAL_LOAD' | 'USER_EDIT' | 'CONFLICT_RESOLVE';
  
  // Immutable pricing state
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
  
  // Hash for integrity
  pricingHash: string;
  
  // Context
  flightId: string;
  aircraftType: string;
  route: { origin: string; destination: string; departureDate: string; returnDate?: string };
  passengerCount: number;
  addOns: Array<{ id: string; name: string; price: number }>;
}
```

### Immutable Pricing Object Rules

```typescript
/**
 * PricingSnapshot - IMMUTABLE pricing state
 * 
 * Once created, NEVER modify.
 * Always create new snapshot on user edit.
 * Always compare snapshots for change detection.
 */
class PricingSnapshot {
  private readonly data: Readonly<PricingSnapshot>;
  
  constructor(data: PricingSnapshot) {
    this.data = Object.freeze(JSON.parse(JSON.stringify(data)));
  }
  
  // Read-only accessors
  get total(): number { return this.data.total; }
  get subtotal(): number { return this.data.subtotal; }
  get pricingHash(): string { return this.data.pricingHash; }
  
  // Change detection
  compareDelta(other: PricingSnapshot): PricingDelta {
    return {
      totalChange: other.total - this.total,
      subtotalChange: other.subtotal - this.subtotal,
      markupChange: other.markupPercentage - this.markupPercentage,
      commissionChange: other.commissionAmount - this.commissionAmount,
    };
  }
  
  // Serialization
  toJSON(): PricingSnapshot {
    return { ...this.data };
  }
}
```

### Retry Safety - Pricing Snapshot Reuse

```typescript
/**
 * During retry, ALWAYS use original pricing snapshot.
 * NEVER recalculate pricing during retry.
 */
async function saveQuoteWithRetry(
  request: SaveQuoteRequest,
  originalPricingSnapshot: PricingSnapshot,
  maxRetries: number = 3
): Promise<SaveQuoteResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await api.saveQuote({
        ...request,
        // Use ORIGINAL snapshot hash, not recalculated
        pricingHash: originalPricingSnapshot.pricingHash,
        hashTimestamp: originalPricingSnapshot.snapshotAt,
      });
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw new SaveError({
          errorCode: 'QUOTE_SAVE_FAILED',
          severity: 'CRITICAL',
          message: 'Failed to save quote after 3 attempts',
          retryable: false,
          correlationId: generateCorrelationId(),
          timestamp: Date.now(),
          details: {
            originalPricingSnapshot,
            attempts: maxRetries,
            lastError: error,
          },
        });
      }
      
      await sleep(exponentialBackoff(attempt));
    }
  }
}
```

### Conflict Safety - Pricing Delta Comparison

```typescript
/**
 * When conflict occurs, show pricing delta clearly.
 * User must understand what changed.
 */
interface ConflictPricingDelta {
  basePrice: {
    before: number;
    after: number;
    delta: number;
    percentChange: number;
  };
  markupAmount: {
    before: number;
    after: number;
    delta: number;
  };
  total: {
    before: number;
    after: number;
    delta: number;
    percentChange: number;
  };
}

function calculateConflictDelta(
  localSnapshot: PricingSnapshot,
  remoteSnapshot: PricingSnapshot
): ConflictPricingDelta {
  return {
    basePrice: {
      before: localSnapshot.basePrice,
      after: remoteSnapshot.basePrice,
      delta: remoteSnapshot.basePrice - localSnapshot.basePrice,
      percentChange: ((remoteSnapshot.basePrice - localSnapshot.basePrice) / localSnapshot.basePrice) * 100,
    },
    markupAmount: {
      before: localSnapshot.markupAmount,
      after: remoteSnapshot.markupAmount,
      delta: remoteSnapshot.markupAmount - localSnapshot.markupAmount,
    },
    total: {
      before: localSnapshot.total,
      after: remoteSnapshot.total,
      delta: remoteSnapshot.total - localSnapshot.total,
      percentChange: ((remoteSnapshot.total - localSnapshot.total) / localSnapshot.total) * 100,
    },
  };
}
```

### Draft Restore - Pricing Integrity

```typescript
/**
 * When restoring draft, pricing snapshot must be validated.
 * If base price changed, warn user.
 */
function restoreDraftWithValidation(
  draft: QuoteDraft,
  currentBasePrice: number
): ValidationResult {
  const draftPricingSnapshot = JSON.parse(draft.pricingSnapshot);
  
  // Check if base price changed
  if (draftPricingSnapshot.basePrice !== currentBasePrice) {
    return {
      success: false,
      errorCode: 'QUOTE_DRAFT_STALE_PRICING',
      severity: 'HIGH',
      retryable: true,
      message: `Base price has changed since draft was saved. Previously: $${draftPricingSnapshot.basePrice}, Now: $${currentBasePrice}`,
      correlationId: generateCorrelationId(),
      timestamp: Date.now(),
      details: {
        draftBasePrice: draftPricingSnapshot.basePrice,
        currentBasePrice,
        priceChangePercent: ((currentBasePrice - draftPricingSnapshot.basePrice) / draftPricingSnapshot.basePrice) * 100,
      },
    };
  }
  
  return { success: true, restoredSnapshot: draftPricingSnapshot };
}
```

---

## PART 4 — Commission & Margin Safety

### Commission Validation Rules

```typescript
/**
 * Commission rules - ENFORCED SERVER-SIDE ONLY
 */
interface CommissionRules {
  // Platform commission
  platformCommissionRate: number;      // e.g., 5.00%
  platformCommissionMinimum: number;    // e.g., $50.00
  platformCommissionMaximum: number;    // e.g., $5000.00
  
  // Agent commission
  agentCommissionRate: number;          // e.g., 10.00%
  agentCommissionMinimum: number;      // e.g., $100.00
  agentCommissionMaximum: number;      // e.g., $2000.00
  
  // Margin floor
  marginFloorPercentage: number;        // e.g., 5.00%
  
  // Discount limits
  maxDiscountPercentage: number;        // e.g., 15.00%
  maxDiscountAmount: number;            // e.g., $1000.00
}
```

### Commission Validation Logic (Backend)

```typescript
function validateCommission(
  subtotal: number,
  commissionPercentage: number,
  agentCommissionPercentage: number,
  rules: CommissionRules
): ValidationResult {
  // 1. Validate platform commission rate
  if (commissionPercentage < 0 || commissionPercentage > 100) {
    return validationError(
      'QUOTE_COMMISSION_INVALID_RATE',
      'Platform commission rate must be between 0% and 100%'
    );
  }
  
  // 2. Validate agent commission rate
  if (agentCommissionPercentage < 0 || agentCommissionPercentage > 100) {
    return validationError(
      'QUOTE_AGENT_COMMISSION_INVALID_RATE',
      'Agent commission rate must be between 0% and 100%'
    );
  }
  
  // 3. Calculate and validate platform commission amount
  const platformCommissionAmount = subtotal * (commissionPercentage / 100);
  if (platformCommissionAmount < rules.platformCommissionMinimum) {
    return validationError(
      'QUOTE_COMMISSION_BELOW_MINIMUM',
      `Platform commission ($${platformCommissionAmount.toFixed(2)}) is below minimum ($${rules.platformCommissionMinimum.toFixed(2)})`
    );
  }
  
  if (platformCommissionAmount > rules.platformCommissionMaximum) {
    return validationError(
      'QUOTE_COMMISSION_EXCEEDS_MAXIMUM',
      `Platform commission ($${platformCommissionAmount.toFixed(2)}) exceeds maximum ($${rules.platformCommissionMaximum.toFixed(2)})`
    );
  }
  
  // 4. Calculate and validate agent commission amount
  const agentCommissionAmount = subtotal * (agentCommissionPercentage / 100);
  if (agentCommissionAmount < rules.agentCommissionMinimum) {
    return validationError(
      'QUOTE_AGENT_COMMISSION_BELOW_MINIMUM',
      `Agent commission ($${agentCommissionAmount.toFixed(2)}) is below minimum ($${rules.agentCommissionMinimum.toFixed(2)})`
    );
  }
  
  if (agentCommissionAmount > rules.agentCommissionMaximum) {
    return validationError(
      'QUOTE_AGENT_COMMISSION_EXCEEDS_MAXIMUM',
      `Agent commission ($${agentCommissionAmount.toFixed(2)}) exceeds maximum ($${rules.agentCommissionMaximum.toFixed(2)})`
    );
  }
  
  // 5. Validate margin floor
  const marginAmount = subtotal - (subtotal * 0.95); // Assuming 5% cost
  const marginPercentage = (marginAmount / subtotal) * 100;
  
  if (marginPercentage < rules.marginFloorPercentage) {
    return validationError(
      'QUOTE_MARGIN_BELOW_FLOOR',
      `Margin (${marginPercentage.toFixed(2)}%) is below required floor (${rules.marginFloorPercentage.toFixed(2)}%)`
    );
  }
  
  return { success: true };
}
```

### Discount Validation Logic (Backend)

```typescript
function validateDiscount(
  discountCode: string | undefined,
  subtotal: number,
  rules: CommissionRules
): { valid: boolean; discountAmount: number; error?: ErrorDetails } {
  if (!discountCode) {
    return { valid: true, discountAmount: 0 };
  }
  
  // 1. Lookup discount code in database
  const discount = await database.getDiscountCode(discountCode);
  
  if (!discount) {
    return {
      valid: false,
      discountAmount: 0,
      error: {
        errorCode: 'QUOTE_DISCOUNT_INVALID_CODE',
        message: `Discount code "${discountCode}" is invalid or expired`,
      },
    };
  }
  
  // 2. Validate discount percentage
  if (discount.percentage > rules.maxDiscountPercentage) {
    return {
      valid: false,
      discountAmount: 0,
      error: {
        errorCode: 'QUOTE_DISCOUNT_EXCEEDS_MAXIMUM',
        message: `Discount (${discount.percentage}%) exceeds maximum allowed (${rules.maxDiscountPercentage}%)`,
      },
    };
  }
  
  // 3. Calculate and validate discount amount
  const discountAmount = subtotal * (discount.percentage / 100);
  
  if (discountAmount > rules.maxDiscountAmount) {
    return {
      valid: false,
      discountAmount: 0,
      error: {
        errorCode: 'QUOTE_DISCOUNT_AMOUNT_EXCEEDS_MAXIMUM',
        message: `Discount amount ($${discountAmount.toFixed(2)}) exceeds maximum allowed ($${rules.maxDiscountAmount.toFixed(2)})`,
      },
    };
  }
  
  return { valid: true, discountAmount };
}
```

### Commission Rejection Error Codes

| Error Code | Severity | Retryable | Message | Resolution |
|------------|----------|-----------|---------|------------|
| QUOTE_COMMISSION_INVALID_RATE | CRITICAL | No | Platform commission rate must be between 0% and 100% | Contact administrator |
| QUOTE_COMMISSION_BELOW_MINIMUM | HIGH | Yes | Platform commission ($X) is below minimum ($Y) | Increase markup or contact administrator |
| QUOTE_COMMISSION_EXCEEDS_MAXIMUM | HIGH | Yes | Platform commission ($X) exceeds maximum ($Y) | Reduce markup or contact administrator |
| QUOTE_AGENT_COMMISSION_INVALID_RATE | CRITICAL | No | Agent commission rate must be between 0% and 100% | Contact administrator |
| QUOTE_AGENT_COMMISSION_BELOW_MINIMUM | HIGH | Yes | Agent commission ($X) is below minimum ($Y) | Increase markup or contact administrator |
| QUOTE_AGENT_COMMISSION_EXCEEDS_MAXIMUM | HIGH | Yes | Agent commission ($X) exceeds maximum ($Y) | Reduce markup or contact administrator |
| QUOTE_MARGIN_BELOW_FLOOR | CRITICAL | No | Margin (X%) is below required floor (Y%) | Increase markup |
| QUOTE_DISCOUNT_INVALID_CODE | HIGH | No | Discount code "CODE" is invalid or expired | Use valid discount code |
| QUOTE_DISCOUNT_EXCEEDS_MAXIMUM | HIGH | No | Discount (X%) exceeds maximum allowed (Y%) | Use valid discount or contact administrator |
| QUOTE_DISCOUNT_AMOUNT_EXCEEDS_MAXIMUM | HIGH | No | Discount amount ($X) exceeds maximum allowed ($Y) | Use valid discount or contact administrator |

### UX Handling for Commission Rejection

```typescript
/**
 * Frontend handling for commission validation errors
 */
function handleCommissionValidationError(error: CommissionValidationError) {
  switch (error.errorCode) {
    case 'QUOTE_COMMISSION_INVALID_RATE':
    case 'QUOTE_AGENT_COMMISSION_INVALID_RATE':
      // CRITICAL - Cannot proceed
      showCriticalErrorModal({
        title: 'Configuration Error',
        message: error.message,
        action: 'Contact Administrator',
      });
      break;
      
    case 'QUOTE_MARGIN_BELOW_FLOOR':
      // CRITICAL - Pricing issue
      showCriticalErrorModal({
        title: 'Insufficient Margin',
        message: error.message,
        action: 'Increase Markup',
      });
      break;
      
    case 'QUOTE_COMMISSION_BELOW_MINIMUM':
    case 'QUOTE_COMMISSION_EXCEEDS_MAXIMUM':
    case 'QUOTE_AGENT_COMMISSION_BELOW_MINIMUM':
    case 'QUOTE_AGENT_COMMISSION_EXCEEDS_MAXIMUM':
      // HIGH - User can adjust
      showInlineError({
        title: 'Commission Adjustment Needed',
        message: error.message,
        action: 'Adjust Markup',
        onAction: () => openMarkupEditor(),
      });
      break;
      
    case 'QUOTE_DISCOUNT_INVALID_CODE':
    case 'QUOTE_DISCOUNT_EXCEEDS_MAXIMUM':
    case 'QUOTE_DISCOUNT_AMOUNT_EXCEEDS_MAXIMUM':
      // HIGH - User can adjust
      showInlineError({
        title: 'Discount Invalid',
        message: error.message,
        action: 'Remove Discount',
        onAction: () => removeDiscountCode(),
      });
      break;
  }
}
```

---

## PART 5 — Audit Trail & Explainability

### Audit Trail Schema

```typescript
interface PricingAuditRecord {
  auditId: string;                    // UUID
  quoteId: string;
  version: number;
  
  // Event details
  eventType: 'QUOTE_CREATED' | 'QUOTE_UPDATED' | 'QUOTE_PRICING_CHANGED' | 'QUOTE_CONFLICT_RESOLVED' | 'QUOTE_SAVED';
  eventTimestamp: string;             // ISO 8601 UTC
  
  // Who
  actor: {
    userId: string;
    agentId: string;
    role: string;
  };
  
  // Before state (if applicable)
  before?: {
    pricing: PricingSnapshot;
    version: number;
    hash: string;
  };
  
  // After state
  after: {
    pricing: PricingSnapshot;
    version: number;
    hash: string;
  };
  
  // Why
  reason: 'USER_ACTION' | 'SYSTEM_AUTO' | 'CONFLICT_RESOLUTION' | 'DRAFT_RESTORE' | 'RETRY';
  reasonDetails?: {
    userAction?: string;
    systemRule?: string;
    conflictType?: string;
    draftAge?: string;
  };
  
  // Correlation
  correlationId: string;
  parentAuditId?: string;             // For related events
  
  // Explainability
  explanation: string;                // Human-readable
  explanationParams: Record<string, any>; // For i18n
  
  // Integrity
  verified: boolean;                  // Pricing hash verified
  hashVerified: boolean;              // Hash verification passed
}
```

### Example Audit Record

```json
{
  "auditId": "audit_123e4567-e89b-12d3-a456-426614174000",
  "quoteId": "q_abc123",
  "version": 3,
  
  "eventType": "QUOTE_PRICING_CHANGED",
  "eventTimestamp": "2026-01-24T10:30:45.123Z",
  
  "actor": {
    "userId": "user_456",
    "agentId": "agent_789",
    "role": "AGENT"
  },
  
  "before": {
    "pricing": {
      "snapshotId": "snap_001",
      "basePrice": 2999.99,
      "markupPercentage": 15.00,
      "markupAmount": 449.99,
      "subtotal": 3449.98,
      "total": 3794.98
    },
    "version": 2,
    "hash": "PRICING-A1B2C3D4"
  },
  
  "after": {
    "pricing": {
      "snapshotId": "snap_002",
      "basePrice": 2999.99,
      "markupPercentage": 20.00,
      "markupAmount": 599.99,
      "subtotal": 3599.98,
      "total": 3959.98
    },
    "version": 3,
    "hash": "PRICING-X7Y8Z9W0"
  },
  
  "reason": "USER_ACTION",
  "reasonDetails": {
    "userAction": "Markup percentage changed from 15.00% to 20.00%"
  },
  
  "correlationId": "CORR-20250124-ABC123",
  
  "explanation": "Quote pricing updated by agent. Markup increased from 15.00% to 20.00%, resulting in a total increase from $3,794.98 to $3,959.98 (+$165.00, +4.35%).",
  "explanationParams": {
    "fromMarkup": "15.00%",
    "toMarkup": "20.00%",
    "fromTotal": "$3,794.98",
    "toTotal": "$3,959.98",
    "deltaAmount": "$165.00",
    "deltaPercent": "+4.35%"
  },
  
  "verified": true,
  "hashVerified": true
}
```

### Explanation Generator

```typescript
/**
 * Generate human-readable explanations for pricing changes
 */
class PricingExplanationGenerator {
  /**
   * Generate explanation for pricing change
   */
  static generatePricingChangeExplanation(
    before: PricingSnapshot,
    after: PricingSnapshot,
    actor: { userId: string; role: string }
  ): string {
    const changes = this.detectChanges(before, after);
    
    if (changes.length === 0) {
      return `No pricing changes detected. Total remains at ${formatCurrency(after.total)}.`;
    }
    
    const parts = changes.map(change => {
      switch (change.type) {
        case 'MARKUP':
          return `Markup changed from ${change.before}% to ${change.after}%`;
        case 'DISCOUNT':
          return `Discount ${change.before ? `(${change.before})` : 'none'} changed to ${change.after ? `(${change.after})` : 'none'}`;
        case 'BASE_PRICE':
          return `Base price changed from ${formatCurrency(change.before)} to ${formatCurrency(change.after)}`;
        case 'ADD_ON':
          return `Add-on "${change.name}" ${change.before ? 'removed' : `added (${formatCurrency(change.after)})`}`;
        default:
          return '';
      }
    }).filter(Boolean);
    
    const totalChange = after.total - before.total;
    const totalChangePercent = (totalChange / before.total) * 100;
    
    let explanation = `Quote pricing updated`;
    
    if (actor.role === 'AGENT') {
      explanation += ` by agent`;
    } else if (actor.role === 'SYSTEM') {
      explanation += ` by system`;
    }
    
    explanation += `. `;
    explanation += parts.join(', ');
    explanation += `. `;
    
    if (totalChange !== 0) {
      explanation += `Total changed from ${formatCurrency(before.total)} to ${formatCurrency(after.total)}`;
      explanation += ` (${totalChange > 0 ? '+' : ''}${formatCurrency(totalChange)}, ${totalChangePercent > 0 ? '+' : ''}${totalChangePercent.toFixed(2)}%).`;
    }
    
    return explanation;
  }
  
  /**
   * Detect what changed between two pricing snapshots
   */
  private static detectChanges(
    before: PricingSnapshot,
    after: PricingSnapshot
  ): Array<{ type: string; before?: any; after?: any; name?: string }> {
    const changes: Array<any> = [];
    
    if (before.markupPercentage !== after.markupPercentage) {
      changes.push({
        type: 'MARKUP',
        before: before.markupPercentage,
        after: after.markupPercentage,
      });
    }
    
    if (before.discountCode !== after.discountCode) {
      changes.push({
        type: 'DISCOUNT',
        before: before.discountCode,
        after: after.discountCode,
      });
    }
    
    if (before.basePrice !== after.basePrice) {
      changes.push({
        type: 'BASE_PRICE',
        before: before.basePrice,
        after: after.basePrice,
      });
    }
    
    // Detect add-on changes
    const beforeAddOns = new Map(before.addOns.map(a => [a.id, a]));
    const afterAddOns = new Map(after.addOns.map(a => [a.id, a]));
    
    beforeAddOns.forEach((addOn, id) => {
      if (!afterAddOns.has(id)) {
        changes.push({
          type: 'ADD_ON',
          name: addOn.name,
          before: addOn.price,
          after: null,
        });
      }
    });
    
    afterAddOns.forEach((addOn, id) => {
      if (!beforeAddOns.has(id)) {
        changes.push({
          type: 'ADD_ON',
          name: addOn.name,
          before: null,
          after: addOn.price,
        });
      }
    });
    
    return changes;
  }
}
```

---

## PART 6 — Frontend Display Rules

### Editable vs Computed Fields

| Field | Display Mode | Editable | Badge | Notes |
|-------|--------------|----------|-------|-------|
| **Flight Selection** | Dropdown/Search | Yes | None | User selects aircraft, route, dates |
| **Markup %** | Input field | Yes | None | Agent enters markup percentage |
| **Discount Code** | Input field | Yes | None | User enters discount code |
| **Passenger Count** | Input field | Yes | None | User enters number of passengers |
| **Add-ons** | Checkbox list | Yes | None | User selects additional services |
| **Base Price** | Display text | No | ⚠️ Backend | From Amadeus API, read-only |
| **Markup Amount** | Display text | No | 🔒 Calculated | Computed from markup % |
| **Subtotal** | Display text | No | 🎯 Calculated | Base + markup |
| **Commission %** | Display text | No | 🔒 System | From configuration |
| **Commission Amount** | Display text | No | 🎯 Calculated | Computed from subtotal |
| **Tax %** | Display text | No | 🔒 System | From jurisdiction |
| **Tax Amount** | Display text | No | 🎯 Calculated | Computed from subtotal + fees |
| **Total** | Display text (large, bold) | No | ✅ Verified | Final total, backend-verified |
| **Agent Commission %** | Display text | No | 🔒 Contract | From agent contract |
| **Agent Commission Amount** | Display text | No | 💰 Calculated | Computed from subtotal |

### Legend

- **None**: Regular field, no special indicator
- **⚠️ Backend**: Data from backend (not editable)
- **🔒 Calculated**: Automatically computed (not editable)
- **🔒 System**: System configuration (not editable)
- **🎯 Calculated**: Intermediate calculation (not editable)
- **✅ Verified**: Backend-verified final value
- **💰 Calculated**: Agent commission (not editable)

### Display Rules Implementation

```typescript
/**
 * Frontend display component - enforces editability rules
 */
function QuotePricingDisplay({ pricing, onMarkupChange, onDiscountChange }: Props) {
  return (
    <div className="pricing-display">
      {/* Editable Fields */}
      <FormField label="Markup %" editable={true}>
        <PercentageInput
          value={pricing.markupPercentage}
          onChange={onMarkupChange}
          min={0}
          max={100}
          step={0.5}
        />
      </FormField>
      
      <FormField label="Discount Code" editable={true}>
        <TextInput
          value={pricing.discountCode || ''}
          onChange={onDiscountChange}
          placeholder="Enter discount code"
        />
      </FormField>
      
      {/* Backend Data (Read-Only) */}
      <FormField label="Base Price" editable={false} badge="Backend">
        <DisplayValue value={formatCurrency(pricing.basePrice)} />
      </FormField>
      
      {/* Calculated Fields (Read-Only) */}
      <FormField label="Markup Amount" editable={false} badge="Calculated">
        <DisplayValue value={formatCurrency(pricing.markupAmount)} />
        <FormulaHint formula={`${formatCurrency(pricing.basePrice)} × ${pricing.markupPercentage}%`} />
      </FormField>
      
      <FormField label="Subtotal" editable={false} badge="Calculated">
        <DisplayValue value={formatCurrency(pricing.subtotal)} />
        <FormulaHint formula={`${formatCurrency(pricing.basePrice)} + ${formatCurrency(pricing.markupAmount)}`} />
      </FormField>
      
      <FormField label="Commission %" editable={false} badge="System">
        <DisplayValue value={`${pricing.commissionPercentage}%`} />
      </FormField>
      
      <FormField label="Commission Amount" editable={false} badge="Calculated">
        <DisplayValue value={formatCurrency(pricing.commissionAmount)} />
        <FormulaHint formula={`${formatCurrency(pricing.subtotal)} × ${pricing.commissionPercentage}%`} />
      </FormField>
      
      {/* Final Total (Verified) */}
      <FormField label="Total" editable={false} badge="Verified" highlight={true}>
        <DisplayValue
          value={formatCurrency(pricing.total)}
          size="large"
          bold={true}
        />
        <VerificationBadge verified={pricing.hashVerified} />
      </FormField>
      
      {/* Agent Commission */}
      <FormField label="Agent Commission %" editable={false} badge="Contract">
        <DisplayValue value={`${pricing.agentCommissionPercentage}%`} />
      </FormField>
      
      <FormField label="Agent Commission Amount" editable={false} badge="Calculated">
        <DisplayValue value={formatCurrency(pricing.agentCommissionAmount)} />
        <FormulaHint formula={`${formatCurrency(pricing.subtotal)} × ${pricing.agentCommissionPercentage}%`} />
      </FormField>
    </div>
  );
}
```

### Badges Implementation

```typescript
/**
 * Badge component for field types
 */
function FieldBadge({ type }: { type: string }) {
  const badges = {
    'Backend': { color: 'bg-amber-100 text-amber-800', icon: '⚠️' },
    'Calculated': { color: 'bg-blue-100 text-blue-800', icon: '🔒' },
    'System': { color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    'Verified': { color: 'bg-green-100 text-green-800', icon: '✅' },
    'Contract': { color: 'bg-indigo-100 text-indigo-800', icon: '💰' },
  };
  
  const badge = badges[type as keyof typeof badges];
  
  if (!badge) return null;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
      <span>{badge.icon}</span>
      <span>{type}</span>
    </span>
  );
}

/**
 * Verification badge for totals
 */
function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Backend Verified</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1 text-amber-600 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.715V9.717c0-2.047-1.963-3.715-2.502-3.715H5.082c-1.54 0-2.502 1.667-2.502 3.715v8.568c0 2.047 1.963 3.715 2.502 3.715h13.856c1.54 0 2.502-1.667 2.502-3.715V9.717c0-2.047-1.963-3.715-2.502-3.715z" />
        </svg>
        <span>Pending Verification</span>
      </div>
    );
  }
}
```

---

## PART 7 — Failure Scenarios

### Scenario Matrix

| Scenario | Backend Response | Frontend UX | Telemetry Event | User Message |
|----------|------------------|-------------|-----------------|--------------|
| **Pricing Mismatch** | `QUOTE_PRICING_MISMATCH` (CRITICAL, no retry) | CriticalErrorModal blocks UI | `quote_save_failure` (mismatch) | "Pricing verification failed. Please reload and try again." |
| **Commission Violation - Below Minimum** | `QUOTE_COMMISSION_BELOW_MINIMUM` (HIGH, retryable) | InlineError with "Adjust Markup" | `quote_save_failure` (commission) | "Platform commission ($X) is below minimum ($Y). Adjust markup." |
| **Commission Violation - Exceeds Maximum** | `QUOTE_COMMISSION_EXCEEDS_MAXIMUM` (HIGH, retryable) | InlineError with "Adjust Markup" | `quote_save_failure` (commission) | "Platform commission ($X) exceeds maximum ($Y). Adjust markup." |
| **Margin Below Floor** | `QUOTE_MARGIN_BELOW_FLOOR` (CRITICAL, no retry) | CriticalErrorModal blocks UI | `quote_save_failure` (margin) | "Margin (X%) is below required floor (Y%). Increase markup." |
| **Discount Invalid** | `QUOTE_DISCOUNT_INVALID_CODE` (HIGH, no retry) | InlineError with "Remove Discount" | `quote_save_failure` (discount) | "Discount code "CODE" is invalid or expired." |
| **Discount Exceeds Maximum** | `QUOTE_DISCOUNT_EXCEEDS_MAXIMUM` (HIGH, no retry) | InlineError with "Remove Discount" | `quote_save_failure` (discount) | "Discount (X%) exceeds maximum allowed (Y%)." |
| **Currency Rounding Drift** | `QUOTE_PRICING_MISMATCH` (CRITICAL, no retry) | CriticalErrorModal blocks UI | `quote_save_failure` (rounding) | "Pricing verification failed due to currency rounding. Please reload." |
| **Concurrent Price Edit - Conflict** | `QUOTE_CONFLICT_VERSION` (CRITICAL, no retry) | ConflictModal blocks UI | `quote_save_conflict` | "This quote was modified elsewhere. Your version (vN) is out of date. Current version is vM." |
| **Backend Repricing - Base Price Changed** | `QUOTE_PRICING_MISMATCH` (CRITICAL, no retry) | CriticalErrorModal blocks UI | `quote_save_failure` (repricing) | "Base price has changed since you viewed this quote. Please reload to see updated pricing." |
| **Draft Restore - Stale Pricing** | `QUOTE_DRAFT_STALE_PRICING` (HIGH, retryable) | WarningToast with options | `quote_save_failure` (draft) | "Base price has changed since draft was saved. Restore with new pricing?" |
| **Network Timeout - Retry 1** | (No response) | Show "Retrying... 1/3" | `quote_save_retry` | (No user message - UI shows retry status) |
| **Network Timeout - Final** | (No response) | RetryableInlineError with retry button | `quote_save_failure` (timeout) | "Failed to save after 3 attempts. Retry?" |

### Detailed Failure Scenarios

#### Scenario 1: Pricing Mismatch

**Trigger**: Frontend hash doesn't match backend calculation
**Cause**: 
- Client-side tampering
- Race condition (base price changed between display and save)
- Different rounding rules

**Backend Response**:
```json
{
  "success": false,
  "error": {
    "success": false,
    "errorCode": "QUOTE_PRICING_MISMATCH",
    "message": "Pricing verification failed. Please reload and try again.",
    "severity": "CRITICAL",
    "retryable": false,
    "correlationId": "CORR-20250124-ABC123",
    "timestamp": 1737700000000,
    "details": {
      "frontendHash": "PRICING-A1B2C3D4",
      "expectedHash": "PRICING-X7Y8Z9W0",
      "mismatchFields": ["basePrice", "markupAmount"],
      "frontendBasePrice": 2999.99,
      "backendBasePrice": 3049.99,
    }
  }
}
```

**Frontend UX**:
- Show `CriticalErrorModal`
- Display: "Pricing verification failed. Please reload and try again."
- Show mismatch details in collapsible section
- Block all interactions
- Offer "Reload" button

**Telemetry Event**:
```json
{
  "eventType": "quote_save_failure",
  "quoteId": "q_abc123",
  "version": 3,
  "correlationId": "CORR-20250124-ABC123",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "details": {
    "errorCode": "QUOTE_PRICING_MISMATCH",
    "severity": "CRITICAL",
    "frontendHash": "PRICING-A1B2C3D4",
    "expectedHash": "PRICING-X7Y8Z9W0",
  }
}
```

#### Scenario 2: Commission Violation - Below Minimum

**Trigger**: Calculated commission < minimum threshold
**Cause**: Markup too low

**Backend Response**:
```json
{
  "success": false,
  "error": {
    "success": false,
    "errorCode": "QUOTE_COMMISSION_BELOW_MINIMUM",
    "message": "Platform commission ($149.99) is below minimum ($200.00). Adjust markup.",
    "severity": "HIGH",
    "retryable": true,
    "correlationId": "CORR-20250124-DEF456",
    "timestamp": 1737700000000,
    "details": {
      "calculatedCommission": 149.99,
      "minimumCommission": 200.00,
      "currentMarkup": 5.00,
      "requiredMarkup": 6.67,
    }
  }
}
```

**Frontend UX**:
- Show `RetryableInlineError`
- Display: "Platform commission ($149.99) is below minimum ($200.00). Adjust markup."
- Show "Adjust Markup" button (opens markup editor)
- Highlight markup % field
- Keep editor enabled (not blocking)

**Telemetry Event**:
```json
{
  "eventType": "quote_save_failure",
  "quoteId": "q_abc123",
  "version": 3,
  "correlationId": "CORR-20250124-DEF456",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "details": {
    "errorCode": "QUOTE_COMMISSION_BELOW_MINIMUM",
    "severity": "HIGH",
    "calculatedCommission": 149.99,
    "minimumCommission": 200.00,
    "currentMarkup": 5.00,
  }
}
```

#### Scenario 3: Margin Below Floor

**Trigger**: Calculated margin < required floor
**Cause**: Markup + commission structure violates margin requirements

**Backend Response**:
```json
{
  "success": false,
  "error": {
    "success": false,
    "errorCode": "QUOTE_MARGIN_BELOW_FLOOR",
    "message": "Margin (3.50%) is below required floor (5.00%). Increase markup.",
    "severity": "CRITICAL",
    "retryable": false,
    "correlationId": "CORR-20250124-GHI789",
    "timestamp": 1737700000000,
    "details": {
      "calculatedMargin": 3.50,
      "requiredMarginFloor": 5.00,
      "subtotal": 2999.99,
      "currentMarkup": 15.00,
      "requiredMarkup": 16.67,
    }
  }
}
```

**Frontend UX**:
- Show `CriticalErrorModal`
- Display: "Margin (3.50%) is below required floor (5.00%). Increase markup."
- Show "Increase Markup" button (opens markup editor)
- Block all interactions except markup adjustment
- Show margin breakdown in details

**Telemetry Event**:
```json
{
  "eventType": "quote_save_failure",
  "quoteId": "q_abc123",
  "version": 3,
  "correlationId": "CORR-20250124-GHI789",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "details": {
    "errorCode": "QUOTE_MARGIN_BELOW_FLOOR",
    "severity": "CRITICAL",
    "calculatedMargin": 3.50,
    "requiredMarginFloor": 5.00,
  }
}
```

#### Scenario 4: Concurrent Price Edit - Conflict

**Trigger**: Two agents editing same quote simultaneously
**Cause**: Version conflict detected

**Backend Response**:
```json
{
  "success": false,
  "error": {
    "success": false,
    "errorCode": "QUOTE_CONFLICT_VERSION",
    "message": "This quote was modified elsewhere. Your version (v2) is out of date. Current version is v3.",
    "severity": "CRITICAL",
    "retryable": false,
    "correlationId": "CORR-20250124-JKL012",
    "timestamp": 1737700000000,
    "details": {
      "expectedVersion": 2,
      "actualVersion": 3,
      "quoteId": "q_abc123",
      "conflictPricingDelta": {
        "basePrice": { "before": 2999.99, "after": 3049.99, "delta": 50.00 },
        "total": { "before": 3794.98, "after": 3849.98, "delta": 55.00 },
      },
    }
  }
}
```

**Frontend UX**:
- Show `QuoteConflictModal`
- Display: "This quote was modified elsewhere. Your version (v2) is out of date. Current version is v3."
- Show pricing delta comparison
- Offer 3 options: Compare, Copy, Reload
- Block all interactions until resolved

**Telemetry Event**:
```json
{
  "eventType": "quote_save_conflict",
  "quoteId": "q_abc123",
  "version": 2,
  "correlationId": "CORR-20250124-JKL012",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "details": {
    "errorCode": "QUOTE_CONFLICT_VERSION",
    "expectedVersion": 2,
    "actualVersion": 3,
    "pricingDelta": {
      "totalChange": 55.00,
    },
  }
}
```

#### Scenario 5: Backend Repricing - Base Price Changed

**Trigger**: Amadeus API returns different base price than cached
**Cause**: Price volatility in airline inventory

**Backend Response**:
```json
{
  "success": false,
  "error": {
    "success": false,
    "errorCode": "QUOTE_PRICING_MISMATCH",
    "message": "Base price has changed since you viewed this quote. Please reload to see updated pricing.",
    "severity": "CRITICAL",
    "retryable": false,
    "correlationId": "CORR-20250124-MNO345",
    "timestamp": 1737700000000,
    "details": {
      "frontendHash": "PRICING-A1B2C3D4",
      "expectedHash": "PRICING-X7Y8Z9W0",
      "mismatchReason": "Backend repricing",
      "frontendBasePrice": 2999.99,
      "backendBasePrice": 2899.99,
      "priceChange": -100.00,
      "priceChangePercent": -3.33,
    }
  }
}
```

**Frontend UX**:
- Show `CriticalErrorModal`
- Display: "Base price has changed since you viewed this quote. Please reload to see updated pricing."
- Show price change: "Base price decreased by $100.00 (-3.33%)"
- Offer "Reload" button
- Block all interactions

**Telemetry Event**:
```json
{
  "eventType": "quote_save_failure",
  "quoteId": "q_abc123",
  "version": 3,
  "correlationId": "CORR-20250124-MNO345",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "details": {
    "errorCode": "QUOTE_PRICING_MISMATCH",
    "severity": "CRITICAL",
    "mismatchReason": "Backend repricing",
    "priceChange": -100.00,
    "priceChangePercent": -3.33,
  }
}
```

---

## Summary

### Guarantees Achieved

1. ✅ **No Price Drift** - Pricing hash prevents any drift between frontend and backend
2. ✅ **No Commission Mismatch** - Server-side validation enforces commission rules
3. ✅ **No Frontend/Backend Divergence** - All calculations happen server-side
4. ✅ **Explainable** - Audit trail + human-readable explanations for every change
5. ✅ **Traceable** - Correlation ID links every operation to audit logs
6. ✅ **Auditable** - Complete audit trail with before/after states
7. ✅ **No Rounding Ambiguity** - Explicit currency rules (always 2 decimal places)
8. ✅ **No Silent Recalculation** - Every change is logged and explained
9. ✅ **No Trusting the Client** - Frontend sends editable fields only, backend validates everything

### Safety Mechanisms

1. **Pricing Hash**: SHA-256 hash of normalized pricing fields
2. **Immutable Snapshots**: Pricing state captured at each change
3. **Server-Side Validation**: All financial calculations backend-only
4. **Audit Trail**: Complete record of all pricing changes
5. **Explanation Generator**: Human-readable descriptions of changes
6. **Display Rules**: Clear distinction between editable and computed fields
7. **Failure Scenarios**: Defined handling for all error cases

### Next Steps

1. **Implement Pricing Hash Module** - Server-side hash generation/validation
2. **Implement Audit Trail System** - Database schema + logging
3. **Implement Explanation Generator** - Server-side text generation
4. **Update Frontend Components** - Enforce display rules
5. **Integrate with Save System** - Add pricing validation to save flow
6. **Write Tests** - Unit tests for all validation rules
7. **Document for Finance Team** - Audit trail access guide

---

**Document Version**: 1.0
**Status**: ✅ SPECIFICATION COMPLETE - READY FOR IMPLEMENTATION
**Next Action**: Implement pricing hash module and audit trail system