/**
 * Agent Information Extraction - State of the Art
 * Extracts structured information from natural language user input
 *
 * Features:
 * - Comprehensive preference extraction (baggage, seats, time, layovers)
 * - Multi-language support (EN, PT, ES)
 * - Smart context understanding
 * - High confidence scoring
 */

import { CollectedInfo, TripType, BudgetLevel, ServiceType } from './agent-conversation-flow';

// Extended preferences interface
export interface ExtendedPreferences {
  directFlights?: boolean;
  airlinePreference?: string[];
  excludeAirlines?: string[];
  hotelStars?: number;
  specialRequirements?: string[];
  // New comprehensive preferences
  includeCheckedBaggage?: boolean;
  extraBaggage?: boolean;
  baggageWeight?: string;
  seatPreference?: 'window' | 'aisle' | 'middle' | 'extra_legroom' | 'front' | 'back' | 'exit_row';
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'red-eye' | 'flexible';
  departureTimeRange?: { start: string; end: string };
  maxLayovers?: number;
  maxLayoverDuration?: number;
  shortLayovers?: boolean;
  mealPreference?: 'vegetarian' | 'vegan' | 'kosher' | 'halal' | 'gluten_free' | 'none';
  wifiRequired?: boolean;
  powerOutlet?: boolean;
  entertainmentRequired?: boolean;
  infantOnLap?: boolean;
  petInCabin?: boolean;
  wheelchairRequired?: boolean;
  assistanceRequired?: boolean;
  flexibleDates?: boolean;
  refundable?: boolean;
  loyaltyProgram?: string;
}

// Common airport codes and city mappings (comprehensive)
const AIRPORT_MAPPINGS: Record<string, string> = {
  // North America
  'new york': 'JFK', 'nyc': 'JFK', 'jfk': 'JFK', 'laguardia': 'LGA', 'newark': 'EWR',
  'los angeles': 'LAX', 'la': 'LAX', 'lax': 'LAX',
  'chicago': 'ORD', 'ord': 'ORD', 'ohare': 'ORD',
  'miami': 'MIA', 'san francisco': 'SFO', 'sf': 'SFO',
  'seattle': 'SEA', 'boston': 'BOS', 'atlanta': 'ATL',
  'dallas': 'DFW', 'houston': 'IAH', 'denver': 'DEN',
  'las vegas': 'LAS', 'vegas': 'LAS', 'phoenix': 'PHX',
  'orlando': 'MCO', 'washington': 'IAD', 'dc': 'IAD',
  'toronto': 'YYZ', 'vancouver': 'YVR', 'montreal': 'YUL',
  'mexico city': 'MEX', 'cancun': 'CUN',

  // Europe
  'london': 'LHR', 'heathrow': 'LHR', 'gatwick': 'LGW',
  'paris': 'CDG', 'cdg': 'CDG', 'orly': 'ORY',
  'frankfurt': 'FRA', 'amsterdam': 'AMS', 'schiphol': 'AMS',
  'madrid': 'MAD', 'barcelona': 'BCN', 'rome': 'FCO',
  'milan': 'MXP', 'munich': 'MUC', 'berlin': 'BER',
  'vienna': 'VIE', 'zurich': 'ZRH', 'lisbon': 'LIS',
  'dublin': 'DUB', 'prague': 'PRG', 'athens': 'ATH',
  'istanbul': 'IST', 'copenhagen': 'CPH', 'stockholm': 'ARN',

  // Asia & Middle East
  'tokyo': 'NRT', 'narita': 'NRT', 'haneda': 'HND',
  'dubai': 'DXB', 'singapore': 'SIN', 'hong kong': 'HKG',
  'bangkok': 'BKK', 'seoul': 'ICN', 'incheon': 'ICN',
  'mumbai': 'BOM', 'delhi': 'DEL', 'shanghai': 'PVG',
  'beijing': 'PEK', 'doha': 'DOH', 'abu dhabi': 'AUH',

  // South America
  'sao paulo': 'GRU', 'são paulo': 'GRU', 'guarulhos': 'GRU',
  'rio de janeiro': 'GIG', 'rio': 'GIG', 'galeao': 'GIG',
  'buenos aires': 'EZE', 'lima': 'LIM', 'bogota': 'BOG',
  'santiago': 'SCL', 'medellin': 'MDE', 'cartagena': 'CTG',

  // Oceania
  'sydney': 'SYD', 'melbourne': 'MEL', 'brisbane': 'BNE',
  'auckland': 'AKL', 'perth': 'PER',

  // Africa
  'cairo': 'CAI', 'johannesburg': 'JNB', 'cape town': 'CPT',
  'nairobi': 'NBO', 'casablanca': 'CMN', 'marrakech': 'RAK',
};

