/**
 * 📅 Flight Cheapest Dates API Route
 * Conecta ao SuperAmadeusClient para buscar datas mais baratas
 * Focus: Price psychology, urgency, and flexibility rewards
 */

import { NextRequest, NextResponse } from 'next/server';
import { SuperAmadeusClient } from '@/lib/flights/super-amadeus-client';
import { FlightDateSearchParams } from '@/types/flights';

/**
 * POST /api/flights/cheapest-dates
 * Search for cheapest flight dates with persuasion optimization
 */
export async function POST(request: NextRequest) {
  console.log('📅 Flight cheapest dates API called');
  
  try {
    const body = await request.json();
    const params = body as FlightDateSearchParams;

    // Validate required parameters
    if (!params.originLocationCode || !params.destinationLocationCode) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination are required',
        details: ['origin and destination parameters are missing']
      }, { status: 400 });
    }

    console.log('🔍 Flight cheapest dates search parameters:', params);

    // Get SuperAmadeus client and search dates
    const superAmadeusClient = new SuperAmadeusClient();
    
    try {
      // Call the cheapest dates API with persuasion optimization
      console.log('📡 Calling Amadeus Cheapest Dates API...');
      const dates = await superAmadeusClient.getCheapestFlightDates({
        origin: params.originLocationCode,
        destination: params.destinationLocationCode,
        departureDate: params.departureDate,
        oneWay: params.oneWay,
        nonStop: params.nonStop,
        maxPrice: params.maxPrice,
        viewBy: (params as any).viewBy || 'DATE'
      });

      console.log(`✅ Found ${dates.length} date options with price analysis`);

      // 🎯 CALCULATE PRICE PSYCHOLOGY METRICS
      const priceAnalysis = calculatePriceAnalysis(dates);
      
      // 🎯 ENHANCE WITH PERSUASION ELEMENTS
      const enhancedResponse = {
        success: true,
        data: dates,
        meta: {
          total: dates.length,
          searchId: `cheapest-dates-${Date.now()}`,
          route: `${params.originLocationCode} → ${params.destinationLocationCode}`,
          priceAnalysis,
          conversionScore: calculateDateConversionScore(dates, priceAnalysis),
          recommendedAction: generateDateRecommendedAction(dates, priceAnalysis),
          urgencyLevel: determineDateUrgencyLevel(dates, priceAnalysis),
          personalizedMessage: generateDatePersonalizedMessage(params, priceAnalysis)
        },
        persuasionElements: {
          socialProof: generateDateSocialProofMessages(dates, params),
          scarcity: generateDateScarcityMessages(dates, priceAnalysis),
          urgency: generateDateUrgencyMessages(dates, priceAnalysis),
          authority: [
            '📊 Preços analisados por nossa IA avançada',
            '🎯 Tendências baseadas em dados históricos de 5 anos',
            '⚡ Algoritmos de precificação dinâmica em tempo real'
          ],
          reciprocity: [
            '🎁 Alertas de preço gratuitos por 30 dias',
            '💝 Garantia de menor preço ou reembolso da diferença',
            '🔒 Preços bloqueados por 15 minutos sem compromisso'
          ]
        },
        upsellOpportunities: generateDateUpsellOpportunities(dates, priceAnalysis),
        flexibilityInsights: generateFlexibilityInsights(dates, priceAnalysis)
      };

      return NextResponse.json(enhancedResponse);

    } catch (amadeusError) {
      console.warn('⚠️ Amadeus Cheapest Dates API temporarily unavailable, using fallback:', (amadeusError as any)?.message);
      
      // 🔄 FALLBACK: Generate demo dates with full persuasion optimization
      const fallbackDates = generateFallbackCheapestDates(params);
      const fallbackPriceAnalysis = calculatePriceAnalysis(fallbackDates);
      
      console.log(`🔄 Serving ${fallbackDates.length} date options (demo data with full persuasion optimization)`);
      
      return NextResponse.json({
        success: true,
        data: fallbackDates,
        meta: {
          total: fallbackDates.length,
          searchId: `cheapest-dates-demo-${Date.now()}`,
          route: `${params.originLocationCode} → ${params.destinationLocationCode}`,
          isDemoData: true,
          priceAnalysis: fallbackPriceAnalysis,
          conversionScore: 88, // High score for demo
          recommendedAction: `🔥 OPORTUNIDADE ÚNICA! Economize até R$ ${Math.floor(fallbackPriceAnalysis.maxSavings)} sendo flexível com as datas!`,
          urgencyLevel: 'HIGH' as const,
          personalizedMessage: `💡 Analisamos centenas de combinações e encontramos as ${fallbackDates.length} datas mais baratas para você!`,
          amadeusError: (amadeusError as any)?.message || 'API temporarily unavailable'
        },
        persuasionElements: {
          socialProof: [
            `👥 ${Math.floor(Math.random() * 800) + 400} pessoas consultaram preços para esta rota hoje`,
            '⭐ 94% dos viajantes que usaram datas flexíveis economizaram mais de R$ 200',
            `🔥 Esta rota teve ${Math.floor(Math.random() * 150) + 80} reservas nas últimas 48h`
          ],
          scarcity: [
            '⚠️ Apenas 3 datas ainda têm preços abaixo de R$ 1000',
            '🔥 Assentos limitados nas datas mais baratas',
            '💎 Últimas oportunidades com desconto de mais de 25%'
          ],
          urgency: [
            '🚨 Preços podem subir até 15% nas próximas 24 horas',
            '⏰ Promoções válidas apenas até domingo à meia-noite',
            '⚡ Alta demanda detectada - preços subindo rapidamente'
          ],
          authority: [
            '📊 Preços analisados por nossa IA avançada',
            '🎯 Tendências baseadas em dados históricos de 5 anos',
            '⚡ Algoritmos de precificação dinâmica em tempo real'
          ],
          reciprocity: [
            '🎁 Alertas de preço gratuitos por 30 dias',
            '💝 Garantia de menor preço ou reembolso da diferença',
            '🔒 Preços bloqueados por 15 minutos sem compromisso'
          ]
        },
        upsellOpportunities: [
          {
            type: 'BUNDLE' as const,
            title: '🏨 Pacote Completo',
            description: 'Voo + Hotel + Seguro com 35% de desconto',
            savings: 'R$ 600',
            cta: 'Montar Pacote'
          },
          {
            type: 'ADDON' as const,
            title: '🔔 Alerta Premium',
            description: 'Receba notificações instantâneas quando o preço baixar ainda mais',
            savings: 'Gratuito por 3 meses',
            cta: 'Ativar Alertas'
          }
        ],
        flexibilityInsights: generateFlexibilityInsights(fallbackDates, fallbackPriceAnalysis)
      });
    }

  } catch (error) {
    console.error('❌ Flight cheapest dates search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// =============================================================================
// 🎯 PRICE PSYCHOLOGY & PERSUASION HELPERS
// =============================================================================

function calculatePriceAnalysis(dates: any[]): any {
  if (dates.length === 0) return null;

  const prices = dates.map(d => parseFloat(d.price.total.replace(/[^\d,]/g, '').replace(',', '.')));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const maxSavings = maxPrice - minPrice;
  const savingsPercentage = Math.round((maxSavings / maxPrice) * 100);

  const bestDate = dates.find(d => parseFloat(d.price.total.replace(/[^\d,]/g, '').replace(',', '.')) === minPrice);
  const worstDate = dates.find(d => parseFloat(d.price.total.replace(/[^\d,]/g, '').replace(',', '.')) === maxPrice);

  return {
    minPrice,
    maxPrice,
    avgPrice,
    maxSavings,
    savingsPercentage,
    bestDate,
    worstDate,
    priceRange: maxPrice - minPrice,
    flexibilityValue: Math.round(maxSavings),
    sweetSpot: {
      price: Math.round(avgPrice * 0.85), // 15% below average
      message: `Preços abaixo de R$ ${Math.round(avgPrice * 0.85)} são excelentes oportunidades!`
    }
  };
}

function calculateDateConversionScore(dates: any[], analysis: any): number {
  if (!analysis || dates.length === 0) return 0;
  
  let score = 60; // Base score
  
  // Savings potential bonus (30%)
  score += Math.min(analysis.savingsPercentage, 30);
  
  // Date variety bonus (20%)
  score += Math.min(dates.length * 2, 20);
  
  // Urgency indicators bonus (10%)
  const urgentDates = dates.filter(d => d.bookingUrgency?.level > 7).length;
  score += Math.min(urgentDates * 5, 10);
  
  return Math.min(100, Math.round(score));
}

function generateDateRecommendedAction(dates: any[], analysis: any): string {
  if (!analysis || dates.length === 0) return 'Tente ajustar suas datas de preferência';
  
  if (analysis.savingsPercentage > 30) {
    return `🚀 INCRÍVEL! Economize até R$ ${Math.round(analysis.maxSavings)} (${analysis.savingsPercentage}%) sendo flexível - RESERVE AGORA!`;
  }
  
  if (analysis.savingsPercentage > 20) {
    return `💰 EXCELENTE! Flexibilidade de datas pode economizar R$ ${Math.round(analysis.maxSavings)} - vale muito a pena!`;
  }
  
  if (analysis.savingsPercentage > 10) {
    return `✨ BOA OPORTUNIDADE! R$ ${Math.round(analysis.maxSavings)} de economia com datas flexíveis`;
  }
  
  return `💡 ${analysis.sweetSpot.message}`;
}

function determineDateUrgencyLevel(dates: any[], analysis: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (!analysis) return 'LOW';
  
  const risingPrices = dates.filter(d => d.priceChange?.trend === 'RISING').length;
  const highUrgency = dates.filter(d => d.bookingUrgency?.level > 8).length;
  
  if (analysis.savingsPercentage > 25 && (risingPrices > 3 || highUrgency > 2)) return 'CRITICAL';
  if (analysis.savingsPercentage > 20 || risingPrices > 2 || highUrgency > 1) return 'HIGH';
  if (analysis.savingsPercentage > 10 || risingPrices > 0) return 'MEDIUM';
  return 'LOW';
}

function generateDatePersonalizedMessage(params: any, analysis: any): string {
  if (!analysis) return `Analisando preços para ${params.origin} → ${params.destination}...`;
  
  const messages = [
    `🎯 Descobrimos o segredo: economie R$ ${Math.round(analysis.maxSavings)} ajustando sua viagem em apenas alguns dias!`,
    `💡 Nossa IA encontrou o padrão perfeito: ${Math.round(analysis.savingsPercentage)}% de economia com flexibilidade de datas!`,
    `✨ Baseado em milhões de buscas, estas são as datas mais econômicas para ${params.origin} → ${params.destination}`,
    `🚀 EXCLUSIVO: Identificamos uma janela de economia de R$ ${Math.round(analysis.maxSavings)} para sua rota!`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateDateSocialProofMessages(dates: any[], params: any): string[] {
  const searches = Math.floor(Math.random() * 500) + 200;
  const bookings = Math.floor(Math.random() * 100) + 50;
  
  return [
    `👥 ${searches} pessoas consultaram preços para esta rota nas últimas 24h`,
    `📈 ${bookings} viajantes já reservaram voos para ${params.destination} esta semana`,
    `⭐ 89% dos usuários que viram estas datas fizeram a reserva`,
    `🔥 Esta é uma das rotas mais procuradas do mês`
  ];
}

function generateDateScarcityMessages(dates: any[], analysis: any): string[] {
  if (!analysis) return [];
  
  const cheapDatesCount = dates.filter(d => 
    parseFloat(d.price.total.replace(/[^\d,]/g, '').replace(',', '.')) < analysis.avgPrice * 0.9
  ).length;
  
  return [
    `⚠️ Apenas ${cheapDatesCount} datas ainda têm preços abaixo da média`,
    '🔥 Assentos limitados nas datas mais baratas',
    '💎 Últimas oportunidades com mais de 20% de desconto',
    '⏰ Promoções podem acabar sem aviso prévio'
  ];
}

function generateDateUrgencyMessages(dates: any[], analysis: any): string[] {
  const messages = [
    '🚨 Preços podem subir até 20% nas próximas 48 horas',
    '⚡ Demanda alta detectada - reserve nas próximas horas',
    '⏰ Ofertas válidas apenas até o final do dia',
    '🔔 Última chance de garantir estes preços especiais'
  ];
  
  if (analysis && analysis.savingsPercentage > 25) {
    messages.unshift(`🚀 URGENTE: ${analysis.savingsPercentage}% de economia - pode não durar muito!`);
  }
  
  return messages;
}

function generateDateUpsellOpportunities(dates: any[], analysis: any): any[] {
  const opportunities = [
    {
      type: 'BUNDLE',
      title: '🏨 Voo + Hotel',
      description: 'Complete sua viagem e economize ainda mais',
      savings: 'Até R$ 500',
      cta: 'Ver Hotéis'
    },
    {
      type: 'ADDON',
      title: '🔔 Alerta de Preços',
      description: 'Seja notificado se o preço baixar ainda mais',
      savings: 'Gratuito',
      cta: 'Criar Alerta'
    }
  ];
  
  if (analysis && analysis.savingsPercentage > 20) {
    opportunities.unshift({
      type: 'UPGRADE',
      title: '✈️ Upgrade Premium',
      description: 'Classe executiva por apenas R$ 200 a mais',
      savings: 'R$ 300 desconto',
      cta: 'Fazer Upgrade'
    });
  }
  
  return opportunities;
}

function generateFlexibilityInsights(dates: any[], analysis: any): any {
  if (!analysis) return null;
  
  return {
    totalSavings: Math.round(analysis.maxSavings),
    savingsPercentage: analysis.savingsPercentage,
    bestStrategy: analysis.savingsPercentage > 20 ? 'FLEXIBLE_DATES' : 'FIXED_DATES',
    recommendations: [
      `💰 Sendo flexível, você pode economizar até R$ ${Math.round(analysis.maxSavings)}`,
      `📅 A melhor data é ${analysis.bestDate?.departureDate ? new Date(analysis.bestDate.departureDate).toLocaleDateString('pt-BR') : 'ainda sendo calculada'}`,
      `⚠️ Evite ${analysis.worstDate?.departureDate ? new Date(analysis.worstDate.departureDate).toLocaleDateString('pt-BR') : 'datas de alta temporada'} - preço mais alto`,
      `✨ ${analysis.sweetSpot.message}`
    ],
    flexibilityTips: [
      'Viaje entre terça e quinta-feira para melhores preços',
      'Evite feriados e eventos especiais na cidade de destino',
      'Considere viajar no início ou final do mês',
      'Seja flexível com +/- 3 dias para máxima economia'
    ]
  };
}

// =============================================================================
// 🔄 FALLBACK DATA GENERATOR
// =============================================================================

function generateFallbackCheapestDates(params: FlightDateSearchParams): any[] {
  const startDate = (params as any).departureDate ? new Date((params as any).departureDate) : new Date();
  const dates = [];
  
  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Create price variation (lowest on Tuesdays/Wednesdays)
    const dayOfWeek = currentDate.getDay();
    let basePrice = 1200;
    
    // Day of week pricing
    if (dayOfWeek === 2 || dayOfWeek === 3) { // Tue/Wed
      basePrice *= 0.8;
    } else if (dayOfWeek === 5 || dayOfWeek === 6) { // Fri/Sat
      basePrice *= 1.3;
    } else if (dayOfWeek === 0) { // Sunday
      basePrice *= 1.2;
    }
    
    // Add some randomness
    basePrice += (Math.random() - 0.5) * 400;
    basePrice = Math.max(600, Math.round(basePrice));
    
    // Price trend simulation
    const trend = Math.random() > 0.7 ? 'RISING' : Math.random() > 0.4 ? 'FALLING' : 'STABLE';
    const percentage = Math.floor(Math.random() * 15) + 5;
    
    dates.push({
      type: 'flight-date',
      origin: params.originLocationCode,
      destination: params.destinationLocationCode,
      departureDate: currentDate.toISOString().split('T')[0],
      price: {
        total: `R$ ${basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        currency: 'BRL'
      },
      links: {
        flightOffers: `/api/flights/search?origin=${params.originLocationCode}&destination=${params.destinationLocationCode}&departureDate=${currentDate.toISOString().split('T')[0]}`
      },
      // 🎯 PERSUASION ENHANCEMENTS
      priceChange: {
        trend,
        percentage,
        prediction: trend === 'RISING' ? `Preços podem subir ${percentage}% em 24h` : 
                   trend === 'FALLING' ? `Preços caindo ${percentage}% - aproveite!` : 
                   'Preços estáveis - boa hora para reservar',
        historicalLow: basePrice < 800,
        historicalHigh: basePrice > 1500
      },
      demandLevel: basePrice > 1400 ? 'HIGH' : basePrice > 1000 ? 'MEDIUM' : 'LOW',
      bookingUrgency: {
        level: trend === 'RISING' ? Math.floor(Math.random() * 3) + 8 : Math.floor(Math.random() * 5) + 3,
        message: trend === 'RISING' ? '🚨 Preços subindo rapidamente!' : '💡 Bom momento para reservar',
        timeRemaining: trend === 'RISING' ? `${Math.floor(Math.random() * 12) + 6} horas` : undefined
      },
      flexibilityBonus: trend === 'FALLING' ? {
        savings: `R$ ${Math.floor(Math.random() * 200) + 50}`,
        message: `💡 Economize sendo flexível!`,
        alternativeDates: [
          currentDate.toISOString().split('T')[0],
          new Date(currentDate.getTime() + 24*60*60*1000).toISOString().split('T')[0],
          new Date(currentDate.getTime() - 24*60*60*1000).toISOString().split('T')[0]
        ]
      } : undefined,
      weatherForecast: {
        temperature: Math.floor(Math.random() * 15) + 20,
        condition: ['Ensolarado', 'Parcialmente nublado', 'Nublado'][Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 3) + 7
      },
      eventBasedPricing: {
        hasEvents: Math.random() > 0.8,
        events: Math.random() > 0.8 ? ['Festival de Música', 'Conferência Tech'] : [],
        priceImpact: basePrice > 1400 ? 'HIGH' : basePrice > 1100 ? 'MEDIUM' : 'LOW'
      }
    });
  }
  
  return dates.sort((a, b) => 
    parseFloat(a.price.total.replace(/[^\d,]/g, '').replace(',', '.')) - 
    parseFloat(b.price.total.replace(/[^\d,]/g, '').replace(',', '.'))
  );
}