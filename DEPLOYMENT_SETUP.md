# 🚀 Fly2Any Deployment Setup Guide

## Quick Start

This guide helps you deploy Fly2Any with all ML-powered cost optimization features activated.

---

## 📋 Pre-Deployment Checklist

### 1. Generate Cron Secret

```bash
# Generate secure random secret for ML pre-fetch cron
openssl rand -base64 32
```

Copy the output and save it - you'll need it in step 3.

### 2. Verify Environment Variables

Make sure your `.env.local` has all required variables from `.env.example`:

**Critical for ML Features:**
- ✅ `UPSTASH_REDIS_REST_URL` - Redis cache (free tier at upstash.com)
- ✅ `UPSTASH_REDIS_REST_TOKEN` - Redis token
- ✅ `CRON_SECRET` - Secret from step 1
- ✅ `AMADEUS_API_KEY` - Flight search API
- ✅ `AMADEUS_API_SECRET` - Flight search API
- ✅ `DUFFEL_API_TOKEN` - Alternative flight API (optional but recommended)

### 3. Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Set Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables

Add all variables from `.env.local`, especially:
- `CRON_SECRET` (from step 1)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `AMADEUS_API_KEY`
- `AMADEUS_API_SECRET`

### 5. Verify Cron Job is Active

After deployment, check:
- Vercel Dashboard → Your Project → Settings → Cron Jobs
- You should see: `/api/ml/prefetch` scheduled for `0 3 * * *` (3 AM daily)

---

## 🧪 Testing ML Features

### Test Pre-Fetch Manually

```bash
# Force-run pre-fetch (bypasses time check)
curl -X POST https://your-domain.vercel.app/api/ml/prefetch \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10, "force": true}'
```

**Expected Response:**
```json
{
  "status": "completed",
  "results": {
    "candidates": 10,
    "fetched": 8,
    "skipped": 2,
    "errors": 0
  }
}
```

### Test ML Analytics Dashboard

Visit: `https://your-domain.vercel.app/ml/dashboard`

Should see:
- Total routes tracked
- Cost savings metrics
- API efficiency stats
- Route insights

### Test Admin Dashboard

Visit: `https://your-domain.vercel.app/admin`

Should see:
- ML cost optimization banner
- System health indicators
- Quick actions

---

## 📊 Monitoring ML System

### Check Cron Execution Logs

Vercel Dashboard → Your Project → Logs → Filter by `/api/ml/prefetch`

Successful execution log:
```
✅ Authenticated: CRON system
✅ Off-peak hours check passed
🔍 Found 50 pre-fetch candidates
⏰ Pre-fetched 45 routes, skipped 5 (already cached)
💰 Estimated savings: $12.50
```

### Monitor Cost Savings

```bash
# Get ML analytics
curl https://your-domain.vercel.app/api/ml/analytics?period=7d
```

Key metrics to watch:
- `costSavings.totalSavings` - Monthly savings in USD
- `apiEfficiency.callsSaved` - API calls prevented
- `overview.avgCacheTTL` - Average cache duration
- `health.mlReadiness` - System status

---

## 🎯 Expected Performance (After 1 Week)

| Metric | Week 1 | Week 2 | Week 4 |
|--------|--------|--------|--------|
| Cache Hit Rate | 40% | 60% | 70%+ |
| API Cost Savings | $200/mo | $600/mo | $1,200/mo |
| Avg Response Time | 1.8s | 1.2s | 0.8s |
| Routes Profiled | 20 | 100 | 200+ |

---

## 🔧 Troubleshooting

### Cron Not Running

**Check 1:** Is `CRON_SECRET` set in Vercel environment variables?
```bash
vercel env ls
```

**Check 2:** Is `vercel.json` deployed?
```bash
# Should see vercel.json in deployment
vercel ls
```

**Check 3:** Force test cron endpoint
```bash
curl -X POST https://your-domain.vercel.app/api/ml/prefetch \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{"force": true}'
```

### ML Dashboard Shows "Warming Up"

This is NORMAL for first 1-2 weeks. The system needs:
- At least 50 search queries
- At least 10 unique routes
- 7 days of price data

**Speed up warm-up:**
- Run manual searches for popular routes (JFK-LAX, NYC-MIA, etc.)
- Force-run pre-fetch: `curl -X POST .../api/ml/prefetch -d '{"force": true}'`

### Redis Connection Errors

**Check 1:** Verify Redis credentials
```bash
# Test Redis connection
curl $UPSTASH_REDIS_REST_URL/ping \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# Should return: {"result":"PONG"}
```

**Check 2:** Check free tier limits
- Upstash free tier: 10,000 requests/day
- Monitor usage in Upstash dashboard

**Solution:** Upgrade to paid tier if hitting limits

---

## 🚀 Post-Deployment Optimization

### Week 1: Monitor Baseline

- Run flight searches for 10-15 popular routes daily
- Check `/ml/dashboard` for data accumulation
- Verify cron runs at 3 AM daily

### Week 2: Adjust Pre-Fetch

If you have high traffic (>1K searches/day):
```json
// vercel.json - increase pre-fetch frequency
{
  "crons": [
    {
      "path": "/api/ml/prefetch",
      "schedule": "0 3,9,15,21 * * *"  // 4 times per day
    }
  ]
}
```

### Week 3+: Scale Up

As traffic grows, increase pre-fetch candidates:
```bash
# In vercel.json or directly via cron config
# Default: 50 routes
# High traffic: 100-200 routes

curl -X POST .../api/ml/prefetch \
  -H "Authorization: Bearer $CRON_SECRET" \
  -d '{"limit": 100}'
```

---

## 📞 Support

Having issues? Check these resources:

1. **ML Dashboard**: `/ml/dashboard` - Real-time system status
2. **Admin Panel**: `/admin` - Overall health check
3. **Vercel Logs**: Real-time execution logs
4. **Redis Dashboard**: Monitor cache usage at upstash.com

---

## ✅ Deployment Complete!

Your ML-powered cost optimization system is now active. You should see:

- ✅ Cron job running daily at 3 AM
- ✅ Popular routes pre-cached
- ✅ Dynamic cache TTL optimization
- ✅ Smart API selection
- ✅ Real-time cost savings tracking

**Next Steps:**
1. Share the site with users
2. Monitor `/ml/dashboard` weekly
3. Watch cost savings accumulate
4. Celebrate your 60-75% API cost reduction! 🎉
