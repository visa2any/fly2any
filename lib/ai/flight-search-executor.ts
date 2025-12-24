/**
 * Flight Search Executor — ACTION-FIRST Execution
 *
 * CRITICAL: This module handles flight search execution with:
 * 1. IATA normalization (city name → airport code)
 * 2. Payload validation (reject invalid before API call)
 * 3. Action-first execution (no LLM talk before search)
 * 4. Structured error handling (no false "no flights" fallback)
 */

// ============================================================================
// IATA CODE MAPPING (Major Cities)
// ============================================================================

const CITY_TO_IATA: Record<string, string> = {
  // Brazil
  'são paulo': 'GRU',
  'sao paulo': 'GRU',
  'sp': 'GRU',
  'sampa': 'GRU',
  'guarulhos': 'GRU',
  'congonhas': 'CGH',
  'rio de janeiro': 'GIG',
  'rio': 'GIG',
  'rj': 'GIG',
  'galeão': 'GIG',
  'brasília': 'BSB',
  'brasilia': 'BSB',
  'belo horizonte': 'CNF',
  'confins': 'CNF',
  'salvador': 'SSA',
  'recife': 'REC',
  'fortaleza': 'FOR',
  'curitiba': 'CWB',
  'porto alegre': 'POA',
  'manaus': 'MAO',
  'florianópolis': 'FLN',
  'florianopolis': 'FLN',
  'natal': 'NAT',
  'belém': 'BEL',
  'belem': 'BEL',
  'vitória': 'VIX',
  'vitoria': 'VIX',
  'goiânia': 'GYN',
  'goiania': 'GYN',
  'campinas': 'VCP',
  'viracopos': 'VCP',

  // USA
  'new york': 'JFK',
  'nova york': 'JFK',
  'nyc': 'JFK',
  'nova iorque': 'JFK',
  'manhattan': 'JFK',
  'los angeles': 'LAX',
  'la': 'LAX',
  'miami': 'MIA',
  'orlando': 'MCO',
  'chicago': 'ORD',
  'san francisco': 'SFO',
  'boston': 'BOS',
  'washington': 'IAD',
  'dc': 'IAD',
  'seattle': 'SEA',
  'las vegas': 'LAS',
  'vegas': 'LAS',
  'atlanta': 'ATL',
  'dallas': 'DFW',
  'houston': 'IAH',
  'denver': 'DEN',
  'phoenix': 'PHX',
  'philadelphia': 'PHL',
  'filadelfia': 'PHL',
  'filadélfia': 'PHL',
  'detroit': 'DTW',
  'minneapolis': 'MSP',
  'honolulu': 'HNL',
  'hawaii': 'HNL',

  // Europe
  'london': 'LHR',
  'londres': 'LHR',
  'heathrow': 'LHR',
  'gatwick': 'LGW',
  'paris': 'CDG',
  'charles de gaulle': 'CDG',
  'orly': 'ORY',
  'amsterdam': 'AMS',
  'amsterdã': 'AMS',
  'frankfurt': 'FRA',
  'munich': 'MUC',
  'munique': 'MUC',
  'berlin': 'BER',
  'berlim': 'BER',
  'madrid': 'MAD',
  'barcelona': 'BCN',
  'rome': 'FCO',
  'roma': 'FCO',
  'fiumicino': 'FCO',
  'milan': 'MXP',
  'milão': 'MXP',
  'milano': 'MXP',
  'lisbon': 'LIS',
  'lisboa': 'LIS',
  'porto': 'OPO',
  'vienna': 'VIE',
  'viena': 'VIE',
  'zurich': 'ZRH',
  'zurique': 'ZRH',
  'geneva': 'GVA',
  'genebra': 'GVA',
  'brussels': 'BRU',
  'bruxelas': 'BRU',
  'dublin': 'DUB',
  'copenhagen': 'CPH',
  'copenhague': 'CPH',
  'stockholm': 'ARN',
  'estocolmo': 'ARN',
  'oslo': 'OSL',
  'helsinki': 'HEL',
  'prague': 'PRG',
  'praga': 'PRG',
  'warsaw': 'WAW',
  'varsóvia': 'WAW',
  'varsovia': 'WAW',
  'athens': 'ATH',
  'atenas': 'ATH',
  'istanbul': 'IST',
  'istambul': 'IST',

  // Asia
  'tokyo': 'NRT',
  'tóquio': 'NRT',
  'toquio': 'NRT',
  'narita': 'NRT',
  'haneda': 'HND',
  'seoul': 'ICN',
  'seul': 'ICN',
  'beijing': 'PEK',
  'pequim': 'PEK',
  'shanghai': 'PVG',
  'xangai': 'PVG',
  'hong kong': 'HKG',
  'singapore': 'SIN',
  'singapura': 'SIN',
  'cingapura': 'SIN',
  'bangkok': 'BKK',
  'dubai': 'DXB',
  'abu dhabi': 'AUH',
  'doha': 'DOH',
  'delhi': 'DEL',
  'nova delhi': 'DEL',
  'mumbai': 'BOM',
  'bombay': 'BOM',
  'bombai': 'BOM',
  'osaka': 'KIX',
  'taipei': 'TPE',
  'kuala lumpur': 'KUL',
  'jakarta': 'CGK',
  'jacarta': 'CGK',
  'manila': 'MNL',

  // South America
  'buenos aires': 'EZE',
  'ezeiza': 'EZE',
  'santiago': 'SCL',
  'lima': 'LIM',
  'bogotá': 'BOG',
  'bogota': 'BOG',
  'medellin': 'MDE',
  'medellín': 'MDE',
  'cartagena': 'CTG',
  'quito': 'UIO',
  'caracas': 'CCS',
  'montevideo': 'MVD',
  'montevidéu': 'MVD',
  'asunción': 'ASU',
  'asuncion': 'ASU',

  // Other
  'mexico city': 'MEX',
  'cidade do méxico': 'MEX',
  'cancun': 'CUN',
  'cancún': 'CUN',
  'toronto': 'YYZ',
  'vancouver': 'YVR',
  'montreal': 'YUL',
  'sydney': 'SYD',
  'melbourne': 'MEL',
  'auckland': 'AKL',
  'johannesburg': 'JNB',
  'cape town': 'CPT',
  'cidade do cabo': 'CPT',
  'cairo': 'CAI',
};

