/**
 * Tipos TypeScript completos para LiteAPI
 * Baseado na documentação oficial da LiteAPI v3.0
 */

// ============ TIPOS BASE ============

export interface LiteAPIResponse<T = any> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  errors?: string[];
  metadata?: {
    total?: number;
    page?: number;
    per_page?: number;
    total_pages?: number;
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  line1?: string;
  line2?: string;
  street?: string; // compatibility
  city?: string;
  state?: string;
  country?: string; // compatibility
  country_code?: string;
  postal_code?: string;
}

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

// ============ BUSCA DE HOTÉIS ============

export interface HotelSearchParams {
  // Localização (obrigatório um dos três)
  city_code?: string;
  country_code?: string;
  hotel_ids?: string[];
  
  // Compatibility fields
  destination?: string;
  destinationType?: 'city' | 'hotel' | 'coordinates';
  
  // Coordenadas geográficas
  latitude?: number;
  longitude?: number;
  radius?: number; // em km
  
  // Datas (obrigatório) - compatibilidade dupla
  checkin?: string; // YYYY-MM-DD
  checkout?: string; // YYYY-MM-DD
  checkIn: Date;
  checkOut: Date;
  
  // Hóspedes (obrigatório)
  guests?: Array<{
    adults: number;
    children?: number[]; // idades das crianças
  }>;
  
  // Compatibility guest fields
  adults?: number;
  children?: number;
  childrenAges?: number[];
  rooms?: number;
  
  // Filtros opcionais
  currency?: string; // ISO 4217 (USD, EUR, BRL, etc.)
  language?: string; // ISO 639-1 (en, pt, es, etc.)
  
  // Paginação
  limit?: number; // 1-100, default 20
  offset?: number;
  
  // Filtros de propriedade
  min_rate?: number;
  max_rate?: number;
  star_rating?: number[]; // [1,2,3,4,5]
  amenities?: string[];
  
  // Ordenação
  sort_by?: 'price' | 'rating' | 'distance' | 'popularity';
  sort_order?: 'asc' | 'desc';
}

export interface HotelSearchResult {
  id: string;
  name: string;
  description?: string;
  
  // Localização - simplified structure
  location: {
    address: Address;
    coordinates: Coordinates;
    landmarks?: Array<{
      name: string;
      distance: number;
      unit: 'km' | 'miles';
      type: 'attraction' | 'airport' | 'metro' | 'beach' | 'city_center';
    }>;
  };
  
  // Classificação
  star_rating?: number;
  starRating?: number; // compatibility
  rating?: {
    average: number;
    count: number;
    scale: number; // ex: 10
  };
  guestRating?: number; // compatibility
  
  // Preços - compatibilidade com componentes
  price?: {
    amount: number;
    currency: string;
    period: string;
  };
  
  // Preços originais da API
  min_rate?: {
    amount: number;
    currency: string;
    per: 'night' | 'stay';
    taxes_included: boolean;
  };
  
  // Lowest rate compatibility
  lowestRate?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  
  // Mídia - compatibilidade com componentes
  image?: string;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
    description?: string; // compatibility
    type?: 'room' | 'hotel' | 'amenity' | 'exterior' | 'interior';
    isMain?: boolean; // compatibility
  }>;
  
  // Facilidades principais
  amenities: HotelAmenity[];
  
  // Dados adicionais para componentes
  reviewCount?: number;
  freeCancellation?: boolean;
  distance?: string;
  
  // Hotel features
  highlights?: string[];
  contact?: Contact;
  policies?: {
    checkIn?: string;
    checkOut?: string;
    children?: string;
    pets?: string;
    smoking?: string;
    extraBeds?: string;
  };
  
  // Rates and rooms
  rates?: Rate[];
  
  // Hotel chain
  chainName?: string;
  
  // Hotel classification
  hotelClass?: string;
  
  // Sustainability
  sustainability?: {
    level: number;
    certifications: string[];
  };
  
  // Disponibilidade
  available_rooms?: number;
  
  // Distância original (se busca foi por coordenadas)
  distanceKm?: {
    value: number;
    unit: 'km' | 'miles';
  };
  
  // Meta informações
  chain?: string;
  brand?: string;
  property_type?: 'hotel' | 'resort' | 'hostel' | 'apartment' | 'villa';
}

