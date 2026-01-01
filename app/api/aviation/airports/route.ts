/**
 * Airports Database API - Enhanced with abbreviations + state search
 * GET /api/aviation/airports?q=NYC - Search by abbreviation, city, state, or airport
 * Supports: NYC→New York, Flo/Florida→all FL airports, LAX→LA metro
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { AIRPORTS_COMPLETE, Airport } from '@/lib/data/airports-complete';

export const dynamic = 'force-dynamic';

// Abbreviation map: common nicknames → city/metro/state
const ABBREVIATIONS: Record<string, { type: 'metro' | 'city' | 'state', value: string }> = {
  'nyc': { type: 'metro', value: 'NYC' }, 'new york city': { type: 'metro', value: 'NYC' }, 'big apple': { type: 'metro', value: 'NYC' },
  'la': { type: 'metro', value: 'LAX' }, 'los angeles': { type: 'city', value: 'Los Angeles' },
  'sf': { type: 'city', value: 'San Francisco' }, 'san fran': { type: 'city', value: 'San Francisco' },
  'dc': { type: 'city', value: 'Washington' }, 'washington dc': { type: 'city', value: 'Washington' },
  'chi': { type: 'city', value: 'Chicago' }, 'windy city': { type: 'city', value: 'Chicago' },
  'vegas': { type: 'city', value: 'Las Vegas' }, 'lv': { type: 'city', value: 'Las Vegas' },
  'philly': { type: 'city', value: 'Philadelphia' }, 'phl': { type: 'city', value: 'Philadelphia' },
  'fla': { type: 'state', value: 'Florida' }, 'fl': { type: 'state', value: 'Florida' },
  'ca': { type: 'state', value: 'California' }, 'cal': { type: 'state', value: 'California' }, 'cali': { type: 'state', value: 'California' },
  'tx': { type: 'state', value: 'Texas' }, 'tex': { type: 'state', value: 'Texas' },
  'ny': { type: 'state', value: 'New York' },
  'nj': { type: 'state', value: 'New Jersey' },
  'az': { type: 'state', value: 'Arizona' },
  'nv': { type: 'state', value: 'Nevada' },
  'co': { type: 'state', value: 'Colorado' },
  'wa': { type: 'state', value: 'Washington' },
  'ga': { type: 'state', value: 'Georgia' },
  'il': { type: 'state', value: 'Illinois' },
  'ma': { type: 'state', value: 'Massachusetts' },
  'nc': { type: 'state', value: 'North Carolina' },
  'pa': { type: 'state', value: 'Pennsylvania' },
  'oh': { type: 'state', value: 'Ohio' },
  'mi': { type: 'state', value: 'Michigan' },
};

// Fast in-memory search for airports (uses complete database)
function searchAirportsInMemory(q: string, limit: number = 20): Airport[] {
  const query = q.toLowerCase().trim();
  if (!query) return AIRPORTS_COMPLETE.filter(a => a.popular).slice(0, limit);

  // Check abbreviation first
  const abbr = ABBREVIATIONS[query];
  if (abbr) {
    if (abbr.type === 'metro') return AIRPORTS_COMPLETE.filter(a => a.metro === abbr.value).slice(0, limit);
    if (abbr.type === 'state') return AIRPORTS_COMPLETE.filter(a => a.state === abbr.value).slice(0, limit);
    if (abbr.type === 'city') return AIRPORTS_COMPLETE.filter(a => a.city.toLowerCase() === abbr.value.toLowerCase()).slice(0, limit);
  }

  // Partial state match (e.g., "Flo" → Florida)
  const stateMatch = Object.entries(ABBREVIATIONS).find(([k, v]) => v.type === 'state' && v.value.toLowerCase().startsWith(query));
  if (stateMatch) return AIRPORTS_COMPLETE.filter(a => a.state === stateMatch[1].value).slice(0, limit);

  // Direct matches (prioritized)
  const results: Airport[] = [];
  const seen = new Set<string>();

  // 1. Exact IATA code match
  const exactCode = AIRPORTS_COMPLETE.find(a => a.code.toLowerCase() === query);
  if (exactCode && !seen.has(exactCode.code)) { results.push(exactCode); seen.add(exactCode.code); }

  // 2. Metro area match
  AIRPORTS_COMPLETE.filter(a => a.metro?.toLowerCase() === query).forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // 3. City starts with query
  AIRPORTS_COMPLETE.filter(a => a.city.toLowerCase().startsWith(query)).forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // 4. State starts with query
  AIRPORTS_COMPLETE.filter(a => a.state?.toLowerCase().startsWith(query)).forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // 5. City/Name contains query
  AIRPORTS_COMPLETE.filter(a => a.city.toLowerCase().includes(query) || a.name.toLowerCase().includes(query))
    .forEach(a => { if (!seen.has(a.code)) { results.push(a); seen.add(a.code); } });

  // 6. Search keywords
  AIRPORTS_COMPLETE.filter(a => a.searchKeywords?.some(k => k.toLowerCase().includes(query)))
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
      const airport = AIRPORTS_COMPLETE.find(a => a.code === code.toUpperCase());
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
