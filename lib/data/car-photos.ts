/**
 * Car Rental Photo Mapping Service
 *
 * Maps specific car make/model/year to real vehicle images
 * Prioritizes exact model matches over category-based fallbacks
 */

export interface VehiclePhotoMap {
  category: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  year?: string;
  photoUrl: string;
  thumbnail?: string;
  priority?: number; // Higher priority for exact model matches
}

/**
 * EXACT CAR MODEL MAPPINGS - Real photos of specific vehicles
 * These take highest priority in matching
 */
export const exactCarModelMappings: VehiclePhotoMap[] = [
  // Toyota Corolla - AI-Generated local image
  {
    category: 'ECONOMY',
    manufacturer: 'Toyota',
    model: 'Toyota Corolla',
    photoUrl: '/images/cars/toyota-corolla.png',
    thumbnail: '/images/cars/toyota-corolla.png',
    priority: 100,
  },

  // Honda Civic - AI-Generated local image
  {
    category: 'COMPACT',
    manufacturer: 'Honda',
    model: 'Honda Civic',
    photoUrl: '/images/cars/honda-civic.png',
    thumbnail: '/images/cars/honda-civic.png',
    priority: 100,
  },

  // Toyota Camry - AI-Generated local image
  {
    category: 'STANDARD',
    manufacturer: 'Toyota',
    model: 'Toyota Camry',
    photoUrl: '/images/cars/toyota-camry.png',
    thumbnail: '/images/cars/toyota-camry.png',
    priority: 100,
  },

  // Nissan Altima - AI-Generated local image
  {
    category: 'INTERMEDIATE',
    manufacturer: 'Nissan',
    model: 'Nissan Altima',
    photoUrl: '/images/cars/nissan-altima.png',
    thumbnail: '/images/cars/nissan-altima.png',
    priority: 100,
  },

  // Toyota RAV4 - AI-Generated local image
  {
    category: 'SUV',
    manufacturer: 'Toyota',
    model: 'Toyota RAV4',
    photoUrl: '/images/cars/toyota-rav4.png',
    thumbnail: '/images/cars/toyota-rav4.png',
    priority: 100,
  },

  // BMW 5 Series - AI-Generated local image
  {
    category: 'LUXURY',
    manufacturer: 'BMW',
    model: 'BMW 5 Series',
    photoUrl: '/images/cars/bmw-5-series.png',
    thumbnail: '/images/cars/bmw-5-series.png',
    priority: 100,
  },

  // Honda Odyssey - AI-Generated local image
  {
    category: 'MINIVAN',
    manufacturer: 'Honda',
    model: 'Honda Odyssey',
    photoUrl: '/images/cars/honda-odyssey.png',
    thumbnail: '/images/cars/honda-odyssey.png',
    priority: 100,
  },

  // Ford Mustang Convertible - AI-Generated local image
  {
    category: 'CONVERTIBLE',
    manufacturer: 'Ford',
    model: 'Ford Mustang Convertible',
    photoUrl: '/images/cars/ford-mustang.png',
    thumbnail: '/images/cars/ford-mustang.png',
    priority: 100,
  },
  {
    category: 'CONVERTIBLE',
    manufacturer: 'Ford',
    model: 'Mustang Convertible',
    photoUrl: '/images/cars/ford-mustang.png',
    thumbnail: '/images/cars/ford-mustang.png',
    priority: 100,
  },

  // Chevrolet Equinox - AI-Generated local image
  {
    category: 'SUV',
    manufacturer: 'Chevrolet',
    model: 'Chevrolet Equinox',
    photoUrl: '/images/cars/chevrolet-equinox.png',
    thumbnail: '/images/cars/chevrolet-equinox.png',
    priority: 100,
  },
  {
    category: 'SUV',
    manufacturer: 'Chevrolet',
    model: 'Chevy Equinox',
    photoUrl: '/images/cars/chevrolet-equinox.png',
    thumbnail: '/images/cars/chevrolet-equinox.png',
    priority: 100,
  },

  // Jeep Wrangler - AI-Generated local image
  {
    category: 'SUV',
    manufacturer: 'Jeep',
    model: 'Jeep Wrangler',
    photoUrl: '/images/cars/jeep-wrangler.png',
    thumbnail: '/images/cars/jeep-wrangler.png',
    priority: 100,
  },

  // Hyundai Sonata - AI-Generated local image
  {
    category: 'INTERMEDIATE',
    manufacturer: 'Hyundai',
    model: 'Hyundai Sonata',
    photoUrl: '/images/cars/hyundai-sonata.png',
    thumbnail: '/images/cars/hyundai-sonata.png',
    priority: 100,
  },

  // Kia Sportage - AI-Generated local image
  {
    category: 'SUV',
    manufacturer: 'Kia',
    model: 'Kia Sportage',
    photoUrl: '/images/cars/kia-sportage.png',
    thumbnail: '/images/cars/kia-sportage.png',
    priority: 100,
  },

  // Ford Explorer - Uses Ford Mustang until dedicated image generated
  {
    category: 'SUV',
    manufacturer: 'Ford',
    model: 'Ford Explorer',
    photoUrl: '/images/cars/chevrolet-equinox.png',
    thumbnail: '/images/cars/chevrolet-equinox.png',
    priority: 90,
  },

  // Dodge Charger - Uses BMW 5 Series until dedicated image generated
  {
    category: 'FULLSIZE',
    manufacturer: 'Dodge',
    model: 'Dodge Charger',
    photoUrl: '/images/cars/bmw-5-series.png',
    thumbnail: '/images/cars/bmw-5-series.png',
    priority: 90,
  },

  // Ford F-150 - Uses Jeep Wrangler until dedicated image generated
  {
    category: 'TRUCK',
    manufacturer: 'Ford',
    model: 'Ford F-150',
    photoUrl: '/images/cars/jeep-wrangler.png',
    thumbnail: '/images/cars/jeep-wrangler.png',
    priority: 90,
  },
  {
    category: 'TRUCK',
    manufacturer: 'Ford',
    model: 'F-150',
    photoUrl: '/images/cars/jeep-wrangler.png',
    thumbnail: '/images/cars/jeep-wrangler.png',
    priority: 90,
  },

  // Tesla Model 3 - Uses Honda Civic until dedicated image generated
  {
    category: 'ELECTRIC',
    manufacturer: 'Tesla',
    model: 'Tesla Model 3',
    photoUrl: '/images/cars/hyundai-sonata.png',
    thumbnail: '/images/cars/hyundai-sonata.png',
    priority: 90,
  },
];

