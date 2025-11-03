# 🚀 TripMatch API Documentation

**Complete REST API for TripMatch Social Travel Platform**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Trips API](#trips-api)
- [Trip Components API](#trip-components-api)
- [Members API](#members-api)
- [Credits API](#credits-api)
- [Seed Data API](#seed-data-api)
- [Response Format](#response-format)
- [Error Handling](#error-handling)

---

## Overview

**Base URL (Development):** `http://localhost:3001/api/tripmatch`
**Base URL (Production):** `https://fly2any-fresh-kqb3r1hnv-visa2anys-projects.vercel.app/api/tripmatch`

All endpoints return JSON responses with a consistent format:

```json
{
  "success": true|false,
  "data": { ... },
  "message": "Optional success/error message",
  "error": "Error description (if success=false)"
}
```

---

## Authentication

**Current Status:** Placeholder authentication (`demo-user-001`)

**TODO:** Integrate with Clerk/NextAuth for real authentication.

**Headers Required (Future):**
```
Authorization: Bearer <token>
```

---

## Trips API

### 1. List All Trips

**GET** `/trips`

List all published trips with optional filtering.

**Query Parameters:**
- `category` (string, optional): Filter by trip category
- `featured` (boolean, optional): Filter featured trips only
- `trending` (boolean, optional): Filter trending trips only
- `limit` (number, optional, default: 20): Max results
- `offset` (number, optional, default: 0): Pagination offset

**Example:**
```bash
GET /api/tripmatch/trips?trending=true&limit=6
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "🏝️ Ibiza Summer Party",
      "destination": "Ibiza, Spain",
      "destinationCode": "IBZ",
      "destinationCountry": "Spain",
      "startDate": "2025-07-15",
      "endDate": "2025-07-22",
      "category": "party",
      "estimatedPricePerPerson": 1899,
      "currentMembers": 8,
      "maxMembers": 12,
      "featured": false,
      "trending": true,
      "coverImageUrl": "https://...",
      "tags": ["party", "beach", "nightlife"],
      "createdAt": "2025-11-02T19:42:00Z"
    }
  ],
  "count": 6,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Create Trip

**POST** `/trips`

Create a new trip group (creator only).

**Request Body:**
```json
{
  "title": "🌊 Surfing in Portugal",
  "description": "Week-long surfing adventure!",
  "destination": "Lagos, Portugal",
  "destinationCode": "FAO",
  "destinationCountry": "Portugal",
  "startDate": "2025-06-15",
  "endDate": "2025-06-22",
  "category": "adventure",
  "visibility": "public",
  "maxMembers": 10,
  "minMembers": 4,
  "estimatedPricePerPerson": 1299,
  "coverImageUrl": "https://...",
  "tags": ["surfing", "adventure"],
  "rules": "Intermediate surfers welcome!"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid",
    "title": "🌊 Surfing in Portugal",
    "status": "draft",
    "createdAt": "2025-11-02T20:00:00Z"
  },
  "message": "Trip created successfully!"
}
```

---

### 3. Get Trip Details

**GET** `/trips/[id]`

Get complete trip information with all components and members.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid",
    "title": "🏝️ Ibiza Summer Party",
    "destination": "Ibiza, Spain",
    "startDate": "2025-07-15",
    "endDate": "2025-07-22",
    "category": "party",
    "currentMembers": 8,
    "maxMembers": 12,
    "estimatedPricePerPerson": 1899,
    "creator": {
      "userId": "user-001",
      "displayName": "Sarah Martinez",
      "avatarUrl": "https://..."
    },
    "components": [
      {
        "id": "comp-001",
        "type": "flight",
        "title": "Round-trip to Ibiza",
        "basePricePerPerson": 450,
        "totalPrice": 3600,
        "isRequired": true
      }
    ],
    "members": [
      {
        "id": "member-001",
        "userId": "user-001",
        "role": "creator",
        "status": "confirmed",
        "userName": "Sarah Martinez",
        "joinedAt": "2025-10-15T10:00:00Z"
      }
    ],
    "posts": [],
    "messages": []
  }
}
```

---

### 4. Update Trip

**PATCH** `/trips/[id]`

Update trip details (creator/admin only).

**Request Body:**
```json
{
  "title": "🏝️ Ibiza Summer Party - UPDATED",
  "estimatedPricePerPerson": 1799,
  "status": "published"
}
```

**Response:** 200 OK

---

### 5. Delete Trip

**DELETE** `/trips/[id]`

Delete a trip (creator only, only if no bookings exist).

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

---

## Trip Components API

Add flights, hotels, cars, and tours to trips.

### 1. List Components

**GET** `/trips/[id]/components`

**Query Parameters:**
- `type` (string, optional): Filter by component type
- `required` (boolean, optional): Filter by required status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "comp-uuid",
      "tripId": "trip-uuid",
      "type": "flight",
      "provider": "duffel",
      "title": "Round-trip to Ibiza",
      "basePricePerPerson": 450,
      "totalPrice": 3600,
      "currency": "USD",
      "startDatetime": "2025-07-15T08:00:00Z",
      "isRequired": true,
      "isOptional": false
    }
  ],
  "count": 5
}
```

---

### 2. Add Component

**POST** `/trips/[id]/components`

**Request Body:**
```json
{
  "type": "flight",
  "provider": "duffel",
  "providerId": "off_123456",
  "providerData": { "offerId": "off_123456", "segments": [...] },
  "basePricePerPerson": 450,
  "totalPrice": 3600,
  "currency": "USD",
  "title": "Round-trip to Ibiza",
  "description": "Direct flights via Madrid",
  "startDatetime": "2025-07-15T08:00:00Z",
  "endDatetime": "2025-07-22T18:00:00Z",
  "durationMinutes": 240,
  "location": "Ibiza Airport (IBZ)",
  "isRequired": true,
  "isOptional": false,
  "displayOrder": 1,
  "imageUrl": "https://..."
}
```

**Valid Component Types:**
- `flight`
- `accommodation`
- `car`
- `tour`
- `activity`
- `dining`
- `insurance`
- `other`

**Response:** 201 Created

---

### 3. Update Component

**PATCH** `/trips/[id]/components/[componentId]`

Update any component fields.

---

### 4. Delete Component

**DELETE** `/trips/[id]/components/[componentId]`

Remove component and update trip pricing.

---

## Members API

Manage trip members, invitations, and roles.

### 1. List Members

**GET** `/trips/[id]/members`

**Query Parameters:**
- `status` (string): Filter by status (invited, confirmed, declined, paid)
- `role` (string): Filter by role (creator, admin, member)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "tripId": "trip-uuid",
      "userId": "user-001",
      "role": "creator",
      "status": "confirmed",
      "userName": "Sarah Martinez",
      "userAvatarUrl": "https://...",
      "joinedAt": "2025-10-15T10:00:00Z",
      "confirmedAt": "2025-10-15T10:00:00Z",
      "creditsApplied": 0,
      "amountPaid": 0,
      "paymentStatus": "pending",
      "profile": {
        "displayName": "Sarah Martinez",
        "bio": "Travel enthusiast",
        "tripsCompleted": 12,
        "avgRating": 4.8
      }
    }
  ],
  "count": 8
}
```

---

### 2. Invite Member

**POST** `/trips/[id]/members`

Invite a user to join the trip (creator/admin only).

**Request Body:**
```json
{
  "email": "john@example.com",
  "role": "member",
  "invitationMessage": "Join us for an amazing trip!",
  "autoConfirm": false
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "tripId": "trip-uuid",
    "userId": "user-002",
    "status": "invited",
    "inviteCode": "ABC123XYZ"
  },
  "message": "Invitation sent to john@example.com. Code: ABC123XYZ"
}
```

---

### 3. Join Trip

**POST** `/trips/[id]/join`

Join a trip using an invite code.

**Request Body:**
```json
{
  "inviteCode": "ABC123XYZ"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "status": "confirmed",
    "confirmedAt": "2025-11-02T20:15:00Z"
  },
  "message": "Welcome to Ibiza Summer Party! You are member #9.",
  "trip": {
    "id": "trip-uuid",
    "title": "🏝️ Ibiza Summer Party",
    "currentMembers": 9,
    "maxMembers": 12
  }
}
```

---

### 4. Update Member

**PATCH** `/trips/[id]/members/[memberId]`

Update member status, role, or customizations.

**Request Body:**
```json
{
  "status": "confirmed",
  "role": "admin",
  "customizations": {
    "dietaryRestrictions": "vegetarian",
    "roomPreference": "single"
  }
}
```

---

### 5. Remove Member

**DELETE** `/trips/[id]/members/[memberId]`

Remove member from trip (creator/admin or self).

---

## Credits API

Manage user credits and rewards.

### 1. Get Credit Balance

**GET** `/credits`

Get user's credit balance and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 500,
    "lifetimeEarned": 1200,
    "lifetimeSpent": 700,
    "pendingBalance": 50,
    "tier": "silver",
    "bonusMultiplier": 1.1,
    "lastUpdated": "2025-11-02T20:00:00Z",
    "stats": {
      "totalTransactions": 1900,
      "averageEarningPerTransaction": 50,
      "sourceBreakdown": [
        {
          "source": "member_recruitment",
          "totalEarned": 800,
          "transactionCount": 16
        }
      ]
    },
    "recentTransactions": [...]
  }
}
```

---

### 2. Get Transaction History

**GET** `/credits/history`

Get detailed transaction history.

**Query Parameters:**
- `type` (string): Filter by type (reward, redemption, bonus, refund)
- `source` (string): Filter by source
- `status` (string): Filter by status (pending, completed, failed)
- `limit` (number, default: 50, max: 200)
- `offset` (number, default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn-uuid",
      "amount": 50,
      "type": "reward",
      "source": "member_recruitment",
      "description": "Member 8 joined Ibiza Summer Party",
      "referenceType": "trip",
      "referenceId": "trip-uuid",
      "status": "completed",
      "createdAt": "2025-11-02T20:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 3. Apply Credits

**POST** `/credits/apply`

Apply credits to a booking or membership.

**Request Body:**
```json
{
  "amount": 100,
  "tripId": "trip-uuid",
  "memberId": "member-uuid"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-uuid",
    "creditsApplied": 100,
    "valueUSD": 10.00,
    "remainingBalance": 400,
    "tripId": "trip-uuid",
    "memberId": "member-uuid"
  },
  "message": "Successfully applied 100 credits ($10.00) to your booking!"
}
```

**Credit Conversion Rate:** 1 credit = $0.10 USD

---

## Seed Data API

### Seed Database

**POST** `/seed`

Populate database with sample trips for testing.

**Query Parameters:**
- `clear` (boolean): Clear existing data before seeding

**Example:**
```bash
POST /api/tripmatch/seed?clear=true
```

**Response:**
```json
{
  "success": true,
  "message": "Seed data created successfully!",
  "data": {
    "users": 3,
    "trips": 6,
    "tripIds": ["uuid1", "uuid2", ...]
  }
}
```

**Creates:**
- 3 demo users (Sarah, Mike, Emma)
- 6 sample trips (Ibiza, Miami, Barcelona, Swiss Alps, Vegas, Bali)

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "count": 10, // For list endpoints
  "pagination": { ... } // For paginated endpoints
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error message",
  "hint": "Optional suggestion for fixing the error"
}
```

