# AI Analytics & Conversion Tracking System

## Overview

Comprehensive analytics and conversion tracking system for the AI Travel Assistant, providing real-time insights into user behavior, consultant performance, and conversion metrics.

## Features

### 1. Event Tracking
- Chat opened/closed
- Messages sent (user + assistant)
- Consultant routing
- Flight searches performed
- Auth prompts shown/clicked
- Conversions (signups, bookings)
- Session duration
- User engagement scoring

### 2. Privacy-Compliant Design
- No PII tracked
- Aggregate data only
- Anonymized browser fingerprints
- GDPR/CCPA compliant
- Easy opt-out capability
- Data retention policies

### 3. Real-Time Dashboard
- Total conversations & messages
- Messages per conversation (avg)
- Most active consultants
- Flight search conversion rate
- Auth prompt effectiveness by stage
- Top user questions
- Peak usage times
- Engagement metrics

## Components

### API Endpoint
**File:** `app/api/ai/analytics/route.ts`

**POST /api/ai/analytics**
- Tracks analytics events in batches
- Validates event schema
- Stores in database or logs to console (demo mode)

**GET /api/ai/analytics?period=7d**
- Retrieves analytics statistics
- Supports 7d, 30d, 90d periods
- Returns demo data if database not configured

### Client Hook
**File:** `lib/hooks/useAIAnalytics.ts`

```typescript
const analytics = useAIAnalytics({
  sessionId: 'session_123',
  userId: user?.id,
  isAuthenticated: !!user,
});

// Track events
analytics.trackChatOpen();
analytics.trackMessage('user');
analytics.trackFlightSearch({ searchQuery: 'NYC to LAX', ... });
analytics.trackAuthPromptShown('search_performed');
analytics.trackConversion('signup');
```

**Features:**
- Automatic event batching
- Configurable batch size and flush interval
- Engagement score calculation
- Privacy-safe tracking

### Dashboard Component
**File:** `components/admin/AIAnalyticsDashboard.tsx`

**Displays:**
- Key metrics (conversations, searches, conversions)
- Consultant performance breakdown
- Popular flight routes
- Auth prompt effectiveness by stage
- Engagement metrics
- Peak usage hours
- Top user questions

**Access:** `/admin/ai-analytics`

## Integration

### 1. AITravelAssistant.tsx
```typescript
import { useAIAnalytics } from '@/lib/hooks/useAIAnalytics';

const analytics = useAIAnalytics({
  sessionId: userSession.sessionId,
  userId: undefined,
  isAuthenticated: userSession.isAuthenticated,
});

// Track chat open/close
useEffect(() => {
  if (isOpen) {
    analytics.trackChatOpen();
  } else if (messages.length > 0) {
    analytics.trackChatClose();
  }
}, [isOpen]);

// Track messages
analytics.trackMessage('user');
analytics.trackMessage('assistant', { team, name });

// Track consultant routing
analytics.trackConsultantRouted({ team, name });

// Track flight search
analytics.trackFlightSearch({
  searchQuery,
  origin,
  destination,
  resultsCount,
  searchDuration,
});

// Track auth prompts
analytics.trackAuthPromptShown(stage);
analytics.trackAuthPromptClicked(action);
```

### 2. FlightResultCard.tsx
```typescript
<FlightResultCard
  flight={flight}
  onSelect={handleFlightSelect}
  onFlightSelected={(flightId, flightPrice) => {
    analytics.trackFlightSelected(flightId, flightPrice);
  }}
/>
```

### 3. AuthModals.tsx
```typescript
// Track successful auth
const trackAuthConversion = async (type: 'signup' | 'login') => {
  await fetch('/api/ai/analytics', {
    method: 'POST',
    body: JSON.stringify({
      events: [{
        eventType: type === 'signup' ? 'conversion_signup' : 'conversion_login',
        sessionId: `auth_${Date.now()}`,
        timestamp: new Date().toISOString(),
        isAuthenticated: false,
        metadata: { conversionType: type },
      }],
    }),
  });
};
```

## Database Schema

### Table: `ai_analytics_events`

