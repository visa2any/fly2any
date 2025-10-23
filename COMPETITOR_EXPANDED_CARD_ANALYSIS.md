# Competitor Analysis: Flight Card Expanded Views

**Research Date:** October 22, 2025
**Scope:** Google Flights, Kayak, Skyscanner, Expedia
**Focus:** Per-leg information display, flight quality indicators, fare information hierarchy, and UX best practices

---

## Executive Summary

This analysis reveals that major flight booking competitors have evolved toward **progressive disclosure** patterns with a focus on transparency, per-segment details, and environmental awareness. Key trends include:

- **Per-leg baggage display** is becoming standard (Google Flights, Kayak)
- **CO2 emissions** are now first-class features (Google Flights leading)
- **Fare class transparency** with clear "what's included" breakdowns
- **Visual hierarchy** that prioritizes essential info while making details accessible
- **Mobile-first design** with collapsible sections and "See more" patterns

---

## Google Flights

### Per-Leg Information Display

**Baggage Allowances:**
- **Feature Status:** Implemented for domestic US and Canadian flights (as of 2024)
- **Display Method:** Shows baggage allowances for each fare in initial search results
- **Visual Indicators:**
  - Small wheelie bag icon = carry-on allowance
  - Larger suitcase icon = checked baggage
  - **Important:** Different allowances per segment are clearly displayed
- **Geographic Limitations:**
  - Domestic US: Both carry-on and checked bag fees
  - International: Only carry-on bag fees shown (as of search date)
- **Detailed View:** Clicking into flight details shows exact fees and links to airline baggage policy

**Fare Type Variations:**
- Not explicitly shown per-leg in search results
- Focus is on total trip fare class selection

### Flight Quality Display

**On-Time Performance:**
- **Status:** Not directly integrated into Google Flights interface
- **Data Source:** Information exists via BTS (Bureau of Transportation Statistics) but not displayed in cards
- **Current Gap:** No visible OTP indicators in expanded cards

**CO2 Emissions (Major Feature):**
- **Display Level:** Per-flight basis (entire itinerary)
- **Calculation Factors:**
  - Origin and destination
  - Aircraft type (newer = less polluting)
  - Seating class (premium/business = higher emissions due to space)
  - Number of seats per class
- **Visual Indicators:**
  - Green badge for "significantly lower emissions"
  - Labels: "Higher," "Typical," or "Lower" emissions
  - Absolute values in kg CO2-equivalent
- **Sorting:** Users can sort results by emissions
- **Data Sources:** European Environmental Agency + airline-specific data

**Comfort/Aircraft Information:**
- **Seat Type Detail:** Shows seat configuration (angled-flat, lie-flat, suites)
- **Premium Cabin Detail:** Describes Delta One Suite, Air France business class specifics
- **Aircraft Type:** Displayed to help users understand emissions and comfort

**Reviews:**
- Not a primary feature in Google Flights interface

### Fare Information Display

**Fare Class Selection:**
- **Top-Level Filter:** Dropdown menu in search bar
  - "Economy (include basic)"
  - "Economy (exclude basic)"
  - Premium Economy
  - Business Class
  - First Class
- **Price Comparison:** Shows price differences between basic economy, standard economy, extra legroom (e.g., Delta Comfort Plus), and first class

**Fare Class Standards (IATA Resolution 728):**
- First Class: P, F, A
- Business: J, C, D, I, Z
- Premium Economy: W
- Economy: S, Y, H, B, K, L, M, N, Q, T, V, X

**What's Included:**
- Details shown at bottom of flight detail view
- Links to airline baggage policy for self-service lookup
- Clear indication when basic economy excludes standard amenities

### Information Hierarchy

**Collapsed State (Search Results):**
- Price (prominently displayed)
- Airline and flight number
- Departure/arrival times
- Duration and stops
- Baggage icons (carry-on/checked)
- CO2 emissions badge

