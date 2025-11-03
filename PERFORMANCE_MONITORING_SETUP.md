# Performance Monitoring Setup - Fly2Any

Complete guide to Web Vitals tracking and performance monitoring for the Fly2Any platform.

## Table of Contents

- [Overview](#overview)
- [What Are Web Vitals?](#what-are-web-vitals)
- [Installation](#installation)
- [Architecture](#architecture)
- [Viewing Metrics](#viewing-metrics)
- [Metric Thresholds](#metric-thresholds)
- [Integration Points](#integration-points)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Fly2Any platform now includes comprehensive Web Vitals tracking to monitor real user performance metrics. This system captures Core Web Vitals and additional performance metrics, providing insights into loading speed, interactivity, and visual stability.

### Key Features

- **Real-time Monitoring**: Automatic collection of Web Vitals as users interact with the site
- **Historical Tracking**: Up to 100 measurements per metric stored locally
- **Visual Dashboard**: Color-coded metrics with trend visualization
- **Multiple Destinations**: Sends data to console (dev), analytics API, Google Analytics, and Sentry
- **Auto-refresh**: Dashboard automatically updates when new metrics are captured

---

## What Are Web Vitals?

Web Vitals are Google's initiative to provide unified guidance for quality signals essential to delivering a great user experience on the web.

### Core Web Vitals

#### 1. LCP (Largest Contentful Paint)
**What it measures**: Loading performance
**Good**: ≤ 2.5 seconds
**Needs Improvement**: 2.5 - 4 seconds
**Poor**: > 4 seconds

LCP measures the time it takes for the largest content element (image, text block, or video) to become visible in the viewport. This is the primary metric for perceived loading speed.

**How to improve:**
- Optimize images (use WebP, lazy loading, responsive images)
- Reduce server response time (TTFB)
- Eliminate render-blocking resources
- Use CDN for static assets

#### 2. FID (First Input Delay) - Legacy
**What it measures**: Interactivity (legacy metric, being replaced by INP)
**Good**: ≤ 100 milliseconds
**Needs Improvement**: 100 - 300 milliseconds
**Poor**: > 300 milliseconds

FID measures the time from when a user first interacts with your page to when the browser responds.

#### 3. INP (Interaction to Next Paint) - Recommended
**What it measures**: Interactivity (replaces FID)
**Good**: ≤ 200 milliseconds
**Needs Improvement**: 200 - 500 milliseconds
**Poor**: > 500 milliseconds

INP measures the latency of all interactions throughout the entire page lifecycle.

**How to improve:**
- Minimize JavaScript execution time
- Break up long tasks
- Use web workers for heavy computations
- Optimize third-party scripts

#### 4. CLS (Cumulative Layout Shift)
**What it measures**: Visual stability
**Good**: ≤ 0.1
**Needs Improvement**: 0.1 - 0.25
**Poor**: > 0.25

CLS measures unexpected layout shifts during the entire lifespan of the page. A layout shift occurs when visible elements change position.

**How to improve:**
- Always include size attributes on images and videos
- Reserve space for ads and embeds
- Avoid inserting content above existing content
- Use CSS transforms for animations

### Additional Web Vitals

#### 5. FCP (First Contentful Paint)
**What it measures**: Initial rendering
**Good**: ≤ 1.8 seconds
**Needs Improvement**: 1.8 - 3 seconds
**Poor**: > 3 seconds

FCP measures the time from navigation to when the browser renders the first bit of content.

#### 6. TTFB (Time to First Byte)
**What it measures**: Server response time
**Good**: ≤ 800 milliseconds
**Needs Improvement**: 800 - 1800 milliseconds
**Poor**: > 1800 milliseconds

TTFB measures the time from the request start to when the first byte of the response is received.

**How to improve:**
- Use a CDN
- Implement server-side caching
- Optimize database queries
- Use HTTP/2 or HTTP/3
- Reduce server processing time

---

## Installation

The Web Vitals monitoring system has been installed and configured. Here's what was set up:

### 1. Package Installation

```bash
npm install web-vitals
```

### 2. Files Created

```
/lib/vitals.ts                              # Core Web Vitals logic
/components/WebVitalsReporter.tsx           # Client component wrapper
/components/admin/PerformanceDashboard.tsx  # Dashboard UI
/app/admin/performance/page.tsx             # Admin route
/app/api/analytics/vitals/route.ts          # API endpoint
```

### 3. Modified Files

- `/app/layout.tsx` - Added `<WebVitalsReporter />` component

---

## Architecture

### Data Flow

```
User Interaction
       ↓
Web Vitals Library (browser)
       ↓
handleMetric() in lib/vitals.ts
       ↓
┌──────────────────┬──────────────────┬──────────────────┐
│                  │                  │                  │
Console Log     localStorage      Analytics API      Google Analytics
(development)   (dashboard)      (/api/analytics)    (if configured)
                                                            ↓
                                                        Sentry
                                                     (if configured)
```

### Component Structure

1. **WebVitalsReporter** (`components/WebVitalsReporter.tsx`)
   - Client-side component that initializes Web Vitals tracking
   - Runs once on app mount
   - Lives in the root layout

2. **Performance Dashboard** (`components/admin/PerformanceDashboard.tsx`)
   - Displays current and historical metrics
   - Auto-refreshes every 5 seconds
   - Listens to real-time 'web-vital' custom events
   - Shows color-coded ratings and sparkline charts

3. **Vitals Library** (`lib/vitals.ts`)
   - Core logic for handling metrics
   - Storage in localStorage
   - Formatting and rating calculations
   - Integration with external services

4. **Analytics API** (`app/api/analytics/vitals/route.ts`)
   - Receives metric data via POST
   - Can be extended to store in database
   - Integration point for analytics platforms

---

## Viewing Metrics

### Access the Dashboard

Navigate to: **`/admin/performance`**

Example: `https://fly2any.com/admin/performance`

### Dashboard Features

#### Metric Cards
Each Web Vital has its own card showing:
- Current value with color-coded rating
- Average value across all measurements
- Number of samples collected
- Threshold values for reference

#### Color Coding
- **Green**: Performance is good ✓
- **Yellow**: Performance needs improvement ⚠
- **Red**: Poor performance - action required ✗

#### Historical Trends
Mini sparkline charts show the last 20 measurements for each metric, color-coded by rating.

#### Controls
- **Auto-Refresh Toggle**: Enable/disable automatic updates every 5 seconds
- **Refresh Now**: Manually reload all metrics
- **Clear Data**: Remove all stored metrics (with confirmation)

### Browser Console (Development)

In development mode, metrics are logged to the console with color coding:

```javascript
// Example console output:
LCP 1,234ms (good)
FID 45ms (good)
CLS 0.05 (good)
```

---

## Metric Thresholds

### Summary Table

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | ≤ 2.5s | 2.5s - 4s | > 4s |
| **FID** | ≤ 100ms | 100ms - 300ms | > 300ms |
| **INP** | ≤ 200ms | 200ms - 500ms | > 500ms |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** | ≤ 1.8s | 1.8s - 3s | > 3s |
| **TTFB** | ≤ 800ms | 800ms - 1800ms | > 1800ms |

### Percentile Targets

Google recommends that **75% of page loads** should meet the "good" threshold to pass Core Web Vitals assessment.

---

## Integration Points

### Current Integrations

1. **Console Logging** (Development)
   - Automatically enabled in development mode
   - Color-coded output in browser console

2. **Local Storage** (All environments)
   - Stores last 100 measurements per metric
   - Powers the performance dashboard
   - Persists across sessions

3. **Custom Analytics API** (Production)
   - Endpoint: `/api/analytics/vitals`
   - Receives JSON-formatted metric data
   - Ready for database integration

### Future Integrations (Ready to Enable)

The code is pre-configured for these integrations. Simply uncomment and configure:

#### 1. Google Analytics

**Setup:**
```javascript
// Add gtag to your layout or _document
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Metrics will automatically be sent to GA4 as events.

#### 2. Sentry Performance Monitoring

**Setup:**
```bash
npm install @sentry/nextjs
```

Configure Sentry in `sentry.client.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  tracesSampleRate: 1.0,
});
```

Web Vitals will automatically be sent to Sentry.

#### 3. Database Storage

Example PostgreSQL schema:

```sql
CREATE TABLE web_vitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(10) NOT NULL,
  value NUMERIC NOT NULL,
  rating VARCHAR(20),
  delta NUMERIC,
  metric_id VARCHAR(255),
  navigation_type VARCHAR(50),
  url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_web_vitals_name ON web_vitals(name);
CREATE INDEX idx_web_vitals_timestamp ON web_vitals(timestamp);
CREATE INDEX idx_web_vitals_rating ON web_vitals(rating);
```

Uncomment the database code in `/app/api/analytics/vitals/route.ts`.

#### 4. Third-Party Analytics

The system can be extended to send data to:
- **Mixpanel**: User behavior analytics
- **Amplitude**: Product analytics
- **Datadog**: Infrastructure monitoring
- **New Relic**: Application performance monitoring
- **Cloudflare Analytics**: Edge analytics

---

## Future Enhancements

### Planned Features

1. **Database Persistence**
   - Store all metrics in PostgreSQL/TimescaleDB
   - Enable historical analysis across all users
   - Generate performance reports

2. **Aggregated Dashboards**
   - Show P75, P90, P95 percentiles
   - Compare metrics across different pages
   - Track performance over time (daily/weekly/monthly)

3. **Performance Alerts**
   - Real-time alerts for poor performance
   - Slack/Email notifications
   - PagerDuty integration for critical issues

4. **A/B Test Integration**
   - Compare performance between variants
   - Track how experiments affect Core Web Vitals

5. **Geographic Analysis**
   - Performance breakdown by region
   - CDN effectiveness monitoring

6. **Device & Browser Breakdown**
   - Mobile vs Desktop performance
   - Browser-specific issues detection

7. **Custom Metrics**
   - Track app-specific performance indicators
   - Search response time
   - Booking flow completion time

8. **Automated Recommendations**
   - AI-powered suggestions for improvements
   - Identify performance bottlenecks
   - Priority ranking of optimizations

---

## Troubleshooting

### Metrics Not Appearing

**Problem**: Dashboard shows "No metrics collected yet"

**Solutions:**
1. Navigate through the site - metrics are collected during actual usage
2. Check browser console for errors (F12 → Console)
3. Verify localStorage is enabled (some browsers block it in private mode)
4. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### Console Warnings

**Problem**: Seeing warnings about web-vitals in console

**Solution**: This is normal. Web Vitals library may show informational messages.

### Dashboard Not Auto-Refreshing

**Problem**: Metrics don't update automatically

**Solutions:**
1. Check that "Auto-Refresh: ON" button is green
2. Click "Refresh Now" to manually update
3. Open browser console to see if 'web-vital' events are firing

### Old Data Persisting

**Problem**: Want to clear old metrics

**Solution**: Click "Clear Data" button on the dashboard (requires confirmation)

### API Errors

**Problem**: Network errors when sending metrics

**Check:**
1. Verify `/api/analytics/vitals` endpoint is accessible
2. Check server logs for API errors
3. Ensure `sendBeacon` or `fetch` is not blocked by browser

---

## Testing the System

### Manual Testing

1. **Open the site** in a browser
2. **Navigate** to different pages
3. **Open console** (F12) to see metrics logged in real-time
4. **Visit dashboard** at `/admin/performance` to see aggregated data
5. **Interact** with the page (click, scroll, type) to trigger FID/INP

### Simulating Poor Performance

To test the monitoring system with poor metrics:

```javascript
// Add this to browser console to simulate slow LCP
const slowImage = document.createElement('img');
slowImage.src = 'https://httpstat.us/200?sleep=5000';
slowImage.style.width = '100%';
document.body.prepend(slowImage);
```

### Expected Behavior

- Metrics appear in console within 1-2 seconds of interaction
- Dashboard updates automatically every 5 seconds
- Color coding matches the threshold ranges
- Sparklines show trend over last 20 measurements

---

## Best Practices

### For Developers

1. **Monitor regularly**: Check dashboard weekly for trends
2. **Test before deploy**: Check Web Vitals on staging before production
3. **Use Chrome DevTools**: Lighthouse tab shows Web Vitals predictions
4. **Profile performance**: Use DevTools Performance tab for deep analysis

### For Performance

1. **Prioritize Core Web Vitals**: Focus on LCP, INP, and CLS first
2. **Test on real devices**: Mobile performance often differs significantly
3. **Monitor after changes**: Deploy → Monitor → Verify → Iterate
4. **Set up alerts**: Get notified when metrics degrade

---

## Resources

### Official Documentation

- [Web Vitals](https://web.dev/vitals/)
- [Measuring Web Vitals](https://web.dev/vitals-measurement-getting-started/)
- [Core Web Vitals Guide](https://web.dev/vitals-guide/)
- [web-vitals library](https://github.com/GoogleChrome/web-vitals)

### Tools

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Chrome DevTools

- Performance tab: Record and analyze runtime performance
- Lighthouse tab: Automated Web Vitals auditing
- Network tab: Identify slow resources
- Coverage tab: Find unused CSS/JS

---

## Support

For questions or issues with the performance monitoring system:

1. Check this documentation first
2. Review browser console for error messages
3. Check `/app/api/analytics/vitals/route.ts` logs
4. Verify localStorage is working properly

---

## Changelog

### Version 1.0 (Phase 3 - November 2024)

- Initial implementation of Web Vitals tracking
- Real-time dashboard with sparklines
- Local storage persistence
- Console logging in development
- Analytics API endpoint
- Integration points for GA, Sentry, and database
- Comprehensive documentation

---

**Last Updated**: November 3, 2024
**Maintained By**: Fly2Any Development Team
