# Quick Testing Guide - Seat Maps & Ancillaries

**Last Updated**: 2025-10-28

---

## 🚀 Quick Start

### 1. Restart Your Dev Server

**IMPORTANT**: You must restart the dev server to pick up the fixes:

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### 2. Clear Browser Cache

**Windows (Chrome/Edge)**:
- Press `Ctrl + Shift + Delete`
- Select "Cached images and files"
- Click "Clear data"

**Or**: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

---

## ✅ What to Test

### Test 1: Seat Maps (Expected to Work)

1. **Search for a flight**:
   - Route: JFK → LAX (or any major route)
   - Date: Any future date
   - Click "Search Flights"

2. **Select a flight** (preferably major airline like United, Delta, American)

3. **Proceed to booking page**

4. **In the "Customize Flight" section**:
   - Look for the "Seats" tab in add-ons
   - Click "View Interactive Seat Map" button

5. **Expected Results**:
   - ✅ **If airline provides seat maps**: Interactive map opens
   - ✅ **If airline doesn't provide seat maps**: Clear message:
     > *"Interactive seat maps are not available for this airline. This is normal for some carriers."*
   - ✅ **Seat type selection always available**: Aisle, Window, Extra Legroom options

### Test 2: Baggage Data (Check Console Logs)

1. **Open DevTools Console** (F12 → Console tab)

2. **Open Browser Developer Tools Terminal** or check your **VS Code terminal**

3. **Proceed to booking page** for any flight

4. **Look for these console logs**:

```
🎁 ========================================
🎁 FETCHING ANCILLARIES FOR FLIGHT: off_xxxxx
🎁 Flight Source: Duffel (or GDS)
🎁 Flight Price: USD 234.50
🎁 ========================================

🧳 ========================================
🧳 EXTRACTING BAGGAGE FROM AMADEUS FARE DETAILS
🧳 Included checked bags: 1
🧳 Baggage amenities found in fare details: 2
✅ FOUND REAL BAGGAGE AMENITIES IN FARE:
   1. First checked bag - USD 35 ✅ (Real price)
   2. Second checked bag - USD 45 ✅ (Real price)
✅ Extracted 2 baggage options from Amadeus amenities
🧳 ========================================

📊 ANCILLARY DATA SOURCES:
   🧳 Baggage: ✅ REAL AIRLINE DATA
   💺 Seats: ⚠️  MOCK DATA (Interactive seat maps available separately)
   🍽️  Meals: ⚠️  MOCK DATA (requires airline API integration)
   📡 WiFi: ⚠️  MOCK DATA (not available in test APIs)
   🛡️  Insurance: ⚠️  MOCK DATA (requires 3rd party integration)
   🎯 Lounge: ⚠️  MOCK DATA (requires airport API integration)
   ⚡ Priority: ⚠️  MOCK DATA (requires airline API integration)
```

5. **What to look for**:
   - ✅ **"REAL AIRLINE DATA"** = Actual airline pricing
   - ⚠️ **"MOCK DATA"** = Estimated pricing
   - Clear section separators with emoji indicators

### Test 3: Complete Booking Flow

1. **Search for flights**: JFK → LAX
2. **Select a flight**
3. **On booking page, verify all sections visible**:
   - ✅ Step 1: "Customize Flight"
     - Fare selector (4 options: Basic, Standard, Flex, Flex Plus)
     - Smart bundles (3 bundles: Business Traveler, Vacation Bundle, Light Traveler)
     - Add-ons tabs (Seats, Baggage, Insurance, WiFi, Priority, etc.)
   - ✅ Step 2: "Passenger Details"
   - ✅ Step 3: "Review & Pay"

4. **Check console logs show**:
```
✅ ========================================
✅ BOOKING DATA LOADED SUCCESSFULLY
✅ - Fare Options: 4
✅ - Smart Bundles: 3
✅ - Ancillary Categories: 4
✅ - Passengers: 1
✅ ========================================
```

---

## 🔍 What to Look For

### In Browser Console (DevTools):

**Good Signs** ✅:
- "BOOKING DATA LOADED SUCCESSFULLY"
- Fare Options: 4
- Smart Bundles: 3
- Ancillary Categories: 4

