# API Credentials Setup Guide
**For Testing Real Flight, Hotel, and Car Rental Data**

## Why You Need This

**Demo Mode (Current):** Shows beautiful UI with fake data
**Test Mode (What You Want):** Real API responses with test credentials - ACTUALLY TESTABLE!

---

## 🎫 Amadeus API (Flights & Car Rentals)

### Step 1: Create Free Test Account
1. Go to: https://developers.amadeus.com/register
2. Click **"Sign Up"** (It's FREE for testing!)
3. Fill out the form:
   - Name
   - Email
   - Company (can put "Personal" or your name)
   - Accept terms
4. Verify your email

### Step 2: Create Self-Service App
1. Login to: https://developers.amadeus.com/my-apps
2. Click **"Create New App"**
3. Fill in:
   - **App Name:** `Fly2Any Test` (or anything)
   - **App Type:** Select "Self-Service"
4. Click **"Create"**

### Step 3: Get Your Credentials
You'll see a screen with:
```
API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxx
API Secret: yyyyyyyyyyyyyyyyyyyyyyyy
```

**COPY THESE IMMEDIATELY!** The secret is only shown once.

### Step 4: Add to .env.local
```env
# Replace these placeholders with your REAL credentials
AMADEUS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxx
AMADEUS_API_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
AMADEUS_ENVIRONMENT=test
```

### What You Can Test:
- ✈️ **Flight Search:** Real routes, real prices (test data)
- 🚗 **Car Rentals:** Real inventory, real pricing (test data)
- 🏨 **Hotel Search:** Via Amadeus (limited in test mode)

### Test Limits (Free):
- ✅ **2,000 free API calls per month**
- ✅ Real flight data (test environment)
- ✅ Real car rental data (test environment)
- ⚠️ Test data may be limited/stale

---

## 🛏️ Duffel API (Flights & Hotels)

### Step 1: Create Free Account
1. Go to: https://duffel.com/signup
2. Sign up with your email
3. Verify email

### Step 2: Get Test Credentials
1. Login to: https://app.duffel.com/
2. Go to **"Settings"** → **"API Access"**
3. You'll see:
   ```
   Test Mode Access Token: duffel_test_xxxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Add to .env.local
```env
# Duffel Test Token (starts with duffel_test_)
DUFFEL_ACCESS_TOKEN=duffel_test_xxxxxxxxxxxxxxxxxxxxx
```

### What You Can Test:
- ✈️ **Flight Search:** Real-time flight data
- 🏨 **Hotel Search:** Real hotel inventory
- 💳 **Booking Flow:** Test bookings (no real charges)

### Test Limits (Free):
- ✅ **Unlimited test API calls**
- ✅ Real-time flight data
- ✅ Real hotel inventory
- ✅ Full booking flow (test mode)
- ⚠️ No actual tickets issued (test bookings only)

---

## 🗄️ Database (PostgreSQL via Neon)

### Step 1: Create Free Neon Account
1. Go to: https://neon.tech/
2. Click **"Sign Up"** (Free tier available)
3. Sign up with GitHub, Google, or Email

### Step 2: Create Database
1. Click **"Create Project"**
2. Give it a name: `fly2any-dev`
3. Select region closest to you
4. Click **"Create Project"**

### Step 3: Get Connection String
You'll see a connection string like:
```
postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Add to .env.local
```env
# Replace with your REAL Neon connection string
DATABASE_URL=postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

### Step 5: Run Migrations
```bash
# Apply database schema
npx tsx scripts/apply-tripmatch-migration.ts

# Seed demo data (optional)
curl -X POST http://localhost:3000/api/tripmatch/seed
```

### What You Get:
- ✅ **TripMatch:** Full database-backed trips
- ✅ **Analytics:** Search tracking, popular routes
- ✅ **User Profiles:** Real user data storage

---

## 🔴 Redis Cache (Optional - Performance)

### Step 1: Create Free Upstash Account
1. Go to: https://upstash.com/
2. Sign up (Free tier available)

### Step 2: Create Redis Database
1. Click **"Create Database"**
2. Name: `fly2any-cache`
3. Select region
4. Click **"Create"**

### Step 3: Get Credentials
Copy from the dashboard:
```
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxxxxxx
```

### Step 4: Add to .env.local
```env
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxxxxxx
```

### What You Get:
- ✅ **Faster searches:** Cached results
- ✅ **Lower API costs:** Reuse expensive calls
- ✅ **Better performance:** Sub-100ms responses

---

## ✅ Verification Checklist

After adding credentials, restart your dev server and check:

### Amadeus API
```bash
# Should see in terminal:
✅ Amadeus API initialized (test environment)
   API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxx

# NOT:
❌ Amadeus authentication failed
```

### Duffel API
```bash
# Should see:
✅ Duffel API initialized (test environment)

# NOT:
⚠️  DUFFEL_ACCESS_TOKEN not set
```

### Database
```bash
# Should see:
✅ Database connected

# NOT:
⚠️  POSTGRES_URL not configured or using placeholder/localhost
```

---

## 🧪 Testing Your APIs

### Test Flight Search
1. Go to: http://localhost:3000
2. Search: **JFK → LAX**
3. Check terminal logs:

**With Amadeus credentials:**
```
✅ Amadeus search: Found 15 offers
```

**Without credentials (current):**
```
⚠️  Amadeus API not initialized - using demo fallback
```

### Test Hotel Search
1. Search for hotels in any city
2. Check terminal:

**With Duffel credentials:**
```
✅ Duffel: Found 23 hotels in Tokyo
```

**Without credentials:**
```
⚠️  Duffel Stays API not initialized - using demo fallback
```

---

## 💰 Cost Breakdown

| Service | Free Tier | Cost After Free |
|---------|-----------|-----------------|
| **Amadeus** | 2,000 calls/month | $0.002-0.01/call |
| **Duffel** | Unlimited test calls | Production: 1-2% booking fee |
| **Neon DB** | 10GB storage | $0.102/GB/month |
| **Upstash Redis** | 10K commands/day | $0.20/100K commands |

**For Development:** Everything is FREE! 🎉

---

## 🚨 Current Status (Your App)

```env
AMADEUS_API_KEY=your_amadeus_api_key_here          ❌ PLACEHOLDER
AMADEUS_API_SECRET=your_amadeus_api_secret_here    ❌ PLACEHOLDER
DUFFEL_ACCESS_TOKEN=                                ❌ NOT SET
DATABASE_URL=postgresql://placeholder...            ❌ PLACEHOLDER
```

**Result:** All APIs use demo fallback data

**After Setup:**
```env
AMADEUS_API_KEY=AbCd1234...                         ✅ REAL
AMADEUS_API_SECRET=XyZ9876...                       ✅ REAL
DUFFEL_ACCESS_TOKEN=duffel_test_...                 ✅ REAL
DATABASE_URL=postgresql://neon...                   ✅ REAL
```

**Result:** FULLY TESTABLE APIS! 🚀

---

## 🎯 Quick Start (5 Minutes)

1. **Amadeus:** https://developers.amadeus.com/register → Create app → Copy credentials
2. **Duffel:** https://duffel.com/signup → Settings → Copy test token
3. **Update .env.local** with real credentials
4. **Restart dev server:** `npm run dev`
5. **Test search:** See real flight data!

---

## ❓ Troubleshooting

### "401 Unauthorized" from Amadeus
- Check API key doesn't have spaces
- Make sure you copied the ENTIRE key/secret
- Verify `AMADEUS_ENVIRONMENT=test` is set

### "Duffel API not initialized"
- Token must start with `duffel_test_`
- No spaces before/after token
- Check `.env.local` was saved

### "Database not configured"
- Connection string must start with `postgresql://`
- Must not contain "placeholder" or "localhost"
- Run migrations after connecting

---

## 📞 Support

- **Amadeus:** https://developers.amadeus.com/support
- **Duffel:** https://duffel.com/docs
- **Neon:** https://neon.tech/docs

---

**Remember:** All these services have FREE tiers perfect for development and testing! 🎉
