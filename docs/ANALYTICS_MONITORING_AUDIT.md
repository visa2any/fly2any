# Fly2Any Analytics & Monitoring System Audit

**Audit Date:** December 15, 2025
**Status:** COMPLETED

---

## Executive Summary

The Fly2Any platform has a **comprehensive but fragmented** analytics and monitoring ecosystem. Multiple tracking systems exist with significant overlap in functionality. This audit identifies all existing implementations, overlaps, gaps, and provides consolidation recommendations.

---

## 1. EXISTING ANALYTICS IMPLEMENTATIONS

### 1.1 Google Analytics 4 (GA4)

**File:** `lib/analytics/google-analytics.tsx`
**GA ID:** `G-C4QHZMDZRE` (from `NEXT_PUBLIC_GA_ID`)

| Feature | Status | Notes |
|---------|--------|-------|
| Page View Tracking | ✅ Active | Auto-tracks SPA navigation |
| Flight Search Events | ✅ Active | `trackFlightSearch()` |
| Flight View Events | ✅ Active | `trackFlightView()`, `trackFlightClick()` |
| Booking Events | ✅ Active | `trackBeginCheckout()`, `trackPurchase()` |
| Lead Generation | ✅ Active | `trackNewsletterSignup()`, `trackPriceAlert()` |
| User Auth Events | ✅ Active | `trackSignUp()`, `trackLogin()` |
| World Cup Events | ✅ Active | Dedicated tracking functions |
| Custom Events | ✅ Active | `trackCustomEvent()` |
| User Properties | ✅ Active | `setUserProperties()` |

**GA4 Events Tracked:**
- `page_view`, `search_flights`, `view_search_results`
- `view_item`, `select_item`, `begin_checkout`, `purchase`
- `generate_lead`, `sign_up`, `login`
- `create_price_alert`
- World Cup specific: `view_world_cup_page`, `view_world_cup_team`, etc.

---

### 1.2 Custom Event Tracker

**File:** `lib/analytics/event-tracker.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Event Batching | ✅ Active | Batch size: 10, Flush: 5s |
| Page View Tracking | ✅ Active | `trackPageView()` |
| Search Tracking | ✅ Active | `trackSearch()` |
| Click Tracking | ✅ Active | `trackClick()` |
| Conversion Tracking | ✅ Active | `trackConversion()` |
| Funnel Tracking | ✅ Active | `trackFunnel()` |
| Auto-flush | ✅ Active | On `beforeunload` and `visibilitychange` |

**API Endpoint:** `/api/analytics/events`

---

### 1.3 Engagement Tracker

**File:** `lib/analytics/engagement-tracker.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Session Management | ✅ Active | Creates session IDs |
| Return Visit Tracking | ✅ Active | Tracks days since last visit |
| Time on Site | ✅ Active | Tracks session duration |
| Wishlist Events | ✅ Active | Add/remove tracking |
| Deal Interactions | ✅ Active | View/click tracking |
| FAQ Engagement | ✅ Active | View, helpful, not helpful |
| Search Tracking | ✅ Active | Origin, destination, dates |
| Booking Flow | ✅ Active | Start, complete events |
| Local Storage | ✅ Active | Stores last 1000 events |

**Event Types:** 26 unique engagement events tracked

---

### 1.4 Conversion Metrics Tracker

**File:** `lib/conversion-metrics.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Session Metrics | ✅ Active | Per-session tracking |
| Funnel Stats | ✅ Active | Viewed, saved, compared, booked |
| Exit Intent Stats | ✅ Active | Shown, dismissed, submitted |
| Event Subscription | ✅ Active | Pub/sub pattern |
| Local Storage | ✅ Active | Stores last 100 metrics |
| GA4 Integration | ✅ Active | Sends to gtag |

**Conversion Events:** 12 types (FOMO, activity, price protection, etc.)

---

### 1.5 A/B Testing Analytics

**File:** `lib/ab-testing/analytics-tracker.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Event Batching | ✅ Active | Batch: 10, Flush: 30s |
| View Tracking | ✅ Active | Test variant views |
| Click Tracking | ✅ Active | Feature clicks |
| Booking Funnel | ✅ Active | Start, payment, purchase |
| Bundle Selection | ✅ Active | Smart bundles test |
| Urgency Signals | ✅ Active | Signal click tracking |
| Auto-flush | ✅ Active | On page unload |

**API Endpoint:** `/api/analytics/track`

---

### 1.6 Funnel Alert System

