# Backend Quote Save Endpoint - Critical Analysis & Architecture Proposal

## Executive Summary

**Endpoint**: `POST /api/agents/quotes` (Create) and `PATCH /api/agents/quotes/[id]` (Update)
**Severity**: CRITICAL - Financial-grade system requirement
**Current State**: Insufficient for production - generic errors, no atomicity, no concurrency control

---

## Current Implementation Analysis

### Identified Failure Modes

| Failure Mode | Current Handling | Risk Level | Required Fix |
|-------------|------------------|--------------|---------------|
| Database transaction rollback | ❌ Not implemented | CRITICAL | Atomic transactions |
| Concurrent modification | ❌ No locking | CRITICAL | Optimistic locking |
| Quote already sent | ⚠️  Partial (DRAFT only) | HIGH | Explicit state validation |
| Pricing inconsistency | ⚠️ Basic validation | HIGH | Comprehensive validation |
| Client validation | ⚠️ Basic check | MEDIUM | Strict ownership verification |
| Database timeout | ❌ No timeout handling | HIGH | Timeout with retry |
| Generic error responses | ❌ Returns "Unable to save quote" | CRITICAL | Semantic error codes |
| Correlation tracking | ❌ Not implemented | MEDIUM | Request correlation IDs |
| Observability | ⚠️ Basic console.error | MEDIUM | Structured logging |
| Idempotency | ❌ Not supported | MEDIUM | Idempotency keys |

### Critical Deficiencies

#### 1. NO ATOMIC TRANSACTION
```typescript
// CURRENT - Non-atomic operations
const quote = await prisma!.agentQuote.create({ ... });
await prisma!.travelAgent.update({ ... }); // Separate transaction
await prisma!.agentActivityLog.create({ ... }); // Separate transaction

// RISK: If agent update fails, quote is orphaned
// RISK: If activity log fails, no audit trail
// RISK: Partial state - inconsistent database
```

#### 2. NO CONCURRENCY CONTROL
```typescript
// CURRENT - No version checking
const updatedQuote = await prisma!.agentQuote.update({
  where: { id: params.id },
  data: updateData, // Overwrites without checking version
});

// RISK: Two agents can edit same quote simultaneously
// RISK: Last write wins - lost updates
// RISK: Data corruption
```

#### 3. GENERIC ERROR RESPONSES
```typescript
// CURRENT - Generic errors
return NextResponse.json(
  { 
    error: "Unable to save quote", // NO SEMANTIC MEANING
    hint: "Please try again..."
  },
  { status: 500 }
);

// RISK: Frontend cannot determine root cause
// RISK: No actionable information
// RISK: Cannot implement proper retry logic
// RISK: Observability nightmare
```

#### 4. LIMITED STATE VALIDATION
```typescript
// CURRENT - Only checks DRAFT status
if (quote.status !== "DRAFT") {
  return NextResponse.json(
    { error: "Can only edit draft quotes" },
    { status: 400 }
  );
}

// RISK: Doesn't check for SENT, LOCKED, ACCEPTED states
// RISK: Doesn't validate business rules
// RISK: Inconsistent state transitions
```

#### 5. NO CORRELATION TRACKING
```typescript
// CURRENT - No request tracing
console.error("[QUOTE_CREATE_ERROR]", error); // No context

// RISK: Cannot trace errors across services
// RISK: Cannot debug production issues
// RISK: No observability
```

---

## Proposed Architecture

### 1. ATOMIC TRANSACTION WRAPPER

```typescript
/**
 * Execute database operations atomically
 * Either ALL succeed or ALL rollback
 */
async function executeAtomicTransaction<T>(
  operation: (tx: PrismaTransactionClient) => Promise<T>,
  timeout: number = 10000 // 10 seconds
): Promise<T> {
  const transaction = prisma.$transaction(
    async (tx) => {
      return await operation(tx);
    },
    {
      maxWait: timeout,
      timeout: timeout,
    }
  );

  try {
    const result = await transaction;
    return result;
  } catch (error) {
    // Transaction automatically rolled back
    // Log structured error
    const correlationId = generateCorrelationId();
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2034') { // Transaction timeout
        throw QuoteErrorFactory.databaseTimeout(correlationId);
      }
      if (error.code === 'P2002') { // Unique constraint
        throw QuoteErrorFactory.persistenceFailed(correlationId, {
          reason: 'Unique constraint violation',
          code: error.code
        });
      }
    }
    
    throw error;
  }
}
```

