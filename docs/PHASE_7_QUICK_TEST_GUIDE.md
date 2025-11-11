# PHASE 7 - QUICK TEST GUIDE
## 15-Minute Critical Path Testing

**Purpose:** Rapid smoke test of all Phase 7 features
**Time Required:** 15 minutes
**When to Use:** Before deployments, after major changes, daily testing

---

## QUICK START CHECKLIST

### 1. FlightComparison (3 minutes)

```
✓ Navigate: /flights/results?from=JFK&to=LAX&departure=2025-12-15
✓ Click compare checkbox on 3 flights
✓ Verify sticky bar appears at bottom
✓ Verify "3 of 3 flights selected" text
✓ Verify best price highlighted in green
✓ Click "Book Now" button → Should navigate
✓ Click "X" on one flight → Should remove
✓ Mobile: Resize to 375px → Verify stacked cards
```

**PASS:** All checkmarks completed ✓
**FAIL:** Screenshot error and file bug report

---

### 2. Notifications (3 minutes)

```
✓ Log in as: test@fly2any.com
✓ Verify bell icon appears (top right)
✓ Run in console:
  fetch('/api/notifications', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      type: 'system',
      title: 'QA Test',
      message: 'Quick test notification'
    })
  })
✓ Wait 30 seconds OR refresh page
✓ Verify badge shows "1"
✓ Click bell → Dropdown appears
✓ Verify notification displays
✓ Click "Mark all read" → Badge disappears
✓ Navigate to: /account/notifications → Page loads
```

**PASS:** All checkmarks completed ✓
**FAIL:** Note which step failed

---

### 3. PWA Installation (4 minutes)

```
✓ Open in Chrome (incognito/new profile)
✓ Go to: https://fly2any.vercel.app (or localhost:3000)
✓ Open DevTools → Application → Service Workers
✓ Verify: "Activated and running" status
✓ Wait 30 seconds
✓ Verify: Install prompt appears (bottom-right)
✓ Click "Install Now"
✓ Verify: Browser install dialog appears
✓ Click "Install" in dialog
✓ Verify: App opens in standalone window
✓ Close app, verify desktop icon created
```

**PASS:** App installed successfully ✓
**FAIL:** Check console for service worker errors

---

### 4. Navigation (3 minutes)

```
✓ Desktop (>1024px):
  Click: Flights → Loads ✓
  Click: Hotels → Loads ✓
  Click: Cars → Loads ✓
  Click: Packages → Loads ✓
  Click: Deals → Loads ✓ (NEW)
  Click: Explore → Loads ✓ (NEW)
  Click: Travel Guide → Loads ✓ (NEW)
  Click: FAQ → Loads ✓ (NEW)

✓ UserMenu (if logged in):
  Click avatar → Dropdown appears ✓
  Click "My Account" → /account ✓
  Click "Wishlist" → /account/wishlist ✓ (NEW)
  Click "Notifications" → /account/notifications ✓ (NEW)

✓ Mobile (<1024px):
  Click hamburger → Drawer opens ✓
  Verify 3 sections:
    - MY ACCOUNT (if logged in) ✓
    - BOOK TRAVEL (4 links) ✓
    - DISCOVER (4 links) ✓ (NEW)
  Click any link → Drawer closes ✓
```

**PASS:** All navigation works ✓
**FAIL:** Note broken links

---

### 5. New Pages (2 minutes)

```
✓ /account/wishlist → Loads (auth required) ✓
✓ /deals → Loads ✓
✓ /explore → Loads, shows 12+ destinations ✓
✓ /travel-guide → Loads, shows 6 categories ✓
✓ /faq → Loads, shows 20+ questions ✓
✓ /account/notifications → Loads (auth required) ✓
```

**PASS:** All pages render ✓
**FAIL:** Screenshot 404 errors

---

## PASS/FAIL CRITERIA

### CRITICAL (Must Pass to Deploy)
- [ ] FlightComparison works (desktop + mobile)
- [ ] Notifications appear and update
- [ ] PWA service worker registers
- [ ] All 8 nav links work
- [ ] All 6 new pages load

### HIGH (Should Pass, Can Deploy with Known Issues)
- [ ] PWA install prompt appears
- [ ] UserMenu dropdown works
- [ ] Mobile navigation drawer works
- [ ] Notification center functional

### OVERALL RESULT
- [ ] **PASS** - All critical tests passed, deploy approved
- [ ] **CONDITIONAL PASS** - Minor issues, deploy with caution
- [ ] **FAIL** - Critical issues found, DO NOT DEPLOY

---

## COMMON ISSUES & QUICK FIXES

### Issue: FlightComparison bar not appearing
**Quick Check:**
```javascript
// Console
console.log(document.querySelector('[data-testid="comparison-bar"]'));
// If null, state not updating
```
**Fix:** Check flight data structure matches `FlightForComparison` type

---

### Issue: Notifications not polling
**Quick Check:**
```javascript
// Console
localStorage.getItem('fly2any-last-notification-check');
// Should update every 30 seconds
```
**Fix:** Check userId prop passed to NotificationBell

---

