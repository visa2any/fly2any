/**
 * Knowledge Query System
 * Smart query function to retrieve relevant travel knowledge
 */

import {
  BAGGAGE_POLICIES,
  FARE_CLASSES,
  AIRLINE_ALLIANCES,
  FLIGHT_TERMS,
  CANCELLATION_POLICIES,
  CHANGE_FEES,
  getBaggagePolicy,
  getFareClass,
  getAirlineAlliance
} from './flights';

import {
  CHECKIN_POLICIES,
  HOTEL_CANCELLATION_POLICIES,
  STAR_RATING_SYSTEM,
  HOTEL_AMENITIES,
  HOTEL_CHAINS,
  HOTEL_TERMS,
  getHotelChain,
  getAmenity
} from './hotels';

import {
  EU261_COMPENSATION,
  EU261_ADDITIONAL_RIGHTS,
  US_DOT_REGULATIONS,
  US_DOT_ADDITIONAL_RULES,
  MONTREAL_CONVENTION,
  CONSUMER_RIGHTS,
  REFUND_ELIGIBILITY,
  PASSENGER_RIGHTS,
  getCompensationAmount,
  isEligibleEU261
} from './legal';

import {
  PASSPORT_VALIDITY_RULES,
  VISA_WAIVER_PROGRAMS,
  VISA_TYPES,
  VISA_PROCESSING_TIMES,
  VISA_REQUIREMENTS_COMMON,
  VISA_TIPS,
  getPassportValidityRequirement
} from './visa';

import {
  PACKING_TIPS,
  AIRPORT_SECURITY_TIPS,
  BOOKING_TIMING,
  BOOKING_BEST_PRACTICES,
  TRAVEL_INSURANCE_INFO,
  JET_LAG_TIPS,
  GENERAL_TRAVEL_TIPS,
  COMMON_TRAVEL_MISTAKES,
  DESTINATION_TIPS,
  getTipsByCategory
} from './travel-tips';

export interface QueryResult {
  answer: string;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  relatedTopics?: string[];
}

/**
 * Main query function - searches knowledge base for relevant information
 */
export function queryKnowledge(
  topic: string,
  question: string,
  context?: Record<string, any>
): QueryResult | null {
  const normalizedTopic = topic.toLowerCase().trim();
  const normalizedQuestion = question.toLowerCase().trim();

  // Route to appropriate handler
  if (isBaggageQuery(normalizedQuestion)) {
    return handleBaggageQuery(normalizedQuestion, context);
  }

  if (isCompensationQuery(normalizedQuestion)) {
    return handleCompensationQuery(normalizedQuestion, context);
  }

  if (isVisaQuery(normalizedQuestion)) {
    return handleVisaQuery(normalizedQuestion, context);
  }

  if (isCancellationQuery(normalizedQuestion)) {
    return handleCancellationQuery(normalizedQuestion, context);
  }

  if (isFareClassQuery(normalizedQuestion)) {
    return handleFareClassQuery(normalizedQuestion, context);
  }

  if (isHotelPolicyQuery(normalizedQuestion)) {
    return handleHotelPolicyQuery(normalizedQuestion, context);
  }

  if (isBookingTimingQuery(normalizedQuestion)) {
    return handleBookingTimingQuery(normalizedQuestion, context);
  }

  if (isTravelTipsQuery(normalizedQuestion)) {
    return handleTravelTipsQuery(normalizedQuestion, context);
  }

  if (isInsuranceQuery(normalizedQuestion)) {
    return handleInsuranceQuery(normalizedQuestion, context);
  }

  if (isSecurityQuery(normalizedQuestion)) {
    return handleSecurityQuery(normalizedQuestion, context);
  }

  // Fallback to fuzzy matching
  return fuzzySearch(normalizedQuestion);
}

// Query Type Detectors
function isBaggageQuery(question: string): boolean {
  const keywords = ['baggage', 'luggage', 'bag', 'carry-on', 'checked bag', 'suitcase', 'weight limit'];
  return keywords.some(kw => question.includes(kw));
}

function isCompensationQuery(question: string): boolean {
  const keywords = ['compensation', 'eu261', 'delay', 'cancelled flight', 'denied boarding', 'bump', 'refund'];
  return keywords.some(kw => question.includes(kw));
}

function isVisaQuery(question: string): boolean {
  const keywords = ['visa', 'passport', 'entry requirement', 'travel document', 'immigration'];
  return keywords.some(kw => question.includes(kw));
}

function isCancellationQuery(question: string): boolean {
  const keywords = ['cancel', 'cancellation', 'refund', 'change flight', 'modify booking'];
  return keywords.some(kw => question.includes(kw));
}

function isFareClassQuery(question: string): boolean {
  const keywords = ['fare class', 'cabin class', 'business class', 'first class', 'economy', 'premium economy'];
  return keywords.some(kw => question.includes(kw));
}

function isHotelPolicyQuery(question: string): boolean {
  const keywords = ['check-in', 'check-out', 'hotel policy', 'hotel cancel', 'resort fee', 'hotel amenity'];
  return keywords.some(kw => question.includes(kw));
}

function isBookingTimingQuery(question: string): boolean {
  const keywords = ['when to book', 'best time to book', 'how far in advance', 'booking timing'];
  return keywords.some(kw => question.includes(kw));
}

function isTravelTipsQuery(question: string): boolean {
  const keywords = ['packing', 'what to bring', 'travel tip', 'jet lag', 'how to pack'];
  return keywords.some(kw => question.includes(kw));
}

