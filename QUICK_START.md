# Content Factory Quick Start

## ✅ Ready: Twitter + Telegram + AI Generation

**Test Content Generation:**
```bash
curl -X POST https://fly2any.com/api/admin/content/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"deal","platforms":["twitter","telegram"]}'
```

**Distribute Content:**
```bash
curl -X POST https://fly2any.com/api/cron/distribute
```

**Admin Dashboard:**
https://fly2any.com/admin/growth/content/manage

**Auto-Post (Vercel Cron):**
Add to vercel.json:
```json
{"crons": [{"path": "/api/cron/distribute", "schedule": "*/15 * * * *"}]}
```

**Missing:** TELEGRAM_CHANNEL_ID in .env
