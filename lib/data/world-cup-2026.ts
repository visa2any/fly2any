/**
 * FIFA WORLD CUP 2026 - Complete Data
 * Teams, Stadiums, Colors, and Match Information
 */

// ==============================================
// TEAM COLORS & IDENTITIES
// ==============================================

export interface WorldCupTeamData {
  name: string;
  shortName: string;
  fifaCode: string;
  flagEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  confederation: string;
  worldCupWins: number;
  bestFinish: string;
  fifaRanking?: number;
  slug: string;
}

export const WORLD_CUP_TEAMS: WorldCupTeamData[] = [
  // CONMEBOL (South America)
  {
    name: 'Brazil',
    shortName: 'BRA',
    fifaCode: 'BRA',
    flagEmoji: '🇧🇷',
    primaryColor: '#009C3B', // Green
    secondaryColor: '#FFDF00', // Yellow
    accentColor: '#002776', // Blue
    confederation: 'CONMEBOL',
    worldCupWins: 5,
    bestFinish: 'Champions (5x)',
    fifaRanking: 3,
    slug: 'brazil'
  },
  {
    name: 'Argentina',
    shortName: 'ARG',
    fifaCode: 'ARG',
    flagEmoji: '🇦🇷',
    primaryColor: '#74ACDF', // Sky blue
    secondaryColor: '#FFFFFF', // White
    accentColor: '#F6B40E', // Sun yellow
    confederation: 'CONMEBOL',
    worldCupWins: 3,
    bestFinish: 'Champions (3x)',
    fifaRanking: 1,
    slug: 'argentina'
  },
  {
    name: 'Uruguay',
    shortName: 'URU',
    fifaCode: 'URU',
    flagEmoji: '🇺🇾',
    primaryColor: '#0038A7', // Blue
    secondaryColor: '#FFFFFF', // White
    accentColor: '#FCD116', // Sun yellow
    confederation: 'CONMEBOL',
    worldCupWins: 2,
    bestFinish: 'Champions (2x)',
    slug: 'uruguay'
  },

  // UEFA (Europe)
  {
    name: 'France',
    shortName: 'FRA',
    fifaCode: 'FRA',
    flagEmoji: '🇫🇷',
    primaryColor: '#002654', // Blue
    secondaryColor: '#FFFFFF', // White
    accentColor: '#ED2939', // Red
    confederation: 'UEFA',
    worldCupWins: 2,
    bestFinish: 'Champions (2x)',
    fifaRanking: 2,
    slug: 'france'
  },
  {
    name: 'Spain',
    shortName: 'ESP',
    fifaCode: 'ESP',
    flagEmoji: '🇪🇸',
    primaryColor: '#AA151B', // Red
    secondaryColor: '#F1BF00', // Gold
    confederation: 'UEFA',
    worldCupWins: 1,
    bestFinish: 'Champions (2010)',
    slug: 'spain'
  },
  {
    name: 'Germany',
    shortName: 'GER',
    fifaCode: 'GER',
    flagEmoji: '🇩🇪',
    primaryColor: '#000000', // Black
    secondaryColor: '#DD0000', // Red
    accentColor: '#FFCE00', // Gold
    confederation: 'UEFA',
    worldCupWins: 4,
    bestFinish: 'Champions (4x)',
    slug: 'germany'
  },
  {
    name: 'England',
    shortName: 'ENG',
    fifaCode: 'ENG',
    flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    primaryColor: '#FFFFFF', // White
    secondaryColor: '#C8102E', // Red
    confederation: 'UEFA',
    worldCupWins: 1,
    bestFinish: 'Champions (1966)',
    slug: 'england'
  },
  {
    name: 'Portugal',
    shortName: 'POR',
    fifaCode: 'POR',
    flagEmoji: '🇵🇹',
    primaryColor: '#006600', // Green
    secondaryColor: '#FF0000', // Red
    confederation: 'UEFA',
    worldCupWins: 0,
    bestFinish: 'Semi-finals',
    slug: 'portugal'
  },
  {
    name: 'Netherlands',
    shortName: 'NED',
    fifaCode: 'NED',
    flagEmoji: '🇳🇱',
    primaryColor: '#FF4F00', // Orange
    secondaryColor: '#FFFFFF', // White
    accentColor: '#21468B', // Blue
    confederation: 'UEFA',
    worldCupWins: 0,
    bestFinish: 'Runners-up (3x)',
    slug: 'netherlands'
  },
  {
    name: 'Italy',
    shortName: 'ITA',
    fifaCode: 'ITA',
    flagEmoji: '🇮🇹',
    primaryColor: '#009246', // Green
    secondaryColor: '#FFFFFF', // White
    accentColor: '#CE2B37', // Red
    confederation: 'UEFA',
    worldCupWins: 4,
    bestFinish: 'Champions (4x)',
    slug: 'italy'
  },

  // CONCACAF (North/Central America & Caribbean)
  {
    name: 'USA',
    shortName: 'USA',
    fifaCode: 'USA',
    flagEmoji: '🇺🇸',
    primaryColor: '#002868', // Navy blue
    secondaryColor: '#BF0A30', // Red
    accentColor: '#FFFFFF', // White
    confederation: 'CONCACAF',
    worldCupWins: 0,
    bestFinish: 'Semi-finals (1930)',
    slug: 'usa'
  },
  {
    name: 'Mexico',
    shortName: 'MEX',
    fifaCode: 'MEX',
    flagEmoji: '🇲🇽',
    primaryColor: '#006847', // Green
    secondaryColor: '#FFFFFF', // White
    accentColor: '#CE1126', // Red
    confederation: 'CONCACAF',
    worldCupWins: 0,
    bestFinish: 'Quarter-finals (2x)',
    slug: 'mexico'
  },
  {
    name: 'Canada',
    shortName: 'CAN',
    fifaCode: 'CAN',
    flagEmoji: '🇨🇦',
    primaryColor: '#FF0000', // Red
    secondaryColor: '#FFFFFF', // White
    confederation: 'CONCACAF',
    worldCupWins: 0,
    bestFinish: 'Group Stage (1986)',
    slug: 'canada'
  },

  // Add more teams as qualified (32 total)
];

