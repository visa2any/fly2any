/**
 * 🤖 AI Insights API Route
 * Integra todas as APIs de IA da Amadeus com sistema inteligente de cache e fallback
 * Foco: Reduzir custos e criar independência gradual
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIAmadeusClient } from '@/lib/flights/ai-amadeus-client';
import { ProcessedFlightOffer } from '@/types/flights';

/**
 * POST /api/flights/ai-insights
 * Retorna insights de IA para otimizar conversão
 */
export async function POST(request: NextRequest) {
  console.log('🤖 AI Insights API called');
  
  try {
    const body = await request.json();
    const { 
      offers, 
      searchParams, 
      requestedInsights = ['choice', 'price', 'delay', 'recommendations', 'inspiration', 'branded', 'social', 'availability'] 
    } = body;

    if (!offers || !Array.isArray(offers)) {
      return NextResponse.json({
        success: false,
        error: 'Flight offers are required',
        details: ['offers array is missing or invalid']
      }, { status: 400 });
    }

    console.log(`🔍 Processing AI insights for ${offers.length} offers, requested: ${requestedInsights.join(', ')}`);

    const aiClient = new AIAmadeusClient();
    const insights: any = {};

    // 🎯 CHOICE PREDICTION
    if (requestedInsights.includes('choice')) {
      try {
        console.log('🎯 Getting choice predictions...');
        const choicePredictions = await aiClient.getChoicePredictions(offers);
        
        // Sort offers by choice probability
        const sortedOffers = offers.map((offer: ProcessedFlightOffer) => {
          const prediction = choicePredictions.find(p => p.flightId === offer.id);
          return {
            ...offer,
            choiceProbability: prediction?.choiceProbability || 0,
            choiceConfidence: prediction?.confidence || 'LOW',
            choiceReasons: prediction?.reasons || [],
            aiRecommended: (prediction?.choiceProbability || 0) > 0.7
          };
        }).sort((a, b) => b.choiceProbability - a.choiceProbability);

        insights.choicePredictions = {
          predictions: choicePredictions,
          sortedOffers,
          topChoice: choicePredictions[0],
          confidence: choicePredictions[0]?.confidence || 'LOW',
          dataSource: choicePredictions[0]?.localPrediction ? 'LOCAL_MODEL' : 'AMADEUS_API'
        };

        console.log(`✅ Choice predictions completed. Top choice: ${insights.choicePredictions.topChoice?.flightId} (${(insights.choicePredictions.topChoice?.choiceProbability * 100).toFixed(1)}%)`);
      } catch (error) {
        console.error('❌ Choice prediction failed:', error);
        insights.choicePredictions = { error: 'Choice prediction unavailable' };
      }
    }

    // 📊 PRICE ANALYSIS
    if (requestedInsights.includes('price')) {
      try {
        console.log('📊 Getting price analysis...');
        const priceAnalyses = await Promise.all(
          offers.map(async (offer: ProcessedFlightOffer) => {
            const route = {
              origin: searchParams.origin?.iataCode || offer.outbound.departure.iataCode,
              destination: searchParams.destination?.iataCode || offer.outbound.arrival.iataCode,
              date: searchParams.departureDate || offer.outbound.departure.date,
              currentPrice: parseFloat(offer.totalPrice.replace(/[^\d.]/g, ''))
            };
            
            const analysis = await aiClient.getPriceAnalysis(offer, route);
            return {
              flightId: offer.id,
              ...analysis
            };
          })
        );

        insights.priceAnalysis = {
          analyses: priceAnalyses,
          bestDeals: priceAnalyses
            .filter(a => a.recommendation === 'BUY_NOW' || a.recommendation === 'GOOD_DEAL')
            .sort((a, b) => a.percentageDifference - b.percentageDifference),
          averageSavings: priceAnalyses.reduce((sum, a) => sum + Math.abs(a.percentageDifference), 0) / priceAnalyses.length,
          dataSource: priceAnalyses[0]?.dataSource || 'LOCAL_MODEL'
        };

        console.log(`✅ Price analysis completed. ${insights.priceAnalysis.bestDeals.length} good deals found`);
      } catch (error) {
        console.error('❌ Price analysis failed:', error);
        insights.priceAnalysis = { error: 'Price analysis unavailable' };
      }
    }

    // ⏰ DELAY PREDICTION
    if (requestedInsights.includes('delay')) {
      try {
        console.log('⏰ Getting delay predictions...');
        const delayPredictions = await Promise.all(
          offers.slice(0, 5).map(async (offer: ProcessedFlightOffer) => {
            return await aiClient.getDelayPrediction(offer);
          })
        );

        insights.delayPredictions = {
          predictions: delayPredictions,
          mostReliable: delayPredictions
            .sort((a, b) => b.overallReliability - a.overallReliability)[0],
          averageReliability: delayPredictions.reduce((sum, p) => sum + p.overallReliability, 0) / delayPredictions.length,
          dataSource: delayPredictions[0]?.dataSource || 'LOCAL_MODEL'
        };

        console.log(`✅ Delay predictions completed. Most reliable: ${insights.delayPredictions.mostReliable?.flightId} (${(insights.delayPredictions.mostReliable?.overallReliability * 100).toFixed(1)}%)`);
      } catch (error) {
        console.error('❌ Delay prediction failed:', error);
        insights.delayPredictions = { error: 'Delay prediction unavailable' };
      }
    }

    // 🌟 TRAVEL RECOMMENDATIONS
    if (requestedInsights.includes('recommendations') && searchParams) {
      try {
        console.log('🌟 Getting travel recommendations...');
        const recommendations = await aiClient.getTravelRecommendations(searchParams);

        insights.recommendations = {
          destinations: recommendations.slice(0, 5),
          totalFound: recommendations.length,
          dataSource: recommendations.length > 0 ? 'AMADEUS_API' : 'NONE'
        };

        console.log(`✅ Travel recommendations completed. ${recommendations.length} destinations found`);
      } catch (error) {
        console.error('❌ Travel recommendations failed:', error);
        insights.recommendations = { error: 'Recommendations unavailable' };
      }
    }

    // ✨ FLIGHT INSPIRATION (Flexibilidade para economizar)
    if (requestedInsights.includes('inspiration') && searchParams?.origin) {
      try {
        console.log('✨ Getting flight inspiration...');
        const inspiration = await aiClient.getFlightInspiration(
          searchParams.origin.iataCode, 
          searchParams.budget,
          searchParams.departureDate
        );

        insights.inspiration = {
          destinations: inspiration.slice(0, 6),
          totalFound: inspiration.length,
          budget: searchParams.budget,
          dataSource: inspiration.length > 0 ? 'AMADEUS_API' : 'LOCAL_MODEL'
        };

        console.log(`✅ Flight inspiration completed. ${inspiration.length} destinations found`);
      } catch (error) {
        console.error('❌ Flight inspiration failed:', error);
        insights.inspiration = { error: 'Flight inspiration unavailable' };
      }
    }

    // 💎 BRANDED FARES UPSELL (Upselling inteligente)
    if (requestedInsights.includes('branded') && offers.length > 0) {
      try {
        console.log('💎 Getting branded fares upsell...');
        const upsells = await Promise.all(
          offers.slice(0, 3).map(async (offer: ProcessedFlightOffer) => {
            const upsell = await aiClient.getBrandedFareUpsell([offer.rawOffer]);
            return {
              flightId: offer.id,
              ...upsell
            };
          })
        );

        insights.brandedUpsells = {
          upsells: upsells.filter(u => u.brandedFares && u.brandedFares.length > 0),
          totalOptions: upsells.reduce((sum, u) => sum + (u.brandedFares?.length || 0), 0),
          dataSource: 'AMADEUS_API'
        };

        console.log(`✅ Branded fares completed. ${insights.brandedUpsells.upsells.length} upsell opportunities found`);
      } catch (error) {
        console.error('❌ Branded fares failed:', error);
        insights.brandedUpsells = { error: 'Branded fares unavailable' };
      }
    }

    // 👥 SOCIAL PROOF (Most Booked Destinations)
    if (requestedInsights.includes('social') && searchParams?.origin) {
      try {
        console.log('👥 Getting social proof data...');
        const mostBooked = await aiClient.getMostBookedDestinations(
          searchParams.origin.iataCode, 
          'MONTH'
        );

        insights.socialProof = {
          mostBooked: mostBooked.slice(0, 5),
          totalBookings: mostBooked.reduce((sum, dest) => sum + dest.travelers, 0),
          period: 'MONTH',
          dataSource: mostBooked.length > 0 ? 'AMADEUS_API' : 'LOCAL_MODEL'
        };

        console.log(`✅ Social proof completed. ${mostBooked.length} destinations with booking data`);
      } catch (error) {
        console.error('❌ Social proof failed:', error);
        insights.socialProof = { error: 'Social proof unavailable' };
      }
    }

    // 🚨 FLIGHT AVAILABILITY (Urgency real)
    if (requestedInsights.includes('availability') && offers.length > 0) {
      try {
        console.log('🚨 Getting flight availability...');
        const availabilities = await Promise.all(
          offers.slice(0, 5).map(async (offer: ProcessedFlightOffer) => {
            const availability = await aiClient.getFlightAvailabilities(offer.id);
            return {
              flightId: offer.id,
              availability: availability
            };
          })
        );

        const lowAvailability = availabilities.filter(av => 
          av.availability.some(seg => 
            seg.availability.some(cls => 
              cls.class === 'ECONOMY' && cls.numberOfBookableSeats <= 10
            )
          )
        );

        insights.availability = {
          flights: availabilities,
          lowAvailabilityCount: lowAvailability.length,
          urgentBookings: lowAvailability.slice(0, 3),
          dataSource: 'AMADEUS_API'
        };

        console.log(`✅ Availability completed. ${lowAvailability.length} flights with low availability`);
      } catch (error) {
        console.error('❌ Availability check failed:', error);
        insights.availability = { error: 'Availability check unavailable' };
      }
    }

    // 📊 AI ANALYTICS
    const aiAnalytics = aiClient.getAIAnalytics();

    // 🎯 ENHANCED RESPONSE WITH CONVERSION OPTIMIZATION
    const enhancedResponse = {
      success: true,
      data: insights,
      meta: {
        processedOffers: offers.length,
        insightsGenerated: Object.keys(insights).length,
        processingTime: Date.now(),
        aiAnalytics,
        conversionOptimization: {
          topChoiceConfidence: insights.choicePredictions?.topChoice?.choiceProbability || 0,
          bestPriceDeals: insights.priceAnalysis?.bestDeals?.length || 0,
          reliableFlights: insights.delayPredictions?.predictions?.filter((p: any) => p.overallReliability > 0.8).length || 0,
          recommendationsAvailable: insights.recommendations?.destinations?.length || 0,
          inspirationOptions: insights.inspiration?.destinations?.length || 0,
          upsellOpportunities: insights.brandedUpsells?.upsells?.length || 0,
          socialProofDestinations: insights.socialProof?.mostBooked?.length || 0,
          urgentAvailability: insights.availability?.urgentBookings?.length || 0
        },
        costOptimization: {
          monthlySpend: aiAnalytics.monthlySpend,
          budgetRemaining: aiAnalytics.budgetRemaining,
          cacheHitRate: aiAnalytics.cacheStats.averageHitRate,
          costSavings: `$${(aiAnalytics.cacheStats.averageHitRate * 0.05).toFixed(2)} saved this request`
        }
      },
      persuasionElements: generatePersuasionElements(insights),
      uiEnhancements: generateUIEnhancements(insights, offers)
    };

    return NextResponse.json(enhancedResponse);

  } catch (error) {
    console.error('❌ AI Insights API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI insights',
      details: error instanceof Error ? error.message : 'Unknown error',
      supportInfo: {
        message: 'AI insights temporarily unavailable. Basic search still works.',
        fallbackMode: true
      }
    }, { status: 500 });
  }
}

