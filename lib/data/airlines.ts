/**
 * Major airlines with their frequent flyer programs and alliances
 */

export interface Airline {
  code: string; // IATA code
  name: string;
  logo: string; // Emoji or could be image path
  frequentFlyerProgram: string;
  alliance?: 'Star Alliance' | 'Oneworld' | 'SkyTeam' | null;
  country: string;
}

export const AIRLINES: Airline[] = [
  // Star Alliance
  { code: 'UA', name: 'United Airlines', logo: '✈️', frequentFlyerProgram: 'MileagePlus', alliance: 'Star Alliance', country: 'United States' },
  { code: 'LH', name: 'Lufthansa', logo: '✈️', frequentFlyerProgram: 'Miles & More', alliance: 'Star Alliance', country: 'Germany' },
  { code: 'AC', name: 'Air Canada', logo: '✈️', frequentFlyerProgram: 'Aeroplan', alliance: 'Star Alliance', country: 'Canada' },
  { code: 'SQ', name: 'Singapore Airlines', logo: '✈️', frequentFlyerProgram: 'KrisFlyer', alliance: 'Star Alliance', country: 'Singapore' },
  { code: 'NH', name: 'ANA', logo: '✈️', frequentFlyerProgram: 'ANA Mileage Club', alliance: 'Star Alliance', country: 'Japan' },
  { code: 'TK', name: 'Turkish Airlines', logo: '✈️', frequentFlyerProgram: 'Miles&Smiles', alliance: 'Star Alliance', country: 'Turkey' },
  { code: 'LX', name: 'SWISS', logo: '✈️', frequentFlyerProgram: 'Miles & More', alliance: 'Star Alliance', country: 'Switzerland' },
  { code: 'OS', name: 'Austrian Airlines', logo: '✈️', frequentFlyerProgram: 'Miles & More', alliance: 'Star Alliance', country: 'Austria' },
  { code: 'TP', name: 'TAP Air Portugal', logo: '✈️', frequentFlyerProgram: 'Miles&Go', alliance: 'Star Alliance', country: 'Portugal' },
  { code: 'SN', name: 'Brussels Airlines', logo: '✈️', frequentFlyerProgram: 'Miles & More', alliance: 'Star Alliance', country: 'Belgium' },

  // Oneworld
  { code: 'AA', name: 'American Airlines', logo: '✈️', frequentFlyerProgram: 'AAdvantage', alliance: 'Oneworld', country: 'United States' },
  { code: 'BA', name: 'British Airways', logo: '✈️', frequentFlyerProgram: 'Executive Club', alliance: 'Oneworld', country: 'United Kingdom' },
  { code: 'QF', name: 'Qantas', logo: '✈️', frequentFlyerProgram: 'Frequent Flyer', alliance: 'Oneworld', country: 'Australia' },
  { code: 'CX', name: 'Cathay Pacific', logo: '✈️', frequentFlyerProgram: 'Asia Miles', alliance: 'Oneworld', country: 'Hong Kong' },
  { code: 'JL', name: 'Japan Airlines', logo: '✈️', frequentFlyerProgram: 'JAL Mileage Bank', alliance: 'Oneworld', country: 'Japan' },
  { code: 'QR', name: 'Qatar Airways', logo: '✈️', frequentFlyerProgram: 'Privilege Club', alliance: 'Oneworld', country: 'Qatar' },
  { code: 'IB', name: 'Iberia', logo: '✈️', frequentFlyerProgram: 'Iberia Plus', alliance: 'Oneworld', country: 'Spain' },
  { code: 'AY', name: 'Finnair', logo: '✈️', frequentFlyerProgram: 'Finnair Plus', alliance: 'Oneworld', country: 'Finland' },

  // SkyTeam
  { code: 'DL', name: 'Delta Air Lines', logo: '✈️', frequentFlyerProgram: 'SkyMiles', alliance: 'SkyTeam', country: 'United States' },
  { code: 'AF', name: 'Air France', logo: '✈️', frequentFlyerProgram: 'Flying Blue', alliance: 'SkyTeam', country: 'France' },
  { code: 'KL', name: 'KLM', logo: '✈️', frequentFlyerProgram: 'Flying Blue', alliance: 'SkyTeam', country: 'Netherlands' },
  { code: 'KE', name: 'Korean Air', logo: '✈️', frequentFlyerProgram: 'SKYPASS', alliance: 'SkyTeam', country: 'South Korea' },
  { code: 'AM', name: 'Aeroméxico', logo: '✈️', frequentFlyerProgram: 'Club Premier', alliance: 'SkyTeam', country: 'Mexico' },
  { code: 'AZ', name: 'ITA Airways', logo: '✈️', frequentFlyerProgram: 'Volare', alliance: 'SkyTeam', country: 'Italy' },
  { code: 'VS', name: 'Virgin Atlantic', logo: '✈️', frequentFlyerProgram: 'Flying Club', alliance: 'SkyTeam', country: 'United Kingdom' },

  // No Alliance
  { code: 'WN', name: 'Southwest Airlines', logo: '✈️', frequentFlyerProgram: 'Rapid Rewards', alliance: null, country: 'United States' },
  { code: 'B6', name: 'JetBlue Airways', logo: '✈️', frequentFlyerProgram: 'TrueBlue', alliance: null, country: 'United States' },
  { code: 'AS', name: 'Alaska Airlines', logo: '✈️', frequentFlyerProgram: 'Mileage Plan', alliance: null, country: 'United States' },
  { code: 'F9', name: 'Frontier Airlines', logo: '✈️', frequentFlyerProgram: 'FRONTIER Miles', alliance: null, country: 'United States' },
  { code: 'NK', name: 'Spirit Airlines', logo: '✈️', frequentFlyerProgram: 'Free Spirit', alliance: null, country: 'United States' },
  { code: 'EK', name: 'Emirates', logo: '✈️', frequentFlyerProgram: 'Emirates Skywards', alliance: null, country: 'UAE' },
  { code: 'EY', name: 'Etihad Airways', logo: '✈️', frequentFlyerProgram: 'Etihad Guest', alliance: null, country: 'UAE' },
  { code: 'WY', name: 'Oman Air', logo: '✈️', frequentFlyerProgram: 'Sindbad', alliance: null, country: 'Oman' },
];

// Group airlines by alliance
export const AIRLINES_BY_ALLIANCE = {
  'Star Alliance': AIRLINES.filter(a => a.alliance === 'Star Alliance'),
  'Oneworld': AIRLINES.filter(a => a.alliance === 'Oneworld'),
  'SkyTeam': AIRLINES.filter(a => a.alliance === 'SkyTeam'),
  'Independent': AIRLINES.filter(a => a.alliance === null),
};

/**
 * Search airlines by name or program
 */
export function searchAirlines(query: string): Airline[] {
  const lowerQuery = query.toLowerCase();
  return AIRLINES.filter(airline =>
    airline.name.toLowerCase().includes(lowerQuery) ||
    airline.frequentFlyerProgram.toLowerCase().includes(lowerQuery) ||
    airline.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get airline by code
 */
export function getAirlineByCode(code: string): Airline | undefined {
  return AIRLINES.find(a => a.code === code);
}
