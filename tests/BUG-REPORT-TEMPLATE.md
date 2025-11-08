# Bug Report Template

Use this template to report any bugs found during testing.

---

## Bug Report #[NUMBER]

### Basic Information

**Date Reported**: YYYY-MM-DD
**Reported By**: [Your Name]
**Severity**: ☐ Critical ☐ High ☐ Medium ☐ Low
**Priority**: ☐ P0 ☐ P1 ☐ P2 ☐ P3
**Status**: ☐ New ☐ In Progress ☐ Fixed ☐ Verified ☐ Closed

---

### Environment

**Browser**: [Chrome/Firefox/Safari/Edge] Version: ___
**Operating System**: [Windows/macOS/Linux] Version: ___
**Device**: [Desktop/Mobile/Tablet] Model: ___
**Screen Resolution**: ___
**Test Environment**: ☐ Local ☐ Staging ☐ Production

---

### Bug Details

#### Title
_Brief, descriptive title of the issue_

#### Description
_Detailed description of the bug_

#### Steps to Reproduce
1.
2.
3.
4.

#### Expected Behavior
_What should happen_

#### Actual Behavior
_What actually happens_

#### Frequency
☐ Always (100%)
☐ Often (75%+)
☐ Sometimes (50%)
☐ Rarely (25%)
☐ Once

---

### Impact Analysis

#### User Impact
☐ Blocks critical user flow
☐ Prevents feature usage
☐ Causes confusion/frustration
☐ Minor inconvenience
☐ Visual/cosmetic only

#### Business Impact
☐ Revenue loss
☐ Data integrity issue
☐ Security vulnerability
☐ Performance degradation
☐ User experience issue

#### Affected Components
- [ ] Conversational AI
- [ ] Booking Flow
- [ ] Payment System
- [ ] User Authentication
- [ ] Search Functionality
- [ ] Consultant Handoff
- [ ] Other: _______________

---

### Additional Information

#### Screenshots/Videos
_Attach or link to screenshots/videos showing the bug_

#### Console Errors
```
[Paste any console errors here]
```

#### Network Errors
```
[Paste any network errors from DevTools]
```

#### Browser Console Logs
```
[Paste relevant logs]
```

#### Stack Trace
```
[If available, paste stack trace]
```

---

### Related Information

**Related Test Case**: [Link to failing test]
**Related User Story**: [Link if applicable]
**Related Issues**: #[number], #[number]
**Regression**: ☐ Yes ☐ No
_If yes, specify when it was working:_ ___

---

### Root Cause Analysis
_To be filled by developer_

**Root Cause**:

**Why it wasn't caught earlier**:

**Prevention strategy**:

---

### Fix Details
_To be filled by developer_

**Fix Description**:

**Files Changed**:
-
-

**Pull Request**: #[number]

**Tests Added**:
-
-

---

### Verification

**Verified By**: _______________
**Verification Date**: YYYY-MM-DD
**Verification Environment**: ☐ Local ☐ Staging ☐ Production

**Verification Steps**:
1.
2.
3.

**Verification Result**: ☐ Pass ☐ Fail

**Comments**:

---

## Example Bug Reports

### Example 1: Critical Payment Bug

**Bug Report #001**

**Date Reported**: 2024-11-08
**Reported By**: QA Team Lead
**Severity**: ☑️ Critical
**Priority**: ☑️ P0
**Status**: ☑️ Fixed

**Environment**:
- Browser: Chrome Version 120.0
- OS: Windows 11
- Device: Desktop
- Test Environment: Staging

**Title**: Payment processing fails for cards ending in "00"

**Description**:
When users attempt to pay with credit cards that have last two digits as "00", the payment fails with a generic error message.

**Steps to Reproduce**:
1. Add flight to cart
2. Proceed to payment
3. Enter card details: 4242 4242 4242 4200
4. Click "Pay Now"
5. Observe error

**Expected Behavior**:
Payment should process successfully for all valid card numbers

**Actual Behavior**:
Error message: "Payment failed. Please try again."

**Frequency**: ☑️ Always (100%)

**Impact**:
☑️ Blocks critical user flow
☑️ Revenue loss

**Root Cause**:
String comparison bug in payment validation code treating "00" as falsy value

