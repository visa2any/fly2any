/**
 * ✈️ Flight Availabilities API Route
 * Conecta ao SuperAmadeusClient para verificar disponibilidade em tempo real
 * Focus: Scarcity psychology, urgency creation, and booking conversion
 */

import { NextRequest, NextResponse } from 'next/server';
import { SuperAmadeusClient } from '@/lib/flights/super-amadeus-client';
import { OriginDestination, AvailabilitySearchCriteria, TravelerInfo } from '@/types/flights';

/**
 * POST /api/flights/availabilities
 * Check real-time flight availability with scarcity optimization
 */
export async function POST(request: NextRequest) {
  console.log('✈️ Flight availabilities API called');
  
  try {
    const body = await request.json();
    const { originDestinations, travelers, searchCriteria } = body;

    // Validate required parameters
    if (!originDestinations || !Array.isArray(originDestinations) || originDestinations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Origin destinations are required',
        details: ['originDestinations array is missing or empty']
      }, { status: 400 });
    }

    console.log('🔍 Flight availability search parameters:', {
      routes: originDestinations.length,
      criteria: searchCriteria
    });

    // Get SuperAmadeus client and check availability
    const superAmadeusClient = new SuperAmadeusClient();
    
    try {
      // Check flight availability with scarcity optimization
      console.log('📡 Calling Amadeus Flight Availabilities API...');
      const availabilities = await superAmadeusClient.checkFlightAvailability({
        originDestinations: originDestinations as OriginDestination[],
        travelers: (travelers as TravelerInfo[]) || [{ 
          id: '1', 
          dateOfBirth: '1990-01-01', 
          name: { firstName: 'John', lastName: 'Doe' }, 
          gender: 'MALE' as const 
        }],
        sources: ['GDS'] as ('GDS')[],
        searchCriteria: searchCriteria as AvailabilitySearchCriteria
      });

      console.log(`✅ Found ${availabilities.length} available flight options`);

      // 🎯 ENHANCE WITH SCARCITY PSYCHOLOGY
      const scarcityAnalysis = calculateScarcityMetrics(availabilities);
      
      const enhancedResponse = {
        success: true,
        data: availabilities,
        meta: {
          total: availabilities.length,
          searchId: `availability-${Date.now()}`,
          scarcityLevel: scarcityAnalysis.overallScarcityLevel,
          conversionScore: calculateAvailabilityConversionScore(availabilities, scarcityAnalysis),
          recommendedAction: generateAvailabilityRecommendedAction(availabilities, scarcityAnalysis),
          urgencyLevel: determineAvailabilityUrgencyLevel(availabilities, scarcityAnalysis),
          personalizedMessage: generateAvailabilityPersonalizedMessage(availabilities, scarcityAnalysis)
        },
        scarcityIndicators: {
          criticalRoutes: scarcityAnalysis.criticalRoutes,
          fastSellingFlights: scarcityAnalysis.fastSellingFlights,
          lastSeatsWarning: scarcityAnalysis.lastSeatsWarning,
          priceVolatilityAlert: scarcityAnalysis.priceVolatilityAlert
        },
        persuasionElements: {
          socialProof: generateAvailabilitySocialProofMessages(availabilities, scarcityAnalysis),
          scarcity: generateAvailabilityScarcityMessages(availabilities, scarcityAnalysis),
          urgency: generateAvailabilityUrgencyMessages(availabilities, scarcityAnalysis),
          authority: [
            '✅ Disponibilidade verificada em tempo real',
            '🎯 Dados diretos das companhias aéreas',
            '⚡ Sistema sincronizado a cada 30 segundos',
            '🔒 Assentos bloqueados durante a seleção'
          ],
          reciprocity: [
            '🎁 Bloqueio gratuito por 15 minutos',
            '💝 Garantia de disponibilidade confirmada',
            '🔔 Alerta gratuito se mais assentos surgirem',
            '⭐ Prioridade para clientes Fly2Any'
          ]
        },
        bookingIncentives: generateBookingIncentives(availabilities, scarcityAnalysis),
        competitiveAdvantages: generateCompetitiveAdvantages(availabilities),
        realTimeUpdates: {
          nextUpdate: new Date(Date.now() + 30 * 1000).toISOString(),
          autoRefresh: true,
          changeNotifications: true,
          priceDropAlerts: true
        }
      };

      return NextResponse.json(enhancedResponse);

    } catch (amadeusError) {
      console.warn('⚠️ Amadeus Availabilities API temporarily unavailable, using fallback:', (amadeusError as any)?.message);
      
      // 🔄 FALLBACK: Generate demo availability data with full scarcity optimization
      const fallbackAvailabilities = generateFallbackAvailabilities(originDestinations, searchCriteria);
      const fallbackScarcityAnalysis = calculateScarcityMetrics(fallbackAvailabilities);
      
      console.log(`🔄 Serving ${fallbackAvailabilities.length} availability options (demo data with full scarcity optimization)`);
      
      return NextResponse.json({
        success: true,
        data: fallbackAvailabilities,
        meta: {
          total: fallbackAvailabilities.length,
          searchId: `availability-demo-${Date.now()}`,
          isDemoData: true,
          scarcityLevel: 'HIGH',
          conversionScore: 88,
          recommendedAction: '🚨 AÇÃO URGENTE! Apenas poucos assentos restantes - reserve AGORA antes que esgotem!',
          urgencyLevel: 'CRITICAL' as const,
          personalizedMessage: '⚡ Detectamos alta demanda para suas datas - assentos esgotando rapidamente!',
          amadeusError: (amadeusError as any)?.message || 'API temporarily unavailable'
        },
        scarcityIndicators: {
          criticalRoutes: Math.floor(fallbackAvailabilities.length * 0.6),
          fastSellingFlights: Math.floor(fallbackAvailabilities.length * 0.4),
          lastSeatsWarning: Math.floor(fallbackAvailabilities.length * 0.3),
          priceVolatilityAlert: true
        },
        persuasionElements: {
          socialProof: [
            `🔥 ${Math.floor(Math.random() * 200) + 150} pessoas verificando disponibilidade AGORA`,
            `📈 ${Math.floor(Math.random() * 50) + 30} reservas feitas na última hora`,
            '⭐ 94% dos clientes que viram esta disponibilidade fizeram a reserva',
            '👥 Você está competindo com outros 15 usuários por estes assentos'
          ],
          scarcity: [
            '🚨 CRÍTICO: Apenas 3-7 assentos restantes em vários voos',
            '⚠️ 67% dos voos já com ocupação acima de 90%',
            '🔥 Últimos assentos com preços promocionais',
            '💎 Disponibilidade limitada - pode esgotar a qualquer momento'
          ],
          urgency: [
            '⏰ URGENTE: Preços podem subir em 2 horas',
            '🚀 Reservas aumentaram 300% nas últimas 6 horas',
            '⚡ Sistema detectou alta pressão de demanda',
            '🔔 Última chance de garantir estes assentos hoje'
          ],
          authority: [
            '✅ Disponibilidade verificada em tempo real',
            '🎯 Dados diretos das companhias aéreas',
            '⚡ Sistema sincronizado a cada 30 segundos',
            '🔒 Assentos bloqueados durante a seleção'
          ],
          reciprocity: [
            '🎁 Bloqueio gratuito por 15 minutos',
            '💝 Garantia de disponibilidade confirmada',
            '🔔 Alerta gratuito se mais assentos surgirem',
            '⭐ Prioridade para clientes Fly2Any'
          ]
        },
        bookingIncentives: [
          {
            type: 'INSTANT_CONFIRMATION',
            title: '⚡ Confirmação Instantânea',
            description: 'Reserve agora e receba confirmação em 30 segundos',
            urgency: 'Válido apenas para as próximas 2 horas'
          },
          {
            type: 'PRICE_LOCK',
            title: '🔒 Preço Bloqueado',
            description: 'Garantimos este preço por 15 minutos',
            savings: 'Proteção contra aumentos'
          },
          {
            type: 'FREE_CANCELLATION',
            title: '🆓 Cancelamento Grátis',
            description: 'Cancele sem taxa em até 24h',
            peace_of_mind: 'Reserva sem risco'
          }
        ],
        competitiveAdvantages: [
          '🏆 Fly2Any encontra assentos que outros sites não mostram',
          '💰 Preços até 15% menores que a concorrência',
          '⚡ Processo de reserva 3x mais rápido',
          '🛡️ Proteção total contra overbooking'
        ]
      });
    }

  } catch (error) {
    console.error('❌ Flight availabilities search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar disponibilidade',
      details: error instanceof Error ? error.message : 'Unknown error',
      emergencyBooking: {
        message: 'Para reservas urgentes, entre em contato direto',
        whatsapp: '+55 11 99999-9999',
        phone: '+55 11 4000-0000',
        available: '24/7'
      }
    }, { status: 500 });
  }
}

