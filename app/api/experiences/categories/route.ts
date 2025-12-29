import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { handleApiError } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Experience Categories API - Extract specific product categories from Amadeus Activities
 *
 * The Amadeus Tours & Activities API aggregates content from 45+ platforms including:
 * - Viator
 * - GetYourGuide
 * - Klook
 * - Musement
 *
 * This endpoint filters activities by category to create dedicated product sections.
 */

/**
 * Clean text from API - fix HTML entities, special chars, encoding issues
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text
    // HTML entities
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    // Unicode escapes
    .replace(/\\u[\dA-Fa-f]{4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)))
    // Fix common misspellings from OCR/encoding (numbers in words)
    .replace(/([a-zA-Z])0([a-zA-Z])/g, '$1o$2') // l0ve -> love
    .replace(/([a-zA-Z])1([a-zA-Z])/g, '$1i$2') // h1stor1c -> historic
    .replace(/([a-zA-Z])3([a-zA-Z])/g, '$1e$2') // thr33 -> three
    .replace(/([a-zA-Z])4([a-zA-Z])/g, '$1a$2') // gre4t -> great
    .replace(/([a-zA-Z])5([a-zA-Z])/g, '$1s$2') // 5ight5 -> sights
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Category definitions with keywords and display info
const EXPERIENCE_CATEGORIES: Record<string, {
  name: string;
  icon: string;
  keywords: string[];
  excludeKeywords?: string[];
  description: string;
}> = {
  'cruises': {
    name: 'Cruises & Boat Tours',
    icon: '🚢',
    keywords: ['cruise', 'boat tour', 'boat trip', 'boat ride', 'sailing', 'sail', 'catamaran', 'yacht', 'ferry', 'river cruise', 'harbor cruise', 'harbour cruise', 'sunset cruise', 'dinner cruise', 'lunch cruise', 'brunch cruise', 'dhow', 'speedboat', 'jet boat', 'pontoon', 'gondola', 'canal cruise', 'sightseeing cruise', 'circle line', 'statue of liberty cruise', 'statue cruise', 'liberty cruise', 'hudson river', 'east river', 'manhattan cruise', 'nyc cruise', 'new york cruise', 'city cruise', 'best of nyc', 'skyline cruise'],
    excludeKeywords: ['transfer', 'airport shuttle', 'hotel pickup only'],
    description: 'Harbor cruises, sunset sails, and river boat experiences'
  },
  'museums': {
    name: 'Museums & Culture',
    icon: '🏛️',
    keywords: ['museum', 'gallery', 'art exhibit', 'exhibition', 'cultural center', 'heritage site', 'historical site', 'palace visit', 'castle entrance'],
    excludeKeywords: ['tour', 'walking', 'cruise', 'desert', 'safari'],
    description: 'Skip-the-line tickets and cultural experiences'
  },
  'food-wine': {
    name: 'Food & Wine',
    icon: '🍷',
    keywords: ['food tour', 'wine tasting', 'wine tour', 'culinary', 'cooking class', 'gastronomy', 'dinner experience', 'champagne', 'brewery tour', 'distillery', 'chef table', 'tasting menu'],
    excludeKeywords: ['desert', 'safari', 'cruise', 'transfer'],
    description: 'Wine tastings, cooking classes, and food tours'
  },
  'shows': {
    name: 'Shows & Entertainment',
    icon: '🎭',
    keywords: ['show ticket', 'broadway', 'theater ticket', 'theatre', 'concert ticket', 'cabaret', 'moulin rouge', 'lido', 'flamenco show', 'live performance', 'musical show', 'opera'],
    excludeKeywords: ['tour', 'desert', 'safari', 'cruise'],
    description: 'Broadway shows, cabarets, and live performances'
  },
  'adventure': {
    name: 'Adventure Activities',
    icon: '🏔️',
    keywords: ['adventure', 'zipline', 'zip line', 'atv', 'quad bike', 'rafting', 'bungee', 'paragliding', 'skydiving', 'hiking trail', 'rock climbing', 'jungle trek', 'dune bashing', 'desert safari'],
    excludeKeywords: ['transfer', 'airport', 'cruise'],
    description: 'Zip lines, ATV rides, and outdoor adventures'
  },
  'water-sports': {
    name: 'Water Sports',
    icon: '🤿',
    keywords: ['snorkel', 'snorkeling', 'scuba diving', 'dive trip', 'kayak', 'surfing lesson', 'jet ski', 'paddleboard', 'swimming with', 'water sport'],
    excludeKeywords: ['transfer', 'cruise', 'boat tour'],
    description: 'Snorkeling, diving, and water activities'
  },
  'wellness': {
    name: 'Wellness & Spa',
    icon: '🧘',
    keywords: ['spa', 'wellness', 'massage', 'hammam', 'bath', 'thermal', 'yoga', 'meditation', 'retreat'],
    description: 'Spa treatments, massages, and wellness experiences'
  },
  'air': {
    name: 'Air Experiences',
    icon: '🚁',
    keywords: ['helicopter', 'hot air balloon', 'balloon', 'scenic flight', 'airplane', 'seaplane', 'aerial'],
    excludeKeywords: ['transfer', 'airport'],
    description: 'Helicopter tours, hot air balloons, and scenic flights'
  },
  'nightlife': {
    name: 'Nightlife',
    icon: '🌃',
    keywords: ['nightlife', 'night tour', 'pub crawl', 'bar', 'club', 'party', 'evening'],
    description: 'Night tours, pub crawls, and evening experiences'
  },
  'classes': {
    name: 'Classes & Workshops',
    icon: '📚',
    keywords: ['class', 'workshop', 'lesson', 'course', 'learn', 'masterclass', 'hands-on'],
    description: 'Cooking classes, workshops, and learning experiences'
  },
  'photography': {
    name: 'Photography Tours',
    icon: '📸',
    keywords: ['photography', 'photo', 'photoshoot', 'instagram', 'photographer'],
    description: 'Photo tours and professional photography experiences'
  },
  'landmarks': {
    name: 'Landmarks & Attractions',
    icon: '🗽',
    keywords: ['tower', 'landmark', 'observation', 'viewpoint', 'skip the line', 'skip-the-line', 'entrance', 'admission', 'ticket'],
    excludeKeywords: ['tour', 'cruise'],
    description: 'Skip-the-line access to famous landmarks'
  },
  'day-trips': {
    name: 'Day Trips',
    icon: '🚐',
    keywords: ['day trip', 'excursion', 'full day', 'full-day', 'half day', 'half-day'],
    excludeKeywords: ['transfer'],
    description: 'Day trips and excursions to nearby destinations'
  },
  'walking-tours': {
    name: 'Walking Tours',
    icon: '🚶',
    keywords: ['walking tour', 'walking', 'guided walk', 'city walk', 'neighborhood'],
    description: 'Guided walking tours and city explorations'
  },
  'private-tours': {
    name: 'Private Tours',
    icon: '👤',
    keywords: ['private tour', 'private', 'exclusive', 'vip', 'personalized'],
    excludeKeywords: ['transfer', 'shuttle'],
    description: 'Private and personalized tour experiences'
  }
};

/**
 * Check if activity matches a category
 */