**File:** `lib/analytics/funnel-alerts.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Funnel Calculation | ✅ Active | 6-step funnel |
| Anomaly Detection | ✅ Active | Below threshold alerts |
| Telegram Alerts | ✅ Active | Instant notifications |
| 24h Summary | ✅ Active | `getFunnelSummary()` |

**Funnel Steps:**
1. Search (60% expected → 40% alert)
2. Results View (30% → 15%)
3. Flight Selected (50% → 30%)
4. Begin Checkout (70% → 50%)
5. Payment (80% → 60%)
6. Complete (100% → 90%)

---

## 2. MONITORING IMPLEMENTATIONS

### 2.1 Sentry Error Monitoring

**File:** `lib/monitoring/sentry.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Error Tracking | ✅ Active | `captureException()` |
| Performance Monitoring | ✅ Active | 10% sample rate (prod) |
| Session Replay | ✅ Active | 10% normal, 100% on error |
| Breadcrumbs | ✅ Active | Custom breadcrumb logging |
| User Context | ✅ Active | `setUser()` |
| API Call Tracking | ✅ Active | `trackAPICall()` |
| External API Tracking | ✅ Active | Amadeus, Duffel, etc. |
| Flight Search Tracking | ✅ Active | Duration, results |
| Booking Flow Tracking | ✅ Active | Step-by-step |
| Payment Tracking | ✅ Active | Success/failure |
| Critical Errors | ✅ Active | `trackCriticalError()` |

---

### 2.2 Customer Error Alerts

**File:** `lib/monitoring/customer-error-alerts.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Telegram Alerts | ✅ Active | Instant mobile notifications |
| Email Alerts | ✅ Active | Via Mailgun |
| Sentry Integration | ✅ Active | Full context |
| Priority Levels | ✅ Active | Low, Normal, High, Critical |
| Customer Context | ✅ Active | Name, phone, email |
| Flight Context | ✅ Active | Route, date, passengers |
| Payment Context | ✅ Active | Intent ID, amount |

---

### 2.3 Global Error Handler

**File:** `lib/monitoring/global-error-handler.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| API Error Handling | ✅ Active | `handleApiError()` |
| Auto Severity | ✅ Active | Determines from error |
| Auto Category | ✅ Active | Payment, booking, etc. |
| User-friendly Messages | ✅ Active | Category-based |
| Safe Operation Wrappers | ✅ Active | DB, API, Payment, Booking |

**Categories:** Validation, Auth, Payment, Booking, Database, External API, Network, Config

---

### 2.4 Web Vitals Monitoring

**File:** `lib/performance/web-vitals.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| LCP Tracking | ✅ Active | Target: 2500ms |
| CLS Tracking | ✅ Active | Target: 0.1 |
| FCP Tracking | ✅ Active | Target: 1800ms |
| Rating System | ✅ Active | Good/Needs Improvement/Poor |
| Console Logging | ✅ Active | Debug mode |
| Beacon Support | ⚠️ Commented | Endpoint not configured |

---

## 3. SEO & MARKETING TOOLS

### 3.1 Structured Data / Schema.org

**File:** `components/seo/StructuredData.tsx`, `lib/seo/metadata.ts`

| Schema Type | Status |
|-------------|--------|
| Organization | ✅ Active |
| WebSite | ✅ Active |
| SoftwareApplication | ✅ Active |
| TravelAgency | ✅ Active |

### 3.2 Metadata & SEO

**File:** `app/layout.tsx`

| Feature | Status |
|---------|--------|
| Open Graph | ✅ Active |
| Twitter Cards | ✅ Active |
| Robots Meta | ✅ Active |
| Google Verification | ✅ Active |
| Canonical URLs | ✅ Active |

### 3.3 Subscription Tracking (Marketing)

**File:** `lib/subscription-tracker.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Subscription Status | ✅ Active | Prevents repeat popups |
| Popup Dismissal | ✅ Active | Per-popup tracking |
| localStorage Based | ✅ Active | Persistent |

---

## 4. OVERLAP ANALYSIS

### 4.1 DUPLICATE TRACKING (Same Data, Multiple Systems)

| Data Point | Systems Tracking | Recommendation |
|------------|------------------|----------------|
| Page Views | GA4, Event Tracker, Engagement Tracker | **Consolidate to GA4 only** |
| Search Events | GA4, Event Tracker, Engagement Tracker, Conversion Metrics | **Use GA4 + 1 custom** |
| Flight Views | GA4, Engagement Tracker, Conversion Metrics | **Consolidate to GA4** |
| Booking Events | GA4, Event Tracker, Engagement Tracker, A/B Tracker, Sentry | **GA4 + Sentry only** |
| Click Events | GA4, Event Tracker, Engagement Tracker, Conversion Metrics | **GA4 only** |
| Conversions | GA4, Event Tracker, Engagement Tracker, Conversion Metrics, A/B | **GA4 + A/B only** |

### 4.2 SESSION ID MANAGEMENT

| System | Session Key | Storage |
|--------|-------------|---------|
| Event Tracker | `analytics_session_id` | sessionStorage |
| Engagement Tracker | `fly2any_session_id` | sessionStorage |
| Conversion Metrics | `conversion_session_id` | sessionStorage |

**Issue:** 3 different session IDs for the same user
**Recommendation:** Unify to single session ID

### 4.3 LOCAL STORAGE USAGE

| System | Storage Key | Max Items |
|--------|-------------|-----------|
| Engagement Tracker | `fly2any_engagement_events` | 1000 |
| Engagement Tracker | `fly2any_engagement_metrics` | N/A |
| Conversion Metrics | `conversion_metrics` | 100 |
| Subscription Tracker | `fly2any_subscribed` | N/A |
| Subscription Tracker | `fly2any_popups_dismissed` | N/A |

