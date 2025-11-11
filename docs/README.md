# Fly2Any API Documentation

Welcome to the Fly2Any API documentation. This directory contains comprehensive documentation for all API endpoints.

## Available Documentation

### 1. Human-Readable API Documentation
**File:** [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

Complete API reference with:
- Detailed endpoint descriptions
- Request/response examples
- cURL command examples
- Error codes and handling
- Best practices
- Authentication guide

Perfect for developers integrating with the API.

### 2. OpenAPI 3.0 Specification
**File:** [`../public/openapi.yaml`](../public/openapi.yaml)

Machine-readable API specification in OpenAPI 3.0 format:
- Complete schema definitions
- Request/response validation
- Interactive documentation via Swagger UI
- API client code generation

## Quick Start

### View Interactive API Documentation

You can view the OpenAPI specification in interactive format using:

1. **Swagger UI** (recommended):
   ```bash
   # Using npx
   npx swagger-ui-watcher openapi.yaml

   # Or visit online
   # Upload public/openapi.yaml to https://editor.swagger.io/
   ```

2. **Redoc**:
   ```bash
   npx @redocly/cli preview-docs public/openapi.yaml
   ```

3. **Online Swagger Editor**:
   - Visit: https://editor.swagger.io/
   - File → Import File → Select `public/openapi.yaml`

### Generate API Client

Generate client libraries in multiple languages:

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i public/openapi.yaml \
  -g typescript-fetch \
  -o ./generated/typescript-client

# Generate Python client
openapi-generator-cli generate \
  -i public/openapi.yaml \
  -g python \
  -o ./generated/python-client

# Generate Java client
openapi-generator-cli generate \
  -i public/openapi.yaml \
  -g java \
  -o ./generated/java-client
```

## API Overview

### Base URLs
- **Production:** `https://fly2any.com/api`
- **Development:** `http://localhost:3000/api`

### Authentication
Most endpoints use session-based authentication via NextAuth.js. Protected endpoints require a valid session cookie.

### Rate Limits
- Standard: 100 requests/minute
- Premium: 500 requests/minute

## Key Endpoints

### Flight Operations
- `POST /api/flights/search` - Search for flights
- `GET /api/flights/{id}` - Get flight details
- `POST /api/flights/confirm` - Confirm pricing
- `POST /api/flights/seat-map/duffel` - Get seat maps
- `POST /api/flights/branded-fares` - Get fare options

### Booking Management
- `POST /api/flights/booking/create` - Create booking
- `GET /api/bookings` - List bookings
- `GET /api/bookings/{id}` - Get booking details
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhooks

### User Features
- `GET /api/saved-searches` - List saved searches
- `POST /api/saved-searches` - Save search
- `GET /api/price-alerts` - List price alerts
- `POST /api/price-alerts` - Create alert

### System
- `GET /api/health` - Health check

## Example Usage

### Search for Flights

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

### Create a Booking

```bash
curl -X POST https://fly2any.com/api/flights/booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "flightOffer": { ... },
    "passengers": [ ... ],
    "payment": { ... },
    "contactInfo": { ... }
  }'
```

## Testing

### Test Environment
Use the development server for testing:
```bash
npm run dev
# API available at http://localhost:3000/api
```

### API Testing Tools
- **Postman**: Import `public/openapi.yaml` for a ready-made collection
- **Insomnia**: Supports OpenAPI import
- **Thunder Client**: VS Code extension with OpenAPI support
- **cURL**: Use examples from `API_DOCUMENTATION.md`

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

Common error codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (price changed)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
- `503` - Service Unavailable

## Support

- **Email:** api-support@fly2any.com
- **Documentation:** https://fly2any.com/docs
- **Status:** https://status.fly2any.com

## Contributing

When adding new endpoints:

1. Update `API_DOCUMENTATION.md` with:
   - Endpoint description
   - Request/response examples
   - cURL examples
   - Error cases

2. Update `openapi.yaml` with:
   - Path definition
   - Schema definitions
   - Response codes
   - Examples

3. Test changes:
   ```bash
   # Validate OpenAPI spec
   npx @openapitools/openapi-generator-cli validate -i public/openapi.yaml
   ```

## Version History

- **v1.0.0** (2025-11-10) - Initial release
  - Flight search and booking
  - Payment processing
  - User preferences
  - Health monitoring

---

**Last Updated:** 2025-11-10