**Immediately After Expanding:**
- Full flight routing with layover details
- Baggage fee breakdown with links
- Fare options comparison
- CO2 emissions details
- Booking provider options

**Secondary/Collapsible:**
- Detailed airline baggage policy (external link)
- Alternative booking providers
- Historical price data (separate tab/view)

### Key UX Patterns

1. **Progressive Disclosure:** Essential info upfront, details on-demand
2. **Baggage Fee Transparency:** Integrated into price display with filter capability
3. **Environmental Awareness:** CO2 as a first-class sorting/filtering dimension
4. **Multi-Provider Comparison:** Shows booking options from different sites
5. **Filter-First Approach:** Strong filtering by bags, stops, airlines, times, etc.

---

## Kayak

### Per-Leg Information Display

**Baggage Allowances:**
- **Baggage Fee Assistant:** Released late 2018, refined through 2024
- **Interactive Feature:** Sits on top of search results
- **Functionality:**
  - Users select number of bags
  - Results update in real-time with fees included
  - Shows actual total cost including baggage fees
- **Per-Segment Awareness:**
  - **Critical:** Different baggage policies for outbound vs. return are noted
  - Especially important for "Hacker Fares" (combining one-way tickets from different airlines)
  - Warning: One airline may include free carry-on on outbound, another may not on return

**Hacker Fares (Multi-Carrier Itineraries):**
- Combines one-way tickets from different airlines
- **User Warning:** Different rules and policies (including baggage fees) may apply in each direction
- Requires users to check each segment's policies separately

### Flight Quality Display

**On-Time Performance:**
- **Status:** Not directly integrated into expanded cards
- **Industry Data Available:** OAG and Cirium provide OTP data (flights on-time if <15 min late)
- **Current Implementation:** Not visible in Kayak's flight cards

**Amenities Display:**
- **Partnership:** Integrated with Routehappy for in-flight amenities
- **Information Shown:**
  - WiFi availability
  - TV screens/entertainment
  - Seat pitch and comfort indicators
- **Fare Type Details:** Explains what comes with each fare, including seat assignment availability and change policies

**Reviews:**
- **Third-Party Rating:** Star ratings for booking sites (helps vet unfamiliar providers)
- **User Feedback:** Number of users who rated each booking site

### Fare Information Display

**Fare Type Transparency:**
- Shows multiple fare options from legacy carriers
- More detail than competitors on in-flight amenities per fare
- Clear explanation of fare restrictions and policies

**What's Included:**
- Detailed breakdown available via KAYAK.ai (2024 update)
- Dedicated flight details page for:
  - Fare conditions
  - Baggage rules
  - Layover information

**Price Display:**
- All-in pricing option with baggage fees
- Real-time updates as filters change

### Information Hierarchy

**Collapsed State:**
- Price
- Airline(s)
- Times and duration
- Number of stops
- Basic amenities icons

**Immediately After Expanding:**
- Full routing details
- Layover durations and airports
- Amenities breakdown (WiFi, entertainment, etc.)
- Fare options comparison
- Booking provider list

**Secondary/Collapsible (via KAYAK.ai):**
- Detailed fare conditions
- Complete baggage rules
- Change/cancellation policies

### Key UX Patterns

1. **Baggage Fee Assistant:** Proactive, interactive baggage fee calculation
2. **Hacker Fares Warning System:** Clear alerts about mixed-carrier policies
3. **Amenities-First Display:** Routehappy integration for comfort/service details
4. **Multiple Fare Options:** Shows various fare types from same airline
5. **AI-Enhanced Details:** KAYAK.ai provides collapsible detailed view with chat interface
6. **Interactive Filters:** Toggle filters without retyping search

---

## Skyscanner

### Per-Leg Information Display

**Baggage Allowances:**
- **Display Method:** Shown when selecting a flight, before redirecting to booking site
- **Information Provided:**
  - Indicates if checked baggage is included
  - Flags when baggage fees may apply
  - Notes about basic economy restrictions