// ============================================================================
// CABIN CLASS NORMALIZATION
// ============================================================================

const CABIN_MAPPING: Record<string, string> = {
  'economy': 'economy',
  'econômica': 'economy',
  'economica': 'economy',
  'economic': 'economy',
  'premium': 'premium_economy',
  'premium economy': 'premium_economy',
  'premium_economy': 'premium_economy',
  'business': 'business',
  'executiva': 'business',
  'executivo': 'business',
  'classe executiva': 'business',
  'first': 'first',
  'primeira': 'first',
  'primeira classe': 'first',
  'first class': 'first',
};

// ============================================================================
// TYPES
// ============================================================================

export interface RawFlightSlots {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: string;
  tripType?: string;
  direct?: boolean;
}

export interface NormalizedFlightPayload {
  origin: string;      // IATA code
  destination: string; // IATA code
  departureDate: string;
  returnDate?: string;
  cabin: string;
  adults: number;
  direct: boolean;
}

export interface ValidationResult {
  valid: boolean;
  payload?: NormalizedFlightPayload;
  missingFields: string[];
  errors: string[];
}

export interface SearchExecutionResult {
  executed: boolean;
  success?: boolean;
  results?: any;
  error?: string;
  validationResult?: ValidationResult;
}

// ============================================================================
// IATA RESOLUTION
// ============================================================================

/**
 * Resolve city name or code to IATA code
 */
