# Sample Web Vitals Data - Fly2Any Platform

This document shows example Web Vitals data that will be captured by the performance monitoring system.

## Real-World Sample Data

### Scenario: Homepage Load (Good Performance)

#### Browser Console Output (Development Mode)
```
[Web Vitals] Tracking initialized

TTFB 234ms (good)
└─ Time from request to first byte
└─ Server responded in 234ms
└─ Rating: ✓ GOOD (< 800ms threshold)

FCP 892ms (good)
└─ First pixel rendered on screen
└─ User sees content after 892ms
└─ Rating: ✓ GOOD (< 1.8s threshold)

LCP 1.85s (good)
└─ Largest image/text block visible
└─ Main content loaded in 1.85s
└─ Rating: ✓ GOOD (< 2.5s threshold)

CLS 0.047 (good)
└─ Layout stability score
└─ Very minimal shifting
└─ Rating: ✓ GOOD (< 0.1 threshold)

INP 145ms (good)
└─ Interaction responsiveness
└─ Button clicks respond in 145ms
└─ Rating: ✓ GOOD (< 200ms threshold)
```

#### Raw Metric Objects
```javascript
// 1. TTFB - Time to First Byte
{
  name: "TTFB",
  value: 234.5,
  rating: "good",
  delta: 234.5,
  id: "v3-1699012345678-1",
  navigationType: "navigate",
  entries: [PerformanceNavigationTiming]
}

// 2. FCP - First Contentful Paint
{
  name: "FCP",
  value: 892.3,
  rating: "good",
  delta: 892.3,
  id: "v3-1699012345678-2",
  navigationType: "navigate",
  entries: [PerformancePaintTiming]
}

// 3. LCP - Largest Contentful Paint
{
  name: "LCP",
  value: 1847.8,
  rating: "good",
  delta: 1847.8,
  id: "v3-1699012345678-3",
  navigationType: "navigate",
  entries: [LargestContentfulPaint]
}

// 4. CLS - Cumulative Layout Shift
{
  name: "CLS",
  value: 0.047,
  rating: "good",
  delta: 0.047,
  id: "v3-1699012345678-4",
  navigationType: "navigate",
  entries: [LayoutShift, LayoutShift]
}

// 5. INP - Interaction to Next Paint
{
  name: "INP",
  value: 145.2,
  rating: "good",
  delta: 0,
  id: "v3-1699012345678-5",
  navigationType: "navigate",
  entries: [PerformanceEventTiming]
}
```

#### localStorage Storage
```javascript
// After 5 page loads, localStorage contains:
{
  "vitals_TTFB": [
    {"value": 234.5, "rating": "good", "timestamp": 1699012345678, "id": "v3-...", "navigationType": "navigate"},
    {"value": 189.2, "rating": "good", "timestamp": 1699012356789, "id": "v3-...", "navigationType": "navigate"},
    {"value": 312.7, "rating": "good", "timestamp": 1699012367890, "id": "v3-...", "navigationType": "navigate"},
    {"value": 267.3, "rating": "good", "timestamp": 1699012378901, "id": "v3-...", "navigationType": "reload"},
    {"value": 421.8, "rating": "good", "timestamp": 1699012389012, "id": "v3-...", "navigationType": "navigate"}
  ],
  "vitals_FCP": [...],
  "vitals_LCP": [...],
  "vitals_CLS": [...],
  "vitals_INP": [...]
}
```

#### API Request Sent to Server
```http
POST /api/analytics/vitals HTTP/1.1
Host: fly2any.com
Content-Type: application/json

{
  "name": "LCP",
  "value": 1847.8,
  "rating": "good",
  "delta": 1847.8,
  "id": "v3-1699012345678-3",
  "navigationType": "navigate",
  "timestamp": 1699012345678,
  "url": "https://fly2any.com/",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
}
```

---

### Scenario: Flight Search Page (Needs Improvement)

#### Browser Console Output
```
TTFB 452ms (good)
└─ Rating: ✓ GOOD

FCP 1.23s (good)
└─ Rating: ✓ GOOD

LCP 3.2s (needs-improvement)
└─ Main content took 3.2s to load
└─ Rating: ⚠ NEEDS IMPROVEMENT (2.5-4s range)
└─ Recommendation: Optimize images, reduce JS blocking

CLS 0.18 (needs-improvement)
└─ Noticeable layout shifts
└─ Rating: ⚠ NEEDS IMPROVEMENT (0.1-0.25 range)
└─ Recommendation: Reserve space for dynamic content

INP 289ms (needs-improvement)
└─ Interactions feel slightly sluggish
└─ Rating: ⚠ NEEDS IMPROVEMENT (200-500ms range)
└─ Recommendation: Optimize JavaScript execution
```

