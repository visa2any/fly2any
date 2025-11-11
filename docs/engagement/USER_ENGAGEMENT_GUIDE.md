# User Engagement & Experience Guide

## Overview

This document provides comprehensive information about the User Engagement & Experience features built for Fly2Any. These features are designed to increase user engagement, satisfaction, and conversion rates.

**Team:** Team 4 - User Engagement & Experience
**Status:** ✅ Complete
**Last Updated:** 2025-11-10

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Wishlist System](#wishlist-system)
3. [Deals & Promotions](#deals--promotions)
4. [Travel Inspiration](#travel-inspiration)
5. [Travel Guides](#travel-guides)
6. [FAQ System](#faq-system)
7. [Personalization Features](#personalization-features)
8. [Analytics & Tracking](#analytics--tracking)
9. [API Documentation](#api-documentation)
10. [Component Library](#component-library)
11. [Integration Guide](#integration-guide)
12. [Future Enhancements](#future-enhancements)

---

## Features Overview

### Core Features Built

1. **Trip Wishlist/Planning** - Save and manage favorite flights
2. **Travel Deals Page** - Browse and filter hot deals
3. **Travel Inspiration** - Explore destinations worldwide
4. **Travel Guide** - Essential travel information
5. **FAQ System** - Comprehensive help section
6. **Recently Viewed** - Quick access to viewed flights
7. **Recommended Flights** - Personalized suggestions
8. **Engagement Analytics** - Track user behavior

### Key Metrics

- **Engagement Rate:** Track wishlist adds, deal clicks, FAQ views
- **Time on Site:** Monitor session duration
- **Return Visits:** Measure user retention
- **Conversion Funnel:** Track from exploration to booking

---

## Wishlist System

### Features

- ❤️ Save flights to wishlist
- 📝 Add personal notes to saved flights
- 💰 Set target prices for price drop alerts
- 🔔 Receive notifications when prices drop
- 🔗 Share wishlist (coming soon)
- ✈️ Quick book from wishlist

### Database Schema

```prisma
model WishlistItem {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  flightData      Json     // Complete flight information
  notes           String?  @db.Text
  targetPrice     Float?
  notifyOnDrop    Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([userId, createdAt])
  @@map("wishlist_items")
}
```

### API Endpoints

#### GET /api/wishlist
Get all wishlist items for authenticated user.

**Response:**
```json
{
  "success": true,
  "items": [...],
  "count": 5
}
```

#### POST /api/wishlist
Add item to wishlist.

**Request:**
```json
{
  "flightData": {
    "id": "flight-123",
    "origin": "LAX",
    "destination": "JFK",
    "departureDate": "2025-06-15",
    "price": 299,
    "currency": "USD",
    "airline": "Delta"
  },
  "notes": "Summer vacation trip",
  "targetPrice": 250,
  "notifyOnDrop": true
}
```

#### DELETE /api/wishlist?flightId=xxx
Remove item from wishlist by flight ID.

#### PATCH /api/wishlist/[id]
Update wishlist item notes or target price.

### Components

**Location:** `C:\Users\Power\fly2any-fresh\components\`

- `search/AddToWishlistButton.tsx` - Heart icon button to add/remove
- `wishlist/WishlistCard.tsx` - Display wishlist item with controls

### Page

**Location:** `C:\Users\Power\fly2any-fresh\app\account\wishlist\page.tsx`

**Features:**
- View all saved flights
- Sort by date, price, or destination
- Price drop alerts section
- Edit notes and target prices
- Quick book functionality
- Empty state guidance

---

## Deals & Promotions

### Features

- ⚡ Flash sales with countdown timers
- 🔥 Last-minute deals
- 🌸 Seasonal promotions
- ⭐ Featured destinations
- 💯 Deal score calculation
- 📊 Filter by price, destination, type
- 🔔 Subscribe to deal alerts

### Deal Types

1. **Flash Sale** - Limited time offers (24-48 hours)
2. **Last Minute** - Travel within 14 days
3. **Seasonal** - Best for specific seasons
4. **Featured** - Curated premium deals

### Deal Score Calculation

```javascript
dealScore = (
  savingsPercent * 0.4 +
  (baseScore - stops * 5) * 0.3 +
  airlineScore * 0.2 +
  urgencyScore * 0.1
)
```

Factors:
- Savings percentage (40% weight)
- Stops/duration (30% weight)
- Airline quality (20% weight)
- Time urgency (10% weight)

### Components

- `deals/DealCard.tsx` - Individual deal display with timer

### Page

**Location:** `C:\Users\Power\fly2any-fresh\app\deals\page.tsx`

**Features:**
- Filter by deal type, price range
- Sort by savings, price, or deal score
- Email alert subscription
- Live countdown timers
- Urgency indicators (seats left)
- How it works section

---

## Travel Inspiration

### Features

- 🌍 12+ popular destinations
- 📸 Beautiful destination images
- 💰 Price starting from
- 🌤️ Best time to visit
- 🎯 Activity recommendations
- 🏷️ Filter by region, budget, travel style
- 🔥 Trending destinations
- 🌸 Seasonal favorites

### Destination Data Structure

```typescript
interface Destination {
  id: string;
  city: string;
  country: string;
  region: string;
  imageUrl: string;
  priceFrom: number;
  currency: string;
  description: string;
  tags: string[];
  trending?: boolean;
  seasonal?: boolean;
  bestMonths?: string[];
  popularActivities?: string[];
}
```

### Filters

- **Region:** Europe, Asia, North America, Middle East, Oceania
- **Budget:** Budget (<$500), Moderate ($500-700), Luxury ($700+)
- **Style:** Romantic, Beach, Culture, Adventure, Urban, etc.

### Components

- `explore/DestinationCard.tsx` - Destination display with quick search

### Page

**Location:** `C:\Users\Power\fly2any-fresh\app\explore\page.tsx`

**Features:**
- Search destinations
- Multiple filters (region, price, style)
- Trending section
- Seasonal picks
- Travel planning tips

---

## Travel Guides

### Features

- 🛂 Visa requirements
- 💱 Currency information
- 🌤️ Best time to visit
- 🛡️ Safety tips
- 🎭 Cultural etiquette
- 🚇 Transportation guides
- ⚠️ Urgency levels (Essential, Important, Good to Know)
- 🔍 Search functionality
- 👍 Helpful voting system

### Content Categories

1. **Visa & Entry** - Requirements, passport validity
2. **Currency** - Exchange rates, payment methods, tipping
3. **Weather** - Best travel seasons, what to pack
4. **Safety** - Emergency numbers, common scams
5. **Culture** - Customs, etiquette, dos and don'ts
6. **Transport** - Getting around, metro systems, apps

### Components

- `guide/TravelTipCard.tsx` - Expandable tip card with voting

### Page

**Location:** `C:\Users\Power\fly2any-fresh\app\travel-guide\page.tsx`

**Features:**
- Destination selector
- Category filtering
- Urgency-based sections
- Expandable details
- Additional resources
- Important disclaimer

---

## FAQ System

### Features

- 📚 20+ common questions
- 🏷️ Categories (Booking, Payment, Changes, Refunds, General)
- 🔍 Full-text search
- 🔗 Copy link to specific FAQ
- 👍 Helpful voting system
- 📊 Track helpfulness
- 🏷️ Tags for quick filtering

### FAQ Categories

1. **Booking** - How to book, multiple passengers, confirmation
2. **Payment** - Methods, security, timing, installments
3. **Changes** - Date changes, name changes, upgrades
4. **Refunds** - Cancellation, refund timing, policies
5. **General** - Baggage, airport arrival, visa, support

### Components

- `faq/FaqItem.tsx` - Accordion-style Q&A with voting

### Page

**Location:** `C:\Users\Power\fly2any-fresh\app\faq\page.tsx`

**Features:**
- Search across questions and answers
- Category filtering
- Popular topics quick access
- Expandable answers
- Vote on helpfulness
- Copy link to specific FAQ
- Support contact section

---

## Personalization Features

### Recently Viewed Flights

**Component:** `components/search/RecentlyViewed.tsx`

**Features:**
- Last 10 viewed flights
- Stored in localStorage
- Displayed on homepage/search
- Quick actions (wishlist, view)
- Remove individual items
- Clear all functionality

**Usage:**
```typescript
import { addToRecentlyViewed } from '@/components/search/RecentlyViewed';

// On flight detail page
addToRecentlyViewed({
  id: flight.id,
  origin: flight.origin,
  destination: flight.destination,
  departureDate: flight.departureDate,
  price: flight.price,
  currency: 'USD',
});
```

### Recommended Flights

**Component:** `components/home/RecommendedFlights.tsx`

**Features:**
- Based on search history
- Based on wishlist items
- Popular destinations fallback
- ML-ready (currently rule-based)
- Personalized deals
- Recommendation reasons

**Recommendation Logic:**
1. Analyze search history (most searched destinations)
2. Check wishlist for similar routes
3. Fallback to popular destinations
4. Add savings badges and reasons

---

## Analytics & Tracking

### Engagement Tracker

**Location:** `C:\Users\Power\fly2any-fresh\lib\analytics\engagement-tracker.ts`

### Tracked Events

```typescript
type EngagementEventType =
  | 'page_view'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'deal_click'
  | 'deal_view'
  | 'destination_explore'
  | 'faq_view'
  | 'faq_helpful'
  | 'faq_not_helpful'
  | 'guide_view'
  | 'search'
  | 'flight_view'
  | 'booking_start'
  | 'booking_complete'
  | 'time_on_site'
  | 'return_visit';
```

### Metrics Tracked

- **Total Events:** All tracked interactions
- **Unique Sessions:** Number of unique user sessions
- **Wishlist Adds:** Total items added to wishlist
- **Deal Clicks:** Total deal engagement
- **FAQ Views:** Help section usage
- **Search Count:** Total searches performed
- **Avg Time on Site:** Average session duration
- **Return Visits:** Users coming back

### Usage

```typescript
import engagementTracker, {
  trackWishlistAdd,
  trackDealClick,
  trackPageView
} from '@/lib/analytics/engagement-tracker';

// Track page view
trackPageView('/deals');

// Track wishlist add
trackWishlistAdd(flightId, destination);

// Track deal click
trackDealClick(dealId, destination, price);

// Get metrics
const metrics = engagementTracker.getMetrics();
console.log('Total events:', metrics.totalEvents);

// Export for backend sync
const data = engagementTracker.exportData();
```

### Storage

- **Events:** localStorage (last 1000 events)
- **Metrics:** localStorage (aggregated)
- **Session:** sessionStorage (current session)

### Ready for Backend Integration

The tracker is designed to easily sync with a backend:

```typescript
// Example backend sync
const data = engagementTracker.exportData();
await fetch('/api/analytics/sync', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

---

## API Documentation

### Wishlist API

#### Authentication
All wishlist endpoints require authentication via NextAuth session.

#### Error Responses

```json
{
  "error": "Error message",
  "details": [] // Optional validation details
}
```

#### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## Component Library

### Search Components

- **AddToWishlistButton** - Heart icon to save flights
  - Props: `flightData`, `size`, `showLabel`, `className`, `onToggle`
  - Sizes: `sm`, `md`, `lg`
  - Shows toast notifications
  - Syncs with API

- **RecentlyViewed** - Display recent flights
  - Props: `maxItems`, `showOnHomepage`
  - Stored in localStorage
  - Quick actions available

### Wishlist Components

- **WishlistCard** - Full wishlist item display
  - Edit notes and target price
  - Price drop alerts
  - Quick book button
  - Remove functionality

### Deal Components

- **DealCard** - Deal display with countdown
  - Live timer
  - Urgency indicators
  - Deal score visualization
  - Quick book

### Explore Components

- **DestinationCard** - Destination display
  - Image lazy loading
  - Quick search
  - Activity tags
  - Best time badges

### Guide Components

- **TravelTipCard** - Expandable travel tip
  - Category badges
  - Urgency indicators
  - Expandable details
  - Voting system

### FAQ Components

- **FaqItem** - Accordion FAQ item
  - Category tags
  - Helpful voting
  - Copy link
  - Smooth animations

---

## Integration Guide

### Adding to Existing Pages

#### Homepage Integration

```tsx
import RecentlyViewed from '@/components/search/RecentlyViewed';
import RecommendedFlights from '@/components/home/RecommendedFlights';

export default function HomePage() {
  return (
    <div>
      {/* Existing content */}

      <RecommendedFlights />
      <RecentlyViewed showOnHomepage={true} />
    </div>
  );
}
```

#### Flight Results Integration

```tsx
import AddToWishlistButton from '@/components/search/AddToWishlistButton';

export default function FlightCard({ flight }) {
  return (
    <div>
      {/* Flight details */}

      <AddToWishlistButton
        flightData={flight}
        size="md"
        showLabel={true}
      />
    </div>
  );
}
```

#### Analytics Integration

```tsx
'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics/engagement-tracker';

export default function SomePage() {
  useEffect(() => {
    trackPageView('/some-page');
  }, []);

  return <div>...</div>;
}
```

### Navigation Integration

Add to main navigation:

```tsx
const navigation = [
  // Existing items
  { name: 'Deals', href: '/deals', icon: '🔥' },
  { name: 'Explore', href: '/explore', icon: '🌍' },
  { name: 'Travel Guide', href: '/travel-guide', icon: '📚' },
  { name: 'FAQ', href: '/faq', icon: 'ℹ️' },
  { name: 'My Wishlist', href: '/account/wishlist', icon: '❤️', requireAuth: true },
];
```

---

## Future Enhancements

### Phase 2 Features

1. **Wishlist Sharing**
   - Generate shareable links
   - Collaborative trip planning
   - Social media integration

2. **Advanced Personalization**
   - Machine learning recommendations
   - Behavioral targeting
   - A/B testing framework

3. **Price Drop Notifications**
   - Email notifications
   - Push notifications
   - SMS alerts (optional)

4. **Social Features**
   - Reviews and ratings
   - Travel stories
   - User-generated content

5. **Gamification**
   - Loyalty points
   - Badges and achievements
   - Referral rewards

6. **Enhanced Analytics**
   - Real-time dashboard
   - Conversion funnel analysis
   - Cohort analysis
   - Heat maps

### Backend Integration Needs

1. **Database Migration**
   ```bash
   npx prisma migrate dev --name add_wishlist
   ```

2. **Background Jobs**
   - Price monitoring cron job
   - Email notification service
   - Analytics aggregation

3. **API Enhancements**
   - Rate limiting
   - Caching strategy
   - CDN for images

---

## Testing

### Manual Testing Checklist

#### Wishlist
- [ ] Add flight to wishlist
- [ ] Remove flight from wishlist
- [ ] Edit notes
- [ ] Set target price
- [ ] View wishlist page
- [ ] Sort wishlist items
- [ ] Test without authentication

#### Deals
- [ ] View deals page
- [ ] Filter by deal type
- [ ] Filter by price range
- [ ] Sort by different criteria
- [ ] Subscribe to alerts
- [ ] Timer countdown works
- [ ] Click deal to book

#### Explore
- [ ] Search destinations
- [ ] Filter by region
- [ ] Filter by budget
- [ ] Filter by travel style
- [ ] View trending section
- [ ] Click destination card
- [ ] Quick search works

#### Travel Guide
- [ ] Select destination
- [ ] Filter by category
- [ ] Search tips
- [ ] Expand/collapse tips
- [ ] View urgency sections

#### FAQ
- [ ] Search questions
- [ ] Filter by category
- [ ] Expand/collapse answers
- [ ] Vote helpful/not helpful
- [ ] Copy FAQ link
- [ ] Popular topics work

#### Analytics
- [ ] Events are tracked
- [ ] Metrics update
- [ ] Session tracking works
- [ ] Return visit detected

---

## Performance Considerations

### Optimizations Implemented

1. **Image Lazy Loading** - All destination images
2. **Component Lazy Loading** - Ready for code splitting
3. **localStorage Limits** - Max 1000 events, 10 recent flights
4. **Debounced Search** - Ready for implementation
5. **Optimistic UI Updates** - Wishlist actions
6. **Local State First** - Reduce API calls

### Recommendations

1. Implement virtual scrolling for long lists
2. Add Redis caching for deals and destinations
3. Use CDN for static images
4. Implement service worker for offline support
5. Add skeleton loaders for better perceived performance

---

## Deployment Checklist

- [x] Database schema updated
- [x] API routes tested
- [x] Components documented
- [x] Pages created
- [x] Analytics integrated
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Email service configured (for notifications)
- [ ] CDN configured (for images)
- [ ] Monitoring setup
- [ ] Error tracking enabled

---

## Support & Maintenance

### Monitoring

Track these metrics in production:
- Wishlist add/remove rate
- Deal click-through rate
- FAQ helpfulness scores
- Average time on site
- Return visit rate
- Conversion rate from engagement features

### Common Issues

1. **Wishlist not syncing** - Check authentication
2. **Analytics not tracking** - Check localStorage availability
3. **Images not loading** - Verify image URLs, check CORS
4. **API errors** - Check Prisma client, database connection

---

## Credits

**Developed by:** Team 4 - User Engagement & Experience
**Date:** November 2025
**Version:** 1.0.0

---

## Appendix

### File Structure

```
app/
├── account/wishlist/page.tsx
├── deals/page.tsx
├── explore/page.tsx
├── travel-guide/page.tsx
├── faq/page.tsx
└── api/
    └── wishlist/
        ├── route.ts
        └── [id]/route.ts

components/
├── search/
│   ├── AddToWishlistButton.tsx
│   └── RecentlyViewed.tsx
├── wishlist/
│   └── WishlistCard.tsx
├── deals/
│   └── DealCard.tsx
├── explore/
│   └── DestinationCard.tsx
├── guide/
│   └── TravelTipCard.tsx
├── faq/
│   └── FaqItem.tsx
└── home/
    └── RecommendedFlights.tsx

lib/
└── analytics/
    └── engagement-tracker.ts

prisma/
└── schema.prisma (updated with WishlistItem model)

docs/
└── engagement/
    └── USER_ENGAGEMENT_GUIDE.md
```

### Technologies Used

- **Next.js 14** - App Router, Server Components
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **NextAuth.js** - Authentication
- **date-fns** - Date formatting
- **react-hot-toast** - Notifications
- **Tailwind CSS** - Styling

---

**End of Document**
