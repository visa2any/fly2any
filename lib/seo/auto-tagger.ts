/**
 * AI-POWERED AUTO-TAGGING SYSTEM
 *
 * Intelligent taxonomy + tag generation for SEO optimization
 * Uses Groq LLM for content analysis and tag extraction
 *
 * @version 1.0.0
 */

import Groq from 'groq-sdk';

// ============================================================================
// TRAVEL TAXONOMY - Hierarchical category system
// ============================================================================

export const TRAVEL_TAXONOMY = {
  // Destination Types
  destinations: {
    regions: ['North America', 'Europe', 'Asia', 'Caribbean', 'South America', 'Africa', 'Oceania', 'Middle East'],
    types: ['Beach', 'City', 'Mountain', 'Island', 'Desert', 'Countryside', 'Coastal', 'Historic'],
    vibes: ['Luxury', 'Budget', 'Adventure', 'Romantic', 'Family', 'Solo', 'Business', 'Wellness'],
  },

  // Travel Types
  travelTypes: ['Flights', 'Hotels', 'Car Rental', 'Tours', 'Transfers', 'Packages', 'Cruises'],

  // Trip Purpose
  tripPurpose: ['Vacation', 'Business', 'Honeymoon', 'Family Trip', 'Weekend Getaway', 'Road Trip', 'Backpacking'],

  // Seasonal
  seasonal: ['Summer', 'Winter', 'Spring', 'Fall', 'Holiday', 'Peak Season', 'Off-Season'],

  // Price Tiers
  priceTiers: ['Budget', 'Mid-Range', 'Luxury', 'Ultra-Luxury', 'Deals', 'Last Minute'],

  // Content Types
  contentTypes: ['Guide', 'Tips', 'Review', 'News', 'Deal Alert', 'Comparison', 'How-To', 'Itinerary'],

  // Airlines
  airlines: ['Delta', 'United', 'American', 'Southwest', 'JetBlue', 'Alaska', 'Spirit', 'Frontier', 'Emirates', 'British Airways'],

  // Events
  events: ['FIFA World Cup 2026', 'Olympics', 'Super Bowl', 'Festivals', 'Concerts', 'Conferences'],
} as const;

// SEO-optimized tag prefixes
const SEO_TAG_PREFIXES = {
  destination: 'travel-to',
  flights: 'flights-to',
  hotels: 'hotels-in',
  deals: 'cheap',
  guide: 'guide',
};

// ============================================================================
// TYPES
// ============================================================================

export interface AutoTagResult {
  primaryCategory: string;
  subcategory: string;
  tags: string[];
  seoTags: string[];      // URL-friendly tags
  keywords: string[];     // Meta keywords
  entities: {
    destinations: string[];
    airlines: string[];
    events: string[];
  };
  confidence: number;
}

export interface TaggingOptions {
  maxTags?: number;
  includeSeoTags?: boolean;
  contentType?: 'blog' | 'route' | 'destination' | 'deal';
}

// ============================================================================
// GROQ CLIENT (Singleton)
// ============================================================================

let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// ============================================================================
// AI AUTO-TAGGER
// ============================================================================

/**
 * Generate tags using AI analysis
 */
