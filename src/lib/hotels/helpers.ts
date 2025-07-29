/**
 * Funções auxiliares para o sistema de hotéis
 * Utilitários, conversões e helpers gerais
 */

import type { 
  HotelSearchFormState, 
  HotelSearchParams, 
  HotelSearchResult,
  SearchFilters 
} from '../../types/hotels';

/**
 * Converter dados do formulário para parâmetros da API
 */
export function convertFormToApiParams(formData: HotelSearchFormState): HotelSearchParams {
  const params: HotelSearchParams = {
    checkin: formatDateForAPI(formData.checkIn?.value || new Date()),
    checkout: formatDateForAPI(formData.checkOut?.value || new Date()),
    checkIn: formData.checkIn?.value || new Date(),
    checkOut: formData.checkOut?.value || new Date(),
    guests: [{ // Convert from FormField<number> to guest array
      adults: formData.rooms?.value || 2,
      children: []
    }]
  };

  // Adicionar localização baseada no tipo
  if (formData.destinationType === 'city' && formData.destinationCode) {
    // params.city_code = formData.destinationCode;
  } else if (formData.destinationType === 'coordinates' && formData.coordinates) {
    // params.latitude = formData.coordinates.latitude;
    // params.longitude = formData.coordinates.longitude;
    // params.radius = 25; // 25km por padrão
  }

  // Adicionar preferências se existirem
  if (formData.preferences) {
    if (formData.preferences.currency) {
      params.currency = formData.preferences.currency;
    }
    if (formData.preferences.language) {
      // params.language = formData.preferences.language;
    }
    if (formData.preferences.priceRange) {
      // params.min_rate = formData.preferences.priceRange.min;
      // params.max_rate = formData.preferences.priceRange.max;
    }
    if (formData.preferences.starRating) {
      // params.star_rating = formData.preferences.starRating;
    }
    if (formData.preferences.amenities) {
      // params.amenities = formData.preferences.amenities;
    }
  }

  return params;
}

/**
 * Formatar data para API (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
}

/**
 * Calcular número de noites entre datas
 */
export function calculateNights(checkin: Date | string, checkout: Date | string): number {
  const checkinDate = typeof checkin === 'string' ? new Date(checkin) : checkin;
  const checkoutDate = typeof checkout === 'string' ? new Date(checkout) : checkout;
  
  const diffTime = checkoutDate.getTime() - checkinDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Aplicar filtros aos resultados de busca
 */
export function applyFiltersToResults(
  results: HotelSearchResult[], 
  filters: SearchFilters
): HotelSearchResult[] {
  let filteredResults = [...results];

  // Filtro de preço
  if (filters.priceRange) {
    filteredResults = filteredResults.filter(hotel => {
      if (!hotel.min_rate) return true;
      return hotel.min_rate.amount >= filters.priceRange!.min && 
             hotel.min_rate.amount <= filters.priceRange!.max;
    });
  }

  // Filtro de classificação por estrelas
  if (filters.starRating && filters.starRating.length > 0) {
    filteredResults = filteredResults.filter(hotel => 
      hotel.star_rating && filters.starRating!.includes(hotel.star_rating)
    );
  }

  // Filtro de facilidades
  if (filters.amenities && filters.amenities.length > 0) {
    filteredResults = filteredResults.filter(hotel => {
      if (!hotel.amenities) return false;
      return filters.amenities!.some(amenity => 
        hotel.amenities!.some(hotelAmenity => hotelAmenity.name === amenity)
      );
    });
  }

  // Filtro de tipo de propriedade
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    filteredResults = filteredResults.filter(hotel => 
      hotel.property_type && filters.propertyTypes!.includes(hotel.property_type)
    );
  }

  return filteredResults;
}

/**
 * Ordenar resultados de busca
 */
export function sortResults(
  results: HotelSearchResult[],
  sortBy: 'price' | 'rating' | 'distance' | 'popularity' = 'popularity',
  order: 'asc' | 'desc' = 'asc'
): HotelSearchResult[] {
  const sorted = [...results].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'price':
        const priceA = a.min_rate?.amount || Infinity;
        const priceB = b.min_rate?.amount || Infinity;
        comparison = priceA - priceB;
        break;

      case 'rating':
        const ratingA = a.rating?.average || 0;
        const ratingB = b.rating?.average || 0;
        comparison = ratingA - ratingB;
        break;

      case 'distance':
        const distanceA = a.distanceKm?.value || Infinity;
        const distanceB = b.distanceKm?.value || Infinity;
        comparison = distanceA - distanceB;
        break;

      case 'popularity':
        // Combinar rating e número de avaliações para popularidade
        const popularityA = (a.rating?.average || 0) * Math.log(a.rating?.count || 1);
        const popularityB = (b.rating?.average || 0) * Math.log(b.rating?.count || 1);
        comparison = popularityA - popularityB;
        break;

      default:
        comparison = 0;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Detectar tipo de destino baseado na string
 */
export function detectDestinationType(destination: string): {
  type: 'city' | 'hotel' | 'coordinates';
  code?: string;
  coordinates?: { latitude: number; longitude: number };
} {
  // Verificar se é coordenada (formato: lat,lng)
  const coordMatch = destination.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return {
      type: 'coordinates',
      coordinates: {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2])
      }
    };
  }

  // Verificar se é código de cidade (3 letras maiúsculas)
  if (/^[A-Z]{3}$/.test(destination)) {
    return {
      type: 'city',
      code: destination
    };
  }

  // Por padrão, assumir que é nome de cidade
  return {
    type: 'city'
  };
}

