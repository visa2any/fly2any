# Frontend Save Strategy - Truthful, Resilient, Conflict-Aware

## Status: ✅ DESIGN COMPLETE - READY FOR IMPLEMENTATION

**Last Updated**: January 24, 2026
**Owner**: Principal Frontend Engineer + UX Reliability Specialist

---

## Philosophy

**NO OPTIMISTIC LIES. NO AUTO-OVERRIDES. NO DATA LOSS.**

The frontend must be as honest as the hardened backend. Every save operation must reflect actual backend state, not what we hope will happen.

---

## PART 1 — Save State Machine (MANDATORY)

### State Definition

```typescript
type SaveState = 
  | 'IDLE'          // No unsaved changes
  | 'DIRTY'         // Unsaved changes detected
  | 'SAVING'        // Save in progress
  | 'SAVED'         // Backend confirmed save success
  | 'CONFLICT'      // Version conflict detected (blocking)
  | 'ERROR_RETRYABLE' // Transient error, can retry
  | 'ERROR_FATAL';   // Non-retryable, user action required

interface SaveContext {
  state: SaveState;
  version: number | null;          // Current quote version
  lastSavedAt: Date | null;       // When backend confirmed save
  pendingChanges: boolean;        // Are there unsaved changes?
  retryCount: number;            // Current retry attempt
  lastError: ApiError | null;    // Last error from backend
  correlationId: string | null;   // Backend correlation ID for this save
}
```

### State Transition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         SAVE STATE MACHINE                         │
└─────────────────────────────────────────────────────────────────┘

                    User edits field
                           │
                           ▼
      ┌──────────────────────────────────────┐
      │              IDLE                │
      │  (no unsaved changes)           │
      │  version: N                     │
      └──────────────────────────────────────┘
                           │
                    User makes change
                           │
                           ▼
      ┌──────────────────────────────────────┐
      │             DIRTY               │
      │  (unsaved changes present)        │
      │  version: N (stale)            │
      │  lastSavedAt: still N           │
      └──────────────────────────────────────┘
                           │
                    User clicks Save
                           │
                           ▼
      ┌──────────────────────────────────────┐
      │            SAVING              │
      │  (request in flight)             │
      │  retryCount: 0                  │
      └──────────────────────────────────────┘
                           │
              ┌───────────┼───────────┐
              │           │           │
      Success   Conflict   Error
              │           │           │
              ▼           ▼           ▼
      ┌─────────┐  ┌──────────┐ ┌──────────────────┐
      │  SAVED   │  │ CONFLICT │ │ ERROR_RETRYABLE │
      │version: N+1│  │(blocking)│ │ OR ERROR_FATAL  │
      └─────────┘  └──────────┘ └──────────────────┘
           │
           │ User edits again
           │
           ▼
      ┌──────────────────────────────────────┐
      │             DIRTY               │
      │  (new unsaved changes)         │
      │  version: N+1 (now stale)     │
      └──────────────────────────────────────┘

    ERROR_RETRYABLE (with retryable=true)
           │
           │ Auto-retry (max 3)
           │
           ▼
      ┌──────────────────────────────────────┐
      │            SAVING              │
      │  retryCount: 1,2,3            │
      └──────────────────────────────────────┘

    CONFLICT (QUOTE_CONFLICT_VERSION)
           │
           │ BLOCK FURTHER EDITS
           │
           ▼
      ┌──────────────────────────────────────┐
      │         CONFLICT               │
      │  (user must resolve)            │
      │  - Reload latest                │
      │  - Compare changes               │
      │  - Copy local to clipboard        │
      └──────────────────────────────────────┘
           │
           │ User resolves (reload/compare)
           │
           ▼
      ┌──────────────────────────────────────┐
      │             IDLE                │
      │  (clean slate)                  │
      └──────────────────────────────────────┘

    ERROR_FATAL (CRITICAL, retryable=false)
           │
           │ BLOCK FURTHER EDITS
           │
           ▼
      ┌──────────────────────────────────────┐
      │       ERROR_FATAL               │
      │  (user action required)           │
      │  - Contact support               │
      │  - Copy error details            │
      └──────────────────────────────────────┘
           │
           │ User resolves (contact support)
           │
           ▼
      ┌──────────────────────────────────────┐
      │             IDLE                │
      └──────────────────────────────────────┘
