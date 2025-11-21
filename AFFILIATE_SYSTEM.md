# Fly2Any Affiliate Program - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Commission Structure](#commission-structure)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Integration Guide](#integration-guide)
7. [Testing Guide](#testing-guide)
8. [Deployment Checklist](#deployment-checklist)
9. [Admin Panel Guide](#admin-panel-guide)

---

## 🎯 Overview

The Fly2Any Affiliate Program allows partners to earn commissions by referring customers to the platform. The system supports a **hybrid revenue model** (both commission-based and markup-based profit), implements a **30-day hold period** after trip completion, and features **5-tier performance levels**.

### Key Features

✅ **Hybrid Revenue Model**: Works with both percentage-based commissions AND fixed markups
✅ **5-Tier System**: Starter → Bronze → Silver → Gold → Platinum (15% to 35% of profit)
✅ **30-Day Hold Period**: Protects against chargebacks and cancellations
✅ **Cookie Attribution**: 30-day tracking window
✅ **Negative Balance Handling**: Automatically deducts refunded commissions
✅ **Automated Lifecycle**: Cron jobs handle tier upgrades, commission approvals, monthly resets
✅ **Admin Controls**: Full management dashboard for approval and payouts

---

## 💰 Commission Structure

### Tier Levels & Requirements

| Tier | Commission Rate | Monthly Trips Required | Benefits |
|------|----------------|----------------------|----------|
| **Starter** | 15% of profit | 0 | Basic access, marketing materials |
| **Bronze** | 20% of profit | 5 | Priority support, custom dashboard |
| **Silver** | 25% of profit | 15 | Dedicated account manager, custom promo codes |
| **Gold** | 30% of profit | 30 | Premium 24/7 support, co-branded materials |
| **Platinum** | 35% of profit | 50 | VIP management, custom integrations, exclusive deals |

### Commission Calculation Formula

```javascript
// Step 1: Calculate Fly2Any's gross profit
const yourGrossProfit = revenueModel === 'commission'
  ? (customerTotalPaid - supplierCost)  // Commission model
  : markup;                              // Markup model

// Step 2: Calculate affiliate commission based on tier
const commissionRate = getTierRate(affiliate.tier); // 0.15-0.35
let commission = yourGrossProfit * commissionRate;

// Step 3: Apply min/max caps
commission = Math.max(0.50, Math.min(commission, 500.00));
```

### Example Scenarios

#### Scenario 1: Commission-Based Flight
- Customer Pays: $1,000
- Supplier Cost: $920
- Your Profit: $80
- Affiliate Tier: Bronze (20%)
- **Commission: $16.00**

#### Scenario 2: Markup-Based Domestic Flight
- Customer Pays: $500
- Markup Added: $50
- Your Profit: $50
- Affiliate Tier: Gold (30%)
- **Commission: $15.00**

---

## 🏗️ System Architecture

### Commission Lifecycle

```
1. Click → 2. Sign Up → 3. Booking → 4. Completed → 5. Hold (30d) → 6. Approved → 7. Paid
```

#### Status Definitions

| Status | Description | Balance |
|--------|-------------|---------|
| `pending` | Booking created, payment pending | Pending |
| `booked` | Payment confirmed | Pending |
| `completed` | Trip finished | Pending |
| `hold` | 30-day hold period active | Pending |
| `approved` | Hold period passed, ready for payout | Current |
| `paid` | Commission sent to affiliate | Paid |
| `cancelled` | Booking cancelled/refunded (reversed) | Deducted |

### Hold Period Logic

**Why 30 days?** Protects Fly2Any from:
- Credit card chargebacks (typically 30-60 days)
- Customer cancellations after travel
- Refund requests

**How it works:**
1. Trip completes on travel date
2. System sets `hold_until = completion_date + 30 days`
3. Daily cron job checks `hold_until <= NOW()`
4. If passed, moves from `pending_balance` → `current_balance`
5. Affiliate can now request payout

---

## 🗄️ Database Schema

### Core Tables

#### `affiliates`
Main affiliate partner record

```sql
CREATE TABLE affiliates (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),

  -- Business Info
  business_name TEXT,
  website TEXT,
  tax_id TEXT,

  -- Status & Tier
  tier TEXT DEFAULT 'starter',
  status TEXT DEFAULT 'pending',

  -- Performance Metrics
  total_clicks INTEGER DEFAULT 0,
  completed_trips INTEGER DEFAULT 0,
  monthly_completed_trips INTEGER DEFAULT 0,

  -- Financials
  total_commissions_earned FLOAT DEFAULT 0,
  total_commissions_paid FLOAT DEFAULT 0,
  current_balance FLOAT DEFAULT 0,
  pending_balance FLOAT DEFAULT 0,

  -- Tracking
  referral_code TEXT UNIQUE,
  tracking_id TEXT UNIQUE,

  -- Payout Settings
  payout_method TEXT DEFAULT 'paypal',
  payout_email TEXT,
  min_payout_threshold FLOAT DEFAULT 50,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `affiliate_referrals`
Click and conversion tracking

```sql
CREATE TABLE affiliate_referrals (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT REFERENCES affiliates(id),

  -- Click Tracking
  click_id TEXT UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  landing_page TEXT,

  -- UTM Parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Attribution
  user_id TEXT REFERENCES users(id),
  booking_id TEXT,

  -- Cookie
  cookie_expiry TIMESTAMP,

  -- Status: click → signed_up → booked → completed
  status TEXT DEFAULT 'click',

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `commissions`
Revenue breakdown and lifecycle tracking

```sql
CREATE TABLE commissions (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT REFERENCES affiliates(id),
  referral_id TEXT UNIQUE REFERENCES affiliate_referrals(id),
  booking_id TEXT UNIQUE,

  -- Revenue Breakdown (CRITICAL for hybrid model)
  revenue_model TEXT, -- 'commission' or 'markup'
  customer_total_paid FLOAT,
  supplier_cost FLOAT,
  your_gross_profit FLOAT,

  -- Commission Calculation
  affiliate_tier_at_booking TEXT,
  commission_rate FLOAT,
  commission_amount FLOAT,

  -- Lifecycle Dates
  booking_date TIMESTAMP,
  travel_date TIMESTAMP,
  completion_date TIMESTAMP,
  hold_until TIMESTAMP,

  -- Status
  status TEXT DEFAULT 'pending',
  hold_period_days INTEGER DEFAULT 30,

  -- Reversal
  reversed BOOLEAN DEFAULT false,
  reversal_reason TEXT,
  reversal_amount FLOAT,

  payout_id TEXT REFERENCES payouts(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `payouts`
Payment processing records

```sql
CREATE TABLE payouts (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT REFERENCES affiliates(id),

  amount FLOAT,
  commission_count INTEGER,

  period_start TIMESTAMP,
  period_end TIMESTAMP,

  method TEXT, -- 'paypal', 'stripe', 'bank_transfer'
  status TEXT DEFAULT 'pending',

  processing_fee FLOAT DEFAULT 0,
  net_amount FLOAT,

  invoice_number TEXT UNIQUE,
  receipt_url TEXT,

  created_at TIMESTAMP,
  paid_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Affiliate Endpoints

#### Registration
```http
POST /api/affiliates/register
Content-Type: application/json

{
  "businessName": "Travel Agency LLC",
  "website": "https://example.com",
  "payoutEmail": "affiliate@example.com",
  "payoutMethod": "paypal",
  "referralCode": "TRAVELAGENCY" // optional
}
```

#### Get Profile
```http
GET /api/affiliates/me
```

#### Update Profile
```http
PATCH /api/affiliates/me
Content-Type: application/json

{
  "businessName": "New Name",
  "payoutEmail": "new@example.com",
  "minPayoutThreshold": 100
}
```

#### Dashboard Stats
```http
GET /api/affiliates/me/dashboard
```

#### List Referrals
```http
GET /api/affiliates/me/referrals?status=completed&limit=50&offset=0
```

#### List Commissions
```http
GET /api/affiliates/me/commissions?status=approved&limit=50&offset=0
```

#### Request Payout
```http
POST /api/affiliates/me/payouts/request
```

#### List Payouts
```http
GET /api/affiliates/me/payouts?status=paid&limit=20&offset=0
```

### Tracking Endpoints

#### Track Click
```http
POST /api/affiliates/track-click
Content-Type: application/json

{
  "referralCode": "TRAVELAGENCY",
  "landingPage": "/flights/search?from=NYC&to=LAX",
  "utmSource": "facebook",
  "utmMedium": "paid",
  "utmCampaign": "summer2024"
}
```

### Admin Endpoints

#### List All Affiliates
```http
GET /api/admin/affiliates?status=active&tier=gold&limit=50&offset=0
```

#### Get Affiliate Details
```http
GET /api/admin/affiliates/{affiliateId}
```

#### Update Affiliate Status
```http
PATCH /api/admin/affiliates/{affiliateId}
Content-Type: application/json

{
  "status": "active",
  "tier": "silver",
  "notes": "Approved after review"
}
```

#### Process Payout
```http
POST /api/admin/affiliates/{affiliateId}/payouts/process
Content-Type: application/json

{
  "payoutId": "payout_123",
  "receiptUrl": "https://paypal.com/receipt/123",
  "notes": "Processed via PayPal"
}
```

---

## 🔗 Integration Guide

### Step 1: Track Affiliate Clicks (Landing Page)

Add this to your main layout or homepage:

```typescript
// app/layout.tsx or middleware.ts
import { cookies } from 'next/headers';

export default async function RootLayout({ children }) {
  const searchParams = new URL(request.url).searchParams;
  const refCode = searchParams.get('ref');

  if (refCode) {
    // Track click
    const response = await fetch('/api/affiliates/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referralCode: refCode,
        landingPage: request.url,
        utmSource: searchParams.get('utm_source'),
        utmMedium: searchParams.get('utm_medium'),
        utmCampaign: searchParams.get('utm_campaign'),
      }),
    });

    const { data } = await response.json();

    // Set cookie (30 days)
    cookies().set('affiliate_ref', `${data.clickId}|${refCode}`, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  }

  return <html>{children}</html>;
}
```

### Step 2: Link User Signup (Registration)

Add this to your signup handler:

```typescript
// app/api/auth/register/route.ts
import { linkUserSignupToReferral } from '@/lib/affiliates/integration-helpers';

export async function POST(request: Request) {
  // ... create user account ...

  // Check for affiliate attribution
  const affiliateCookie = cookies().get('affiliate_ref')?.value;
  if (affiliateCookie) {
    const [clickId] = affiliateCookie.split('|');
    await linkUserSignupToReferral(newUser.id, clickId);
  }

  // ... rest of signup logic ...
}
```

### Step 3: Create Commission on Booking

Add this to your booking confirmation:

```typescript
// app/api/bookings/create/route.ts
import { processAffiliateCommissionForBooking } from '@/lib/affiliates/integration-helpers';

export async function POST(request: Request) {
  // ... create booking ...

  // Process affiliate commission
  const commissionResult = await processAffiliateCommissionForBooking({
    bookingId: booking.id,
    userId: booking.userId,
    customerTotalPaid: booking.totalPrice,
    supplierCost: booking.supplierCost,
    revenueModel: booking.revenueModel, // 'commission' or 'markup'
    markup: booking.markup, // if applicable
    bookingDate: new Date(),
    travelDate: booking.departureDate,
  });

  if (commissionResult.success) {
    console.log(`✅ Commission created: $${commissionResult.commissionAmount}`);
  }

  // ... rest of booking logic ...
}
```

### Step 4: Mark Trip Completed

Add this to your post-travel processing (could be a cron job):

```typescript
// app/api/cron/mark-completed-trips/route.ts
import { markTripCompletedForAffiliate } from '@/lib/affiliates/integration-helpers';

export async function POST(request: Request) {
  // Find bookings where travel_date < NOW() and status = 'confirmed'
  const completedBookings = await getCompletedBookings();

  for (const booking of completedBookings) {
    await markTripCompletedForAffiliate(booking.id);
  }
}
```

### Step 5: Handle Cancellations/Refunds

Add this to your cancellation handler:

```typescript
// app/api/bookings/cancel/route.ts
import { handleBookingCancellationForAffiliate } from '@/lib/affiliates/integration-helpers';

export async function POST(request: Request) {
  const { bookingId } = await request.json();

  // Cancel booking
  await cancelBooking(bookingId);

  // Reverse affiliate commission
  await handleBookingCancellationForAffiliate(bookingId, 'cancelled');
}
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### 1. Affiliate Registration
- [ ] Register new affiliate
- [ ] Verify status = 'pending'
- [ ] Check referral code is unique
- [ ] Confirm email received (if implemented)

#### 2. Click Tracking
- [ ] Visit URL with `?ref=CODE` parameter
- [ ] Verify affiliate_ref cookie is set
- [ ] Check affiliate_referrals table has new record
- [ ] Confirm affiliate.total_clicks incremented

#### 3. User Signup Attribution
- [ ] Sign up with affiliate cookie
- [ ] Verify referral.status changed to 'signed_up'
- [ ] Check referral.user_id is populated

#### 4. Booking & Commission Creation
- [ ] Complete booking with attributed user
- [ ] Verify commission record created
- [ ] Check commission.status = 'pending' or 'booked'
- [ ] Confirm affiliate.pending_balance increased
- [ ] Verify commission calculation is correct

#### 5. Trip Completion
- [ ] Mark trip as completed (manually or via cron)
- [ ] Verify commission.status = 'completed'
- [ ] Check commission.hold_until is set (30 days from now)
- [ ] Confirm affiliate stats updated (completed_trips, monthly_completed_trips)

#### 6. Commission Approval (After Hold Period)
- [ ] Run cron job (or manually set hold_until to past date)
- [ ] Verify commission.status = 'approved'
- [ ] Check commission moved from pending_balance → current_balance

#### 7. Payout Request
- [ ] Request payout (must meet minimum threshold)
- [ ] Verify payout record created
- [ ] Check commissions linked to payout
- [ ] Confirm affiliate.current_balance decreased

#### 8. Admin Payout Processing
- [ ] Admin marks payout as paid
- [ ] Verify commission.status = 'paid'
- [ ] Check affiliate.total_commissions_paid increased

#### 9. Cancellation/Refund
- [ ] Cancel booking with commission
- [ ] Verify commission.reversed = true
- [ ] Check affiliate balance decreased (can go negative)
- [ ] Confirm activity log shows reversal

#### 10. Tier Upgrades
- [ ] Complete enough trips to upgrade tier
- [ ] Verify tier changes automatically
- [ ] Check commission_rate for new bookings uses new tier

### Automated Test Scenarios

```typescript
// Example Jest test
describe('Affiliate Commission Calculator', () => {
  test('calculates commission correctly for commission-based booking', async () => {
    const result = await calculateAndCreateCommission({
      bookingId: 'test-booking-1',
      userId: 'test-user-1',
      customerTotalPaid: 1000,
      supplierCost: 920,
      revenueModel: 'commission',
      bookingDate: new Date(),
      travelDate: new Date('2024-12-01'),
    });

    // Bronze tier (20% of $80 profit) = $16
    expect(result.success).toBe(true);
    expect(result.commissionAmount).toBe(16.00);
  });

  test('calculates commission correctly for markup-based booking', async () => {
    const result = await calculateAndCreateCommission({
      bookingId: 'test-booking-2',
      userId: 'test-user-2',
      customerTotalPaid: 500,
      supplierCost: 450,
      revenueModel: 'markup',
      markup: 50,
      bookingDate: new Date(),
      travelDate: new Date('2024-12-01'),
    });

    // Gold tier (30% of $50 markup) = $15
    expect(result.success).toBe(true);
    expect(result.commissionAmount).toBe(15.00);
  });
});
```

---

## 🚀 Deployment Checklist

### Environment Variables

Add these to your `.env` or Vercel environment:

```bash
# Cron Job Authentication
CRON_SECRET=your_random_secret_here

# Email Service (for notifications)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=affiliates@fly2any.com

# Optional: Admin Dashboard Auth
ADMIN_EMAIL=admin@fly2any.com
```

### Database Migration

```bash
# Already completed - tables created via prisma db push
# Verify with:
npx prisma studio
```

### Vercel Cron Job

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-affiliate-commissions",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs daily at 2:00 AM UTC.

### Post-Deployment Tasks

1. **Approve First Affiliate**
   ```http
   PATCH /api/admin/affiliates/{id}
   { "status": "active" }
   ```

2. **Test End-to-End Flow**
   - Create test affiliate
   - Generate referral link
   - Complete test booking
   - Verify commission created

3. **Monitor Logs**
   - Check Vercel logs for cron job execution
   - Monitor commission processing errors

4. **Set Up Email Notifications** (Optional)
   - New affiliate registration → Admin notification
   - Commission approved → Affiliate notification
   - Payout processed → Affiliate receipt email

---

## 👨‍💼 Admin Panel Guide

### Affiliate Management Workflow

#### 1. Review New Affiliate Applications

```http
GET /api/admin/affiliates?status=pending
```

Review:
- Business name and website
- Tax ID (for compliance)
- Referral code uniqueness

#### 2. Approve or Reject

```http
PATCH /api/admin/affiliates/{id}
{
  "status": "active",
  "notes": "Approved after verification"
}
```

#### 3. Monitor Performance

```http
GET /api/admin/affiliates/{id}
```

Check:
- Conversion rates
- Commission amounts
- Suspicious activity (too many clicks, low conversion)

#### 4. Process Payouts

```http
GET /api/admin/affiliates?sortBy=balance&sortOrder=desc
```

Find affiliates with balance > threshold

```http
POST /api/admin/affiliates/{id}/payouts/process
{
  "payoutId": "payout_123",
  "receiptUrl": "https://...",
  "notes": "Paid via PayPal"
}
```

#### 5. Handle Issues

**Suspend affiliate:**
```http
PATCH /api/admin/affiliates/{id}
{ "status": "suspended", "notes": "Suspicious activity detected" }
```

**Manually adjust tier:**
```http
PATCH /api/admin/affiliates/{id}
{ "tier": "gold", "notes": "Special partnership deal" }
```

---

## 📊 Key Metrics to Monitor

### System Health
- Total active affiliates
- Click-to-signup conversion rate
- Signup-to-booking conversion rate
- Average commission per booking
- Total commissions owed vs paid

### Fraud Detection
- Affiliates with >1000 clicks but 0 conversions
- Same IP address across multiple referrals
- Unusually high refund rates for specific affiliate

### Financial
- Total pending balance across all affiliates
- Total current balance (ready for payout)
- Monthly commission payout trend
- Average time from booking to payout

---

## 🎉 System Complete!

The affiliate program is now fully implemented with:

✅ Database schema
✅ API endpoints (affiliate + admin)
✅ Commission calculator (hybrid model)
✅ Referral tracking
✅ Automated lifecycle management (cron jobs)
✅ Integration helpers
✅ Complete documentation

### Next Steps

1. **Build Frontend UI**
   - Affiliate dashboard page (`/affiliate/dashboard`)
   - Registration page (`/affiliate/register`)
   - Admin panel (`/admin/affiliates`)

2. **Email Notifications**
   - Welcome email on approval
   - Monthly performance reports
   - Payout notifications

3. **Analytics Dashboard**
   - Real-time conversion tracking
   - Affiliate leaderboard
   - Revenue attribution reports

4. **Marketing Materials**
   - Affiliate onboarding guide
   - Promotional banner templates
   - Social media share templates

---

**Questions?** Check the code comments in:
- `lib/affiliates/commission-calculator.ts` - Core logic
- `lib/affiliates/integration-helpers.ts` - Easy integration functions
- `app/api/affiliates/**` - All affiliate endpoints