### Issue: Service worker not registering
**Quick Check:**
```
DevTools → Application → Service Workers
Look for "Error" status
```
**Fix:** Check `/service-worker.js` exists and no syntax errors

---

### Issue: Install prompt not appearing
**Quick Check:**
```javascript
// Console
localStorage.getItem('fly2any-install-prompt-dismissed');
// If exists with future date, prompt dismissed
```
**Fix:** Clear localStorage: `localStorage.clear()`

---

## MOBILE QUICK TEST (3 minutes)

```
Device: iPhone 12 or similar (390x844)

✓ Open site in mobile Safari
✓ Test hamburger menu → Opens ✓
✓ Test flight search → Results load ✓
✓ Resize to 375px → No horizontal scroll ✓
✓ Test FlightComparison → Stacked cards ✓
✓ Test notification bell (if auth) → Dropdown fits ✓
✓ Scroll down → Header hides ✓
✓ Scroll up → Header reappears ✓
```

**PASS:** Mobile experience smooth ✓
**FAIL:** Note specific viewport issues

---

## PERFORMANCE QUICK CHECK (2 minutes)

```
✓ Lighthouse audit (incognito):
  DevTools → Lighthouse → Generate report

  Target Scores:
  Performance: ≥90 ✓
  Accessibility: ≥90 ✓
  Best Practices: ≥90 ✓
  PWA: All checks pass ✓

✓ Network tab:
  Flight search: <3 seconds ✓
  Notification fetch: <500ms ✓
  No failed requests (4xx/5xx) ✓
```

**PASS:** Scores meet targets ✓
**FAIL:** Note specific scores

---

## REGRESSION QUICK CHECK (2 minutes)

Test existing features still work:

```
✓ Homepage loads ✓
✓ Flight search works ✓
✓ Hotels search works ✓
✓ Cars search works ✓
✓ Multi-city flights work ✓
✓ User login works ✓
✓ Booking flow works ✓
```

**PASS:** No regressions ✓
**FAIL:** Critical - Stop deployment

---

## OFFLINE MODE QUICK TEST (2 minutes)

```
✓ Load site normally
✓ Visit 3-4 pages (flights, hotels, deals)
✓ DevTools → Network → Offline
✓ Refresh page
✓ Verify: Custom offline page shows ✓
✓ Verify: "You're offline" message ✓
✓ Network → Online
✓ Click "Retry" button
✓ Verify: Site reconnects ✓
```

**PASS:** Offline experience works ✓
**FAIL:** Check service worker cache

---

## AUTHENTICATION QUICK TEST (1 minute)

```
✓ Log out (or open incognito)
✓ Verify: Sign In/Sign Up buttons visible ✓
✓ Verify: NotificationBell NOT visible ✓
✓ Verify: UserMenu NOT visible ✓
✓ Try: /account/wishlist → Redirects to signin ✓
✓ Try: /account/notifications → Redirects to signin ✓
✓ Log in
✓ Verify: NotificationBell appears ✓
✓ Verify: UserMenu appears ✓
✓ Verify: Auth buttons disappear ✓
```

**PASS:** Auth gates work correctly ✓
**FAIL:** Security issue - Stop deployment

---

## BROWSER COMPATIBILITY QUICK CHECK (5 minutes)

```
Chrome (Desktop):
✓ All features work ✓
✓ PWA installable ✓

Firefox (Desktop):
✓ All features work ✓
✓ PWA may differ ✓

Safari (Desktop):
✓ All features work ✓
✓ No auto-install (expected) ✓

Chrome (Mobile):
✓ All features work ✓
✓ Install banner appears ✓

Safari (iOS):
✓ All features work ✓
✓ Manual "Add to Home Screen" ✓
```

**PASS:** Works in all major browsers ✓
**FAIL:** Note specific browser issues

---

## SIGN-OFF

**Date:** _______________
**Tester:** _______________
**Environment:** Development / Staging / Production
**Overall Result:** PASS / CONDITIONAL PASS / FAIL

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

**Approved for Deployment:** YES / NO

**Signature:** _______________

---

## EMERGENCY ROLLBACK

If critical issues found in production:

```bash
# Option 1: Vercel Rollback
vercel rollback

# Option 2: Git Revert
git revert HEAD
git push origin main

# Option 3: Deploy Previous Commit
vercel --prod --yes <previous-commit-hash>
```

**Rollback Decision Matrix:**
- **CRITICAL BUG** (site down, data loss) → IMMEDIATE ROLLBACK
- **HIGH BUG** (feature broken) → Rollback if affects >50% users
- **MEDIUM BUG** (minor issue) → Fix forward, no rollback
- **LOW BUG** (cosmetic) → Fix in next release

---

## CONTACT INFO

**QA Lead:** [Your Name]
**Dev Lead:** [Dev Name]
**DevOps:** [DevOps Name]

**Emergency Slack:** #phase7-qa
**Bug Tracker:** GitHub Issues (label: `phase-7`)

---

**Last Updated:** November 10, 2025
**Version:** 1.0
**Phase:** 7 - User Engagement & Advanced Features

---

**END OF QUICK TEST GUIDE**