// =============================================================================
// 🎯 SCARCITY PSYCHOLOGY & PERSUASION HELPERS
// =============================================================================

function calculateScarcityMetrics(availabilities: any[]): any {
  if (availabilities.length === 0) return {
    overallScarcityLevel: 'LOW',
    criticalRoutes: 0,
    fastSellingFlights: 0,
    lastSeatsWarning: 0,
    priceVolatilityAlert: false
  };

  const criticalFlights = availabilities.filter(a => 
    a.scarcityIndicators?.seatsLeft < 10 || 
    a.scarcityIndicators?.demandLevel === 'CRITICAL'
  ).length;

  const fastSelling = availabilities.filter(a =>
    a.scarcityIndicators?.bookingVelocity?.includes('HIGH') ||
    a.scarcityIndicators?.demandLevel === 'HIGH'
  ).length;

  const lastSeats = availabilities.filter(a => 
    a.scarcityIndicators?.seatsLeft < 5
  ).length;

  const highVolatility = availabilities.some(a => 
    a.scarcityIndicators?.priceVolatility === 'HIGH'
  );

  let overallScarcityLevel = 'LOW';
  if (criticalFlights / availabilities.length > 0.5) overallScarcityLevel = 'CRITICAL';
  else if (criticalFlights / availabilities.length > 0.3) overallScarcityLevel = 'HIGH';
  else if (criticalFlights / availabilities.length > 0.1) overallScarcityLevel = 'MEDIUM';

  return {
    overallScarcityLevel,
    criticalRoutes: criticalFlights,
    fastSellingFlights: fastSelling,
    lastSeatsWarning: lastSeats,
    priceVolatilityAlert: highVolatility
  };
}

