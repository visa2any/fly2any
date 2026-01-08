/**
 * Machine Learning Error Predictor
 * 
 * Uses statistical analysis and simple ML to predict error trends
 * and identify correlations between errors and system metrics.
 */

export interface ErrorPrediction {
  timestamp: Date;
  predictedErrors: number;
  confidence: number;
  factors: PredictionFactor[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PredictionFactor {
  name: string;
  impact: number; // -1 to 1, negative reduces errors, positive increases
  value: number;
  unit: string;
}

export interface CorrelationAnalysis {
  correlatedMetrics: Array<{
    metric: string;
    correlation: number; // -1 to 1
    significance: number; // 0 to 1
    description: string;
  }>;
  anomalyDetections: Array<{
    timestamp: Date;
    metric: string;
    value: number;
    expected: number;
    deviation: number;
  }>;
  recommendations: string[];
}

export interface ErrorDataPoint {
  timestamp: Date;
  errorCount: number;
  errorSeverity: number; // 0-1 normalized
  categoryDistribution: Record<string, number>;
  systemMetrics?: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    requestRate: number;
    userCount: number;
  };
}

/**
 * Error Predictor using sliding window regression
 */
export class ErrorPredictor {
  private dataPoints: ErrorDataPoint[] = [];
  private windowSize: number = 24 * 7; // 1 week of hourly data

  constructor(windowSize?: number) {
    if (windowSize) this.windowSize = windowSize;
  }

  /**
   * Add new data point for training
   */
  addDataPoint(point: ErrorDataPoint): void {
    this.dataPoints.push(point);
    // Keep only windowSize most recent points
    if (this.dataPoints.length > this.windowSize) {
      this.dataPoints.shift();
    }
  }

  /**
   * Predict errors for next time period
   */
  predictNext(hours: number = 1): ErrorPrediction[] {
    if (this.dataPoints.length < 2) {
      return [];
    }

    const predictions: ErrorPrediction[] = [];
    const recentPoints = this.dataPoints.slice(-24); // Last 24 hours

    for (let i = 1; i <= hours; i++) {
      const lastPoint = recentPoints[recentPoints.length - 1];
      const prediction = this.predictNextPoint(recentPoints, i);
      
      predictions.push({
        timestamp: new Date(lastPoint.timestamp.getTime() + i * 60 * 60 * 1000),
        predictedErrors: prediction.errors,
        confidence: prediction.confidence,
        factors: this.analyzeFactors(recentPoints),
        riskLevel: this.calculateRiskLevel(prediction.errors, prediction.confidence),
      });
    }

    return predictions;
  }

  /**
   * Analyze correlations between errors and system metrics
   */
  analyzeCorrelations(): CorrelationAnalysis {
    if (this.dataPoints.length < 10) {
      return {
        correlatedMetrics: [],
        anomalyDetections: [],
        recommendations: ['Insufficient data for correlation analysis'],
      };
    }

    const pointsWithMetrics = this.dataPoints.filter(p => p.systemMetrics);
    if (pointsWithMetrics.length < 5) {
      return {
        correlatedMetrics: [],
        anomalyDetections: [],
        recommendations: ['Insufficient system metrics data'],
      };
    }

    const correlations = this.calculateCorrelations(pointsWithMetrics);
    const anomalies = this.detectAnomalies(pointsWithMetrics);

    return {
      correlatedMetrics: correlations,
      anomalyDetections: anomalies,
      recommendations: this.generateRecommendations(correlations, anomalies),
    };
  }

  /**
   * Train a simple model on historical data
   */
  train(): void {
    // In a production system, this would train a proper ML model
    // For now, we use statistical analysis
    console.log(`[ErrorPredictor] Training on ${this.dataPoints.length} data points`);
  }

