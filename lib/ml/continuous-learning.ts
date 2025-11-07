/**
 * Layer 4: Continuous Learning System
 *
 * Learns from real conversations to improve over time
 * Implements daily retraining, A/B testing, and success pattern mining
 */

import { getTelemetry, type ConversationTelemetry } from './conversation-telemetry';
import { getErrorDetectionService } from './error-detection-service';
import { getSelfHealingService, type HealingStatistics } from './self-healing';

export interface LearningData {
  conversationId: string;
  timestamp: Date;
  userMessage: string;
  agentResponse: string;
  intent: string;
  language: string;
  hadError: boolean;
  errorType?: string;
  wasHealed: boolean;
  userSatisfaction: number; // 0-1
  conversionSuccess: boolean; // Did user book?
  abandonmentPrevented: boolean;
}

export interface SuccessPattern {
  pattern: string;
  context: {
    intent: string;
    language: string;
    consultantType: string;
  };
  successRate: number;
  conversionRate: number;
  sampleSize: number;
  confidence: number;
  examples: string[]; // Sample conversation IDs
}

export interface FailurePattern {
  pattern: string;
  errorType: string;
  frequency: number;
  impactScore: number; // 0-1, higher = more damaging
  commonPrecursors: string[]; // What happens before this error
  suggestedImprovement: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    control: {
      name: string;
      prompt: string;
      traffic: number; // 0-1 percentage
    };
    treatment: {
      name: string;
      prompt: string;
      traffic: number;
    };
  };
  metrics: {
    control: ABTestMetrics;
    treatment: ABTestMetrics;
  };
  status: 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  winner?: 'control' | 'treatment' | 'no_difference';
}

export interface ABTestMetrics {
  conversations: number;
  errors: number;
  bookings: number;
  abandonment: number;
  avgSatisfaction: number;
  avgResponseTime: number;
}

export interface TrainingDataset {
  successfulConversations: LearningData[];
  failedConversations: LearningData[];
  totalSamples: number;
  successRate: number;
  lastUpdated: Date;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  improvementSinceLastWeek: number;
  improvementSinceLastMonth: number;
}

/**
 * Continuous Learning Service
 * Automatically learns from conversations and improves the system
 */
export class ContinuousLearningService {
  private static instance: ContinuousLearningService;
  private learningData: LearningData[] = [];
  private maxDataPoints = 100000; // Keep last 100k conversations
  private abTests: Map<string, ABTest> = new Map();
  private successPatterns: SuccessPattern[] = [];
  private failurePatterns: FailurePattern[] = [];

  private constructor() {
    this.initialize();
  }

  static getInstance(): ContinuousLearningService {
    if (!ContinuousLearningService.instance) {
      ContinuousLearningService.instance = new ContinuousLearningService();
    }
    return ContinuousLearningService.instance;
  }

  /**
   * Initialize learning by subscribing to telemetry
   */
  private initialize() {
    const telemetry = getTelemetry();

    // Subscribe to all conversations for learning
    telemetry.subscribe((data) => {
      this.collectLearningData(data);
    });

    // Schedule daily retraining (in production, use cron)
    this.scheduleDailyRetraining();

    console.log('[ContinuousLearning] Service initialized');
  }

  /**
   * Collect learning data from conversation
   */
  private async collectLearningData(data: ConversationTelemetry) {
    const errorService = getErrorDetectionService();
    const healingService = getSelfHealingService();

    // Get errors for this conversation
    const errors = errorService.getErrorsByConversation(data.conversationId);
    const hadError = errors.length > 0;
    const errorType = errors[0]?.type;

    // Check if error was healed
    const healingStats = healingService.getStatistics();
    const wasHealed = hadError && healingStats.totalHealed > 0;

    // Determine user satisfaction (from prediction or actual)
    const userSatisfaction = data.userSatisfactionPrediction || 0.5;

    // Determine conversion success (simplified - in production, track actual bookings)
    const conversionSuccess = data.predictions?.willBook ? data.predictions.willBook > 0.7 : false;

    // Determine if abandonment was prevented
    const abandonmentPrevented = data.predictions?.willAbandon ?
      (data.predictions.willAbandon > 0.7 && !data.errors.some(e => e.type === 'abandonment')) :
      false;

    const learningDataPoint: LearningData = {
      conversationId: data.conversationId,
      timestamp: data.timestamp,
      userMessage: data.userMessage,
      agentResponse: data.agentResponse,
      intent: data.userIntent,
      language: data.userLanguage,
      hadError,
      errorType,
      wasHealed,
      userSatisfaction,
      conversionSuccess,
      abandonmentPrevented,
    };

    // Store learning data
    this.learningData.push(learningDataPoint);

    // Trim if too large
    if (this.learningData.length > this.maxDataPoints) {
      this.learningData.shift();
    }
  }