function isInsuranceQuery(question: string): boolean {
  const keywords = ['travel insurance', 'insurance', 'coverage', 'should i get insurance'];
  return keywords.some(kw => question.includes(kw));
}

function isSecurityQuery(question: string): boolean {
  const keywords = ['security', 'tsa', 'airport security', 'what can i bring', "can't bring"];
  return keywords.some(kw => question.includes(kw));
}

// Query Handlers
function handleBaggageQuery(question: string, context?: Record<string, any>): QueryResult {
  const airline = context?.airline || extractAirlineName(question);

  if (airline) {
    const policy = getBaggagePolicy(airline);
    if (policy) {
      return {
        answer: formatBaggagePolicy(policy),
        sources: ['Flight Knowledge Base - Baggage Policies'],
        confidence: 'high',
        relatedTopics: ['Change Fees', 'Fare Classes', 'Airline Alliances']
      };
    }
  }

  // General baggage information
  return {
    answer: `**General Baggage Guidelines:**

**Carry-On Baggage:**
- Most airlines allow 1 personal item + 1 carry-on bag
- Typical carry-on size: 22" x 14" x 9" (56 x 36 x 23 cm)
- Weight limits vary: 15-22 lbs (7-10 kg)
- Must fit in overhead bin or under seat

**Checked Baggage:**
- Economy: Usually 0-1 bag included (depends on airline and route)
- Business/First: 2-3 bags typically included
- Standard weight limit: 50 lbs (23 kg) per bag
- Fees for additional bags: $30-$100+ depending on airline

**Overweight/Oversize Fees:**
- 50-70 lbs: $50-100 extra
- Over 70 lbs: $100-200 or may be refused
- Oversize (62+ linear inches): $100-200

**Special Items:**
- Sports equipment: Additional fees ($50-150)
- Musical instruments: May require extra seat purchase
- Medical equipment: Usually free
- Strollers/car seats: Free on most airlines

**Tips:**
- Weigh bags at home before airport
- Pack valuables in carry-on
- Check specific airline policies (they vary significantly)
- Consider airline credit cards for free checked bags

Would you like information about a specific airline's baggage policy?`,
    sources: ['Flight Knowledge Base - General Baggage Info'],
    confidence: 'high',
    relatedTopics: ['Airline Policies', 'Packing Tips', 'Travel Costs']
  };
}

function handleCompensationQuery(question: string, context?: Record<string, any>): QueryResult {
  const isEU = question.includes('eu') || question.includes('europe') || question.includes('261');
  const isUS = question.includes('us') || question.includes('dot') || question.includes('america');

  if (isEU) {
    return {
      answer: formatEU261Info(),
      sources: ['Legal Knowledge Base - EU Regulation 261/2004'],
      confidence: 'high',
      relatedTopics: ['Passenger Rights', 'Flight Cancellations', 'Refunds']
    };
  }

  if (isUS) {
    return {
      answer: formatDOTInfo(),
      sources: ['Legal Knowledge Base - US DOT Regulations'],
      confidence: 'high',
      relatedTopics: ['Passenger Rights', 'Denied Boarding', 'Refunds']
    };
  }

  // General compensation info
  return {
    answer: `**Flight Compensation Overview:**

**EU Regulation 261/2004:**
- Applies to flights departing from EU or arriving in EU on EU carriers
- Compensation: €250-€600 depending on distance and delay
- Required for delays 3+ hours, cancellations, denied boarding
- Excludes extraordinary circumstances (severe weather, strikes, etc.)

**US DOT Regulations:**
- Applies to flights departing from US
- Compensation for denied boarding (bumping): $775-$1,550
- Based on delay length at final destination
- Paid immediately if involuntarily bumped
- 24-hour cancellation rule (full refund)

**Montreal Convention (International):**
- Covers international flights
- Baggage loss: ~$1,780 per passenger
- Must prove damages for delays
- Airline liability limits

**How to Claim:**
1. Document everything (boarding passes, receipts, photos)
2. File claim with airline first
3. If denied, escalate to regulatory body
4. Consider claim services (take 25-35% commission)
5. Small claims court as last resort

**Your Rights:**
- Right to care (meals, accommodation during delays)
- Right to refund or re-routing
- Right to information about your rights
- Protection from unfair practices

Would you like specific information about EU261, US DOT, or another region?`,
    sources: ['Legal Knowledge Base - Compensation Overview'],
    confidence: 'high',
    relatedTopics: ['Passenger Rights', 'Refunds', 'Flight Delays']
  };
}

