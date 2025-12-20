/**
 * Mock Car Rental Data Generator - REGION-AWARE & ACRISS-COMPLIANT
 *
 * This generates realistic car rental data based on:
 * 1. Geographic region (Brazil, USA, Europe, LATAM, Asia)
 * 2. Real rental companies operating in each region
 * 3. ACRISS (Association of Car Rental Industry System Standards) codes
 * 4. Actual vehicle availability per market
 *
 * ACRISS Code Structure (4 characters):
 * Position 1 (Category): M=Mini, E=Economy, C=Compact, I=Intermediate, S=Standard, F=Fullsize, P=Premium, L=Luxury, X=Special
 * Position 2 (Type): B=2-3 Door, C=2-4 Door, D=4-5 Door, W=Wagon, V=Van/Minivan, F=SUV, J=Open Air, T=Convertible, X=Special
 * Position 3 (Transmission): M=Manual, A=Automatic, N=Manual 4WD, B=Auto 4WD, C=Manual AWD, D=Auto AWD
 * Position 4 (Fuel/AC): R=Petrol+AC, N=Petrol No AC, D=Diesel+AC, Q=Diesel No AC, H=Hybrid+AC, E=Electric+AC, V=Petrol+AC, Z=Petrol No AC
 *
 * Region-Specific Availability:
 * - Brazil: Localiza, Movida, Unidas (NO Tesla, NO luxury EVs - local brands dominate)
 * - USA: Hertz, Avis, Enterprise, National, Budget, Alamo (Full range including Tesla, luxury)
 * - Europe: Europcar, Sixt, Hertz, Avis (Wide range, many diesel/manual options)
 * - LATAM: Hertz, Avis, Budget (Mid-range, mostly petrol)
 * - Asia: Local operators, Hertz, Toyota Rent (Hybrids popular in Japan)
 */

export interface AmadeusCarRentalVehicle {
  description: string;
  category: string;
  transmission: string;
  airConditioning: boolean;
  seats: number;
  doors: number;
  fuelType: string;
  imageURL?: string;
  acrissCode?: string;
}

export interface AmadeusCarRentalProvider {
  companyCode: string;
  companyName: string;
  logoURL?: string;
}

export interface AmadeusCarRentalPrice {
  currency: string;
  total: string;
  perDay: string;
  base: string;
  taxes: string;
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
  rating?: number;
  reviewCount?: number;
  badges?: string[];
}

export interface AmadeusCarRentalResponse {
  data: AmadeusCarRental[];
  meta: {
    count: number;
    mockData: boolean;
    note: string;
    region?: string;
  };
  dictionaries?: {
    categories: Record<string, string>;
    providers: Record<string, string>;
  };
}

// ============================================================================
// REGION DETECTION - USES GLOBAL LOCATION DATABASE
// ============================================================================
import { detectRegion as detectLocationRegion, type Region, getLocationInfo } from '@/lib/car-rental/location-database';

// Re-export Region type for backward compatibility
export type { Region };

function detectRegion(locationCode: string): Region {
  return detectLocationRegion(locationCode);
}

