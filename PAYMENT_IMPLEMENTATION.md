# Payment Gateway Implementation Guide

Complete payment processing system with Stripe + Duffel Payments and order holds with tiered pricing.

## Overview

This implementation provides:
- **Stripe Payment Gateway**: Secure credit/debit card payments with 3D Secure support
- **Duffel Payments Integration**: Airline-specific payment processing
- **Order Holds**: Tiered pricing system for reserving bookings without immediate payment
- **PCI Compliance**: Secure payment handling with Stripe Elements
- **3D Secure Authentication**: Built-in support for enhanced security
- **Real-time Payment Confirmation**: Instant booking updates
- **Webhook Processing**: Automated payment status updates

---

## Files Created/Modified

### 1. Payment Service
**Location**: `lib/payments/payment-service.ts`

Core payment processing service that handles:
- Payment intent creation with Stripe
- Payment confirmation and status tracking
- Refund processing
- Hold pricing calculation (tiered: Free, $15, $25, $50)
- Webhook signature verification
- Duffel Payments integration

**Key Methods**:
```typescript
- createPaymentIntent(data: PaymentIntentData): Promise<PaymentConfirmation>
- confirmPayment(paymentIntentId: string): Promise<PaymentConfirmation>
- processRefund(data: RefundData): Promise<any>
- calculateHoldPricing(holdDurationHours: number): HoldPricing
- verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event
- handleWebhookEvent(event: Stripe.Event): Promise<void>
```

---

### 2. Payment API Routes

#### Create Payment Intent
**Location**: `app/api/payments/create-intent/route.ts`

Creates a Stripe payment intent for processing payments.

**Endpoint**: `POST /api/payments/create-intent`

**Request Body**:
```json
{
  "amount": 299.99,
  "currency": "USD",
  "bookingReference": "FLY2A-ABC123",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "description": "Flight booking",
  "metadata": {
    "flightOfferId": "offer_123",
    "passengerCount": "2"
  }
}
```

**Response**:
```json
{
  "success": true,
  "paymentIntent": {
    "paymentIntentId": "pi_1234567890",
    "clientSecret": "pi_1234567890_secret_abcdef",
    "amount": 299.99,
    "currency": "USD",
    "status": "requires_payment_method"
  }
}
```

#### Confirm Payment
**Location**: `app/api/payments/confirm/route.ts`

Confirms payment after 3D Secure authentication and updates booking status.

**Endpoint**: `POST /api/payments/confirm`

**Request Body**:
```json
{
  "paymentIntentId": "pi_1234567890",
  "bookingReference": "FLY2A-ABC123"
}
```

**Response**:
```json
{
  "success": true,
  "payment": {
    "paymentIntentId": "pi_1234567890",
    "status": "succeeded",
    "amount": 299.99,
    "currency": "USD",
    "last4": "4242",
    "brand": "visa"
  },
  "booking": {
    "id": "booking_123",
    "bookingReference": "FLY2A-ABC123",
    "status": "confirmed"
  }
}
```

#### Webhook Handler
**Location**: `app/api/payments/webhook/route.ts`

Processes webhook events from Stripe for automatic payment updates.

**Endpoint**: `POST /api/payments/webhook`

**Handled Events**:
- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed
- `payment_intent.requires_action`: 3D Secure required
- `charge.refunded`: Refund processed

