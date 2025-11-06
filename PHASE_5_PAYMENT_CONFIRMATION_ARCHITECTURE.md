# Phase 5: Payment Integration & Booking Confirmation - Architecture

## 🎯 Overview

**Goal**: Complete the booking flow with passenger details collection, payment processing, and booking confirmation - all within the chat interface.

**Status**: 🚧 IN PROGRESS
**Prerequisites**: Phase 4 Complete ✅
**Estimated Effort**: 6-8 hours
**Risk Level**: Medium (payment integration, API coordination)

---

## 📋 Current State Analysis

### ✅ Already Built (Leverage Existing Infrastructure)

1. **Stripe Integration** (`app/api/payments/create-intent/route.ts`)
   - Payment intent creation
   - Amount validation
   - Booking reference tracking
   - Client secret generation

2. **Payment Form Component** (`components/booking/StripePaymentForm.tsx`)
   - Full Stripe Elements integration
   - 3D Secure support
   - PCI compliance
   - Error handling

3. **Booking Creation API** (`app/api/flights/booking/create/route.ts`)
   - Duffel Orders API integration
   - Passenger data transformation
   - Order confirmation
   - Database storage

4. **Email Service** (`lib/email/service.ts`)
   - Booking confirmation emails
   - Payment instructions
   - Receipt generation

5. **Booking Storage** (`lib/bookings/storage.ts`)
   - Database persistence
   - Booking retrieval
   - Reference generation

### 🔨 Need to Build

1. **PassengerDetailsWidget** - Chat form for passenger info
2. **PaymentWidget** - Embedded Stripe payment in chat
3. **BookingConfirmationWidget** - Success message with booking reference
4. **useBookingFlow Extensions** - Passenger & payment methods
5. **Chat Integration** - New handlers in AITravelAssistant

---

## 🏗️ Architecture Design

### 1. Passenger Details Collection

**Component**: `PassengerDetailsWidget.tsx`

```typescript
interface PassengerDetailsWidgetProps {
  passengerCount: number;
  flightType: 'domestic' | 'international';
  onSubmit: (passengers: PassengerInfo[]) => void;
  onBack?: () => void;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  title: 'mr' | 'mrs' | 'ms';

  // International flights only
  passportNumber?: string;
  passportExpiryDate?: string;
  nationality?: string;
}
```

**Features:**
- Compact accordion for each passenger
- Real-time validation
- International flight detection (show passport fields)
- Mobile-optimized input
- Auto-focus next field
- Clear error messaging

**Chat Flow:**
```
User: [Confirms booking summary]
  ↓
AI: "Great! Let's collect passenger details..."
  ↓
  [PassengerDetailsWidget appears]
  ↓
User: [Fills out form]
  ↓
User: [Clicks "Continue to Payment"]
  ↓
AI: "Perfect! Now let's secure your booking with payment..."
```

---

### 2. Payment Processing

**Component**: `PaymentWidget.tsx` (wrapper for StripePaymentForm)

```typescript
interface PaymentWidgetProps {
  amount: number;
  currency: string;
  bookingReference: string;
  clientSecret: string;
  passengers: PassengerInfo[];
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}
```

**Features:**
- Embedded Stripe Elements
- Payment amount summary
- Booking details reminder
- Secure payment badge
- 3D Secure support
- Loading states

**Chat Flow:**
```
User: [Submits passenger details]
  ↓
AI: "Processing payment setup..."
  [Creates payment intent via API]
  ↓
AI: "Your total is $599. Please complete payment to confirm your booking."
  ↓
  [PaymentWidget with Stripe form appears]
  ↓
User: [Enters payment details]
  ↓
User: [Clicks "PAY $599"]
  ↓
  [Stripe processes payment]
  ↓
AI: "Payment successful! Creating your booking..."
```

---

### 3. Booking Confirmation

**Component**: `BookingConfirmationWidget.tsx`

```typescript
interface BookingConfirmationWidgetProps {
  bookingReference: string;
  pnr: string;
  flight: FlightInfo;
  passengers: PassengerInfo[];
  totalPaid: number;
  currency: string;
  confirmationEmail: string;
  onDownloadTicket?: () => void;
  onViewBooking?: () => void;
}
```

**Features:**
- Prominent booking reference display
- Flight summary
- Passenger list
- Payment confirmation
- Next steps (check email)
- Download e-ticket button
- View booking details link

**Chat Flow:**
```
  [Payment successful]
  ↓
AI: "Booking confirmed! ✅"
  ↓
  [BookingConfirmationWidget appears]
  ↓
AI: "Your booking reference is ABC123. Check your email for full details."
  ↓
AI: "Have a great trip! Need anything else?"
```

---

