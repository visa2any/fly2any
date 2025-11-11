# Fly2Any - Production Deployment Guide & Runbook

**Version:** 1.0.0
**Last Updated:** November 2025
**Status:** Production Ready

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring Setup](#monitoring-setup)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)
9. [Maintenance Operations](#maintenance-operations)

---

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] All TypeScript type errors resolved (`npm run build` succeeds)
- [ ] ESLint warnings reviewed and addressed
- [ ] All E2E tests passing (`npm run test:e2e`)
- [ ] Code reviewed and approved
- [ ] Git repository up to date with all changes committed

### 2. Environment Variables

- [ ] Production database URL configured (Neon PostgreSQL)
- [ ] Stripe production keys obtained and approved
- [ ] Duffel production API key ready (if approved)
- [ ] Amadeus production API key ready (if approved)
- [ ] Resend API key configured for production emails
- [ ] Sentry DSN configured for error tracking
- [ ] NextAuth secret generated (secure random string)
- [ ] OAuth credentials (Google/GitHub) configured for production domain

### 3. Third-Party Services

- [ ] **Neon Database**: Production database created and accessible
- [ ] **Stripe**: Production account approved, webhook endpoints configured
- [ ] **Duffel**: Production API access approved
- [ ] **Amadeus**: Production API credentials obtained
- [ ] **Resend**: Domain verified, production API key active
- [ ] **Sentry**: Project created, DSN obtained
- [ ] **Upstash Redis**: Production instance created (optional but recommended)

### 4. Security

- [ ] All API keys and secrets stored securely
- [ ] CORS policies reviewed and configured
- [ ] Rate limiting enabled and tested
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF protection active
- [ ] Encryption keys generated and stored securely (AWS KMS or similar)

### 5. Performance

- [ ] Service worker tested and functional
- [ ] Image optimization configured
- [ ] Bundle size analyzed (< 500KB JavaScript)
- [ ] Lighthouse score > 90 for Performance
- [ ] Core Web Vitals meeting targets

---

## Environment Setup

### Production Environment Variables

Create a `.env.production` file (or configure in Vercel dashboard):

```bash
# ========================================
# DATABASE (Neon PostgreSQL)
# ========================================
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
POSTGRES_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require

# ========================================
# NEXTAUTH CONFIGURATION
# ========================================
NEXTAUTH_SECRET=[generate-secure-32-char-random-string]
NEXTAUTH_URL=https://yourdomain.com

# OAuth Providers
GOOGLE_CLIENT_ID=[production-google-client-id]
GOOGLE_CLIENT_SECRET=[production-google-client-secret]
GITHUB_ID=[production-github-app-id]
GITHUB_SECRET=[production-github-app-secret]

# ========================================
# FLIGHT APIS
# ========================================
# Duffel (NDC Provider)
DUFFEL_ACCESS_TOKEN=[production-duffel-token]

# Amadeus (GDS Provider)
AMADEUS_API_KEY=[production-amadeus-key]
AMADEUS_API_SECRET=[production-amadeus-secret]
AMADEUS_ENVIRONMENT=production

# ========================================
# STRIPE PAYMENT INTEGRATION
# ========================================
STRIPE_SECRET_KEY=sk_live_[your-stripe-secret-key]
STRIPE_PUBLIC_KEY=pk_live_[your-stripe-public-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]

# ========================================
# EMAIL SERVICE (Resend)
# ========================================
RESEND_API_KEY=[production-resend-api-key]
FROM_EMAIL=bookings@yourdomain.com

# ========================================
# MONITORING (Sentry)
# ========================================
NEXT_PUBLIC_SENTRY_DSN=[your-sentry-dsn]
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_ORG=[your-sentry-org]
SENTRY_PROJECT=[your-sentry-project]
SENTRY_AUTH_TOKEN=[your-sentry-auth-token]

# ========================================
# REDIS CACHE (Upstash)
# ========================================
UPSTASH_REDIS_REST_URL=[your-upstash-url]
UPSTASH_REDIS_REST_TOKEN=[your-upstash-token]

# ========================================
# ENCRYPTION KEYS
# ========================================
PASSPORT_ENCRYPTION_KEY=[generate-32-byte-hex-key]
PHONE_ENCRYPTION_KEY=[generate-32-byte-hex-key]

# ========================================
# APPLICATION
# ========================================
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Generating Secure Keys

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate encryption keys (32-byte hex)
openssl rand -hex 32

# Verify key length
echo -n "[your-key]" | wc -c  # Should be 64 characters for hex encoding
```

---

## Database Configuration

### 1. Neon PostgreSQL Setup

1. **Create Production Database:**
   ```bash
   # Login to Neon Console
   https://console.neon.tech/

   # Create new project: "fly2any-production"
   # Select region: US East (N. Virginia) or closest to your users
   # Copy connection string
   ```

2. **Configure Connection Pooling:**
   - Enable connection pooling in Neon dashboard
   - Use pooled connection string for serverless functions
   - Format: `postgresql://user:pass@endpoint-pooler.neon.tech/db?sslmode=require`

3. **Run Database Migrations:**
   ```bash
   # Set production database URL
   export DATABASE_URL="postgresql://..."

   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate deploy

   # Verify schema
   npx prisma db pull
   ```

4. **Apply Security Enhancements:**
   ```bash
   # Run constraint migrations
   psql $DATABASE_URL < lib/db/migrations/003_add_database_constraints.sql

   # Set up audit log
   psql $DATABASE_URL < lib/db/migrations/004_audit_log.sql

   # Enable soft delete
   psql $DATABASE_URL < lib/db/migrations/005_soft_delete.sql
   ```

5. **Create Database Indexes:**
   ```sql
   -- Performance indexes
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON bookings(status);
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

   -- Price alerts
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alerts_active ON price_alerts(active) WHERE active = true;
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alerts_user_active ON price_alerts(user_id, active);
   ```

### 2. Database Backup Strategy

```bash
# Set up automated backups (Neon handles this automatically)
# Additional manual backup before deployment:

# Backup current production data
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip backup_*.sql

# Upload to S3 or cloud storage
aws s3 cp backup_*.sql.gz s3://your-backup-bucket/
```

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2. Link Project

```bash
# Link to existing Vercel project
vercel link

# Or create new project
vercel
```

### 3. Configure Environment Variables

```bash
# Set environment variables via CLI
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXTAUTH_SECRET production
# ... (repeat for all environment variables)

# Or use Vercel dashboard:
# https://vercel.com/[your-team]/[your-project]/settings/environment-variables
```

### 4. Configure Vercel Project Settings

In `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### 5. Deploy to Production

```bash
# Preview deployment (staging)
vercel

# Production deployment
vercel --prod

# Or use GitHub integration (recommended)
git push origin main  # Triggers automatic deployment
```

### 6. Configure Custom Domain

```bash
# Add custom domain
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com

# Verify DNS settings
# Add these records to your DNS provider:
# A record: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com
```

---

## Post-Deployment Verification

### 1. Health Check

```bash
# Check API health endpoint
curl https://yourdomain.com/api/health

# Expected response:
# {
#   "status": "healthy",
#   "checks": {
#     "database": true,
#     "redis": true,
#     "duffel": true,
#     "amadeus": true,
#     "stripe": true
#   },
#   "timestamp": "2025-11-10T12:00:00.000Z"
# }
```

### 2. Smoke Tests

```bash
# Test critical user flows
# 1. Homepage loads
curl -I https://yourdomain.com

# 2. Flight search API
curl -X POST https://yourdomain.com/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"origin":"JFK","destination":"LAX","departDate":"2025-12-01","adults":1}'

# 3. Authentication
curl -I https://yourdomain.com/auth/signin

# 4. Payment webhook (test mode)
curl -X POST https://yourdomain.com/api/payments/webhook \
  -H "stripe-signature: test" \
  -d '{"type":"test","data":{}}'
```

### 3. Monitoring Verification

```bash
# Check Sentry integration
# Visit: https://sentry.io/organizations/[org]/projects/[project]/

# Trigger test error
curl https://yourdomain.com/api/test-error

# Verify error appears in Sentry dashboard
```

### 4. Performance Verification

```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://yourdomain.com --view

# Check Core Web Vitals
# Visit: https://pagespeed.web.dev/
# Enter: https://yourdomain.com
```

---

## Monitoring Setup

### 1. Sentry Configuration

```typescript
// Already configured in lib/monitoring/sentry.ts
// Verify in Sentry dashboard:
// - Error tracking active
// - Performance monitoring enabled
// - Alerts configured
```

### 2. Uptime Monitoring

```bash
# Set up external uptime monitoring
# Recommended services:
# - UptimeRobot (https://uptimerobot.com)
# - Pingdom (https://www.pingdom.com)
# - Better Uptime (https://betteruptime.com)

# Monitor these endpoints:
# - https://yourdomain.com (every 5 minutes)
# - https://yourdomain.com/api/health (every 5 minutes)
```

### 3. Log Aggregation

```bash
# Vercel automatically collects logs
# View logs: https://vercel.com/[team]/[project]/logs

# For advanced log analysis, integrate with:
# - Datadog
# - LogRocket
# - Logtail
```

### 4. Alert Configuration

Set up alerts for:
- API error rate > 5%
- Response time > 2 seconds (P95)
- Database connection failures
- Payment failures
- Critical errors in Sentry

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failures

**Symptoms:**
- 500 errors on API routes
- "Can't reach database server" errors

**Solutions:**
```bash
# Check database status
npx prisma db pull

# Verify connection string
echo $DATABASE_URL

# Check Neon dashboard for database status
# https://console.neon.tech/

# Test connection manually
psql $DATABASE_URL -c "SELECT 1;"
```

#### 2. Stripe Webhook Failures

**Symptoms:**
- Payment confirmations not sent
- Bookings stuck in "pending" status

**Solutions:**
```bash
# Verify webhook secret
curl https://yourdomain.com/api/payments/webhook \
  -X POST \
  -H "stripe-signature: test"

# Check Stripe dashboard for webhook logs
# https://dashboard.stripe.com/webhooks

# Re-register webhook if needed
# URL: https://yourdomain.com/api/payments/webhook
# Events: payment_intent.succeeded, payment_intent.payment_failed
```

#### 3. Email Delivery Issues

**Symptoms:**
- Booking confirmations not received
- Price alerts not sent

**Solutions:**
```bash
# Check Resend dashboard
# https://resend.com/emails

# Verify domain configuration
dig TXT yourdomain.com

# Test email sending
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"bookings@yourdomain.com","to":"test@example.com","subject":"Test","html":"Test"}'
```

#### 4. API Rate Limiting

**Symptoms:**
- 429 errors from Duffel/Amadeus
- Flight search failures

**Solutions:**
```bash
# Check rate limit headers
curl -I https://api.duffel.com/

