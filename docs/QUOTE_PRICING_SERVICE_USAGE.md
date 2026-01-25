# Quote Pricing Service - Usage Guide

## Overview

The `QuotePricingService` fetches real-time prices from external APIs (LiteAPI for hotels, Amadeus for flights) and applies agent commission on top of API prices. This ensures pricing accuracy and security by never trusting client-provided prices.

## Key Features

- **Real-time API Pricing**: Fetches current prices from LiteAPI and Amadeus
- **Commission Application**: Applies agent commission on top of base API prices
- **Blocking Errors**: Throws errors if any API fails (quote cannot be saved)
- **Automatic Validation**: Validates all parameters before API calls
- **Detailed Breakdown**: Returns itemized pricing breakdown for transparency
- **Currency Support**: Handles multiple currencies (default: USD)

## Architecture

```
Agent Request
    ↓
Parameter Validation
    ↓
Parallel API Calls:
  - Amadeus (Flights)
  - LiteAPI (Hotels)
    ↓
Price Calculation:
  - Base Price (API)
  - Commission (Base × %)
  - Final Price (Base + Commission)
    ↓
Return Normalized Pricing
```

## Usage

### Basic Example

```typescript
import { quotePricingService } from '@/lib/services/quotePricingService';

try {
  const pricing = await quotePricingService.calculateQuotePricing({
    // Trip parameters
    startDate: '2025-06-15T10:00:00Z',
    endDate: '2025-06-22T10:00:00Z',
    adults: 2,
    children: 1,
    
    // Flights
    flights: [
      {
        id: 'amadeus-flight-123',
        airlineCode: 'AA',
        flightNumber: '1234',
        originAirportCode: 'JFK',
        destinationAirportCode: 'LAX',
        departureDate: '2025-06-15T10:00:00Z',
        arrivalDate: '2025-06-15T13:30:00Z',
        cabinClass: 'economy',
        passengers: 3,
      },
    ],
    
    // Hotels
    hotels: [
      {
        id: 'liteapi-hotel-456',
        name: 'Grand Hotel',
        checkIn: '2025-06-15',
        checkOut: '2025-06-22',
        rooms: 1,
        occupancy: [
          { adults: 2, children: 1 },
        ],
      },
    ],
    
    // Commission (5%)
    commissionPercent: 0.05,
    currency: 'USD',
  });
  
  console.log('Total Price:', pricing.totalFinalPrice);
  console.log('Commission:', pricing.commissionAmount);
  console.log('Per Person:', pricing.totalPricePerPerson);
  
} catch (error) {
  if (error instanceof QuotePricingError) {
    console.error('Pricing Error:', error.message, error.code, error.details);
    // Handle pricing error - do not save quote
  }
}
```

### Flight-Only Quote

```typescript
const pricing = await quotePricingService.calculateQuotePricing({
  startDate: '2025-06-15T10:00:00Z',
  endDate: '2025-06-15T20:00:00Z',
  adults: 1,
  
  flights: [
    {
      id: 'amadeus-flight-789',
      airlineCode: 'DL',
      flightNumber: '5678',
      originAirportCode: 'ATL',
      destinationAirportCode: 'MIA',
      departureDate: '2025-06-15T10:00:00Z',
      arrivalDate: '2025-06-15T12:30:00Z',
      cabinClass: 'business',
    },
  ],
  
  commissionPercent: 0.10, // 10% commission
});

// Result: flightsFinalPrice = basePrice + (basePrice × 0.10)
```

### Hotel-Only Quote

```typescript
const pricing = await quotePricingService.calculateQuotePricing({
  startDate: '2025-06-15T00:00:00Z',
  endDate: '2025-06-20T00:00:00Z',
  adults: 2,
  
  hotels: [
    {
      id: 'liteapi-hotel-101',
      name: 'Seaside Resort',
      checkIn: '2025-06-15',
      checkOut: '2025-06-20',
      rooms: 2,
      occupancy: [
        { adults: 1 }, // Room 1
        { adults: 1 }, // Room 2
      ],
    },
  ],
  
  commissionPercent: 0.075, // 7.5% commission
});

// Result: hotelsFinalPrice = basePrice + (basePrice × 0.075)
```

### Multi-Currency Quote

```typescript
const pricing = await quotePricingService.calculateQuotePricing({
  startDate: '2025-07-01T00:00:00Z',
  endDate: '2025-07-10T00:00:00Z',
  adults: 2,
  
  flights: [/* flights */],
  hotels: [/* hotels */],
  
  commissionPercent: 0.05,
  currency: 'EUR', // Request pricing in Euros
});
```

## API Integration

### Amadeus Flight Pricing

The service needs to integrate with Amadeus API to fetch flight prices:

```typescript
// In fetchFlightPriceFromAmadeus method:
const response = await amadeusAPI.getFlightPrice(flightId, currency);
return response.price.total;
```

**Required Data:**
- Flight ID (from Amadeus search)
- Currency code
- Cabin class

**Returns:**
- Base price per passenger
- Taxes and fees