### 4. Complete Booking Flow (Phase 4 + 5)

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 4: Flight & Ancillaries Selection                │
├─────────────────────────────────────────────────────────┤
│ 1. User searches flights                                │
│ 2. User selects flight → InlineFareSelector             │
│ 3. User selects fare → CompactSeatMap                   │
│ 4. User selects seat → BaggageUpsellWidget              │
│ 5. User adds baggage → BookingSummaryCard               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 5: Payment & Confirmation                         │
├─────────────────────────────────────────────────────────┤
│ 6. User confirms booking → PassengerDetailsWidget       │
│ 7. User submits passengers → PaymentWidget              │
│ 8. User completes payment → BookingConfirmationWidget   │
│ 9. User receives email confirmation ✅                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### 1. Extend Message Interface

```typescript
interface Message {
  // ... existing fields
  widget?: {
    type:
      | 'fare_selector'
      | 'seat_map'
      | 'baggage_selector'
      | 'booking_summary'
      | 'passenger_details'    // NEW
      | 'payment'              // NEW
      | 'booking_confirmation' // NEW
      | 'progress';
    data: any;
  };
}
```

### 2. Extend useBookingFlow Hook

**New Methods:**
```typescript
interface BookingFlowHook {
  // ... existing methods

  // NEW: Passenger management
  updatePassengers: (bookingId: string, passengers: PassengerInfo[]) => void;
  validatePassengers: (passengers: PassengerInfo[], flightType: string) => ValidationResult;

  // NEW: Payment processing
  createPaymentIntent: (bookingId: string) => Promise<PaymentIntentResult>;
  confirmPayment: (bookingId: string, paymentIntentId: string) => Promise<void>;

  // NEW: Order creation
  createBooking: (bookingId: string) => Promise<BookingResult>;

  // NEW: Confirmation
  sendConfirmationEmail: (bookingId: string) => Promise<void>;
}
```

### 3. New Handlers in AITravelAssistant

```typescript
// Handler 8: Collect Passenger Details
const handleConfirmBooking = async () => {
  const consultant = getConsultant('customer-service');

  setMessages(prev => [...prev, {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: "Perfect! Let's collect passenger details for your flight.",
    consultant,
    widget: {
      type: 'passenger_details',
      data: {
        passengerCount: bookingFlow.activeBooking?.searchParams?.passengers || 1,
        flightType: 'international', // Detect from route
      },
    },
  }]);

  bookingFlow.advanceStage('passenger_details');
};

// Handler 9: Process Payment
const handlePassengerSubmit = async (passengers: PassengerInfo[]) => {
  const bookingId = bookingFlow.activeBooking?.id;
  if (!bookingId) return;

  // Update booking with passenger details
  bookingFlow.updatePassengers(bookingId, passengers);

  // Create payment intent
  const paymentIntent = await bookingFlow.createPaymentIntent(bookingId);

  const consultant = getConsultant('payment-billing');
  setMessages(prev => [...prev, {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: `Your total is $${bookingFlow.activeBooking.pricing.total}. Please complete payment to confirm your booking.`,
    consultant,
    widget: {
      type: 'payment',
      data: {
        amount: bookingFlow.activeBooking.pricing.total,
        currency: bookingFlow.activeBooking.pricing.currency,
        bookingReference: bookingId,
        clientSecret: paymentIntent.clientSecret,
        passengers,
      },
    },
  }]);

  bookingFlow.advanceStage('payment');
};

// Handler 10: Confirm Booking
const handlePaymentSuccess = async (paymentIntentId: string) => {
  const bookingId = bookingFlow.activeBooking?.id;
  if (!bookingId) return;

  setTypingState({
    phase: 'thinking',
    consultantName: 'Booking System',
    contextMessage: 'Creating your booking with the airline...',
  });

  // Confirm payment
  await bookingFlow.confirmPayment(bookingId, paymentIntentId);

  // Create booking with Duffel
  const booking = await bookingFlow.createBooking(bookingId);

  // Send confirmation email
  await bookingFlow.sendConfirmationEmail(bookingId);

  const consultant = getConsultant('customer-service');
  setMessages(prev => [...prev, {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: `✅ Booking confirmed! Your reference is ${booking.bookingReference}.`,
    consultant,
    widget: {
      type: 'booking_confirmation',
      data: {
        bookingReference: booking.bookingReference,
        pnr: booking.pnr,
        flight: bookingFlow.activeBooking.selectedFlight,
        passengers: bookingFlow.activeBooking.passengers,
        totalPaid: bookingFlow.activeBooking.pricing.total,
        currency: bookingFlow.activeBooking.pricing.currency,
        confirmationEmail: bookingFlow.activeBooking.passengers[0].email,
      },
    },
  }]);

  bookingFlow.advanceStage('confirmation');

  // Clear booking from localStorage
  localStorage.removeItem('activeBooking');
};
```

---

## 📊 Data Flow

### Payment Intent Creation
```
AITravelAssistant.handlePassengerSubmit()
  ↓
bookingFlow.createPaymentIntent(bookingId)
  ↓
POST /api/payments/create-intent
  {
    amount: 599,
    currency: 'USD',
    bookingReference: 'booking_123',
    customerEmail: 'user@example.com',
    customerName: 'John Doe',
  }
  ↓
Stripe API: Create Payment Intent
  ↓
RESPONSE:
  {
    paymentIntentId: 'pi_abc123',
    clientSecret: 'pi_abc123_secret_xyz',
    amount: 599,
    currency: 'USD',
  }
  ↓
Show PaymentWidget with clientSecret
```