# Implement Redis caching if not already enabled
# Add UPSTASH_REDIS_REST_URL to environment variables

# Monitor API usage in provider dashboards
```

#### 5. Build Failures

**Symptoms:**
- Vercel deployment fails
- TypeScript errors during build

**Solutions:**
```bash
# Clean build locally
rm -rf .next node_modules
npm install
npm run build

# Check Vercel build logs
vercel logs

# Ensure all environment variables are set
vercel env ls
```

---

## Rollback Procedures

### 1. Immediate Rollback (Vercel)

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or use Vercel dashboard:
# https://vercel.com/[team]/[project]/deployments
# Click "Promote to Production" on previous successful deployment
```

### 2. Database Rollback

```bash
# Restore from backup
gunzip backup_YYYYMMDD_HHMMSS.sql.gz
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Or use Neon's point-in-time recovery
# https://console.neon.tech/ > Project > Restore
```

### 3. DNS Rollback

```bash
# Update DNS records to point to previous deployment
# Or use Vercel's instant rollback (no DNS changes needed)
```

---

## Maintenance Operations

### 1. Database Maintenance

```sql
-- Weekly maintenance (run during low-traffic periods)

-- Vacuum tables
VACUUM ANALYZE bookings;
VACUUM ANALYZE price_alerts;
VACUUM ANALYZE saved_searches;

-- Reindex for performance
REINDEX TABLE bookings;

-- Clean up old audit logs (> 90 days)
DELETE FROM booking_audit_log
WHERE created_at < NOW() - INTERVAL '90 days';

-- Clean up soft-deleted records (> 30 days)
DELETE FROM bookings
WHERE deleted_at < NOW() - INTERVAL '30 days';
```