- **Transparency Focus:** Warnings about potential fees, but details confirmed on booking site
- **Redirect Model:** Baggage added during booking on airline/OTA website

**Self-Transfer Flights:**
- **Warning System:** Alerts users to self-transfer connections
- **Key Information:**
  - May use different airlines
  - May depart from different airport than arrival
  - **Critical:** Must pick up and recheck baggage between flights
- **Risk Disclosure:** Clear about connection responsibility

### Flight Quality Display

**On-Time Performance:**
- Not a visible feature in Skyscanner's interface

**Comfort/Reviews:**
- Not prominently displayed in flight cards

**Transparency:**
- Star ratings for third-party booking sites
- User review counts for booking providers

### Fare Information Display

**What's Included:**
- Baggage inclusion status shown in results
- Fare details provided when redirected to booking site
- Users encouraged to verify all policies before finalizing

**Price Transparency:**
- All prices include estimated taxes and charges
- Prices update when transferred to airline/OTA website
- Clear disclosure about estimate vs. final price

### Design System (Skyscanner.design - 2024/2025)

**Card Component (BpkCards):**
- **Types:** Card, Divided Card, Card Wrapper
- **Interaction:** Entire card is clickable
- **Shadow States:**
  - Default: `bpk-shadow-sm`
  - Hover: `bpk-shadow-lg`
- **Padding:** `bpk-spacing-base` (16px) by default
- **Layout Options:**
  - Grid layout
  - Vertical stack
  - Carousel
- **Use Case:** Inventory cards for flights (desktop and mobile)

**Brand Foundation:**
- **Grid System:** "Flightpath" - core structure for all designs
- **Purpose:** Break down complex datasets into digestible, distinct areas

### Information Hierarchy

**Collapsed State:**
- Price
- Airline(s)
- Times and duration
- Stops
- Baggage inclusion indicator

**Immediately After Expanding/Selecting:**
- Full flight details
- Booking provider list with prices
- Baggage inclusion confirmation
- Fare details link

**Secondary:**
- Complete baggage policies (on booking site)
- Detailed fare rules (on booking site)
- Self-transfer instructions if applicable

### Key UX Patterns

1. **Redirect Model:** Search on Skyscanner, book on airline/OTA site
2. **Transparency Warnings:** Proactive flags for basic economy, self-transfers, baggage fees
3. **Provider Ratings:** Star ratings and review counts for booking sites
4. **Shadow Hierarchy:** Visual depth changes on hover (sm → lg shadow)
5. **Mobile-First Cards:** Designed for both mobile and desktop from ground up
6. **Grid-Based Layout:** "Flightpath" grid system for consistent structure

---

## Expedia

### Research Limitations

The search results for Expedia focused primarily on loyalty programs (One Key) and credit card offerings rather than UX/UI patterns for expanded flight cards. Specific findings:

**One Key Loyalty Integration:**
- Rewards system across flights, hotels, car rentals
- OneKeyCash earned per booking
- Credit card integration (Wells Fargo partnership)

**Flight Rewards:**
- 1 Expedia Rewards point per $5 spent
- Flights earn only 0.2% back when not part of package
- Rewards not earned on taxes and fees

**Flight Credits:**
- Coupons and Credits page in user account
- Expiration dates and amounts tracked

**Information Gaps:**
- No specific data on expanded card UX patterns
- No information on per-leg baggage display
- No details on fare type or amenities display in cards

---

## Industry Best Practices Summary

### 1. Progressive Disclosure Pattern
**Principle:** Show essential information immediately, provide details on-demand

**Implementation:**
- Collapsed cards show: Price, airline, times, stops, key indicators (baggage, CO2)
- Expanded cards reveal: Full routing, fees, fare options, amenities
- Deep details available via: External links, modals, or AI chat interfaces

**Benefit:** Prevents information overload while ensuring transparency

---

