# Hotel Destination Suggestions - Diagnostic & Fix Guide

## System Status: ✅ FUNCTIONAL

The hotel destination suggestion system is **fully operational**. The API and frontend code are working correctly.

## Quick Fix Steps

### 1. Hard Refresh Browser
```
Chrome/Edge: Ctrl + Shift + R (or Ctrl + F5)
Firefox: Ctrl + Shift + R
Safari: Cmd + Shift + R
```

### 2. Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### 3. Verify Dev Server is Running
```bash
# Should show: ✓ Ready on http://localhost:3000
npm run dev
```

### 4. Test API Directly
```bash
# Test from command line:
curl "http://localhost:3000/api/hotels/suggestions?query=paris"

# Should return JSON with Paris suggestions
```

### 5. Open Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Navigate to `/hotels` page
4. Type in hotel destination input
5. You should see debug logs like:
   ```
   ⌨️ Input onChange event: p
   🎯 handleHotelDestinationChange called with: p
   ⏱️ Setting debounce timer (300ms)...
   ```

## Expected Behavior

When you type in the hotel destination field:

1. **After 2 characters**: API call triggers (300ms debounce)
2. **Loading state**: Spinner appears in dropdown
3. **Results appear**: Suggestions dropdown shows with emojis
4. **Click suggestion**: Sets destination and coordinates

## Debug Mode

The component has extensive logging. Open console and type a city name to see:

```
Console Output:
⌨️ Input onChange event: paris
🎯 handleHotelDestinationChange called with: paris
⏱️ Setting debounce timer (300ms)...
⏰ Debounce timer fired, calling fetchHotelSuggestions
⏳ Loading hotel suggestions...
📡 Fetching from: /api/hotels/suggestions?query=paris
✅ API Response: {success: true, data: Array(3)}
✅ Setting suggestions: Array(3)
✅ Loading complete
🔄 Hotel suggestions state changed: {suggestions: Array(3), count: 3, showDropdown: true, loading: false}
```

## Component Location

The hotel search is in: `components/flights/EnhancedSearchBar.tsx`

**Lines to check:**
- State: Line 203 (`hotelSuggestions`)
- API Call: Line 798 (`/api/hotels/suggestions`)
- Input Handler: Line 1611 (`handleHotelDestinationChange`)

## API Endpoints

**Suggestions API:**
```
GET /api/hotels/suggestions?query=paris
GET /api/hotels/suggestions?popular=true
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "par",
      "name": "Paris",
      "city": "Paris",
      "country": "France",
      "location": { "lat": 48.8566, "lng": 2.3522 },
      "type": "city",
      "emoji": "🥐"
    }
  ],
  "meta": {
    "count": 3,
    "query": "paris"
  }
}
```

## Known Issues & Solutions

### Issue: No dropdown appears
**Fix**: Check if `serviceType === 'hotels'` tab is active

### Issue: Dropdown empty
**Fix**: API may be returning no results - check console for error logs

### Issue: Dropdown closes immediately
**Fix**: Click inside the input field, not outside

### Issue: API returns 404
**Fix**: Ensure dev server is running and route exists at `/app/api/hotels/suggestions/route.ts`

## Testing Checklist

- [ ] Dev server running on port 3000
- [ ] Browser cache cleared
- [ ] Console shows debug logs when typing
- [ ] API returns valid JSON (test with curl)
- [ ] Hotels tab is selected in search bar
- [ ] No ad blockers interfering with requests
- [ ] No JavaScript errors in console

## File Locations

- **API Route**: `app/api/hotels/suggestions/route.ts`
- **Frontend Component**: `components/flights/EnhancedSearchBar.tsx`
- **City Database**: Lines 34-203 in suggestions route (200+ cities)

## Support

If issue persists after following all steps:

1. Check console for error messages
2. Verify network tab shows 200 OK for `/api/hotels/suggestions`
3. Test with different browsers
4. Disable browser extensions
5. Check if firewall/antivirus is blocking requests

---

**Last Updated**: 2025-11-28
**Status**: System Operational ✅
