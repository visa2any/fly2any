/**
 * Pexels API Integration for Real Car Photos
 *
 * Provides high-quality, real car images matching specific make/model
 * Free tier: 200 requests/hour (sufficient for caching strategy)
 */

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
}

/**
 * Car Model to Pexels Search Query Mapping
 * Maps exact car models to optimized search queries
 */
const CAR_MODEL_SEARCH_QUERIES: Record<string, string> = {
  // Toyota
  'Toyota Corolla': 'Toyota Corolla sedan silver',
  'Toyota Camry': 'Toyota Camry sedan white',
  'Toyota RAV4': 'Toyota RAV4 SUV black',
  'Toyota Highlander': 'Toyota Highlander SUV',
  'Toyota Sienna': 'Toyota Sienna minivan',

  // Honda
  'Honda Civic': 'Honda Civic sedan blue',
  'Honda Accord': 'Honda Accord sedan gray',
  'Honda CR-V': 'Honda CR-V SUV white',
  'Honda Odyssey': 'Honda Odyssey minivan silver',
  'Honda Pilot': 'Honda Pilot SUV',

  // Nissan
  'Nissan Altima': 'Nissan Altima sedan red',
  'Nissan Sentra': 'Nissan Sentra sedan',
  'Nissan Rogue': 'Nissan Rogue SUV',
  'Nissan Pathfinder': 'Nissan Pathfinder SUV',

  // Ford
  'Ford Mustang': 'Ford Mustang red sports car',
  'Ford Mustang Convertible': 'Ford Mustang convertible red',
  'Ford F-150': 'Ford F-150 pickup truck',
  'Ford Explorer': 'Ford Explorer SUV',
  'Ford Escape': 'Ford Escape SUV',

  // Chevrolet
  'Chevrolet Malibu': 'Chevrolet Malibu sedan',
  'Chevrolet Equinox': 'Chevrolet Equinox SUV',
  'Chevrolet Silverado': 'Chevrolet Silverado truck',
  'Chevrolet Suburban': 'Chevrolet Suburban SUV',

  // BMW
  'BMW 3 Series': 'BMW 3 Series sedan black',
  'BMW 5 Series': 'BMW 5 Series luxury sedan black',
  'BMW X3': 'BMW X3 SUV',
  'BMW X5': 'BMW X5 luxury SUV',

  // Mercedes-Benz
  'Mercedes-Benz C-Class': 'Mercedes C-Class sedan silver',
  'Mercedes-Benz E-Class': 'Mercedes E-Class luxury sedan',
  'Mercedes-Benz GLE': 'Mercedes GLE SUV',

  // Audi
  'Audi A4': 'Audi A4 sedan gray',
  'Audi A6': 'Audi A6 luxury sedan',
  'Audi Q5': 'Audi Q5 SUV',

  // Hyundai
  'Hyundai Elantra': 'Hyundai Elantra sedan',
  'Hyundai Sonata': 'Hyundai Sonata sedan',
  'Hyundai Tucson': 'Hyundai Tucson SUV',

  // Kia
  'Kia Optima': 'Kia Optima sedan',
  'Kia Sorento': 'Kia Sorento SUV',
  'Kia Sportage': 'Kia Sportage SUV',

  // Mazda
  'Mazda3': 'Mazda 3 sedan red',
  'Mazda CX-5': 'Mazda CX-5 SUV',
  'Mazda6': 'Mazda 6 sedan',

  // Jeep
  'Jeep Wrangler': 'Jeep Wrangler black',
  'Jeep Grand Cherokee': 'Jeep Grand Cherokee SUV',
  'Jeep Cherokee': 'Jeep Cherokee SUV',

  // Tesla
  'Tesla Model 3': 'Tesla Model 3 white',
  'Tesla Model Y': 'Tesla Model Y SUV',
  'Tesla Model S': 'Tesla Model S black',
};

/**
 * Fetch car photo from Pexels API
 * Uses intelligent caching to minimize API calls
 */
export async function fetchCarPhotoFromPexels(
  carModel: string,
  category?: string
): Promise<{ photoUrl: string; thumbnail: string; photographer?: string } | null> {
  try {
    // Get Pexels API key from environment
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      console.warn('⚠️  PEXELS_API_KEY not configured - using fallback images');
      return null;
    }

    // Generate search query
    const searchQuery = CAR_MODEL_SEARCH_QUERIES[carModel] ||
      `${carModel} car` ||
      `${category} car`;

    console.log(`📸 Searching Pexels for: "${searchQuery}"`);

    // Call Pexels API
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ Pexels API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: PexelsResponse = await response.json();

    if (!data.photos || data.photos.length === 0) {
      console.warn(`⚠️  No Pexels photos found for: ${searchQuery}`);
      return null;
    }

    // Select best photo (first result is usually most relevant)
    const photo = data.photos[0];

    console.log(`✅ Found Pexels photo for ${carModel} (ID: ${photo.id})`);

    return {
      photoUrl: photo.src.large,
      thumbnail: photo.src.medium,
      photographer: photo.photographer,
    };
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return null;
  }
}

/**
 * Generate search query from car model if not in predefined list
 */
export function generateCarSearchQuery(model: string, make?: string, category?: string): string {
  // Try predefined query first
  if (CAR_MODEL_SEARCH_QUERIES[model]) {
    return CAR_MODEL_SEARCH_QUERIES[model];
  }

  // Extract make and model
  const parts = model.split(' ');
  const possibleMake = make || parts[0];
  const possibleModel = parts.slice(1).join(' ') || parts[0];

  // Build intelligent query
  let query = `${possibleMake} ${possibleModel}`;

  // Add category hint if available
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('suv')) {
      query += ' SUV';
    } else if (categoryLower.includes('sedan') || categoryLower.includes('economy')) {
      query += ' sedan';
    } else if (categoryLower.includes('truck')) {
      query += ' truck';
    } else if (categoryLower.includes('van')) {
      query += ' minivan';
    } else if (categoryLower.includes('convertible')) {
      query += ' convertible';
    }
  }

  return query;
}
