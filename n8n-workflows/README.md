# N8N Workflows for Fly2Any Auto-Ticketing

## WORKING Endpoint (USE THIS)

### Fly2Any-Simple
- **Webhook URL**: `https://n8n-production-81b6.up.railway.app/webhook/fly2any-simple`
- **Method**: POST
- **Status**: ACTIVE & WORKING

**Request:**
```bash
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/fly2any-simple \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"BK-123","passengerName":"John Doe"}'
```

**Response:**
```json
{"success":true,"pnr":"AUTO-1766784704077","timestamp":"2025-12-26T21:31:44.077Z"}
```

## N8N Expression Syntax (CRITICAL)

### CORRECT - Pure JavaScript Object
```
={{ { success: true, bookingId: $json.body.bookingId, pnr: 'AUTO-' + Date.now() } }}
```

### WRONG - Mixed JSON/Expressions (causes Invalid JSON error)
```
={"success":true,"pnr":"AUTO-{{ Date.now() }}"}
```

## Webhook Data Structure

When N8N receives a POST webhook, data is at:
- `$json.body.bookingId` - JSON body fields
- `$json.headers` - HTTP headers
- `$json.query` - Query parameters

## N8N Credentials
- **URL**: https://n8n-production-81b6.up.railway.app
- **Email**: fly2any.travel@gmail.com
- **Password**: Tagualife4/

## Fly2Any Webhook Callback
- **URL**: https://www.fly2any.com/api/webhooks/n8n
- **Header**: `x-n8n-secret: fly2any-n8n-webhook-secret-2024`

## Other Workflows (Have IF Condition Issues)

These workflows have IF node condition issues with N8N expression evaluation:
- `fly2any-v2` - Returns "bookingId required"
- `fly2any-ticket-final` - Returns "Missing bookingId"

**Recommendation**: Use `fly2any-simple` endpoint. Do validation on Fly2Any backend before calling webhook.
