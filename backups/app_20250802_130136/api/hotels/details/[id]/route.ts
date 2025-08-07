/**
 * API Route: /api/hotels/details/[id]
 * Detalhes específicos de um hotel
 */

import { NextRequest, NextResponse } from 'next/server';
import { liteApiClient } from '@/lib/hotels/liteapi-client';
import { z } from 'zod';

// Schema de validação para parâmetros
const detailsParamsSchema = z.object({
  language: z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
  include_rates: z.boolean().optional(),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  guests: z.string().optional() // JSON string
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  const hotelId = resolvedParams.id;
  
  try {
    
    if (!hotelId || hotelId.length < 3) {
      return NextResponse.json(
        { error: 'ID do hotel inválido' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Extrair parâmetros
    const rawParams: any = {};
    ['language', 'currency', 'checkin', 'checkout', 'guests'].forEach(key => {
      const value = searchParams.get(key);
      if (value) rawParams[key] = value;
    });
    
    // Converter include_rates
    const includeRates = searchParams.get('include_rates');
    if (includeRates) {
      rawParams.include_rates = includeRates === 'true';
    }
    
    // Validar parâmetros
    const validation = detailsParamsSchema.safeParse(rawParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }
    
    const validatedParams = validation.data;
    
    // Converter guests se fornecido
    let guestsData = null;
    if (validatedParams.guests) {
      try {
        guestsData = JSON.parse(validatedParams.guests);
      } catch (e) {
        return NextResponse.json(
          { error: 'Parâmetro guests deve ser um JSON válido' },
          { status: 400 }
        );
      }
    }
    
    const client = liteApiClient;
    
    // Buscar detalhes do hotel
    const hotelDetails = await client.getHotelDetails(hotelId, {
      currency: validatedParams.currency
    });
    
    // Se datas foram fornecidas, buscar também as tarifas
    let rates = null;
    if (validatedParams.include_rates && validatedParams.checkin && validatedParams.checkout && guestsData) {
      try {
        rates = await client.getHotelRates(hotelId, {
          checkIn: validatedParams.checkin,
          checkOut: validatedParams.checkout,
          adults: guestsData.adults,
          children: guestsData.children,
          rooms: guestsData.rooms,
          currency: validatedParams.currency
        });
      } catch (rateError) {
        console.warn('Erro ao buscar tarifas:', rateError);
        // Não falhar se não conseguir buscar tarifas
      }
    }
    
    // Enriquecer dados do hotel
    const enrichedHotel = {
      ...hotelDetails.data,
      
      // Organizar imagens por categoria
      images_by_category: organizeImagesByCategory(hotelDetails.data.images),
      
      // Calcular estatísticas das avaliações
      rating_stats: calculateRatingStats(hotelDetails.data.rating),
      
      // Facilidades organizadas por categoria
      amenities_by_category: organizeAmenitiesByCategory(hotelDetails.data.amenities),
      
      // Tipos de quarto organizados
      room_types_enhanced: enhanceRoomTypes(hotelDetails.data.room_types),
      
      // Políticas formatadas
      policies_formatted: formatPolicies(hotelDetails.data.policies),
      
      // Atrações próximas ordenadas por distância
      nearby_attractions_sorted: hotelDetails.data.nearby_attractions?.sort((a: any, b: any) => 
        a.distance.value - b.distance.value
      ),
      
      // Score de sustentabilidade
      sustainability_score: calculateSustainabilityScore(hotelDetails.data.sustainability),
      
      // Metadados adicionais
      metadata: {
        last_updated: new Date().toISOString(),
        data_source: 'liteapi',
        completeness_score: calculateDataCompleteness(hotelDetails.data)
      }
    };
    
    // Incluir tarifas se disponíveis
    if (rates) {
      enrichedHotel.current_rates = {
        ...rates,
        rates_enhanced: enhanceRates(rates.data || [])
      };
    }
    
    return NextResponse.json({
      success: true,
      data: enrichedHotel,
      metadata: {
        hotel_id: hotelId,
        request_params: validatedParams,
        timestamp: new Date().toISOString(),
        cache_ttl: 3600 // 1 hora
      }
    });
    
  } catch (error: any) {
    console.error(`Erro ao buscar detalhes do hotel ${resolvedParams.id}:`, error);
    
    // Tratamento específico de erros
    if (error.message?.includes('HTTP 404')) {
      return NextResponse.json(
        { error: 'Hotel não encontrado' },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Organiza imagens por categoria
 */
function organizeImagesByCategory(images: any[] = []) {
  const categories: Record<string, any[]> = {
    hotel: [],
    room: [],
    amenity: [],
    restaurant: [],
    exterior: [],
    interior: [],
    pool: [],
    other: []
  };
  
  images.forEach(image => {
    const category = image.type || 'other';
    if (categories[category]) {
      categories[category].push({
        ...image,
        optimized_url: `${image.url}?w=800&h=600&fit=crop&auto=format,compress`,
        thumbnail_url: `${image.url}?w=300&h=200&fit=crop&auto=format,compress`
      });
    } else {
      categories.other.push(image);
    }
  });
  
  return categories;
}

/**
 * Calcula estatísticas das avaliações
 */
function calculateRatingStats(rating: any) {
  if (!rating) return null;
  
  const stats: any = {
    overall: rating.average,
    scale: rating.scale,
    total_reviews: rating.count,
    percentage: Math.round((rating.average / rating.scale) * 100),
    classification: getRatingClassification(rating.average, rating.scale)
  };
  
  if (rating.breakdown && typeof rating.breakdown === 'object') {
    stats.breakdown = Object.entries(rating.breakdown).map(([key, value]) => ({
      category: key,
      score: value,
      percentage: Math.round((value as number / rating.scale) * 100)
    }));
  }
  
  return stats;
}

/**
 * Organiza facilidades por categoria
 */
function organizeAmenitiesByCategory(amenities: any[] = []) {
  const categories: Record<string, any[]> = {
    wifi: [],
    parking: [],
    fitness: [],
    pool: [],
    spa: [],
    restaurant: [],
    business: [],
    family: [],
    accessibility: [],
    other: []
  };
  
  amenities.forEach(amenity => {
    const category = categorizeAmenity(amenity.name?.toLowerCase() || '');
    categories[category].push(amenity);
  });
  
  return categories;
}

/**
 * Categoriza uma facilidade
 */
function categorizeAmenity(amenityName: string): string {
  if (amenityName.includes('wifi') || amenityName.includes('internet')) return 'wifi';
  if (amenityName.includes('parking') || amenityName.includes('garage')) return 'parking';
  if (amenityName.includes('gym') || amenityName.includes('fitness')) return 'fitness';
  if (amenityName.includes('pool') || amenityName.includes('swimming')) return 'pool';
  if (amenityName.includes('spa') || amenityName.includes('massage')) return 'spa';
  if (amenityName.includes('restaurant') || amenityName.includes('dining')) return 'restaurant';
  if (amenityName.includes('business') || amenityName.includes('meeting')) return 'business';
  if (amenityName.includes('family') || amenityName.includes('kid')) return 'family';
  if (amenityName.includes('wheelchair') || amenityName.includes('accessible')) return 'accessibility';
  
  return 'other';
}

/**
 * Enriquece tipos de quarto
 */
function enhanceRoomTypes(roomTypes: any[] = []) {
  return roomTypes.map(room => ({
    ...room,
    capacity_info: {
      total: room.max_occupancy,
      adults: room.max_adults,
      children: room.max_children,
      recommended: Math.min(room.max_adults, room.max_occupancy - 1)
    },
    bed_info: formatBedInfo(room.beds),
    amenities_count: room.amenities?.length || 0,
    size_formatted: room.size ? `${room.size.value} ${room.size.unit}` : null
  }));
}

/**
 * Formata informações das camas
 */
function formatBedInfo(beds: any[] = []) {
  if (!beds.length) return null;
  
  const bedSummary = beds.map(bed => 
    `${bed.count} ${bed.type.replace('_', ' ')}`
  ).join(', ');
  
  const totalBeds = beds.reduce((sum, bed) => sum + bed.count, 0);
  
  return {
    summary: bedSummary,
    total_beds: totalBeds,
    details: beds
  };
}

/**
 * Formata políticas
 */
function formatPolicies(policies: any) {
  if (!policies) return null;
  
  return {
    ...policies,
    checkin_formatted: policies.checkin ? 
      `${policies.checkin.from} - ${policies.checkin.to}` : null,
    checkout_formatted: policies.checkout ? 
      `Até ${policies.checkout.until}` : null,
    cancellation_summary: formatCancellationPolicy(policies.cancellation)
  };
}

/**
 * Formata política de cancelamento
 */
function formatCancellationPolicy(cancellation: any) {
  if (!cancellation) return 'Política não especificada';
  
  if (cancellation.free_until) {
    const freeDate = new Date(cancellation.free_until);
    return `Cancelamento gratuito até ${freeDate.toLocaleDateString('pt-BR')}`;
  }
  
  if (cancellation.penalty) {
    const penalty = cancellation.penalty;
    if (penalty.type === 'percentage') {
      return `Taxa de cancelamento: ${penalty.value}%`;
    } else if (penalty.type === 'amount') {
      return `Taxa de cancelamento: ${penalty.value} ${penalty.currency}`;
    }
  }
  
  return 'Consulte condições de cancelamento';
}

/**
 * Calcula score de sustentabilidade
 */
function calculateSustainabilityScore(sustainability: any): number {
  if (!sustainability) return 0;
  
  let score = 0;
  
  if (sustainability.certifications?.length) {
    score += sustainability.certifications.length * 20;
  }
  
  if (sustainability.practices?.length) {
    score += sustainability.practices.length * 10;
  }
  
  return Math.min(score, 100);
}

/**
 * Calcula completude dos dados
 */
function calculateDataCompleteness(hotel: any): number {
  const fields = [
    'description', 'images', 'amenities', 'room_types', 
    'rating', 'policies', 'contact', 'coordinates'
  ];
  
  const completedFields = fields.filter(field => 
    hotel[field] && (Array.isArray(hotel[field]) ? hotel[field].length > 0 : true)
  );
  
  return Math.round((completedFields.length / fields.length) * 100);
}

/**
 * Classificação baseada na avaliação
 */
function getRatingClassification(average: number, scale: number): string {
  const percentage = (average / scale) * 100;
  
  if (percentage >= 90) return 'Excepcional';
  if (percentage >= 80) return 'Muito bom';
  if (percentage >= 70) return 'Bom';
  if (percentage >= 60) return 'Satisfatório';
  
  return 'Regular';
}

/**
 * Enriquece dados das tarifas
 */
function enhanceRates(rates: any[] = []) {
  return rates.map(rate => ({
    ...rate,
    value_score: calculateValueScore(rate),
    cancellation_type: getCancellationType(rate.cancellation_policy),
    payment_flexibility: getPaymentFlexibility(rate.payment_options),
    total_formatted: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: rate.currency
    }).format(rate.total_amount)
  }));
}

/**
 * Calcula score de valor (preço vs benefícios)
 */
function calculateValueScore(rate: any): number {
  let score = 50; // Base score
  
  // Breakfast included
  if (rate.meal_plan && rate.meal_plan !== 'room_only') {
    score += 15;
  }
  
  // Free cancellation
  if (rate.cancellation_policy?.free_until) {
    score += 10;
  }
  
  // Multiple payment options
  if (rate.payment_options?.length > 1) {
    score += 5;
  }
  
  // Promotional rate
  if (rate.promotional) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

/**
 * Determina tipo de cancelamento
 */
function getCancellationType(cancellationPolicy: any): string {
  if (!cancellationPolicy) return 'unknown';
  
  if (cancellationPolicy.free_until) {
    return 'free';
  }
  
  if (cancellationPolicy.penalties?.length === 0) {
    return 'free';
  }
  
  return 'paid';
}

/**
 * Avalia flexibilidade de pagamento
 */
function getPaymentFlexibility(paymentOptions: any[] = []): string {
  if (paymentOptions.some(option => option.type === 'pay_later')) {
    return 'high';
  }
  
  if (paymentOptions.some(option => option.type === 'deposit')) {
    return 'medium';
  }
  
  return 'low';
}