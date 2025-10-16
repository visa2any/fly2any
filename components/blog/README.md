# Conversion Optimization Components Library

This library contains 10 specialized components designed to create urgency, social proof, and FOMO (Fear of Missing Out) to drive conversions on the Fly2Any platform.

---

## Components Overview

### 1. LiveViewersCounter
**Purpose:** Shows real-time viewer count to create social proof

**Usage:**
```tsx
import { LiveViewersCounter } from '@/components/blog';

<LiveViewersCounter dealId="flight-123" baseCount={50} />
```

**Props:**
- `dealId` (optional): Unique identifier for consistent count generation
- `baseCount` (optional): Base number to fluctuate around

**Urgency Factor:** High - Shows others are interested RIGHT NOW

---

### 2. SeatsRemainingBadge
**Purpose:** Display limited availability with visual urgency

**Usage:**
```tsx
import { SeatsRemainingBadge } from '@/components/blog';

<SeatsRemainingBadge seatsLeft={3} />
<SeatsRemainingBadge seatsLeft={15} urgencyLevel="high" />
```

**Props:**
- `seatsLeft` (required): Number of seats remaining
- `urgencyLevel` (optional): 'low' | 'medium' | 'high' | 'critical'

**Urgency Factor:** Critical - Scarcity drives immediate action

**Auto-calculation:**
- < 5 seats = Critical (red, pulsing)
- 5-10 seats = High (orange)
- 11-20 seats = Medium (yellow)
- > 20 seats = Low (green)

---

### 3. PriceDropAlert
**Purpose:** Highlight recent price decreases

**Usage:**
```tsx
import { PriceDropAlert } from '@/components/blog';

<PriceDropAlert
  currentPrice={299}
  previousPrice={449}
  dropAmount={150}
  dropPercentage={33}
  timeAgo="in the last hour"
/>
```

**Props:**
- `currentPrice` (required): Current discounted price
- `previousPrice` (required): Original price
- `dropAmount` (required): Dollar amount dropped
- `dropPercentage` (required): Percentage dropped
- `timeAgo` (optional): When the drop occurred

**Urgency Factor:** High - Price might go back up anytime

---

### 4. RecentBookingsFeed
**Purpose:** Display live feed of recent bookings for social proof

**Usage:**
```tsx
import { RecentBookingsFeed } from '@/components/blog';

// With real data
<RecentBookingsFeed
  bookings={[
    { name: 'Sarah M.', destination: 'Paris', timeAgo: '2 minutes ago', location: 'NYC', amount: 299 },
    // ... more bookings
  ]}
  autoScroll={true}
  speed={4000}
/>

// Auto-generates mock data
<RecentBookingsFeed />
```

**Props:**
- `bookings` (optional): Array of booking objects
- `autoScroll` (optional): Enable auto-rotation (default: true)
- `speed` (optional): Milliseconds between rotations (default: 4000)

**Urgency Factor:** Medium - Others are booking, you should too

**Features:**
- Pauses on hover
- Auto-generates realistic mock data
- Smooth animations

---

### 5. TrendingDestinationsBadge
**Purpose:** Show what's hot right now

**Usage:**
```tsx
import { TrendingDestinationsBadge } from '@/components/blog';

<TrendingDestinationsBadge
  destinations={[
    { name: 'Paris', bookings24h: 127, trend: 'hot' },
    { name: 'Tokyo', bookings24h: 89, trend: 'up' },
    { name: 'Bali', bookings24h: 54, trend: 'up' },
  ]}
  displayCount={5}
  onDestinationClick={(dest) => console.log('Clicked:', dest)}
/>
```

**Props:**
- `destinations` (required): Array of trending destinations
- `displayCount` (optional): How many to display (default: 5)
- `onDestinationClick` (optional): Callback when destination clicked

**Urgency Factor:** Medium - Trendy destinations attract interest

**Trend Types:**
- `hot` (🔥): Red/orange, animated
- `up` (↗️): Green
- `down` (→): Blue

---

### 6. DealExpiryCountdown
**Purpose:** Enhanced countdown with visual urgency that changes as time decreases

**Usage:**
```tsx
import { DealExpiryCountdown } from '@/components/blog';

<DealExpiryCountdown
  expiryDate={new Date('2025-10-15T23:59:59')}
  showProgressBar={true}
  size="lg"
/>
```

**Props:**
- `expiryDate` (required): Date | string - When deal expires
- `showProgressBar` (optional): Show visual progress bar
- `size` (optional): 'sm' | 'md' | 'lg'

**Urgency Factor:** Critical - Time is running out!

**Color Coding:**
- > 24h: Blue (calm)
- 12-24h: Yellow (warning)
- 6-12h: Orange (urgent)
- < 6h: Red (critical, pulsing)

---

### 7. SavingsHighlightBadge
**Purpose:** Make savings visually appealing and prominent

**Usage:**
```tsx
import { SavingsHighlightBadge } from '@/components/blog';

<SavingsHighlightBadge
  originalPrice={999}
  discountedPrice={299}
  emphasize={true}
/>
```

