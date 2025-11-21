/**
 * Generate Comprehensive Airport Database
 * Converts OpenFlights data (7,698 airports) to TypeScript format
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Country to continent mapping
const COUNTRY_TO_CONTINENT = {
  // North America
  'United States': 'NA', 'Canada': 'NA', 'Mexico': 'NA', 'Cuba': 'NA', 'Jamaica': 'NA',
  'Haiti': 'NA', 'Dominican Republic': 'NA', 'Costa Rica': 'NA', 'Panama': 'NA',
  'Guatemala': 'NA', 'Honduras': 'NA', 'Nicaragua': 'NA', 'El Salvador': 'NA',
  'Belize': 'NA', 'Bahamas': 'NA', 'Barbados': 'NA', 'Trinidad and Tobago': 'NA',

  // South America
  'Brazil': 'SA', 'Argentina': 'SA', 'Chile': 'SA', 'Colombia': 'SA', 'Peru': 'SA',
  'Venezuela': 'SA', 'Ecuador': 'SA', 'Bolivia': 'SA', 'Paraguay': 'SA',
  'Uruguay': 'SA', 'Guyana': 'SA', 'Suriname': 'SA', 'French Guiana': 'SA',

  // Europe
  'United Kingdom': 'EU', 'France': 'EU', 'Germany': 'EU', 'Italy': 'EU', 'Spain': 'EU',
  'Portugal': 'EU', 'Netherlands': 'EU', 'Belgium': 'EU', 'Switzerland': 'EU',
  'Austria': 'EU', 'Poland': 'EU', 'Czech Republic': 'EU', 'Hungary': 'EU',
  'Romania': 'EU', 'Greece': 'EU', 'Denmark': 'EU', 'Sweden': 'EU', 'Norway': 'EU',
  'Finland': 'EU', 'Ireland': 'EU', 'Iceland': 'EU', 'Luxembourg': 'EU',
  'Croatia': 'EU', 'Serbia': 'EU', 'Bulgaria': 'EU', 'Slovakia': 'EU',
  'Slovenia': 'EU', 'Estonia': 'EU', 'Latvia': 'EU', 'Lithuania': 'EU',
  'Albania': 'EU', 'Bosnia and Herzegovina': 'EU', 'Montenegro': 'EU',
  'North Macedonia': 'EU', 'Moldova': 'EU', 'Ukraine': 'EU', 'Belarus': 'EU',
  'Russia': 'EU', 'Malta': 'EU', 'Cyprus': 'EU',

  // Asia
  'China': 'AS', 'Japan': 'AS', 'South Korea': 'AS', 'India': 'AS', 'Thailand': 'AS',
  'Vietnam': 'AS', 'Singapore': 'AS', 'Malaysia': 'AS', 'Indonesia': 'AS',
  'Philippines': 'AS', 'Taiwan': 'AS', 'Hong Kong': 'AS', 'Macau': 'AS',
  'Cambodia': 'AS', 'Laos': 'AS', 'Myanmar': 'AS', 'Bangladesh': 'AS',
  'Pakistan': 'AS', 'Nepal': 'AS', 'Sri Lanka': 'AS', 'Maldives': 'AS',
  'Bhutan': 'AS', 'Mongolia': 'AS', 'Kazakhstan': 'AS', 'Uzbekistan': 'AS',
  'Turkmenistan': 'AS', 'Kyrgyzstan': 'AS', 'Tajikistan': 'AS',
  'North Korea': 'AS', 'Brunei': 'AS', 'East Timor': 'AS',

  // Middle East
  'United Arab Emirates': 'ME', 'Saudi Arabia': 'ME', 'Qatar': 'ME', 'Kuwait': 'ME',
  'Bahrain': 'ME', 'Oman': 'ME', 'Yemen': 'ME', 'Jordan': 'ME', 'Lebanon': 'ME',
  'Syria': 'ME', 'Iraq': 'ME', 'Iran': 'ME', 'Israel': 'ME', 'Palestine': 'ME',
  'Turkey': 'ME', 'Azerbaijan': 'ME', 'Armenia': 'ME', 'Georgia': 'ME',

  // Africa
  'Egypt': 'AF', 'South Africa': 'AF', 'Kenya': 'AF', 'Nigeria': 'AF', 'Ethiopia': 'AF',
  'Ghana': 'AF', 'Morocco': 'AF', 'Tunisia': 'AF', 'Algeria': 'AF', 'Libya': 'AF',
  'Tanzania': 'AF', 'Uganda': 'AF', 'Rwanda': 'AF', 'Senegal': 'AF',
  'Ivory Coast': 'AF', 'Cameroon': 'AF', 'Zimbabwe': 'AF', 'Zambia': 'AF',
  'Botswana': 'AF', 'Namibia': 'AF', 'Madagascar': 'AF', 'Mauritius': 'AF',
  'Seychelles': 'AF', 'Angola': 'AF', 'Mozambique': 'AF', 'Malawi': 'AF',
  'Sudan': 'AF', 'South Sudan': 'AF', 'Somalia': 'AF', 'Djibouti': 'AF',
  'Eritrea': 'AF', 'Burundi': 'AF', 'Congo (Kinshasa)': 'AF', 'Congo (Brazzaville)': 'AF',

  // Oceania
  'Australia': 'OC', 'New Zealand': 'OC', 'Papua New Guinea': 'OC', 'Fiji': 'OC',
  'Samoa': 'OC', 'Tonga': 'OC', 'Vanuatu': 'OC', 'Solomon Islands': 'OC',
  'New Caledonia': 'OC', 'French Polynesia': 'OC', 'Guam': 'OC', 'Palau': 'OC',
};

// Country to ISO2 code mapping (partial - most common ones)
const COUNTRY_TO_ISO2 = {
  'United States': 'US', 'Canada': 'CA', 'United Kingdom': 'GB', 'France': 'FR',
  'Germany': 'DE', 'Italy': 'IT', 'Spain': 'ES', 'Brazil': 'BR', 'China': 'CN',
  'Japan': 'JP', 'Australia': 'AU', 'India': 'IN', 'Mexico': 'MX', 'Russia': 'RU',
  'South Korea': 'KR', 'Argentina': 'AR', 'Netherlands': 'NL', 'Switzerland': 'CH',
  'Singapore': 'SG', 'Thailand': 'TH', 'Turkey': 'TR', 'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA', 'South Africa': 'ZA', 'Egypt': 'EG', 'Portugal': 'PT',
  'Belgium': 'BE', 'Austria': 'AT', 'Sweden': 'SE', 'Norway': 'NO', 'Denmark': 'DK',
  'Poland': 'PL', 'Greece': 'GR', 'Ireland': 'IE', 'Israel': 'IL', 'New Zealand': 'NZ',
  'Chile': 'CL', 'Colombia': 'CO', 'Peru': 'PE', 'Indonesia': 'ID', 'Malaysia': 'MY',
  'Philippines': 'PH', 'Vietnam': 'VN', 'Czech Republic': 'CZ', 'Romania': 'RO',
  'Finland': 'FI', 'Qatar': 'QA', 'Kuwait': 'KW', 'Nigeria': 'NG', 'Morocco': 'MA',
  'Kenya': 'KE', 'Venezuela': 'VE', 'Ukraine': 'UA', 'Pakistan': 'PK', 'Bangladesh': 'BD',
  'Hong Kong': 'HK', 'Taiwan': 'TW', 'Luxembourg': 'LU', 'Croatia': 'HR', 'Serbia': 'RS',
};

// Country to flag emoji
const COUNTRY_TO_FLAG = {
  'Brazil': '🇧🇷', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Italy': '🇮🇹', 'Spain': '🇪🇸', 'Canada': '🇨🇦', 'China': '🇨🇳',
  'Japan': '🇯🇵', 'Australia': '🇦🇺', 'India': '🇮🇳', 'Mexico': '🇲🇽', 'Russia': '🇷🇺',
  'South Korea': '🇰🇷', 'Argentina': '🇦🇷', 'Netherlands': '🇳🇱', 'Switzerland': '🇨🇭',
  'Singapore': '🇸🇬', 'Thailand': '🇹🇭', 'Turkey': '🇹🇷', 'United Arab Emirates': '🇦🇪',
};

// Major hub airports (popular = true)
const MAJOR_HUBS = new Set([
  'ATL', 'LAX', 'ORD', 'DFW', 'DEN', 'JFK', 'SFO', 'SEA', 'LAS', 'MCO', 'EWR', 'CLT',
  'PHX', 'IAH', 'MIA', 'BOS', 'MSP', 'FLL', 'DTW', 'PHL', 'LGA', 'BWI', 'SLC', 'SAN',
  'DCA', 'MDW', 'TPA', 'PDX', 'STL', 'HNL',
  'LHR', 'CDG', 'AMS', 'FRA', 'MAD', 'BCN', 'LGW', 'MUC', 'FCO', 'DUB', 'ZRH', 'VIE',
  'CPH', 'ARN', 'BRU', 'LIS', 'OSL', 'HEL', 'PRG', 'WAW', 'BUD',
  'GRU', 'EZE', 'BOG', 'LIM', 'SCL', 'GIG', 'BSB', 'SSA', 'FOR', 'CNF',
  'PEK', 'PVG', 'CAN', 'HKG', 'NRT', 'HND', 'ICN', 'SIN', 'BKK', 'KUL', 'CGK', 'DEL',
  'BOM', 'DXB', 'DOH', 'AUH', 'IST', 'CAI', 'JNB', 'SYD', 'MEL', 'BNE', 'AKL',
]);

function parseAirports() {
  console.log('📖 Reading OpenFlights database...\n');

  const data = readFileSync(
    join(__dirname, '..', 'lib', 'data', 'openflights-airports.dat'),
    'utf-8'
  );

  const lines = data.trim().split('\n');
  const airports = [];
  let skipped = 0;

  console.log(`Processing ${lines.length} airports...\n`);

  for (const line of lines) {
    // CSV format: ID,Name,City,Country,IATA,ICAO,Lat,Lon,Alt,Timezone,DST,TZ,Type,Source
    const parts = line.split(',').map(p => p.replace(/^"|"$/g, ''));

    const [id, name, city, country, iata, icao, lat, lon, alt, tz_offset, dst, timezone, type, source] = parts;

    // Skip if no IATA code or not an airport
    if (!iata || iata === '\\N' || iata.length !== 3) {
      skipped++;
      continue;
    }

    // Skip military, closed, or railway stations
    if (type === 'closed' || type === 'railway_station') {
      skipped++;
      continue;
    }

    const continent = COUNTRY_TO_CONTINENT[country] || 'OC';
    const countryCode = COUNTRY_TO_ISO2[country] || 'XX';
    const flag = COUNTRY_TO_FLAG[country] || '🌍';
    const popular = MAJOR_HUBS.has(iata);

    airports.push({
      code: iata,
      icao: icao !== '\\N' ? icao : undefined,
      name: name.replace(/"/g, '\\"'),
      city: city.replace(/"/g, '\\"'),
      country: country.replace(/"/g, '\\"'),
      countryCode,
      continent,
      timezone: timezone !== '\\N' ? timezone : 'UTC',
      coordinates: {
        lat: parseFloat(lat) || 0,
        lon: parseFloat(lon) || 0,
      },
      flag,
      emoji: '✈️',
      popular,
    });
  }

  console.log(`✅ Parsed ${airports.length} airports`);
  console.log(`⏭️  Skipped ${skipped} entries (no IATA code or closed)\n`);

  // Group by continent for organized output
  const byContinent = {
    NA: airports.filter(a => a.continent === 'NA'),
    SA: airports.filter(a => a.continent === 'SA'),
    EU: airports.filter(a => a.continent === 'EU'),
    AS: airports.filter(a => a.continent === 'AS'),
    ME: airports.filter(a => a.continent === 'ME'),
    AF: airports.filter(a => a.continent === 'AF'),
    OC: airports.filter(a => a.continent === 'OC'),
  };

  console.log('📊 Distribution by continent:');
  Object.entries(byContinent).forEach(([cont, airs]) => {
    console.log(`   ${cont}: ${airs.length} airports`);
  });

  return airports;
}

function generateTypeScript(airports) {
  console.log('\n🔄 Generating TypeScript file...\n');

  const header = `/**
 * COMPREHENSIVE GLOBAL AIRPORT DATABASE
 *
 * Complete worldwide airport coverage for Fly2Any platform
 * Total: ${airports.length} airports with IATA codes
 *
 * Features:
 * - IATA & ICAO codes
 * - Coordinates for distance calculations
 * - Timezone information
 * - Country flags & emojis
 * - Popular hub indicators
 *
 * Data Source: OpenFlights Database (https://openflights.org/)
 * Generated: ${new Date().toISOString()}
 *
 * NO EXCEPTIONS - ALL airports with IATA codes included
 */

