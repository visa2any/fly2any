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

- `GET /health` - Health check
- `POST /auto-ticket` - Run automation

## Request Body

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