function handleVisaQuery(question: string, context?: Record<string, any>): QueryResult {
  const destination = context?.destination || extractCountryName(question);

  return {
    answer: `**Visa and Passport Requirements:**

**Passport Validity Rules:**
- **6-Month Rule:** Most common - passport must be valid 6 months beyond departure
  - Applies to: China, Thailand, Vietnam, Indonesia, India, UAE, Egypt, Brazil, and many others
- **3-Month Rule:** Schengen area (Europe) - 3 months beyond departure
- **Valid for Stay:** US, Canada, UK, Japan, Australia - valid for duration of stay

**Blank Pages:** Most countries require 1-2 blank visa pages

**Popular Visa Waiver Programs:**

**US ESTA (Visa Waiver Program):**
- 39 countries eligible (EU, UK, Japan, Australia, etc.)
- Apply online ($21), valid 2 years
- Stay up to 90 days
- Must have return ticket

**Schengen Visa Waiver:**
- 60+ countries eligible including US, Canada, Australia
- 90 days in any 180-day period
- Covers 26 European countries
- Need travel insurance (€30,000 coverage)

**UK Visa Waiver:**
- 100+ countries eligible
- Stay up to 6 months
- No work permitted

**eVisa Countries:**
- India, Turkey, Australia, Kenya, Vietnam, Egypt offer online visas
- Processing: Hours to 5 days
- Fees: $20-$100

**Visa Processing Times:**
- eVisa: 1-5 business days
- Visa on Arrival: At airport (30 min - 2 hours)
- Embassy Visa: 5-15 business days
- US Visa: 3-5 weeks (including interview)

**Important Tips:**
- Check requirements 2-3 months before travel
- Apply early - don't wait until last minute
- Ensure passport has 6+ months validity
- Keep copies of all documents
- Some countries have visa fees ($50-$200+)

**Where to Check:**
- Official government websites (most reliable)
- Embassy/consulate websites
- IATA Travel Centre (timaticweb.com)

Would you like specific information about visa requirements for a particular country?${destination ? `\n\nNote: For ${destination}, please check official sources as requirements change frequently.` : ''}`,
    sources: ['Visa Knowledge Base - Requirements and Rules'],
    confidence: 'medium',
    relatedTopics: ['Passport Rules', 'Travel Documents', 'Entry Requirements']
  };
}

function handleCancellationQuery(question: string, context?: Record<string, any>): QueryResult {
  const isHotel = question.includes('hotel') || context?.type === 'hotel';
  const isFlight = question.includes('flight') || context?.type === 'flight';

  if (isHotel) {
    return {
      answer: `**Hotel Cancellation Policies:**

**Standard Cancellation:**
- Most hotels: Free cancellation 24-48 hours before check-in
- Resorts/Peak season: 48-72 hours or longer
- Must cancel by deadline to avoid charges
- Cancel via same channel you booked (website, phone, OTA)

**Non-Refundable Rates:**
- Typically 10-30% cheaper than flexible rates
- No refund if cancelled
- May allow date changes with fee
- Common during holidays and events

**Cancellation Fees:**
- Standard: No fee if within cancellation window
- Late cancellation: Usually 1 night's room rate
- No-show: Full charge for 1-2 nights
- Group bookings: 30-60 days notice required

**When You Get a Refund:**
- Cancelled within cancellation window
- Hotel cancels your reservation
- Significant issues with room (safety, cleanliness)
- Force majeure events (varies by hotel)

**How to Cancel:**
1. Cancel as soon as you know you can't make it
2. Get cancellation confirmation number
3. Save all emails and documentation
4. Check credit card statement for refund (5-10 business days)
5. Contact hotel if refund not received

**Tips:**
- Book refundable rates when uncertain about travel
- Read cancellation policy before booking
- Set reminder for cancellation deadline
- Consider travel insurance for non-refundable bookings
- Some credit cards offer trip cancellation coverage

**Exceptions:**
- Elite loyalty members may get more flexible policies
- Travel insurance may cover non-refundable bookings
- Natural disasters and emergencies (case-by-case)`,
      sources: ['Hotel Knowledge Base - Cancellation Policies'],
      confidence: 'high',
      relatedTopics: ['Hotel Booking', 'Travel Insurance', 'Refunds']
    };
  }

  // Flight cancellation (default)
  return {
    answer: `**Flight Cancellation Policies:**

**24-Hour Cancellation Rule (US):**
- ALL US flights can be cancelled within 24 hours of booking
- Full refund, no fees or penalties
- Must book at least 7 days before departure
- Applies to both refundable and non-refundable tickets

**Refundable Tickets:**
- Full refund available (usually First, Business, or full-fare Economy)
- Small processing fee may apply ($25-75)
- Can usually cancel up to departure time
- Most flexible option

**Non-Refundable Tickets:**
- Most economy fares are non-refundable
- Cancellation results in forfeiture of ticket value
- May receive travel credit minus cancellation fee ($200-500)
- Credit typically valid for 1 year from original booking

**Basic Economy:**
- No changes or cancellations allowed (most cases)
- Only refundable within 24 hours of booking
- May forfeit entire ticket value
- Most restrictive fare class

**When Airline Cancels:**
- Full refund regardless of ticket type
- OR re-routing at no extra cost
- Compensation may apply (EU261, DOT regulations)
- Right to meals and accommodation during delays

**Change Fees:**
- Many airlines eliminated change fees for economy and above
- Basic Economy: No changes or high fees
- Fare difference still applies
- International flights may have higher fees

**How to Cancel:**
1. Cancel as early as possible
2. Use airline website, app, or call customer service
3. Get cancellation confirmation
4. Refunds: 7-20 business days to credit card
5. Travel credits: Usually emailed or in account

**Tips:**
- Read fare rules before booking
- Cancel within 24 hours if you change your mind
- Consider travel insurance for expensive non-refundable tickets
- Some credit cards offer trip cancellation coverage
- Keep all documentation

**Compensation Rights:**
- EU flights: May qualify for €250-€600 compensation
- US flights: Compensation for denied boarding
- See passenger rights for more details`,
    sources: ['Flight Knowledge Base - Cancellation Policies', 'Legal Knowledge Base'],
    confidence: 'high',
    relatedTopics: ['Change Fees', 'Passenger Rights', 'Refunds', 'Travel Insurance']
  };
}

