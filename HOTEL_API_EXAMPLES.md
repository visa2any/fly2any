# Duffel Stays API - Code Examples

Quick reference for using the Duffel Stays hotel booking API.

## Table of Contents

1. [Search Hotels](#search-hotels)
2. [Get Hotel Details](#get-hotel-details)
3. [Create Quote](#create-quote)
4. [Create Booking](#create-booking)
5. [Get Booking](#get-booking)
6. [Cancel Booking](#cancel-booking)
7. [Location Autocomplete](#location-autocomplete)
8. [Frontend Integration](#frontend-integration)

---

## Search Hotels

### Basic Search (City Name)

```typescript
// Search by city name
const response = await fetch('/api/hotels/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: {
      query: 'Paris, France'
    },
    checkIn: '2024-12-20',
    checkOut: '2024-12-25',
    guests: {
      adults: 2,
      children: []
    }
  })
});

const { data, meta } = await response.json();
console.log(`Found ${meta.count} hotels in Paris`);
```

### Search with Coordinates

```typescript
// Search by GPS coordinates
const response = await fetch('/api/hotels/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: {
      lat: 40.7589,
      lng: -73.9851 // Times Square, NYC
    },
    checkIn: '2024-12-20',
    checkOut: '2024-12-25',
    guests: {
      adults: 2,
      children: [8, 12] // Children ages 8 and 12
    },
    radius: 2, // 2km radius
    currency: 'USD'
  })
});

const { data } = await response.json();
```

### Search with Filters

```typescript
// Advanced search with all filters
const response = await fetch('/api/hotels/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: { query: 'Miami Beach' },
    checkIn: '2024-12-20',
    checkOut: '2024-12-25',
    guests: {
      adults: 2,
      children: []
    },
    // Filters
    minRating: 4,        // 4+ stars only
    maxRating: 5,
    minPrice: 150,       // $150-$500 per night
    maxPrice: 500,
    currency: 'USD',
    amenities: [
      'wifi',
      'pool',
      'beach_access',
      'spa',
      'restaurant'
    ],
    propertyTypes: [
      'resort',
      'hotel'
    ],
    limit: 50            // Return up to 50 results
  })
});

const { data, meta } = await response.json();
```

---

## Get Hotel Details

```typescript
// Fetch complete hotel information
const hotelId = 'acc_abc123';
const response = await fetch(`/api/hotels/${hotelId}`);
const { data } = await response.json();

console.log(`Hotel: ${data.name}`);
console.log(`Rating: ${data.star_rating} stars`);
console.log(`Location: ${data.location.lat}, ${data.location.lng}`);
console.log(`Available Rates: ${data.rates.length}`);

// Display rates
data.rates.forEach(rate => {
  console.log(`${rate.room_type}: ${rate.total_amount} ${rate.total_currency}`);
  console.log(`  Cancellation: ${rate.cancellation_policy.type}`);
});
```

---

## Create Quote

### Quote for Adults Only

```typescript
// Lock in price with a quote
const response = await fetch('/api/hotels/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rateId: 'rate_xyz789',
    guests: [
      {
        title: 'mr',
        givenName: 'John',
        familyName: 'Smith',
        type: 'adult'
      },
      {
        title: 'ms',
        givenName: 'Jane',
        familyName: 'Smith',
        type: 'adult'
      }
    ]
  })
});

const { data } = await response.json();
console.log(`Quote ID: ${data.id}`);
console.log(`Total: ${data.total_amount} ${data.total_currency}`);
console.log(`Expires: ${new Date(data.expires_at).toLocaleString()}`);

// Store quote ID for booking
const quoteId = data.id;
```

### Quote with Children

```typescript
// Quote with children (requires date of birth)
const response = await fetch('/api/hotels/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rateId: 'rate_xyz789',
    guests: [
      // Adults
      {
        title: 'mr',
        givenName: 'John',
        familyName: 'Smith',
        type: 'adult'
      },
      {
        title: 'ms',
        givenName: 'Jane',
        familyName: 'Smith',
        type: 'adult'
      },
      // Children (must include bornOn)
      {
        givenName: 'Emily',
        familyName: 'Smith',
        type: 'child',
        bornOn: '2015-06-15' // 8 years old
      },
      {
        givenName: 'Michael',
        familyName: 'Smith',
        type: 'child',
        bornOn: '2011-03-20' // 12 years old
      }
    ]
  })
});

const { data } = await response.json();
```

---

## Create Booking

### Using Balance Payment (Test Mode)

```typescript
// Complete booking with balance payment (test mode)
const response = await fetch('/api/hotels/booking/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quoteId: 'quo_abc123',
    payment: {
      type: 'balance',
      amount: '450.00',
      currency: 'USD'
    },
    guests: [
      {
        title: 'mr',
        givenName: 'John',
        familyName: 'Smith',
        type: 'adult'
      }
    ],
    email: 'john.smith@example.com',
    phoneNumber: '+12125551234' // E.164 format
  })
});

if (!response.ok) {
  const error = await response.json();
  console.error(`Booking failed: ${error.message}`);
  throw new Error(error.code);
}

const { data } = await response.json();
console.log(`Booking confirmed!`);
console.log(`Confirmation: ${data.reference}`);
console.log(`Booking ID: ${data.id}`);
console.log(`Status: ${data.status}`);
```

### Using Card Payment (Live Mode)

```typescript
// Complete booking with card payment
const response = await fetch('/api/hotels/booking/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quoteId: 'quo_abc123',
    payment: {
      type: 'card',
      amount: '450.00',
      currency: 'USD',
      card: {
        number: '4242424242424242',
        expiryMonth: '12',
        expiryYear: '2025',
        cvc: '123',
        holderName: 'John Smith'
      }
    },
    guests: [
      {
        title: 'mr',
        givenName: 'John',
        familyName: 'Smith',
        type: 'adult'
      }
    ],
    email: 'john.smith@example.com',
    phoneNumber: '+12125551234'
  })
});

const { data } = await response.json();

// Send confirmation email
await sendBookingConfirmation(data);

// Store in database
await saveBooking(data);
```

---

## Get Booking

```typescript
// Retrieve booking details
const bookingId = 'bok_abc123';
const response = await fetch(`/api/hotels/booking/${bookingId}`);
const { data } = await response.json();

console.log(`Booking ${data.reference}`);
console.log(`Status: ${data.status}`);
console.log(`Hotel: ${data.hotel.name}`);
console.log(`Check-in: ${data.check_in}`);
console.log(`Check-out: ${data.check_out}`);
console.log(`Total: ${data.total_amount} ${data.total_currency}`);

// Display guest information
data.guests.forEach((guest, i) => {
  console.log(`Guest ${i + 1}: ${guest.given_name} ${guest.family_name}`);
});
```

---

## Cancel Booking

```typescript
// Cancel a booking
const bookingId = 'bok_abc123';
const response = await fetch(`/api/hotels/booking/${bookingId}/cancel`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: 'Change of travel plans'
  })
});

if (!response.ok) {
  const error = await response.json();
  if (error.code === 'NOT_CANCELLABLE') {
    console.error('This booking cannot be cancelled (non-refundable)');
  } else if (error.code === 'ALREADY_CANCELLED') {
    console.log('Booking already cancelled');
  } else {
    console.error(`Cancellation failed: ${error.message}`);
  }
  return;
}

const { data } = await response.json();
console.log(`Cancellation confirmed`);
console.log(`Refund: ${data.refund_amount} ${data.refund_currency}`);

// Send cancellation email
await sendCancellationEmail(data);
```

---

## Location Autocomplete

```typescript
// Get location suggestions for autocomplete
async function getLocationSuggestions(query: string) {
  if (query.length < 2) return [];

  const response = await fetch(
    `/api/hotels/suggestions?query=${encodeURIComponent(query)}`
  );
  const { data } = await response.json();

  return data.map(suggestion => ({
    id: suggestion.id,
    label: `${suggestion.name}, ${suggestion.country}`,
    type: suggestion.type, // 'city', 'hotel', 'landmark', 'airport'
    location: suggestion.location
  }));
}

// Usage in search form
const suggestions = await getLocationSuggestions('Par');
// Returns: [
//   { label: 'Paris, France', type: 'city', ... },
//   { label: 'Parma, Italy', type: 'city', ... },
//   { label: 'Paris Hilton Hotel, Las Vegas', type: 'hotel', ... }
// ]
```

---

## Frontend Integration

### React Hook for Hotel Search

```typescript
'use client';

import { useState } from 'react';
import type { Hotel } from '@/lib/hotels/types';

export function useHotelSearch() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchHotels(params: {
    location: { query: string } | { lat: number; lng: number };
    checkIn: string;
    checkOut: string;
    adults: number;
    children?: number[];
  }) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          guests: {
            adults: params.adults,
            children: params.children || []
          }
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const { data } = await response.json();
      setHotels(data);
    } catch (err: any) {
      setError(err.message);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }

  return { hotels, loading, error, searchHotels };
}

// Usage in component
function HotelSearchPage() {
  const { hotels, loading, error, searchHotels } = useHotelSearch();

  const handleSearch = () => {
    searchHotels({
      location: { query: 'New York' },
      checkIn: '2024-12-20',
      checkOut: '2024-12-25',
      adults: 2,
      children: []
    });
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search Hotels'}
      </button>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {hotels.map(hotel => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}
```

### Complete Booking Flow

```typescript
'use client';

import { useState } from 'react';

export default function HotelBookingFlow() {
  const [step, setStep] = useState<'search' | 'details' | 'quote' | 'payment' | 'confirmation'>('search');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [quote, setQuote] = useState(null);
  const [booking, setBooking] = useState(null);

  // Step 1: Search
  async function handleSearch(params) {
    const response = await fetch('/api/hotels/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const { data } = await response.json();
    // Show results
    setStep('details');
  }

  // Step 2: Select hotel & rate
  async function handleSelectRate(hotel, rate) {
    setSelectedHotel(hotel);
    setSelectedRate(rate);
    setStep('quote');
  }

  // Step 3: Create quote
  async function handleCreateQuote(guests) {
    const response = await fetch('/api/hotels/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rateId: selectedRate.id,
        guests
      })
    });
    const { data } = await response.json();
    setQuote(data);
    setStep('payment');
  }

  // Step 4: Complete booking
  async function handleBooking(paymentDetails, guests, contactInfo) {
    const response = await fetch('/api/hotels/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId: quote.id,
        payment: paymentDetails,
        guests,
        ...contactInfo
      })
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Booking failed: ${error.message}`);
      return;
    }

    const { data } = await response.json();
    setBooking(data);
    setStep('confirmation');
  }

  return (
    <div>
      {step === 'search' && <SearchForm onSearch={handleSearch} />}
      {step === 'details' && <HotelDetails onSelectRate={handleSelectRate} />}
      {step === 'quote' && <QuoteForm onCreateQuote={handleCreateQuote} />}
      {step === 'payment' && <PaymentForm onBook={handleBooking} quote={quote} />}
      {step === 'confirmation' && <BookingConfirmation booking={booking} />}
    </div>
  );
}
```

---

## Error Handling

```typescript
async function searchHotels(params) {
  try {
    const response = await fetch('/api/hotels/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();

      // Handle specific errors
      switch (error.code) {
        case 'RATE_NOT_AVAILABLE':
          alert('This rate is no longer available. Please search again.');
          break;
        case 'PRICE_CHANGED':
          alert('The price has changed. Please review the new price.');
          break;
        case 'QUOTE_EXPIRED':
          alert('Your quote expired. Creating a new one...');
          // Recreate quote
          break;
        default:
          alert(`Error: ${error.message}`);
      }

      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('Network error:', err);
    alert('Connection error. Please try again.');
    return null;
  }
}
```

---

## TypeScript Types

```typescript
import type {
  Hotel,
  HotelSearchParams,
  HotelBooking,
  HotelQuote,
  HotelRate,
  HotelBookingGuest,
  CreateBookingParams
} from '@/lib/hotels/types';

// Example: Type-safe search
const searchParams: HotelSearchParams = {
  location: { query: 'Paris' },
  checkIn: '2024-12-20',
  checkOut: '2024-12-25',
  guests: {
    adults: 2,
    children: [8, 12]
  },
  minRating: 4,
  amenities: ['wifi', 'pool']
};

// Example: Type-safe guest data
const guests: HotelBookingGuest[] = [
  {
    title: 'mr',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    phone: '+12125551234',
    type: 'adult'
  }
];
```

---

## Best Practices

1. **Always create a quote before booking** - Locks in price
2. **Validate guest data** - Check required fields before submission
3. **Handle quote expiration** - Quotes expire in 15-30 minutes
4. **Show cancellation policy** - Display before booking
5. **Cache location suggestions** - Reduce API calls
6. **Use E.164 phone format** - Required by Duffel (+12125551234)
7. **Store booking IDs** - Save to database after booking
8. **Send confirmations** - Email after successful booking
9. **Monitor errors** - Track failed bookings
10. **Test in sandbox** - Use test mode before going live

---

## Testing Checklist

- [ ] Search by city name
- [ ] Search by coordinates
- [ ] Search with filters (rating, price, amenities)
- [ ] Get hotel details
- [ ] Create quote (adults only)
- [ ] Create quote (with children)
- [ ] Create booking (balance payment)
- [ ] Create booking (card payment)
- [ ] Get booking details
- [ ] Cancel booking (refundable)
- [ ] Cancel booking (non-refundable - should fail)
- [ ] Location autocomplete
- [ ] Handle expired quote
- [ ] Handle price changes
- [ ] Handle sold out rooms