### 2. OPTIMISTIC LOCKING (Concurrency Control)

**Strategy**: Version-based optimistic locking
```typescript
// Schema must include: version Int @default(1)

async function updateQuoteWithOptimisticLock(
  quoteId: string,
  expectedVersion: number,
  updateData: any
) {
  const correlationId = generateCorrelationId();

  // Atomic check-and-update
  const result = await executeAtomicTransaction(async (tx) => {
    // Lock row for update
    const currentQuote = await tx.agentQuote.findUnique({
      where: { id: quoteId },
      select: { version: true }
    });

    if (!currentQuote) {
      throw QuoteErrorFactory.persistenceFailed(correlationId, {
        reason: 'Quote not found during update'
      });
    }

    // Check version - CONCURRENCY CONTROL
    if (currentQuote.version !== expectedVersion) {
      throw QuoteErrorFactory.conflictVersion(
        quoteId,
        expectedVersion,
        currentQuote.version,
        correlationId
      );
    }

    // Update with version increment
    const updated = await tx.agentQuote.update({
      where: { id: quoteId },
      data: {
        ...updateData,
        version: { increment: 1 } // ATOMIC INCREMENT
      }
    });

    return updated;
  });

  return result;
}
```

### 3. COMPREHENSIVE STATE VALIDATION

```typescript
/**
 * Validate quote state before operations
 */
async function validateQuoteState(
  quote: unknown, // Quote data or existing quote
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
): Promise<void> {
  const correlationId = generateCorrelationId();

  // Check client exists and belongs to agent
  if (!quote.clientId) {
    throw QuoteErrorFactory.validationFailed(
      'Client ID is required',
      correlationId
    );
  }

  // Validate currency
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  if (quote.currency && !validCurrencies.includes(quote.currency)) {
    throw createQuoteApiError(
      'CURRENCY_INVALID',
      `Invalid currency: ${quote.currency}`,
      'HIGH',
      false,
      correlationId,
      { validCurrencies, provided: quote.currency }
    );
  }

  // Validate quote doesn't already exist (for CREATE)
  if (operation === 'CREATE') {
    const existing = await prisma.agentQuote.findFirst({
      where: {
        clientId: quote.clientId,
        agentId: quote.agentId,
        status: { in: ['DRAFT', 'SENT', 'ACCEPTED'] }
      }
    });
    
    if (existing) {
      throw QuoteErrorFactory.stateInvalid(
        'EXISTS',
        'DRAFT',
        correlationId
      );
    }
  }

  // Validate pricing consistency
  const itemsTotal = calculateItemsTotal(quote.items);
  if (Math.abs(itemsTotal - quote.total) > 0.01) {
    throw QuoteErrorFactory.itemsInconsistent(correlationId, {
      expectedTotal: itemsTotal,
      calculatedTotal: quote.total
    });
  }
}
```

### 4. OBSERVABILITY & LOGGING

```typescript
/**
 * Structured logging for quote operations
 */
interface QuoteOperationLog {
  correlationId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  quoteId?: string;
  agentId: string;
  clientId: string;
  payloadHash: string;
  duration: number;
  success: boolean;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  metadata: Record<string, unknown>;
}

async function logQuoteOperation(log: QuoteOperationLog): Promise<void> {
  // Emit structured JSON log
  console.log(JSON.stringify({
    ...log,
    timestamp: new Date().toISOString(),
    level: log.success ? 'INFO' : 'ERROR'
  }));

  // Store in database for audit trail
  try {
    await prisma.agentActivityLog.create({
      data: {
        agentId: log.agentId,
        activityType: `quote_${log.operation.toLowerCase()}`,
        entityType: 'quote',
        entityId: log.quoteId,
        description: `Quote ${log.operation.toLowerCase()} ${log.success ? 'success' : 'failed'}`,
        metadata: {
          correlationId: log.correlationId,
          payloadHash: log.payloadHash,
          duration: log.duration,
          success: log.success,
          error: log.error
        }
      }
    });
  } catch (loggingError) {
    // Never let logging failures break the flow
    console.error('[LOGGING_ERROR]', loggingError);
  }
}
```

