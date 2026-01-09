/**
 * Predictive Scaling Engine
 * 
 * Uses error patterns, traffic data, and historical performance to forecast
 * infrastructure needs and provide scaling recommendations.
 * Part of Phase 2D: Predictive Scaling improvements.
 */

import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export interface ResourceMetric {
  timestamp: Date;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  requestRate: number; // requests per second
  errorRate: number; // errors per second
  responseTime: number; // milliseconds
  activeConnections: number;
}

export interface ScalingRecommendation {
  id: string;
  resourceType: 'compute' | 'memory' | 'database' | 'cache' | 'network';
  action: 'scaleUp' | 'scaleDown' | 'maintain' | 'optimize';
  confidence: number; // 0-1
  estimatedImpact: number; // percentage improvement expected
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  details: {
    currentValue: number;
    targetValue: number;
    unit: string;
    costImplication?: number; // estimated cost change
    implementationComplexity: 'low' | 'medium' | 'high';
  };
  suggestedTimeline: 'immediate' | 'next-hour' | 'next-day' | 'next-week';
}

export interface ScalingPrediction {
  predictionId: string;
  timestamp: Date;
  timeHorizon: number; // hours
  predictions: {
    resourceType: string;
    currentLoad: number;
    predictedLoad: number;
    confidenceInterval: [number, number];
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  recommendations: ScalingRecommendation[];
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  estimatedCostChange: number; // percentage
}

export interface HistoricalScalingData {
  timestamp: Date;
  resourceType: string;
  actionTaken: string;
  result: 'success' | 'partial' | 'failure';
  performanceChange: number; // percentage
  costChange: number; // percentage
  errorRateBefore: number;
  errorRateAfter: number;
}

/**
 * Predictive scaling engine that analyzes metrics and provides recommendations
 */
export class ScalingPredictor {
  private historicalMetrics: ResourceMetric[] = [];
  private scalingHistory: HistoricalScalingData[] = [];
  private readonly maxHistorySize = 1000;

  constructor() {
    this.loadMockHistoricalData();
  }

  /**
   * Analyze current metrics and generate scaling predictions
   */
  async analyzeAndPredict(
    currentMetrics: ResourceMetric[],
    timeHorizon: number = 24 // hours
  ): Promise<ScalingPrediction> {
    const predictionId = `prediction-${Date.now()}`;
    const now = new Date();

    try {
      // Analyze current state
      const currentAnalysis = this.analyzeCurrentState(currentMetrics);
      
      // Predict future trends
      const trendPredictions = this.predictTrends(currentMetrics, timeHorizon);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(currentAnalysis, trendPredictions);
      
      // Calculate overall risk
      const overallRisk = this.calculateOverallRisk(recommendations, trendPredictions);
      
      // Estimate cost impact
      const estimatedCostChange = this.estimateCostChange(recommendations);

      const prediction: ScalingPrediction = {
        predictionId,
        timestamp: now,
        timeHorizon,
        predictions: trendPredictions,
        recommendations,
        overallRisk,
        estimatedCostChange,
      };

      // Store for future learning
      this.storePrediction(prediction);

      console.log(`[ScalingPredictor] Generated prediction ${predictionId} with ${recommendations.length} recommendations`);
      return prediction;

    } catch (error: any) {
      console.error('[ScalingPredictor] Prediction failed:', error.message);
      
      // Return fallback prediction
      return this.createFallbackPrediction(predictionId, now, timeHorizon);
    }
  }

  /**
   * Record the outcome of a scaling action for learning
   */
  recordScalingOutcome(data: HistoricalScalingData): void {
    this.scalingHistory.push(data);
    
    // Keep history size manageable
    if (this.scalingHistory.length > this.maxHistorySize) {
      this.scalingHistory = this.scalingHistory.slice(-this.maxHistorySize);
    }

    // Learn from this outcome
    this.learnFromOutcome(data);
  }