export type Continent = 'NA' | 'SA' | 'EU' | 'AF' | 'AS' | 'OC' | 'ME';

export interface Airport {
  code: string;           // IATA code (3 letters)
  icao?: string;          // ICAO code (4 letters)
  name: string;           // Full airport name
  city: string;           // City name
  country: string;        // Country name
  countryCode: string;    // ISO 2-letter code
  continent: Continent;   // Continent code
  timezone: string;       // IANA timezone
  coordinates: {
    lat: number;
    lon: number;
  };
  flag: string;           // Country flag emoji
  emoji: string;          // Airport emoji
  popular: boolean;       // Is this a major hub?
  metro?: string;         // Metro area code (optional)
  searchKeywords?: string[]; // Additional search terms (optional)
}

export const AIRPORTS: Airport[] = [
`;

  const airportEntries = airports.map(a => {
    const icao = a.icao ? `icao: '${a.icao}', ` : '';
    return `  { code: '${a.code}', ${icao}name: "${a.name}", city: "${a.city}", country: "${a.country}", countryCode: '${a.countryCode}', continent: '${a.continent}', timezone: '${a.timezone}', coordinates: { lat: ${a.coordinates.lat}, lon: ${a.coordinates.lon} }, flag: '${a.flag}', emoji: '${a.emoji}', popular: ${a.popular} },`;
  }).join('\n');

  const footer = `
];