**Fix**:
Changed comparison from `if (cardLast2)` to `if (cardLast2 !== undefined)`

**Verification**: ☑️ Pass

---

### Example 2: UI Bug

**Bug Report #002**

**Date Reported**: 2024-11-08
**Reported By**: QA Tester
**Severity**: ☐ Critical ☐ High ☑️ Medium ☐ Low
**Priority**: ☐ P0 ☐ P1 ☑️ P2 ☐ P3
**Status**: ☑️ Fixed

**Environment**:
- Browser: Safari Version 17.0
- OS: macOS Sonoma
- Device: MacBook Pro
- Test Environment: Production

**Title**: Chat bubble text overlaps on Safari at 125% zoom

**Description**:
When browser zoom is set to 125%, AI assistant chat bubbles show overlapping text making messages unreadable.

**Steps to Reproduce**:
1. Open Fly2Any in Safari
2. Set browser zoom to 125% (Cmd + +)
3. Open chat assistant
4. Send a message
5. Observe AI response

**Expected Behavior**:
Text should remain readable and properly formatted at all zoom levels

**Actual Behavior**:
Text lines overlap, making content unreadable

**Frequency**: ☑️ Always (100%)

**Impact**:
☑️ User experience issue
Affects accessibility for users who need larger text

**Root Cause**:
Fixed line-height in CSS not scaling with zoom

**Fix**:
Changed line-height from px to relative units (1.5em)

**Verification**: ☑️ Pass

---

### Example 3: Performance Issue

**Bug Report #003**

**Date Reported**: 2024-11-08
**Reported By**: Performance Tester
**Severity**: ☐ Critical ☑️ High ☐ Medium ☐ Low
**Priority**: ☐ P0 ☑️ P1 ☐ P2 ☐ P3
**Status**: ☑️ In Progress

**Environment**:
- Browser: Chrome on Android
- OS: Android 13
- Device: Samsung Galaxy S23
- Connection: 4G
- Test Environment: Production

**Title**: Flight search takes 15+ seconds on mobile

**Description**:
Flight search response time on mobile devices exceeds acceptable limits, causing poor user experience.

**Steps to Reproduce**:
1. Open Fly2Any on mobile device
2. Search for "New York to London"
3. Select dates
4. Click "Search"
5. Measure time to results

**Expected Behavior**:
Results should appear within 3-5 seconds

**Actual Behavior**:
Results take 15-20 seconds to appear

**Frequency**: ☑️ Often (75%+)

**Impact**:
☑️ User experience issue
☑️ Performance degradation
High bounce rate on mobile

**Root Cause**:
No caching on mobile, full API calls every time

**Fix (Proposed)**:
Implement service worker caching for recent searches

**Verification**: Pending

---

## Severity Guidelines

### Critical (P0)
- System crashes or hangs
- Data loss or corruption
- Payment processing failures
- Security vulnerabilities
- Complete feature unavailability

**Resolution Time**: Immediate (same day)

### High (P1)
- Major feature not working
- Significant performance degradation
- Important user flow blocked
- Affects multiple users

**Resolution Time**: 1-2 days

### Medium (P2)
- Feature partially working
- Workaround available
- Affects specific user scenarios
- UI/UX issues

**Resolution Time**: 1 week

### Low (P3)
- Minor visual issues
- Non-critical features
- Rare edge cases
- Enhancement requests

**Resolution Time**: Next sprint

---

## Bug Workflow

```
NEW → ASSIGNED → IN PROGRESS → CODE REVIEW → TESTING → VERIFIED → CLOSED
                                      ↓
                              REOPENED (if verification fails)
```

1. **NEW**: Bug reported and triaged
2. **ASSIGNED**: Developer assigned
3. **IN PROGRESS**: Developer working on fix
4. **CODE REVIEW**: Fix under peer review
5. **TESTING**: QA testing the fix
6. **VERIFIED**: Fix confirmed working
7. **CLOSED**: Bug resolved and deployed

---

## Testing Checklist After Bug Fix

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Regression testing completed
- [ ] Performance impact assessed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Stakeholders notified

---

## Contact Information

**QA Team Lead**: [email]
**Development Lead**: [email]
**Product Manager**: [email]

**Bug Tracking System**: [Link to Jira/Linear/etc]
**Testing Dashboard**: [Link]
