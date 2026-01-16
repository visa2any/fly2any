# Multi-Airport & Multi-Date Search - Diagnostic Guide

**Date:** 2026-01-16
**Status:** FUNCTIONALITY IS IMPLEMENTED - Need to diagnose UI/UX issue

---

## Executive Summary

The multi-airport and multi-date search functionality **IS fully implemented** across all layers:
- ✅ Frontend search form components
- ✅ URL parameter handling
- ✅ API endpoint logic
- ✅ Cartesian product of all airport/date combinations

However, the user reports "search do not work" when using these features. This diagnostic guide will help identify the specific issue.

---

## Architecture Overview

### Data Flow

```
Homepage Search Form (EnhancedSearchBar)
    ↓
User selects: JFK,EWR + LAX,SNA + 2026-02-01,2026-02-02
    ↓
URL: /flights/results?from=JFK,EWR&to=LAX,SNA&departure=2026-02-01,2026-02-02&useFlexibleDates=true
    ↓
Results Page parses params
    ↓
API Call: POST /api/flights/search with comma-separated values
    ↓
API parses airports: ['JFK', 'EWR'] × ['LAX', 'SNA']
API parses dates: ['2026-02-01', '2026-02-02']
    ↓
Searches: 2 origins × 2 destinations × 2 dates = 8 API calls (parallel)
    ↓
Returns combined, deduplicated results
```

### Code Locations

#### 1. **Frontend - Search Form**
- `components/flights/EnhancedSearchBar.tsx`
  - Line 315-321: Parses comma-separated values from props
  - Line 1133-1139: Builds search URL with comma-separated values
  - Line 1190: Opens results page

- `components/common/MultiAirportSelector.tsx`
  - Multi-select airport component
  - Allows selecting multiple airports per field
  - Returns array of airport codes

#### 2. **Results Page**
- `app/flights/results/page.tsx`
  - Line 563-571: Extracts search params (handles comma-separated)
  - Line 905-916: Calls API with multi-date flag

#### 3. **API Endpoint**
- `app/api/flights/search/route.ts`
  - Line 384-412: `parseAirportCodes()` - splits comma-separated codes
  - Line 429-453: `validateDates()` - validates comma-separated dates
  - Line 530-537: Parses multi-dates into arrays
  - Line 1172-1207: **Multi-date search logic** - iterates all combinations
  - Line 1313-1331: **Standard multi-airport logic** - iterates all combinations

---

## Diagnostic Steps

### Step 1: Verify UI Components Are Visible