### 2. Per-Segment Baggage Transparency

**Industry Trend:** Moving from "per-trip" to "per-segment" baggage display

**Current Leaders:**
- **Google Flights:** Per-flight baggage icons in search results (US/Canada)
- **Kayak:** Baggage Fee Assistant with per-segment awareness for Hacker Fares
- **Skyscanner:** Flags baggage inclusion status, warns about self-transfers

**Best Practice:**
- Display different baggage allowances for outbound vs. return
- Warn when mixing carriers with different policies
- Show fees in total price or via interactive calculator
- Link to airline baggage policy for verification

---

### 3. Environmental Awareness (CO2 Emissions)

**Industry Leader:** Google Flights

**Implementation:**
- Per-flight CO2 estimates in kg
- Green badges for low-emission flights
- Sortable by emissions (alongside price, duration)
- Factors: aircraft type, distance, seating class

**User Value:**
- Helps eco-conscious travelers
- Encourages airlines to use efficient aircraft
- Raises awareness about premium cabin impact

**Emerging Standard:** Expect competitors to adopt similar features

---

### 4. Fare Type and Amenities Transparency

**Key Information to Display:**
- What's included in the fare (baggage, seat selection, changes)
- Restrictions (basic economy limitations)
- Amenities (WiFi, entertainment, seat type)

**Current Approaches:**
- **Google Flights:** Filter by fare class, show price differences, link to policies
- **Kayak:** Detailed fare conditions via KAYAK.ai, Routehappy amenities integration
- **Skyscanner:** Flag basic economy, redirect to booking site for full details

**Best Practice:**
- Clear "what's included" breakdown visible in expanded card
- Visual icons for amenities (WiFi, entertainment, seat pitch)
- Warning badges for restrictive fares
- Comparison between fare types for same flight

---

### 5. Visual Hierarchy and Information Architecture

**Hierarchy Levels:**

**Level 1 (Always Visible - Collapsed State):**
- Price (largest, most prominent)
- Airline logo and name
- Departure/arrival times
- Duration and stops
- Key badges (emissions, baggage, on-time)

**Level 2 (Expanded State):**
- Full routing with layover details
- Baggage fees and policies
- Fare options comparison
- Amenities breakdown
- Booking provider options

**Level 3 (On-Demand/External):**
- Complete airline policies (external link)
- Historical price data (separate view)
- Detailed seat maps
- Full fare rules

**Design Principles:**
- Clean, minimalist design to avoid visual overload
- "See more" / "Show less" for progressive disclosure
- Visual hierarchy guides eye to most important info
- Structured sections with clear spacing and headings

---

### 6. Mixed-Carrier and Multi-Leg Awareness

**Challenge:** Round trips may involve different airlines, fare classes, or policies per leg

**Current Solutions:**
- **Google Flights:** Multi-airline itinerary feature (October 2024)
- **Kayak:** Hacker Fares with explicit warnings about policy differences
- **Skyscanner:** Self-transfer flight warnings

**Best Practice:**
- Clearly label when different airlines operate outbound vs. return
- Warn about different baggage policies per leg
- Indicate if separate tickets (affects connection protection)
- Show airport changes for self-transfers

---

### 7. Mobile Responsiveness

**Design Considerations:**
- Cards designed for mobile and desktop simultaneously (Skyscanner approach)
- Collapsible sections critical on small screens
- Touch-friendly tap areas (Kayak learned from mobile abandonment)
- Shadow/depth changes for hover (desktop) vs. tap (mobile)

**Best Practice:**
- Minimum 44x44pt touch targets
- Avoid reliance on hover states for critical info
- Progressive disclosure even more critical on mobile
- Sticky price/CTA as user scrolls expanded details

---

### 8. Third-Party Provider Transparency

**Booking Model Differences:**
- **Google Flights:** Shows multiple booking providers with prices
- **Kayak:** Lists providers with star ratings and reviews
- **Skyscanner:** Redirect model with provider ratings

