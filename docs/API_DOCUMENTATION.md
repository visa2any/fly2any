# Fly2Any API Documentation

**Version:** 1.0.0
**Base URL:** `https://fly2any.com/api` (Production) | `http://localhost:3000/api` (Development)

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Flight Search](#flight-search)
- [Booking Management](#booking-management)
- [Payment Processing](#payment-processing)
- [Saved Searches](#saved-searches)
- [Price Alerts](#price-alerts)
- [System Health](#system-health)

---

## Authentication

Most endpoints require authentication using session-based authentication (NextAuth.js).

### Authentication Methods

- **Session Cookie**: Automatically included with authenticated requests
- **API Key**: Contact support for API key access (enterprise only)

### Protected Endpoints

Endpoints requiring authentication return `401 Unauthorized` if not authenticated:
- `/api/saved-searches/*`
- `/api/price-alerts/*`
- `/api/bookings` (user-specific bookings)

---

## Rate Limiting

- **Standard tier**: 100 requests/minute
- **Premium tier**: 500 requests/minute
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request parameters | 400 |
| `AUTHENTICATION_ERROR` | Missing or invalid authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `PRICE_CHANGED` | Flight price changed since search | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `API_UNAVAILABLE` | External API unavailable | 503 |

---

## Flight Search

### POST /api/flights/search

Search for available flights with AI-powered scoring and optimization.

**Request Body:**

```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-12-15",
  "returnDate": "2025-12-22",
  "adults": 2,
  "children": 0,
  "infants": 0,
  "travelClass": "economy",
  "nonStop": false,
  "currencyCode": "USD",
  "max": 50,
  "sortBy": "best"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `origin` | string | Yes | Origin airport code (IATA) or comma-separated codes |
| `destination` | string | Yes | Destination airport code (IATA) or comma-separated codes |
| `departureDate` | string | Yes | Departure date (YYYY-MM-DD format) |
| `returnDate` | string | No | Return date for round-trip (YYYY-MM-DD format) |
| `adults` | number | Yes | Number of adult passengers (1-9) |
| `children` | number | No | Number of children (0-9) |
| `infants` | number | No | Number of infants (0-9) |
| `travelClass` | string | No | Cabin class: `economy`, `premium_economy`, `business`, `first` |
| `nonStop` | boolean | No | Only show non-stop flights |
| `currencyCode` | string | No | Currency code (default: USD) |
| `max` | number | No | Maximum results (default: 50) |
| `sortBy` | string | No | Sort order: `best`, `cheapest`, `fastest`, `overall` |

**Response:**

```json
{
  "flights": [
    {
      "id": "flight_123",
      "type": "flight-offer",
      "source": "Amadeus",
      "itineraries": [
        {
          "duration": "PT5H30M",
          "segments": [
            {
              "departure": {
                "iataCode": "JFK",
                "terminal": "4",
                "at": "2025-12-15T08:00:00"
              },
              "arrival": {
                "iataCode": "LAX",
                "terminal": "7",
                "at": "2025-12-15T11:30:00"
              },
              "carrierCode": "AA",
              "number": "123",
              "aircraft": {
                "code": "738"
              },
              "duration": "PT5H30M",
              "numberOfStops": 0
            }
          ]
        }
      ],
      "price": {
        "currency": "USD",
        "total": "299.99",
        "base": "249.99"
      },
      "numberOfBookableSeats": 7,
      "validatingAirlineCodes": ["AA"],
      "score": 85.5,
      "badges": ["Best Price", "Popular Flight"]
    }
  ],
  "metadata": {
    "total": 25,
    "searchParams": {},
    "sortedBy": "best",
    "cached": false,
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

**Example cURL:**

```bash
curl -X POST https://fly2any.com/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-12-15",
    "returnDate": "2025-12-22",
    "adults": 2,
    "travelClass": "economy"
  }'
```

**Response Codes:**
- `200 OK`: Search successful
- `400 Bad Request`: Invalid parameters
- `503 Service Unavailable`: Flight API unavailable

---

### GET /api/flights/[id]

Retrieve a specific flight by ID.

**Parameters:**
- `id` (path): Flight offer ID

**Response:**

```json
{
  "success": true,
  "flight": {
    "id": "flight_123",
    "itineraries": [],
    "price": {}
  }
}
```

**Response Codes:**
- `200 OK`: Flight found
- `404 Not Found`: Flight not found or expired

---

### POST /api/flights/confirm

Confirm current pricing for flight offers before booking.

**Request Body:**

```json
{
  "flightOffers": [
    {
      "id": "flight_123",
      "type": "flight-offer",
      "price": {
        "total": "299.99"
      }
    }
  ]
}
```

**Response:**

```json
{
  "data": [
    {
      "id": "flight_123",
      "price": {
        "total": "299.99",
        "currency": "USD"
      },
      "priceChanged": false
    }
  ]
}
```

**Response Codes:**
- `200 OK`: Price confirmed
- `409 Conflict`: Price changed
- `400 Bad Request`: Invalid offer data

---

### GET /api/flights/seat-map/duffel

Retrieve seat map for a specific flight offer.

**Query Parameters:**
- `offerId` (required): Flight offer ID

**Request Body (POST):**

```json
{
  "offerId": "off_123456"
}
```

**Response:**

```json
{
  "success": true,
  "seatMap": {
    "data": [
      {
        "segmentId": "seg_123",
        "cabins": [
          {
            "cabinClass": "economy",
            "rows": [
              {
                "rowNumber": 10,
                "seats": [
                  {
                    "designator": "10A",
                    "available": true,
                    "price": {
                      "amount": "30.00",
                      "currency": "USD"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "meta": {
      "hasRealData": true,
      "source": "Duffel"
    }
  }
}
```

**Response Codes:**
- `200 OK`: Seat map retrieved
- `400 Bad Request`: Missing offer ID
- `404 Not Found`: No seat map available

---

### POST /api/flights/branded-fares

Retrieve branded fare options (Basic, Standard, Flex) for a flight.

**Request Body:**

```json
{
  "flightOfferId": "flight_123"
}
```

**Response:**

```json
{
  "data": [
    {
      "fareName": "Basic Economy",
      "price": {
        "amount": "199.99",
        "currency": "USD"
      },
      "features": {
        "seatSelection": false,
        "changeable": false,
        "refundable": false,
        "checkedBags": 0
      }
    },
    {
      "fareName": "Standard",
      "price": {
        "amount": "249.99",
        "currency": "USD"
      },
      "features": {
        "seatSelection": true,
        "changeable": true,
        "refundable": false,
        "checkedBags": 1
      }
    }
  ],
  "meta": {
    "hasRealData": true
  }
}
```

**Response Codes:**
- `200 OK`: Branded fares retrieved
- `400 Bad Request`: Missing flight offer ID

---

## Booking Management

### POST /api/flights/booking/create

Create a new flight booking with payment processing.

**Request Body:**

```json
{
  "flightOffer": {
    "id": "flight_123",
    "price": {
      "total": "299.99",
      "currency": "USD"
    }
  },
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "gender": "MALE",
      "email": "john@example.com",
      "phone": "+12125551234",
      "passportNumber": "X12345678",
      "passportExpiryDate": "2030-12-31",
      "nationality": "US"
    }
  ],
  "payment": {
    "method": "card",
    "cardNumber": "4242424242424242",
    "cardBrand": "visa"
  },
  "contactInfo": {
    "email": "john@example.com",
    "phone": "+12125551234"
  },
  "seats": [],
  "isHold": false
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `flightOffer` | object | Yes | Flight offer from search results |
| `passengers` | array | Yes | Passenger information (1-9 passengers) |
| `payment` | object | Yes | Payment information |
| `contactInfo` | object | Yes | Contact details for booking |
| `seats` | array | No | Selected seat assignments |
| `fareUpgrade` | object | No | Selected fare tier upgrade |
| `bundle` | object | No | Selected service bundle |
| `addOns` | array | No | Additional services (baggage, insurance) |
| `isHold` | boolean | No | Create hold booking (pay later) |
| `holdDuration` | number | No | Hold duration in hours (12-72) |

**Response:**

```json
{
  "success": true,
  "booking": {
    "id": "booking_123",
    "bookingReference": "ABC123",
    "pnr": "ABC123",
    "status": "PENDING_PAYMENT",
    "sourceApi": "Amadeus",
    "paymentIntentId": "pi_123456",
    "clientSecret": "pi_123456_secret_abc",
    "totalPrice": 299.99,
    "currency": "USD",
    "createdAt": "2025-11-10T12:00:00Z"
  },
  "message": "Booking created! Please complete payment."
}
```

**Response Codes:**
- `201 Created`: Booking created successfully
- `400 Bad Request`: Invalid booking data
- `402 Payment Required`: Payment processing failed
- `409 Conflict`: Price changed since search
- `410 Gone`: Flight sold out

---

### GET /api/bookings

Retrieve bookings with filtering and search.

**Query Parameters:**
- `status` (optional): Filter by status: `all`, `confirmed`, `pending`, `cancelled`
- `search` (optional): Search by email or booking reference
- `email` (optional): Filter by email address
- `userId` (optional): Filter by user ID
- `dateFrom` (optional): Filter by date range start (YYYY-MM-DD)
- `dateTo` (optional): Filter by date range end (YYYY-MM-DD)
- `limit` (optional): Maximum results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_123",
        "bookingReference": "ABC123",
        "status": "confirmed",
        "flight": {},
        "passengers": [],
        "payment": {},
        "createdAt": "2025-11-10T12:00:00Z"
      }
    ],
    "total": 10
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

**Example cURL:**

```bash
curl -X GET "https://fly2any.com/api/bookings?status=confirmed&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response Codes:**
- `200 OK`: Bookings retrieved
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### GET /api/bookings/[id]

Retrieve a specific booking by ID.

**Parameters:**
- `id` (path): Booking ID

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking_123",
      "bookingReference": "ABC123",
      "status": "confirmed",
      "flight": {
        "segments": []
      },
      "passengers": [],
      "payment": {
        "amount": 299.99,
        "currency": "USD",
        "status": "paid"
      }
    }
  }
}
```

**Response Codes:**
- `200 OK`: Booking found
- `404 Not Found`: Booking not found

---

### PUT /api/bookings/[id]

Update an existing booking.

**Parameters:**
- `id` (path): Booking ID

**Request Body:**

```json
{
  "contactInfo": {
    "email": "newemail@example.com",
    "phone": "+12125559999"
  },
  "passengers": [
    {
      "email": "updated@example.com"
    }
  ],
  "specialRequests": ["Wheelchair assistance"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking_123",
      "status": "confirmed"
    }
  }
}
```

**Response Codes:**
- `200 OK`: Booking updated
- `400 Bad Request`: Invalid update data or booking cannot be modified
- `404 Not Found`: Booking not found

---

### DELETE /api/bookings/[id]

Cancel a booking and process refund.

**Parameters:**
- `id` (path): Booking ID
- `reason` (query, optional): Cancellation reason

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "bookingReference": "ABC123",
    "refundAmount": 249.99,
    "refundStatus": "pending",
    "message": "Booking cancelled successfully. Refund will be processed within 5-7 business days.",
    "cancellationFee": 50.00
  }
}
```

**Example cURL:**

```bash
curl -X DELETE "https://fly2any.com/api/bookings/booking_123?reason=Customer%20request" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response Codes:**
- `200 OK`: Booking cancelled
- `400 Bad Request`: Cancellation not allowed
- `404 Not Found`: Booking not found

---

## Payment Processing

### POST /api/payments/create-intent

Create a Stripe payment intent for processing booking payment.

**Request Body:**

```json
{
  "amount": 299.99,
  "currency": "USD",
  "bookingId": "booking_123",
  "bookingReference": "ABC123",
  "customerEmail": "john@example.com",
  "customerName": "John Doe",
  "description": "Flight booking ABC123",
  "metadata": {
    "flightOfferId": "flight_123",
    "passengerCount": "2"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "paymentIntent": {
      "paymentIntentId": "pi_123456",
      "clientSecret": "pi_123456_secret_abc",
      "amount": 299.99,
      "currency": "USD",
      "status": "requires_payment_method"
    },
    "bookingReference": "ABC123"
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z",
    "processingTime": 145
  }
}
```

**Response Codes:**
- `201 Created`: Payment intent created
- `400 Bad Request`: Invalid payment data
- `404 Not Found`: Booking not found
- `500 Internal Server Error`: Payment service error

---

### POST /api/payments/confirm

Confirm a payment after completion (including 3D Secure).

**Request Body:**

```json
{
  "paymentIntentId": "pi_123456",
  "bookingReference": "ABC123"
}
```

**Response:**

```json
{
  "success": true,
  "payment": {
    "paymentIntentId": "pi_123456",
    "status": "succeeded",
    "amount": 299.99,
    "currency": "USD",
    "paymentMethod": "card",
    "last4": "4242",
    "brand": "visa"
  },
  "booking": {
    "id": "booking_123",
    "bookingReference": "ABC123",
    "status": "confirmed"
  },
  "message": "Payment confirmed and booking updated successfully"
}
```

**Response Codes:**
- `200 OK`: Payment confirmed
- `400 Bad Request`: Invalid payment intent
- `404 Not Found`: Booking not found

---

### POST /api/payments/webhook

Stripe webhook handler for payment events (server-to-server only).

**Headers:**
- `stripe-signature`: Webhook signature for verification

**Webhook Events:**
- `payment_intent.succeeded`: Payment completed
- `payment_intent.payment_failed`: Payment failed
- `charge.refunded`: Refund processed

**Response:**

```json
{
  "received": true,
  "eventId": "evt_123456",
  "eventType": "payment_intent.succeeded"
}
```

**Response Codes:**
- `200 OK`: Event processed
- `400 Bad Request`: Invalid signature

---

## Saved Searches

### GET /api/saved-searches

Get all saved searches for authenticated user.

**Authentication:** Required

**Response:**

```json
{
  "searches": [
    {
      "id": "search_123",
      "userId": "user_123",
      "name": "NYC to LA Christmas",
      "origin": "JFK",
      "destination": "LAX",
      "departDate": "2025-12-15",
      "returnDate": "2025-12-22",
      "adults": 2,
      "children": 0,
      "cabinClass": "economy",
      "searchCount": 5,
      "lastSearched": "2025-11-10T12:00:00Z",
      "createdAt": "2025-11-01T10:00:00Z"
    }
  ]
}
```

**Response Codes:**
- `200 OK`: Searches retrieved
- `401 Unauthorized`: Not authenticated

---

### POST /api/saved-searches

Create a new saved search.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "NYC to LA Christmas",
  "origin": "JFK",
  "destination": "LAX",
  "departDate": "2025-12-15",
  "returnDate": "2025-12-22",
  "adults": 2,
  "children": 0,
  "cabinClass": "economy",
  "filters": {}
}
```

**Response:**

```json
{
  "search": {
    "id": "search_123",
    "name": "NYC to LA Christmas",
    "origin": "JFK",
    "destination": "LAX"
  },
  "created": true
}
```

**Response Codes:**
- `201 Created`: Search saved
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Not authenticated

---

### PUT /api/saved-searches?id=[searchId]

Update a saved search.

**Authentication:** Required

**Query Parameters:**
- `id` (required): Saved search ID

**Request Body:**

```json
{
  "name": "Updated search name",
  "filters": {
    "nonStop": true
  }
}
```

**Response:**

```json
{
  "search": {
    "id": "search_123",
    "name": "Updated search name"
  },
  "updated": true
}
```

**Response Codes:**
- `200 OK`: Search updated
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not owner
- `404 Not Found`: Search not found

---

### DELETE /api/saved-searches?id=[searchId]

Delete a saved search.

**Authentication:** Required

**Query Parameters:**
- `id` (required): Saved search ID

**Response:**

```json
{
  "success": true,
  "deleted": true
}
```

**Response Codes:**
- `200 OK`: Search deleted
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not owner
- `404 Not Found`: Search not found

---

## Price Alerts

### GET /api/price-alerts

Get all price alerts for authenticated user.

**Authentication:** Required

**Query Parameters:**
- `active` (optional): Filter active alerts only (`true`/`false`)

**Response:**

```json
{
  "alerts": [
    {
      "id": "alert_123",
      "userId": "user_123",
      "origin": "JFK",
      "destination": "LAX",
      "departDate": "2025-12-15",
      "returnDate": "2025-12-22",
      "currentPrice": 299.99,
      "targetPrice": 249.99,
      "currency": "USD",
      "active": true,
      "triggered": false,
      "createdAt": "2025-11-10T12:00:00Z"
    }
  ]
}
```

**Response Codes:**
- `200 OK`: Alerts retrieved
- `401 Unauthorized`: Not authenticated

---

### POST /api/price-alerts

Create a new price alert.

**Authentication:** Required

**Request Body:**

```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departDate": "2025-12-15",
  "returnDate": "2025-12-22",
  "currentPrice": 299.99,
  "targetPrice": 249.99,
  "currency": "USD"
}
```

**Response:**

```json
{
  "alert": {
    "id": "alert_123",
    "origin": "JFK",
    "destination": "LAX",
    "targetPrice": 249.99
  },
  "created": true
}
```

**Response Codes:**
- `201 Created`: Alert created
- `400 Bad Request`: Invalid data (target must be less than current)
- `401 Unauthorized`: Not authenticated

---

### PATCH /api/price-alerts?id=[alertId]

Update a price alert.

**Authentication:** Required

**Query Parameters:**
- `id` (required): Alert ID

**Request Body:**

```json
{
  "active": false,
  "targetPrice": 199.99
}
```

**Response:**

```json
{
  "alert": {
    "id": "alert_123",
    "active": false,
    "targetPrice": 199.99
  },
  "updated": true
}
```

**Response Codes:**
- `200 OK`: Alert updated
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not owner
- `404 Not Found`: Alert not found

---

### DELETE /api/price-alerts?id=[alertId]

Delete a price alert.

**Authentication:** Required

**Query Parameters:**
- `id` (required): Alert ID

**Response:**

```json
{
  "success": true,
  "deleted": true
}
```

**Response Codes:**
- `200 OK`: Alert deleted
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not owner
- `404 Not Found`: Alert not found

---

## System Health

### GET /api/health

Comprehensive health check for all services.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T12:00:00Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "lastCheck": "2025-11-10T12:00:00Z"
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5,
      "lastCheck": "2025-11-10T12:00:00Z"
    },
    "externalAPIs": {
      "duffel": {
        "status": "healthy",
        "responseTime": 245
      },
      "amadeus": {
        "status": "healthy",
        "responseTime": 312
      },
      "stripe": {
        "status": "healthy",
        "responseTime": 189
      }
    },
    "system": {
      "memory": {
        "used": "128 MB",
        "total": "512 MB",
        "percentage": "25.0%"
      },
      "nodejs": "v20.10.0",
      "environment": "production"
    }
  }
}
```

**Response Codes:**
- `200 OK`: All services healthy
- `207 Multi-Status`: Some services degraded
- `503 Service Unavailable`: Critical services unhealthy

---

### HEAD /api/health

Lightweight health check for load balancers.

**Response:**
- `200 OK`: Service healthy
- `503 Service Unavailable`: Service unhealthy

---

## Best Practices

### Caching

- Flight search results are cached for 15 minutes
- Use `X-Cache-Status` header to check cache hit/miss
- Cache key includes all search parameters

### Performance

- Use pagination for list endpoints (`limit` and `offset`)
- Batch requests when possible
- Monitor `X-Response-Time` header

### Security

- Never expose API keys in client-side code
- Use HTTPS in production
- Validate all user input
- Handle sensitive data (payment info) securely

### Error Recovery

- Implement exponential backoff for retries
- Handle rate limiting gracefully
- Provide fallback for degraded services

---

## Support

For API support, contact:
- **Email**: api-support@fly2any.com
- **Documentation**: https://fly2any.com/docs
- **Status Page**: https://status.fly2any.com

---

**Last Updated:** 2025-11-10
