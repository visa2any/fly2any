# Testing Guide: AI Flight Search Integration

## Quick Start

### 1. Open the AI Assistant
- Navigate to any page on the site
- Click the AI Assistant button (bottom right corner)
- The chatbot will open with Sarah Chen greeting you

### 2. Try Flight Search Queries

#### Example Queries (English):
```
"I need a flight from NYC to Dubai on November 15"
"Find me a flight from London to Paris tomorrow"
"Show me flights from Miami to Tokyo next week"
"Business class from Dubai to Singapore on January 5"
"Cheap flights from LA to Las Vegas in December"
```

#### Example Queries (Portuguese):
```
"Preciso de um voo de São Paulo para Lisboa em 15 de novembro"
"Encontre-me um voo de Rio para Madrid amanhã"
```

#### Example Queries (Spanish):
```
"Necesito un vuelo de Madrid a Nueva York el 15 de noviembre"
"Busca vuelos de Barcelona a Roma mañana"
```

### 3. Expected Behavior

1. **Instant Response**:
   - Sarah responds: "I'll search for flights for you right away..."

2. **Loading State**:
   - Plane icon animates
   - "Searching flights... Finding best options..." appears

3. **Results Displayed**:
   - Sarah says: "I found these great options for you:"
   - 3 flight cards appear with detailed info
   - "See More Flights →" button appears

4. **Follow-up Message**:
   - Sarah asks: "Would you like to proceed with booking?"

### 4. Interaction Testing

#### Select a Flight:
- Click "Select Flight →" button on any card
- Should navigate to `/flights/results?flightId={id}`

#### See More Flights:
- Click "See More Flights →" button
- Should navigate to `/flights/results`

#### Modify Search:
- Type a new query with different parameters
- Should trigger a new search

## Edge Cases to Test

### 1. Missing Information
**Query**: "I need a flight"
**Expected**: Sarah asks for origin, destination, and dates

### 2. Invalid Location
**Query**: "Flight from XYZ to ABC"
**Expected**: Results with best-guess airports or error message

### 3. Past Date
**Query**: "Flight from NYC to Dubai on January 1, 2020"
**Expected**: API should auto-adjust to next available date

### 4. API Error
**Simulate**: Network disconnection
**Expected**: Error message with retry suggestion

### 5. No Results
**Query**: "Flight from NYC to a non-existent city"
**Expected**: "I couldn't find flights..." message

## Visual Checks

### FlightResultCard Components:
- ✅ Airline name and logo display correctly
- ✅ Flight number shows without prefix duplication
- ✅ Departure/arrival times formatted correctly (12-hour)
- ✅ Airport codes are correct
- ✅ Duration displays in "Xh Xm" format
- ✅ Stops badge shows correct color (green=direct, orange=stops)
- ✅ Price is prominent and clear
- ✅ Cabin class badge shows correct color
- ✅ Baggage icons and text are clear
- ✅ "Select Flight" button is prominent
- ✅ Card borders and hover effects work

### Loading States:
- ✅ Typing indicator animates smoothly
- ✅ Flight search spinner appears
- ✅ Loading messages are clear
- ✅ Transitions are smooth

### Mobile Responsiveness:
- ✅ Cards fit within chat window
- ✅ Text is readable on small screens
- ✅ Buttons are easily tappable
- ✅ No horizontal scrolling

## Quick Actions Testing

### English Version:
1. Click "Flight from NYC to Dubai on Nov 15"
2. Should auto-populate input and trigger search

### Portuguese Version:
1. Change language to Portuguese
2. Click quick action
3. Should trigger search in Portuguese

### Spanish Version:
1. Change language to Spanish
2. Click quick action
3. Should trigger search in Spanish

## Error Handling Tests

### 1. Network Error
```
Disconnect internet → Send query → Check error message
```

### 2. API Timeout
```
Simulate slow connection → Verify timeout handling
```

### 3. Invalid JSON Response
```
Check error handling for malformed API responses
```

### 4. Empty Results
```
Query unlikely route → Verify graceful handling
```

## Performance Tests

### Speed Checks:
- ⚡ Search triggered within 100ms of Enter press
- ⚡ Loading state appears immediately
- ⚡ API response within 2 seconds (mock data)
- ⚡ Cards render within 500ms of data arrival

### Memory Leaks:
- Open/close chat multiple times
- Perform multiple searches
- Check for memory growth in DevTools

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Accessibility Tests

### Keyboard Navigation:
- Tab through flight cards
- Press Enter to select flight
- Escape to close modals

### Screen Reader:
- ARIA labels present
- Alt text for icons
- Semantic HTML structure

### Color Contrast:
- Text readable at all sizes
- Sufficient contrast ratios
- Colorblind-friendly badges

## Integration Tests

### 1. Full Booking Flow:
```
1. Search for flight in AI chat
2. Select a flight
3. Navigate to booking page
4. Verify flight data is preserved
5. Complete booking
```

### 2. Multi-Language Flow:
```
1. Start in English
2. Search for flight
3. Switch to Portuguese
4. Continue interaction
5. Verify translations
```

### 3. Progressive Engagement:
```
1. Use AI assistant (no auth)
2. Search multiple times
3. Check for auth prompts
4. Verify timing of prompts
```

## Console Checks

### Should NOT See:
- ❌ React errors
- ❌ TypeScript errors
- ❌ Network errors (except expected)
- ❌ Missing dependencies warnings

### Should See (in dev mode):
- ✅ Flight search API calls logged
- ✅ Intent detection debug info
- ✅ Message state updates

## Regression Tests

After each update, verify:
- ✅ Other consultant types still work (hotels, payments, etc.)
- ✅ Auth prompts still trigger correctly
- ✅ Quick actions for other topics still work
- ✅ Contact support buttons still work
- ✅ Minimize/maximize chat still works

## Known Issues to Watch For

1. **Double API Calls**: Ensure search isn't triggered twice
2. **Memory Leaks**: Check for retained message references
3. **Race Conditions**: Multiple rapid searches
4. **State Persistence**: Chat state after page reload

## Success Criteria

The feature is working correctly if:
- ✅ Flight searches complete in < 3 seconds
- ✅ All 3 flight cards render correctly
- ✅ No console errors appear
- ✅ Mobile experience is smooth
- ✅ Error states are handled gracefully
- ✅ Translations work in all languages
- ✅ Navigation to booking page works
- ✅ Loading states are clear and smooth

## Troubleshooting

### Issue: Search doesn't trigger
**Check**: Intent detection keywords present?
**Fix**: Add more location/date keywords to query

### Issue: No results displayed
**Check**: API response structure correct?
**Fix**: Verify `/api/ai/search-flights` returns expected format

### Issue: Cards look broken
**Check**: CSS classes loaded?
**Fix**: Clear cache, rebuild Tailwind

### Issue: Navigation fails
**Check**: React Router working?
**Fix**: Verify Next.js routing setup

## Test Reports

Document results in this format:

```
Date: 2025-11-04
Tester: [Name]
Browser: Chrome 120
Device: Desktop / Mobile

Query Tested: "Flight from NYC to Dubai on Nov 15"
✅ Intent detected correctly
✅ Loading state appeared
✅ 3 flights displayed
✅ Select button worked
✅ Navigation successful

Issues Found: None

Performance: 1.2s total time
```

---

**Testing Status**: Ready for QA
**Last Updated**: 2025-11-04
**Version**: 1.0.0