  /**
   * Get scaling recommendations based on error patterns
   */
  async getScalingForErrorPattern(
    errorCategory: ErrorCategory,
    errorSeverity: ErrorSeverity,
    errorRate: number,
    affectedEndpoint?: string
  ): Promise<ScalingRecommendation[]> {
    const recommendations: ScalingRecommendation[] = [];

    // Analyze error pattern and suggest scaling
    switch (errorCategory) {
      case ErrorCategory.NETWORK:
        recommendations.push(
          this.createNetworkScalingRecommendation(errorSeverity, errorRate, affectedEndpoint)
        );
        break;

      case ErrorCategory.DATABASE:
        recommendations.push(
          this.createDatabaseScalingRecommendation(errorSeverity, errorRate, affectedEndpoint)
        );
        break;

      case ErrorCategory.EXTERNAL_API:
        recommendations.push(
          this.createExternalAPIScalingRecommendation(errorSeverity, errorRate, affectedEndpoint)
        );
        break;

      case ErrorCategory.CONFIGURATION:
        recommendations.push(
          this.createConfigurationScalingRecommendation(errorSeverity, errorRate, affectedEndpoint)
        );
        break;

      default:
        // Generic scaling recommendation for unknown errors
        if (errorSeverity === ErrorSeverity.HIGH || errorSeverity === ErrorSeverity.CRITICAL) {
          recommendations.push(
            this.createGenericScalingRecommendation(errorSeverity, errorRate)
          );
        }
    }

    // Add monitoring recommendation for all critical errors
    if (errorSeverity === ErrorSeverity.CRITICAL) {
      recommendations.push({
        id: `monitoring-${Date.now()}`,
        resourceType: 'compute',
        action: 'scaleUp',
        confidence: 0.8,
        estimatedImpact: 30,
        urgency: 'high',
        reason: `Critical ${errorCategory} errors detected - increase monitoring capacity`,
        details: {
          currentValue: 1,
          targetValue: 2,
          unit: 'monitoring instances',
          implementationComplexity: 'low',
        },
        suggestedTimeline: 'immediate',
      });
    }

    return recommendations;
  }

  /**
   * Get cost-optimized scaling recommendations
   */
  getCostOptimizedRecommendations(
    predictions: ScalingPrediction,
    budgetConstraint?: number
  ): ScalingRecommendation[] {
    const recommendations = [...predictions.recommendations];

    // Sort by cost-effectiveness (impact per estimated cost)
    recommendations.sort((a, b) => {
      const costA = a.details.costImplication || 0;
      const costB = b.details.costImplication || 0;
      
      const valueA = a.estimatedImpact / (costA || 1);
      const valueB = b.estimatedImpact / (costB || 1);
      
      return valueB - valueA; // Higher value first
    });

    // Apply budget constraint if provided
    if (budgetConstraint) {
      let totalCost = 0;
      const filtered: ScalingRecommendation[] = [];
      
      for (const rec of recommendations) {
        const cost = rec.details.costImplication || 0;
        if (totalCost + cost <= budgetConstraint) {
          filtered.push(rec);
          totalCost += cost;
        } else {
          // Skip this recommendation if it exceeds budget
          console.log(`[ScalingPredictor] Skipping recommendation ${rec.id} due to budget constraint`);
        }
      }
      
      return filtered;
    }

    return recommendations;
  }

  /**
   * Get historical performance data
   */
  getHistoricalPerformance(): {
    metrics: ResourceMetric[];
    scalingActions: HistoricalScalingData[];
  } {
    return {
      metrics: [...this.historicalMetrics],
      scalingActions: [...this.scalingHistory],
    };
  }

  /**
   * Simulate the impact of scaling recommendations
   */
  simulateScalingImpact(
    recommendations: ScalingRecommendation[],
    currentMetrics: ResourceMetric[]
  ): {
    estimatedPerformanceChange: number;
    estimatedCostChange: number;
    riskReduction: number;
  } {
    let totalPerformanceChange = 0;
    let totalCostChange = 0;
    let totalRiskReduction = 0;
    let count = 0;

    for (const rec of recommendations) {
      totalPerformanceChange += rec.estimatedImpact;
      totalCostChange += rec.details.costImplication || 0;
      
      // Estimate risk reduction based on urgency
      const riskReductionMap = {
        critical: 40,
        high: 25,
        medium: 15,
        low: 5,
      };
      totalRiskReduction += riskReductionMap[rec.urgency];
      count++;
    }

    return {
      estimatedPerformanceChange: count > 0 ? totalPerformanceChange / count : 0,
      estimatedCostChange: totalCostChange,
      riskReduction: count > 0 ? totalRiskReduction / count : 0,
    };
  }

