/**
 * Formatters para dados de hotéis
 * Funções para formatar preços, datas, avaliações, etc.
 */

import type { HotelSearchResult, HotelDetailsResult, RateDetails } from '@/types/hotels';

/**
 * Formatar preço com moeda
 */
export function formatPrice(amount: number, currency: string = 'BRL', locale: string = 'pt-BR'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback se a moeda não for suportada
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Formatar data para exibição
 */
export function formatDate(date: string | Date, locale: string = 'pt-BR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formatar data para exibição curta
 */
export function formatDateShort(date: string | Date, locale: string = 'pt-BR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Calcular e formatar duração da estadia
 */
export function formatStayDuration(checkin: string | Date, checkout: string | Date): string {
  const checkinDate = typeof checkin === 'string' ? new Date(checkin) : checkin;
  const checkoutDate = typeof checkout === 'string' ? new Date(checkout) : checkout;
  
  const diffTime = checkoutDate.getTime() - checkinDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 noite';
  return `${diffDays} noites`;
}

/**
 * Formatar avaliação com estrelas
 */
export function formatRating(rating: number, scale: number = 10): {
  stars: number;
  percentage: number;
  label: string;
} {
  const stars = Math.round((rating / scale) * 5);
  const percentage = Math.round((rating / scale) * 100);
  
  let label = 'Regular';
  if (percentage >= 90) label = 'Excepcional';
  else if (percentage >= 80) label = 'Muito bom';
  else if (percentage >= 70) label = 'Bom';
  else if (percentage >= 60) label = 'Satisfatório';
  
  return { stars, percentage, label };
}

/**
 * Formatar número de hóspedes
 */
export function formatGuestCount(rooms: Array<{ adults: number; children?: number[] }>): string {
  const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = rooms.reduce((sum, room) => sum + (room.children?.length || 0), 0);
  const totalGuests = totalAdults + totalChildren;
  const roomCount = rooms.length;
  
  let result = '';
  
  // Quartos
  if (roomCount === 1) {
    result += '1 quarto';
  } else {
    result += `${roomCount} quartos`;
  }
  
  // Hóspedes
  if (totalGuests === 1) {
    result += ', 1 hóspede';
  } else {
    result += `, ${totalGuests} hóspedes`;
  }
  
  // Detalhes se houver crianças
  if (totalChildren > 0) {
    result += ` (${totalAdults} adulto${totalAdults > 1 ? 's' : ''}, ${totalChildren} criança${totalChildren > 1 ? 's' : ''})`;
  }
  
  return result;
}

/**
 * Formatar facilidades em categorias
 */
export function formatAmenities(amenities: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    connectivity: [],
    parking: [],
    wellness: [],
    dining: [],
    business: [],
    family: [],
    other: []
  };
  
  amenities.forEach(amenity => {
    const lower = amenity.toLowerCase();
    
    if (lower.includes('wifi') || lower.includes('internet')) {
      categories.connectivity.push(amenity);
    } else if (lower.includes('parking') || lower.includes('garage')) {
      categories.parking.push(amenity);
    } else if (lower.includes('pool') || lower.includes('spa') || lower.includes('gym') || lower.includes('fitness')) {
      categories.wellness.push(amenity);
    } else if (lower.includes('restaurant') || lower.includes('bar') || lower.includes('breakfast') || lower.includes('dining')) {
      categories.dining.push(amenity);
    } else if (lower.includes('business') || lower.includes('meeting') || lower.includes('conference')) {
      categories.business.push(amenity);
    } else if (lower.includes('family') || lower.includes('kid') || lower.includes('children') || lower.includes('playground')) {
      categories.family.push(amenity);
    } else {
      categories.other.push(amenity);
    }
  });
  
  // Remover categorias vazias
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });
  
  return categories;
}

/**
 * Formatar endereço completo
 */
export function formatAddress(address: any): string {
  const parts = [];
  
  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.country_code) parts.push(address.country_code);
  
  return parts.join(', ');
}

/**
 * Formatar distância
 */
export function formatDistance(distance: { value: number; unit: string }): string {
  const { value, unit } = distance;
  
  if (unit === 'km') {
    if (value < 1) {
      return `${Math.round(value * 1000)}m`;
    }
    return `${value.toFixed(1)}km`;
  } else if (unit === 'miles') {
    if (value < 1) {
      return `${Math.round(value * 1609)}m`; // Convertendo milhas para metros
    }
    return `${value.toFixed(1)} milhas`;
  }
  
  return `${value} ${unit}`;
}

