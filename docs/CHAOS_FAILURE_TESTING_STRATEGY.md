# Chaos & Failure Testing Strategy

## Status: CRITICAL - SYSTEM CORRECTNESS UNDER FAILURE

**Date**: January 24, 2026
**Priority**: CRITICAL - Data Integrity
**Scope**: Quote Save System + Pricing Integrity

---

## Philosophy

**CORRECTNESS OVER PERFORMANCE** - System must remain accurate even when slow
**TRANSPARENCY OVER OPTIMISM** - Never lie to users about data state
**INTEGRITY OVER RECOVERY** - Better to fail than corrupt
**AUDITABILITY OVER SILENCE** - Every failure must be traceable

**Goal**: Even catastrophic failure cannot corrupt data, mislead users, or create financial disputes

---

## PART 1 — Failure Taxonomy

### Failure Category Table

| Category | Severity | Impact | Detection | Recovery |
|-----------|----------|--------|------------|------------|
| **Network Failures** | HIGH | Timeout, connection error | Auto-retry (max 3) |
| - Request timeout | HIGH | 5s timeout | Retry with exponential backoff |
| - Connection refused | HIGH | Socket error | Show error, no retry |
| - DNS resolution failure | HIGH | Network error | Show error, no retry |
| - Response dropped | CRITICAL | No response received | User must retry |
| - Partial response | CRITICAL | Incomplete JSON | Block, show error |
| - Out-of-order responses | CRITICAL | Sequence mismatch | Block, reload required |
| **Backend Failures** | CRITICAL | HTTP 5xx | Depends on error code |
| - Internal server error | CRITICAL | 500 | Retryable if temporary |
| - Database connection lost | CRITICAL | DB error | No retry, show error |
| - Transaction rollback | CRITICAL | Rollback detected | Block, user must retry |
| - Pricing hash mismatch | CRITICAL | Hash validation failure | No save allowed |
| - Commission validation failure | CRITICAL | Rule violation | No save allowed |
| - Version conflict | CRITICAL | Version mismatch | Conflict modal |
| **Database Failures** | HIGH | DB error codes | Depends on operation |
| - Latency spike | HIGH | Query timeout | Retry with backoff |
| - Deadlock | HIGH | Deadlock error | Auto-retry (max 2) |
| - Constraint violation | CRITICAL | Unique constraint | Conflict modal |
| - Write failure | CRITICAL | Write error | Block, show error |
| - Read failure | HIGH | Read error | Block, show error |
| **Concurrent Operations** | CRITICAL | Version mismatch | Conflict resolution |
| - Dual edit conflict | CRITICAL | Version conflict | Conflict modal |
| - Duplicate request | HIGH | Duplicate correlation ID | Idempotent handling |
| - Race condition | CRITICAL | Atomic violation | Block, error |
| - Stale frontend state | HIGH | Version mismatch | Reload required |
| **State Corruption** | CRITICAL | Invariant violation | Block, reload required |
| - Draft corruption | HIGH | Invalid JSON | Draft reset |
| - State machine violation | CRITICAL | Illegal transition | Block, reload |
| - Hash mismatch | CRITICAL | Integrity check failure | Block, reload |
| **Infrastructure Failures** | HIGH | Monitoring alerts | Fallback behavior |
| - Telemetry endpoint down | LOW | 503/504 | Continue without telemetry |
| - Audit log write failure | HIGH | Write error | Save succeeds, log error |
| - Cache failure | LOW | Cache error | Bypass cache |

### Expected System Behavior Per Category

#### Network Failures
- **Behavior**: Auto-retry (max 3) with exponential backoff
- **Frontend**: Show retry count, never show "Saved" until confirmed
- **Backend**: Return 504 on timeout, 503 on service unavailable
- **Telemetry**: Log retry attempt, failure reason
- **Audit**: No save = no audit entry

#### Backend Failures
- **Behavior**: Depends on error code (retryable vs non-retryable)
- **Frontend**: Show appropriate error (CRITICAL = modal, HIGH = inline)
- **Backend**: Include correlation ID, error code, severity
- **Telemetry**: Log failure with error code and severity
- **Audit**: No save = no audit entry

#### Database Failures
- **Behavior**: Auto-retry for transient errors (deadlock, timeout)
- **Frontend**: Show error if retry fails
- **Backend**: Retry up to 2 times for transient errors
- **Telemetry**: Log DB error with retry count
- **Audit**: No save = no audit entry

#### Concurrent Operations
- **Behavior**: Block concurrent saves, enforce version consistency
- **Frontend**: Show conflict modal for version conflicts
- **Backend**: Return 409 Conflict with version info
- **Telemetry**: Log conflict with version numbers
- **Audit**: Log conflict, no save entry

#### State Corruption
- **Behavior**: Detect invariants, block all operations
- **Frontend**: Show critical error, force reload
- **Backend**: Reject all operations, return error
- **Telemetry**: Log corruption detection
- **Audit**: Log corruption event

#### Infrastructure Failures
- **Behavior**: Degrade gracefully, never block core operations
- **Frontend**: Continue without telemetry, log error
- **Backend**: Save succeeds, log infrastructure failure separately
- **Telemetry**: Log telemetry failure (separate from save events)
- **Audit**: Save succeeds even if audit log fails (logged separately)

---

## PART 2 — Chaos Scenarios (15+)

### Scenario 1: Save Request Succeeds But Response Is Dropped

**Trigger**: Network drops response after backend processes save

**Backend Behavior**:
```typescript
// Backend processes save successfully
// Transaction commits
// Response sent but dropped by network

{
  success: true,
  quoteId: "q_abc123",
  version: 3,
  savedAt: "2026-01-24T10:30:00.000Z",
  quote: { ... },
  pricing: { ... }
}
// Response dropped before reaching client
```

**Frontend State Transition**:
```typescript
// Current state: SAVING
// Next state: ERROR_RETRYABLE (no response received)
// NEVER: SAVED (no confirmation)
```

**User-Visible Message**:
```
"Unable to save quote. Please check your connection and try again."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_failure",
  "quoteId": "q_abc123",
  "version": 2,
  "correlationId": "CORR-20250124-ABC123",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "details": {
    "errorCode": "NETWORK_RESPONSE_DROPPED",
    "severity": "HIGH",
    "attempts": 1,
    "lastError": "No response received"
  }
}
```

**Audit Trail Result**:
- No audit entry (no save confirmation)
- Backend has saved data but frontend doesn't know
- **Next save will detect version conflict**

**Data Integrity Outcome**: ✅ PRESERVED
- Backend data is consistent
- Frontend state is consistent (not saved)
- Next save will trigger conflict resolution

---

### Scenario 2: Save Request Fails After Pricing Hash Validation

**Trigger**: Pricing hash mismatch detected during save

**Backend Behavior**:
```typescript
// Backend validates pricing hash
// Hash mismatch detected
// Transaction rolled back

{
  success: false,
  error: {
    success: false,
    errorCode: "QUOTE_PRICING_MISMATCH",
    message: "Pricing verification failed. Please reload and try again.",
    severity: "CRITICAL",
    retryable: false,
    correlationId: "CORR-20250124-DEF456",
    timestamp: 1737700000000,
    details: {
      frontendHash: "PRICING-A1B2C3D4",
      expectedHash: "PRICING-X7Y8Z9W0",
      mismatchReason: "Base price changed from $2999.99 to $3049.99 (+$50.00, +1.67%)"
    }
  }
}
```

