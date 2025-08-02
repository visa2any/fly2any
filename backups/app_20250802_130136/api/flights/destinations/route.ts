/**
 * 🌍 Flight Destinations API Route
 * Conecta ao SuperAmadeusClient para buscar destinos inspiracionais
 * Focus: Maximum conversion through inspiration and FOMO
 */

import { NextRequest, NextResponse } from 'next/server';
import { SuperAmadeusClient } from '@/lib/flights/super-amadeus-client';
import { FlightDestinationSearchParams } from '@/types/flights';

/**
 * POST /api/flights/destinations
 * Search for inspiring flight destinations
 */
export async function POST(request: NextRequest) {
  console.log('🌍 Flight destinations API called');
  
  try {
    const body = await request.json();
    const params = body as FlightDestinationSearchParams;

    // Validate required parameters
    if (!params.origin) {
      return NextResponse.json({
        success: false,
        error: 'Origin is required',
        details: ['originLocationCode parameter is missing']
      }, { status: 400 });
    }

    console.log('🔍 Flight destinations search parameters:', params);

    // Get SuperAmadeus client and search destinations
    const superAmadeusClient = new SuperAmadeusClient();
    
    try {
      // Call the destinations API with conversion optimization
      console.log('📡 Calling Amadeus Destinations API...');
      const destinations = await superAmadeusClient.getFlightDestinations(
        params.origin,
        params.departureDate,
        params.oneWay,
        undefined, // duration
        params.nonStop,
        params.maxPrice
      );

      console.log(`✅ Found ${destinations.length} inspiring destinations`);

      // 🎯 ENHANCE WITH CONVERSION PSYCHOLOGY
      const enhancedResponse = {
        success: true,
        data: destinations,
        meta: {
          total: destinations.length,
          searchId: `destinations-${Date.now()}`,
          conversionScore: calculateConversionScore(destinations),
          recommendedAction: generateRecommendedAction(destinations),
          urgencyLevel: determineUrgencyLevel(destinations),
          personalizedMessage: generatePersonalizedMessage(params.origin, destinations.length)
        },
        persuasionElements: {
          socialProof: generateSocialProofMessages(destinations),
          scarcity: generateScarcityMessages(destinations),
          urgency: generateUrgencyMessages(destinations),
          authority: [
            '✅ Preços validados pela nossa IA',
            '🏆 Recomendações baseadas em milhões de dados',
            '⭐ Destinos selecionados por especialistas'
          ],
          reciprocity: [
            '🎁 Como agradecimento, garantimos o melhor preço',
            '💝 Economia exclusiva para usuários Fly2Any',
            '🔒 Preço bloqueado por 15 minutos'
          ]
        },
        upsellOpportunities: generateUpsellOpportunities(destinations)
      };

      return NextResponse.json(enhancedResponse);

    } catch (amadeusError) {
      console.warn('⚠️ Amadeus Destinations API temporarily unavailable, using fallback:', (amadeusError as any)?.message);
      
      // 🔄 FALLBACK: Generate demo destinations with full conversion optimization
      const fallbackDestinations = generateFallbackDestinations(params);
      
      console.log(`🔄 Serving ${fallbackDestinations.length} inspiring destinations (demo data with full conversion optimization)`);
      
      return NextResponse.json({
        success: true,
        data: fallbackDestinations,
        meta: {
          total: fallbackDestinations.length,
          searchId: `destinations-demo-${Date.now()}`,
          isDemoData: true,
          conversionScore: 85, // High score for demo
          recommendedAction: 'Explore estes destinos incríveis - preços especiais por tempo limitado!',
          urgencyLevel: 'HIGH' as const,
          personalizedMessage: `🌟 Descobrimos ${fallbackDestinations.length} destinos perfeitos saindo de ${params.origin}!`,
          amadeusError: (amadeusError as any)?.message || 'API temporarily unavailable'
        },
        persuasionElements: {
          socialProof: [
            `🔥 ${Math.floor(Math.random() * 1000) + 500} pessoas visualizaram estes destinos hoje`,
            '👥 89% dos viajantes que viram essas ofertas fizeram a reserva',
            '⭐ Destinos mais procurados desta semana'
          ],
          scarcity: [
            '⚠️ Apenas algumas ofertas restantes para cada destino',
            '🔥 Preços podem subir nas próximas 6 horas',
            '💎 Ofertas limitadas - últimas oportunidades!'
          ],
          urgency: [
            '⏰ Preços válidos até meia-noite de hoje',
            '🚨 Alta demanda detectada - reserve agora',
            '⚡ Ofertas podem expirar a qualquer momento'
          ],
          authority: [
            '✅ Preços validados pela nossa IA',
            '🏆 Recomendações baseadas em milhões de dados',
            '⭐ Destinos selecionados por especialistas'
          ],
          reciprocity: [
            '🎁 Como agradecimento, garantimos o melhor preço',
            '💝 Economia exclusiva para usuários Fly2Any',
            '🔒 Preço bloqueado por 15 minutos'
          ]
        },
        upsellOpportunities: [
          {
            type: 'BUNDLE' as const,
            title: '🏨 Pacote Voo + Hotel',
            description: 'Economize até R$ 400 reservando voo e hotel juntos',
            savings: 'R$ 400',
            cta: 'Ver Pacotes'
          },
          {
            type: 'UPGRADE' as const,
            title: '✈️ Upgrade para Executiva',
            description: 'Viaje com mais conforto por apenas R$ 200 a mais',
            savings: 'R$ 200 desconto',
            cta: 'Fazer Upgrade'
          }
        ]
      });
    }

  } catch (error) {
    console.error('❌ Flight destinations search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// =============================================================================
// 🎯 CONVERSION OPTIMIZATION HELPERS
// =============================================================================

function calculateConversionScore(destinations: any[]): number {
  if (destinations.length === 0) return 0;
  
  let score = 50; // Base score
  
  // Availability bonus
  score += Math.min(destinations.length * 2, 30);
  
  // Savings bonus
  const avgSavings = destinations.reduce((sum, dest) => 
    sum + (dest.savings?.percentage || 0), 0) / destinations.length;
  score += Math.min(avgSavings, 20);
  
  return Math.min(100, Math.round(score));
}

function generateRecommendedAction(destinations: any[]): string {
  if (destinations.length === 0) return 'Tente outros aeroportos de origem próximos';
  
  const bestDeal = destinations[0];
  if (bestDeal?.savings?.percentage > 25) {
    return `🔥 IMPERDÍVEL! ${bestDeal.destination} com ${bestDeal.savings.percentage}% de economia - reserve AGORA!`;
  }
  
  if (destinations.length > 10) {
    return `✨ Tantas opções incríveis! Filtre por seus interesses para encontrar o destino perfeito`;
  }
  
  return '🌟 Explore estes destinos únicos - todos com preços especiais!';
}

function determineUrgencyLevel(destinations: any[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const highSavingsCount = destinations.filter(d => d.savings?.percentage > 20).length;
  const trendingCount = destinations.filter(d => d.trendingStatus === 'HOT').length;
  
  if (highSavingsCount > 3 || trendingCount > 2) return 'CRITICAL';
  if (highSavingsCount > 1 || trendingCount > 0) return 'HIGH';
  if (destinations.length > 5) return 'MEDIUM';
  return 'LOW';
}

function generatePersonalizedMessage(origin: string, count: number): string {
  const messages = [
    `🎯 Baseado em seu perfil, selecionamos ${count} destinos perfeitos saindo de ${origin}`,
    `🌟 Viajantes como você adoraram estes ${count} destinos saindo de ${origin}`,
    `✨ Encontramos ${count} destinos que batem com seu estilo de viagem desde ${origin}`,
    `🎉 Preparamos ${count} sugestões especiais para sua próxima aventura saindo de ${origin}`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateSocialProofMessages(destinations: any[]): string[] {
  const count = Math.floor(Math.random() * 500) + 300;
  const percentage = Math.floor(Math.random() * 20) + 75;
  
  return [
    `👥 ${count} pessoas visualizaram estes destinos nas últimas 24h`,
    `⭐ ${percentage}% dos viajantes que viram essas ofertas fizeram a reserva`,
    `🔥 Destinos mais procurados da semana`,
    `✈️ ${Math.floor(Math.random() * 100) + 50} reservas confirmadas hoje para estes destinos`
  ];
}

function generateScarcityMessages(destinations: any[]): string[] {
  return [
    '⚠️ Ofertas limitadas - algumas podem esgotar ainda hoje',
    '🔥 Assentos diminuindo rapidamente em vários destinos',
    '💎 Preços especiais válidos apenas para os primeiros interessados',
    '⏰ Promoções podem acabar sem aviso prévio'
  ];
}

function generateUrgencyMessages(destinations: any[]): string[] {
  return [
    '🚨 Preços podem subir nas próximas 6 horas',
    '⚡ Alta procura detectada - reserve logo',
    '⏰ Ofertas válidas até meia-noite',
    '🔔 Última chance de garantir estes preços'
  ];
}

function generateUpsellOpportunities(destinations: any[]): any[] {
  return [
    {
      type: 'BUNDLE',
      title: '🏨 Voo + Hotel',
      description: 'Economize até R$ 500 no pacote completo',
      savings: 'R$ 500',
      cta: 'Ver Pacotes'
    },
    {
      type: 'INSURANCE',
      title: '🛡️ Seguro Viagem',
      description: 'Proteção completa por apenas R$ 45',
      savings: '70% desconto',
      cta: 'Proteger Viagem'
    },
    {
      type: 'ADDON',
      title: '🧳 Bagagem Extra',
      description: 'Adicione 23kg por R$ 89 (economize R$ 40)',
      savings: 'R$ 40',
      cta: 'Adicionar Bagagem'
    }
  ];
}

// =============================================================================
// 🔄 FALLBACK DATA GENERATOR
// =============================================================================

function generateFallbackDestinations(params: FlightDestinationSearchParams): any[] {
  const destinations = [
    { code: 'MIA', name: 'Miami', country: 'Estados Unidos', region: 'América do Norte' },
    { code: 'LAX', name: 'Los Angeles', country: 'Estados Unidos', region: 'América do Norte' },
    { code: 'LIS', name: 'Lisboa', country: 'Portugal', region: 'Europa' },
    { code: 'MAD', name: 'Madrid', country: 'Espanha', region: 'Europa' },
    { code: 'FCO', name: 'Roma', country: 'Itália', region: 'Europa' },
    { code: 'CDG', name: 'Paris', country: 'França', region: 'Europa' },
    { code: 'LHR', name: 'Londres', country: 'Reino Unido', region: 'Europa' },
    { code: 'DXB', name: 'Dubai', country: 'Emirados Árabes', region: 'Oriente Médio' },
    { code: 'NRT', name: 'Tóquio', country: 'Japão', region: 'Ásia' },
    { code: 'SCL', name: 'Santiago', country: 'Chile', region: 'América do Sul' },
    { code: 'BUE', name: 'Buenos Aires', country: 'Argentina', region: 'América do Sul' },
    { code: 'LIM', name: 'Lima', country: 'Peru', region: 'América do Sul' }
  ];

  return destinations.map((dest, index) => {
    const basePrice = Math.floor(Math.random() * 2000) + 800;
    const savingsPercentage = Math.floor(Math.random() * 30) + 10;
    const savings = Math.floor(basePrice * (savingsPercentage / 100));

    return {
      type: 'flight-destination',
      origin: params.origin,
      destination: dest.code,
      departureDate: params.departureDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: {
        total: `R$ ${basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        currency: 'BRL'
      },
      links: {
        flightDates: `/api/flights/cheapest-dates?origin=${params.origin}&destination=${dest.code}`,
        flightOffers: `/api/flights/search?origin=${params.origin}&destination=${dest.code}`
      },
      // 🎯 CONVERSION ENHANCEMENTS
      savings: {
        amount: `R$ ${savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        percentage: savingsPercentage,
        comparedTo: 'preço médio da rota'
      },
      popularityScore: Math.floor(Math.random() * 40) + 60,
      trendingStatus: index < 3 ? 'HOT' : index < 6 ? 'RISING' : 'STEADY',
      seasonality: Math.random() > 0.5 ? 'LOW' : 'SHOULDER',
      persuasionTags: generatePersuasionTags(dest.name, savingsPercentage, index < 3),
      destinationInsights: {
        weatherScore: Math.floor(Math.random() * 3) + 8,
        safetyRating: Math.floor(Math.random() * 2) + 8,
        culturalScore: Math.floor(Math.random() * 3) + 7,
        nightlifeScore: Math.floor(Math.random() * 4) + 6,
        foodScore: Math.floor(Math.random() * 3) + 7,
        affordabilityScore: 10 - Math.floor(savingsPercentage / 5)
      },
      socialMedia: {
        instagramHashtags: [`#${dest.name.toLowerCase()}`, '#travel', '#vacation', '#wanderlust'],
        tiktokViews: Math.floor(Math.random() * 5000000) + 1000000,
        influencerRecommendations: Math.floor(Math.random() * 50) + 10
      }
    };
  });
}

function generatePersuasionTags(destinationName: string, savingsPercentage: number, isHot: boolean): string[] {
  const tags = [];
  
  if (savingsPercentage > 25) tags.push('💰 Super Oferta');
  if (savingsPercentage > 15) tags.push('🔥 Promoção');
  if (isHot) tags.push('⭐ Em Alta');
  
  // Destination-specific tags
  if (destinationName.includes('Miami')) tags.push('🏖️ Praia');
  if (destinationName.includes('Paris')) tags.push('🗼 Romântico');
  if (destinationName.includes('Tóquio')) tags.push('🍣 Cultura');
  if (destinationName.includes('Dubai')) tags.push('🏗️ Luxo');
  
  return tags.slice(0, 3); // Limit to 3 tags
}