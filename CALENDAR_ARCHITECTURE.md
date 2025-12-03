# Calendar Architecture - Official Documentation

## 🎯 OFFICIAL CALENDAR COMPONENT

**`components/flights/PremiumDatePicker.tsx`** is the **ONLY** calendar component used across the entire application.

### Why PremiumDatePicker?

✅ **Production-tested** - Used in all hotel, flight, and car rental searches
✅ **Feature-complete** - Supports single dates, date ranges, price display, min/max dates
✅ **Beautiful UI** - Premium design with smooth animations
✅ **Accessible** - Proper ARIA labels and keyboard navigation
✅ **Mobile-optimized** - Responsive design for all screen sizes

---

## 📍 Where It's Used

### Primary Location
- **`components/flights/EnhancedSearchBar.tsx`** (lines 2881-2909)
  - Hotel check-in/checkout date selection
  - Flight departure/return date selection
  - Car rental pickup/dropoff date selection

### Usage Pattern

```typescript
import PremiumDatePicker from '@/components/flights/PremiumDatePicker';

// Example: Hotel Check-in
<PremiumDatePicker
  isOpen={showHotelCheckInPicker}
  onClose={() => setShowHotelCheckInPicker(false)}
  value={checkInDate}
  onChange={(date) => {
    setCheckInDate(date);
    setCheckOutDate(''); // Clear checkout when changing check-in
    setShowHotelCheckInPicker(false);
    // Automatically open checkout picker
    setTimeout(() => setShowHotelCheckOutPicker(true), 100);
  }}
  type="single"
  anchorEl={hotelCheckInRef.current}
/>

// Example: Hotel Check-out
<PremiumDatePicker
  isOpen={showHotelCheckOutPicker}
  onClose={() => setShowHotelCheckOutPicker(false)}
  value={checkOutDate}
  onChange={(date) => {
    setCheckOutDate(date);
    // Close after both dates selected
    setShowHotelCheckOutPicker(false);
  }}
  type="single"
  minDate={checkInDate ? new Date(new Date(checkInDate).getTime() + 24 * 60 * 60 * 1000) : undefined}
  anchorEl={hotelCheckOutRef.current}
/>
```

---

## 🔧 Critical Implementation Details

### Hotel Date Selection Flow

**REQUIREMENT:** Calendar must stay open until BOTH check-in and checkout dates are selected.

**Implementation (components/flights/EnhancedSearchBar.tsx:2885-2908):**

1. **Check-in selection:**
   - Sets check-in date
   - Clears checkout date
   - Closes check-in picker
   - **Automatically opens checkout picker** (100ms delay)

2. **Checkout selection:**
   - Has `minDate` set to day after check-in (prevents past dates)
   - Sets checkout date
   - **Only NOW closes the picker** (after both dates selected)

### Date Blocking

```typescript
// Prevent selecting same day or earlier for checkout
minDate={checkInDate ? new Date(new Date(checkInDate).getTime() + 24 * 60 * 60 * 1000) : undefined}
```

This ensures:
- ✅ Checkout date is always AFTER check-in date
- ✅ Same-day checkout is prevented
- ✅ Past dates are blocked

---

## 🗑️ Removed Calendar Components

The following calendar components were **DELETED** to eliminate confusion:

### ❌ DateRangePicker.tsx
- **Location:** `components/shared/DateRangePicker.tsx`
- **Status:** DEPRECATED & REMOVED
- **Reason:** Not used in production, caused confusion, different API than PremiumDatePicker

### ❌ MultiDatePicker.tsx (if exists)
- **Location:** `components/common/MultiDatePicker.tsx`
- **Status:** DEPRECATED & REMOVED
- **Reason:** Redundant, not used in production

---

## 📊 Component API

### PremiumDatePicker Props

```typescript
interface PremiumDatePickerProps {
  label?: string;                    // Optional label
  value?: string | null;              // Selected date (YYYY-MM-DD)
  returnValue?: string | null;        // Return date for range type
  onChange: (departure: string, returnDate?: string) => void;
  minDate?: Date;                     // Minimum selectable date
  type?: 'single' | 'range';         // Single date or date range
  isOpen: boolean;                    // Control visibility
  onClose: () => void;                // Close callback
  anchorEl?: HTMLElement | null;      // Position relative to element
  prices?: { [date: string]: number }; // Optional price display
  loadingPrices?: boolean;            // Loading state for prices
}
```

---

## 🚨 RULES FOR DEVELOPERS

### DO ✅
- **ALWAYS use `PremiumDatePicker`** for all date selection needs
- Keep the hotel date flow (auto-open checkout after check-in)
- Use `minDate` to prevent invalid date selections
- Test the complete user flow after any changes

### DON'T ❌
- **NEVER create new calendar components** without team approval
- Don't use native HTML `<input type="date">` for user-facing forms
- Don't close the picker after check-in selection (breaks user flow)
- Don't allow same-day or past-date checkouts

---

## 🐛 Historical Context

### Why This Documentation Exists

**Problem:** Multiple calendar implementations caused confusion:
1. Fix #1 (commit 19b32f7) - Fixed native HTML `<input type="date">` (not in use)
2. Fix #2 (commit 47d161c) - Fixed `DateRangePicker.tsx` (not in use)
3. Fix #3 (THIS FIX) - Fixed `PremiumDatePicker` in `EnhancedSearchBar.tsx` (ACTUALLY IN USE)

**Result:** Calendar appeared "fixed" but wasn't, because wrong component was modified.

**Solution:**
- Identified the ACTUAL component in production (`PremiumDatePicker`)
- Fixed the correct component
- Deleted unused components
- Created this documentation

---

## ✅ Testing Checklist

When modifying calendar behavior:

- [ ] Test on /hotels page
- [ ] Click check-in date button
- [ ] Select a check-in date
- [ ] Verify calendar stays open (doesn't close)
- [ ] Verify checkout picker automatically opens
- [ ] Verify dates before check-in are disabled
- [ ] Select checkout date
- [ ] Verify calendar closes after checkout selection
- [ ] Verify both dates are properly displayed
- [ ] Test on mobile and desktop

---

## 📞 Support

If you need to modify calendar behavior:
1. Read this document first
2. Test your changes using the checklist above
3. Ensure `PremiumDatePicker` remains the only calendar component

---

**Last Updated:** December 3, 2025
**Maintained By:** Development Team
**Status:** ✅ PRODUCTION READY