```sql
CREATE TABLE ai_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event identification
  event_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User context (privacy-compliant)
  user_id UUID,
  is_authenticated BOOLEAN NOT NULL DEFAULT false,
  user_fingerprint VARCHAR(32), -- Anonymized

  -- Message tracking
  message_role VARCHAR(20),
  message_length INTEGER,
  consultant_team VARCHAR(50),
  consultant_name VARCHAR(100),

  -- Flight search
  flight_search_query TEXT,
  origin VARCHAR(10),
  destination VARCHAR(10),
  results_count INTEGER,
  search_duration INTEGER, -- milliseconds

  -- Auth prompts
  auth_prompt_stage VARCHAR(50),
  auth_prompt_action VARCHAR(20),

  -- Conversions
  conversion_type VARCHAR(20),
  conversion_value DECIMAL(10, 2),

  -- Session engagement
  session_duration INTEGER, -- seconds
  message_count INTEGER,
  engagement_score DECIMAL(3, 1),

  -- Flight selection
  flight_id VARCHAR(100),
  flight_price DECIMAL(10, 2),

  -- Geo context (aggregate only)
  country VARCHAR(2),
  timezone VARCHAR(50),

  -- Indexes
  INDEX idx_event_type (event_type),
  INDEX idx_session_id (session_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_consultant (consultant_team, consultant_name),
  INDEX idx_conversion (conversion_type, timestamp)
);
```

### Create Table Script

```sql
-- Run this in your PostgreSQL database
CREATE TABLE IF NOT EXISTS ai_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID,
  is_authenticated BOOLEAN NOT NULL DEFAULT false,
  user_fingerprint VARCHAR(32),
  message_role VARCHAR(20),
  message_length INTEGER,
  consultant_team VARCHAR(50),
  consultant_name VARCHAR(100),
  flight_search_query TEXT,
  origin VARCHAR(10),
  destination VARCHAR(10),
  results_count INTEGER,
  search_duration INTEGER,
  auth_prompt_stage VARCHAR(50),
  auth_prompt_action VARCHAR(20),
  conversion_type VARCHAR(20),
  conversion_value DECIMAL(10, 2),
  session_duration INTEGER,
  message_count INTEGER,
  engagement_score DECIMAL(3, 1),
  flight_id VARCHAR(100),
  flight_price DECIMAL(10, 2),
  country VARCHAR(2),
  timezone VARCHAR(50)
);

CREATE INDEX idx_ai_analytics_event_type ON ai_analytics_events(event_type);
CREATE INDEX idx_ai_analytics_session_id ON ai_analytics_events(session_id);
CREATE INDEX idx_ai_analytics_timestamp ON ai_analytics_events(timestamp);
CREATE INDEX idx_ai_analytics_consultant ON ai_analytics_events(consultant_team, consultant_name);
CREATE INDEX idx_ai_analytics_conversion ON ai_analytics_events(conversion_type, timestamp);
```

## Usage Guide

### 1. Setup Database (Production)
```bash
# Connect to your PostgreSQL database
psql $POSTGRES_URL

# Run the schema creation script
\i docs/ai_analytics_schema.sql
```

### 2. Demo Mode (No Database)
The system automatically falls back to demo mode if no database is configured:
- Events are logged to console in development
- API returns realistic demo data
- No data persistence

### 3. Access Dashboard
Navigate to: `/admin/ai-analytics`

**View metrics for:**
- Last 7 days
- Last 30 days
- Last 90 days

### 4. Tracking Events

**Chat Interactions:**
```typescript
analytics.trackChatOpen();
analytics.trackChatClose();
analytics.trackMessage('user');
analytics.trackMessage('assistant', { team, name });
```

**Flight Searches:**
```typescript
analytics.trackFlightSearch({
  searchQuery: 'NYC to Dubai on Nov 15',
  origin: 'JFK',
  destination: 'DXB',
  resultsCount: 25,
  searchDuration: 2347,
});
```

**Auth Prompts:**
```typescript
// When showing prompt
analytics.trackAuthPromptShown('search_performed');

// When user clicks
analytics.trackAuthPromptClicked('signup'); // or 'login' or 'dismiss'
```

**Conversions:**
```typescript
analytics.trackConversion('signup');
analytics.trackConversion('login');
analytics.trackConversion('booking', 542.34); // with value
```