### LiteAPI Hotel Pricing

The service needs to integrate with LiteAPI to fetch hotel prices:

```typescript
// In fetchHotelPriceFromLiteAPI method:
const rates = await liteAPI.getHotelRates({
  hotelIds: [hotelId],
  checkin: checkIn,
  checkout: checkOut,
  occupancies: occupancy,
});
return rates[0].totalPrice;
```

**Required Data:**
- Hotel ID (from LiteAPI search)
- Check-in/check-out dates
- Room occupancy (adults, children)
- Currency code

**Returns:**
- Total price for entire stay
- Price per night

## Error Handling

### QuotePricingError Codes

| Code | Description | Details |
|-------|-------------|----------|
| `INVALID_START_DATE` | Start date is invalid or malformed | `{ startDate }` |
| `INVALID_END_DATE` | End date is invalid or malformed | `{ endDate }` |
| `INVALID_DATE_RANGE` | End date must be after start date | `{ startDate, endDate }` |
| `INVALID_TRAVELERS` | At least one adult is required | `{ adults }` |
| `INVALID_COMMISSION` | Commission must be between 0 and 1 | `{ commissionPercent }` |
| `MISSING_FLIGHT_ID` | Flight is missing ID | `{ flightIndex }` |
| `MISSING_AIRLINE_CODE` | Flight is missing airline code | `{ flightIndex }` |
| `MISSING_HOTEL_ID` | Hotel is missing ID | `{ hotelIndex }` |
| `MISSING_HOTEL_DATES` | Hotel is missing check-in/check-out | `{ hotelIndex }` |
| `FLIGHT_PRICING_ERROR` | Failed to fetch flight pricing | `{ flightId, airlineCode, flightNumber, error }` |
| `HOTEL_PRICING_ERROR` | Failed to fetch hotel pricing | `{ hotelId, hotelName, error }` |
| `AMADEUS_API_ERROR` | Amadeus API error | `{ flightId, currency, error }` |
| `LITEAPI_ERROR` | LiteAPI error | `{ hotelId, checkIn, checkOut, currency, error }` |
| `NOT_IMPLEMENTED` | API pricing not yet implemented | Details vary |

### Error Handling Example

```typescript
import { QuotePricingError } from '@/lib/services/quotePricingService';

try {
  const pricing = await quotePricingService.calculateQuotePricing(params);
  
  // Success - save quote with pricing
  await saveQuote({
    ...quoteData,
    pricing,
  });
  
} catch (error) {
  if (error instanceof QuotePricingError) {
    switch (error.code) {
      case 'FLIGHT_PRICING_ERROR':
      case 'HOTEL_PRICING_ERROR':
        // API unavailable - cannot save quote
        throw new Error(
          `Unable to fetch pricing: ${error.message}. Please try again later.`
        );
      
      case 'INVALID_COMMISSION':
        // Invalid agent input - validation error
        throw new Error(
          `Invalid commission rate: ${error.details?.commissionPercent}`
        );
      
      default:
        // Other errors
        console.error('Pricing error:', error);
        throw error;
    }
  } else {
    // Unexpected error
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred while calculating pricing.');
  }
}
```

## Integration with Quote Save API

### Example: In Quote Update Endpoint

```typescript
// app/api/agents/quotes/[id]/route.ts
import { quotePricingService, QuotePricingError } from '@/lib/services/quotePricingService';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  
  // Extract quote parameters from request body
  const {
    startDate,
    endDate,
    adults,
    children,
    infants,
    flights,
    hotels,
    agentCommission,
  } = body;
  
  try {
    // Fetch real-time pricing from APIs
    const pricing = await quotePricingService.calculateQuotePricing({
      startDate,
      endDate,
      adults,
      children,
      infants,
      flights,
      hotels,
      commissionPercent: agentCommission / 100, // Convert percentage to decimal
    });
    
    // Update quote with fetched pricing
    const updatedQuote = await prisma.agentQuote.update({
      where: { id: params.id },
      data: {
        // Store base prices from APIs
        flightsCost: pricing.flightsBasePrice,
        hotelsCost: pricing.hotelsBasePrice,
        
        // Store commission
        agentMarkup: pricing.commissionAmount,
        agentMarkupPercent: pricing.commissionPercent * 100,
        
        // Store final prices
        subtotal: pricing.totalBasePrice,
        total: pricing.totalFinalPrice,
        
        // Store pricing breakdown for audit trail
        // Note: You may need to add JSON fields to schema
        pricingBreakdown: pricing.breakdown,
        pricingFetchedAt: pricing.fetchedAt,
        pricingSources: pricing.apiSources,
        
        // Update metadata
        lastModifiedAt: new Date(),
        version: { increment: 1 },
      },
    });
    
    return Response.json(updatedQuote);
    
  } catch (error) {
    if (error instanceof QuotePricingError) {
      // Pricing error - do not save quote
      return Response.json(
        {
          error: 'Pricing calculation failed',
          message: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 400 }
      );
    }
    
    // Other errors
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Security Considerations

### 1. Never Trust Client Prices

**❌ WRONG:**
```typescript
// Client sends price - DANGEROUS!
const quote = await prisma.agentQuote.create({
  data: {
    total: body.totalPrice, // Client-provided price - VULNERABLE
  },
});
```

**✅ CORRECT:**
```typescript
// Fetch price from API - SECURE!
const pricing = await quotePricingService.calculateQuotePricing({
  // IDs only - no prices
  flights: body.flights.map(f => ({ id: f.id, /* ... */ })),
  hotels: body.hotels.map(h => ({ id: h.id, /* ... */ })),
});