**Security**: Verifies Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`

---

### 3. Hold Pricing Logic

**Location**: `lib/api/duffel.ts`

Added methods for order holds with tiered pricing:

**Hold Pricing Tiers**:
- **0-6 hours**: $19.99 - Quick decision hold
- **6-24 hours**: $39.99 - Standard hold
- **24-48 hours**: $59.99 - Extended hold
- **48-72 hours**: $89.99 - Maximum hold (3 days)

**Methods Added**:
```typescript
- createHoldOrder(offerRequest: any, passengers: any[], holdDurationHours?: number)
- calculateHoldPricing(holdDurationHours: number): HoldPricing
- getHoldDurationTiers(): Array<HoldTier>
```

---

### 4. Updated Booking Route

**Location**: `app/api/flights/booking/create/route.ts`

**Changes**:
1. Added payment service import
2. Added `isHold` and `holdDuration` parameters
3. Replaced mock payment with real Stripe payment intent creation
4. Integrated hold vs instant booking logic
5. Added payment intent to booking response
6. Updated database booking creation with hold information

**New Request Parameters**:
```typescript
{
  isHold?: boolean,           // Whether to hold the booking
  holdDuration?: number       // Hold duration in hours (6, 24, 48, or 72)
}
```

**Enhanced Response**:
```json
{
  "success": true,
  "booking": {
    "id": "booking_123",
    "bookingReference": "FLY2A-ABC123",
    "status": "PENDING_PAYMENT",
    "paymentIntentId": "pi_1234567890",
    "clientSecret": "pi_1234567890_secret_abcdef",
    "isHold": false,
    "totalPrice": 299.99,
    "currency": "USD"
  }
}
```

---

### 5. Enhanced ReviewAndPay Component

**New Component**: `components/booking/ReviewAndPayEnhanced.tsx`

Features:
- **Pay Now vs Hold Toggle**: Switch between immediate payment and hold booking
- **Hold Duration Selector**: Choose from 4 tiered pricing options
- **Stripe Elements Integration**: Secure card input with PCI compliance
- **3D Secure Support**: Automatic handling of authentication flows
- **Hold Expiration Countdown**: Real-time display of hold expiration time
- **Existing Design Maintained**: All previous styling preserved

**New Component**: `components/booking/StripePaymentForm.tsx`

Stripe payment form with:
- Stripe Elements integration
- 3D Secure authentication support
- Real-time payment processing
- Error handling and validation
- Return URL configuration for redirects

**Usage Example**:
```tsx
<ReviewAndPayEnhanced
  flightSummary={flightSummary}
  totalPrice={totalPrice}
  currency="USD"
  onSubmit={handlePaymentSubmit}
  onPaymentSuccess={handlePaymentSuccess}
  clientSecret={paymentIntent?.clientSecret}
  bookingReference={booking.bookingReference}
  requiresDOTCompliance={true}
/>
```

---

### 6. Payment Confirmation Page

**Location**: `app/payments/confirm/[paymentId]/page.tsx`

Handles payment confirmation after 3D Secure redirect.

**Features**:
- Automatic payment confirmation on page load
- Success/Failure/Processing states with visual feedback
- Booking reference display
- Payment details summary
- Navigation to booking details or retry payment
- Mobile-responsive design

**URL Parameters**:
- `payment_intent`: Stripe payment intent ID (from redirect)
- `booking_reference`: Booking reference number

---

### 7. Updated Booking Types

**Location**: `lib/bookings/types.ts`

**Added to PaymentInfo**:
```typescript
interface PaymentInfo {
  paymentIntentId?: string;  // Stripe payment intent ID
  clientSecret?: string;      // Stripe client secret
  // ... existing fields
}
```

**Added to Booking**:
```typescript
interface Booking {
  // Hold Booking Information
  isHold?: boolean;
  holdDuration?: number;
  holdPrice?: number;
  holdExpiresAt?: string;
  holdTier?: 'free' | 'short' | 'medium' | 'long';
  // ... existing fields
}
```

---

## Environment Variables

**Required**:
```env
# Stripe (Client-side - safe to expose)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Stripe (Server-side - NEVER expose)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Duffel (Already configured)
DUFFEL_ACCESS_TOKEN=duffel_test_...
```

Copy `.env.payment.example` to `.env.local` and fill in your keys.

---

## Setup Instructions

### 1. Install Dependencies

Already installed:
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Configure Stripe

1. Create account at https://stripe.com
2. Get test API keys from https://dashboard.stripe.com/test/apikeys
3. Add keys to `.env.local`

### 3. Configure Webhooks (Development)

**Option A: Using ngrok (Recommended)**:
```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Start your dev server
npm run dev