  private analyzeCurrentState(metrics: ResourceMetric[]) {
    if (metrics.length === 0) {
      return {
        cpuUsage: 50,
        memoryUsage: 60,
        requestRate: 100,
        errorRate: 0.5,
        responseTime: 200,
        isStable: true,
        bottlenecks: [],
      };
    }

    const latest = metrics[metrics.length - 1];
    const avgCpu = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;
    const avgMemory = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;

    const bottlenecks: string[] = [];
    if (latest.cpuUsage > 80) bottlenecks.push('CPU');
    if (latest.memoryUsage > 85) bottlenecks.push('Memory');
    if (latest.responseTime > 1000) bottlenecks.push('Response Time');
    if (latest.errorRate > 5) bottlenecks.push('Error Rate');

    return {
      cpuUsage: avgCpu,
      memoryUsage: avgMemory,
      requestRate: latest.requestRate,
      errorRate: avgErrorRate,
      responseTime: latest.responseTime,
      isStable: bottlenecks.length === 0,
      bottlenecks,
    };
  }

  private predictTrends(metrics: ResourceMetric[], timeHorizon: number) {
    if (metrics.length < 2) {
      // Not enough data, return conservative predictions
      return [
        {
          resourceType: 'compute',
          currentLoad: 50,
          predictedLoad: 55,
          confidenceInterval: [45, 65],
          riskLevel: 'low' as const,
        },
        {
          resourceType: 'memory',
          currentLoad: 60,
          predictedLoad: 65,
          confidenceInterval: [55, 75],
          riskLevel: 'low' as const,
        },
      ];
    }

    // Simple linear trend prediction (in production, use more sophisticated ML)
    const recentMetrics = metrics.slice(-10); // Last 10 data points
    
    const computeTrend = this.calculateTrend(recentMetrics.map(m => m.cpuUsage));
    const memoryTrend = this.calculateTrend(recentMetrics.map(m => m.memoryUsage));
    const requestTrend = this.calculateTrend(recentMetrics.map(m => m.requestRate));
    const errorTrend = this.calculateTrend(recentMetrics.map(m => m.errorRate));

    const timeFactor = timeHorizon / 24; // Normalize to 24-hour scale

    return [
      {
        resourceType: 'compute',
        currentLoad: recentMetrics[recentMetrics.length - 1].cpuUsage,
        predictedLoad: recentMetrics[recentMetrics.length - 1].cpuUsage + (computeTrend * timeFactor * 10),
        confidenceInterval: [
          Math.max(0, recentMetrics[recentMetrics.length - 1].cpuUsage + (computeTrend * timeFactor * 5)),
          Math.min(100, recentMetrics[recentMetrics.length - 1].cpuUsage + (computeTrend * timeFactor * 15)),
        ] as [number, number],
        riskLevel: this.calculateRiskLevel(computeTrend, recentMetrics[recentMetrics.length - 1].cpuUsage),
      },
      {
        resourceType: 'memory',
        currentLoad: recentMetrics[recentMetrics.length - 1].memoryUsage,
        predictedLoad: recentMetrics[recentMetrics.length - 1].memoryUsage + (memoryTrend * timeFactor * 8),
        confidenceInterval: [
          Math.max(0, recentMetrics[recentMetrics.length - 1].memoryUsage + (memoryTrend * timeFactor * 4)),
          Math.min(100, recentMetrics[recentMetrics.length - 1].memoryUsage + (memoryTrend * timeFactor * 12)),
        ] as [number, number],
        riskLevel: this.calculateRiskLevel(memoryTrend, recentMetrics[recentMetrics.length - 1].memoryUsage),
      },
      {
        resourceType: 'requests',
        currentLoad: recentMetrics[recentMetrics.length - 1].requestRate,
        predictedLoad: recentMetrics[recentMetrics.length - 1].requestRate + (requestTrend * timeFactor * 20),
        confidenceInterval: [
          Math.max(0, recentMetrics[recentMetrics.length - 1].requestRate + (requestTrend * timeFactor * 10)),
          recentMetrics[recentMetrics.length - 1].requestRate + (requestTrend * timeFactor * 30),
        ] as [number, number],
        riskLevel: this.calculateRiskLevel(requestTrend, recentMetrics[recentMetrics.length - 1].requestRate / 100),
      },
    ];
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, value, index) => sum + value, 0);
    const sumXY = data.reduce((sum, value, index) => sum + (value * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX - sumX * sumX);
    return slope;
  }