/**
 * Extract service type from user message
 */
export function extractServiceType(message: string): ServiceType | null {
  const lowerMessage = message.toLowerCase();

  // Flight indicators (expanded)
  const flightKeywords = [
    'flight', 'fly', 'plane', 'ticket', 'airline', 'departure', 'arrival',
    'take off', 'landing', 'airfare', 'airplane', 'jet', 'air travel',
    'vuelo', 'voo', 'avion', 'avião', 'pasaje', 'passagem'
  ];

  // Hotel indicators (expanded)
  const hotelKeywords = [
    'hotel', 'accommodation', 'stay', 'room', 'resort', 'lodge',
    'check in', 'check out', 'booking', 'reservation', 'hostel', 'motel',
    'hospedaje', 'hospedagem', 'pousada', 'habitación', 'quarto'
  ];

  // Package indicators (expanded)
  const packageKeywords = [
    'package', 'bundle', 'all inclusive', 'vacation package',
    'flight and hotel', 'complete trip', 'everything',
    'paquete', 'pacote', 'todo incluido', 'tudo incluído'
  ];

  // Car rental indicators
  const carKeywords = [
    'car rental', 'rent a car', 'rental car', 'alquiler de auto',
    'aluguel de carro', 'coche', 'vehicle'
  ];

  // Check for package first (most specific)
  if (packageKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'package';
  }

  // Check for hotel
  if (hotelKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'hotel';
  }

  // Check for flight
  if (flightKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'flight';
  }

  return null;
}

/**
 * Extract trip type from user message
 */
export function extractTripType(message: string): TripType | null {
  const lowerMessage = message.toLowerCase();

  const tripTypePatterns: { type: TripType; keywords: string[] }[] = [
    {
      type: 'business',
      keywords: ['business', 'work', 'conference', 'meeting', 'corporate', 'office',
        'negócio', 'trabalho', 'negocio', 'reunión', 'conferencia'],
    },
    {
      type: 'vacation',
      keywords: ['vacation', 'holiday', 'leisure', 'relax', 'getaway', 'fun', 'pleasure',
        'férias', 'vacaciones', 'descanso', 'lazer'],
    },
    {
      type: 'family',
      keywords: ['family', 'kids', 'children', 'parents', 'relatives', 'visiting family',
        'família', 'familia', 'niños', 'crianças', 'hijos'],
    },
    {
      type: 'romantic',
      keywords: ['romantic', 'honeymoon', 'anniversary', 'couple', 'partner', 'spouse',
        'lua de mel', 'luna de miel', 'aniversário', 'romántico'],
    },
    {
      type: 'adventure',
      keywords: ['adventure', 'hiking', 'trekking', 'backpacking', 'exploring', 'safari',
        'aventura', 'trilha', 'explorar', 'mochilero'],
    },
    {
      type: 'solo',
      keywords: ['solo', 'alone', 'myself', 'just me', 'by myself', 'single traveler',
        'sozinho', 'solo', 'solitário'],
    },
  ];

  for (const pattern of tripTypePatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return pattern.type;
    }
  }

  return null;
}

/**
 * Extract destination from user message
 */
export function extractDestination(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Common phrases that indicate destination (multi-language)
  const destinationPhrases = [
    /(?:going to|fly to|flying to|travel to|visit|headed to|destination is|ir a|ir para|viajar a|viajar para)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:^|\s)to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:would be|sounds|looks)/i,
  ];

  for (const pattern of destinationPhrases) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const destination = match[1].trim();
      if (destination.length > 2 && !isCommonWord(destination)) {
        return destination;
      }
    }
  }

  // Look for capitalized location names (cities/countries)
  const locationPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  const matches = [...message.matchAll(locationPattern)];

  for (const match of matches) {
    const location = match[1];
    if (!isCommonWord(location) && location.length > 2) {
      if (AIRPORT_MAPPINGS[location.toLowerCase()] || isLikelyDestination(location)) {
        return location;
      }
    }
  }

  return null;
}

