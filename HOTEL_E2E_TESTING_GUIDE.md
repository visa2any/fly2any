# 🏨 Hotel Booking E2E Testing Guide
## Complete Customer Journey Testing Plan

---

## 📋 Table of Contents
1. [Quick Setup](#quick-setup)
2. [Testing Environment](#testing-environment)
3. [E2E Customer Journey](#e2e-customer-journey)
4. [Test Scenarios](#test-scenarios)
5. [Known Issues & Fixes](#known-issues--fixes)
6. [Performance Testing](#performance-testing)
7. [Accessibility Testing](#accessibility-testing)

---

## 🚀 Quick Setup

### Environment Variables Required

```bash
# .env.local

# Hotel Search API (choose one)
USE_MOCK_HOTELS=true                    # Use mock data for testing
# OR configure real API:
DUFFEL_API_TOKEN=your_duffel_api_token  # For real hotel data

# Payment Processing (required for booking)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email Notifications (optional for testing)
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@fly2any.com

# Database
DATABASE_URL=your_postgres_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### Start Development Server

```bash
cd C:\Users\Power\fly2any-fresh
npm run dev
```

Server will start at: http://localhost:3000

---

## 🧪 Testing Environment

### Browser DevTools Setup

1. **Open DevTools**: F12 or Ctrl+Shift+I
2. **Console Tab**: Monitor API calls and errors
3. **Network Tab**: Track API requests/responses
4. **Application Tab**: Check localStorage, cookies, session data
5. **Lighthouse Tab**: Performance and accessibility audits

### Recommended Test Browsers

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (Chrome Android, Safari iOS)

---

## 🛤️ E2E Customer Journey

### Phase 1: Hotel Search

**Starting Point**: `/hotels` or homepage

#### Test Steps:

1. **Navigate to Hotel Search**
   ```
   URL: http://localhost:3000/hotels
   ```

2. **Fill Search Form**
   - **Destination**: Enter "New York" or any city
   - **Check-in Date**: Today + 3 days (minimum)
   - **Check-out Date**: Check-in + 2 nights
   - **Guests**: 2 adults, 0 children
   - **Rooms**: 1

3. **Submit Search**
   - Click "Search Hotels" button
   - Should redirect to: `/hotels/results?destination=New+York&checkIn=...`

4. **Verify Results Page Loads**
   - ✅ Loading spinner appears
   - ✅ Search summary displayed (dates, guests, destination)
   - ✅ Hotels list renders (or "No hotels found" message)
   - ✅ Filters sidebar (desktop) / Filter button (mobile)
   - ✅ Sort options (Best Value, Lowest Price, etc.)

#### Expected Behavior:

```javascript
// API Call (check Network tab)
GET /api/hotels/search?query=New+York&checkIn=2025-11-19&checkOut=2025-11-24&adults=2&children=0&rooms=1&currency=USD&limit=50

// Expected Response Structure
{
  "success": true,
  "data": [
    {
      "id": "hotel_123",
      "name": "The Plaza Hotel",
      "star_rating": 5,
      "reviews": {
        "score": 8.9,
        "count": 1250
      },
      "rates": [
        {
          "id": "rate_456",
          "total_amount": "350.00",
          "currency": "USD",
          "board_type": "room_only",
          "refundable": true
        }
      ],
      "amenities": ["WiFi", "Pool", "Gym"],
      "property_type": "hotel"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1
  }
}
```

---

### Phase 2: Browse & Filter

#### Test Steps:

1. **Test Sort Options** (click each pill)
   - Best Value → Balanced score (rating + price)
   - Lowest Price → Cheapest first
   - Highest Rating → Best reviews first
   - Nearest → Closest to center
   - Most Popular → High booking activity
   - Best Deals → Highest savings %
   - Top Rated → Star rating + review score

2. **Test Filters** (sidebar or mobile sheet)
   - **Price Range**: Drag slider (e.g., $100-$300)
   - **Star Rating**: Check boxes (3★, 4★, 5★)
   - **Guest Rating**: Minimum score (e.g., 8.0+)
   - **Amenities**: WiFi, Pool, Parking, Gym
   - **Property Types**: Hotel, Resort, B&B
   - **Meal Plans**: Room Only, Breakfast Included
   - **Cancellation**: Free Cancellation, Non-Refundable

3. **Test Mobile Experience**
   - Tap "Filters" button (bottom-right on mobile)
   - Bottom sheet slides up
   - Apply filters → Sheet closes
   - Clear filters → Reset all

4. **Test Infinite Scroll**
   - Scroll to bottom of hotel list
   - Auto-loads next 20 hotels
   - Loading indicator appears
   - "All X hotels loaded" message at end

---

### Phase 3: Hotel Details

#### Test Steps:

1. **Click Hotel Card** → Navigate to `/hotels/[id]`
   ```
   URL: /hotels/hotel_123?checkIn=2025-11-19&checkOut=2025-11-24&adults=2&children=0&rooms=1
   ```

2. **Verify Hotel Detail Page**
   - ✅ Hotel name, star rating, review score
   - ✅ Image gallery (main + thumbnails)
   - ✅ Room types and rates
   - ✅ Amenities list
   - ✅ Location map (if configured)
   - ✅ Guest reviews
   - ✅ "Book Now" button

3. **Select Room Type**
   - Click different room options
   - Compare prices (room only vs. breakfast included)
   - Check cancellation policy
   - Click "Select Room"

---

### Phase 4: Booking Flow

#### Test Steps:

1. **Click "Select Room"** or "Book Now"
   - If **not authenticated** → Auth modal appears
   - If **authenticated** → Proceed to booking

2. **Authentication Test** (if needed)
   - **Option A**: Google OAuth (one-click)
   - **Option B**: Email/Password (sign in or sign up)
   - After auth → Modal closes → Booking continues

3. **Fill Guest Details Form**
   ```
   Primary Guest:
   - Title: Mr / Ms / Mrs / Dr
   - First Name: John
   - Last Name: Doe
   - Email: test@example.com
   - Phone: +1234567890
   - Date of Birth: 1990-01-01 (optional)

   Additional Guests (if rooms > 1):
   - Guest 2, Guest 3, etc.

   Special Requests:
   - "Early check-in preferred" (optional)
   ```

4. **Payment Information**
   - Card number: 4242 4242 4242 4242 (Stripe test card)
   - Expiry: 12/25
   - CVC: 123
   - Cardholder name: John Doe

5. **Review Booking Summary**
   - Hotel name and address
   - Room type
   - Check-in / Check-out dates
   - Number of nights
   - Price breakdown:
     - Price per night × nights
     - Taxes & fees
     - **Total**

6. **Submit Booking**
   - Click "Confirm & Pay" button
   - Loading spinner appears
   - Payment processed via Stripe
   - Booking created in database

---

### Phase 5: Confirmation

#### Test Steps:

1. **Verify Confirmation Page**
   ```
   URL: /account/bookings/[booking_id]
   ```
   - ✅ Booking confirmation number (e.g., FLY2ANY-ABC123)
   - ✅ Hotel details
   - ✅ Guest information
   - ✅ Payment status: "Completed"
   - ✅ "Download Itinerary" button
   - ✅ "Cancel Booking" button (if cancellable)

2. **Test Email Confirmation**
   - Check email inbox (test@example.com)
   - Should receive:
     - ✅ Booking confirmation email
     - ✅ Booking details (hotel, dates, confirmation number)
     - ✅ Total paid amount
     - ✅ PDF attachment (itinerary)

3. **Download Itinerary**
   - Click "Download Itinerary" button
   - Downloads text file: `Fly2Any-Booking-FLY2ANY-ABC123.txt`
   - Contains:
     - Confirmation number
     - Hotel information
     - Check-in/check-out times
     - Guest details
     - Payment summary
     - Important information
     - Contact details

---

## 🧩 Test Scenarios

### Scenario 1: Happy Path (Complete Booking)

✅ **Expected Result**: User completes booking from search to payment

1. Search for hotels in "Paris"
2. Filter: 4-star hotels, $150-$300/night
3. Sort by "Best Deals"
4. Select "Hotel Continental"
5. Choose "Deluxe Room - Breakfast Included"
6. Sign in with Google
7. Fill guest details
8. Pay with test card
9. Receive confirmation email
10. Download itinerary

**Success Criteria**:
- ✅ Booking ID created in database
- ✅ Payment intent status: "succeeded"
- ✅ Email sent successfully
- ✅ User can view booking in `/account/bookings`

---

### Scenario 2: Guest Checkout (No Account)

⚠️ **Expected Result**: User can book without creating account (if implemented)

1. Search hotels
2. Select hotel
3. Skip authentication (if "Continue as Guest" option exists)
4. Fill email for confirmation
5. Complete payment
6. Receive email confirmation

**Note**: Currently requires authentication. Consider adding guest checkout for higher conversion.

---

### Scenario 3: Multi-Room Booking

✅ **Expected Result**: Book 2+ rooms with multiple guests

1. Search: 2 adults + 2 children, 2 rooms
2. Select hotel
3. Choose room type (×2)
4. Add guest details for all travelers
5. Complete booking

**Success Criteria**:
- ✅ Correct pricing (×2 rooms)
- ✅ All guests listed in booking
- ✅ Children ages captured (if applicable)

---

### Scenario 4: Cancellation Flow

✅ **Expected Result**: User can cancel cancellable bookings

1. Navigate to `/account/bookings`
2. Select a booking
3. Click "Cancel Booking"
4. Confirm cancellation
5. Verify:
   - Status changes to "Cancelled"
   - Refund processed (if eligible):
     - 7+ days before: 100% refund
     - 3-6 days before: 50% refund
     - <3 days before: No refund
   - Cancellation email sent

---

### Scenario 5: Mobile Responsive Journey

✅ **Expected Result**: Seamless experience on mobile devices

**Test on**:
- iPhone 12 Pro (390×844)
- Samsung Galaxy S21 (360×800)
- iPad Pro (1024×1366)

**Check**:
- ✅ Touch-friendly buttons (min 44×44px)
- ✅ Filter bottom sheet (not sidebar)
- ✅ Horizontal scroll for images
- ✅ Readable text (16px+ body)
- ✅ Easy form filling
- ✅ Smooth animations

---

## 🚨 Known Issues & Fixes

### Issue 1: "No Hotels Found"

**Symptoms**:
```
No hotels found
We couldn't find any hotels matching your search criteria.
```

**Root Cause**: `USE_MOCK_HOTELS` environment variable not set.

**Fix**:
```bash
# Add to .env.local
USE_MOCK_HOTELS=true
```

Then restart server:
```bash
npm run dev
```

---

### Issue 2: DialogContent Accessibility Warnings

**Console Warning**:
```
`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

**Impact**: Screen readers cannot properly announce dialog content.

**Fix**: Add `DialogTitle` and `DialogDescription` components (implemented in separate commit).

---

### Issue 3: Stripe Cookie Warnings

**Console Warning**:
```
Acesso a cookies ou armazenamento particionado foi fornecido para "https://m.stripe.network/inner.html"
```

**Impact**: Informational only. Stripe uses third-party iframes for security.

**Action**: No fix needed. This is normal behavior.

---

### Issue 4: Vercel Live Feedback Cookies

**Console Warning**:
```
Acesso a cookies ou armazenamento particionado foi fornecido para "https://vercel.live/_next-live/feedback/feedback.html"
```

**Impact**: Vercel's live feedback feature in preview deployments.

**Action**: No fix needed. Only appears in Vercel preview builds.

---

## ⚡ Performance Testing

### Metrics to Measure

Use **Chrome DevTools → Lighthouse**:

#### Performance Targets:
- ✅ **FCP** (First Contentful Paint): <1.8s
- ✅ **LCP** (Largest Contentful Paint): <2.5s
- ✅ **TTI** (Time to Interactive): <3.8s
- ✅ **CLS** (Cumulative Layout Shift): <0.1
- ✅ **Speed Index**: <3.4s

#### Optimization Checklist:
- ✅ Images lazy-loaded (Next.js Image component)
- ✅ API responses cached (15 min Redis TTL)
- ✅ Infinite scroll prevents initial data overload
- ✅ Critical CSS inlined
- ✅ JavaScript code-split by route

---

## ♿ Accessibility Testing

### WCAG 2.1 AA Compliance

#### Keyboard Navigation Test:
1. Tab through all interactive elements
2. Verify focus indicators visible
3. Test modal/dialog focus trapping
4. Ensure Esc key closes modals

#### Screen Reader Test (NVDA / JAWS / VoiceOver):
1. Navigate search form
2. Read hotel card information
3. Interact with filters
4. Complete booking flow
5. Verify form error announcements

#### Color Contrast:
- ✅ Text on white: 4.5:1 ratio minimum
- ✅ Orange buttons on white: Verified
- ✅ Link colors distinguishable

#### Touch Targets:
- ✅ All buttons minimum 44×44px
- ✅ Adequate spacing (8px+)

---

## 🔍 Debugging Tips

### Network Tab Analysis

**Filter by**:
- `Fetch/XHR` → API calls only
- `Status: 404` → Missing endpoints
- `Status: 500` → Server errors

### Console Debugging

Enable verbose logging:
```javascript
// In browser console
localStorage.debug = '*'
location.reload()
```

### API Testing with cURL

```bash
# Test hotel search
curl -X GET "http://localhost:3000/api/hotels/search?query=New+York&checkIn=2025-11-19&checkOut=2025-11-24&adults=2&children=0&limit=10" \
  -H "Content-Type: application/json"

# Test booking creation
curl -X POST "http://localhost:3000/api/hotels/booking/create" \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": "quote_123",
    "payment": {
      "type": "card",
      "amount": "350.00",
      "currency": "USD",
      "card": {
        "number": "4242424242424242",
        "expiryMonth": "12",
        "expiryYear": "2025",
        "cvc": "123",
        "holderName": "John Doe"
      }
    },
    "guests": [{
      "givenName": "John",
      "familyName": "Doe",
      "type": "adult",
      "title": "mr"
    }],
    "email": "test@example.com",
    "phoneNumber": "+1234567890"
  }'
```

---

## 📊 Success Metrics

### Conversion Funnel:

1. **Search Page** → 100% (baseline)
2. **Results Page** → 85% (search submitted)
3. **Hotel Detail** → 60% (hotel clicked)
4. **Booking Form** → 40% (room selected)
5. **Payment** → 25% (details filled)
6. **Confirmation** → 20% (booking completed)

**Target Conversion Rate**: 20% (search → booking)

### Key Performance Indicators:

- ✅ Average booking value: $150-$200
- ✅ Search-to-book time: <10 minutes
- ✅ Mobile conversion: 30%+ of total
- ✅ Return visitor rate: 40%+
- ✅ Booking cancellation rate: <5%

---

## 🎯 Automated Testing (Future)

### Playwright E2E Tests

```typescript
// Example test structure
test('Complete hotel booking flow', async ({ page }) => {
  // 1. Search
  await page.goto('/hotels');
  await page.fill('[name="destination"]', 'New York');
  await page.click('button[type="submit"]');

  // 2. Select hotel
  await page.waitForSelector('.hotel-card');
  await page.click('.hotel-card:first-child .select-button');

  // 3. Auth
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Test123!');
  await page.click('button:has-text("Sign In")');

  // 4. Payment
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.fill('[name="expiry"]', '12/25');
  await page.fill('[name="cvc"]', '123');

  // 5. Confirm
  await page.click('button:has-text("Confirm & Pay")');

  // 6. Verify
  await expect(page.locator('.confirmation-number')).toBeVisible();
});
```

---

## 📞 Support & Troubleshooting

### Common Issues:

**Q: Hotels not loading?**
A: Set `USE_MOCK_HOTELS=true` in `.env.local`

**Q: Payment failing?**
A: Ensure `STRIPE_SECRET_KEY` is configured. Use test card: 4242 4242 4242 4242

**Q: Email not sending?**
A: Configure `RESEND_API_KEY` or check logs for email service errors

**Q: Database errors?**
A: Run `npx prisma migrate dev` to sync schema

**Q: TypeScript errors?**
A: Run `npx tsc --noEmit` to check for type issues

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured in Vercel
- [ ] Database migrations applied
- [ ] Stripe webhook endpoints configured
- [ ] Email service verified (send test email)
- [ ] Mock data disabled (`USE_MOCK_HOTELS=false`)
- [ ] Real Duffel API token configured
- [ ] Lighthouse score >90 on all pages
- [ ] Accessibility audit passed
- [ ] Mobile testing completed on real devices
- [ ] Payment flow tested with real test card
- [ ] Booking confirmation emails working
- [ ] Cancellation flow tested
- [ ] Error tracking configured (Sentry/LogRocket)

---

**🎉 You're ready to test the complete hotel booking journey!**

For questions or issues, check:
- GitHub Issues: https://github.com/visa2any/fly2any/issues
- Documentation: https://docs.claude.com/en/docs/claude-code/

---

*Generated by Claude Code*
*Last Updated: 2025-01-15*
