# 🧪 Travel Agent Program - Complete Testing Guide

**Generated:** November 18, 2025
**Purpose:** Step-by-step testing instructions for all implemented features

---

## 🎯 Testing Overview

### What Can Be Tested Now:
✅ Admin portal (100% complete)
✅ Agent registration and approval
✅ Client management (create, view, edit)
✅ Quote creation (5-step wizard)
✅ PDF generation and download
✅ Email delivery with PDF
✅ Client portal (quote viewing, accept/decline)

### What Cannot Be Tested Yet:
❌ Agent bookings page (page doesn't exist)
❌ Agent commissions page (page doesn't exist)
❌ Agent payouts page (page doesn't exist)
❌ Agent products catalog (page doesn't exist)
❌ Agent suppliers directory (page doesn't exist)
❌ Agent activity log (page doesn't exist)
❌ Agent settings page (page doesn't exist)

**Note:** The backend APIs for most of these exist, only the frontend pages are missing.

---

## 📋 Prerequisites

### Environment Setup Required:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fly2any

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Email Service (for PDF delivery)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Jobs (optional for local testing)
CRON_SECRET=your-cron-secret
```

### Development Server:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## 🔐 Test 1: Admin Portal

### Objective: Verify admin can access all features

### Steps:

#### 1.1 Create Admin User

```bash
# Using create-admin script
npm run create-admin
# Or manually: node scripts/create-admin.js
```

#### 1.2 Login as Admin

1. Navigate to `http://localhost:3000/auth/signin`
2. Enter admin credentials
3. Click "Sign In"
4. **Expected:** Redirect to `/admin` or `/admin/dashboard`

#### 1.3 Test Admin Navigation

| Menu Item | URL | Test Action | Expected Result |
|-----------|-----|-------------|-----------------|
| Dashboard | `/admin` | View stats | Shows metrics and charts |
| Analytics | `/admin/analytics` | View analytics | Shows booking/revenue analytics |
| AI Analytics | `/admin/ai-analytics` | View AI insights | Shows AI-powered insights |
| Users | `/admin/users` | List users | Shows all registered users |
| Bookings | `/admin/bookings` | List bookings | Shows all bookings (may be empty) |
| Affiliates | `/admin/affiliates` | List affiliates | Shows affiliate partners |
| Payouts | `/admin/payouts` | List payouts | Shows payout requests |
| Referrals | `/admin/referrals` | View referrals | Shows referral activity |
| Settings | `/admin/settings` | View settings | Shows admin settings |

#### 1.4 Test Agent Approval (Critical for Agent Testing)

1. Go to `/admin/users`
2. Find agent with status "PENDING"
3. Click "Approve" button
4. **Expected:** Agent status changes to "ACTIVE"
5. **Expected:** Agent can now login and access portal

**Result:** ✅ PASS / ❌ FAIL

---

## 👤 Test 2: Agent Registration & Onboarding

### Objective: Verify agent can register and access portal

### Steps:

#### 2.1 Agent Registration

1. Navigate to `http://localhost:3000/agent/register`
2. Fill out registration form:
   - First Name: Test
   - Last Name: Agent
   - Email: testagent@example.com
   - Password: Test123!@#
   - Phone: +1234567890
   - Business Name: Test Travel Agency
   - Business Type: Travel Agency
   - License Number: ABC123
3. Click "Register"
4. **Expected:** Success message
5. **Expected:** Agent status = "PENDING"

#### 2.2 Admin Approval (Required)

1. Login as admin
2. Go to `/admin/users`
3. Find "testagent@example.com"
4. Click "Approve"
5. **Expected:** Agent status = "ACTIVE"

#### 2.3 Agent Login

1. Logout from admin
2. Navigate to `http://localhost:3000/auth/signin`
3. Enter agent credentials
4. Click "Sign In"
5. **Expected:** Redirect to `/agent` (dashboard)

#### 2.4 Agent Dashboard

1. View agent dashboard at `/agent`
2. **Expected:** Shows:
   - Total clients count
   - Active quotes count
   - Total bookings count
   - Total commissions earned
   - Recent activity
   - Quick actions (Add Client, Create Quote)

**Result:** ✅ PASS / ❌ FAIL

---

## 👥 Test 3: Client Management

### Objective: Verify agent can manage clients

### Steps:

#### 3.1 Create New Client

1. Login as agent
2. Click "Clients" in sidebar
3. Click "Add New Client" button
4. Fill out 4-section form:

**Section 1: Basic Information**
- First Name: John
- Last Name: Smith
- Email: john.smith@example.com
- Phone: +1234567890
- Date of Birth: 1985-05-15
- Nationality: USA
- Preferred Language: English
- Time Zone: America/New_York

**Section 2: Travel Preferences**
- Preferred Destinations: Europe, Asia
- Travel Style: Luxury
- Budget Range: $5000-$10000
- Cabin Class: Business
- Seat Preference: Window
- Meal Preference: Vegetarian
- Special Needs: None

**Section 3: Documents**
- Passport Number: AB1234567
- Issue Date: 2020-01-01
- Expiry Date: 2030-01-01
- Issuing Country: USA

**Section 4: Preferences**
- Segment: STANDARD
- Marketing Opt-in: Yes
- SMS Notifications: Yes
- Email Notifications: Yes

5. Click "Create Client"
6. **Expected:** Success toast
7. **Expected:** Redirect to client detail page

#### 3.2 View Client List

1. Navigate to `/agent/clients`
2. **Expected:** Shows client list with:
   - Search bar
   - Filter options
   - Sort options
   - Grid/Table view toggle
3. **Expected:** Shows "John Smith" in list

#### 3.3 View Client Detail

1. Click on "John Smith" client
2. **Expected:** Shows 4 tabs:
   - Overview (all client info)
   - Quotes (empty initially)
   - Bookings (empty initially)
   - Notes & Timeline

#### 3.4 Add Client Note

1. Go to "Notes & Timeline" tab
2. Add note: "Initial consultation completed"
3. Click "Add Note"
4. **Expected:** Note appears in timeline

**Result:** ✅ PASS / ❌ FAIL

---

## 📝 Test 4: Quote Creation (5-Step Wizard)

### Objective: Verify complete quote creation flow

### Steps:

#### 4.1 Start Quote Creation

1. Login as agent
2. Click "Quotes" in sidebar
3. Click "Create New Quote" button
4. **Expected:** Shows Step 1 of 5

#### 4.2 Step 1: Select Client

1. Search for "John Smith"
2. **Expected:** Shows client in results
3. Click "Select Client"
4. Click "Next"
5. **Expected:** Proceeds to Step 2

#### 4.3 Step 2: Trip Details

1. Fill trip information:
   - Trip Name: "European Adventure"
   - Destination: "Paris, France"
   - Start Date: 2025-06-01
   - End Date: 2025-06-10
   - Adults: 2
   - Children: 0
   - Infants: 0
2. Click "Next"
3. **Expected:** Proceeds to Step 3

#### 4.4 Step 3: Add Products

1. **Flights Section:**
   - Toggle "Include Flights": ON
   - Enter flight details or description
   - Cost: $2000 (total for 2 adults)

2. **Hotels Section:**
   - Toggle "Include Hotels": ON
   - Hotel details: "5-star hotel in central Paris"
   - Cost: $1500

3. **Activities Section:**
   - Toggle "Include Activities": ON
   - Activities: "Eiffel Tower tour, Louvre Museum, Seine River cruise"
   - Cost: $500

4. Click "Next"
5. **Expected:** Proceeds to Step 4

#### 4.5 Step 4: Pricing & Markup

1. View auto-calculated subtotal: $4000
2. Adjust markup slider: 15%
3. **Expected:** Shows:
   - Subtotal: $4000
   - Agent Markup (15%): $600
   - Total: $4600
   - Your Commission: $600
   - Per Person: $2300
4. Add taxes if needed: $200
5. Add notes: "Package includes airport transfers"
6. Click "Next"
7. **Expected:** Proceeds to Step 5

#### 4.6 Step 5: Review & Send

1. Review all quote details
2. **Expected:** Shows beautiful preview with:
   - Client information
   - Trip details
   - Product breakdown
   - Pricing summary
   - Total amount
3. Click "Save as Draft" OR "Send to Client"
4. **Expected:** Success message
5. **Expected:** Quote created in database

**Result:** ✅ PASS / ❌ FAIL

---

## 📄 Test 5: PDF Generation

### Objective: Verify PDF itinerary generation works

### Steps:

#### 5.1 Navigate to Quote Detail

1. Go to `/agent/quotes`
2. Click on "European Adventure" quote
3. **Expected:** Shows quote detail page

#### 5.2 Download PDF

1. Click "Download PDF" button
2. **Expected:** PDF downloads to browser
3. Open PDF
4. **Expected:** Shows professional 2-page itinerary with:
   - Page 1:
     - Header with agent info
     - Client name and quote number
     - Trip summary
     - Product breakdown with icons
     - Pricing table
   - Page 2:
     - Terms & conditions
     - Agent contact information
     - Professional footer
5. **Expected:** All text is readable
6. **Expected:** No layout issues

**Result:** ✅ PASS / ❌ FAIL

---

## 📧 Test 6: Email Delivery

### Objective: Verify PDF email delivery works

### Prerequisites:
- Must have valid `RESEND_API_KEY` in `.env`
- Must have valid `EMAIL_FROM` address configured

### Steps:

#### 6.1 Send Email with PDF

1. On quote detail page
2. Click "Email PDF to Client" button
3. **Expected:** Confirmation dialog appears
4. Click "Confirm"
5. **Expected:** Loading indicator
6. **Expected:** Success toast: "Itinerary sent to john.smith@example.com"

#### 6.2 Verify Email Receipt

1. Check inbox for john.smith@example.com
2. **Expected:** Email received with:
   - Subject: "Your Travel Itinerary: European Adventure"
   - Professional HTML design
   - Trip summary section
   - Agent contact information
   - PDF attachment named: "Itinerary-European-Adventure-[QuoteNumber].pdf"
3. Open PDF attachment
4. **Expected:** Same beautiful 2-page itinerary as download test

**Result:** ✅ PASS / ❌ FAIL

---

## 🌐 Test 7: Client Portal (Quote Viewing)

### Objective: Verify client can view and interact with quote

### Steps:

#### 7.1 Get Shareable Link

1. Login as agent
2. Go to quote detail page
3. Copy the shareable link
   - Format: `http://localhost:3000/client/quotes/[shareableLink]`
   - Example: `http://localhost:3000/client/quotes/clx1234abcd`

#### 7.2 Open in Incognito/Private Browser

1. Open new incognito/private browser window
2. Paste shareable link
3. **Expected:** Quote viewing page loads (no login required)

#### 7.3 Verify Quote Display

1. **Expected:** Shows beautiful public-facing page with:
   - Gradient hero section
   - Trip name and destination
   - Date range
   - Number of travelers
   - Product breakdown
   - Pricing information
   - Agent contact info

#### 7.4 Test Accept Button

1. Click "Accept Quote" button
2. **Expected:** Confirmation modal appears
3. Click "Confirm"
4. **Expected:** Success message
5. **Expected:** Quote status updates to "ACCEPTED"
6. **Expected:** Accept/Decline buttons become disabled
7. **Expected:** Shows "This quote has been accepted" message

#### 7.5 Verify in Agent Portal

1. Login as agent in another tab
2. Go to quote detail
3. **Expected:** Status shows "ACCEPTED"
4. **Expected:** Notification of client acceptance

**Result:** ✅ PASS / ❌ FAIL

---

## ⚠️ Test 8: Navigation (Verify 404 Errors)

### Objective: Document which menu items lead to 404

### Steps:

#### 8.1 Test Each Agent Menu Item

Login as agent and click each menu item:

| Menu Item | URL | Expected Current Result |
|-----------|-----|-------------------------|
| Dashboard | `/agent` | ✅ Works - Shows dashboard |
| Clients | `/agent/clients` | ✅ Works - Shows client list |
| Quotes | `/agent/quotes` | ✅ Works - Shows quote list |
| Bookings | `/agent/bookings` | ❌ 404 Error - Page doesn't exist |
| Commissions | `/agent/commissions` | ❌ 404 Error - Page doesn't exist |
| Payouts | `/agent/payouts` | ❌ 404 Error - Page doesn't exist |
| Products | `/agent/products` | ❌ 404 Error - Page doesn't exist |
| Suppliers | `/agent/suppliers` | ❌ 404 Error - Page doesn't exist |
| Activity Log | `/agent/activity` | ❌ 404 Error - Page doesn't exist |
| Settings | `/agent/settings` | ❌ 404 Error - Page doesn't exist |

**Expected Result:** 7 out of 10 menu items show 404 errors (known issue - pages not built yet)

**Result:** Documented

---

## 🔍 Test 9: API Endpoints (Backend Verification)

### Objective: Verify backend APIs exist and work

### Using Browser DevTools or Postman:

#### 9.1 Test Agent APIs

**Authentication Required:** Include session cookie or Bearer token

| Endpoint | Method | Expected Response |
|----------|--------|-------------------|
| `/api/agents/me` | GET | Agent profile data |
| `/api/agents/me/dashboard` | GET | Dashboard statistics |
| `/api/agents/clients` | GET | List of clients |
| `/api/agents/quotes` | GET | List of quotes |
| `/api/agents/bookings` | GET | List of bookings (API exists) |
| `/api/agents/commissions` | GET | Commission data (API exists) |
| `/api/agents/payouts` | GET | Payout history (API exists) |
| `/api/agents/integrations/products` | GET | Product catalog (API exists) |
| `/api/agents/integrations/suppliers` | GET | Supplier directory (API exists) |

#### 9.2 Verification Steps

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to agent dashboard
4. **Expected:** See API calls being made
5. Check response status codes
6. **Expected:** 200 OK for existing pages
7. **Expected:** Successful JSON responses

**Result:** ✅ PASS / ❌ FAIL

---

## 📊 Test Results Summary

### Fill out after testing:

```
Date Tested: _____________
Tested By: _____________

Test Results:
[ ] Test 1: Admin Portal - PASS / FAIL
[ ] Test 2: Agent Registration - PASS / FAIL
[ ] Test 3: Client Management - PASS / FAIL
[ ] Test 4: Quote Creation - PASS / FAIL
[ ] Test 5: PDF Generation - PASS / FAIL
[ ] Test 6: Email Delivery - PASS / FAIL
[ ] Test 7: Client Portal - PASS / FAIL
[ ] Test 8: Navigation (404s) - DOCUMENTED
[ ] Test 9: API Endpoints - PASS / FAIL

Issues Found:
1. ________________________________
2. ________________________________
3. ________________________________

Overall Status: READY FOR PRODUCTION / NEEDS FIXES
```

---

## 🚀 Production Testing Checklist

### After deploying to production:

#### Environment Verification:
- [ ] All environment variables set in Vercel
- [ ] Database connection working
- [ ] Email service (Resend) configured
- [ ] NEXTAUTH_URL points to production domain
- [ ] CRON_SECRET configured

#### Functional Testing:
- [ ] Admin can login
- [ ] Agent can register
- [ ] Admin can approve agents
- [ ] Agent can create clients
- [ ] Agent can create quotes
- [ ] PDF generation works
- [ ] Email delivery works (test with real email)
- [ ] Client can view quote via shareable link
- [ ] Client can accept/decline quote

#### Performance Testing:
- [ ] Pages load in < 3 seconds
- [ ] PDF generation in < 5 seconds
- [ ] Email delivery in < 10 seconds
- [ ] No console errors in browser
- [ ] No 500 errors in server logs

---

## 🐛 Known Issues (As of November 18, 2025)

### Critical:
1. **7 agent navigation pages missing** - Will show 404 errors
   - Bookings, Commissions, Payouts, Products, Suppliers, Activity, Settings

### Medium:
- None currently

### Low:
- None currently

---

## 💡 Testing Tips

### Useful Commands:

```bash
# View database records
npx prisma studio

# Clear database (caution!)
npx prisma migrate reset

# View logs
npm run dev
# Watch terminal for errors

# Check TypeScript errors
npx tsc --noEmit

# Check build
npm run build
```

### Quick Test Data Creation:

```bash
# Create admin user
npm run create-admin

# You can manually create test data via Prisma Studio:
npx prisma studio
# Then navigate to tables and add records
```

---

## 📝 Notes

- All tests assume you're running on `localhost:3000`
- Adjust URLs if using different port or domain
- Some tests require email service configuration
- PDF tests work without email configuration
- Client portal tests don't require authentication
- Agent tests require approved agent status

---

**This testing guide covers all currently implemented features. Update this document when the 7 missing pages are built!**
