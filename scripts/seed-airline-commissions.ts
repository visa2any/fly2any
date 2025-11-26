/**
 * Airline Commission Database Seed Script
 *
 * Seeds the database with commission contracts for 70+ airlines
 * Run with: npx tsx scripts/seed-airline-commissions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Contract validity dates
const CONTRACT_START = new Date('2025-01-01');
const CONTRACT_END = new Date('2025-12-31');
const CONTRACT_END_2026 = new Date('2026-12-31');

// Season dates (MM-DD format)
const LOW_SEASON_DATES = [
  { start: '01-07', end: '03-14' },
  { start: '09-10', end: '11-20' },
];

const HIGH_SEASON_DATES = [
  { start: '06-15', end: '08-31' },
  { start: '12-15', end: '01-06' },
];

// LCC Airlines (Duffel only - no consolidator support)
const LCC_AIRLINES = [
  { code: 'NK', name: 'Spirit Airlines' },
  { code: 'F9', name: 'Frontier Airlines' },
  { code: 'G4', name: 'Allegiant Air' },
  { code: 'WN', name: 'Southwest Airlines' },
  { code: 'B6', name: 'JetBlue Airways' },
  { code: 'VY', name: 'Vueling' },
  { code: 'FR', name: 'Ryanair' },
  { code: 'U2', name: 'easyJet' },
  { code: 'W6', name: 'Wizz Air' },
  { code: 'DY', name: 'Norwegian Air' },
  { code: 'ZB', name: 'Air Albania' },
  { code: 'PC', name: 'Pegasus Airlines' },
  { code: 'XC', name: 'Corendon Airlines' },
];

// Geographic Market definitions
const GEOGRAPHIC_MARKETS = [
  { code: 'WESTERN_EUROPE', name: 'Western Europe', countries: ['GB', 'FR', 'DE', 'ES', 'IT', 'PT', 'NL', 'BE', 'CH', 'AT', 'IE', 'SE', 'DK', 'NO', 'FI'] },
  { code: 'EASTERN_EUROPE', name: 'Eastern Europe', countries: ['PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI', 'RS', 'BA', 'ME', 'MK', 'AL', 'XK', 'UA', 'MD', 'BY'] },
  { code: 'CIS', name: 'Commonwealth of Independent States', countries: ['RU', 'KZ', 'UZ', 'TM', 'KG', 'TJ', 'AZ', 'AM', 'GE'] },
  { code: 'MIDDLE_EAST', name: 'Middle East', countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IL', 'TR', 'IQ', 'IR'] },
  { code: 'AFRICA', name: 'Africa', countries: ['EG', 'MA', 'TN', 'ZA', 'KE', 'NG', 'ET', 'GH', 'TZ', 'UG', 'RW', 'SN', 'CI', 'DZ', 'MU', 'SC'] },
  { code: 'SOUTH_ASIA', name: 'South Asia (Indian Subcontinent)', countries: ['IN', 'PK', 'BD', 'LK', 'NP', 'BT', 'MV'] },
  { code: 'SE_ASIA', name: 'Southeast Asia', countries: ['TH', 'VN', 'SG', 'MY', 'ID', 'PH', 'MM', 'KH', 'LA', 'BN'] },
  { code: 'EAST_ASIA', name: 'East Asia', countries: ['JP', 'KR', 'CN', 'HK', 'TW', 'MO', 'MN'] },
  { code: 'OCEANIA', name: 'Oceania', countries: ['AU', 'NZ', 'FJ', 'PG', 'NC', 'PF', 'WS', 'TO', 'VU'] },
  { code: 'CENTRAL_AMERICA', name: 'Central America', countries: ['MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA'] },
  { code: 'CARIBBEAN', name: 'Caribbean', countries: ['JM', 'HT', 'DO', 'CU', 'PR', 'BS', 'BB', 'TT', 'AW', 'CW', 'SX', 'KY', 'TC'] },
  { code: 'SOUTH_AMERICA', name: 'South America', countries: ['BR', 'AR', 'CL', 'PE', 'CO', 'EC', 'VE', 'BO', 'PY', 'UY', 'SR', 'GY'] },
  { code: 'NORTH_AMERICA', name: 'North America', countries: ['US', 'CA'] },
];

// Universal Exclusions (apply to all airlines)
// Using valid AirlineExclusionType enum values
const EXCLUSIONS: Array<{
  type: 'BASIC_ECONOMY' | 'LIGHT_FARE' | 'GROUP_FARE' | 'NET_FARE' | 'CORPORATE_FARE' | 'MILITARY_FARE' | 'INFANT_FARE' | 'WEB_FARE' | 'PROMO_FARE' | 'NON_REVENUE';
  rule: string | null;
  pattern: string | null;
  desc: string;
  fareFamilies?: string[];
  bookingCodes?: string[];
}> = [
  { type: 'BASIC_ECONOMY', rule: '7th_char_B', pattern: '^.{6}B', desc: 'Basic Economy fare (7th character B in fare basis)', fareFamilies: ['BASIC', 'BE'] },
  { type: 'LIGHT_FARE', rule: 'light_bundle', pattern: 'LIGHT|LT$', desc: 'Light/Basic bundles', fareFamilies: ['LIGHT', 'QP', 'SL'] },
  { type: 'NET_FARE', rule: 'net_fare', pattern: 'NET|IT\\d{2}', desc: 'Net/IT fares (non-commissionable)' },
  { type: 'GROUP_FARE', rule: 'pax_10_plus', pattern: null, desc: 'Group bookings (10+ passengers)' },
  { type: 'INFANT_FARE', rule: 'infant_pax', pattern: null, desc: 'Infant fares (unless specified otherwise)' },
  { type: 'NON_REVENUE', rule: 'award_fare', pattern: 'AWD|FFA|FFP|EMP|ZED|ID', desc: 'Award/mileage redemption and employee fares' },
];

// Helper to determine route type
function getRouteType(code: string): 'ANY' | 'AIRPORT' | 'CITY' | 'COUNTRY' | 'REGION' | 'MARKET' {
  if (code === 'ANY') return 'ANY';
  if (code.length === 3) return 'AIRPORT';
  if (code.length === 2) return 'COUNTRY';
  return 'MARKET';
}

// Main airline contracts data
interface RouteData {
  origin: string;
  dest: string;
  first?: number;
  premium: number;
  economy: number;
  lowSeasonPct?: { first?: number; premium: number; economy: number };
  highSeasonPct?: { first?: number; premium: number; economy: number };
}

interface AirlineContractData {
  code: string;
  name: string;
  alliance: string | null;
  tourCode: string;
  routes: RouteData[];
  ndcAllowed: boolean;
  gdsAllowed: boolean;
  validTo?: Date;
  notes?: string;
}

const AIRLINE_CONTRACTS: AirlineContractData[] = [
  // ===== STAR ALLIANCE PIPP =====
  {
    code: 'LH', name: 'Lufthansa', alliance: 'star_alliance', tourCode: '815ZU',
    routes: [
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 2, economy: 2, lowSeasonPct: { premium: 2, economy: 2 }, highSeasonPct: { premium: 0, economy: 0 } },
      { origin: 'US', dest: 'EASTERN_EUROPE', premium: 5, economy: 5, lowSeasonPct: { premium: 5, economy: 5 }, highSeasonPct: { premium: 3, economy: 3 } },
      { origin: 'US', dest: 'MIDDLE_EAST', premium: 10, economy: 10, lowSeasonPct: { premium: 10, economy: 10 }, highSeasonPct: { premium: 3, economy: 3 } },
      { origin: 'US', dest: 'AFRICA', premium: 10, economy: 10, lowSeasonPct: { premium: 10, economy: 10 }, highSeasonPct: { premium: 3, economy: 3 } },
      { origin: 'US', dest: 'SOUTH_ASIA', premium: 10, economy: 10, lowSeasonPct: { premium: 10, economy: 10 }, highSeasonPct: { premium: 3, economy: 3 } },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'OS', name: 'Austrian Airlines', alliance: 'star_alliance', tourCode: '815ZU',
    routes: [
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 2, economy: 2 },
      { origin: 'US', dest: 'EASTERN_EUROPE', premium: 5, economy: 5 },
      { origin: 'US', dest: 'MIDDLE_EAST', premium: 10, economy: 10 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'LX', name: 'Swiss International Air Lines', alliance: 'star_alliance', tourCode: '815ZU',
    routes: [
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 2, economy: 2 },
      { origin: 'US', dest: 'EASTERN_EUROPE', premium: 5, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'SN', name: 'Brussels Airlines', alliance: 'star_alliance', tourCode: '815ZU',
    routes: [
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 2, economy: 2 },
      { origin: 'US', dest: 'AFRICA', premium: 10, economy: 10 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== UNITED AIRLINES =====
  {
    code: 'UA', name: 'United Airlines', alliance: 'star_alliance', tourCode: '264HW',
    routes: [
      { origin: 'US', dest: 'JP', premium: 5, economy: 5 },
      { origin: 'US', dest: 'SE_ASIA', premium: 5, economy: 5 },
      { origin: 'US', dest: 'KR', premium: 5, economy: 5 },
      { origin: 'US', dest: 'CN', premium: 5, economy: 5 },
      { origin: 'US', dest: 'AU', premium: 8, economy: 5 },
      { origin: 'US', dest: 'NZ', premium: 8, economy: 5 },
      { origin: 'US', dest: 'CARIBBEAN', premium: 5, economy: 3 },
      { origin: 'US', dest: 'CENTRAL_AMERICA', premium: 5, economy: 3 },
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== AIR CANADA =====
  {
    code: 'AC', name: 'Air Canada', alliance: 'star_alliance', tourCode: 'ACUSA',
    routes: [
      { origin: 'US', dest: 'CA', premium: 5, economy: 3 },
      { origin: 'CA', dest: 'CA', premium: 5, economy: 3 },
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 5, economy: 3 },
      { origin: 'US', dest: 'EAST_ASIA', premium: 5, economy: 3 },
      { origin: 'US', dest: 'OCEANIA', premium: 5, economy: 3 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== SKYTEAM JV (DL/AF/KL/VS) =====
  {
    code: 'DL', name: 'Delta Air Lines', alliance: 'skyteam', tourCode: 'LC16',
    routes: [
      { origin: 'US', dest: 'AFRICA', premium: 5, economy: 8, lowSeasonPct: { premium: 5, economy: 8 }, highSeasonPct: { premium: 5, economy: 5 } },
      { origin: 'US', dest: 'MIDDLE_EAST', premium: 5, economy: 8 },
      { origin: 'US', dest: 'SOUTH_ASIA', premium: 5, economy: 8 },
      { origin: 'US', dest: 'SE_ASIA', premium: 5, economy: 8 },
      { origin: 'US', dest: 'MX', premium: 3, economy: 2 },
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 8, economy: 5 },
      { origin: 'US', dest: 'JP', premium: 5, economy: 3 },
      { origin: 'US', dest: 'KR', premium: 5, economy: 3 },
    ],
    ndcAllowed: false, gdsAllowed: true
  },
  {
    code: 'AF', name: 'Air France', alliance: 'skyteam', tourCode: 'LC16',
    routes: [
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 2, economy: 2 },
      { origin: 'US', dest: 'EASTERN_EUROPE', premium: 5, economy: 5 },
      { origin: 'US', dest: 'AFRICA', premium: 8, economy: 8 },
      { origin: 'US', dest: 'SOUTH_ASIA', premium: 8, economy: 8 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'KL', name: 'KLM Royal Dutch Airlines', alliance: 'skyteam', tourCode: 'LC16',
    routes: [
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 2, economy: 2 },
      { origin: 'US', dest: 'EASTERN_EUROPE', premium: 5, economy: 5 },
      { origin: 'US', dest: 'AFRICA', premium: 8, economy: 8 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'VS', name: 'Virgin Atlantic', alliance: 'skyteam', tourCode: 'LC16',
    routes: [
      { origin: 'US', dest: 'GB', premium: 2, economy: 2 },
      { origin: 'US', dest: 'SOUTH_ASIA', premium: 8, economy: 8 },
    ],
    ndcAllowed: false, gdsAllowed: true
  },

  // ===== ONEWORLD =====
  {
    code: 'AA', name: 'American Airlines', alliance: 'oneworld', tourCode: 'AA2024',
    routes: [
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 10, economy: 5 },
      { origin: 'US', dest: 'CARIBBEAN', premium: 8, economy: 5 },
      { origin: 'US', dest: 'CENTRAL_AMERICA', premium: 8, economy: 5 },
      { origin: 'US', dest: 'OCEANIA', premium: 8, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 2 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'BA', name: 'British Airways', alliance: 'oneworld', tourCode: 'BACONS',
    routes: [
      { origin: 'US', dest: 'GB', premium: 8, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 3 },
      { origin: 'US', dest: 'AFRICA', premium: 10, economy: 8 },
      { origin: 'US', dest: 'SOUTH_ASIA', premium: 10, economy: 8 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'IB', name: 'Iberia', alliance: 'oneworld', tourCode: 'IBCONS',
    routes: [
      { origin: 'US', dest: 'ES', premium: 8, economy: 5 },
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 10, economy: 8 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'QR', name: 'Qatar Airways', alliance: 'oneworld', tourCode: 'QR2024',
    routes: [
      { origin: 'US', dest: 'MIDDLE_EAST', premium: 10, economy: 5 },
      { origin: 'US', dest: 'SOUTH_ASIA', premium: 10, economy: 8 },
      { origin: 'US', dest: 'SE_ASIA', premium: 10, economy: 8 },
      { origin: 'US', dest: 'AFRICA', premium: 10, economy: 8 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'CX', name: 'Cathay Pacific', alliance: 'oneworld', tourCode: 'TAM888FF500',
    routes: [
      { origin: 'US', dest: 'HK', first: 10, premium: 8, economy: 3 },
      { origin: 'US', dest: 'EAST_ASIA', first: 10, premium: 8, economy: 3 },
      { origin: 'US', dest: 'SE_ASIA', first: 10, premium: 8, economy: 3 },
      { origin: 'US', dest: 'OCEANIA', first: 10, premium: 8, economy: 3 },
    ],
    ndcAllowed: true, gdsAllowed: true, validTo: CONTRACT_END_2026
  },
  {
    code: 'JL', name: 'Japan Airlines', alliance: 'oneworld', tourCode: 'PROWY',
    routes: [
      { origin: 'US', dest: 'JP', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'EAST_ASIA', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'SOUTH_ASIA', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: false, gdsAllowed: true
  },
  {
    code: 'QF', name: 'Qantas', alliance: 'oneworld', tourCode: 'QFCONS',
    routes: [
      { origin: 'US', dest: 'AU', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'NZ', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'AY', name: 'Finnair', alliance: 'oneworld', tourCode: 'AYCONS',
    routes: [
      { origin: 'US', dest: 'FI', premium: 8, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 3 },
      { origin: 'US', dest: 'EAST_ASIA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'EI', name: 'Aer Lingus', alliance: 'oneworld', tourCode: 'EICONS',
    routes: [
      { origin: 'US', dest: 'IE', premium: 8, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 3 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'RJ', name: 'Royal Jordanian', alliance: 'oneworld', tourCode: 'RJCONS',
    routes: [
      { origin: 'US', dest: 'JO', premium: 5, economy: 5 },
      { origin: 'US', dest: 'MIDDLE_EAST', premium: 5, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== ASIAN CARRIERS =====
  {
    code: 'BR', name: 'EVA Air', alliance: 'star_alliance', tourCode: 'BRCONS',
    routes: [
      { origin: 'US', dest: 'TW', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'EAST_ASIA', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'SE_ASIA', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'CA', name: 'Air China', alliance: 'star_alliance', tourCode: 'US4ZZ11',
    routes: [
      { origin: 'JFK', dest: 'CN', first: 10, premium: 8, economy: 5 },
      { origin: 'IAD', dest: 'CN', first: 10, premium: 8, economy: 5 },
      { origin: 'LAX', dest: 'CN', first: 10, premium: 8, economy: 5 },
      { origin: 'SFO', dest: 'CN', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: false, gdsAllowed: true
  },
  {
    code: 'MU', name: 'China Eastern', alliance: 'skyteam', tourCode: 'MUCONS',
    routes: [
      { origin: 'US', dest: 'CN', premium: 8, economy: 5 },
      { origin: 'US', dest: 'EAST_ASIA', premium: 8, economy: 5 },
    ],
    ndcAllowed: false, gdsAllowed: true
  },
  {
    code: 'CZ', name: 'China Southern', alliance: 'skyteam', tourCode: 'CZCONS',
    routes: [
      { origin: 'US', dest: 'CN', premium: 10, economy: 5 },
      { origin: 'US', dest: 'OCEANIA', premium: 10, economy: 5 },
    ],
    ndcAllowed: false, gdsAllowed: true
  },
  {
    code: 'CI', name: 'China Airlines', alliance: 'skyteam', tourCode: 'CICONS',
    routes: [
      { origin: 'US', dest: 'TW', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'EAST_ASIA', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'OZ', name: 'Asiana Airlines', alliance: 'star_alliance', tourCode: 'OZCONS',
    routes: [
      { origin: 'US', dest: 'KR', premium: 8, economy: 5 },
      { origin: 'US', dest: 'EAST_ASIA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'PR', name: 'Philippine Airlines', alliance: null, tourCode: 'PRCONS',
    routes: [
      { origin: 'US', dest: 'PH', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'SE_ASIA', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'JX', name: 'STARLUX Airlines', alliance: null, tourCode: 'JX189',
    routes: [
      { origin: 'LAX', dest: 'TW', first: 10, premium: 8, economy: 5 },
      { origin: 'SFO', dest: 'TW', first: 10, premium: 8, economy: 5 },
      { origin: 'SEA', dest: 'TW', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'EAST_ASIA', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true, validTo: CONTRACT_END_2026
  },
  {
    code: 'HU', name: 'Hainan Airlines', alliance: null, tourCode: 'CCA1HUIS51402',
    routes: [
      { origin: 'BOS', dest: 'CN', premium: 10, economy: 5 },
      { origin: 'SEA', dest: 'CN', premium: 10, economy: 5 },
      { origin: 'TIJ', dest: 'CN', premium: 10, economy: 5 },
    ],
    ndcAllowed: false, gdsAllowed: true
  },

  // ===== LATIN AMERICA =====
  {
    code: 'LA', name: 'LATAM Airlines', alliance: null, tourCode: 'LACONS',
    routes: [
      { origin: 'MIA', dest: 'BR', premium: 8, economy: 5 },
      { origin: 'JFK', dest: 'BR', premium: 8, economy: 5 },
      { origin: 'US', dest: 'CL', premium: 8, economy: 5 },
      { origin: 'US', dest: 'PE', premium: 8, economy: 5 },
      { origin: 'US', dest: 'CO', premium: 8, economy: 5 },
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'CM', name: 'Copa Airlines', alliance: 'star_alliance', tourCode: 'CM230',
    routes: [
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 8, economy: 5 },
      { origin: 'US', dest: 'CENTRAL_AMERICA', premium: 8, economy: 5 },
      { origin: 'US', dest: 'PA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'AV', name: 'Avianca', alliance: 'star_alliance', tourCode: 'AVCONS',
    routes: [
      { origin: 'US', dest: 'CO', premium: 10, economy: 7 },
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 10, economy: 7 },
      { origin: 'US', dest: 'CENTRAL_AMERICA', premium: 10, economy: 7 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'AM', name: 'Aeromexico', alliance: 'skyteam', tourCode: 'AMCONS',
    routes: [
      { origin: 'US', dest: 'MX', premium: 10, economy: 5 },
      { origin: 'US', dest: 'CENTRAL_AMERICA', premium: 8, economy: 5 },
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'AR', name: 'Aerolineas Argentinas', alliance: 'skyteam', tourCode: 'ARCONS',
    routes: [
      { origin: 'US', dest: 'AR', premium: 10, economy: 5 },
      { origin: 'US', dest: 'SOUTH_AMERICA', premium: 10, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'G3', name: 'GOL Linhas Aereas', alliance: null, tourCode: 'G3CONS',
    routes: [
      { origin: 'MIA', dest: 'BR', premium: 5, economy: 5 },
      { origin: 'MCO', dest: 'BR', premium: 5, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'AD', name: 'Azul Brazilian Airlines', alliance: null, tourCode: 'ADCONS',
    routes: [
      { origin: 'US', dest: 'BR', premium: 10, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== AFRICA =====
  {
    code: 'ET', name: 'Ethiopian Airlines', alliance: 'star_alliance', tourCode: 'ETCONS',
    routes: [
      { origin: 'US', dest: 'AFRICA', premium: 5, economy: 5 },
      { origin: 'US', dest: 'MIDDLE_EAST', premium: 5, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'KQ', name: 'Kenya Airways', alliance: null, tourCode: 'KQCON007',
    routes: [
      { origin: 'JFK', dest: 'KE', premium: 10, economy: 5, lowSeasonPct: { premium: 10, economy: 5 }, highSeasonPct: { premium: 8, economy: 5 } },
      { origin: 'JFK', dest: 'AFRICA', premium: 10, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'SA', name: 'South African Airways', alliance: 'star_alliance', tourCode: 'SACONS',
    routes: [
      { origin: 'US', dest: 'ZA', premium: 8, economy: 5 },
      { origin: 'US', dest: 'AFRICA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'AT', name: 'Royal Air Maroc', alliance: null, tourCode: 'ATCONS',
    routes: [
      { origin: 'US', dest: 'MA', premium: 10, economy: 5 },
      { origin: 'US', dest: 'AFRICA', premium: 10, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'MS', name: 'EgyptAir', alliance: 'star_alliance', tourCode: 'MSCONS',
    routes: [
      { origin: 'JFK', dest: 'EG', premium: 8, economy: 5 },
      { origin: 'IAD', dest: 'EG', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== MIDDLE EAST =====
  {
    code: 'TK', name: 'Turkish Airlines', alliance: 'star_alliance', tourCode: 'TKCONS',
    routes: [
      { origin: 'US', dest: 'TR', premium: 10, economy: 5 },
      { origin: 'US', dest: 'MIDDLE_EAST', premium: 10, economy: 5 },
      { origin: 'US', dest: 'EAST_ASIA', premium: 10, economy: 5 },
      { origin: 'US', dest: 'AFRICA', premium: 10, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'GF', name: 'Gulf Air', alliance: null, tourCode: 'GFCONS',
    routes: [
      { origin: 'JFK', dest: 'BH', premium: 8, economy: 5 },
      { origin: 'JFK', dest: 'MIDDLE_EAST', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'SV', name: 'Saudi Arabian Airlines', alliance: 'skyteam', tourCode: 'SVUFUSCA25',
    routes: [
      { origin: 'JFK', dest: 'SA', first: 10, premium: 8, economy: 5 },
      { origin: 'IAD', dest: 'SA', first: 10, premium: 8, economy: 5 },
      { origin: 'LAX', dest: 'SA', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'LY', name: 'El Al Israel', alliance: null, tourCode: 'LYCONS',
    routes: [
      { origin: 'US', dest: 'IL', premium: 10, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== EUROPE =====
  {
    code: 'AZ', name: 'ITA Airways', alliance: 'skyteam', tourCode: 'CSL25',
    routes: [
      { origin: 'US', dest: 'IT', premium: 8, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 3 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'LO', name: 'LOT Polish Airlines', alliance: 'star_alliance', tourCode: 'LO080',
    routes: [
      { origin: 'US', dest: 'PL', premium: 8, economy: 5 },
      { origin: 'US', dest: 'EASTERN_EUROPE', premium: 8, economy: 5 },
      { origin: 'US', dest: 'EAST_ASIA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'TP', name: 'TAP Air Portugal', alliance: 'star_alliance', tourCode: 'TPCONS',
    routes: [
      { origin: 'US', dest: 'PT', premium: 5, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 5 },
      { origin: 'US', dest: 'AFRICA', premium: 5, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'SK', name: 'SAS Scandinavian', alliance: 'star_alliance', tourCode: 'SKCONS',
    routes: [
      { origin: 'US', dest: 'SE', premium: 8, economy: 5 },
      { origin: 'US', dest: 'DK', premium: 8, economy: 5 },
      { origin: 'US', dest: 'NO', premium: 8, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 3 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'FI', name: 'Icelandair', alliance: null, tourCode: 'FICONS',
    routes: [
      { origin: 'US', dest: 'IS', premium: 8, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 3 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'DE', name: 'Condor', alliance: null, tourCode: 'DECONS',
    routes: [
      { origin: 'US', dest: 'DE', premium: 8, economy: 5 },
      { origin: 'US', dest: 'WESTERN_EUROPE', premium: 5, economy: 3 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'BF', name: 'French Bee', alliance: null, tourCode: 'BFCONS',
    routes: [
      { origin: 'US', dest: 'FR', premium: 8, economy: 5 },
      { origin: 'US', dest: 'PF', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== OCEANIA =====
  {
    code: 'NZ', name: 'Air New Zealand', alliance: 'star_alliance', tourCode: 'NZCONS',
    routes: [
      { origin: 'US', dest: 'NZ', first: 10, premium: 8, economy: 5 },
      { origin: 'US', dest: 'OCEANIA', first: 10, premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'FJ', name: 'Fiji Airways', alliance: null, tourCode: 'FJCONS',
    routes: [
      { origin: 'US', dest: 'FJ', premium: 8, economy: 5 },
      { origin: 'US', dest: 'OCEANIA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'TN', name: 'Air Tahiti Nui', alliance: null, tourCode: 'TNCONS',
    routes: [
      { origin: 'US', dest: 'PF', premium: 8, economy: 5 },
      { origin: 'US', dest: 'FR', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== CANADA =====
  {
    code: 'WS', name: 'WestJet', alliance: null, tourCode: 'WS838',
    routes: [
      { origin: 'CA', dest: 'CA', premium: 5, economy: 4 },
      { origin: 'US', dest: 'CA', premium: 5, economy: 4 },
      { origin: 'US', dest: 'CARIBBEAN', premium: 5, economy: 4 },
      { origin: 'US', dest: 'MX', premium: 5, economy: 4 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== CARIBBEAN =====
  {
    code: 'BW', name: 'Caribbean Airlines', alliance: null, tourCode: 'BWCONS',
    routes: [
      { origin: 'JFK', dest: 'TT', premium: 5, economy: 5 },
      { origin: 'MIA', dest: 'TT', premium: 5, economy: 5 },
      { origin: 'US', dest: 'CARIBBEAN', premium: 5, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'DM', name: 'Arajet', alliance: null, tourCode: 'DMCONS',
    routes: [
      { origin: 'US', dest: 'DO', premium: 5, economy: 5 },
      { origin: 'US', dest: 'CARIBBEAN', premium: 5, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },

  // ===== REGIONAL/SPECIALTY =====
  {
    code: 'AS', name: 'Alaska Airlines', alliance: 'oneworld', tourCode: 'ASCONS',
    routes: [
      { origin: 'US', dest: 'MX', premium: 8, economy: 5 },
      { origin: 'US', dest: 'CENTRAL_AMERICA', premium: 8, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
  {
    code: 'UL', name: 'SriLankan Airlines', alliance: null, tourCode: 'ULCONS',
    routes: [
      { origin: 'US', dest: 'LK', premium: 5, economy: 5 },
      { origin: 'US', dest: 'SOUTH_ASIA', premium: 5, economy: 5 },
    ],
    ndcAllowed: true, gdsAllowed: true
  },
];

async function main() {
  console.log('Starting airline commission seed...\n');

  // 1. Clear existing data
  console.log('Clearing existing data...');
  await prisma.routingDecision.deleteMany();
  await prisma.airlineCommissionFareClass.deleteMany();
  await prisma.airlineCommissionExclusion.deleteMany();
  await prisma.airlineCommissionRoute.deleteMany();
  await prisma.airlineContract.deleteMany();
  await prisma.lCCAirline.deleteMany();
  await prisma.geographicMarket.deleteMany();
  console.log('   Cleared\n');

  // 2. Seed Geographic Markets
  console.log('Seeding geographic markets...');
  for (const market of GEOGRAPHIC_MARKETS) {
    await prisma.geographicMarket.create({
      data: {
        marketCode: market.code,
        marketName: market.name,
        countryCodes: market.countries,
        regions: [],
      }
    });
  }
  console.log(`   ${GEOGRAPHIC_MARKETS.length} markets created\n`);

  // 3. Seed LCC Airlines
  console.log('Seeding LCC airlines (Duffel-only)...');
  for (const lcc of LCC_AIRLINES) {
    await prisma.lCCAirline.create({
      data: {
        airlineCode: lcc.code,
        airlineName: lcc.name,
        isActive: true,
      }
    });
  }
  console.log(`   ${LCC_AIRLINES.length} LCC airlines created\n`);

  // 4. Seed Universal Exclusions
  console.log('Seeding commission exclusions...');
  for (const excl of EXCLUSIONS) {
    await prisma.airlineCommissionExclusion.create({
      data: {
        airlineCode: null, // Universal
        exclusionType: excl.type,
        description: excl.desc,
        fareBasisRule: excl.rule,
        fareBasisPattern: excl.pattern,
        excludedBookingCodes: excl.bookingCodes || [],
        excludedFareFamilies: excl.fareFamilies || [],
        isActive: true,
      }
    });
  }
  console.log(`   ${EXCLUSIONS.length} exclusions created\n`);

  // 5. Seed Airline Contracts
  console.log('Seeding airline contracts...');
  let contractCount = 0;
  let routeCount = 0;
  let fareClassCount = 0;

  for (const airline of AIRLINE_CONTRACTS) {
    const contract = await prisma.airlineContract.create({
      data: {
        airlineCode: airline.code,
        airlineName: airline.name,
        allianceCode: airline.alliance,
        tourCode: airline.tourCode,
        validFrom: CONTRACT_START,
        validTo: airline.validTo || CONTRACT_END,
        isActive: true,
        gdsAllowed: airline.gdsAllowed ?? true,
        ndcAllowed: airline.ndcAllowed ?? true,
        ndcDirectAllowed: false,
        notes: airline.notes || null,
      }
    });
    contractCount++;

    // Create routes
    for (const route of airline.routes) {
      const originType = getRouteType(route.origin);
      const destType = getRouteType(route.dest);

      const commRoute = await prisma.airlineCommissionRoute.create({
        data: {
          contractId: contract.id,
          originType: originType,
          originCodes: [route.origin],
          destinationType: destType,
          destinationCodes: [route.dest],
          bidirectional: true,
          priority: originType === 'ANY' ? 1 : (originType === 'AIRPORT' ? 10 : 5),
        }
      });
      routeCount++;

      // Create fare classes
      const fareClasses: Array<{
        routeId: string;
        cabinClass: 'FIRST' | 'BUSINESS' | 'PREMIUM_ECONOMY' | 'ECONOMY';
        bookingCodes: string[];
        defaultPct: number;
        lowSeasonPct?: number;
        highSeasonPct?: number;
        lowSeasonDates?: object;
        highSeasonDates?: object;
      }> = [];

      // First class (if available)
      if (route.first !== undefined) {
        fareClasses.push({
          routeId: commRoute.id,
          cabinClass: 'FIRST',
          bookingCodes: ['F', 'A'],
          defaultPct: route.first,
          lowSeasonPct: route.lowSeasonPct?.first ?? route.first,
          highSeasonPct: route.highSeasonPct?.first ?? route.first,
          lowSeasonDates: LOW_SEASON_DATES,
          highSeasonDates: HIGH_SEASON_DATES,
        });
      }

      // Business class
      fareClasses.push({
        routeId: commRoute.id,
        cabinClass: 'BUSINESS',
        bookingCodes: ['J', 'C', 'D', 'Z', 'P'],
        defaultPct: route.premium,
        lowSeasonPct: route.lowSeasonPct?.premium ?? route.premium,
        highSeasonPct: route.highSeasonPct?.premium ?? route.premium,
        lowSeasonDates: LOW_SEASON_DATES,
        highSeasonDates: HIGH_SEASON_DATES,
      });

      // Economy class
      fareClasses.push({
        routeId: commRoute.id,
        cabinClass: 'ECONOMY',
        bookingCodes: ['Y', 'B', 'M', 'H', 'K', 'L', 'Q', 'V', 'S', 'N', 'T', 'W', 'E', 'G', 'R', 'U', 'O'],
        defaultPct: route.economy,
        lowSeasonPct: route.lowSeasonPct?.economy ?? route.economy,
        highSeasonPct: route.highSeasonPct?.economy ?? route.economy,
        lowSeasonDates: LOW_SEASON_DATES,
        highSeasonDates: HIGH_SEASON_DATES,
      });

      for (const fc of fareClasses) {
        await prisma.airlineCommissionFareClass.create({ data: fc });
        fareClassCount++;
      }
    }
  }
  console.log(`   ${contractCount} contracts created`);
  console.log(`   ${routeCount} routes created`);
  console.log(`   ${fareClassCount} fare classes created\n`);

  // Summary
  console.log('===============================================');
  console.log('SEED COMPLETE');
  console.log('===============================================');
  console.log(`   Geographic Markets: ${GEOGRAPHIC_MARKETS.length}`);
  console.log(`   LCC Airlines: ${LCC_AIRLINES.length}`);
  console.log(`   Exclusions: ${EXCLUSIONS.length}`);
  console.log(`   Airline Contracts: ${contractCount}`);
  console.log(`   Commission Routes: ${routeCount}`);
  console.log(`   Fare Classes: ${fareClassCount}`);
  console.log('===============================================\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
