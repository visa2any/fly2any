/**
 * Mock Car Rental Data Generator
 *
 * IMPORTANT: This mock data is used because Amadeus Car Rental API
 * has no test data available in the test environment.
 *
 * The data structure matches the Amadeus API v1/shopping/car-rentals response
 * format exactly, so we can seamlessly switch to real API in production.
 *
 * Amadeus API Credentials (same for all services):
 * - API Key: MOytyHr4qQXNogQWbruaE0MtmGeigCd3
 * - API Secret: exUkoGmSGbyiiOji
 * - Environment: test (for development) / production (for live)
 */

export interface AmadeusCarRentalVehicle {
  description: string;
  category: string; // MINI, ECONOMY, COMPACT, INTERMEDIATE, STANDARD, FULL_SIZE, PREMIUM, LUXURY, SUV, VAN
  transmission: string; // AUTOMATIC, MANUAL
  airConditioning: boolean;
  seats: number;
  doors: number;
  fuelType: string; // PETROL, DIESEL, HYBRID, ELECTRIC
  imageURL?: string;
}

export interface AmadeusCarRentalProvider {
  companyCode: string; // ZE = Hertz, ZI = Avis, ZD = Budget, ZR = National, ZL = Alamo, ZT = Thrifty, ZF = Enterprise
  companyName: string;
  logoURL?: string;
}

export interface AmadeusCarRentalPrice {
  currency: string;
  total: string; // Total price for the rental period
  perDay: string; // Price per day
  base: string; // Base price before taxes
  taxes: string; // Total taxes and fees
}

export interface AmadeusCarRental {
  id: string;
  vehicle: AmadeusCarRentalVehicle;
  provider: AmadeusCarRentalProvider;
  price: AmadeusCarRentalPrice;
  pickupLocation: {
    code: string;
    name: string;
    address: string;
  };
  dropoffLocation: {
    code: string;
    name: string;
    address: string;
  };
  pickupDateTime: string;
  dropoffDateTime: string;
  mileage: {
    unlimited: boolean;
    limit?: number;
    unit?: string;
  };
  insurance: {
    included: boolean;
    type?: string;
  };
  features: string[];
  rating?: number; // Customer rating 1-5
  reviewCount?: number;
  badges?: string[]; // e.g., "instant_confirmation", "free_cancellation", "popular"
}

export interface AmadeusCarRentalResponse {
  data: AmadeusCarRental[];
  meta: {
    count: number;
    mockData: boolean;
    note: string;
  };
  dictionaries?: {
    categories: Record<string, string>;
    providers: Record<string, string>;
  };
}

/**
 * Generate realistic car rental mock data
 */