// Interface para facilidades
export interface HotelAmenity {
  id: string;
  name: string;
  category?: string;
  icon?: string;
  description?: string; // compatibility
  isFree?: boolean; // compatibility
}

// Alias para compatibilidade
export type Hotel = HotelSearchResult;

export interface HotelSearchResponse {
  // Make it compatible with both API structure and component usage
  hotels: HotelSearchResult[];
  search_id?: string;
  checkIn: string;
  checkOut: string;
  currency: string;
  totalResults?: number;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  filters: {
    priceRange: {
      min: number;
      max: number;
    };
    boardTypes: string[];
    hotelChains: string[];
    amenities?: Array<{
      id: string;
      name: string;
      count: number;
    }>;
  };
}

// ============ DETALHES DO HOTEL ============

export interface HotelFacility {
  id: string;
  name: string;
  category: string;
  description?: string;
  is_free?: boolean;
  icon?: string;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  
  // Capacidade
  max_adults: number;
  max_children: number;
  max_occupancy: number;
  
  // Características físicas
  size?: {
    value: number;
    unit: 'sqm' | 'sqft';
  };
  
  // Camas
  beds?: Array<{
    type: 'single' | 'double' | 'queen' | 'king' | 'sofa_bed' | 'bunk_bed';
    count: number;
  }>;
  
  // Facilidades do quarto
  amenities?: string[];
  
  // Mídia
  images?: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  
  // Políticas
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  
  // Localização no hotel
  floor?: number;
  view?: string; // 'sea', 'mountain', 'city', 'garden', etc.
}

export interface HotelPolicy {
  checkin: {
    from: string; // HH:MM
    to: string; // HH:MM
    instructions?: string;
  };
  checkout: {
    until: string; // HH:MM
    instructions?: string;
  };
  cancellation?: {
    free_until?: string; // ISO datetime
    penalty?: {
      type: 'nights' | 'percentage' | 'amount';
      value: number;
      currency?: string;
    };
  };
  children?: {
    free_age?: number;
    max_age?: number;
    extra_bed_age?: number;
  };
  pets?: {
    allowed: boolean;
    fee?: {
      amount: number;
      currency: string;
      per: 'night' | 'stay';
    };
  };
  smoking?: {
    allowed: boolean;
    areas?: string[];
  };
}

export interface HotelDetailsResult {
  id: string;
  name: string;
  description: string;
  
  // Localização completa
  address: Address;
  coordinates: Coordinates;
  city: string;
  country: string;
  timezone?: string;
  
  // Classificação e avaliações
  star_rating?: number;
  rating?: {
    average: number;
    count: number;
    scale: number;
    breakdown?: {
      cleanliness?: number;
      location?: number;
      service?: number;
      value?: number;
      amenities?: number;
    };
  };
  
  // Informações da propriedade
  chain?: string;
  brand?: string;
  property_type: string;
  built_year?: number;
  renovated_year?: number;
  
  // Contato
  contact: Contact;
  
  // Facilidades e serviços
  amenities: HotelFacility[];
  
  // Tipos de quartos
  room_types: RoomType[];
  
  // Políticas
  policies: HotelPolicy;
  
  // Mídia completa
  images: Array<{
    url: string;
    thumbnail_url?: string;
    alt?: string;
    caption?: string;
    type: 'room' | 'hotel' | 'amenity' | 'exterior' | 'interior' | 'restaurant' | 'pool';
    room_type_id?: string;
  }>;
  
  // Informações adicionais
  total_rooms?: number;
  floors?: number;
  
  // Pontos de interesse próximos
  nearby_attractions?: Array<{
    name: string;
    type: string;
    distance: {
      value: number;
      unit: 'km' | 'miles';
    };
  }>;
  
  // Sustentabilidade
  sustainability?: {
    certifications?: string[];
    practices?: string[];
  };
}

export interface HotelDetailsResponse extends LiteAPIResponse<HotelDetailsResult> {}

// ============ TARIFAS E DISPONIBILIDADE ============

