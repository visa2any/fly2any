# User Journey Test Documentation

## Table of Contents
1. [Complete User Flow](#complete-user-flow)
2. [Test Scenarios](#test-scenarios)
3. [Integration Points Checklist](#integration-points-checklist)
4. [Manual Testing Steps](#manual-testing-steps)
5. [Automated Test Plan](#automated-test-plan)

---

## 1. Complete User Flow

### Journey Overview: Homepage to Booking

#### Step 1: Homepage (/)
**Location:** `C:\Users\Power\fly2any-fresh\app\page.tsx`

**Visual Description:**
- Gradient blue background with animated elements
- Fly2Any logo (max-width: 125px mobile, 160px desktop)
- Language switcher (EN/PT/ES) in top-right
- Service cards grid (3 columns on desktop):
  - Flights (clickable, links to `/flights`)
  - Hotels (clickable, links to `/hotels`)
  - Car Rentals, Tours, Insurance (disabled, opacity 60%)
- WhatsApp contact button (+55 11 5194-4717)
- Phone contact button (+1 315-306-1646)
- Email: fly2any.travel@gmail.com

**Expected Behavior:**
- Page loads with smooth animations
- Language can be switched between EN, PT, ES
- Clicking "Flights" card navigates to `/flights`
- Clicking "Hotels" card navigates to `/hotels`
- All contact methods are functional
- Responsive design adjusts properly on mobile/tablet/desktop

**Screenshot Points:**
- Full page desktop view
- Mobile view showing stacked layout
- Language switcher interaction
- Service cards hover states

---

#### Step 2: Flights Search Page (/flights)
**Location:** `C:\Users\Power\fly2any-fresh\app\flights\page.tsx`

**Visual Description:**
- Header with Fly2Any logo and language switcher
- Hero section: "Find Your Perfect Flight" title
- Search form in white rounded card with:
  - Trip type toggle: Round Trip / One Way
  - Origin airport field with autocomplete
  - Destination airport field with autocomplete
  - Departure date picker
  - Return date picker (conditional on Round Trip)
  - Passengers section (Adults, Children, Infants)
  - Travel class dropdown (Economy, Premium Economy, Business, First)
  - Direct flights checkbox
  - Large blue search button with airplane emoji

**Expected Behavior:**
- Logo click returns to homepage
- Language switcher updates all text
- Trip type toggle shows/hides return date field
- Airport autocomplete provides suggestions as you type
- Date pickers prevent past date selection
- Passenger counters enforce min/max limits (1-9)
- Direct flights checkbox toggles state
- Form validation prevents submission with missing fields
- Search button navigates to results with query parameters

**Form Fields:**
- `origin`: Airport code (e.g., JFK)
- `destination`: Airport code (e.g., LAX)
- `departure`: Date in YYYY-MM-DD format
- `return`: Date in YYYY-MM-DD format (optional)
- `adults`: Number 1-9
- `children`: Number 0-9
- `infants`: Number 0-9
- `class`: ECONOMY | PREMIUM_ECONOMY | BUSINESS | FIRST
- `directFlights`: Boolean

**Validation Rules:**
1. Origin is required
2. Destination is required
3. Departure date is required and must be in future
4. Return date required for round trip and must be after departure
5. At least 1 adult required
6. All passenger counts must be 0-9

**Error Messages (EN):**
- "Please select an origin airport"
- "Please select a destination airport"
- "Please select a departure date"
- "Departure date must be in the future"
- "Please select a return date for round trip"
- "Return date must be after departure date"

**Screenshot Points:**
- Empty form (initial state)
- Form with Round Trip selected
- Form with One Way selected
- Airport autocomplete in action
- Passenger counter interface
- Validation error states
- Filled form ready to submit

---

#### Step 3: Flight Results Page (/flights/results)
**Location:** `C:\Users\Power\fly2any-fresh\app\flights\results\page.tsx`

**Visual Description:**
Three-column layout (desktop):
- **Left Sidebar (col-span-3):** Filters panel (sticky)
- **Main Content (col-span-7):** Flight cards list
- **Right Sidebar (col-span-2):** Price insights (sticky)

**Top Section:**
- Search Summary Bar (sticky at top)
  - Shows: Origin → Destination
  - Departure date, return date
  - Passenger count
  - Cabin class
  - "Modify Search" button

**Filters Panel (Left Sidebar):**
- Price range slider
- Stops filter (Direct, 1-stop, 2+ stops)
- Airlines multi-select checkboxes
- Departure time categories (Morning, Afternoon, Evening, Night)
- Max duration slider
- "Clear All Filters" button

**Sort Bar:**
- Best (default - AI scored)
- Cheapest
- Fastest
- Earliest Departure

**Flight Cards:**
Each card displays:
- Outbound journey:
  - Departure airport and time
  - Arrival airport and time
  - Duration
  - Number of stops
  - Airline name and code
- Inbound journey (if round trip)
- Total price with currency
- Badges (e.g., "Best Value", "Fastest", "Most Popular")
- "Select" button
- "View Details" link

**Price Insights Panel (Right Sidebar):**
- Current price vs average
- Price trend (rising/falling with percentage)
- 30-day price history chart
- Lowest/highest prices
- Recommendation ("Good time to book" or "Prices rising")

**Loading States:**
- Initial load: Full page skeleton
- Filters skeleton
- Multiple flight card skeletons
- Price insights skeleton

**Expected Behavior:**
- Query parameters from search form populate API call
- API call to `/api/flights/search` with POST method
- Loading state shows skeletons
- Results display with AI scoring
- Filters work in real-time (client-side filtering)
- Sort changes re-order results instantly
- "Load More" button shows 10 more flights
- "Modify Search" returns to search page
- "Select Flight" logs flight ID (future: navigate to booking)
- "View Details" expands flight information
- Mobile view shows filters as bottom sheet
- Price insights toggleable on mobile
- Responsive grid collapses to single column on mobile

**API Request Format:**
```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-11-15",
  "returnDate": "2025-11-22",
  "adults": 2,
  "children": 0,
  "infants": 0,
  "travelClass": "ECONOMY",
  "currencyCode": "USD",
  "max": 50
}
```

**API Response Format:**
```json
{
  "flights": [...],
  "metadata": {
    "total": 25,
    "searchParams": {...},
    "sortedBy": "best",
    "dictionaries": {...},
    "timestamp": "2025-10-03T..."
  }
}
```

**Screenshot Points:**
- Full results page (desktop 3-column layout)
- Search summary bar
- Filter panel with all options
- Sort bar with different selections
- Flight card expanded view
- Price insights panel
- Loading skeletons
- Mobile single-column view
- Mobile filter bottom sheet
- No results state
- Error state

---

## 2. Test Scenarios

### Scenario 1: Simple Round Trip Search (JFK → LAX)

**Test Case ID:** TC-001

**Objective:** Verify basic round trip flight search functionality

**Prerequisites:**
- Application is running
- Homepage is accessible
- Today's date: 2025-10-03

**Test Data:**
- Origin: JFK (New York)
- Destination: LAX (Los Angeles)
- Departure: 2025-11-15
- Return: 2025-11-22
- Passengers: 2 Adults
- Class: Economy
- Direct flights: No

**Step-by-Step Execution:**

1. Navigate to homepage (/)
   - **Expected:** Homepage loads with all elements visible

2. Click on "Flights" service card
   - **Expected:** Navigate to `/flights` page

3. Verify Round Trip is selected by default
   - **Expected:** Round Trip button is highlighted (blue background)

4. Select origin airport
   - Input "JFK" or "New York"
   - **Expected:** Autocomplete shows JFK - John F. Kennedy International
   - Click on suggestion
   - **Expected:** Field populated with "JFK"

5. Select destination airport
   - Input "LAX" or "Los Angeles"
   - **Expected:** Autocomplete shows LAX - Los Angeles International
   - Click on suggestion
   - **Expected:** Field populated with "LAX"

6. Set departure date
   - Click departure date field
   - Select November 15, 2025
   - **Expected:** Date field shows "2025-11-15"

7. Set return date
   - Click return date field
   - Select November 22, 2025
   - **Expected:** Date field shows "2025-11-22"

8. Set passengers
   - Click adults input
   - Change value to 2
   - **Expected:** Adults field shows "2"
   - **Expected:** Children and Infants remain "0"

9. Verify travel class
   - **Expected:** "Economy" is selected by default

10. Click "Search Flights" button
    - **Expected:** Browser navigates to `/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=2&children=0&infants=0&class=economy`

11. Verify results page loads
    - **Expected:** Loading skeleton appears
    - **Expected:** API call to `/api/flights/search` is triggered
    - **Expected:** Search summary bar shows: "JFK → LAX, Nov 15 - Nov 22, 2 Adults, Economy"

12. Wait for results to load
    - **Expected:** Flight cards appear
    - **Expected:** At least 1 flight result (or "No flights found" message)
    - **Expected:** Filters panel shows available options
    - **Expected:** Price insights panel shows statistics

13. Verify flight card content
    - **Expected:** Each card shows outbound and inbound journeys
    - **Expected:** Price is displayed
    - **Expected:** "Select" button is visible
    - **Expected:** Airline information is shown

14. Test sort functionality
    - Click "Cheapest" sort option
    - **Expected:** Flights re-order by price (lowest first)

15. Test filter functionality
    - Check "Direct" in stops filter
    - **Expected:** Only direct flights displayed (or "No flights match" if none available)

**Expected Results:**
- ✅ Search completes successfully
- ✅ Results page displays flight options
- ✅ All UI elements render correctly
- ✅ Filters and sort work as expected

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes/Bugs:** [Record any issues found]

---

### Scenario 2: One-Way Search (MIA → NYC)

**Test Case ID:** TC-002

**Objective:** Verify one-way flight search with mixed passenger types

**Test Data:**
- Trip Type: One Way
- Origin: MIA (Miami)
- Destination: NYC (New York - any airport)
- Departure: 2025-12-01
- Passengers: 1 Adult, 1 Child
- Class: Business
- Direct flights: Yes

**Step-by-Step Execution:**

1. Navigate to `/flights` page
   - **Expected:** Search form loads

2. Click "One Way" trip type button
   - **Expected:** One Way button becomes highlighted
   - **Expected:** Return date field disappears

3. Enter origin "MIA"
   - **Expected:** Autocomplete shows Miami International Airport
   - Select MIA
   - **Expected:** Field shows "MIA"

4. Enter destination "NYC"
   - **Expected:** Autocomplete shows NYC airports (JFK, LGA, EWR)
   - Select any NYC airport (e.g., JFK)
   - **Expected:** Field shows selected airport code

5. Set departure date: December 1, 2025
   - **Expected:** Date field updates

6. Set passengers
   - Adults: 1
   - Children: 1
   - Infants: 0
   - **Expected:** Fields update correctly

7. Change travel class to "Business"
   - **Expected:** Dropdown shows "Business" selected

8. Check "Direct flights only" checkbox
   - **Expected:** Checkbox is checked

9. Click "Search Flights"
   - **Expected:** Navigate to results with query parameters
   - **Expected:** URL includes `return` as undefined or absent
   - **Expected:** URL includes `class=business`

10. Verify results
    - **Expected:** Only one-way flights displayed (no return journey on cards)
    - **Expected:** Only direct flights shown (0 stops)
    - **Expected:** Business class flights only

**Expected Results:**
- ✅ One-way search works correctly
- ✅ Return date field properly hidden
- ✅ Mixed passenger types handled correctly
- ✅ Direct flights filter applied during search
- ✅ Business class flights displayed

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Scenario 3: Multi-Passenger Search (LAX → LHR)

**Test Case ID:** TC-003

**Objective:** Verify pricing and display for multiple passenger types including infants

**Test Data:**
- Trip Type: Round Trip
- Origin: LAX (Los Angeles)
- Destination: LHR (London Heathrow)
- Departure: 2026-06-15
- Return: 2026-06-30
- Passengers: 2 Adults, 2 Children, 1 Infant
- Class: Economy

**Step-by-Step Execution:**

1. Navigate to `/flights` page

2. Select Round Trip (default)

3. Enter LAX as origin
   - **Expected:** Los Angeles International selected

4. Enter LHR as destination
   - **Expected:** London Heathrow selected

5. Set dates
   - Departure: June 15, 2026
   - Return: June 30, 2026

6. Set passengers
   - Adults: 2
   - Children: 2
   - Infants: 1
   - **Expected:** All fields update

7. Keep Economy class selected

8. Search flights
   - **Expected:** Navigate to results
   - **Expected:** URL: `...&adults=2&children=2&infants=1...`

9. Verify API request
   - **Expected:** POST to `/api/flights/search` includes:
     ```json
     {
       "adults": 2,
       "children": 2,
       "infants": 1
     }
     ```

10. Verify results display
    - **Expected:** Flight prices reflect total for all passengers
    - **Expected:** Search summary shows "2 Adults, 2 Children, 1 Infant"

11. Check individual flight card
    - **Expected:** Price is total for all 5 passengers
    - **Expected:** Flight details account for all passengers

12. Test edge case: Try to add more infants than adults
    - Change Adults to 1, Infants to 2
    - **Expected:** Validation error (infants cannot exceed adults)

**Expected Results:**
- ✅ All passenger types correctly submitted
- ✅ Pricing reflects total passenger count
- ✅ Search summary displays all passenger types
- ✅ Validation prevents invalid passenger combinations

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Scenario 4: Direct Flights Filter (SFO → SEA)

**Test Case ID:** TC-004

**Objective:** Verify direct flights only filter functionality

**Test Data:**
- Trip Type: Round Trip
- Origin: SFO (San Francisco)
- Destination: SEA (Seattle)
- Departure: 2025-11-20
- Return: 2025-11-23
- Passengers: 1 Adult
- Class: Economy
- Direct flights: Yes

**Step-by-Step Execution:**

1. Navigate to `/flights` page

2. Enter search criteria as above

3. Check "Direct flights only" checkbox
   - **Expected:** Checkbox is checked

4. Click Search
   - **Expected:** Navigate to results

5. Verify API request
   - **Expected:** Request includes `"nonStop": true`

6. Check results
   - **Expected:** All flight cards show "0 stops" or "Direct" badge
   - **Expected:** No connecting flights displayed

7. Open filters panel
   - Click on stops filter
   - **Expected:** Can further filter if needed

8. Test filter removal on results page
   - Uncheck "Direct" in stops filter
   - Check "1-stop"
   - **Expected:** Results now show 1-stop flights
   - **Expected:** Direct flights still visible

9. Test "Clear All Filters" button
   - **Expected:** All filters reset
   - **Expected:** All available flights displayed

**Expected Results:**
- ✅ Direct flights filter applied correctly from search
- ✅ Only non-stop flights shown initially
- ✅ Filters on results page work independently
- ✅ Clear filters functionality works

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Scenario 5: Error Handling & Validation

**Test Case ID:** TC-005

**Objective:** Verify proper error handling and validation messages

**Sub-Test 5.1: Missing Required Fields**

1. Navigate to `/flights` page

2. Leave origin field empty

3. Click "Search Flights"
   - **Expected:** Error message: "Please select an origin airport"
   - **Expected:** Form does not submit
   - **Expected:** No navigation occurs

4. Fill origin (JFK)

5. Leave destination empty

6. Click "Search Flights"
   - **Expected:** Error message: "Please select a destination airport"
   - **Expected:** Form does not submit

**Sub-Test 5.2: Invalid Dates**

1. Navigate to `/flights` page

2. Fill origin and destination

3. Try to select a past date (e.g., yesterday)
   - **Expected:** Date picker prevents past date selection OR
   - **Expected:** Error message on submit: "Departure date must be in the future"

4. Set valid departure date

5. Set return date before departure date
   - **Expected:** Error message: "Return date must be after departure date"
   - **Expected:** Form does not submit

**Sub-Test 5.3: API Error Handling**

1. Simulate API failure (disconnect network or use invalid airport code)

2. Submit search form
   - **Expected:** Results page loads
   - **Expected:** Loading state appears
   - **Expected:** After timeout, error state displays
   - **Expected:** Error message: "Error loading flights"
   - **Expected:** Description: "We encountered an issue while searching for flights. Please try again."
   - **Expected:** "Retry Search" button visible

3. Click "Retry Search"
   - **Expected:** Page reloads and attempts search again

**Sub-Test 5.4: No Results Found**

1. Search for obscure route with no flights (e.g., small regional airports)

2. Verify results page
   - **Expected:** "No flights found" message displays
   - **Expected:** Description: "We couldn't find any flights matching your search criteria..."
   - **Expected:** "Modify Search" button available

3. Click "Modify Search"
   - **Expected:** Return to `/flights` page (or homepage)

**Expected Results:**
- ✅ All required field validations work
- ✅ Date validations prevent invalid dates
- ✅ Past dates cannot be selected
- ✅ Return date must be after departure
- ✅ Error messages are clear and helpful
- ✅ No navigation occurs when validation fails
- ✅ API errors handled gracefully
- ✅ Retry functionality works
- ✅ No results state displays properly

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

## 3. Integration Points Checklist

### Page Navigation Integration

- [ ] **Homepage → Flights Page**
  - [ ] Flights service card is clickable
  - [ ] Click navigates to `/flights`
  - [ ] No console errors during navigation
  - [ ] Page loads completely

- [ ] **Homepage → Hotels Page**
  - [ ] Hotels service card is clickable
  - [ ] Click navigates to `/hotels`
  - [ ] Page loads correctly

- [ ] **Flights Logo → Homepage**
  - [ ] Logo in header is clickable
  - [ ] Click returns to `/` (homepage)
  - [ ] Navigation is instant

- [ ] **Results Page → Modify Search**
  - [ ] "Modify Search" button in search summary bar works
  - [ ] Click navigates to `/` or `/flights`
  - [ ] User can start new search

---

### Search Form Integration

- [ ] **Form State Management**
  - [ ] All form fields maintain state
  - [ ] Trip type toggle updates UI (shows/hides return date)
  - [ ] Passenger counters increment/decrement correctly
  - [ ] Travel class dropdown updates
  - [ ] Direct flights checkbox toggles
  - [ ] Language switcher updates all text

- [ ] **Airport Autocomplete**
  - [ ] Origin field triggers autocomplete
  - [ ] Destination field triggers autocomplete
  - [ ] Autocomplete fetches from `/api/flights/airports`
  - [ ] Suggestions display as user types
  - [ ] Clicking suggestion populates field
  - [ ] Airport code is stored (e.g., "JFK")

- [ ] **Date Pickers**
  - [ ] Departure date picker opens
  - [ ] Return date picker opens (when round trip)
  - [ ] Past dates are disabled
  - [ ] Selected dates update field values
  - [ ] Date format is YYYY-MM-DD

- [ ] **Form Validation**
  - [ ] Required field validation triggers
  - [ ] Error messages display inline
  - [ ] Error messages are language-specific
  - [ ] Validation prevents form submission
  - [ ] Valid form allows submission

- [ ] **Form Submission**
  - [ ] Search button triggers submission
  - [ ] Form data is collected correctly
  - [ ] Query parameters are built
  - [ ] Navigation to results page occurs
  - [ ] Query string is correct format

---

### Results Page Integration

- [ ] **Query Parameter Parsing**
  - [ ] URL search params are extracted
  - [ ] All parameters are parsed correctly
  - [ ] Missing optional params default properly
  - [ ] Invalid params are handled

- [ ] **Search Summary Bar**
  - [ ] Origin airport code displays
  - [ ] Destination airport code displays
  - [ ] Departure date displays formatted
  - [ ] Return date displays (if round trip)
  - [ ] Passenger count displays correctly
  - [ ] Cabin class displays
  - [ ] Summary bar is sticky on scroll

- [ ] **API Integration**
  - [ ] POST request sent to `/api/flights/search`
  - [ ] Request body includes all search params
  - [ ] Request headers include Content-Type: application/json
  - [ ] Response is received
  - [ ] Response is valid JSON
  - [ ] Response includes `flights` array
  - [ ] Response includes `metadata` object

- [ ] **Loading States**
  - [ ] Loading skeleton displays immediately
  - [ ] Skeleton matches final layout (3-column)
  - [ ] Filter skeleton shows
  - [ ] Flight card skeletons show (6 cards)
  - [ ] Price insights skeleton shows
  - [ ] Loading state clears when data arrives

- [ ] **Data Display**
  - [ ] Flight data populates cards
  - [ ] All flight details render correctly
  - [ ] Prices display with currency
  - [ ] Badges display on cards
  - [ ] Outbound journey shows
  - [ ] Inbound journey shows (if round trip)
  - [ ] Airlines display correctly
  - [ ] Departure/arrival times format correctly

---

### Filter & Sort Integration

- [ ] **Filter Panel**
  - [ ] Filter panel is sticky on desktop
  - [ ] Price range slider works
  - [ ] Min and max prices set from results
  - [ ] Stops checkboxes toggle
  - [ ] Airlines checkboxes toggle
  - [ ] Departure time filters work
  - [ ] Max duration slider works
  - [ ] Filters apply to results in real-time
  - [ ] Flight count updates as filters change
  - [ ] "Clear All Filters" resets everything

- [ ] **Sort Bar**
  - [ ] Sort options display (Best, Cheapest, Fastest, Earliest)
  - [ ] Current sort is highlighted
  - [ ] Clicking sort option re-orders results
  - [ ] Result count displays correctly
  - [ ] Sort is instant (no API call)

- [ ] **Filter Logic**
  - [ ] Price filter excludes flights outside range
  - [ ] Stops filter shows only selected stop counts
  - [ ] Airline filter shows only selected airlines
  - [ ] Departure time filter works by time category
  - [ ] Duration filter excludes long flights
  - [ ] Multiple filters combine (AND logic)

- [ ] **Sort Logic**
  - [ ] "Best" sorts by AI score (highest first)
  - [ ] "Cheapest" sorts by price (lowest first)
  - [ ] "Fastest" sorts by duration (shortest first)
  - [ ] "Earliest" sorts by departure time (earliest first)

---

### Flight Card Integration

- [ ] **Card Display**
  - [ ] Each card renders completely
  - [ ] Card has proper spacing and layout
  - [ ] Hover effects work
  - [ ] Card is responsive on mobile

- [ ] **Card Content**
  - [ ] Outbound segment displays:
    - [ ] Origin airport and time
    - [ ] Destination airport and time
    - [ ] Duration
    - [ ] Stops count
    - [ ] Layover airports (if applicable)
  - [ ] Inbound segment displays (round trip)
  - [ ] Price displays prominently
  - [ ] Currency symbol shows
  - [ ] Airline name and code display
  - [ ] Badges appear (if applicable)

- [ ] **Card Actions**
  - [ ] "Select" button is visible
  - [ ] "Select" button is clickable
  - [ ] "Select" button logs flight ID (console)
  - [ ] "View Details" link is visible
  - [ ] "View Details" logs flight ID (console)
  - [ ] Future: Navigate to booking page

---

### Price Insights Integration

- [ ] **Insights Panel**
  - [ ] Panel is sticky on desktop
  - [ ] Panel toggles on mobile
  - [ ] Toggle button works

- [ ] **Statistics Display**
  - [ ] Current price shows
  - [ ] Average price shows
  - [ ] Lowest price shows
  - [ ] Highest price shows
  - [ ] Price comparison displays
  - [ ] Trend indicator shows (rising/falling)
  - [ ] Trend percentage displays

- [ ] **Price History**
  - [ ] 30-day price history chart renders
  - [ ] Chart shows price fluctuations
  - [ ] Chart is interactive (tooltips on hover)
  - [ ] Current price point is highlighted

- [ ] **Recommendations**
  - [ ] Recommendation text displays
  - [ ] "Good time to book" or "Prices rising" message
  - [ ] Recommendation is contextual to trend

---

### Pagination & Load More

- [ ] **Initial Load**
  - [ ] First 10 flights display
  - [ ] Result count shows "Showing 10 of X flights"

- [ ] **Load More Button**
  - [ ] Button appears if more than 10 results
  - [ ] Button text: "Load More Flights"
  - [ ] Clicking loads next 10 flights
  - [ ] Result count updates
  - [ ] Button hides when all results shown

---

### Error State Integration

- [ ] **No Results**
  - [ ] "No flights found" message displays
  - [ ] Description text explains situation
  - [ ] "Modify Search" button available
  - [ ] Button returns to search page

- [ ] **No Filtered Results**
  - [ ] Message: "No flights match your filters"
  - [ ] Description suggests adjusting filters
  - [ ] "Clear All Filters" button available
  - [ ] Button resets filters and shows all results

- [ ] **API Error**
  - [ ] Error message displays
  - [ ] Error icon shows
  - [ ] Description is helpful
  - [ ] "Retry Search" button available
  - [ ] Button reloads page and retries

---

### Responsive Design Integration

- [ ] **Mobile (< 768px)**
  - [ ] Single column layout
  - [ ] Filter panel becomes bottom sheet/modal
  - [ ] Price insights toggles with button
  - [ ] Search summary bar is responsive
  - [ ] Flight cards stack vertically
  - [ ] Touch targets are adequate size

- [ ] **Tablet (768px - 1024px)**
  - [ ] Two-column layout (filters + results)
  - [ ] Price insights may be hidden or toggled
  - [ ] All interactions work on touch

- [ ] **Desktop (> 1024px)**
  - [ ] Three-column layout (filters, results, insights)
  - [ ] All sidebars are sticky
  - [ ] Hover effects work
  - [ ] Maximum width: 1920px

---

### Language Support Integration

- [ ] **Language Switcher**
  - [ ] EN, PT, ES buttons visible
  - [ ] Current language is highlighted
  - [ ] Clicking changes language

- [ ] **Translation Coverage**
  - [ ] All static text translates
  - [ ] Error messages translate
  - [ ] Button labels translate
  - [ ] Date formats adjust per locale
  - [ ] Currency displays correctly

---

## 4. Manual Testing Steps

### Daily Smoke Test (10 minutes)

**Purpose:** Quick verification that critical paths work

1. **Homepage Test (2 min)**
   - Load homepage
   - Verify logo appears
   - Switch language to PT, then ES, then back to EN
   - Click Flights card

2. **Search Form Test (3 min)**
   - On /flights page, verify form loads
   - Select JFK → LAX
   - Set dates: 7 days from today, return 14 days from today
   - Keep defaults (1 adult, Economy)
   - Click Search

3. **Results Test (5 min)**
   - Verify results page loads
   - Check that search summary is correct
   - Verify at least 1 flight card appears
   - Click "Cheapest" sort
   - Verify flights re-order
   - Check one filter (e.g., Direct flights)
   - Verify filter applies
   - Clear filters
   - Click "Select" on first flight (check console log)

**Pass Criteria:** All steps complete without errors

---

### Weekly Regression Test (45 minutes)

**Purpose:** Comprehensive test of all features

**Week 1: Full Feature Test**

1. Run all 5 test scenarios (TC-001 through TC-005)
2. Document any failures
3. Take screenshots of any UI issues
4. Test all integration points from checklist

**Week 2: Cross-Browser Test**

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

For each browser:
1. Run smoke test
2. Check responsive design
3. Verify form submission
4. Check results display

**Week 3: Performance Test**

1. Measure page load times
   - Homepage: < 2 seconds
   - Flights page: < 2 seconds
   - Results page: < 3 seconds (excluding API)

2. Check API response times
   - Flight search: < 5 seconds typical

3. Test with throttled connection (3G)
   - Verify loading states show
   - Verify eventual completion

**Week 4: Accessibility Test**

1. Keyboard navigation
   - Tab through all form fields
   - Submit form with Enter key
   - Navigate results with keyboard

2. Screen reader test
   - Use NVDA or JAWS
   - Verify form labels are read
   - Verify flight cards are announced
   - Check error messages are announced

3. Color contrast check
   - Use browser dev tools
   - Verify WCAG AA compliance

---

### Pre-Release Test (2 hours)

**Checklist before deploying to production:**

- [ ] Run all 5 test scenarios with real API
- [ ] Test with real airport codes
- [ ] Verify real flight data displays correctly
- [ ] Test payment flow (when implemented)
- [ ] Check all links work (including external ones)
- [ ] Verify WhatsApp and phone links work
- [ ] Test email link
- [ ] Check logo displays on all pages
- [ ] Verify favicon appears
- [ ] Test 404 page
- [ ] Test error boundaries
- [ ] Check console for errors (should be 0)
- [ ] Verify no sensitive data in console
- [ ] Test with ad blockers enabled
- [ ] Test with browser extensions disabled
- [ ] Clear cache and test fresh load
- [ ] Test after deployment (staging environment)
- [ ] Verify environment variables are set correctly
- [ ] Check API keys are not exposed
- [ ] Test rate limiting (if implemented)
- [ ] Verify caching works (check headers)
- [ ] Test SEO meta tags
- [ ] Check Open Graph images
- [ ] Verify Google Analytics (if implemented)

---

### User Acceptance Testing (UAT) Script

**Participant Profile:** Non-technical user booking a flight

**Script:**

"Thank you for helping test our flight booking system. Please complete the following tasks while thinking aloud about your experience."

**Task 1: Find a round trip flight**
"Imagine you want to fly from New York (JFK) to Los Angeles (LAX) next month. Find a flight leaving on [specific date] and returning one week later. You're traveling alone in economy class."

**Observe:**
- Can they find the flights page?
- Do they understand the form?
- Do they successfully complete all fields?
- Do they encounter any confusion?
- Time to complete task

**Task 2: Find a one-way business class flight**
"Now find a one-way business class flight from Miami to New York for next week, for you and one child."

**Observe:**
- Can they switch to one-way?
- Do they notice return date disappears?
- Can they change class?
- Can they add a child passenger?

**Task 3: Use filters**
"On the results page, show me only direct flights that cost less than $500."

**Observe:**
- Can they find the filters?
- Do they understand how to use them?
- Do they see results update?

**Task 4: Sort and select**
"Show me the cheapest flight and select it."

**Observe:**
- Can they find the sort options?
- Do they understand sort worked?
- Can they click select?

**Questions:**
1. How would you rate the ease of use? (1-10)
2. Was anything confusing?
3. What did you like most?
4. What would you improve?
5. Would you use this to book a real flight?

---

## 5. Automated Test Plan (Future Implementation)

### Test Framework Setup

**Recommended Stack:**
- **E2E Testing:** Playwright
- **Component Testing:** Jest + React Testing Library
- **API Testing:** Supertest or Playwright API testing
- **Visual Regression:** Playwright screenshots + Percy/Chromatic
- **Performance:** Lighthouse CI

**Installation:**
```bash
npm install -D @playwright/test @testing-library/react @testing-library/jest-dom jest supertest
```

---

### E2E Test Cases (Playwright)

**File:** `tests/e2e/flight-search.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Flight Search Journey', () => {

  test('TC-001: Simple round trip search', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Fly2Any Travel');

    // Click flights card
    await page.click('a[href="/flights"]');
    await expect(page).toHaveURL('/flights');

    // Fill search form
    await page.fill('input[placeholder*="JFK"]', 'JFK');
    await page.click('text=JFK - John F. Kennedy'); // Autocomplete

    await page.fill('input[placeholder*="LAX"]', 'LAX');
    await page.click('text=LAX - Los Angeles');

    await page.fill('input[type="date"]', '2025-11-15');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-11-22');

    await page.fill('input[type="number"][value="1"]', '2'); // Adults

    // Submit search
    await page.click('button:has-text("Search Flights")');

    // Verify results page
    await expect(page).toHaveURL(/\/flights\/results/);
    await expect(page.locator('.search-summary')).toContainText('JFK → LAX');

    // Wait for results
    await page.waitForSelector('.flight-card', { timeout: 10000 });

    // Verify at least one result
    const flightCards = await page.locator('.flight-card').count();
    expect(flightCards).toBeGreaterThan(0);
  });

  test('TC-002: One-way search', async ({ page }) => {
    await page.goto('/flights');

    // Select one-way
    await page.click('button:has-text("One Way")');

    // Verify return date field is hidden
    await expect(page.locator('input[type="date"]').nth(1)).not.toBeVisible();

    // Fill form
    await page.fill('input[placeholder*="origin"]', 'MIA');
    await page.click('text=MIA - Miami');

    await page.fill('input[placeholder*="destination"]', 'JFK');
    await page.click('text=JFK - John F');

    await page.fill('input[type="date"]', '2025-12-01');

    // Set passengers
    await page.fill('input[aria-label="Adults"]', '1');
    await page.fill('input[aria-label="Children"]', '1');

    // Select business class
    await page.selectOption('select', 'BUSINESS');

    // Check direct flights
    await page.check('input[type="checkbox"]:has-text("Direct")');

    // Submit
    await page.click('button:has-text("Search")');

    // Verify URL
    await expect(page).toHaveURL(/class=business/);
    await expect(page.url()).not.toContain('return=');
  });

  test('TC-003: Multi-passenger search', async ({ page }) => {
    await page.goto('/flights');

    // Fill search
    await page.fill('input[placeholder*="origin"]', 'LAX');
    await page.click('text=LAX - Los Angeles');

    await page.fill('input[placeholder*="destination"]', 'LHR');
    await page.click('text=LHR - London Heathrow');

    await page.fill('input[type="date"]', '2026-06-15');
    await page.fill('input[type="date"]:nth-of-type(2)', '2026-06-30');

    // Set multiple passengers
    await page.fill('input[aria-label="Adults"]', '2');
    await page.fill('input[aria-label="Children"]', '2');
    await page.fill('input[aria-label="Infants"]', '1');

    await page.click('button:has-text("Search")');

    // Verify summary
    await expect(page.locator('.search-summary'))
      .toContainText('2 Adults, 2 Children, 1 Infant');
  });

  test('TC-004: Filter direct flights', async ({ page }) => {
    await page.goto('/flights');

    // Quick search
    await page.fill('input[placeholder*="origin"]', 'SFO');
    await page.click('text=SFO - San Francisco');

    await page.fill('input[placeholder*="destination"]', 'SEA');
    await page.click('text=SEA - Seattle');

    await page.fill('input[type="date"]', '2025-11-20');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-11-23');

    await page.check('input[type="checkbox"]:has-text("Direct")');

    await page.click('button:has-text("Search")');

    // Wait for results
    await page.waitForSelector('.flight-card');

    // Verify all flights are direct (0 stops)
    const stopTexts = await page.locator('.stops-count').allTextContents();
    for (const text of stopTexts) {
      expect(text).toContain('Direct');
    }
  });

  test('TC-005: Validation errors', async ({ page }) => {
    await page.goto('/flights');

    // Try to submit empty form
    await page.click('button:has-text("Search")');

    // Verify error message
    await expect(page.locator('.error-message'))
      .toContainText('Please select an origin airport');

    // Verify no navigation
    await expect(page).toHaveURL('/flights');

    // Fill origin only
    await page.fill('input[placeholder*="origin"]', 'JFK');
    await page.click('text=JFK - John F');

    await page.click('button:has-text("Search")');

    // Verify destination error
    await expect(page.locator('.error-message'))
      .toContainText('Please select a destination airport');
  });

  test('Sort and filter on results page', async ({ page }) => {
    // Assume we've navigated to results (use beforeEach for setup)
    await page.goto('/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy');

    await page.waitForSelector('.flight-card');

    // Test sort
    await page.click('button:has-text("Cheapest")');

    // Verify first flight is cheapest
    const prices = await page.locator('.flight-price').allTextContents();
    const priceNumbers = prices.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
    expect(priceNumbers[0]).toBeLessThanOrEqual(priceNumbers[1]);

    // Test filter
    await page.check('input[value="direct"]');

    // Verify results updated
    const flightCountBefore = await page.locator('.flight-card').count();
    const flightCountAfter = await page.locator('.flight-card').count();
    expect(flightCountAfter).toBeLessThanOrEqual(flightCountBefore);
  });

  test('Load more flights', async ({ page }) => {
    await page.goto('/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy');

    await page.waitForSelector('.flight-card');

    const initialCount = await page.locator('.flight-card').count();

    // Click load more if visible
    if (await page.locator('button:has-text("Load More")').isVisible()) {
      await page.click('button:has-text("Load More")');

      const newCount = await page.locator('.flight-card').count();
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('Responsive design - mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('/flights');

    // Verify form is responsive
    await expect(page.locator('.search-form')).toBeVisible();

    // Submit search
    await page.fill('input[placeholder*="origin"]', 'JFK');
    await page.click('text=JFK - John F');

    await page.fill('input[placeholder*="destination"]', 'LAX');
    await page.click('text=LAX - Los Angeles');

    await page.fill('input[type="date"]', '2025-11-15');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-11-22');

    await page.click('button:has-text("Search")');

    // Verify mobile results layout
    await expect(page.locator('.flight-card')).toBeVisible();

    // Filters should be in drawer/modal on mobile
    await expect(page.locator('.filters-panel')).not.toBeInViewport();
  });
});
```

---

### Component Tests (Jest + RTL)

**File:** `tests/components/FlightCard.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FlightCard } from '@/components/flights/FlightCard';

describe('FlightCard Component', () => {
  const mockFlight = {
    id: 'flight-1',
    price: { total: '450.00', currency: 'USD' },
    outbound: {
      duration: 'PT5H30M',
      segments: [
        {
          departure: { iataCode: 'JFK', at: '2025-11-15T08:00:00' },
          arrival: { iataCode: 'LAX', at: '2025-11-15T11:30:00' },
          carrierCode: 'AA',
          number: '123',
          aircraft: { code: '738' },
          duration: 'PT5H30M'
        }
      ],
      stops: 0
    },
    inbound: undefined,
    validatingAirline: { name: 'American Airlines', code: 'AA' },
    badges: ['Best Value']
  };

  test('renders flight card with correct information', () => {
    render(<FlightCard {...mockFlight} />);

    expect(screen.getByText('JFK')).toBeInTheDocument();
    expect(screen.getByText('LAX')).toBeInTheDocument();
    expect(screen.getByText(/450.00/)).toBeInTheDocument();
    expect(screen.getByText('American Airlines')).toBeInTheDocument();
  });

  test('calls onSelectFlight when select button clicked', () => {
    const mockSelect = jest.fn();
    render(<FlightCard {...mockFlight} onSelectFlight={mockSelect} />);

    fireEvent.click(screen.getByText('Select'));

    expect(mockSelect).toHaveBeenCalledWith('flight-1');
  });

  test('displays badges when present', () => {
    render(<FlightCard {...mockFlight} />);

    expect(screen.getByText('Best Value')).toBeInTheDocument();
  });

  test('shows direct flight badge when 0 stops', () => {
    render(<FlightCard {...mockFlight} />);

    expect(screen.getByText('Direct')).toBeInTheDocument();
  });
});
```

---

### API Tests

**File:** `tests/api/flights-search.test.ts`

```typescript
import { POST } from '@/app/api/flights/search/route';

describe('Flight Search API', () => {
  test('returns flights for valid request', async () => {
    const request = new Request('http://localhost/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-11-15',
        returnDate: '2025-11-22',
        adults: 2,
        children: 0,
        infants: 0,
        travelClass: 'ECONOMY'
      })
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.flights).toBeDefined();
    expect(Array.isArray(data.flights)).toBe(true);
    expect(data.metadata).toBeDefined();
  });

  test('returns 400 for missing required fields', async () => {
    const request = new Request('http://localhost/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'JFK',
        // Missing destination
        departureDate: '2025-11-15',
        adults: 1
      })
    });

    const response = await POST(request as any);

    expect(response.status).toBe(400);
  });

  test('validates date format', async () => {
    const request = new Request('http://localhost/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '11/15/2025', // Wrong format
        adults: 1
      })
    });

    const response = await POST(request as any);

    expect(response.status).toBe(400);
  });
});
```

---

### Visual Regression Tests

**File:** `tests/visual/screenshots.spec.ts`

```typescript
import { test } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Homepage screenshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('Flights search page screenshot', async ({ page }) => {
    await page.goto('/flights');
    await expect(page).toHaveScreenshot('flights-search.png');
  });

  test('Flight results page screenshot', async ({ page }) => {
    await page.goto('/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy');
    await page.waitForSelector('.flight-card');
    await expect(page).toHaveScreenshot('flight-results.png');
  });

  test('Mobile homepage screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });
});
```

---

### Performance Tests

**File:** `tests/performance/lighthouse.spec.ts`

```typescript
import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Performance', () => {
  test('Homepage Lighthouse audit', async ({ page }) => {
    await page.goto('/');

    await playAudit({
      page,
      thresholds: {
        performance: 90,
        accessibility: 95,
        'best-practices': 90,
        seo: 90,
      },
      port: 9222,
    });
  });

  test('Results page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy');
    await page.waitForSelector('.flight-card');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
```

---

### CI/CD Integration

**File:** `.github/workflows/test.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

---

### Test Data Management

**File:** `tests/fixtures/flights.json`

```json
{
  "roundTrip": {
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-11-15",
    "returnDate": "2025-11-22",
    "adults": 2,
    "children": 0,
    "infants": 0,
    "class": "economy"
  },
  "oneWay": {
    "origin": "MIA",
    "destination": "JFK",
    "departureDate": "2025-12-01",
    "adults": 1,
    "children": 1,
    "infants": 0,
    "class": "business"
  },
  "multiPassenger": {
    "origin": "LAX",
    "destination": "LHR",
    "departureDate": "2026-06-15",
    "returnDate": "2026-06-30",
    "adults": 2,
    "children": 2,
    "infants": 1,
    "class": "economy"
  }
}
```

---

### API Mocking Strategy

**File:** `tests/mocks/handlers.ts`

```typescript
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/flights/search', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        flights: [
          {
            id: 'mock-flight-1',
            price: { total: '450.00', currency: 'USD' },
            itineraries: [
              {
                duration: 'PT5H30M',
                segments: [
                  {
                    departure: { iataCode: 'JFK', at: '2025-11-15T08:00:00' },
                    arrival: { iataCode: 'LAX', at: '2025-11-15T11:30:00' },
                    carrierCode: 'AA',
                    number: '123'
                  }
                ]
              }
            ],
            score: 85,
            badges: ['Best Value']
          }
        ],
        metadata: {
          total: 1,
          sortedBy: 'best'
        }
      })
    );
  }),

  rest.get('/api/flights/airports', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');

    if (query?.toLowerCase().includes('jfk')) {
      return res(
        ctx.status(200),
        ctx.json({
          airports: [
            { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York' }
          ]
        })
      );
    }

    return res(ctx.status(200), ctx.json({ airports: [] }));
  })
];
```

**File:** `tests/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

