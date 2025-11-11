# PHASE 7 - COMPREHENSIVE QA TESTING CHECKLIST
## Fly2Any Travel Platform - Quality Assurance Report

**Date:** November 10, 2025
**Phase:** Phase 7 - User Engagement & Advanced Features
**QA Team:** Team 4 - Quality Assurance Testing Specialist
**Status:** Ready for Testing

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Test Environment Setup](#test-environment-setup)
3. [Critical Path Testing](#critical-path-testing)
4. [FlightComparison Testing](#flightcomparison-testing)
5. [Notification System Testing](#notification-system-testing)
6. [PWA Testing](#pwa-testing)
7. [Navigation Testing](#navigation-testing)
8. [New Pages Testing](#new-pages-testing)
9. [Edge Cases & Error Handling](#edge-cases--error-handling)
10. [Performance Testing](#performance-testing)
11. [Security Testing](#security-testing)
12. [Accessibility Testing](#accessibility-testing)
13. [Cross-Browser Testing](#cross-browser-testing)
14. [Mobile Testing](#mobile-testing)
15. [Test Data Requirements](#test-data-requirements)
16. [Automated Testing Recommendations](#automated-testing-recommendations)
17. [Bug Reporting Template](#bug-reporting-template)

---

## EXECUTIVE SUMMARY

This document provides a comprehensive testing checklist for Phase 7 features, covering:
- **54+ files** created/modified
- **5 major feature areas** (FlightComparison, Notifications, PWA, Navigation, User Engagement)
- **6 new pages** (Wishlist, Deals, Explore, Travel Guide, FAQ, Notification Center)
- **3 database models** (Notification, PushSubscription, WishlistItem)
- **18 new routes** added to navigation

**Testing Priority:**
1. **CRITICAL** - FlightComparison, Notifications, PWA installation
2. **HIGH** - Navigation, Authentication flows
3. **MEDIUM** - New pages, Edge cases
4. **LOW** - Visual polish, Minor UX improvements

---

## TEST ENVIRONMENT SETUP

### Prerequisites
- [ ] Development environment running (`npm run dev`)
- [ ] Database configured (Neon PostgreSQL)
- [ ] Test user accounts created (authenticated + non-authenticated)
- [ ] Browser DevTools open (Console, Network, Application tabs)
- [ ] Mobile device or emulator available
- [ ] Screen recording software ready (for bug reports)

### Test Accounts Required
```
AUTHENTICATED USER:
Email: test@fly2any.com
Password: Test123!

NON-AUTHENTICATED USER:
(Use incognito/private browsing mode)
```

### Browser Testing Matrix
```
DESKTOP:
- Chrome 90+ (Primary)
- Firefox 88+
- Edge 90+
- Safari 15.4+

MOBILE:
- iOS Safari (iPhone 12+)
- Chrome Android (Samsung Galaxy S21+)
- Samsung Internet
```

### Tools Needed
- [ ] Chrome DevTools
- [ ] React DevTools extension
- [ ] Lighthouse (Performance testing)
- [ ] Network throttling enabled (3G/4G simulation)
- [ ] Screen reader (NVDA/JAWS for accessibility)

---

## CRITICAL PATH TESTING

### Test Case CP-001: Complete User Journey
**Priority:** CRITICAL
**Estimated Time:** 15 minutes

#### Test Steps:
1. [ ] Open homepage as non-authenticated user
2. [ ] Search for flights (JFK → LAX, next week)
3. [ ] View search results
4. [ ] Select 2-3 flights for comparison
5. [ ] Verify comparison bar appears
6. [ ] Click "Book Now" from comparison
7. [ ] Sign in/Sign up flow
8. [ ] Return to results, save flight to wishlist
9. [ ] Check notifications bell for updates
10. [ ] Navigate to deals page
11. [ ] Install PWA (wait 30s for prompt)
12. [ ] Test offline mode

**Expected Results:**
- All flows complete without errors
- Data persists across navigation
- PWA installs successfully
- Notifications appear in bell

**Pass Criteria:** 100% completion without blocking errors

---

## FLIGHTCOMPARISON TESTING

### Test Case FC-001: Basic Comparison Flow
**Priority:** CRITICAL
**File:** `C:\Users\Power\fly2any-fresh\components\search\FlightComparison.tsx`

#### Desktop Testing
- [ ] Navigate to `/flights/results` with search query
- [ ] Verify flight cards display compare checkbox
- [ ] Click compare checkbox on first flight
- [ ] **Expected:** Sticky comparison bar appears at bottom
- [ ] Verify flight details populate in comparison bar
- [ ] Add second flight to comparison
- [ ] **Expected:** Bar shows "2 of 3 flights selected"
- [ ] Add third flight
- [ ] **Expected:** Bar shows "3 of 3 flights selected"
- [ ] Try to add 4th flight
- [ ] **Expected:** Max limit enforced (3 flights)

#### Comparison Table Verification
- [ ] Verify all 9 comparison categories display:
  - [ ] Price (with "Best Price" badge)
  - [ ] Departure (airport, time, date)
  - [ ] Arrival (airport, time, date)
  - [ ] Duration (with "Fastest" badge)
  - [ ] Stops (with "Fewest" badge)
  - [ ] Aircraft type
  - [ ] Baggage allowance
  - [ ] Amenities (WiFi, meals, etc.)
  - [ ] Fare class

- [ ] Verify best value highlighting:
  - [ ] Lowest price has green background + "Best Price" badge
  - [ ] Shortest duration has green background + "Fastest" badge
  - [ ] Fewest stops has green background + "Fewest" badge

#### Remove Flight Test
- [ ] Click "X" button on one flight in comparison
- [ ] **Expected:** Flight removed from comparison
- [ ] **Expected:** Checkbox unchecks on flight card
- [ ] **Expected:** Comparison bar updates count

#### Book Button Test
- [ ] Click "Book Now" button on a flight in comparison
- [ ] **Expected:** Redirects to booking page for that flight
- [ ] **Expected:** Flight data passes correctly

#### Close Comparison Test
- [ ] Click close button (X) on comparison bar
- [ ] **Expected:** Comparison bar closes
- [ ] **Expected:** All checkboxes uncheck
- [ ] **Expected:** State resets

#### Mobile Testing
- [ ] Repeat all tests on mobile viewport (<768px)
- [ ] Verify mobile layout: Stacked cards instead of table
- [ ] Verify sticky bar remains at bottom
- [ ] Verify touch interactions work smoothly
- [ ] Verify scrolling doesn't break sticky positioning

**API Cost Verification:**
- [ ] Open Network tab in DevTools
- [ ] Perform comparison of 3 flights
- [ ] **Expected:** ZERO additional API calls
- [ ] **Expected:** All data from existing search results

**Pass Criteria:** All tests pass, no API calls, responsive design works

---

### Test Case FC-002: Empty State
**Priority:** HIGH

- [ ] Open comparison bar with 0 flights selected
- [ ] **Expected:** Empty state message displays:
  - Icon (clipboard)
  - "No flights selected"
  - Instructions to add flights

**Pass Criteria:** Empty state renders correctly

---

### Test Case FC-003: Data Accuracy
**Priority:** CRITICAL

For each flight in comparison:
- [ ] Verify airline name matches original
- [ ] Verify flight number matches
- [ ] Verify price is accurate (no rounding errors)
- [ ] Verify departure/arrival times are correct
- [ ] Verify duration calculation is accurate
- [ ] Verify stops count is correct
- [ ] Verify baggage info matches fare rules

**Pass Criteria:** 100% data accuracy

---

## NOTIFICATION SYSTEM TESTING

### Test Case NT-001: Notification Bell Display
**Priority:** CRITICAL
**File:** `C:\Users\Power\fly2any-fresh\components\notifications\NotificationBell.tsx`

#### Authenticated User
- [ ] Log in as test user
- [ ] Verify bell icon appears in desktop header (top right)
- [ ] Verify bell icon appears in mobile drawer header
- [ ] **Expected:** Bell icon is visible and clickable
- [ ] **Expected:** No unread badge if no notifications

#### Non-Authenticated User
- [ ] Log out or open incognito tab
- [ ] Verify bell icon does NOT appear
- [ ] **Expected:** Sign In/Sign Up buttons visible instead

**Pass Criteria:** Authentication-based visibility works correctly

---

### Test Case NT-002: Create Test Notification
**Priority:** CRITICAL

#### Via API (Developer Console)
```javascript
// Open DevTools Console and run:
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'booking',
    title: 'Test Notification',
    message: 'This is a test notification for QA',
    priority: 'high',
    actionUrl: '/account/bookings'
  })
}).then(r => r.json()).then(console.log)
```

- [ ] Execute API call
- [ ] **Expected:** 201 Created response
- [ ] **Expected:** Notification ID returned

#### Verify Notification Appears
- [ ] Refresh page (or wait 30 seconds for auto-refresh)
- [ ] **Expected:** Unread badge appears on bell (shows "1")
- [ ] **Expected:** Badge has red background

**Pass Criteria:** Notification created and badge displays correctly

---

### Test Case NT-003: Notification Dropdown
**Priority:** CRITICAL

- [ ] Click bell icon
- [ ] **Expected:** Dropdown panel appears below bell
- [ ] **Expected:** Dropdown dimensions: 384px wide (96 in Tailwind)
- [ ] **Expected:** Maximum height: 600px

#### Dropdown Header
- [ ] Verify header text: "Notifications"
- [ ] Verify unread count displays: "(1 unread)"
- [ ] Verify "Mark all read" button appears (if unread > 0)

#### Notification List
- [ ] Verify test notification displays
- [ ] Verify notification card shows:
  - [ ] Type icon (based on notification type)
  - [ ] Title
  - [ ] Message (truncated if long)
  - [ ] Time ago (e.g., "2 minutes ago")
  - [ ] Unread indicator (blue dot or highlight)

#### Dropdown Actions
- [ ] Click "Mark all read" button
- [ ] **Expected:** All notifications marked as read
- [ ] **Expected:** Unread badge disappears
- [ ] **Expected:** Blue dots disappear from cards

- [ ] Click "View all notifications" button
- [ ] **Expected:** Redirects to `/account/notifications`
- [ ] **Expected:** Dropdown closes

#### Click Outside to Close
- [ ] Open dropdown
- [ ] Click anywhere outside dropdown
- [ ] **Expected:** Dropdown closes

**Pass Criteria:** All dropdown interactions work correctly

---

### Test Case NT-004: Mark as Read
**Priority:** HIGH

- [ ] Click bell to open dropdown
- [ ] Find unread notification
- [ ] Click on notification card
- [ ] **Expected:** Notification marked as read immediately
- [ ] **Expected:** Blue dot disappears
- [ ] **Expected:** Unread count decrements
- [ ] **Expected:** If actionUrl exists, navigates to that URL

**Pass Criteria:** Mark as read works instantly

---

### Test Case NT-005: Delete Notification
**Priority:** HIGH

- [ ] Open notification dropdown
- [ ] Find notification with delete button (X icon)
- [ ] Click delete button
- [ ] **Expected:** Notification removed from list
- [ ] **Expected:** Success toast: "Notification dismissed"
- [ ] **Expected:** If notification was unread, count decrements

**Pass Criteria:** Delete works without errors

---

### Test Case NT-006: Notification Center Page
**Priority:** HIGH

- [ ] Navigate to `/account/notifications`
- [ ] **Expected:** Full-page notification center loads
- [ ] **Expected:** All notifications listed (paginated, 20 per page)

#### Filter Testing
- [ ] Test "All" filter - shows all notifications
- [ ] Test "Unread" filter - shows only unread
- [ ] Test type filters:
  - [ ] Booking notifications
  - [ ] Price alert notifications
  - [ ] System notifications
  - [ ] Promotion notifications

#### Bulk Actions
- [ ] Click "Mark all as read" button
- [ ] **Expected:** All visible notifications marked as read
- [ ] Click "Delete all" button (if exists)
- [ ] **Expected:** Confirmation modal appears
- [ ] **Expected:** All notifications deleted on confirm

#### Pagination
- [ ] If more than 20 notifications exist:
  - [ ] Verify pagination controls appear
  - [ ] Test next/previous page buttons
  - [ ] Verify page numbers display correctly

**Pass Criteria:** Notification center fully functional

---

### Test Case NT-007: Real-Time Polling
**Priority:** HIGH

- [ ] Log in and stay on any page
- [ ] Create notification via API (see NT-002)
- [ ] Wait 30 seconds (default polling interval)
- [ ] **Expected:** Unread badge updates automatically
- [ ] **Expected:** No page refresh needed
- [ ] **Expected:** New notification appears in dropdown

**Configuration:**
```typescript
NOTIFICATION_POLLING_INTERVAL = 30000 // 30 seconds
```

**Pass Criteria:** Polling works every 30 seconds

---

### Test Case NT-008: Notification Sound (Optional)
**Priority:** LOW

- [ ] Enable sound in NotificationBell component
- [ ] Create new notification
- [ ] **Expected:** Sound plays when new notification arrives
- [ ] **Expected:** Sound volume is reasonable (0.5)
- [ ] **Note:** Browser may block autoplay

**Pass Criteria:** Sound plays if autoplay allowed

---

## PWA TESTING

### Test Case PWA-001: Service Worker Registration
**Priority:** CRITICAL
**File:** `C:\Users\Power\fly2any-fresh\public\service-worker.js`

- [ ] Open site in Chrome
- [ ] Open DevTools → Application tab → Service Workers
- [ ] **Expected:** Service worker registered
- [ ] **Expected:** Status: "Activated and running"
- [ ] **Expected:** Source: `/service-worker.js`

#### Console Logs to Verify
```
[PWA] Initializing...
[PWA] Service worker registered successfully
[PWA] Initialization complete
```

**Pass Criteria:** Service worker registers on page load

---

### Test Case PWA-002: Install Prompt (Desktop)
**Priority:** CRITICAL
**File:** `C:\Users\Power\fly2any-fresh\components\pwa\InstallPrompt.tsx`

#### Timing Test
- [ ] Open site in Chrome (desktop)
- [ ] Wait 30 seconds
- [ ] **Expected:** Install prompt appears (bottom-right corner)

#### Prompt Content
- [ ] Verify prompt displays:
  - [ ] App icon
  - [ ] "Install Fly2Any" heading
  - [ ] Feature list:
    - Offline access
    - Fast loading
    - Push notifications
  - [ ] "Install Now" button
  - [ ] "Not now" button (X icon)

#### Install Flow
- [ ] Click "Install Now" button
- [ ] **Expected:** Browser native install dialog appears
- [ ] **Expected:** Dialog shows app name: "Fly2Any - AI Travel Assistant"
- [ ] Click "Install" in browser dialog
- [ ] **Expected:** App installs successfully
- [ ] **Expected:** App icon appears on desktop/taskbar
- [ ] **Expected:** Custom install prompt dismisses

#### Dismiss Flow
- [ ] Close and reopen site (before 7 days)
- [ ] Wait 30 seconds
- [ ] Click "Not now" (X button) on prompt
- [ ] **Expected:** Prompt dismisses
- [ ] **Expected:** localStorage saved: `fly2any-install-prompt-dismissed`
- [ ] **Expected:** Prompt doesn't reappear for 7 days

**Pass Criteria:** Install prompt appears after 30s, install works

---

### Test Case PWA-003: Install Prompt (Mobile)
**Priority:** CRITICAL

- [ ] Open site on iOS Safari or Chrome Android
- [ ] Wait 30 seconds
- [ ] **Expected (Android Chrome):** Bottom banner appears with install option
- [ ] **Expected (iOS Safari):** No automatic prompt (Apple limitation)

#### iOS Manual Install
- [ ] Open site in Safari
- [ ] Tap Share button
- [ ] **Expected:** "Add to Home Screen" option visible
- [ ] Tap "Add to Home Screen"
- [ ] **Expected:** App icon appears on home screen

**Pass Criteria:** Mobile install works per platform capabilities

---

### Test Case PWA-004: Installed App Experience
**Priority:** HIGH

- [ ] Install app (see PWA-002)
- [ ] Close browser
- [ ] Open installed app from desktop/taskbar
- [ ] **Expected:** App opens in standalone window (no browser UI)
- [ ] **Expected:** Custom app icon in taskbar
- [ ] **Expected:** App name in title bar

#### Standalone Detection
- [ ] Open DevTools Console in installed app
- [ ] Check: `window.matchMedia('(display-mode: standalone)').matches`
- [ ] **Expected:** Returns `true`

**Pass Criteria:** Standalone app experience works

---

### Test Case PWA-005: Offline Support
**Priority:** CRITICAL

#### Go Offline
- [ ] Install app (or use browser)
- [ ] Navigate to a few pages (flights, hotels, deals)
- [ ] Open DevTools → Network tab
- [ ] Select "Offline" throttling
- [ ] Refresh page

#### Offline Page Verification
- [ ] **Expected:** Custom offline page loads
- [ ] **Expected:** Page shows:
  - Offline icon
  - "You're offline" message
  - "Reconnect to continue" instructions
  - Retry button

#### Cached Pages Test
- [ ] Go offline
- [ ] Navigate to previously visited pages
- [ ] **Expected:** Pages load from cache (may be stale)
- [ ] **Expected:** Network-dependent features show loading/error states

#### Reconnection
- [ ] While offline, click "Check Connection" button
- [ ] **Expected:** Button shows "Checking..." state
- [ ] Enable network
- [ ] Click button again
- [ ] **Expected:** App detects online status
- [ ] **Expected:** "You're back online" message
- [ ] **Expected:** Automatic redirect to homepage or last page

**Pass Criteria:** Offline page shows, cached pages work, reconnection works

---

### Test Case PWA-006: Offline Indicator
**Priority:** MEDIUM
**File:** `C:\Users\Power\fly2any-fresh\components\pwa\OfflineIndicator.tsx`

- [ ] Open app in browser
- [ ] Go offline (DevTools → Network → Offline)
- [ ] **Expected:** Orange banner appears at top of page
- [ ] **Expected:** Banner text: "You're offline. Some features may not work."
- [ ] Go online
- [ ] **Expected:** Banner changes to green: "You're back online!"
- [ ] **Expected:** Banner auto-dismisses after 3 seconds

**Pass Criteria:** Indicator appears/dismisses correctly

---

### Test Case PWA-007: Background Sync
**Priority:** MEDIUM

#### Queue Offline Action
- [ ] Go offline
- [ ] Try to perform an action (e.g., save to wishlist)
- [ ] **Expected:** Action queued for sync
- [ ] **Expected:** Toast message: "Action queued. Will sync when online."

#### Sync When Online
- [ ] Go online
- [ ] **Expected:** Background sync triggers automatically
- [ ] **Expected:** Queued actions execute
- [ ] **Expected:** Success notifications appear
- [ ] **Expected:** localStorage queue cleared

#### Check Sync Queue
```javascript
// DevTools Console
const queue = JSON.parse(localStorage.getItem('fly2any-sync-queue') || '[]');
console.log('Pending sync actions:', queue);
```

**Pass Criteria:** Actions queue offline, sync when online

---

### Test Case PWA-008: Manifest Verification
**Priority:** HIGH

- [ ] Navigate to `/manifest.json`
- [ ] **Expected:** JSON file loads without 404

#### Manifest Content Verification
```json
{
  "name": "Fly2Any - AI Travel Assistant",
  "short_name": "Fly2Any",
  "description": "Find and book the best flight deals...",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-48x48.png", "sizes": "48x48" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512" }
  ],
  "shortcuts": [
    { "name": "Search Flights", "url": "/flights" },
    { "name": "My Bookings", "url": "/account/bookings" },
    { "name": "Price Alerts", "url": "/account/price-alerts" }
  ]
}
```

- [ ] Verify all fields present
- [ ] Verify icon files exist: `/icons/icon-*.png`
- [ ] Verify shortcuts work when clicked

**Pass Criteria:** Manifest valid, icons exist, shortcuts functional

---

### Test Case PWA-009: Cache Strategies
**Priority:** MEDIUM

#### Static Assets (Cache First)
- [ ] Load page
- [ ] Check DevTools → Application → Cache Storage
- [ ] **Expected:** `fly2any-static-v1` cache exists
- [ ] **Expected:** Contains: CSS, JS, fonts, images

#### API Responses (Network First)
- [ ] Perform flight search
- [ ] Check cache storage
- [ ] **Expected:** `fly2any-api-v1` cache exists
- [ ] **Expected:** Contains recent API responses
- [ ] **Expected:** TTL: 5 minutes (300000ms)

#### Dynamic Content (Stale While Revalidate)
- [ ] Navigate to various pages
- [ ] Check cache storage
- [ ] **Expected:** `fly2any-dynamic-v1` cache exists
- [ ] **Expected:** Contains HTML pages

**Pass Criteria:** All cache strategies working correctly

---

## NAVIGATION TESTING

### Test Case NAV-001: Desktop Header Navigation
**Priority:** CRITICAL
**File:** `C:\Users\Power\fly2any-fresh\components\layout\Header.tsx`

#### Main Navigation Links (8 items)
Test each link individually:

1. [ ] **Flights** (✈️)
   - URL: `/flights`
   - Expected: Flights search page loads
   - Icon: Airplane emoji
   - Hover: Blue underline appears

2. [ ] **Hotels** (🏨)
   - URL: `/hotels`
   - Expected: Hotels search page loads
   - Icon: Hotel emoji
   - Hover: Blue underline appears

3. [ ] **Cars** (🚗)
   - URL: `/cars`
   - Expected: Car rental search page loads
   - Icon: Car emoji
   - Hover: Blue underline appears

4. [ ] **Packages** (📦)
   - URL: `/packages`
   - Expected: Package deals page loads
   - Icon: Package emoji
   - Hover: Blue underline appears

5. [ ] **Deals** (💰) - NEW
   - URL: `/deals`
   - Expected: Deals page loads
   - Icon: Money bag emoji
   - Hover: Blue underline appears

6. [ ] **Explore** (🌍) - NEW
   - URL: `/explore`
   - Expected: Destination explorer page loads
   - Icon: Globe emoji
   - Hover: Blue underline appears

7. [ ] **Travel Guide** (📚) - NEW
   - URL: `/travel-guide`
   - Expected: Travel guide page loads
   - Icon: Books emoji
   - Hover: Blue underline appears

8. [ ] **FAQ** (❓) - NEW
   - URL: `/faq`
   - Expected: FAQ page loads
   - Icon: Question mark emoji
   - Hover: Blue underline appears

#### Visual States
For each link, verify:
- [ ] Default state: Gray text (#374151)
- [ ] Hover state: Blue text (primary-600)
- [ ] Hover background: Light blue (primary-50/50)
- [ ] Active state: Blue underline (bottom border)
- [ ] Icon scale on hover: 1.1x (scale-110)

**Pass Criteria:** All 8 links work, hover effects smooth

---

### Test Case NAV-002: User Menu (Authenticated)
**Priority:** CRITICAL
**File:** `C:\Users\Power\fly2any-fresh\components\layout\UserMenu.tsx`

#### Display Requirements
- [ ] Log in as test user
- [ ] **Expected:** User avatar appears in header (top right)
- [ ] **Expected:** Avatar shows user image OR initials
- [ ] **Expected:** Chevron down icon appears next to avatar

#### Dropdown Menu
- [ ] Click user avatar
- [ ] **Expected:** Dropdown menu appears below avatar
- [ ] **Expected:** Dropdown width: 256px (64 in Tailwind)
- [ ] **Expected:** Glassmorphism effect visible

#### User Info Header
- [ ] Verify header shows:
  - [ ] User name (truncated if long)
  - [ ] User email (truncated if long)
  - [ ] Gradient background (blue to cyan)

#### Menu Items
Test each menu item:

1. [ ] **My Account** (User icon)
   - URL: `/account`
   - Expected: Account dashboard loads

2. [ ] **Wishlist** (Heart icon) - NEW
   - URL: `/account/wishlist`
   - Expected: Wishlist page loads

3. [ ] **Notifications** (Bell icon) - NEW
   - URL: `/account/notifications`
   - Expected: Notification center loads

4. [ ] **Settings** (Settings icon)
   - URL: `/account/preferences`
   - Expected: Settings page loads

5. [ ] **Sign Out** (Logout icon)
   - Expected: Signs out user
   - Expected: Redirects to homepage
   - Expected: User menu disappears
   - Expected: Sign In/Sign Up buttons appear

#### Interaction Tests
- [ ] Click outside menu → Menu closes
- [ ] Press Escape key → Menu closes
- [ ] Click menu item → Menu closes + navigation happens

**Pass Criteria:** All menu items work, interactions smooth

---

### Test Case NAV-003: Mobile Hamburger Menu
**Priority:** CRITICAL
**File:** `C:\Users\Power\fly2any-fresh\components\mobile\NavigationDrawer.tsx`

#### Open Menu
- [ ] Resize browser to <1024px width (or use mobile device)
- [ ] **Expected:** Hamburger icon appears (top left)
- [ ] Click hamburger icon
- [ ] **Expected:** Drawer slides in from left
- [ ] **Expected:** Drawer width: 320px (80 in Tailwind)
- [ ] **Expected:** Backdrop appears (dark overlay)

#### Drawer Header
- [ ] Verify logo appears in drawer header
- [ ] Verify NotificationBell appears (if authenticated)
- [ ] Verify close button (X) appears

#### MY ACCOUNT Section (Authenticated Only)
If logged in:
- [ ] Verify section header: "MY ACCOUNT"
- [ ] Verify 3 links:
  - [ ] My Account (👤)
  - [ ] Wishlist (💖) - NEW
  - [ ] Notifications (🔔) - NEW

If not logged in:
- [ ] Verify section does NOT appear

#### BOOK TRAVEL Section
- [ ] Verify section header: "BOOK TRAVEL"
- [ ] Verify 4 links:
  - [ ] Flights (✈️)
  - [ ] Hotels (🏨)
  - [ ] Cars (🚗)
  - [ ] Packages (📦)

#### DISCOVER Section
- [ ] Verify section header: "DISCOVER"
- [ ] Verify 4 links:
  - [ ] Deals (💰) - NEW
  - [ ] Explore (🌍) - NEW
  - [ ] Travel Guide (📚) - NEW
  - [ ] FAQ (❓) - NEW

#### Language Selector
- [ ] Verify language section appears
- [ ] Verify 3 language buttons:
  - [ ] English (🇺🇸)
  - [ ] Português (🇧🇷)
  - [ ] Español (🇪🇸)
- [ ] Click each language
- [ ] **Expected:** Language changes
- [ ] **Expected:** Menu stays open
- [ ] **Expected:** Selected language highlighted (blue gradient)

#### Auth Buttons (Non-Authenticated)
If not logged in:
- [ ] Verify "Sign In" button appears
- [ ] Verify "Sign Up" button appears (gradient)
- [ ] Click Sign In → Redirects to `/auth/signin`
- [ ] Click Sign Up → Redirects to `/auth/signup`

#### Close Menu
- [ ] Click backdrop → Menu closes
- [ ] Click X button → Menu closes
- [ ] Press Escape key → Menu closes
- [ ] Click any nav link → Menu closes

**Pass Criteria:** All sections visible, all links work, close works

---

### Test Case NAV-004: Language Switching
**Priority:** HIGH

#### Desktop Language Dropdown
- [ ] Click language dropdown (flag + code)
- [ ] **Expected:** Dropdown appears
- [ ] Verify 3 languages listed:
  - [ ] 🇺🇸 English (EN)
  - [ ] 🇧🇷 Português (PT)
  - [ ] 🇪🇸 Español (ES)

#### Switch Language
- [ ] Click Português
- [ ] **Expected:** All header text changes to Portuguese:
  - Voos, Hotéis, Carros, Pacotes, etc.
- [ ] **Expected:** Language code changes to "PT"
- [ ] **Expected:** Checkmark appears next to selected language

- [ ] Click Español
- [ ] **Expected:** All header text changes to Spanish:
  - Vuelos, Hoteles, Autos, Paquetes, etc.
- [ ] **Expected:** Language code changes to "ES"

- [ ] Refresh page
- [ ] **Expected:** Language preference persists (if implemented)

**Pass Criteria:** All 3 languages work, translations accurate

---

### Test Case NAV-005: Auto-Hide on Scroll (Mobile)
**Priority:** MEDIUM

- [ ] Open site on mobile viewport
- [ ] Scroll down 100+ pixels
- [ ] **Expected:** Header slides up and disappears
- [ ] **Expected:** Transition smooth (300ms)
- [ ] **Expected:** ~80px vertical space saved

- [ ] Scroll up
- [ ] **Expected:** Header slides back down and reappears

- [ ] Scroll to top of page
- [ ] **Expected:** Header always visible at top

**Configuration:**
```typescript
useScrollDirection({
  threshold: 50,      // Ignore scrolls < 50px
  debounceDelay: 100, // Debounce 100ms
  mobileOnly: true,   // Desktop unchanged
})
```

**Pass Criteria:** Auto-hide works smoothly on mobile only

---

### Test Case NAV-006: Sticky Header
**Priority:** HIGH

- [ ] Load any page
- [ ] Scroll down 500+ pixels
- [ ] **Expected:** Header remains at top of viewport
- [ ] **Expected:** Header position: `position: sticky; top: 0;`
- [ ] **Expected:** z-index: 50 (above content)

#### Glassmorphism Effect
When scrolled:
- [ ] Verify background: Semi-transparent white (rgba(255,255,255,0.95))
- [ ] Verify backdrop filter: Blur effect visible
- [ ] Verify border: Subtle bottom border appears
- [ ] Verify shadow: Soft shadow appears

**Pass Criteria:** Header sticky, glassmorphism effect works

---

## NEW PAGES TESTING

### Test Case NP-001: Wishlist Page
**Priority:** HIGH
**URL:** `/account/wishlist`
**File:** `C:\Users\Power\fly2any-fresh\app\account\wishlist\page.tsx`

#### Access Control
- [ ] Try accessing as non-authenticated user
- [ ] **Expected:** Redirects to `/auth/signin`
- [ ] **Expected:** Return URL saved for post-login redirect

#### Empty State
- [ ] Log in as new user with no wishlist items
- [ ] Navigate to `/account/wishlist`
- [ ] **Expected:** Empty state displays:
  - Heart icon
  - "Your wishlist is empty" message
  - "Start exploring" CTA button

#### Add to Wishlist Flow
- [ ] Go to flight search results
- [ ] Click "Add to Wishlist" on a flight
- [ ] **Expected:** Success toast: "Added to wishlist"
- [ ] Navigate to `/account/wishlist`
- [ ] **Expected:** Flight appears in wishlist

#### Wishlist Card Display
For each item, verify:
- [ ] Airline logo
- [ ] Flight route (origin → destination)
- [ ] Departure date
- [ ] Current price (highlighted)
- [ ] Target price (if set)
- [ ] Price drop notification toggle
- [ ] Notes field (editable)
- [ ] Remove button

#### Edit Target Price
- [ ] Click "Set Price Alert" button
- [ ] Enter target price (e.g., $500)
- [ ] Enable "Notify on drop" toggle
- [ ] **Expected:** Target price saves
- [ ] **Expected:** Alert icon appears

#### Remove from Wishlist
- [ ] Click remove button (trash icon)
- [ ] **Expected:** Confirmation modal appears
- [ ] Click "Remove"
- [ ] **Expected:** Item removed from list
- [ ] **Expected:** Success toast

#### Responsive Design
- [ ] Test on desktop: Grid layout (2-3 columns)
- [ ] Test on tablet: Grid layout (2 columns)
- [ ] Test on mobile: Single column

**Pass Criteria:** All wishlist features work, data persists

---

### Test Case NP-002: Deals Page
**Priority:** HIGH
**URL:** `/deals`
**File:** `C:\Users\Power\fly2any-fresh\app\deals\page.tsx`

#### Page Load
- [ ] Navigate to `/deals`
- [ ] **Expected:** Page loads without errors
- [ ] **Expected:** Hero section displays
- [ ] **Expected:** Deal cards display

#### Deal Card Verification
For each deal, verify:
- [ ] Destination image
- [ ] Destination name and country
- [ ] Flight route
- [ ] Price (was/now comparison)
- [ ] Discount percentage badge
- [ ] Countdown timer (if time-limited)
- [ ] "View Deal" CTA button

#### Countdown Timer Test
- [ ] Find deal with countdown
- [ ] **Expected:** Timer shows: Days, Hours, Minutes, Seconds
- [ ] Wait 1 minute
- [ ] **Expected:** Timer counts down
- [ ] **Expected:** Updates every second

#### Filter Options
- [ ] Test destination filter dropdown
- [ ] Test price range slider
- [ ] Test departure date calendar
- [ ] **Expected:** Deals filter based on selections
- [ ] **Expected:** Results update dynamically

#### Click Deal
- [ ] Click "View Deal" button
- [ ] **Expected:** Redirects to flight search with pre-filled parameters
- [ ] **Expected:** Deal price honored

#### Sort Options
- [ ] Sort by "Price: Low to High"
- [ ] **Expected:** Deals reorder by price ascending
- [ ] Sort by "Discount %: High to Low"
- [ ] **Expected:** Deals reorder by discount descending

**Pass Criteria:** All deals display, filters work, timers count down

---

### Test Case NP-003: Explore Page
**Priority:** HIGH
**URL:** `/explore`
**File:** `C:\Users\Power\fly2any-fresh\app\explore\page.tsx`

#### Page Load
- [ ] Navigate to `/explore`
- [ ] **Expected:** Page loads with hero section
- [ ] **Expected:** 12+ destination cards display

#### Destination Card Verification
For each destination, verify:
- [ ] High-quality destination image
- [ ] Destination name (city, country)
- [ ] Description (2-3 sentences)
- [ ] Highlights list (3-5 items)
- [ ] "Starting from" price
- [ ] "Explore" CTA button

#### Grid Layout
- [ ] Desktop: 3 columns
- [ ] Tablet: 2 columns
- [ ] Mobile: 1 column
- [ ] Verify responsive images load

#### Search Functionality
- [ ] Enter destination name in search box
- [ ] **Expected:** Destinations filter in real-time
- [ ] **Expected:** No results message if nothing matches

#### Click Destination
- [ ] Click "Explore" button on a destination
- [ ] **Expected:** Redirects to flight search
- [ ] **Expected:** Destination pre-filled

#### Category Tabs
If implemented:
- [ ] Test tabs: All, Beaches, Cities, Mountains, Islands
- [ ] **Expected:** Destinations filter by category

**Pass Criteria:** All destinations display, search works, images load

---

### Test Case NP-004: Travel Guide Page
**Priority:** MEDIUM
**URL:** `/travel-guide`
**File:** `C:\Users\Power\fly2any-fresh\app\travel-guide\page.tsx`

#### Page Structure
- [ ] Navigate to `/travel-guide`
- [ ] **Expected:** Page loads with hero section
- [ ] **Expected:** 6 guide categories display

#### Categories
Verify all 6 categories:
1. [ ] **Before You Travel** (passport, visa, insurance)
2. [ ] **Booking Tips** (best time to book, price alerts)
3. [ ] **At the Airport** (check-in, security, lounges)
4. [ ] **On the Plane** (baggage, seats, meals)
5. [ ] **At Your Destination** (transportation, accommodation, safety)
6. [ ] **Travel Hacks** (points, upgrades, packing tips)

#### Category Expansion
- [ ] Click on each category
- [ ] **Expected:** Expands to show articles
- [ ] **Expected:** Smooth accordion animation

#### Article Links
- [ ] Click on article title
- [ ] **Expected:** Article content displays (modal or new page)
- [ ] **Expected:** Full article readable

#### Search Articles
- [ ] Enter keyword in search box (e.g., "baggage")
- [ ] **Expected:** Relevant articles highlighted
- [ ] **Expected:** Irrelevant categories collapse

**Pass Criteria:** All categories work, articles readable, search works

---

### Test Case NP-005: FAQ Page
**Priority:** MEDIUM
**URL:** `/faq`
**File:** `C:\Users\Power\fly2any-fresh\app\faq\page.tsx`

#### Page Load
- [ ] Navigate to `/faq`
- [ ] **Expected:** Page loads with search bar
- [ ] **Expected:** 20+ FAQ items display

#### FAQ Categories
Verify categories exist:
- [ ] Booking & Payments
- [ ] Flights
- [ ] Hotels
- [ ] Cars
- [ ] Cancellations & Refunds
- [ ] Account & Settings
- [ ] General

#### Accordion Interaction
- [ ] Click on FAQ question
- [ ] **Expected:** Answer expands smoothly
- [ ] **Expected:** Arrow icon rotates
- [ ] Click again
- [ ] **Expected:** Answer collapses

#### Multiple Open
- [ ] Open multiple FAQs simultaneously
- [ ] **Expected:** All remain open (not accordion-exclusive)

#### Search FAQs
- [ ] Enter question keyword (e.g., "refund")
- [ ] **Expected:** FAQs filter to show only matching
- [ ] **Expected:** Search terms highlighted in results
- [ ] Clear search
- [ ] **Expected:** All FAQs reappear

#### Contact Support Link
- [ ] Scroll to bottom
- [ ] Find "Still need help?" section
- [ ] Click "Contact Support" button
- [ ] **Expected:** Redirects to support page or opens chat

**Pass Criteria:** All FAQs display, accordion works, search accurate

---

### Test Case NP-006: Notification Center Page
**Priority:** HIGH
**URL:** `/account/notifications`
**Tested in:** Notification System Testing (NT-006)

See Test Case NT-006 for complete test steps.

---

## EDGE CASES & ERROR HANDLING

### Test Case EC-001: FlightComparison Edge Cases
**Priority:** HIGH

#### No Search Results
- [ ] Perform search with no results
- [ ] **Expected:** Compare checkboxes don't appear
- [ ] **Expected:** No comparison bar shows

#### Very Long Flight Details
- [ ] Compare flight with 3+ stops
- [ ] Compare flight with 20+ hour duration
- [ ] Compare flight with long airline name
- [ ] **Expected:** Text truncates gracefully
- [ ] **Expected:** Tooltip shows full text on hover

#### Price Edge Cases
- [ ] Compare flights with same exact price
- [ ] **Expected:** All marked as "Best Price" if tied
- [ ] Compare flights with $0.00 price (error case)
- [ ] **Expected:** Shows "Price unavailable"

#### Missing Data
- [ ] Compare flight with missing baggage info
- [ ] **Expected:** Shows "Not included" or "Unknown"
- [ ] Compare flight with no amenities
- [ ] **Expected:** Shows "None listed"

**Pass Criteria:** All edge cases handled gracefully, no crashes

---

### Test Case EC-002: Notification Edge Cases
**Priority:** HIGH

#### Empty Notifications
- [ ] Create user with zero notifications
- [ ] Click bell icon
- [ ] **Expected:** Empty state displays (see NT-003)

#### Very Long Notification
- [ ] Create notification with 500+ character message
- [ ] **Expected:** Message truncates in dropdown (100 chars)
- [ ] **Expected:** Full message visible in notification center
- [ ] **Expected:** "Read more" link appears

#### High Notification Count
- [ ] Create 100+ notifications
- [ ] **Expected:** Badge shows "99+"
- [ ] **Expected:** Pagination works in notification center
- [ ] **Expected:** Performance remains good

#### Expired Notifications
- [ ] Create notification with old timestamp (30+ days)
- [ ] **Expected:** Shows "30 days ago" or "1 month ago"

#### Network Failure
- [ ] Go offline
- [ ] Try to mark notification as read
- [ ] **Expected:** Error toast: "Failed to update notification"
- [ ] **Expected:** Notification remains unread
- [ ] Go online
- [ ] Try again
- [ ] **Expected:** Works correctly

**Pass Criteria:** All edge cases handled, no errors

---

### Test Case EC-003: PWA Edge Cases
**Priority:** MEDIUM

#### Already Installed
- [ ] Install app
- [ ] Reload app
- [ ] **Expected:** Install prompt doesn't appear
- [ ] **Expected:** No duplicate service worker

#### Browser Doesn't Support PWA
- [ ] Open in Firefox (full support)
- [ ] Open in Safari (limited support)
- [ ] Open in Internet Explorer (no support)
- [ ] **Expected:** Graceful fallback (no errors)
- [ ] **Expected:** Site still usable

#### Service Worker Update
- [ ] Install app
- [ ] Update service worker file
- [ ] **Expected:** New service worker registers
- [ ] **Expected:** Prompt to reload app appears

#### Cache Corruption
- [ ] Open DevTools → Application → Cache Storage
- [ ] Delete a cache manually
- [ ] Reload page
- [ ] **Expected:** Cache recreated automatically
- [ ] **Expected:** No errors

**Pass Criteria:** Edge cases don't crash app

---

### Test Case EC-004: Navigation Edge Cases
**Priority:** MEDIUM

#### Very Long User Name
- [ ] Create user with 50+ character name
- [ ] **Expected:** Name truncates in user menu header
- [ ] **Expected:** Ellipsis (...) appears

#### No User Name
- [ ] Create user with only email (no name)
- [ ] **Expected:** Initials derived from email
- [ ] **Expected:** Avatar displays correctly

#### Multiple Language Switches
- [ ] Rapidly switch between languages (10+ times)
- [ ] **Expected:** No memory leaks
- [ ] **Expected:** Translations update correctly

#### Mobile Menu on Desktop Resize
- [ ] Open mobile menu
- [ ] Resize window to desktop width (>1024px)
- [ ] **Expected:** Mobile menu closes
- [ ] **Expected:** Desktop nav appears

**Pass Criteria:** No crashes, graceful handling

---

## PERFORMANCE TESTING

### Test Case PERF-001: Lighthouse Audit
**Priority:** HIGH

#### Run Lighthouse
- [ ] Open site in Chrome Incognito
- [ ] Open DevTools → Lighthouse tab
- [ ] Select: Performance, Accessibility, Best Practices, SEO, PWA
- [ ] Click "Generate report"

#### Target Scores
- [ ] Performance: ≥90
- [ ] Accessibility: ≥90
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90
- [ ] PWA: ✅ All checks pass

#### Core Web Vitals
- [ ] LCP (Largest Contentful Paint): <2.5s
- [ ] FID (First Input Delay): <100ms
- [ ] CLS (Cumulative Layout Shift): <0.1

**Pass Criteria:** All scores ≥90, Core Web Vitals green

---

### Test Case PERF-002: Bundle Size Analysis
**Priority:** MEDIUM

#### Check Page Sizes
- [ ] Run: `npm run build`
- [ ] Review build output

**Target Sizes:**
- Homepage: <100KB (gzipped)
- Flights results: <150KB
- Notification center: <50KB
- PWA assets: <30KB

**Pass Criteria:** Sizes within targets, no huge bundles

---

### Test Case PERF-003: API Performance
**Priority:** HIGH

#### Flight Search Performance
- [ ] Open Network tab
- [ ] Perform flight search
- [ ] Measure API response time

**Targets:**
- Flight search API: <3 seconds
- Notification fetch: <500ms
- Wishlist load: <1 second

**Pass Criteria:** All API calls within targets

---

### Test Case PERF-004: Rendering Performance
**Priority:** MEDIUM

#### Scroll Performance
- [ ] Open DevTools → Performance tab
- [ ] Start recording
- [ ] Scroll through flight results (100+ items)
- [ ] Stop recording

**Verify:**
- [ ] Frame rate: ≥60 FPS
- [ ] No long tasks (>50ms)
- [ ] No layout thrashing

#### Component Mount Performance
- [ ] Open React DevTools → Profiler
- [ ] Navigate to flights results
- [ ] Record profile

**Verify:**
- [ ] Initial mount: <2 seconds
- [ ] Component updates: <100ms
- [ ] No unnecessary re-renders

**Pass Criteria:** 60 FPS, no performance bottlenecks

---

## SECURITY TESTING

### Test Case SEC-001: Authentication Enforcement
**Priority:** CRITICAL

#### Protected Routes
Test each protected route without authentication:

- [ ] `/account` → Redirects to `/auth/signin`
- [ ] `/account/wishlist` → Redirects to `/auth/signin`
- [ ] `/account/notifications` → Redirects to `/auth/signin`
- [ ] `/account/preferences` → Redirects to `/auth/signin`

#### API Endpoints
```javascript
// Test without auth token
fetch('/api/notifications').then(r => console.log(r.status));
// Expected: 401 Unauthorized

fetch('/api/wishlist').then(r => console.log(r.status));
// Expected: 401 Unauthorized
```

**Pass Criteria:** All protected resources require authentication

---

### Test Case SEC-002: Data Isolation
**Priority:** CRITICAL

#### User Data Separation
- [ ] Log in as User A
- [ ] Create wishlist item
- [ ] Note wishlist item ID
- [ ] Log out
- [ ] Log in as User B
- [ ] Try to access User A's wishlist item (via URL)
- [ ] **Expected:** 403 Forbidden or 404 Not Found

#### Notification Privacy
- [ ] Repeat above test for notifications
- [ ] **Expected:** Users cannot see each other's notifications

**Pass Criteria:** Users cannot access other users' data

---

### Test Case SEC-003: XSS Prevention
**Priority:** HIGH

#### Input Sanitization
```javascript
// Test XSS in notification message
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'system',
    title: 'Test',
    message: '<script>alert("XSS")</script>'
  })
}).then(r => r.json()).then(console.log);
```

- [ ] Create notification with XSS payload
- [ ] View notification in dropdown
- [ ] **Expected:** Script does NOT execute
- [ ] **Expected:** HTML entities escaped

**Pass Criteria:** No XSS vulnerabilities

---

### Test Case SEC-004: CSRF Protection
**Priority:** HIGH

- [ ] Check all API endpoints
- [ ] **Expected:** CSRF tokens required (or SameSite cookies)
- [ ] Try to call API from external site
- [ ] **Expected:** Request blocked

**Pass Criteria:** CSRF protection enabled

---

## ACCESSIBILITY TESTING

### Test Case A11Y-001: Keyboard Navigation
**Priority:** HIGH

#### Header Navigation
- [ ] Tab through header elements
- [ ] **Expected:** All links focusable
- [ ] **Expected:** Focus indicator visible
- [ ] Press Enter on each link
- [ ] **Expected:** Navigation works

#### FlightComparison
- [ ] Tab to compare checkboxes
- [ ] Press Space to toggle
- [ ] **Expected:** Checkboxes toggle
- [ ] Tab to "Book Now" buttons
- [ ] Press Enter
- [ ] **Expected:** Booking initiated

#### Modals & Dropdowns
- [ ] Open notification dropdown with keyboard
- [ ] Tab through notifications
- [ ] Press Escape
- [ ] **Expected:** Dropdown closes

**Pass Criteria:** All interactive elements keyboard accessible

---

### Test Case A11Y-002: Screen Reader Support
**Priority:** HIGH

#### Test with NVDA/JAWS
- [ ] Enable screen reader
- [ ] Navigate through homepage
- [ ] **Expected:** All content announced correctly
- [ ] Navigate through flight results
- [ ] **Expected:** Flight details announced
- [ ] Open notification dropdown
- [ ] **Expected:** "Notifications" landmark announced
- [ ] **Expected:** Unread count announced

#### ARIA Labels
Verify on all interactive elements:
- [ ] Buttons have aria-label
- [ ] Images have alt text
- [ ] Forms have proper labels
- [ ] Dropdowns have aria-expanded

**Pass Criteria:** Screen reader can navigate entire site

---

### Test Case A11Y-003: Color Contrast
**Priority:** MEDIUM

#### Run axe DevTools
- [ ] Install axe DevTools extension
- [ ] Run audit on each page
- [ ] **Expected:** No color contrast violations
- [ ] **Expected:** WCAG AA standard met

#### Manual Checks
- [ ] Text on white: ≥4.5:1 contrast
- [ ] Text on colored backgrounds: ≥4.5:1
- [ ] Button text: ≥4.5:1
- [ ] Disabled elements: ≥3:1

**Pass Criteria:** All text meets WCAG AA contrast

---

### Test Case A11Y-004: Focus Management
**Priority:** MEDIUM

#### Modal Focus Trap
- [ ] Open notification dropdown
- [ ] Tab through all elements
- [ ] **Expected:** Focus stays within dropdown
- [ ] **Expected:** Focus cycles back to first element

#### Skip Links
- [ ] Tab on page load
- [ ] **Expected:** "Skip to content" link appears
- [ ] Press Enter
- [ ] **Expected:** Focus jumps to main content

**Pass Criteria:** Focus management correct

---

## CROSS-BROWSER TESTING

### Test Case BROWSER-001: Chrome (Desktop)
**Version:** 90+

- [ ] All features work
- [ ] PWA installable
- [ ] Service worker registers
- [ ] Notifications work
- [ ] Glassmorphism effects render correctly

**Pass Criteria:** Full functionality

---

### Test Case BROWSER-002: Firefox (Desktop)
**Version:** 88+

- [ ] All features work
- [ ] PWA installable (limited)
- [ ] Service worker registers
- [ ] Notifications work
- [ ] Glassmorphism effects may differ slightly

**Known Limitations:**
- Backdrop-filter may not work (use fallback)

**Pass Criteria:** Core functionality works

---

### Test Case BROWSER-003: Safari (Desktop)
**Version:** 15.4+

- [ ] All features work
- [ ] PWA NOT auto-installable (Apple limitation)
- [ ] Service worker registers
- [ ] Notifications work
- [ ] Glassmorphism effects render

**Known Limitations:**
- No install prompt
- Push notifications limited

**Pass Criteria:** Core functionality works

---

### Test Case BROWSER-004: Edge (Desktop)
**Version:** 90+

- [ ] All features work
- [ ] PWA installable
- [ ] Same as Chrome (Chromium-based)

**Pass Criteria:** Full functionality

---

### Test Case BROWSER-005: Chrome (Mobile)
**Android Version:** 90+

- [ ] All features work
- [ ] PWA installable via banner
- [ ] Service worker registers
- [ ] Offline mode works
- [ ] Touch interactions smooth

**Pass Criteria:** Full mobile functionality

---

### Test Case BROWSER-006: Safari (iOS)
**iOS Version:** 14+

- [ ] All features work
- [ ] Manual "Add to Home Screen" required
- [ ] Service worker registers (limited)
- [ ] No push notifications (Apple limitation)
- [ ] Touch interactions smooth

**Known Limitations:**
- No automatic install prompt
- No push notifications
- Limited service worker features

**Pass Criteria:** Core functionality works

---

## MOBILE TESTING

### Test Case MOBILE-001: Responsive Design
**Priority:** CRITICAL

#### Breakpoints
Test at each breakpoint:

**Mobile:** 375px - 767px
- [ ] Single column layout
- [ ] Hamburger menu visible
- [ ] Cards stack vertically
- [ ] Text readable (font size ≥14px)
- [ ] Buttons finger-friendly (≥44px height)

**Tablet:** 768px - 1023px
- [ ] 2-column grid
- [ ] Hamburger menu visible
- [ ] Cards fit screen width
- [ ] Images scale correctly

**Desktop:** 1024px+
- [ ] 3-column grid
- [ ] Full header navigation
- [ ] Optimal spacing
- [ ] No horizontal scroll

**Pass Criteria:** Layout perfect at all breakpoints

---

### Test Case MOBILE-002: Touch Interactions
**Priority:** HIGH

#### Tap Targets
- [ ] All buttons ≥44x44px
- [ ] Links have adequate spacing
- [ ] No accidental taps
- [ ] Swipe gestures work (if any)

#### Zoom
- [ ] Pinch to zoom works
- [ ] Page zooms correctly
- [ ] No text overflow

**Pass Criteria:** Touch interactions intuitive

---

### Test Case MOBILE-003: Performance on Slow Network
**Priority:** HIGH

#### Throttle to 3G
- [ ] Open DevTools → Network → Slow 3G
- [ ] Load homepage
- [ ] **Expected:** Page loads within 5 seconds
- [ ] **Expected:** Critical content appears first
- [ ] **Expected:** Images lazy load

#### Offline Test
- [ ] Go offline
- [ ] Navigate site
- [ ] **Expected:** Cached pages load
- [ ] **Expected:** Offline indicator appears

**Pass Criteria:** Usable on slow networks

---

## TEST DATA REQUIREMENTS

### User Accounts

```
TEST USER 1 (Authenticated):
Email: qa-test-1@fly2any.com
Password: TestPassword123!
Name: QA Tester One
Has: 5 notifications, 3 wishlist items

TEST USER 2 (Authenticated):
Email: qa-test-2@fly2any.com
Password: TestPassword456!
Name: QA Tester Two
Has: 0 notifications, 0 wishlist items

GUEST USER:
No account (use incognito mode)
```

### Sample Notifications

```json
[
  {
    "type": "booking",
    "title": "Booking Confirmed",
    "message": "Your flight to Paris is confirmed for Dec 15, 2025",
    "priority": "high",
    "read": false,
    "actionUrl": "/account/bookings/123"
  },
  {
    "type": "price_alert",
    "title": "Price Drop Alert",
    "message": "Flight to Tokyo dropped $100! Now $599",
    "priority": "medium",
    "read": false,
    "actionUrl": "/flights/results?to=TYO"
  },
  {
    "type": "system",
    "title": "New Feature Available",
    "message": "Try our new flight comparison tool!",
    "priority": "low",
    "read": true,
    "actionUrl": "/flights/results"
  }
]
```

### Sample Flights for Comparison

```
FLIGHT 1:
Airline: American Airlines
Flight Number: AA 100
Route: JFK → LAX
Price: $299
Duration: 5h 30m
Stops: Nonstop

FLIGHT 2:
Airline: Delta
Flight Number: DL 200
Route: JFK → LAX
Price: $249 (Best Price)
Duration: 6h 15m (1 stop)
Stops: 1 (ORD)

FLIGHT 3:
Airline: United
Flight Number: UA 300
Route: JFK → LAX
Price: $279
Duration: 5h 25m (Fastest)
Stops: Nonstop
```

---

## AUTOMATED TESTING RECOMMENDATIONS

### Unit Tests (Jest + React Testing Library)

**Priority:** HIGH

```typescript
// FlightComparison.test.tsx
describe('FlightComparison', () => {
  it('renders empty state when no flights selected', () => {
    render(<FlightComparison flights={[]} onRemove={jest.fn()} onBook={jest.fn()} />);
    expect(screen.getByText('No flights selected')).toBeInTheDocument();
  });

  it('displays up to 3 flights', () => {
    const flights = [mockFlight1, mockFlight2, mockFlight3];
    render(<FlightComparison flights={flights} onRemove={jest.fn()} onBook={jest.fn()} />);
    expect(screen.getByText('3 of 3 flights selected')).toBeInTheDocument();
  });

  it('highlights best price', () => {
    const flights = [mockFlight1, mockFlight2];
    render(<FlightComparison flights={flights} onRemove={jest.fn()} onBook={jest.fn()} />);
    expect(screen.getByText('Best Price')).toBeInTheDocument();
  });
});

// NotificationBell.test.tsx
describe('NotificationBell', () => {
  it('does not render for non-authenticated users', () => {
    render(<NotificationBell userId={undefined} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays unread count badge', () => {
    render(<NotificationBell userId="user123" />);
    // Mock API response with 5 unread
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('polls for notifications every 30 seconds', () => {
    jest.useFakeTimers();
    render(<NotificationBell userId="user123" />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(30000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
```

---

### Integration Tests (Playwright)

**Priority:** MEDIUM

```typescript
// flight-comparison.spec.ts
test('complete flight comparison flow', async ({ page }) => {
  // Navigate to flight results
  await page.goto('/flights/results?from=JFK&to=LAX&departure=2025-12-01');

  // Wait for results to load
  await page.waitForSelector('[data-testid="flight-card"]');

  // Select 3 flights for comparison
  const compareButtons = page.locator('[data-testid="compare-checkbox"]');
  await compareButtons.nth(0).click();
  await compareButtons.nth(1).click();
  await compareButtons.nth(2).click();

  // Verify comparison bar appears
  await expect(page.locator('[data-testid="comparison-bar"]')).toBeVisible();

  // Verify count
  await expect(page.locator('text=3 of 3 flights selected')).toBeVisible();

  // Click book button
  await page.locator('[data-testid="book-button"]').first().click();

  // Verify navigation
  await expect(page).toHaveURL(/.*\/booking/);
});

// pwa-install.spec.ts
test('PWA install flow', async ({ page, context }) => {
  await page.goto('/');

  // Wait for service worker registration
  await page.waitForTimeout(1000);

  // Check if service worker registered
  const swRegistered = await page.evaluate(() => {
    return navigator.serviceWorker.getRegistrations().then(regs => regs.length > 0);
  });
  expect(swRegistered).toBe(true);

  // Wait for install prompt (30 seconds)
  await page.waitForTimeout(30000);

  // Verify install prompt appears
  await expect(page.locator('text=Install Fly2Any')).toBeVisible();
});
```

---

### E2E Tests (Cypress)

**Priority:** LOW

```typescript
// notification-system.cy.ts
describe('Notification System', () => {
  beforeEach(() => {
    cy.login('test@fly2any.com', 'TestPassword123!');
  });

  it('creates and displays notifications', () => {
    // Create notification via API
    cy.request('POST', '/api/notifications', {
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test'
    });

    // Verify bell badge appears
    cy.get('[data-testid="notification-bell"]')
      .should('have.attr', 'data-count', '1');

    // Open dropdown
    cy.get('[data-testid="notification-bell"]').click();

    // Verify notification appears
    cy.contains('Test Notification').should('be.visible');

    // Mark as read
    cy.contains('Test Notification').click();

    // Verify badge disappears
    cy.get('[data-testid="notification-bell"]')
      .should('not.have.attr', 'data-count');
  });
});
```

---

### Visual Regression Tests (Percy/Chromatic)

**Priority:** LOW

```typescript
// visual-tests.spec.ts
test('FlightComparison visual regression', async ({ page }) => {
  await page.goto('/flights/results?mock=true');
  await page.locator('[data-testid="compare-checkbox"]').first().click();

  // Take screenshot
  await percySnapshot(page, 'FlightComparison - 1 flight selected');

  await page.locator('[data-testid="compare-checkbox"]').nth(1).click();
  await percySnapshot(page, 'FlightComparison - 2 flights selected');
});
```

---

## BUG REPORTING TEMPLATE

### Bug Report Format

```markdown
## Bug ID: BUG-[COMPONENT]-[NUMBER]

**Priority:** [CRITICAL / HIGH / MEDIUM / LOW]
**Component:** [FlightComparison / Notifications / PWA / Navigation / etc.]
**Status:** [Open / In Progress / Fixed / Closed]

### Description
Clear description of the bug in 1-2 sentences.

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
What should happen.

### Actual Behavior
What actually happens.

### Environment
- **Browser:** Chrome 120.0.6099.109
- **OS:** Windows 11
- **Device:** Desktop / Mobile (specify model)
- **Screen Resolution:** 1920x1080
- **User Type:** Authenticated / Non-authenticated

### Screenshots/Video
Attach screenshots or screen recording.

### Console Errors
```
Paste any console errors here
```

### Network Logs
Include relevant API calls and responses if applicable.

### Additional Context
Any other relevant information.

### Suggested Fix
If you have an idea of the solution.
```

---

### Example Bug Reports

#### Example 1: Critical Bug

```markdown
## Bug ID: BUG-FC-001

**Priority:** CRITICAL
**Component:** FlightComparison
**Status:** Open

### Description
Comparison bar does not appear when selecting flights on mobile Safari.

### Steps to Reproduce
1. Open site on iPhone 12 (iOS 15.5) in Safari
2. Navigate to /flights/results
3. Tap compare checkbox on any flight
4. Observe comparison bar

### Expected Behavior
Sticky comparison bar should appear at bottom of screen.

### Actual Behavior
No comparison bar appears. Console shows error:
`TypeError: Cannot read property 'price' of undefined`

### Environment
- Browser: Safari 15.5
- OS: iOS 15.5
- Device: iPhone 12
- Screen Resolution: 390x844

### Screenshots
[Attach screenshot showing no comparison bar]

### Console Errors
```
TypeError: Cannot read property 'price' of undefined
  at FlightComparison.tsx:43
```

### Suggested Fix
Add null check before accessing flight.price property.
```

---

#### Example 2: Medium Bug

```markdown
## Bug ID: BUG-NT-003

**Priority:** MEDIUM
**Component:** Notifications
**Status:** Open

### Description
Notification dropdown shows incorrect unread count after marking all as read.

### Steps to Reproduce
1. Log in with 5 unread notifications
2. Click bell icon to open dropdown
3. Click "Mark all as read" button
4. Observe unread count badge

### Expected Behavior
Badge should disappear (count = 0).

### Actual Behavior
Badge still shows "1" even though all notifications are marked as read.

### Environment
- Browser: Chrome 120.0.6099.109
- OS: Windows 11
- Device: Desktop
- Screen Resolution: 1920x1080

### Console Errors
None

### Suggested Fix
Update local state correctly in handleMarkAllAsRead function:
`setUnreadCount(0)` instead of `setUnreadCount(prev => prev - 1)`
```

---

## TEST EXECUTION TRACKING

### Test Run Template

```markdown
## Test Run ID: TR-PHASE7-001

**Date:** 2025-11-10
**Tester:** [Your Name]
**Environment:** Development / Staging / Production
**Duration:** [Start Time] - [End Time]

### Test Summary
| Category | Total | Passed | Failed | Skipped | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| FlightComparison | 10 | 9 | 1 | 0 | 90% |
| Notifications | 15 | 15 | 0 | 0 | 100% |
| PWA | 12 | 10 | 2 | 0 | 83% |
| Navigation | 8 | 8 | 0 | 0 | 100% |
| New Pages | 12 | 11 | 1 | 0 | 92% |
| Edge Cases | 10 | 8 | 2 | 0 | 80% |
| Performance | 8 | 7 | 1 | 0 | 88% |
| Security | 6 | 6 | 0 | 0 | 100% |
| Accessibility | 6 | 5 | 1 | 0 | 83% |
| Cross-Browser | 6 | 5 | 1 | 0 | 83% |
| Mobile | 6 | 6 | 0 | 0 | 100% |
| **TOTAL** | **99** | **90** | **9** | **0** | **91%** |

### Failed Tests
1. BUG-FC-001 - Comparison bar not appearing on mobile Safari
2. BUG-NT-003 - Incorrect unread count after mark all
3. [List all failed tests with bug IDs]

### Blockers
- None / List any blocking issues

### Notes
- Overall system stability is good
- Mobile Safari needs attention
- Recommend fixing critical bugs before production

### Sign-off
**Tester Signature:** _______________
**Date:** _______________
```

---

## FINAL QA SIGN-OFF CHECKLIST

Before approving Phase 7 for production:

### Critical Requirements
- [ ] All CRITICAL priority tests pass (100%)
- [ ] Zero blocking bugs
- [ ] FlightComparison fully functional (desktop + mobile)
- [ ] Notifications work without errors
- [ ] PWA installs successfully on Chrome
- [ ] All navigation links work
- [ ] No authentication bypasses

### High Priority Requirements
- [ ] 95%+ of HIGH priority tests pass
- [ ] Performance metrics met (Lighthouse ≥90)
- [ ] All new pages load correctly
- [ ] Mobile responsive design works
- [ ] Cross-browser compatibility verified

### Medium Priority Requirements
- [ ] 90%+ of MEDIUM priority tests pass
- [ ] Edge cases handled gracefully
- [ ] Accessibility compliance (WCAG AA)
- [ ] Visual polish complete

### Documentation Requirements
- [ ] All bugs documented with IDs
- [ ] Test run report completed
- [ ] Known issues list provided
- [ ] Deployment checklist ready

### Team Sign-Offs
- [ ] QA Lead: _______________
- [ ] Development Lead: _______________
- [ ] Product Owner: _______________
- [ ] DevOps: _______________

---

## CONCLUSION

This comprehensive testing checklist covers all Phase 7 features across 11 major testing categories:

1. FlightComparison (10 test cases)
2. Notification System (8 test cases)
3. PWA Features (9 test cases)
4. Navigation (6 test cases)
5. New Pages (6 test cases)
6. Edge Cases (4 test cases)
7. Performance (4 test cases)
8. Security (4 test cases)
9. Accessibility (4 test cases)
10. Cross-Browser (6 test cases)
11. Mobile (3 test cases)

**Total Test Cases:** 99+ individual tests
**Estimated Testing Time:** 15-20 hours (comprehensive)
**Recommended Testing Approach:** Incremental testing per feature area

### Next Steps

1. **Pre-Deployment Testing** (Priority: CRITICAL)
   - Execute all critical and high priority tests
   - Fix all blocking bugs
   - Verify in staging environment

2. **Production Deployment**
   - Deploy during low-traffic window
   - Monitor error logs for 24 hours
   - Have rollback plan ready

3. **Post-Deployment Testing**
   - Smoke test all critical flows
   - Verify PWA installation on production URL
   - Monitor user feedback

4. **Continuous Testing**
   - Set up automated test suite
   - Run regression tests on each PR
   - Monthly accessibility audits

---

**Report Generated:** November 10, 2025
**Phase:** 7 - User Engagement & Advanced Features
**QA Team:** Team 4 - Quality Assurance Testing Specialist
**Status:** Ready for Testing

**Quality Assurance Approved:** _______________
**Date:** _______________

---

**END OF QA TESTING CHECKLIST**