**Issue:** Multiple localStorage keys, potential storage bloat
**Recommendation:** Consolidate or implement cleanup

---

## 5. GAP ANALYSIS

### 5.1 MISSING CAPABILITIES

| Capability | Status | Impact |
|------------|--------|--------|
| Real-time Dashboard | ❌ Missing | No live monitoring |
| Heatmaps | ❌ Missing | No visual engagement data |
| Session Recording | ⚠️ Partial | Sentry only on errors |
| Form Analytics | ❌ Missing | No field-level tracking |
| Scroll Depth | ⚠️ Basic | Only in MobileScrollCapture |
| Revenue Attribution | ⚠️ Partial | GA4 only, not unified |
| User Journey Maps | ❌ Missing | No cross-session paths |
| Cohort Analysis | ❌ Missing | No user grouping |
| Predictive Analytics | ❌ Missing | No ML predictions |
| Custom Dashboards | ❌ Missing | No admin analytics view |

### 5.2 IMPLEMENTATION GAPS

| System | Gap | Status |
|--------|-----|--------|
| Web Vitals | Beacon endpoint not configured | ⚠️ |
| Event Tracker | API endpoint may not exist | ⚠️ |
| A/B Tracker | API endpoint may not exist | ⚠️ |
| Funnel Alerts | Requires Prisma `analyticsEvent` table | ⚠️ |

---

## 6. CONSOLIDATION RECOMMENDATIONS

### 6.1 HIGH PRIORITY - Remove Redundancy

1. **Unify Session IDs**
   - Create single `lib/analytics/session.ts`
   - All trackers use same session ID

2. **Consolidate Page Views**
   - Keep only GA4 page view tracking
   - Remove from Event Tracker and Engagement Tracker

3. **Consolidate Click Tracking**
   - Use GA4 for standard clicks
   - Use custom tracker only for A/B test clicks

4. **Consolidate Search Tracking**
   - GA4 for analytics
   - Remove duplicate tracking in other systems

### 6.2 MEDIUM PRIORITY - Optimize Storage

1. **Implement Storage Cleanup**
   - Add TTL (time-to-live) to localStorage items
   - Auto-cleanup on app start

2. **Batch API Calls**
   - Unify Event Tracker and A/B Tracker batching
   - Single flush mechanism

### 6.3 LOW PRIORITY - Future Enhancements

1. **Admin Analytics Dashboard**
   - Real-time metrics display
   - Funnel visualization

2. **Configure Web Vitals Endpoint**
   - Enable beacon reporting
   - Add to monitoring dashboard

---

## 7. CURRENT SYSTEM ARCHITECTURE

```
                    ┌─────────────────┐
                    │   USER BROWSER  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│     GA4       │   │ Custom Events │   │   Sentry      │
│ (G-C4QHZMDZRE)│   │ (5 systems)   │   │ (Errors)      │
└───────────────┘   └───────────────┘   └───────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ GA4 Dashboard │   │ localStorage  │   │ Sentry Cloud  │
│ (External)    │   │ /api/analytics│   │ + Telegram    │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## 8. WHAT TO KEEP

| System | Keep | Reason |
|--------|------|--------|
| GA4 Integration | ✅ Yes | Industry standard, full ecommerce |
| Sentry Monitoring | ✅ Yes | Critical for error tracking |
| Customer Error Alerts | ✅ Yes | Telegram/email notifications |
| Global Error Handler | ✅ Yes | Standardized error handling |
| Web Vitals | ✅ Yes | Performance monitoring |
| Subscription Tracker | ✅ Yes | Marketing popup control |
| Funnel Alerts | ✅ Yes | Conversion monitoring |
| A/B Testing Tracker | ✅ Yes | Required for experiments |

---

## 9. WHAT TO CONSOLIDATE/REMOVE

| System | Action | Reason |
|--------|--------|--------|
| Event Tracker | ⚠️ Consolidate | Duplicates GA4 |
| Engagement Tracker | ⚠️ Consolidate | Heavy localStorage, duplicates GA4 |
| Conversion Metrics | ⚠️ Consolidate | Duplicates GA4 ecommerce |

---

## 10. CONCLUSION

The Fly2Any analytics system is **functional but over-engineered**. Five separate tracking systems capture similar data, creating:

- **Performance overhead** (multiple network calls, storage writes)
- **Data inconsistency** (different session IDs, different event names)
- **Maintenance burden** (multiple systems to update)

### Recommended Architecture (Post-Consolidation):

1. **GA4** - Primary analytics (page views, events, ecommerce)
2. **Sentry** - Error tracking and performance monitoring
3. **Customer Alerts** - Telegram/email for critical issues
4. **A/B Tracker** - Experiment-specific tracking only
5. **Web Vitals** - Core Web Vitals monitoring

### Overall Grade: B+

Strong foundations, needs consolidation for optimal performance.

---

*Generated by Claude Code - December 15, 2025*