export function generateMockCarRentals(params: {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime?: string;
  dropoffTime?: string;
}): AmadeusCarRentalResponse {
  const days = calculateDays(params.pickupDate, params.dropoffDate);

  // Define car inventory with realistic data and REAL Unsplash photos
  const carInventory = [
    {
      vehicle: {
        description: 'Toyota Camry or Similar',
        category: 'STANDARD',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 5,
        doors: 4,
        fuelType: 'PETROL',
        // Real Toyota Camry sedan photo
        imageURL: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
      },
      provider: {
        companyCode: 'ZF',
        companyName: 'Enterprise',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Enterprise_Rent-A-Car_logo.svg/200px-Enterprise_Rent-A-Car_logo.svg.png',
      },
      basePricePerDay: 45,
      rating: 4.5,
      reviewCount: 1243,
      features: ['AC', 'Bluetooth', 'Cruise Control', 'USB Ports'],
      badges: ['popular', 'instant_confirmation'],
    },
    {
      vehicle: {
        description: 'Honda CR-V or Similar',
        category: 'SUV',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 7,
        doors: 4,
        fuelType: 'HYBRID',
        // Real Honda CR-V SUV photo
        imageURL: 'https://images.unsplash.com/photo-1568844293986-8c3a92e8ea4c?w=800&q=80',
      },
      provider: {
        companyCode: 'ZE',
        companyName: 'Hertz',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png',
      },
      basePricePerDay: 65,
      totalPrice: days * 58,
      rating: 4.7,
      reviewCount: 892,
      features: ['AC', 'Bluetooth', 'GPS', 'Apple CarPlay', 'Backup Camera'],
      badges: ['eco_friendly', 'instant_confirmation'],
    },
    {
      vehicle: {
        description: 'Ford Mustang Convertible',
        category: 'PREMIUM',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 4,
        doors: 2,
        fuelType: 'PETROL',
        // Real Ford Mustang convertible photo
        imageURL: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d718c?w=800&q=80',
      },
      provider: {
        companyCode: 'ZI',
        companyName: 'Avis',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png',
      },
      basePricePerDay: 89,
      rating: 4.8,
      reviewCount: 567,
      features: ['AC', 'Bluetooth', 'Premium Audio', 'Convertible Top', 'Sport Mode'],
      badges: ['luxury', 'instant_confirmation'],
    },
    {
      vehicle: {
        description: 'Tesla Model 3 Long Range',
        category: 'LUXURY',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 5,
        doors: 4,
        fuelType: 'ELECTRIC',
        // Real Tesla Model 3 photo
        imageURL: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
      },
      provider: {
        companyCode: 'ZE',
        companyName: 'Hertz',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png',
      },
      basePricePerDay: 120,
      totalPrice: days * 105,
      rating: 4.9,
      reviewCount: 421,
      features: ['AC', 'Autopilot', 'Premium Sound', 'Supercharger Access', 'WiFi Hotspot'],
      badges: ['eco_friendly', 'luxury', 'instant_confirmation'],
    },
    {
      vehicle: {
        description: 'Chevrolet Spark or Similar',
        category: 'ECONOMY',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 4,
        doors: 4,
        fuelType: 'PETROL',
        // Economy compact car photo
        imageURL: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
      },
      provider: {
        companyCode: 'ZD',
        companyName: 'Budget',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Budget_logo.svg/200px-Budget_logo.svg.png',
      },
      basePricePerDay: 35,
      rating: 4.2,
      reviewCount: 1567,
      features: ['AC', 'Bluetooth', 'USB Ports'],
      badges: ['best_value', 'instant_confirmation'],
    },
    {
      vehicle: {
        description: 'Mercedes-Benz E-Class',
        category: 'LUXURY',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 5,
        doors: 4,
        fuelType: 'DIESEL',
        // Real Mercedes E-Class photo
        imageURL: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      },
      provider: {
        companyCode: 'ZI',
        companyName: 'Avis',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png',
      },
      basePricePerDay: 150,
      totalPrice: days * 130,
      rating: 4.9,
      reviewCount: 342,
      features: ['AC', 'Leather Seats', 'Premium Sound', 'Massage Seats', 'Ambient Lighting', 'Panoramic Roof'],
      badges: ['luxury', 'instant_confirmation', 'vip'],
    },
    {
      vehicle: {
        description: 'Toyota RAV4 Hybrid',
        category: 'SUV',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 5,
        doors: 4,
        fuelType: 'HYBRID',
        // Real Toyota RAV4 SUV photo
        imageURL: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
      },
      provider: {
        companyCode: 'ZF',
        companyName: 'Enterprise',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Enterprise_Rent-A-Car_logo.svg/200px-Enterprise_Rent-A-Car_logo.svg.png',
      },
      basePricePerDay: 70,
      rating: 4.6,
      reviewCount: 789,
      features: ['AC', 'Bluetooth', 'GPS', 'Backup Camera', 'Blind Spot Monitor'],
      badges: ['eco_friendly', 'popular', 'instant_confirmation'],
    },
    {
      vehicle: {
        description: 'Honda Civic or Similar',
        category: 'COMPACT',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 5,
        doors: 4,
        fuelType: 'PETROL',
        // Real Honda Civic compact sedan photo
        imageURL: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&q=80',
      },
      provider: {
        companyCode: 'ZL',
        companyName: 'Alamo',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Alamo_Rent_A_Car_logo.svg/200px-Alamo_Rent_A_Car_logo.svg.png',
      },
      basePricePerDay: 42,
      rating: 4.4,
      reviewCount: 1124,
      features: ['AC', 'Bluetooth', 'Cruise Control', 'Keyless Entry'],
      badges: ['popular', 'instant_confirmation'],
    },
    {
      vehicle: {
        description: 'Dodge Grand Caravan',
        category: 'VAN',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 7,
        doors: 4,
        fuelType: 'PETROL',
        // Real minivan photo
        imageURL: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
      },
      provider: {
        companyCode: 'ZD',
        companyName: 'Budget',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Budget_logo.svg/200px-Budget_logo.svg.png',
      },
      basePricePerDay: 75,
      rating: 4.3,
      reviewCount: 456,
      features: ['AC', 'Bluetooth', 'Rear Entertainment', 'Stow n Go Seating', 'Backup Camera'],
      badges: ['family_friendly', 'instant_confirmation'],
    },
    {
      vehicle: {
        description: 'Nissan Versa or Similar',
        category: 'ECONOMY',
        transmission: 'AUTOMATIC',
        airConditioning: true,
        seats: 5,
        doors: 4,
        fuelType: 'PETROL',
        // Economy sedan photo
        imageURL: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
      },
      provider: {
        companyCode: 'ZR',
        companyName: 'National',
        logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/National_Car_Rental_logo.svg/200px-National_Car_Rental_logo.svg.png',
      },
      basePricePerDay: 38,
      rating: 4.1,
      reviewCount: 987,
      features: ['AC', 'Bluetooth', 'USB Ports'],
      badges: ['best_value', 'instant_confirmation'],
    },
  ];

  // Generate car rental offers
  const carRentals: AmadeusCarRental[] = carInventory.map((car, index) => {
    const totalPrice = car.totalPrice || car.basePricePerDay * days;
    const basePrice = totalPrice * 0.85; // 85% base, 15% taxes
    const taxes = totalPrice - basePrice;

    return {
      id: `CAR_${params.pickupLocation}_${index + 1}_${Date.now()}`,
      vehicle: car.vehicle,
      provider: car.provider,
      price: {
        currency: 'USD',
        total: totalPrice.toFixed(2),
        perDay: (totalPrice / days).toFixed(2),
        base: basePrice.toFixed(2),
        taxes: taxes.toFixed(2),
      },
      pickupLocation: {
        code: params.pickupLocation,
        name: `${params.pickupLocation} Airport`,
        address: `${params.pickupLocation} International Airport, Terminal 1`,
      },
      dropoffLocation: {
        code: params.dropoffLocation || params.pickupLocation,
        name: `${params.dropoffLocation || params.pickupLocation} Airport`,
        address: `${params.dropoffLocation || params.pickupLocation} International Airport, Terminal 1`,
      },
      pickupDateTime: `${params.pickupDate}T${params.pickupTime || '10:00:00'}`,
      dropoffDateTime: `${params.dropoffDate}T${params.dropoffTime || '10:00:00'}`,
      mileage: {
        unlimited: car.provider.companyCode !== 'ZD', // Budget has limited mileage
        limit: car.provider.companyCode === 'ZD' ? 200 * days : undefined,
        unit: 'miles',
      },
      insurance: {
        included: car.vehicle.category === 'LUXURY' || car.vehicle.category === 'PREMIUM',
        type: car.vehicle.category === 'LUXURY' ? 'Comprehensive' : car.vehicle.category === 'PREMIUM' ? 'Collision' : undefined,
      },
      features: car.features,
      rating: car.rating,
      reviewCount: car.reviewCount,
      badges: car.badges,
    };
  });

  return {
    data: carRentals,
    meta: {
      count: carRentals.length,
      mockData: true,
      note: 'Mock data used - Amadeus Car Rental API has no test data. Same credentials work in production with live data.',
    },
    dictionaries: {
      categories: {
        MINI: 'Mini',
        ECONOMY: 'Economy',
        COMPACT: 'Compact',
        INTERMEDIATE: 'Intermediate',
        STANDARD: 'Standard',
        FULL_SIZE: 'Full Size',
        PREMIUM: 'Premium',
        LUXURY: 'Luxury',
        SUV: 'SUV',
        VAN: 'Van / Minivan',
      },
      providers: {
        ZE: 'Hertz',
        ZI: 'Avis',
        ZD: 'Budget',
        ZR: 'National',
        ZL: 'Alamo',
        ZT: 'Thrifty',
        ZF: 'Enterprise',
      },
    },
  };
}

/**
 * Calculate number of days between two dates
 */
function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays); // At least 1 day
}