```

### State Machine Rules

1. **SAVED state ONLY after success=true from backend**
   - Never assume success optimistically
   - Never show "Saving..." as success
   - Never use UI animations as confirmation

2. **DIRTY state triggers change detection**
   - User edits → DIRTY
   - DIRTY enables Save button
   - DIRTY shows unsaved indicator

3. **CONFLICT state is blocking**
   - User cannot edit while in CONFLICT
   - User cannot save while in CONFLICT
   - Must explicitly resolve (reload/compare)

4. **ERROR_RETRYABLE auto-retries**
   - Only if retryable=true
   - Only if severity≠CRITICAL
   - Max 3 retries with exponential backoff
   - Abort retries if user edits again

5. **ERROR_FATAL is blocking**
   - User cannot edit while in ERROR_FATAL
   - User cannot retry automatically
   - Must contact support

---

## PART 2 — Intelligent Retry Strategy

### Retry Logic (TypeScript)

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 500,    // 500ms
  maxDelay: 4000,   // 4000ms
  backoffFactor: 1.5, // Exponential backoff
};

async function saveQuoteWithRetry(
  quoteId: string,
  data: QuoteData,
  currentVersion: number
): Promise<QuoteResponse> {
  let retryCount = 0;
  let lastError: ApiError | null = null;

  while (retryCount <= RETRY_CONFIG.maxRetries) {
    try {
      const response = await patchQuote(quoteId, {
        ...data,
        version: currentVersion,
      });

      // Backend confirmed success
      if (response.success) {
        return response;
      }

      // Backend returned error
      const error = response.error;
      lastError = error;

      // Check if retryable
      if (!error.retryable || error.severity === 'CRITICAL') {
        // Non-retryable error, abort
        throw error;
      }

      // Specific non-retryable errors
      if (error.errorCode === 'QUOTE_CONFLICT_VERSION') {
        // Version conflict, must handle manually
        throw error;
      }
      if (error.errorCode === 'QUOTE_ALREADY_SENT') {
        // Quote sent, cannot update
        throw error;
      }

      // Retryable error
      retryCount++;
      
      if (retryCount > RETRY_CONFIG.maxRetries) {
        // Max retries exceeded
        throw error;
      }

      // Calculate backoff delay
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount - 1),
        RETRY_CONFIG.maxDelay
      );

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Update UI with retry count
      updateSaveState('SAVING', {
        retryCount,
        message: `Retrying... (${retryCount}/${RETRY_CONFIG.maxRetries})`,
      });

    } catch (error) {
      lastError = error as ApiError;
      
      // Check if retryable
      if (!lastError.retryable || lastError.severity === 'CRITICAL') {
        // Non-retryable error, abort
        throw lastError;
      }

      // Network error, retry
      retryCount++;
      
      if (retryCount > RETRY_CONFIG.maxRetries) {
        // Max retries exceeded
        throw lastError;
      }

      // Calculate backoff delay
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount - 1),
        RETRY_CONFIG.maxDelay
      );

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Update UI with retry count
      updateSaveState('SAVING', {
        retryCount,
        message: `Retrying... (${retryCount}/${RETRY_CONFIG.maxRetries})`,
      });
    }
  }

  // Should never reach here, but handle gracefully
  throw new Error('Save failed after maximum retries');
}
```

### Retry Rules Summary