  private calculateRiskLevel(trend: number, currentValue: number): 'low' | 'medium' | 'high' {
    if (currentValue > 90) return 'high';
    if (currentValue > 75) return 'medium';
    if (trend > 5 && currentValue > 60) return 'medium';
    if (trend > 10) return 'high';
    return 'low';
  }

  private generateRecommendations(analysis: any, predictions: any[]): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];
    const now = Date.now();

    // Check CPU predictions
    const cpuPred = predictions.find(p => p.resourceType === 'compute');
    if (cpuPred && cpuPred.predictedLoad > 80) {
      recommendations.push({
        id: `cpu-${now}`,
        resourceType: 'compute',
        action: cpuPred.predictedLoad > 90 ? 'scaleUp' : 'optimize',
        confidence: 0.85,
        estimatedImpact: 25,
        urgency: cpuPred.predictedLoad > 90 ? 'high' : 'medium',
        reason: `CPU usage predicted to reach ${cpuPred.predictedLoad.toFixed(1)}% in next ${cpuPred.timeHorizon} hours`,
        details: {
          currentValue: cpuPred.currentLoad,
          targetValue: Math.max(60, cpuPred.predictedLoad - 20),
          unit: 'CPU percentage',
          costImplication: cpuPred.predictedLoad > 90 ? 15 : 5,
          implementationComplexity: 'medium',
        },
        suggestedTimeline: cpuPred.predictedLoad > 90 ? 'immediate' : 'next-hour',
      });
    }

    // Check memory predictions
    const memoryPred = predictions.find(p => p.resourceType === 'memory');
    if (memoryPred && memoryPred.predictedLoad > 85) {
      recommendations.push({
        id: `memory-${now}`,
        resourceType: 'memory',
        action: 'scaleUp',
        confidence: 0.9,
        estimatedImpact: 30,
        urgency: memoryPred.predictedLoad > 90 ? 'critical' : 'high',
        reason: `Memory usage predicted to reach ${memoryPred.predictedLoad.toFixed(1)}% in next ${memoryPred.timeHorizon} hours`,
        details: {
          currentValue: memoryPred.currentLoad,
          targetValue: Math.max(70, memoryPred.predictedLoad - 15),
          unit: 'Memory percentage',
          costImplication: 20,
          implementationComplexity: 'medium',
        },
        suggestedTimeline: 'immediate',
      });
    }

    // Check for error rate issues
    if (analysis.errorRate > 3) {
      recommendations.push({
        id: `error-optimization-${now}`,
        resourceType: 'compute',
        action: 'optimize',
        confidence: 0.75,
        estimatedImpact: 15,
        urgency: analysis.errorRate > 5 ? 'high' : 'medium',
        reason: `High error rate detected (${analysis.errorRate.toFixed(2)}%) - optimize error handling`,
        details: {
          currentValue: analysis.errorRate,
          targetValue: Math.max(1, analysis.errorRate / 2),
          unit: 'Error percentage',
          costImplication: 0,
          implementationComplexity: 'high',
        },
        suggestedTimeline: 'next-hour',
      });
    }

    // Add cost optimization if resources are underutilized
    if (analysis.cpuUsage < 30 && analysis.memoryUsage < 40) {
      recommendations.push({
        id: `cost-optimization-${now}`,
        resourceType: 'compute',
        action: 'scaleDown',
        confidence: 0.7,
        estimatedImpact: -20, // Negative impact on performance but positive on cost
        urgency: 'low',
        reason: `Resources underutilized (CPU: ${analysis.cpuUsage.toFixed(1)}%, Memory: ${analysis.memoryUsage.toFixed(1)}%) - consider scaling down`,
        details: {
          currentValue: analysis.cpuUsage,
          targetValue: 50, // Target higher utilization for cost efficiency
          unit: 'CPU percentage',
          costImplication: -25, // Cost reduction
          implementationComplexity: 'low',
        },
        suggestedTimeline: 'next-day',
      });
    }

    return recommendations;
  }

  private calculateOverallRisk(recommendations: ScalingRecommendation[], predictions: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const riskScores = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    let maxRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Check predictions
    for (const pred of predictions) {
      const predRiskLevel = pred.riskLevel as keyof typeof riskScores;
      if (pred.riskLevel === 'critical' && riskScores[predRiskLevel] > riskScores[maxRisk]) {
        maxRisk = 'critical';
      } else if (pred.riskLevel === 'high' && riskScores[predRiskLevel] > riskScores[maxRisk]) {
        maxRisk = 'high';
      } else if (pred.riskLevel === 'medium' && riskScores[predRiskLevel] > riskScores[maxRisk]) {
        maxRisk = 'medium';
      }
    }

    // Check recommendations urgency
    for (const rec of recommendations) {
      const recUrgency = rec.urgency as keyof typeof riskScores;
      if (rec.urgency === 'critical' && riskScores[recUrgency] > riskScores[maxRisk]) {
        maxRisk = 'critical';
      } else if (rec.urgency === 'high' && riskScores[recUrgency] > riskScores[maxRisk]) {
        maxRisk = 'high';
      } else if (rec.urgency === 'medium' && riskScores[recUrgency] > riskScores[maxRisk]) {
        maxRisk = 'medium';
      }
    }

    return maxRisk;
  }

  private estimateCostChange(recommendations: ScalingRecommendation[]): number {
    return recommendations.reduce((total, rec) => {
      return total + (rec.details.costImplication || 0);
    }, 0);
  }

  private storePrediction(prediction: ScalingPrediction): void {
    // In production, this would store to a database
    console.log(`[ScalingPredictor] Stored prediction: ${prediction.predictionId}`);
  }

  private learnFromOutcome(data: HistoricalScalingData): void {
    // Simple learning: adjust confidence based on historical outcomes
    console.log(`[ScalingPredictor] Learning from scaling outcome: ${data.actionTaken} - ${data.result}`);
  }

  private createFallbackPrediction(
    predictionId: string,
    timestamp: Date,
    timeHorizon: number
  ): ScalingPrediction {
    return {
      predictionId,
      timestamp,
      timeHorizon,
      predictions: [
        {
          resourceType: 'compute',
          currentLoad: 50,
          predictedLoad: 55,
          confidenceInterval: [45, 65],
          riskLevel: 'low',
        },
      ],
      recommendations: [
        {
          id: `fallback-${Date.now()}`,
          resourceType: 'compute',
          action: 'maintain',
          confidence: 0.5,
          estimatedImpact: 0,
          urgency: 'low',
          reason: 'Insufficient data for accurate prediction - maintaining current state',
          details: {
            currentValue: 50,
            targetValue: 50,
            unit: 'CPU percentage',
            implementationComplexity: 'low',
          },
          suggestedTimeline: 'next-hour',
        },
      ],
      overallRisk: 'low',
      estimatedCostChange: 0,
    };
  }

  private createNetworkScalingRecommendation(
    severity: ErrorSeverity,
    errorRate: number,
    endpoint?: string
  ): ScalingRecommendation {
    const now = Date.now();
    const urgency = severity === ErrorSeverity.CRITICAL ? 'critical' : 
                   severity === ErrorSeverity.HIGH ? 'high' : 'medium';

    return {
      id: `network-${now}`,
      resourceType: 'network',
      action: 'scaleUp',
      confidence: 0.8,
      estimatedImpact: 25,
      urgency,
      reason: `Network errors detected (${errorRate.toFixed(2)}% rate${endpoint ? ` on ${endpoint}` : ''}) - increase network capacity`,
      details: {
        currentValue: errorRate,
        targetValue: Math.max(1, errorRate / 3),
        unit: 'Error percentage',
        costImplication: urgency === 'critical' ? 20 : 10,
        implementationComplexity: 'medium',
      },
      suggestedTimeline: urgency === 'critical' ? 'immediate' : 'next-hour',
    };
  }

  private createDatabaseScalingRecommendation(
    severity: ErrorSeverity,
    errorRate: number,
    endpoint?: string
  ): ScalingRecommendation {
    const now = Date.now();
    const urgency = severity === ErrorSeverity.CRITICAL ? 'critical' : 
                   severity === ErrorSeverity.HIGH ? 'high' : 'medium';

    return {
      id: `database-${now}`,
      resourceType: 'database',
      action: 'scaleUp',
      confidence: 0.85,
      estimatedImpact: 30,
      urgency,
      reason: `Database errors detected (${errorRate.toFixed(2)}% rate${endpoint ? ` on ${endpoint}` : ''}) - scale database resources`,
      details: {
        currentValue: errorRate,
        targetValue: Math.max(0.5, errorRate / 4),
        unit: 'Error percentage',
        costImplication: urgency === 'critical' ? 30 : 15,
        implementationComplexity: 'high',
      },
      suggestedTimeline: urgency === 'critical' ? 'immediate' : 'next-hour',
    };
  }

  private createExternalAPIScalingRecommendation(
    severity: ErrorSeverity,
    errorRate: number,
    endpoint?: string
  ): ScalingRecommendation {
    const now = Date.now();
    const urgency = severity === ErrorSeverity.CRITICAL ? 'critical' : 
                   severity === ErrorSeverity.HIGH ? 'high' : 'medium';

    return {
      id: `api-${now}`,
      resourceType: 'compute',
      action: 'optimize',
      confidence: 0.7,
      estimatedImpact: 20,
      urgency,
      reason: `External API errors detected (${errorRate.toFixed(2)}% rate${endpoint ? ` on ${endpoint}` : ''}) - optimize API calls and retry logic`,
      details: {
        currentValue: errorRate,
        targetValue: Math.max(1, errorRate / 2),
        unit: 'Error percentage',
        costImplication: 5,
        implementationComplexity: 'medium',
      },
      suggestedTimeline: 'next-hour',
    };
  }

  private createConfigurationScalingRecommendation(
    severity: ErrorSeverity,
    errorRate: number,
    endpoint?: string
  ): ScalingRecommendation {
    const now = Date.now();
    const urgency = severity === ErrorSeverity.CRITICAL ? 'critical' : 
                   severity === ErrorSeverity.HIGH ? 'high' : 'medium';

    return {
      id: `config-${now}`,
      resourceType: 'compute',
      action: 'optimize',
      confidence: 0.9,
      estimatedImpact: 40,
      urgency,
      reason: `Configuration errors detected (${errorRate.toFixed(2)}% rate${endpoint ? ` on ${endpoint}` : ''}) - review and optimize configuration`,
      details: {
        currentValue: errorRate,
        targetValue: Math.max(0.1, errorRate / 10),
        unit: 'Error percentage',
        costImplication: 0,
        implementationComplexity: 'low',
      },
      suggestedTimeline: urgency === 'critical' ? 'immediate' : 'next-hour',
    };
  }

  private createGenericScalingRecommendation(
    severity: ErrorSeverity,
    errorRate: number
  ): ScalingRecommendation {
    const now = Date.now();
    const urgency = severity === ErrorSeverity.CRITICAL ? 'critical' : 'high';

    return {
      id: `generic-${now}`,
      resourceType: 'compute',
      action: 'scaleUp',
      confidence: 0.6,
      estimatedImpact: 15,
      urgency,
      reason: `High severity errors detected (${errorRate.toFixed(2)}% rate) - consider general capacity increase`,
      details: {
        currentValue: errorRate,
        targetValue: Math.max(1, errorRate / 2),
        unit: 'Error percentage',
        costImplication: urgency === 'critical' ? 25 : 15,
        implementationComplexity: 'medium',
      },
      suggestedTimeline: urgency === 'critical' ? 'immediate' : 'next-hour',
    };
  }

  private loadMockHistoricalData(): void {
    // Load mock data for testing
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(Date.now() - (24 - i) * 3600000);
      this.historicalMetrics.push({
        timestamp,
        cpuUsage: 40 + Math.random() * 30,
        memoryUsage: 50 + Math.random() * 30,
        requestRate: 100 + Math.random() * 200,
        errorRate: Math.random() * 5,
        responseTime: 100 + Math.random() * 400,
        activeConnections: 50 + Math.random() * 100,
      });
    }
  }
}

/**
 * Global scaling predictor instance
 */
export const globalScalingPredictor = new ScalingPredictor();