// ============================================================================
// RENTAL PROVIDERS BY REGION (INCLUDING CANADA)
// ============================================================================
const rentalProviders: Record<Region, AmadeusCarRentalProvider[]> = {
  canada: [
    { companyCode: 'ZF', companyName: 'Enterprise', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Enterprise_Rent-A-Car_logo.svg/200px-Enterprise_Rent-A-Car_logo.svg.png' },
    { companyCode: 'ZI', companyName: 'Avis', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png' },
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'ZD', companyName: 'Budget', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Budget_logo.svg/200px-Budget_logo.svg.png' },
    { companyCode: 'ZR', companyName: 'National', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/National_Car_Rental_logo.svg/200px-National_Car_Rental_logo.svg.png' },
  ],
  brazil: [
    { companyCode: 'LC', companyName: 'Localiza', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Localiza_logo.svg/200px-Localiza_logo.svg.png' },
    { companyCode: 'MV', companyName: 'Movida', logoURL: '' },
    { companyCode: 'UN', companyName: 'Unidas', logoURL: '' },
  ],
  usa: [
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'ZI', companyName: 'Avis', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png' },
    { companyCode: 'ZF', companyName: 'Enterprise', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Enterprise_Rent-A-Car_logo.svg/200px-Enterprise_Rent-A-Car_logo.svg.png' },
    { companyCode: 'ZR', companyName: 'National', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/National_Car_Rental_logo.svg/200px-National_Car_Rental_logo.svg.png' },
    { companyCode: 'ZD', companyName: 'Budget', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Budget_logo.svg/200px-Budget_logo.svg.png' },
    { companyCode: 'ZL', companyName: 'Alamo', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Alamo_Rent_A_Car_logo.svg/200px-Alamo_Rent_A_Car_logo.svg.png' },
  ],
  europe: [
    { companyCode: 'EP', companyName: 'Europcar', logoURL: '' },
    { companyCode: 'SX', companyName: 'Sixt', logoURL: '' },
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'ZI', companyName: 'Avis', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png' },
    { companyCode: 'ZD', companyName: 'Budget', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Budget_logo.svg/200px-Budget_logo.svg.png' },
  ],
  latam: [
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'ZI', companyName: 'Avis', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png' },
    { companyCode: 'ZD', companyName: 'Budget', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Budget_logo.svg/200px-Budget_logo.svg.png' },
  ],
  asia: [
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'NR', companyName: 'Nippon Rent-A-Car', logoURL: '' },
    { companyCode: 'TR', companyName: 'Toyota Rent a Car', logoURL: '' },
    { companyCode: 'TM', companyName: 'Times Car Rental', logoURL: '' },
  ],
  middle_east: [
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'ZI', companyName: 'Avis', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png' },
    { companyCode: 'UD', companyName: 'Udrive', logoURL: '' },
  ],
  oceania: [
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'ZI', companyName: 'Avis', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png' },
    { companyCode: 'TH', companyName: 'Thrifty', logoURL: '' },
  ],
  africa: [
    { companyCode: 'ZI', companyName: 'Avis', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png' },
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'FH', companyName: 'First Car Rental', logoURL: '' },
  ],
  global: [
    { companyCode: 'ZE', companyName: 'Hertz', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hertz_Logo.svg/200px-Hertz_Logo.svg.png' },
    { companyCode: 'ZI', companyName: 'Avis', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Avis_logo.svg/200px-Avis_logo.svg.png' },
    { companyCode: 'ZD', companyName: 'Budget', logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Budget_logo.svg/200px-Budget_logo.svg.png' },
  ],
};

// ============================================================================
// VEHICLE IMAGES - Simple emoji fallback + placeholder service
// Using placeholder with car silhouettes - guaranteed to work
// ============================================================================
const categoryImages: Record<string, string> = {
  'ECONOMY': 'https://placehold.co/800x500/e8f5e9/2e7d32?text=Economy+Car&font=roboto',
  'COMPACT': 'https://placehold.co/800x500/e3f2fd/1565c0?text=Compact+Sedan&font=roboto',
  'STANDARD': 'https://placehold.co/800x500/fff3e0/ef6c00?text=Standard+Sedan&font=roboto',
  'SUV': 'https://placehold.co/800x500/fce4ec/c2185b?text=SUV&font=roboto',
  'FULLSIZE_SUV': 'https://placehold.co/800x500/f3e5f5/7b1fa2?text=Full+Size+SUV&font=roboto',
  'PREMIUM': 'https://placehold.co/800x500/e8eaf6/3949ab?text=Premium+Sedan&font=roboto',
  'LUXURY': 'https://placehold.co/800x500/212121/ffd700?text=Luxury+Vehicle&font=roboto',
  'ELECTRIC': 'https://placehold.co/800x500/e0f7fa/00838f?text=Electric+Vehicle&font=roboto',
  'VAN': 'https://placehold.co/800x500/fff8e1/ff8f00?text=Minivan&font=roboto',
  'WAGON': 'https://placehold.co/800x500/efebe9/5d4037?text=Station+Wagon&font=roboto',
  'CONVERTIBLE': 'https://placehold.co/800x500/ffebee/d32f2f?text=Convertible&font=roboto',
  'PICKUP': 'https://placehold.co/800x500/eceff1/455a64?text=Pickup+Truck&font=roboto',
};

function getVehicleImage(description: string, category: string): string {
  return categoryImages[category] || categoryImages['STANDARD'];
}

// ============================================================================
// REGION-SPECIFIC CAR INVENTORIES (ACRISS-COMPLIANT)
// ============================================================================
interface CarInventoryItem {
  vehicle: Omit<AmadeusCarRentalVehicle, 'imageURL'>;
  acrissCode: string;
  basePricePerDay: number;
  rating: number;
  reviewCount: number;
  features: string[];
  badges?: string[];
}

function getRegionInventory(region: Region): CarInventoryItem[] {
  switch (region) {
    // CANADA - Similar to USA but with metric system
    case 'canada':
      return [
        {
          vehicle: { description: 'Nissan Versa or Similar', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'ECAR', basePricePerDay: 42, rating: 4.1, reviewCount: 1234,
          features: ['AC', 'Bluetooth', 'USB', 'Backup Camera'],
          badges: ['best_value', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Toyota Corolla or Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 52, rating: 4.5, reviewCount: 987,
          features: ['AC', 'Bluetooth', 'Apple CarPlay', 'Toyota Safety Sense'],
          badges: ['popular', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Honda Civic or Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 55, rating: 4.6, reviewCount: 876,
          features: ['AC', 'Bluetooth', 'Honda Sensing', 'Apple CarPlay'],
        },
        {
          vehicle: { description: 'Toyota Camry or Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IDAR', basePricePerDay: 65, rating: 4.6, reviewCount: 765,
          features: ['AC', 'Bluetooth', 'Cruise Control', 'Heated Seats'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'Honda CR-V or Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IFAR', basePricePerDay: 78, rating: 4.7, reviewCount: 654,
          features: ['AC', 'AWD', 'Bluetooth', 'Heated Seats', 'Backup Camera'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'Ford F-150 or Similar', category: 'PICKUP', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'PTAR', basePricePerDay: 95, rating: 4.5, reviewCount: 543,
          features: ['AC', '4x4 Available', 'Bluetooth', 'Towing Package', 'Heated Seats'],
        },
        {
          vehicle: { description: 'Chevrolet Tahoe or Similar', category: 'FULLSIZE_SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'FVAR', basePricePerDay: 115, rating: 4.6, reviewCount: 432,
          features: ['AC', '3rd Row', '4WD Available', 'Bluetooth', 'Heated Seats'],
          badges: ['family_friendly', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Dodge Grand Caravan', category: 'VAN', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'MVAR', basePricePerDay: 85, rating: 4.4, reviewCount: 321,
          features: ['AC', 'Stow n Go', 'Bluetooth', 'Tri-Zone Climate'],
          badges: ['family_friendly'],
        },
      ];

    // BRAZIL - Real cars at Localiza, Movida, Unidas
    // Prices in USD (converted from BRL at ~5:1 rate) - REALISTIC MARKET PRICES
    case 'brazil':
      return [
        {
          vehicle: { description: 'VW Gol ou Similar', category: 'ECONOMY', transmission: 'MANUAL', airConditioning: true, seats: 5, doors: 4, fuelType: 'FLEX' },
          acrissCode: 'EDMR', basePricePerDay: 18, rating: 4.2, reviewCount: 1567,
          features: ['Ar Condicionado', 'Rádio AM/FM', 'Vidros Elétricos', 'Direção Hidráulica'],
          badges: ['best_value', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Chevrolet Onix ou Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'FLEX' },
          acrissCode: 'CDAR', basePricePerDay: 24, rating: 4.4, reviewCount: 892,
          features: ['Ar Condicionado', 'Bluetooth', 'Direção Elétrica', 'USB', 'MyLink'],
          badges: ['popular', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Hyundai HB20 ou Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'FLEX' },
          acrissCode: 'CCAR', basePricePerDay: 26, rating: 4.3, reviewCount: 756,
          features: ['Ar Condicionado', 'Bluetooth', 'Sensor de Estacionamento', 'Vidros Elétricos'],
        },
        {
          vehicle: { description: 'Toyota Corolla ou Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'FLEX' },
          acrissCode: 'IDAR', basePricePerDay: 36, rating: 4.6, reviewCount: 1243,
          features: ['Ar Condicionado', 'Bluetooth', 'Cruise Control', 'Câmera de Ré', 'Couro Parcial'],
          badges: ['popular', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Honda Civic ou Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'FLEX' },
          acrissCode: 'IDAR', basePricePerDay: 38, rating: 4.7, reviewCount: 654,
          features: ['Ar Condicionado', 'Apple CarPlay', 'Android Auto', 'Honda Sensing'],
        },
        {
          vehicle: { description: 'Jeep Renegade ou Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'FLEX' },
          acrissCode: 'IFAR', basePricePerDay: 46, rating: 4.5, reviewCount: 534,
          features: ['Ar Condicionado', 'Bluetooth', 'Controle de Tração', 'Uconnect'],
        },
        {
          vehicle: { description: 'Jeep Compass ou Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'SFAD', basePricePerDay: 58, rating: 4.7, reviewCount: 421,
          features: ['Ar Condicionado', 'Couro', 'GPS', 'Teto Solar', '4x4 Opcional'],
          badges: ['premium', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Chevrolet Spin ou Similar', category: 'VAN', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'FLEX' },
          acrissCode: 'FVAR', basePricePerDay: 40, rating: 4.3, reviewCount: 345,
          features: ['Ar Condicionado', '7 Lugares', 'Porta-Malas Grande', 'MyLink'],
          badges: ['family_friendly', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Fiat Toro ou Similar', category: 'PICKUP', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'PTAD', basePricePerDay: 52, rating: 4.4, reviewCount: 287,
          features: ['Ar Condicionado', 'Caçamba', '4x4 Opcional', 'Bluetooth', 'Uconnect'],
        },
      ];

    // USA - Full range including Tesla and luxury
    case 'usa':
      return [
        {
          vehicle: { description: 'Nissan Versa or Similar', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'ECAR', basePricePerDay: 35, rating: 4.1, reviewCount: 1876,
          features: ['AC', 'Bluetooth', 'USB', 'Backup Camera'],
          badges: ['best_value', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Chevrolet Spark or Similar', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 4, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'MCAR', basePricePerDay: 32, rating: 4.0, reviewCount: 1234,
          features: ['AC', 'Bluetooth', 'Apple CarPlay'],
          badges: ['best_value'],
        },
        {
          vehicle: { description: 'Honda Civic or Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 48, rating: 4.5, reviewCount: 2341,
          features: ['AC', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Backup Camera', 'Honda Sensing'],
          badges: ['popular', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Toyota Corolla or Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 45, rating: 4.4, reviewCount: 1987,
          features: ['AC', 'Bluetooth', 'Toyota Safety Sense', 'Backup Camera'],
        },
        {
          vehicle: { description: 'Toyota Camry or Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IDAR', basePricePerDay: 58, rating: 4.6, reviewCount: 1654,
          features: ['AC', 'Bluetooth', 'Cruise Control', 'USB Ports', 'Leather Available'],
          badges: ['popular', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Nissan Altima or Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IDAR', basePricePerDay: 55, rating: 4.5, reviewCount: 1432,
          features: ['AC', 'ProPILOT Assist', 'Bluetooth', 'Apple CarPlay'],
        },
        {
          vehicle: { description: 'Honda CR-V or Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IFAR', basePricePerDay: 72, rating: 4.7, reviewCount: 1456,
          features: ['AC', 'Bluetooth', 'GPS', 'Apple CarPlay', 'Backup Camera', 'AWD Available'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'Toyota RAV4 Hybrid', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'HYBRID' },
          acrissCode: 'IFAH', basePricePerDay: 78, rating: 4.8, reviewCount: 987,
          features: ['AC', 'Hybrid', 'Toyota Safety Sense', 'Apple CarPlay', 'AWD'],
          badges: ['eco_friendly', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Ford Mustang Convertible', category: 'CONVERTIBLE', transmission: 'AUTOMATIC', airConditioning: true, seats: 4, doors: 2, fuelType: 'PETROL' },
          acrissCode: 'STAR', basePricePerDay: 98, rating: 4.8, reviewCount: 876,
          features: ['AC', 'Bluetooth', 'Premium Audio', 'Convertible Top', 'Sport Mode', 'SYNC 3'],
          badges: ['premium'],
        },
        {
          vehicle: { description: 'Chevrolet Tahoe or Similar', category: 'FULLSIZE_SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'FVAR', basePricePerDay: 115, rating: 4.6, reviewCount: 765,
          features: ['AC', '3rd Row Seating', 'Bluetooth', 'Backup Camera', 'Towing Package', '4WD Available'],
          badges: ['family_friendly', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Tesla Model 3 Long Range', category: 'ELECTRIC', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'ELECTRIC' },
          acrissCode: 'LDAE', basePricePerDay: 125, rating: 4.9, reviewCount: 654,
          features: ['Autopilot', 'Premium Sound', 'Supercharger Access', 'WiFi Hotspot', '15" Touchscreen', 'Glass Roof'],
          badges: ['eco_friendly', 'luxury', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Mercedes-Benz E-Class', category: 'LUXURY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'LDAR', basePricePerDay: 175, rating: 4.9, reviewCount: 432,
          features: ['Leather Seats', 'Premium Sound', 'Massage Seats', 'Ambient Lighting', 'MBUX', 'Panoramic Roof'],
          badges: ['luxury', 'vip', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Dodge Grand Caravan', category: 'VAN', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'MVAR', basePricePerDay: 82, rating: 4.4, reviewCount: 543,
          features: ['AC', 'Rear Entertainment', 'Stow n Go Seating', 'Backup Camera', 'Tri-Zone Climate'],
          badges: ['family_friendly', 'instant_confirmation'],
        },
      ];

    // EUROPE - Wide range with many diesel and manual options
    case 'europe':
      return [
        {
          vehicle: { description: 'VW Polo or Similar', category: 'ECONOMY', transmission: 'MANUAL', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'EBMR', basePricePerDay: 28, rating: 4.2, reviewCount: 1234,
          features: ['AC', 'Bluetooth', 'USB', 'DAB Radio'],
          badges: ['best_value', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Renault Clio or Similar', category: 'ECONOMY', transmission: 'MANUAL', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'EBMR', basePricePerDay: 26, rating: 4.1, reviewCount: 987,
          features: ['AC', 'Bluetooth', 'Cruise Control'],
          badges: ['best_value'],
        },
        {
          vehicle: { description: 'VW Golf or Similar', category: 'COMPACT', transmission: 'MANUAL', airConditioning: true, seats: 5, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'CDMD', basePricePerDay: 42, rating: 4.5, reviewCount: 1876,
          features: ['AC', 'Bluetooth', 'GPS', 'Cruise Control', 'Parking Sensors'],
          badges: ['popular', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'VW Golf Automatic', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'CDAD', basePricePerDay: 48, rating: 4.6, reviewCount: 1432,
          features: ['AC', 'Bluetooth', 'GPS', 'DSG Gearbox', 'Digital Cockpit'],
        },
        {
          vehicle: { description: 'VW Passat or Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'SDAD', basePricePerDay: 65, rating: 4.6, reviewCount: 987,
          features: ['AC', 'Leather', 'Navigation', 'Parking Sensors', 'ACC'],
        },
        {
          vehicle: { description: 'Skoda Octavia Estate', category: 'WAGON', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 5, fuelType: 'DIESEL' },
          acrissCode: 'IWAD', basePricePerDay: 58, rating: 4.5, reviewCount: 765,
          features: ['AC', 'Huge Boot Space', 'GPS', 'Bluetooth', 'Parking Sensors'],
          badges: ['family_friendly'],
        },
        {
          vehicle: { description: 'BMW X3 or Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'IFAD', basePricePerDay: 95, rating: 4.7, reviewCount: 654,
          features: ['AC', 'Leather', 'BMW iDrive', 'Parking Assistant', 'xDrive AWD'],
          badges: ['premium', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Mercedes-Benz C-Class', category: 'PREMIUM', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'PDAD', basePricePerDay: 120, rating: 4.8, reviewCount: 432,
          features: ['Leather', 'MBUX', 'Ambient Lighting', 'Premium Audio', 'Digital Cockpit'],
          badges: ['luxury', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'VW Transporter 9-Seater', category: 'VAN', transmission: 'MANUAL', airConditioning: true, seats: 9, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'FVMD', basePricePerDay: 85, rating: 4.4, reviewCount: 321,
          features: ['AC', '9 Seats', 'Large Cargo Area', 'Bluetooth'],
          badges: ['family_friendly', 'instant_confirmation'],
        },
      ];

    // LATAM (excluding Brazil)
    case 'latam':
      return [
        {
          vehicle: { description: 'Chevrolet Spark o Similar', category: 'ECONOMY', transmission: 'MANUAL', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'EBMR', basePricePerDay: 28, rating: 4.1, reviewCount: 876,
          features: ['AC', 'Radio', 'USB'],
          badges: ['best_value', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Nissan March o Similar', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'ECAR', basePricePerDay: 32, rating: 4.2, reviewCount: 654,
          features: ['AC', 'Bluetooth', 'Backup Camera'],
        },
        {
          vehicle: { description: 'Nissan Versa o Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 42, rating: 4.3, reviewCount: 543,
          features: ['AC', 'Bluetooth', 'USB', 'Cruise Control'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'Toyota Corolla o Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IDAR', basePricePerDay: 58, rating: 4.5, reviewCount: 432,
          features: ['AC', 'Bluetooth', 'Cruise Control', 'Backup Camera'],
          badges: ['popular', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Kia Sportage o Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IFAR', basePricePerDay: 72, rating: 4.4, reviewCount: 321,
          features: ['AC', 'Bluetooth', 'Backup Camera', 'Apple CarPlay'],
        },
        {
          vehicle: { description: 'Toyota Fortuner o Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'SFAD', basePricePerDay: 95, rating: 4.6, reviewCount: 234,
          features: ['AC', '7 Seats', '4x4', 'Bluetooth', 'Leather'],
          badges: ['premium'],
        },
      ];

    // ASIA
    case 'asia':
      return [
        {
          vehicle: { description: 'Toyota Vitz or Similar', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'HYBRID' },
          acrissCode: 'ECAH', basePricePerDay: 38, rating: 4.3, reviewCount: 1234,
          features: ['AC', 'Bluetooth', 'Fuel Efficient', 'Navigation'],
          badges: ['eco_friendly', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Honda Fit or Similar', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'HYBRID' },
          acrissCode: 'ECAH', basePricePerDay: 42, rating: 4.4, reviewCount: 987,
          features: ['AC', 'Magic Seats', 'Bluetooth', 'USB'],
          badges: ['eco_friendly'],
        },
        {
          vehicle: { description: 'Toyota Prius or Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'HYBRID' },
          acrissCode: 'CCAH', basePricePerDay: 52, rating: 4.6, reviewCount: 876,
          features: ['AC', 'Hybrid', 'GPS', 'Bluetooth', 'Toyota Safety Sense'],
          badges: ['eco_friendly', 'popular', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Toyota Corolla or Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'HYBRID' },
          acrissCode: 'IDAH', basePricePerDay: 62, rating: 4.7, reviewCount: 654,
          features: ['AC', 'Hybrid', 'Navigation', 'Leather Available'],
        },
        {
          vehicle: { description: 'Toyota Crown or Similar', category: 'PREMIUM', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'HYBRID' },
          acrissCode: 'PDAH', basePricePerDay: 95, rating: 4.8, reviewCount: 432,
          features: ['AC', 'Leather', 'Navigation', 'Hybrid', 'Premium Audio'],
          badges: ['luxury'],
        },
        {
          vehicle: { description: 'Toyota Alphard or Similar', category: 'VAN', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'HYBRID' },
          acrissCode: 'FVAH', basePricePerDay: 125, rating: 4.9, reviewCount: 321,
          features: ['Luxury Interior', 'Captain Seats', 'Entertainment System', 'Hybrid', 'Ottoman Seats'],
          badges: ['luxury', 'family_friendly', 'instant_confirmation'],
        },
      ];

    // MIDDLE EAST
    case 'middle_east':
      return [
        {
          vehicle: { description: 'Toyota Yaris or Similar', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'ECAR', basePricePerDay: 25, rating: 4.2, reviewCount: 876,
          features: ['AC', 'Bluetooth', 'USB'],
          badges: ['best_value', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Toyota Corolla or Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 35, rating: 4.4, reviewCount: 654,
          features: ['AC', 'Bluetooth', 'Cruise Control', 'Backup Camera'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'Toyota Camry or Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IDAR', basePricePerDay: 55, rating: 4.5, reviewCount: 543,
          features: ['AC', 'Bluetooth', 'Leather', 'JBL Audio'],
        },
        {
          vehicle: { description: 'Nissan Patrol or Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'FVAR', basePricePerDay: 125, rating: 4.7, reviewCount: 432,
          features: ['AC', '7 Seats', '4x4', 'Leather', 'Navigation', 'Desert Ready'],
          badges: ['premium', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Lexus ES or Similar', category: 'LUXURY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'LDAR', basePricePerDay: 175, rating: 4.8, reviewCount: 234,
          features: ['Leather', 'Mark Levinson Audio', 'Ventilated Seats', 'Navigation'],
          badges: ['luxury', 'vip'],
        },
      ];

    // OCEANIA
    case 'oceania':
      return [
        {
          vehicle: { description: 'Toyota Yaris or Similar', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'ECAR', basePricePerDay: 42, rating: 4.2, reviewCount: 765,
          features: ['AC', 'Bluetooth', 'USB'],
          badges: ['best_value', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Toyota Corolla or Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 55, rating: 4.4, reviewCount: 543,
          features: ['AC', 'Bluetooth', 'Toyota Safety Sense', 'Backup Camera'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'Toyota Camry or Similar', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IDAR', basePricePerDay: 72, rating: 4.5, reviewCount: 432,
          features: ['AC', 'Bluetooth', 'Cruise Control', 'Apple CarPlay'],
        },
        {
          vehicle: { description: 'Toyota RAV4 or Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IFAR', basePricePerDay: 85, rating: 4.6, reviewCount: 321,
          features: ['AC', 'AWD', 'Bluetooth', 'Backup Camera', 'Roof Rails'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'Toyota Kluger or Similar', category: 'FULLSIZE_SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'FVAR', basePricePerDay: 115, rating: 4.7, reviewCount: 234,
          features: ['AC', '7 Seats', 'AWD', 'Premium Audio', 'Large Cargo'],
          badges: ['family_friendly', 'instant_confirmation'],
        },
      ];

    // AFRICA
    case 'africa':
      return [
        {
          vehicle: { description: 'VW Polo or Similar', category: 'ECONOMY', transmission: 'MANUAL', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'EBMR', basePricePerDay: 32, rating: 4.1, reviewCount: 654,
          features: ['AC', 'Bluetooth', 'USB'],
          badges: ['best_value'],
        },
        {
          vehicle: { description: 'Toyota Corolla or Similar', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 45, rating: 4.3, reviewCount: 543,
          features: ['AC', 'Bluetooth', 'Cruise Control'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'Toyota Fortuner or Similar', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'SFAD', basePricePerDay: 85, rating: 4.5, reviewCount: 432,
          features: ['AC', '7 Seats', '4x4', 'Bluetooth', 'Rugged Build'],
          badges: ['premium'],
        },
        {
          vehicle: { description: 'Toyota Land Cruiser Prado', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'DIESEL' },
          acrissCode: 'PFAD', basePricePerDay: 125, rating: 4.7, reviewCount: 321,
          features: ['AC', '7 Seats', '4x4', 'Leather', 'Off-Road Ready', 'Navigation'],
          badges: ['luxury', 'instant_confirmation'],
        },
      ];

    // GLOBAL DEFAULT
    default:
      return [
        {
          vehicle: { description: 'Economy Car', category: 'ECONOMY', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'ECAR', basePricePerDay: 35, rating: 4.2, reviewCount: 1000,
          features: ['AC', 'Bluetooth'],
          badges: ['best_value', 'instant_confirmation'],
        },
        {
          vehicle: { description: 'Compact Car', category: 'COMPACT', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'CCAR', basePricePerDay: 45, rating: 4.4, reviewCount: 800,
          features: ['AC', 'Bluetooth', 'USB'],
        },
        {
          vehicle: { description: 'Standard Sedan', category: 'STANDARD', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IDAR', basePricePerDay: 55, rating: 4.5, reviewCount: 600,
          features: ['AC', 'Bluetooth', 'Cruise Control'],
          badges: ['popular'],
        },
        {
          vehicle: { description: 'SUV', category: 'SUV', transmission: 'AUTOMATIC', airConditioning: true, seats: 5, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'IFAR', basePricePerDay: 75, rating: 4.6, reviewCount: 500,
          features: ['AC', 'Bluetooth', 'GPS'],
        },
        {
          vehicle: { description: 'Minivan', category: 'VAN', transmission: 'AUTOMATIC', airConditioning: true, seats: 7, doors: 4, fuelType: 'PETROL' },
          acrissCode: 'MVAR', basePricePerDay: 85, rating: 4.5, reviewCount: 400,
          features: ['AC', '7 Seats', 'Bluetooth'],
          badges: ['family_friendly'],
        },
      ];
  }
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================
export function generateMockCarRentals(params: {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime?: string;
  dropoffTime?: string;
}): AmadeusCarRentalResponse {
  const days = calculateDays(params.pickupDate, params.dropoffDate);
  const region = detectRegion(params.pickupLocation);
  const providers = rentalProviders[region] || rentalProviders.global;
  const carInventory = getRegionInventory(region);

  // Get location info for proper naming
  const pickupInfo = getLocationInfo(params.pickupLocation);
  const dropoffCode = params.dropoffLocation || params.pickupLocation;
  const dropoffInfo = getLocationInfo(dropoffCode);

  // Generate car rental offers
  const carRentals: AmadeusCarRental[] = carInventory.map((car, index) => {
    // Assign a provider from the region's available providers
    const provider = providers[index % providers.length];

    // Calculate prices
    const totalPrice = car.basePricePerDay * days;
    const basePrice = totalPrice * 0.85;
    const taxes = totalPrice - basePrice;

    // Get appropriate image for the EXACT vehicle model
    const imageURL = getVehicleImage(car.vehicle.description, car.vehicle.category);

    return {
      id: `CAR_${params.pickupLocation}_${car.acrissCode}_${index + 1}_${Date.now()}`,
      vehicle: {
        ...car.vehicle,
        imageURL,
        acrissCode: car.acrissCode,
      },
      provider,
      price: {
        currency: 'USD',
        total: totalPrice.toFixed(2),
        perDay: car.basePricePerDay.toFixed(2),
        base: basePrice.toFixed(2),
        taxes: taxes.toFixed(2),
      },
      pickupLocation: {
        code: params.pickupLocation,
        name: pickupInfo.name || `${params.pickupLocation} Airport`,
        address: pickupInfo.address || `${params.pickupLocation} International Airport, Car Rental Center`,
      },
      dropoffLocation: {
        code: dropoffCode,
        name: dropoffInfo.name || `${dropoffCode} Airport`,
        address: dropoffInfo.address || `${dropoffCode} International Airport, Car Rental Center`,
      },
      pickupDateTime: `${params.pickupDate}T${params.pickupTime || '10:00:00'}`,
      dropoffDateTime: `${params.dropoffDate}T${params.dropoffTime || '10:00:00'}`,
      mileage: {
        unlimited: true,
        unit: region === 'usa' ? 'miles' : 'km',
      },
      insurance: {
        included: ['LUXURY', 'PREMIUM', 'ELECTRIC'].includes(car.vehicle.category),
        type: ['LUXURY', 'PREMIUM', 'ELECTRIC'].includes(car.vehicle.category) ? 'Comprehensive CDW' : undefined,
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
      note: `Region-aware mock data for ${region.toUpperCase()}. Amadeus Car Rental API has limited test data.`,
      region,
    },
    dictionaries: {
      categories: {
        MINI: 'Mini',
        ECONOMY: 'Economy',
        COMPACT: 'Compact',
        INTERMEDIATE: 'Intermediate',
        STANDARD: 'Standard',
        FULLSIZE: 'Full Size',
        PREMIUM: 'Premium',
        LUXURY: 'Luxury',
        SUV: 'SUV',
        FULLSIZE_SUV: 'Full Size SUV',
        VAN: 'Van / Minivan',
        WAGON: 'Wagon / Estate',
        CONVERTIBLE: 'Convertible',
        PICKUP: 'Pickup Truck',
        ELECTRIC: 'Electric Vehicle',
      },
      providers: Object.fromEntries(
        providers.map(p => [p.companyCode, p.companyName])
      ),
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}