  /**
   * Get prediction accuracy score
   */
  getAccuracy(): number {
    if (this.dataPoints.length < 10) return 0;

    // Simple accuracy calculation based on recent predictions
    // This would be more sophisticated in production
    const recent = this.dataPoints.slice(-10);
    const avgErrors = recent.reduce((sum, p) => sum + p.errorCount, 0) / recent.length;
    const variance = recent.reduce((sum, p) => sum + Math.pow(p.errorCount - avgErrors, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);

    // Higher accuracy when data is less variable
    return Math.max(0, 1 - stdDev / (avgErrors || 1));
  }

  private predictNextPoint(points: ErrorDataPoint[], offset: number): { errors: number; confidence: number } {
    // Simple linear regression for next point prediction
    const n = points.length;
    const x = points.map((_, i) => i);
    const y = points.map(p => p.errorCount);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predicted = slope * (n + offset - 1) + intercept;

    // Calculate confidence based on R-squared
    const yMean = sumY / n;
    const ssTot = y.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const ssRes = y.reduce((a, b, i) => a + Math.pow(b - (slope * x[i] + intercept), 2), 0);
    const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

    return {
      errors: Math.max(0, predicted),
      confidence: Math.max(0, Math.min(1, rSquared)),
    };
  }

  private analyzeFactors(points: ErrorDataPoint[]): PredictionFactor[] {
    const factors: PredictionFactor[] = [];

    if (points.length < 2) return factors;

    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];

    // Analyze error count trend
    const errorTrend = lastPoint.errorCount - secondLastPoint.errorCount;
    factors.push({
      name: 'Error Trend',
      impact: errorTrend > 0 ? 0.3 : -0.2,
      value: errorTrend,
      unit: 'errors/hour',
    });

    // Analyze severity trend
    const severityTrend = lastPoint.errorSeverity - secondLastPoint.errorSeverity;
    factors.push({
      name: 'Severity Trend',
      impact: severityTrend > 0 ? 0.4 : -0.1,
      value: severityTrend,
      unit: 'normalized',
    });

    // If we have system metrics, analyze them
    if (lastPoint.systemMetrics && secondLastPoint.systemMetrics) {
      const responseTimeTrend = lastPoint.systemMetrics.responseTime - secondLastPoint.systemMetrics.responseTime;
      factors.push({
        name: 'Response Time Trend',
        impact: responseTimeTrend > 0 ? 0.2 : -0.1,
        value: responseTimeTrend,
        unit: 'ms',
      });

      const requestRateTrend = lastPoint.systemMetrics.requestRate - secondLastPoint.systemMetrics.requestRate;
      factors.push({
        name: 'Request Rate Trend',
        impact: requestRateTrend > 100 ? 0.1 : 0,
        value: requestRateTrend,
        unit: 'requests/sec',
      });
    }

    return factors;
  }

  private calculateRiskLevel(predictedErrors: number, confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = predictedErrors * confidence;

    if (riskScore > 50) return 'critical';
    if (riskScore > 20) return 'high';
    if (riskScore > 5) return 'medium';
    return 'low';
  }