export interface RateDetails {
  rate_id: string;
  room_type_id: string;
  rate_name?: string;
  
  // Preços
  total_amount: number;
  base_amount: number;
  tax_amount: number;
  currency: string;
  
  // Breakdown por noite
  nightly_rates?: Array<{
    date: string; // YYYY-MM-DD
    amount: number;
  }>;
  
  // Políticas de cancelamento
  cancellation_policy: {
    free_until?: string; // ISO datetime
    penalties: Array<{
      from: string; // ISO datetime
      amount?: number;
      percentage?: number;
      currency?: string;
    }>;
  };
  
  // Inclusões
  inclusions?: string[];
  meal_plan?: 'room_only' | 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';
  
  // Restrições
  min_stay?: number;
  max_stay?: number;
  advance_booking?: number; // dias mínimos
  
  // Promoções
  promotional?: {
    discount_percentage?: number;
    discount_amount?: number;
    description?: string;
  };
  
  // Disponibilidade
  available_rooms: number;
  
  // Pagamento
  payment_options: Array<{
    type: 'pay_now' | 'pay_later' | 'deposit';
    amount?: number;
    currency?: string;
    due_date?: string;
  }>;
}

export interface HotelRatesResponse extends LiteAPIResponse<RateDetails[]> {
  hotel_id: string;
  search_params: {
    checkin: string;
    checkout: string;
    guests: Array<{ adults: number; children?: number[] }>;
  };
}

// ============ RESERVAS ============

export interface GuestInfo {
  title: 'mr' | 'mrs' | 'ms' | 'miss' | 'dr';
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  nationality?: string; // ISO 3166-1 alpha-2
  date_of_birth?: string; // YYYY-MM-DD
  passport?: {
    number: string;
    expiry_date: string; // YYYY-MM-DD
    country: string;
  };
}

export interface BookingRequest {
  // Identificação da tarifa
  rate_id: string;
  
  // Informações dos hóspedes
  rooms: Array<{
    guests: Array<GuestInfo>;
    special_requests?: string;
  }>;
  
  // Contato principal
  contact: {
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
  };
  
  // Pagamento
  payment: {
    method: 'credit_card' | 'bank_transfer' | 'pay_later';
    card?: {
      number: string;
      expiry_month: number;
      expiry_year: number;
      cvv: string;
      holder_name: string;
    };
  };
  
  // Informações adicionais
  special_requests?: string;
  internal_reference?: string;
  
  // Marketing
  marketing_consent?: boolean;
}

export interface BookingResult {
  booking_id: string;
  bookingId?: string; // compatibility
  confirmation_number: string;
  bookingReference?: string; // compatibility
  status: 'confirmed' | 'pending' | 'cancelled';
  
  // Detalhes da reserva
  hotel: {
    id: string;
    name: string;
    address: Address;
    contact: Contact;
    location: {
      address: Address;
      coordinates: Coordinates;
    };
    starRating?: number;
    guestRating?: number;
    chainName?: string;
  };
  
  // Datas e hóspedes - compatibility fields
  checkin: string;
  checkout: string;
  checkIn?: string; // compatibility
  checkOut?: string; // compatibility
  nights: number;
  
  // Guests compatibility
  guests?: Array<{
    title: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }>;
  
  rooms: Array<{
    room_type: string;
    guests: GuestInfo[];
    rate_details: RateDetails;
  }>;
  
  // Rate compatibility
  rate?: {
    roomType: {
      name: string;
      amenities: string[];
    };
    boardType: string;
    isFreeCancellation: boolean;
  };
  
  // Additional booking properties for compatibility - removed duplicates
  
  // Pricing compatibility
  totalPrice?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  
  // Valores finais
  total_amount: number;
  currency: string;
  payment_status: 'paid' | 'pending' | 'failed';
  
  // Políticas aplicáveis
  cancellation_deadline?: string;
  cancellationPolicy?: {
    description: string;
  };
  
  // Documentos
  voucher_url?: string;
  invoice_url?: string;
  
  // Datas importantes
  created_at: string;
  expires_at?: string;
}

