// NLP Search API - Natural Language Processing for Hotel Search
// Converts natural language queries to structured search parameters
import { NextRequest, NextResponse } from 'next/server';

interface ParsedSearchQuery {
  destination?: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  children?: number;
  nights?: number;
  budget?: { min?: number; max?: number };
  stars?: number[];
  amenities?: string[];
  hotelType?: string;
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
  mood?: 'business' | 'romantic' | 'family' | 'budget' | 'luxury' | 'adventure';
  keywords?: string[];
  intent: 'search' | 'compare' | 'question' | 'booking' | 'unknown';
  confidence: number;
}

// Destination keywords mapping
const destinationPatterns: Record<string, string[]> = {
  'dubai': ['dubai', 'dxb', 'burj', 'palm jumeirah', 'marina', 'downtown dubai'],
  'new york': ['new york', 'nyc', 'manhattan', 'brooklyn', 'times square', 'central park'],
  'paris': ['paris', 'eiffel', 'champs', 'louvre', 'montmartre'],
  'london': ['london', 'uk', 'westminster', 'big ben', 'heathrow'],
  'tokyo': ['tokyo', 'japan', 'shibuya', 'shinjuku', 'akihabara'],
  'bali': ['bali', 'ubud', 'seminyak', 'kuta', 'denpasar'],
  'maldives': ['maldives', 'male', 'overwater villa', 'island resort'],
  'singapore': ['singapore', 'orchard', 'marina bay', 'sentosa'],
  'barcelona': ['barcelona', 'spain', 'gaudi', 'las ramblas'],
  'rome': ['rome', 'italy', 'colosseum', 'vatican'],
};

// Amenity keywords
const amenityKeywords: Record<string, string[]> = {
  'pool': ['pool', 'swimming', 'swim'],
  'spa': ['spa', 'massage', 'wellness', 'sauna'],
  'gym': ['gym', 'fitness', 'workout', 'exercise'],
  'wifi': ['wifi', 'internet', 'connected'],
  'parking': ['parking', 'car', 'valet'],
  'restaurant': ['restaurant', 'dining', 'food', 'eat'],
  'bar': ['bar', 'lounge', 'drinks', 'cocktail'],
  'beach': ['beach', 'beachfront', 'oceanfront', 'seafront'],
  'breakfast': ['breakfast', 'morning meal'],
  'pet friendly': ['pet', 'dog', 'cat', 'animal'],
  'airport shuttle': ['airport', 'shuttle', 'transfer'],
  'room service': ['room service', '24 hour'],
};

// Mood/intent patterns
const moodPatterns: Record<string, string[]> = {
  'business': ['business', 'work', 'meeting', 'conference', 'corporate', 'professional'],
  'romantic': ['romantic', 'honeymoon', 'anniversary', 'couple', 'getaway', 'love'],
  'family': ['family', 'kids', 'children', 'child', 'baby', 'toddler'],
  'budget': ['budget', 'cheap', 'affordable', 'economical', 'value', 'deal'],
  'luxury': ['luxury', 'premium', '5 star', 'five star', 'high end', 'exclusive', 'fancy'],
  'adventure': ['adventure', 'active', 'explore', 'hiking', 'sports'],
};

// Date parsing helpers
function parseDate(text: string): string | null {
  const today = new Date();

  // Handle relative dates
  if (text.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (text.includes('today')) {
    return today.toISOString().split('T')[0];
  }

  if (text.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  if (text.includes('weekend')) {
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const friday = new Date(today);
    friday.setDate(friday.getDate() + daysUntilFriday);
    return friday.toISOString().split('T')[0];
  }

  // Handle month mentions
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];
  const monthMatch = months.find(m => text.toLowerCase().includes(m));
  if (monthMatch) {
    const monthIndex = months.indexOf(monthMatch);
    const dayMatch = text.match(/(\d{1,2})(st|nd|rd|th)?/);
    const day = dayMatch ? parseInt(dayMatch[1]) : 1;
    const year = monthIndex < today.getMonth() ? today.getFullYear() + 1 : today.getFullYear();
    return new Date(year, monthIndex, day).toISOString().split('T')[0];
  }

  // Handle "in X days/weeks"
  const inDaysMatch = text.match(/in\s+(\d+)\s+days?/i);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1]);
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  const inWeeksMatch = text.match(/in\s+(\d+)\s+weeks?/i);
  if (inWeeksMatch) {
    const weeks = parseInt(inWeeksMatch[1]);
    const date = new Date(today);
    date.setDate(date.getDate() + weeks * 7);
    return date.toISOString().split('T')[0];
  }

  return null;
}