// =============================================================================
// 🎯 PERSUASION ELEMENTS GENERATOR
// =============================================================================

function generatePersuasionElements(insights: any): any {
  const elements = [];

  // Choice prediction elements
  if (insights.choicePredictions?.topChoice) {
    const topChoice = insights.choicePredictions.topChoice;
    elements.push({
      type: 'AI_RECOMMENDATION',
      title: '🤖 AI Recommendation',
      message: `Our AI predicts ${(topChoice.choiceProbability * 100).toFixed(1)}% chance you'll choose this flight`,
      confidence: topChoice.confidence,
      placement: 'TOP_OF_CARD',
      style: 'success'
    });
  }

  // Price analysis elements
  if (insights.priceAnalysis?.bestDeals?.length > 0) {
    const bestDeal = insights.priceAnalysis.bestDeals[0];
    if (bestDeal.percentageDifference < -10) {
      elements.push({
        type: 'PRICE_ALERT',
        title: '💰 Excellent Deal',
        message: `${Math.abs(bestDeal.percentageDifference).toFixed(0)}% below historical average`,
        urgency: 'HIGH',
        placement: 'PRICE_SECTION',
        style: 'success'
      });
    }
  }

  // Delay prediction elements
  if (insights.delayPredictions?.mostReliable) {
    const reliable = insights.delayPredictions.mostReliable;
    if (reliable.overallReliability > 0.85) {
      elements.push({
        type: 'RELIABILITY_BADGE',
        title: '⏱️ High Reliability',
        message: `${(reliable.overallReliability * 100).toFixed(0)}% on-time performance`,
        confidence: 'HIGH',
        placement: 'BADGE_AREA',
        style: 'info'
      });
    }
  }

  // Flight inspiration elements  
  if (insights.inspiration?.destinations?.length > 0) {
    const inspiration = insights.inspiration.destinations[0];
    elements.push({
      type: 'INSPIRATION_ALERT',
      title: '✈️ Flexible Dates',
      message: `Consider ${inspiration.destinationName} for $${inspiration.price.toFixed(0)} - save money by being flexible!`,
      confidence: 'MEDIUM',
      placement: 'SIDEBAR',
      style: 'info'
    });
  }

  // Branded fares upsell elements
  if (insights.brandedUpsells?.upsells?.length > 0) {
    const upsell = insights.brandedUpsells.upsells[0];
    const premiumOption = upsell.brandedFares?.find((f: any) => f.brandedFare === 'PREMIUM');
    if (premiumOption) {
      elements.push({
        type: 'UPSELL_OPPORTUNITY',
        title: '💎 Upgrade Available',
        message: `Add premium amenities for only +$${premiumOption.price.total}`,
        confidence: 'HIGH',
        placement: 'UPSELL_SECTION',
        style: 'warning'
      });
    }
  }

  // Social proof elements
  if (insights.socialProof?.mostBooked?.length > 0) {
    const topDestination = insights.socialProof.mostBooked[0];
    elements.push({
      type: 'SOCIAL_PROOF',
      title: '👥 Popular Choice',
      message: `${topDestination.travelers.toLocaleString()} travelers booked ${topDestination.destinationName} this month`,
      confidence: 'HIGH',
      placement: 'TOP_BANNER',
      style: 'success'
    });
  }

  // Availability urgency elements
  if (insights.availability?.urgentBookings?.length > 0) {
    const urgentFlight = insights.availability.urgentBookings[0];
    const economySeats = urgentFlight.availability
      .flatMap((seg: any) => seg.availability)
      .find((cls: any) => cls.class === 'ECONOMY');
    
    if (economySeats && economySeats.numberOfBookableSeats <= 5) {
      elements.push({
        type: 'URGENCY_ALERT',
        title: '🚨 Limited Availability',
        message: `Only ${economySeats.numberOfBookableSeats} seats left in economy class`,
        urgency: 'HIGH',
        placement: 'AVAILABILITY_BANNER',
        style: 'danger'
      });
    }
  }

  return elements;
}