**Best Practice:**
- Show multiple booking options if available
- Display provider ratings/reviews (builds trust)
- Indicate if booking directly with airline vs. OTA
- Be transparent about price differences between providers

---

### 9. Real-Time and Interactive Features

**Emerging Patterns:**
- **Interactive Filters:** Kayak's toggle filters that update results without re-search
- **AI Chat Interfaces:** KAYAK.ai for detailed Q&A about flights
- **Baggage Calculators:** Kayak's Baggage Fee Assistant
- **Price Tracking:** Alerts for price drops

**User Benefit:**
- Faster exploration without page reloads
- Conversational access to complex information
- Proactive cost calculation (no surprises at checkout)

---

### 10. Redundancy Handling

**Pattern Observed Across Competitors:**

**Show Once (Don't Repeat):**
- Total trip price (not per-leg in collapsed state)
- Aircraft type if same for all segments
- Policies that apply to entire trip

**Show Per-Leg:**
- Departure/arrival times (obviously)
- Baggage allowances if different
- Airline if mixed-carrier
- Fare class if different per segment

**Balance:**
- Collapsed state: Trip-level summary
- Expanded state: Segment-level details
- Avoid repeating "round-trip" information twice unless it differs per leg

---

## Specific Findings on Expanded Card UX

### What Information Appears Immediately After Expanding?

**Consensus Across Competitors:**

1. **Full Flight Routing**
   - All segments with layovers
   - Airport codes and names
   - Layover duration and airports
   - Aircraft type per segment

2. **Baggage and Fees**
   - Baggage allowance or fees
   - Link to full baggage policy
   - Calculator or breakdown

3. **Fare Options**
   - Different fare classes available for same flight
   - Price comparison between fare types
   - What's included with each fare

4. **Booking Options**
   - List of booking providers
   - Prices from each provider
   - Provider ratings/reviews

5. **Key Attributes**
   - Amenities (WiFi, entertainment)
   - CO2 emissions (Google Flights)
   - Seat type (business class details)

### What Information is Secondary/Collapsible?

**Common Secondary Elements:**

1. **Detailed Policies** (external links or modals)
   - Complete fare rules
   - Change/cancellation policies
   - Airline-specific baggage policies

2. **Historical Data** (separate tabs/views)
   - Price history graphs
   - Typical pricing for route

3. **Advanced Filters** (collapsible panels)
   - Specific airlines
   - Layover duration
   - Departure time ranges

4. **User Reviews** (if available)
   - Airline reviews
   - Booking provider reviews

5. **Alternative Flights** (nearby dates/times)
   - Cheapest dates calendar
   - Similar flights at different times

---

## Recommendations for Fly2Any

Based on this competitive analysis, here are specific, actionable recommendations:

### 1. Implement Per-Segment Baggage Display

**Priority:** HIGH
**Current Industry Standard:** Google Flights, Kayak

**Recommendation:**
- Display baggage allowance icons in collapsed card (✓ included, $ fee applies)
- In expanded view, show different allowances for outbound vs. return if applicable
- For round trips, clearly label: "Outbound: 1 checked bag included | Return: $30 per checked bag"
- Add visual badges or icons (free bag = green checkmark, fee = yellow dollar sign)

**User Benefit:**
- No surprises at checkout
- Easy comparison between flights based on total cost
- Competitive parity with Google Flights

---

### 2. Add CO2 Emissions Display

**Priority:** MEDIUM-HIGH
**Industry Leader:** Google Flights (launched 2021, refined through 2024)

**Recommendation:**
- Calculate per-flight CO2 estimates using:
  - Aircraft type (from flight data)
  - Distance (origin to destination)
  - Seating class (economy vs. premium)
- Display in collapsed card as badge: "🌱 Low emissions" or "X kg CO2"
- Add filter/sort option: "Sort by emissions"
- Use Google's Travel Impact Model (open source): https://github.com/google/travel-impact-model

**User Benefit:**
- Appeals to eco-conscious travelers
- Differentiates Fly2Any as environmentally aware
- Aligns with industry trend

---

### 3. Enhance Visual Hierarchy for Expanded Cards

**Priority:** HIGH
**Issue:** Prevent information overload, improve scannability

**Recommendation:**

**Collapsed State:**
- Keep: Price (largest), airline, times, duration, stops
- Add: Baggage icon, CO2 badge

**Immediately Expanded (Level 2):**
- Full routing with layover details (already have)
- Baggage fees per segment (NEW)
- Amenities icons (WiFi, entertainment) if data available
- Fare options comparison (if multiple classes available)

**Secondary/On-Demand (Level 3):**
- "View full fare rules" (link or modal)
- "See detailed baggage policy" (external link to airline)
- Seat map preview (if available)
- Historical pricing (separate view)

**Design Pattern:**
- Use "See more" / "Show less" collapsible sections
- Add visual dividers between sections
- Increase spacing between major sections (Smashing Magazine best practice)

**User Benefit:**
- Less overwhelming
- Faster scanning for key details
- Progressive disclosure supports different user needs

---

### 4. Implement Fare Type Transparency

**Priority:** MEDIUM
**Current Best Practice:** Google Flights filter, Kayak detailed view

**Recommendation:**
- If multiple fare classes available for same flight, show comparison in expanded card
- Display "What's included" for selected fare:
  - ✓ 1 carry-on included
  - ✓ 1 checked bag included (or: $ $30 per checked bag)
  - ✓ Seat selection included (or: $ Fee applies)
  - ✓ Changes allowed (or: ✗ No changes)
- Add filter in search: "Economy (exclude basic)" option
- Use icons for quick scanning

**User Benefit:**
- Transparency about restrictive basic economy fares
- Informed decision-making
- Reduces post-booking complaints

---

### 5. Add Amenities Display (If Data Available)

**Priority:** LOW-MEDIUM
**Industry Example:** Kayak with Routehappy integration

**Recommendation:**
- If Amadeus API provides amenities data, display:
  - WiFi availability (icon)
  - Entertainment system (icon)
  - Power outlets (icon)
  - Seat pitch/legroom (text or icon)
- Show in expanded card as icon row or badges
- Don't overcrowd; keep it simple

**Implementation Note:**
- Check if current Amadeus API calls include amenities
- May require additional API endpoints or data enrichment

**User Benefit:**
- Better understanding of comfort level
- Differentiates similar flights at similar prices
- Reduces need to visit airline websites

---

### 6. Warn About Mixed-Carrier Itineraries

**Priority:** MEDIUM
**Industry Example:** Kayak Hacker Fares, Skyscanner self-transfers

**Recommendation:**
- If round trip uses different airlines for outbound vs. return:
  - Add warning badge: "⚠️ Multiple airlines"
  - In expanded view, clearly label which airline operates which leg
  - Note: "Baggage policies may differ between outbound and return flights"
- If separate tickets (not interlined):
  - Add warning: "⚠️ Self-transfer - you must collect and recheck baggage"
  - Note: "Connection not protected. Separate tickets."

**User Benefit:**
- Prevents confusion at airport
- Sets accurate expectations about baggage handling
- Reduces support inquiries

---

### 7. Improve Mobile Expanded Card UX

**Priority:** HIGH
**Current Issue:** Expanded cards can be overwhelming on mobile

**Recommendation:**
- Ensure expanded card is scrollable within card (not whole page)
- Use collapsible sections more aggressively on mobile:
  - "Flight details" (collapsed by default on mobile)
  - "Baggage & fees" (collapsed by default)
  - "What's included" (collapsed by default)
  - Each section expands independently
- Sticky footer with price and "Select" button
- Minimum 44x44pt touch targets (Apple HIG standard)
- Test on actual devices for tap accuracy

**Design Pattern:**
- Accordion-style sections
- Icons + short labels for section headers
- Smooth expand/collapse animations

**User Benefit:**
- Less scrolling
- Easier to focus on relevant information
- Faster mobile booking flow

---

### 8. Add Interactive Baggage Fee Calculator

**Priority:** LOW-MEDIUM
**Industry Leader:** Kayak Baggage Fee Assistant

**Recommendation:**
- In expanded card or as a modal, add simple calculator:
  - "How many bags?" → User selects 0, 1, 2, 3+
  - "Checked or carry-on?" → User selects
  - Instant update to total price
- Pre-populate based on search parameters if available
- Show breakdown: "Flight: $450 | Baggage (2 checked): $60 | Total: $510"

**User Benefit:**
- Transparent total cost before booking
- Easy comparison between flights
- Reduces cart abandonment at checkout

---

### 9. Leverage Fly2Any's Existing Features

**Current Advantages (from codebase):**
- Deal Score badge (unique differentiator)
- Price insights
- Flexible dates calendar
- Multi-airport search

**Recommendation:**
- Ensure Deal Score appears in collapsed AND expanded card
- Add tooltip or "?" icon explaining Deal Score in expanded view
- Show price comparison vs. typical price for route (if available)
- Keep these unique features prominent—they differentiate from competitors

**User Benefit:**
- Fly2Any's unique value propositions are clear
- Users trust Deal Score as decision aid

---

### 10. Implement "What's Changed" Highlighting for Filters

**Priority:** LOW
**Industry Example:** Kayak interactive filters (2024 update)

**Recommendation:**
- When user changes filters (e.g., adds baggage to search), highlight what changed in results:
  - Price update animation
  - "Prices updated to include 1 checked bag" banner
- Allow toggling filters without re-searching entire page
- Use smooth transitions, not jarring page reloads

**User Benefit:**
- Faster exploration
- Clearer understanding of filter impact
- Modern, responsive feel

---

## Conclusion

The competitive landscape for flight booking has evolved significantly toward:

1. **Transparency:** Per-segment baggage fees, fare restrictions, total cost clarity
2. **Environmental Awareness:** CO2 emissions as a primary decision factor
3. **Progressive Disclosure:** Show essentials immediately, details on-demand
4. **Mobile-First Design:** Collapsible sections, touch-friendly interfaces
5. **Interactive Tools:** Baggage calculators, AI chat interfaces, dynamic filters

**Key Takeaway for Fly2Any:**

To remain competitive, prioritize:
1. Per-segment baggage display (HIGH priority)
2. Enhanced visual hierarchy for expanded cards (HIGH priority)
3. CO2 emissions display (MEDIUM-HIGH priority)
4. Mobile UX improvements for expanded cards (HIGH priority)
5. Fare type transparency with "what's included" (MEDIUM priority)

These features are quickly becoming table stakes in the industry, led by Google Flights and refined by Kayak and Skyscanner. Implementing them will bring Fly2Any to feature parity while your unique Deal Score and price insights continue to differentiate.

---

## Appendix: Data Sources

**On-Time Performance Data Providers:**
- Bureau of Transportation Statistics (BTS) - US DOT
- OAG - Global airline and airport OTP data
- Cirium - Industry gold standard for OTP measurement (16+ years of data)

**CO2 Emissions Calculation:**
- Google Travel Impact Model: https://github.com/google/travel-impact-model
- European Environmental Agency data
- ICAO (International Civil Aviation Organization) standards

**Fare Class Standards:**
- IATA Resolution 728 - RBD (Reservation Booking Designator) classifications

**Design Systems:**
- Skyscanner Design System: https://www.skyscanner.design/
- UX best practices: Smashing Magazine, Baymard Institute

---

**Document prepared for:** Fly2Any Development Team
**Next Steps:** Prioritize recommendations, estimate implementation effort, begin with HIGH priority items
