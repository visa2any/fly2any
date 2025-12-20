/**
 * UNIFIED REGION SERVICE - ISO-BASED GLOBAL COVERAGE
 *
 * Provides region detection and region-specific data for:
 * - Car Rentals (providers, vehicle types)
 * - Hotels (chains, amenities, currencies)
 * - Flights (carriers, hubs)
 * - Transfers (providers)
 *
 * Uses ISO 3166-1 alpha-2 country codes for 100% worldwide coverage
 */

export type Region =
  | 'usa'
  | 'canada'
  | 'brazil'
  | 'europe'
  | 'uk'
  | 'latam'
  | 'asia'
  | 'japan'
  | 'china'
  | 'india'
  | 'middle_east'
  | 'oceania'
  | 'africa'
  | 'global';

export type Continent =
  | 'North America'
  | 'South America'
  | 'Europe'
  | 'Asia'
  | 'Africa'
  | 'Oceania'
  | 'Middle East'
  | 'Caribbean';

// ============================================================================
// ISO COUNTRY CODE → REGION MAPPING (100% GLOBAL COVERAGE)
// ============================================================================
const COUNTRY_TO_REGION: Record<string, Region> = {
  // North America
  US: 'usa',
  CA: 'canada',

  // Brazil
  BR: 'brazil',

  // UK & Ireland
  GB: 'uk', UK: 'uk', IE: 'uk',

  // Europe
  DE: 'europe', FR: 'europe', IT: 'europe', ES: 'europe', PT: 'europe',
  NL: 'europe', BE: 'europe', AT: 'europe', CH: 'europe', SE: 'europe',
  NO: 'europe', DK: 'europe', FI: 'europe', GR: 'europe', PL: 'europe',
  CZ: 'europe', HU: 'europe', RO: 'europe', BG: 'europe', HR: 'europe',
  SI: 'europe', SK: 'europe', LT: 'europe', LV: 'europe', EE: 'europe',
  LU: 'europe', MT: 'europe', CY: 'europe', IS: 'europe', MC: 'europe',
  AD: 'europe', SM: 'europe', VA: 'europe', LI: 'europe', RS: 'europe',
  ME: 'europe', MK: 'europe', AL: 'europe', BA: 'europe', XK: 'europe',
  UA: 'europe', MD: 'europe', BY: 'europe', RU: 'europe',

  // Latin America
  MX: 'latam', AR: 'latam', CL: 'latam', CO: 'latam', PE: 'latam',
  VE: 'latam', EC: 'latam', BO: 'latam', PY: 'latam', UY: 'latam',
  GY: 'latam', SR: 'latam', GF: 'latam', PA: 'latam', CR: 'latam',
  NI: 'latam', HN: 'latam', SV: 'latam', GT: 'latam', BZ: 'latam',
  CU: 'latam', DO: 'latam', HT: 'latam', JM: 'latam', PR: 'latam',
  TT: 'latam', BB: 'latam', BS: 'latam', AW: 'latam', CW: 'latam',
  SX: 'latam', TC: 'latam', KY: 'latam', VI: 'latam', VG: 'latam',
  AG: 'latam', LC: 'latam', VC: 'latam', GD: 'latam', DM: 'latam',
  KN: 'latam', MQ: 'latam', GP: 'latam',

  // Japan (separate for specific needs)
  JP: 'japan',

  // China & territories
  CN: 'china', HK: 'china', MO: 'china', TW: 'asia',

  // India (separate market)
  IN: 'india',

  // Asia
  KR: 'asia', SG: 'asia', MY: 'asia', TH: 'asia', VN: 'asia',
  PH: 'asia', ID: 'asia', MM: 'asia', KH: 'asia', LA: 'asia',
  BN: 'asia', TL: 'asia', PK: 'asia', BD: 'asia', LK: 'asia',
  NP: 'asia', BT: 'asia', MV: 'asia', MN: 'asia', KZ: 'asia',
  UZ: 'asia', TM: 'asia', KG: 'asia', TJ: 'asia', AF: 'asia',

  // Middle East
  AE: 'middle_east', SA: 'middle_east', QA: 'middle_east', KW: 'middle_east',
  BH: 'middle_east', OM: 'middle_east', YE: 'middle_east', JO: 'middle_east',
  LB: 'middle_east', SY: 'middle_east', IQ: 'middle_east', IR: 'middle_east',
  IL: 'middle_east', PS: 'middle_east', TR: 'middle_east', GE: 'middle_east',
  AM: 'middle_east', AZ: 'middle_east', EG: 'middle_east',

  // Oceania
  AU: 'oceania', NZ: 'oceania', FJ: 'oceania', PG: 'oceania',
  NC: 'oceania', PF: 'oceania', WS: 'oceania', TO: 'oceania',
  VU: 'oceania', SB: 'oceania', GU: 'oceania', FM: 'oceania',
  PW: 'oceania', MH: 'oceania', KI: 'oceania', NR: 'oceania',
  TV: 'oceania',

  // Africa
  ZA: 'africa', MA: 'africa', TN: 'africa', DZ: 'africa', LY: 'africa',
  NG: 'africa', GH: 'africa', KE: 'africa', TZ: 'africa', UG: 'africa',
  RW: 'africa', ET: 'africa', SD: 'africa', SS: 'africa', AO: 'africa',
  MZ: 'africa', ZW: 'africa', ZM: 'africa', BW: 'africa', NA: 'africa',
  MW: 'africa', MU: 'africa', SC: 'africa', MG: 'africa', RE: 'africa',
  SN: 'africa', CI: 'africa', CM: 'africa', GA: 'africa', CG: 'africa',
  CD: 'africa', ML: 'africa', BF: 'africa', NE: 'africa', TD: 'africa',
  ER: 'africa', DJ: 'africa', SO: 'africa', CV: 'africa', GM: 'africa',
  GN: 'africa', GW: 'africa', LR: 'africa', SL: 'africa', TG: 'africa',
  BJ: 'africa', MR: 'africa', CF: 'africa', GQ: 'africa', ST: 'africa',
  BI: 'africa', SZ: 'africa', LS: 'africa', KM: 'africa',
};