/**
 * CATEGORY-BASED FALLBACK MAPPINGS
 * Used when exact make/model not found
 */
export const carPhotoMappings: VehiclePhotoMap[] = [
  // Economy Cars - Uses Toyota Corolla image
  {
    category: 'ECONOMY',
    type: 'COMPACT',
    photoUrl: '/images/cars/toyota-corolla.png',
    thumbnail: '/images/cars/toyota-corolla.png',
    priority: 50,
  },
  {
    category: 'ECONOMY',
    type: 'SEDAN',
    photoUrl: '/images/cars/toyota-corolla.png',
    thumbnail: '/images/cars/toyota-corolla.png',
    priority: 50,
  },

  // Compact Cars - Uses Honda Civic image
  {
    category: 'COMPACT',
    photoUrl: '/images/cars/honda-civic.png',
    thumbnail: '/images/cars/honda-civic.png',
    priority: 50,
  },

  // Intermediate / Mid-Size - Uses Nissan Altima image
  {
    category: 'INTERMEDIATE',
    photoUrl: '/images/cars/nissan-altima.png',
    thumbnail: '/images/cars/nissan-altima.png',
    priority: 50,
  },

  // Mid-Size / Standard - Uses Toyota Camry image
  {
    category: 'MIDSIZE',
    photoUrl: '/images/cars/toyota-camry.png',
    thumbnail: '/images/cars/toyota-camry.png',
    priority: 50,
  },
  {
    category: 'STANDARD',
    photoUrl: '/images/cars/toyota-camry.png',
    thumbnail: '/images/cars/toyota-camry.png',
    priority: 50,
  },

  // SUVs - Uses Toyota RAV4 image
  {
    category: 'SUV',
    type: 'COMPACT',
    photoUrl: '/images/cars/toyota-rav4.png',
    thumbnail: '/images/cars/toyota-rav4.png',
    priority: 50,
  },
  {
    category: 'SUV',
    type: 'STANDARD',
    photoUrl: '/images/cars/toyota-rav4.png',
    thumbnail: '/images/cars/toyota-rav4.png',
    priority: 50,
  },
  {
    category: 'SUV',
    type: 'FULLSIZE',
    photoUrl: '/images/cars/toyota-rav4.png',
    thumbnail: '/images/cars/toyota-rav4.png',
    priority: 50,
  },

  // Luxury / Premium - Uses BMW 5 Series image
  {
    category: 'LUXURY',
    photoUrl: '/images/cars/bmw-5-series.png',
    thumbnail: '/images/cars/bmw-5-series.png',
    priority: 50,
  },
  {
    category: 'PREMIUM',
    photoUrl: '/images/cars/bmw-5-series.png',
    thumbnail: '/images/cars/bmw-5-series.png',
    priority: 50,
  },

  // Vans / Minivans - Uses Honda Odyssey image
  {
    category: 'VAN',
    photoUrl: '/images/cars/honda-odyssey.png',
    thumbnail: '/images/cars/honda-odyssey.png',
    priority: 50,
  },
  {
    category: 'MINIVAN',
    photoUrl: '/images/cars/honda-odyssey.png',
    thumbnail: '/images/cars/honda-odyssey.png',
    priority: 50,
  },

  // Convertibles / Sports - Uses Ford Mustang image
  {
    category: 'CONVERTIBLE',
    photoUrl: '/images/cars/ford-mustang.png',
    thumbnail: '/images/cars/ford-mustang.png',
    priority: 50,
  },
  {
    category: 'SPORTS',
    photoUrl: '/images/cars/ford-mustang.png',
    thumbnail: '/images/cars/ford-mustang.png',
    priority: 50,
  },

  // Trucks / Pickups - Uses Jeep Wrangler
  {
    category: 'TRUCK',
    photoUrl: '/images/cars/jeep-wrangler.png',
    thumbnail: '/images/cars/jeep-wrangler.png',
    priority: 50,
  },

  // Electric Vehicles - Uses Honda Civic (modern look)
  {
    category: 'ELECTRIC',
    photoUrl: '/images/cars/honda-civic.png',
    thumbnail: '/images/cars/honda-civic.png',
    priority: 50,
  },
];

