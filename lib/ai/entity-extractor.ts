/**
 * Entity Extractor with Confidence Scores
 *
 * Extracts travel entities even with:
 * - Typos ("uero", "pra", "nyc")
 * - Mixed language
 * - Informal phrasing
 *
 * Returns confidence scores (0-1) per slot.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ExtractedSlot<T> {
  value: T;
  confidence: number;  // 0-1
  source: 'exact' | 'fuzzy' | 'inferred';
  rawMatch: string;
}

export interface ExtractedEntities {
  origin?: ExtractedSlot<string>;
  destination?: ExtractedSlot<string>;
  departureDate?: ExtractedSlot<string>;
  returnDate?: ExtractedSlot<string>;
  passengers?: ExtractedSlot<number>;
  cabinClass?: ExtractedSlot<string>;
  tripType?: ExtractedSlot<'one-way' | 'round-trip'>;
  language: 'en' | 'pt' | 'es';
}

export interface ConfirmationNeeded {
  slot: keyof ExtractedEntities;
  value: string;
  confidence: number;
  confirmationPrompt: Record<string, string>;
}

// ============================================================================
// CITY/AIRPORT DATABASE WITH VARIATIONS
// ============================================================================

interface CityEntry {
  canonical: string;
  code: string;
  variations: string[];
}

const CITY_DATABASE: CityEntry[] = [
  // US Cities
  { canonical: 'New York', code: 'NYC', variations: ['ny', 'nyc', 'new york', 'nova york', 'nova iorque', 'newyork', 'n york', 'nwe york'] },
  { canonical: 'Los Angeles', code: 'LAX', variations: ['la', 'lax', 'los angeles', 'losangeles', 'l.a.', 'los angelos'] },
  { canonical: 'Miami', code: 'MIA', variations: ['miami', 'mia', 'myami', 'maiami'] },
  { canonical: 'Orlando', code: 'MCO', variations: ['orlando', 'mco', 'orlado', 'olando'] },
  { canonical: 'San Francisco', code: 'SFO', variations: ['sf', 'sfo', 'san francisco', 'sanfrancisco', 'san fran', 'são francisco'] },
  { canonical: 'Chicago', code: 'ORD', variations: ['chicago', 'ord', 'chigago', 'chicaco'] },
  { canonical: 'Las Vegas', code: 'LAS', variations: ['vegas', 'las vegas', 'lasvegas', 'las vegaz'] },
  { canonical: 'Washington DC', code: 'DCA', variations: ['dc', 'washington', 'washington dc', 'wash dc'] },
  { canonical: 'Boston', code: 'BOS', variations: ['boston', 'bos', 'bostan'] },
  { canonical: 'Seattle', code: 'SEA', variations: ['seattle', 'sea', 'seatle'] },
  { canonical: 'Atlanta', code: 'ATL', variations: ['atlanta', 'atl', 'atlnta'] },
  { canonical: 'Dallas', code: 'DFW', variations: ['dallas', 'dfw', 'dalas'] },
  { canonical: 'Denver', code: 'DEN', variations: ['denver', 'den', 'denvar'] },
  { canonical: 'Houston', code: 'IAH', variations: ['houston', 'iah', 'houstan'] },
  { canonical: 'Phoenix', code: 'PHX', variations: ['phoenix', 'phx', 'fenix'] },

  // Europe
  { canonical: 'Paris', code: 'CDG', variations: ['paris', 'cdg', 'pari', 'pariz', 'pariss'] },
  { canonical: 'London', code: 'LHR', variations: ['london', 'lhr', 'londres', 'londom', 'londra'] },
  { canonical: 'Rome', code: 'FCO', variations: ['rome', 'roma', 'fco', 'romea'] },
  { canonical: 'Barcelona', code: 'BCN', variations: ['barcelona', 'bcn', 'barça', 'barca', 'barcelon'] },
  { canonical: 'Madrid', code: 'MAD', variations: ['madrid', 'mad', 'madri', 'madird'] },
  { canonical: 'Amsterdam', code: 'AMS', variations: ['amsterdam', 'ams', 'amsterdan', 'amsterdã'] },
  { canonical: 'Berlin', code: 'BER', variations: ['berlin', 'ber', 'berlim', 'berln'] },
  { canonical: 'Lisbon', code: 'LIS', variations: ['lisbon', 'lisboa', 'lis', 'lizboa'] },
  { canonical: 'Milan', code: 'MXP', variations: ['milan', 'milão', 'mxp', 'milano'] },
  { canonical: 'Munich', code: 'MUC', variations: ['munich', 'munique', 'muc', 'münchen'] },
  { canonical: 'Frankfurt', code: 'FRA', variations: ['frankfurt', 'fra', 'franfurt'] },
  { canonical: 'Vienna', code: 'VIE', variations: ['vienna', 'viena', 'vie', 'wien'] },
  { canonical: 'Prague', code: 'PRG', variations: ['prague', 'praga', 'prg', 'praha'] },
  { canonical: 'Athens', code: 'ATH', variations: ['athens', 'atenas', 'ath', 'athenas'] },
  { canonical: 'Dublin', code: 'DUB', variations: ['dublin', 'dub', 'dublim', 'dubln'] },

  // Brazil
  { canonical: 'São Paulo', code: 'GRU', variations: ['sp', 'sao paulo', 'são paulo', 'gru', 'sampa', 'spaulo'] },
  { canonical: 'Rio de Janeiro', code: 'GIG', variations: ['rio', 'rj', 'rio de janeiro', 'gig', 'riodejaneiro'] },
  { canonical: 'Brasília', code: 'BSB', variations: ['brasilia', 'brasília', 'bsb', 'brazilia'] },
  { canonical: 'Salvador', code: 'SSA', variations: ['salvador', 'ssa', 'bahia', 'salvdor'] },
  { canonical: 'Recife', code: 'REC', variations: ['recife', 'rec', 'receife'] },
  { canonical: 'Fortaleza', code: 'FOR', variations: ['fortaleza', 'for', 'fortleza'] },
  { canonical: 'Curitiba', code: 'CWB', variations: ['curitiba', 'cwb', 'curitba'] },
  { canonical: 'Porto Alegre', code: 'POA', variations: ['porto alegre', 'poa', 'portoalegre'] },
  { canonical: 'Belo Horizonte', code: 'CNF', variations: ['bh', 'belo horizonte', 'cnf', 'belohorizonte'] },

  // Asia
  { canonical: 'Tokyo', code: 'NRT', variations: ['tokyo', 'toquio', 'tóquio', 'nrt', 'tokio'] },
  { canonical: 'Singapore', code: 'SIN', variations: ['singapore', 'singapura', 'cingapura', 'sin'] },
  { canonical: 'Bangkok', code: 'BKK', variations: ['bangkok', 'bkk', 'bangcok', 'bankok'] },
  { canonical: 'Dubai', code: 'DXB', variations: ['dubai', 'dxb', 'dubay', 'dubái'] },
  { canonical: 'Hong Kong', code: 'HKG', variations: ['hong kong', 'hkg', 'hongkong', 'hk'] },
  { canonical: 'Seoul', code: 'ICN', variations: ['seoul', 'seul', 'icn', 'coreia'] },
  { canonical: 'Bali', code: 'DPS', variations: ['bali', 'dps', 'balí'] },

  // Latin America
  { canonical: 'Cancun', code: 'CUN', variations: ['cancun', 'cancún', 'cun', 'cancum'] },
  { canonical: 'Mexico City', code: 'MEX', variations: ['mexico city', 'cidade do mexico', 'mex', 'cdmx', 'ciudad de mexico'] },
  { canonical: 'Buenos Aires', code: 'EZE', variations: ['buenos aires', 'eze', 'bsas', 'buenosaires', 'argentina'] },
  { canonical: 'Lima', code: 'LIM', variations: ['lima', 'lim', 'peru'] },
  { canonical: 'Santiago', code: 'SCL', variations: ['santiago', 'scl', 'chile'] },
  { canonical: 'Bogota', code: 'BOG', variations: ['bogota', 'bogotá', 'bog', 'colombia'] },

  // Other
  { canonical: 'Sydney', code: 'SYD', variations: ['sydney', 'syd', 'sidnei', 'sidney'] },
  { canonical: 'Melbourne', code: 'MEL', variations: ['melbourne', 'mel', 'melborne'] },
  { canonical: 'Toronto', code: 'YYZ', variations: ['toronto', 'yyz', 'toroto'] },
  { canonical: 'Vancouver', code: 'YVR', variations: ['vancouver', 'yvr', 'vancuver'] },
  { canonical: 'Cape Town', code: 'CPT', variations: ['cape town', 'capetown', 'cpt', 'cidade do cabo'] },
];

// ============================================================================
// MONTH DATABASE (Multi-language)
// ============================================================================

const MONTHS_DB: Record<string, number> = {
  // English
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
  april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
  august: 7, aug: 7, september: 8, sep: 8, sept: 8,
  october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
  // Portuguese
  janeiro: 0, jan: 0, fevereiro: 1, fev: 1, março: 2, marco: 2, mar: 2,
  abril: 3, abr: 3, maio: 4, mai: 4, junho: 5, jun: 5, julho: 6, jul: 6,
  agosto: 7, ago: 7, setembro: 8, set: 8, outubro: 9, out: 9,
  novembro: 10, nov: 10, dezembro: 11, dez: 11,
  // Spanish
  enero: 0, ene: 0, febrero: 1, marzo: 2, mzo: 2, abril: 3,
  mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, sep: 8,
  octubre: 9, oct: 9, noviembre: 10, diciembre: 11, dic: 11,
};

// ============================================================================
// FUZZY STRING MATCHING
// ============================================================================

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score (0-1)
 */