function matchesCategory(activity: any, categoryKey: string): boolean {
  const category = EXPERIENCE_CATEGORIES[categoryKey];
  if (!category) return false;

  const text = `${activity.name || ''} ${activity.shortDescription || activity.description || ''}`.toLowerCase();

  // Check if any keyword matches
  const hasKeyword = category.keywords.some(kw => text.includes(kw));

  // Check if any exclude keyword matches (reject if so)
  const hasExclude = category.excludeKeywords?.some(kw => text.includes(kw)) || false;

  return hasKeyword && !hasExclude;
}

/**
 * Apply markup + clean text: $35 minimum OR 35% whichever is higher
 */
function applyMarkup(activity: any): any {
  const basePrice = activity.price?.amount ? parseFloat(activity.price.amount) : null;

  // Clean text fields
  const cleaned = {
    ...activity,
    name: cleanText(activity.name || ''),
    shortDescription: cleanText(activity.shortDescription || activity.description || ''),
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
      markupPercent: ((markupAmount / basePrice) * 100).toFixed(1),
    }
  };
}

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const category = searchParams.get('category'); // Optional: filter by specific category
    const radius = parseInt(searchParams.get('radius') || '5');

    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'latitude and longitude required',
        categories: Object.keys(EXPERIENCE_CATEGORIES).map(key => ({
          id: key,
          ...EXPERIENCE_CATEGORIES[key],
          keywords: undefined // Don't expose keywords
        })),
        data: [],
        meta: { count: 0 }
      }, { status: 400 });
    }

    // Round coords for cache key
    const roundedLat = Math.round(latitude * 100) / 100;
    const roundedLng = Math.round(longitude * 100) / 100;
    const cacheKey = generateCacheKey('experiences:categories:v2', {
      lat: roundedLat,
      lng: roundedLng,
      r: radius,
      cat: category || 'all'
    });

    // Check cache
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`⚡ Experience categories cache HIT`);
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'X-Response-Time': '< 50ms' }
      });
    }

    const startTime = Date.now();
    console.log(`🎯 Searching experiences at ${latitude}, ${longitude}...`);

    // Fetch activities from Amadeus
    let activities: any[] = [];
    try {
      const result = await Promise.race([
        amadeusAPI.searchActivities({
          latitude,
          longitude,
          radius: Math.min(radius, 5), // Cap at 5km for performance
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 25000))
      ]) as any;

      activities = result?.data || [];
    } catch (error: any) {
      console.error('⚠️ Activities search failed:', error.message);
    }

    // Categorize activities
    const categorizedData: Record<string, any[]> = {};

    for (const categoryKey of Object.keys(EXPERIENCE_CATEGORIES)) {
      // Skip if specific category requested and this isn't it
      if (category && category !== categoryKey) continue;

      const matching = activities
        .filter(a => matchesCategory(a, categoryKey))
        .map(applyMarkup)
        .slice(0, 20); // Limit per category

      if (matching.length > 0) {
        categorizedData[categoryKey] = matching;
      }
    }

    const responseTime = Date.now() - startTime;

    // Build response
    const response = {
      success: true,
      categories: Object.keys(EXPERIENCE_CATEGORIES).map(key => ({
        id: key,
        ...EXPERIENCE_CATEGORIES[key],
        count: categorizedData[key]?.length || 0,
        keywords: undefined
      })).filter(cat => !category || cat.id === category),
      data: categorizedData,
      meta: {
        totalActivities: activities.length,
        categorizedCount: Object.values(categorizedData).flat().length,
        location: { latitude, longitude, radius },
        responseTime: `${responseTime}ms`
      }
    };

    // Cache for 4 hours
    await setCache(cacheKey, response, 14400);

    console.log(`✅ Found ${Object.values(categorizedData).flat().length} categorized experiences in ${responseTime}ms`);
    return NextResponse.json(response, {
      headers: { 'X-Cache': 'MISS', 'X-Response-Time': `${responseTime}ms` }
    });

  }, { category: 'external_api' as any, severity: 'normal' as any });
}
