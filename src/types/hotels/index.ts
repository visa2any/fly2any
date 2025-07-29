/**
 * Tipos principais para o sistema de hotéis
 */

export * from './liteapi-types';

// Import types for local use
import type { 
  HotelSearchResult as LiteHotelSearchResult,
  HotelDetailsResult as LiteHotelDetailsResult, 
  RateDetails as LiteRateDetails,
  GuestInfo as LiteGuestInfo,
  BookingResult as LiteBookingResult,
  SearchFilters as LiteSearchFilters
} from './liteapi-types';

// Re-export main types
export type HotelSearchResult = LiteHotelSearchResult;
export type HotelDetailsResult = LiteHotelDetailsResult;
export type RateDetails = LiteRateDetails;
export type GuestInfo = LiteGuestInfo;
export type BookingResult = LiteBookingResult;
export type SearchFilters = LiteSearchFilters;
export type Hotel = LiteHotelSearchResult;

// Import and re-export additional types
import type {
  APIResponse as LiteAPIResponse,
  Rate as LiteRate,
  Guest as LiteGuest,
  ContactInfo as LiteContactInfo,
  PreBookingResponse as LitePreBookingResponse,
  BookingResponse as LiteBookingResponse,
  HotelSearchResponse as LiteHotelSearchResponse,
  HotelSearchParams as LiteHotelSearchParams
} from './liteapi-types';

export type APIResponse<T> = LiteAPIResponse<T>;
export type Rate = LiteRate;
export type Guest = LiteGuest;
export type ContactInfo = LiteContactInfo;
export type PreBookingResponse = LitePreBookingResponse;
export type BookingResponse = LiteBookingResponse;
export type HotelSearchResponse = LiteHotelSearchResponse;
export type HotelSearchParams = LiteHotelSearchParams;

// Form data type
export interface HotelSearchFormData {
  destination: string;
  destinationType?: 'city' | 'hotel' | 'coordinates'; 
  destinationCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  checkIn: Date | string;
  checkOut: Date | string;
  
  rooms: Array<{
    adults: number;
    children?: number[];
  }>;
  
  preferences?: {
    currency?: string;
    language?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    starRating?: number[];
    amenities?: string[];
  };
}

// Form state with form fields wrapper - match actual usage
export interface HotelSearchFormState {
  destination: FormField<string>;
  checkIn: FormField<Date>;
  checkOut: FormField<Date>;
  rooms: FormField<number>;
  adults?: number;
  children?: number;
  destinationType?: 'city' | 'hotel' | 'coordinates';
  destinationCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  preferences?: {
    currency?: string;
    language?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    starRating?: number[];
    amenities?: string[];
  };
}

// Form field wrapper
export interface FormField<T> {
  value: T;
  error?: string;
}

// HotelSearchFormData already defined above with proper fields

// Component props
export interface HotelCardProps {
  hotel: Hotel;
  onSelect?: (hotel: Hotel) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface HotelFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  priceRange?: {
    min: number;
    max: number;
    currency?: string;
  };
  availableAmenities?: string[];
  loading?: boolean;
}

// Re-export validation types to avoid conflicts
export type { 
  ValidationResult as LiteValidationResult,
  FormValidation as LiteFormValidation
} from './liteapi-types';

// ============ ESTADO DA APLICAÇÃO ============

export interface HotelSearchState {
  // Parâmetros de busca
  searchParams: HotelSearchFormData | null;
  
  // Resultados
  results: HotelSearchResult[];
  totalResults: number;
  
  // Estado da busca
  loading: boolean;
  error: string | null;
  
  // Paginação
  currentPage: number;
  totalPages: number;
  
  // Filtros ativos
  activeFilters: SearchFilters;
  
  // Hotel selecionado
  selectedHotel: HotelDetailsResult | null;
  selectedHotelLoading: boolean;
  
  // Cache
  searchHistory: Array<{
    params: HotelSearchFormData;
    timestamp: Date;
    resultCount: number;
  }>;
}

export interface BookingState {
  // Processo de reserva
  currentStep: 'search' | 'details' | 'rooms' | 'guest_info' | 'payment' | 'confirmation';
  
  // Dados da reserva
  selectedRate: RateDetails | null;
  guestInfo: GuestInfo[];
  paymentInfo: any;
  specialRequests: string;
  
  // Estado
  loading: boolean;
  error: string | null;
  
  // Resultado
  booking: BookingResult | null;
}

// ============ CONFIGURAÇÕES ============

export interface HotelSystemConfig {
  // API
  apiTimeout: number;
  maxRetries: number;
  cacheEnabled: boolean;
  cacheTTL: {
    search: number;
    details: number;
    rates: number;
    static: number;
  };
  
  // UI
  resultsPerPage: number;
  maxSearchHistory: number;
  imageQuality: 'low' | 'medium' | 'high';
  
  // Localização
  defaultCurrency: string;
  defaultLanguage: string;
  supportedCurrencies: string[];
  supportedLanguages: string[];
  
  // Reservas
  bookingTimeout: number;
  allowPartialBookings: boolean;
  requirePassport: boolean;
}