function handleFareClassQuery(question: string, context?: Record<string, any>): QueryResult {
  const fareCode = context?.fareCode || extractFareCode(question);

  if (fareCode) {
    const fareClass = getFareClass(fareCode);
    if (fareClass) {
      return {
        answer: `**Fare Class ${fareClass.code} - ${fareClass.name}:**

**Cabin:** ${fareClass.cabin}

**Description:** ${fareClass.description}

**Benefits:**
${fareClass.benefits.map(b => `- ${b}`).join('\n')}

**Change Fees:** ${fareClass.changeFees || 'Varies by airline'}

**Cancellation:** ${fareClass.cancellation || 'Varies by airline'}

**Typical Features:**
- Booking flexibility varies by fare class
- Higher letter codes (F, J, C) = more flexibility
- Lower letter codes (Y, B, M) = less flexibility
- Same cabin can have multiple fare classes

**Tips:**
- Higher fare classes allow free/cheap changes
- Lower fare classes have restrictions and high fees
- Elite status members may get benefits across all classes
- Check specific airline's fare rules before booking`,
        sources: ['Flight Knowledge Base - Fare Classes'],
        confidence: 'high',
        relatedTopics: ['Booking Flights', 'Change Fees', 'Airline Benefits']
      };
    }
  }

  // General fare class info
  return {
    answer: `**Understanding Fare Classes:**

Fare classes use letter codes (F, J, C, Y, B, M, etc.) to indicate ticket type and flexibility.

**First Class:**
- F: Full first class (most flexible, most expensive)
- A: Discounted first class

**Business Class:**
- J: Full business class (very flexible)
- C: Standard business class
- D, I, Z: Discounted business class

**Premium Economy:**
- W: Premium economy (extra legroom and amenities)
- E: Discounted premium economy

**Economy Class:**
- Y: Full-fare economy (most flexible economy)
- B, H: Discounted economy
- K, L, M: Deep discount economy
- Q, T, X: Super discount economy

**What Affects Fare Class:**
1. **Flexibility:** Higher classes allow free/cheap changes
2. **Cancellation:** F and J often refundable, Y sometimes, others rarely
3. **Upgrades:** Higher fare classes more eligible for upgrades
4. **Mileage Earning:** Higher classes earn more miles/points
5. **Price:** Higher flexibility = higher price

**Common Questions:**

**Same cabin, different fare classes?**
Yes! You can have multiple economy passengers on same flight in different fare classes with different flexibility.

**Why does it matter?**
- Change fees and restrictions vary dramatically
- Elite status qualification may depend on fare class
- Mileage earning rates differ
- Upgrade eligibility varies

**How to check your fare class:**
- On booking confirmation (letter code)
- On ticket receipt
- Ask airline directly

**Tips:**
- Book higher fare class if you might need to change
- Basic Economy (restrictive) vs Y class (flexible) - big difference!
- For important trips, pay extra for flexibility`,
    sources: ['Flight Knowledge Base - Fare Classes'],
    confidence: 'high',
    relatedTopics: ['Booking Flights', 'Change Fees', 'Airline Policies']
  };
}

function handleHotelPolicyQuery(question: string, context?: Record<string, any>): QueryResult {
  return {
    answer: `**Hotel Policies:**

**Check-In Times:**
- Standard: 3:00 PM or 4:00 PM
- Early check-in: Sometimes free, often $25-100
- Request at booking or call ahead
- More likely on weekdays than weekends

**Check-Out Times:**
- Standard: 11:00 AM or 12:00 PM
- Late check-out: Often free for elite members, $25-75 for others
- Usually until 2:00 PM or 4:00 PM
- Request at check-in or through app

**Common Hotel Fees:**
- **Resort Fees:** $25-50/night (mandatory, covers Wi-Fi, pool, fitness)
- **Parking:** Free in suburbs, $20-75/day in cities
- **Early Departure:** Fee if you check out before original date
- **Extra Guest:** $25-50/night for more than 2 adults
- **Pets:** $50-150 per stay
- **Crib/Rollaway:** $25-50/night

**Hotel Star Ratings:**
- **1-Star:** Basic budget accommodations
- **2-Star:** Economy with essentials (TV, private bathroom)
- **3-Star:** Mid-range with restaurant, fitness center
- **4-Star:** Upscale with enhanced services, spa
- **5-Star:** Luxury with exceptional service and amenities

**Common Amenities:**
- Wi-Fi: Usually free (may charge for premium speed)
- Breakfast: Included in 2-3 star, extra in upscale ($15-40)
- Parking: Free in suburbs, fee in cities
- Fitness Center: Free in 3-star and above
- Pool: Common in 2-star+, free to use
- Room Service: Available 3-star+, menu prices + 18-25% service charge

**Hotel Loyalty Programs:**
Major chains (Marriott, Hilton, Hyatt, IHG) offer:
- Free Wi-Fi for members
- Points for free nights
- Room upgrades (elite status)
- Late checkout
- Bonus points
- No fees to join

**Tips:**
- Join loyalty program before booking (even for one stay)
- Book directly with hotel for best flexibility
- Request specific room preferences at booking
- Take photos of room upon arrival
- Report issues immediately
- Read reviews on multiple sites`,
    sources: ['Hotel Knowledge Base - Policies and Amenities'],
    confidence: 'high',
    relatedTopics: ['Hotel Booking', 'Loyalty Programs', 'Travel Costs']
  };
}