  /**
   * Schedule daily retraining
   */
  private scheduleDailyRetraining() {
    // In production, this would be a cron job
    // For now, retrain every 24 hours
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    setInterval(async () => {
      console.log('[ContinuousLearning] Starting daily retraining...');
      await this.performRetraining();
    }, TWENTY_FOUR_HOURS);

    console.log('[ContinuousLearning] Daily retraining scheduled');
  }

  /**
   * Perform model retraining with latest data
   */
  async performRetraining(): Promise<ModelPerformance> {
    console.log('[ContinuousLearning] Retraining with', this.learningData.length, 'data points');

    // Step 1: Mine success patterns
    this.successPatterns = await this.mineSuccessPatterns();
    console.log('[ContinuousLearning] Found', this.successPatterns.length, 'success patterns');

    // Step 2: Mine failure patterns
    this.failurePatterns = await this.mineFailurePatterns();
    console.log('[ContinuousLearning] Found', this.failurePatterns.length, 'failure patterns');

    // Step 3: Update error detection thresholds
    await this.updateDetectionThresholds();

    // Step 4: Update healing strategies
    await this.updateHealingStrategies();

    // Step 5: Calculate performance metrics
    const performance = this.calculatePerformance();

    console.log('[ContinuousLearning] Retraining complete:', performance);

    return performance;
  }

