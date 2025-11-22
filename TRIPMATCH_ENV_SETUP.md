# TripMatch Environment Variables Setup Guide

This guide covers all required and optional environment variables for the TripMatch social network features.

## Required Environment Variables

### Database Configuration

```bash
# PostgreSQL Database URL (Required)
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Example for local development:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/fly2any?schema=public"

# Example for production (Neon, Supabase, etc.):
# DATABASE_URL="postgresql://user:pass@ep-cool-name.region.aws.neon.tech/fly2any?sslmode=require"
```

### Authentication (NextAuth)

```bash
# NextAuth Secret (Required)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"

# NextAuth URL (Required)
# Use your production domain or localhost for development
NEXTAUTH_URL="http://localhost:3000"
# Production: NEXTAUTH_URL="https://yourdomain.com"

# Google OAuth (Required for social login)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Optional Environment Variables

### Email Service (for notifications)

```bash
# Resend (Recommended)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# OR SendGrid (Alternative)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
```

### Real-Time Features (Pusher)

```bash
# Pusher Configuration (for real-time chat and notifications)
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="mt1"  # or your region
```

### Image Upload (Cloudinary)

```bash
# Cloudinary Configuration (for avatar and photo uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Analytics (Optional)

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# PostHog (Alternative)
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxxxxxxxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Error Tracking (Optional)

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
SENTRY_AUTH_TOKEN="xxxxxxxxxxxxx"
```

---

## Setup Instructions

### 1. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Create database
createdb fly2any

# Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/fly2any?schema=public"
```

#### Option B: Neon (Recommended for Production)

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update `.env.local` with the connection string

#### Option C: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (use "Connection Pooling" mode)
5. Update `.env.local`

### 2. NextAuth Setup

```bash
# Generate secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

### 4. Email Service Setup (Optional but Recommended)

#### Option A: Resend (Recommended)

1. Go to [resend.com](https://resend.com)
2. Sign up and verify email
3. Create API key
4. Add domain or use onboarding.resend.dev for testing
5. Add to `.env.local`:
   ```bash
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   EMAIL_FROM="onboarding@resend.dev"  # or your verified domain
   ```

#### Option B: SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Create account
3. Settings → API Keys → Create API Key
4. Add to `.env.local`:
   ```bash
   SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

### 5. Real-Time Chat Setup (Optional)

#### Pusher Setup

1. Go to [pusher.com](https://pusher.com)
2. Create new Channels app
3. Note your credentials
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_PUSHER_APP_KEY="your-app-key"
   PUSHER_APP_ID="your-app-id"
   PUSHER_SECRET="your-secret"
   PUSHER_CLUSTER="mt1"
   ```

### 6. Image Upload Setup (Optional)

#### Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Dashboard will show your credentials
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

---

## Example .env.local File

```bash
# ========================
# DATABASE
# ========================
DATABASE_URL="postgresql://postgres:password@localhost:5432/fly2any?schema=public"

# ========================
# AUTHENTICATION
# ========================
NEXTAUTH_SECRET="your-generated-secret-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"

# ========================
# EMAIL (Optional)
# ========================
RESEND_API_KEY="re_123456789"
EMAIL_FROM="noreply@yourdomain.com"

# ========================
# REAL-TIME (Optional)
# ========================
NEXT_PUBLIC_PUSHER_APP_KEY="your-app-key"
PUSHER_APP_ID="123456"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="mt1"

# ========================
# IMAGE UPLOAD (Optional)
# ========================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-secret"

# ========================
# ANALYTICS (Optional)
# ========================
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

---

## Running Database Migrations

After setting up your database connection:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# OR run migrations (production)
npx prisma migrate deploy

# Verify database
npx prisma studio
```

---

## Verification Checklist

- [ ] Database connection works (`npx prisma db push`)
- [ ] NextAuth configured (visit `/api/auth/signin`)
- [ ] Google OAuth works (test sign-in)
- [ ] Email service configured (optional)
- [ ] Real-time chat working (optional)
- [ ] Image uploads working (optional)

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Common fixes:
# 1. Check DATABASE_URL format
# 2. Ensure PostgreSQL is running
# 3. Verify credentials
# 4. Check SSL mode for hosted databases
```

### NextAuth Issues

```bash
# Common fixes:
# 1. Ensure NEXTAUTH_SECRET is set (32+ chars)
# 2. Match NEXTAUTH_URL to your domain
# 3. Check Google OAuth redirect URIs
# 4. Clear cookies and try again
```

### Prisma Issues

```bash
# Reset database (DANGER: Deletes all data)
npx prisma migrate reset

# Fix client generation
rm -rf node_modules/.prisma
npx prisma generate
```

---

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - Already in `.gitignore`
   - Use separate `.env` files for each environment

2. **Use strong secrets**
   ```bash
   # Generate strong secrets
   openssl rand -base64 32
   ```

3. **Rotate credentials regularly**
   - Change NEXTAUTH_SECRET every 90 days
   - Rotate API keys if compromised

4. **Use environment-specific URLs**
   - Development: `http://localhost:3000`
   - Staging: `https://staging.yourdomain.com`
   - Production: `https://yourdomain.com`

5. **Limit OAuth redirect URIs**
   - Only add trusted domains
   - Remove unused redirect URIs

---

## Production Deployment

### Vercel

1. Go to your project settings
2. Environment Variables section
3. Add all required variables
4. Separate variables for Production/Preview/Development
5. Deploy

### Other Platforms (Railway, Render, etc.)

1. Add environment variables in dashboard
2. Ensure `DATABASE_URL` uses SSL
3. Set `NEXTAUTH_URL` to production domain
4. Deploy

---

## Support

For issues or questions:
- Check [NextAuth.js docs](https://next-auth.js.org)
- Check [Prisma docs](https://www.prisma.io/docs)
- Review API logs in development console
- Check Vercel logs in production

---

**Last Updated:** January 2025
**TripMatch Version:** 1.0.0
