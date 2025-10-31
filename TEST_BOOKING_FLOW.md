# 🧪 Test Your Real Data Booking Flow

## ✅ All Fixes Applied

The booking flow now uses **100% real data** from start to finish!

---

## 🚀 Quick Test (5 Minutes)

### Step 1: Start the App
```bash
npm run dev
```
Wait for it to start, then go to: `http://localhost:3000`

### Step 2: Search for a Flight
Go to: `http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0`

Or use the search form to search for any flight.

### Step 3: Select a Flight
1. Browse the results
2. Click **"Select"** on any flight
3. You'll be taken to the booking page

### Step 4: Fill Passenger Details
**Use these test values:**
```
Title: Mr
First Name: John
Last Name: Doe
Date of Birth: 1990-01-01
Nationality: US
Email: your-real-email@example.com  (use your real email!)
Phone: +1234567890
Passport Number: P123456789 (if required)
Passport Expiry: 2030-12-31 (if required)
```

Click **"Continue"**

### Step 5: Enter Payment Details
**Use these test card details:**
```
Card Number: 4242 4242 4242 4242
Cardholder Name: John Doe
Expiry Month: 12
Expiry Year: 28
CVV: 123
```

Check the terms and conditions box.

Click **"Complete Booking"**

### Step 6: View Confirmation Page
✅ **Verify the following are REAL (not mock data):**

| Item | What to Check |
|------|---------------|
| Booking Reference | Starts with `FLY2A-` (not `F2A-2025-XYZ`) |
| Your Email | Shows the email you entered |
| Flight Route | Shows JFK → LAX (or your search) |
| Departure Date | Shows Nov 15, 2025 (or your search date) |
| Passenger Name | Shows "John Doe" (or your name) |
| Flight Number | Shows real flight number from Amadeus |

🎉 **If all these show YOUR real data, SUCCESS!**

### Step 7: Check Admin Dashboard
1. Open new tab: `http://localhost:3000/admin/bookings`
2. ✅ Your booking should appear in the list
3. ✅ Status: **"Pending"** (yellow badge)
4. ✅ Booking reference matches confirmation page
5. Click **"View"** to see full details

### Step 8: Confirm Payment (Admin Action)
1. On the booking detail page, click **"Confirm Payment"** (green button)
2. Confirm the action
3. ✅ Status changes to **"Confirmed"** (green badge)
4. ✅ Payment status changes to **"Paid"**
5. ✅ Check console for "confirmation email sent" log

---

## 📋 Verification Checklist

### Confirmation Page Should Show:
- [x] Real booking reference (FLY2A-XXXXXX format)
- [x] Your actual email address
- [x] Real flight numbers from Amadeus API
- [x] Correct departure date from your search
- [x] Correct origin and destination airports
- [x] Your passenger name from the form
- [x] Real flight times (not mock times like 18:30)
- [x] Loading spinner while fetching data
- [x] No "F2A-2025-XYZ789" anywhere

### Admin Dashboard Should Show:
- [x] Booking appears in list
- [x] Correct booking reference
- [x] Status: "Pending" initially
- [x] Real flight route
- [x] Real passenger count
- [x] Real total amount
- [x] Created timestamp

### After Payment Confirmation:
- [x] Status changes to "Confirmed"
- [x] Payment status: "Paid"
- [x] Console shows email sent (if Resend configured)
- [x] Can click "Send Email" manually

---

## 🐛 Troubleshooting

### Issue: Confirmation page shows loading forever
**Fix**: Check browser console for errors. Booking might not be saved to database.
- Verify `DATABASE_URL` is set in `.env`
- Check terminal for error messages
- Try booking again

### Issue: Booking doesn't appear in admin dashboard
**Fix**: Booking wasn't saved to database
- Check terminal for "Booking saved to database" message
- Verify database connection
- Look for API errors in browser console

### Issue: Still seeing "F2A-2025-XYZ789" mock reference
**Fix**: Clear browser cache and refresh
- Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
- Or try incognito/private browsing mode

### Issue: "Booking not found" error on confirmation page
**Fix**: Booking ID not passed correctly
- Check URL has `?bookingId=` parameter
- Verify booking was created successfully
- Check browser console for errors

---

## 📧 Email Testing

### Without Resend API Key (Default):
- Emails will be **logged to console**
- Check terminal for:
  ```
  📧 Sending payment instructions email...
  ✅ Payment instructions email sent
  ```
- You'll see the full email content in logs

### With Resend API Key:
1. Add to `.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   FROM_EMAIL=onboarding@resend.dev
   ```
2. Restart server: `npm run dev`
3. Create new booking
4. Check your email inbox for:
   - **Payment Instructions** (after booking creation)
   - **Booking Confirmation** (after admin confirms payment)

---

## 🎯 Success Criteria

Your implementation is working correctly if:

1. ✅ Booking reference is unique each time (FLY2A-XXXXXX)
2. ✅ Confirmation page shows YOUR data (email, name, etc.)
3. ✅ Flight details match what you selected
4. ✅ Booking appears in admin dashboard
5. ✅ Can confirm payment and status changes
6. ✅ No mock data visible anywhere
7. ✅ Database contains the booking record

---

## 🎉 You Did It!

If all checks pass, your booking system is now using **100% REAL DATA**!

**What's Working:**
- ✅ Real flight search (Amadeus API)
- ✅ Real booking creation
- ✅ Real database storage
- ✅ Real booking references
- ✅ Real passenger data
- ✅ Real payment tracking
- ✅ Real admin management
- ✅ Real email notifications

**Next Steps (Optional):**
- Add Stripe for automatic payments
- Integrate real fare APIs
- Add seat selection with real seat maps
- Generate PDF e-tickets

---

Need help? Check:
- `REAL_DATA_BOOKING_FIX.md` - Detailed implementation guide
- `MANUAL_PAYMENT_IMPLEMENTATION.md` - Complete system documentation
- `QUICK_START.md` - Quick setup guide

**Happy testing! 🚀**