**Frontend State Transition**:
```typescript
// Current state: SAVING
// Next state: ERROR_FATAL (pricing mismatch)
// Show CriticalErrorModal
```

**User-Visible Message**:
```
"Pricing verification failed. Please reload and try again."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_failure",
  "quoteId": "q_abc123",
  "version": 2,
  "correlationId": "CORR-20250124-DEF456",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "details": {
    "errorCode": "QUOTE_PRICING_MISMATCH",
    "severity": "CRITICAL",
    "frontendHash": "PRICING-A1B2C3D4",
    "expectedHash": "PRICING-X7Y8Z9W0"
  }
}
```

**Audit Trail Result**:
- No audit entry (save rejected)
- No data corruption possible

**Data Integrity Outcome**: ✅ PRESERVED
- Save blocked before any data written
- Frontend must reload to get fresh pricing

---

### Scenario 3: Retry Occurs After Pricing Snapshot Is Outdated

**Trigger**: User edits quote after save failed, then retries with old snapshot

**Backend Behavior**:
```typescript
// Backend receives retry with old pricing hash
// Frontend hash based on old pricing snapshot
// Backend has newer pricing (base price changed)

// Validate pricing hash
const hashValidation = validatePricingHash(
  request.pricingHash,
  backendCalculatedPricing,
  request.frontendInput
);

// Hash mismatch - pricing changed
// Reject save
```

**Frontend State Transition**:
```typescript
// Current state: ERROR_RETRYABLE
// User edits pricing (new snapshot created)
// User clicks retry (tries with old snapshot)
// Next state: ERROR_FATAL (hash mismatch with new backend pricing)
```

**User-Visible Message**:
```
"Pricing has changed since your last save attempt. Please reload and try again."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_failure",
  "details": {
    "errorCode": "QUOTE_PRICING_MISMATCH",
    "severity": "CRITICAL",
    "retryContext": "OUTDATED_SNAPSHOT",
    "frontendSnapshotVersion": 2,
    "backendPricingVersion": 3
  }
}
```

**Audit Trail Result**:
- No audit entry (save rejected)
- Old snapshot prevented from being saved

**Data Integrity Outcome**: ✅ PRESERVED
- Outdated pricing cannot overwrite newer pricing
- User must reload to see current pricing

---

### Scenario 4: Two Agents Edit Pricing Concurrently

**Trigger**: Agent A and Agent B edit same quote simultaneously

**Backend Behavior**:
```typescript
// Agent A: POST /api/agents/quotes/q_abc123 (version 2)
// Backend saves successfully
// Version becomes 3

// Agent B: POST /api/agents/quotes/q_abc123 (version 2)
// Backend detects version conflict
// Expected version: 2, Actual version: 3

{
  success: false,
  error: {
    success: false,
    errorCode: "QUOTE_CONFLICT_VERSION",
    message: "This quote was modified elsewhere. Your version (v2) is out of date. Current version is v3.",
    severity: "CRITICAL",
    retryable: false,
    correlationId: "CORR-20250124-GHI789",
    timestamp: 1737700000000,
    details: {
      expectedVersion: 2,
      actualVersion: 3,
      quoteId: "q_abc123",
      conflictPricingDelta: {
        basePrice: { "before": 2999.99, "after": 3049.99, "delta": 50.00 },
        total: { "before": 3794.98, "after": 3849.98, "delta": 55.00 }
      }
    }
  }
}
```

**Frontend State Transition**:
```typescript
// Agent B:
// Current state: SAVING
// Next state: CONFLICT (version mismatch)
// Show QuoteConflictModal
```

**User-Visible Message**:
```
"This quote was modified elsewhere. Your version (v2) is out of date. Current version is v3."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_conflict",
  "quoteId": "q_abc123",
  "version": 2,
  "correlationId": "CORR-20250124-GHI789",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "details": {
    "errorCode": "QUOTE_CONFLICT_VERSION",
    "expectedVersion": 2,
    "actualVersion": 3,
    "conflictAgentId": "agent_A",
    "pricingDelta": { "totalChange": 55.00 }
  }
}
```

**Audit Trail Result**:
- Agent A's save logged with audit trail
- Agent B's conflict logged (no save entry)
- Both versions preserved in audit trail

