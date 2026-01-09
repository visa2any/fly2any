import { NextRequest, NextResponse } from 'next/server';
import { globalScalingPredictor } from '@/lib/scaling/predictor';
import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ScalingPredictionRequest {
  metrics?: Array<{
    timestamp: string;
    cpuUsage: number;
    memoryUsage: number;
    requestRate: number;
    errorRate: number;
    responseTime: number;
    activeConnections: number;
  }>;
  timeHorizon?: number;
  errorPattern?: {
    category: ErrorCategory;
    severity: ErrorSeverity;
    errorRate: number;
    affectedEndpoint?: string;
  };
  budgetConstraint?: number;
}

interface ScalingPredictionResponse {
  success: boolean;
  predictionId: string;
  timestamp: string;
  timeHorizon: number;
  predictions: Array<{
    resourceType: string;
    currentLoad: number;
    predictedLoad: number;
    confidenceInterval: [number, number];
    riskLevel: string;
  }>;
  recommendations: Array<{
    id: string;
    resourceType: string;
    action: string;
    confidence: number;
    estimatedImpact: number;
    urgency: string;
    reason: string;
    details: {
      currentValue: number;
      targetValue: number;
      unit: string;
      costImplication?: number;
      implementationComplexity: string;
    };
    suggestedTimeline: string;
  }>;
  overallRisk: string;
  estimatedCostChange: number;
  errorPatternRecommendations?: Array<{
    id: string;
    resourceType: string;
    action: string;
    confidence: number;
    estimatedImpact: number;
    urgency: string;
    reason: string;
  }>;
  simulation?: {
    estimatedPerformanceChange: number;
    estimatedCostChange: number;
    riskReduction: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ScalingPredictionRequest = await request.json();
    const timeHorizon = body.timeHorizon || 24;
    
    // Convert metrics to proper format if provided
    const metrics = body.metrics?.map(m => ({
      timestamp: new Date(m.timestamp),
      cpuUsage: m.cpuUsage,
      memoryUsage: m.memoryUsage,
      requestRate: m.requestRate,
      errorRate: m.errorRate,
      responseTime: m.responseTime,
      activeConnections: m.activeConnections,
    })) || [];

    // Generate prediction
    const prediction = await globalScalingPredictor.analyzeAndPredict(metrics, timeHorizon);

    // Get error pattern recommendations if provided
    let errorPatternRecommendations = [];
    if (body.errorPattern) {
      errorPatternRecommendations = await globalScalingPredictor.getScalingForErrorPattern(
        body.errorPattern.category,
        body.errorPattern.severity,
        body.errorPattern.errorRate,
        body.errorPattern.affectedEndpoint
      );
    }

    // Get cost-optimized recommendations if budget constraint provided
    let recommendations = [...prediction.recommendations];
    if (body.budgetConstraint !== undefined) {
      recommendations = globalScalingPredictor.getCostOptimizedRecommendations(
        prediction,
        body.budgetConstraint
      );
    }

    // Simulate impact
    const simulation = globalScalingPredictor.simulateScalingImpact(recommendations, metrics);

    const response: ScalingPredictionResponse = {
      success: true,
      predictionId: prediction.predictionId,
      timestamp: prediction.timestamp.toISOString(),
      timeHorizon: prediction.timeHorizon,
      predictions: prediction.predictions.map(p => ({
        resourceType: p.resourceType,
        currentLoad: p.currentLoad,
        predictedLoad: p.predictedLoad,
        confidenceInterval: p.confidenceInterval,
        riskLevel: p.riskLevel,
      })),
      recommendations: recommendations.map(r => ({
        id: r.id,
        resourceType: r.resourceType,
        action: r.action,
        confidence: r.confidence,
        estimatedImpact: r.estimatedImpact,
        urgency: r.urgency,
        reason: r.reason,
        details: {
          currentValue: r.details.currentValue,
          targetValue: r.details.targetValue,
          unit: r.details.unit,
          costImplication: r.details.costImplication,
          implementationComplexity: r.details.implementationComplexity,
        },
        suggestedTimeline: r.suggestedTimeline,
      })),
      overallRisk: prediction.overallRisk,
      estimatedCostChange: prediction.estimatedCostChange,
      errorPatternRecommendations: errorPatternRecommendations.length > 0 ? 
        errorPatternRecommendations.map(r => ({
          id: r.id,
          resourceType: r.resourceType,
          action: r.action,
          confidence: r.confidence,
          estimatedImpact: r.estimatedImpact,
          urgency: r.urgency,
          reason: r.reason,
        })) : undefined,
      simulation,
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Scaling Predictions API] Failed:', error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'historical':
        const historical = globalScalingPredictor.getHistoricalPerformance();
        return NextResponse.json({
          success: true,
          historicalMetrics: historical.metrics.slice(-24), // Last 24 hours
          scalingActions: historical.scalingActions.slice(-10), // Last 10 actions
          timestamp: new Date().toISOString(),
        });

      case 'health':
        return NextResponse.json({
          success: true,
          status: 'healthy',
          predictor: 'ScalingPredictor',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          endpoints: {
            POST: '/api/scaling/predictions - Generate scaling predictions',
            GET: '/api/scaling/predictions?action=historical - Get historical performance data',
            GET: '/api/scaling/predictions?action=health - Health check',
          },
          parameters: {
            POST: {
              metrics: 'Optional array of resource metrics',
              timeHorizon: 'Prediction time horizon in hours (default: 24)',
              errorPattern: 'Optional error pattern for specific recommendations',
              budgetConstraint: 'Optional budget constraint for cost optimization',
            },
          },
          timestamp: new Date().toISOString(),
        });
    }

  } catch (error: any) {
    console.error('[Scaling Predictions API GET] Failed:', error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}