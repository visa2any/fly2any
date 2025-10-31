# Clear Cache Instructions

## Issue
After updating the flight source field from 'Amadeus' to 'GDS', the sessionStorage cache still contains old flight data, preventing the upselling API from returning multiple fare families.

## Quick Fix (User)

### Option 1: Clear SessionStorage in Browser
1. Open Developer Tools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Expand "Session Storage" in left sidebar
4. Click on "http://localhost:3000"
5. Click "Clear All" button
6. Refresh the page
7. Do a new flight search

### Option 2: Use Browser Console
1. Open Developer Tools (F12)
2. Go to "Console" tab
3. Type: `sessionStorage.clear()`
4. Press Enter
5. Refresh and search again

### Option 3: Hard Refresh
1. Close all tabs with localhost:3000
2. Open a new tab
3. Go to http://localhost:3000
4. Search for flights (new data will have source='GDS')

## Verification
After clearing cache and searching for flights, check the logs for:
```
✅ Found X real fare families from Amadeus
```
Where X should be > 1 (typically 2-4 fare options)

## Developer Note
The source field has been updated in lib/api/amadeus.ts:240 to use 'GDS' instead of 'Amadeus'.
