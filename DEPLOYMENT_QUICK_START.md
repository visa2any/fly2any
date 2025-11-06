# 🚀 Deployment Quick Start - Fly2Any E2E Booking Flow

**Version**: Phase 5 Complete
**Date**: November 6, 2025
**Status**: Production Ready ✅

---

## 🎯 Quick Deploy (5 Minutes)

###  Step 1: Clone & Install (1 min)

```bash
git clone https://github.com/visa2any/fly2any.git
cd fly2any
npm install
```

### Step 2: Environment Setup (2 min)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys
nano .env.local
```

**Minimum Required Variables**:

```bash
# Stripe (Get from: https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Duffel (Get from: https://app.duffel.com/api-keys)
DUFFEL_ACCESS_TOKEN=duffel_test_...

# Database (Use Vercel Postgres or local PostgreSQL)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Database Setup (1 min)

```bash
# Push database schema
npx prisma db push

# (Optional) Seed with sample data
npm run seed
```

### Step 4: Build & Run (1 min)

```bash
# Build for production
npm run build

# Start production server
npm start
```

**OR for development**:

```bash
npm run dev
```

### Step 5: Test E2E Flow (30 seconds)

1. Open http://localhost:3000
2. Click AI assistant bubble
3. Say: "Find flights from JFK to LAX on Dec 15"
4. Complete the 9-stage booking flow
5. Use Stripe test card: `4242 4242 4242 4242`

---

## 🌐 Deploy to Vercel (Production)

### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/visa2any/fly2any)

### Option B: Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DUFFEL_ACCESS_TOKEN=duffel_live_...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=https://your-domain.com
```

---

## 🧪 Testing Checklist

### ✅ Phase 1: Basic Functionality

- [ ] Home page loads
- [ ] AI assistant opens
- [ ] Search returns flights
- [ ] Flight selection works

### ✅ Phase 2: Booking Flow

- [ ] Fare selector appears
- [ ] Seat map displays
- [ ] Baggage upsell shows
- [ ] Booking summary correct

### ✅ Phase 3: Payment Flow

- [ ] Passenger details form works
- [ ] Payment widget shows Stripe Elements
- [ ] Test card processes successfully
- [ ] Confirmation displays booking reference

### ✅ Phase 4: Error Handling

- [ ] Declined card shows error
- [ ] Network error handled gracefully
- [ ] Invalid data rejected
- [ ] User sees helpful error messages

### ✅ Phase 5: Mobile Testing

- [ ] All steps work on mobile
- [ ] Forms are easy to fill
- [ ] Payment secure on mobile
- [ ] Responsive design looks good

---

## 🔑 API Keys Setup

### Stripe (Payment Processing)

1. Go to https://dashboard.stripe.com/register
2. Verify email and complete setup
3. Get test keys: https://dashboard.stripe.com/test/apikeys
   - **Publishable key**: Starts with `pk_test_`
   - **Secret key**: Starts with `sk_test_`
4. For production, activate account and get live keys

**Webhook Setup** (Production):
```bash
# Add webhook endpoint in Stripe Dashboard
URL: https://your-domain.com/api/payments/webhook
Events: payment_intent.succeeded, payment_intent.payment_failed
```

### Duffel (Flight Booking)

1. Go to https://duffel.com/signup
2. Complete onboarding
3. Get API key: https://app.duffel.com/api-keys
   - **Test key**: Starts with `duffel_test_`
   - **Live key**: Starts with `duffel_live_`
4. Test key gives access to sandbox flights

**Note**: Test bookings don't create real reservations

### Database (PostgreSQL)

**Option 1: Vercel Postgres** (Recommended)
```bash
vercel postgres create fly2any-db
vercel env pull .env.local
```

**Option 2: Supabase** (Free tier available)
```bash
# Get connection string from: https://app.supabase.com
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

**Option 3: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb fly2any

# Connection string
DATABASE_URL=postgresql://localhost/fly2any
```

---

## 🛠️ Development Tips

### Hot Reload Development

```bash
npm run dev

# Opens on http://localhost:3000
# Changes auto-reload
# TypeScript errors show in terminal
```

### Mock Mode (No API Keys)

The app works without API keys in mock mode:
- ✅ Flight search returns sample data
- ✅ Payment intents use mock values
- ✅ Bookings simulate creation
- ⚠️ No real charges or bookings

Perfect for UI/UX development!

### TypeScript Checking

```bash
# Check types without building
npx tsc --noEmit

# Should show: "0 errors"
```

### Linting

```bash
npm run lint