# In another terminal, expose localhost
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Option B: Using Stripe CLI**:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

**Register Webhook in Stripe Dashboard**:
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-ngrok-url.ngrok.io/api/payments/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.requires_action`
   - `charge.refunded`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Configure Webhooks (Production)

1. Use your production domain: `https://your-domain.com/api/payments/webhook`
2. Switch to live API keys (pk_live_... and sk_live_...)
3. Ensure HTTPS is enabled
4. Register webhook in production Stripe dashboard

---

## Testing

### Test Cards

**Success**:
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
ZIP: Any ZIP code (e.g., 12345)
```

**Requires 3D Secure**:
```
Card: 4000 0025 0000 3155
Expiry: Any future date
CVV: Any 3 digits
ZIP: Any ZIP code
```

**Declined**:
```
Card: 4000 0000 0000 0002
```

**Insufficient Funds**:
```
Card: 4000 0000 0000 9995
```

### Test Flow

1. **Instant Booking**:
   - Select "Pay Now"
   - Enter test card details
   - Submit payment
   - Verify payment intent created
   - Confirm payment
   - Check booking status updated

2. **Hold Booking**:
   - Select "Hold Booking"
   - Choose hold duration (6h, 24h, 48h, 72h)
   - Submit hold request
   - Verify hold created
   - Check hold expiration time
   - Later: Complete payment before expiration

3. **3D Secure Flow**:
   - Use 3D Secure test card
   - Enter card details
   - Submit payment
   - Redirected to authentication page
   - Complete authentication
   - Redirected to confirmation page
   - Verify payment succeeded

---

## Payment Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Create booking
       ▼
┌─────────────────────────────┐
│ POST /api/flights/booking/  │
│          create              │
└──────────┬──────────────────┘
           │
           │ 2. Create payment intent (if Pay Now)
           │    or calculate hold pricing (if Hold)
           ▼
┌─────────────────────────────┐
│  Payment Service            │
│  - Stripe: Create intent    │
│  - Duffel: Calculate hold   │
└──────────┬──────────────────┘
           │
           │ 3. Return client secret + booking
           ▼
┌─────────────┐
│   Client    │
│  - Displays │
│    Stripe   │
│   Elements  │
└──────┬──────┘
       │
       │ 4. Confirm payment (if Pay Now)
       ▼
┌─────────────────────────────┐
│  Stripe                     │
│  - Process payment          │
│  - 3D Secure (if required)  │
└──────────┬──────────────────┘
           │
           │ 5. Redirect to confirmation
           ▼
┌─────────────────────────────┐
│ /payments/confirm/[id]      │
│  - Fetch payment status     │
│  - Update booking status    │
└──────────┬──────────────────┘
           │
           │ 6. Webhook notification (async)
           ▼
┌─────────────────────────────┐
│ POST /api/payments/webhook  │
│  - Verify signature         │
│  - Update booking status    │
│  - Send confirmation email  │
└─────────────────────────────┘
```

---

## Security Considerations

1. **PCI Compliance**:
   - Stripe Elements handles card data directly
   - No card numbers stored on your server
   - Stripe is PCI DSS Level 1 certified

2. **API Key Security**:
   - Never expose secret keys in client-side code
   - Use `NEXT_PUBLIC_` prefix only for public keys
   - Rotate keys regularly

3. **Webhook Security**:
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Implement idempotency for webhook handlers

4. **3D Secure**:
   - Automatically enabled for supported cards
   - Reduces fraud and chargebacks
   - Required by Strong Customer Authentication (SCA)

5. **HTTPS**:
   - Required in production
   - Protects data in transit
   - Required for Stripe payment processing

---

## Hold Booking Logic

### Pricing Tiers