**Flight Selection:**
```typescript
analytics.trackFlightSelected('flight_123', 450.00);
```

## Privacy & Compliance

### Data Collection
- ✅ Session IDs (anonymized)
- ✅ Event timestamps
- ✅ Aggregate metrics
- ✅ Browser fingerprints (hashed)
- ❌ Names or personal info
- ❌ Email addresses
- ❌ IP addresses (unhashed)
- ❌ Precise location data

### User Control
```typescript
// Disable tracking
const analytics = useAIAnalytics({
  sessionId,
  userId,
  isAuthenticated,
  enabled: false, // Opt-out
});
```

### Data Retention
Configure automatic cleanup:
```sql
-- Delete events older than 90 days
DELETE FROM ai_analytics_events
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Create cron job (optional)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-old-analytics',
  '0 2 * * *', -- 2 AM daily
  'DELETE FROM ai_analytics_events WHERE timestamp < NOW() - INTERVAL ''90 days'''
);
```

## Performance Optimization

### Event Batching
```typescript
const analytics = useAIAnalytics({
  sessionId,
  userId,
  isAuthenticated,
  batchSize: 10, // Events per batch
  flushInterval: 5000, // 5 seconds
});
```

### Database Indexes
Already created in schema for:
- Event type lookups
- Session queries
- Time-based filtering
- Consultant performance
- Conversion tracking

### Caching
Dashboard data is cached client-side:
- Auto-refresh every 5 minutes
- Manual refresh button
- React Query integration (optional)

## Metrics Explained

### Engagement Score (0-10)
Calculated based on:
- **Message count** (0-5 points): More messages = higher engagement
- **Session duration** (0-3 points): Optimal 2-5 minutes
- **Interaction intensity** (0-2 points): Messages per minute

### Conversion Rate
```
Conversion Rate = (Total Conversions / Total Conversations) × 100
```

### Auth Prompt CTR
```
Click-Through Rate = (Prompts Clicked / Prompts Shown) × 100
```

### Flight Search Conversion
```
Search Conversion = (Bookings / Flight Searches) × 100
```

## Troubleshooting

### Events not showing in dashboard
1. Check database connection: `isDatabaseAvailable()`
2. Verify events are being sent: Check browser DevTools Network tab
3. Check API logs: Look for errors in console
4. Verify table exists: `SELECT * FROM ai_analytics_events LIMIT 1`

### Demo mode always active
1. Ensure `POSTGRES_URL` is set in `.env.local`
2. Check database is not using placeholder values
3. Restart Next.js dev server

### Performance issues
1. Increase batch size: `batchSize: 20`
2. Increase flush interval: `flushInterval: 10000`
3. Add database indexes (already in schema)
4. Consider Redis for high-traffic sites

## Future Enhancements

### Planned Features
- [ ] A/B test integration
- [ ] Funnel analysis
- [ ] Cohort analysis
- [ ] Export to CSV/Excel
- [ ] Email reports
- [ ] Alerts & notifications
- [ ] User satisfaction surveys
- [ ] Response time tracking
- [ ] ML-powered insights

### Integration Ideas
- Google Analytics 4
- Mixpanel
- Amplitude
- Segment
- PostHog
- Plausible

## API Reference

### Track Events
```typescript
POST /api/ai/analytics
Content-Type: application/json

{
  "events": [
    {
      "eventType": "chat_opened",
      "sessionId": "session_123",
      "timestamp": "2025-01-01T12:00:00Z",
      "isAuthenticated": false,
      "metadata": { ... }
    }
  ]
}

Response:
{
  "success": true,
  "tracked": 1,
  "skipped": 0
}
```

### Get Analytics
```typescript
GET /api/ai/analytics?period=7d

Response:
{
  "success": true,
  "period": "7d",
  "demoMode": false,
  "stats": {
    "totalConversations": 1247,
    "totalMessages": 5632,
    "avgMessagesPerConversation": 4.5,
    "consultantBreakdown": [...],
    "totalFlightSearches": 847,
    "flightSearchConversionRate": 12.5,
    ...
  }
}
```

## License

Part of the Fly2Any platform. Internal use only.

## Support

For questions or issues:
- Check this documentation
- Review example integrations
- Contact development team