| Condition | Retry? | Reason |
|-----------|---------|---------|
| retryable=true AND severity≠CRITICAL | YES | Transient error |
| retryable=false | NO | Permanent error |
| severity=CRITICAL | NO | User action required |
| errorCode=QUOTE_CONFLICT_VERSION | NO | Version conflict, manual resolution |
| errorCode=QUOTE_ALREADY_SENT | NO | Quote sent, cannot update |
| Network error | YES | Transient |
| Timeout error | YES | Transient |
| Max retries (3) exceeded | NO | Give up |

---

## PART 3 — Version Conflict UX (CRITICAL)

### Conflict Resolution Modal

```typescript
function showConflictModal(error: QuoteConflictError) {
  return (
    <Modal isOpen={true} isBlocking={true}>
      <ModalHeader>
        <Icon type="warning" />
        <h2>Quote Modified Elsewhere</h2>
      </ModalHeader>
      
      <ModalBody>
        <p>
          This quote was modified by another agent while you were editing.
          Your version (v{error.details.expectedVersion}) is out of date.
        </p>
        
        <p className="text-error">
          Your unsaved changes will be lost if you reload.
        </p>
      </ModalBody>
      
      <ModalFooter>
        <Button onClick={copyLocalChangesToClipboard}>
          Copy My Changes
        </Button>
        <Button onClick={showDiffComparison}>
          Compare Changes
        </Button>
        <Button 
          variant="primary" 
          onClick={reloadLatestVersion}
        >
          Reload Latest Version
        </Button>
      </ModalFooter>
      
      <CollapsibleSection>
        <details>
          <summary>Error Details</summary>
          <CopyableText>
            <div>Error Code: {error.errorCode}</div>
            <div>Correlation ID: {error.correlationId}</div>
            <div>Expected Version: {error.details.expectedVersion}</div>
            <div>Actual Version: {error.details.actualVersion}</div>
            <div>Timestamp: {new Date(error.timestamp).toISOString()}</div>
          </CopyableText>
        </details>
      </CollapsibleSection>
    </Modal>
  );
}
```

### Conflict Resolution Flow

1. **Freeze Editor**
   - Disable all input fields
   - Disable Save button
   - Show "Quote Modified Elsewhere" modal

2. **Provide Resolution Options**

   **Option 1: Reload Latest Version**
   - Discards local changes
   - Fetches latest quote from backend
   - Returns to IDLE state
   - **WARNING**: User data lost

   **Option 2: Compare Changes**
   - Shows side-by-side diff
   - Allows user to see what changed
   - User can manually merge changes
   - Doesn't lose data

   **Option 3: Copy Local Changes**
   - Copies current form data to clipboard
   - User can paste after reload
   - Doesn't lose data

3. **Never Auto-Override**
   - Never automatically reload
   - Never automatically retry
   - User must explicitly choose

4. **Track Conflict Resolution**
   - Log resolution method chosen
   - Track conflict frequency
   - Correlate with backend correlationId

---

## PART 4 — Error Display Rules

### Error Severity → UX Mapping

| Severity | UX Treatment | Component | Behavior |
|-----------|--------------|------------|----------|
| CRITICAL | Blocking modal | `<CriticalErrorModal>` | - Blocks all interactions<br/>- Red styling<br/>- Explicit "Quote was NOT saved"<br/>- Support contact visible |
| HIGH | Inline + retry button | `<ErrorAlert>` | - Shows inline error<br/>- Clear explanation<br/>- Retry button (if retryable)<br/>- No false reassurance |
| MEDIUM / WARN | Toast or inline warning | `<WarningToast>` | - Non-blocking<br/>- Informational<br/>- Doesn't interrupt workflow |

### Error Component Examples

#### CRITICAL Error Modal

