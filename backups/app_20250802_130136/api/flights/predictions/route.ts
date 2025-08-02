import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAmadeusClient } from '@/lib/flights/enhanced-amadeus-client';

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 API Flight Predictions - Iniciando análise ML...');
    
    const body = await request.json();
    const { flightOffers, predictionType } = body;

    if (!flightOffers || !Array.isArray(flightOffers)) {
      return NextResponse.json({
        success: false,
        error: 'Flight offers array is required'
      }, { status: 400 });
    }

    // Initialize enhanced Amadeus client
    const amadeusClient = new EnhancedAmadeusClient();

    let predictions = null;

    switch (predictionType) {
      case 'choice':
        predictions = await amadeusClient.getPredictedChoices(flightOffers);
        break;
      case 'price':
        predictions = await amadeusClient.analyzePricing(flightOffers);
        break;
      case 'branded':
        predictions = await amadeusClient.getBrandedFares(flightOffers);
        break;
      case 'delay':
        // For delay predictions, we need specific flight details
        const flightDetails = flightOffers[0]; // Use first offer as example
        predictions = await amadeusClient.getDelayPrediction(flightDetails);
        break;
      default:
        // Get all predictions
        const [choicePredictions, priceAnalysis, brandedFares] = await Promise.all([
          amadeusClient.getPredictedChoices(flightOffers),
          amadeusClient.analyzePricing(flightOffers),
          amadeusClient.getBrandedFares(flightOffers)
        ]);
        
        predictions = {
          choice: choicePredictions,
          price: priceAnalysis,
          branded: brandedFares
        };
    }

    console.log('✅ Flight predictions retrieved successfully');

    return NextResponse.json({
      success: true,
      data: predictions,
      meta: {
        predictionType: predictionType || 'all',
        source: 'amadeus',
        mlEnabled: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in flight predictions API:', error);
    
    // Return mock predictions for fallback
    const mockPredictions = {
      choice: {
        data: [
          { probability: 0.85, choiceLabel: 'HIGH' },
          { probability: 0.72, choiceLabel: 'MEDIUM' },
          { probability: 0.45, choiceLabel: 'LOW' }
        ]
      },
      price: {
        data: [
          { confidence: 'HIGH', quartileRanking: 'FIRST', percentage: 25 },
          { confidence: 'MEDIUM', quartileRanking: 'SECOND', percentage: 45 },
          { confidence: 'HIGH', quartileRanking: 'THIRD', percentage: 65 }
        ]
      },
      branded: {
        data: [
          {
            brandedFares: [
              {
                name: 'BASIC',
                price: { currency: 'BRL', total: '1020.00' },
                amenities: ['CARRY_ON_BAG']
              },
              {
                name: 'CLASSIC',
                price: { currency: 'BRL', total: '1150.00' },
                amenities: ['CARRY_ON_BAG', 'CHECKED_BAG', 'SEAT_SELECTION']
              }
            ]
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: mockPredictions,
      meta: {
        source: 'fallback',
        mlEnabled: false,
        timestamp: new Date().toISOString()
      }
    });
  }
}