export async function autoTagContent(
  title: string,
  content: string,
  options: TaggingOptions = {}
): Promise<AutoTagResult> {
  const { maxTags = 10, includeSeoTags = true, contentType = 'blog' } = options;

  const groq = getGroqClient();

  // Fallback to rule-based if no Groq
  if (!groq) {
    return ruleBasedTagging(title, content, options);
  }

  try {
    const prompt = `Analyze this travel content and extract tags.

TITLE: ${title}

CONTENT: ${content.slice(0, 2000)}

Return JSON only:
{
  "primaryCategory": "one of: ${TRAVEL_TAXONOMY.contentTypes.join(', ')}",
  "subcategory": "specific topic",
  "tags": ["tag1", "tag2", ...], // max ${maxTags} tags
  "destinations": ["city or country names found"],
  "airlines": ["airline names found"],
  "events": ["events mentioned"],
  "keywords": ["seo keywords for meta tags"]
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return ruleBasedTagging(title, content, options);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Generate SEO-friendly tags
    const seoTags = includeSeoTags
      ? generateSeoTags(parsed.tags || [], parsed.destinations || [])
      : [];

    return {
      primaryCategory: parsed.primaryCategory || 'Guide',
      subcategory: parsed.subcategory || 'Travel',
      tags: (parsed.tags || []).slice(0, maxTags),
      seoTags,
      keywords: parsed.keywords || [],
      entities: {
        destinations: parsed.destinations || [],
        airlines: parsed.airlines || [],
        events: parsed.events || [],
      },
      confidence: 0.85,
    };
  } catch (error) {
    console.error('[AutoTagger] AI error, falling back to rules:', error);
    return ruleBasedTagging(title, content, options);
  }
}

// ============================================================================
// RULE-BASED FALLBACK
// ============================================================================

function ruleBasedTagging(
  title: string,
  content: string,
  options: TaggingOptions
): AutoTagResult {
  const text = `${title} ${content}`.toLowerCase();
  const tags: string[] = [];
  const destinations: string[] = [];
  const airlines: string[] = [];
  const events: string[] = [];

  // Extract destinations
  const destinationPatterns = [
    /(?:to|in|visit|explore)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    /flights?\s+to\s+([A-Z][a-z]+)/gi,
  ];

  // Check for known terms
  TRAVEL_TAXONOMY.destinations.types.forEach(type => {
    if (text.includes(type.toLowerCase())) tags.push(type);
  });

  TRAVEL_TAXONOMY.tripPurpose.forEach(purpose => {
    if (text.includes(purpose.toLowerCase())) tags.push(purpose);
  });

  TRAVEL_TAXONOMY.airlines.forEach(airline => {
    if (text.includes(airline.toLowerCase())) airlines.push(airline);
  });

  TRAVEL_TAXONOMY.events.forEach(event => {
    if (text.includes(event.toLowerCase())) events.push(event);
  });

  // Determine category
  let primaryCategory = 'Guide';
  if (text.includes('deal') || text.includes('cheap') || text.includes('sale')) {
    primaryCategory = 'Deal Alert';
  } else if (text.includes('review')) {
    primaryCategory = 'Review';
  } else if (text.includes('how to') || text.includes('tips')) {
    primaryCategory = 'Tips';
  } else if (text.includes('news') || text.includes('announced')) {
    primaryCategory = 'News';
  }

  return {
    primaryCategory,
    subcategory: 'Travel',
    tags: [...new Set(tags)].slice(0, options.maxTags || 10),
    seoTags: generateSeoTags(tags, destinations),
    keywords: tags.slice(0, 5),
    entities: { destinations, airlines, events },
    confidence: 0.6,
  };
}

// ============================================================================
// SEO TAG GENERATION
// ============================================================================

function generateSeoTags(tags: string[], destinations: string[]): string[] {
  const seoTags: string[] = [];

  // Create URL-friendly tags
  tags.forEach(tag => {
    const slug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (slug.length > 2) seoTags.push(slug);
  });

  // Add destination-based SEO tags
  destinations.forEach(dest => {
    const slug = dest.toLowerCase().replace(/\s+/g, '-');
    seoTags.push(`flights-to-${slug}`);
    seoTags.push(`travel-${slug}`);
  });

  return [...new Set(seoTags)];
}

// ============================================================================
// ROUTE AUTO-TAGGER (For flight routes)
// ============================================================================

export function autoTagRoute(
  origin: string,
  destination: string,
  originCity: string,
  destCity: string
): AutoTagResult {
  const tags = [
    `${originCity} to ${destCity}`,
    `${origin}-${destination}`,
    `Flights to ${destCity}`,
    `Cheap flights ${originCity}`,
  ];

  const seoTags = [
    `flights-${origin.toLowerCase()}-to-${destination.toLowerCase()}`,
    `cheap-flights-${destCity.toLowerCase().replace(/\s+/g, '-')}`,
    `${originCity.toLowerCase().replace(/\s+/g, '-')}-${destCity.toLowerCase().replace(/\s+/g, '-')}`,
  ];

  return {
    primaryCategory: 'Route',
    subcategory: 'Flight Route',
    tags,
    seoTags,
    keywords: [`${originCity} to ${destCity} flights`, `cheap flights to ${destCity}`, `${origin} ${destination}`],
    entities: {
      destinations: [originCity, destCity],
      airlines: [],
      events: [],
    },
    confidence: 1.0,
  };
}

// ============================================================================
// DESTINATION AUTO-TAGGER
// ============================================================================

export function autoTagDestination(
  cityName: string,
  countryName: string,
  region: string
): AutoTagResult {
  const tags = [
    cityName,
    countryName,
    region,
    `Travel to ${cityName}`,
    `${cityName} vacation`,
    `Things to do in ${cityName}`,
  ];

  const seoTags = [
    `travel-to-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
    `${cityName.toLowerCase().replace(/\s+/g, '-')}-travel-guide`,
    `visit-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
    `flights-to-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
    `hotels-in-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
  ];

  return {
    primaryCategory: 'Destination',
    subcategory: region,
    tags,
    seoTags,
    keywords: [
      `${cityName} travel`,
      `${cityName} flights`,
      `${cityName} hotels`,
      `${cityName} vacation`,
      `visit ${cityName}`,
    ],
    entities: {
      destinations: [cityName, countryName],
      airlines: [],
      events: [],
    },
    confidence: 1.0,
  };
}

// ============================================================================
// BATCH TAGGING
// ============================================================================

export async function batchAutoTag(
  items: Array<{ id: string; title: string; content: string }>
): Promise<Map<string, AutoTagResult>> {
  const results = new Map<string, AutoTagResult>();

  // Process in parallel with limit
  const batchSize = 5;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => autoTagContent(item.title, item.content))
    );

    batch.forEach((item, idx) => {
      results.set(item.id, batchResults[idx]);
    });
  }

  return results;
}