function similarityScore(input: string, target: string): number {
  const a = input.toLowerCase().trim();
  const b = target.toLowerCase().trim();
  if (a === b) return 1.0;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(a, b);
  return Math.max(0, 1 - distance / maxLen);
}

// ============================================================================
// CITY EXTRACTION WITH FUZZY MATCHING
// ============================================================================

interface CityMatch {
  canonical: string;
  code: string;
  confidence: number;
  rawMatch: string;
  source: 'exact' | 'fuzzy' | 'inferred';
}

function findCityMatch(input: string): CityMatch | null {
  const normalized = input.toLowerCase().trim();
  let bestMatch: CityMatch | null = null;
  let bestScore = 0;

  for (const city of CITY_DATABASE) {
    // Check exact code match (highest confidence)
    if (normalized === city.code.toLowerCase()) {
      return {
        canonical: city.canonical,
        code: city.code,
        confidence: 1.0,
        rawMatch: input,
        source: 'exact',
      };
    }

    // Check variations
    for (const variation of city.variations) {
      const score = similarityScore(normalized, variation);
      if (score > bestScore && score >= 0.7) {
        bestScore = score;
        bestMatch = {
          canonical: city.canonical,
          code: city.code,
          confidence: score,
          rawMatch: input,
          source: score === 1.0 ? 'exact' : 'fuzzy',
        };
      }
    }
  }

  return bestMatch;
}

