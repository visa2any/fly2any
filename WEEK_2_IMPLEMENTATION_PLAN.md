# 🚀 WEEK 2 IMPLEMENTATION PLAN - ADVANCED ML & ANALYTICS
## FLY2ANY - Conversion Optimization Phase 2

**Status:** READY TO START
**Duration:** 5 days (20 hours)
**Expected Revenue Impact:** +$35-50K monthly
**Prerequisites:** Week 1 features deployed ✅

---

## 📊 WEEK 1 PERFORMANCE BASELINE

Based on screenshots analysis:
- ✅ User Segmentation: Working (data flowing through system)
- ✅ Smart Bundles: Ready to display on booking page
- ✅ Urgency Signals: Displaying ("51 viewing", "240 booked today")
- ✅ AI Price Predictions: Working ("DROP 2%", "RISE 9%")
- ✅ Payment Trust Signals: Visible on payment page
- ✅ Deal Scores: Showing (70-91 range)

**Next Priority:** Measure impact & optimize conversion funnel

---

## 🎯 WEEK 2 OBJECTIVES

1. **A/B Testing Framework** - Measure real ML feature impact
2. **ML Analytics Dashboard** - Visualize performance metrics
3. **Dynamic Pricing Engine** - Demand-based price adjustments
4. **Abandoned Cart Recovery** - Win back lost bookings
5. **Mobile UX Enhancement** - Optimize for mobile devices
6. **Performance Monitoring** - Real-time tracking

**Expected Combined Impact:** +$35-50K monthly, +25-35% conversion

---

## 📋 IMPLEMENTATION TASKS

### **TASK 1: A/B Testing Framework (6h)**
**Priority:** CRITICAL
**Impact:** Enables data-driven decisions, +15% optimization over time

#### Subtask 1.1: Create A/B Test Manager
**File:** `lib/ab-testing/test-manager.ts` (NEW)

```typescript
/**
 * A/B TEST MANAGER
 * Manages feature flags and variant assignments
 */

export type VariantId = 'control' | 'variant_a' | 'variant_b';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    id: VariantId;
    name: string;
    weight: number; // 0-100
  }[];
  startDate: Date;
  endDate?: Date;
  active: boolean;
}

export interface UserAssignment {
  userId: string;
  testId: string;
  variant: VariantId;
  assignedAt: Date;
}

export class ABTestManager {
  private tests: Map<string, ABTest> = new Map();
  private assignments: Map<string, Map<string, VariantId>> = new Map();

  /**
   * Register a new A/B test
   */
  registerTest(test: ABTest): void {
    this.tests.set(test.id, test);
  }

  /**
   * Get variant for user (consistent assignment)
   */
  getVariant(testId: string, userId: string): VariantId {
    const test = this.tests.get(testId);
    if (!test || !test.active) return 'control';

    // Check existing assignment
    const userAssignments = this.assignments.get(userId);
    if (userAssignments?.has(testId)) {
      return userAssignments.get(testId)!;
    }

    // Assign new variant using consistent hashing
    const variant = this.assignVariant(test, userId);

    // Store assignment
    if (!this.assignments.has(userId)) {
      this.assignments.set(userId, new Map());
    }
    this.assignments.get(userId)!.set(testId, variant);

    return variant;
  }

  /**
   * Assign variant using consistent hashing
   */
  private assignVariant(test: ABTest, userId: string): VariantId {
    const hash = this.hashString(userId + test.id);
    const normalized = hash % 100;

    let cumulative = 0;
    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (normalized < cumulative) {
        return variant.id;
      }
    }

    return 'control';
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Check if test is active
   */
  isTestActive(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;

    const now = new Date();
    const isWithinDateRange =
      now >= test.startDate && (!test.endDate || now <= test.endDate);

    return test.active && isWithinDateRange;
  }
}

// Singleton
export const abTestManager = new ABTestManager();

// Register active tests
abTestManager.registerTest({
  id: 'smart-bundles-v1',
  name: 'Smart Bundles Display',
  description: 'Test impact of ML-powered smart bundles',
  variants: [
    { id: 'control', name: 'No bundles', weight: 20 },
    { id: 'variant_a', name: 'ML bundles', weight: 80 },
  ],
  startDate: new Date('2025-01-01'),
  active: true,
});

abTestManager.registerTest({
  id: 'urgency-signals-v1',
  name: 'Urgency Signals',
  description: 'Test impact of urgency indicators',
  variants: [
    { id: 'control', name: 'No urgency', weight: 20 },
    { id: 'variant_a', name: 'All signals', weight: 80 },
  ],
  startDate: new Date('2025-01-01'),
  active: true,
});
```