/**
 * Gerar chave de cache para busca
 */
export function generateCacheKey(params: HotelSearchParams): string {
  // Criar uma chave única baseada nos parâmetros de busca
  const keyData = {
    location: params.city_code || params.country_code || `${params.latitude},${params.longitude}`,
    dates: `${params.checkin}-${params.checkout}`,
    guests: JSON.stringify(params.guests),
    filters: {
      currency: params.currency,
      star_rating: params.star_rating?.sort(),
      amenities: params.amenities?.sort(),
      price_range: `${params.min_rate || 0}-${params.max_rate || 99999}`
    }
  };

  return `hotel_search:${btoa(JSON.stringify(keyData))}`;
}

/**
 * Extrair informações de localização de uma string
 */
export function parseLocationString(location: string): {
  city?: string;
  state?: string;
  country?: string;
} {
  const parts = location.split(',').map(part => part.trim());
  
  return {
    city: parts[0] || undefined,
    state: parts[1] || undefined,
    country: parts[2] || undefined
  };
}

/**
 * Calcular score de qualidade do hotel
 */
export function calculateQualityScore(hotel: HotelSearchResult): number {
  let score = 0;

  // Classificação por estrelas (40% do score)
  if (hotel.star_rating) {
    score += (hotel.star_rating / 5) * 40;
  }

  // Avaliação dos usuários (50% do score)
  if (hotel.rating?.average && hotel.rating?.scale) {
    const normalizedRating = hotel.rating.average / hotel.rating.scale;
    score += normalizedRating * 50;
  }

  // Número de avaliações (10% do score)
  if (hotel.rating?.count) {
    const reviewScore = Math.min(hotel.rating.count / 100, 1) * 10;
    score += reviewScore;
  }

  return Math.round(Math.min(score, 100));
}

/**
 * Verificar se um hotel atende aos critérios mínimos
 */
export function meetsMinimumCriteria(hotel: HotelSearchResult): boolean {
  // Deve ter pelo menos uma imagem
  if (!hotel.images || hotel.images.length === 0) return false;

  // Deve ter preço
  if (!hotel.min_rate) return false;

  // Deve ter localização
  if (!hotel.location?.address || !hotel.location?.coordinates) return false;

  return true;
}

/**
 * Gerar sugestões de busca baseadas no histórico
 */
export function generateSearchSuggestions(searchHistory: Array<{
  params: HotelSearchFormState;
  timestamp: Date;
  resultCount: number;
}>): string[] {
  const suggestions = new Set<string>();

  // Adicionar destinos do histórico
  searchHistory.forEach(search => {
    suggestions.add(search.params.destination.value);
  });

  // Adicionar destinos populares (hardcoded por enquanto)
  const popularDestinations = [
    'São Paulo, SP, Brasil',
    'Rio de Janeiro, RJ, Brasil',
    'Salvador, BA, Brasil',
    'Brasília, DF, Brasil',
    'Fortaleza, CE, Brasil',
    'Recife, PE, Brasil',
    'Porto Alegre, RS, Brasil',
    'Belo Horizonte, MG, Brasil',
    'Curitiba, PR, Brasil',
    'Florianópolis, SC, Brasil'
  ];

  popularDestinations.forEach(dest => suggestions.add(dest));

  return Array.from(suggestions).slice(0, 10);
}

/**
 * Validar e normalizar coordenadas
 */
export function normalizeCoordinates(lat: number, lng: number): {
  latitude: number;
  longitude: number;
} | null {
  // Validar limites
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6))
  };
}

/**
 * Calcular distância entre dois pontos (Haversine)
 */
export function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distância em km
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Gerar URL de compartilhamento de busca
 */
export function generateShareableUrl(searchParams: HotelSearchFormState): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const searchQuery = new URLSearchParams({
    destination: searchParams.destination.value,
    checkin: formatDateForAPI(searchParams.checkIn.value),
    checkout: formatDateForAPI(searchParams.checkOut.value),
    guests: JSON.stringify(searchParams.rooms.value)
  });

  return `${baseUrl}/hoteis/buscar?${searchQuery.toString()}`;
}

/**
 * Detectar moeda baseada na localização
 */
export function detectCurrencyFromLocation(location: string): string {
  const locationLower = location.toLowerCase();
  
  if (locationLower.includes('brasil') || locationLower.includes('brazil')) {
    return 'BRL';
  }
  
  if (locationLower.includes('eua') || locationLower.includes('usa') || locationLower.includes('united states')) {
    return 'USD';
  }
  
  if (locationLower.includes('europa') || locationLower.includes('france') || locationLower.includes('spain') || locationLower.includes('germany')) {
    return 'EUR';
  }
  
  // Padrão
  return 'BRL';
}

/**
 * Formatar parâmetros de URL para busca
 */
export function formatUrlParams(searchParams: HotelSearchFormState): Record<string, string> {
  return {
    destination: searchParams.destination.value,
    checkin: formatDateForAPI(searchParams.checkIn.value),
    checkout: formatDateForAPI(searchParams.checkOut.value),
    rooms: '1', // rooms is now a FormField<number>, not an array
    adults: (searchParams.adults || 2).toString(),
    children: (searchParams.children || 0).toString()
  };
}

/**
 * Debounce function para otimizar buscas
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function para limitar requisições
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Gerar ID único para transações
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `hotel_${timestamp}_${random}`;
}

/**
 * Verificar se é dispositivo móvel
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}