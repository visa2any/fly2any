# 🚨 CRITICAL: Vercel Environment Variables Setup

## Problem Detected
Production is using **SANDBOX mode** instead of **PRODUCTION mode** for LiteAPI, causing "unauthorized" errors.

**Diagnostic Results:**
- `isSandbox: true` ❌ (should be `false` in production)
- `hotelsByLocation: FAIL` - "unauthorized"
- `rateSearch: FAIL` - "unauthorized"

## Root Cause
The Vercel deployment is missing the critical `LITEAPI_ENVIRONMENT` environment variable, causing the system to default to sandbox mode with an incorrect API key.

---

## ✅ IMMEDIATE FIX: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/visa2anys-projects/fly2any
2. Click on your project: **fly2any**
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add These CRITICAL Variables

Add the following environment variables for **Production** environment:

#### 1. LiteAPI Environment Mode (MOST CRITICAL)
```
Name: LITEAPI_ENVIRONMENT
Value: production
Environment: Production
```

#### 2. LiteAPI Production Key
```
Name: LITEAPI_PUBLIC_KEY
Value: prod_2055a56a-7549-41b9-ab05-7e33c68ecfcc
Environment: Production
```

### Step 3: Redeploy
After adding environment variables:

1. Click **Deployments** tab
2. Find the latest deployment
3. Click the **⋮** menu (three dots)
4. Click **Redeploy**
5. Wait for deployment to complete (2-3 minutes)

---

## 🧪 Verify the Fix

After redeployment, test:

### Diagnostic Endpoint
https://www.fly2any.com/api/diagnostics/liteapi

**Expected:** `isSandbox: false` and all tests PASS

### Hotel Search
https://www.fly2any.com/api/hotels/search?cityCode=NYC&checkInDate=2025-12-01&checkOutDate=2025-12-02&adults=2

**Expected:** Returns hotel results successfully