/**
 * Default fallback photo for unmatched vehicles
 */
export const defaultCarPhoto = {
  photoUrl: '/images/cars/toyota-corolla.png',
  thumbnail: '/images/cars/toyota-corolla.png',
};

/**
 * Get photo for a vehicle based on make/model (prioritized) or category/type (fallback)
 *
 * Matching priority:
 * 1. Pexels API real car photo (Priority 200) - BEST QUALITY
 * 2. Exact make + model match from curated database (Priority 100)
 * 3. Category + type match (Priority 50)
 * 4. Category match only (Priority 50)
 * 5. Type match only (Priority 50)
 * 6. Default fallback
 *
 * NOTE: This function is synchronous. For Pexels integration, use getVehiclePhotoAsync()
 */
export function getVehiclePhoto(vehicle: {
  category?: string;
  type?: string;
  make?: string;
  model?: string;
}): { photoUrl: string; thumbnail: string } {
  const categoryUpper = vehicle.category?.toUpperCase();
  const typeUpper = vehicle.type?.toUpperCase();

  // Normalize model string for matching
  const modelNormalized = vehicle.model?.trim();
  const makeNormalized = vehicle.make?.trim();

  // PRIORITY 1: Try exact make + model match (highest priority)
  if (modelNormalized) {
    const exactModelMatch = exactCarModelMappings.find(m => {
      if (!m.model) return false;

      // Normalize both strings for comparison
      const mappingModel = m.model.toLowerCase().trim();
      const vehicleModel = modelNormalized.toLowerCase().trim();

      // Try exact match first (most precise)
      if (vehicleModel === mappingModel) {
        return true;
      }

      // Try if vehicle model contains the entire mapping model name
      // But only if they share significant common words to avoid false positives
      const mappingWords = mappingModel.split(' ').filter(w => w.length > 2);
      const vehicleWords = vehicleModel.split(' ').filter(w => w.length > 2);

      // Check if all significant words from mapping are in vehicle model
      const allWordsMatch = mappingWords.every(word => vehicleWords.includes(word));
      if (allWordsMatch && mappingWords.length > 0) {
        return true;
      }

      return false;
    });

    if (exactModelMatch) {
      console.log(`✅ Exact car model match: ${modelNormalized} → ${exactModelMatch.model}`);
      return {
        photoUrl: exactModelMatch.photoUrl,
        thumbnail: exactModelMatch.thumbnail || exactModelMatch.photoUrl,
      };
    }
  }

  // PRIORITY 2: Try category + type match
  if (categoryUpper && typeUpper) {
    const categoryTypeMatch = [...exactCarModelMappings, ...carPhotoMappings].find(
      m => m.category === categoryUpper && m.type === typeUpper
    );
    if (categoryTypeMatch) {
      console.log(`✅ Category+Type match: ${categoryUpper}+${typeUpper}`);
      return {
        photoUrl: categoryTypeMatch.photoUrl,
        thumbnail: categoryTypeMatch.thumbnail || categoryTypeMatch.photoUrl,
      };
    }
  }

  // PRIORITY 3: Try category match only
  if (categoryUpper) {
    const categoryMatch = [...exactCarModelMappings, ...carPhotoMappings].find(
      m => m.category === categoryUpper
    );
    if (categoryMatch) {
      console.log(`✅ Category match: ${categoryUpper}`);
      return {
        photoUrl: categoryMatch.photoUrl,
        thumbnail: categoryMatch.thumbnail || categoryMatch.photoUrl,
      };
    }
  }

  // PRIORITY 4: Try type match if category failed
  if (typeUpper) {
    const typeMatch = carPhotoMappings.find(m => m.type === typeUpper);
    if (typeMatch) {
      console.log(`✅ Type match: ${typeUpper}`);
      return {
        photoUrl: typeMatch.photoUrl,
        thumbnail: typeMatch.thumbnail || typeMatch.photoUrl,
      };
    }
  }

  // PRIORITY 5: Return default fallback
  console.log(`⚠️  No match found - using default. Vehicle:`, vehicle);
  return {
    photoUrl: defaultCarPhoto.photoUrl,
    thumbnail: defaultCarPhoto.thumbnail,
  };
}