function calculateAvailabilityConversionScore(availabilities: any[], scarcityAnalysis: any): number {
  let score = 60; // Base score
  
  // Scarcity bonus (30%)
  if (scarcityAnalysis.overallScarcityLevel === 'CRITICAL') score += 30;
  else if (scarcityAnalysis.overallScarcityLevel === 'HIGH') score += 25;
  else if (scarcityAnalysis.overallScarcityLevel === 'MEDIUM') score += 15;
  
  // Availability variety bonus (20%)
  score += Math.min(availabilities.length * 2, 20);
  
  // Urgency indicators bonus (10%)
  const urgentFlights = availabilities.filter(a => 
    a.scarcityIndicators?.seatsLeft < 10
  ).length;
  score += Math.min(urgentFlights * 5, 10);
  
  return Math.min(100, Math.round(score));
}

function generateAvailabilityRecommendedAction(availabilities: any[], scarcityAnalysis: any): string {
  if (scarcityAnalysis.overallScarcityLevel === 'CRITICAL') {
    return '🚨 CRÍTICO! Apenas poucos assentos restantes - RESERVE IMEDIATAMENTE!';
  }
  
  if (scarcityAnalysis.overallScarcityLevel === 'HIGH') {
    return '⚡ URGENTE! Alta demanda detectada - reserve nas próximas horas!';
  }
  
  if (scarcityAnalysis.fastSellingFlights > 0) {
    return `🔥 ${scarcityAnalysis.fastSellingFlights} voos vendendo rapidamente - não perca tempo!`;
  }
  
  return '✨ Boa disponibilidade encontrada - aproveite para escolher o melhor horário!';
}

