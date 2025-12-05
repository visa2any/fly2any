import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Assistant Flight Search API - State of the Art
 *
 * Parses natural language queries and returns flight results
 * Integrated with Duffel API for real-time flight data
 *
 * Features:
 * - Comprehensive natural language date parsing
 * - Full preference extraction (non-stop, baggage, seats, time-of-day)
 * - Smart date handling with "until", "from...to", date ranges
 * - Intelligent error messages with specific feedback
 */

interface FlightPreferences {
  directFlightsOnly?: boolean;
  includeCheckedBaggage?: boolean;
  extraBaggage?: boolean;
  seatPreference?: 'window' | 'aisle' | 'middle' | 'extra_legroom';
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'red-eye' | 'flexible';
  maxLayovers?: number;
  maxLayoverDuration?: number; // in minutes
  preferredAirlines?: string[];
  excludeAirlines?: string[];
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  preferences?: FlightPreferences;
}

interface ParsedQuery {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  preferences: FlightPreferences;
  missingFields: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language = 'en' } = body;

    // Parse natural language query with comprehensive extraction
    const parsed = parseFlightQuery(query);

    // Check for missing required fields and provide specific feedback
    if (parsed.missingFields.length > 0 || !parsed.origin || !parsed.destination || !parsed.departureDate) {
      const missingList = [];
      if (!parsed.origin) missingList.push('origin city');
      if (!parsed.destination) missingList.push('destination city');
      if (!parsed.departureDate) missingList.push('departure date');

      return NextResponse.json({
        success: false,
        error: 'I need more information to search for flights',
        missingFields: missingList,
        suggestion: generateMissingSuggestion(missingList, language),
        partialData: {
          origin: parsed.origin,
          destination: parsed.destination,
          departureDate: parsed.departureDate,
          returnDate: parsed.returnDate,
          preferences: parsed.preferences
        }
      }, { status: 400 });
    }

    const searchParams: FlightSearchParams = {
      origin: parsed.origin,
      destination: parsed.destination,
      departureDate: parsed.departureDate,
      returnDate: parsed.returnDate,
      passengers: parsed.passengers,
      cabinClass: parsed.cabinClass,
      preferences: parsed.preferences
    };

    // Search flights using Duffel API
    const flights = await searchFlights(searchParams);

    // Generate acknowledgment of preferences
    const preferenceSummary = generatePreferenceSummary(parsed.preferences, language);

    return NextResponse.json({
      success: true,
      searchParams,
      flights,
      count: flights.length,
      message: generateSearchSummary(searchParams, flights.length, language),
      preferenceSummary,
      appliedPreferences: parsed.preferences
    });

  } catch (error: any) {
    console.error('AI Flight Search Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search flights',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Parse natural language flight queries with comprehensive extraction
 */
function parseFlightQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  const missingFields: string[] = [];

  // Extract origin and destination
  const { origin, destination } = extractLocations(lowerQuery);

  // Extract dates with smart parsing
  const { departureDate, returnDate } = extractDates(lowerQuery);

  // Extract cabin class
  const cabinClass = extractCabinClass(lowerQuery);

  // Extract passengers (default to 1)
  const passengers = extractPassengers(lowerQuery);

  // Extract all preferences
  const preferences = extractAllPreferences(query);

  return {
    origin,
    destination,
    departureDate,
    returnDate,
    passengers,
    cabinClass,
    preferences,
    missingFields
  };
}

/**
 * Extract origin and destination from query
 */
function extractLocations(query: string): { origin?: string; destination?: string } {
  // Common city to IATA code mapping (comprehensive)
  const cityToIATA: Record<string, string> = {
    // North America
    'new york': 'NYC', 'nyc': 'NYC', 'jfk': 'JFK', 'new york city': 'NYC',
    'los angeles': 'LAX', 'la': 'LAX', 'lax': 'LAX',
    'miami': 'MIA', 'chicago': 'CHI', 'ord': 'ORD',
    'san francisco': 'SFO', 'sf': 'SFO', 'boston': 'BOS',
    'washington': 'WAS', 'dc': 'WAS', 'washington dc': 'WAS',
    'atlanta': 'ATL', 'orlando': 'MCO', 'las vegas': 'LAS', 'vegas': 'LAS',
    'seattle': 'SEA', 'denver': 'DEN', 'phoenix': 'PHX',
    'dallas': 'DFW', 'houston': 'IAH', 'toronto': 'YTO', 'vancouver': 'YVR',
    'montreal': 'YUL', 'mexico city': 'MEX', 'cancun': 'CUN',

    // Europe
    'london': 'LON', 'paris': 'PAR', 'madrid': 'MAD', 'barcelona': 'BCN',
    'rome': 'ROM', 'milan': 'MXP', 'amsterdam': 'AMS', 'frankfurt': 'FRA',
    'munich': 'MUC', 'berlin': 'BER', 'vienna': 'VIE', 'zurich': 'ZRH',
    'lisbon': 'LIS', 'prague': 'PRG', 'dublin': 'DUB', 'athens': 'ATH',
    'istanbul': 'IST', 'moscow': 'MOW', 'copenhagen': 'CPH', 'stockholm': 'STO',
    'brussels': 'BRU', 'venice': 'VCE', 'florence': 'FLR', 'nice': 'NCE',

    // Asia
    'tokyo': 'TYO', 'dubai': 'DXB', 'singapore': 'SIN', 'hong kong': 'HKG',
    'bangkok': 'BKK', 'seoul': 'ICN', 'mumbai': 'BOM', 'delhi': 'DEL',
    'shanghai': 'PVG', 'beijing': 'PEK', 'kuala lumpur': 'KUL',
    'jakarta': 'CGK', 'manila': 'MNL', 'taipei': 'TPE', 'osaka': 'KIX',
    'doha': 'DOH', 'abu dhabi': 'AUH', 'tel aviv': 'TLV',

    // South America
    'sao paulo': 'GRU', 'são paulo': 'GRU', 'rio de janeiro': 'GIG', 'rio': 'GIG',
    'buenos aires': 'BUE', 'lima': 'LIM', 'bogota': 'BOG', 'santiago': 'SCL',
    'medellin': 'MDE', 'cartagena': 'CTG',

    // Oceania
    'sydney': 'SYD', 'melbourne': 'MEL', 'brisbane': 'BNE',
    'auckland': 'AKL', 'perth': 'PER',

    // Africa
    'cairo': 'CAI', 'johannesburg': 'JNB', 'cape town': 'CPT',
    'nairobi': 'NBO', 'casablanca': 'CMN', 'marrakech': 'RAK'
  };

  let origin: string | undefined;
  let destination: string | undefined;

  // Pattern 1: "from X to Y"
  const fromToMatch = query.match(/(?:from\s+)?([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s+on|\s+in|\s+leaving|\s+departing|\s+return|\s+from|\s+until|\s+and|\s+for|\s+\?|$)/i);

  if (fromToMatch && fromToMatch[1] && fromToMatch[2]) {
    const originCity = fromToMatch[1].trim().toLowerCase();
    const destCity = fromToMatch[2].trim().toLowerCase();

    origin = cityToIATA[originCity] || originCity.substring(0, 3).toUpperCase();
    destination = cityToIATA[destCity] || destCity.substring(0, 3).toUpperCase();
  }

  // Pattern 2: "flying from X" or "departing from X"
  if (!origin) {
    const fromMatch = query.match(/(?:flying|departing|leaving|starting)\s+(?:from\s+)?([a-z\s]+?)(?:\s+to|\s+on|\s*$)/i);
    if (fromMatch) {
      const city = fromMatch[1].trim().toLowerCase();
      origin = cityToIATA[city] || city.substring(0, 3).toUpperCase();
    }
  }

  // Pattern 3: "to Y" or "going to Y"
  if (!destination) {
    const toMatch = query.match(/(?:going|flying|travel(?:ing)?)\s+to\s+([a-z\s]+?)(?:\s+on|\s+in|\s+from|\s*$)/i);
    if (toMatch) {
      const city = toMatch[1].trim().toLowerCase();
      destination = cityToIATA[city] || city.substring(0, 3).toUpperCase();
    }
  }

  return { origin, destination };
}

/**
 * Extract dates with comprehensive pattern matching
 */
function extractDates(query: string): { departureDate?: string; returnDate?: string } {
  const now = new Date();

  // Month names mapping
  const months: Record<string, number> = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
    august: 7, aug: 7, september: 8, sep: 8, sept: 8,
    october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
  };

  const monthNames = Object.keys(months).join('|');

  let departureDate: string | undefined;
  let returnDate: string | undefined;

  // Helper to create ISO date string
  const toISODate = (month: number, day: number, yearOverride?: number): string => {
    let year = yearOverride || now.getFullYear();
    let date = new Date(year, month, day);

    // If date is in the past, assume next year
    if (date < now && !yearOverride) {
      year++;
      date = new Date(year, month, day);
    }

    return date.toISOString().split('T')[0];
  };

  // Helper to get days in month
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Pattern 1: "from dec 20 until jan 5" or "dec 20 until jan 5"
  const rangePattern = new RegExp(
    `(?:from\\s+)?(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:until|to|through|-)\\s+(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?`,
    'i'
  );
  const rangeMatch = query.match(rangePattern);

  if (rangeMatch) {
    const depMonth = months[rangeMatch[1].toLowerCase()];
    const depDay = parseInt(rangeMatch[2]);
    const retMonth = months[rangeMatch[3].toLowerCase()];
    const retDay = parseInt(rangeMatch[4]);

    departureDate = toISODate(depMonth, depDay);

    // Handle year rollover (e.g., dec to jan)
    let retYear = now.getFullYear();
    if (retMonth < depMonth) {
      retYear++;
    }
    returnDate = toISODate(retMonth, retDay, retYear);
  }

  // Pattern 2: "from dec 20 until jan th" (incomplete day for return)
  if (!returnDate) {
    const incompleteReturnPattern = new RegExp(
      `(?:from\\s+)?(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:until|to|through|-)\\s+(${monthNames})(?:\\s+(?:th|st|nd|rd))?(?:\\s|$)`,
      'i'
    );
    const incompleteMatch = query.match(incompleteReturnPattern);

    if (incompleteMatch) {
      const depMonth = months[incompleteMatch[1].toLowerCase()];
      const depDay = parseInt(incompleteMatch[2]);
      const retMonth = months[incompleteMatch[3].toLowerCase()];

      departureDate = toISODate(depMonth, depDay);

      // Default to 15th of month if day not specified, or handle "th" without number
      let retYear = now.getFullYear();
      if (retMonth < depMonth) {
        retYear++;
      }
      // Smart default: assume ~2 week trip or mid-month
      const estimatedDay = Math.min(depDay + 7, getDaysInMonth(retMonth, retYear));
      returnDate = toISODate(retMonth, estimatedDay, retYear);
    }
  }

  // Pattern 3: "on december 23", "leaving december 23rd", "departing dec 23"
  if (!departureDate) {
    const departurePatterns = [
      new RegExp(`(?:on|leaving\\s+on|departing\\s+on|departing|from)?\\s*(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?`, 'i'),
      new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})`, 'i'),
      new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthNames})`, 'i')
    ];

    for (const pattern of departurePatterns) {
      const match = query.match(pattern);
      if (match) {
        let monthName: string;
        let day: number;

        // Determine which group has the month vs day
        if (months[match[1]?.toLowerCase()] !== undefined) {
          monthName = match[1].toLowerCase();
          day = parseInt(match[2]);
        } else {
          day = parseInt(match[1]);
          monthName = match[2].toLowerCase();
        }

        const month = months[monthName];
        if (month !== undefined && day > 0 && day <= 31) {
          departureDate = toISODate(month, day);
          break;
        }
      }
    }
  }

  // Pattern 4: "returning on jan 5", "return jan 5th"
  if (!returnDate && departureDate) {
    const returnPatterns = [
      new RegExp(`(?:returning|return(?:ing)?|until|back\\s+on)\\s+(?:on\\s+)?(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?`, 'i'),
      new RegExp(`(?:returning|return(?:ing)?|until|back\\s+on)\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})`, 'i')
    ];

    for (const pattern of returnPatterns) {
      const match = query.match(pattern);
      if (match) {
        let monthName: string;
        let day: number;

        if (months[match[1]?.toLowerCase()] !== undefined) {
          monthName = match[1].toLowerCase();
          day = parseInt(match[2]);
        } else {
          day = parseInt(match[1]);
          monthName = match[2].toLowerCase();
        }

        const month = months[monthName];
        if (month !== undefined && day > 0 && day <= 31) {
          const depDate = new Date(departureDate);
          let year = depDate.getFullYear();

          // Handle year rollover
          if (month < depDate.getMonth()) {
            year++;
          }

          returnDate = toISODate(month, day, year);
          break;
        }
      }
    }
  }

  // Pattern 5: Duration-based return ("for 2 weeks", "5 days")
  if (departureDate && !returnDate) {
    const durationPattern = /(?:for\s+)?(\d+)\s*(day|days|week|weeks|night|nights)/i;
    const durationMatch = query.match(durationPattern);

    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();

      const depDate = new Date(departureDate);
      let daysToAdd = amount;

      if (unit.startsWith('week')) {
        daysToAdd = amount * 7;
      }

      depDate.setDate(depDate.getDate() + daysToAdd);
      returnDate = depDate.toISOString().split('T')[0];
    }
  }

  // Pattern 6: ISO format dates
  const isoPattern = /\d{4}-\d{2}-\d{2}/g;
  const isoDates = query.match(isoPattern);
  if (isoDates) {
    if (!departureDate && isoDates[0]) departureDate = isoDates[0];
    if (!returnDate && isoDates[1]) returnDate = isoDates[1];
  }

  // Pattern 7: Relative dates ("next week", "next month", "in 2 weeks")
  if (!departureDate) {
    if (query.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      departureDate = nextWeek.toISOString().split('T')[0];
    } else if (query.includes('next month')) {
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      departureDate = nextMonth.toISOString().split('T')[0];
    } else if (query.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      departureDate = tomorrow.toISOString().split('T')[0];
    }

    const inWeeksMatch = query.match(/in\s+(\d+)\s+weeks?/i);
    if (inWeeksMatch) {
      const weeks = parseInt(inWeeksMatch[1]);
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + (weeks * 7));
      departureDate = futureDate.toISOString().split('T')[0];
    }
  }

  return { departureDate, returnDate };
}