### Accessibility Tests

**File:** `tests/a11y/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('Homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    await checkA11y(page);
  });

  test('Flights search form is keyboard accessible', async ({ page }) => {
    await page.goto('/flights');

    // Tab through form
    await page.keyboard.press('Tab'); // Origin
    await page.keyboard.type('JFK');

    await page.keyboard.press('Tab'); // Destination
    await page.keyboard.type('LAX');

    await page.keyboard.press('Tab'); // Departure date
    // ... continue tabbing through all fields

    await page.keyboard.press('Enter'); // Submit

    // Verify form submitted
    await expect(page).toHaveURL(/\/flights\/results/);
  });

  test('Screen reader announces errors', async ({ page }) => {
    await page.goto('/flights');

    // Submit empty form
    await page.click('button:has-text("Search")');

    // Check error has aria-live
    const error = page.locator('.error-message');
    await expect(error).toHaveAttribute('role', 'alert');
    await expect(error).toHaveAttribute('aria-live', 'polite');
  });
});
```

---

### Test Execution Plan

**Daily (Automated in CI):**
- Unit tests
- Component tests
- API tests
- Lint and type check

**On PR (Automated in CI):**
- All daily tests
- E2E smoke tests (critical paths)
- Visual regression tests
- Accessibility tests

**Weekly (Manual):**
- Full E2E test suite
- Cross-browser testing
- Performance testing
- User acceptance testing

