import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * REAL REVIEWS API - v8
 * Fetches real reviews from LiteAPI
 */

// Detect hotel brand/type from name
function detectHotelType(hotelName: string): {
  brand: string;
  category: 'budget' | 'midscale' | 'upscale' | 'luxury';
  style: 'business' | 'family' | 'boutique' | 'resort' | 'airport' | 'highway';
} {
  const name = hotelName.toLowerCase();

  // Budget brands
  if (name.includes('super 8') || name.includes('motel 6') || name.includes('red roof')) {
    return { brand: 'budget', category: 'budget', style: 'highway' };
  }

  // Midscale business/family brands
  if (name.includes('holiday inn express') || name.includes('hampton inn') ||
      name.includes('fairfield') || name.includes('la quinta')) {
    return { brand: 'midscale', category: 'midscale', style: 'business' };
  }

  if (name.includes('holiday inn') || name.includes('best western') ||
      name.includes('comfort inn') || name.includes('quality inn')) {
    return { brand: 'midscale', category: 'midscale', style: 'family' };
  }

  // Upscale brands
  if (name.includes('hilton') || name.includes('marriott') || name.includes('hyatt') ||
      name.includes('sheraton') || name.includes('westin') || name.includes('doubletree')) {
    return { brand: 'upscale', category: 'upscale', style: 'business' };
  }

  // Luxury brands
  if (name.includes('ritz') || name.includes('four seasons') || name.includes('st. regis') ||
      name.includes('waldorf') || name.includes('peninsula') || name.includes('mandarin')) {
    return { brand: 'luxury', category: 'luxury', style: 'boutique' };
  }

  // Resort detection
  if (name.includes('resort') || name.includes('spa') || name.includes('beach')) {
    return { brand: 'resort', category: 'upscale', style: 'resort' };
  }

  // Airport hotels
  if (name.includes('airport')) {
    return { brand: 'airport', category: 'midscale', style: 'airport' };
  }

  // Default based on star rating will be applied later
  return { brand: 'independent', category: 'midscale', style: 'family' };
}

// Check what amenities the hotel actually has
function detectAmenities(amenities: string[]): {
  hasPool: boolean;
  hasBreakfast: boolean;
  hasFitness: boolean;
  hasSpa: boolean;
  hasRestaurant: boolean;
  hasParking: boolean;
  hasPets: boolean;
  hasWifi: boolean;
} {
  const amenityStr = amenities.join(' ').toLowerCase();
  return {
    hasPool: amenityStr.includes('pool') || amenityStr.includes('swimming'),
    hasBreakfast: amenityStr.includes('breakfast') || amenityStr.includes('complimentary'),
    hasFitness: amenityStr.includes('fitness') || amenityStr.includes('gym') || amenityStr.includes('exercise'),
    hasSpa: amenityStr.includes('spa') || amenityStr.includes('massage'),
    hasRestaurant: amenityStr.includes('restaurant') || amenityStr.includes('dining'),
    hasParking: amenityStr.includes('parking'),
    hasPets: amenityStr.includes('pet') || amenityStr.includes('dog'),
    hasWifi: amenityStr.includes('wifi') || amenityStr.includes('internet'),
  };
}

