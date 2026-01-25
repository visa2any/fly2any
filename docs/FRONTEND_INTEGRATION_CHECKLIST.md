# Frontend Save System - Integration Checklist

## Status: ✅ IMPLEMENTATION COMPLETE - READY FOR TESTING

**Last Updated**: January 24, 2026
**Priority**: CRITICAL - Production Safety

---

## Overview

All frontend save system components have been implemented EXACTLY as specified in the design document. This checklist provides step-by-step verification to ensure the system works correctly with the hardened backend.

---

## Implementation Summary

### Completed Components ✅

1. **SaveContext** (`app/contexts/SaveContext.tsx`)
   - ✅ 7-state machine implemented
   - ✅ Valid state transitions enforced
   - ✅ Action creators provided
   - ✅ Context provider and hook

2. **useSaveQuote Hook** (`app/hooks/useSaveQuote.ts`)
   - ✅ Intelligent retry logic (max 3 retries)
   - ✅ Exponential backoff (500ms → 1500ms → 4000ms)
   - ✅ Conflict detection and handling
   - ✅ Critical error blocking
   - ✅ Abort controller for cancellation

3. **Draft Persistence** (`lib/draft/quoteDraftPersistence.ts`)
   - ✅ LocalStorage auto-save on MARK_DIRTY
   - ✅ Draft restore on page reload
   - ✅ Clear draft ONLY on SAVE_SUCCESS
   - ✅ 24-hour stale draft cleanup

4. **Conflict Modal** (`app/components/modals/QuoteConflictModal.tsx`)
   - ✅ Blocking modal
   - ✅ 3 resolution options: Compare, Copy, Reload
   - ✅ No auto-override policy
   - ✅ Collapsible error details

5. **Error Components** (3 types)
   - ✅ `CriticalErrorModal` - Blocks UI, explicit "Quote was NOT saved"
   - ✅ `RetryableInlineError` - Inline alert + retry button
   - ✅ `WarningToast` - Non-blocking, auto-dismisses

6. **Telemetry Helper** (`lib/telemetry/quoteSaveTelemetry.ts`)
   - ✅ 5 event types (attempt, success, retry, conflict, failure)
   - ✅ Fire-and-forget implementation
   - ✅ Non-blocking

---

## Integration Checklist

### Step 1: Setup and Configuration

- [ ] Install dependencies (if any)
- [ ] Wrap app root with `SaveProvider`
- [ ] Configure telemetry endpoint `/api/telemetry`
- [ ] Verify TypeScript compilation (no errors)

### Step 2: State Machine Verification

- [ ] Test IDLE → DIRTY transition (user edits field)
- [ ] Test DIRTY → SAVING transition (user clicks Save)
- [ ] Test SAVING → SAVED transition (backend success=true)
- [ ] Test SAVING → ERROR_RETRYABLE transition (retryable error)
- [ ] Test SAVING → ERROR_FATAL transition (critical error)
- [ ] Test SAVING → CONFLICT transition (version conflict)
- [ ] Test illegal transitions are blocked (console warnings)
- [ ] Verify SAVED never appears without backend success=true

### Step 3: Save Success Path

- [ ] Create quote via POST endpoint
- [ ] Edit quote fields (trigger DIRTY state)
- [ ] Click Save button (trigger SAVING state)
- [ ] Verify backend returns success=true
- [ ] Verify state transitions to SAVED
- [ ] Verify version number increments
- [ ] Verify lastSavedAt timestamp updated
- [ ] Verify draft cleared from localStorage
- [ ] Verify unsaved indicator removed

### Step 4: Retry Logic Verification

- [ ] Simulate network timeout (backend 504)
- [ ] Verify retry #1 executes after 500ms
- [ ] Verify retry #2 executes after 1500ms
- [ ] Verify retry #3 executes after 4000ms
- [ ] Verify max 3 retries attempted
- [ ] Verify UI shows retry count (Retrying... 1/3)
- [ ] Verify telemetry sends retry events
- [ ] Verify retry aborts if user edits again

### Step 5: Conflict Resolution (CRITICAL)

- [ ] Open quote in two browser windows/tabs
- [ ] Edit quote in window A (trigger DIRTY)
- [ ] Save quote in window A (trigger SAVING)
- [ ] Edit quote in window B (trigger DIRTY)
- [ ] Save quote in window B (trigger CONFLICT in window A)
- [ ] Verify conflict modal appears in window A
- [ ] Verify editor is blocked in window A (all fields disabled)
- [ ] Verify "Compare Changes" button works
- [ ] Verify "Copy My Changes" button copies to clipboard
- [ ] Verify "Reload Latest Version" button loads latest version
- [ ] Verify reload discards local changes with warning
- [ ] Verify conflict details show correctly:
   - Expected version
   - Actual version
   - Correlation ID
   - Timestamp
- [ ] Verify correlation ID is copyable

### Step 6: Critical Error Handling (CRITICAL)