**Test on Homepage (https://fly2any.com)**

1. **Open Chrome DevTools** (F12)
2. **Navigate to homepage**
3. **Expand search form** (if collapsed on mobile)
4. **Check for multi-airport selector:**
   - Origin field should allow adding multiple airports
   - Destination field should allow adding multiple airports
   - Look for a "+" button or multi-select UI

**Expected Behavior:**
- `MultiAirportSelector` component should be rendered
- User can type airport code/name and select multiple airports
- Selected airports show as chips/tags

**If NOT visible:**
- Issue: UI component not rendering
- Check: Browser console for React errors

### Step 2: Test Multi-Airport Selection

**Manual Test:**
1. In "From" field, type: `JFK`
2. Select "New York JFK"
3. **Important**: Look for option to add another airport
4. Try typing: `EWR`
5. Select "Newark EWR"

**Check browser console for:**
```javascript
// Look for logs like:
🔍 Multi-airport search: JFK,EWR → LAX
```

**If selection doesn't work:**
- Check: `components/common/MultiAirportSelector.tsx` is properly imported
- Check: No TypeScript errors in build
- Check: `onChange` callback is being called

### Step 3: Test Multi-Date Selection

**Manual Test:**
1. Look for "Single / Multi" toggle or "Flexible Dates" toggle
2. Enable multi-date mode
3. Select multiple dates (should show date picker or date chip selector)

**Expected URL params:**
```
departure=2026-02-01,2026-02-02,2026-02-03
useFlexibleDates=true
```

**If multi-date UI not visible:**
- Check: Line 321 in EnhancedSearchBar - `useFlexibleDates` state
- Check: Date picker component supports multi-select

### Step 4: Check Form Submission

**Test:**
1. Fill out form with:
   - From: JFK, EWR
   - To: LAX
   - Departure: Feb 1, Feb 2
2. Click "Search" button
3. **Check what happens:**

**Expected:**
- New tab opens: `/flights/results?from=JFK,EWR&to=LAX&departure=2026-02-01,2026-02-02&useFlexibleDates=true`

**If nothing happens:**
- Open browser console
- Look for JavaScript errors
- Check: `handleSearch` function at line 969 in EnhancedSearchBar

### Step 5: Check Browser Console

**Open DevTools → Console tab**

**Look for:**
```
❌ Errors (red)
⚠️ Warnings (yellow)
```

**Common Issues:**
- **Missing imports:** `Cannot find module 'MultiAirportSelector'`
- **Type errors:** `Property 'join' does not exist on type 'string'`
- **React errors:** `Cannot read property of undefined`

### Step 6: Test API Directly

**Use browser console to test API:**

```javascript
// Test multi-airport + multi-date search
fetch('/api/flights/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'JFK,EWR',  // Comma-separated
    destination: 'LAX,SNA',  // Comma-separated
    departureDate: '2026-03-01,2026-03-02',  // Comma-separated
    returnDate: '2026-03-08',
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: 'economy',
    nonStop: false,
    currencyCode: 'USD',
    max: 50,
    useMultiDate: true  // IMPORTANT: Must be true
  })
})
.then(res => res.json())
.then(data => console.log('✅ API Response:', data))
.catch(err => console.error('❌ API Error:', err));
```

**Expected API logs (check Vercel logs):**
```
🔍 Multi-airport search: JFK,EWR → LAX,SNA
🗓️ Multi-date search: 2 departure dates x 1 return dates
🛫 Searching 4 airport combination(s)...
  Queuing: JFK → LAX on 2026-03-01 returning 2026-03-08
  Queuing: JFK → SNA on 2026-03-01 returning 2026-03-08
  Queuing: EWR → LAX on 2026-03-01 returning 2026-03-08
  Queuing: EWR → SNA on 2026-03-01 returning 2026-03-08
  Queuing: JFK → LAX on 2026-03-02 returning 2026-03-08
  ...
    ✅ Found: 25 flights for JFK → LAX on 2026-03-01
```

**If API returns error:**
- Check: Error message in response
- Check: Lines 384-453 in `/app/api/flights/search/route.ts` for validation errors

---

## Common Issues & Fixes

### Issue #1: Multi-Airport UI Not Showing

**Symptom:** Can only select one airport per field

**Diagnosis:**
```bash
# Check if MultiAirportSelector is used
grep -r "MultiAirportSelector" components/flights/EnhancedSearchBar.tsx
```

**Fix:** Verify line 428-443 in `FlightSearchForm.tsx` uses `MultiAirportSelector` component

### Issue #2: Multi-Date Toggle Not Visible

**Symptom:** Can only select single date

**Diagnosis:**
- Check line 486-498 in `FlightSearchForm.tsx`
- Look for "Single / Multi" toggle buttons

**Fix:** Verify `formData.useMultiDate` state is being used

### Issue #3: Form Submits But No Results

**Symptom:** Search appears to work, but results page is empty

**Diagnosis:**
```javascript
// Check URL params on results page
console.log(window.location.search);
// Should show: ?from=JFK,EWR&to=LAX&departure=2026-02-01,2026-02-02
```

**Possible causes:**
- `useFlexibleDates` parameter missing
- API not parsing comma-separated values
- API returning empty results (check Vercel logs)

**Fix:** Verify line 916 in `app/flights/results/page.tsx` sends `useMultiDate: searchData.useFlexibleDates`

### Issue #4: JavaScript Errors Blocking Submission

**Symptom:** Clicking search button does nothing

**Diagnosis:**
- Open browser console
- Look for red error messages
- Check for unhandled promise rejections

**Fix:** Common errors:
- `origin.join is not a function` → origin is string, not array
- `Cannot read property of undefined` → missing null check
- `React Hook error` → useEffect dependency issue

---

## Testing Checklist

- [ ] **Multi-Airport Origin:** Can select 2+ airports in "From" field
- [ ] **Multi-Airport Destination:** Can select 2+ airports in "To" field
- [ ] **Multi-Date Toggle:** "Single / Multi" or "Flexible Dates" toggle exists
- [ ] **Multi-Date Selection:** Can select 2+ departure dates
- [ ] **Form Submission:** Search button triggers navigation
- [ ] **URL Parameters:** Results page URL contains comma-separated values
- [ ] **API Call:** Network tab shows POST to `/api/flights/search`
- [ ] **API Response:** Response contains flight results
- [ ] **No Console Errors:** No red errors in browser console

---

## Quick Test Script

**Copy-paste into browser console on homepage:**

```javascript
// Test if multi-airport logic exists in EnhancedSearchBar
const testMultiAirport = () => {
  // Simulate search with multiple airports
  const params = new URLSearchParams({
    from: 'JFK,EWR,LGA',  // 3 NYC airports
    to: 'LAX,SNA,ONT',     // 3 LA airports
    departure: '2026-03-01,2026-03-02',  // 2 dates
    useFlexibleDates: 'true',
    adults: '1',
    children: '0',
    infants: '0',
    class: 'economy'
  });

  const url = `/flights/results?${params.toString()}`;
  console.log('🧪 Test URL:', url);
  console.log('✅ If this URL works, multi-airport/multi-date is functional!');

  // Open in new tab
  window.open(url, '_blank');
};

testMultiAirport();
```

---

## Expected vs Actual Behavior

### Expected (Working System)

1. **User Action:** Select JFK + EWR in origin, LAX in destination, Feb 1 + Feb 2 as dates
2. **Search Button:** Click "Search Flights"
3. **URL Generated:** `/flights/results?from=JFK,EWR&to=LAX&departure=2026-02-01,2026-02-02&useFlexibleDates=true`
4. **API Behavior:**
   - Parses: `originCodes = ['JFK', 'EWR']`, `destinationCodes = ['LAX']`, `departureDates = ['2026-02-01', '2026-02-02']`
   - Searches: 2 origins × 1 destination × 2 dates = **4 parallel API calls**
   - Returns: Combined deduplicated results
5. **Results Displayed:** Shows flights from JFK→LAX and EWR→LAX for both Feb 1 and Feb 2

### Actual (Reported Issue)

**User reports:** "search do not work"

**Need to determine:**
- Does search button do nothing?
- Does it error?
- Does it navigate but show no results?
- Is the UI for multi-selection missing?

---

## Next Steps for Developer

1. **Run Diagnostic Steps 1-6** on production site
2. **Identify exact failure point** (UI, submission, API, or results)
3. **Check browser console** for errors
4. **Check Vercel logs** for API errors
5. **Report findings** with specific error messages

---

## Contact

If issue persists after diagnostics:
- Check: `PAYMENT_VERIFICATION_FIXED.md` for recent deployment logs
- Review: Git commit history for recent changes to search form
- Test: Local development environment vs production

**Latest changes:**
- 2026-01-16: Payment verification E2E implementation
- No changes to flight search logic in recent commits

---

**Status:** Ready for Testing ✅