```typescript
function CriticalErrorModal({ error }: { error: ApiError }) {
  return (
    <Modal isOpen={true} isBlocking={true} className="critical">
      <ModalHeader>
        <Icon type="error" color="red" />
        <h2>Save Failed - Quote Was NOT Saved</h2>
      </ModalHeader>
      
      <ModalBody>
        <p className="error-message">
          {error.message}
        </p>
        
        {error.severity === 'CRITICAL' && (
          <div className="severity-badge critical">
            CRITICAL ERROR
          </div>
        )}
      </ModalBody>
      
      <ModalFooter>
        <Button onClick={copyErrorDetails}>
          Copy Error Details
        </Button>
        <Button 
          variant="primary"
          onClick={contactSupport}
        >
          Contact Support
        </Button>
      </ModalFooter>
      
      <CollapsibleSection>
        <details>
          <summary>Error Details</summary>
          <CopyableText>
            <div>Error Code: {error.errorCode}</div>
            <div>Severity: {error.severity}</div>
            <div>Message: {error.message}</div>
            <div>Correlation ID: {error.correlationId}</div>
            <div>Timestamp: {new Date(error.timestamp).toISOString()}</div>
            {error.details && (
              <pre className="error-details">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
          </CopyableText>
        </details>
      </CollapsibleSection>
    </Modal>
  );
}
```

#### HIGH Error Alert

```typescript
function ErrorAlert({ error, onRetry }: { error: ApiError, onRetry: () => void }) {
  return (
    <Alert variant="error" className="high-error">
      <div className="alert-header">
        <Icon type="warning" />
        <span className="severity-badge high">HIGH SEVERITY</span>
      </div>
      
      <div className="alert-message">
        {error.message}
      </div>
      
      {error.retryable && onRetry && (
        <div className="alert-actions">
          <Button variant="secondary" onClick={onRetry}>
            Retry Save
          </Button>
        </div>
      )}
      
      <CollapsibleSection>
        <details>
          <summary>Error Details</summary>
          <CopyableText>
            <div>Error Code: {error.errorCode}</div>
            <div>Correlation ID: {error.correlationId}</div>
            <div>Timestamp: {new Date(error.timestamp).toISOString()}</div>
          </CopyableText>
        </details>
      </CollapsibleSection>
    </Alert>
  );
}
```

#### MEDIUM/WARN Toast

```typescript
function WarningToast({ error }: { error: ApiError }) {
  return (
    <Toast variant="warning" duration={5000}>
      <div className="toast-content">
        <Icon type="info" />
        <span>{error.message}</span>
        <CopyableText text={error.correlationId} label="Copy Correlation ID" />
      </div>
    </Toast>
  );
}
```

### Error Display Rules

1. **CRITICAL Errors**
   - Always show blocking modal
   - Always use red styling
   - Always show "Quote was NOT saved" explicitly
   - Always include support contact
   - Never show false reassurance

2. **HIGH Errors**
   - Show inline error alert
   - Show retry button (if retryable)
   - Clear explanation required
   - No false reassurance

3. **MEDIUM/WARN Errors**
   - Show toast or inline warning
   - Non-blocking
   - Informational
   - Doesn't interrupt workflow

4. **All Errors Must Include**
   - Backend error message (verbatim)
   - Correlation ID (copyable)
   - Timestamp
   - Error code
   - Severity badge
   - Details in collapsible section

---

## PART 5 — Data Preservation Guarantees

### Local Storage Strategy

```typescript
interface DraftData {
  quoteId: string;
  version: number;
  data: QuoteData;
  timestamp: number;
}

// Save draft to localStorage
function saveDraft(quoteId: string, data: QuoteData, version: number): void {
  const draft: DraftData = {
    quoteId,
    version,
    data,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(`draft_${quoteId}`, JSON.stringify(draft));
}

// Load draft from localStorage
function loadDraft(quoteId: string): DraftData | null {
  const draftJson = localStorage.getItem(`draft_${quoteId}`);
  if (!draftJson) return null;
  
  const draft = JSON.parse(draftJson);
  
  // Check if draft is stale (> 24 hours)
  const age = Date.now() - draft.timestamp;
  if (age > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(`draft_${quoteId}`);
    return null;
  }
  
  return draft;
}

// Clear draft (only after confirmed save)
function clearDraft(quoteId: string): void {
  localStorage.removeItem(`draft_${quoteId}`);
}
```

