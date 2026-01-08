import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { ErrorPredictor, createErrorPredictor, generateExampleData, ErrorDataPoint } from '@/lib/error/ml/predictor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function convertErrorLogsToDataPoints(errorLogs: any[]): ErrorDataPoint[] {
  // Group errors by hour
  const hourlyGroups: Record<string, any[]> = {};
  
  errorLogs.forEach(log => {
    const timestamp = new Date(log.timestamp);
    const hourKey = timestamp.toISOString().slice(0, 13) + ':00:00'; // Group by hour
    
    if (!hourlyGroups[hourKey]) {
      hourlyGroups[hourKey] = [];
    }
    hourlyGroups[hourKey].push(log);
  });
  
  // Convert each hour to a data point
  return Object.entries(hourlyGroups).map(([hourKey, logs]) => {
    const timestamp = new Date(hourKey);
    const errorCount = logs.length;
    
    // Calculate average severity (convert string severity to number)
    const severityMap: Record<string, number> = {
      'CRITICAL': 1.0,
      'HIGH': 0.75,
      'NORMAL': 0.5,
      'LOW': 0.25,
    };
    const errorSeverity = logs.reduce((sum, log) => {
      return sum + (severityMap[log.severity] || 0.5);
    }, 0) / logs.length;
    
    // Calculate category distribution
    const categoryDistribution: Record<string, number> = {};
    logs.forEach(log => {
      const category = log.errorType || 'UNKNOWN';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });
    // Normalize
    Object.keys(categoryDistribution).forEach(cat => {
      categoryDistribution[cat] = categoryDistribution[cat] / logs.length;
    });
    
    return {
      timestamp,
      errorCount,
      errorSeverity,
      categoryDistribution,
      // In a real system, we would fetch system metrics for the same time period
      // For now, we'll leave it undefined and let the predictor handle missing metrics
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';
    const prisma = getPrismaClient();

    const now = new Date();
    const ranges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    const since = ranges[range as keyof typeof ranges] || ranges['24h'];

    // Fetch error logs for the time range
    const errorLogs = await prisma.errorLog.findMany({
      where: { timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
    });

    // Convert to data points for the predictor
    let dataPoints: ErrorDataPoint[];
    
    if (errorLogs.length >= 10) {
      dataPoints = convertErrorLogsToDataPoints(errorLogs);
    } else {
      // If we don't have enough data, generate example data for demonstration
      console.log('[ErrorPredictor] Using example data due to insufficient error logs');
      dataPoints = generateExampleData(24);
    }
    
    // Create and train predictor
    const predictor = await createErrorPredictor(dataPoints);
    
    // Get predictions for next 6 hours
    const predictions = predictor.predictNext(6);
    
    // Get correlation analysis
    const correlationAnalysis = predictor.analyzeCorrelations();
    
    // Get predictor accuracy
    const accuracy = predictor.getAccuracy();
    
    return NextResponse.json({
      predictions,
      correlationAnalysis,
      accuracy,
      dataPointCount: dataPoints.length,
      usingRealData: errorLogs.length >= 10,
      generatedAt: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('[Analytics/Errors/Predictions] Failed:', error.message);
    
    // Fallback to example data in case of error
    const dataPoints = generateExampleData(24);
    const predictor = await createErrorPredictor(dataPoints);
    const predictions = predictor.predictNext(6);
    const correlationAnalysis = predictor.analyzeCorrelations();
    const accuracy = predictor.getAccuracy();
    
    return NextResponse.json({
      predictions,
      correlationAnalysis,
      accuracy,
      dataPointCount: dataPoints.length,
      usingRealData: false,
      generatedAt: new Date().toISOString(),
      error: error.message,
    }, { status: 200 });
  }
}