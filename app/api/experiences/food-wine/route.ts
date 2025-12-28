import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { handleApiError } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Food & Wine Experiences API
 * Wine tastings, cooking classes, food tours, and culinary experiences
 */

const FOOD_KEYWORDS = [
  'food', 'wine', 'tasting', 'culinary', 'cooking', 'gastronomy',
  'dinner', 'lunch', 'champagne', 'brewery', 'distillery', 'chef',
  'market', 'street food', 'michelin', 'vineyard', 'winery'
];

function isFoodExperience(activity: any): boolean {
  const text = `${activity.name || ''} ${activity.shortDescription || ''}`.toLowerCase();
  return FOOD_KEYWORDS.some(kw => text.includes(kw));
}

function applyMarkup(activity: any): any {
  const basePrice = activity.price?.amount ? parseFloat(activity.price.amount) : null;
  if (basePrice === null) return activity;
  const markupAmount = Math.max(35, basePrice * 0.35);
  const finalPrice = basePrice + markupAmount;
  return {
    ...activity,
    category: 'food-wine',
    categoryName: 'Food & Wine',
    categoryIcon: '🍷',
    price: { ...activity.price, amount: finalPrice.toFixed(2), baseAmount: basePrice.toFixed(2), markup: markupAmount.toFixed(2) }
  };
}

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '5');

    if (!latitude || !longitude) {
      return NextResponse.json({ success: false, error: 'VALIDATION_ERROR', message: 'latitude and longitude required', data: [], meta: { count: 0 } }, { status: 400 });
    }

    const roundedLat = Math.round(latitude * 100) / 100;
    const roundedLng = Math.round(longitude * 100) / 100;
    const cacheKey = generateCacheKey('experiences:food-wine:v1', { lat: roundedLat, lng: roundedLng, r: radius });

    const cached = await getCached<any>(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });

    const startTime = Date.now();
    let experiences: any[] = [];

    try {
      const result = await amadeusAPI.searchActivities({ latitude, longitude, radius: Math.min(radius, 5) });
      if (result?.data) experiences = result.data.filter(isFoodExperience).map(applyMarkup);
    } catch (error: any) {
      console.error('Food & wine search failed:', error.message);
    }

    const response = {
      success: true,
      category: { id: 'food-wine', name: 'Food & Wine', icon: '🍷' },
      data: experiences,
      meta: { count: experiences.length, location: { latitude, longitude }, responseTime: `${Date.now() - startTime}ms` }
    };

    await setCache(cacheKey, response, 14400);
    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
  }, { category: 'external_api' as any, severity: 'normal' as any });
}
