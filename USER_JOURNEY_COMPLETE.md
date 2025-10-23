# Fly2Any Travel - Complete User Journey Documentation

**Version:** 1.0
**Last Updated:** October 3, 2025
**Project:** Fly2Any Flight Booking Platform

---

## Table of Contents

1. [Overview](#overview)
2. [Complete User Journey Map](#complete-user-journey-map)
3. [Page-by-Page Documentation](#page-by-page-documentation)
4. [Specific User Journeys](#specific-user-journeys)
5. [Feature Matrix](#feature-matrix)
6. [Data Flow Diagram](#data-flow-diagram)
7. [User Actions Catalog](#user-actions-catalog)
8. [Testing Checklist](#testing-checklist)
9. [Known Issues & Future Enhancements](#known-issues--future-enhancements)

---

## Overview

### Platform Purpose
Fly2Any is a comprehensive travel booking platform specializing in flight reservations with plans to expand to hotels, car rentals, and tour packages. The platform supports multilingual capabilities (English, Portuguese, Spanish) and provides a modern, user-friendly interface for searching, comparing, and booking flights.

### Technology Stack
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks, sessionStorage, localStorage
- **Icons:** Lucide React
- **Deployment:** Vercel (assumed)

### User Flow Philosophy
The platform follows a progressive disclosure pattern, revealing information and options as users progress through their booking journey while maintaining context and allowing easy navigation back to previous steps.

---

## Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE (/)                                │
│  Purpose: Brand introduction & service overview                         │
│  Status: Under Construction                                             │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 ├──► Flights        (Available)
                 ├──► Hotels         (Available - Basic UI)
                 ├──► Car Rentals    (Coming Soon)
                 ├──► Tours          (Coming Soon)
                 └──► Insurance      (Coming Soon)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLIGHT SEARCH PAGE (/flights)                        │
│  Purpose: Capture search criteria                                      │
│  Key Actions: Select airports, dates, passengers, class                │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 │ [User submits search]
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 FLIGHT RESULTS PAGE (/flights/results)                  │
│  Purpose: Display & compare available flights                          │
│  Key Actions: Filter, sort, compare, select flight                     │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 │ [User selects flight]
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  BOOKING PAGE (/flights/booking)                        │
│  Purpose: Collect passenger details & payment                          │
│  Key Steps: Passengers → Seats → Payment → Review                      │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 │ [User confirms & pays]
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│            CONFIRMATION PAGE (/flights/booking/confirmation)            │
│  Purpose: Confirm booking & provide next steps                         │
│  Key Actions: Download ticket, add to calendar, manage booking         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Alternative Paths

```
SEARCH MODIFICATIONS:
- User can modify search from any results page (sticky search bar)
- Parameters are preserved in URL and can be bookmarked

COMPARISON FLOW:
Results Page → [Compare up to 4 flights] → Comparison Modal → Select Flight

PRICE ALERTS:
Results Page → [Set Price Alert] → Price Alert Modal → Enter Email

FLEXIBLE DATES:
Results Page → [Select different date] → Auto-refresh with new results

SAVE FOR LATER:
Results Page → [Save Flight] → localStorage → Retrieve later

BOOKING ABANDONMENT RECOVERY:
Booking Page → localStorage saves progress → Return later to same step
```

---

## Page-by-Page Documentation

### 1. Landing Page (/)

**URL:** `/`
**File:** `C:\Users\Power\fly2any-fresh\app\page.tsx`

#### Purpose
Introduce the Fly2Any brand and direct users to available services.

#### Current Status
Under construction with placeholder content and service links.

#### Key Features
- **Language Switcher:** EN | PT | ES (state-based, no persistence)
- **Service Cards:** Flights, Hotels (clickable), Car Rentals, Tours, Insurance (disabled)
- **Contact Information:** WhatsApp, Phone (US), Email
- **Branding:** Fly2Any logo with professional presentation

#### User Actions
| Action | Target | Implementation |
|--------|--------|----------------|
| Select Language | Change UI language | `setLang()` state update |
| Click "Flights" | Navigate to `/flights` | `<a href="/flights">` |
| Click "Hotels" | Navigate to `/hotels` | `<a href="/hotels">` |
| Click WhatsApp | Open WhatsApp chat | External link `https://wa.me/551151944717` |
| Click Phone | Initiate phone call | `tel:+13153061646` |
| Click Email | Open email client | `mailto:fly2any.travel@gmail.com` |

#### Navigation Options
- **Outbound:** → `/flights`, `/hotels`
- **Inbound:** None (entry point)

#### Data Flow
- **Input:** User language preference (in-memory)
- **Output:** None
- **Storage:** None
- **API Calls:** None

#### Components Used
- `Image` (Next.js)
- Custom language switcher
- Inline SVG icons

---

### 2. Flight Search Page (/flights)

**URL:** `/flights`
**File:** `C:\Users\Power\fly2any-fresh\app\flights\page.tsx`

#### Purpose
Allow users to enter flight search criteria and initiate search.

#### Key Features
- **Trip Type Toggle:** Round Trip / One Way
- **Airport Autocomplete:** Origin and destination with suggestions
- **Date Pickers:** Departure (always) + Return (round trip only)
- **Passenger Selector:** Adults, children, infants with validation
- **Travel Class Selector:** Economy, Premium Economy, Business, First
- **Direct Flights Filter:** Checkbox option
- **Form Validation:** Client-side with error messages
- **Language Support:** Full trilingual support

#### User Actions
| Action | Result | Validation |
|--------|--------|------------|
| Toggle Trip Type | Show/hide return date | None |
| Select Origin Airport | Populate `from` field | Required, must be 3-letter code |
| Select Destination Airport | Populate `to` field | Required, must be 3-letter code |
| Choose Departure Date | Set departure date | Required, must be future date |
| Choose Return Date | Set return date | Required for round trip, must be after departure |
| Adjust Passenger Counts | Update totals | Adults ≥ 1, Infants ≤ Adults |
| Select Travel Class | Set cabin class | None |
| Toggle Direct Flights | Set filter preference | None |
| Click Search | Navigate to results | All validations must pass |

#### Navigation Options
- **Outbound:** → `/flights/results?[params]` (new window or same window)
- **Inbound:** ← `/` (via logo)
- **Language Switcher:** Maintains current page

#### Data Flow
```
User Input → Form State → Validation
    ↓
Airport Code Extraction (e.g., "JFK - New York" → "JFK")
    ↓
URL Parameters Construction
    ↓
Navigate to /flights/results with query string
    ↓
Open in new window (preferred) or same window if pop-up blocked
```

#### Query Parameters Generated
```
from: string (airport code)
to: string (airport code)
departure: string (YYYY-MM-DD)
return?: string (YYYY-MM-DD, round trip only)
adults: number
children: number
infants: number
class: 'economy' | 'premium' | 'business' | 'first'
direct?: 'true'
```

#### Storage
- None (stateless page)

#### API Calls
- None (search is performed on results page)

#### Components Used
- `AirportAutocomplete` - Smart airport search with suggestions
- `Image` - Fly2Any logo
- Custom language switcher
- Lucide icons: `Plane`, `PlaneTakeoff`, `PlaneLanding`

---

### 3. Flight Results Page (/flights/results)

**URL:** `/flights/results?from={code}&to={code}&departure={date}&adults={n}...`
**File:** `C:\Users\Power\fly2any-fresh\app\flights\results\page.tsx`

#### Purpose
Display available flights matching search criteria with filtering, sorting, and comparison tools.

#### Key Features
- **Search Summary Bar:** Sticky header showing search criteria with "Modify Search" option
- **Three-Column Layout:**
  - Left: Filters (sticky on desktop)
  - Center: Flight results (scrollable)
  - Right: Price insights & smart features (sticky on desktop)
- **Flight Cards:** Enhanced cards with detailed itinerary info
- **Filtering System:**
  - Price range slider
  - Stops (direct, 1-stop, 2+ stops)
  - Airlines (multi-select)
  - Departure time (morning, afternoon, evening, night)
  - Maximum duration
- **Sorting Options:**
  - Best (recommended)
  - Cheapest
  - Fastest
  - Earliest departure
- **Premium Features:**
  - Flexible date selector (±3 days)
  - Flight comparison (up to 4 flights)
  - Price alerts
  - Price insights & trend analysis
  - Smart wait booking advisor
- **Pagination:** Load more (10 flights at a time)
- **Loading States:** Skeleton screens during fetch
- **Error Handling:** User-friendly error messages with retry option

#### User Actions
| Action | Result | Implementation |
|--------|--------|-------------|
| Modify Search | Return to search with params | `router.push('/')` |
| Apply Filter | Update displayed flights | `applyFilters()` local function |
| Change Sort | Reorder flights | `sortFlights()` local function |
| Select Flight | Navigate to booking | `handleSelectFlight(id)` → Save to sessionStorage → Navigate |
| Compare Flight | Add to comparison (max 4) | `handleCompareToggle(id)` → Update state |
| View Comparison | Open comparison modal | Opens when 2+ flights selected |
| Set Price Alert | Open alert modal | `setShowPriceAlert(true)` |
| Select Flexible Date | Reload with new date | Update URL params → Reload page |
| Load More Results | Show next 10 flights | `setDisplayCount(prev + 10)` |
| Book Now (Smart Wait) | Select best flight | `handleBookNow(flightId)` |

#### Navigation Options
- **Outbound:** → `/flights/booking?flightId={id}&adults={n}...`
- **Inbound:** ← `/` (modify search)
- **Modal:** Flight Comparison Modal, Price Alerts Modal

#### Data Flow
```
URL Params → Parse Search Criteria
    ↓
API Call: POST /api/flights/search
    ↓
Receive Flight Data (up to 50 flights)
    ↓
Calculate Price Insights & Statistics
    ↓
Generate Flexible Date Prices (mock ±20%)
    ↓
Apply Filters → Sort → Paginate
    ↓
Display Results
    ↓
User Selects Flight
    ↓
Save Flight Data to sessionStorage:
  - flight_{id}: Complete flight object
  - flight_search_{id}: Search context
    ↓
Navigate to /flights/booking
```

#### API Calls

**POST /api/flights/search**
```typescript
Request Body:
{
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  adults: number,
  children: number,
  infants: number,
  travelClass: string,
  currencyCode: 'USD',
  max: 50
}

Response:
{
  flights: FlightOffer[],
  meta: { count: number }
}
```

#### Storage

**sessionStorage:**
- `flight_{flightId}`: Complete flight object for booking page
- `flight_search_{flightId}`: Search context (params used)

**State Management:**
- `flights`: Array of flight offers
- `filters`: Current filter settings
- `sortBy`: Current sort option
- `displayCount`: Number of flights to show
- `compareFlights`: Array of flight IDs for comparison
- `showPriceAlert`: Boolean for alert modal
- `flexibleDatePrices`: Array of date/price pairs

#### Components Used
- `SearchSummaryBar` - Sticky search context display
- `FlightFilters` - Comprehensive filtering sidebar
- `SortBar` - Sort options with result count
- `FlightCardEnhanced` - Individual flight display
- `FlexibleDates` - Date selector widget
- `SmartWait` - AI-powered booking advice
- `PriceInsights` - Price trend analysis
- `FlightComparison` - Compare modal
- `PriceAlerts` - Alert setup modal
- `MultipleFlightCardSkeletons` - Loading state
- Lucide icons: Various

---

### 4. Booking Page (/flights/booking)

**URL:** `/flights/booking?flightId={id}&adults={n}&children={n}&infants={n}&tripType={type}`
**File:** `C:\Users\Power\fly2any-fresh\app\flights\booking\page.tsx`

#### Purpose
Collect passenger information, seat preferences, and payment details to complete booking.

#### Key Features
- **Multi-Step Process:**
  1. **Passengers** - Personal details for all travelers
  2. **Seats** - Seat selection for outbound (and return if applicable)
  3. **Payment** - Payment card and billing address
  4. **Review** - Final confirmation before payment
- **Step Indicator:** Visual progress tracker with click-to-navigate (completed steps only)
- **Flight Summary Sidebar:** Sticky summary with price breakdown
- **Form Validation:** Real-time validation with error messages
- **Progress Persistence:** Auto-save to localStorage
- **Secure Payment:** Visual security indicators
- **Mobile Responsive:** Optimized for all devices

#### Step 1: Passenger Details

**Data Collected (per passenger):**
- Title (Mr, Mrs, Ms, Miss, Dr)
- First Name *
- Last Name *
- Date of Birth *
- Nationality *
- Passport Number *
- Passport Expiry Date *
- Email * (primary passenger only)
- Phone * (primary passenger only)

**Validation Rules:**
- All fields marked with * are required
- Names must match passport exactly
- DOB must create valid age category
- Passport must be valid 6+ months beyond travel
- Email must be valid format
- Phone must be valid format

#### Step 2: Seat Selection

**Features:**
- Visual seat map (10 rows × 6 columns: A-F with aisle)
- Seat types: Available, Occupied, Selected, Extra Legroom
- Separate maps for outbound and return flights
- Per-passenger selection
- Live selection feedback

**Seat Map Legend:**
- Gray: Available
- Dark Gray: Occupied
- Blue: Selected
- Green border: Extra Legroom

**Validation:**
- Optional step (can proceed without selecting seats)
- Cannot select occupied seats
- One seat per passenger per flight

#### Step 3: Payment

**Data Collected:**
- Card Number * (16 digits, auto-formatted with spaces)
- Cardholder Name * (uppercase)
- Expiry Month * (MM)
- Expiry Year * (YY)
- CVV * (3-4 digits)
- Billing Address *
- City *
- ZIP Code *
- Country *

**Security Features:**
- 256-bit SSL encryption badge
- Secure payment indicators
- No card data stored client-side
- PCI compliance messaging

**Validation:**
- Card number: 16 digits
- Expiry: Future date
- CVV: 3-4 digits
- All fields required

#### Step 4: Review & Confirm

**Displayed Information:**
- Flight details (outbound + return)
- All passenger information
- Seat assignments
- Payment method (last 4 digits)
- Terms & conditions checkbox *

**Final Actions:**
- Accept terms & conditions (required)
- Confirm & Pay button
- Back button to edit previous steps

#### User Actions
| Action | Result | Navigation |
|--------|--------|-----------|
| Fill Passenger Form | Update form data | Stay on step |
| Click Next | Validate & advance | Next step |
| Click Back | Go to previous step | Previous step |
| Select Seat | Mark seat as selected | Stay on step |
| Fill Payment Form | Update payment data | Stay on step |
| Click Step Indicator | Jump to completed step | Target step |
| Accept Terms | Enable Confirm button | Stay on step |
| Confirm & Pay | Process booking | → Confirmation page |

#### Navigation Options
- **Outbound:** → `/flights/booking/confirmation?bookingId={id}`
- **Inbound:** ← Results page (back button in browser)
- **Step Navigation:** Within booking flow (passengers ↔ seats ↔ payment ↔ review)

#### Data Flow
```
URL Params + sessionStorage → Load Flight Data
    ↓
Initialize Passengers (based on adults/children/infants count)
    ↓
Check localStorage for saved progress
    ↓
Restore saved data if exists
    ↓
Display current step
    ↓
User completes step
    ↓
Validate current step
    ↓
Save to localStorage (auto-save)
    ↓
Advance to next step
    ↓
Repeat until Review step
    ↓
User confirms
    ↓
Submit booking (simulated 2-second API call)
    ↓
Clear localStorage progress
    ↓
Navigate to confirmation with bookingId
```

#### Storage

**sessionStorage (READ):**
- `flight_{flightId}`: Flight details
- `flight_search_{flightId}`: Search context

**localStorage (WRITE/READ):**
- `booking_{flightId}`: Booking progress
  ```typescript
  {
    formData: {
      passengers: PassengerInfo[],
      seats: SeatSelection[],
      payment: PaymentInfo
    },
    currentStep: BookingStep,
    timestamp: number
  }
  ```

#### API Calls

**Booking Confirmation (Mock):**
```typescript
// In production: POST /api/flights/confirm
// Currently: Simulated with setTimeout(2000ms)

Request:
{
  flightId: string,
  passengers: PassengerInfo[],
  seats: SeatSelection[],
  payment: PaymentInfo
}

Response:
{
  bookingId: string,
  confirmationCode: string,
  status: 'confirmed'
}
```

#### Components Used
- `StepIndicator` - Progress visualization
- `FlightSummarySidebar` - Booking summary
- `PassengerDetailsStep` - Passenger form
- `SeatSelectionStep` - Seat picker
- `PaymentStep` - Payment form
- `ReviewStep` - Final review
- Lucide icons: `User`, `CreditCard`, `CheckCircle`, `MapPin`, `Shield`, `Loader2`

---

### 5. Confirmation Page (/flights/booking/confirmation)

**URL:** `/flights/booking/confirmation?bookingId={id}`
**File:** `C:\Users\Power\fly2any-fresh\app\flights\booking\confirmation\page.tsx`

#### Purpose
Confirm successful booking and provide booking details, tickets, and next steps.

#### Key Features
- **Success Animation:** Confetti + checkmark (5 seconds)
- **Booking Reference:** Large, copyable booking code
- **Quick Actions Bar:**
  - Add to Calendar (Google, Apple, Outlook)
  - Download PDF Ticket
  - Print Confirmation
  - Share Trip Details
- **Flight Details Cards:**
  - Outbound flight (blue accent)
  - Return flight (purple accent)
  - Airline, aircraft, times, airports
  - Cabin class, baggage allowance
- **Passenger Information:**
  - All passengers with seat assignments
  - Frequent flyer numbers
  - Baggage allowances
- **Payment Summary:**
  - Subtotal, taxes/fees breakdown
  - Total paid
  - Payment method (masked)
  - Transaction ID
  - Payment date
- **Next Steps Checklist:**
  1. Online check-in (24h before)
  2. Prepare documents
  3. Airport arrival (3h early for international)
  4. Boarding (gates close 30min before)
- **Important Information:**
  - Check-in timing
  - Baggage rules
  - Document requirements
  - Airport arrival time
- **FAQs:** Expandable Q&A sections
- **Customer Support:** 24/7 contact options (WhatsApp, Phone, Email)
- **Mobile Boarding Pass Info:** Instructions for online check-in
- **Travel Tips:** Helpful suggestions
- **Manage Booking Button:** Access to booking management (future)
- **Print Optimization:** Special CSS for print-friendly layout

#### User Actions
| Action | Result | Implementation |
|--------|--------|----------------|
| Copy Booking Reference | Copy to clipboard | `navigator.clipboard.writeText()` |
| Add to Calendar | Download calendar event | Platform-specific calendar format |
| Download PDF | Generate PDF ticket | `handleDownloadPDF()` (placeholder) |
| Print Confirmation | Open print dialog | `window.print()` |
| Share Trip | Share booking details | Share API (placeholder) |
| Expand FAQ | Show answer | `<details>` HTML element |
| Contact Support | Open communication channel | External links |
| Manage Booking | Access booking portal | Navigate to management page |
| Add Insurance | Purchase travel insurance | Insurance flow (placeholder) |

#### Navigation Options
- **Outbound:** → Manage Booking (future), Home
- **Inbound:** None (terminal page in flow)
- **Language:** Switcher maintains on page

#### Data Flow
```
URL bookingId → Fetch Booking Data
    ↓
(Currently: Mock data, in production: API call)
    ↓
Display confirmation details
    ↓
Generate calendar events
    ↓
Provide download/print options
    ↓
User actions (download, print, share)
    ↓
Optionally: Navigate to manage booking
```

#### Storage
- **localStorage:** Cleared booking progress
- **sessionStorage:** Can be cleared (booking complete)

#### API Calls

**Fetch Booking Details (Future):**
```typescript
// GET /api/bookings/{bookingId}

Response:
{
  bookingRef: string,
  confirmationDate: string,
  email: string,
  flights: {
    outbound: FlightDetails,
    return?: FlightDetails
  },
  passengers: PassengerInfo[],
  payment: PaymentSummary
}
```

#### Components Used
- `Image` - Fly2Any logo
- Custom language switcher
- Inline SVG icons
- Print-optimized CSS

#### Print Styles
- Removes: Confetti, action buttons, language switcher
- Preserves: All booking information, QR code placeholder
- Optimization: 1cm margins, color preservation

---

### 6. Hotels Page (/hotels)

**URL:** `/hotels`
**File:** `C:\Users\Power\fly2any-fresh\app\hotels\page.tsx`

#### Purpose
Allow users to search for hotel accommodations (basic implementation).

#### Current Status
**Basic UI only** - Search form exists but no results implementation.

#### Key Features
- Destination input (text)
- Check-in date picker
- Check-out date picker
- Guest counts (adults, children)
- Room count selector
- Language switcher
- Search button

#### Future Implementation Needed
- Hotel search API integration
- Results page
- Hotel details page
- Booking flow
- Review system

---

## Specific User Journeys

### Journey 1: New User - First Flight Booking

**User:** Sarah, 28, booking her first international flight
**Device:** Desktop Chrome
**Language:** English

#### Steps:

1. **Discovery (External)** → Arrives at fly2any.com via Google search

2. **Landing Page** (/ - 5 seconds)
   - Sees "Under Construction" but "Flights" is available
   - Clicks "Flights" card

3. **Flight Search** (/flights - 60 seconds)
   - Selects language: English (default)
   - Chooses: Round Trip
   - From: "New York" → Autocomplete suggests "JFK - John F. Kennedy International"
   - To: "London" → Selects "LHR - London Heathrow"
   - Departure: 2 weeks from today
   - Return: 1 week after departure
   - Passengers: 1 Adult (default)
   - Class: Economy (default)
   - Clicks "Search Flights"
   - **Decision Point:** Pop-up opens or same window navigates

4. **Results Page** (/flights/results - 3-5 minutes)
   - Sees loading skeleton (2-3 seconds)
   - Views ~50 flight options
   - Reads search summary bar (confirms correct search)
   - **Exploration:**
     - Tries "Flexible Dates" widget → Sees +3 days is $50 cheaper
     - Adjusts date to cheaper option
     - Page reloads with new results
     - Applies filter: "Direct flights only"
     - Changes sort to "Cheapest"
   - **Price Insights:**
     - Reads "Good price" indicator
     - Sees trend shows "Prices likely to rise"
   - **Smart Wait:**
     - Sees recommendation: "Book now - prices rising"
   - Compares 2 flights side-by-side
   - **Decision:** Selects cheaper direct flight
   - Clicks "Select Flight" button

5. **Booking Page** (/flights/booking - 10-15 minutes)

   **Step 1: Passengers** (3 minutes)
   - Sees progress: "1/4 - Passenger Details"
   - Fills form:
     - Title: Ms
     - First Name: Sarah
     - Last Name: Johnson
     - DOB: 1996-05-15
     - Nationality: US
     - Passport: 123456789
     - Passport Expiry: 2028-12-31
     - Email: sarah.j@email.com
     - Phone: +1234567890
   - Clicks "Continue"

   **Step 2: Seats** (2 minutes)
   - Sees seat map for outbound flight
   - Selects "12A" (window, extra legroom)
   - Sees seat map for return flight
   - Selects "15F" (window)
   - Clicks "Continue"

   **Step 3: Payment** (4 minutes)
   - Sees "Secure Payment" badge
   - Fills payment:
     - Card: 4242 4242 4242 4242
     - Name: SARAH JOHNSON
     - Expiry: 12/28
     - CVV: 123
     - Billing: 123 Main St, New York, NY 10001, USA
   - Clicks "Continue"

   **Step 4: Review** (2 minutes)
   - Reviews all details:
     - Flight: JFK → LHR, Nov 15, 2025, 6:30 PM
     - Return: LHR → JFK, Nov 22, 2025, 10:15 AM
     - Passenger: Ms Sarah Johnson
     - Seats: 12A (outbound), 15F (return)
     - Payment: Visa ending in 4242
     - Total: $850.00
   - Checks "I accept terms and conditions"
   - Clicks "Confirm & Pay"
   - Sees processing spinner (2 seconds)

6. **Confirmation Page** (/flights/booking/confirmation - 5+ minutes)
   - Sees confetti animation
   - Sees "Booking Confirmed!" ✓
   - Booking Reference: **F2A-2025-XYZ789** (copies it)
   - Receives email confirmation
   - **Actions Taken:**
     - Clicks "Add to Calendar" → "Google Calendar" → Event added
     - Clicks "Download PDF Ticket" → Saves PDF
     - Clicks "Print Confirmation" → Prints page
   - Reads "Next Steps" checklist
   - Reads Important Information
   - Saves WhatsApp support number for later
   - **Outcome:** Successfully booked, confident about next steps

**Total Time:** ~25-30 minutes
**Pain Points:** None (smooth flow)
**Satisfaction:** High - Clear process, helpful information

---

### Journey 2: Returning User - Quick Rebooking

**User:** Michael, 45, frequent flyer who booked before
**Device:** Mobile Safari (iPhone)
**Language:** English

#### Steps:

1. **Direct Entry** → Bookmarked /flights

2. **Flight Search** (30 seconds)
   - Familiar with interface
   - Sets: One Way, JFK → LAX, Next Monday, 1 Adult, Business
   - Clicks Search

3. **Results Page** (2 minutes)
   - Knows to look at "Best" sort first
   - Trusts SmartWait recommendation
   - Quickly selects top recommended flight
   - No comparison needed (trusts system)

4. **Booking Page** (5 minutes)
   - **Possible Enhancement:** Could auto-fill from previous booking
   - Fills details quickly (knows the drill)
   - Skips seat selection (will do at check-in)
   - Completes payment

5. **Confirmation** (1 minute)
   - Familiar confirmation page
   - Only saves PDF (already has calendar system)
   - Exits

**Total Time:** ~10 minutes
**Pain Points:** Manual re-entry of personal info
**Improvement Needed:** User profile / saved passenger details

---

### Journey 3: Mobile User - On-the-Go Booking

**User:** Carlos, 32, booking while commuting
**Device:** Android Chrome
**Language:** Spanish

#### Steps:

1. **Landing** → Switches to Spanish (ES button)

2. **Search** (/flights)
   - Touch-optimized form works well
   - Autocomplete works on mobile
   - Date pickers use native mobile picker
   - Passenger dropdown scrollable
   - Search button full-width, easy to tap

3. **Results** (Mobile-specific behavior)
   - Filters slide up from bottom (mobile sheet)
   - "Show Price Insights" toggle button
   - Flight cards stacked vertically
   - Thumb-friendly tap targets
   - Comparison works (swipeable)

4. **Booking**
   - Step indicator compacted on mobile
   - Seat map zoomable/pinchable
   - Forms use mobile keyboard types (email, tel, number)
   - Payment form auto-detects card type

5. **Confirmation**
   - Mobile-optimized layout
   - Single column design
   - Large tap targets for actions
   - WhatsApp contact preferred (one tap)

**Total Time:** ~20 minutes
**Experience:** Good - Fully responsive
**Pain Point:** Small seat map (zoom helps)

---

### Journey 4: Business Traveler - Multi-Passenger Booking

**User:** Jennifer, 38, booking for team of 4
**Device:** Desktop
**Language:** Portuguese

#### Steps:

1. **Search**
   - Selects: Round Trip
   - 4 Adults (all colleagues)
   - Business Class
   - Next week departure

2. **Results**
   - Filters by "Direct only" (business preference)
   - Sorts by "Fastest"
   - Uses comparison to show boss
   - Selects flight

3. **Booking - Complexity**

   **Passengers:** Needs to enter 4 separate profiles
   - Passenger 1 (self): Full details + contact
   - Passenger 2: Colleague's passport info
   - Passenger 3: Colleague's passport info
   - Passenger 4: Colleague's passport info

   **Seats:** Needs to select 4 seats
   - Tries to get adjacent seats
   - Prefers extra legroom
   - Coordinates with team via message

   **Payment:** Company card

   **Time Required:** 20+ minutes just for data entry

**Pain Points:**
- Repetitive data entry for multiple passengers
- No bulk paste/upload option
- Seat selection tedious for 4 people
- No "select adjacent seats" helper

**Future Enhancement Needed:**
- CSV upload for passenger list
- Smart seat grouping
- Corporate account profiles

---

### Journey 5: Price-Conscious User - Using All Tools

**User:** Emma, 25, budget traveler
**Device:** Desktop
**Language:** English

#### Steps:

1. **Search** → Budget route: NYC → Barcelona

2. **Results - Deep Exploration**
   - **Flexible Dates:** Checks all ±3 days
     - Finds $150 cheaper if departing 2 days later
     - Adjusts search
   - **Price Insights:**
     - Reads 30-day price history
     - Sees "Prices 15% lower than average"
     - Trend shows "Stable"
   - **Smart Wait:**
     - Recommendation: "Wait 3-5 days for better price"
   - **Decision:** Sets price alert instead of booking
   - **Price Alert Modal:**
     - Enters email
     - Sets threshold: $650 or less
     - Confirms alert
   - **Alternative:** Compares 4 different flights
     - Uses comparison modal
     - Screenshots for later decision
   - **Outcome:** Doesn't book yet, waits for alert

**Time Spent:** 30+ minutes research
**Conversion:** Delayed (will return when price drops)
**Value:** High engagement with platform features

---

## Feature Matrix

### Overview Table

| Feature | Landing | Search | Results | Booking | Confirmation | Status | Priority |
|---------|---------|--------|---------|---------|--------------|--------|----------|
| **Core Features** |
| Language Switcher (EN/PT/ES) | ✅ | ✅ | ✅ | ✅ | ✅ | Complete | Must-have |
| Flight Search Form | ❌ | ✅ | ❌ | ❌ | ❌ | Complete | Must-have |
| Flight Results Display | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Must-have |
| Booking Flow | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Must-have |
| Booking Confirmation | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Must-have |
| **Search Features** |
| Airport Autocomplete | ❌ | ✅ | ❌ | ❌ | ❌ | Complete | Must-have |
| Round Trip / One Way | ❌ | ✅ | ✅ | ✅ | ✅ | Complete | Must-have |
| Date Selection | ❌ | ✅ | ✅ | ❌ | ❌ | Complete | Must-have |
| Passenger Selection | ❌ | ✅ | ✅ | ✅ | ✅ | Complete | Must-have |
| Class Selection | ❌ | ✅ | ✅ | ✅ | ✅ | Complete | Must-have |
| Direct Flights Filter | ❌ | ✅ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| **Results Features** |
| Price Filtering | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Must-have |
| Stops Filtering | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Must-have |
| Airline Filtering | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Must-have |
| Time Filtering | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Duration Filtering | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Sort by Best | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Must-have |
| Sort by Price | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Must-have |
| Sort by Duration | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Sort by Time | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Flexible Dates (±3 days) | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Price Insights | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Price History Graph | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| SmartWait Advisor | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Flight Comparison (up to 4) | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Price Alerts | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Nice-to-have |
| Load More Pagination | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Must-have |
| Search Modification | ❌ | ❌ | ✅ | ❌ | ❌ | Complete | Must-have |
| **Booking Features** |
| Passenger Details Form | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Must-have |
| Seat Selection Map | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Nice-to-have |
| Payment Form | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Must-have |
| Review & Confirm | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Must-have |
| Step Progress Indicator | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Must-have |
| Form Validation | ❌ | ✅ | ❌ | ✅ | ❌ | Complete | Must-have |
| Progress Auto-Save | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Nice-to-have |
| Flight Summary Sidebar | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Must-have |
| Secure Payment Indicators | ❌ | ❌ | ❌ | ✅ | ❌ | Complete | Must-have |
| **Confirmation Features** |
| Success Animation | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Nice-to-have |
| Booking Reference Display | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Must-have |
| Copy to Clipboard | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Nice-to-have |
| Add to Calendar | ❌ | ❌ | ❌ | ❌ | 🔄 | Partial | Nice-to-have |
| Download PDF Ticket | ❌ | ❌ | ❌ | ❌ | 🔄 | Placeholder | Must-have |
| Print Confirmation | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Must-have |
| Share Trip | ❌ | ❌ | ❌ | ❌ | 🔄 | Placeholder | Nice-to-have |
| Flight Details Display | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Must-have |
| Passenger Info Display | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Must-have |
| Payment Summary | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Must-have |
| Next Steps Checklist | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Nice-to-have |
| Important Info | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Nice-to-have |
| FAQs | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Nice-to-have |
| Customer Support Info | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Must-have |
| Travel Tips | ❌ | ❌ | ❌ | ❌ | ✅ | Complete | Nice-to-have |
| Manage Booking Button | ❌ | ❌ | ❌ | ❌ | 🔄 | Placeholder | Must-have |
| **Other Services** |
| Hotels Search | ✅ | ❌ | ❌ | ❌ | ❌ | Partial | Must-have |
| Car Rentals | 🔄 | ❌ | ❌ | ❌ | ❌ | Coming Soon | Nice-to-have |
| Tours & Activities | 🔄 | ❌ | ❌ | ❌ | ❌ | Coming Soon | Nice-to-have |
| Travel Insurance | 🔄 | ❌ | ❌ | ❌ | 🔄 | Coming Soon | Nice-to-have |

**Legend:**
- ✅ Complete & Working
- 🔄 Partial / Placeholder
- ❌ Not Applicable / Not Implemented

---

### Implementation Complexity

| Feature | Complexity | Estimated Effort | Dependencies |
|---------|-----------|------------------|--------------|
| **Already Complete (Low Effort)** |
| Language Switching | Low | ✅ Complete | None |
| Search Form | Medium | ✅ Complete | Airport API |
| Results Display | High | ✅ Complete | Flight Search API |
| Booking Flow | High | ✅ Complete | Payment gateway (mocked) |
| Confirmation Page | Medium | ✅ Complete | Booking API (mocked) |
| **Needs Implementation (Pending)** |
| PDF Ticket Generation | Medium | 4-8 hours | PDF library (jsPDF, react-pdf) |
| Calendar Event Files | Low | 2-4 hours | ICS format generation |
| Real Payment Processing | High | 16-24 hours | Stripe/PayPal integration |
| User Authentication | High | 16-24 hours | Auth provider (NextAuth, Clerk) |
| User Profiles | Medium | 8-12 hours | Database + Auth |
| Saved Passengers | Medium | 4-8 hours | Database + Auth |
| Booking Management | High | 16-24 hours | Database + APIs |
| Email Notifications | Medium | 6-10 hours | SendGrid/Resend |
| SMS Notifications | Medium | 4-6 hours | Twilio |
| Hotels Full Implementation | Very High | 40-60 hours | Hotels API, booking flow |
| Car Rentals | Very High | 40-60 hours | Partners API, booking flow |
| Travel Insurance | High | 20-30 hours | Insurance partner API |
| Mobile App | Very High | 200+ hours | React Native / Flutter |

---

## Data Flow Diagram

### Overall System Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ sessionStorage│  │ localStorage │  │   React State        │  │
│  │              │  │              │  │   (in-memory)        │  │
│  │ - Flight data│  │ - Booking    │  │ - Form data         │  │
│  │ - Search ctx │  │   progress   │  │ - UI state          │  │
│  │              │  │ - Preferences│  │ - Filters           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         ▲                 ▲                     ▲               │
│         │                 │                     │               │
│         └─────────────────┴─────────────────────┘               │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP (Server)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     API Routes                           │  │
│  │  /api/flights/search     → Amadeus Flight Offers API    │  │
│  │  /api/flights/airports   → Airport autocomplete          │  │
│  │  /api/flights/confirm    → Booking confirmation (mock)   │  │
│  │  /api/hotels/search      → Hotels search (placeholder)   │  │
│  │  /api/hotels/cities      → City autocomplete             │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ External API Calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Amadeus    │  │   Payment    │  │   Email Service     │  │
│  │   API        │  │   Gateway    │  │   (Future)          │  │
│  │              │  │   (Future)   │  │                     │  │
│  │ - Flights    │  │ - Stripe     │  │ - SendGrid          │  │
│  │ - Hotels     │  │ - PayPal     │  │ - Resend            │  │
│  │ - Cars       │  │              │  │                     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Search to Results Flow

```
User fills search form
    ↓
[CLIENT] Form validation
    ↓
Extract airport codes from autocomplete values
    ↓
Build URL query parameters
    ↓
Navigate to /flights/results?params
    ↓
[SERVER] Page loads
    ↓
[CLIENT] Parse URL params
    ↓
Construct API request body
    ↓
POST /api/flights/search
    ↓
[SERVER] API Route handler
    ↓
Call Amadeus Flight Offers API
    ↓
Receive flight data
    ↓
Transform & return to client
    ↓
[CLIENT] Store in state
    ↓
Calculate derived data:
  - Price statistics
  - Flexible date prices (mock)
  - Price trend (mock)
    ↓
Apply initial filters (none)
    ↓
Sort by "best" (default)
    ↓
Display first 10 results
    ↓
User can:
  - Apply filters → Re-filter locally
  - Change sort → Re-sort locally
  - Load more → Show next 10
  - Select flight → Navigate to booking
```

### Booking Flow Data Management

```
User clicks "Select Flight" on results page
    ↓
[CLIENT] Save to sessionStorage:
  - flight_{id}: Complete flight object
  - flight_search_{id}: Search parameters
    ↓
Navigate to /flights/booking?flightId={id}&params
    ↓
[PAGE LOAD] Booking page initializes
    ↓
Read from sessionStorage:
  - flight_{id}
  - flight_search_{id}
    ↓
Read from localStorage:
  - booking_{id} (if exists, restore progress)
    ↓
Initialize passenger array based on counts
    ↓
Display Step 1 (Passengers)
    ↓
[EVERY FORM CHANGE]
    ↓
Update React state (formData)
    ↓
Save to localStorage (booking_{id})
  - Debounced auto-save
  - Preserves progress across refreshes
    ↓
[STEP NAVIGATION]
    ↓
Validate current step
    ↓
If valid → Next step
If invalid → Show errors
    ↓
[FINAL CONFIRMATION]
    ↓
Validate all steps
    ↓
Accept terms & conditions
    ↓
Click "Confirm & Pay"
    ↓
Simulate API call (2 second delay)
    ↓
[Future: POST /api/flights/confirm]
    ↓
Receive bookingId
    ↓
Clear localStorage (booking_{id})
    ↓
Navigate to /flights/booking/confirmation?bookingId={id}
    ↓
Display confirmation page
```

### State Persistence Strategy

| Data Type | Storage | Lifetime | Purpose |
|-----------|---------|----------|---------|
| **Selected Flight** | sessionStorage | Session | Pass flight data to booking |
| **Search Context** | sessionStorage | Session | Reconstruct search if needed |
| **Booking Progress** | localStorage | Until booking complete | Resume incomplete booking |
| **UI State (filters, sort)** | React State | Page load | Temporary UI state |
| **Language Preference** | React State | Page load | Could persist to localStorage |
| **Form Input** | React State | Page load | Live form editing |

### API Integration Points

#### Current (Implemented):
1. **POST /api/flights/search**
   - Input: Search criteria
   - Output: Array of flight offers
   - Provider: Amadeus API
   - Status: ✅ Working

2. **GET /api/flights/airports**
   - Input: Search query string
   - Output: Array of matching airports
   - Provider: Amadeus API or static list
   - Status: ✅ Working

#### Future (Needed):
1. **POST /api/flights/confirm**
   - Input: Booking data (passengers, payment, flight)
   - Output: Booking confirmation
   - Provider: Amadeus + Payment Gateway
   - Status: 🔄 Mocked

2. **GET /api/bookings/{id}**
   - Input: Booking ID
   - Output: Booking details
   - Provider: Database
   - Status: ❌ Not implemented

3. **POST /api/payments/process**
   - Input: Payment details
   - Output: Payment confirmation
   - Provider: Stripe/PayPal
   - Status: ❌ Not implemented

4. **POST /api/alerts/create**
   - Input: Email, route, price threshold
   - Output: Alert ID
   - Provider: Database + Email service
   - Status: ❌ Not implemented

---

## User Actions Catalog

### Complete List of User Interactions

#### Landing Page (/)

| Element | Type | Action | Result |
|---------|------|--------|--------|
| Language: EN | Button | Click | Set language to English |
| Language: PT | Button | Click | Set language to Portuguese |
| Language: ES | Button | Click | Set language to Spanish |
| Flights Card | Link | Click | Navigate to /flights |
| Hotels Card | Link | Click | Navigate to /hotels |
| WhatsApp Button | Link | Click | Open WhatsApp chat |
| Phone Link (US) | Link | Click | Initiate phone call |
| Email Link | Link | Click | Open email client |

#### Flight Search Page (/flights)

| Element | Type | Action | Result |
|---------|------|--------|--------|
| Logo | Link | Click | Navigate to / |
| Language Switcher | Button Group | Click | Change UI language |
| Round Trip Tab | Button | Click | Set trip type, show return date |
| One Way Tab | Button | Click | Set trip type, hide return date |
| From Airport Input | Autocomplete | Type/Select | Set origin airport |
| To Airport Input | Autocomplete | Type/Select | Set destination airport |
| Departure Date | Date Picker | Select | Set departure date |
| Return Date | Date Picker | Select | Set return date |
| Adults Counter | Number Input | +/- | Adjust adult count (1-9) |
| Children Counter | Number Input | +/- | Adjust children count (0-9) |
| Infants Counter | Number Input | +/- | Adjust infants count (0-adults) |
| Class Dropdown | Select | Choose | Set travel class |
| Direct Flights | Checkbox | Toggle | Set direct flights filter |
| Search Button | Submit | Click | Validate & navigate to results |

#### Flight Results Page (/flights/results)

| Element | Type | Action | Result |
|---------|------|--------|--------|
| Modify Search | Button | Click | Return to search page |
| Price Range Slider | Range Input | Drag | Filter flights by price |
| Stops Filter | Checkbox Group | Toggle | Filter by connection count |
| Airlines Filter | Checkbox Group | Toggle | Filter by airline |
| Departure Time Filter | Checkbox Group | Toggle | Filter by time of day |
| Max Duration Slider | Range Input | Drag | Filter by flight duration |
| Clear Filters | Button | Click | Reset all filters |
| Sort: Best | Button | Click | Sort by recommendation score |
| Sort: Cheapest | Button | Click | Sort by lowest price |
| Sort: Fastest | Button | Click | Sort by shortest duration |
| Sort: Earliest | Button | Click | Sort by earliest departure |
| Flexible Date Selector | Date Buttons | Click | Change search date, reload |
| Flight Card | Card | View | See flight details |
| Select Flight | Button | Click | Save to session, navigate to booking |
| Compare Flight | Checkbox | Toggle | Add/remove from comparison (max 4) |
| View Comparison | Modal Trigger | Auto-open | Show when 2+ selected |
| Close Comparison | Button | Click | Close modal, keep selections |
| Set Price Alert | Button | Click | Open price alert modal |
| Alert: Enter Email | Input | Type | Enter notification email |
| Alert: Set Threshold | Input | Type | Set price trigger |
| Alert: Confirm | Button | Click | Create price alert |
| Load More | Button | Click | Show next 10 flights |
| Show Price Insights (Mobile) | Button | Click | Toggle insights sidebar |

#### Booking Page (/flights/booking)

**Step Indicator:**
| Element | Type | Action | Result |
|---------|------|--------|--------|
| Step 1 Icon | Button | Click | Navigate to Passengers (if completed) |
| Step 2 Icon | Button | Click | Navigate to Seats (if completed) |
| Step 3 Icon | Button | Click | Navigate to Payment (if completed) |
| Step 4 Icon | Button | Click | Navigate to Review (if completed) |

**Step 1: Passengers**
| Element | Type | Action | Result |
|---------|------|--------|--------|
| Title Dropdown | Select | Choose | Set passenger title |
| First Name | Text Input | Type | Enter first name |
| Last Name | Text Input | Type | Enter last name |
| Date of Birth | Date Picker | Select | Enter DOB |
| Nationality | Text Input | Type | Enter nationality code |
| Passport Number | Text Input | Type | Enter passport number |
| Passport Expiry | Date Picker | Select | Enter expiry date |
| Email | Email Input | Type | Enter contact email |
| Phone | Tel Input | Type | Enter phone number |
| Continue Button | Button | Click | Validate & next step |

**Step 2: Seats**
| Element | Type | Action | Result |
|---------|------|--------|--------|
| Seat Button (Available) | Button | Click | Select seat for passenger |
| Seat Button (Occupied) | Button | Disabled | Cannot select |
| Continue Button | Button | Click | Next step (validation optional) |

**Step 3: Payment**
| Element | Type | Action | Result |
|---------|------|--------|--------|
| Card Number | Text Input | Type | Enter card (auto-formatted) |
| Card Name | Text Input | Type | Enter name (uppercase) |
| Expiry Month | Text Input | Type | Enter MM |
| Expiry Year | Text Input | Type | Enter YY |
| CVV | Text Input | Type | Enter CVV |
| Billing Address | Text Input | Type | Enter address |
| City | Text Input | Type | Enter city |
| ZIP Code | Text Input | Type | Enter ZIP |
| Country | Text Input | Type | Enter country |
| Continue Button | Button | Click | Validate & next step |

**Step 4: Review**
| Element | Type | Action | Result |
|---------|------|--------|--------|
| Terms Checkbox | Checkbox | Toggle | Accept/reject terms |
| Confirm & Pay | Button | Click | Submit booking (if terms accepted) |

**Navigation:**
| Element | Type | Action | Result |
|---------|------|--------|--------|
| Back Button | Button | Click | Previous step |
| Browser Back | Browser | Click | Exit booking (lose progress) |

#### Confirmation Page (/flights/booking/confirmation)

| Element | Type | Action | Result |
|---------|------|--------|--------|
| Copy Booking Ref | Button | Click | Copy to clipboard |
| Add to Calendar | Button | Click | Show calendar options |
| → Google Calendar | Menu Item | Click | Download .ics for Google |
| → Apple Calendar | Menu Item | Click | Download .ics for Apple |
| → Outlook Calendar | Menu Item | Click | Download .ics for Outlook |
| Download PDF | Button | Click | Generate & download PDF |
| Print | Button | Click | Open print dialog |
| Share Trip | Button | Click | Open share options |
| FAQ Item | Details | Click | Expand/collapse answer |
| WhatsApp Contact | Link | Click | Open WhatsApp chat |
| Phone Contact | Link | Click | Initiate phone call |
| Email Contact | Link | Click | Open email client |
| Manage Booking | Button | Click | Navigate to management (future) |
| Add Insurance | Button | Click | Navigate to insurance (future) |

---

## Testing Checklist

### End-to-End Test Scenarios

#### Scenario 1: Happy Path - Complete Round Trip Booking
**Preconditions:** None
**User:** New user, desktop, English

**Steps:**
1. ✅ Land on homepage
2. ✅ Click "Flights"
3. ✅ Select Round Trip
4. ✅ Enter: JFK → LAX
5. ✅ Select: Departure in 2 weeks, Return 1 week later
6. ✅ Passengers: 1 Adult
7. ✅ Class: Economy
8. ✅ Click Search
9. ✅ Verify results load (50 flights)
10. ✅ Apply filter: Direct flights
11. ✅ Sort by: Cheapest
12. ✅ Select first flight
13. ✅ Verify booking page loads
14. ✅ Fill passenger details (all required fields)
15. ✅ Click Continue
16. ✅ Select seat: 12A
17. ✅ Click Continue
18. ✅ Fill payment details (all required fields)
19. ✅ Click Continue
20. ✅ Review all information
21. ✅ Accept terms
22. ✅ Click Confirm & Pay
23. ✅ Verify confirmation page loads
24. ✅ Verify booking reference displayed
25. ✅ Verify email shown
26. ✅ Verify flight details correct
27. ✅ Verify passenger info correct
28. ✅ Verify payment summary correct

**Expected Result:** Successful booking with confirmation
**Actual Result:** [Pass/Fail]

---

#### Scenario 2: One-Way Booking - Mobile
**Preconditions:** None
**User:** New user, mobile (iOS Safari), Spanish

**Steps:**
1. ✅ Land on homepage (mobile view)
2. ✅ Switch language to ES
3. ✅ Click "Vuelos"
4. ✅ Select "Solo Ida"
5. ✅ Enter airports via mobile autocomplete
6. ✅ Select departure date (mobile date picker)
7. ✅ Verify return date hidden
8. ✅ Open passenger dropdown
9. ✅ Adjust to 2 adults
10. ✅ Click "Listo"
11. ✅ Click "Buscar Vuelos"
12. ✅ Verify results load in mobile layout
13. ✅ Open filters (bottom sheet on mobile)
14. ✅ Apply filters
15. ✅ Close filters
16. ✅ Select flight
17. ✅ Complete booking (2 passengers)
18. ✅ Verify mobile-optimized seat map
19. ✅ Complete to confirmation
20. ✅ Verify mobile layout

**Expected Result:** Fully responsive mobile experience
**Actual Result:** [Pass/Fail]

---

#### Scenario 3: Booking Abandonment & Recovery
**Preconditions:** None
**User:** New user, desktop

**Steps:**
1. ✅ Start booking flow
2. ✅ Complete Step 1 (Passengers)
3. ✅ Complete Step 2 (Seats)
4. ✅ Start Step 3 (Payment) - fill card number only
5. ✅ Close browser tab
6. ✅ Reopen same flight booking URL
7. ✅ Verify localStorage restore
8. ✅ Verify on Step 3 (Payment)
9. ✅ Verify passenger data preserved
10. ✅ Verify seat selections preserved
11. ✅ Verify card number preserved
12. ✅ Complete payment
13. ✅ Finish booking
14. ✅ Verify localStorage cleared on success

**Expected Result:** Progress restored successfully
**Actual Result:** [Pass/Fail]

---

#### Scenario 4: Multi-Passenger Booking
**Preconditions:** None
**User:** Business traveler, desktop

**Steps:**
1. ✅ Search with 4 adults
2. ✅ Select Business class
3. ✅ Find and select flight
4. ✅ Enter details for 4 different passengers
5. ✅ Select 4 different seats
6. ✅ Complete payment
7. ✅ Verify all 4 passengers on confirmation
8. ✅ Verify all 4 seat assignments

**Expected Result:** Handles multiple passengers correctly
**Actual Result:** [Pass/Fail]

---

#### Scenario 5: Validation Error Handling
**Preconditions:** None
**User:** Testing validation

**Test Cases:**

**Search Page:**
- ✅ Submit without origin → Error displayed
- ✅ Submit without destination → Error displayed
- ✅ Submit without departure date → Error displayed
- ✅ Submit with past departure date → Error displayed
- ✅ Round trip without return date → Error displayed
- ✅ Return date before departure → Error displayed

**Booking Page:**
- ✅ Passenger: Missing first name → Cannot continue
- ✅ Passenger: Missing last name → Cannot continue
- ✅ Passenger: Invalid email → Cannot continue
- ✅ Payment: Invalid card number → Cannot continue
- ✅ Payment: Past expiry date → Cannot continue
- ✅ Review: Uncheck terms → Cannot confirm

**Expected Result:** All validations prevent submission
**Actual Result:** [Pass/Fail]

---

#### Scenario 6: Premium Features Usage
**Preconditions:** Search completed
**User:** Price-conscious traveler

**Steps:**
1. ✅ View flexible dates
2. ✅ Click date 2 days later
3. ✅ Verify results reload
4. ✅ View price insights
5. ✅ Read price history
6. ✅ Check trend indicator
7. ✅ Open SmartWait advisor
8. ✅ Read recommendation
9. ✅ Select 2 flights for comparison
10. ✅ Verify comparison modal opens
11. ✅ Compare side-by-side
12. ✅ Close comparison
13. ✅ Select 2 more flights (4 total)
14. ✅ Verify comparison modal updates
15. ✅ Click "Set Price Alert"
16. ✅ Enter email
17. ✅ Set price threshold
18. ✅ Confirm alert

**Expected Result:** All premium features work
**Actual Result:** [Pass/Fail]

---

### Edge Cases to Test

#### Data Edge Cases
- [ ] Search with 9 adults, 9 children, 9 infants (max)
- [ ] Search with 1 infant, 0 adults → Should prevent or adjust
- [ ] Search for today's date (same day)
- [ ] Search for date 1 year in future
- [ ] Search with very long airport names
- [ ] Special characters in passenger names
- [ ] International phone number formats
- [ ] Very long billing addresses

#### UI Edge Cases
- [ ] Window resize during booking
- [ ] Switch language mid-booking
- [ ] Multiple tabs open with same booking
- [ ] localStorage full (unlikely but possible)
- [ ] Very slow API response (30+ seconds)
- [ ] API returns 0 flights
- [ ] API returns 1000+ flights
- [ ] Browser back button during booking
- [ ] Refresh during booking

#### Network Edge Cases
- [ ] Offline during search
- [ ] Offline during booking
- [ ] Slow 3G connection
- [ ] API timeout
- [ ] API error (500)
- [ ] API error (404)
- [ ] Rate limiting

#### Security Edge Cases
- [ ] XSS in passenger name
- [ ] SQL injection in search
- [ ] CSRF on payment
- [ ] Invalid booking ID in URL
- [ ] Manipulated price in URL
- [ ] Direct navigation to confirmation without booking

---

### Performance Benchmarks

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Page Load (First Contentful Paint)** | < 1.5s | Lighthouse |
| **Page Load (Largest Contentful Paint)** | < 2.5s | Lighthouse |
| **Time to Interactive** | < 3.5s | Lighthouse |
| **Search Form Submission** | < 100ms | Chrome DevTools |
| **Results API Call** | < 2s | Network tab |
| **Results Rendering** | < 1s | React DevTools |
| **Filter Application** | < 200ms | Performance API |
| **Sort Operation** | < 100ms | Performance API |
| **Booking Step Navigation** | < 50ms | Performance API |
| **localStorage Write** | < 10ms | Performance API |
| **Autocomplete Response** | < 300ms | Network tab |

---

### Mobile-Specific Tests

#### iOS Safari
- [ ] Touch gestures work (tap, swipe)
- [ ] Date pickers use native iOS picker
- [ ] Autocomplete doesn't auto-zoom on focus
- [ ] Payment form uses appropriate keyboards
- [ ] Sticky elements work correctly
- [ ] Modals are scrollable
- [ ] 100vh issues resolved
- [ ] Safe area insets respected

#### Android Chrome
- [ ] Touch gestures work
- [ ] Date pickers use native Android picker
- [ ] Back button behaves correctly
- [ ] Keyboard doesn't obscure inputs
- [ ] Pull-to-refresh disabled where needed
- [ ] Viewport meta tag correct

#### Responsive Breakpoints
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Large desktop (1440px+)

---

### Accessibility Checks

#### WCAG 2.1 AA Compliance
- [ ] All images have alt text
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] Headings in correct order (h1 → h2 → h3)
- [ ] Form fields have labels
- [ ] Error messages announced
- [ ] Skip navigation links
- [ ] Tables have proper headers
- [ ] Language attribute set
- [ ] Page title descriptive

#### Screen Reader Testing
- [ ] VoiceOver (iOS)
- [ ] TalkBack (Android)
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)

#### Keyboard Navigation
- [ ] Tab order logical
- [ ] All interactive elements focusable
- [ ] No keyboard traps
- [ ] Escape closes modals
- [ ] Enter submits forms
- [ ] Arrow keys navigate lists/dropdowns

---

## Known Issues & Future Enhancements

### Known Limitations

#### Current Issues

**High Priority:**
1. **No Real Payment Processing**
   - Status: Payment is simulated only
   - Impact: Cannot accept actual bookings
   - Workaround: Contact support for manual booking
   - Fix Required: Stripe/PayPal integration
   - ETA: Sprint 3

2. **No User Authentication**
   - Status: No user accounts or login
   - Impact: Cannot save preferences, view booking history
   - Workaround: Bookmark confirmation pages
   - Fix Required: Auth system (NextAuth/Clerk)
   - ETA: Sprint 4

3. **No Booking Management**
   - Status: Cannot modify/cancel bookings
   - Impact: Users must contact support
   - Workaround: Manual support process
   - Fix Required: Booking management portal
   - ETA: Sprint 5

4. **No Email Confirmations**
   - Status: No automated emails sent
   - Impact: Users don't receive confirmation emails
   - Workaround: Manual emails from support
   - Fix Required: Email service integration (SendGrid/Resend)
   - ETA: Sprint 3

**Medium Priority:**
5. **PDF Ticket Generation is Placeholder**
   - Status: Button exists but doesn't generate PDF
   - Impact: Users cannot download ticket
   - Workaround: Print confirmation page
   - Fix Required: PDF generation library
   - ETA: Sprint 4

6. **Calendar Events are Placeholder**
   - Status: Calendar buttons don't generate .ics files
   - Impact: Users must manually add to calendar
   - Workaround: Manual calendar entry
   - Fix Required: ICS file generation
   - ETA: Sprint 4

7. **Price Alerts Non-Functional**
   - Status: UI exists but no backend
   - Impact: Alerts not sent
   - Workaround: Manual price monitoring
   - Fix Required: Alert system + email notifications
   - ETA: Sprint 5

8. **No Multi-Currency Support**
   - Status: USD only
   - Impact: International users see USD only
   - Workaround: Manual conversion
   - Fix Required: Currency API integration
   - ETA: Sprint 6

**Low Priority:**
9. **Language Preference Not Persistent**
   - Status: Resets on page reload
   - Impact: Users must reselect language
   - Workaround: Remember to select each visit
   - Fix Required: Save to localStorage/cookies
   - ETA: Sprint 3

10. **No Saved Passenger Profiles**
    - Status: Must re-enter data each time
    - Impact: Repetitive data entry
    - Workaround: Manual entry
    - Fix Required: User profiles + database
    - ETA: Sprint 6

---

### Planned Improvements

#### User Experience Enhancements

**Phase 1: Core Functionality (Q1 2026)**
- [ ] Real payment processing (Stripe)
- [ ] Email confirmation system
- [ ] SMS notifications
- [ ] PDF ticket generation
- [ ] Calendar event generation
- [ ] Language persistence
- [ ] Mobile app (React Native)

**Phase 2: User Accounts (Q2 2026)**
- [ ] User registration/login
- [ ] Saved passenger profiles
- [ ] Booking history
- [ ] Favorite routes
- [ ] Loyalty program
- [ ] Referral system
- [ ] Social login (Google, Facebook)

**Phase 3: Advanced Features (Q3 2026)**
- [ ] Price alert system (working)
- [ ] Multi-city flights
- [ ] Flexible date search (calendar view)
- [ ] Airline seat maps (real-time)
- [ ] Upgrade bidding
- [ ] Group bookings (10+ passengers)
- [ ] Corporate accounts
- [ ] Travel agent portal

**Phase 4: Expansion (Q4 2026)**
- [ ] Hotels full implementation
- [ ] Car rentals
- [ ] Tours & activities
- [ ] Travel insurance
- [ ] Vacation packages
- [ ] Cruise bookings
- [ ] Rail tickets (Europe, Japan)

---

#### Technical Improvements

**Performance:**
- [ ] Implement Next.js ISR for static pages
- [ ] Add Redis caching for API responses
- [ ] Optimize images with next/image
- [ ] Implement lazy loading for components
- [ ] Add service worker for offline support
- [ ] Code splitting optimization
- [ ] Database query optimization

**Developer Experience:**
- [ ] Add comprehensive TypeScript types
- [ ] Implement E2E tests (Playwright)
- [ ] Add unit tests (Jest/Vitest)
- [ ] Set up CI/CD pipeline
- [ ] Add error monitoring (Sentry)
- [ ] Implement feature flags
- [ ] Add design system/Storybook

**Security:**
- [ ] Implement rate limiting
- [ ] Add CAPTCHA on booking
- [ ] Enable CSP headers
- [ ] Add input sanitization
- [ ] Implement audit logging
- [ ] Add fraud detection
- [ ] PCI DSS compliance

**Analytics:**
- [ ] Google Analytics 4
- [ ] Conversion tracking
- [ ] Heatmaps (Hotjar)
- [ ] A/B testing framework
- [ ] Funnel analysis
- [ ] User session recording
- [ ] Performance monitoring

---

### Feature Requests to Consider

**From User Feedback (Hypothetical):**
1. **"Save search" functionality**
   - Allow users to save frequent searches
   - Quick re-run with updated dates
   - Implementation: User accounts + database

2. **"Best time to book" predictor**
   - AI-powered booking time suggestions
   - Based on historical data
   - Implementation: ML model + historical data

3. **"Flight change notifications"**
   - Alert on delays, gate changes, cancellations
   - Real-time push notifications
   - Implementation: Airline APIs + push service

4. **"Split payment" option**
   - Pay with multiple cards
   - Pay over time (installments)
   - Implementation: Payment gateway features

5. **"Group travel coordinator"**
   - Manage bookings for groups
   - Seat selection coordination
   - Implementation: Group booking module

6. **"Carbon footprint calculator"**
   - Show environmental impact
   - Offer carbon offset options
   - Implementation: Emissions API + offset partner

7. **"Virtual assistant chatbot"**
   - AI-powered travel assistant
   - Answer common questions
   - Implementation: LLM integration (GPT)

8. **"Travel itinerary planner"**
   - Complete trip planning
   - Accommodation, activities, transport
   - Implementation: Multi-service integration

---

### Technical Debt

**Current Technical Debt:**

1. **Mock Data in Production Code**
   - Location: Confirmation page, Price insights
   - Issue: Hard-coded mock data
   - Resolution: Replace with API calls
   - Priority: High

2. **Inconsistent Error Handling**
   - Location: Various API calls
   - Issue: Some errors not caught
   - Resolution: Standardize error boundaries
   - Priority: Medium

3. **Missing PropTypes/TypeScript Interfaces**
   - Location: Some components
   - Issue: Incomplete type coverage
   - Resolution: Add complete TypeScript types
   - Priority: Low

4. **Hardcoded Strings (Not All Translated)**
   - Location: Various components
   - Issue: Some text not in translation files
   - Resolution: Extract all strings
   - Priority: Medium

5. **Duplicate Code in Components**
   - Location: Multiple files
   - Issue: Similar logic repeated
   - Resolution: Create shared utilities
   - Priority: Low

6. **No API Response Caching**
   - Location: API routes
   - Issue: Repeated identical calls
   - Resolution: Implement caching layer
   - Priority: Medium

7. **localStorage/sessionStorage Not Type-Safe**
   - Location: Booking flow
   - Issue: Manual JSON parsing
   - Resolution: Create typed storage wrapper
   - Priority: Low

---

## Conclusion

### Current State Summary

**Implemented & Working:**
- ✅ Full flight search functionality
- ✅ Comprehensive results display with filtering/sorting
- ✅ Premium features (comparison, alerts UI, insights)
- ✅ Complete booking flow (4 steps)
- ✅ Professional confirmation page
- ✅ Trilingual support (EN/PT/ES)
- ✅ Fully responsive design
- ✅ Client-side form validation
- ✅ Progress persistence (localStorage)
- ✅ Modern UI/UX with animations

**Partially Implemented:**
- 🔄 Hotels (basic search UI only)
- 🔄 Payment processing (simulated)
- 🔄 Email notifications (placeholder)
- 🔄 PDF generation (placeholder)
- 🔄 Calendar events (placeholder)

**Not Implemented:**
- ❌ User authentication
- ❌ Booking management
- ❌ User profiles
- ❌ Real payment processing
- ❌ Car rentals
- ❌ Tours & activities
- ❌ Travel insurance

### Next Steps Priority

**Immediate (Sprint 1-2):**
1. Payment gateway integration (Stripe)
2. Email notification system
3. Real booking confirmation API
4. PDF ticket generation
5. Calendar event files

**Short-term (Sprint 3-4):**
1. User authentication system
2. User profiles & saved passengers
3. Language persistence
4. Multi-currency support
5. Mobile app MVP

**Medium-term (Sprint 5-8):**
1. Booking management portal
2. Hotels full implementation
3. Price alerts backend
4. Corporate accounts
5. Advanced filtering

**Long-term (Q3-Q4 2026):**
1. Car rentals
2. Tours & activities
3. Complete travel platform
4. Loyalty program
5. Partner integrations

---

**Document Prepared By:** Claude Code Assistant
**Review Status:** Draft v1.0
**Next Review:** After first production deployment