// Generate review templates based on hotel context
function getContextualTemplates(
  hotelType: ReturnType<typeof detectHotelType>,
  amenities: ReturnType<typeof detectAmenities>,
  hotelName: string,
  city: string
) {
  const templates: Array<{
    rating: number;
    titles: string[];
    contents: string[];
    pros: string[];
    cons: string[];
  }> = [];

  // MIDSCALE BUSINESS/FAMILY HOTELS (Holiday Inn Express, Hampton Inn, etc.)
  if (hotelType.category === 'midscale' || hotelType.category === 'budget') {
    templates.push({
      rating: 5,
      titles: ['Perfect for our needs!', 'Great value!', 'Exceeded expectations', 'Will stay again', 'Clean and comfortable'],
      contents: [
        `Perfect stop for our road trip. The room was clean and modern, bed was comfortable. ${amenities.hasBreakfast ? 'The complimentary breakfast was a nice touch with good variety.' : 'Easy access to nearby restaurants.'} Staff was friendly and helpful. Would definitely stay here again!`,
        `Great hotel for the price! Everything was clean and well-maintained. ${amenities.hasFitness ? 'Used the fitness center in the morning - well equipped.' : 'Room had plenty of space to stretch.'} ${amenities.hasParking ? 'Loved the free parking.' : ''} Perfect for business travelers.`,
        `Stayed here for a family trip and it was exactly what we needed. ${amenities.hasPool ? 'Kids loved the pool!' : 'Rooms were spacious enough for our family.'} ${amenities.hasBreakfast ? 'Breakfast made mornings easy.' : ''} Clean, comfortable, and affordable.`,
        `Reliable and consistent - exactly what you expect. Modern room, comfortable bed, clean bathroom. ${amenities.hasWifi ? 'WiFi worked great for video calls.' : ''} Staff was professional and courteous. Will definitely be back.`,
      ],
      pros: [
        'Clean rooms',
        'Comfortable beds',
        'Friendly staff',
        ...(amenities.hasBreakfast ? ['Good breakfast included'] : []),
        ...(amenities.hasParking ? ['Free parking'] : []),
        ...(amenities.hasFitness ? ['Nice fitness center'] : []),
        'Good value',
      ],
      cons: ['Standard hotel amenities', 'Nothing fancy but does the job'],
    });

    templates.push({
      rating: 4.5,
      titles: ['Solid choice', 'Good stay', 'Would recommend', 'Nice hotel', 'Great for the price'],
      contents: [
        `Good hotel in a convenient location. Room was clean and comfortable. ${amenities.hasBreakfast ? 'Breakfast had nice variety - eggs, waffles, fresh fruit.' : 'Plenty of restaurants nearby.'} ${amenities.hasParking ? 'Easy parking.' : ''} Would stay again.`,
        `Exactly what we needed for our trip. ${amenities.hasFitness ? 'The gym was a bonus after a long drive.' : ''} Bed was comfortable, room was quiet. Staff helped us with local recommendations. Great value for money.`,
        `Pleasant stay overall. Modern and clean. ${amenities.hasPool ? 'Pool was a nice way to unwind.' : ''} ${amenities.hasWifi ? 'Internet worked well.' : ''} Check-in was quick and easy. Would recommend for travelers in the area.`,
        `Good experience. Room was as expected - clean, functional, comfortable. ${amenities.hasBreakfast ? 'Appreciated the hot breakfast option.' : ''} Staff was helpful when we had questions. Fair price for what you get.`,
      ],
      pros: [
        'Clean and modern',
        'Comfortable',
        'Good location',
        ...(amenities.hasBreakfast ? ['Hot breakfast'] : []),
        ...(amenities.hasFitness ? ['Fitness center'] : []),
        'Helpful staff',
      ],
      cons: ['Basic amenities', 'Could use some updates'],
    });

    templates.push({
      rating: 4,
      titles: ['Good value', 'Decent stay', 'Works well', 'Met expectations', 'Comfortable enough'],
      contents: [
        `Stayed for a business trip - served its purpose well. Room was clean and the bed was comfortable. ${amenities.hasWifi ? 'WiFi was reliable for work.' : ''} Nothing fancy but everything you need for a good night\'s rest.`,
        `Good hotel for the price point. ${amenities.hasBreakfast ? 'Breakfast was decent - typical continental options plus some hot items.' : 'Easy access to restaurants.'} Room was clean. Would consider staying again when in the area.`,
        `Solid choice for travelers. Check-in was smooth, room was ready. ${amenities.hasParking ? 'Plenty of parking.' : ''} Bed was comfortable. Only minor issue was ${amenities.hasWifi ? 'WiFi was a bit slow during peak hours' : 'could use more outlets'}.`,
        `Met expectations. Clean room, comfortable bed, ${amenities.hasBreakfast ? 'adequate breakfast' : 'easy to find food nearby'}. Staff was friendly. ${amenities.hasFitness ? 'Gym was small but functional.' : ''} Good for a stopover or short stay.`,
      ],
      pros: [
        'Clean',
        'Comfortable',
        'Good price',
        ...(amenities.hasBreakfast ? ['Breakfast included'] : []),
        'Convenient',
      ],
      cons: [
        ...(amenities.hasWifi ? ['WiFi can be slow'] : []),
        'Basic decor',
        'Not many extras',
      ],
    });
  }

  // UPSCALE HOTELS (Hilton, Marriott, etc.)
  if (hotelType.category === 'upscale') {
    templates.push({
      rating: 5,
      titles: ['Excellent stay!', 'Fantastic experience', 'Top notch', 'Highly recommend', 'Worth every penny'],
      contents: [
        `Outstanding hotel! The room was spacious and beautifully appointed. ${amenities.hasSpa ? 'The spa was incredible - highly recommend the massage.' : 'Bed was incredibly comfortable.'} ${amenities.hasRestaurant ? 'On-site restaurant had excellent food.' : ''} Staff was professional and attentive throughout our stay.`,
        `Premium experience from start to finish. ${amenities.hasPool ? 'The pool area was pristine.' : 'Common areas were elegant.'} Room had all the amenities you\'d expect at this level. ${amenities.hasFitness ? 'State-of-the-art gym.' : ''} Will definitely return!`,
        `Exceptional hotel. ${amenities.hasRestaurant ? 'Dinner at the restaurant was a highlight.' : 'Room service was prompt and delicious.'} The attention to detail is evident everywhere. Staff anticipated our needs. Perfect for a special occasion or business trip.`,
        `Luxurious and comfortable. Room was immaculate with premium bedding. ${amenities.hasSpa ? 'Spa treatments were divine.' : 'Bathroom was spacious with great amenities.'} ${amenities.hasParking ? 'Valet service was efficient.' : ''} Exceeded expectations.`,
      ],
      pros: [
        'Luxurious rooms',
        'Excellent service',
        'Premium amenities',
        ...(amenities.hasSpa ? ['Amazing spa'] : []),
        ...(amenities.hasRestaurant ? ['Great restaurant'] : []),
        ...(amenities.hasPool ? ['Beautiful pool'] : []),
        'Attention to detail',
      ],
      cons: ['Premium pricing', 'Can get busy'],
    });
  }

  // RESORT HOTELS
  if (hotelType.style === 'resort') {
    templates.push({
      rating: 5,
      titles: ['Paradise!', 'Dream vacation', 'Unforgettable stay', 'Perfect getaway', 'Highly recommend'],
      contents: [
        `What an incredible resort! ${amenities.hasPool ? 'Multiple pools were gorgeous.' : 'The grounds were stunning.'} ${amenities.hasSpa ? 'The spa experience was heavenly.' : ''} Staff made us feel like VIPs. Already planning our return visit!`,
        `Perfect vacation spot. ${amenities.hasRestaurant ? 'The restaurants offered amazing variety.' : 'Food options were excellent.'} ${amenities.hasPool ? 'Kids spent hours at the pool.' : ''} Beautiful property with so much to do. Worth the splurge!`,
      ],
      pros: [
        'Beautiful property',
        ...(amenities.hasPool ? ['Amazing pools'] : []),
        ...(amenities.hasSpa ? ['Relaxing spa'] : []),
        'Great service',
        'Lots of activities',
      ],
      cons: ['Resort fee adds up', 'Can be crowded during peak season'],
    });
  }

  // Ensure we have at least default templates
  if (templates.length === 0) {
    templates.push({
      rating: 4,
      titles: ['Good stay', 'Nice hotel', 'Would return', 'Comfortable', 'Decent option'],
      contents: [
        `Good hotel for our needs. Room was clean and comfortable. Staff was helpful. ${amenities.hasBreakfast ? 'Breakfast was included which was nice.' : ''} Would consider staying again.`,
        `Pleasant experience overall. Room was well-maintained. ${amenities.hasParking ? 'Parking was convenient.' : ''} Met our expectations for the price. Would recommend.`,
      ],
      pros: ['Clean', 'Comfortable', 'Good value', 'Helpful staff'],
      cons: ['Basic amenities'],
    });
  }

  return templates;
}

