# Vercel Deployment Guide - Phase 7

Complete guide for deploying Fly2Any to Vercel with all Phase 7 features.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. Vercel account connected to your GitHub repository
2. Neon PostgreSQL database (or compatible Postgres provider)
3. API credentials for:
   - Amadeus (flight data)
   - Duffel (alternative flight data)
   - LiteAPI (hotel data)
   - Email service (Mailgun, Gmail, or MailerSend)
4. Upstash Redis account (free tier available)

---

## Environment Variables

### Required for Phase 7

Add these environment variables in your Vercel project settings (Settings → Environment Variables):

#### 1. Database (CRITICAL)
```bash
POSTGRES_URL="postgresql://user:password@host:port/database?sslmode=require"
```
Get from: Neon, Supabase, or any PostgreSQL provider

#### 2. NextAuth Authentication (Phase 7)
```bash
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your_32_character_random_secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

#### 3. Web Push Notifications (Phase 7)

**VAPID Keys Generated:**
```bash
# Public key (exposed to client)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BDUCzOltdJKm6_Pa-jAlMV08nlReCU_NTkZAbsMnvdG45PSwjHaSQGa54kx1KmuB1iymmaKKTunUM2GVH1InY7w"

# Private key (server-side only)
VAPID_PRIVATE_KEY="ES3g8EkvZXu0dv2EsmDyi86jeeA1R-kV3Y0k03bzheI"

# Contact email for push service
VAPID_SUBJECT="mailto:admin@fly2any.com"
```

**IMPORTANT**:
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Keep `VAPID_PRIVATE_KEY` secure - never commit to Git
- Change the subject email to your actual admin email

#### 4. Flight APIs
```bash
# Amadeus (Primary flight source)
AMADEUS_API_KEY="your_amadeus_key"
AMADEUS_API_SECRET="your_amadeus_secret"
AMADEUS_ENVIRONMENT="test"

# Duffel (Backup flight source)
DUFFEL_API_TOKEN="your_duffel_token"
```
Get credentials:
- Amadeus: https://developers.amadeus.com/
- Duffel: https://duffel.com/

#### 5. Hotel API
```bash
# LiteAPI (Hotel inventory)
LITEAPI_SANDBOX_PUBLIC_KEY="your_public_key"
LITEAPI_SANDBOX_PRIVATE_KEY="your_private_key"
```
Get credentials: https://www.liteapi.travel/

#### 6. Email Service (Choose one)

**Option A: Mailgun** (Recommended for production)
```bash
MAILGUN_API_KEY="your_mailgun_api_key"
```
Get from: https://www.mailgun.com/

**Option B: Gmail** (Good for development)
```bash
GMAIL_EMAIL="your_email@gmail.com"
GMAIL_APP_PASSWORD="your_16_char_app_password"
```
Setup: https://support.google.com/accounts/answer/185833

**Option C: MailerSend**
```bash
MAILERSEND_API_KEY="your_mailersend_key"
```
Get from: https://www.mailersend.com/

#### 7. Redis Cache (Required for Phase 7)
```bash
# Upstash Redis (10,000 requests/day free)
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token"
```
Get from: https://upstash.com/

#### 8. Application Settings
```bash
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_APP_NAME="Fly2Any Travel"
```

#### 9. Cron Secret (For ML pre-fetch)
```bash
# Generate with: openssl rand -base64 32
CRON_SECRET="your_secure_random_secret"
```

#### 10. Optional: N8N Automation
```bash
N8N_API_TOKEN="your_n8n_jwt_token"
N8N_BASE_URL="https://your-n8n-instance.com"
```

---

## Database Setup

### Step 1: Create Neon Database

1. Go to https://neon.tech
2. Create a new project: `fly2any-production`
3. Copy the connection string
4. Add to Vercel as `POSTGRES_URL`

### Step 2: Run Migrations

**Option A: From Local (Recommended)**
```bash
# Set environment variable
export POSTGRES_URL="your_neon_connection_string"

# Run migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

**Option B: From Vercel (after deployment)**
```bash
# Add build command in vercel.json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

### Migration Includes:
- User authentication tables
- Booking management tables
- Notification system (Phase 7)
- Push subscriptions (Phase 7)
- Wishlist system (Phase 7)
- User preferences (Phase 7)

---

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: Phase 7 deployment"
git push origin main
```

### 2. Connect Vercel to GitHub
1. Go to https://vercel.com
2. Import your repository: `visa2any/fly2any`
3. Configure project:
   - Framework: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`

### 3. Add Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all variables from [Environment Variables](#environment-variables)
3. Set scope:
   - Production: Production only
   - Preview: All branches
   - Development: Local development

### 4. Deploy
Vercel will automatically deploy when you push to `main`

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Post-Deployment

### 1. Verify Deployment

Check these critical endpoints:

**Health Checks:**
- `https://your-domain.vercel.app/` - Home page
- `https://your-domain.vercel.app/api/health` - API health check
- `https://your-domain.vercel.app/api/preferences` - Database connection

**Phase 7 Features:**
- `https://your-domain.vercel.app/account/notifications` - Notification center
- `https://your-domain.vercel.app/account/wishlist` - Wishlist
- `https://your-domain.vercel.app/deals` - Deals page
- `https://your-domain.vercel.app/explore` - Destination explorer
- `https://your-domain.vercel.app/faq` - FAQ center

**PWA Features:**
- `https://your-domain.vercel.app/manifest.json` - PWA manifest
- `https://your-domain.vercel.app/service-worker.js` - Service worker
- `https://your-domain.vercel.app/account/pwa-settings` - PWA settings

### 2. Test Push Notifications

