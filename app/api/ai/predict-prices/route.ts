/**
 * AI Price Prediction API Endpoint
 *
 * Provides machine learning-powered flight price predictions
 * for the next 30-90 days using ensemble methods.
 */

import { NextRequest, NextResponse } from 'next/server';
import { pricePredictionEngine } from '@/lib/ai/price-predictor';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface PredictionRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  daysAhead?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();

    // Validate required fields
    if (!body.origin || !body.destination || !body.departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    // Generate predictions
    const predictions = await pricePredictionEngine.predictPrices(
      {
        origin: body.origin,
        destination: body.destination,
        departureDate: body.departureDate,
        returnDate: body.returnDate,
        passengers: body.passengers || 1,
        cabinClass: body.cabinClass || 'economy',
      },
      body.daysAhead || 30
    );

    // Calculate insights
    const lowestPrice = Math.min(...predictions.map(p => p.predictedPrice));
    const highestPrice = Math.max(...predictions.map(p => p.predictedPrice));
    const averagePrice = Math.round(
      predictions.reduce((sum, p) => sum + p.predictedPrice, 0) / predictions.length
    );

    const bestDayToBuy = predictions.reduce((best, current) =>
      current.predictedPrice < best.predictedPrice ? current : best
    );

    return NextResponse.json({
      success: true,
      predictions,
      insights: {
        lowestPrice,
        highestPrice,
        averagePrice,
        bestDayToBuy: {
          date: bestDayToBuy.date,
          price: bestDayToBuy.predictedPrice,
          savings: Math.round(averagePrice - bestDayToBuy.predictedPrice),
        },
        priceRange: highestPrice - lowestPrice,
        volatility: ((highestPrice - lowestPrice) / averagePrice * 100).toFixed(1) + '%',
      },
      metadata: {
        route: `${body.origin} → ${body.destination}`,
        generatedAt: new Date().toISOString(),
        modelVersion: '2.0.0',
      },
    });
  } catch (error) {
    console.error('[AI] Price prediction failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate price predictions' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = searchParams.get('origin') || 'JFK';
  const destination = searchParams.get('destination') || 'LAX';
  const departureDate = searchParams.get('departureDate') ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const predictions = await pricePredictionEngine.predictPrices(
    {
      origin,
      destination,
      departureDate,
      passengers: 1,
      cabinClass: 'economy',
    },
    14 // 2 weeks of predictions for demo
  );

  return NextResponse.json({
    success: true,
    demo: true,
    predictions: predictions.slice(0, 7), // First week
    message: 'Demo prediction - use POST for full functionality',
  });
}
