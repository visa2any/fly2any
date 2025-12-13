# 🚨 Notification & Alert System Setup Guide

## Overview

This guide will help you set up **automatic error alerts** so you're immediately notified whenever a customer encounters an error during booking, payment, or any other critical operation.

## Alert Channels

Your Fly2Any platform supports **3 alert channels**:

1. **📱 Telegram** - Instant mobile notifications (FASTEST - FREE)
2. **📧 Email** - Detailed error reports to your inbox (FREE with Mailgun)
3. **🐛 Sentry** - Error tracking with stack traces (ALREADY CONFIGURED)

---

## ⚡ Quick Setup (5 minutes)

### 1. Telegram Bot Setup (RECOMMENDED - Instant Alerts)

**Why Telegram?** Get instant notifications on your phone/desktop within 1-2 seconds of any customer error.

#### Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow instructions to name your bot (e.g., "Fly2Any Alerts")
4. Copy the **bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Step 2: Get Your Chat ID

1. Search for `@userinfobot` on Telegram
2. Start a chat - it will send you your **Chat ID** (e.g., `123456789`)
3. If you want multiple admins to receive alerts:
   - Each admin should message the bot from Step 1 first
   - Get each admin's Chat ID from @userinfobot
   - Combine them with commas: `123456789,987654321,555555555`

#### Step 3: Update .env.local

```bash
# Telegram Bot (FREE - for instant admin alerts)
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_ADMIN_CHAT_IDS="123456789,987654321"  # Your chat IDs (comma-separated)
```

#### Step 4: Test

```bash
# Restart your dev server
npm run dev

# Trigger a test error (intentionally break something)
# You should get an instant Telegram notification!
```

---

### 2. Email Alerts Setup (Mailgun)

**Why Email?** Get detailed error reports with full context in your inbox.

#### Step 1: Sign up for Mailgun