| Duration | Price | Description |
|----------|-------|-------------|
| 0-6 hours | $19.99 | Quick decision hold |
| 6-24 hours | $39.99 | Standard hold |
| 24-48 hours | $59.99 | Extended hold |
| 48-72 hours | $89.99 | Maximum hold (3 days) |

### Hold Flow

1. **Create Hold**:
   - User selects "Hold Booking"
   - Chooses hold duration
   - Pays hold fee (or free for 6h)
   - Booking reserved without flight payment

2. **Hold Active**:
   - Countdown timer displayed
   - Email reminders sent
   - Can complete payment anytime

3. **Complete Payment**:
   - Before expiration: Pay full flight price
   - After expiration: Booking released, hold fee refunded

4. **Expiration**:
   - Hold expires after duration
   - Booking automatically released
   - Hold fee refunded if not used

---

## Error Handling

### Payment Errors

```typescript
// Insufficient funds
{
  error: 'PAYMENT_FAILED',
  message: 'Your card has insufficient funds.'
}

// Card declined
{
  error: 'PAYMENT_FAILED',
  message: 'Your card was declined.'
}

// 3D Secure failed
{
  error: 'PAYMENT_FAILED',
  message: '3D Secure authentication failed.'
}
```

### Booking Errors

```typescript
// Price changed
{
  error: 'PRICE_CHANGED',
  message: 'The price for this flight has changed.',
  originalPrice: 299.99,
  currentPrice: 319.99
}

// Sold out
{
  error: 'SOLD_OUT',
  message: 'This flight is no longer available.'
}
```

---

## API Reference

### Payment Service Methods

```typescript
// Create payment intent
const intent = await paymentService.createPaymentIntent({
  amount: 299.99,
  currency: 'USD',
  bookingReference: 'FLY2A-ABC123',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  description: 'Flight booking',
});

// Confirm payment
const confirmation = await paymentService.confirmPayment('pi_1234567890');

// Process refund
const refund = await paymentService.processRefund({
  paymentIntentId: 'pi_1234567890',
  amount: 299.99, // Optional: Partial refund
  reason: 'requested_by_customer',
});

// Calculate hold pricing
const pricing = paymentService.calculateHoldPricing(24); // 24 hours
// Returns: { duration: 24, price: 15, currency: 'USD', tier: 'short' }
```

---

## Troubleshooting

### Payment Not Processing

1. Check Stripe API keys in `.env.local`
2. Verify `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` is set
3. Check browser console for errors
4. Verify Stripe Elements loaded correctly

### Webhook Not Receiving Events

1. Verify webhook URL is correct
2. Check webhook signing secret matches
3. Ensure HTTPS for production
4. Check Stripe dashboard webhook logs

### 3D Secure Not Working

1. Verify return URL is correct
2. Check for popup blockers
3. Test with 3D Secure test card (4000 0025 0000 3155)
4. Ensure HTTPS in production

### Hold Booking Not Creating

1. Verify Duffel API initialized
2. Check hold duration is valid (6, 24, 48, or 72)
3. Verify `isHold` parameter sent correctly
4. Check Duffel API supports pay_later orders

---

## Production Checklist

- [ ] Switch to live Stripe API keys
- [ ] Register production webhook URL
- [ ] Enable HTTPS on domain
- [ ] Test with real credit cards (small amounts)
- [ ] Enable Stripe Radar for fraud protection
- [ ] Set up monitoring and alerts
- [ ] Configure email notifications
- [ ] Test 3D Secure flow
- [ ] Verify refund processing
- [ ] Document customer support process
- [ ] Set up PCI compliance questionnaire
- [ ] Review Stripe terms of service
- [ ] Test hold booking expiration
- [ ] Configure hold reminder emails

---

## Support

For issues or questions:
1. Check Stripe documentation: https://stripe.com/docs
2. Check Duffel documentation: https://duffel.com/docs
3. Review Stripe dashboard logs
4. Check server logs for errors
5. Test with Stripe test cards first

---

## License

This implementation follows the main project license.