#### Subtask 1.2: Create Analytics Tracker
**File:** `lib/ab-testing/analytics-tracker.ts` (NEW)

```typescript
/**
 * A/B TEST ANALYTICS TRACKER
 */

export interface ConversionEvent {
  userId: string;
  testId: string;
  variant: string;
  eventType: 'view' | 'click' | 'add_to_cart' | 'purchase';
  eventValue?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export class AnalyticsTracker {
  /**
   * Track conversion event
   */
  async trackEvent(event: ConversionEvent): Promise<void> {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track page view
   */
  trackView(testId: string, variant: string, userId: string): void {
    this.trackEvent({
      userId,
      testId,
      variant,
      eventType: 'view',
      timestamp: new Date(),
    });
  }

  /**
   * Track booking conversion
   */
  trackPurchase(
    testId: string,
    variant: string,
    userId: string,
    value: number
  ): void {
    this.trackEvent({
      userId,
      testId,
      variant,
      eventType: 'purchase',
      eventValue: value,
      timestamp: new Date(),
    });
  }
}

export const analyticsTracker = new AnalyticsTracker();
```

**Integration:** Wire to results page and booking page

---

### **TASK 2: ML Analytics Dashboard (6h)**
**Priority:** HIGH
**Impact:** Visibility into ML performance, enables optimization

#### Subtask 2.1: Create Dashboard Page
**File:** `app/ml/dashboard/page.tsx` (UPDATE - enhance existing)

Add new metrics:
- A/B test performance (conversion rates by variant)
- Smart bundle adoption rate
- Urgency signal click-through rate
- User segment distribution
- Price prediction accuracy
- Revenue attribution by ML feature

#### Subtask 2.2: Create Analytics API
**File:** `app/api/analytics/ab-tests/route.ts` (NEW)

```typescript
/**
 * GET /api/analytics/ab-tests
 * Get A/B test performance metrics
 */
export async function GET(request: NextRequest) {
  // Return metrics for all active tests
  // - Variant exposure counts
  // - Conversion rates by variant
  // - Statistical significance
  // - Revenue per variant
}
```

**Key Metrics to Display:**
- Conversion rate: Control vs ML features
- Revenue per user: Control vs ML features
- Bundle adoption: % of bookings with bundles
- Urgency signal CTR: Clicks / Views
- Price prediction accuracy: Predicted vs actual

---

### **TASK 3: Dynamic Pricing Engine (4h)**
**Priority:** HIGH
**Impact:** +$8-12 per booking from demand-based pricing

#### Subtask 3.1: Create Pricing Engine
**File:** `lib/ml/dynamic-pricing.ts` (NEW)