// This represents the actual booking data structure used in the app
export interface BookingResponse {
  bookingId?: string;
  bookingReference?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  hotel?: {
    id: string;
    name: string;
    description?: string;
    location: {
      address: Address;
      coordinates: Coordinates;
      landmarks?: Array<{
        name: string;
        distance: number;
        unit: 'km' | 'miles';
        type: 'attraction' | 'airport' | 'metro' | 'beach' | 'city_center';
      }>;
    };
    starRating?: number;
    guestRating?: number;
    reviewCount?: number;
    chainName?: string;
  };
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: Array<{
    title: string;
    firstName: string;
    lastName: string;
  }>;
  rate?: {
    roomType: {
      name: string;
      amenities: string[];
    };
    boardType: string;
    isFreeCancellation: boolean;
  };
  totalPrice?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  cancellationPolicy?: {
    description: string;
  };
  confirmationEmail?: any;
}

// ============ DADOS ESTÁTICOS ============

export interface City {
  code: string;
  name: string;
  country_code: string;
  country_name: string;
  coordinates?: Coordinates;
  timezone?: string;
  is_popular?: boolean;
}

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency?: string;
  phone_prefix?: string;
  languages?: string[];
}

export interface Currency {
  code: string; // ISO 4217
  name: string;
  symbol: string;
  decimal_places: number;
}

// ============ TIPOS DE UTILIDADE ============

export interface SearchFilters {
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  starRating?: number[];
  amenities?: string[];
  propertyTypes?: string[];
  mealPlans?: string[];
  cancellationPolicy?: 'free' | 'paid' | 'non_refundable';
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface BookingStatus {
  id: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  last_updated: string;
  next_action?: string;
}

// ============ ERRORS ============

export interface LiteAPIError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// ============ COMPATIBILITY TYPES ============

export interface APIResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    remainingAttempts?: number;
  };
}

export interface Rate {
  id: string;
  rateId?: string;
  roomType: {
    id: string;
    name: string;
    amenities: string[];
    description?: string;
    maxOccupancy?: number;
  };
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  totalPrice?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  originalPrice?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  currency?: string;
  boardType: 'room_only' | 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';
  boardName?: string;
  retailRate?: number;
  suggestedSellingPrice?: number;
  isFreeCancellation: boolean;
  isRefundable?: boolean;
  refundableTag?: string;
  cancellationPolicy?: string;
  cancellationDeadline?: string;
  discountPercentage?: number;
  maxOccupancy?: number;
  availableRooms?: number;
  adultCount?: number;
  childCount?: number;
  occupancyNumber?: number;
  supplier?: string;
  taxes?: Array<{
    name: string;
    amount: number;
    currency: string;
    description?: string;
  }>;
  fees?: Array<{
    name?: string;
    amount: number;
    currency?: string;
    description: string;
  }>;
  cancelPolicyInfos?: Array<{
    cancelTime: string;
    amount: number;
    description: string;
  }>;
  paymentOptions?: Array<{
    type: 'pay_now' | 'pay_at_hotel' | 'pay_later';
    description: string;
  }>;
}

export interface Guest {
  title: 'mr' | 'mrs' | 'ms' | 'miss' | 'dr';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isMainGuest?: boolean;
}

export interface ContactInfo {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  whatsapp?: string;
}

// This represents the actual prebooking data structure used in the app
export interface PreBookingResponse {
  prebookId: string;
  status: 'confirmed' | 'pending' | 'failed';
  validUntil?: string;
  secretKey?: string; // For User Payment SDK
  totalPrice?: {
    amount: number;
    currency: string;
    formatted: string;
  };
}

export interface ErrorResponse {
  data: null;
  status: 'error';
  message?: string;
  errors: LiteAPIError[];
  metadata?: {
    total?: number;
    page?: number;
    per_page?: number;
    total_pages?: number;
  };
}

// ============ VALIDATION TYPES ============

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface FormValidation {
  destination: (value: string) => ValidationResult;
  dates: (checkin: Date, checkout: Date) => ValidationResult;
  guests: (rooms: Array<{ adults: number; children: number[] }>) => ValidationResult;
  guestInfo: (guest: GuestInfo) => ValidationResult;
  payment: (payment: any) => ValidationResult;
}