function handleBookingTimingQuery(question: string, context?: Record<string, any>): QueryResult {
  return {
    answer: `**Best Times to Book Travel:**

**Domestic Flights (US):**
- **Book:** 1-3 months in advance
- **Best Day:** Tuesday or Wednesday
- **Cheapest Flights:** Tuesday, Wednesday, Saturday
- **Avoid:** Friday and Sunday (most expensive)
- **Time:** Early morning or red-eye flights cheaper

**International Flights:**
- **Book:** 2-8 months in advance
- **Europe:** 4-6 months (peak summer)
- **Asia:** 3-5 months
- **South America:** 2-4 months
- **Off-season:** 2-3 months may work

**Hotels:**
- **Book:** 1-4 weeks before arrival
- **Business Hotels:** Last-minute for weekend deals
- **Resorts:** 1-2 months ahead
- **Events/Holidays:** 2-3 months ahead
- **Last-Minute:** Day-of or day-before for unsold inventory

**Car Rentals:**
- **Book:** 2-4 weeks in advance
- **Holidays:** 1-2 months ahead
- **Check Again:** Prices can drop closer to pickup

**Why Timing Matters:**
- Airlines use dynamic pricing (changes constantly)
- Too early: Prices not yet competitive
- Too late: Prices increase as seats fill
- Sweet spot: 1-3 months for domestic, 3-6 for international

**Tools to Find Best Prices:**
- Google Flights (price tracking, calendar view)
- Hopper (AI price predictions)
- Kayak (price alerts)
- Skyscanner (flexible search)
- Scott's Cheap Flights / Going (deal alerts)

**Booking Strategy:**
1. Set price alerts 2-3 months out
2. Watch for sales (Tuesday/Wednesday)
3. Be flexible with dates (+/- 3 days)
4. Consider nearby airports
5. Book refundable if unsure
6. Use incognito mode (avoid price tracking)

**Best Days to Fly:**
- **Cheapest:** Tuesday, Wednesday, Saturday
- **Most Expensive:** Friday, Sunday
- **Best Times:** Early morning (5-7 AM), red-eye
- **Avoid:** Mid-day and evening (more expensive, delays)

**Seasonal Considerations:**
- **Summer:** Book 4-6 months ahead (peak season)
- **Holidays:** Book 2-3 months ahead
- **Off-season:** 1-2 months sufficient
- **Shoulder Season:** Best prices (May, September)

**Exception - Last Minute Deals:**
- Hotels: Unsold inventory discounted
- Flights: Rare, usually more expensive
- Package deals: Sometimes good last-minute
- Risk: Limited availability, no choice`,
    sources: ['Travel Tips Knowledge Base - Booking Timing'],
    confidence: 'high',
    relatedTopics: ['Flight Booking', 'Hotel Booking', 'Travel Planning']
  };
}