### Data Preservation Rules

1. **Auto-Save Draft on Every Change**
   - Debounced (500ms after last change)
   - Saves to localStorage
   - Includes version number

2. **Restore Draft on Reload**
   - Check for existing draft
   - Prompt user to restore
   - Show draft age

3. **Clear Draft ONLY After Confirmed Save**
   - Never clear on error
   - Never clear on conflict
   - Only clear on success=true from backend

4. **Never Lose User Input**
   - Always persist to localStorage
   - Always offer to restore
   - Always warn before discarding

### IndexedDB Backup (Optional)

```typescript
// Use IndexedDB for larger quotes
async function saveDraftToIndexedDB(quoteId: string, data: QuoteData): Promise<void> {
  const db = await openQuoteDraftDB();
  const tx = db.transaction(['drafts'], 'readwrite');
  const store = tx.objectStore('drafts');
  
  await store.put({
    id: quoteId,
    data,
    version: data.version,
    timestamp: Date.now(),
  });
}

async function loadDraftFromIndexedDB(quoteId: string): Promise<QuoteData | null> {
  const db = await openQuoteDraftDB();
  const tx = db.transaction(['drafts'], 'readonly');
  const store = tx.objectStore('drafts');
  
  const draft = await store.get(quoteId);
  if (!draft) return null;
  
  // Check if draft is stale
  const age = Date.now() - draft.timestamp;
  if (age > 24 * 60 * 60 * 1000) {
    await store.delete(quoteId);
    return null;
  }
  
  return draft.data;
}
```

---

## PART 6 — Telemetry & Feedback Loop

### Frontend Telemetry Events

```typescript
interface SaveTelemetryEvent {
  eventType: 'save_attempt' | 'save_success' | 'save_error' | 'conflict_detected' | 'retry_attempt';
  quoteId: string;
  version: number;
  correlationId?: string;
  errorCode?: string;
  severity?: string;
  retryCount?: number;
  duration?: number; // Time to success or failure
  timestamp: number;
}

// Track save attempt
function trackSaveAttempt(quoteId: string, version: number): void {
  const event: SaveTelemetryEvent = {
    eventType: 'save_attempt',
    quoteId,
    version,
    timestamp: Date.now(),
  };
  
  // Send to analytics (non-blocking)
  sendTelemetry(event);
}

// Track save success
function trackSaveSuccess(quoteId: string, version: number, correlationId: string, duration: number): void {
  const event: SaveTelemetryEvent = {
    eventType: 'save_success',
    quoteId,
    version,
    correlationId,
    duration,
    timestamp: Date.now(),
  };
  
  sendTelemetry(event);
}

// Track save error
function trackSaveError(quoteId: string, error: ApiError, duration: number): void {
  const event: SaveTelemetryEvent = {
    eventType: 'save_error',
    quoteId,
    version: error.details?.expectedVersion,
    correlationId: error.correlationId,
    errorCode: error.errorCode,
    severity: error.severity,
    retryCount: getRetryCount(),
    duration,
    timestamp: Date.now(),
  };
  
  sendTelemetry(event);
}

// Track conflict detected
function trackConflict(quoteId: string, error: QuoteConflictError): void {
  const event: SaveTelemetryEvent = {
    eventType: 'conflict_detected',
    quoteId,
    version: error.details.expectedVersion,
    correlationId: error.correlationId,
    errorCode: error.errorCode,
    severity: error.severity,
    timestamp: Date.now(),
  };
  
  sendTelemetry(event);
}

// Send telemetry (fire-and-forget)
function sendTelemetry(event: SaveTelemetryEvent): void {
  // Non-blocking
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(err => {
    // Don't throw, telemetry shouldn't affect functionality
    console.error('Telemetry failed:', err);
  });
}
```

### Telemetry Signals to Track