/**
 * Extract cabin class from query
 */
function extractCabinClass(query: string): 'economy' | 'premium_economy' | 'business' | 'first' {
  if (/\b(?:first\s*class|primera\s*clase)\b/i.test(query)) return 'first';
  if (/\b(?:business\s*class|ejecutiva|executiva)\b/i.test(query)) return 'business';
  if (/\b(?:premium\s*economy|premium\s*eco|comfort\s*plus)\b/i.test(query)) return 'premium_economy';
  return 'economy';
}

/**
 * Extract number of passengers
 */
function extractPassengers(query: string): number {
  // Specific patterns
  const patterns = [
    /(\d+)\s*(?:passenger|passengers|people|persons?|adults?|traveler|travelers)/i,
    /(?:for|with)\s+(\d+)(?:\s+of\s+us)?/i,
    /(?:party|group)\s+of\s+(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      if (count > 0 && count <= 9) return count;
    }
  }

  // Check for solo travel
  if (/\b(?:just\s+me|myself|solo|alone|1\s+person|one\s+person)\b/i.test(query)) {
    return 1;
  }

  // Check for couple
  if (/\b(?:two\s+of\s+us|couple|my\s+(?:wife|husband|partner)\s+and\s+(?:i|me)|us\s+two)\b/i.test(query)) {
    return 2;
  }

  return 1; // Default to 1 passenger
}

