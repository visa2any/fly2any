# 🚀 Quick API Setup Guide (5-10 Minutes)

Your APIs are configured in **Vercel for production**, but your **local development** needs the credentials too!

---

## ⚡ FASTEST METHOD: Pull from Vercel

If you're using Vercel deployment:

```bash
# 1. Install Vercel CLI (if not already)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Pull environment variables from your production
vercel env pull .env.local

# 4. Restart your dev server
npm run dev
```

✅ **Done!** Your local environment now matches production.

---

## 🔑 MANUAL SETUP: Get New Test Credentials

If you need new credentials or aren't using Vercel:

### Step 1: Amadeus API (5 minutes) - **REQUIRED for Flights**

**Get FREE test credentials:**

1. **Visit:** https://developers.amadeus.com/register
2. **Create account** (use your email)
3. **Navigate to:** My Self-Service Workspace → API Keys
4. **Copy:**
   - API Key (looks like: `abcd1234efgh5678`)
   - API Secret (looks like: `Xy9ZaBcDeFgHi`)

**Add to `.env.local`:**
```env
AMADEUS_API_KEY=your_actual_api_key_here
AMADEUS_API_SECRET=your_actual_api_secret_here
AMADEUS_ENVIRONMENT=test
```

**Test API limits:**
- ✅ **FREE:** 2,000 calls/month in test mode
- ✅ **No credit card** required for testing
- ✅ **Real flight data** from 500+ airlines

---

### Step 2: Duffel API (5 minutes) - **OPTIONAL (Alternative)**

**Get FREE test credentials:**

1. **Visit:** https://duffel.com/signup
2. **Create account**
3. **Navigate to:** Dashboard → Settings → API Access
4. **Create** a "Test Mode" token
5. **Copy** token (starts with `duffel_test_...`)

**Add to `.env.local`:**
```env
DUFFEL_ACCESS_TOKEN=duffel_test_your_actual_token_here
```

**Test API limits:**
- ✅ **FREE:** Unlimited test bookings
- ✅ **No credit card** required
- ✅ **Test mode** available

---

### Step 3: Database (OPTIONAL - Only for TripMatch)

**If you want TripMatch features locally:**

**Option A: Use Vercel Postgres (Easiest)**
```bash
vercel env pull .env.local
```

**Option B: Local PostgreSQL**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fly2any
POSTGRES_URL=postgresql://postgres:password@localhost:5432/fly2any
```

Then run migrations:
```bash
npx prisma generate
npx prisma db push
```

---

## ✅ Verification

After adding credentials to `.env.local`:

```bash
# Restart dev server
npm run dev
```

**You should see:**
```
============================================================
🚀 Fly2Any - All APIs Configured!
============================================================
✅ Amadeus API (Flights & Cars)
✅ Duffel API (Flights & Hotels)
✅ Database (PostgreSQL)
============================================================
```

**Instead of:**
```
⚠️  Fly2Any - Running in DEMO MODE
```

---

## 🐛 Troubleshooting

### Still seeing DEMO MODE?

1. **Check your `.env.local` file has NO placeholder text:**
   - ❌ BAD: `AMADEUS_API_KEY=your_amadeus_api_key_here`
   - ✅ GOOD: `AMADEUS_API_KEY=abcd1234efgh5678ijkl9012mnop3456`

2. **API keys must be at least 20 characters:**
   - Amadeus keys are typically 32 characters
   - Duffel tokens are 60+ characters

3. **Restart your dev server** after changing `.env.local`:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Check environment variables are loaded:**
   ```bash
   # In your code, add temporarily:
   console.log('Amadeus key length:', process.env.AMADEUS_API_KEY?.length);
   # Should show: 32 or higher (not undefined)
   ```

---

## 🔒 Security Best Practices

✅ **DO:**
- Keep credentials in `.env.local` (ignored by Git)
- Use Vercel Environment Variables for production
- Use "Test" mode credentials for development
- Regenerate keys if accidentally exposed

❌ **DON'T:**
- Commit `.env.local` to Git
- Use production credentials locally
- Share credentials in Slack/email
- Hard-code API keys in source code

---

## 📚 Additional Resources

- **Amadeus Docs:** https://developers.amadeus.com/docs
- **Duffel Docs:** https://duffel.com/docs
- **Vercel Env Vars:** https://vercel.com/docs/environment-variables
- **NextAuth Setup:** https://next-auth.js.org/getting-started/introduction

---

## 🆘 Need Help?

If you're still having issues:

1. Check `.env.local` formatting (no spaces around `=`)
2. Verify API keys are valid (not expired)
3. Check console logs for specific errors
4. Test API keys directly (use Postman or curl)

**Example test:**
```bash
# Test Amadeus API
curl -X POST "https://test.api.amadeus.com/v1/security/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_KEY&client_secret=YOUR_SECRET"
```

If successful, you'll get an access token!

---

**Status:** Ready to configure! 🚀
**Time needed:** 5-10 minutes
**Cost:** $0 (all test credentials are FREE)