1. Go to [https://signup.mailgun.com/new/signup](https://signup.mailgun.com/new/signup)
2. Choose **Free plan** (5,000 emails/month - perfect for alerts)
3. Verify your email address

#### Step 2: Get Your API Key

1. Go to **Settings** → **API Keys**
2. Copy your **Private API key**

#### Step 3: Add Your Domain (or use Mailgun sandbox)

**Option A: Use Mailgun Sandbox (Quick - Testing Only)**
- Domain: `sandbox[random].mailgun.org`
- Add your email to **Authorized Recipients** (Settings → Domains → Your sandbox domain)

**Option B: Use Your Own Domain (Production)**
- Go to **Sending** → **Domains** → **Add New Domain**
- Add `mail.fly2any.com` (or your preferred subdomain)
- Follow DNS setup instructions (add MX, TXT, CNAME records)
- Wait for verification (usually 5-15 minutes)

#### Step 4: Update .env.local

```bash
# Mailgun Email Service
MAILGUN_API_KEY="key-YOUR_MAILGUN_API_KEY_HERE"
MAILGUN_DOMAIN="mail.fly2any.com"  # or your sandbox domain
EMAIL_FROM="Fly2Any <noreply@mail.fly2any.com>"
EMAIL_REPLY_TO="support@fly2any.com"
ADMIN_EMAIL="your-email@gmail.com"  # Where to send admin alerts
```

#### Step 5: Test

```bash
# Restart your dev server
npm run dev

# The system will automatically send you an email alert when errors occur
```

---

### 3. Sentry Error Tracking (ALREADY CONFIGURED ✅)

Your Sentry integration is already set up! Errors are automatically tracked with full stack traces.

To view errors:
1. Go to [https://sentry.io/](https://sentry.io/)
2. Login with your account
3. Navigate to your Fly2Any project
4. View real-time errors with full context

---

## 🎯 What Gets Alerted?

The system automatically sends alerts for:

### Critical Errors (🔴 Priority: CRITICAL)
- ❌ Booking creation failures
- 💳 Payment processing errors
- ⚙️ Configuration errors (like missing API keys)
- 🔒 Authentication failures

### High Priority Errors (🟠 Priority: HIGH)
- ✈️ Flight offer errors (sold out, price changes)
- 📧 Email delivery failures
- 🗄️ Database connection issues

### Normal Errors (🟡 Priority: NORMAL)
- 🔍 Search errors (API timeouts)
- 📝 Validation errors
- 🌐 External API errors

---

## 📨 Alert Format Examples

### Telegram Alert Example
```
🔴 CUSTOMER ERROR - CRITICAL

❌ Error: Failed to create booking. Please try again.
📋 Code: BOOKING_FAILED

📧 User: john.doe@example.com
🔗 Endpoint: /api/flights/booking/create
📋 Booking: REF-ABC123
💰 Amount: USD 450.99

🔗 View Booking

⏰ 12/13/2025, 3:45:23 PM
```

### Email Alert Example
```
Subject: [HIGH] CUSTOMER_ERROR

Admin Alert: customer_error

Alert Details:
type: customer_error
priority: high
errorMessage: Failed to create booking. Please try again.
errorCode: BOOKING_FAILED
userEmail: john.doe@example.com
endpoint: /api/flights/booking/create
amount: 450.99
currency: USD
timestamp: 2025-12-13T15:45:23.123Z

⚠️ This alert requires immediate attention.
```

---

## 🧪 Testing Your Setup

### Manual Test

Create a test file: `test-alerts.ts`

```typescript
import { alertCustomerError } from '@/lib/monitoring/customer-error-alerts';

await alertCustomerError({
  errorMessage: 'TEST: Alert system is working!',
  errorCode: 'TEST_ALERT',
  userEmail: 'test@example.com',
  endpoint: '/test',
  amount: 100,
  currency: 'USD',
}, {
  priority: 'high',
});
```

Run:
```bash
npx ts-node test-alerts.ts
```

**Expected Results:**
- ✅ Telegram notification received
- ✅ Email sent to ADMIN_EMAIL
- ✅ Error logged in Sentry dashboard

---

## 🚀 Production Deployment

Before deploying to production (Vercel):

### 1. Add Environment Variables to Vercel

```bash
# Go to your Vercel dashboard
# Settings → Environment Variables → Add

TELEGRAM_BOT_TOKEN="..."
TELEGRAM_ADMIN_CHAT_IDS="..."
MAILGUN_API_KEY="..."
MAILGUN_DOMAIN="mail.fly2any.com"
EMAIL_FROM="Fly2Any <noreply@mail.fly2any.com>"
EMAIL_REPLY_TO="support@fly2any.com"
ADMIN_EMAIL="your-email@gmail.com"
DUFFEL_ENABLE_ORDERS=true  # ← Already added but verify!
```

### 2. Verify DNS Records (for Mailgun)

If using your own domain for emails, ensure DNS records are set:

```
Type    Name              Value
MX      mail.fly2any.com  mxa.mailgun.org (Priority: 10)
MX      mail.fly2any.com  mxb.mailgun.org (Priority: 10)
TXT     mail.fly2any.com  v=spf1 include:mailgun.org ~all
CNAME   email.mail...     mailgun.org
```

### 3. Test in Production

After deployment:
1. Visit your production site
2. Intentionally trigger a test error
3. Verify you receive alerts

---

## 🛠️ Troubleshooting

### Telegram Not Working

**Symptom:** Not receiving Telegram alerts

**Solutions:**
1. ✅ Verify `TELEGRAM_BOT_TOKEN` is correct
2. ✅ Ensure you started a chat with your bot first
3. ✅ Check `TELEGRAM_ADMIN_CHAT_IDS` format (no spaces, comma-separated)
4. ✅ Look for errors in server logs: `⚠️ Telegram bot token not configured`

### Email Not Working

**Symptom:** Not receiving email alerts

**Solutions:**
1. ✅ Verify `MAILGUN_API_KEY` starts with `key-`
2. ✅ Check `MAILGUN_DOMAIN` matches your Mailgun domain
3. ✅ If using sandbox, ensure your email is in **Authorized Recipients**
4. ✅ Verify DNS records if using custom domain (wait 15-30 min for propagation)
5. ✅ Check Mailgun logs: Dashboard → Logs

### Sentry Not Working

**Symptom:** Errors not appearing in Sentry

**Solutions:**
1. ✅ Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. ✅ Check Sentry dashboard for rate limiting
3. ✅ Errors might be filtered - check **Filters** settings

---

## 📊 Monitoring Dashboard

### View Alert Statistics

Check how many alerts have been sent:

```bash
# In your admin panel (future feature)
/admin/alerts

# Or check server logs
grep "Telegram alert sent" logs/combined.log | wc -l
grep "Email alert sent" logs/combined.log | wc -l
```

---

## 🎓 Best Practices

1. **Multiple Admin Chat IDs** - Add backup contacts in case primary is unavailable
2. **Test Regularly** - Send test alerts weekly to ensure system is working
3. **Monitor Sentry** - Check Sentry dashboard weekly for error trends
4. **Respond Quickly** - Aim to respond to critical alerts within 15 minutes
5. **Document Issues** - Keep a log of common errors and solutions

---

## ✅ Setup Checklist

- [ ] Telegram bot created
- [ ] Telegram chat IDs added to `.env.local`
- [ ] Mailgun account created
- [ ] Mailgun API key added to `.env.local`
- [ ] Domain configured (or sandbox authorized)
- [ ] Admin email set in `.env.local`
- [ ] Test alerts sent successfully
- [ ] Environment variables added to Vercel
- [ ] Production deployment tested
- [ ] Team members notified about alert system

---

## 🆘 Need Help?

1. **Check logs** - Most issues show clear error messages
2. **Test each service individually** - Isolate Telegram vs Email vs Sentry
3. **Verify environment variables** - Double-check for typos
4. **Contact support** - support@fly2any.com

---

## 🎉 You're All Set!

Your alert system is now configured. You'll be notified instantly whenever customers encounter errors, allowing you to:

- **React quickly** to critical issues
- **Prevent revenue loss** from booking failures
- **Improve customer experience** by fixing issues before they escalate
- **Track error trends** with Sentry analytics

**Next Steps:**
1. Restart your development server
2. Test the booking flow
3. Verify you receive alerts for any errors
4. Deploy to production with confidence! 🚀
