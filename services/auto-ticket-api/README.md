# Fly2Any Auto-Ticket API

Standalone Playwright automation service for consolidator ticketing.

## Deploy to Railway

1. Create new project on Railway
2. Deploy from GitHub → select `services/auto-ticket-api` folder
3. Railway auto-detects Dockerfile
4. Get deployed URL (e.g., `https://auto-ticket-xxx.up.railway.app`)

## Configure Fly2Any

Add to Vercel env vars:
```
N8N_AUTO_TICKET_WEBHOOK=https://your-railway-url.up.railway.app/auto-ticket
```

## Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Health check |
| `POST /auto-ticket` | Flight consolidator (TheBestAgent.PRO) |
| `POST /viator-book` | Tours/Activities (Viator Travel Agents) |

## Flight Auto-Ticket Request

```json
{
  "bookingId": "booking_xxx",
  "bookingReference": "FLY2A-XXX",
  "dryRun": true,
  "consolidatorEmail": "xxx",
  "consolidatorPassword": "xxx",
  "automationData": {
    "flights": { "segments": [...] },
    "passengers": [...],
    "pricing": { "customerPaid": 123.45 }
  }
}
```

## Viator Tour Request

```json
{
  "bookingId": "booking_xxx",
  "bookingReference": "FLY2A-XXX",
  "dryRun": true,
  "viatorEmail": "xxx",
  "viatorPassword": "xxx",
  "tourData": {
    "tourName": "City Walking Tour",
    "productCode": "12345P1",
    "date": "2024-03-15",
    "timeSlot": "09:00",
    "travelers": 2,
    "passengers": [
      { "firstName": "John", "lastName": "Doe", "email": "...", "phone": "..." }
    ]
  }
}
```

## Env Vars (Vercel)
```
N8N_AUTO_TICKET_WEBHOOK=https://your-railway-url/auto-ticket
VIATOR_BOOK_WEBHOOK=https://your-railway-url/viator-book
VIATOR_EMAIL=your-viator-agent-email
VIATOR_PASSWORD=your-viator-agent-password
```
