/**
 * Flight Search Constants
 * Common configurations, mappings, and reference data for flight operations
 */

/**
 * Major airport codes with their full names and cities
 */
export const AIRPORT_DATA = {
  // North America - United States
  'JFK': { name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', region: 'North America' },
  'LAX': { name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', region: 'North America' },
  'ORD': { name: "O'Hare International Airport", city: 'Chicago', country: 'USA', region: 'North America' },
  'DFW': { name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', region: 'North America' },
  'ATL': { name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', region: 'North America' },
  'MIA': { name: 'Miami International Airport', city: 'Miami', country: 'USA', region: 'North America' },
  'SFO': { name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', region: 'North America' },
  'LAS': { name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'USA', region: 'North America' },
  'SEA': { name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', region: 'North America' },
  'BOS': { name: 'Boston Logan International Airport', city: 'Boston', country: 'USA', region: 'North America' },
  'EWR': { name: 'Newark Liberty International Airport', city: 'Newark', country: 'USA', region: 'North America' },
  'IAH': { name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'USA', region: 'North America' },
  'MCO': { name: 'Orlando International Airport', city: 'Orlando', country: 'USA', region: 'North America' },
  'CLT': { name: 'Charlotte Douglas International Airport', city: 'Charlotte', country: 'USA', region: 'North America' },
  'PHX': { name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'USA', region: 'North America' },
  'DEN': { name: 'Denver International Airport', city: 'Denver', country: 'USA', region: 'North America' },
  'LGA': { name: 'LaGuardia Airport', city: 'New York', country: 'USA', region: 'North America' },

  // Europe
  'LHR': { name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', region: 'Europe' },
  'CDG': { name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France', region: 'Europe' },
  'FRA': { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe' },
  'AMS': { name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
  'MAD': { name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', region: 'Europe' },
  'FCO': { name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome', country: 'Italy', region: 'Europe' },
  'BCN': { name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', region: 'Europe' },
  'MUC': { name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'Europe' },
  'LGW': { name: 'London Gatwick Airport', city: 'London', country: 'United Kingdom', region: 'Europe' },
  'IST': { name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', region: 'Europe' },
  'ZRH': { name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', region: 'Europe' },
  'VIE': { name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', region: 'Europe' },
  'CPH': { name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', region: 'Europe' },

  // Asia
  'DXB': { name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', region: 'Middle East' },
  'HND': { name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', region: 'Asia' },
  'NRT': { name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', region: 'Asia' },
  'SIN': { name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', region: 'Asia' },
  'HKG': { name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia' },
  'ICN': { name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', region: 'Asia' },
  'PVG': { name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', region: 'Asia' },
  'BKK': { name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', region: 'Asia' },
  'DEL': { name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', region: 'Asia' },
  'DOH': { name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', region: 'Middle East' },

  // South America - Brazil
  'GRU': { name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', region: 'South America' },
  'GIG': { name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', region: 'South America' },
  'BSB': { name: 'Brasília International Airport', city: 'Brasília', country: 'Brazil', region: 'South America' },
  'CNF': { name: 'Belo Horizonte/Confins International Airport', city: 'Belo Horizonte', country: 'Brazil', region: 'South America' },
  'FOR': { name: 'Pinto Martins International Airport', city: 'Fortaleza', country: 'Brazil', region: 'South America' },
  'SSA': { name: 'Deputado Luís Eduardo Magalhães International Airport', city: 'Salvador', country: 'Brazil', region: 'South America' },
  'REC': { name: 'Recife/Guararapes International Airport', city: 'Recife', country: 'Brazil', region: 'South America' },
  'POA': { name: 'Salgado Filho International Airport', city: 'Porto Alegre', country: 'Brazil', region: 'South America' },
  'CWB': { name: 'Afonso Pena International Airport', city: 'Curitiba', country: 'Brazil', region: 'South America' },
  'MAO': { name: 'Eduardo Gomes International Airport', city: 'Manaus', country: 'Brazil', region: 'South America' },
  'BEL': { name: 'Val de Cans International Airport', city: 'Belém', country: 'Brazil', region: 'South America' },

  // South America - Argentina, Chile, Uruguay
  'EZE': { name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', region: 'South America' },
  'AEP': { name: 'Jorge Newbery Airpark', city: 'Buenos Aires', country: 'Argentina', region: 'South America' },
  'COR': { name: 'Ingeniero Ambrosio Taravella International Airport', city: 'Córdoba', country: 'Argentina', region: 'South America' },
  'SCL': { name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', region: 'South America' },
  'MVD': { name: 'Carrasco International Airport', city: 'Montevideo', country: 'Uruguay', region: 'South America' },

  // South America - Colombia, Peru, Ecuador
  'BOG': { name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', region: 'South America' },
  'MDE': { name: 'José María Córdova International Airport', city: 'Medellín', country: 'Colombia', region: 'South America' },
  'CLO': { name: 'Alfonso Bonilla Aragón International Airport', city: 'Cali', country: 'Colombia', region: 'South America' },
  'CTG': { name: 'Rafael Núñez International Airport', city: 'Cartagena', country: 'Colombia', region: 'South America' },
  'LIM': { name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', region: 'South America' },
  'CUZ': { name: 'Alejandro Velasco Astete International Airport', city: 'Cusco', country: 'Peru', region: 'South America' },
  'UIO': { name: 'Mariscal Sucre International Airport', city: 'Quito', country: 'Ecuador', region: 'South America' },
  'GYE': { name: 'José Joaquín de Olmedo International Airport', city: 'Guayaquil', country: 'Ecuador', region: 'South America' },

  // South America - Venezuela, Bolivia, Paraguay, Others
  'CCS': { name: 'Simón Bolívar International Airport', city: 'Caracas', country: 'Venezuela', region: 'South America' },
  'VVI': { name: 'Viru Viru International Airport', city: 'Santa Cruz', country: 'Bolivia', region: 'South America' },
  'LPB': { name: 'El Alto International Airport', city: 'La Paz', country: 'Bolivia', region: 'South America' },
  'ASU': { name: 'Silvio Pettirossi International Airport', city: 'Asunción', country: 'Paraguay', region: 'South America' },

  // Central America - Mexico
  'MEX': { name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', region: 'Central America' },
  'CUN': { name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', region: 'Central America' },
  'GDL': { name: 'Guadalajara International Airport', city: 'Guadalajara', country: 'Mexico', region: 'Central America' },
  'TIJ': { name: 'Tijuana International Airport', city: 'Tijuana', country: 'Mexico', region: 'Central America' },
  'MTY': { name: 'Monterrey International Airport', city: 'Monterrey', country: 'Mexico', region: 'Central America' },
  'SJD': { name: 'Los Cabos International Airport', city: 'Los Cabos', country: 'Mexico', region: 'Central America' },
  'PVR': { name: 'Licenciado Gustavo Díaz Ordaz International Airport', city: 'Puerto Vallarta', country: 'Mexico', region: 'Central America' },
  'MID': { name: 'Manuel Crescencio Rejón International Airport', city: 'Mérida', country: 'Mexico', region: 'Central America' },
  'CZM': { name: 'Cozumel International Airport', city: 'Cozumel', country: 'Mexico', region: 'Central America' },

  // Central America - Guatemala, Belize, Honduras, El Salvador
  'GUA': { name: 'La Aurora International Airport', city: 'Guatemala City', country: 'Guatemala', region: 'Central America' },
  'BZE': { name: 'Philip S. W. Goldson International Airport', city: 'Belize City', country: 'Belize', region: 'Central America' },
  'SAP': { name: 'Ramón Villeda Morales International Airport', city: 'San Pedro Sula', country: 'Honduras', region: 'Central America' },
  'TGU': { name: 'Toncontín International Airport', city: 'Tegucigalpa', country: 'Honduras', region: 'Central America' },
  'RTB': { name: 'Juan Manuel Gálvez International Airport', city: 'Roatán', country: 'Honduras', region: 'Central America' },
  'SAL': { name: 'Monseñor Óscar Arnulfo Romero International Airport', city: 'San Salvador', country: 'El Salvador', region: 'Central America' },

  // Central America - Nicaragua, Costa Rica, Panama
  'MGA': { name: 'Augusto C. Sandino International Airport', city: 'Managua', country: 'Nicaragua', region: 'Central America' },
  'SJO': { name: 'Juan Santamaría International Airport', city: 'San José', country: 'Costa Rica', region: 'Central America' },
  'LIR': { name: 'Daniel Oduber Quirós International Airport', city: 'Liberia', country: 'Costa Rica', region: 'Central America' },
  'PTY': { name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama', region: 'Central America' },
  'BOC': { name: 'Bocas del Toro "Isla Colón" International Airport', city: 'Bocas del Toro', country: 'Panama', region: 'Central America' },

  // Caribbean - Bahamas, Cuba, Jamaica
  'NAS': { name: 'Lynden Pindling International Airport', city: 'Nassau', country: 'Bahamas', region: 'Caribbean' },
  'HAV': { name: 'José Martí International Airport', city: 'Havana', country: 'Cuba', region: 'Caribbean' },
  'MBJ': { name: 'Sangster International Airport', city: 'Montego Bay', country: 'Jamaica', region: 'Caribbean' },
  'KIN': { name: 'Norman Manley International Airport', city: 'Kingston', country: 'Jamaica', region: 'Caribbean' },

  // Caribbean - Dominican Republic, Haiti, Puerto Rico
  'PUJ': { name: 'Punta Cana International Airport', city: 'Punta Cana', country: 'Dominican Republic', region: 'Caribbean' },
  'SDQ': { name: 'Las Américas International Airport', city: 'Santo Domingo', country: 'Dominican Republic', region: 'Caribbean' },
  'STI': { name: 'Cibao International Airport', city: 'Santiago', country: 'Dominican Republic', region: 'Caribbean' },
  'PAP': { name: 'Toussaint Louverture International Airport', city: 'Port-au-Prince', country: 'Haiti', region: 'Caribbean' },
  'SJU': { name: 'Luis Muñoz Marín International Airport', city: 'San Juan', country: 'Puerto Rico', region: 'Caribbean' },

  // Caribbean - Lesser Antilles (Eastern Caribbean)
  'STT': { name: 'Cyril E. King Airport', city: 'St. Thomas', country: 'US Virgin Islands', region: 'Caribbean' },
  'STX': { name: 'Henry E. Rohlsen Airport', city: 'St. Croix', country: 'US Virgin Islands', region: 'Caribbean' },
  'SXM': { name: 'Princess Juliana International Airport', city: 'St. Maarten', country: 'St. Maarten', region: 'Caribbean' },
  'ANU': { name: 'V.C. Bird International Airport', city: 'Antigua', country: 'Antigua and Barbuda', region: 'Caribbean' },
  'SKB': { name: 'Robert L. Bradshaw International Airport', city: 'Basseterre', country: 'St. Kitts and Nevis', region: 'Caribbean' },
  'BGI': { name: 'Grantley Adams International Airport', city: 'Bridgetown', country: 'Barbados', region: 'Caribbean' },
  'UVF': { name: 'Hewanorra International Airport', city: 'Vieux Fort', country: 'St. Lucia', region: 'Caribbean' },
  'SLU': { name: 'George F. L. Charles Airport', city: 'Castries', country: 'St. Lucia', region: 'Caribbean' },
  'GND': { name: 'Maurice Bishop International Airport', city: 'St. George\'s', country: 'Grenada', region: 'Caribbean' },
  'SVD': { name: 'E.T. Joshua Airport', city: 'Kingstown', country: 'St. Vincent', region: 'Caribbean' },
  'POS': { name: 'Piarco International Airport', city: 'Port of Spain', country: 'Trinidad and Tobago', region: 'Caribbean' },

  // Caribbean - ABC Islands (Aruba, Bonaire, Curaçao)
  'AUA': { name: 'Queen Beatrix International Airport', city: 'Oranjestad', country: 'Aruba', region: 'Caribbean' },
  'CUR': { name: 'Hato International Airport', city: 'Willemstad', country: 'Curaçao', region: 'Caribbean' },
  'BON': { name: 'Flamingo International Airport', city: 'Kralendijk', country: 'Bonaire', region: 'Caribbean' },

  // Caribbean - Other Islands
  'GCM': { name: 'Owen Roberts International Airport', city: 'Grand Cayman', country: 'Cayman Islands', region: 'Caribbean' },
  'PLS': { name: 'Providenciales International Airport', city: 'Providenciales', country: 'Turks and Caicos', region: 'Caribbean' },
  'FDF': { name: 'Martinique Aimé Césaire International Airport', city: 'Fort-de-France', country: 'Martinique', region: 'Caribbean' },
  'PTP': { name: 'Pointe-à-Pitre International Airport', city: 'Pointe-à-Pitre', country: 'Guadeloupe', region: 'Caribbean' },

  // Oceania
  'SYD': { name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', region: 'Oceania' },
  'MEL': { name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Oceania' },
  'AKL': { name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', region: 'Oceania' },
} as const;

/**
 * Airline codes mapped to full names and alliance information
 */
export const AIRLINE_DATA = {
  // Star Alliance
  'UA': { name: 'United Airlines', alliance: 'Star Alliance', country: 'USA', logo: '🇺🇸' },
  'LH': { name: 'Lufthansa', alliance: 'Star Alliance', country: 'Germany', logo: '🇩🇪' },
  'AC': { name: 'Air Canada', alliance: 'Star Alliance', country: 'Canada', logo: '🇨🇦' },
  'NH': { name: 'All Nippon Airways', alliance: 'Star Alliance', country: 'Japan', logo: '🇯🇵' },
  'SQ': { name: 'Singapore Airlines', alliance: 'Star Alliance', country: 'Singapore', logo: '🇸🇬' },
  'TK': { name: 'Turkish Airlines', alliance: 'Star Alliance', country: 'Turkey', logo: '🇹🇷' },
  'OS': { name: 'Austrian Airlines', alliance: 'Star Alliance', country: 'Austria', logo: '🇦🇹' },
  'LX': { name: 'Swiss International Air Lines', alliance: 'Star Alliance', country: 'Switzerland', logo: '🇨🇭' },
  'SK': { name: 'Scandinavian Airlines', alliance: 'Star Alliance', country: 'Sweden', logo: '🇸🇪' },
  'TP': { name: 'TAP Air Portugal', alliance: 'Star Alliance', country: 'Portugal', logo: '🇵🇹' },

  // Oneworld
  'AA': { name: 'American Airlines', alliance: 'Oneworld', country: 'USA', logo: '🇺🇸' },
  'BA': { name: 'British Airways', alliance: 'Oneworld', country: 'United Kingdom', logo: '🇬🇧' },
  'QR': { name: 'Qatar Airways', alliance: 'Oneworld', country: 'Qatar', logo: '🇶🇦' },
  'CX': { name: 'Cathay Pacific', alliance: 'Oneworld', country: 'Hong Kong', logo: '🇭🇰' },
  'JL': { name: 'Japan Airlines', alliance: 'Oneworld', country: 'Japan', logo: '🇯🇵' },
  'QF': { name: 'Qantas', alliance: 'Oneworld', country: 'Australia', logo: '🇦🇺' },
  'IB': { name: 'Iberia', alliance: 'Oneworld', country: 'Spain', logo: '🇪🇸' },
  'AY': { name: 'Finnair', alliance: 'Oneworld', country: 'Finland', logo: '🇫🇮' },

  // SkyTeam
  'DL': { name: 'Delta Air Lines', alliance: 'SkyTeam', country: 'USA', logo: '🇺🇸' },
  'AF': { name: 'Air France', alliance: 'SkyTeam', country: 'France', logo: '🇫🇷' },
  'KL': { name: 'KLM Royal Dutch Airlines', alliance: 'SkyTeam', country: 'Netherlands', logo: '🇳🇱' },
  'KE': { name: 'Korean Air', alliance: 'SkyTeam', country: 'South Korea', logo: '🇰🇷' },
  'AZ': { name: 'ITA Airways', alliance: 'SkyTeam', country: 'Italy', logo: '🇮🇹' },
  'AM': { name: 'Aeroméxico', alliance: 'SkyTeam', country: 'Mexico', logo: '🇲🇽' },
  'SU': { name: 'Aeroflot', alliance: 'SkyTeam', country: 'Russia', logo: '🇷🇺' },
  'CZ': { name: 'China Southern Airlines', alliance: 'SkyTeam', country: 'China', logo: '🇨🇳' },
  'MU': { name: 'China Eastern Airlines', alliance: 'SkyTeam', country: 'China', logo: '🇨🇳' },

  // Independent / No Alliance
  'EK': { name: 'Emirates', alliance: 'Independent', country: 'UAE', logo: '🇦🇪' },
  'EY': { name: 'Etihad Airways', alliance: 'Independent', country: 'UAE', logo: '🇦🇪' },
  'WN': { name: 'Southwest Airlines', alliance: 'Independent', country: 'USA', logo: '🇺🇸' },
  'B6': { name: 'JetBlue Airways', alliance: 'Independent', country: 'USA', logo: '🇺🇸' },
  'AS': { name: 'Alaska Airlines', alliance: 'Independent', country: 'USA', logo: '🇺🇸' },
  'NK': { name: 'Spirit Airlines', alliance: 'Independent', country: 'USA', logo: '🇺🇸' },
  'F9': { name: 'Frontier Airlines', alliance: 'Independent', country: 'USA', logo: '🇺🇸' },
  'FR': { name: 'Ryanair', alliance: 'Independent', country: 'Ireland', logo: '🇮🇪' },
  'U2': { name: 'easyJet', alliance: 'Independent', country: 'United Kingdom', logo: '🇬🇧' },
  'VY': { name: 'Vueling', alliance: 'Independent', country: 'Spain', logo: '🇪🇸' },

  // Latin American
  'LA': { name: 'LATAM Airlines', alliance: 'Oneworld', country: 'Chile', logo: '🇨🇱' },
  'AV': { name: 'Avianca', alliance: 'Star Alliance', country: 'Colombia', logo: '🇨🇴' },
  'AR': { name: 'Aerolíneas Argentinas', alliance: 'SkyTeam', country: 'Argentina', logo: '🇦🇷' },
  'G3': { name: 'Gol Linhas Aéreas', alliance: 'Independent', country: 'Brazil', logo: '🇧🇷' },
  'CM': { name: 'Copa Airlines', alliance: 'Star Alliance', country: 'Panama', logo: '🇵🇦' },
} as const;

/**
 * Cabin class mappings and display names
 */
export const CABIN_CLASSES = {
  ECONOMY: {
    code: 'ECONOMY',
    name: 'Economy',
    shortName: 'Economy',
    emoji: '💺',
    color: 'blue',
  },
  PREMIUM_ECONOMY: {
    code: 'PREMIUM_ECONOMY',
    name: 'Premium Economy',
    shortName: 'Premium Econ',
    emoji: '🪑',
    color: 'purple',
  },
  BUSINESS: {
    code: 'BUSINESS',
    name: 'Business Class',
    shortName: 'Business',
    emoji: '💼',
    color: 'amber',
  },
  FIRST: {
    code: 'FIRST',
    name: 'First Class',
    shortName: 'First',
    emoji: '👑',
    color: 'yellow',
  },
} as const;

/**
 * Badge configurations for flight offers
 * Defines visual styling and priority for different badge types
 */
export const BADGE_CONFIG = {
  'Best Value': {
    variant: 'default' as const,
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: '⭐',
    priority: 1,
  },
  'Lowest Price': {
    variant: 'secondary' as const,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: '💰',
    priority: 2,
  },
  'Fastest Flight': {
    variant: 'default' as const,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: '⚡',
    priority: 3,
  },
  'Direct Flight': {
    variant: 'outline' as const,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: '✈️',
    priority: 4,
  },
  'Convenient Time': {
    variant: 'secondary' as const,
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: '🕐',
    priority: 5,
  },
  'Premium Airline': {
    variant: 'outline' as const,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: '✨',
    priority: 6,
  },
  'Top Pick': {
    variant: 'default' as const,
    color: 'bg-rose-100 text-rose-700 border-rose-300',
    icon: '🏆',
    priority: 7,
  },
  'Great Value/Hour': {
    variant: 'secondary' as const,
    color: 'bg-teal-100 text-teal-700 border-teal-300',
    icon: '⏱️',
    priority: 8,
  },
  'High Availability': {
    variant: 'outline' as const,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: '✓',
    priority: 9,
  },
  'Early Departure': {
    variant: 'outline' as const,
    color: 'bg-sky-100 text-sky-700 border-sky-300',
    icon: '🌅',
    priority: 10,
  },
  'Red-Eye Flight': {
    variant: 'outline' as const,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    icon: '🌙',
    priority: 11,
  },
} as const;

/**
 * Color schemes for different UI elements
 */
export const COLOR_SCHEMES = {
  price: {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  },
  score: {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600',
    poor: 'text-red-600',
  },
  stops: {
    direct: 'text-green-600',
    oneStop: 'text-yellow-600',
    multiStop: 'text-red-600',
  },
  time: {
    morning: 'text-orange-600',
    afternoon: 'text-blue-600',
    evening: 'text-purple-600',
    night: 'text-indigo-600',
    redEye: 'text-gray-600',
  },
} as const;

/**
 * Premium airline carriers
 * Used for identifying high-quality carriers
 */
export const PREMIUM_CARRIERS = [
  'DL', 'AA', 'UA', 'BA', 'LH', 'AF', 'EK', 'QR', 'SQ', 'NH',
  'CX', 'JL', 'QF', 'EY', 'TK', 'KL', 'LX', 'AY', 'OS', 'SK',
] as const;

/**
 * Low-cost carriers
 */
export const LOW_COST_CARRIERS = [
  'WN', 'B6', 'NK', 'F9', 'G4', 'FR', 'U2', 'VY', 'W6', 'SY',
] as const;

/**
 * Default search parameters
 */
export const DEFAULT_SEARCH_PARAMS = {
  adults: 1,
  children: 0,
  infants: 0,
  travelClass: 'ECONOMY',
  currencyCode: 'USD',
  maxResults: 50,
  nonStop: false,
} as const;

/**
 * Time of day ranges (in hours, 24-hour format)
 */
export const TIME_OF_DAY_RANGES = {
  morning: { start: 5, end: 12, label: 'Morning (5am-12pm)' },
  afternoon: { start: 12, end: 17, label: 'Afternoon (12pm-5pm)' },
  evening: { start: 17, end: 22, label: 'Evening (5pm-10pm)' },
  night: { start: 22, end: 5, label: 'Night (10pm-5am)' },
  redEye: { start: 22, end: 5, label: 'Red-Eye (10pm-5am)' },
} as const;

/**
 * Layover duration thresholds (in minutes)
 */
export const LAYOVER_THRESHOLDS = {
  minimum: 30,      // Minimum connection time
  short: 90,        // Under 1.5 hours
  comfortable: 180, // 1.5-3 hours
  long: 240,        // 3-4 hours
  veryLong: 360,    // Over 6 hours
  overnight: 720,   // Over 12 hours
} as const;

/**
 * Currency symbols and formatting
 */
export const CURRENCY_DATA = {
  USD: { symbol: '$', name: 'US Dollar', position: 'before' },
  EUR: { symbol: '€', name: 'Euro', position: 'before' },
  GBP: { symbol: '£', name: 'British Pound', position: 'before' },
  JPY: { symbol: '¥', name: 'Japanese Yen', position: 'before' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', position: 'before' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', position: 'after' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', position: 'before' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', position: 'before' },
  INR: { symbol: '₹', name: 'Indian Rupee', position: 'before' },
  MXN: { symbol: '$', name: 'Mexican Peso', position: 'before' },
  AED: { symbol: 'AED', name: 'UAE Dirham', position: 'after' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', position: 'before' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', position: 'before' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', position: 'before' },
} as const;

/**
 * Flight sort options with display labels
 */
export const SORT_OPTIONS = {
  best: { label: 'Best Value', description: 'AI-recommended best overall deals' },
  cheapest: { label: 'Lowest Price', description: 'Cheapest flights first' },
  fastest: { label: 'Shortest Duration', description: 'Fastest flights first' },
  overall: { label: 'Balanced', description: 'Best balance of all factors' },
  departure: { label: 'Departure Time', description: 'Earliest departure first' },
  arrival: { label: 'Arrival Time', description: 'Earliest arrival first' },
  duration: { label: 'Total Duration', description: 'Shortest total time' },
} as const;

/**
 * Filter presets for quick selection
 */
export const FILTER_PRESETS = {
  direct: {
    name: 'Direct Flights Only',
    filters: { stops: { direct: true } },
  },
  budget: {
    name: 'Budget Friendly',
    filters: { stops: { multipleStops: true } },
  },
  premium: {
    name: 'Premium Airlines',
    filters: { airlines: PREMIUM_CARRIERS as unknown as string[] },
  },
  morning: {
    name: 'Morning Departures',
    filters: { departureTime: { earliest: 5, latest: 12 } },
  },
  afternoon: {
    name: 'Afternoon Departures',
    filters: { departureTime: { earliest: 12, latest: 17 } },
  },
  evening: {
    name: 'Evening Departures',
    filters: { departureTime: { earliest: 17, latest: 22 } },
  },
} as const;

/**
 * API endpoints and configuration
 */
export const API_CONFIG = {
  amadeus: {
    production: 'https://api.amadeus.com',
    test: 'https://test.api.amadeus.com',
    endpoints: {
      token: '/v1/security/oauth2/token',
      flightOffers: '/v2/shopping/flight-offers',
      flightPrice: '/v1/shopping/flight-offers/pricing',
      flightCreate: '/v1/booking/flight-orders',
    },
  },
  cache: {
    ttl: 300, // 5 minutes in seconds
    maxSize: 100, // Maximum cached items
  },
} as const;

/**
 * Error messages and user-friendly descriptions
 */
export const ERROR_MESSAGES = {
  NO_RESULTS: 'No flights found for your search criteria. Try adjusting your dates or destinations.',
  API_ERROR: 'Unable to search flights at this time. Please try again later.',
  INVALID_DATES: 'Please select valid travel dates.',
  INVALID_AIRPORTS: 'Please select valid departure and arrival airports.',
  INVALID_PASSENGERS: 'Please enter valid passenger counts.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  TIMEOUT: 'Search timed out. Please try again.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SEARCH_COMPLETE: 'Found flights for your trip!',
  BOOKING_SUCCESS: 'Your flight has been booked successfully!',
  FILTER_APPLIED: 'Filters applied successfully.',
} as const;

/**
 * Regular expressions for validation
 */
export const VALIDATION_PATTERNS = {
  iataCode: /^[A-Z]{3}$/,
  flightNumber: /^[A-Z0-9]{2,3}\d{1,4}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]\d|2[0-3]):([0-5]\d)$/,
  duration: /^PT(?:(\d+)H)?(?:(\d+)M)?$/,
} as const;

/**
 * Aircraft type names
 */
export const AIRCRAFT_TYPES: Record<string, string> = {
  '320': 'Airbus A320',
  '321': 'Airbus A321',
  '319': 'Airbus A319',
  '330': 'Airbus A330',
  '350': 'Airbus A350',
  '380': 'Airbus A380',
  '737': 'Boeing 737',
  '738': 'Boeing 737-800',
  '739': 'Boeing 737-900',
  '777': 'Boeing 777',
  '787': 'Boeing 787 Dreamliner',
  '788': 'Boeing 787-8',
  '789': 'Boeing 787-9',
  'E90': 'Embraer E190',
  'E75': 'Embraer E175',
  'CR9': 'Bombardier CRJ-900',
  'CR7': 'Bombardier CRJ-700',
} as const;
