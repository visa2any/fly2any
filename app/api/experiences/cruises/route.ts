import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { handleApiError } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Cruises & Boat Tours API
 * Filters cruise/boat experiences from Amadeus Activities API
 */

// Clean text from API - fix HTML entities, special chars, encoding issues
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/')
    .replace(/\\u[\dA-Fa-f]{4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)))
    .replace(/([a-zA-Z])0([a-zA-Z])/g, '$1o$2')
    .replace(/([a-zA-Z])1([a-zA-Z])/g, '$1i$2')
    .replace(/([a-zA-Z])3([a-zA-Z])/g, '$1e$2')
    .replace(/\s+/g, ' ').trim();
}

const CRUISE_KEYWORDS = [
  'cruise', 'boat tour', 'boat trip', 'boat ride', 'sailing', 'sail',
  'catamaran', 'yacht', 'ferry', 'harbor cruise', 'harbour cruise',
  'sunset cruise', 'dinner cruise', 'lunch cruise', 'brunch cruise',
  'speedboat', 'jet boat', 'gondola', 'water taxi', 'canal cruise',
  'sightseeing cruise', 'river cruise', 'circle line', 'statue of liberty',
  'statue cruise', 'liberty cruise', 'hudson river', 'east river',
  'manhattan cruise', 'nyc cruise', 'new york cruise', 'city cruise',
  'skyline cruise', 'best of nyc'
];

const EXCLUDE_KEYWORDS = ['transfer only', 'airport shuttle', 'hotel pickup only'];

function isCruiseExperience(activity: any): boolean {
  const text = `${activity.name || ''} ${activity.shortDescription || ''}`.toLowerCase();
  const hasKeyword = CRUISE_KEYWORDS.some(kw => text.includes(kw));
  const hasExclude = EXCLUDE_KEYWORDS.some(kw => text.includes(kw));
  return hasKeyword && !hasExclude;
}

function applyMarkup(activity: any): any {
  const basePrice = activity.price?.amount ? parseFloat(activity.price.amount) : null;
  const cleaned = {
    ...activity,
    name: cleanText(activity.name || ''),
    shortDescription: cleanText(activity.shortDescription || activity.description || ''),
    category: 'cruises',
    categoryName: 'Cruises & Boat Tours',
    categoryIcon: '🚢',
  };
  if (basePrice === null) return cleaned;
  const markupAmount = Math.max(35, basePrice * 0.35);
  const finalPrice = basePrice + markupAmount;
  return {
    ...cleaned,
    price: {
      ...activity.price,
      amount: finalPrice.toFixed(2),
      baseAmount: basePrice.toFixed(2),
      markup: markupAmount.toFixed(2),
    }
  };
}

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '5');

    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'latitude and longitude required',
        data: [],
        meta: { count: 0 }
      }, { status: 400 });
    }

    const roundedLat = Math.round(latitude * 100) / 100;
    const roundedLng = Math.round(longitude * 100) / 100;
    const cacheKey = generateCacheKey('experiences:cruises:v2', { lat: roundedLat, lng: roundedLng, r: radius });

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const startTime = Date.now();
    let cruises: any[] = [];

    try {
      const result = await amadeusAPI.searchActivities({ latitude, longitude, radius: Math.min(radius, 5) });
      if (result?.data) {
        cruises = result.data.filter(isCruiseExperience).map(applyMarkup);
      }
    } catch (error: any) {
      console.error('Cruises search failed:', error.message);
    }

    const response = {
      success: true,
      category: { id: 'cruises', name: 'Cruises & Boat Tours', icon: '🚢' },
      data: cruises,
      meta: { count: cruises.length, location: { latitude, longitude }, responseTime: `${Date.now() - startTime}ms` }
    };

    await setCache(cacheKey, response, 14400);
    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
  }, { category: 'external_api' as any, severity: 'normal' as any });
}