function handleTravelTipsQuery(question: string, context?: Record<string, any>): QueryResult {
  const isPacking = question.includes('pack');
  const isJetLag = question.includes('jet lag');

  if (isPacking) {
    return {
      answer: `**Packing Tips:**

**Carry-On Essentials:**
- Medications (prescriptions in original containers)
- Passport, ID, travel documents
- Phone, chargers, adapters
- Change of clothes (in case bag delayed)
- Toiletries (3.4oz/100ml in clear bag)
- Valuables (jewelry, electronics, laptop)
- Important papers (insurance, reservations)
- Snacks and empty water bottle
- Entertainment (book, tablet, headphones)

**Checked Luggage:**
- Roll clothes (saves space)
- Use packing cubes for organization
- Pack heavy items at bottom (near wheels)
- Wear bulkiest items on plane
- Shoes in bags or shower caps
- Stuff socks inside shoes
- Use laundry bags for dirty clothes
- Take photo of contents (for insurance)
- Contact info inside and outside bag
- Weigh at home to avoid fees

**Clothing Strategy:**
- Mix-and-match pieces (2-3 colors)
- Layers for temperature changes
- 1-2 dressy outfits
- Comfortable walking shoes (break in first!)
- Pack for 5-7 days (do laundry)
- Check weather before packing
- Quick-dry fabrics
- Consider cultural dress codes

**What NOT to Pack:**
- Unnecessary valuables
- Full-size toiletries (buy there or bring samples)
- Too many shoes (2-3 pairs max)
- "Just in case" items you won't use
- Excessive electronics
- New clothes (not broken in)

**Packing Hacks:**
- Compression bags for bulky items
- Dryer sheets for fresh smell
- Plastic bags for leaky items
- Pill organizer for jewelry
- Contact lens case for small lotions
- Roll clothes in tissue paper (wrinkle-free)

**Documents:**
- Passport (6+ months validity)
- Visa if needed
- Driver's license or IDP
- Travel insurance papers
- Copies of everything (digital + physical)
- Emergency contact list
- Hotel confirmations

**Tips:**
- Pack 2-3 days before (not last minute)
- Lay out everything, then remove 1/3
- Weigh bag at home
- Leave room for souvenirs
- Pack essentials in carry-on (in case bag lost)`,
      sources: ['Travel Tips Knowledge Base - Packing'],
      confidence: 'high',
      relatedTopics: ['Baggage Policies', 'Airport Security', 'Travel Planning']
    };
  }

  if (isJetLag) {
    return {
      answer: `**Jet Lag Management Tips:**

**Before Your Flight:**
- Gradually shift sleep schedule 2-3 days before
- Get good sleep leading up to trip
- Stay hydrated
- Avoid alcohol and caffeine 24 hours before
- Exercise regularly
- Book flights arriving in evening (easier to sleep)

**During Flight:**
- Set watch to destination time immediately
- Sleep according to destination schedule
- Drink water every hour
- Avoid alcohol (dehydrates)
- Limit caffeine
- Walk around cabin every 1-2 hours
- Use eye mask and earplugs
- Take melatonin 30 min before destination bedtime

**After Arrival:**
- Get sunlight exposure (resets circadian rhythm)
- Stay awake until local bedtime
- Exercise lightly (walk, stretch)
- Eat meals at local times
- Stay hydrated
- Avoid heavy meals before bed
- No napping (or max 20-30 minutes)
- Take melatonin for 2-3 nights
- Be patient (1 day per time zone to adjust)

**Direction Matters:**
- **Eastward (to Europe):** Harder - losing time
  - Arrive evening, sleep soon after
- **Westward (to Asia from US):** Easier - gaining time
  - Arrive morning, stay active all day
- **North-South:** Minimal jet lag

**Quick Recovery:**
- Force yourself to local schedule immediately
- Sunlight is your best friend
- Stay active during day
- Melatonin helps (3-5mg)
- Avoid sleeping pills (groggy)
- Hydrate constantly
- Light meals (heavy food = tired)

**When Jet Lag Is Worst:**
- Crossing 6+ time zones
- Eastward travel
- Not adjusting sleep before trip
- Irregular sleep patterns at home`,
      sources: ['Travel Tips Knowledge Base - Jet Lag'],
      confidence: 'high',
      relatedTopics: ['Flight Tips', 'Health', 'Long-Haul Travel']
    };
  }

  // General travel tips
  return {
    answer: `**Essential Travel Tips:**

**Before You Go:**
- Check passport expiration (6+ months validity)
- Verify visa requirements
- Get travel insurance for expensive trips
- Notify banks of travel plans
- Make copies of documents (digital + physical)
- Research destination (customs, safety, weather)
- Download offline maps
- Check vaccination requirements

**Money:**
- Credit cards with no foreign transaction fees
- Notify banks to avoid card blocks
- Withdraw cash from ATMs (best rates)
- Avoid airport currency exchange (poor rates)
- Keep emergency cash hidden
- Use mix of credit cards and cash
- Split money between locations (wallet, bag, safe)

**Safety:**
- Research destination safety
- Register with embassy (STEP for US citizens)
- Keep valuables in hotel safe
- Be aware of common scams
- Use ATMs inside banks during day
- Avoid unlicensed taxis
- Keep room number private
- Trust your instincts

**Communication:**
- International phone plan or local SIM
- Download offline maps
- Translation app (Google Translate)
- Learn basic phrases
- Have hotel address in local language
- WhatsApp for free messaging
- Screenshot important info

**Health:**
- Travel clinic visit 4-6 weeks before
- Extra medications (plus prescriptions)
- Basic first aid kit
- Travel insurance with medical coverage
- Bottled water in developing countries
- Hand sanitizer
- Research hospitals near hotel

**Common Mistakes to Avoid:**
- Not checking passport expiration
- Overpacking
- No copies of documents
- Airport money exchange
- Not notifying bank
- Non-refundable tickets without flexibility
- Arriving late to airport
- No offline maps
- Checking valuables in luggage
- Not reading cancellation policies

**Day of Travel:**
- Arrive 2 hours early (domestic), 3 hours (international)
- Check in online 24 hours before
- Wear comfortable shoes (slip-on for security)
- Bring empty water bottle
- Snacks for flight
- Dress in layers
- Entertainment downloaded offline`,
    sources: ['Travel Tips Knowledge Base - General Tips'],
    confidence: 'high',
    relatedTopics: ['Planning', 'Safety', 'Packing', 'Airport Tips']
  };
}

function handleInsuranceQuery(question: string, context?: Record<string, any>): QueryResult {
  return {
    answer: `**Travel Insurance Guide:**

**What It Covers:**
- Trip cancellation/interruption
- Medical emergencies abroad
- Emergency evacuation
- Lost, stolen, or delayed baggage
- Flight delays and missed connections
- Accidental death
- 24/7 travel assistance

**When to Buy:**
- Within 14-21 days of initial deposit (maximum coverage)
- Before final payment (for trip cancellation)
- Can buy anytime before departure (limited coverage)
- Earlier = better coverage

**Cost:** Typically 4-10% of total trip cost

**Who Needs It:**
- International travelers
- Expensive trips ($3,000+)
- Non-refundable bookings
- Health concerns
- Adventure activities
- Remote destinations
- Cruises (highly recommended)

**What to Check:**
- Pre-existing medical conditions coverage
- "Cancel for Any Reason" (CFAR) option (50-75% refund)
- Coverage limits (medical: $50k+, baggage: $1-2k)
- Deductibles
- Excluded activities or destinations
- COVID-19 coverage (check current policy)
- Claim payment reputation

**Top Providers:**
- World Nomads (backpackers)
- Allianz Travel Insurance
- Travel Guard
- Travelex Insurance
- InsureMyTrip (comparison)
- Squaremouth (comparison)

**Credit Card Coverage:**
Many premium cards include:
- Trip cancellation/interruption (if paid with card)
- Baggage delay/loss
- Car rental insurance
- Emergency assistance
- Usually secondary coverage

**Limitations:**
- Pre-existing conditions may not be covered
- Lower coverage limits than standalone
- Must pay trip with that card
- Read fine print

**When You DON'T Need It:**
- Short, cheap trips you can afford to lose
- Fully refundable bookings
- Excellent health insurance covering international travel
- Very low-risk destinations

**How to File Claim:**
1. Contact insurance company immediately
2. Document everything (photos, receipts, reports)
3. Get medical reports if needed
4. Police report for theft
5. Keep all receipts for expenses
6. Submit claim with all documentation
7. Follow up regularly

**Red Flags:**
- Extremely cheap insurance
- Poor reviews about claim denials
- Unclear policy language
- Limited customer service
- Exclusions for common issues

**Insider Tips:**
- Read policy before purchasing
- Compare multiple providers
- Higher deductible = lower premium
- CFAR costs 40-50% more but worth it for flexibility
- Buy annual policy if traveling multiple times/year
- Print policy and take with you
- Save emergency phone numbers`,
    sources: ['Travel Tips Knowledge Base - Insurance'],
    confidence: 'high',
    relatedTopics: ['Trip Planning', 'Cancellations', 'Medical Travel', 'Safety']
  };
}