// ==============================================
// STADIUMS
// ==============================================

export interface WorldCupStadiumData {
  name: string;
  nickname?: string;
  city: string;
  state?: string;
  country: string;
  capacity: number;
  opened: number;
  nearestAirport: string;
  airportCode: string;
  cityPrimaryColor: string;
  citySecondaryColor: string;
  slug: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  matchCount: number; // Number of World Cup matches
}

export const WORLD_CUP_STADIUMS: WorldCupStadiumData[] = [
  // USA Stadiums
  {
    name: 'SoFi Stadium',
    nickname: 'The Crown Jewel',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    capacity: 70000,
    opened: 2020,
    nearestAirport: 'Los Angeles International Airport',
    airportCode: 'LAX',
    cityPrimaryColor: '#552583', // Lakers Purple
    citySecondaryColor: '#FDB927', // Lakers Gold
    slug: 'sofi-stadium',
    latitude: 33.9535,
    longitude: -118.3392,
    imageUrl: '/stadiums/sofi-stadium.jpg',
    matchCount: 8
  },
  {
    name: 'MetLife Stadium',
    nickname: 'The Meadowlands',
    city: 'New York / New Jersey',
    state: 'New Jersey',
    country: 'USA',
    capacity: 82500,
    opened: 2010,
    nearestAirport: 'Newark Liberty International Airport',
    airportCode: 'EWR',
    cityPrimaryColor: '#0039A6', // NYC Blue
    citySecondaryColor: '#FF6319', // NYC Orange
    slug: 'metlife-stadium',
    latitude: 40.8128,
    longitude: -74.0742,
    imageUrl: '/stadiums/metlife-stadium.jpg',
    matchCount: 8
  },
  {
    name: 'AT&T Stadium',
    nickname: 'Jerryworld',
    city: 'Dallas',
    state: 'Texas',
    country: 'USA',
    capacity: 80000,
    opened: 2009,
    nearestAirport: 'Dallas/Fort Worth International Airport',
    airportCode: 'DFW',
    cityPrimaryColor: '#041E42', // Cowboys Navy
    citySecondaryColor: '#869397', // Cowboys Silver
    slug: 'att-stadium',
    latitude: 32.7473,
    longitude: -97.0945,
    imageUrl: '/stadiums/att-stadium.jpg',
    matchCount: 9
  },
  {
    name: 'Mercedes-Benz Stadium',
    nickname: 'The Benz',
    city: 'Atlanta',
    state: 'Georgia',
    country: 'USA',
    capacity: 71000,
    opened: 2017,
    nearestAirport: 'Hartsfield-Jackson Atlanta International Airport',
    airportCode: 'ATL',
    cityPrimaryColor: '#A71930', // Falcons Red
    citySecondaryColor: '#000000', // Black
    slug: 'mercedes-benz-stadium',
    latitude: 33.7555,
    longitude: -84.4006,
    imageUrl: '/stadiums/mercedes-benz-stadium.jpg',
    matchCount: 8
  },
  {
    name: 'Hard Rock Stadium',
    nickname: '',
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    capacity: 65326,
    opened: 1987,
    nearestAirport: 'Miami International Airport',
    airportCode: 'MIA',
    cityPrimaryColor: '#008E97', // Miami Dolphins Aqua
    citySecondaryColor: '#FC4C02', // Orange
    slug: 'hard-rock-stadium',
    latitude: 25.9580,
    longitude: -80.2389,
    imageUrl: '/stadiums/hard-rock-stadium.jpg',
    matchCount: 7
  },

  // Mexico Stadiums
  {
    name: 'Estadio Azteca',
    nickname: 'The Colossus of Santa Úrsula',
    city: 'Mexico City',
    country: 'Mexico',
    capacity: 87523,
    opened: 1966,
    nearestAirport: 'Mexico City International Airport',
    airportCode: 'MEX',
    cityPrimaryColor: '#C1004C', // Mexico Pink
    citySecondaryColor: '#006341', // Mexico Green
    slug: 'estadio-azteca',
    latitude: 19.3030,
    longitude: -99.1506,
    imageUrl: '/stadiums/estadio-azteca.jpg',
    matchCount: 5
  },
  {
    name: 'Estadio BBVA',
    nickname: 'El Gigante de Acero',
    city: 'Monterrey',
    country: 'Mexico',
    capacity: 53500,
    opened: 2015,
    nearestAirport: 'Monterrey International Airport',
    airportCode: 'MTY',
    cityPrimaryColor: '#1C3664', // Rayados Blue
    citySecondaryColor: '#FFFFFF', // White
    slug: 'estadio-bbva',
    latitude: 25.7206,
    longitude: -100.2444,
    imageUrl: '/stadiums/estadio-bbva.jpg',
    matchCount: 4
  },

  // Canada Stadiums
  {
    name: 'BC Place',
    nickname: '',
    city: 'Vancouver',
    state: 'British Columbia',
    country: 'Canada',
    capacity: 54500,
    opened: 1983,
    nearestAirport: 'Vancouver International Airport',
    airportCode: 'YVR',
    cityPrimaryColor: '#0033A0', // Vancouver Blue
    citySecondaryColor: '#97D9E1', // Teal
    slug: 'bc-place',
    latitude: 49.2769,
    longitude: -123.1119,
    imageUrl: '/stadiums/bc-place.jpg',
    matchCount: 7
  },

  // Add remaining stadiums (16 total)
];