**Data Integrity Outcome**: ✅ PRESERVED
- No data loss (Agent A's save successful)
- Agent B's changes preserved via conflict resolution
- No silent overwrites

---

### Scenario 5: Frontend Retries While Backend Version Increments

**Trigger**: Frontend retries save while another agent updates quote

**Backend Behavior**:
```typescript
// Retry 1: Version 2
// Conflict detected, return error

// Meanwhile, Agent C saves quote
// Version becomes 4

// Retry 2: Frontend still using version 2
// Conflict detected, return error (now version 4)

{
  success: false,
  error: {
    errorCode: "QUOTE_CONFLICT_VERSION",
    message: "This quote was modified elsewhere. Your version (v2) is out of date. Current version is v4.",
    details: {
      expectedVersion: 2,
      actualVersion: 4,
      conflictCount: 2,
      lastConflictVersion: 3,
      currentConflictVersion: 4
    }
  }
}
```

**Frontend State Transition**:
```typescript
// Retry 1: SAVING → ERROR_RETRYABLE
// Retry 2: ERROR_RETRYABLE → ERROR_FATAL (conflict still active)
// Show CriticalErrorModal
```

**User-Visible Message**:
```
"This quote has been modified multiple times. Please reload to see the latest version."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_conflict",
  "details": {
    "retryCount": 2,
    "expectedVersion": 2,
    "actualVersion": 4,
    "versionSkipped": [3, 4]
  }
}
```

**Audit Trail Result**:
- Agent C's save logged
- Both conflicts logged
- Frontend prevented from overwriting

**Data Integrity Outcome**: ✅ PRESERVED
- Multiple conflicts detected and blocked
- No data corruption possible

---

### Scenario 6: Pricing Hash Mismatch After Retry

**Trigger**: Pricing changes between retry attempts

**Backend Behavior**:
```typescript
// Retry 1: Pricing hash valid
// Save fails (network timeout)

// Meanwhile, Amadeus API returns new base price
// Backend recalculates pricing

// Retry 2: Frontend sends same hash
// Backend validates hash
// Hash mismatch detected

{
  success: false,
  error: {
    errorCode: "QUOTE_PRICING_MISMATCH",
    message: "Pricing has changed between retry attempts. Please reload.",
    severity: "CRITICAL",
    retryable: false,
    details: {
      frontendHash: "PRICING-A1B2C3D4",
      expectedHash: "PRICING-X7Y8Z9W0",
      retryAttempt: 2,
      pricingChangeDetected: true,
      mismatchReason: "Base price changed during retry window"
    }
  }
}
```

**Frontend State Transition**:
```typescript
// Retry 1: SAVING → ERROR_RETRYABLE
// Retry 2: ERROR_RETRYABLE → ERROR_FATAL
// Show CriticalErrorModal
```

**User-Visible Message**:
```
"Pricing has changed during retry attempts. Please reload to see updated pricing."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_failure",
  "details": {
    "errorCode": "QUOTE_PRICING_MISMATCH",
    "retryAttempt": 2,
    "pricingChangedDuringRetry": true,
    "timeBetweenRetries": 1500
  }
}
```

**Audit Trail Result**:
- No save entry (all retries failed)
- Pricing change logged

**Data Integrity Outcome**: ✅ PRESERVED
- Hash validation prevents stale pricing overwrite
- User must reload to get current pricing

---

### Scenario 7: Commission Rule Changes Mid-Session

**Trigger**: Admin updates commission rules while agent is editing quote

**Backend Behavior**:
```typescript
// Agent starts editing quote (version 2)
// Commission rate: 5%, minimum: $200

// Admin updates commission rules
// New commission rate: 6%, minimum: $250

// Agent saves quote with markup resulting in $200 commission
// Backend validates against NEW rules
// Commission below NEW minimum ($250)

{
  success: false,
  error: {
    errorCode: "QUOTE_COMMISSION_BELOW_MINIMUM",
    message: "Platform commission ($200.00) is below minimum ($250.00). Please adjust markup.",
    severity: "HIGH",
    retryable: true,
    details: {
      calculatedCommission: 200.00,
      minimumCommission: 250.00,
      currentMarkup: 5.00,
      requiredMarkup: 6.25,
      ruleChangeDetected: true,
      previousMinimum: 200.00,
      newMinimum: 250.00
    }
  }
}
```

**Frontend State Transition**:
```typescript
// Current state: SAVING
// Next state: ERROR_RETRYABLE
// Show RetryableInlineError with "Adjust Markup" button
```

**User-Visible Message**:
```
"Platform commission ($200.00) is below minimum ($250.00). Adjust markup."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_failure",
  "details": {
    "errorCode": "QUOTE_COMMISSION_BELOW_MINIMUM",
    "severity": "HIGH",
    "ruleChangeDetected": true,
    "previousRule": { "minimum": 200.00 },
    "newRule": { "minimum": 250.00 },
    "timestampOfRuleChange": "2026-01-24T10:25:00.000Z"
  }
}
```

**Audit Trail Result**:
- No save entry (validation failed)
- Rule change logged separately

**Data Integrity Outcome**: ✅ PRESERVED
- New rules enforced immediately
- User must adjust to meet new requirements

---

### Scenario 8: Database Rollback After Audit Log Write

**Trigger**: Quote save succeeds, but audit log write fails causing transaction rollback

**Backend Behavior**:
```typescript
// Transaction begins
// 1. Save quote to database (success)
// 2. Write pricing snapshot (success)
// 3. Write audit log (FAILURE - constraint violation)

// Transaction rollback initiated
// All changes rolled back

{
  success: false,
  error: {
    errorCode: "QUOTE_AUDIT_LOG_FAILURE",
    message: "Unable to complete save due to audit logging failure. Please try again.",
    severity: "CRITICAL",
    retryable: true,
    details: {
      failurePoint": "AUDIT_LOG_WRITE",
      "databaseError": "constraint_violation",
      "quoteSaved": true,
      "auditLogSaved": false,
      "transactionRolledBack": true
    }
  }
}
```

**Frontend State Transition**:
```typescript
// Current state: SAVING
// Next state: ERROR_RETRYABLE
// Show RetryableInlineError
```

**User-Visible Message**:
```
"Unable to complete save due to audit logging failure. Please try again."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_failure",
  "details": {
    "errorCode": "QUOTE_AUDIT_LOG_FAILURE",
    "severity": "HIGH",
    "failurePoint": "AUDIT_LOG_WRITE",
    "transactionRolledBack": true,
    "quoteSaved": true
  }
}
```

**Audit Trail Result**:
- No audit entry (transaction rolled back)
- No quote saved (transaction atomicity)

**Data Integrity Outcome**: ✅ PRESERVED
- Transaction rollback ensures consistency
- No partial data state possible

---

### Scenario 9: Audit Log Write Fails But Save Succeeds

**Trigger**: Audit log write fails after quote save, but doesn't cause rollback

**Backend Behavior**:
```typescript
// Transaction begins
// 1. Save quote to database (success)
// 2. Write pricing snapshot (success)
// 3. Write audit log (ASYNC FAILURE)

// Transaction commits (quote saved)
// Audit log failure logged separately

{
  success: true,
  quoteId: "q_abc123",
  version: 3,
  savedAt: "2026-01-24T10:30:00.000Z",
  quote: { ... },
  warning: {
    code: "AUDIT_LOG_ASYNC_FAILURE",
    message: "Save successful, but audit log may be delayed."
  }
}

// Background job: Log audit failure
{
  eventType: "audit_log_failure",
  details: {
    quoteId: "q_abc123",
    auditId: "failed_to_log",
    error: "database_connection_timeout",
    retryScheduled: true
  }
}
```

**Frontend State Transition**:
```typescript
// Current state: SAVING
// Next state: SAVED
// Show "Saved successfully" with warning badge
// Show WarningToast: "Save successful, but audit log may be delayed."
```

**User-Visible Message**:
```
"Quote saved successfully. (Note: Audit log may be delayed)"
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_success",
  "details": {
    "quoteId": "q_abc123",
    "version": 3,
    "warning": "AUDIT_LOG_ASYNC_FAILURE"
  }
},
{
  "eventType": "audit_log_failure",
  "details": {
    "quoteId": "q_abc123",
    "error": "database_connection_timeout",
    "async": true
  }
}
```

**Audit Trail Result**:
- Quote saved with audit trail entry
- Audit log failure logged separately
- Background retry scheduled for audit log

**Data Integrity Outcome**: ✅ PRESERVED
- Quote save succeeds (data safe)
- Audit failure doesn't block save (graceful degradation)
- Failure logged for investigation

---

### Scenario 10: Telemetry Endpoint Down

**Trigger**: Save succeeds, but telemetry endpoint returns 503

**Backend Behavior**:
```typescript
// Transaction begins
// 1. Save quote to database (success)
// 2. Write audit log (success)
// 3. Send telemetry (FAILURE - 503 Service Unavailable)

// Transaction commits (telemetry failure doesn't block)

{
  success: true,
  quoteId: "q_abc123",
  version: 3,
  savedAt: "2026-01-24T10:30:00.000Z",
  quote: { ... }
}

// Background: Log telemetry failure
// Queue telemetry event for retry
```

**Frontend State Transition**:
```typescript
// Current state: SAVING
// Next state: SAVED
// Show "Saved successfully" (no user-visible warning)
```

**User-Visible Message**:
```
"Quote saved successfully."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_success",
  "details": {
    "quoteId": "q_abc123",
    "version": 3,
    "telemetryDelivered": false,
    "telemetryQueued": true
  }
},
{
  "eventType": "telemetry_failure",
  "details": {
    "endpoint": "/api/telemetry",
    "statusCode": 503,
    "eventsQueued": 1,
    "retryScheduled": true
  }
}
```

**Audit Trail Result**:
- Quote saved with audit trail entry
- Telemetry failure logged (non-blocking)

**Data Integrity Outcome**: ✅ PRESERVED
- Save succeeds (data safe)
- Telemetry failure doesn't block save
- Telemetry queued for retry

---

### Scenario 11: User Refreshes Page Mid-Save

**Trigger**: User refreshes browser while save request is in flight

**Backend Behavior**:
```typescript
// Frontend: SAVING (request sent)
// User refreshes page
// Frontend state lost

// Backend: Processes save request
// Save succeeds, version becomes 3

// Frontend reloads
// Fetches quote version 3
// Draft restored from localStorage
// Detects pricing changes (if any)
```

**Frontend State Transition**:
```typescript
// Before refresh: SAVING
// After refresh: IDLE (fresh state)
// Draft loaded: DIRTY (if draft exists)
```

**User-Visible Message**:
```
"Draft restored from auto-save. Your version (v2) is out of date. Current version is v3."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_draft_restored",
  "details": {
    "quoteId": "q_abc123",
    "draftVersion": 2,
    "currentVersion": 3,
    "draftAge": "2 minutes",
    "pricingChanged": true
  }
}
```

**Audit Trail Result**:
- Save succeeded (audit entry exists)
- Draft restoration logged

**Data Integrity Outcome**: ✅ PRESERVED
- Backend data is current
- Draft preserved in localStorage
- User can restore draft or discard

---

### Scenario 12: LocalStorage Draft Is Stale vs Backend

**Trigger**: User reloads page after backend pricing changed

**Backend Behavior**:
```typescript
// Frontend: Request draft restoration
// Backend: Validate draft pricing against current pricing

// Backend fetches current pricing
// Base price changed: $2999.99 → $3049.99

{
  success: false,
  error: {
    errorCode: "QUOTE_DRAFT_STALE_PRICING",
    message: "Base price has changed since draft was saved. Restore with new pricing?",
    severity: "HIGH",
    retryable: true,
    details: {
      draftBasePrice: 2999.99,
      currentBasePrice: 3049.99,
      priceChange: 50.00,
      priceChangePercent: 1.67,
      draftAge: "5 minutes"
    }
  }
}
```

**Frontend State Transition**:
```typescript
// Current state: DRAFT_RESTORATION
// Show WarningToast with 2 options:
// 1. Restore with new pricing (recalculates totals)
// 2. Discard draft (load current version)
```

**User-Visible Message**:
```
"Base price has changed since draft was saved. Restore with new pricing?"
Options: [Restore with new pricing] [Discard draft]
```

**Telemetry Events**:
```json
{
  "eventType": "quote_draft_validation",
  "details": {
    "errorCode": "QUOTE_DRAFT_STALE_PRICING",
    "severity": "HIGH",
    "draftBasePrice": 2999.99,
    "currentBasePrice": 3049.99,
    "userChoice": "RESTORE_WITH_NEW_PRICING"
  }
}
```

**Audit Trail Result**:
- No audit entry (draft restoration, not save)
- Validation logged

**Data Integrity Outcome**: ✅ PRESERVED
- Stale pricing detected and prevented
- User explicitly chooses action

---

### Scenario 13: Backend Recalculates Pricing Due to Rule Update

**Trigger**: Pricing rules change, backend recalculates on save

**Backend Behavior**:
```typescript
// Frontend sends pricing with markup: 15%
// Backend calculates: base $2999.99 + markup $449.99 = $3449.98

// Rule update: Tax rate changes from 5% to 6%
// Backend recalculates: tax $172.50 (new) → $206.99 (old)
// Total changes: $3794.98 → $3829.97

{
  success: true,
  quoteId: "q_abc123",
  version: 3,
  savedAt: "2026-01-24T10:30:00.000Z",
  quote: { ... },
  pricing: {
    basePrice: 2999.99,
    markupAmount: 449.99,
    subtotal: 3449.98,
    commissionAmount: 172.50,
    taxAmount: 206.99,
    total: 3829.97
  },
  warning: {
    code: "PRICING_RECALCULATED",
    message: "Pricing recalculated due to rule updates. Total changed from $3,794.98 to $3,829.97 (+$34.99)."
  }
}
```

**Frontend State Transition**:
```typescript
// Current state: SAVING
// Next state: SAVED
// Show "Saved successfully" with warning
// Show WarningToast about pricing recalculation
```

**User-Visible Message**:
```
"Quote saved successfully. Note: Pricing recalculated due to rule updates. Total changed from $3,794.98 to $3,829.97 (+$34.99)."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_success",
  "details": {
    "quoteId": "q_abc123",
    "version": 3,
    "warning": "PRICING_RECALCULATED",
    "totalChange": 34.99,
    "reason": "Tax rate changed from 5% to 6%"
  }
}
```

**Audit Trail Result**:
- Save logged with recalculated pricing
- Explanation: "Tax rate changed from 5% to 6%"

**Data Integrity Outcome**: ✅ PRESERVED
- Backend recalculates correctly
- User informed of changes
- No silent recalculations

---

### Scenario 14: Duplicate PATCH Requests With Same Correlation ID

**Trigger**: User double-clicks Save button, sends identical requests

**Backend Behavior**:
```typescript
// Request 1: PATCH /api/agents/quotes/q_abc123
// correlationId: "CORR-20250124-ABC123"
// version: 2

// Request 2: PATCH /api/agents/quotes/q_abc123 (same correlation ID)
// version: 2

// Backend processes Request 1 first
// Save succeeds, version becomes 3

// Backend processes Request 2
// Detects duplicate correlation ID
// Returns idempotent response

{
  success: true,
  quoteId: "q_abc123",
  version: 3,
  savedAt: "2026-01-24T10:30:00.000Z",
  quote: { ... },
  duplicate: true,
  message: "This save request was already processed."
}
```

**Frontend State Transition**:
```typescript
// Request 1: SAVING → SAVED
// Request 2: SAVING → SAVED (idempotent)
// Show "Saved successfully" (no duplicate error to user)
```

**User-Visible Message**:
```
"Quote saved successfully."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_success",
  "details": {
    "quoteId": "q_abc123",
    "version": 3,
    "duplicateRequest": true,
    "correlationId": "CORR-20250124-ABC123"
  }
}
```

**Audit Trail Result**:
- Only one audit entry (idempotent)
- Duplicate request logged

**Data Integrity Outcome**: ✅ PRESERVED
- Idempotency prevents double-save
- No duplicate data

---

### Scenario 15: Save Succeeds But Frontend Crashes Before State Update

**Trigger**: Frontend crashes after receiving success response

**Backend Behavior**:
```typescript
// Save succeeds
// Quote updated, version 3
// Audit log written
// Response sent to frontend

{
  success: true,
  quoteId: "q_abc123",
  version: 3,
  savedAt: "2026-01-24T10:30:00.000Z",
  quote: { ... }
}

// Frontend crashes before updating state
```

**Frontend State Transition**:
```typescript
// Before crash: SAVING
// After crash: STATE LOST
// Page reload: Fresh state
// Fetch current version: 3
// Detect state: SAVED (backend confirms)
// Show: "Quote saved successfully"
```

**User-Visible Message**:
```
"Quote saved successfully."
```

**Telemetry Events**:
```json
{
  "eventType": "quote_save_success",
  "details": {
    "quoteId": "q_abc123",
    "version": 3,
    "frontendCrash": true,
    "stateRecovered": true
  }
}
```

**Audit Trail Result**:
- Save logged successfully
- Frontend crash logged separately

**Data Integrity Outcome**: ✅ PRESERVED
- Backend data is safe
- Frontend recovers state from backend on reload
- No data loss

---

## PART 3 — Invariants (Must NEVER Break)

### Invariant List

| Invariant | Description | Detection | Enforcement | Consequence of Violation |
|-----------|-------------|------------|--------------------------|
| **Pricing Never Changes Without User Action** | Pricing only changes when user edits or system rules update | Audit trail + pricing hash | CRITICAL - Data corruption detected |
| **Commission Is Never Calculated Client-Side** | Commission amounts always from backend | Backend validation only | CRITICAL - Save rejected |
| **SAVED Is Never Shown Unless Backend Confirms** | Frontend state SAVED only after success=true | Frontend state machine | CRITICAL - Misleading UI |
| **Conflicts Never Auto-Resolve** | User must explicitly choose resolution | Conflict modal design | CRITICAL - Data loss risk |
| **Draft Data Is Never Silently Discarded** | Draft only cleared on SAVE_SUCCESS | Draft persistence logic | HIGH - User data loss |
| **Audit Trail Is Append-Only** | Audit entries never modified | Database constraints | CRITICAL - Audit corruption |
| **Hash Mismatch Always Blocks Save** | Pricing hash mismatch = no save | Backend validation | CRITICAL - Data integrity violation |
| **Version Never Goes Backwards** | Version number only increments | Backend version check | CRITICAL - Data corruption |
| **Total Is Never Edited Directly** | Total always calculated from components | Frontend validation | HIGH - Financial error |
| **Correlation ID Is Unique Per Save Attempt** | Each save has unique correlation ID | Frontend generation | HIGH - Traceability loss |
| **Retry Never Uses Updated Pricing** | Retries use original pricing snapshot | Frontend retry logic | CRITICAL - Data drift |

### Detection Mechanisms

#### Frontend Detection
```typescript
// State machine enforcement
function enforceInvariants(state: SaveState, action: SaveAction): SaveState {
  // Invariant: SAVED only after backend success
  if (action.type === 'SAVE_SUCCESS') {
    return { ...state, state: 'SAVED' };
  }
  
  // Invariant: Never show SAVED optimistically
  if (action.type === 'MARK_DIRTY' && state.state === 'SAVED') {
    return { ...state, state: 'DIRTY' };
  }
  
  return state;
}

// Invariant: Retries use original snapshot
function enforceRetryInvariant(originalSnapshot: PricingSnapshot) {
  return async (request: SaveRequest): Promise<SaveResponse> => {
    const response = await api.saveQuote({
      ...request,
      pricingHash: originalSnapshot.pricingHash, // Always use original
    });
    return response;
  };
}
```

#### Backend Detection
```typescript
// Invariant: Hash mismatch blocks save
function enforceHashInvariant(
  frontendHash: string,
  backendPricing: CalculatedPricing
): void {
  const validationResult = validatePricingHash(
    frontendHash,
    backendPricing,
    frontendInput
  );
  
  if (!validationResult.success) {
    throw new ValidationError({
      errorCode: 'QUOTE_PRICING_MISMATCH',
      severity: 'CRITICAL',
      message: 'Pricing verification failed. Please reload and try again.',
      // NO SAVE ALLOWED
    });
  }
}

// Invariant: Version never goes backwards
function enforceVersionInvariant(
  expectedVersion: number,
  actualVersion: number
): void {
  if (actualVersion < expectedVersion) {
    throw new VersionError({
      errorCode: 'QUOTE_VERSION_REGRESSION',
      severity: 'CRITICAL',
      message: `Version regression detected: expected ${expectedVersion}, actual ${actualVersion}`,
      // IMMEDIATE ALERT
    });
  }
}

// Invariant: Commission never calculated client-side
function enforceCommissionInvariant(request: SaveRequest): void {
  // Reject any request with calculated commission
  if (request.commissionAmount !== undefined) {
    throw new ValidationError({
      errorCode: 'QUOTE_CLIENT_COMMISSION_CALCULATION',
      severity: 'CRITICAL',
      message: 'Commission must be calculated server-side',
      // REJECT SAVE
    });
  }
}
```

### Enforcement Point Matrix

| Invariant | Frontend | Backend | Database |
|-----------|-----------|----------|-----------|
| Pricing Never Changes Without User Action | State machine | Pricing hash | Audit trail |
| Commission Never Calculated Client-Side | ❌ N/A | ✅ Validation | ❌ N/A |
| SAVED Never Shown Unless Backend Confirms | ✅ State machine | ✅ Response check | ❌ N/A |
| Conflicts Never Auto-Resolve | ✅ Modal design | ✅ Error response | ❌ N/A |
| Draft Data Never Silently Discarded | ✅ Draft logic | ❌ N/A | ❌ N/A |
| Audit Trail Is Append-Only | ❌ N/A | ❌ N/A | ✅ Constraints |
| Hash Mismatch Always Blocks Save | ❌ N/A | ✅ Validation | ❌ N/A |
| Version Never Goes Backwards | ❌ N/A | ✅ Version check | ✅ Trigger |
| Total Never Edited Directly | ✅ Read-only UI | ✅ Backend calc | ❌ N/A |
| Correlation ID Is Unique Per Save | ✅ Generation | ❌ N/A | ❌ N/A |
| Retry Never Uses Updated Pricing | ✅ Retry logic | ❌ N/A | ❌ N/A |

---

## PART 4 — Chaos Tooling Design

### Feature Flags for Fault Injection

```typescript
// Feature flag configuration
const CHAOS_FLAGS = {
  ENABLE_CHAOS_TESTING: false, // NEVER true in production
  INJECT_NETWORK_FAILURES: false,
  INJECT_HASH_MISMATCHES: false,
  INJECT_VERSION_CONFLICTS: false,
  INJECT_DB_LATENCY: false,
  INJECT_PARTIAL_RESPONSES: false,
  INJECT_RANDOM_LATENCY: false,
  INJECT_TRANSACTION_ROLLBACKS: false,
  INJECT_DUPLICATE_REQUESTS: false,
  INJECT_OUT_OF_ORDER_RESPONSES: false,
};

// Middleware to check flags
function chaosMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!CHAOS_FLAGS.ENABLE_CHAOS_TESTING) {
    return next(); // Normal operation
  }
  
  // Apply chaos based on flags
  if (CHAOS_FLAGS.INJECT_NETWORK_FAILURES && Math.random() < 0.1) {
    // 10% chance of network failure
    return res.status(504).json({ error: 'Network timeout' });
  }
  
  if (CHAOS_FLAGS.INJECT_HASH_MISMATCHES && Math.random() < 0.05) {
    // 5% chance of hash mismatch
    return res.status(400).json({
      error: { errorCode: 'QUOTE_PRICING_MISMATCH', severity: 'CRITICAL' }
    });
  }
  
  next();
}
```

### Test Hooks in Backend Save Flow

```typescript
// Save endpoint with chaos hooks
async function saveQuote(req: Request, res: Response) {
  const correlationId = req.headers['x-correlation-id'];
  
  // Hook 1: Network timeout injection
  if (CHAOS_FLAGS.INJECT_NETWORK_TIMEOUT && Math.random() < 0.1) {
    await sleep(6000); // 6 second timeout
    return res.status(504).json({ error: 'Timeout' });
  }
  
  // Hook 2: Hash mismatch injection
  const frontendHash = req.body.pricingHash;
  if (CHAOS_FLAGS.INJECT_HASH_MISMATCHES && Math.random() < 0.05) {
    // Simulate hash mismatch
    return res.status(400).json({
      error: {
        errorCode: 'QUOTE_PRICING_MISMATCH',
        message: 'Pricing verification failed (chaos injected)',
        severity: 'CRITICAL',
        retryable: false,
        correlationId,
        details: {
          frontendHash,
          expectedHash: 'CHAOS-MOCK-HASH',
          chaosInjected: true
        }
      }
    });
  }
  
  // Hook 3: Version conflict injection
  if (CHAOS_FLAGS.INJECT_VERSION_CONFLICTS && Math.random() < 0.05) {
    // Simulate version conflict
    return res.status(409).json({
      error: {
        errorCode: 'QUOTE_CONFLICT_VERSION',
        message: 'Version conflict (chaos injected)',
        severity: 'CRITICAL',
        retryable: false,
        correlationId,
        details: {
          expectedVersion: req.body.version,
          actualVersion: req.body.version + 1,
          chaosInjected: true
        }
      }
    });
  }
  
  // Hook 4: Database latency injection
  if (CHAOS_FLAGS.INJECT_DB_LATENCY && Math.random() < 0.2) {
    // Add 2-5 second random latency
    const latency = 2000 + Math.random() * 3000;
    await sleep(latency);
    logger.info(`Injected ${latency}ms DB latency for ${correlationId}`);
  }
  
  // Hook 5: Partial response injection
  if (CHAOS_FLAGS.INJECT_PARTIAL_RESPONSES && Math.random() < 0.05) {
    // Return incomplete JSON
    res.setHeader('Content-Length', '100');
    return res.send('{ "success": true, "quote": ').end();
  }
  
  // Normal save flow
  // ... (proceed with actual save logic)
}
```

### Mock Pricing Hash Corruption

```typescript
function corruptPricingHash(originalHash: string): string {
  // Flip random bits in hash
  const chars = originalHash.split('');
  const index = Math.floor(Math.random() * chars.length);
  chars[index] = String.fromCharCode(chars[index].charCodeAt(0) ^ 0x01);
  return chars.join('');
}

// Usage in chaos test
if (CHAOS_FLAGS.INJECT_HASH_MISMATCHES) {
  frontendHash = corruptPricingHash(frontendHash);
  logger.info(`Corrupted pricing hash: ${frontendHash}`);
}
```

### Artificial Latency Injection

```typescript
function injectLatency(min: number, max: number): Promise<void> {
  const latency = min + Math.random() * (max - min);
  return new Promise(resolve => setTimeout(resolve, latency));
}

// Usage in save flow
if (CHAOS_FLAGS.INJECT_RANDOM_LATENCY) {
  // Add 100-500ms random latency
  await injectLatency(100, 500);
}

// Usage in database queries
if (CHAOS_FLAGS.INJECT_DB_LATENCY) {
  // Add 1-3 second random latency
  await injectLatency(1000, 3000);
}
```

### Random Rollback Injection

```typescript
async function saveWithChaosRollback(data: QuoteData): Promise<SaveResult> {
  const correlationId = generateCorrelationId();
  
  try {
    // Begin transaction
    const tx = await database.beginTransaction();
    
    // Check for chaos rollback injection
    if (CHAOS_FLAGS.INJECT_TRANSACTION_ROLLBACKS && Math.random() < 0.05) {
      logger.warn(`Chaos: Injecting rollback for ${correlationId}`);
      throw new Error('Chaos-induced rollback');
    }
    
    // Save quote
    await tx.quotes.save(data);
    
    // Write audit log
    await tx.audit.log(createAuditRecord(data));
    
    // Commit transaction
    await tx.commit();
    
    return { success: true, correlationId };
  } catch (error) {
    // Rollback transaction
    await tx.rollback();
    
    return {
      success: false,
      error: {
        errorCode: 'QUOTE_SAVE_FAILED',
        severity: 'CRITICAL',
        message: 'Unable to save quote. Please try again.',
        correlationId,
        details: {
          rollbackTriggered: true,
          chaosInjected: error.message === 'Chaos-induced rollback'
        }
      }
    };
  }
}
```

### Safety Rules (Never Enabled in Production)

```typescript
// Production safety check
function validateChaosFlags(): void {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    // Disable all chaos flags
    Object.keys(CHAOS_FLAGS).forEach(key => {
      if (CHAOS_FLAGS[key] === true) {
        console.error(`CRITICAL: Chaos flag ${key} is enabled in production! Disabling...`);
        CHAOS_FLAGS[key] = false;
      }
    });
  }
}

// Run safety check on startup
validateChaosFlags();

// Safety check before each operation
function isChaosEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    CHAOS_FLAGS.ENABLE_CHAOS_TESTING
  );
}

// Usage in save flow
if (isChaosEnabled()) {
  // Apply chaos
} else {
  // Normal operation
}
```

---

## PART 5 — Automated Chaos Test Suite

### Test Structure

```typescript
describe('Quote Save Chaos Tests', () => {
  // Group 1: Network Failures
  describe('Network Failures', () => {
    it('should retry on timeout (max 3 times)', async () => { });
    it('should show error on connection refused', async () => { });
    it('should handle dropped response gracefully', async () => { });
    it('should block on partial response', async () => { });
    it('should detect out-of-order responses', async () => { });
  });
  
  // Group 2: Backend Failures
  describe('Backend Failures', () => {
    it('should reject on pricing hash mismatch', async () => { });
    it('should show error on commission validation failure', async () => { });
    it('should show conflict modal on version conflict', async () => { });
    it('should handle internal server error', async () => { });
  });
  
  // Group 3: Concurrent Operations
  describe('Concurrent Operations', () => {
    it('should block concurrent saves', async () => { });
    it('should handle duplicate requests idempotently', async () => { });
    it('should detect race conditions', async () => { });
    it('should resolve conflicts without data loss', async () => { });
  });
  
  // Group 4: State Corruption
  describe('State Corruption', () => {
    it('should detect corrupted draft', async () => { });
    it('should block on state machine violation', async () => { });
    it('should reload on invariant violation', async () => { });
  });
  
  // Group 5: Infrastructure Failures
  describe('Infrastructure Failures', () => {
    it('should save even when telemetry down', async () => { });
    it('should rollback on audit log failure', async () => { });
    it('should handle cache failure gracefully', async () => { });
  });
});
```

### Naming Conventions

```typescript
// Format: [Component]_[Scenario]_[ExpectedBehavior]

// Examples:
describe('QuoteSave', () => {
  it('should_retry_on_timeout_max_3_times', async () => { });
  it('should_reject_on_hash_mismatch', async () => { });
  it('should_show_conflict_on_version_conflict', async () => { });
  it('should_handle_concurrent_saves_without_data_loss', async () => { });
  it('should_save_even_when_telemetry_down', async () => { });
});
```

### Example Test Cases

```typescript
// Test Case 1: Retry on timeout
it('should_retry_on_timeout_max_3_times', async () => {
  // Arrange
  const { saveQuote, mockNetwork } = createTestHarness();
  mockNetwork.simulateTimeout(3); // First 3 requests timeout
  
  // Act
  await saveQuote({ quoteId: 'q_abc123', pricingHash: 'valid-hash' });
  
  // Assert
  expect(mockNetwork.requestCount).toBe(4); // Initial + 3 retries
  expect(mockNetwork.retryDelays).toEqual([500, 1500, 4000]);
  expect(mockNetwork.finalState).toBe('ERROR_RETRYABLE');
  expect(mockNetwork.userMessage).toContain('Unable to save quote');
});

// Test Case 2: Reject on hash mismatch
it('should_reject_on_hash_mismatch', async () => { });
  // Assert
  expect(response.success).toBe(false);
  expect(response.error.errorCode).toBe('QUOTE_PRICING_MISMATCH');
  expect(response.error.severity).toBe('CRITICAL');
  expect(response.error.retryable).toBe(false);
  expect(mockDatabase.saveCount).toBe(0); // No save
});

// Test Case 3: Show conflict on version conflict
it('should_show_conflict_on_version_conflict', async () => {
  // Arrange
  const { saveQuote, mockDatabase } = createTestHarness();
  await mockDatabase.createQuote({ id: 'q_abc123', version: 2 });
  
  // Act: Agent A saves (version 2)
  await saveQuote({ quoteId: 'q_abc123', version: 2 });
  
  // Agent B saves (version 2) - should conflict
  const response = await saveQuote({ quoteId: 'q_abc123', version: 2 });
  
  // Assert
  expect(response.success).toBe(false);
  expect(response.error.errorCode).toBe('QUOTE_CONFLICT_VERSION');
  expect(response.error.severity).toBe('CRITICAL');
  expect(mockDatabase.quoteVersion).toBe(3); // Agent A's save succeeded
  expect(mockFrontend.conflictModalShown).toBe(true);
});

// Test Case 4: Save even when telemetry down
it('should_save_even_when_telemetry_down', async () => { });
  // Assert
  expect(response.success).toBe(true);
  expect(response.quoteId).toBe('q_abc123');
  expect(mockTelemetry.delivered).toBe(false);
  expect(mockTelemetry.queued).toBe(true);
});

// Test Case 5: Handle concurrent saves without data loss
it('should_handle_concurrent_saves_without_data_loss', async () => { });
  // Assert
  expect(mockDatabase.quoteCount).toBe(1); // Only one save
  expect(mockDatabase.quoteVersion).toBe(3);
  expect(mockAudit.entries).toHaveLength(1);
  expect(mockAudit.conflicts).toHaveLength(1);
});
```

### CI-Safe Tests (Deterministic)

```typescript
// Use deterministic chaos (not random)
describe('Deterministic Chaos Tests', () => {
  beforeEach(() => {
    // Set deterministic chaos flags
    CHAOS_FLAGS.ENABLE_CHAOS_TESTING = true;
    CHAOS_FLAGS.INJECT_HASH_MISMATCHES = false; // Controlled by test
    CHAOS_FLAGS.INJECT_NETWORK_TIMEOUTS = false; // Controlled by test
  });
  
  it('should_handle_deterministic_hash_mismatch', async () => {
    // Inject specific failure
    CHAOS_FLAGS.INJECT_HASH_MISMATCHES = true;
    
    // Test
    const response = await saveQuote({ pricingHash: 'valid-hash' });
    
    // Assert deterministic behavior
    expect(response.error.errorCode).toBe('QUOTE_PRICING_MISMATCH');
  });
});
```

### Nightly Destructive Tests (Non-Prod)

```typescript
// Run only in staging/test environment
if (process.env.NODE_ENV !== 'production') {
  describe('Nightly Destructive Tests', () => {
    it('should_survive_database_corruption', async () => { });
    it('should_recover_from_total_network_outage', async () => { });
    it('should_handle_cascading_failures', async () => { });
    it('should_preserve_data_during_full_system_restart', async () => { });
  });
}

// Run with: npm run test:chaos --nightly
```

---

## PART 6 — Human Trust Validation

### User Trust Principles

1. **Never Blame the User**
   - Avoid: "You made an error"
   - Use: "Unable to complete operation"

2. **Never Lie About State**
   - Avoid: "Saved" (when not confirmed)
   - Use: "Saving..." (while in progress)

3. **Never Hide Errors**
   - Avoid: Silent failures
   - Use: Explicit error messages

4. **Always Provide Next Steps**
   - Avoid: Generic error
   - Use: "Please reload and try again"

5. **Always Preserve User Data**
   - Avoid: Discarding user input
   - Use: Draft persistence

### UX Copy Examples

#### Critical Errors (Blocking)

```
❌ AVOID: "Error saving quote. Something went wrong."
✅ USE: "Unable to save quote. Pricing verification failed. Please reload and try again."

❌ AVOID: "Commission is too low. Fix it."
✅ USE: "Platform commission ($200.00) is below minimum ($250.00). Please adjust markup."

❌ AVOID: "You're out of date. Reload now."
✅ USE: "This quote was modified elsewhere. Your version (v2) is out of date. Current version is v3."
```

#### High Errors (Retryable)

```
❌ AVOID: "Network error. Try again."
✅ USE: "Unable to save quote due to network error. Retrying... (1/3)"

❌ AVOID: "Save failed. Click to retry."
✅ USE: "Quote save failed after 3 attempts. Retry?"
```

#### Warnings (Non-Blocking)

```
❌ AVOID: "Warning: Something might be wrong."
✅ USE: "Save successful, but audit log may be delayed. Your data is safe."

❌ AVOID: "Draft is old."
✅ USE: "Base price has changed since draft was saved. Restore with new pricing?"
```

### Copy Guidelines for Critical Failures

#### Principles
1. Be explicit about what failed
2. Be honest about data state
3. Provide clear next steps
4. Include correlation ID for support
5. Never imply user fault

#### Template

```
[Explicit Statement of Failure]
[Data State]
[Next Steps]
[Correlation ID]

Example:
"Unable to save quote. Pricing verification failed. Your changes have not been saved. Please reload and try again. Correlation ID: CORR-20250124-ABC123"
```

#### Examples

**Pricing Mismatch**:
```
"Unable to save quote. Pricing verification failed. The price has changed since you viewed this quote. Your changes have not been saved. Please reload to see updated pricing. Correlation ID: CORR-20250124-ABC123"
```

**Commission Violation**:
```
"Unable to save quote. Platform commission ($200.00) is below minimum ($250.00). Please increase markup to at least 6.25% and try again. Your changes have not been saved. Correlation ID: CORR-20250124-DEF456"
```

**Version Conflict**:
```
"This quote was modified elsewhere. Your version (v2) is out of date. Current version is v3. Your changes are preserved in draft. Options: [Reload Latest Version] [Compare Changes] [Copy My Changes]. Correlation ID: CORR-20250124-GHI789"
```

**Network Failure**:
```
"Unable to save quote after 3 attempts. Please check your network connection and try again. Your changes are saved in draft. Correlation ID: CORR-20250124-JKL012"
```

### Support Playbook Snippets

#### Escalation Triggers

```markdown
## Quote Save Critical Failures

### Escalate to Engineering Immediately If:
- Multiple users reporting pricing mismatch errors
- Database corruption detected
- Audit trail append violations
- Version regression detected
- System-wide save failures (> 5% error rate)

### Escalate to Finance If:
- Commission validation failures (rule issues)
- Margin floor violations
- Pricing discrepancies (audit trail review)
```

#### Correlation ID Investigation

```markdown
## Correlation ID Investigation

### Steps:
1. Search logs for correlation ID
2. Review audit trail entries
3. Check error details
4. Identify root cause
5. Determine if user data affected
6. Prepare response for user

### Example Investigation:
```
Correlation ID: CORR-20250124-ABC123

Logs:
- 10:30:00.000Z - Save attempt started
- 10:30:01.500Z - Pricing hash mismatch detected
- 10:30:01.501Z - Save rejected

Audit Trail:
- No entry (save rejected)

Root Cause: Base price changed between frontend display and backend calculation
User Data Affected: No (save blocked before any write)
Resolution: User needs to reload page
```
```

#### User Communication Template

```markdown
## User Communication Template

### Format:
[Empathy Statement] + [What Happened] + [Data State] + [Next Steps] + [Support Contact]

### Example:
Dear [User Name],

We apologize for the inconvenience. We're unable to save your quote because the pricing has changed since you started editing.

**What Happened:**
The base price for this flight has been updated in our system.

**Data State:**
Your changes have not been lost. They are saved as a draft and can be restored.

**Next Steps:**
Please reload the page to see the updated pricing. You can restore your draft if needed.

**Support Contact:**
If this problem persists, please contact support with this Correlation ID: CORR-20250124-ABC123

Thank you for your patience.
```

---

## PART 7 — Chaos Readiness Score

### Scoring System (0-100)

#### Risk Categories and Weights

| Category | Weight | Scoring Criteria |
|-----------|--------|-----------------|
| **Network Failure Handling** | 15 | Timeout retry (5), Connection error (5), Dropped response (5) |
| **Backend Failure Handling** | 20 | Hash mismatch (7), Commission validation (7), Version conflict (6) |
| **Concurrent Operation Safety** | 15 | Conflict resolution (7), Idempotency (4), Race detection (4) |
| **State Corruption Prevention** | 15 | Invariant enforcement (5), Draft validation (5), Rollback detection (5) |
| **Infrastructure Resilience** | 15 | Telemetry degradation (5), Audit log failure (5), Cache failure (5) |
| **Data Integrity** | 20 | Atomicity (7), Consistency (7), Durability (6) |

#### Scoring Criteria

##### Network Failure Handling (15 points)
- Timeout retry (5): ✅ Auto-retry max 3 with backoff, ❌ No retry or infinite retry
- Connection error (5): ✅ Show error, no retry, ❌ Silent retry or crash
- Dropped response (5): ✅ Show error, allow retry, ❌ Show saved or crash

##### Backend Failure Handling (20 points)
- Hash mismatch (7): ✅ Block save, show error, ❌ Allow save or silent bypass
- Commission validation (7): ✅ Block save, show error + guidance, ❌ Allow save or crash
- Version conflict (6): ✅ Conflict modal, user choice, ❌ Auto-override or crash

##### Concurrent Operation Safety (15 points)
- Conflict resolution (7): ✅ User chooses, no auto-override, ❌ Auto-override
- Idempotency (4): ✅ Duplicate requests ignored, ❌ Double-save
- Race detection (4): ✅ Atomic operations, ❌ Race condition possible

##### State Corruption Prevention (15 points)
- Invariant enforcement (5): ✅ All invariants enforced, ❌ Some invariants bypassed
- Draft validation (5): ✅ Stale drafts detected, ❌ Stale drafts restored silently
- Rollback detection (5): ✅ Rollback triggers error, ❌ Partial state possible

##### Infrastructure Resilience (15 points)
- Telemetry degradation (5): ✅ Save succeeds, telemetry queued, ❌ Save blocked
- Audit log failure (5): ✅ Save succeeds, error logged, ❌ Save blocked
- Cache failure (5): ✅ Bypass cache, ❌ Use stale cache

##### Data Integrity (20 points)
- Atomicity (7): ✅ Transactions all-or-nothing, ❌ Partial writes possible
- Consistency (7): ✅ No invariants violated, ❌ Invariants can break
- Durability (6): ✅ Data persisted across restarts, ❌ Data lost on restart

#### Pass/Fail Thresholds

| Score | Status | Production Readiness |
|-------|--------|---------------------|
| 90-100 | ✅ EXCELLENT | READY FOR PRODUCTION |
| 75-89 | ✅ GOOD | READY WITH MINOR IMPROVEMENTS |
| 60-74 | ⚠️ ACCEPTABLE | REQUIRES IMPROVEMENT BEFORE PRODUCTION |
| 40-59 | ❌ POOR | NOT READY FOR PRODUCTION |
| 0-39 | ❌ CRITICAL | BLOCKED FROM PRODUCTION |

#### Example Score Calculation

```typescript
function calculateChaosReadinessScore(testResults: TestResults): number {
  let score = 0;
  
  // Network Failure Handling (15)
  if (testResults.timeoutRetry === 'PASS') score += 5;
  if (testResults.connectionError === 'PASS') score += 5;
  if (testResults.droppedResponse === 'PASS') score += 5;
  
  // Backend Failure Handling (20)
  if (testResults.hashMismatch === 'PASS') score += 7;
  if (testResults.commissionValidation === 'PASS') score += 7;
  if (testResults.versionConflict === 'PASS') score += 6;
  
  // Concurrent Operation Safety (15)
  if (testResults.conflictResolution === 'PASS') score += 7;
  if (testResults.idempotency === 'PASS') score += 4;
  if (testResults.raceDetection === 'PASS') score += 4;
  
  // State Corruption Prevention (15)
  if (testResults.invariantEnforcement === 'PASS') score += 5;
  if (testResults.draftValidation === 'PASS') score += 5;
  if (testResults.rollbackDetection === 'PASS') score += 5;
  
  // Infrastructure Resilience (15)
  if (testResults.telemetryDegradation === 'PASS') score += 5;
  if (testResults.auditLogFailure === 'PASS') score += 5;
  if (testResults.cacheFailure === 'PASS') score += 5;
  
  // Data Integrity (20)
  if (testResults.atomicity === 'PASS') score += 7;
  if (testResults.consistency === 'PASS') score += 7;
  if (testResults.durability === 'PASS') score += 6;
  
  return score; // 0-100
}

// Example: 85/100 = GOOD, ready with minor improvements
```

---

## Summary

### Guarantees Achieved

1. ✅ **No Price Drift Under Failure** - Hash validation prevents drift
2. ✅ **No Commission Mismatch Under Failure** - Server-side validation enforced
3. ✅ **No Frontend/Backend Divergence Under Failure** - All failures detected and blocked
4. ✅ **Explainable Under Failure** - Every failure has clear message
5. ✅ **Traceable Under Failure** - Correlation ID on every operation
6. ✅ **Auditable Under Failure** - Audit trail preserves state
7. ✅ **No Rounding Ambiguity Under Failure** - Currency rules enforced
8. ✅ **No Silent Recalculation Under Failure** - All changes logged
9. ✅ **No Trusting Client Under Failure** - Hash + validation enforced

### Chaos Readiness

- ✅ **Failure Taxonomy** - 6 categories, 30+ failure types defined
- ✅ **15 Chaos Scenarios** - Fully specified with behavior, state, telemetry, audit
- ✅ **11 Invariants** - Defined, detected, and enforced
- ✅ **Chaos Tooling** - Feature flags, test hooks, safety rules
- ✅ **Automated Test Suite** - Structure, naming, examples defined
- ✅ **User Trust Validation** - UX copy, support playbook defined
- ✅ **Chaos Readiness Score** - 0-100 scoring system defined

### Next Steps

1. Implement chaos tooling (feature flags, test hooks)
2. Write automated chaos test suite (all 15 scenarios)
3. Run chaos tests in staging environment
4. Calculate chaos readiness score
5. Address any failed criteria
6. Deploy to production when score ≥ 90

---

**Document Version**: 1.0
**Status**: ✅ COMPLETE - READY FOR IMPLEMENTATION
**Next Action**: Implement chaos tooling and write automated tests