function parseNights(text: string): number | null {
  const nightsMatch = text.match(/(\d+)\s*(?:nights?|days?)/i);
  if (nightsMatch) {
    return parseInt(nightsMatch[1]);
  }

  // Handle "a week" / "2 weeks"
  const weekMatch = text.match(/(\d+)?\s*weeks?/i);
  if (weekMatch) {
    const weeks = weekMatch[1] ? parseInt(weekMatch[1]) : 1;
    return weeks * 7;
  }

  return null;
}

function parseGuests(text: string): { adults: number; children: number } {
  let adults = 2;
  let children = 0;

  const adultsMatch = text.match(/(\d+)\s*(?:adults?|people|persons?|guests?)/i);
  if (adultsMatch) {
    adults = parseInt(adultsMatch[1]);
  }

  const childrenMatch = text.match(/(\d+)\s*(?:children|kids?|child)/i);
  if (childrenMatch) {
    children = parseInt(childrenMatch[1]);
  }

  return { adults, children };
}

function parseBudget(text: string): { min?: number; max?: number } | null {
  // "under $200" / "less than $200"
  const underMatch = text.match(/(?:under|less than|below|max|maximum)\s*\$?(\d+)/i);
  if (underMatch) {
    return { max: parseInt(underMatch[1]) };
  }

  // "over $100" / "more than $100"
  const overMatch = text.match(/(?:over|more than|above|min|minimum)\s*\$?(\d+)/i);
  if (overMatch) {
    return { min: parseInt(overMatch[1]) };
  }

  // "$100-$200" or "100 to 200"
  const rangeMatch = text.match(/\$?(\d+)\s*(?:-|to)\s*\$?(\d+)/i);
  if (rangeMatch) {
    return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
  }

  // "around $150"
  const aroundMatch = text.match(/(?:around|about|approximately)\s*\$?(\d+)/i);
  if (aroundMatch) {
    const price = parseInt(aroundMatch[1]);
    return { min: Math.round(price * 0.8), max: Math.round(price * 1.2) };
  }

  return null;
}

function parseStars(text: string): number[] | null {
  // "5 star" / "5-star"
  const starMatch = text.match(/(\d+)\s*-?\s*star/gi);
  if (starMatch) {
    return starMatch.map(m => {
      const num = m.match(/\d+/);
      return num ? parseInt(num[0]) : 0;
    }).filter(n => n > 0 && n <= 5);
  }

  // "luxury" implies 4-5 stars
  if (text.toLowerCase().includes('luxury') || text.toLowerCase().includes('premium')) {
    return [4, 5];
  }

  // "budget" implies 2-3 stars
  if (text.toLowerCase().includes('budget') || text.toLowerCase().includes('cheap')) {
    return [2, 3];
  }

  return null;
}

function parseIntent(text: string): 'search' | 'compare' | 'question' | 'booking' | 'unknown' {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('compare') || lowerText.includes('difference between') || lowerText.includes('vs')) {
    return 'compare';
  }

  if (lowerText.includes('book') || lowerText.includes('reserve') || lowerText.includes('confirm')) {
    return 'booking';
  }

  if (lowerText.includes('?') || lowerText.includes('what') || lowerText.includes('how') ||
    lowerText.includes('where') || lowerText.includes('when') || lowerText.includes('why')) {
    return 'question';
  }

  if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('show') ||
    lowerText.includes('looking for') || lowerText.includes('need') || lowerText.includes('want')) {
    return 'search';
  }

  return 'search'; // Default to search
}

