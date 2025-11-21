# Affiliate System - Quick Start Integration Guide

## 🚀 5-Minute Integration

This guide shows you exactly where to add affiliate tracking to your existing Fly2Any codebase.

---

## Step 1: Track Clicks (2 minutes)

**File:** `app/layout.tsx` or create `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const refCode = searchParams.get('ref');

  if (refCode) {
    // Track the click
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/affiliates/track-click`, {
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

      if (response.ok) {
        const { data } = await response.json();

        // Set cookie
        const res = NextResponse.next();
        res.cookies.set('affiliate_ref', `${data.clickId}|${refCode}`, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        return res;
      }
    } catch (error) {
      console.error('Failed to track affiliate click:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/flights/:path*', '/hotels/:path*'],
};
```

**Test it:** Visit `https://yoursite.com?ref=TESTCODE` and check browser cookies.

---

## Step 2: Link Signups (1 minute)

**File:** Find your user registration endpoint (e.g., `app/api/auth/register/route.ts`)

Add this RIGHT AFTER creating the user account:

```typescript
import { linkUserSignupToReferral } from '@/lib/affiliates/integration-helpers';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();

  // ... your existing user creation code ...
  const newUser = await prisma.user.create({ /* ... */ });

  // 👇 ADD THIS - Link to affiliate if cookie exists
  const affiliateCookie = cookies().get('affiliate_ref')?.value;
  if (affiliateCookie) {
    const [clickId] = affiliateCookie.split('|');
    await linkUserSignupToReferral(newUser.id, clickId);
    console.log(`✅ User ${newUser.id} linked to affiliate`);
  }

  // ... rest of your signup logic ...
}
```

**Test it:** Sign up with affiliate cookie and check `affiliate_referrals` table.

---

## Step 3: Create Commissions on Booking (1 minute)

**File:** Find your booking creation endpoint (e.g., `app/api/bookings/create/route.ts`)

Add this RIGHT AFTER payment confirmation:

```typescript
import { processAffiliateCommissionForBooking } from '@/lib/affiliates/integration-helpers';

export async function POST(request: Request) {
  // ... your existing booking creation code ...
  const booking = await prisma.booking.create({ /* ... */ });

  // ... payment processing ...
  const paymentConfirmed = await processPayment(booking);

  if (paymentConfirmed) {
    // 👇 ADD THIS - Process affiliate commission
    const commissionResult = await processAffiliateCommissionForBooking({
      bookingId: booking.id,
      userId: booking.userId,
      customerTotalPaid: booking.totalPrice,
      supplierCost: booking.supplierCost,
      revenueModel: booking.isMarkupBased ? 'markup' : 'commission',
      markup: booking.markup, // if applicable
      bookingDate: new Date(),
      travelDate: booking.departureDate,
    });

    if (commissionResult.success) {
      console.log(`✅ Affiliate commission: $${commissionResult.commissionAmount}`);
    }
  }

  // ... rest of booking logic ...
}
```

**Important:** Make sure your booking records store `supplierCost` and `markup` (if applicable).

**Test it:** Complete a booking with an attributed user and check `commissions` table.

---

## Step 4: Mark Trips Completed (1 minute)

**Option A: Add to existing post-travel cron job**

If you already have a job that marks trips as completed:

```typescript
import { markTripCompletedForAffiliate } from '@/lib/affiliates/integration-helpers';

// Inside your existing cron job
for (const booking of completedBookings) {
  // ... your existing completion logic ...

  // 👇 ADD THIS
  await markTripCompletedForAffiliate(booking.id);
}
```

**Option B: Use the affiliate cron job**

The affiliate system's cron job (`/api/cron/process-affiliate-commissions`) can handle this if you:

1. Add a `completed_at` field to your bookings table
2. Set it when `travel_date + 1 day` passes
3. The cron job will automatically process commissions

**Test it:** Manually set `travel_date` to yesterday and run cron job.

---

## Step 5: Handle Cancellations (1 minute)

**File:** Find your booking cancellation endpoint

Add this:

```typescript
import { handleBookingCancellationForAffiliate } from '@/lib/affiliates/integration-helpers';

export async function POST(request: Request) {
  const { bookingId } = await request.json();

  // ... your existing cancellation logic ...
  await cancelBooking(bookingId);

  // 👇 ADD THIS - Reverse affiliate commission
  await handleBookingCancellationForAffiliate(bookingId, 'cancelled');

  // ... rest of cancellation logic ...
}
```

Do the same for refund endpoints:

```typescript
await handleBookingCancellationForAffiliate(bookingId, 'refunded');
```

**Test it:** Cancel a booking with a commission and check affiliate balance decreased.

---

## ✅ You're Done!

The affiliate system is now fully integrated. Here's what happens automatically:

1. ✅ Clicks tracked when users arrive with `?ref=CODE`
2. ✅ Signups linked to affiliates via cookie
3. ✅ Commissions created on booking
4. ✅ Trips marked completed after travel
5. ✅ Commissions approved after 30-day hold
6. ✅ Tiers upgraded based on performance
7. ✅ Monthly stats reset on 1st of month

---

## 🧪 Quick Test

1. **Create Test Affiliate:**
   ```bash
   curl -X POST http://localhost:3000/api/affiliates/register \
     -H "Content-Type: application/json" \
     -d '{"payoutEmail": "test@example.com", "referralCode": "TESTREF"}'
   ```

2. **Approve Affiliate (as admin):**
   ```bash
   curl -X PATCH http://localhost:3000/api/admin/affiliates/{affiliateId} \
     -H "Content-Type: application/json" \
     -d '{"status": "active"}'
   ```

3. **Test Click Tracking:**
   - Visit: `http://localhost:3000?ref=TESTREF`
   - Check cookie in browser DevTools

4. **Complete Full Flow:**
   - Sign up new user (with cookie)
   - Create booking (commission created)
   - Mark trip completed (hold period starts)
   - Run cron job (approves commission after 30 days)
   - Request payout

---

## 📊 Monitor Your Affiliates

**Dashboard (for affiliates):**
- Create page at `/affiliate/dashboard`
- Fetch data from: `GET /api/affiliates/me/dashboard`

**Admin Panel:**
- Create page at `/admin/affiliates`
- Fetch data from: `GET /api/admin/affiliates`

**Example Admin Dashboard:**

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState([]);

  useEffect(() => {
    fetch('/api/admin/affiliates?status=active&sortBy=balance&sortOrder=desc')
      .then(res => res.json())
      .then(data => setAffiliates(data.data.affiliates));
  }, []);

  return (
    <div>
      <h1>Affiliate Partners</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Tier</th>
            <th>Trips</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {affiliates.map(a => (
            <tr key={a.id}>
              <td>{a.businessName || a.userName}</td>
              <td>{a.tier}</td>
              <td>{a.metrics.completedTrips}</td>
              <td>${a.financials.currentBalance.toFixed(2)}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Commission not created?
- Check if user has `affiliate_referrals` record
- Verify cookie was set correctly
- Ensure affiliate status is 'active'

### Balance not updating?
- Check `commissions.status` - must be 'approved' to move to current_balance
- Run cron job: `curl -X POST http://localhost:3000/api/cron/process-affiliate-commissions -H "Authorization: Bearer YOUR_CRON_SECRET"`

### Payout request failing?
- Verify balance >= minPayoutThreshold
- Check affiliate status is 'active'
- Ensure there are commissions with status='approved'

---

## 📚 Full Documentation

For complete details, see: [AFFILIATE_SYSTEM.md](./AFFILIATE_SYSTEM.md)

---

## 🎯 Summary

**Files Modified:**
- `middleware.ts` - Click tracking
- `app/api/auth/register/route.ts` - Link signups
- `app/api/bookings/create/route.ts` - Create commissions
- `app/api/bookings/cancel/route.ts` - Reverse commissions

**New Dependencies:**
```typescript
import { linkUserSignupToReferral, processAffiliateCommissionForBooking, markTripCompletedForAffiliate, handleBookingCancellationForAffiliate } from '@/lib/affiliates/integration-helpers';
```

**Environment Variables Needed:**
```bash
CRON_SECRET=your_secret_here
```

**That's it!** The affiliate system is production-ready. 🚀