---

## Error Handling

### HTTP Status Codes

- **200 OK**: Successful GET, PATCH, DELETE
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

### Common Errors

**Invalid Request:**
```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["title", "destination", "startDate"]
}
```

**Permission Denied:**
```json
{
  "success": false,
  "error": "Only trip creators can update the trip"
}
```

**Resource Not Found:**
```json
{
  "success": false,
  "error": "Trip not found"
}
```

---

## Testing the API

### Using cURL

```bash
# List trending trips
curl http://localhost:3001/api/tripmatch/trips?trending=true

# Create a trip
curl -X POST http://localhost:3001/api/tripmatch/trips \
  -H "Content-Type: application/json" \
  -d '{"title":"Beach Trip","destination":"Miami",...}'

# Join a trip
curl -X POST http://localhost:3001/api/tripmatch/trips/[id]/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"ABC123"}'

# Get credit balance
curl http://localhost:3001/api/tripmatch/credits
```

### Using Postman/Insomnia

Import the Postman collection from the repository or create requests manually using the examples above.

**Environment Variables:**
- `baseUrl`: `http://localhost:3001/api/tripmatch` (dev)
- `tripId`: Copy from API responses
- `memberId`: Copy from API responses

---

## Credit Reward System

### How Credits Work

**Earning Credits:**
- Member recruitment: 50 credits per member
- Multipliers based on group size:
  - 1-7 members: 1.0x (50 credits)
  - 8-11 members: 1.5x (75 credits)
  - 12+ members: 2.0x (100 credits)

**Using Credits:**
- 1 credit = $0.10 USD
- Apply to bookings, memberships, or upgrades
- No expiration (unless specified)

**Example:**
- Recruit 12 members = 12 × 100 credits = 1,200 credits
- Value = 1,200 × $0.10 = $120 USD discount

---

## Rate Limiting

**Current:** No rate limiting implemented

**Future:** 100 requests per minute per user

---

## Changelog

**v1.0.0 - November 2, 2025**
- Initial API release
- Trips CRUD operations
- Trip components management
- Member management with invitations
- Credit system with rewards
- Seed data for testing

---

## Support

**Documentation:** This file
**Issues:** Report bugs in the repository
**Questions:** Contact the development team

---

**🎉 TripMatch API - Built with Next.js 14, TypeScript, and Neon PostgreSQL**