// ============================================================================
// DATE EXTRACTION WITH MULTI-LANGUAGE SUPPORT
// ============================================================================

interface DateMatch {
  date: string; // ISO format YYYY-MM-DD
  confidence: number;
  rawMatch: string;
}

function extractDatesWithConfidence(message: string): { departure?: DateMatch; return?: DateMatch } {
  const lower = message.toLowerCase();
  const now = new Date();
  const currentYear = now.getFullYear();
  const result: { departure?: DateMatch; return?: DateMatch } = {};

  // Pattern: "dia 10 de janeiro", "10 de janeiro", "january 10", "10/01"
  const datePatterns = [
    // Portuguese: "dia 10 de janeiro"
    /(?:dia\s+)?(\d{1,2})\s*(?:de\s+)?(\w+)(?:\s+(?:de\s+)?(\d{4}))?/gi,
    // English: "january 10" or "jan 10th"
    /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/gi,
    // Numeric: "10/01" or "10-01"
    /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/g,
  ];

  const foundDates: DateMatch[] = [];

  // Try Portuguese/Spanish pattern first (day before month)
  const ptPattern = /(?:dia\s+)?(\d{1,2})\s*(?:de\s+)?(\w+)(?:\s+(?:de\s+)?(\d{4}))?/gi;
  let match;
  while ((match = ptPattern.exec(lower)) !== null) {
    const [fullMatch, day, monthStr, year] = match;
    const monthNum = MONTHS_DB[monthStr.toLowerCase()];
    if (monthNum !== undefined) {
      let dateYear = year ? parseInt(year) : currentYear;
      const testDate = new Date(dateYear, monthNum, parseInt(day));
      if (!year && testDate < now) dateYear++;
      foundDates.push({
        date: `${dateYear}-${String(monthNum + 1).padStart(2, '0')}-${String(parseInt(day)).padStart(2, '0')}`,
        confidence: 0.9,
        rawMatch: fullMatch,
      });
    }
  }

  // English pattern (month before day)
  const enPattern = /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/gi;
  while ((match = enPattern.exec(lower)) !== null) {
    const [fullMatch, monthStr, day, year] = match;
    const monthNum = MONTHS_DB[monthStr.toLowerCase()];
    if (monthNum !== undefined) {
      let dateYear = year ? parseInt(year) : currentYear;
      const testDate = new Date(dateYear, monthNum, parseInt(day));
      if (!year && testDate < now) dateYear++;
      foundDates.push({
        date: `${dateYear}-${String(monthNum + 1).padStart(2, '0')}-${String(parseInt(day)).padStart(2, '0')}`,
        confidence: 0.9,
        rawMatch: fullMatch,
      });
    }
  }

  // Relative dates
  if (/\b(amanhã|amanha|tomorrow)\b/i.test(lower)) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    foundDates.push({
      date: tomorrow.toISOString().split('T')[0],
      confidence: 0.95,
      rawMatch: 'tomorrow',
    });
  }

  if (/\b(próxima semana|proxima semana|next week)\b/i.test(lower)) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    foundDates.push({
      date: nextWeek.toISOString().split('T')[0],
      confidence: 0.7,
      rawMatch: 'next week',
    });
  }

  // Assign first date as departure, second as return
  if (foundDates.length >= 1) result.departure = foundDates[0];
  if (foundDates.length >= 2) result.return = foundDates[1];

  return result;
}

