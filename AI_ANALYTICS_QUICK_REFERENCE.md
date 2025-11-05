# AI Analytics - Quick Reference Guide

## 🚀 Quick Start

### View Dashboard
```
http://localhost:3000/admin/ai-analytics
```

### Demo Mode (No Database)
Works out of the box! Events logged to console, dashboard shows demo data.

### Production Setup
```bash
psql $POSTGRES_URL -f docs/ai_analytics_schema.sql
```

## 📊 Tracking Events

### Chat Interactions
```typescript
analytics.trackChatOpen();
analytics.trackChatClose();
analytics.trackMessage('user');
analytics.trackMessage('assistant', { team: 'flight-operations', name: 'James' });
analytics.trackConsultantRouted({ team: 'customer-service', name: 'Lisa' });
```

### Flight Searches
```typescript
analytics.trackFlightSearch({
  searchQuery: 'NYC to Dubai on Nov 15',
  origin: 'JFK',
  destination: 'DXB',
  resultsCount: 25,
  searchDuration: 2347, // ms
});

analytics.trackFlightSelected('flight_abc123', 450.00);
```

### Auth Prompts
```typescript
// When showing
analytics.trackAuthPromptShown('search_performed');

// When clicked
analytics.trackAuthPromptClicked('signup'); // 'login' or 'dismiss'
```

### Conversions
```typescript
analytics.trackConversion('signup');
analytics.trackConversion('login');
analytics.trackConversion('booking', 542.34); // with value
```

### Session Engagement
```typescript
analytics.trackSessionEngagement({
  duration: 247,    // seconds
  messageCount: 12,
  score: 7.8,       // 0-10
});
```

## 🔧 Hook Setup

```typescript
import { useAIAnalytics } from '@/lib/hooks/useAIAnalytics';

const analytics = useAIAnalytics({
  sessionId: userSession.sessionId,
  userId: user?.id,              // Optional
  isAuthenticated: !!user,
  batchSize: 10,                 // Events per batch
  flushInterval: 5000,           // 5 seconds
  enabled: true,                 // Opt-out support
});
```

## 📈 Dashboard Metrics

### Overview
- Total Conversations
- Avg Messages per Chat
- Total Flight Searches
- Total Conversions

### Consultant Performance
- Message count by consultant
- Percentage distribution
- Visual breakdown

### Popular Routes
- Top 10 flight routes
- Search counts

### Auth Effectiveness
- Prompts shown vs clicked
- CTR by stage
- Overall performance

### Conversions
- Signups, logins, bookings
- Conversion rate
- Average value

### Engagement
- Avg session duration
- Avg engagement score
- Peak hours

### Top Questions
- Most common queries

## 🔍 Sample Queries

### Total Conversations (7 days)
```sql
SELECT COUNT(DISTINCT session_id)
FROM ai_analytics_events
WHERE timestamp >= NOW() - INTERVAL '7 days';
```

### Consultant Performance
```sql
SELECT
  consultant_team,
  consultant_name,
  COUNT(*) as messages,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM ai_analytics_events
WHERE event_type = 'consultant_routed'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY consultant_team, consultant_name
ORDER BY messages DESC;
```

### Auth CTR by Stage
```sql
SELECT
  auth_prompt_stage,
  COUNT(*) FILTER (WHERE event_type = 'auth_prompt_shown') as shown,
  COUNT(*) FILTER (WHERE event_type = 'auth_prompt_clicked') as clicked,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'auth_prompt_clicked') * 100.0 /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'auth_prompt_shown'), 0),
    1
  ) as ctr
FROM ai_analytics_events
WHERE auth_prompt_stage IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY auth_prompt_stage;
```

### Popular Routes
```sql
SELECT
  CONCAT(origin, '-', destination) as route,
  COUNT(*) as searches
FROM ai_analytics_events
WHERE event_type = 'flight_search_performed'
  AND timestamp >= NOW() - INTERVAL '7 days'
  AND origin IS NOT NULL
GROUP BY origin, destination
ORDER BY searches DESC
LIMIT 10;
```