### Booking Creation
```
AITravelAssistant.handlePaymentSuccess(paymentIntentId)
  ↓
bookingFlow.createBooking(bookingId)
  ↓
POST /api/flights/booking/create
  {
    flightOffer: {...},
    passengers: [...],
    payment: {
      method: 'card',
      paymentIntentId: 'pi_abc123',
    },
    fareUpgrade: {...},
    seats: [...],
    addOns: [...],
  }
  ↓
Duffel API: Create Order
  ↓
Database: Save Booking
  ↓
Email Service: Send Confirmation
  ↓
RESPONSE:
  {
    success: true,
    booking: {
      id: 'booking_123',
      bookingReference: 'ABC123',
      pnr: 'XYZ789',
      status: 'CONFIRMED',
      duffelOrderId: 'ord_abc123',
    }
  }
  ↓
Show BookingConfirmationWidget
```

---

## 🎨 UI/UX Principles

### 1. Progressive Disclosure
- Show only relevant fields at each step
- International flights → show passport fields
- Domestic flights → hide passport fields

### 2. Inline Validation
- Real-time field validation
- Clear error messages
- Green checkmarks for valid fields

### 3. Trust Signals
- Stripe badge
- SSL/PCI compliance indicators
- Booking protection messaging
- Money-back guarantee

### 4. Mobile Optimization
- Large touch targets
- Auto-focus on mobile keyboards
- Scroll into view for current field
- Compact forms that fit viewport

### 5. Error Recovery
- Clear error messaging
- "Try Again" buttons
- Support contact info
- Alternative payment methods

---

## 🔒 Security Considerations

### 1. Payment Security
- ✅ PCI DSS compliant (Stripe handles cards)
- ✅ No card data touches our servers
- ✅ Client-side encryption
- ✅ 3D Secure authentication

### 2. Data Validation
- ✅ Server-side validation for all fields
- ✅ Sanitize passenger names
- ✅ Validate passport format
- ✅ Check date of birth age requirements

### 3. Payment Intent Protection
- ✅ Client secret never logged
- ✅ Payment intent tied to booking ID
- ✅ Amount verification before payment
- ✅ Idempotent booking creation

---

## 🧪 Testing Strategy

### 1. Component Testing
- PassengerDetailsWidget form validation
- PaymentWidget Stripe integration
- BookingConfirmationWidget rendering

### 2. Integration Testing
- End-to-end booking flow
- Payment intent → booking creation
- Email delivery confirmation

### 3. Error Scenarios
- Payment declined
- Booking creation failure
- Email send failure
- Network timeout

### 4. Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

---

## 📈 Success Metrics

| Metric | Target | Tracking |
|--------|--------|----------|
| Payment Success Rate | >95% | Stripe dashboard |
| Booking Creation Time | <3 seconds | API logs |
| Form Completion Rate | >80% | Analytics |
| Email Delivery Rate | >99% | Email service logs |
| Customer Satisfaction | >4.5/5 | Post-booking survey |

---

## 🚀 Implementation Roadmap

### Step 1: Create Components (2-3 hours)
- [x] Plan architecture
- [ ] Build PassengerDetailsWidget
- [ ] Build PaymentWidget wrapper
- [ ] Build BookingConfirmationWidget

### Step 2: Extend Booking Flow (1-2 hours)
- [ ] Add passenger methods to useBookingFlow
- [ ] Add payment methods to useBookingFlow
- [ ] Add booking creation methods
- [ ] Update types/booking-flow.ts

### Step 3: Integrate into Chat (2-3 hours)
- [ ] Add handleConfirmBooking
- [ ] Add handlePassengerSubmit
- [ ] Add handlePaymentSuccess
- [ ] Update renderWidget for new widget types
- [ ] Add typing indicators

### Step 4: Testing & Polish (1-2 hours)
- [ ] Test complete flow end-to-end
- [ ] Test payment failures
- [ ] Test booking creation errors
- [ ] Verify email delivery
- [ ] Mobile responsiveness check

---

## 🎯 Next Steps After Phase 5

1. **Multi-Passenger Support** - Handle 2+ travelers
2. **Round-Trip Booking** - Return flight selection
3. **Multi-City Trips** - Complex itineraries
4. **Group Bookings** - Family/corporate travel
5. **Loyalty Programs** - Frequent flyer integration
6. **Travel Insurance** - Optional add-on
7. **Post-Booking Management** - View/modify/cancel

---

## 📚 References

- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Duffel Orders API](https://duffel.com/docs/api/orders)
- [React Hook Form](https://react-hook-form.com/) - For passenger form
- [Stripe Elements](https://stripe.com/docs/stripe-js/react) - Payment UI

---

**Built with:** TypeScript, React, Next.js 14, Stripe, Duffel API
**Target Completion:** Phase 5 ready for production deployment
**Estimated LOC:** ~1,500 lines (3 widgets + hook extensions + handlers)