// ============================================================================
// MAIN ENTITY EXTRACTOR
// ============================================================================

/**
 * Extract all travel entities with confidence scores
 */
export function extractEntitiesWithConfidence(message: string, language: 'en' | 'pt' | 'es' = 'en'): ExtractedEntities {
  const result: ExtractedEntities = { language };

  // ========================================
  // ORIGIN / DESTINATION EXTRACTION
  // ========================================

  // Pattern 1: "from X to Y" / "de X para Y" / "de X a Y"
  const fromToPatterns = [
    /(?:from|de|saindo de)\s+([A-Za-zÀ-ÿ\s]+?)\s+(?:to|para|pra|a)\s+([A-Za-zÀ-ÿ\s]+?)(?:\s+(?:on|no|em|dia)|,|$)/i,
    /([A-Z]{3})\s*(?:to|para|pra|a|-|→)\s*([A-Z]{3})/i,
  ];

  for (const pattern of fromToPatterns) {
    const match = message.match(pattern);
    if (match) {
      const originMatch = findCityMatch(match[1].trim());
      const destMatch = findCityMatch(match[2].trim());

      if (originMatch) {
        result.origin = {
          value: originMatch.canonical,
          confidence: originMatch.confidence,
          source: originMatch.source,
          rawMatch: match[1].trim(),
        };
      }
      if (destMatch) {
        result.destination = {
          value: destMatch.canonical,
          confidence: destMatch.confidence,
          source: destMatch.source,
          rawMatch: match[2].trim(),
        };
      }
      break;
    }
  }

  // Pattern 2: Standalone destination "fly to Paris" / "ir para Paris" / "quero ir pra paris"
  if (!result.destination) {
    const destPatterns = [
      /(?:fly|go|travel|ir|viajar|quero ir|uero ir)\s+(?:to|para|pra)\s+([A-Za-zÀ-ÿ\s]+?)(?:\s+(?:on|no|em|dia)|,|$)/i,
      /(?:voos?|flights?|passagem|passagens)\s+(?:to|para|pra)\s+([A-Za-zÀ-ÿ\s]+)/i,
    ];

    for (const pattern of destPatterns) {
      const match = message.match(pattern);
      if (match) {
        const destMatch = findCityMatch(match[1].trim());
        if (destMatch) {
          result.destination = {
            value: destMatch.canonical,
            confidence: destMatch.confidence,
            source: destMatch.source,
            rawMatch: match[1].trim(),
          };
          break;
        }
      }
    }
  }

  // Pattern 3: Look for standalone city names
  if (!result.destination) {
    const words = message.split(/[\s,]+/);
    for (const word of words) {
      if (word.length >= 2) {
        const cityMatch = findCityMatch(word);
        if (cityMatch && cityMatch.confidence >= 0.8) {
          result.destination = {
            value: cityMatch.canonical,
            confidence: cityMatch.confidence * 0.8, // Reduce confidence for standalone
            source: 'inferred',
            rawMatch: word,
          };
          break;
        }
      }
    }
  }

  // ========================================
  // DATE EXTRACTION
  // ========================================
  const dates = extractDatesWithConfidence(message);
  if (dates.departure) {
    result.departureDate = {
      value: dates.departure.date,
      confidence: dates.departure.confidence,
      source: 'exact',
      rawMatch: dates.departure.rawMatch,
    };
  }
  if (dates.return) {
    result.returnDate = {
      value: dates.return.date,
      confidence: dates.return.confidence,
      source: 'exact',
      rawMatch: dates.return.rawMatch,
    };
  }

  // ========================================
  // PASSENGERS EXTRACTION
  // ========================================
  const passengerPatterns = [
    /(\d+)\s*(?:passengers?|pessoas?|adultos?|viajantes?|people|adults?|travelers?)/i,
    /(?:para|for)\s*(\d+)\s*(?:pessoas?|people|adults?)/i,
    /(?:somos|we are|éramos)\s*(\d+)/i,
  ];

  for (const pattern of passengerPatterns) {
    const match = message.match(pattern);
    if (match) {
      result.passengers = {
        value: parseInt(match[1]),
        confidence: 0.95,
        source: 'exact',
        rawMatch: match[0],
      };
      break;
    }
  }

  // ========================================
  // CABIN CLASS EXTRACTION
  // ========================================
  const lower = message.toLowerCase();
  if (/\b(first class|primeira classe|primera clase)\b/i.test(lower)) {
    result.cabinClass = { value: 'first', confidence: 1.0, source: 'exact', rawMatch: 'first class' };
  } else if (/\b(business|executiv[ao]|ejecutiv[ao]|classe executiva)\b/i.test(lower)) {
    result.cabinClass = { value: 'business', confidence: 1.0, source: 'exact', rawMatch: 'business' };
  } else if (/\b(premium economy|premium econômica)\b/i.test(lower)) {
    result.cabinClass = { value: 'premium_economy', confidence: 1.0, source: 'exact', rawMatch: 'premium economy' };
  } else if (/\b(economy|econômica|económica)\b/i.test(lower)) {
    result.cabinClass = { value: 'economy', confidence: 1.0, source: 'exact', rawMatch: 'economy' };
  }

  // ========================================
  // TRIP TYPE EXTRACTION
  // ========================================
  if (/\b(round.?trip|ida e volta|ida y vuelta|volta|return)\b/i.test(lower)) {
    result.tripType = { value: 'round-trip', confidence: 0.95, source: 'exact', rawMatch: 'round-trip' };
  } else if (/\b(one.?way|só ida|solo ida|single)\b/i.test(lower)) {
    result.tripType = { value: 'one-way', confidence: 0.95, source: 'exact', rawMatch: 'one-way' };
  } else if (result.returnDate) {
    // Infer round-trip if return date exists
    result.tripType = { value: 'round-trip', confidence: 0.7, source: 'inferred', rawMatch: '' };
  }

  return result;
}