**Pre-Release (Manual):**
- Full regression test
- Security audit
- Load testing
- Final UAT with stakeholders

---

## Test Metrics & Reporting

### Coverage Goals

- **Unit Tests:** 80%+ code coverage
- **Component Tests:** All major components tested
- **E2E Tests:** All critical user journeys covered
- **API Tests:** 100% endpoint coverage

### Success Criteria

A test suite is successful when:
- ✅ All tests pass
- ✅ No console errors
- ✅ Performance budgets met
- ✅ Accessibility score > 95
- ✅ Zero critical bugs
- ✅ User satisfaction > 4/5

---

## Appendix

### Test Environment Setup

**Local Development:**
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

**Environment Variables for Testing:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
AMADEUS_API_KEY=test_key
AMADEUS_API_SECRET=test_secret
NODE_ENV=test
```

### Useful Testing Commands

```bash
# Run specific test file
npx playwright test flight-search.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Generate test code (record interactions)
npx playwright codegen http://localhost:3000

# Update screenshots
npx playwright test --update-snapshots

# Run only failed tests
npx playwright test --last-failed

# Show test report
npx playwright show-report
```

---

## Contact & Support

For questions about testing:
- **Development Team:** fly2any.travel@gmail.com
- **QA Lead:** [TBD]
- **Documentation:** See `/docs` folder

---

**Document Version:** 1.0
**Last Updated:** 2025-10-03
**Author:** Claude (Fly2Any Development Team)
**Review Cycle:** Monthly