---

### Scenario: Mobile Device (Poor Performance)

#### Browser Console Output
```
TTFB 1.2s (needs-improvement)
└─ Slow server response on mobile network
└─ Rating: ⚠ NEEDS IMPROVEMENT

FCP 2.8s (needs-improvement)
└─ Rating: ⚠ NEEDS IMPROVEMENT

LCP 4.5s (poor)
└─ Very slow main content loading
└─ Rating: ✗ POOR (> 4s threshold)
└─ URGENT: Optimize for mobile networks

CLS 0.31 (poor)
└─ Significant layout shifts
└─ Rating: ✗ POOR (> 0.25 threshold)
└─ URGENT: Fix layout stability issues

INP 568ms (poor)
└─ Interactions very sluggish
└─ Rating: ✗ POOR (> 500ms threshold)
└─ URGENT: Reduce JavaScript execution time
```

---

## Dashboard Visualization

### Good Performance Example
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Performance Dashboard                            [Auto-Refresh: ON]    │
│  Last updated: 10:45:32 AM                        [Refresh] [Clear]     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│ 🟢 LCP                   │  │ 🟢 INP                   │  │ 🟢 CLS                   │
│ Loading performance      │  │ Interactivity            │  │ Visual stability         │
│                          │  │                          │  │                          │
│ 1.85s                    │  │ 145ms                    │  │ 0.047                    │
│ Current Value            │  │ Current Value            │  │ Current Value            │
│                          │  │                          │  │                          │
│ 1.92s                    │  │ 158ms                    │  │ 0.052                    │
│ Average (24 samples)     │  │ Average (24 samples)     │  │ Average (24 samples)     │
│                          │  │                          │  │                          │
│ Good: ≤ 2.5s            │  │ Good: ≤ 200ms           │  │ Good: ≤ 0.1             │
│ Needs Improvement: 4s    │  │ Needs Improvement: 500ms │  │ Needs Improvement: 0.25  │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ 🟢 FCP                   │  │ 🟢 TTFB                  │
│ Initial render           │  │ Server response          │
│                          │  │                          │
│ 892ms                    │  │ 234ms                    │
│ Current Value            │  │ Current Value            │
│                          │  │                          │
│ 945ms                    │  │ 267ms                    │
│ Average (24 samples)     │  │ Average (24 samples)     │
│                          │  │                          │
│ Good: ≤ 1.8s            │  │ Good: ≤ 800ms           │
│ Needs Improvement: 3s    │  │ Needs Improvement: 1.8s  │
└──────────────────────────┘  └──────────────────────────┘
```

### Mixed Performance Example
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Performance Dashboard                            [Auto-Refresh: ON]    │
│  Last updated: 10:45:32 AM                        [Refresh] [Clear]     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│ 🟡 LCP                   │  │ 🟡 INP                   │  │ 🟢 CLS                   │
│ Loading performance      │  │ Interactivity            │  │ Visual stability         │
│                          │  │                          │  │                          │
│ 3.2s                     │  │ 289ms                    │  │ 0.068                    │
│ Current Value            │  │ Current Value            │  │ Current Value            │
│                          │  │                          │  │                          │
│ 3.1s                     │  │ 312ms                    │  │ 0.072                    │
│ Average (18 samples)     │  │ Average (18 samples)     │  │ Average (18 samples)     │
│                          │  │                          │  │                          │
│ ⚠ NEEDS IMPROVEMENT      │  │ ⚠ NEEDS IMPROVEMENT      │  │ ✓ GOOD                   │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ 🟢 FCP                   │  │ 🟢 TTFB                  │
│ Initial render           │  │ Server response          │
│                          │  │                          │
│ 1.5s                     │  │ 452ms                    │
│ Current Value            │  │ Current Value            │
│                          │  │                          │
│ 1.6s                     │  │ 489ms                    │
│ Average (18 samples)     │  │ Average (18 samples)     │
│                          │  │                          │
│ ✓ GOOD                   │  │ ✓ GOOD                   │
└──────────────────────────┘  └──────────────────────────┘
```

---

## Historical Trends (Sparkline Charts)

### Visual Representation
```
LCP Trend (Last 20 measurements)
▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆
└─ Each bar represents one measurement
└─ Height = value relative to min/max
└─ Color = rating (green/yellow/red)

Good Performance Trend:
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢

Mixed Performance Trend:
🟢🟢🟡🟢🟢🟢🟡🟡🟢🟢🟡🟢🟢🟢🟢🟡🟢🟢🟢🟢

Degrading Performance Trend:
🟢🟢🟢🟢🟢🟡🟡🟡🟡🔴🔴🟡🟡🔴🔴🔴🟡🟡🟡🔴
```