1. Navigate to `/account/pwa-settings`
2. Click "Enable Notifications"
3. Grant browser permission
4. Click "Send Test Notification"
5. Verify notification received

### 3. Verify Database Migration

```bash
# Check applied migrations
npx prisma migrate status

# Should show:
# ✓ 20251110190400_add_phase7_features
```

### 4. Monitor Logs

```bash
# Using Vercel CLI
vercel logs --follow

# Or check Vercel Dashboard → Deployments → [Your Deployment] → Logs
```

### 5. Performance Checks

Verify these metrics in Vercel Analytics:
- Lighthouse Score: >90
- Time to First Byte (TTFB): <200ms
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s

---

## Troubleshooting

### Issue: Build Fails with TypeScript Errors

**Solution:**
```bash
# Run type check locally
npx tsc --noEmit

# Fix errors, then commit
git add .
git commit -m "fix: TypeScript errors"
git push
```

### Issue: Database Connection Failed

**Symptoms:**
- 500 errors on pages using database
- "Unable to connect to database" in logs

**Solution:**
1. Verify `POSTGRES_URL` is correct in Vercel environment variables
2. Check database is accessible from Vercel IPs
3. Ensure SSL mode is enabled: `?sslmode=require`
4. Test connection:
```bash
npx prisma db pull
```

### Issue: Push Notifications Not Working

**Symptoms:**
- "Enable Notifications" button does nothing
- Console errors about VAPID keys

**Solution:**
1. Verify all three VAPID variables are set in Vercel
2. Check `NEXT_PUBLIC_VAPID_PUBLIC_KEY` starts with "B"
3. Ensure HTTPS is enabled (required for push notifications)
4. Check browser console for errors
5. Test in Chrome/Edge (best support)

### Issue: Service Worker Not Registering

**Symptoms:**
- PWA install prompt doesn't appear
- Offline functionality not working

**Solution:**
1. Ensure HTTPS is enabled
2. Check `/service-worker.js` is accessible
3. Verify `/manifest.json` is valid
4. Clear browser cache and hard reload
5. Check Application tab in DevTools

### Issue: Email Notifications Not Sending

**Symptoms:**
- Users not receiving booking confirmations
- No email logs in dashboard

**Solution:**
1. Verify email service credentials in Vercel
2. Check email service quota limits
3. Test email endpoint:
```bash
curl -X POST https://your-domain.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test"}'
```
4. Check Vercel logs for email errors

### Issue: Redis Cache Errors

**Symptoms:**
- Slow performance
- Errors mentioning "Redis connection"

**Solution:**
1. Verify Upstash credentials are correct
2. Check Upstash dashboard for quota limits
3. Ensure `UPSTASH_REDIS_REST_URL` includes `https://`
4. Test connection in Upstash console

### Issue: Static Assets Not Loading

**Symptoms:**
- Images/icons not displaying
- 404 errors for static files

**Solution:**
1. Verify files are in `/public` directory
2. Check paths use absolute URLs: `/images/logo.png`
3. Clear Vercel cache:
```bash
vercel --prod --force
```

---

## Environment Variable Checklist

Copy this checklist when setting up a new environment:

### Critical (Must Have)
- [ ] `POSTGRES_URL` - Database connection
- [ ] `NEXTAUTH_SECRET` - Authentication secret
- [ ] `NEXTAUTH_URL` - Your domain URL
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Push notifications public key
- [ ] `VAPID_PRIVATE_KEY` - Push notifications private key
- [ ] `UPSTASH_REDIS_REST_URL` - Redis cache URL
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis auth token

### APIs (At Least One Flight + One Email)
- [ ] `AMADEUS_API_KEY` or `DUFFEL_API_TOKEN`
- [ ] `LITEAPI_SANDBOX_PUBLIC_KEY`
- [ ] `MAILGUN_API_KEY` or `GMAIL_EMAIL` + `GMAIL_APP_PASSWORD`

### Optional (Enhanced Features)
- [ ] `VAPID_SUBJECT` - Push notification contact email
- [ ] `CRON_SECRET` - ML pre-fetch security
- [ ] `N8N_API_TOKEN` - Workflow automation
- [ ] `NEXT_PUBLIC_APP_NAME` - Branding

---

## Production Checklist

Before going live:

### Security
- [ ] All secrets are in Vercel environment variables (not in code)
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] Database has SSL enabled
- [ ] CORS is configured for your domain only
- [ ] Rate limiting is enabled on API routes

### Performance
- [ ] Redis cache is configured
- [ ] Images are optimized (using Next.js Image)
- [ ] Static assets are in `/public`
- [ ] Database indexes are applied
- [ ] Lighthouse score >90

### Functionality
- [ ] All Phase 7 features tested
- [ ] Push notifications work
- [ ] PWA installation works
- [ ] Email confirmations send
- [ ] Search returns results
- [ ] Booking flow completes
- [ ] User authentication works

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry optional)
- [ ] Database backup schedule set
- [ ] Uptime monitoring configured

---

## Quick Reference

### Generate Secrets
```bash
# NEXTAUTH_SECRET or CRON_SECRET
openssl rand -base64 32

# VAPID Keys
npx web-push generate-vapid-keys --json
```

### Check Deployment Status
```bash
# Using Vercel CLI
vercel ls

# Get deployment URL
vercel inspect [deployment-id]
```

### View Logs
```bash
# Follow live logs
vercel logs --follow

# Filter by function
vercel logs --follow /api/preferences
```

### Rollback Deployment
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

---

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Web Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

---

**Last Updated:** 2025-11-10 (Phase 7 Deployment)
**Deployment Status:** ✅ Ready for Production
**Database Migration:** `20251110190400_add_phase7_features`