- [ ] Simulate critical error (severity=CRITICAL, retryable=false)
- [ ] Verify CriticalErrorModal appears (blocking)
- [ ] Verify modal shows "Save Failed - Quote Was NOT Saved"
- [ ] Verify red styling (CRITICAL badge)
- [ ] Verify "Contact Support" button works
- [ ] Verify "Copy Error Details" button copies all details
- [ ] Verify error details show correctly:
   - Error code
   - Severity (CRITICAL)
   - Message (verbatim from backend)
   - Correlation ID
   - Timestamp
   - Details (if provided)
- [ ] Verify editor is blocked (all fields disabled)
- [ ] Verify no false success indicators

### Step 7: High Error with Retry

- [ ] Simulate high error (severity=HIGH, retryable=true)
- [ ] Verify RetryableInlineError appears (inline, not blocking)
- [ ] Verify HIGH SEVERITY badge shows
- [ ] Verify error message shows (verbatim from backend)
- [ ] Verify "Retry Save" button is visible
- [ ] Verify clicking retry triggers new save attempt
- [ ] Verify retry respects max retry count
- [ ] Verify error details collapsible works
- [ ] Verify correlation ID is copyable
- [ ] Verify editor remains enabled (not blocking)

### Step 8: Warning Toast (Non-Blocking)

- [ ] Simulate warning (severity=WARN or INFO)
- [ ] Verify WarningToast appears (top-right corner)
- [ ] Verify toast auto-dismisses after 5 seconds
- [ ] Verify toast doesn't block editor
- [ ] Verify toast can be manually dismissed
- [ ] Verify correlation ID is copyable
- [ ] Verify severity badge shows (WARN or INFO)
- [ ] Verify message shows (verbatim from backend)

### Step 9: Draft Persistence (CRITICAL)

- [ ] Edit quote fields (trigger DIRTY)
- [ ] Wait 500ms (debounce delay)
- [ ] Verify draft saved to localStorage (key: `quote_draft_{quoteId}`)
- [ ] Refresh page
- [ ] Verify draft restore prompt appears
- [ ] Verify draft age shown (minutes/hours)
- [ ] Verify clicking restore loads draft data
- [ ] Verify version number from draft
- [ ] Complete successful save
- [ ] Verify draft cleared from localStorage after SAVE_SUCCESS
- [ ] Verify stale drafts (> 24 hours) are auto-deleted

### Step 10: Telemetry Tracking

- [ ] Verify telemetry sends on save attempt
- [ ] Verify telemetry sends on save success (durationMs)
- [ ] Verify telemetry sends on save failure (errorCode, severity)
- [ ] Verify telemetry sends on conflict (errorCode)
- [ ] Verify telemetry sends on retry (retryCount)
- [ ] Verify all events include:
   - quoteId
   - version
   - correlationId
   - timestamp
- [ ] Verify telemetry doesn't block save (fire-and-forget)
- [ ] Verify telemetry failures don't affect functionality

### Step 11: Correlation ID Tracking

- [ ] Verify correlation ID generated on save attempt
- [ ] Verify correlation ID format: `FRONT-{timestamp}-{random}` (uppercase)
- [ ] Verify correlation ID sent to backend
- [ ] Verify correlation ID received from backend
- [ ] Verify correlation ID visible in error modals
- [ ] Verify correlation ID is copyable (one-click)
- [ ] Verify correlation ID in telemetry events

### Step 12: Edge Cases

- [ ] Test rapid consecutive saves (click Save multiple times)
- [ ] Verify only one save in flight (abort controller)
- [ ] Test save while already SAVING (should be blocked)
- [ ] Test save in CONFLICT state (should be blocked)
- [ ] Test save in ERROR_FATAL state (should be blocked)
- [ ] Test navigation while SAVING (should warn or block)
- [ ] Test browser refresh while SAVING (draft should persist)
- [ ] Test network disconnect and reconnect
- [ ] Test very large quote payloads (> 1MB)
- [ ] Test very long correlation IDs

### Step 13: UI/UX Verification

- [ ] Verify unsaved indicator shows when DIRTY
- [ ] Verify Save button disabled when IDLE
- [ ] Verify Save button enabled when DIRTY
- [ ] Verify Save button disabled when SAVING
- [ ] Verify spinner shows when SAVING
- [ ] Verify retry count shows when retrying
- [ ] Verify error messages are clear and actionable
- [ ] Verify no false reassurance (never show "Saved" until confirmed)
- [ ] Verify all errors show backend message verbatim
- [ ] Verify all correlation IDs are copyable
- [ ] Verify no silent failures (every error visible)

### Step 14: Performance Testing

- [ ] Measure time to save success (should be < 2s on average)
- [ ] Measure time to conflict detection (should be < 500ms)
- [ ] Verify draft save doesn't block UI (< 100ms)
- [ ] Verify modal render time (< 100ms)
- [ ] Verify no layout shifts when toasts appear
- [ ] Verify smooth state transitions (no flickering)

### Step 15: Accessibility Testing

- [ ] Verify keyboard navigation works in modals
- [ ] Verify screen reader announces errors
- [ ] Verify ARIA labels on all buttons
- [ ] Verify focus trap in blocking modals
- [ ] Verify focus returns after modal dismiss
- [ ] Verify color contrast meets WCAG AA
- [ ] Verify error text is readable at 200% zoom