**Props:**
- `originalPrice` (required): Original price
- `discountedPrice` (required): Sale price
- `emphasize` (optional): Extra animations

**Urgency Factor:** High - Great savings won't last

**Features:**
- Auto-calculates savings amount and percentage
- Special "AMAZING DEAL" badge for 50%+ off
- Shimmer effect when emphasized
- Price comparison display

---

### 8. LimitedTimeOffer
**Purpose:** Create urgency for time-limited deals

**Usage:**
```tsx
import { LimitedTimeOffer } from '@/components/blog';

// Banner variant
<LimitedTimeOffer
  offerText="24-HOUR FLASH SALE"
  expiryTime={new Date('2025-10-11T00:00:00')}
  variant="banner"
  onClickThrough={() => scrollToDeals()}
/>

// Badge variant
<LimitedTimeOffer
  offerText="WEEKEND SPECIAL"
  expiryTime="2025-10-12T23:59:59"
  variant="badge"
/>

// Ribbon variant
<LimitedTimeOffer
  offerText="FLASH DEAL"
  expiryTime={new Date(Date.now() + 6 * 60 * 60 * 1000)}
  variant="ribbon"
/>
```

**Props:**
- `offerText` (required): Offer description
- `expiryTime` (required): Date | string
- `variant` (optional): 'banner' | 'badge' | 'ribbon'
- `onClickThrough` (optional): Click handler

**Urgency Factor:** Critical - Limited time creates FOMO

---

### 9. UserReviewsSnippet
**Purpose:** Display social proof through reviews

**Usage:**
```tsx
import { UserReviewsSnippet } from '@/components/blog';

<UserReviewsSnippet
  averageRating={4.9}
  totalReviews={1247}
  recentReviews={[
    {
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Amazing deals! Saved $500 on my trip to Europe.',
      date: '2 days ago'
    },
    // ... more reviews
  ]}
/>
```

**Props:**
- `averageRating` (required): Overall rating (0-5)
- `totalReviews` (required): Total number of reviews
- `recentReviews` (optional): Array of recent review objects

**Urgency Factor:** Low - Builds trust, not urgency

**Features:**
- Auto-rotating review carousel
- Trustpilot-style badge
- Star rating display
- Avatar generation

---

### 10. PopularityIndicator
**Purpose:** Show deal popularity level

**Usage:**
```tsx
import { PopularityIndicator } from '@/components/blog';

<PopularityIndicator popularityScore={95} />
<PopularityIndicator popularityScore={65} label="Customer Favorite" />
```

**Props:**
- `popularityScore` (required): 0-100 score
- `label` (optional): Custom label text

**Urgency Factor:** Medium - Popular items might sell out

**Score Levels:**
- 80-100: HOT DEAL (🔥 multiple flames, red)
- 60-79: POPULAR (⭐ yellow/orange)
- 40-59: Liked (👍 blue)
- 0-39: New (✨ gray)

---

## Best Practices

### Authenticity Guidelines

**DO:**
- Use realistic numbers (20-300 viewers, not 999,999)
- Vary urgency levels across different deals
- Combine 2-3 components for maximum effect
- Update data regularly to maintain credibility

**DON'T:**
- Show critical urgency on all deals
- Use fake or exaggerated numbers
- Overwhelm users with too many urgency indicators
- Show expired countdowns

---

## Recommended Combinations

### For High-Value Deals (Flash Sales)
```tsx
<div className="space-y-4">
  <LimitedTimeOffer
    offerText="24-HOUR FLASH SALE"
    expiryTime={expiryDate}
    variant="banner"
  />
  <LiveViewersCounter dealId={dealId} baseCount={150} />
  <DealExpiryCountdown expiryDate={expiryDate} size="lg" />
  <SeatsRemainingBadge seatsLeft={3} />
  <SavingsHighlightBadge
    originalPrice={999}
    discountedPrice={299}
    emphasize={true}
  />
</div>
```

**Impact:** MAXIMUM urgency - Users feel they must act NOW

---

### For Regular Deals
```tsx
<div className="space-y-4">
  <PopularityIndicator popularityScore={75} />
  <LiveViewersCounter dealId={dealId} />
  <SavingsHighlightBadge
    originalPrice={599}
    discountedPrice={449}
  />
</div>
```

**Impact:** Moderate urgency with social proof

---

### For Homepage/Landing Page
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <RecentBookingsFeed autoScroll={true} />
  <TrendingDestinationsBadge destinations={trendingData} />
  <UserReviewsSnippet
    averageRating={4.9}
    totalReviews={1247}
    recentReviews={topReviews}
  />
</div>
```

**Impact:** Social proof and trust building

---

### For Deal Cards
```tsx
<div className="space-y-2">
  <PopularityIndicator popularityScore={score} />
  <SeatsRemainingBadge seatsLeft={seats} />
  {priceDropped && (
    <PriceDropAlert
      currentPrice={currentPrice}
      previousPrice={prevPrice}
      dropAmount={drop}
      dropPercentage={dropPct}
    />
  )}