```typescript
/**
 * DYNAMIC PRICING ENGINE
 * Adjusts bundle and add-on prices based on:
 * - Demand (searches, bookings)
 * - User segment
 * - Time to departure
 * - Competitor pricing
 */

export interface PricingContext {
  basePrice: number;
  currency: string;
  route: string;
  departureDate: string;
  userSegment: 'business' | 'leisure' | 'family' | 'budget';
  daysUntilDeparture: number;
  currentDemand: 'low' | 'medium' | 'high';
}

export interface DynamicPriceResult {
  adjustedPrice: number;
  adjustmentPercent: number;
  reason: string;
  confidence: number;
}

export class DynamicPricingEngine {
  /**
   * Calculate dynamic price adjustment
   */
  calculatePrice(
    item: { basePrice: number; category: string },
    context: PricingContext
  ): DynamicPriceResult {
    let multiplier = 1.0;
    let reason = '';

    // Demand-based pricing
    if (context.currentDemand === 'high') {
      multiplier *= 1.15; // +15% during high demand
      reason = 'High demand';
    } else if (context.currentDemand === 'low') {
      multiplier *= 0.90; // -10% during low demand
      reason = 'Special offer';
    }

    // Time-based pricing
    if (context.daysUntilDeparture < 7) {
      multiplier *= 1.20; // +20% for last-minute
      reason = 'Last-minute booking';
    } else if (context.daysUntilDeparture > 90) {
      multiplier *= 0.95; // -5% for early bird
      reason = 'Early bird discount';
    }

    // Segment-based pricing
    if (context.userSegment === 'business') {
      multiplier *= 1.10; // +10% for business (less price-sensitive)
    } else if (context.userSegment === 'budget') {
      multiplier *= 0.92; // -8% for budget travelers
    }

    const adjustedPrice = Math.round(item.basePrice * multiplier);
    const adjustmentPercent = Math.round((multiplier - 1) * 100);

    return {
      adjustedPrice,
      adjustmentPercent,
      reason,
      confidence: 0.85,
    };
  }
}

export const dynamicPricingEngine = new DynamicPricingEngine();
```

**Integration:** Update bundle generator to use dynamic pricing

---

### **TASK 4: Abandoned Cart Recovery (2h)**
**Priority:** MEDIUM
**Impact:** +$15-25K monthly from recovered bookings (10-15% recovery rate)

#### Subtask 4.1: Create Cart Tracking
**File:** `lib/cart/abandoned-cart-tracker.ts` (NEW)

```typescript
/**
 * ABANDONED CART TRACKER
 * Tracks incomplete bookings for recovery
 */

export interface AbandonedCart {
  id: string;
  userId: string;
  email?: string;
  flightData: any;
  searchData: any;
  step: 'results' | 'booking' | 'payment';
  totalPrice: number;
  currency: string;
  createdAt: Date;
  lastActivity: Date;
  recovered: boolean;
}

export class AbandonedCartTracker {
  /**
   * Track cart abandonment
   */
  async trackAbandonment(cart: AbandonedCart): Promise<void> {
    // Save to database or Redis
    await fetch('/api/cart/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cart),
    });
  }

  /**
   * Check if cart should trigger recovery email
   */
  shouldSendRecovery(cart: AbandonedCart): boolean {
    const hoursSinceAbandonment =
      (Date.now() - cart.lastActivity.getTime()) / (1000 * 60 * 60);

    // Send after 2 hours, not recovered yet, has email
    return hoursSinceAbandonment >= 2 && !cart.recovered && !!cart.email;
  }
}
```

#### Subtask 4.2: Create Recovery Email API
**File:** `app/api/cart/recover/route.ts` (NEW)

```typescript
/**
 * POST /api/cart/recover
 * Send abandoned cart recovery email
 */
export async function POST(request: NextRequest) {
  // Get abandoned carts from last 24h
  // Filter: has email, not recovered, >2h since abandonment
  // Send personalized recovery email with:
  //   - Flight details
  //   - Price (show urgency if price rising)
  //   - One-click return link
  //   - Small incentive (e.g., "Complete in 24h, get priority boarding")
}
```

---

### **TASK 5: Mobile UX Optimization (1h)**
**Priority:** MEDIUM
**Impact:** +5-8% mobile conversion

#### Enhancements:
1. **Urgency Signals:** Reduce size on mobile, stack vertically
2. **Smart Bundles:** Make swipeable cards on mobile
3. **Payment Page:** Optimize form layout for mobile keyboards
4. **Price Insights:** Make collapsible on mobile