### 2. Cache Warming

```bash
# Warm up Redis cache after deployment
node scripts/warm-cache.js

# Pre-populate common routes
curl https://yourdomain.com/flights?from=JFK&to=LAX
curl https://yourdomain.com/flights?from=LAX&to=JFK
```

### 3. Certificate Renewal

```bash
# Vercel handles SSL certificates automatically
# No manual action required

# Verify certificate
curl -vI https://yourdomain.com 2>&1 | grep -i "expire"
```

### 4. Dependency Updates

```bash
# Check for updates (monthly)
npm outdated

# Update dependencies
npm update

# Test thoroughly
npm run build
npm run test:e2e

# Deploy after testing
vercel --prod
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Homepage Load (FCP) | < 1.5s | 2.5s |
| API Response Time (P95) | < 500ms | 1000ms |
| Flight Search Time | < 3s | 5s |
| Database Query Time | < 100ms | 500ms |
| Error Rate | < 0.1% | 1% |
| Uptime | > 99.9% | 99% |

### Monitoring Commands

```bash
# Check current performance
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Where curl-format.txt contains:
# time_namelookup:  %{time_namelookup}\n
# time_connect:  %{time_connect}\n
# time_appconnect:  %{time_appconnect}\n
# time_pretransfer:  %{time_pretransfer}\n
# time_redirect:  %{time_redirect}\n
# time_starttransfer:  %{time_starttransfer}\n
# time_total:  %{time_total}\n
```

---

## Emergency Contacts

### Team

- **Tech Lead:** [Name] - [Email] - [Phone]
- **DevOps:** [Name] - [Email] - [Phone]
- **On-Call Engineer:** Check PagerDuty

### Service Providers

- **Vercel Support:** support@vercel.com
- **Neon Support:** support@neon.tech
- **Stripe Support:** https://support.stripe.com
- **Duffel Support:** support@duffel.com
- **Amadeus Support:** developers@amadeus.com

---

## Additional Resources

- **API Documentation:** `/docs/API.md`
- **System Architecture:** `/MASTER_SYSTEM_ARCHITECTURE.md`
- **Security Documentation:** `/docs/SECURITY.md`
- **E2E Testing Guide:** `/tests/e2e/README.md`
- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs

---

**Document Maintained By:** Engineering Team
**Review Schedule:** Monthly or after major deployments
**Last Deployment:** [Date]
**Next Review Date:** [Date + 1 month]