function handleSecurityQuery(question: string, context?: Record<string, any>): QueryResult {
  return {
    answer: `**Airport Security Tips:**

**Before Security:**
- Check in online 24 hours before
- Arrive 2 hours early (domestic), 3 hours (international)
- Have ID and boarding pass ready
- Know terminal and gate
- Join TSA PreCheck/Global Entry for faster screening
- Wear slip-on shoes
- Minimize metal items

**At Checkpoint:**
- Place liquids (3-1-1 bag) in separate bin
- Remove laptop and large electronics
- Take off shoes, belt, jacket (unless PreCheck)
- Empty pockets completely
- Small items in carry-on, not bins
- Don't joke about security
- Follow agent instructions
- Be patient and polite

**3-1-1 Liquid Rule:**
- **3.4 ounces (100ml)** per container max
- **1** quart-size clear plastic bag
- **1** bag per person
- All toiletries must fit in bag

**What You CAN Bring:**
- Empty water bottle (fill after security)
- Food (solid foods OK, avoid liquids/gels)
- Medications (in original containers)
- Baby formula/milk (declare it)
- Small scissors (under 4 inches from pivot)
- Tweezers, razors, nail clippers
- Umbrellas
- Books, magazines
- Electronics (charged and functional)

**What You CAN'T Bring:**
- Liquids over 3.4oz
- Sharp objects (knives, box cutters)
- Firearms or weapons (even replicas)
- Explosive materials
- Lighters (limited exceptions)
- Tools over 7 inches
- Baseball bats, golf clubs (checked only)
- Spray paint

**Special Items:**
- Medical equipment: Declare and show
- Food: Generally OK (avoid liquids)
- Gifts: Don't wrap (TSA may unwrap)
- Duty-free liquids: Keep sealed bag from store

**TSA PreCheck:**
- $78 for 5 years
- Keep shoes, belt, jacket on
- Laptops and liquids stay in bag
- Faster lines (under 5 minutes usually)
- Available at 200+ airports
- Apply online, in-person appointment

**Global Entry:**
- $100 for 5 years (includes PreCheck)
- Expedited customs for international arrivals
- Automated kiosks (skip lines)
- Background check required
- Interview required

**International Security:**
- Have passport ready multiple times
- Additional screening for some countries
- Separate lines for citizens/non-citizens
- Customs declaration forms
- Know your accommodation address
- Have return ticket available

**Security Time-Saving Tips:**
- Check in online
- Pack smart (easily accessible items)
- Wear slip-on shoes
- Empty pockets before line
- Organize carry-on
- Know the rules
- Have documents ready
- Consider PreCheck/Global Entry

**If Flagged for Additional Screening:**
- Remain calm and cooperative
- It's random or routine
- Provide requested information
- Don't take it personally
- Extra screening usually 5-10 minutes

**After Security:**
- Collect all belongings
- Check that nothing was left
- Verify gate and boarding time
- Fill water bottle
- Get snacks if needed
- Charge devices if time allows`,
    sources: ['Travel Tips Knowledge Base - Airport Security'],
    confidence: 'high',
    relatedTopics: ['TSA PreCheck', 'Packing', 'Airport Tips', 'Travel Documents']
  };
}

// Helper Functions
function extractAirlineName(text: string): string | null {
  const airlines = ['United', 'American', 'Delta', 'Lufthansa', 'Emirates', 'Ryanair',
                    'Southwest', 'JetBlue', 'British Airways', 'Air France', 'KLM'];

  for (const airline of airlines) {
    if (text.toLowerCase().includes(airline.toLowerCase())) {
      return airline;
    }
  }
  return null;
}

function extractCountryName(text: string): string | null {
  const countries = ['United States', 'US', 'USA', 'United Kingdom', 'UK', 'Canada',
                     'Mexico', 'France', 'Germany', 'Italy', 'Spain', 'China', 'Japan',
                     'Australia', 'Brazil', 'India', 'Thailand'];

  for (const country of countries) {
    if (text.toLowerCase().includes(country.toLowerCase())) {
      return country;
    }
  }
  return null;
}

function extractFareCode(text: string): string | null {
  const match = text.match(/\b([A-Z])\s*class\b/i);
  if (match) return match[1].toUpperCase();

  const singleLetter = text.match(/\b([FJCYWBM])\b/);
  if (singleLetter) return singleLetter[1];

  return null;
}