**Files to Update:**
- `components/flights/UrgencySignals.tsx`
- `components/booking/SmartBundles.tsx`
- `components/booking/ReviewAndPay.tsx`

---

### **TASK 6: Performance Monitoring (1h)**
**Priority:** MEDIUM
**Impact:** Maintain speed, prevent performance degradation

#### Setup:
1. Add performance tracking to ML API calls
2. Monitor bundle generation time
3. Track urgency signal render time
4. Alert if any metric exceeds threshold

**File:** `lib/monitoring/performance-monitor.ts` (NEW)

---

## 📊 SUCCESS METRICS

### Week 2 KPIs:
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Overall Conversion Rate | 2.5% | 3.1% | A/B test results |
| Bundle Adoption | 0% | 35% | % bookings with bundles |
| Avg Order Value | $450 | $485 | Revenue / bookings |
| Mobile Conversion | 1.8% | 2.0% | Mobile-specific tracking |
| Abandoned Cart Recovery | 0% | 12% | Recovered / total abandoned |
| ML API Response Time | <500ms | <400ms | Performance logs |

### Revenue Attribution:
- Smart Bundles: +$18-30 per booking
- Dynamic Pricing: +$8-12 per booking
- Abandoned Cart: +$15-25K monthly
- **Total Week 2 Impact:** +$35-50K monthly

---

## 🔧 TESTING CHECKLIST

### Pre-Deployment:
- [ ] A/B tests assign variants consistently
- [ ] Analytics events tracked correctly
- [ ] Dynamic pricing within acceptable bounds (±25%)
- [ ] Abandoned cart emails send properly
- [ ] Mobile layouts render correctly
- [ ] All API endpoints have proper error handling
- [ ] Performance metrics logged

### Post-Deployment:
- [ ] Monitor A/B test exposure balance (should match weights)
- [ ] Verify analytics dashboard shows real data
- [ ] Check dynamic pricing logs for sanity
- [ ] Monitor abandoned cart recovery rate
- [ ] Track mobile vs desktop conversion rates
- [ ] Alert on any performance regressions

---

## 🚀 DEPLOYMENT SEQUENCE

### Day 1-2: A/B Testing + Analytics (6h)
- Implement test manager and tracker
- Wire to existing pages
- Build analytics dashboard
- Deploy and verify data flow

### Day 3: Dynamic Pricing (4h)
- Build pricing engine
- Integrate with bundle generator
- Test pricing bounds
- Deploy with 50% rollout

### Day 4: Abandoned Cart + Mobile (3h)
- Implement cart tracking
- Setup recovery emails
- Optimize mobile layouts
- Deploy and monitor

### Day 5: Monitoring + Optimization (1h)
- Setup performance monitoring
- Review Week 2 metrics
- Optimize any issues
- **READY FOR WEEK 3**

---

## 💰 EXPECTED ROI

**Week 2 Investment:** 20 hours
**Expected Monthly Revenue Impact:** +$35-50K
**Expected Conversion Lift:** +25-35%
**ROI Timeline:** Immediate (Day 1 of deployment)

**Cumulative (Week 1 + Week 2):**
- **Monthly Revenue:** +$80-120K
- **Annual Revenue:** +$960K - $1.44M
- **Conversion Lift:** +65-85% overall

---

## 🎯 WEEK 3 PREVIEW

Next priorities after Week 2:
1. **Advanced Price Prediction ML Model** - Improve accuracy
2. **Personalized Search Results** - Reorder by segment
3. **Email Marketing Automation** - Price alerts, deals
4. **Loyalty Program** - Repeat customer incentives
5. **API Cost Optimization** - Further reduce API spend

**Expected Week 3 Impact:** +$25-35K monthly

---

**STATUS:** READY TO IMPLEMENT
**NEXT ACTION:** Begin TASK 1 (A/B Testing Framework)