export function resolveToIATA(input: string): string | null {
  if (!input) return null;

  const normalized = input.toLowerCase().trim();

  // Already an IATA code (3 uppercase letters)
  if (/^[A-Z]{3}$/.test(input.toUpperCase())) {
    return input.toUpperCase();
  }

  // Look up in mapping
  if (CITY_TO_IATA[normalized]) {
    return CITY_TO_IATA[normalized];
  }

  // Try partial match
  for (const [city, iata] of Object.entries(CITY_TO_IATA)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return iata;
    }
  }

  return null;
}

/**
 * Normalize cabin class input
 */
export function normalizeCabin(input?: string): string {
  if (!input) return 'economy';

  const normalized = input.toLowerCase().trim();
  return CABIN_MAPPING[normalized] || 'economy';
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validate and normalize flight search slots
 * Returns validation result with normalized payload or missing fields
 */
export function validateAndNormalizePayload(slots: RawFlightSlots): ValidationResult {
  const missingFields: string[] = [];
  const errors: string[] = [];

  // Resolve IATA codes
  const originIATA = resolveToIATA(slots.origin || '');
  const destinationIATA = resolveToIATA(slots.destination || '');

  if (!slots.origin) {
    missingFields.push('origin');
  } else if (!originIATA) {
    errors.push(`Could not resolve origin "${slots.origin}" to airport code`);
  }

  if (!slots.destination) {
    missingFields.push('destination');
  } else if (!destinationIATA) {
    errors.push(`Could not resolve destination "${slots.destination}" to airport code`);
  }

  if (!slots.departureDate) {
    missingFields.push('departureDate');
  }

  // Check return date for round-trip
  const isRoundTrip = slots.tripType === 'round-trip' || slots.tripType === 'ida e volta';
  if (isRoundTrip && !slots.returnDate) {
    missingFields.push('returnDate');
  }

  // If we have missing fields or errors, return invalid
  if (missingFields.length > 0 || errors.length > 0) {
    return {
      valid: false,
      missingFields,
      errors,
    };
  }

  // Build normalized payload
  const payload: NormalizedFlightPayload = {
    origin: originIATA!,
    destination: destinationIATA!,
    departureDate: slots.departureDate!,
    returnDate: slots.returnDate,
    cabin: normalizeCabin(slots.cabinClass),
    adults: slots.passengers || 1,
    direct: slots.direct || false,
  };

  return {
    valid: true,
    payload,
    missingFields: [],
    errors: [],
  };
}

// ============================================================================
// SEARCH EXECUTION
// ============================================================================

/**
 * Execute flight search — ACTION FIRST
 *
 * CRITICAL: This function ONLY executes if payload is valid.
 * It NEVER returns false "no flights" messages.
 */
export async function executeFlightSearch(
  slots: RawFlightSlots,
  language: 'en' | 'pt' | 'es' = 'en'
): Promise<SearchExecutionResult> {
  // Step 1: Validate and normalize
  const validation = validateAndNormalizePayload(slots);

  // Log for debugging (server-side only)
  console.log('[FLIGHT_SEARCH_EXECUTOR] =================================');
  console.log('[FLIGHT_SEARCH_EXECUTOR] Raw slots:', JSON.stringify(slots, null, 2));
  console.log('[FLIGHT_SEARCH_EXECUTOR] Validation:', JSON.stringify(validation, null, 2));
  console.log('[FLIGHT_SEARCH_EXECUTOR] =================================');

  if (!validation.valid) {
    console.log('[FLIGHT_SEARCH_EXECUTOR] Payload invalid - NOT executing search');
    return {
      executed: false,
      validationResult: validation,
    };
  }

  // Step 2: Execute API call
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ai/search-flights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.payload),
    });

    console.log('[FLIGHT_SEARCH_EXECUTOR] API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FLIGHT_SEARCH_EXECUTOR] API error:', response.status, errorText);

      // Return structured error - NEVER say "no flights found"
      return {
        executed: true,
        success: false,
        error: `API_ERROR_${response.status}`,
      };
    }

    const data = await response.json();
    console.log('[FLIGHT_SEARCH_EXECUTOR] Results count:', data.offers?.length || 0);

    return {
      executed: true,
      success: true,
      results: data,
    };
  } catch (error) {
    console.error('[FLIGHT_SEARCH_EXECUTOR] Execution error:', error);
    return {
      executed: true,
      success: false,
      error: 'NETWORK_ERROR',
    };
  }
}