---

## Backend Integration Tests

### Test 1: Conflict with Real Backend

**Setup:**
1. Create quote via POST endpoint
2. Open same quote in two browser windows
3. Edit and save in window A
4. Edit and save in window B

**Expected:**
- Window B shows conflict modal
- Window B displays: "This quote was modified elsewhere"
- Window B shows expected vs actual version
- Window B offers 3 resolution options

**Verification:**
- [ ] Backend returns `QUOTE_CONFLICT_VERSION` error
- [ ] Frontend shows conflict modal
- [ ] Backend correlation ID matches frontend correlation ID
- [ ] Version numbers are correct

### Test 2: Retry with Forced Timeout

**Setup:**
1. Use browser DevTools to throttle network
2. Set delay to 5 seconds
3. Attempt to save quote

**Expected:**
- Save request times out
- Frontend auto-retries (max 3 times)
- Each retry uses exponential backoff
- UI shows retry count

**Verification:**
- [ ] First retry at 500ms
- [ ] Second retry at 1500ms
- [ ] Third retry at 4000ms
- [ ] No more retries after 3
- [ ] Error modal shows after final retry

### Test 3: Critical Error Blocking

**Setup:**
1. Mock backend to return `QUOTE_VALIDATION_ERROR` (CRITICAL)
2. Attempt to save quote with invalid data

**Expected:**
- Backend returns error with severity=CRITICAL
- Frontend shows CriticalErrorModal
- Editor is blocked (all fields disabled)
- User must contact support

**Verification:**
- [ ] CriticalErrorModal appears
- [ ] Red styling with CRITICAL badge
- [ ] "Quote was NOT saved" text visible
- [ ] Contact Support button works
- [ ] Editor is disabled

### Test 4: Draft Survives Refresh

**Setup:**
1. Open quote
2. Edit several fields
3. Wait 500ms (draft auto-save)
4. Refresh page

**Expected:**
- Draft restored from localStorage
- User prompted to restore draft
- Draft shows age (e.g., "Saved 2 minutes ago")

**Verification:**
- [ ] Draft data in localStorage
- [ ] Draft restore prompt appears
- [ ] Restore button loads draft data
- [ ] Version number preserved

---

## Regression Prevention

### Pricing Logic

- [ ] Verify save doesn't modify pricing calculations
- [ ] Verify totals remain unchanged after save
- [ ] Verify discounts remain unchanged after save
- [ ] Verify taxes remain unchanged after save

### UI Layout

- [ ] Verify no layout changes
- [ ] Verify no style changes
- [ ] Verify component hierarchy unchanged
- [ ] Verify no new dependencies added

### API Compatibility

- [ ] Verify no breaking changes to API
- [ ] Verify request format unchanged
- [ ] Verify response format unchanged
- [ ] Verify existing integrations still work

---

## Production Readiness

### Pre-Deployment Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing complete (all 15 steps)
- [ ] Edge cases tested and handled
- [ ] Performance benchmarks met
- [ ] Accessibility verified
- [ ] No console errors
- [ ] No console warnings
- [ ] TypeScript compilation successful
- [ ] Linting passes
- [ ] Code review complete
- [ ] Documentation updated

### Post-Deployment Checklist

- [ ] Monitor error rates (should not increase)
- [ ] Monitor save success rate (should be > 95%)
- [ ] Monitor conflict rate (should be < 1%)
- [ ] Monitor retry rate (should be < 5%)
- [ ] Monitor telemetry delivery (should be > 95%)
- [ ] Monitor draft usage (should be consistent)
- [ ] Monitor performance metrics (P95 < 2s)
- [ ] Review error logs for anomalies
- [ ] Review user feedback for issues

---

## Success Criteria

This implementation is considered SUCCESSFUL when:

1. ✅ Quote save failures are impossible to miss (all errors visible)
2. ✅ Frontend is as honest as backend (no optimistic lies)
3. ✅ Conflict resolution never auto-overrides (user decides)
4. ✅ Draft persistence never loses user input (localStorage backup)
5. ✅ Critical errors block UI and show "Quote was NOT saved"
6. ✅ Retry logic respects max 3 retries with exponential backoff
7. ✅ Telemetry tracks all save events (fire-and-forget)
8. ✅ All error messages show backend message verbatim
9. ✅ All correlation IDs are copyable (one-click)
10. ✅ No regressions (pricing, UI, API unchanged)

---

## Rollback Plan

If critical issues are discovered after deployment:

1. **Immediate Rollback** (within 30 minutes)
   - Revert frontend code to previous commit
   - Clear all localStorage drafts
   - Monitor error rates

2. **Gradual Rollback** (if issues are minor)
   - Disable retry logic (set maxRetries=0)
   - Disable draft persistence
   - Disable telemetry
   - Monitor for improvement

3. **Hotfix** (if specific issue identified)
   - Fix specific component
   - Deploy hotfix to production
   - Verify fix resolves issue
   - Continue monitoring

---

**Document Version**: 1.0
**Status**: ✅ READY FOR TESTING
**Next Action**: Run integration checklist, then deploy to staging