| Signal | Purpose | Action Threshold |
|--------|---------|------------------|
| Save attempts | Track save frequency | > 10 attempts/minute |
| Retry count | Track retry frequency | > 3 retries/save |
| Conflict frequency | Track conflict rate | > 1% of saves |
| Time-to-success | Track performance | > 5s |
| Abandon-after-error | Track user frustration | > 5% of errors |

### Telemetry Correlation

**Always correlate with backend correlationId:**
- Backend includes correlationId in response
- Frontend includes correlationId in telemetry
- Enables end-to-end request tracing

**Example Tracing:**
```
Frontend: 2026-01-24T09:00:00Z save_attempt correlationId=ABC123
Backend:  2026-01-24T09:00:01Z QUOTE_CONFLICT_VERSION correlationId=ABC123
Frontend: 2026-01-24T09:00:02Z conflict_detected correlationId=ABC123
```

---

## PART 7 — Final UX Safety Guarantees

### Safety Guarantees

1. **No Optimistic Lies**
   - Never show "Saved" until backend confirms
   - Never assume success
   - Never hide failures

2. **No Data Loss**
   - Always persist drafts to localStorage
   - Always offer to restore drafts
   - Always warn before discarding changes

3. **No Auto-Overrides**
   - Never automatically reload on conflict
   - Never automatically discard local changes
   - User must explicitly decide

4. **No Silent Failures**
   - Always show errors to user
   - Always provide correlation ID
   - Always explain what happened

5. **No False Reassurance**
   - Never say "Saving..." as confirmation
   - Never use optimistic animations
   - Always be truthful about state

### UX State Flow

```
User edits → DIRTY (show unsaved indicator)
    ↓
User clicks Save → SAVING (show spinner, disable form)
    ↓
Backend responds with error
    ↓
IF error.retryable AND severity≠CRITICAL
    → Retry automatically (max 3 times)
    → Show retry count
    → Update to SAVING state each retry
ELSE IF error.errorCode === QUOTE_CONFLICT_VERSION
    → Show conflict modal (blocking)
    → Freeze editor
    → Offer options: Reload / Compare / Copy
    → User must choose
ELSE IF error.severity === 'CRITICAL'
    → Show critical error modal (blocking)
    → Freeze editor
    → Show support contact
    → Offer to copy error details
ELSE
    → Show inline error alert
    → Show retry button (if retryable)
    → Keep editor enabled (unless blocking)
```

### Regression Risks & Mitigations

| Risk | Impact | Mitigation |
|-------|---------|------------|
| User loses data on conflict | HIGH | Copy local changes to clipboard option |
| User doesn't see error | MEDIUM | Always show errors, no silent failures |
| User retries endlessly | LOW | Max 3 retries with backoff |
| Drafts accumulate | LOW | Auto-delete after 24 hours |
| Telemetry affects performance | LOW | Fire-and-forget, non-blocking |

---

## Implementation Checklist

### Required Components

- [ ] Save state machine (context + reducer)
- [ ] Save button component (with state awareness)
- [ ] Unsaved changes indicator
- [ ] Conflict resolution modal
- [ ] Critical error modal
- [ ] High error alert
- [ ] Warning toast
- [ ] Draft auto-save (localStorage)
- [ ] Draft restore prompt
- [ ] Correlation ID copy component

### Required Hooks

- [ ] useSaveState (state machine)
- [ ] useSaveQuote (with retry logic)
- [ ] useDraftPersistence (localStorage/IndexedDB)
- [ ] useTelemetry (save events)
- [ ] useCorrelationId (tracking)

### Required Contexts

- [ ] SaveContext (state machine)
- [ ] QuoteContext (quote data + version)
- [ ] ErrorContext (error handling)

---

**Document Version**: 1.0
**Status**: ✅ DESIGN COMPLETE - READY FOR IMPLEMENTATION
**Priority**: CRITICAL - Frontend Reliability
**Backend Integration**: Fully compatible with hardened backend