function parseNaturalLanguage(query: string): ParsedSearchQuery {
  const lowerQuery = query.toLowerCase();
  let confidence = 0;
  let matchCount = 0;

  // Parse destination
  let destination: string | undefined;
  for (const [city, patterns] of Object.entries(destinationPatterns)) {
    if (patterns.some(p => lowerQuery.includes(p))) {
      destination = city;
      matchCount++;
      break;
    }
  }

  // Parse dates
  const checkin = parseDate(lowerQuery);
  if (checkin) matchCount++;

  // Parse nights
  const nights = parseNights(lowerQuery);
  if (nights) matchCount++;

  // Calculate checkout from checkin + nights
  let checkout: string | undefined;
  if (checkin && nights) {
    const checkoutDate = new Date(checkin);
    checkoutDate.setDate(checkoutDate.getDate() + nights);
    checkout = checkoutDate.toISOString().split('T')[0];
  }

  // Parse guests
  const { adults, children } = parseGuests(lowerQuery);
  if (lowerQuery.match(/\d+\s*(?:adults?|people|guests?|children|kids?)/i)) matchCount++;

  // Parse budget
  const budget = parseBudget(lowerQuery);
  if (budget) matchCount++;

  // Parse stars
  const stars = parseStars(lowerQuery);
  if (stars) matchCount++;

  // Parse amenities
  const amenities: string[] = [];
  for (const [amenity, keywords] of Object.entries(amenityKeywords)) {
    if (keywords.some(k => lowerQuery.includes(k))) {
      amenities.push(amenity);
      matchCount++;
    }
  }

  // Parse mood
  let mood: ParsedSearchQuery['mood'];
  for (const [m, patterns] of Object.entries(moodPatterns)) {
    if (patterns.some(p => lowerQuery.includes(p))) {
      mood = m as ParsedSearchQuery['mood'];
      matchCount++;
      break;
    }
  }

  // Parse intent
  const intent = parseIntent(query);

  // Parse sort preference
  let sortBy: ParsedSearchQuery['sortBy'];
  if (lowerQuery.includes('cheapest') || lowerQuery.includes('lowest price')) {
    sortBy = 'price';
  } else if (lowerQuery.includes('best rated') || lowerQuery.includes('highest rated')) {
    sortBy = 'rating';
  } else if (lowerQuery.includes('closest') || lowerQuery.includes('nearest')) {
    sortBy = 'distance';
  } else if (lowerQuery.includes('popular') || lowerQuery.includes('recommended')) {
    sortBy = 'popularity';
  }
  if (sortBy) matchCount++;

  // Extract keywords (nouns that aren't matched elsewhere)
  const keywords = query.split(/\s+/).filter(word =>
    word.length > 3 && !Object.values(destinationPatterns).flat().includes(word.toLowerCase())
  ).slice(0, 5);

  // Calculate confidence based on matches
  confidence = Math.min(0.95, 0.3 + (matchCount * 0.1));

  return {
    destination,
    checkin: checkin || undefined,
    checkout: checkout || undefined,
    adults,
    children,
    nights: nights || undefined,
    budget: budget || undefined,
    stars: stars || undefined,
    amenities: amenities.length > 0 ? amenities : undefined,
    mood,
    sortBy,
    keywords,
    intent,
    confidence,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Query is required',
      }, { status: 400 });
    }

    // Parse the natural language query
    const parsed = parseNaturalLanguage(query);

    // Generate suggestions for missing fields
    const suggestions: string[] = [];
    if (!parsed.destination) {
      suggestions.push('Where would you like to stay?');
    }
    if (!parsed.checkin) {
      suggestions.push('When are you planning to check in?');
    }
    if (!parsed.nights && !parsed.checkout) {
      suggestions.push('How many nights are you staying?');
    }

    // Generate a human-readable interpretation
    let interpretation = 'I understood: ';
    const parts: string[] = [];

    if (parsed.destination) parts.push(`destination is ${parsed.destination}`);
    if (parsed.checkin) parts.push(`checking in on ${parsed.checkin}`);
    if (parsed.nights) parts.push(`staying ${parsed.nights} nights`);
    if (parsed.adults) parts.push(`${parsed.adults} adults`);
    if (parsed.children) parts.push(`${parsed.children} children`);
    if (parsed.budget?.max) parts.push(`budget under $${parsed.budget.max}`);
    if (parsed.stars?.length) parts.push(`${parsed.stars.join(' or ')}-star hotels`);
    if (parsed.amenities?.length) parts.push(`with ${parsed.amenities.join(', ')}`);
    if (parsed.mood) parts.push(`${parsed.mood} trip`);

    interpretation = parts.length > 0
      ? `I understood: ${parts.join(', ')}.`
      : 'I couldn\'t parse specific details from your query.';

    return NextResponse.json({
      success: true,
      data: {
        parsed,
        interpretation,
        suggestions,
        canSearch: !!(parsed.destination && (parsed.checkin || context?.checkin)),
        originalQuery: query,
      },
    });

  } catch (error) {
    console.error('NLP Search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process query',
    }, { status: 500 });
  }
}

// GET endpoint for simple queries
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({
      success: false,
      error: 'Query parameter q is required',
    }, { status: 400 });
  }

  const parsed = parseNaturalLanguage(query);

  return NextResponse.json({
    success: true,
    data: parsed,
  });
}