/**
 * Formatar política de cancelamento
 */
export function formatCancellationPolicy(policy: any): {
  type: 'free' | 'paid' | 'non_refundable';
  description: string;
  deadline?: string;
} {
  if (!policy || !policy.penalties) {
    return {
      type: 'non_refundable',
      description: 'Política de cancelamento não especificada'
    };
  }
  
  if (policy.free_until) {
    const deadline = new Date(policy.free_until);
    return {
      type: 'free',
      description: `Cancelamento gratuito até ${formatDate(deadline)}`,
      deadline: policy.free_until
    };
  }
  
  if (policy.penalties.length === 0) {
    return {
      type: 'free',
      description: 'Cancelamento gratuito'
    };
  }
  
  const firstPenalty = policy.penalties[0];
  if (firstPenalty.percentage === 100 || firstPenalty.amount >= 99999) {
    return {
      type: 'non_refundable',
      description: 'Não reembolsável'
    };
  }
  
  return {
    type: 'paid',
    description: 'Cancelamento com taxa'
  };
}

/**
 * Formatar horário de check-in/check-out
 */
export function formatCheckTime(time: string): string {
  try {
    // Assumindo formato HH:MM
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time;
    }
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    return time;
  }
}

/**
 * Formatar tamanho do quarto
 */
export function formatRoomSize(size: { value: number; unit: string }): string {
  const { value, unit } = size;
  
  if (unit === 'sqm') {
    return `${value}m²`;
  } else if (unit === 'sqft') {
    return `${value} pés²`;
  }
  
  return `${value} ${unit}`;
}

/**
 * Formatar configuração de camas
 */
export function formatBedConfiguration(beds: Array<{ type: string; count: number }>): string {
  if (!beds || beds.length === 0) {
    return 'Configuração de camas não informada';
  }
  
  const bedTypes: Record<string, string> = {
    single: 'solteiro',
    double: 'casal',
    queen: 'queen',
    king: 'king',
    sofa_bed: 'sofá-cama',
    bunk_bed: 'beliche'
  };
  
  return beds.map(bed => {
    const type = bedTypes[bed.type] || bed.type;
    return `${bed.count} ${type}${bed.count > 1 ? 's' : ''}`;
  }).join(', ');
}

/**
 * Formatar informações de sustentabilidade
 */
export function formatSustainability(sustainability: any): string[] {
  const practices = [];
  
  if (sustainability?.certifications?.length > 0) {
    practices.push(...sustainability.certifications.map((cert: string) => `Certificação: ${cert}`));
  }
  
  if (sustainability?.practices?.length > 0) {
    practices.push(...sustainability.practices);
  }
  
  return practices;
}

/**
 * Formatar resumo de reserva
 */
export function formatBookingSummary(booking: any): {
  hotel: string;
  dates: string;
  duration: string;
  guests: string;
  total: string;
} {
  return {
    hotel: booking.hotel?.name || 'Hotel não especificado',
    dates: `${formatDateShort(booking.checkin)} - ${formatDateShort(booking.checkout)}`,
    duration: formatStayDuration(booking.checkin, booking.checkout),
    guests: formatGuestCount(booking.rooms?.map((room: any) => ({
      adults: room.guests.filter((g: any) => calculateAge(g.date_of_birth) >= 18).length,
      children: room.guests.filter((g: any) => calculateAge(g.date_of_birth) < 18).map(() => 5) // Simplificado
    })) || []),
    total: formatPrice(booking.total_amount, booking.currency)
  };
}

/**
 * Calcular idade
 */
function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 18; // Assume adulto se não informado
  
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Formatar tempo relativo (ex: "em 3 dias", "há 2 horas")
 */
export function formatRelativeTime(date: string | Date, locale: string = 'pt-BR'): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(diffInYears, 'year');
}

/**
 * Formatar URL de imagem otimizada
 */
export function formatImageUrl(url: string, options: {
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
  fit?: 'crop' | 'contain' | 'cover';
} = {}): string {
  if (!url) return '/images/hotel-placeholder.jpg';
  
  const { width = 400, height = 300, quality = 'medium', fit = 'crop' } = options;
  
  // Se já tem parâmetros, adiciona aos existentes
  const separator = url.includes('?') ? '&' : '?';
  
  const qualityMap = { low: 60, medium: 80, high: 95 };
  const qualityValue = qualityMap[quality];
  
  return `${url}${separator}w=${width}&h=${height}&fit=${fit}&auto=format,compress&q=${qualityValue}`;
}