// ============================================================================
// CONFIRMATION LOGIC
// ============================================================================

/**
 * Get slots that need explicit confirmation (confidence 0.4-0.6)
 */
export function getSlotsNeedingConfirmation(entities: ExtractedEntities): ConfirmationNeeded[] {
  const needsConfirmation: ConfirmationNeeded[] = [];

  const checkSlot = (
    slot: keyof ExtractedEntities,
    extracted: ExtractedSlot<unknown> | undefined,
    displayValue: string
  ) => {
    if (extracted && extracted.confidence >= 0.4 && extracted.confidence < 0.6) {
      needsConfirmation.push({
        slot,
        value: displayValue,
        confidence: extracted.confidence,
        confirmationPrompt: {
          en: `Just confirming: ${slot === 'destination' ? 'going to' : slot === 'origin' ? 'departing from' : ''} ${displayValue}?`,
          pt: `Só confirmando: ${slot === 'destination' ? 'indo para' : slot === 'origin' ? 'saindo de' : ''} ${displayValue}?`,
          es: `Solo confirmando: ${slot === 'destination' ? 'yendo a' : slot === 'origin' ? 'saliendo de' : ''} ${displayValue}?`,
        },
      });
    }
  };

  if (entities.origin) checkSlot('origin', entities.origin, entities.origin.value);
  if (entities.destination) checkSlot('destination', entities.destination, entities.destination.value);
  if (entities.departureDate) checkSlot('departureDate', entities.departureDate, entities.departureDate.value);

  return needsConfirmation;
}