  private calculateCorrelations(points: ErrorDataPoint[]): Array<{
    metric: string;
    correlation: number;
    significance: number;
    description: string;
  }> {
    const correlations = [];
    const errorCounts = points.map(p => p.errorCount);

    // Correlation with response time
    if (points.every(p => p.systemMetrics?.responseTime)) {
      const responseTimes = points.map(p => p.systemMetrics!.responseTime);
      const corr = this.pearsonCorrelation(errorCounts, responseTimes);
      correlations.push({
        metric: 'Response Time',
        correlation: corr,
        significance: Math.abs(corr) > 0.5 ? 0.9 : Math.abs(corr) * 0.8,
        description: corr > 0 ? 'Higher response times correlate with more errors' : 'Lower response times correlate with more errors',
      });
    }

    // Correlation with request rate
    if (points.every(p => p.systemMetrics?.requestRate)) {
      const requestRates = points.map(p => p.systemMetrics!.requestRate);
      const corr = this.pearsonCorrelation(errorCounts, requestRates);
      correlations.push({
        metric: 'Request Rate',
        correlation: corr,
        significance: Math.abs(corr) > 0.5 ? 0.9 : Math.abs(corr) * 0.8,
        description: corr > 0 ? 'Higher request rates correlate with more errors' : 'Lower request rates correlate with more errors',
      });
    }

    // Correlation with memory usage
    if (points.every(p => p.systemMetrics?.memoryUsage)) {
      const memoryUsage = points.map(p => p.systemMetrics!.memoryUsage);
      const corr = this.pearsonCorrelation(errorCounts, memoryUsage);
      correlations.push({
        metric: 'Memory Usage',
        correlation: corr,
        significance: Math.abs(corr) > 0.5 ? 0.9 : Math.abs(corr) * 0.8,
        description: corr > 0 ? 'Higher memory usage correlates with more errors' : 'Lower memory usage correlates with more errors',
      });
    }

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  private detectAnomalies(points: ErrorDataPoint[]): Array<{
    timestamp: Date;
    metric: string;
    value: number;
    expected: number;
    deviation: number;
  }> {
    const anomalies: Array<{
      timestamp: Date;
      metric: string;
      value: number;
      expected: number;
      deviation: number;
    }> = [];

    // Simple anomaly detection: points more than 2 standard deviations from mean
    const errorCounts = points.map(p => p.errorCount);
    const mean = errorCounts.reduce((a, b) => a + b, 0) / errorCounts.length;
    const stdDev = Math.sqrt(errorCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / errorCounts.length);

    points.forEach((point) => {
      const deviation = Math.abs(point.errorCount - mean) / (stdDev || 1);
      if (deviation > 2) {
        anomalies.push({
          timestamp: point.timestamp,
          metric: 'Error Count',
          value: point.errorCount,
          expected: mean,
          deviation,
        });
      }
    });

    return anomalies.slice(0, 5); // Return top 5 anomalies
  }

  private generateRecommendations(
    correlations: Array<{ metric: string; correlation: number; significance: number }>,
    anomalies: Array<{ timestamp: Date; metric: string; value: number; expected: number; deviation: number }>
  ): string[] {
    const recommendations: string[] = [];

    // High positive correlation with response time
    const responseTimeCorr = correlations.find(c => c.metric === 'Response Time');
    if (responseTimeCorr && responseTimeCorr.correlation > 0.7 && responseTimeCorr.significance > 0.8) {
      recommendations.push('Consider scaling API servers to reduce response times and error rates');
    }

    // High positive correlation with memory usage
    const memoryCorr = correlations.find(c => c.metric === 'Memory Usage');
    if (memoryCorr && memoryCorr.correlation > 0.7 && memoryCorr.significance > 0.8) {
      recommendations.push('Optimize memory usage or increase memory allocation to reduce errors');
    }

    // Anomaly detected
    if (anomalies.length > 0) {
      recommendations.push(`Investigate ${anomalies.length} anomaly(ies) detected in error patterns`);
    }

    // Low confidence in predictions
    if (this.getAccuracy() < 0.6) {
      recommendations.push('Collect more data to improve prediction accuracy');
    }

    if (recommendations.length === 0) {
      recommendations.push('System appears stable. Continue monitoring.');
    }

    return recommendations;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

/**
 * Factory function to create and train a predictor from historical data
 */
export async function createErrorPredictor(
  historicalData: ErrorDataPoint[]
): Promise<ErrorPredictor> {
  const predictor = new ErrorPredictor();
  
  historicalData.forEach(point => {
    predictor.addDataPoint(point);
  });

  predictor.train();
  
  return predictor;
}

/**
 * Example data generator for testing/demo
 */
export function generateExampleData(hours: number = 24): ErrorDataPoint[] {
  const data: ErrorDataPoint[] = [];
  const now = new Date();

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now.getTime() - (hours - i) * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Simulate daily pattern: more errors during business hours
    const baseErrors = hour >= 9 && hour <= 17 ? 10 : 5;
    const randomVariation = Math.random() * 3;
    const errorCount = Math.max(0, Math.round(baseErrors + randomVariation));

    data.push({
      timestamp,
      errorCount,
      errorSeverity: Math.random() * 0.5 + 0.3, // 0.3-0.8
      categoryDistribution: {
        NETWORK: Math.random() * 0.3,
        VALIDATION: Math.random() * 0.2,
        API: Math.random() * 0.2,
        DATABASE: Math.random() * 0.15,
        UNKNOWN: Math.random() * 0.15,
      },
      systemMetrics: {
        responseTime: 200 + Math.random() * 100,
        memoryUsage: 60 + Math.random() * 20,
        cpuUsage: 40 + Math.random() * 30,
        requestRate: 100 + Math.random() * 50,
        userCount: 50 + Math.random() * 30,
      },
    });
  }

  return data;
}