// =============================================================================
// 🎨 UI ENHANCEMENTS GENERATOR
// =============================================================================

function generateUIEnhancements(insights: any, offers: any[]): any {
  const enhancements = {
    sortingRecommendation: null,
    badges: [],
    highlights: [],
    warnings: []
  };

  // Sorting recommendation based on AI
  if (insights.choicePredictions?.sortedOffers) {
    (enhancements as any).sortingRecommendation = {
      type: 'AI_SORTED',
      message: 'Flights sorted by AI prediction of your preferences',
      confidence: 'HIGH'
    };
  }

  // Generate badges for each offer
  offers.forEach((offer: any, index: number) => {
    const badges = [];

    // AI recommendation badge
    if (insights.choicePredictions?.predictions) {
      const prediction = insights.choicePredictions.predictions.find((p: any) => p.flightId === offer.id);
      if (prediction && prediction.choiceProbability > 0.7) {
        badges.push({
          type: 'AI_RECOMMENDED',
          text: 'AI Pick',
          style: 'success',
          icon: '🤖'
        });
      }
    }

    // Price deal badge
    if (insights.priceAnalysis?.analyses) {
      const analysis = insights.priceAnalysis.analyses.find((a: any) => a.flightId === offer.id);
      if (analysis && analysis.percentageDifference < -15) {
        badges.push({
          type: 'GREAT_DEAL',
          text: `${Math.abs(analysis.percentageDifference).toFixed(0)}% OFF`,
          style: 'success',
          icon: '💰'
        });
      }
    }

    // Reliability badge
    if (insights.delayPredictions?.predictions) {
      const prediction = insights.delayPredictions.predictions.find((p: any) => p.flightId === offer.id);
      if (prediction && prediction.overallReliability > 0.85) {
        badges.push({
          type: 'RELIABLE',
          text: 'Reliable',
          style: 'info',
          icon: '⏱️'
        });
      }
    }

    // Upsell availability badge
    if (insights.brandedUpsells?.upsells) {
      const upsell = insights.brandedUpsells.upsells.find((u: any) => u.flightId === offer.id);
      if (upsell && upsell.brandedFares?.length > 1) {
        badges.push({
          type: 'UPGRADES_AVAILABLE',
          text: 'Upgrades',
          style: 'warning',
          icon: '💎'
        });
      }
    }

    // Social proof badge
    if (insights.socialProof?.mostBooked?.length > 0) {
      const isPopularDestination = insights.socialProof.mostBooked.some(
        (dest: any) => offer.outbound.arrival.iataCode === dest.destination
      );
      if (isPopularDestination) {
        badges.push({
          type: 'POPULAR_ROUTE',
          text: 'Popular',
          style: 'success',
          icon: '👥'
        });
      }
    }

    // Low availability badge
    if (insights.availability?.flights) {
      const availability = insights.availability.flights.find((av: any) => av.flightId === offer.id);
      if (availability) {
        const economySeats = availability.availability
          .flatMap((seg: any) => seg.availability)
          .find((cls: any) => cls.class === 'ECONOMY');
        
        if (economySeats && economySeats.numberOfBookableSeats <= 5) {
          badges.push({
            type: 'LOW_AVAILABILITY',
            text: `${economySeats.numberOfBookableSeats} Left`,
            style: 'danger',
            icon: '🚨'
          });
        }
      }
    }

    (enhancements.badges as any).push({
      offerId: offer.id,
      badges
    });
  });

  return enhancements;
}

/**
 * GET /api/flights/ai-insights/analytics
 * Retorna analytics de uso da IA e custos
 */
export async function GET(request: NextRequest) {
  try {
    const aiClient = new AIAmadeusClient();
    const analytics = aiClient.getAIAnalytics();

    return NextResponse.json({
      success: true,
      data: analytics,
      recommendations: {
        budgetOptimization: analytics.budgetRemaining < 100 ? 
          'Consider increasing cache TTL to reduce API calls' : 
          'Budget is healthy',
        performanceOptimization: analytics.cacheStats.averageHitRate < 0.7 ?
          'Low cache hit rate - consider longer cache periods' :
          'Cache performance is good'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get AI analytics'
    }, { status: 500 });
  }
}