/**
 * Check if slot should be trusted (confidence >= 0.6)
 */
export function shouldTrustSlot(slot: ExtractedSlot<unknown> | undefined): boolean {
  return slot !== undefined && slot.confidence >= 0.6;
}

/**
 * Check if slot should be preserved (confidence >= 0.4)
 */
export function shouldPreserveSlot(slot: ExtractedSlot<unknown> | undefined): boolean {
  return slot !== undefined && slot.confidence >= 0.4;
}

// ============================================================================
// HANDOFF SLOT PACKAGE
// ============================================================================

export interface HandoffSlots {
  origin?: { value: string; confidence: number };
  destination?: { value: string; confidence: number };
  departureDate?: { value: string; confidence: number };
  returnDate?: { value: string; confidence: number };
  passengers?: { value: number; confidence: number };
  cabinClass?: { value: string; confidence: number };
  tripType?: { value: string; confidence: number };
  language: 'en' | 'pt' | 'es';
}

/**
 * Convert extracted entities to handoff-safe slot package
 */
export function toHandoffSlots(entities: ExtractedEntities): HandoffSlots {
  const slots: HandoffSlots = { language: entities.language };

  if (shouldPreserveSlot(entities.origin)) {
    slots.origin = { value: entities.origin!.value, confidence: entities.origin!.confidence };
  }
  if (shouldPreserveSlot(entities.destination)) {
    slots.destination = { value: entities.destination!.value, confidence: entities.destination!.confidence };
  }
  if (shouldPreserveSlot(entities.departureDate)) {
    slots.departureDate = { value: entities.departureDate!.value, confidence: entities.departureDate!.confidence };
  }
  if (shouldPreserveSlot(entities.returnDate)) {
    slots.returnDate = { value: entities.returnDate!.value, confidence: entities.returnDate!.confidence };
  }
  if (shouldPreserveSlot(entities.passengers)) {
    slots.passengers = { value: entities.passengers!.value, confidence: entities.passengers!.confidence };
  }
  if (shouldPreserveSlot(entities.cabinClass)) {
    slots.cabinClass = { value: entities.cabinClass!.value, confidence: entities.cabinClass!.confidence };
  }
  if (shouldPreserveSlot(entities.tripType)) {
    slots.tripType = { value: entities.tripType!.value, confidence: entities.tripType!.confidence };
  }

  return slots;
}

// ============================================================================
// NO-RESET VALIDATION
// ============================================================================

/**
 * Validate that agent response doesn't ask for data that already exists
 */
export function validateNoResetViolation(
  response: string,
  existingSlots: HandoffSlots
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const lower = response.toLowerCase();

  // Patterns that indicate asking for already-provided data
  const askPatterns = {
    destination: [
      /where.*(?:would you like|do you want|going|travel|fly|destination)/i,
      /(?:qual|which|what).*(?:destino|destination)/i,
      /(?:para onde|where to|where would)/i,
      /where.*like to go/i,
      /onde.*(?:gostaria|quer)/i,
    ],
    origin: [
      /where.*(?:from|departing|leaving)/i,
      /(?:de onde|from where)/i,
      /(?:qual|which).*(?:origem|origin)/i,
    ],
    departureDate: [
      /when.*(?:travel|fly|leave|going)/i,
      /(?:quando|when).*(?:viagem|trip|flight)/i,
      /(?:what|which).*(?:date|data)/i,
    ],
  };

  // Check each existing slot
  if (existingSlots.destination && existingSlots.destination.confidence >= 0.4) {
    for (const pattern of askPatterns.destination) {
      if (pattern.test(lower)) {
        violations.push(`NO_RESET_VIOLATION: Asked for destination when already have: ${existingSlots.destination.value}`);
        break;
      }
    }
  }

  if (existingSlots.origin && existingSlots.origin.confidence >= 0.4) {
    for (const pattern of askPatterns.origin) {
      if (pattern.test(lower)) {
        violations.push(`NO_RESET_VIOLATION: Asked for origin when already have: ${existingSlots.origin.value}`);
        break;
      }
    }
  }

  if (existingSlots.departureDate && existingSlots.departureDate.confidence >= 0.4) {
    for (const pattern of askPatterns.departureDate) {
      if (pattern.test(lower)) {
        violations.push(`NO_RESET_VIOLATION: Asked for date when already have: ${existingSlots.departureDate.value}`);
        break;
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