function formatBaggagePolicy(policy: any): string {
  return `**${policy.airline} Baggage Policy:**

**Cabin Baggage:** ${policy.cabinBaggage}

**Checked Baggage:**
- Economy: ${policy.checkedBaggage.economy}
${policy.checkedBaggage.premiumEconomy ? `- Premium Economy: ${policy.checkedBaggage.premiumEconomy}` : ''}
- Business: ${policy.checkedBaggage.business}
${policy.checkedBaggage.first ? `- First: ${policy.checkedBaggage.first}` : ''}

**Weight Limits:**
- Cabin: ${policy.weight.cabin}
- Checked: ${policy.weight.checked}

${policy.additionalFees ? `**Additional Fees:** ${policy.additionalFees}` : ''}

${policy.specialItems ? `**Special Items:** ${policy.specialItems}` : ''}

**Tips:**
- Weigh bags at home to avoid overweight fees
- Pack valuables in carry-on
- Check airline website for most current information
- Consider airline credit card for free checked bags`;
}

function formatEU261Info(): string {
  return `**EU Regulation 261/2004 - Flight Compensation:**

**Eligibility:**
- Flight departed from EU airport (any airline), OR
- Flight arrived at EU airport on EU carrier
- Delay of 3+ hours at final destination
- Cancellation with less than 14 days notice
- Denied boarding due to overbooking

**Compensation Amounts:**
- Under 1,500 km, 3+ hour delay: **€250**
- 1,500-3,500 km, 3+ hour delay: **€400**
- Over 3,500 km, 3-4 hour delay: **€300**
- Over 3,500 km, 4+ hour delay: **€600**

**Additional Rights:**
- Meals and refreshments during delays (2+ hours)
- Hotel accommodation if overnight delay
- Transportation to/from hotel
- Two phone calls or emails

**NOT Covered (Extraordinary Circumstances):**
- Severe weather
- Political unrest
- Security risks
- Air traffic control strikes
- Bird strikes

**How to Claim:**
1. Keep all documents (boarding passes, receipts)
2. Contact airline's claims department
3. Provide booking reference and delay evidence
4. Airline has up to 6 weeks to respond
5. If denied, escalate to National Enforcement Body
6. Consider claim services (AirHelp, ClaimCompass) - take 25-35%

**Important Notes:**
- You can claim up to 3-6 years after incident (varies by country)
- Compensation is per passenger (including children)
- You can get both compensation AND refund/re-routing
- Free to claim yourself - no need for paid services

**Countries Covered:**
All EU countries plus Iceland, Norway, Switzerland, and UK`;
}

function formatDOTInfo(): string {
  return `**US DOT Regulations - Passenger Rights:**

**Denied Boarding Compensation:**
If involuntarily bumped:
- **1-2 hours delay** (domestic) or 1-4 hours (international): **200% of one-way fare (max $775)**
- **Over 2 hours** (domestic) or over 4 hours (international): **400% of one-way fare (max $1,550)**

**Requirements:**
- Had confirmed reservation
- Checked in on time
- Arrived at gate on time
- Payment on the spot (check or cash)

**24-Hour Cancellation Rule:**
- Cancel ANY flight within 24 hours of booking
- Full refund, no fees
- Must book 7+ days before departure
- Applies to all US flights

**Tarmac Delay Rule:**
- Domestic: Must allow deplaning after 3 hours
- International: Must allow deplaning after 4 hours
- Exceptions only for safety/security
- Must provide food, water after 2 hours
- Fines up to $27,500 per passenger for violations

**Baggage Liability:**
- Domestic: Up to $3,800 per passenger
- International: ~$1,780 (Montreal Convention)
- Report lost bags immediately

**Refunds:**
- Full refund if airline cancels flight
- Refund for significantly changed flights
- Must be given within 7 days (credit card) or 20 days (cash)

**How to File Complaint:**
1. Try to resolve with airline first
2. If unsuccessful, file complaint with DOT
3. Visit aviation.consumerprotection@dot.gov
4. Provide all documentation
5. DOT will investigate`;
}

function fuzzySearch(question: string): QueryResult | null {
  // Simple keyword matching for common terms
  const keywords = {
    'alliance': 'airline alliances',
    'star alliance': 'Star Alliance',
    'oneworld': 'OneWorld',
    'skyteam': 'SkyTeam',
    'loyalty': 'loyalty programs',
    'miles': 'frequent flyer miles',
    'points': 'loyalty points',
  };

  for (const [key, topic] of Object.entries(keywords)) {
    if (question.includes(key)) {
      return {
        answer: `I found information related to "${topic}". Could you please be more specific about what you'd like to know?`,
        sources: ['Knowledge Base - Fuzzy Match'],
        confidence: 'low',
        relatedTopics: ['Flights', 'Hotels', 'Travel Tips']
      };
    }
  }

  return null;
}

// Multi-language support helper
export function translateQuery(query: string, targetLang: 'en' | 'pt' | 'es'): string {
  // Placeholder for translation - would integrate with translation API
  return query;
}

// Export all query functions
export {
  handleBaggageQuery,
  handleCompensationQuery,
  handleVisaQuery,
  handleCancellationQuery,
  handleFareClassQuery,
  handleHotelPolicyQuery,
  handleBookingTimingQuery,
  handleTravelTipsQuery,
  handleInsuranceQuery,
  handleSecurityQuery
};
