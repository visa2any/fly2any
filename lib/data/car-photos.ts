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
  // Toyota Corolla - Various years
  {
    category: 'ECONOMY',
    manufacturer: 'Toyota',
    model: 'Toyota Corolla',
    photoUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
    priority: 100,
  },

  // Honda Civic - Modern compact sedan
  {
    category: 'COMPACT',
    manufacturer: 'Honda',
    model: 'Honda Civic',
    photoUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&h=300&fit=crop',
    priority: 100,
  },

  // Toyota Camry - Mid-size sedan
  {
    category: 'STANDARD',
    manufacturer: 'Toyota',
    model: 'Toyota Camry',
    photoUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=300&fit=crop',
    priority: 100,
  },

  // Nissan Altima - Mid-size sedan
  {
    category: 'INTERMEDIATE',
    manufacturer: 'Nissan',
    model: 'Nissan Altima',
    photoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=300&fit=crop',
    priority: 100,
  },

  // Toyota RAV4 - Compact SUV
  {
    category: 'SUV',
    manufacturer: 'Toyota',
    model: 'Toyota RAV4',
    photoUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop',
    priority: 100,
  },

  // BMW 5 Series - Luxury sedan
  {
    category: 'LUXURY',
    manufacturer: 'BMW',
    model: 'BMW 5 Series',
    photoUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    priority: 100,
  },

  // Honda Odyssey - Minivan
  {
    category: 'MINIVAN',
    manufacturer: 'Honda',
    model: 'Honda Odyssey',
    photoUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&h=300&fit=crop',
    priority: 100,
  },

  // Ford Mustang Convertible - Sports car
  {
    category: 'CONVERTIBLE',
    manufacturer: 'Ford',
    model: 'Ford Mustang Convertible',
    photoUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d43c1?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d43c1?w=400&h=300&fit=crop',
    priority: 100,
  },
  {
    category: 'CONVERTIBLE',
    manufacturer: 'Ford',
    model: 'Mustang Convertible',
    photoUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d43c1?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d43c1?w=400&h=300&fit=crop',
    priority: 100,
  },
];

/**
 * CATEGORY-BASED FALLBACK MAPPINGS
 * Used when exact make/model not found
 */
export const carPhotoMappings: VehiclePhotoMap[] = [
  // Economy Cars - Small, fuel-efficient sedans
  {
    category: 'ECONOMY',
    type: 'COMPACT',
    photoUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
    priority: 50,
  },
  {
    category: 'ECONOMY',
    type: 'SEDAN',
    photoUrl: 'https://images.unsplash.com/photo-1552519507-e0b8e4b74fbb?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1552519507-e0b8e4b74fbb?w=400&h=300&fit=crop',
    priority: 50,
  },

  // Compact Cars (Honda Civic, Toyota Corolla style)
  {
    category: 'COMPACT',
    photoUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&h=300&fit=crop',
    priority: 50,
  },

  // Intermediate / Mid-Size (Nissan Altima, Toyota Camry style)
  {
    category: 'INTERMEDIATE',
    photoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=300&fit=crop',
    priority: 50,
  },

  // Mid-Size / Standard (Family sedans)
  {
    category: 'MIDSIZE',
    photoUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=300&fit=crop',
    priority: 50,
  },
  {
    category: 'STANDARD',
    photoUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=300&fit=crop',
    priority: 50,
  },

  // SUVs (Toyota RAV4, Honda CR-V style)
  {
    category: 'SUV',
    type: 'COMPACT',
    photoUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop',
    priority: 50,
  },
  {
    category: 'SUV',
    type: 'STANDARD',
    photoUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop',
    priority: 50,
  },
  {
    category: 'SUV',
    type: 'FULLSIZE',
    photoUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    priority: 50,
  },

  // Luxury / Premium (BMW, Mercedes, Audi style)
  {
    category: 'LUXURY',
    photoUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    priority: 50,
  },
  {
    category: 'PREMIUM',
    photoUrl: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400&h=300&fit=crop',
    priority: 50,
  },

  // Vans / Minivans (Honda Odyssey, Toyota Sienna style)
  {
    category: 'VAN',
    photoUrl: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=300&fit=crop',
    priority: 50,
  },
  {
    category: 'MINIVAN',
    photoUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&h=300&fit=crop',
    priority: 50,
  },

  // Convertibles / Sports (Ford Mustang, Chevy Camaro style)
  {
    category: 'CONVERTIBLE',
    photoUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d43c1?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d43c1?w=400&h=300&fit=crop',
    priority: 50,
  },
  {
    category: 'SPORTS',
    photoUrl: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&h=300&fit=crop',
    priority: 50,
  },

  // Trucks / Pickups (F-150, Silverado style)
  {
    category: 'TRUCK',
    photoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
    priority: 50,
  },

  // Electric Vehicles (Tesla, EV style)
  {
    category: 'ELECTRIC',
    photoUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop',
    priority: 50,
  },
];

/**
 * Default fallback photo for unmatched vehicles
 */
export const defaultCarPhoto = {
  photoUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop&crop=entropy&auto=format,compress',
  thumbnail: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop&crop=entropy',
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