const quote = await prisma.agentQuote.create({
  data: {
    total: pricing.totalFinalPrice, // API-fetched price - SECURE
  },
});
```

### 2. Blocking Errors

If any API fails, the entire quote save must fail:

```typescript
try {
  const pricing = await quotePricingService.calculateQuotePricing(params);
  // Only save if pricing succeeds
  await saveQuote(pricing);
} catch (error) {
  // API failure - DO NOT SAVE
  throw new Error('Cannot save quote: Pricing unavailable');
}
```

### 3. Audit Trail

Always store pricing metadata for audit:

```typescript
await prisma.agentQuote.update({
  data: {
    pricingFetchedAt: pricing.fetchedAt,
    pricingSources: pricing.apiSources,
    pricingBreakdown: pricing.breakdown,
    // ... other fields
  },
});
```

## Performance Optimization

### 1. Parallel API Calls

The service already uses `Promise.all()` for parallel API calls:

```typescript
const [flightsPricing, hotelsPricing] = await Promise.all([
  this.fetchFlightsPricing(params, currency),
  this.fetchHotelsPricing(params, currency),
]);
```

### 2. Caching (Future Enhancement)

Consider caching API responses for short periods:

```typescript
// Cache key: `${flightId}_${currency}_${departureDate}`
const cachedPrice = await cache.get(cacheKey);
if (cachedPrice) {
  return cachedPrice;
}

const price = await fetchFlightPriceFromAmadeus(flightId, currency);
await cache.set(cacheKey, price, { ttl: 300 }); // 5 minutes
return price;
```

### 3. Batch Requests (Future Enhancement)

For multiple hotels/flights, use batch API endpoints:

```typescript
// Instead of N individual calls:
// const prices = await Promise.all(hotels.map(h => fetchPrice(h.id)));

// Use batch endpoint:
const prices = await liteAPI.getHotelRatesBatch({
  hotelIds: hotels.map(h => h.id),
  // ... other params
});
```

## Testing

### Unit Test Example

```typescript
import { quotePricingService, QuotePricingError } from '@/lib/services/quotePricingService';

describe('QuotePricingService', () => {
  it('should calculate pricing for flights and hotels', async () => {
    const pricing = await quotePricingService.calculateQuotePricing({
      startDate: '2025-06-15T10:00:00Z',
      endDate: '2025-06-22T10:00:00Z',
      adults: 2,
      flights: [
        {
          id: 'flight-1',
          airlineCode: 'AA',
          flightNumber: '1234',
          originAirportCode: 'JFK',
          destinationAirportCode: 'LAX',
          departureDate: '2025-06-15T10:00:00Z',
          arrivalDate: '2025-06-15T13:30:00Z',
          cabinClass: 'economy',
        },
      ],
      hotels: [
        {
          id: 'hotel-1',
          name: 'Test Hotel',
          checkIn: '2025-06-15',
          checkOut: '2025-06-22',
        },
      ],
      commissionPercent: 0.10,
    });
    
    expect(pricing.totalBasePrice).toBeGreaterThan(0);
    expect(pricing.commissionAmount).toBe(pricing.totalBasePrice * 0.10);
    expect(pricing.totalFinalPrice).toBe(pricing.totalBasePrice * 1.10);
  });
  
  it('should throw error for invalid date range', async () => {
    await expect(
      quotePricingService.calculateQuotePricing({
        startDate: '2025-06-22T10:00:00Z',
        endDate: '2025-06-15T10:00:00Z', // End before start
        adults: 2,
        commissionPercent: 0.05,
      })
    ).rejects.toThrow(QuotePricingError);
  });
});
```

## Next Steps

### 1. Implement API Integration

Replace placeholder methods with actual API calls:

- `fetchFlightPriceFromAmadeus()`: Integrate with Amadeus pricing endpoint
- `fetchHotelPriceFromLiteAPI()`: Integrate with LiteAPI rates endpoint

### 2. Add Caching Layer

Implement Redis or in-memory caching for API responses to reduce API calls.

### 3. Add Monitoring

Track:
- API call latency
- API error rates
- Pricing calculation success rate
- Commission amounts

### 4. Implement Retry Logic

Add automatic retry for transient API failures:

```typescript
private async fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Support

For questions or issues with the Quote Pricing Service:
- Review this documentation
- Check error codes and messages
- Contact backend team for API integration support