function generateContextualReviews(
  hotelId: string,
  context: HotelContext,
  count: number = 10
) {
  const hotelType = detectHotelType(context.name);
  const amenities = detectAmenities(context.amenities);
  const templates = getContextualTemplates(hotelType, amenities, context.name, context.city);

  const travelTypes: Array<'business' | 'leisure' | 'family' | 'couple' | 'solo'> =
    hotelType.style === 'business'
      ? ['business', 'business', 'solo', 'couple', 'business']
      : hotelType.style === 'resort'
      ? ['couple', 'family', 'leisure', 'couple', 'family']
      : ['family', 'couple', 'business', 'leisure', 'solo'];

  const countries = [
    'United States', 'United States', 'United States', 'Canada', 'United Kingdom',
    'Germany', 'Australia', 'France', 'Brazil', 'Japan'
  ];

  const names = [
    'John M.', 'Sarah L.', 'Michael R.', 'Emily T.', 'David K.',
    'Jennifer W.', 'Robert H.', 'Lisa G.', 'James P.', 'Amanda S.',
    'Christopher B.', 'Jessica N.', 'Matthew D.', 'Ashley C.',
    'Daniel F.', 'Nicole V.', 'Andrew Z.', 'Stephanie Q.',
    'Joshua E.', 'Rachel O.', 'William M.', 'Olivia S.'
  ];

  const reviews: any[] = [];
  const usedNames = new Set<string>();

  // Use hotelId to seed for consistent reviews
  const seed = hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < count; i++) {
    const templateIndex = (seed + i) % templates.length;
    const template = templates[templateIndex];

    let nameIndex = (seed + i * 7) % names.length;
    let name = names[nameIndex];
    let attempts = 0;
    while (usedNames.has(name) && attempts < names.length) {
      nameIndex = (nameIndex + 1) % names.length;
      name = names[nameIndex];
      attempts++;
    }
    usedNames.add(name);

    const daysAgo = ((seed + i * 13) % 180) + 1;
    const stayDate = new Date(Date.now() - (daysAgo + 30) * 24 * 60 * 60 * 1000);
    const reviewDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const titleIndex = (seed + i * 3) % template.titles.length;
    const contentIndex = (seed + i * 5) % template.contents.length;
    const countryIndex = (seed + i * 11) % countries.length;
    const travelIndex = (seed + i * 17) % travelTypes.length;

    reviews.push({
      id: `review_${hotelId}_${i}_ctx`,
      hotelId,
      rating: template.rating,
      title: template.titles[titleIndex],
      content: template.contents[contentIndex],
      authorName: name,
      authorCountry: countries[countryIndex],
      travelType: travelTypes[travelIndex],
      stayDate: stayDate.toISOString(),
      createdAt: reviewDate.toISOString(),
      verified: true,
      helpful: ((seed + i * 19) % 50),
      pros: template.pros.slice(0, Math.min(4, ((seed + i) % template.pros.length) + 2)),
      cons: template.cons.slice(0, Math.min(2, ((seed + i) % template.cons.length) + 1)),
      source: 'contextual',
    });
  }

  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return reviews;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const hotelId = params.id;
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10');
  const hotelName = searchParams.get('hotelName') || 'Hotel';

  console.log(`🔍 Reviews API v8 - Fetching REAL reviews for ${hotelId}`);

  try {
    // Fetch real reviews from LiteAPI
    const reviewsResult = await liteAPI.getHotelReviews(hotelId, limit, true);
    const reviews = reviewsResult.reviews || [];
    const sentiment = reviewsResult.sentiment;

    console.log(`✅ Got ${reviews.length} real reviews from LiteAPI`);

    // Calculate stats from real reviews
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
      const rounded = Math.round(r.rating || 0) as 1 | 2 | 3 | 4 | 5;
      if (rounded >= 1 && rounded <= 5) ratingDistribution[rounded]++;
    });

    const response = {
      success: true,
      data: reviews,
      reviews: reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      total: reviews.length,
      summary: {
        averageRating: sentiment?.averageScore || Math.round(avgRating * 10) / 10,
        totalReviews: sentiment?.totalReviews || reviews.length,
        ratingDistribution,
        recommendationRate: reviews.length > 0
          ? Math.round((ratingDistribution[4] + ratingDistribution[5]) / reviews.length * 100)
          : 0,
        source: 'liteapi',
        sentiment: sentiment?.overallSentiment || null,
      },
      meta: {
        hotelId,
        hotelName,
        limit,
        version: 'v8-real',
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, {
      headers: {
        'X-Reviews-Version': 'v8-real',
        'X-Reviews-Source': 'liteapi',
        'X-Reviews-Count': String(reviews.length),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error(`❌ Error fetching reviews: ${error.message}`);

    // Return empty reviews on error
    return NextResponse.json({
      success: true,
      data: [],
      reviews: [],
      averageRating: 0,
      total: 0,
      summary: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendationRate: 0,
        source: 'none',
        message: 'Reviews not available',
      },
      meta: {
        hotelId,
        hotelName,
        version: 'v8-real',
        error: error.message,
      },
    }, {
      headers: {
        'X-Reviews-Version': 'v8-real',
        'X-Reviews-Source': 'error',
        'X-Reviews-Count': '0',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}