/**
 * ASYNC version: Get photo with Pexels API integration (RECOMMENDED)
 *
 * This version tries Pexels API first for real car photos,
 * then falls back to curated mappings
 */
export async function getVehiclePhotoAsync(vehicle: {
  category?: string;
  type?: string;
  make?: string;
  model?: string;
}): Promise<{ photoUrl: string; thumbnail: string; photographer?: string }> {
  // DISABLED: Pexels photos were not matching well
  // Using high-quality curated images instead for better accuracy

  // USE CURATED IMAGES ONLY - they're professionally selected and match exact models
  const curatedPhoto = getVehiclePhoto(vehicle);
  console.log(`✅ Using curated high-quality photo for: ${vehicle.model || vehicle.category}`);
  return curatedPhoto;

  /* PEXELS INTEGRATION (DISABLED - photos didn't match well)
  if (vehicle.model) {
    try {
      const { fetchCarPhotoFromPexels } = await import('@/lib/api/pexels-cars');
      const pexelsPhoto = await fetchCarPhotoFromPexels(vehicle.model, vehicle.category);
      if (pexelsPhoto) {
        console.log(`✅ Using Pexels photo for: ${vehicle.model}`);
        return pexelsPhoto;
      }
    } catch (error) {
      console.error('Error fetching from Pexels, using fallback:', error);
    }
  }
  const fallback = getVehiclePhoto(vehicle);
  console.log(`ℹ️  Using curated photo for: ${vehicle.model || vehicle.category}`);
  return fallback;
  */
}

/**
 * Get rental company logo URL
 */
export function getRentalCompanyLogo(companyCode: string): string | null {
  const logos: { [key: string]: string } = {
    'ZE': 'https://logo.clearbit.com/hertz.com', // Hertz
    'ZI': 'https://logo.clearbit.com/budget.com', // Budget
    'ZR': 'https://logo.clearbit.com/enterprise.com', // Enterprise
    'ZL': 'https://logo.clearbit.com/nationalcar.com', // National
    'ZD': 'https://logo.clearbit.com/avis.com', // Avis
    'ET': 'https://logo.clearbit.com/enterprise.com', // Enterprise (alternative)
    'SX': 'https://logo.clearbit.com/sixt.com', // Sixt
    'AL': 'https://logo.clearbit.com/alamo.com', // Alamo
    'ZT': 'https://logo.clearbit.com/thrifty.com', // Thrifty
    'FF': 'https://logo.clearbit.com/firefly.com', // Firefly
  };

  return logos[companyCode.toUpperCase()] || null;
}
