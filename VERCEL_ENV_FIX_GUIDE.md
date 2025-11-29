# 🔧 VERCEL ENVIRONMENT VARIABLES FIX GUIDE

**Status:** URGENT - Production hotel search failing due to malformed environment variables
**Issue:** API Error 500 when searching hotels in production
**Root Cause:** Environment variables in Vercel have extra quotes and `\r\n` characters

---

## 🚨 CRITICAL ISSUE

Your production hotel search is failing because the environment variables in Vercel are malformed:

**Example of WRONG format:**
```
""sand_eea53275-64a5-4601-a13a-1fd74aef6515" \r\n"
```

**Correct format:**
```
sand_eea53275-64a5-4601-a13a-1fd74aef6515
```

---

## ✅ HOW TO FIX (Step-by-Step)

### Step 1: Open Vercel Dashboard
1. Go to: https://vercel.com/visa2anys-projects/fly2any-fresh
2. Click on **Settings** tab
3. Click on **Environment Variables** in left sidebar

### Step 2: Fix LiteAPI Variables (MOST CRITICAL)

Delete and re-add these variables with clean values:

#### **LITEAPI_SANDBOX_PUBLIC_KEY**
- **CURRENT (WRONG):** `""21945f22-d6e3-459a-abd8-a7aaa4d043b0" \r\n"`
- **CORRECT VALUE:** `21945f22-d6e3-459a-abd8-a7aaa4d043b0`
- **Environment:** Production, Preview, Development (all)

#### **LITEAPI_SANDBOX_PRIVATE_KEY**
- **CURRENT (WRONG):** `""sand_eea53275-64a5-4601-a13a-1fd74aef6515" \r\n"`
- **CORRECT VALUE:** `sand_eea53275-64a5-4601-a13a-1fd74aef6515`
- **Environment:** Production, Preview, Development (all)

### Step 3: Fix Other Malformed Variables

These also have the same issue and should be fixed:

#### **AMADEUS_API_KEY**
- **ACTION:** Remove extra quotes and `\r\n` characters
- **FORMAT:** Check your .env.local file for the correct API key value

#### **AMADEUS_API_SECRET**
- **ACTION:** Remove extra quotes and `\r\n` characters
- **FORMAT:** Check your .env.local file for the correct secret value

#### **AMADEUS_ENVIRONMENT**
- **CORRECT VALUE:** `test`

#### **GMAIL_EMAIL**
- **CORRECT VALUE:** `fly2any.travel@gmail.com`

#### **GMAIL_APP_PASSWORD**
- **ACTION:** Remove extra quotes and `\r\n` characters
- **FORMAT:** Should be 4 groups of 4 lowercase letters separated by spaces

#### **MAILGUN_API_KEY**
- **ACTION:** Remove extra quotes and `\r\n` characters
- **FORMAT:** Should be a clean API key string (check your .env.local file for the correct value)

#### **N8N_API_TOKEN**
- **ACTION:** Remove extra quotes and `\r\n` characters
- **FORMAT:** Should be a clean JWT token string (check your .env.local file for the correct value)

#### **N8N_BASE_URL**
- **CORRECT VALUE:** `https://n8n-production-81b6.up.railway.app`

#### **NEXT_PUBLIC_APP_NAME**
- **CORRECT VALUE:** `Fly2Any Travel`

#### **NEXT_PUBLIC_APP_URL**
- **CORRECT VALUE:** `https://www.fly2any.com`

### Step 4: How to Delete and Re-add Variables

For each variable listed above:

1. Find the variable in Vercel dashboard
2. Click the **three dots** menu on the right
3. Click **Delete**
4. Confirm deletion
5. Click **Add New** button
6. Enter variable name (e.g., `LITEAPI_SANDBOX_PUBLIC_KEY`)
7. Enter the CORRECT VALUE (without quotes or special characters)
8. Select environments: **Production**, **Preview**, and **Development**
9. Click **Save**

### Step 5: Trigger Redeploy

After fixing all variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots** menu
4. Click **Redeploy**
5. Select **Use existing build cache** (optional, but faster)
6. Click **Redeploy**

---

## 🧪 TESTING AFTER FIX

Once redeployed, test the hotel search:

1. Visit: https://www.fly2any.com/hotels
2. Search for "New York"
3. Select dates and click "Search"
4. **Expected:** Hotel results appear
5. **If Error:** Check Vercel logs

---

## 📊 MONITORING

### Check Vercel Logs

If you still see errors after fixing:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Functions** tab
4. Click on `/api/hotels/search`
5. View logs for detailed error information

The new enhanced logging will show:
- `📊 Error details:` - Detailed error information
- `🔑 LiteAPI Authentication Error` - If API key is still invalid
- Error codes, HTTP status, and response data

---

## ⚡ QUICK FIX CHECKLIST

- [ ] Open Vercel dashboard
- [ ] Navigate to Environment Variables settings
- [ ] Delete `LITEAPI_SANDBOX_PUBLIC_KEY`
- [ ] Re-add `LITEAPI_SANDBOX_PUBLIC_KEY` with clean value
- [ ] Delete `LITEAPI_SANDBOX_PRIVATE_KEY`
- [ ] Re-add `LITEAPI_SANDBOX_PRIVATE_KEY` with clean value
- [ ] Fix other malformed variables (optional but recommended)
- [ ] Trigger redeploy
- [ ] Test hotel search on production
- [ ] Monitor Vercel logs

---

## 🔍 WHY THIS HAPPENED

The environment variables were likely copied/pasted from a file that had:
1. Extra quotes added by some process
2. Windows line endings (`\r\n`) instead of Unix (`\n`)
3. Possible encoding issues

**Prevention:** Always paste values directly without quotes into Vercel dashboard.

---

## 📱 NEED HELP?

If you still see errors after following this guide:

1. Check the Vercel function logs for the exact error message
2. Look for the `📊 Error details:` log entry
3. Share the error details for further assistance

**Note:** The code changes are already deployed. You only need to fix the environment variables in Vercel dashboard.

---

**Last Updated:** 2025-11-29
**Priority:** CRITICAL - Production Affecting
