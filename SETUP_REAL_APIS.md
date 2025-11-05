# 🚀 Want to Test Real APIs?

**Current Status:** All APIs are using demo/fallback data

**What You're Missing:**
- ✈️ Real flight search (Amadeus API)
- 🏨 Real hotel inventory (Duffel API)
- 🚗 Real car rental pricing (Amadeus API)
- 🗄️ Persistent database (PostgreSQL)

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Get Free API Credentials

**Amadeus (Flights & Cars):**
1. Visit: https://developers.amadeus.com/register
2. Create app → Copy API Key & Secret
3. Add to `.env.local`

**Duffel (Flights & Hotels):**
1. Visit: https://duffel.com/signup
2. Settings → API Access → Copy test token
3. Add to `.env.local`

### Step 2: Update .env.local

Replace placeholders with your real credentials:

```env
# Amadeus API (Get from: https://developers.amadeus.com/)
AMADEUS_API_KEY=your_real_key_here
AMADEUS_API_SECRET=your_real_secret_here
AMADEUS_ENVIRONMENT=test

# Duffel API (Get from: https://duffel.com/)
DUFFEL_ACCESS_TOKEN=duffel_test_your_token_here

# Database (Optional - Get from: https://neon.tech/)
DATABASE_URL=postgresql://your_connection_here
POSTGRES_URL=postgresql://your_connection_here
```

### Step 3: Restart Server

```bash
npm run dev
```

### Step 4: Test It!

Search for flights - you should see REAL results! ✈️

---

## 📖 Detailed Guide

For step-by-step instructions with screenshots:

👉 **See: `docs/API_CREDENTIALS_SETUP.md`**

---

## 💰 Cost

**Everything is FREE for testing:**
- ✅ Amadeus: 2,000 calls/month free
- ✅ Duffel: Unlimited test calls free
- ✅ Neon DB: 10GB storage free

---

## 🆘 Still Using Demo Data?

If you see warnings like:
```
⚠️  Amadeus API not initialized
⚠️  Duffel API not initialized
⚠️  Database not configured
```

**Your credentials aren't configured yet!**

Follow the guide: `docs/API_CREDENTIALS_SETUP.md`

---

## ✅ How to Verify It's Working

**Before (Demo Mode):**
```bash
⚠️  Amadeus API not initialized - using demo fallback
⚠️  Duffel API not initialized - using demo fallback
```

**After (Test Mode):**
```bash
✅ Amadeus API initialized (test environment)
✅ Duffel API initialized (test environment)
✅ Found 47 real flight offers
```

---

**Questions?** Read the full guide: `docs/API_CREDENTIALS_SETUP.md`
