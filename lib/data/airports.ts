/**
 * @deprecated This file is deprecated and will be removed in a future version.
 *
 * Please use '@/lib/data/airports-complete' instead which provides:
 * - 950+ airports across all 7 continents (vs 331 here)
 * - Comprehensive coverage: Asia, Middle East, Africa, Oceania, Europe, Americas
 * - Additional metadata: ICAO codes, coordinates, timezones, metro groupings
 * - Better type definitions and search keywords
 * - Consistent emoji and flag emojis
 *
 * Migration guide:
 * 1. Change import: import { AIRPORTS } from '@/lib/data/airports-complete'
 * 2. Update interface: The Airport type now includes more fields (see airports-complete.ts)
 * 3. Use helper functions: Import from '@/lib/data/airport-helpers' for search/filter utilities
 *
 * Legacy file maintained for backward compatibility only.
 * Last updated: 2025-01-19
 */

/**
 * Common airport codes with their city/location names
 * This is a curated list of major airports worldwide
 *
 * @deprecated - Use @/lib/data/airports-complete instead
 */

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
  flag: string;
}

export const AIRPORTS: Airport[] = [
  // United States
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'United States', flag: '🇺🇸' },
  { code: 'LGA', city: 'New York', name: 'LaGuardia', country: 'United States', flag: '🇺🇸' },
  { code: 'EWR', city: 'Newark', name: 'Newark Liberty International', country: 'United States', flag: '🇺🇸' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'United States', flag: '🇺🇸' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'United States', flag: '🇺🇸' },
  { code: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'United States', flag: '🇺🇸' },
  { code: 'MIA', city: 'Miami', name: 'Miami International', country: 'United States', flag: '🇺🇸' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International', country: 'United States', flag: '🇺🇸' },
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International', country: 'United States', flag: '🇺🇸' },
  { code: 'BOS', city: 'Boston', name: 'Logan International', country: 'United States', flag: '🇺🇸' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International', country: 'United States', flag: '🇺🇸' },
  { code: 'DEN', city: 'Denver', name: 'Denver International', country: 'United States', flag: '🇺🇸' },
  { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid International', country: 'United States', flag: '🇺🇸' },
  { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor International', country: 'United States', flag: '🇺🇸' },
  { code: 'IAH', city: 'Houston', name: 'George Bush Intercontinental', country: 'United States', flag: '🇺🇸' },
  { code: 'MCO', city: 'Orlando', name: 'Orlando International', country: 'United States', flag: '🇺🇸' },
  { code: 'SAN', city: 'San Diego', name: 'San Diego International', country: 'United States', flag: '🇺🇸' },
  { code: 'PDX', city: 'Portland', name: 'Portland International', country: 'United States', flag: '🇺🇸' },
  { code: 'MSP', city: 'Minneapolis', name: 'Minneapolis-St Paul International', country: 'United States', flag: '🇺🇸' },
  { code: 'DTW', city: 'Detroit', name: 'Detroit Metropolitan Wayne County', country: 'United States', flag: '🇺🇸' },
  { code: 'PHL', city: 'Philadelphia', name: 'Philadelphia International', country: 'United States', flag: '🇺🇸' },
  { code: 'SLC', city: 'Salt Lake City', name: 'Salt Lake City International', country: 'United States', flag: '🇺🇸' },
  { code: 'CLT', city: 'Charlotte', name: 'Charlotte Douglas International', country: 'United States', flag: '🇺🇸' },
  { code: 'BWI', city: 'Baltimore', name: 'Baltimore/Washington International', country: 'United States', flag: '🇺🇸' },
  { code: 'DCA', city: 'Washington DC', name: 'Ronald Reagan Washington National', country: 'United States', flag: '🇺🇸' },
  { code: 'IAD', city: 'Washington DC', name: 'Washington Dulles International', country: 'United States', flag: '🇺🇸' },
  { code: 'BDL', city: 'Hartford', name: 'Bradley International', country: 'United States', flag: '🇺🇸' },
  { code: 'PVD', city: 'Providence', name: 'Rhode Island T.F. Green International', country: 'United States', flag: '🇺🇸' },
  { code: 'MHT', city: 'Manchester', name: 'Manchester-Boston Regional', country: 'United States', flag: '🇺🇸' },
  { code: 'BUF', city: 'Buffalo', name: 'Buffalo Niagara International', country: 'United States', flag: '🇺🇸' },
  { code: 'ROC', city: 'Rochester', name: 'Greater Rochester International', country: 'United States', flag: '🇺🇸' },
  { code: 'SYR', city: 'Syracuse', name: 'Syracuse Hancock International', country: 'United States', flag: '🇺🇸' },
  { code: 'ALB', city: 'Albany', name: 'Albany International', country: 'United States', flag: '🇺🇸' },
  { code: 'BTV', city: 'Burlington', name: 'Burlington International', country: 'United States', flag: '🇺🇸' },
  { code: 'PWM', city: 'Portland', name: 'Portland International Jetport', country: 'United States', flag: '🇺🇸' },
  { code: 'BGR', city: 'Bangor', name: 'Bangor International', country: 'United States', flag: '🇺🇸' },
  { code: 'HPN', city: 'White Plains', name: 'Westchester County', country: 'United States', flag: '🇺🇸' },
  { code: 'ISP', city: 'Long Island', name: 'Long Island MacArthur', country: 'United States', flag: '🇺🇸' },
  { code: 'PIT', city: 'Pittsburgh', name: 'Pittsburgh International', country: 'United States', flag: '🇺🇸' },
  { code: 'FLL', city: 'Fort Lauderdale', name: 'Fort Lauderdale-Hollywood International', country: 'United States', flag: '🇺🇸' },
  { code: 'PBI', city: 'West Palm Beach', name: 'Palm Beach International', country: 'United States', flag: '🇺🇸' },
  { code: 'TPA', city: 'Tampa', name: 'Tampa International', country: 'United States', flag: '🇺🇸' },
  { code: 'RSW', city: 'Fort Myers', name: 'Southwest Florida International', country: 'United States', flag: '🇺🇸' },
  { code: 'JAX', city: 'Jacksonville', name: 'Jacksonville International', country: 'United States', flag: '🇺🇸' },
  { code: 'PNS', city: 'Pensacola', name: 'Pensacola International', country: 'United States', flag: '🇺🇸' },
  { code: 'TLH', city: 'Tallahassee', name: 'Tallahassee International', country: 'United States', flag: '🇺🇸' },
  { code: 'SRQ', city: 'Sarasota', name: 'Sarasota-Bradenton International', country: 'United States', flag: '🇺🇸' },
  { code: 'EYW', city: 'Key West', name: 'Key West International', country: 'United States', flag: '🇺🇸' },
  { code: 'RDU', city: 'Raleigh', name: 'Raleigh-Durham International', country: 'United States', flag: '🇺🇸' },
  { code: 'GSO', city: 'Greensboro', name: 'Piedmont Triad International', country: 'United States', flag: '🇺🇸' },
  { code: 'RIC', city: 'Richmond', name: 'Richmond International', country: 'United States', flag: '🇺🇸' },
  { code: 'ORF', city: 'Norfolk', name: 'Norfolk International', country: 'United States', flag: '🇺🇸' },
  { code: 'SAV', city: 'Savannah', name: 'Savannah/Hilton Head International', country: 'United States', flag: '🇺🇸' },
  { code: 'CHS', city: 'Charleston', name: 'Charleston International', country: 'United States', flag: '🇺🇸' },
  { code: 'CAE', city: 'Columbia', name: 'Columbia Metropolitan', country: 'United States', flag: '🇺🇸' },
  { code: 'GSP', city: 'Greenville', name: 'Greenville-Spartanburg International', country: 'United States', flag: '🇺🇸' },
  { code: 'MYR', city: 'Myrtle Beach', name: 'Myrtle Beach International', country: 'United States', flag: '🇺🇸' },
  { code: 'AVL', city: 'Asheville', name: 'Asheville Regional', country: 'United States', flag: '🇺🇸' },
  { code: 'BNA', city: 'Nashville', name: 'Nashville International', country: 'United States', flag: '🇺🇸' },
  { code: 'MEM', city: 'Memphis', name: 'Memphis International', country: 'United States', flag: '🇺🇸' },
  { code: 'BHM', city: 'Birmingham', name: 'Birmingham-Shuttlesworth International', country: 'United States', flag: '🇺🇸' },
  { code: 'HSV', city: 'Huntsville', name: 'Huntsville International', country: 'United States', flag: '🇺🇸' },
  { code: 'MSY', city: 'New Orleans', name: 'Louis Armstrong New Orleans International', country: 'United States', flag: '🇺🇸' },
  { code: 'BTR', city: 'Baton Rouge', name: 'Baton Rouge Metropolitan', country: 'United States', flag: '🇺🇸' },
  { code: 'LIT', city: 'Little Rock', name: 'Bill and Hillary Clinton National', country: 'United States', flag: '🇺🇸' },
  { code: 'XNA', city: 'Fayetteville', name: 'Northwest Arkansas Regional', country: 'United States', flag: '🇺🇸' },
  { code: 'MDW', city: 'Chicago', name: 'Chicago Midway International', country: 'United States', flag: '🇺🇸' },
  { code: 'STL', city: 'St. Louis', name: 'St. Louis Lambert International', country: 'United States', flag: '🇺🇸' },
  { code: 'MCI', city: 'Kansas City', name: 'Kansas City International', country: 'United States', flag: '🇺🇸' },
  { code: 'IND', city: 'Indianapolis', name: 'Indianapolis International', country: 'United States', flag: '🇺🇸' },
  { code: 'CMH', city: 'Columbus', name: 'John Glenn Columbus International', country: 'United States', flag: '🇺🇸' },
  { code: 'CLE', city: 'Cleveland', name: 'Cleveland Hopkins International', country: 'United States', flag: '🇺🇸' },
  { code: 'CVG', city: 'Cincinnati', name: 'Cincinnati/Northern Kentucky International', country: 'United States', flag: '🇺🇸' },
  { code: 'MKE', city: 'Milwaukee', name: 'Milwaukee Mitchell International', country: 'United States', flag: '🇺🇸' },
  { code: 'DSM', city: 'Des Moines', name: 'Des Moines International', country: 'United States', flag: '🇺🇸' },
  { code: 'OMA', city: 'Omaha', name: 'Eppley Airfield', country: 'United States', flag: '🇺🇸' },
  { code: 'ICT', city: 'Wichita', name: 'Wichita Dwight D. Eisenhower National', country: 'United States', flag: '🇺🇸' },
  { code: 'TUL', city: 'Tulsa', name: 'Tulsa International', country: 'United States', flag: '🇺🇸' },
  { code: 'OKC', city: 'Oklahoma City', name: 'Will Rogers World', country: 'United States', flag: '🇺🇸' },
  { code: 'GRR', city: 'Grand Rapids', name: 'Gerald R. Ford International', country: 'United States', flag: '🇺🇸' },
  { code: 'DAY', city: 'Dayton', name: 'James M. Cox Dayton International', country: 'United States', flag: '🇺🇸' },
  { code: 'DAL', city: 'Dallas', name: 'Dallas Love Field', country: 'United States', flag: '🇺🇸' },
  { code: 'HOU', city: 'Houston', name: 'William P. Hobby', country: 'United States', flag: '🇺🇸' },
  { code: 'AUS', city: 'Austin', name: 'Austin-Bergstrom International', country: 'United States', flag: '🇺🇸' },
  { code: 'SAT', city: 'San Antonio', name: 'San Antonio International', country: 'United States', flag: '🇺🇸' },
  { code: 'ELP', city: 'El Paso', name: 'El Paso International', country: 'United States', flag: '🇺🇸' },
  { code: 'MAF', city: 'Midland', name: 'Midland International Air and Space Port', country: 'United States', flag: '🇺🇸' },
  { code: 'LBB', city: 'Lubbock', name: 'Lubbock Preston Smith International', country: 'United States', flag: '🇺🇸' },
  { code: 'AMA', city: 'Amarillo', name: 'Rick Husband Amarillo International', country: 'United States', flag: '🇺🇸' },
  { code: 'CRP', city: 'Corpus Christi', name: 'Corpus Christi International', country: 'United States', flag: '🇺🇸' },
  { code: 'BRO', city: 'Brownsville', name: 'Brownsville South Padre Island International', country: 'United States', flag: '🇺🇸' },
  { code: 'MFE', city: 'McAllen', name: 'McAllen Miller International', country: 'United States', flag: '🇺🇸' },
  { code: 'TUS', city: 'Tucson', name: 'Tucson International', country: 'United States', flag: '🇺🇸' },
  { code: 'ABQ', city: 'Albuquerque', name: 'Albuquerque International Sunport', country: 'United States', flag: '🇺🇸' },
  { code: 'RNO', city: 'Reno', name: 'Reno-Tahoe International', country: 'United States', flag: '🇺🇸' },
  { code: 'BOI', city: 'Boise', name: 'Boise', country: 'United States', flag: '🇺🇸' },
  { code: 'GEG', city: 'Spokane', name: 'Spokane International', country: 'United States', flag: '🇺🇸' },
  { code: 'SJC', city: 'San Jose', name: 'Norman Y. Mineta San Jose International', country: 'United States', flag: '🇺🇸' },
  { code: 'OAK', city: 'Oakland', name: 'Oakland International', country: 'United States', flag: '🇺🇸' },
  { code: 'SMF', city: 'Sacramento', name: 'Sacramento International', country: 'United States', flag: '🇺🇸' },
  { code: 'ONT', city: 'Ontario', name: 'Ontario International', country: 'United States', flag: '🇺🇸' },
  { code: 'BUR', city: 'Burbank', name: 'Hollywood Burbank', country: 'United States', flag: '🇺🇸' },
  { code: 'SNA', city: 'Santa Ana', name: 'John Wayne', country: 'United States', flag: '🇺🇸' },
  { code: 'PSP', city: 'Palm Springs', name: 'Palm Springs International', country: 'United States', flag: '🇺🇸' },
  { code: 'FAT', city: 'Fresno', name: 'Fresno Yosemite International', country: 'United States', flag: '🇺🇸' },
  { code: 'SBA', city: 'Santa Barbara', name: 'Santa Barbara Municipal', country: 'United States', flag: '🇺🇸' },
  { code: 'EUG', city: 'Eugene', name: 'Eugene', country: 'United States', flag: '🇺🇸' },
  { code: 'MFR', city: 'Medford', name: 'Rogue Valley International-Medford', country: 'United States', flag: '🇺🇸' },
  { code: 'ANC', city: 'Anchorage', name: 'Ted Stevens Anchorage International', country: 'United States', flag: '🇺🇸' },
  { code: 'FAI', city: 'Fairbanks', name: 'Fairbanks International', country: 'United States', flag: '🇺🇸' },
  { code: 'JNU', city: 'Juneau', name: 'Juneau International', country: 'United States', flag: '🇺🇸' },
  { code: 'HNL', city: 'Honolulu', name: 'Daniel K. Inouye International', country: 'United States', flag: '🇺🇸' },
  { code: 'OGG', city: 'Maui', name: 'Kahului', country: 'United States', flag: '🇺🇸' },
  { code: 'KOA', city: 'Kona', name: 'Ellison Onizuka Kona International', country: 'United States', flag: '🇺🇸' },
  { code: 'LIH', city: 'Lihue', name: 'Lihue', country: 'United States', flag: '🇺🇸' },
  { code: 'ITO', city: 'Hilo', name: 'Hilo International', country: 'United States', flag: '🇺🇸' },
  { code: 'COS', city: 'Colorado Springs', name: 'Colorado Springs', country: 'United States', flag: '🇺🇸' },
  { code: 'ASE', city: 'Aspen', name: 'Aspen-Pitkin County', country: 'United States', flag: '🇺🇸' },
  { code: 'EGE', city: 'Vail', name: 'Eagle County Regional', country: 'United States', flag: '🇺🇸' },
  { code: 'JAC', city: 'Jackson Hole', name: 'Jackson Hole', country: 'United States', flag: '🇺🇸' },

  // Canada
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YUL', city: 'Montreal', name: 'Montreal-Pierre Elliott Trudeau International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YYC', city: 'Calgary', name: 'Calgary International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YTZ', city: 'Toronto', name: 'Billy Bishop Toronto City', country: 'Canada', flag: '🇨🇦' },
  { code: 'YOW', city: 'Ottawa', name: 'Ottawa Macdonald-Cartier International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YEG', city: 'Edmonton', name: 'Edmonton International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YWG', city: 'Winnipeg', name: 'Winnipeg James Armstrong Richardson International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YYJ', city: 'Victoria', name: 'Victoria International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YHZ', city: 'Halifax', name: 'Halifax Stanfield International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YQB', city: 'Quebec City', name: 'Québec City Jean Lesage International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YXE', city: 'Saskatoon', name: 'Saskatoon John G. Diefenbaker International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YLW', city: 'Kelowna', name: 'Kelowna International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YYT', city: "St. John's", name: "St. John's International", country: 'Canada', flag: '🇨🇦' },
  { code: 'YQR', city: 'Regina', name: 'Regina International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YXU', city: 'London', name: 'London International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YQG', city: 'Windsor', name: 'Windsor International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YHM', city: 'Hamilton', name: 'John C. Munro Hamilton International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YKF', city: 'Waterloo', name: 'Region of Waterloo International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YQM', city: 'Moncton', name: 'Greater Moncton Roméo LeBlanc International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YDF', city: 'Deer Lake', name: 'Deer Lake Regional', country: 'Canada', flag: '🇨🇦' },
  { code: 'YXX', city: 'Abbotsford', name: 'Abbotsford International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YKA', city: 'Kamloops', name: 'Kamloops', country: 'Canada', flag: '🇨🇦' },
  { code: 'YXS', city: 'Prince George', name: 'Prince George', country: 'Canada', flag: '🇨🇦' },
  { code: 'YMM', city: 'Fort McMurray', name: 'Fort McMurray International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YQU', city: 'Grande Prairie', name: 'Grande Prairie', country: 'Canada', flag: '🇨🇦' },
  { code: 'YZF', city: 'Yellowknife', name: 'Yellowknife', country: 'Canada', flag: '🇨🇦' },
  { code: 'YXY', city: 'Whitehorse', name: 'Erik Nielsen Whitehorse International', country: 'Canada', flag: '🇨🇦' },
  { code: 'YFB', city: 'Iqaluit', name: 'Iqaluit', country: 'Canada', flag: '🇨🇦' },

  // United Kingdom
  { code: 'LHR', city: 'London', name: 'Heathrow', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'LGW', city: 'London', name: 'Gatwick', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'LCY', city: 'London', name: 'London City', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'STN', city: 'London', name: 'Stansted', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'EDI', city: 'Edinburgh', name: 'Edinburgh', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'GLA', city: 'Glasgow', name: 'Glasgow', country: 'United Kingdom', flag: '🇬🇧' },

  // Europe
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France', flag: '🇫🇷' },
  { code: 'ORY', city: 'Paris', name: 'Orly', country: 'France', flag: '🇫🇷' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt', country: 'Germany', flag: '🇩🇪' },
  { code: 'MUC', city: 'Munich', name: 'Munich', country: 'Germany', flag: '🇩🇪' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol', country: 'Netherlands', flag: '🇳🇱' },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid-Barajas', country: 'Spain', flag: '🇪🇸' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona-El Prat', country: 'Spain', flag: '🇪🇸' },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci-Fiumicino', country: 'Italy', flag: '🇮🇹' },
  { code: 'MXP', city: 'Milan', name: 'Malpensa', country: 'Italy', flag: '🇮🇹' },
  { code: 'VCE', city: 'Venice', name: 'Marco Polo', country: 'Italy', flag: '🇮🇹' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich', country: 'Switzerland', flag: '🇨🇭' },
  { code: 'VIE', city: 'Vienna', name: 'Vienna International', country: 'Austria', flag: '🇦🇹' },
  { code: 'BRU', city: 'Brussels', name: 'Brussels', country: 'Belgium', flag: '🇧🇪' },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen', country: 'Denmark', flag: '🇩🇰' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Gardermoen', country: 'Norway', flag: '🇳🇴' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda', country: 'Sweden', flag: '🇸🇪' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa', country: 'Finland', flag: '🇫🇮' },
  { code: 'DUB', city: 'Dublin', name: 'Dublin', country: 'Ireland', flag: '🇮🇪' },
  { code: 'LIS', city: 'Lisbon', name: 'Lisbon Portela', country: 'Portugal', flag: '🇵🇹' },
  { code: 'ATH', city: 'Athens', name: 'Athens International', country: 'Greece', flag: '🇬🇷' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul', country: 'Turkey', flag: '🇹🇷' },
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin', country: 'Poland', flag: '🇵🇱' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel Prague', country: 'Czech Republic', flag: '🇨🇿' },

  // Asia
  { code: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'UAE', flag: '🇦🇪' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International', country: 'Hong Kong', flag: '🇭🇰' },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi', country: 'Singapore', flag: '🇸🇬' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International', country: 'Japan', flag: '🇯🇵' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda', country: 'Japan', flag: '🇯🇵' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International', country: 'South Korea', flag: '🇰🇷' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International', country: 'China', flag: '🇨🇳' },
  { code: 'PVG', city: 'Shanghai', name: 'Shanghai Pudong International', country: 'China', flag: '🇨🇳' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi', country: 'Thailand', flag: '🇹🇭' },
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International', country: 'India', flag: '🇮🇳' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International', country: 'India', flag: '🇮🇳' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International', country: 'Malaysia', flag: '🇲🇾' },
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International', country: 'Indonesia', flag: '🇮🇩' },
  { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino International', country: 'Philippines', flag: '🇵🇭' },

  // Oceania
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith', country: 'Australia', flag: '🇦🇺' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne', country: 'Australia', flag: '🇦🇺' },
  { code: 'BNE', city: 'Brisbane', name: 'Brisbane', country: 'Australia', flag: '🇦🇺' },
  { code: 'PER', city: 'Perth', name: 'Perth', country: 'Australia', flag: '🇦🇺' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland', country: 'New Zealand', flag: '🇳🇿' },

  // Latin America
  // Mexico
  { code: 'MEX', city: 'Mexico City', name: 'Mexico City International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'NLU', city: 'Mexico City', name: 'Felipe Ángeles International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'TLC', city: 'Toluca', name: 'Toluca International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'CUN', city: 'Cancún', name: 'Cancún International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'GDL', city: 'Guadalajara', name: 'Miguel Hidalgo y Costilla Guadalajara International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'MTY', city: 'Monterrey', name: 'Monterrey International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'TIJ', city: 'Tijuana', name: 'Tijuana International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'PVR', city: 'Puerto Vallarta', name: 'Licenciado Gustavo Díaz Ordaz International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'SJD', city: 'Los Cabos', name: 'Los Cabos International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'MZT', city: 'Mazatlán', name: 'General Rafael Buelna International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'ACA', city: 'Acapulco', name: 'General Juan N. Álvarez International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'HUX', city: 'Huatulco', name: 'Bahías de Huatulco International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'ZIH', city: 'Ixtapa', name: 'Ixtapa-Zihuatanejo International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'ZLO', city: 'Manzanillo', name: 'Playa de Oro International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'BJX', city: 'León', name: 'Del Bajío International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'AGU', city: 'Aguascalientes', name: 'Aguascalientes International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'SLP', city: 'San Luis Potosí', name: 'Ponciano Arriaga International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'QRO', city: 'Querétaro', name: 'Querétaro International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'MLM', city: 'Morelia', name: 'General Francisco J. Mujica International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'ZCL', city: 'Zacatecas', name: 'Zacatecas International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'DGO', city: 'Durango', name: 'General Guadalupe Victoria International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'TRC', city: 'Torreón', name: 'Francisco Sarabia International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'CUL', city: 'Culiacán', name: 'Federal de Bachigualato International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'LAP', city: 'La Paz', name: 'Manuel Márquez de León International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'LTO', city: 'Loreto', name: 'Loreto International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'HMO', city: 'Hermosillo', name: 'General Ignacio Pesqueira García International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'CEN', city: 'Ciudad Obregón', name: 'Ciudad Obregón International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'GYM', city: 'Guaymas', name: 'General José María Yáñez International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'CJS', city: 'Ciudad Juárez', name: 'Abraham González International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'CUU', city: 'Chihuahua', name: 'General Roberto Fierro Villalobos International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'MXL', city: 'Mexicali', name: 'General Rodolfo Sánchez Taboada International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'MID', city: 'Mérida', name: 'Manuel Crescencio Rejón International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'CZM', city: 'Cozumel', name: 'Cozumel International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'VSA', city: 'Villahermosa', name: 'Carlos Rovirosa Pérez International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'TAP', city: 'Tapachula', name: 'Tapachula International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'TGZ', city: 'Tuxtla Gutiérrez', name: 'Ángel Albino Corzo International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'OAX', city: 'Oaxaca', name: 'Xoxocotlán International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'PBC', city: 'Puebla', name: 'Hermanos Serdán International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'VER', city: 'Veracruz', name: 'General Heriberto Jara International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'TAM', city: 'Tampico', name: 'General Francisco Javier Mina International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'REX', city: 'Reynosa', name: 'General Lucio Blanco International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'MAM', city: 'Matamoros', name: 'General Servando Canales International', country: 'Mexico', flag: '🇲🇽' },
  { code: 'NLD', city: 'Nuevo Laredo', name: 'Quetzalcóatl International', country: 'Mexico', flag: '🇲🇽' },

  // Brazil
  { code: 'GRU', city: 'São Paulo', name: 'São Paulo-Guarulhos International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'CGH', city: 'São Paulo', name: 'Congonhas', country: 'Brazil', flag: '🇧🇷' },
  { code: 'VCP', city: 'Campinas', name: 'Viracopos International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Rio de Janeiro-Galeão International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'SDU', city: 'Rio de Janeiro', name: 'Santos Dumont', country: 'Brazil', flag: '🇧🇷' },
  { code: 'BSB', city: 'Brasília', name: 'Presidente Juscelino Kubitschek International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'CNF', city: 'Belo Horizonte', name: 'Tancredo Neves International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'PLU', city: 'Belo Horizonte', name: 'Pampulha', country: 'Brazil', flag: '🇧🇷' },
  { code: 'SSA', city: 'Salvador', name: 'Deputado Luís Eduardo Magalhães International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'FOR', city: 'Fortaleza', name: 'Pinto Martins International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'REC', city: 'Recife', name: 'Recife/Guararapes–Gilberto Freyre International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'POA', city: 'Porto Alegre', name: 'Salgado Filho International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'CWB', city: 'Curitiba', name: 'Afonso Pena International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'MAO', city: 'Manaus', name: 'Eduardo Gomes International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'BEL', city: 'Belém', name: 'Val de Cans International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'NAT', city: 'Natal', name: 'Governador Aluízio Alves International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'FLN', city: 'Florianópolis', name: 'Hercílio Luz International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'VIX', city: 'Vitória', name: 'Eurico de Aguiar Salles', country: 'Brazil', flag: '🇧🇷' },
  { code: 'GYN', city: 'Goiânia', name: 'Santa Genoveva', country: 'Brazil', flag: '🇧🇷' },
  { code: 'CGB', city: 'Cuiabá', name: 'Marechal Rondon International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'MCZ', city: 'Maceió', name: 'Zumbi dos Palmares International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'JPA', city: 'João Pessoa', name: 'Presidente Castro Pinto International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'AJU', city: 'Aracaju', name: 'Santa Maria', country: 'Brazil', flag: '🇧🇷' },
  { code: 'SLZ', city: 'São Luís', name: 'Marechal Cunha Machado International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'THE', city: 'Teresina', name: 'Teresina', country: 'Brazil', flag: '🇧🇷' },
  { code: 'CGR', city: 'Campo Grande', name: 'Campo Grande International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'IMP', city: 'Imperatriz', name: 'Prefeito Renato Moreira', country: 'Brazil', flag: '🇧🇷' },
  { code: 'UDI', city: 'Uberlândia', name: 'Ten. Cel. Aviador César Bombonato', country: 'Brazil', flag: '🇧🇷' },
  { code: 'NVT', city: 'Navegantes', name: 'Ministro Victor Konder International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'LDB', city: 'Londrina', name: 'Londrina', country: 'Brazil', flag: '🇧🇷' },
  { code: 'JOI', city: 'Joinville', name: 'Lauro Carneiro de Loyola', country: 'Brazil', flag: '🇧🇷' },
  { code: 'IGU', city: 'Foz do Iguaçu', name: 'Foz do Iguaçu International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'RAO', city: 'Ribeirão Preto', name: 'Leite Lopes', country: 'Brazil', flag: '🇧🇷' },
  { code: 'MGF', city: 'Maringá', name: 'Sílvio Nane Junior', country: 'Brazil', flag: '🇧🇷' },
  { code: 'BPS', city: 'Porto Seguro', name: 'Porto Seguro', country: 'Brazil', flag: '🇧🇷' },
  { code: 'IOS', city: 'Ilhéus', name: 'Jorge Amado', country: 'Brazil', flag: '🇧🇷' },
  { code: 'PVH', city: 'Porto Velho', name: 'Governador Jorge Teixeira de Oliveira International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'RBR', city: 'Rio Branco', name: 'Plácido de Castro International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'BVB', city: 'Boa Vista', name: 'Atlas Brasil Cantanhede International', country: 'Brazil', flag: '🇧🇷' },
  { code: 'MAB', city: 'Marabá', name: 'Marabá', country: 'Brazil', flag: '🇧🇷' },
  { code: 'STM', city: 'Santarém', name: 'Maestro Wilson Fonseca', country: 'Brazil', flag: '🇧🇷' },
  { code: 'PMW', city: 'Palmas', name: 'Brigadeiro Lysias Rodrigues', country: 'Brazil', flag: '🇧🇷' },
  { code: 'VDC', city: 'Vitória da Conquista', name: 'Glauber de Andrade Rocha', country: 'Brazil', flag: '🇧🇷' },
  { code: 'JDO', city: 'Juazeiro do Norte', name: 'Orlando Bezerra de Menezes', country: 'Brazil', flag: '🇧🇷' },

  // Other Latin America
  { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini International', country: 'Argentina', flag: '🇦🇷' },
  { code: 'AEP', city: 'Buenos Aires', name: 'Aeroparque Jorge Newbery', country: 'Argentina', flag: '🇦🇷' },
  { code: 'BOG', city: 'Bogotá', name: 'El Dorado International', country: 'Colombia', flag: '🇨🇴' },
  { code: 'LIM', city: 'Lima', name: 'Jorge Chávez International', country: 'Peru', flag: '🇵🇪' },
  { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benítez International', country: 'Chile', flag: '🇨🇱' },

  // Middle East & Africa
  { code: 'DOH', city: 'Doha', name: 'Hamad International', country: 'Qatar', flag: '🇶🇦' },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Abu Dhabi International', country: 'UAE', flag: '🇦🇪' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International', country: 'Egypt', flag: '🇪🇬' },
  { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International', country: 'South Africa', flag: '🇿🇦' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International', country: 'South Africa', flag: '🇿🇦' },
  { code: 'TLV', city: 'Tel Aviv', name: 'Ben Gurion', country: 'Israel', flag: '🇮🇱' },
];

/**
 * Get airport display name with city and country flag
 * @param code - Airport code (e.g., "LAX")
 * @returns Formatted string like "🇺🇸 LAX - Los Angeles" or just "LAX" if not found
 */
export function getAirportDisplay(code: string): string {
  const airport = AIRPORTS.find(a => a.code === code);
  return airport ? `${airport.flag} ${code} - ${airport.city}` : code;
}

/**
 * Get airport city name
 * @param code - Airport code (e.g., "LAX")
 * @returns City name or the code if not found
 */
export function getAirportCity(code: string): string {
  const airport = AIRPORTS.find(a => a.code === code);
  return airport ? airport.city : code;
}

/**
 * Get airport country flag
 * @param code - Airport code (e.g., "LAX")
 * @returns Country flag emoji or empty string if not found
 */
export function getAirportFlag(code: string): string {
  const airport = AIRPORTS.find(a => a.code === code);
  return airport ? airport.flag : '';
}

/**
 * Format airport as "City (CODE)" for compact displays
 * @param code - Airport code (e.g., "LAX")
 * @returns Formatted string like "Los Angeles (LAX)" or just "LAX" if city not found
 */
export function formatCityCode(code: string): string {
  if (!code) return '';
  const airport = AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase());
  const upperCode = code.toUpperCase();
  return airport ? `${airport.city} (${upperCode})` : upperCode;
}

/**
 * Get airport object by code
 * @param code - Airport code (e.g., "LAX")
 * @returns Airport object or undefined if not found
 */
export function getAirport(code: string): Airport | undefined {
  return AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase());
}
