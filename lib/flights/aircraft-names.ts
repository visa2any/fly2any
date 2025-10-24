/**
 * Aircraft Code to Name Mapping
 *
 * Maps IATA/ICAO aircraft codes to user-friendly aircraft names
 * Used in flight cards to display "Boeing 787 Dreamliner" instead of just "787"
 *
 * Data sources:
 * - IATA Aircraft Type Codes
 * - ICAO Aircraft Type Designators
 * - Airline fleet specifications
 */

export const AIRCRAFT_NAMES: Record<string, string> = {
  // ========================================
  // BOEING WIDE-BODY (Long-haul)
  // ========================================

  '787': 'Boeing 787 Dreamliner',
  '788': 'Boeing 787-8 Dreamliner',
  '789': 'Boeing 787-9 Dreamliner',
  '78X': 'Boeing 787-10 Dreamliner',

  '777': 'Boeing 777',
  '77W': 'Boeing 777-300ER',
  '77L': 'Boeing 777-200LR',
  '773': 'Boeing 777-300',
  '772': 'Boeing 777-200',
  '779': 'Boeing 777-9',
  '77X': 'Boeing 777X',

  '747': 'Boeing 747',
  '744': 'Boeing 747-400',
  '748': 'Boeing 747-8',

  '767': 'Boeing 767',
  '762': 'Boeing 767-200',
  '763': 'Boeing 767-300',
  '764': 'Boeing 767-400',

  // ========================================
  // AIRBUS WIDE-BODY (Long-haul)
  // ========================================

  '350': 'Airbus A350',
  '359': 'Airbus A350-900',
  '35K': 'Airbus A350-1000',
  '351': 'Airbus A350-1000',

  '380': 'Airbus A380',
  '388': 'Airbus A380-800',

  '330': 'Airbus A330',
  '332': 'Airbus A330-200',
  '333': 'Airbus A330-300',
  '338': 'Airbus A330-800neo',
  '339': 'Airbus A330-900neo',

  '340': 'Airbus A340',
  '342': 'Airbus A340-200',
  '343': 'Airbus A340-300',
  '345': 'Airbus A340-500',
  '346': 'Airbus A340-600',

  // ========================================
  // BOEING NARROW-BODY (Short-medium haul)
  // ========================================

  '737': 'Boeing 737',
  '73G': 'Boeing 737-700',
  '73H': 'Boeing 737-800',
  '73J': 'Boeing 737-900',
  '738': 'Boeing 737-800',
  '739': 'Boeing 737-900',
  '73W': 'Boeing 737-700 (Winglets)',

  // Boeing 737 MAX
  '7M7': 'Boeing 737 MAX 7',
  '7M8': 'Boeing 737 MAX 8',
  '7M9': 'Boeing 737 MAX 9',
  '7MJ': 'Boeing 737 MAX 10',

  '757': 'Boeing 757',
  '752': 'Boeing 757-200',
  '753': 'Boeing 757-300',

  // ========================================
  // AIRBUS NARROW-BODY (A320 family)
  // ========================================

  '320': 'Airbus A320',
  '32A': 'Airbus A320-200',
  '32B': 'Airbus A320-200',
  '32S': 'Airbus A320neo',
  '32N': 'Airbus A320neo',

  '321': 'Airbus A321',
  '32Q': 'Airbus A321neo',

  '319': 'Airbus A319',

  '318': 'Airbus A318',

  // ========================================
  // REGIONAL JETS (50-100 seats)
  // ========================================

  // Embraer E-Jets
  'E70': 'Embraer E170',
  'E75': 'Embraer E175',
  'E90': 'Embraer E190',
  'E95': 'Embraer E195',

  // Embraer E-Jets E2
  'E7W': 'Embraer E175-E2',
  '290': 'Embraer E190-E2',
  '295': 'Embraer E195-E2',

  // Bombardier CRJ
  'CR2': 'Bombardier CRJ-200',
  'CR7': 'Bombardier CRJ-700',
  'CR9': 'Bombardier CRJ-900',
  'CRJ': 'Bombardier CRJ',

  // ATR
  'AT7': 'ATR 72',
  'AT5': 'ATR 42',

  // ========================================
  // LOW-COST / SPECIAL PURPOSE
  // ========================================

  // Airbus A220 (formerly Bombardier C Series)
  '223': 'Airbus A220-300',
  '221': 'Airbus A220-100',
  'CS3': 'Airbus A220-300',
  'CS1': 'Airbus A220-100',

  // De Havilland Canada
  'DH4': 'Dash 8-400',
  'DH3': 'Dash 8-300',
  'DH2': 'Dash 8-200',
  'DH1': 'Dash 8-100',

  // ========================================
  // RUSSIAN / EASTERN AIRCRAFT
  // ========================================

  'SU9': 'Sukhoi Superjet 100',
  'IL9': 'Ilyushin IL-96',
  'TU5': 'Tupolev Tu-154',

  // ========================================
  // BUSINESS JETS (Used by some carriers)
  // ========================================

  'BCS': 'Airbus ACJ',
  'BBJ': 'Boeing Business Jet',
};

/**
 * Get user-friendly aircraft name from code
 * @param code - Aircraft code (e.g., "788", "32Q", "77W")
 * @returns User-friendly name (e.g., "Boeing 787-8 Dreamliner", "Airbus A321neo")
 */
export function getAircraftName(code: string | undefined): string {
  if (!code) return 'Aircraft TBD';

  // Normalize code (uppercase, trim whitespace)
  const normalized = code.toUpperCase().trim();

  // Try exact match first
  if (AIRCRAFT_NAMES[normalized]) {
    return AIRCRAFT_NAMES[normalized];
  }

  // Try without special characters
  const alphanumeric = normalized.replace(/[^A-Z0-9]/g, '');
  if (AIRCRAFT_NAMES[alphanumeric]) {
    return AIRCRAFT_NAMES[alphanumeric];
  }

  // Try to match by family (first 2-3 characters)
  // e.g., "738" -> "737", "32Q" -> "32" -> "320"
  const family3 = alphanumeric.slice(0, 3);
  if (AIRCRAFT_NAMES[family3]) {
    return AIRCRAFT_NAMES[family3];
  }

  const family2 = alphanumeric.slice(0, 2);
  if (AIRCRAFT_NAMES[family2]) {
    return AIRCRAFT_NAMES[family2];
  }

  // Fallback: return "Aircraft {CODE}"
  return `Aircraft ${code}`;
}

/**
 * Get short aircraft name (without manufacturer)
 * @param code - Aircraft code
 * @returns Short name (e.g., "787-8 Dreamliner", "A321neo")
 */
export function getAircraftShortName(code: string | undefined): string {
  const fullName = getAircraftName(code);

  // Remove "Boeing " or "Airbus " prefix for shorter display
  return fullName
    .replace('Boeing ', '')
    .replace('Airbus ', '')
    .replace('Bombardier ', '')
    .replace('Embraer ', '');
}
