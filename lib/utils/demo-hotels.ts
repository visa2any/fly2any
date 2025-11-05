/**
 * Demo Hotel Utilities
 *
 * Handles generation and management of demo/fallback hotel data
 * when real API data is unavailable.
 *
 * Demo Hotel ID Format: demo-hotel-{city-slug}-{index}
 * Examples: demo-hotel-new-york-0, demo-hotel-paris-2
 */

/**
 * Check if a hotel ID is a demo/fallback ID
 */
export function isDemoHotelId(hotelId: string): boolean {
  return hotelId.startsWith('demo-hotel-');
}

/**
 * Extract city and index from demo hotel ID
 * Returns null if ID format is invalid
 */
export function parseDemoHotelId(demoId: string): { city: string; index: number } | null {
  const match = demoId.match(/^demo-hotel-(.+)-(\d+)$/);
  if (!match) return null;

  const [, citySlug, indexStr] = match;
  const city = citySlug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return {
    city,
    index: parseInt(indexStr, 10)
  };
}

/**
 * City to country mapping for demo hotels
 */
const CITY_TO_COUNTRY: Record<string, { country: string; continent: string }> = {
  'New York': { country: 'United States', continent: 'americas' },
  'Miami': { country: 'United States', continent: 'americas' },
  'Los Angeles': { country: 'United States', continent: 'americas' },
  'San Francisco': { country: 'United States', continent: 'americas' },
  'Chicago': { country: 'United States', continent: 'americas' },
  'Toronto': { country: 'Canada', continent: 'americas' },
  'Mexico City': { country: 'Mexico', continent: 'americas' },
  'Cancun': { country: 'Mexico', continent: 'caribbean' },
  'London': { country: 'United Kingdom', continent: 'europe' },
  'Paris': { country: 'France', continent: 'europe' },
  'Rome': { country: 'Italy', continent: 'europe' },
  'Barcelona': { country: 'Spain', continent: 'europe' },
  'Amsterdam': { country: 'Netherlands', continent: 'europe' },
  'Berlin': { country: 'Germany', continent: 'europe' },
  'Prague': { country: 'Czech Republic', continent: 'europe' },
  'Vienna': { country: 'Austria', continent: 'europe' },
  'Tokyo': { country: 'Japan', continent: 'asia-pacific' },
  'Singapore': { country: 'Singapore', continent: 'asia-pacific' },
  'Hong Kong': { country: 'Hong Kong', continent: 'asia-pacific' },
  'Sydney': { country: 'Australia', continent: 'asia-pacific' },
  'Bangkok': { country: 'Thailand', continent: 'asia-pacific' },
  'Dubai': { country: 'United Arab Emirates', continent: 'asia-pacific' },
  'Bali': { country: 'Indonesia', continent: 'beach' },
  'Maldives': { country: 'Maldives', continent: 'beach' },
  'Phuket': { country: 'Thailand', continent: 'beach' },
};

/**
 * Hotel name prefixes for variety
 */
const HOTEL_PREFIXES = [
  'Grand', 'Luxury', 'Premier', 'Elite', 'Boutique', 'Royal',
  'Imperial', 'Majestic', 'Elegant', 'Prestige', 'Heritage', 'Crown'
];

/**
 * Generate realistic amenities based on hotel category
 */
function generateAmenities(valueScore: number, starRating: number): string[] {
  const baseAmenities = ['wifi', 'parking', 'restaurant'];

  if (starRating >= 4) {
    baseAmenities.push('gym', 'pool', 'spa', 'concierge');
  }

  if (starRating >= 5) {
    baseAmenities.push('butler', 'limousine', 'executive_lounge');
  }

  if (valueScore >= 85) {
    baseAmenities.push('breakfast', 'airport_shuttle');
  }

  return baseAmenities;
}

/**
 * Generate realistic review data
 */
function generateReviews(starRating: number, seed: number) {
  const baseReviews = 100 + (seed * 50);
  const rating = Math.min(starRating, 5);
  const reviewRating = rating - 0.3 + (Math.random() * 0.6); // Slight variance from star rating

  return {
    reviewCount: baseReviews,
    reviewRating: Math.min(Math.max(reviewRating, 3.5), 5), // Clamp between 3.5 and 5
  };
}

/**
 * Generate city-appropriate image URL
 */
function getCityImage(city: string): string {
  // Try to find matching destination image
  const cityMap: Record<string, string> = {
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    'Miami': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80',
    'Los Angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    'Paris': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    'Barcelona': 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&q=80',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  };

  return cityMap[city] || 'https://images.unsplash.com/photo-1566073771930-edb4b96bc1d3?w=800&q=80';
}

/**
 * Generate complete demo hotel details from ID
 *
 * This creates a realistic hotel object that matches the structure
 * expected by the hotel details page and booking flow.
 */