### 5. RESPONSE CONTRACT STANDARDIZATION

```typescript
// SUCCESS RESPONSE (200/201)
{
  "success": true,
  "quoteId": "abc-123",
  "version": 5,
  "savedAt": "2026-01-24T11:00:00.000Z",
  "quote": { ... } // Optional
}

// ERROR RESPONSE (4xx/5xx)
{
  "success": false,
  "errorCode": "QUOTE_CONFLICT_VERSION",
  "message": "Quote was modified by another agent. Please reload and try again.",
  "severity": "HIGH",
  "retryable": true,
  "correlationId": "REQ-ABC123-XYZ789",
  "details": {
    "quoteId": "abc-123",
    "expectedVersion": 4,
    "actualVersion": 5
  },
  "timestamp": 1737705600000
}
```

---

## Data Model Changes Required

### Add Version Field to AgentQuote

```prisma
model AgentQuote {
  id            String   @id @default(cuid())
  // ... existing fields ...
  version       Int      @default(1)  // NEW: For optimistic locking
  lastModifiedBy String?                 // NEW: Track who modified
  lastModifiedAt DateTime? @default(now()) // NEW: Track when modified
  
  @@index([version])  // NEW: Index for version checks
}
```

### Add Idempotency Support (Optional but Recommended)

```prisma
model QuoteIdempotency {
  id          String   @id @default(cuid())
  idempotencyKey String  @unique // Client-provided key
  agentId     String
  quoteId     String?
  payloadHash String
  createdAt   DateTime @default(now())
  expiresAt   DateTime // TTL: 24 hours
  
  @@index([idempotencyKey])
  @@index([agentId])
  @@index([expiresAt])
}
```

---

## Implementation Plan

### Phase 1: Foundation (CRITICAL)
1. ✅ Create semantic error taxonomy (`lib/errors/QuoteApiErrors.ts`)
2. ⏳ Add version field to Prisma schema
3. ⏳ Implement atomic transaction wrapper
4. ⏳ Implement optimistic locking helper
5. ⏳ Add structured logging utility

### Phase 2: Endpoint Hardening (CRITICAL)
6. ⏳ Rewrite POST /api/agents/quotes with:
   - Atomic transaction
   - State validation
   - Comprehensive error handling
   - Correlation tracking
   - Observability

7. ⏳ Rewrite PATCH /api/agents/quotes/[id] with:
   - Optimistic locking
   - Atomic transaction
   - State validation
   - Version conflict detection
   - Comprehensive error handling

### Phase 3: Production Readiness (HIGH)
8. ⏳ Write unit tests for all error paths
9. ⏳ Write integration tests for transaction rollback
10. ⏳ Write integration tests for concurrency conflicts
11. ⏳ Create production readiness checklist
12. ⏳ Document rollback procedures

---

## Failure Mode Matrix