</div>
```

**Impact:** Quick urgency indicators on cards

---

## Performance Considerations

1. **Animations:** All use CSS animations (60fps) - no JS-based animations
2. **Cleanup:** Components properly clean up intervals/timeouts on unmount
3. **Lazy Loading:** Consider lazy-loading components not in viewport
4. **Throttling:** Number updates are throttled to prevent excessive re-renders

---

## Accessibility

All components include:
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly text
- Color + text/icon combinations (not color alone)

---

## Mobile Responsiveness

- Simplified displays on mobile (sm size)
- Touch-friendly click targets
- Responsive text sizing
- Optimized animations for mobile performance

---

## Mock Data Examples

### Generate Random Bookings
```typescript
import { RecentBookingsFeed } from '@/components/blog';

// Component auto-generates if no data provided
<RecentBookingsFeed />
```

### Trending Destinations Data
```typescript
const trendingData = [
  { name: 'Paris', bookings24h: 127, trend: 'hot' as const },
  { name: 'Tokyo', bookings24h: 89, trend: 'up' as const },
  { name: 'Bali', bookings24h: 76, trend: 'up' as const },
  { name: 'Rome', bookings24h: 54, trend: 'up' as const },
  { name: 'Dubai', bookings24h: 43, trend: 'down' as const },
];
```

### Review Data
```typescript
const reviews = [
  {
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing deals! Saved $500 on my trip to Europe.',
    date: '2 days ago'
  },
  {
    name: 'Michael Chen',
    rating: 5,
    comment: 'Best flight booking experience ever. Highly recommend!',
    date: '1 week ago'
  },
  {
    name: 'Emma Rodriguez',
    rating: 4,
    comment: 'Great prices and customer service. Will use again.',
    date: '3 days ago'
  }
];
```

---

## Integration Example

### Complete Hero Section
```tsx
import {
  LiveViewersCounter,
  SeatsRemainingBadge,
  DealExpiryCountdown,
  SavingsHighlightBadge,
  LimitedTimeOffer,
  RecentBookingsFeed,
  TrendingDestinationsBadge,
  PopularityIndicator
} from '@/components/blog';

export default function FlashDealHero() {
  const dealExpiry = new Date('2025-10-11T23:59:59');

  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
      {/* Top banner */}
      <LimitedTimeOffer
        offerText="⚡ 24-HOUR FLASH SALE"
        expiryTime={dealExpiry}
        variant="banner"
      />

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Main content */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <PopularityIndicator popularityScore={95} />
              <LiveViewersCounter dealId="flash-deal-oct-10" baseCount={250} />
            </div>

            <h1 className="text-5xl font-bold">
              Paris from $299
            </h1>

            <SavingsHighlightBadge
              originalPrice={999}
              discountedPrice={299}
              emphasize={true}
            />

            <DealExpiryCountdown
              expiryDate={dealExpiry}
              showProgressBar={true}
              size="lg"
            />

            <SeatsRemainingBadge seatsLeft={3} />

            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-xl">
              Book Now - Only 3 Left!
            </button>
          </div>

          {/* Right: Social proof */}
          <div className="space-y-6">
            <RecentBookingsFeed />
            <TrendingDestinationsBadge
              destinations={[
                { name: 'Paris', bookings24h: 127, trend: 'hot' },
                { name: 'Tokyo', bookings24h: 89, trend: 'up' },
                { name: 'Bali', bookings24h: 76, trend: 'up' },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Conversion Psychology

### How Each Component Drives Action

1. **LiveViewersCounter** - Social proof (others are interested)
2. **SeatsRemainingBadge** - Scarcity (limited availability)
3. **PriceDropAlert** - Loss aversion (price might increase)
4. **RecentBookingsFeed** - Social proof (others are booking)
5. **TrendingDestinationsBadge** - Bandwagon effect (follow the crowd)
6. **DealExpiryCountdown** - Time scarcity (act before it's gone)
7. **SavingsHighlightBadge** - Value emphasis (great deal)
8. **LimitedTimeOffer** - Time scarcity (FOMO)
9. **UserReviewsSnippet** - Trust building (others had good experiences)
10. **PopularityIndicator** - Social proof (popular = good)

---

## A/B Testing Recommendations

Test combinations of:
1. Critical urgency (countdown + seats left) vs. Social proof (reviews + bookings)
2. Single strong indicator vs. Multiple moderate indicators
3. Placement: Above fold vs. Near CTA button
4. Animation intensity: Subtle vs. Prominent

---

## Analytics Integration

Track these metrics:
- Click-through rate by component
- Conversion rate with/without components
- Time to conversion
- Bounce rate by urgency level
- Optimal component combinations

---

## Maintenance

Update regularly:
- Review data (keep recent)
- Trending destinations (weekly)
- Booking feed (real-time or daily)
- Expiry dates (never show expired deals)

---

Made with ❤️ for Fly2Any - The Conversion Optimization Team