---

## Real-Time Event Stream

### Custom Events Fired
```javascript
// Listen to real-time metrics
window.addEventListener('web-vital', (event) => {
  console.log('New metric:', event.detail);
});

// Example events:
Event: web-vital
  detail: {
    name: "TTFB",
    value: 234.5,
    rating: "good",
    delta: 234.5,
    id: "v3-1699012345678-1",
    navigationType: "navigate"
  }

Event: web-vital
  detail: {
    name: "FCP",
    value: 892.3,
    rating: "good",
    delta: 892.3,
    id: "v3-1699012345678-2",
    navigationType: "navigate"
  }

Event: web-vital
  detail: {
    name: "LCP",
    value: 1847.8,
    rating: "good",
    delta: 1847.8,
    id: "v3-1699012345678-3",
    navigationType: "navigate"
  }
```

---

## Statistical Summary Example

After collecting 100 measurements:

```javascript
{
  "LCP": {
    "count": 100,
    "average": 1956.3,
    "median": 1842.0,
    "p75": 2234.5,
    "p90": 2678.2,
    "p95": 3012.8,
    "min": 1234.5,
    "max": 3456.7,
    "good": 78,      // 78% good
    "needsImprovement": 18,  // 18% needs improvement
    "poor": 4        // 4% poor
  },
  "INP": {
    "count": 100,
    "average": 167.8,
    "median": 156.0,
    "p75": 189.5,
    "p90": 234.2,
    "p95": 278.6,
    "min": 45.2,
    "max": 456.3,
    "good": 85,
    "needsImprovement": 12,
    "poor": 3
  },
  // ... other metrics
}
```

---

## Performance Improvement Example

### Before Optimization
```
LCP: 4.2s (poor) 🔴
INP: 456ms (needs-improvement) 🟡
CLS: 0.28 (poor) 🔴
FCP: 2.1s (needs-improvement) 🟡
TTFB: 1.2s (needs-improvement) 🟡
```

### After Image Optimization
```
LCP: 2.1s (good) 🟢  ← Improved by 50%
INP: 456ms (needs-improvement) 🟡
CLS: 0.28 (poor) 🔴
FCP: 1.4s (good) 🟢  ← Improved by 33%
TTFB: 1.2s (needs-improvement) 🟡
```

### After Layout Fixes
```
LCP: 2.1s (good) 🟢
INP: 456ms (needs-improvement) 🟡
CLS: 0.08 (good) 🟢  ← Improved by 71%
FCP: 1.4s (good) 🟢
TTFB: 1.2s (needs-improvement) 🟡
```

### After JavaScript Optimization
```
LCP: 2.1s (good) 🟢
INP: 178ms (good) 🟢  ← Improved by 61%
CLS: 0.08 (good) 🟢
FCP: 1.4s (good) 🟢
TTFB: 1.2s (needs-improvement) 🟡
```

### After Server/CDN Optimization
```
LCP: 1.8s (good) 🟢  ← Further improved
INP: 178ms (good) 🟢
CLS: 0.08 (good) 🟢
FCP: 1.1s (good) 🟢  ← Further improved
TTFB: 456ms (good) 🟢  ← Improved by 62%
```

**Result**: All metrics now in "good" range! 🎉

---

## Integration Examples

### Google Analytics Event
```javascript
// Automatically sent when GA is configured
gtag('event', 'LCP', {
  event_category: 'Web Vitals',
  value: 1847,  // rounded milliseconds
  event_label: 'v3-1699012345678-3',
  non_interaction: true
});
```

### Sentry Performance Trace
```javascript
// Automatically sent when Sentry is configured
Sentry.captureMessage('Web Vital: LCP', {
  level: 'info',
  tags: {
    web_vital: 'LCP',
    rating: 'good'
  },
  extra: {
    value: 1847.8,
    delta: 1847.8,
    id: 'v3-1699012345678-3',
    navigationType: 'navigate'
  }
});
```

---

## Testing Data

### Simulate Poor Performance (for testing)
```javascript
// In browser console:

// 1. Simulate slow LCP
const img = document.createElement('img');
img.src = 'https://httpstat.us/200?sleep=5000';
img.style.width = '100vw';
document.body.prepend(img);

// 2. Simulate high CLS
setTimeout(() => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.background = 'red';
  document.body.prepend(div);
}, 1000);

// 3. Simulate slow INP
document.addEventListener('click', () => {
  const start = Date.now();
  while (Date.now() - start < 600) {
    // Block main thread for 600ms
  }
});
```

---

**Document Purpose**: Provide concrete examples of Web Vitals data for testing, debugging, and understanding the performance monitoring system.

**Last Updated**: November 3, 2024