| Error Code | Severity | Retryable | HTTP Status | Root Cause | Handling |
|-------------|-----------|-----------|--------------|-------------|-----------|
| QUOTE_VALIDATION_FAILED | HIGH | false | 400 | Invalid input data | Return field errors |
| QUOTE_STATE_INVALID | HIGH | false | 400 | Wrong state for operation | Return current/required state |
| QUOTE_CONFLICT_VERSION | HIGH | true | 409 | Concurrent modification | Return version mismatch |
| QUOTE_ALREADY_SENT | CRITICAL | false | 403 | Quote already sent to client | Block operation |
| QUOTE_PERSISTENCE_FAILED | CRITICAL | true | 500 | Database write failure | Retry with exponential backoff |
| DATABASE_TIMEOUT | HIGH | true | 504 | Database operation timeout | Retry with increased timeout |
| DATABASE_TRANSACTION_ABORTED | CRITICAL | true | 503 | Transaction rollback | Retry entire operation |
| CLIENT_NOT_FOUND | HIGH | false | 404 | Client doesn't exist | Inform user |
| AGENT_NOT_FOUND | HIGH | false | 404 | Agent doesn't exist | Auth error |
| PRICING_VALIDATION_FAILED | HIGH | false | 400 | Pricing calculation error | Return pricing errors |
| ITEMS_INCONSISTENT | CRITICAL | false | 400 | Total doesn't match items | Block save, notify user |
| INTERNAL_ERROR | CRITICAL | false | 500 | Unhandled exception | Log, alert admins |

---

## Testing Strategy

### Unit Tests

```typescript
describe('Quote Save Error Handling', () => {
  it('returns QUOTE_VALIDATION_FAILED for missing client', async () => {
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('QUOTE_VALIDATION_FAILED');
    expect(response.body.retryable).toBe(false);
  });

  it('returns QUOTE_CONFLICT_VERSION for version mismatch', async () => {
    // Simulate concurrent update
    const response = await PATCH(updateRequest);
    expect(response.status).toBe(409);
    expect(response.body.errorCode).toBe('QUOTE_CONFLICT_VERSION');
    expect(response.body.retryable).toBe(true);
  });

  it('rolls back transaction on agent update failure', async () => {
    // Mock agent update failure
    const result = await POST(request);
    expect(result).toBe('rolled back');
    const quote = await prisma.agentQuote.findFirst();
    expect(quote).toBeNull();
  });
});
```

### Integration Tests

```typescript
describe('Quote Save Concurrency', () => {
  it('prevents concurrent modifications', async () => {
    const quoteId = await createQuote();
    
    // Two concurrent updates
    const [result1, result2] = await Promise.all([
      updateQuote(quoteId, { version: 1 }, { name: 'Quote A' }),
      updateQuote(quoteId, { version: 1 }, { name: 'Quote B' })
    ]);
    
    // One should succeed, one should fail
    expect(result1.status === 200 || result2.status === 200).toBe(true);
    expect(result1.status === 409 || result2.status === 409).toBe(true);
  });
});
```

---

## Production Readiness Checklist

### Pre-Deployment
- [ ] Schema migration executed (add version field)
- [ ] All error codes documented
- [ ] Correlation ID tracking implemented
- [ ] Atomic transaction wrapper tested
- [ ] Optimistic locking tested
- [ ] State validation tested
- [ ] Observability tested
- [ ] Unit tests passing (100%)
- [ ] Integration tests passing (100%)
- [ ] Load tested (>1000 concurrent saves)
- [ ] Timeout configured (10s)
- [ ] Retry logic implemented

### Post-Deployment
- [ ] Monitor error rates by code
- [ ] Monitor transaction rollback rate
- [ ] Monitor conflict rate
- [ ] Verify correlation ID in logs
- [ ] Verify alerts firing for CRITICAL errors
- [ ] Verify no regression in quote save success rate
- [ ] Verify pricing consistency maintained

---

## Rollback Plan

### Immediate Rollback
```bash
# 1. Revert schema migration
npx prisma migrate resolve --rolled-back

# 2. Revert code
git revert <commit-hash>

# 3. Deploy
npm run deploy
```

### Gradual Rollback (Feature Flag)
```typescript
const USE_HARDENED_SAVE = process.env.FEATURE_HARDENED_QUOTE_SAVE === 'true';

export async function POST(request: NextRequest) {
  if (USE_HARDENED_SAVE) {
    return POST_Hardened(request);
  }
  return POST_Legacy(request);
}
```

---

**Document Version**: 1.0
**Status**: ANALYSIS COMPLETE
**Next Step**: IMPLEMENT HARDENED ENDPOINTS