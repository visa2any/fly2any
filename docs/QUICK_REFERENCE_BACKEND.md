# Backend Integration - Quick Reference Guide

## 🚀 Quick Start

### Flight Type Detection
```typescript
import { detectFlightTypeSimple, detectFlightType } from '@/lib/ai/flight-type-detector';

// Simple usage
const type = detectFlightTypeSimple('JFK', 'LAX'); // 'domestic'

// Detailed usage
const result = detectFlightType('JFK', 'LHR');
console.log(result.requiresPassport); // true
console.log(result.reasoning); // Full explanation
```

### Session Management
```typescript
import { createOrRetrieveSession, incrementSearchCount } from '@/lib/ai/auth-strategy';

// Create or retrieve session
const session = await createOrRetrieveSession('192.168.1.1');

// Track activity
await incrementSearchCount(session.sessionId);
await incrementConversationCount(session.sessionId);
await incrementBookingAttempts(session.sessionId);
```

### Booking Modifications
```typescript
import {
  getCancellationQuote,
  cancelBooking,
  requestBookingChange
} from '@/lib/booking/modification-handler';

// Get cancellation quote
const quote = await getCancellationQuote('FLY2A-ABC123');
console.log(`Refund: $${quote.refundAmount}`);

// Cancel booking
const result = await cancelBooking('FLY2A-ABC123', 'Travel plans changed');

// Request date change
const changeOffer = await requestBookingChange({
  orderId: 'booking-123',
  bookingReference: 'FLY2A-ABC123',
  changeType: 'date',
  requestedChanges: {
    newDepartureDate: '2025-12-15'
  }
});
```

### Conversation Context
```typescript
import { ConversationContext } from '@/lib/ai/conversation-context';

const context = new ConversationContext();

// Track flight search
context.addFlightSearch({
  origin: 'JFK',
  destination: 'LAX',
  flightType: 'domestic',
  passengers: 2,
  timestamp: Date.now()
});

// Get preferences
const prefs = context.getUserPreferences();
console.log(prefs.preferredOrigins); // ['JFK', 'LAX']

// Get summary
const summary = context.getSummary();
console.log(summary.flightSearchCount); // 5
```

## 📁 File Locations

| Component | Path |
|-----------|------|
| Flight Type Detector | `/home/user/fly2any/lib/ai/flight-type-detector.ts` |
| Auth Strategy (DB) | `/home/user/fly2any/lib/ai/auth-strategy.ts` |
| Modification Handler | `/home/user/fly2any/lib/booking/modification-handler.ts` |
| Conversation Context | `/home/user/fly2any/lib/ai/conversation-context.ts` |
| Prisma Schema | `/home/user/fly2any/prisma/schema.prisma` |
| AI Assistant (Updated) | `/home/user/fly2any/components/ai/AITravelAssistant.tsx` |

## 🗄️ Database Schema

### UserSessionTracking
```sql
CREATE TABLE user_session_tracking (
  id                  TEXT PRIMARY KEY,
  session_id          TEXT UNIQUE NOT NULL,
  ip_address          TEXT NOT NULL,
  ip_hash             TEXT,
  country             TEXT,
  region              TEXT,
  timezone            TEXT,
  is_authenticated    BOOLEAN DEFAULT false,
  user_id             TEXT,
  email               TEXT,
  name                TEXT,
  conversation_count  INTEGER DEFAULT 0,
  search_count        INTEGER DEFAULT 0,
  booking_attempts    INTEGER DEFAULT 0,
  last_activity       TIMESTAMP DEFAULT NOW(),
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW(),
  expires_at          TIMESTAMP NOT NULL
);
```

## 🔧 Common Patterns

### Pattern 1: Track User Journey
```typescript
// 1. Create/retrieve session
const session = await createOrRetrieveSession(ipAddress);

// 2. Track search
await incrementSearchCount(session.sessionId);
context.addFlightSearch({
  origin, destination, flightType, passengers, timestamp: Date.now()
});

// 3. Track booking attempt
await incrementBookingAttempts(session.sessionId);

// 4. Upgrade on sign-in
await upgradeToAuthenticatedUser(session.sessionId, userId, email, name);
```