export default AIRPORTS;

// Quick lookup by IATA code
export const AIRPORTS_BY_CODE = new Map(
  AIRPORTS.map(a => [a.code, a])
);

// Helper function to get airport by code
export function getAirport(code: string): Airport | undefined {
  return AIRPORTS_BY_CODE.get(code.toUpperCase());
}

// Helper function to search airports
export function searchAirports(query: string, limit: number = 50): Airport[] {
  const q = query.toLowerCase();
  return AIRPORTS.filter(a =>
    a.code.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.city.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q)
  ).slice(0, limit);
}
`;

  return header + airportEntries + footer;
}

// Main execution
try {
  const airports = parseAirports();
  const typescript = generateTypeScript(airports);

  const outputPath = join(__dirname, '..', 'lib', 'data', 'airports-all.ts');
  writeFileSync(outputPath, typescript, 'utf-8');

  console.log(`✅ Generated: lib/data/airports-all.ts`);
  console.log(`📦 Total airports: ${airports.length}`);
  console.log(`📊 File size: ${(typescript.length / 1024).toFixed(2)} KB`);

  // Verify specific airports mentioned by user
  const ldb = airports.find(a => a.code === 'LDB');
  const mgf = airports.find(a => a.code === 'MGF');

  console.log('\n✅ Verification:');
  console.log(`   LDB (Londrina): ${ldb ? '✅ Found - ' + ldb.name : '❌ Not found'}`);
  console.log(`   MGF (Maringá): ${mgf ? '✅ Found - ' + mgf.name : '❌ Not found'}`);

  console.log('\n🎉 Success! Comprehensive airport database generated.');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