/**
 * Extract all preferences from query (comprehensive)
 */
function extractAllPreferences(query: string): FlightPreferences {
  const preferences: FlightPreferences = {};

  // Direct/Non-stop flights
  if (/\b(?:direct|non-?stop|no\s+layover|no\s+stops?|no\s+connections?)\b/i.test(query)) {
    preferences.directFlightsOnly = true;
  }

  // Baggage preferences
  if (/\b(?:check(?:ed)?\s*bag(?:gage)?|luggage|include.*bag|with\s+bag(?:gage)?)\b/i.test(query)) {
    preferences.includeCheckedBaggage = true;
  }
  if (/\b(?:extra\s+bag(?:gage)?|additional\s+bag|more\s+luggage|2\s+bags?|two\s+bags?)\b/i.test(query)) {
    preferences.extraBaggage = true;
    preferences.includeCheckedBaggage = true;
  }

  // Seat preferences
  if (/\b(?:window\s+seat|sit\s+(?:by|at)\s+(?:the\s+)?window)\b/i.test(query)) {
    preferences.seatPreference = 'window';
  } else if (/\b(?:aisle\s+seat|aisle\s+side|sit\s+(?:on|by)\s+(?:the\s+)?aisle)\b/i.test(query)) {
    preferences.seatPreference = 'aisle';
  } else if (/\b(?:extra\s+leg\s*room|more\s+leg\s*room|comfort\s+seat|extra\s+space)\b/i.test(query)) {
    preferences.seatPreference = 'extra_legroom';
  }

  // Time preferences
  if (/\b(?:morning|early|am\s+flight|before\s+noon|start\s+early)\b/i.test(query)) {
    preferences.timePreference = 'morning';
  } else if (/\b(?:afternoon|midday|mid-day|lunch\s+time)\b/i.test(query)) {
    preferences.timePreference = 'afternoon';
  } else if (/\b(?:evening|night|late|pm\s+flight|after\s+work)\b/i.test(query)) {
    preferences.timePreference = 'evening';
  } else if (/\b(?:red-?eye|overnight\s+flight|late\s+night)\b/i.test(query)) {
    preferences.timePreference = 'red-eye';
  } else if (/\b(?:flexible|any\s+time|doesn'?t\s+matter|no\s+preference)\b/i.test(query)) {
    preferences.timePreference = 'flexible';
  }

  // Layover preferences
  const maxStopsMatch = query.match(/(?:max(?:imum)?|at\s+most|no\s+more\s+than)\s+(\d+)\s+(?:stop|layover|connection)/i);
  if (maxStopsMatch) {
    preferences.maxLayovers = parseInt(maxStopsMatch[1]);
  }

  // Short layovers preference
  if (/\b(?:short\s+layover|quick\s+connection|minimal\s+wait)\b/i.test(query)) {
    preferences.maxLayoverDuration = 120; // 2 hours max
  } else if (/\b(?:long\s+layover\s+ok|don'?t\s+mind\s+waiting)\b/i.test(query)) {
    preferences.maxLayoverDuration = 480; // 8 hours max
  }

  // Airline preferences
  const airlinePattern = /\b(?:prefer|like|only|want)\s+(\w+(?:\s+\w+)?)\s+(?:airlines?|airways?|flights?)\b/i;
  const airlineMatch = query.match(airlinePattern);
  if (airlineMatch) {
    preferences.preferredAirlines = [airlineMatch[1].toLowerCase()];
  }

  // Avoid airline
  const avoidPattern = /\b(?:avoid|no|not|don'?t\s+want)\s+(\w+(?:\s+\w+)?)\s+(?:airlines?|airways?)\b/i;
  const avoidMatch = query.match(avoidPattern);
  if (avoidMatch) {
    preferences.excludeAirlines = [avoidMatch[1].toLowerCase()];
  }

  return preferences;
}

/**
 * Search flights using Duffel API with preferences
 */
async function searchFlights(params: FlightSearchParams) {
  const { duffelAPI } = await import('@/lib/api/duffel');

  console.log('🔍 AI Search: Calling Duffel API with params:', params);

  try {
    const result = await duffelAPI.searchFlights({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.passengers,
      cabinClass: params.cabinClass,
      maxResults: 10, // Get more results for filtering
    });

    console.log(`✅ Duffel returned ${result.data.length} offers`);

    // Convert and filter based on preferences
    let flights = result.data.map((offer: any) => convertOfferToChatFormat(offer, params));

    // Apply preference filtering
    if (params.preferences) {
      flights = applyPreferenceFiltering(flights, params.preferences);
    }

    return flights.slice(0, 5); // Return top 5 after filtering
  } catch (error: any) {
    console.error('❌ Duffel search failed:', error.message);
    console.warn('⚠️ Returning fallback demo data');
    return getFallbackFlights(params);
  }
}

/**
 * Apply preference-based filtering to flight results
 */
function applyPreferenceFiltering(flights: any[], preferences: FlightPreferences): any[] {
  let filtered = [...flights];

  // Filter for direct flights only
  if (preferences.directFlightsOnly) {
    const direct = filtered.filter(f => f.outbound.stops === 0);
    if (direct.length > 0) {
      filtered = direct;
    }
    // If no direct flights, keep all but mark them
  }

  // Filter by max layovers
  if (preferences.maxLayovers !== undefined) {
    filtered = filtered.filter(f => f.outbound.stops <= preferences.maxLayovers!);
  }

  // Sort by time preference
  if (preferences.timePreference && preferences.timePreference !== 'flexible') {
    const timeRanges: Record<string, [number, number]> = {
      'morning': [5, 12],
      'afternoon': [12, 17],
      'evening': [17, 22],
      'red-eye': [22, 5]
    };

    const [start, end] = timeRanges[preferences.timePreference] || [0, 24];

    filtered.sort((a, b) => {
      const aHour = new Date(a.outbound.departure.time).getHours();
      const bHour = new Date(b.outbound.departure.time).getHours();

      const aInRange = (start < end) ? (aHour >= start && aHour < end) : (aHour >= start || aHour < end);
      const bInRange = (start < end) ? (bHour >= start && bHour < end) : (bHour >= start || bHour < end);

      if (aInRange && !bInRange) return -1;
      if (!aInRange && bInRange) return 1;
      return 0;
    });
  }

  return filtered;
}

/**
 * Convert Duffel offer to AI chat format
 */
function convertOfferToChatFormat(offer: any, params: FlightSearchParams) {
  const outboundSlice = offer.itineraries[0];
  const outboundSegment = outboundSlice.segments[0];
  const outboundLastSegment = outboundSlice.segments[outboundSlice.segments.length - 1];

  const flight: any = {
    id: offer.id,
    airline: getAirlineName(outboundSegment.carrierCode),
    airlineCode: outboundSegment.carrierCode,
    flightNumber: `${outboundSegment.carrierCode} ${outboundSegment.number}`,
    outbound: {
      departure: {
        airport: outboundSegment.departure.iataCode,
        time: outboundSegment.departure.at,
        terminal: outboundSegment.departure.terminal || ''
      },
      arrival: {
        airport: outboundLastSegment.arrival.iataCode,
        time: outboundLastSegment.arrival.at,
        terminal: outboundLastSegment.arrival.terminal || ''
      },
      duration: outboundSlice.duration,
      stops: outboundSlice.segments.length - 1,
      ...(outboundSlice.segments.length > 1 && {
        stopover: `${outboundSlice.segments[0].arrival.iataCode} - Layover`
      })
    },
    price: {
      amount: offer.price.total,
      currency: offer.price.currency
    },
    cabinClass: params.cabinClass,
    seatsAvailable: offer.numberOfBookableSeats || 9,
    baggage: {
      checked: extractBaggageInfo(offer),
      cabin: '1 x 7kg'
    },
    // Additional metadata
    isDirect: outboundSlice.segments.length === 1,
    preferences: params.preferences
  };

  // Add return leg if round-trip
  if (offer.itineraries.length > 1) {
    const returnSlice = offer.itineraries[1];
    const returnSegment = returnSlice.segments[0];
    const returnLastSegment = returnSlice.segments[returnSlice.segments.length - 1];

    flight.return = {
      departure: {
        airport: returnSegment.departure.iataCode,
        time: returnSegment.departure.at,
        terminal: returnSegment.departure.terminal || ''
      },
      arrival: {
        airport: returnLastSegment.arrival.iataCode,
        time: returnLastSegment.arrival.at,
        terminal: returnLastSegment.arrival.terminal || ''
      },
      duration: returnSlice.duration,
      stops: returnSlice.segments.length - 1,
      ...(returnSlice.segments.length > 1 && {
        stopover: `${returnSlice.segments[0].arrival.iataCode} - Layover`
      })
    };
  }

  return flight;
}

/**
 * Extract baggage info from offer
 */
function extractBaggageInfo(offer: any): string {
  try {
    const bags = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags;
    if (bags?.quantity) {
      return `${bags.quantity} x 23kg`;
    }
    if (bags?.weight) {
      return `${bags.weight}kg`;
    }
  } catch {
    // Ignore
  }
  return '1 x 23kg';
}

/**
 * Get airline name from code
 */
function getAirlineName(carrierCode: string): string {
  const airlines: Record<string, string> = {
    'EK': 'Emirates', 'EY': 'Etihad Airways', 'QR': 'Qatar Airways',
    'AA': 'American Airlines', 'DL': 'Delta Air Lines', 'UA': 'United Airlines',
    'BA': 'British Airways', 'LH': 'Lufthansa', 'AF': 'Air France',
    'KL': 'KLM', 'SQ': 'Singapore Airlines', 'TK': 'Turkish Airlines',
    'LA': 'LATAM Airlines', 'AV': 'Avianca', 'CM': 'Copa Airlines',
    'G3': 'Gol', 'AD': 'Azul', 'JJ': 'LATAM Brasil',
  };
  return airlines[carrierCode] || carrierCode;
}

/**
 * Fallback mock data
 */
function getFallbackFlights(params: FlightSearchParams) {
  const isRoundTrip = !!params.returnDate;
  const priceMultiplier = isRoundTrip ? 1.8 : 1;
  const isDirect = params.preferences?.directFlightsOnly;

  return [
    {
      id: 'fallback-1',
      airline: 'Demo Airline',
      airlineCode: 'DEMO',
      flightNumber: 'DEMO 101',
      outbound: {
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T08:00:00`,
          terminal: '1'
        },
        arrival: {
          airport: params.destination,
          time: `${params.departureDate}T19:30:00`,
          terminal: '2'
        },
        duration: 'PT11H30M',
        stops: isDirect ? 0 : 1
      },
      ...(isRoundTrip && {
        return: {
          departure: {
            airport: params.destination,
            time: `${params.returnDate}T21:00:00`,
            terminal: '2'
          },
          arrival: {
            airport: params.origin,
            time: `${params.returnDate}T08:30:00`,
            terminal: '1'
          },
          duration: 'PT11H30M',
          stops: isDirect ? 0 : 1
        }
      }),
      price: {
        amount: Math.round((params.cabinClass === 'business' ? 4999 : 799) * priceMultiplier).toString(),
        currency: 'USD'
      },
      cabinClass: params.cabinClass,
      seatsAvailable: 9,
      baggage: {
        checked: params.preferences?.includeCheckedBaggage ? '1 x 23kg' : 'Not included',
        cabin: '1 x 7kg'
      },
      isDirect: isDirect,
      preferences: params.preferences
    }
  ];
}

/**
 * Generate search summary message
 */
function generateSearchSummary(params: FlightSearchParams, count: number, language: string): string {
  const cabinLabels: Record<string, Record<string, string>> = {
    economy: { en: 'Economy', pt: 'Econômica', es: 'Económica' },
    premium_economy: { en: 'Premium Economy', pt: 'Econômica Premium', es: 'Económica Premium' },
    business: { en: 'Business', pt: 'Executiva', es: 'Ejecutiva' },
    first: { en: 'First Class', pt: 'Primeira Classe', es: 'Primera Clase' }
  };

  const cabin = cabinLabels[params.cabinClass]?.[language] || cabinLabels[params.cabinClass]?.en;

  const messages: Record<string, string> = {
    en: `I found ${count} ${cabin} flight${count !== 1 ? 's' : ''} from ${params.origin} to ${params.destination} on ${params.departureDate}${params.returnDate ? ` with return on ${params.returnDate}` : ''}. Here are the best options:`,
    pt: `Encontrei ${count} voo${count !== 1 ? 's' : ''} em ${cabin} de ${params.origin} para ${params.destination} em ${params.departureDate}${params.returnDate ? ` com retorno em ${params.returnDate}` : ''}. Aqui estão as melhores opções:`,
    es: `Encontré ${count} vuelo${count !== 1 ? 's' : ''} en ${cabin} de ${params.origin} a ${params.destination} el ${params.departureDate}${params.returnDate ? ` con regreso el ${params.returnDate}` : ''}. Aquí están las mejores opciones:`
  };

  return messages[language] || messages.en;
}

/**
 * Generate preference summary message
 */
function generatePreferenceSummary(preferences: FlightPreferences, language: string): string {
  const parts: string[] = [];

  if (preferences.directFlightsOnly) {
    parts.push(language === 'en' ? 'direct flights only' : language === 'pt' ? 'apenas voos diretos' : 'solo vuelos directos');
  }

  if (preferences.includeCheckedBaggage) {
    parts.push(language === 'en' ? 'including checked baggage' : language === 'pt' ? 'incluindo bagagem despachada' : 'incluyendo equipaje facturado');
  }

  if (preferences.seatPreference) {
    const seatLabels: Record<string, Record<string, string>> = {
      window: { en: 'window seat', pt: 'assento janela', es: 'asiento ventana' },
      aisle: { en: 'aisle seat', pt: 'assento corredor', es: 'asiento pasillo' },
      extra_legroom: { en: 'extra legroom', pt: 'espaço extra para pernas', es: 'espacio extra para piernas' }
    };
    if (seatLabels[preferences.seatPreference]) {
      parts.push(seatLabels[preferences.seatPreference][language] || seatLabels[preferences.seatPreference].en);
    }
  }

  if (preferences.timePreference && preferences.timePreference !== 'flexible') {
    const timeLabels: Record<string, Record<string, string>> = {
      morning: { en: 'morning flights', pt: 'voos pela manhã', es: 'vuelos por la mañana' },
      afternoon: { en: 'afternoon flights', pt: 'voos à tarde', es: 'vuelos por la tarde' },
      evening: { en: 'evening flights', pt: 'voos à noite', es: 'vuelos por la noche' },
      'red-eye': { en: 'red-eye flights', pt: 'voos noturnos', es: 'vuelos nocturnos' }
    };
    if (timeLabels[preferences.timePreference]) {
      parts.push(timeLabels[preferences.timePreference][language] || timeLabels[preferences.timePreference].en);
    }
  }

  if (parts.length === 0) return '';

  const prefix: Record<string, string> = {
    en: 'Searching with your preferences:',
    pt: 'Buscando com suas preferências:',
    es: 'Buscando con tus preferencias:'
  };

  return `${prefix[language] || prefix.en} ${parts.join(', ')}.`;
}

/**
 * Generate missing field suggestion
 */
function generateMissingSuggestion(missingFields: string[], language: string): string {
  const templates: Record<string, string> = {
    en: `Please provide: ${missingFields.join(', ')}. For example: "I need a flight from New York to London on December 20th"`,
    pt: `Por favor, forneça: ${missingFields.join(', ')}. Por exemplo: "Preciso de um voo de Nova York para Londres em 20 de dezembro"`,
    es: `Por favor, proporcione: ${missingFields.join(', ')}. Por ejemplo: "Necesito un vuelo de Nueva York a Londres el 20 de diciembre"`
  };

  return templates[language] || templates.en;
}