## 🎯 Event Types

| Event Type | Description |
|------------|-------------|
| `chat_opened` | AI assistant opened |
| `chat_closed` | AI assistant closed |
| `message_sent` | User/assistant message |
| `consultant_routed` | Consultant assigned |
| `flight_search_performed` | Flight search executed |
| `auth_prompt_shown` | Auth prompt displayed |
| `auth_prompt_clicked` | User clicked prompt |
| `conversion_signup` | User signed up |
| `conversion_login` | User logged in |
| `conversion_booking` | Booking completed |
| `session_engaged` | Session metrics |
| `flight_selected` | Flight selected |

## 🔒 Privacy Features

### ✅ Tracked (Safe)
- Session IDs (anonymized)
- Event timestamps
- Aggregate metrics
- Browser fingerprints (hashed)

### ❌ NOT Tracked (Compliant)
- Names or personal info
- Email addresses
- IP addresses (unhashed)
- Precise location data

### Opt-Out
```typescript
const analytics = useAIAnalytics({
  sessionId,
  enabled: false, // Disable tracking
});
```

## ⚡ Performance Tips

### Optimal Batching
```typescript
{
  batchSize: 10,      // 10 events per batch
  flushInterval: 5000 // Send every 5 seconds
}
```

### High Traffic
```typescript
{
  batchSize: 20,      // Larger batches
  flushInterval: 10000 // Less frequent
}
```

### Real-Time
```typescript
{
  batchSize: 1,       // Send immediately
  flushInterval: 0    // No buffering
}
```

## 🐛 Troubleshooting

### Events not appearing?
1. Check database: `isDatabaseAvailable()`
2. Check browser network tab
3. Check API logs
4. Verify table: `SELECT 1 FROM ai_analytics_events`

### Demo mode always on?
1. Set `POSTGRES_URL` in `.env.local`
2. Avoid "placeholder" in URL
3. Restart dev server

### Slow dashboard?
1. Database indexes exist?
2. Enable query caching
3. Use materialized views
4. Consider Redis

## 📚 Documentation

- **Complete Guide:** `docs/AI_ANALYTICS_SETUP.md`
- **Database Schema:** `docs/ai_analytics_schema.sql`
- **Implementation Summary:** `AI_ANALYTICS_IMPLEMENTATION_SUMMARY.md`

## 🔗 API Endpoints

### Track Events
```http
POST /api/ai/analytics
Content-Type: application/json

{
  "events": [
    {
      "eventType": "chat_opened",
      "sessionId": "session_123",
      "timestamp": "2025-01-01T12:00:00Z",
      "isAuthenticated": false,
      "metadata": {}
    }
  ]
}
```

### Get Analytics
```http
GET /api/ai/analytics?period=7d

Response:
{
  "success": true,
  "period": "7d",
  "demoMode": false,
  "stats": { ... }
}
```

## 📦 Files Created

```
app/api/ai/analytics/route.ts
lib/hooks/useAIAnalytics.ts
components/admin/AIAnalyticsDashboard.tsx
app/admin/ai-analytics/page.tsx
docs/AI_ANALYTICS_SETUP.md
docs/ai_analytics_schema.sql
AI_ANALYTICS_IMPLEMENTATION_SUMMARY.md
AI_ANALYTICS_QUICK_REFERENCE.md (this file)
```

## ✨ Key Features

- ✅ 12 event types tracked
- ✅ Privacy-compliant (GDPR/CCPA)
- ✅ Real-time dashboard
- ✅ Auto-batching
- ✅ Demo mode
- ✅ Production-ready
- ✅ Zero breaking changes

---

**Need Help?** See `docs/AI_ANALYTICS_SETUP.md` for detailed guide.