/**
 * Extract origin from user message
 */
export function extractOrigin(message: string): string | null {
  // Common phrases that indicate origin (multi-language)
  const originPhrases = [
    /(?:from|leaving|departing from|flying from|starting from|desde|de|saindo de|partindo de)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:^|\s)from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+/i,
  ];

  for (const pattern of originPhrases) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const origin = match[1].trim();
      if (origin.length > 2 && !isCommonWord(origin)) {
        return origin;
      }
    }
  }

  return null;
}

/**
 * Extract dates from user message (comprehensive)
 */
export function extractDates(message: string): { departure: string; return?: string; flexible?: boolean } | null {
  const lowerMessage = message.toLowerCase();

  // Check for flexibility (multi-language)
  const flexible = /flexible|any(?:time)?|whenever|doesn'?t matter|flexível|flexible|cualquier/i.test(message);

  // Date patterns (expanded)
  const datePatterns = [
    // Month day format: November 15, Nov 15, 11/15
    /(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?/gi,
    // Numeric format: 11/15, 11-15, 11.15
    /\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?/g,
    // Relative dates: next week, this weekend
    /(?:next|this|coming|próximo|próxima|este|esta)\s+(?:week|weekend|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|semana|fin de semana|mes)/gi,
    // Day month format: 15 November, 15 de noviembre
    /\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/gi,
  ];

  const foundDates: string[] = [];

  for (const pattern of datePatterns) {
    const matches = message.match(pattern);
    if (matches) {
      foundDates.push(...matches);
    }
  }

  if (foundDates.length === 0) {
    return flexible ? { departure: '', flexible: true } : null;
  }

  // Parse the first date as departure
  const departure = parseDateString(foundDates[0]);

  if (!departure) {
    return null;
  }

  // Check for return date
  let returnDate: string | undefined;

  if (foundDates.length > 1) {
    returnDate = parseDateString(foundDates[1]) || undefined;
  } else {
    // Look for duration indicators (multi-language)
    const durationMatch = message.match(/(\d+)\s+(?:days?|nights?|weeks?|dias?|noches?|noites?|semanas?)/i);
    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      const departureDate = new Date(departure);

      let daysToAdd = amount;
      if (unit.includes('week') || unit.includes('semana')) {
        daysToAdd = amount * 7;
      }

      departureDate.setDate(departureDate.getDate() + daysToAdd);
      returnDate = departureDate.toISOString().split('T')[0];
    }
  }

  return {
    departure,
    return: returnDate,
    flexible,
  };
}

/**
 * Extract number of travelers from user message
 */
export function extractTravelers(message: string): { adults: number; children?: number; infants?: number } | null {
  const lowerMessage = message.toLowerCase();

  // Solo indicators (multi-language)
  if (/\b(?:just me|myself|solo|alone|one person|1 person|sozinho|solo|sólo yo)\b/i.test(message)) {
    return { adults: 1 };
  }

  // Specific patterns
  const patterns = [
    // "2 adults and 1 child"
    /(\d+)\s+adults?\s+(?:and\s+)?(\d+)\s+(?:children|child|kids?|niños?|crianças?)/i,
    // family of 4
    /family of (\d+)|familia de (\d+)|família de (\d+)/i,
    // "2 people"
    /(\d+)\s+(?:people|persons?|passengers?|travelers?|personas?|passageiros?|viajeros?)/i,
    // Just a number
    /\b(\d+)\b/,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const adults = parseInt(match[1] || match[2] || match[3]);

      // Check for children
      const childrenMatch = message.match(/(\d+)\s+(?:children|child|kids?|niños?|crianças?)/i);
      const children = childrenMatch ? parseInt(childrenMatch[1]) : undefined;

      // Check for infants
      const infantsMatch = message.match(/(\d+)\s+(?:infants?|babies|bebés?|bebês?)/i);
      const infants = infantsMatch ? parseInt(infantsMatch[1]) : undefined;

      if (adults > 0 && adults <= 10) {
        return { adults, children, infants };
      }
    }
  }

  return null;
}

/**
 * Extract budget level from user message
 */