**Bad Signs** ❌ (shouldn't see these anymore):
- "INVALID DATA RECEIVED"
- Amadeus API errors about source/type/class
- Empty fare options or ancillary categories

### In Terminal (Server Logs):

**Good Signs** ✅:
```
💺 Fetching seat map for Duffel flight: off_xxxxx
🪑 Fetching Duffel seat maps for offer: off_xxxxx
✅ Duffel returned 0 seat maps
⚠️  Seat maps not available for this Duffel flight
```

**Bad Signs** ❌ (shouldn't see these anymore):
```
Error getting seat map: {
  errors: [
    { code: 4926, title: 'INVALID DATA RECEIVED' }
  ]
}
```

---

## 📊 What Each Data Source Means

### Real Data (When Available):

| Service | Source | When Real |
|---------|--------|-----------|
| **Baggage** | Amadeus amenities or Duffel API | ✅ When airline provides in fare details |
| **Seat Maps** | Duffel or Amadeus seat map API | ✅ When airline supports digital seat maps |

### Mock Data (By Design):

| Service | Reason |
|---------|--------|
| **Meals** | Requires airline-specific API integration |
| **WiFi** | Not available in test APIs |
| **Insurance** | Requires 3rd party provider integration |
| **Lounge** | Requires airport API integration |
| **Priority** | Requires airline-specific API integration |

**This is normal and expected!** Even major booking platforms use estimated pricing for these supplementary services.

---

## 🐛 Common Issues & Solutions

### Issue 1: "Seat map not available" for ALL flights

**Solution**:
1. Check that Duffel API key is configured in `.env.local`
2. Restart dev server
3. Clear browser cache
4. Try different airlines (major carriers more likely to have seat maps)

### Issue 2: Still seeing old console logs

**Solution**:
1. **Stop dev server** (Ctrl+C)
2. **Delete `.next` folder** (build cache):
   ```bash
   rmdir /s /q .next
   ```
3. **Restart dev server**:
   ```bash
   npm run dev
   ```
4. **Hard refresh browser** (Ctrl+Shift+R)

### Issue 3: Baggage showing "MOCK DATA" instead of "REAL DATA"

**Possible Reasons**:
1. The flight genuinely doesn't have baggage amenities in fare details (normal for some fares)
2. Budget airlines often don't include baggage in base fare
3. Test API may have limited data

**To Verify**:
- Look for flights on major airlines (United, Delta, American, British Airways)
- Check console logs for: "Baggage amenities found in fare details: X"
- If X = 0, then mock data is expected

---

## 📸 Screenshots to Verify

### 1. Booking Page - Step 1 Should Show:

- **Fare Selector**: 4 cards (Basic, Standard, Flex, Flex Plus)
- **Smart Bundles**: 3 cards (Business Traveler, Vacation, Light Traveler)
- **Add-ons Tabs**: Horizontal tabs for Seats, Baggage, Insurance, WiFi, etc.

### 2. Console Logs Should Show:

```
✅ ========================================
✅ BOOKING DATA LOADED SUCCESSFULLY
✅ - Fare Options: 4
✅ - Smart Bundles: 3
✅ - Ancillary Categories: 4
✅ - Passengers: 1
✅ ========================================
```

### 3. Seat Map Behavior:

**When Available**:
- Interactive map opens in modal
- Shows seat grid with available/occupied seats
- Can select specific seat number

**When Not Available**:
- Alert shows clear message
- Directs to seat type selection
- No error stack traces or API failures

---

## ✨ Success Criteria

Your platform is working correctly if:

- ✅ **Booking flow shows all 3 steps**
- ✅ **Fare options visible** (4 cards)
- ✅ **Smart bundles visible** (3 cards)
- ✅ **Add-ons tabs visible** (multiple categories)
- ✅ **Seat maps open when available** (some airlines)
- ✅ **Seat maps show clear message when unavailable** (some airlines)
- ✅ **Console logs show data sources** (Real vs Mock)
- ✅ **No Amadeus "INVALID DATA" errors**
- ✅ **Baggage shows real prices** (when available in fare details)

---

## 📚 Reference Documents

For more details, see:

1. **`SEAT_MAP_FIX_SUMMARY.md`** - Complete technical breakdown of seat map fix
2. **`ANCILLARY_DATA_SOURCES_REPORT.md`** - Detailed explanation of all data sources
3. **`BOOKING_FLOW_IMPLEMENTATION.md`** - Original booking flow documentation

---

## 🎯 Quick Checklist

Before reporting issues, verify:

- [ ] Dev server restarted after code changes
- [ ] Browser cache cleared (hard refresh)
- [ ] Console DevTools open (F12)
- [ ] Terminal visible to see server logs
- [ ] Tried multiple airlines (major carriers)
- [ ] Tried multiple routes (popular routes more likely to have data)
- [ ] Checked that `.env.local` has API keys configured

---

## 💬 What to Report

If you still see issues, please provide:

1. **Screenshots** of:
   - Booking page (all 3 steps)
   - Browser console logs (DevTools)
   - Terminal server logs

2. **Flight Details**:
   - Route (e.g., JFK → LAX)
   - Airline
   - Flight source (Duffel or Amadeus/GDS)

3. **Specific Behavior**:
   - What you expected
   - What actually happened
   - Any error messages

---

**Happy testing! Your platform should now handle seat maps and ancillaries gracefully! 🚀**