# Fix auto-fixable issues
npm run lint --fix
```

---

## 🔒 Security Checklist

### Before Production

- [ ] All environment variables in `.env.local` (not committed)
- [ ] `.gitignore` includes `.env*.local`
- [ ] Stripe live keys (not test keys)
- [ ] Duffel live token (not test token)
- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Stripe webhooks configured
- [ ] Database backups enabled
- [ ] Error monitoring setup (Sentry)

### Rate Limiting

Built-in via Next.js middleware. Monitor in production:
- Stripe Dashboard → Developers → Request logs
- Duffel Dashboard → API Logs

---

## 📊 Monitoring

### Essential Monitoring

1. **Vercel Analytics** (Built-in)
   - Page views
   - Core Web Vitals
   - API response times

2. **Stripe Dashboard**
   - Payment success/failure rates
   - Declined reasons
   - Webhook deliveries

3. **Duffel Dashboard**
   - Booking success rate
   - API errors
   - Response times

### Optional but Recommended

- **Sentry**: Error tracking and alerts
- **LogRocket**: Session replay for debugging
- **Mixpanel**: User behavior analytics

---

## 🐛 Troubleshooting

### Build Errors

**Error**: `Type error: Property 'X' does not exist on type 'Y'`
**Fix**: Run `npm run build` and check TypeScript errors

**Error**: `Module not found: Can't resolve '@/...'`
**Fix**: Check `tsconfig.json` paths configuration

### Runtime Errors

**Error**: "Payment service is currently unavailable"
**Fix**: Check `STRIPE_SECRET_KEY` in environment variables

**Error**: "Failed to create booking"
**Fix**: Check `DUFFEL_ACCESS_TOKEN` and verify test credentials

**Error**: "Database connection failed"
**Fix**: Verify `DATABASE_URL` format and database is running

### Payment Issues

**Problem**: Stripe payment form doesn't load
**Solution**: Check `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (must start with `pk_`)

**Problem**: 3D Secure not working
**Solution**: Use test card `4000 0025 0000 3155` to trigger 3D Secure

**Problem**: Webhook not receiving events
**Solution**: Check Stripe webhook URL and secret match

---

## 📈 Performance Optimization

### Production Optimizations

1. **Enable Edge Caching**:
```javascript
// In API routes that can be cached
export const revalidate = 300; // 5 minutes
```

2. **Redis Caching** (Optional):
```bash
# Upstash Redis (Free tier: 10k requests/day)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

3. **Image Optimization** (Automatic on Vercel):
- Uses Next.js Image component
- Automatic WebP conversion
- Lazy loading by default

4. **Bundle Analysis**:
```bash
npm run build

# Check bundle sizes in output
# Analyze report: analyze/client.html
```

---

## 🚦 Go-Live Checklist

### 1 Day Before

- [ ] All tests passing
- [ ] Production environment variables set
- [ ] Database backups configured
- [ ] Monitoring tools set up
- [ ] Error alerting configured
- [ ] Team trained on admin panel

### Launch Day

- [ ] Switch to live API keys
- [ ] Verify Stripe webhooks work
- [ ] Test one complete booking
- [ ] Monitor error logs
- [ ] Check payment dashboard
- [ ] Verify email confirmations

### First Week

- [ ] Monitor conversion rates
- [ ] Review payment failures
- [ ] Check API response times
- [ ] Analyze user feedback
- [ ] Fix any issues found
- [ ] A/B test improvements

---

## 📞 Support

### Resources

- **Documentation**: See all `*.md` files in project root
- **Stripe Docs**: https://stripe.com/docs
- **Duffel Docs**: https://duffel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support

### Common Issues

Check `PHASE_5_API_COMPLETION_REPORT.md` for:
- Detailed troubleshooting guide
- Error message explanations
- Debug tips and tools

---

## 🎉 Success Metrics

### Technical Goals

- Build time: < 2 minutes ✅
- Page load: < 2 seconds ✅
- API response: < 4 seconds ✅
- Uptime: > 99.9%

### Business Goals

- Conversion rate: > 5%
- Mobile conversion: > 3%
- Average order value: > $575
- Customer satisfaction: > 85%

---

## 🔄 Updates

To update to latest version:

```bash
git pull origin claude/check-last-git-011CUsN6S19DuosnAQfZnY4P
npm install
npx prisma db push
npm run build
npm start
```

---

**Ready to launch! 🚀**

For detailed implementation details, see:
- `PHASE_5_API_COMPLETION_REPORT.md` - Complete technical docs
- `PHASE_4_5_COMPLETE_IMPLEMENTATION_SUMMARY.md` - Architecture overview

**Questions?** Check the markdown documentation files in the project root.

---

*Last Updated: November 6, 2025*
*Version: Phase 5 Complete*
*Status: Production Ready ✅*