  /**
   * Mine success patterns from successful conversations
   */
  private async mineSuccessPatterns(): Promise<SuccessPattern[]> {
    const successfulConversations = this.learningData.filter(
      d => d.conversionSuccess || d.userSatisfaction > 0.7
    );

    if (successfulConversations.length < 10) {
      return [];
    }

    // Group by intent and language
    const groups: Record<string, LearningData[]> = {};

    successfulConversations.forEach(conv => {
      const key = `${conv.intent}-${conv.language}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(conv);
    });

    // Extract patterns
    const patterns: SuccessPattern[] = [];

    Object.entries(groups).forEach(([key, conversations]) => {
      if (conversations.length < 5) return; // Need at least 5 samples

      const [intent, language] = key.split('-');

      // Find common phrases in successful responses
      const phrases = this.extractCommonPhrases(
        conversations.map(c => c.agentResponse)
      );

      phrases.forEach(phrase => {
        const pattern: SuccessPattern = {
          pattern: phrase,
          context: {
            intent,
            language,
            consultantType: this.inferConsultantType(intent),
          },
          successRate: conversations.filter(c => c.conversionSuccess).length / conversations.length,
          conversionRate: conversations.filter(c => c.conversionSuccess).length / conversations.length,
          sampleSize: conversations.length,
          confidence: Math.min(conversations.length / 100, 1), // More samples = higher confidence
          examples: conversations.slice(0, 5).map(c => c.conversationId),
        };

        patterns.push(pattern);
      });
    });

    // Sort by success rate and confidence
    return patterns.sort((a, b) => {
      const aScore = a.successRate * a.confidence;
      const bScore = b.successRate * b.confidence;
      return bScore - aScore;
    }).slice(0, 50); // Keep top 50 patterns
  }

  /**
   * Mine failure patterns from failed conversations
   */
  private async mineFailurePatterns(): Promise<FailurePattern[]> {
    const failedConversations = this.learningData.filter(
      d => d.hadError && !d.wasHealed
    );

    if (failedConversations.length < 10) {
      return [];
    }

    // Group by error type
    const groups: Record<string, LearningData[]> = {};

    failedConversations.forEach(conv => {
      const errorType = conv.errorType || 'unknown';
      if (!groups[errorType]) {
        groups[errorType] = [];
      }
      groups[errorType].push(conv);
    });

    // Extract failure patterns
    const patterns: FailurePattern[] = [];

    Object.entries(groups).forEach(([errorType, conversations]) => {
      if (conversations.length < 3) return;

      // Find common phrases that lead to failures
      const failurePhrases = this.extractCommonPhrases(
        conversations.map(c => c.agentResponse)
      );

      failurePhrases.forEach(phrase => {
        const pattern: FailurePattern = {
          pattern: phrase,
          errorType,
          frequency: conversations.length,
          impactScore: this.calculateImpactScore(conversations),
          commonPrecursors: this.findPrecursors(conversations),
          suggestedImprovement: this.generateImprovement(errorType, phrase),
        };

        patterns.push(pattern);
      });
    });

    // Sort by impact
    return patterns.sort((a, b) => b.impactScore - a.impactScore).slice(0, 30);
  }

  /**
   * Extract common phrases from a list of messages
   */
  private extractCommonPhrases(messages: string[]): string[] {
    // Simple phrase extraction (in production, use NLP)
    const phrases: Record<string, number> = {};

    messages.forEach(message => {
      // Extract 3-5 word phrases
      const words = message.toLowerCase().split(/\s+/);
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = words.slice(i, i + 3).join(' ');
        phrases[phrase] = (phrases[phrase] || 0) + 1;
      }
    });

    // Return phrases that appear in >20% of messages
    const threshold = messages.length * 0.2;
    return Object.entries(phrases)
      .filter(([_, count]) => count >= threshold)
      .map(([phrase]) => phrase)
      .slice(0, 10);
  }

  /**
   * Calculate impact score for failures
   */
  private calculateImpactScore(conversations: LearningData[]): number {
    const avgSatisfaction = conversations.reduce((sum, c) => sum + c.userSatisfaction, 0) / conversations.length;
    const abandonmentRate = conversations.filter(c => !c.conversionSuccess).length / conversations.length;

    // Impact = low satisfaction + high abandonment
    return (1 - avgSatisfaction) * 0.5 + abandonmentRate * 0.5;
  }

  /**
   * Find common precursors to failures
   */
  private findPrecursors(conversations: LearningData[]): string[] {
    // Extract patterns from user messages that led to failures
    return this.extractCommonPhrases(conversations.map(c => c.userMessage)).slice(0, 5);
  }

  /**
   * Generate improvement suggestion
   */
  private generateImprovement(errorType: string, failurePhrase: string): string {
    const improvements: Record<string, string> = {
      'parsing-failure': `Improve date/location parsing for phrases like "${failurePhrase}"`,
      'intent-misunderstanding': `Train intent classifier on phrases like "${failurePhrase}"`,
      'language-mismatch': `Enhance language detection for mixed-language inputs`,
      'low-confidence': `Add confidence boosting for scenarios involving "${failurePhrase}"`,
      'timeout': `Optimize response generation for complex queries`,
    };

    return improvements[errorType] || `Review and improve handling of "${failurePhrase}"`;
  }

  /**
   * Infer consultant type from intent
   */
  private inferConsultantType(intent: string): string {
    if (intent.includes('flight')) return 'flight-operations';
    if (intent.includes('hotel')) return 'hotel-accommodations';
    if (intent.includes('car')) return 'car-rentals';
    if (intent.includes('package')) return 'package-deals';
    if (intent.includes('visa')) return 'visa-immigration';
    return 'customer-support';
  }

  /**
   * Update error detection thresholds based on learning
   */
  private async updateDetectionThresholds() {
    // Analyze false positives and false negatives
    const detectionAccuracy = this.calculateDetectionAccuracy();

    console.log('[ContinuousLearning] Detection accuracy:', detectionAccuracy);

    // In production, update detection model thresholds here
  }

  /**
   * Calculate detection accuracy
   */
  private calculateDetectionAccuracy(): number {
    const recentData = this.learningData.slice(-1000); // Last 1000 conversations

    if (recentData.length === 0) return 0;

    // True positives: detected error + was actually an error (low satisfaction)
    const truePositives = recentData.filter(d => d.hadError && d.userSatisfaction < 0.5).length;

    // False positives: detected error + was not an error (high satisfaction)
    const falsePositives = recentData.filter(d => d.hadError && d.userSatisfaction >= 0.7).length;

    // True negatives: no error + high satisfaction
    const trueNegatives = recentData.filter(d => !d.hadError && d.userSatisfaction >= 0.7).length;

    // False negatives: no error + low satisfaction
    const falseNegatives = recentData.filter(d => !d.hadError && d.userSatisfaction < 0.5).length;

    const accuracy = (truePositives + trueNegatives) / recentData.length;

    return accuracy;
  }

  /**
   * Update healing strategies based on learning
   */
  private async updateHealingStrategies() {
    const healingService = getSelfHealingService();
    const stats = healingService.getStatistics();

    console.log('[ContinuousLearning] Healing success rate:', stats.successRate);

    // Identify which healing strategies work best
    Object.entries(stats.byType).forEach(([errorType, typeStats]) => {
      const successRate = typeStats.successes / typeStats.attempts;
      console.log(`[ContinuousLearning] ${errorType}: ${(successRate * 100).toFixed(1)}% success`);
    });

    // In production, update healing prompts and strategies here
  }

  /**
   * Calculate overall model performance
   */
  private calculatePerformance(): ModelPerformance {
    const recentData = this.learningData.slice(-1000);

    if (recentData.length === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        improvementSinceLastWeek: 0,
        improvementSinceLastMonth: 0,
      };
    }

    // Calculate metrics
    const accuracy = this.calculateDetectionAccuracy();

    // Precision: Of all detected errors, how many were real?
    const detectedErrors = recentData.filter(d => d.hadError);
    const truePositives = detectedErrors.filter(d => d.userSatisfaction < 0.5).length;
    const precision = detectedErrors.length > 0 ? truePositives / detectedErrors.length : 0;

    // Recall: Of all real errors, how many did we detect?
    const realErrors = recentData.filter(d => d.userSatisfaction < 0.5);
    const recall = realErrors.length > 0 ? truePositives / realErrors.length : 0;

    // F1 Score
    const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      improvementSinceLastWeek: 0, // TODO: Track historical performance
      improvementSinceLastMonth: 0,
    };
  }

  /**
   * Create A/B test
   */
  createABTest(test: Omit<ABTest, 'metrics' | 'status' | 'startDate'>): string {
    const testId = `test-${Date.now()}`;

    const fullTest: ABTest = {
      ...test,
      id: testId,
      metrics: {
        control: this.createEmptyMetrics(),
        treatment: this.createEmptyMetrics(),
      },
      status: 'running',
      startDate: new Date(),
    };

    this.abTests.set(testId, fullTest);

    console.log(`[ContinuousLearning] A/B test created: ${test.name}`);

    return testId;
  }

  /**
   * Create empty metrics object
   */
  private createEmptyMetrics(): ABTestMetrics {
    return {
      conversations: 0,
      errors: 0,
      bookings: 0,
      abandonment: 0,
      avgSatisfaction: 0,
      avgResponseTime: 0,
    };
  }

  /**
   * Record A/B test result
   */
  recordABTestResult(
    testId: string,
    variant: 'control' | 'treatment',
    metrics: Partial<ABTestMetrics>
  ) {
    const test = this.abTests.get(testId);
    if (!test) return;

    const current = test.metrics[variant];
    test.metrics[variant] = { ...current, ...metrics };

    // Update conversation count
    test.metrics[variant].conversations++;

    // Check if test should be completed
    if (this.shouldCompleteABTest(test)) {
      this.completeABTest(testId);
    }
  }

  /**
   * Check if A/B test should be completed
   */
  private shouldCompleteABTest(test: ABTest): boolean {
    // Complete after 1000 conversations or 7 days
    const controlCount = test.metrics.control.conversations;
    const treatmentCount = test.metrics.treatment.conversations;

    if (controlCount + treatmentCount >= 1000) return true;

    const daysSinceStart = (Date.now() - test.startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceStart >= 7) return true;

    return false;
  }

  /**
   * Complete A/B test and determine winner
   */
  completeABTest(testId: string) {
    const test = this.abTests.get(testId);
    if (!test) return;

    // Calculate success metrics
    const controlSuccess = this.calculateABTestSuccess(test.metrics.control);
    const treatmentSuccess = this.calculateABTestSuccess(test.metrics.treatment);

    // Determine winner (need >5% improvement to be significant)
    if (treatmentSuccess > controlSuccess * 1.05) {
      test.winner = 'treatment';
    } else if (controlSuccess > treatmentSuccess * 1.05) {
      test.winner = 'control';
    } else {
      test.winner = 'no_difference';
    }

    test.status = 'completed';
    test.endDate = new Date();

    console.log(`[ContinuousLearning] A/B test completed: ${test.name}`, {
      winner: test.winner,
      controlSuccess: controlSuccess.toFixed(3),
      treatmentSuccess: treatmentSuccess.toFixed(3),
    });
  }

  /**
   * Calculate A/B test success score
   */
  private calculateABTestSuccess(metrics: ABTestMetrics): number {
    if (metrics.conversations === 0) return 0;

    const bookingRate = metrics.bookings / metrics.conversations;
    const errorRate = metrics.errors / metrics.conversations;
    const abandonmentRate = metrics.abandonment / metrics.conversations;

    // Success = high bookings + low errors + low abandonment + high satisfaction
    return bookingRate * 0.4 +
           (1 - errorRate) * 0.2 +
           (1 - abandonmentRate) * 0.2 +
           metrics.avgSatisfaction * 0.2;
  }

  /**
   * Get all A/B tests
   */
  getABTests(): ABTest[] {
    return Array.from(this.abTests.values());
  }

  /**
   * Get A/B test by ID
   */
  getABTest(testId: string): ABTest | undefined {
    return this.abTests.get(testId);
  }

  /**
   * Get success patterns
   */
  getSuccessPatterns(): SuccessPattern[] {
    return this.successPatterns;
  }

  /**
   * Get failure patterns
   */
  getFailurePatterns(): FailurePattern[] {
    return this.failurePatterns;
  }

  /**
   * Get training dataset
   */
  getTrainingDataset(): TrainingDataset {
    const successful = this.learningData.filter(d => d.conversionSuccess || d.userSatisfaction > 0.7);
    const failed = this.learningData.filter(d => !d.conversionSuccess && d.userSatisfaction < 0.5);

    return {
      successfulConversations: successful,
      failedConversations: failed,
      totalSamples: this.learningData.length,
      successRate: successful.length / this.learningData.length,
      lastUpdated: new Date(),
    };
  }

  /**
   * Export learning data for external training
   */
  exportLearningData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.learningData, null, 2);
    } else {
      // CSV format
      const headers = ['conversationId', 'timestamp', 'intent', 'language', 'hadError', 'wasHealed', 'conversionSuccess', 'userSatisfaction'];
      const rows = this.learningData.map(d => [
        d.conversationId,
        d.timestamp.toISOString(),
        d.intent,
        d.language,
        d.hadError,
        d.wasHealed,
        d.conversionSuccess,
        d.userSatisfaction,
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }
}

/**
 * Get continuous learning service instance
 */
export function getContinuousLearningService(): ContinuousLearningService {
  return ContinuousLearningService.getInstance();
}

/**
 * Initialize continuous learning
 */
export function initializeContinuousLearning(): void {
  const service = getContinuousLearningService();
  console.log('[ContinuousLearning] Service initialized');
}
