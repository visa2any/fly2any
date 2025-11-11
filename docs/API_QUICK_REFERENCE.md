# Fly2Any API Quick Reference

Quick reference guide for common API operations.

## Base URL
```
Production:  https://fly2any.com/api
Development: http://localhost:3000/api
```

## Authentication
```bash
# Session-based (NextAuth.js)
Cookie: next-auth.session-token=YOUR_TOKEN
```

## Flight Search

### Basic Search (One-way)
```bash
POST /flights/search
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-12-15",
  "adults": 1
}
```

### Round-trip Search
```bash
POST /flights/search
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-12-15",
  "returnDate": "2025-12-22",
  "adults": 2,
  "travelClass": "economy",
  "nonStop": false
}
```

### Multi-airport Search
```bash
POST /flights/search
{
  "origin": "JFK,EWR,LGA",
  "destination": "LAX,BUR,SNA",
  "departureDate": "2025-12-15",
  "adults": 2
}
```

### Get Flight Details
```bash
GET /flights/{flightId}
```

### Confirm Price
```bash
POST /flights/confirm
{
  "flightOffers": [{ "id": "flight_123", ... }]
}
```

## Booking Management

### Create Booking
```bash
POST /flights/booking/create
{
  "flightOffer": { ... },
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
    "method": "card"
  },
  "contactInfo": {
    "email": "john@example.com",
    "phone": "+12125551234"
  }
}
```

### List Bookings
```bash
GET /bookings?status=confirmed&limit=10
```

### Get Booking
```bash
GET /bookings/{bookingId}
```

### Update Booking
```bash
PUT /bookings/{bookingId}
{
  "contactInfo": {
    "email": "newemail@example.com"
  }
}
```

### Cancel Booking
```bash
DELETE /bookings/{bookingId}?reason=Customer%20request
```

## Payment Processing

### Create Payment Intent
```bash
POST /payments/create-intent
{
  "amount": 299.99,
  "currency": "USD",
  "bookingReference": "ABC123",
  "customerEmail": "john@example.com",
  "customerName": "John Doe"
}
```

### Confirm Payment
```bash
POST /payments/confirm
{
  "paymentIntentId": "pi_123456",
  "bookingReference": "ABC123"
}
```

## Saved Searches

### List Saved Searches
```bash
GET /saved-searches
# Requires authentication
```

### Create Saved Search
```bash
POST /saved-searches
{
  "name": "NYC to LA Christmas",
  "origin": "JFK",
  "destination": "LAX",
  "departDate": "2025-12-15",
  "returnDate": "2025-12-22",
  "adults": 2,
  "cabinClass": "economy"
}
```

### Update Saved Search
```bash
PUT /saved-searches?id={searchId}
{
  "name": "Updated name"
}
```

### Delete Saved Search
```bash
DELETE /saved-searches?id={searchId}
```

## Price Alerts

### List Price Alerts
```bash
GET /price-alerts?active=true
# Requires authentication
```

### Create Price Alert
```bash
POST /price-alerts
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

### Update Price Alert
```bash
PATCH /price-alerts?id={alertId}
{
  "active": false,
  "targetPrice": 199.99
}
```

### Delete Price Alert
```bash
DELETE /price-alerts?id={alertId}
```

## Additional Features

### Get Seat Map
```bash
POST /flights/seat-map/duffel
{
  "offerId": "off_123456"
}
```

### Get Branded Fares
```bash
POST /flights/branded-fares
{
  "flightOfferId": "flight_123"
}
```

### Health Check
```bash
GET /health
```

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (price changed) |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limits

| Tier | Limit |
|------|-------|
| Standard | 100 req/min |
| Premium | 500 req/min |

## Response Headers

```
X-Cache-Status: HIT | MISS
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699545600
X-Response-Time: 145ms
```

## Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request parameters |
| `AUTHENTICATION_ERROR` | Missing/invalid authentication |
| `BOOKING_NOT_FOUND` | Booking doesn't exist |
| `PRICE_CHANGED` | Flight price changed |
| `SOLD_OUT` | Flight sold out |
| `PAYMENT_FAILED` | Payment processing failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `API_UNAVAILABLE` | External API unavailable |

## Testing Tips

### Use Development Server
```bash
npm run dev
# Access API at http://localhost:3000/api
```

### Test with cURL
```bash
# Pretty print JSON responses
curl -s http://localhost:3000/api/health | jq .

# Save response to file
curl http://localhost:3000/api/health > health.json

# Include headers in output
curl -i http://localhost:3000/api/health

# Follow redirects
curl -L http://localhost:3000/api/flights/123
```

### Import into Postman
1. File → Import
2. Select `public/openapi.yaml`
3. Ready-made collection with all endpoints

## Best Practices

1. **Caching**: Check `X-Cache-Status` header
2. **Retries**: Use exponential backoff
3. **Rate Limits**: Monitor `X-RateLimit-*` headers
4. **Errors**: Always check `success` field
5. **Validation**: Validate dates are YYYY-MM-DD
6. **Security**: Never expose API keys client-side
7. **Testing**: Use development server for testing

## Support

**Email:** api-support@fly2any.com
**Docs:** https://fly2any.com/docs
**Status:** https://status.fly2any.com

---

**Version:** 1.0.0
**Last Updated:** 2025-11-10
