# Conversion Optimization - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Import Components
```typescript
import {
  FOMOCountdown,
  LiveActivityFeed,
  PriceDropProtection,
  SocialValidation,
  CommitmentEscalation,
  ExitIntentPopup,
  BookingProgressIndicator
} from '@/components/conversion';
```

### 2. Check Feature Flags
```typescript
import { featureFlags, shouldShowConversion } from '@/lib/feature-flags';

// Check if feature is enabled
if (featureFlags.isEnabled('fomoCountdown')) {
  // Show component
}

// Check if should show for this deal score
if (shouldShowConversion(dealScore)) {
  // Deal meets threshold
}
```

### 3. Track Conversions
```typescript
import { trackConversion } from '@/lib/conversion-metrics';

trackConversion('flight_saved', {
  flightId: 'ABC123',
  dealScore: 85
});
```

---

## 📦 Component Usage

### FOMO Countdown
```tsx
{/* Show for deals ≥75 score */}
{dealScore >= 75 && (
  <FOMOCountdown
    expiryMinutes={45}
    className="mb-1.5"
  />
)}
```

### Live Activity Feed
```tsx
{/* Sidebar widget */}
<LiveActivityFeed
  variant="sidebar"
  maxItems={5}
/>

{/* Or floating popup */}
<LiveActivityFeed variant="popup" />
```

### Price Drop Protection
```tsx
{/* Badge (compact) */}
<PriceDropProtection variant="badge" />

{/* Or banner (expanded) */}
<PriceDropProtection variant="banner" />
```

### Social Validation
```tsx
{/* Tooltip with hover stats */}
<SocialValidation
  variant="tooltip"
  travelerCount={1247}
/>

{/* Badge (inline) */}
<SocialValidation variant="badge" />

{/* Inline text */}
<SocialValidation variant="inline" />
```

### Commitment Escalation
```tsx
<CommitmentEscalation
  flightId={id}
  onSave={() => trackConversion('flight_saved')}
  onCompare={() => trackConversion('flight_compared')}
  onBook={() => trackConversion('flight_booked')}
/>
```

### Exit Intent Popup
```tsx
<ExitIntentPopup
  discountCode="COMEBACK5"
  discountPercent={5}
  onEmailSubmit={(email) => {
    trackConversion('exit_intent_email_submitted', { email });
  }}
/>
```

### Booking Progress
```tsx
{/* Full variant */}
<BookingProgressIndicator
  currentStep={2}
  steps={['Select Flight', 'Passenger Details', 'Payment']}
  variant="default"
/>

{/* Compact variant */}
<BookingProgressIndicator
  currentStep={1}
  variant="compact"
/>
```

---

## 🎛️ Feature Flag Configuration

### Default Settings
```typescript
// All features enabled by default
fomoCountdown: true          // FOMO timer
liveActivityFeed: true       // Live activity
socialValidation: true       // Social proof
priceDropProtection: true    // Trust badge
commitmentEscalation: true   // Progressive CTA
exitIntent: true             // Exit popup
bookingProgress: true        // Progress indicator

// Targeting
showOnlyOnDeals: true        // Only show on good deals
dealScoreThreshold: 70       // Minimum deal score
```

### Override in Browser Console
```javascript
// Disable specific feature
localStorage.setItem('feature_flag_overrides', JSON.stringify({
  exitIntent: false
}));
location.reload();

// Reset all overrides
localStorage.removeItem('feature_flag_overrides');
location.reload();
```

---

## 📊 A/B Testing

### Check Current Group
```javascript
// In browser console
console.log(sessionStorage.getItem('ab_test_group'));
// Returns: 'control', 'variant_a', or 'variant_b'
```

### Test Groups
- **Control (33%):** No conversion features
- **Variant A (33%):** Conservative (subtle features)
- **Variant B (33%):** Aggressive (all features)

---

## 📈 Analytics & Metrics

### View Conversion Stats
```typescript
import { getConversionStats } from '@/lib/conversion-metrics';

const stats = getConversionStats();

console.log('Funnel:', stats.funnel);
// { viewed: 100, saved: 25, compared: 15, booked: 10, conversionRate: 10% }

console.log('Exit Intent:', stats.exitIntent);
// { shown: 50, dismissed: 30, submitted: 20, conversionRate: 40% }
```

### Track Custom Events
```typescript
trackConversion('custom_event', {
  flightId: 'ABC123',
  customData: 'value'
});
```

---

## 🎯 Where Each Feature Shows

### FlightCardEnhanced
- ✅ FOMO Countdown (deal score ≥75)
- ✅ Price Drop Protection (deal score ≥80)
- ✅ Social Validation (all deals)
- ✅ Commitment Escalation (good deals)

### Flight Results Page
- ✅ Live Activity Feed (right sidebar)
- ✅ Exit Intent Popup (page-level)

### Booking Flow (Future)
- ⏳ Booking Progress Indicator

---

## 🔧 Common Customizations

### Change Timer Duration
```typescript
// In feature flags config
fomoCountdownMinutes: 30  // Default: 45
```

### Change Exit Intent Offer
```typescript
exitIntentDiscountPercent: 10  // Default: 5
exitIntentDiscountCode: 'SAVE10'  // Default: 'COMEBACK5'
```

### Change Deal Score Threshold
```typescript
dealScoreThreshold: 80  // Default: 70 (higher = fewer conversions shown)
```

### Change Activity Feed Max Items
```tsx
<LiveActivityFeed maxItems={10} />  // Default: 5
```

---

## 🐛 Debugging

### Enable Debug Mode
Add `?debug=true` to URL to see conversion features highlighted

### Check Feature Status
```javascript
import { featureFlags } from '@/lib/feature-flags';
console.table(featureFlags.getAll());
```

### View All Tracked Events
```javascript
// In browser console
const metrics = JSON.parse(localStorage.getItem('conversion_metrics') || '[]');
console.table(metrics);
```

---

## ✅ Testing Checklist

### Before Deploying
- [ ] Test all components render correctly
- [ ] Verify feature flags work
- [ ] Check A/B test assignment
- [ ] Test exit intent triggers
- [ ] Verify analytics tracking
- [ ] Test on mobile devices
- [ ] Check performance (no lag)

### Visual Testing
- [ ] FOMO timer updates every second
- [ ] Activity feed animates smoothly
- [ ] Tooltips appear on hover
- [ ] Buttons change on interaction
- [ ] Exit popup centers correctly
- [ ] All text is readable
- [ ] Colors match design system

---

## 🚨 Common Issues & Solutions

### Exit Intent Not Showing
```javascript
// Reset session flag
sessionStorage.removeItem('exitIntentShown');
// Reload and try again
```

### Conversion Features Not Appearing
```javascript
// Check if deal score meets threshold
console.log('Deal Score:', dealScore);
console.log('Threshold:', featureFlags.get('dealScoreThreshold'));
console.log('Should Show:', shouldShowConversion(dealScore));
```

### Analytics Not Tracking
```javascript
// Verify gtag is loaded
console.log('gtag available:', typeof window.gtag !== 'undefined');
```

---

## 📚 Full Documentation

See `CONVERSION_OPTIMIZATION_COMPLETE.md` for:
- Detailed feature descriptions
- Design specifications
- A/B testing strategy
- Expected impact analysis
- Production deployment guide

---

## 🎉 Quick Win: Test in 2 Minutes

1. Open flight results page
2. Add `?debug=true` to URL
3. Look for conversion features highlighted in yellow
4. Move mouse to top of screen to trigger exit intent
5. Check browser console for tracked events
6. View stats: `getConversionStats()`

Done! All conversion features are working. 🚀
