/**
 * Airports Database API - Enhanced with abbreviations + state search
 * GET /api/aviation/airports?q=NYC - Search by abbreviation, city, state, or airport
 * Supports: NYC→New York, Flo/Florida→all FL airports, LAX→LA metro
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { AIRPORTS, Airport } from '@/lib/data/airports-complete';

export const dynamic = 'force-dynamic';

// Abbreviation map: common nicknames → city/metro/state
const ABBREVIATIONS: Record<string, { type: 'metro' | 'city' | 'state', value: string }> = {
  // Metro areas
  'nyc': { type: 'metro', value: 'NYC' }, 'new york city': { type: 'metro', value: 'NYC' }, 'big apple': { type: 'metro', value: 'NYC' },
  'la': { type: 'metro', value: 'LAX' }, 'los angeles': { type: 'city', value: 'Los Angeles' },
  'sf': { type: 'city', value: 'San Francisco' }, 'san fran': { type: 'city', value: 'San Francisco' }, 'bay area': { type: 'city', value: 'San Francisco' },
  'dc': { type: 'city', value: 'Washington' }, 'washington dc': { type: 'city', value: 'Washington' }, 'd.c.': { type: 'city', value: 'Washington' },
  'chi': { type: 'city', value: 'Chicago' }, 'windy city': { type: 'city', value: 'Chicago' },
  'vegas': { type: 'city', value: 'Las Vegas' }, 'lv': { type: 'city', value: 'Las Vegas' }, 'sin city': { type: 'city', value: 'Las Vegas' },
  'philly': { type: 'city', value: 'Philadelphia' }, 'phl': { type: 'city', value: 'Philadelphia' },
  'atl': { type: 'city', value: 'Atlanta' }, 'hotlanta': { type: 'city', value: 'Atlanta' },
  'bos': { type: 'city', value: 'Boston' },
  'mia': { type: 'city', value: 'Miami' },
  'dfw': { type: 'city', value: 'Dallas' }, 'dallas': { type: 'city', value: 'Dallas' },
  'hou': { type: 'city', value: 'Houston' }, 'houston': { type: 'city', value: 'Houston' },
  'sea': { type: 'city', value: 'Seattle' },
  'det': { type: 'city', value: 'Detroit' }, 'motor city': { type: 'city', value: 'Detroit' },
  'den': { type: 'city', value: 'Denver' }, 'mile high': { type: 'city', value: 'Denver' },
  'phx': { type: 'city', value: 'Phoenix' },
  'msp': { type: 'city', value: 'Minneapolis' }, 'twin cities': { type: 'city', value: 'Minneapolis' },

  // ALL 50 US STATE CODES + common variations
  'al': { type: 'state', value: 'Alabama' }, 'bama': { type: 'state', value: 'Alabama' },
  'ak': { type: 'state', value: 'Alaska' },
  'az': { type: 'state', value: 'Arizona' }, 'ariz': { type: 'state', value: 'Arizona' },
  'ar': { type: 'state', value: 'Arkansas' },
  'ca': { type: 'state', value: 'California' }, 'cal': { type: 'state', value: 'California' }, 'cali': { type: 'state', value: 'California' }, 'calif': { type: 'state', value: 'California' },
  'co': { type: 'state', value: 'Colorado' }, 'colo': { type: 'state', value: 'Colorado' },
  'ct': { type: 'state', value: 'Connecticut' }, 'conn': { type: 'state', value: 'Connecticut' },
  'de': { type: 'state', value: 'Delaware' }, 'del': { type: 'state', value: 'Delaware' },
  'fl': { type: 'state', value: 'Florida' }, 'fla': { type: 'state', value: 'Florida' },
  'ga': { type: 'state', value: 'Georgia' },
  'hi': { type: 'state', value: 'Hawaii' },
  'id': { type: 'state', value: 'Idaho' },
  'il': { type: 'state', value: 'Illinois' },
  'in': { type: 'state', value: 'Indiana' }, 'ind': { type: 'state', value: 'Indiana' },
  'ia': { type: 'state', value: 'Iowa' },
  'ks': { type: 'state', value: 'Kansas' }, 'kan': { type: 'state', value: 'Kansas' },
  'ky': { type: 'state', value: 'Kentucky' },
  'la': { type: 'state', value: 'Louisiana' }, // Note: 'la' is overridden by LA metro
  'me': { type: 'state', value: 'Maine' },
  'md': { type: 'state', value: 'Maryland' },
  'ma': { type: 'state', value: 'Massachusetts' }, 'mass': { type: 'state', value: 'Massachusetts' },
  'mi': { type: 'state', value: 'Michigan' }, 'mich': { type: 'state', value: 'Michigan' },
  'mn': { type: 'state', value: 'Minnesota' }, 'minn': { type: 'state', value: 'Minnesota' },
  'ms': { type: 'state', value: 'Mississippi' }, 'miss': { type: 'state', value: 'Mississippi' },
  'mo': { type: 'state', value: 'Missouri' },
  'mt': { type: 'state', value: 'Montana' }, 'mont': { type: 'state', value: 'Montana' },
  'ne': { type: 'state', value: 'Nebraska' }, 'neb': { type: 'state', value: 'Nebraska' },
  'nv': { type: 'state', value: 'Nevada' }, 'nev': { type: 'state', value: 'Nevada' },
  'nh': { type: 'state', value: 'New Hampshire' },
  'nj': { type: 'state', value: 'New Jersey' }, 'jersey': { type: 'state', value: 'New Jersey' },
  'nm': { type: 'state', value: 'New Mexico' },
  'ny': { type: 'state', value: 'New York' },
  'nc': { type: 'state', value: 'North Carolina' },
  'nd': { type: 'state', value: 'North Dakota' },
  'oh': { type: 'state', value: 'Ohio' },
  'ok': { type: 'state', value: 'Oklahoma' }, 'okla': { type: 'state', value: 'Oklahoma' },
  'or': { type: 'state', value: 'Oregon' }, 'ore': { type: 'state', value: 'Oregon' },
  'pa': { type: 'state', value: 'Pennsylvania' }, 'penn': { type: 'state', value: 'Pennsylvania' },
  'ri': { type: 'state', value: 'Rhode Island' },
  'sc': { type: 'state', value: 'South Carolina' },
  'sd': { type: 'state', value: 'South Dakota' },
  'tn': { type: 'state', value: 'Tennessee' }, 'tenn': { type: 'state', value: 'Tennessee' },
  'tx': { type: 'state', value: 'Texas' }, 'tex': { type: 'state', value: 'Texas' },
  'ut': { type: 'state', value: 'Utah' },
  'vt': { type: 'state', value: 'Vermont' },
  'va': { type: 'state', value: 'Virginia' },
  'wa': { type: 'state', value: 'Washington' }, 'wash': { type: 'state', value: 'Washington' },
  'wv': { type: 'state', value: 'West Virginia' },
  'wi': { type: 'state', value: 'Wisconsin' }, 'wis': { type: 'state', value: 'Wisconsin' }, 'wisc': { type: 'state', value: 'Wisconsin' },
  'wy': { type: 'state', value: 'Wyoming' }, 'wyo': { type: 'state', value: 'Wyoming' },
};

// Fast in-memory search for airports (uses complete database)
function searchAirportsInMemory(q: string, limit: number = 20): Airport[] {
  const query = q.toLowerCase().trim();
  if (!query) return AIRPORTS.filter(a => a.popular).slice(0, limit);

  // Check abbreviation first
  const abbr = ABBREVIATIONS[query];
  if (abbr) {
    if (abbr.type === 'metro') return AIRPORTS.filter(a => a.metro === abbr.value).slice(0, limit);
    if (abbr.type === 'state') return AIRPORTS.filter(a => a.state === abbr.value).slice(0, limit);
    if (abbr.type === 'city') return AIRPORTS.filter(a => a.city.toLowerCase() === abbr.value.toLowerCase()).slice(0, limit);
  }

  // Partial state match (e.g., "Flo" → Florida)
  const stateMatch = Object.entries(ABBREVIATIONS).find(([k, v]) => v.type === 'state' && v.value.toLowerCase().startsWith(query));
  if (stateMatch) return AIRPORTS.filter(a => a.state === stateMatch[1].value).slice(0, limit);

  // Direct matches (prioritized)
  const results: Airport[] = [];
  const seen = new Set<string>();

  // 1. Exact IATA code match
  const exactCode = AIRPORTS.find(a => a.code.toLowerCase() === query);
  if (exactCode && !seen.has(exactCode.code)) { results.push(exactCode); seen.add(exactCode.code); }

  // 2. Metro area match
  AIRPORTS.filter(a => a.metro?.toLowerCase() === query).forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // 3. City starts with query
  AIRPORTS.filter(a => a.city.toLowerCase().startsWith(query)).forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // 4. State starts with query
  AIRPORTS.filter(a => a.state?.toLowerCase().startsWith(query)).forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // 5. City/Name contains query
  AIRPORTS.filter(a => a.city.toLowerCase().includes(query) || a.name.toLowerCase().includes(query))
    .forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // 6. Search keywords
  AIRPORTS.filter(a => a.searchKeywords?.some(k => k.toLowerCase().includes(query)))
    .forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // Sort: popular first, then alphabetical
  return results.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || a.city.localeCompare(b.city)).slice(0, limit);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Single airport lookup by code
    if (code) {
      const airport = AIRPORTS.find(a => a.code === code.toUpperCase());
      if (!airport) return NextResponse.json({ error: 'Airport not found' }, { status: 404 });
      return NextResponse.json({ success: true, airport });
    }

    // Search with abbreviation support
    const airports = searchAirportsInMemory(query || '', limit);

    return NextResponse.json({
      success: true,
      airports,
      count: airports.length,
      source: 'memory', // Fast in-memory search
    }, {
      headers: { 'Cache-Control': 'public, max-age=3600' } // Cache for 1 hour
    });
  } catch (error: any) {
    console.error('Airports API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