### Pattern 2: Handle Booking Cancellation
```typescript
// 1. Get quote
const quote = await getCancellationQuote(bookingRef);

// 2. Show user the refund amount
console.log(`You will receive: $${quote.refundAmount}`);
console.log(`Cancellation fee: $${quote.cancellationFee}`);

// 3. Confirm cancellation
const result = await cancelBooking(bookingRef, reason);

// 4. Track in conversation
context.addBookingModification({
  bookingReference: bookingRef,
  modificationType: 'cancellation',
  requestedAt: Date.now(),
  status: result.success ? 'confirmed' : 'failed'
});
```

### Pattern 3: Detect Flight Requirements
```typescript
// Get detailed flight info
const flightInfo = detectFlightType(origin, destination);

// Check requirements
if (flightInfo.requiresPassport) {
  console.log('Passport required');
  showPassportFields();
}

if (flightInfo.isSchengen) {
  console.log('Travel within Schengen Area - passport or national ID required');
}

if (flightInfo.territoryInfo) {
  console.log(flightInfo.territoryInfo.specialRules);
}
```

## ⚠️ Important Notes

### Privacy & GDPR
- IP addresses are **always hashed** before storage
- Sessions expire after **24 hours**
- Use `isPrismaAvailable()` to check if database is configured

### Error Handling
All functions handle errors gracefully:
```typescript
// Database not configured? No problem!
const session = await createOrRetrieveSession(ip);
// Will log warning but continue

// IP geolocation fails? No problem!
const country = await getCountryFromIP(ip);
// Returns undefined, continues without geo data

// Unknown airport? Safe default!
const type = detectFlightTypeSimple('XXX', 'YYY');
// Returns 'international' for safety
```

### Rate Limits
- **ipapi.co**: 1000 requests/day (free tier)
- **Timeout**: 3 seconds max
- **Fallback**: Skip geolocation on failure

## 🧪 Testing Examples

```typescript
// Test flight type detection
describe('Flight Type Detection', () => {
  it('detects domestic US flights', () => {
    expect(detectFlightTypeSimple('JFK', 'LAX')).toBe('domestic');
  });

  it('detects US territory as domestic', () => {
    expect(detectFlightTypeSimple('JFK', 'SJU')).toBe('domestic');
  });

  it('detects international flights', () => {
    expect(detectFlightTypeSimple('JFK', 'LHR')).toBe('international');
  });
});

// Test session management
describe('Session Management', () => {
  it('creates new session', async () => {
    const session = await createOrRetrieveSession('192.168.1.1');
    expect(session.sessionId).toBeDefined();
  });

  it('retrieves existing session', async () => {
    const session1 = await createOrRetrieveSession('192.168.1.1');
    const session2 = await createOrRetrieveSession('192.168.1.1');
    expect(session1.sessionId).toBe(session2.sessionId);
  });
});

// Test refund calculations
describe('Refund Calculations', () => {
  it('calculates refund for flex fare', () => {
    const booking = createMockBooking({ fareTier: 'flex' });
    const refund = calculateRefund(booking);
    expect(refund.refundPercentage).toBe(80);
  });

  it('handles non-refundable bookings', () => {
    const booking = createMockBooking({ fareTier: 'basic' });
    const refund = calculateRefund(booking);
    expect(refund.refundableAmount).toBe(0);
  });
});
```

## 🔗 Integration Checklist

Before deploying:
- [ ] Run `npx prisma migrate dev --name add_user_session_tracking`
- [ ] Run `npx prisma generate`
- [ ] Test IP geolocation in staging
- [ ] Verify airport database loads correctly
- [ ] Test flight type detection with real airport codes
- [ ] Monitor session creation rate
- [ ] Set up alerts for API failures
- [ ] Verify refund calculations
- [ ] Test conversation context persistence

## 📞 Support

For issues or questions:
1. Check `/home/user/fly2any/docs/BACKEND_INTEGRATION_COMPLETE.md`
2. Review inline code documentation
3. Check console logs for error messages
4. Verify database connection and migrations

## 🎯 Key Metrics to Monitor

- Session creation rate
- IP geolocation success rate
- Flight type detection accuracy
- Cancellation request volume
- Refund processing time
- Database query performance
- API timeout frequency

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Status:** Production Ready ✅