export function generateDemoHotelDetails(demoId: string) {
  const parsed = parseDemoHotelId(demoId);
  if (!parsed) {
    throw new Error(`Invalid demo hotel ID format: ${demoId}`);
  }

  const { city, index } = parsed;
  const location = CITY_TO_COUNTRY[city] || { country: 'Unknown', continent: 'all' };

  // Generate consistent values based on city and index
  const seed = city.charCodeAt(0) + index;
  const basePrice = 120 + (index * 30) + (seed % 100);

  // Calculate pricing
  const hasDiscount = seed % 3 === 0;
  const discountPercent = hasDiscount ? 15 + (seed % 20) : 0;
  const originalPrice = hasDiscount ? Math.round(basePrice * (1 + discountPercent / 100)) : undefined;

  // Calculate value score
  const priceRatio = originalPrice ? basePrice / originalPrice : 0.85;
  const valueScore = Math.min(95, Math.round(70 + (1 - priceRatio) * 100));

  // Determine star rating
  const starRating = 3 + (index % 3); // 3-5 stars

  // Generate reviews
  const reviews = generateReviews(starRating, seed);

  // Generate marketing signals
  const trending = seed % 4 === 0;
  const priceDropRecent = hasDiscount && seed % 5 === 0;
  const demandLevel = 60 + (seed % 35);
  const availableRooms = seed % 2 === 0 ? 3 + (seed % 5) : 10 + (seed % 20);

  // Social proof
  const viewersLast24h = trending ? 150 + (seed % 300) : 50 + (seed % 100);
  const bookingsLast24h = trending ? 15 + (seed % 20) : 5 + (seed % 10);

  // Generate amenities
  const amenities = generateAmenities(valueScore, starRating);

  // Hotel name
  const prefix = HOTEL_PREFIXES[index % HOTEL_PREFIXES.length];
  const name = `${prefix} Hotel ${city}`;

  // Generate multiple images for gallery
  const mainImage = getCityImage(city);
  const images = [
    { url: mainImage, caption: 'Hotel Exterior' },
    { url: mainImage.replace('w=800', 'w=800&crop=entropy'), caption: 'Lobby' },
    { url: mainImage.replace('w=800', 'w=800&crop=faces'), caption: 'Guest Room' },
    { url: mainImage.replace('w=800', 'w=800&crop=edges'), caption: 'Pool Area' },
  ];

  // Return complete hotel object matching HotelEnhanced interface
  return {
    id: demoId,
    name,
    city,
    country: location.country,
    continent: location.continent,
    category: starRating >= 5 ? ['luxury', 'business'] : starRating >= 4 ? ['business', 'leisure'] : ['leisure', 'budget'],

    // Pricing
    pricePerNight: basePrice,
    originalPrice,
    lowestRate: {
      price: basePrice,
      currency: 'USD',
      taxesIncluded: true,
    },

    // ML Features
    valueScore,

    // Marketing Signals
    demandLevel,
    availableRooms,
    trending,
    priceDropRecent,

    // Social Proof
    viewersLast24h,
    bookingsLast24h,

    // Hotel Data
    mainImage,
    images,
    starRating,
    reviewRating: reviews.reviewRating,
    reviewCount: reviews.reviewCount,
    amenities,

    // Location
    address: {
      line1: `${100 + index} Main Street`,
      city,
      country: location.country,
      postalCode: `${10000 + seed}`,
    },
    location: {
      lat: 40.7128 + (seed % 10) - 5, // Rough coordinates
      lng: -74.0060 + (seed % 10) - 5,
    },

    // Additional details for booking page
    description: `Experience luxury and comfort at ${name}, located in the heart of ${city}. Perfect for both business and leisure travelers, our hotel offers world-class amenities and exceptional service.`,

    checkInTime: '15:00',
    checkOutTime: '11:00',

    policies: {
      cancellation: 'Free cancellation up to 24 hours before check-in',
      deposit: 'No deposit required',
      pets: starRating >= 4 ? 'Pets allowed with fee' : 'No pets allowed',
    },

    // Demo flag for internal use
    _isDemoData: true,
    _demoSource: 'Generated from demo-hotels utility',
  };
}

/**
 * Get demo hotel summary (lightweight version for listings)
 */
export function getDemoHotelSummary(demoId: string) {
  const details = generateDemoHotelDetails(demoId);

  // Return only fields needed for card display
  return {
    id: details.id,
    name: details.name,
    city: details.city,
    country: details.country,
    continent: details.continent,
    pricePerNight: details.pricePerNight,
    originalPrice: details.originalPrice,
    valueScore: details.valueScore,
    mainImage: details.mainImage,
    starRating: details.starRating,
    reviewRating: details.reviewRating,
    reviewCount: details.reviewCount,
    trending: details.trending,
    priceDropRecent: details.priceDropRecent,
  };
}

/**
 * Validate demo hotel ID format
 */
export function validateDemoHotelId(demoId: string): { valid: boolean; error?: string } {
  if (!isDemoHotelId(demoId)) {
    return { valid: false, error: 'ID does not start with demo-hotel-' };
  }

  const parsed = parseDemoHotelId(demoId);
  if (!parsed) {
    return { valid: false, error: 'Invalid ID format. Expected: demo-hotel-{city}-{index}' };
  }

  return { valid: true };
}
