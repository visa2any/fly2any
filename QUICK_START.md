# Quick Start Guide - Manual Payment System

## 🚀 Get Started in 5 Minutes

### Step 1: Configure Environment Variables
Create or update `.env` file:

```env
# Required for booking storage
DATABASE_URL=your_postgresql_connection_string

# Optional for email (works without it)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=bookings@yourdomain.com

# Optional - Amadeus API (for real flight bookings)
AMADEUS_API_KEY=your_key
AMADEUS_API_SECRET=your_secret
```

### Step 2: Run the Application
```bash
npm run dev
```

### Step 3: Test the Booking Flow

#### As a Customer:
1. Go to `http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0`
2. Click on any flight → "Select"
3. Fill in passenger details:
   - First Name, Last Name
   - Date of Birth, Nationality
   - Contact info (email, phone)
4. Enter credit card details (any test card)
5. Click "Complete Booking"
6. **Note your booking reference** (e.g., `FLY2A-ABC123`)
7. Check console logs for "payment instructions email" (if no Resend key)

#### As an Admin:
1. Go to `http://localhost:3000/admin/bookings`
2. See your pending booking in the list
3. Click "View" to see booking details
4. Review flight, passenger, and payment info
5. Click **"Confirm Payment"** button
6. Status changes to "Confirmed"
7. Customer receives confirmation email (if Resend configured)

---

## 📧 Email Configuration (Optional)

### Without Resend (Testing Mode):
- Emails are **logged to console**
- Full email content visible in terminal
- All functionality works except actual sending

### With Resend (Production Mode):
1. Sign up at https://resend.com
2. Get API key
3. Add to `.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   FROM_EMAIL=bookings@yourdomain.com
   ```
4. For testing, use: `FROM_EMAIL=onboarding@resend.dev`
5. For production, verify your domain first

---

## 🔍 Quick URLs

| Page | URL | Purpose |
|------|-----|---------|
| Main Dashboard | `/admin` | Overview stats |
| Booking Management | `/admin/bookings` | View all bookings |
| Booking Detail | `/admin/bookings/[id]` | View specific booking |
| Flight Search | `/flights/results` | Test booking flow |

---

## 💡 Pro Tips

1. **Test Without Amadeus**: System works in mock mode without API keys
2. **Email Testing**: Check console logs to see email content
3. **Booking Reference**: Always starts with `FLY2A-`
4. **Status Flow**: `pending` → admin confirms → `confirmed`
5. **Database Check**: Bookings stored immediately, even if email fails

---

## 🐛 Troubleshooting

### Booking Not Saving?
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Check console for error messages

### Email Not Sending?
- Without `RESEND_API_KEY`: Emails logged to console (normal)
- With `RESEND_API_KEY`: Check API key is valid
- Verify `FROM_EMAIL` domain is verified (or use `onboarding@resend.dev`)

### Admin Page Not Loading?
- Clear browser cache
- Check for JavaScript errors in console
- Restart dev server: `npm run dev`

### Payment Confirmation Not Working?
- Ensure booking status is "pending"
- Check booking ID in URL is correct
- Verify database connection

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Booking reference generated (e.g., `FLY2A-ABC123`)
- ✅ Booking appears in `/admin/bookings`
- ✅ Payment instructions email logged (or sent)
- ✅ Status changes after confirmation
- ✅ Confirmation email logged (or sent)

---

## 📊 Test Data

For quick testing, use these values:

**Passenger Details:**
```
First Name: John
Last Name: Doe
Date of Birth: 1990-01-01
Nationality: US
Email: john.doe@example.com
Phone: +1234567890
```

**Credit Card (Test):**
```
Card Number: 4242 4242 4242 4242
Expiry: 12/28
CVV: 123
Name: John Doe
```

---

## 🎯 What to Expect

### First Booking:
1. Takes ~2 seconds to create
2. Saves to database with unique reference
3. Sends payment instructions (or logs)
4. Shows success message with reference

### Admin Confirmation:
1. Click takes ~1 second
2. Updates status to "confirmed"
3. Updates payment to "paid"
4. Sends confirmation email (or logs)

### Email Delivery:
- **Without Resend**: Instant (console log)
- **With Resend**: 1-5 seconds

---

## 🚀 Ready for Production?

To deploy:
1. Set up PostgreSQL database
2. Get Resend API key and verify domain
3. Add environment variables to hosting platform
4. Deploy application
5. Test with real booking
6. Monitor admin dashboard

**That's it!** Your manual payment system is ready to go.

Need help? Check `MANUAL_PAYMENT_IMPLEMENTATION.md` for detailed documentation.