// ==============================================
// MATCH STAGES
// ==============================================

export const MATCH_STAGES = {
  GROUP_STAGE: {
    name: 'Group Stage',
    color: '#4F46E5', // Indigo
    icon: '🏆',
    totalMatches: 80
  },
  ROUND_16: {
    name: 'Round of 16',
    color: '#DC2626', // Red
    icon: '⚔️',
    totalMatches: 16
  },
  QUARTER_FINAL: {
    name: 'Quarter Finals',
    color: '#EA580C', // Orange
    icon: '🔥',
    totalMatches: 8
  },
  SEMI_FINAL: {
    name: 'Semi Finals',
    color: '#CA8A04', // Yellow
    icon: '⭐',
    totalMatches: 4
  },
  THIRD_PLACE: {
    name: 'Third Place',
    color: '#65A30D', // Green
    icon: '🥉',
    totalMatches: 1
  },
  FINAL: {
    name: 'Final',
    color: '#D97706', // Gold
    icon: '🏆',
    totalMatches: 1
  }
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================

export function getTeamBySlug(slug: string): WorldCupTeamData | undefined {
  return WORLD_CUP_TEAMS.find(team => team.slug === slug);
}

export function getStadiumBySlug(slug: string): WorldCupStadiumData | undefined {
  return WORLD_CUP_STADIUMS.find(stadium => stadium.slug === slug);
}

export function getTeamsByConfederation(confederation: string): WorldCupTeamData[] {
  return WORLD_CUP_TEAMS.filter(team => team.confederation === confederation);
}

export function getStadiumsByCountry(country: string): WorldCupStadiumData[] {
  return WORLD_CUP_STADIUMS.filter(stadium => stadium.country === country);
}

// Generate gradient for team colors
export function getTeamGradient(team: WorldCupTeamData): string {
  return `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`;
}

// Generate CSS variables for team theming
export function getTeamCSSVariables(team: WorldCupTeamData): Record<string, string> {
  return {
    '--team-primary': team.primaryColor,
    '--team-secondary': team.secondaryColor,
    '--team-accent': team.accentColor || team.secondaryColor,
  };
}