export function extractBudget(message: string): BudgetLevel | null {
  const lowerMessage = message.toLowerCase();

  const budgetPatterns: { level: BudgetLevel; keywords: string[] }[] = [
    {
      level: 'economy',
      keywords: ['economy', 'budget', 'cheap', 'affordable', 'low cost', 'save money', 'cheapest',
        'económico', 'econômico', 'barato', 'ahorrar'],
    },
    {
      level: 'premium',
      keywords: ['premium', 'business class', 'comfort', 'upgrade', 'better', 'extra space',
        'premium', 'confort', 'ejecutiva', 'executiva'],
    },
    {
      level: 'luxury',
      keywords: ['luxury', 'first class', 'best', 'top', 'finest', 'deluxe', 'five star', '5 star',
        'lujo', 'luxo', 'primera clase', 'primeira classe'],
    },
    {
      level: 'flexible',
      keywords: ['flexible', 'any', 'doesn\'t matter', 'open', 'whatever', 'anything',
        'flexible', 'cualquiera', 'qualquer'],
    },
  ];

  for (const pattern of budgetPatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return pattern.level;
    }
  }

  return null;
}

/**
 * Extract comprehensive preferences from user message
 */
export function extractPreferences(message: string): ExtendedPreferences | undefined {
  const lowerMessage = message.toLowerCase();
  const preferences: ExtendedPreferences = {};

  // Direct flight preference
  if (/\b(?:direct|non-?stop|no\s+layover|no\s+stops?|no\s+connections?|directo|sin\s+escalas?|sem\s+escalas?)\b/i.test(message)) {
    preferences.directFlights = true;
  }

  // Airline preference
  const airlineMatch = message.match(/\b(?:prefer|like|only|want|quiero|prefiero|quero)\s+(\w+(?:\s+\w+)?)\s+(?:airline|airways|líneas?|aéreas?)/i);
  if (airlineMatch) {
    preferences.airlinePreference = [airlineMatch[1]];
  }

  // Avoid airline
  const avoidMatch = message.match(/\b(?:avoid|no|not|don'?t\s+want|evitar|não\s+quero)\s+(\w+(?:\s+\w+)?)\s+(?:airline|airways)/i);
  if (avoidMatch) {
    preferences.excludeAirlines = [avoidMatch[1]];
  }

  // Hotel stars
  const starsMatch = message.match(/(\d)\s*star|(\d)\s*estrella|(\d)\s*estrela/i);
  if (starsMatch) {
    preferences.hotelStars = parseInt(starsMatch[1] || starsMatch[2] || starsMatch[3]);
  }

  // === NEW COMPREHENSIVE PREFERENCES ===

  // Baggage preferences (comprehensive)
  if (/\b(?:check(?:ed)?\s*bag(?:gage)?|luggage|include.*bag|with\s+bag|maleta\s+facturada|bagagem\s+despachada|equipaje\s+facturado)\b/i.test(message)) {
    preferences.includeCheckedBaggage = true;
  }
  if (/\b(?:extra\s+bag(?:gage)?|additional\s+bag|more\s+luggage|2\s+bags?|two\s+bags?|dos\s+maletas?|duas\s+malas?)\b/i.test(message)) {
    preferences.extraBaggage = true;
    preferences.includeCheckedBaggage = true;
  }

  // Seat preferences (comprehensive)
  if (/\b(?:window\s+seat|sit.*window|ventana|janela)\b/i.test(message)) {
    preferences.seatPreference = 'window';
  } else if (/\b(?:aisle\s+seat|aisle\s+side|sit.*aisle|pasillo|corredor)\b/i.test(message)) {
    preferences.seatPreference = 'aisle';
  } else if (/\b(?:extra\s+leg\s*room|more\s+leg\s*room|comfort\s+seat|extra\s+space|más\s+espacio|mais\s+espaço)\b/i.test(message)) {
    preferences.seatPreference = 'extra_legroom';
  } else if (/\b(?:exit\s+row|emergency\s+exit|salida\s+de\s+emergencia)\b/i.test(message)) {
    preferences.seatPreference = 'exit_row';
  } else if (/\b(?:front\s+(?:of\s+)?(?:the\s+)?plane|frente\s+del\s+avión|frente\s+do\s+avião)\b/i.test(message)) {
    preferences.seatPreference = 'front';
  } else if (/\b(?:back\s+(?:of\s+)?(?:the\s+)?plane|atrás\s+del\s+avión|traseira\s+do\s+avião)\b/i.test(message)) {
    preferences.seatPreference = 'back';
  }

  // Time preferences (comprehensive)
  if (/\b(?:morning|early|am\s+flight|before\s+noon|start\s+early|madrugada|manhã|mañana\s+temprano)\b/i.test(message)) {
    preferences.timePreference = 'morning';
  } else if (/\b(?:afternoon|midday|mid-day|lunch\s+time|tarde|mediodía)\b/i.test(message)) {
    preferences.timePreference = 'afternoon';
  } else if (/\b(?:evening|night|late|pm\s+flight|after\s+work|noche|noite)\b/i.test(message)) {
    preferences.timePreference = 'evening';
  } else if (/\b(?:red-?eye|overnight\s+flight|late\s+night|vuelo\s+nocturno|voo\s+noturno)\b/i.test(message)) {
    preferences.timePreference = 'red-eye';
  } else if (/\b(?:flexible|any\s+time|doesn'?t\s+matter|no\s+preference|cualquier\s+hora|qualquer\s+hora)\b/i.test(message)) {
    preferences.timePreference = 'flexible';
  }

  // Layover preferences
  const maxStopsMatch = message.match(/(?:max(?:imum)?|at\s+most|no\s+more\s+than|máximo)\s+(\d+)\s+(?:stop|layover|connection|escala)/i);
  if (maxStopsMatch) {
    preferences.maxLayovers = parseInt(maxStopsMatch[1]);
  }

  if (/\b(?:short\s+layover|quick\s+connection|minimal\s+wait|escala\s+corta|conexão\s+rápida)\b/i.test(message)) {
    preferences.shortLayovers = true;
    preferences.maxLayoverDuration = 120; // 2 hours
  }

  // Meal preferences
  if (/\b(?:vegetarian|veggie|sin\s+carne|sem\s+carne)\b/i.test(message)) {
    preferences.mealPreference = 'vegetarian';
  } else if (/\b(?:vegan|vegano)\b/i.test(message)) {
    preferences.mealPreference = 'vegan';
  } else if (/\b(?:kosher)\b/i.test(message)) {
    preferences.mealPreference = 'kosher';
  } else if (/\b(?:halal)\b/i.test(message)) {
    preferences.mealPreference = 'halal';
  } else if (/\b(?:gluten[- ]?free|sin\s+gluten|sem\s+glúten)\b/i.test(message)) {
    preferences.mealPreference = 'gluten_free';
  }

  // Amenity preferences
  if (/\b(?:wifi|wi-fi|internet)\b/i.test(message)) {
    preferences.wifiRequired = true;
  }
  if (/\b(?:power\s+outlet|charging|usb|tomada|enchufe)\b/i.test(message)) {
    preferences.powerOutlet = true;
  }
  if (/\b(?:entertainment|movies|pantalla|tela)\b/i.test(message)) {
    preferences.entertainmentRequired = true;
  }

  // Special requirements
  const specialReqs: string[] = [];

  if (/\b(?:wheelchair|mobility|accessible|silla\s+de\s+ruedas|cadeira\s+de\s+rodas)\b/i.test(message)) {
    specialReqs.push('wheelchair_accessible');
    preferences.wheelchairRequired = true;
  }

  if (/\b(?:dietary|food\s+allergy|allergi|alergia)\b/i.test(message)) {
    specialReqs.push('dietary_requirements');
  }

  if (/\b(?:pet|dog|cat|animal|mascota|animal\s+de\s+estimação)\b/i.test(message)) {
    specialReqs.push('traveling_with_pet');
    preferences.petInCabin = true;
  }

  if (/\b(?:infant|baby|bebé|bebê|lap)\b/i.test(message)) {
    specialReqs.push('traveling_with_infant');
    preferences.infantOnLap = true;
  }

  if (/\b(?:assistance|special\s+needs|asistencia|assistência)\b/i.test(message)) {
    specialReqs.push('assistance_required');
    preferences.assistanceRequired = true;
  }

  if (specialReqs.length > 0) {
    preferences.specialRequirements = specialReqs;
  }

  // Flexibility and refund preferences
  if (/\b(?:flexible\s+dates?|fechas?\s+flexibles?|datas?\s+flexíveis?)\b/i.test(message)) {
    preferences.flexibleDates = true;
  }
  if (/\b(?:refundable|reembolsable|reembolsável|cancel(?:able|ation)?)\b/i.test(message)) {
    preferences.refundable = true;
  }

  // Loyalty program
  const loyaltyMatch = message.match(/\b(?:frequent\s+flyer|mileage|miles|smiles|aadvantage|skymiles|mileageplus)\b/i);
  if (loyaltyMatch) {
    preferences.loyaltyProgram = loyaltyMatch[0].toLowerCase();
  }

  return Object.keys(preferences).length > 0 ? preferences : undefined;
}

/**
 * Main extraction function - extracts all possible info from user message
 */
export function extractAllInformation(message: string): Partial<CollectedInfo> {
  const extracted: Partial<CollectedInfo> = {};

  // Extract each piece of information
  const serviceType = extractServiceType(message);
  if (serviceType) extracted.serviceType = serviceType;

  const tripType = extractTripType(message);
  if (tripType) extracted.tripType = tripType;

  const destination = extractDestination(message);
  if (destination) extracted.destination = destination;

  const origin = extractOrigin(message);
  if (origin) extracted.origin = origin;

  const dates = extractDates(message);
  if (dates) extracted.dates = dates;

  const travelers = extractTravelers(message);
  if (travelers) extracted.travelers = travelers;

  const budget = extractBudget(message);
  if (budget) extracted.budget = budget;

  const preferences = extractPreferences(message);
  if (preferences) extracted.preferences = preferences as CollectedInfo['preferences'];

  return extracted;
}

/**
 * Helper: Check if a word is a common English word (not a location)
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'The', 'And', 'But', 'For', 'Not', 'Are', 'Was', 'Were', 'Been', 'Have',
    'Has', 'Had', 'Do', 'Does', 'Did', 'Will', 'Would', 'Could', 'Should',
    'May', 'Might', 'Must', 'Can', 'Going', 'Want', 'Need', 'Like', 'Love',
    'Think', 'Know', 'See', 'Look', 'Make', 'Take', 'Get', 'Give', 'Come',
    'Go', 'Say', 'Tell', 'Ask', 'Use', 'Find', 'Feel', 'Try', 'Leave',
    'Call', 'Put', 'Let', 'Keep', 'Begin', 'Start', 'Show', 'Hear', 'Play',
    'Run', 'Move', 'Live', 'Believe', 'Bring', 'Happen', 'Write', 'Sit',
    'Stand', 'Lose', 'Pay', 'Meet', 'Include', 'Continue', 'Set', 'Learn',
    'Change', 'Lead', 'Understand', 'Watch', 'Follow', 'Stop', 'Create',
    'Speak', 'Read', 'Allow', 'Add', 'Spend', 'Grow', 'Open', 'Walk', 'Win',
    'Offer', 'Remember', 'Consider', 'Appear', 'Buy', 'Wait', 'Serve', 'Die',
    'Send', 'Expect', 'Build', 'Stay', 'Fall', 'Cut', 'Reach', 'Kill', 'Remain',
    'Morning', 'Afternoon', 'Evening', 'Night', 'Today', 'Tomorrow', 'Yesterday',
    'Week', 'Month', 'Year', 'Day', 'Time', 'Flight', 'Hotel', 'Trip'
  ];

  return commonWords.includes(word);
}

/**
 * Helper: Check if a word is likely a destination
 */
function isLikelyDestination(word: string): boolean {
  // Check if it's in our airport mappings
  if (AIRPORT_MAPPINGS[word.toLowerCase()]) {
    return true;
  }

  // Common destination patterns
  const destinationSuffixes = ['city', 'town', 'island', 'beach', 'land', 'port', 'ville', 'burg', 'shire'];
  const lowerWord = word.toLowerCase();

  return destinationSuffixes.some(suffix => lowerWord.endsWith(suffix));
}

/**
 * Helper: Parse date string into ISO format
 */
function parseDateString(dateStr: string): string | null {
  try {
    // Handle relative dates (multi-language)
    const lowerDate = dateStr.toLowerCase();
    const now = new Date();

    if (lowerDate.includes('next week') || lowerDate.includes('próxima semana') || lowerDate.includes('próxima semana')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }

    if (lowerDate.includes('this weekend') || lowerDate.includes('este fin de semana') || lowerDate.includes('este fim de semana')) {
      const weekend = new Date(now);
      const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
      weekend.setDate(now.getDate() + daysUntilSaturday);
      return weekend.toISOString().split('T')[0];
    }

    if (lowerDate.includes('next month') || lowerDate.includes('próximo mes') || lowerDate.includes('próximo mês')) {
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      return nextMonth.toISOString().split('T')[0];
    }

    // Try to parse as date
    const date = new Date(dateStr);

    if (!isNaN(date.getTime())) {
      // If year is not specified, assume current year
      if (dateStr.match(/^\d{1,2}[\/\-\.]\d{1,2}$/) || !dateStr.match(/\d{4}/)) {
        date.setFullYear(now.getFullYear());

        // If date is in the past, assume next year
        if (date < now) {
          date.setFullYear(now.getFullYear() + 1);
        }
      }

      return date.toISOString().split('T')[0];
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Confidence score for extracted information (0-1)
 */
export function getExtractionConfidence(
  message: string,
  extracted: Partial<CollectedInfo>
): number {
  let confidence = 0;
  let factors = 0;

  // Check each field
  if (extracted.serviceType) {
    confidence += 0.9;
    factors++;
  }

  if (extracted.destination) {
    const inMappings = AIRPORT_MAPPINGS[extracted.destination.toLowerCase()];
    confidence += inMappings ? 0.95 : 0.7;
    factors++;
  }

  if (extracted.origin) {
    const inMappings = AIRPORT_MAPPINGS[extracted.origin.toLowerCase()];
    confidence += inMappings ? 0.95 : 0.7;
    factors++;
  }

  if (extracted.dates) {
    confidence += extracted.dates.flexible ? 0.6 : 0.85;
    factors++;
  }

  if (extracted.travelers) {
    confidence += 0.9;
    factors++;
  }

  if (extracted.budget) {
    confidence += 0.8;
    factors++;
  }

  if (extracted.preferences) {
    confidence += 0.85;
    factors++;
  }

  return factors > 0 ? confidence / factors : 0;
}

/**
 * Generate summary of extracted preferences for agent response
 */
export function generatePreferenceSummary(preferences: ExtendedPreferences, language: string = 'en'): string {
  const parts: string[] = [];

  if (preferences.directFlights) {
    parts.push(language === 'en' ? 'direct flights' : language === 'pt' ? 'voos diretos' : 'vuelos directos');
  }

  if (preferences.includeCheckedBaggage) {
    parts.push(language === 'en' ? 'checked baggage' : language === 'pt' ? 'bagagem despachada' : 'equipaje facturado');
  }

  if (preferences.seatPreference) {
    const seatLabels: Record<string, Record<string, string>> = {
      window: { en: 'window seat', pt: 'assento janela', es: 'asiento ventana' },
      aisle: { en: 'aisle seat', pt: 'assento corredor', es: 'asiento pasillo' },
      extra_legroom: { en: 'extra legroom', pt: 'mais espaço para pernas', es: 'más espacio para piernas' },
      exit_row: { en: 'exit row', pt: 'fileira de emergência', es: 'fila de salida' },
    };
    if (seatLabels[preferences.seatPreference]) {
      parts.push(seatLabels[preferences.seatPreference][language] || seatLabels[preferences.seatPreference].en);
    }
  }

  if (preferences.timePreference && preferences.timePreference !== 'flexible') {
    const timeLabels: Record<string, Record<string, string>> = {
      morning: { en: 'morning departure', pt: 'partida pela manhã', es: 'salida por la mañana' },
      afternoon: { en: 'afternoon departure', pt: 'partida à tarde', es: 'salida por la tarde' },
      evening: { en: 'evening departure', pt: 'partida à noite', es: 'salida por la noche' },
      'red-eye': { en: 'red-eye flight', pt: 'voo noturno', es: 'vuelo nocturno' },
    };
    if (timeLabels[preferences.timePreference]) {
      parts.push(timeLabels[preferences.timePreference][language] || timeLabels[preferences.timePreference].en);
    }
  }

  if (preferences.mealPreference) {
    parts.push(preferences.mealPreference);
  }

  if (preferences.refundable) {
    parts.push(language === 'en' ? 'refundable fare' : language === 'pt' ? 'tarifa reembolsável' : 'tarifa reembolsable');
  }

  if (parts.length === 0) return '';

  const prefix: Record<string, string> = {
    en: 'Your preferences:',
    pt: 'Suas preferências:',
    es: 'Tus preferencias:',
  };

  return `${prefix[language] || prefix.en} ${parts.join(', ')}.`;
}
