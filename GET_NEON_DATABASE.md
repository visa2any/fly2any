# 🗄️ Getting Neon Database Credentials from Vercel

## Quick Method (Using Vercel CLI)

```bash
# 1. Login to Vercel
vercel login

# 2. Link to your project
vercel link

# 3. Pull environment variables
vercel env pull .env.local

# 4. Check if POSTGRES_URL is there
grep POSTGRES_URL .env.local
```

## Manual Method (From Vercel Dashboard)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your **fly2any** project

### Step 2: Navigate to Storage
1. Click on **Storage** tab (or **Settings**)
2. You should see your Neon PostgreSQL database listed

### Step 3: Get Connection String
1. Click on your Neon database
2. Look for **Connection String** or **POSTGRES_URL**
3. Copy the full connection string (looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 4: Create .env.local
```bash
# Create .env.local file in project root
echo 'POSTGRES_URL="postgresql://username:password@host/database?sslmode=require"' > .env.local
echo 'DATABASE_URL="postgresql://username:password@host/database?sslmode=require"' >> .env.local
```

### Step 5: Run Deployment
```bash
# Run the master deployment script
bash scripts/deploy-admin-security.sh
```

---

## Alternative: Using Vercel Token

If you have a Vercel token, I can pull the credentials automatically:

```bash
# Set your token
export VERCEL_TOKEN="your_vercel_token_here"

# Pull environment variables
vercel env pull .env.local --token=$VERCEL_TOKEN --yes
```

Get a token from: https://vercel.com/account/tokens

---

## What the Deployment Script Does

Once you have the POSTGRES_URL set, the script will:

1. ✅ Test database connection
2. ✅ Run migration (add role field to users table)
3. ✅ Regenerate Prisma client
4. ✅ Create admin user: support@fly2any.com
5. ✅ Verify admin user creation
6. ✅ Build the application
7. ✅ Show deployment summary

---

## 🚨 Quick Command (Once POSTGRES_URL is in .env.local)

```bash
bash scripts/deploy-admin-security.sh
```

That's it! 🚀