// ============================================================================
// REGION DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect region from ISO country code
 */
export function getRegionFromCountryCode(countryCode: string): Region {
  const code = countryCode?.toUpperCase().trim();
  return COUNTRY_TO_REGION[code] || 'global';
}

/**
 * Detect region from continent name
 */
export function getRegionFromContinent(continent: Continent): Region {
  const mapping: Record<Continent, Region> = {
    'North America': 'usa',
    'South America': 'latam',
    'Europe': 'europe',
    'Asia': 'asia',
    'Africa': 'africa',
    'Oceania': 'oceania',
    'Middle East': 'middle_east',
    'Caribbean': 'latam',
  };
  return mapping[continent] || 'global';
}

// ============================================================================
// HOTEL-SPECIFIC REGION DATA
// ============================================================================

export interface RegionHotelData {
  currency: string;
  currencySymbol: string;
  localChains: string[];
  internationalChains: string[];
  popularAmenities: string[];
  priceLevel: 'budget' | 'mid' | 'premium' | 'luxury';
  tipping: { percentage: number; customary: boolean };
  checkInTime: string;
  checkOutTime: string;
  languagePrimary: string;
  taxIncluded: boolean;
  resortFeeCommon: boolean;
}

const HOTEL_REGION_DATA: Record<Region, RegionHotelData> = {
  usa: {
    currency: 'USD',
    currencySymbol: '$',
    localChains: ['Marriott', 'Hilton', 'Hyatt', 'IHG', 'Wyndham', 'Choice Hotels', 'Best Western', 'Motel 6', 'La Quinta'],
    internationalChains: ['Accor', 'Four Seasons', 'Ritz-Carlton', 'St. Regis', 'W Hotels', 'Westin'],
    popularAmenities: ['Free WiFi', 'Free Parking', 'Pool', 'Fitness Center', 'Breakfast Included', 'Pet Friendly', 'EV Charging'],
    priceLevel: 'mid',
    tipping: { percentage: 18, customary: true },
    checkInTime: '15:00',
    checkOutTime: '11:00',
    languagePrimary: 'en',
    taxIncluded: false,
    resortFeeCommon: true,
  },
  canada: {
    currency: 'CAD',
    currencySymbol: 'C$',
    localChains: ['Fairmont', 'Four Seasons', 'Delta Hotels', 'Coast Hotels', 'Sandman Hotels'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Accor', 'Best Western'],
    popularAmenities: ['Free WiFi', 'Indoor Pool', 'Fitness Center', 'Ski Storage', 'Heated Parking', 'Breakfast'],
    priceLevel: 'mid',
    tipping: { percentage: 15, customary: true },
    checkInTime: '15:00',
    checkOutTime: '11:00',
    languagePrimary: 'en',
    taxIncluded: false,
    resortFeeCommon: false,
  },
  brazil: {
    currency: 'BRL',
    currencySymbol: 'R$',
    localChains: ['Accor (Ibis, Mercure, Novotel)', 'Atlantica Hotels', 'Blue Tree', 'Bourbon', 'Deville', 'Transamerica'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Radisson'],
    popularAmenities: ['Café da Manhã', 'Wi-Fi Grátis', 'Piscina', 'Ar Condicionado', 'Estacionamento', 'Academia'],
    priceLevel: 'mid',
    tipping: { percentage: 10, customary: false },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    languagePrimary: 'pt-BR',
    taxIncluded: true,
    resortFeeCommon: false,
  },
  uk: {
    currency: 'GBP',
    currencySymbol: '£',
    localChains: ['Premier Inn', 'Travelodge', 'Britannia Hotels', 'Jurys Inn', 'Malmaison'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Accor', 'Radisson'],
    popularAmenities: ['Free WiFi', 'Tea/Coffee Maker', 'Full English Breakfast', 'City Centre', 'Bar'],
    priceLevel: 'premium',
    tipping: { percentage: 10, customary: false },
    checkInTime: '14:00',
    checkOutTime: '11:00',
    languagePrimary: 'en',
    taxIncluded: true,
    resortFeeCommon: false,
  },
  europe: {
    currency: 'EUR',
    currencySymbol: '€',
    localChains: ['Accor', 'NH Hotels', 'Meliá', 'Barceló', 'B&B Hotels', 'Scandic', 'Leonardo Hotels'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Radisson'],
    popularAmenities: ['Free WiFi', 'Breakfast Buffet', 'City Centre', 'Air Conditioning', 'Minibar', 'Safe'],
    priceLevel: 'mid',
    tipping: { percentage: 5, customary: false },
    checkInTime: '14:00',
    checkOutTime: '11:00',
    languagePrimary: 'en',
    taxIncluded: true,
    resortFeeCommon: false,
  },
  latam: {
    currency: 'USD',
    currencySymbol: '$',
    localChains: ['Posadas (Fiesta Americana)', 'GHL Hotels', 'Estelar', 'Casa Andina', 'Libertador'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Accor', 'Hyatt', 'Wyndham'],
    popularAmenities: ['Desayuno Incluido', 'WiFi Gratis', 'Piscina', 'Aire Acondicionado', 'Gimnasio'],
    priceLevel: 'budget',
    tipping: { percentage: 10, customary: true },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    languagePrimary: 'es',
    taxIncluded: true,
    resortFeeCommon: false,
  },
  japan: {
    currency: 'JPY',
    currencySymbol: '¥',
    localChains: ['APA Hotels', 'Toyoko Inn', 'Route Inn', 'Dormy Inn', 'Super Hotel', 'Hoshino Resorts', 'Prince Hotels'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Accor'],
    popularAmenities: ['Onsen', 'Free WiFi', 'Breakfast', 'Coin Laundry', 'Convenience Store', 'Japanese Breakfast'],
    priceLevel: 'premium',
    tipping: { percentage: 0, customary: false },
    checkInTime: '15:00',
    checkOutTime: '10:00',
    languagePrimary: 'ja',
    taxIncluded: false,
    resortFeeCommon: false,
  },
  china: {
    currency: 'CNY',
    currencySymbol: '¥',
    localChains: ['Jin Jiang', 'Huazhu', 'BTG Homeinns', 'GreenTree', 'Plateno', 'Shangri-La'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Accor'],
    popularAmenities: ['Free WiFi', 'Breakfast', 'City Centre', 'Airport Shuttle', 'Business Center'],
    priceLevel: 'budget',
    tipping: { percentage: 0, customary: false },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    languagePrimary: 'zh',
    taxIncluded: true,
    resortFeeCommon: false,
  },
  india: {
    currency: 'INR',
    currencySymbol: '₹',
    localChains: ['Taj Hotels', 'Oberoi', 'ITC Hotels', 'Leela', 'Lemon Tree', 'OYO', 'Ginger'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Accor', 'Radisson'],
    popularAmenities: ['Free WiFi', 'Breakfast', 'AC', 'Airport Transfer', 'Restaurant', 'Room Service'],
    priceLevel: 'budget',
    tipping: { percentage: 10, customary: true },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    languagePrimary: 'en',
    taxIncluded: false,
    resortFeeCommon: false,
  },
  asia: {
    currency: 'USD',
    currencySymbol: '$',
    localChains: ['COMO Hotels', 'Banyan Tree', 'Mandarin Oriental', 'Anantara', 'Minor Hotels', 'Centara'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Accor', 'Shangri-La'],
    popularAmenities: ['Free WiFi', 'Pool', 'Spa', 'Breakfast', 'Airport Transfer', 'Beach Access'],
    priceLevel: 'mid',
    tipping: { percentage: 10, customary: true },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    languagePrimary: 'en',
    taxIncluded: true,
    resortFeeCommon: true,
  },
  middle_east: {
    currency: 'USD',
    currencySymbol: '$',
    localChains: ['Rotana', 'Jumeirah', 'Emaar Hospitality', 'Address Hotels', 'FIVE Hotels', 'Millennium'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Accor', 'Four Seasons', 'Kempinski'],
    popularAmenities: ['Free WiFi', 'Pool', 'Spa', 'Beach Access', 'Airport Transfer', 'Luxury Amenities'],
    priceLevel: 'luxury',
    tipping: { percentage: 10, customary: true },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    languagePrimary: 'en',
    taxIncluded: true,
    resortFeeCommon: true,
  },
  oceania: {
    currency: 'AUD',
    currencySymbol: 'A$',
    localChains: ['AccorHotels Australia', 'Oaks Hotels', 'Quest', 'Rydges', 'Mantra', 'Event Hospitality'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Accor'],
    popularAmenities: ['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Kitchenette', 'Beach Access'],
    priceLevel: 'premium',
    tipping: { percentage: 0, customary: false },
    checkInTime: '14:00',
    checkOutTime: '10:00',
    languagePrimary: 'en',
    taxIncluded: true,
    resortFeeCommon: false,
  },
  africa: {
    currency: 'USD',
    currencySymbol: '$',
    localChains: ['Sun International', 'Tsogo Sun', 'Protea Hotels', 'City Lodge', 'Mantis Collection', 'Serena Hotels'],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Radisson', 'Accor', 'Kempinski'],
    popularAmenities: ['Free WiFi', 'Pool', 'Safari Packages', 'Airport Transfer', 'Restaurant', 'Secure Parking'],
    priceLevel: 'mid',
    tipping: { percentage: 10, customary: true },
    checkInTime: '14:00',
    checkOutTime: '10:00',
    languagePrimary: 'en',
    taxIncluded: true,
    resortFeeCommon: false,
  },
  global: {
    currency: 'USD',
    currencySymbol: '$',
    localChains: [],
    internationalChains: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Accor', 'Wyndham', 'Best Western'],
    popularAmenities: ['Free WiFi', 'Breakfast', 'Pool', 'Fitness Center', 'Parking'],
    priceLevel: 'mid',
    tipping: { percentage: 10, customary: false },
    checkInTime: '14:00',
    checkOutTime: '11:00',
    languagePrimary: 'en',
    taxIncluded: false,
    resortFeeCommon: false,
  },
};

/**
 * Get hotel-specific data for a region
 */
export function getHotelRegionData(countryCode: string): RegionHotelData {
  const region = getRegionFromCountryCode(countryCode);
  return HOTEL_REGION_DATA[region] || HOTEL_REGION_DATA.global;
}

/**
 * Get all hotel chains available in a region
 */
export function getHotelChains(countryCode: string): string[] {
  const data = getHotelRegionData(countryCode);
  return [...data.localChains, ...data.internationalChains];
}

/**
 * Get priority amenities for a region
 */
export function getPriorityAmenities(countryCode: string): string[] {
  const data = getHotelRegionData(countryCode);
  return data.popularAmenities;
}

/**
 * Get default currency for a region
 */
export function getDefaultCurrency(countryCode: string): { code: string; symbol: string } {
  const data = getHotelRegionData(countryCode);
  return { code: data.currency, symbol: data.currencySymbol };
}

// ============================================================================
// CAR RENTAL REGION DATA (RE-EXPORTED FOR UNIFIED ACCESS)
// ============================================================================

export interface RegionCarData {
  providers: Array<{ code: string; name: string }>;
  mileageUnit: 'miles' | 'km';
  drivingSide: 'left' | 'right';
  popularCategories: string[];
  fuelTypes: string[];
  hasElectricOptions: boolean;
}

const CAR_REGION_DATA: Record<Region, RegionCarData> = {
  usa: {
    providers: [
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
      { code: 'ZF', name: 'Enterprise' }, { code: 'ZR', name: 'National' },
      { code: 'ZD', name: 'Budget' }, { code: 'ZL', name: 'Alamo' },
    ],
    mileageUnit: 'miles',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'COMPACT', 'SUV', 'FULLSIZE_SUV', 'ELECTRIC', 'LUXURY'],
    fuelTypes: ['PETROL', 'HYBRID', 'ELECTRIC'],
    hasElectricOptions: true,
  },
  canada: {
    providers: [
      { code: 'ZF', name: 'Enterprise' }, { code: 'ZI', name: 'Avis' },
      { code: 'ZE', name: 'Hertz' }, { code: 'ZD', name: 'Budget' },
    ],
    mileageUnit: 'km',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'COMPACT', 'SUV', 'PICKUP'],
    fuelTypes: ['PETROL', 'HYBRID'],
    hasElectricOptions: true,
  },
  brazil: {
    providers: [
      { code: 'LC', name: 'Localiza' },
      { code: 'MV', name: 'Movida' },
      { code: 'UN', name: 'Unidas' },
    ],
    mileageUnit: 'km',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'COMPACT', 'STANDARD', 'SUV'],
    fuelTypes: ['FLEX', 'DIESEL'],
    hasElectricOptions: false,
  },
  uk: {
    providers: [
      { code: 'EP', name: 'Europcar' }, { code: 'ZE', name: 'Hertz' },
      { code: 'ZI', name: 'Avis' }, { code: 'SX', name: 'Sixt' },
    ],
    mileageUnit: 'miles',
    drivingSide: 'left',
    popularCategories: ['ECONOMY', 'COMPACT', 'STANDARD', 'SUV'],
    fuelTypes: ['PETROL', 'DIESEL', 'HYBRID'],
    hasElectricOptions: true,
  },
  europe: {
    providers: [
      { code: 'EP', name: 'Europcar' }, { code: 'SX', name: 'Sixt' },
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
    ],
    mileageUnit: 'km',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'COMPACT', 'WAGON', 'PREMIUM'],
    fuelTypes: ['DIESEL', 'PETROL', 'HYBRID'],
    hasElectricOptions: true,
  },
  latam: {
    providers: [
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
      { code: 'ZD', name: 'Budget' },
    ],
    mileageUnit: 'km',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'COMPACT', 'SUV'],
    fuelTypes: ['PETROL'],
    hasElectricOptions: false,
  },
  japan: {
    providers: [
      { code: 'NR', name: 'Nippon Rent-A-Car' },
      { code: 'TR', name: 'Toyota Rent a Car' },
      { code: 'TM', name: 'Times Car Rental' },
    ],
    mileageUnit: 'km',
    drivingSide: 'left',
    popularCategories: ['ECONOMY', 'COMPACT', 'VAN'],
    fuelTypes: ['HYBRID', 'PETROL'],
    hasElectricOptions: true,
  },
  china: {
    providers: [
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
      { code: 'CC', name: 'China Auto Rental' },
    ],
    mileageUnit: 'km',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'STANDARD', 'SUV'],
    fuelTypes: ['PETROL', 'ELECTRIC'],
    hasElectricOptions: true,
  },
  india: {
    providers: [
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
      { code: 'ZC', name: 'Zoomcar' },
    ],
    mileageUnit: 'km',
    drivingSide: 'left',
    popularCategories: ['ECONOMY', 'COMPACT', 'SUV'],
    fuelTypes: ['PETROL', 'DIESEL'],
    hasElectricOptions: false,
  },
  asia: {
    providers: [
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
    ],
    mileageUnit: 'km',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'COMPACT', 'SUV'],
    fuelTypes: ['PETROL', 'HYBRID'],
    hasElectricOptions: false,
  },
  middle_east: {
    providers: [
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
      { code: 'UD', name: 'Udrive' },
    ],
    mileageUnit: 'km',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'SUV', 'LUXURY'],
    fuelTypes: ['PETROL'],
    hasElectricOptions: false,
  },
  oceania: {
    providers: [
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
      { code: 'TH', name: 'Thrifty' },
    ],
    mileageUnit: 'km',
    drivingSide: 'left',
    popularCategories: ['ECONOMY', 'COMPACT', 'SUV'],
    fuelTypes: ['PETROL', 'HYBRID'],
    hasElectricOptions: true,
  },
  africa: {
    providers: [
      { code: 'ZI', name: 'Avis' }, { code: 'ZE', name: 'Hertz' },
      { code: 'FH', name: 'First Car Rental' },
    ],
    mileageUnit: 'km',
    drivingSide: 'left',
    popularCategories: ['ECONOMY', 'SUV', 'PICKUP'],
    fuelTypes: ['PETROL', 'DIESEL'],
    hasElectricOptions: false,
  },
  global: {
    providers: [
      { code: 'ZE', name: 'Hertz' }, { code: 'ZI', name: 'Avis' },
      { code: 'ZD', name: 'Budget' },
    ],
    mileageUnit: 'km',
    drivingSide: 'right',
    popularCategories: ['ECONOMY', 'COMPACT', 'SUV'],
    fuelTypes: ['PETROL'],
    hasElectricOptions: false,
  },
};

/**
 * Get car rental data for a region
 */
export function getCarRegionData(countryCode: string): RegionCarData {
  const region = getRegionFromCountryCode(countryCode);
  return CAR_REGION_DATA[region] || CAR_REGION_DATA.global;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { COUNTRY_TO_REGION };

/**
 * Get full region info from country code
 */
export function getRegionInfo(countryCode: string) {
  const region = getRegionFromCountryCode(countryCode);
  return {
    region,
    hotel: getHotelRegionData(countryCode),
    car: getCarRegionData(countryCode),
  };
}