// ============================================================================
// RESPONSE GENERATION (After action)
// ============================================================================

const MESSAGES = {
  en: {
    askMissing: (fields: string[]) => `I need a few more details: ${fields.join(', ')}. Could you provide these?`,
    resolveError: (errors: string[]) => `I couldn't identify the airports. ${errors.join(' ')} Please provide the airport codes or city names.`,
    apiError: 'There was a technical issue with the search. Please try again in a moment.',
    noResults: 'No flights were found for this route and dates. Would you like to try different dates?',
    searching: 'Searching for flights...',
  },
  pt: {
    askMissing: (fields: string[]) => {
      const fieldMap: Record<string, string> = {
        origin: 'cidade de origem',
        destination: 'cidade de destino',
        departureDate: 'data de ida',
        returnDate: 'data de volta',
      };
      const translated = fields.map(f => fieldMap[f] || f);
      return `Preciso de mais alguns detalhes: ${translated.join(', ')}. Pode me informar?`;
    },
    resolveError: (errors: string[]) => `Não consegui identificar os aeroportos. Por favor, informe os códigos ou nomes das cidades.`,
    apiError: 'Houve um problema técnico na busca. Por favor, tente novamente em instantes.',
    noResults: 'Não foram encontrados voos para esta rota e datas. Gostaria de tentar outras datas?',
    searching: 'Buscando voos...',
  },
  es: {
    askMissing: (fields: string[]) => `Necesito algunos detalles más: ${fields.join(', ')}. ¿Puede proporcionarlos?`,
    resolveError: (errors: string[]) => `No pude identificar los aeropuertos. Por favor, proporcione los códigos o nombres de ciudades.`,
    apiError: 'Hubo un problema técnico con la búsqueda. Por favor, inténtelo de nuevo en un momento.',
    noResults: 'No se encontraron vuelos para esta ruta y fechas. ¿Le gustaría probar otras fechas?',
    searching: 'Buscando vuelos...',
  },
};

/**
 * Generate response AFTER action execution
 * NEVER generates "no flights" before actual search
 */
export function generatePostActionResponse(
  result: SearchExecutionResult,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  const msg = MESSAGES[language];

  // Case 1: Search not executed due to missing fields
  if (!result.executed && result.validationResult) {
    if (result.validationResult.missingFields.length > 0) {
      return msg.askMissing(result.validationResult.missingFields);
    }
    if (result.validationResult.errors.length > 0) {
      return msg.resolveError(result.validationResult.errors);
    }
  }

  // Case 2: Search executed but API error
  if (result.executed && !result.success) {
    return msg.apiError;
  }

  // Case 3: Search executed successfully but no results
  if (result.executed && result.success && (!result.results?.offers || result.results.offers.length === 0)) {
    return msg.noResults;
  }

  // Case 4: Search executed with results - return count for further processing
  if (result.executed && result.success && result.results?.offers?.length > 0) {
    const count = result.results.offers.length;
    if (language === 'pt') {
      return `Encontrei ${count} opções de voo para você. Vou mostrar as melhores:`;
    } else if (language === 'es') {
      return `Encontré ${count} opciones de vuelo para ti. Te muestro las mejores:`;
    }
    return `I found ${count} flight options for you. Here are the best ones:`;
  }

  return msg.apiError;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  CITY_TO_IATA,
  CABIN_MAPPING,
  resolveToIATA,
  normalizeCabin,
  validateAndNormalizePayload,
  executeFlightSearch,
  generatePostActionResponse,
};