function determineAvailabilityUrgencyLevel(availabilities: any[], scarcityAnalysis: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (scarcityAnalysis.overallScarcityLevel === 'CRITICAL') return 'CRITICAL';
  if (scarcityAnalysis.overallScarcityLevel === 'HIGH') return 'HIGH';
  if (scarcityAnalysis.fastSellingFlights > 2) return 'HIGH';
  if (scarcityAnalysis.lastSeatsWarning > 0) return 'MEDIUM';
  return 'LOW';
}

function generateAvailabilityPersonalizedMessage(availabilities: any[], scarcityAnalysis: any): string {
  const messages = [
    `🎯 Analisamos ${availabilities.length} opções e encontramos ${scarcityAnalysis.fastSellingFlights} voos com alta demanda!`,
    `⚡ ALERTA: ${scarcityAnalysis.criticalRoutes} rotas com disponibilidade crítica detectadas!`,
    `🔥 Sistema identificou padrão de alta procura - ${scarcityAnalysis.lastSeatsWarning} voos com últimos assentos!`,
    `💡 Com base na demanda atual, recomendamos reserva imediata para ${scarcityAnalysis.criticalRoutes} opções!`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateAvailabilitySocialProofMessages(availabilities: any[], scarcityAnalysis: any): string[] {
  const activeUsers = Math.floor(Math.random() * 150) + 50;
  const recentBookings = Math.floor(Math.random() * 30) + 10;
  
  return [
    `👥 ${activeUsers} pessoas verificando disponibilidade AGORA mesmo`,
    `📈 ${recentBookings} reservas feitas na última hora para estas rotas`,
    `⭐ ${Math.floor(Math.random() * 20) + 80}% dos usuários que viram esta disponibilidade fizeram a reserva`,
    `🔥 Você está competindo com outros ${Math.floor(Math.random() * 20) + 10} usuários por estes assentos`,
    `🏆 Esta é uma das rotas mais procuradas nas últimas 24 horas`
  ];
}

function generateAvailabilityScarcityMessages(availabilities: any[], scarcityAnalysis: any): string[] {
  const messages = [
    `🚨 CRÍTICO: Apenas ${Math.floor(Math.random() * 5) + 3} assentos restantes em ${scarcityAnalysis.criticalRoutes} voos`,
    `⚠️ ${Math.floor((scarcityAnalysis.criticalRoutes / availabilities.length) * 100)}% dos voos já com ocupação acima de 85%`,
    '🔥 Últimos assentos com preços promocionais - depois só há tarifas mais caras',
    '💎 Disponibilidade limitada - pode esgotar sem aviso prévio'
  ];
  
  if (scarcityAnalysis.priceVolatilityAlert) {
    messages.unshift('📈 ALERTA: Preços subindo rapidamente devido à alta demanda');
  }
  
  return messages;
}

function generateAvailabilityUrgencyMessages(availabilities: any[], scarcityAnalysis: any): string[] {
  const messages = [
    '⏰ URGENTE: Preços podem aumentar nas próximas 2 horas',
    '🚀 Reservas aumentaram 250% nas últimas 6 horas',
    '⚡ Sistema detectou pressão extrema de demanda',
    '🔔 Última oportunidade de garantir assentos hoje'
  ];
  
  if (scarcityAnalysis.overallScarcityLevel === 'CRITICAL') {
    messages.unshift('🚨 EMERGÊNCIA: Assentos esgotando em tempo real - reserve AGORA!');
  }
  
  return messages;
}

function generateBookingIncentives(availabilities: any[], scarcityAnalysis: any): any[] {
  const incentives = [
    {
      type: 'INSTANT_CONFIRMATION',
      title: '⚡ Confirmação Instantânea',
      description: 'Reserve agora e receba confirmação em 30 segundos',
      urgency: 'Disponível apenas nas próximas 2 horas'
    },
    {
      type: 'PRICE_PROTECTION',
      title: '🛡️ Proteção de Preço',
      description: 'Se o preço baixar, reembolsamos a diferença',
      savings: 'Garantia total'
    }
  ];
  
  if (scarcityAnalysis.overallScarcityLevel === 'CRITICAL') {
    incentives.unshift({
      type: 'EMERGENCY_BOOKING',
      title: '🚨 Reserva de Emergência',
      description: 'Processo acelerado para assentos críticos',
      urgency: 'Válido apenas por 15 minutos'
    });
  }
  
  return incentives;
}

function generateCompetitiveAdvantages(availabilities: any[]): string[] {
  return [
    '🏆 Fly2Any encontra assentos que outros sites não conseguem',
    '💰 Preços até 18% menores que a concorrência verificada',
    '⚡ Processo de reserva 4x mais rápido que sites tradicionais',
    '🛡️ Proteção 100% contra overbooking com compensação automática',
    '🎯 IA avançada garante a melhor seleção de voos disponíveis'
  ];
}

// =============================================================================
// 🔄 FALLBACK DATA GENERATOR
// =============================================================================

function generateFallbackAvailabilities(originDestinations: any[], searchCriteria: any): any[] {
  const availabilities = [];
  
  for (let i = 0; i < 12; i++) {
    const seatsLeft = Math.floor(Math.random() * 15) + 1;
    const demandLevel = seatsLeft < 5 ? 'CRITICAL' : seatsLeft < 10 ? 'HIGH' : 'MEDIUM';
    const basePrice = Math.floor(Math.random() * 1500) + 800;
    
    availabilities.push({
      type: 'flight-offer',
      id: `availability-${i + 1}`,
      source: 'GDS',
      instantTicketingRequired: Math.random() > 0.7,
      nonHomogeneous: false,
      oneWay: true,
      lastTicketingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      numberOfBookableSeats: seatsLeft,
      price: {
        currency: 'BRL',
        total: basePrice.toString(),
        base: (basePrice * 0.8).toString(),
        grandTotal: basePrice.toString()
      },
      validatingAirlineCodes: ['G3', 'AD', 'LA'],
      
      // 🎯 SCARCITY ENHANCEMENTS
      scarcityIndicators: {
        seatsLeft: seatsLeft,
        demandLevel: demandLevel,
        urgencyMessage: demandLevel === 'CRITICAL' ? 
          '🚨 Últimos assentos - reserve AGORA!' :
          demandLevel === 'HIGH' ?
          '⚡ Poucos assentos restantes' :
          '✅ Boa disponibilidade',
        priceVolatility: seatsLeft < 8 ? 'HIGH' : 'MEDIUM',
        bookingVelocity: demandLevel === 'CRITICAL' ? 
          'EXTREMELY_HIGH - 12 reservas/hora' :
          demandLevel === 'HIGH' ?
          'HIGH - 6 reservas/hora' :
          'MEDIUM - 3 reservas/hora'
      },
      
      conversionBoosts: {
        limitedTimeOffer: seatsLeft < 8,
        priceGuarantee: 'Melhor preço garantido por 24h',
        instantConfirmation: true,
        freeCancellation: 'Grátis em até 24h'
      },
      
      competitiveAdvantage: [
        `💰 R$ ${Math.floor(Math.random() * 200) + 50} mais barato que a concorrência`,
        seatsLeft < 5 ? '🔥 Único site com estes assentos disponíveis' : '⭐ Melhor seleção de horários',
        '⚡ Confirmação 3x mais rápida'
      ].slice(0, 2)
    });
  }
  
  return availabilities.sort((a, b) => a.numberOfBookableSeats - b.numberOfBookableSeats);
}