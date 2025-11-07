/**
 * Self-Healing Integration Service
 *
 * Automatically applies fixes when errors are detected
 * Integrates Layer 2 (detection) with Layer 3 (healing)
 */

import { getErrorDetectionService, type DetectedErrorWithContext } from './error-detection-service';
import { healError, getSelfHealingService, type HealingResult, type HealingAction } from './self-healing';

export interface AutoHealConfig {
  enabled: boolean;
  autoApplyFixes: boolean; // If false, only suggest fixes
  maxAutoFixAttempts: number; // Max attempts before escalating to human
  criticalErrorsRequireApproval: boolean; // Critical errors need human approval
  logAllActions: boolean;
}

const DEFAULT_CONFIG: AutoHealConfig = {
  enabled: true,
  autoApplyFixes: true,
  maxAutoFixAttempts: 3,
  criticalErrorsRequireApproval: true,
  logAllActions: true,
};

/**
 * Auto-healing integration service
 * Listens to error detection and automatically applies fixes
 */
export class AutoHealingService {
  private static instance: AutoHealingService;
  private config: AutoHealConfig;
  private healingAttempts: Map<string, number>; // conversationId -> attempt count
  private subscribers: ((result: HealingResult) => void)[] = [];

  private constructor(config: Partial<AutoHealConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.healingAttempts = new Map();
    this.initialize();
  }

  static getInstance(config?: Partial<AutoHealConfig>): AutoHealingService {
    if (!AutoHealingService.instance) {
      AutoHealingService.instance = new AutoHealingService(config);
    }
    return AutoHealingService.instance;
  }

  /**
   * Initialize auto-healing by subscribing to error detection
   */
  private initialize() {
    if (!this.config.enabled) {
      console.log('[AutoHealing] Service disabled');
      return;
    }

    const errorService = getErrorDetectionService();

    // Subscribe to all detected errors
    errorService.subscribe((error) => {
      this.handleDetectedError(error);
    });

    console.log('[AutoHealing] Service initialized and monitoring for errors');
  }

  /**
   * Handle a detected error and attempt to heal it
   */
  private async handleDetectedError(error: DetectedErrorWithContext) {
    try {
      // Check if we should attempt healing
      if (!this.shouldAttemptHealing(error)) {
        console.log(`[AutoHealing] Skipping healing for ${error.type} (requires approval or max attempts reached)`);
        return;
      }

      // Get conversation context
      const telemetry = getTelemetry();
      const conversationData = {
        conversationId: error.conversationId,
        sessionId: error.sessionId,
        timestamp: error.timestamp,
        userMessage: error.userMessage,
        userLanguage: 'en' as const, // Will be detected from message
        userIntent: error.type,
        userSentiment: 'neutral' as const,
        agentResponse: error.agentResponse,
        agentConsultant: error.agentConsultant,
        responseTime: 0,
        messageIndex: 0,
        intentDetectionConfidence: error.confidence,
        languageDetectionConfidence: 0,
        parsingConfidence: 0,
        responseQuality: 0,
        userSatisfactionPrediction: 0,
        errors: [],
        errorCount: 1,
      };

      // Attempt healing
      const healingResult = healError(error, conversationData);

      // Record healing attempt
      this.incrementHealingAttempts(error.conversationId);

      // Record in healing service
      const healingService = getSelfHealingService();
      healingService.recordHealing(healingResult);

      // Apply fix if auto-apply is enabled
      if (this.config.autoApplyFixes && healingResult.success) {
        await this.applyFix(healingResult, error);
      }

      // Notify subscribers
      this.notifySubscribers(healingResult);

      // Log action
      if (this.config.logAllActions) {
        console.log('[AutoHealing] Healing attempt:', {
          error: error.type,
          severity: error.severity,
          success: healingResult.success,
          action: healingResult.appliedFix?.type,
          reasoning: healingResult.reasoning,
        });
      }
    } catch (err) {
      console.error('[AutoHealing] Error during healing:', err);
    }
  }

  /**
   * Check if we should attempt healing for this error
   */
  private shouldAttemptHealing(error: DetectedErrorWithContext): boolean {
    // Check if critical errors require approval
    if (this.config.criticalErrorsRequireApproval && error.severity === 'critical') {
      return false;
    }

    // Check max attempts
    const attempts = this.healingAttempts.get(error.conversationId) || 0;
    if (attempts >= this.config.maxAutoFixAttempts) {
      console.log(`[AutoHealing] Max attempts (${this.config.maxAutoFixAttempts}) reached for conversation ${error.conversationId}`);
      return false;
    }

    // Check if error is auto-fixable
    if (!error.autoFixable) {
      return false;
    }

    return true;
  }

  /**
   * Apply the healing fix
   */
  private async applyFix(result: HealingResult, error: DetectedErrorWithContext) {
    if (!result.appliedFix) {
      return;
    }

    const action = result.appliedFix;

    console.log(`[AutoHealing] Applying fix: ${action.type}`);

    // Different fix types require different implementations
    switch (action.type) {
      case 'language_switch':
        await this.applyLanguageSwitch(action, error);
        break;

      case 'consultant_switch':
        await this.applyConsultantSwitch(action, error);
        break;

      case 'clarification_loop':
        await this.applyClarificationLoop(action, error);
        break;

      case 'prompt_refinement':
        await this.applyPromptRefinement(action, error);
        break;

      case 'human_escalation':
        await this.applyHumanEscalation(action, error);
        break;
    }
  }

  /**
   * Apply language switch fix
   */
  private async applyLanguageSwitch(action: HealingAction, error: DetectedErrorWithContext) {
    // In real implementation, this would update the conversation state
    console.log(`[AutoHealing] Switching to language: ${action.implementation.newLanguage}`);
    console.log(`[AutoHealing] New prompt: ${action.implementation.newPrompt}`);
    console.log(`[AutoHealing] Fix applied for conversation: ${error.conversationId}`);
  }

  /**
   * Apply consultant switch fix
   */
  private async applyConsultantSwitch(action: HealingAction, error: DetectedErrorWithContext) {
    console.log(`[AutoHealing] Switching to consultant: ${action.implementation.newConsultant}`);
    console.log(`[AutoHealing] New prompt: ${action.implementation.newPrompt}`);
    console.log(`[AutoHealing] Fix applied for conversation: ${error.conversationId}`);
  }

  /**
   * Apply clarification loop fix
   */
  private async applyClarificationLoop(action: HealingAction, error: DetectedErrorWithContext) {
    console.log(`[AutoHealing] Asking clarification: ${action.implementation.clarificationQuestion}`);
    console.log(`[AutoHealing] Fix applied for conversation: ${error.conversationId}`);
  }

  /**
   * Apply prompt refinement fix
   */
  private async applyPromptRefinement(action: HealingAction, error: DetectedErrorWithContext) {
    console.log(`[AutoHealing] Refining prompt: ${action.implementation.newPrompt?.slice(0, 100)}...`);
    console.log(`[AutoHealing] Fix applied for conversation: ${error.conversationId}`);
  }

  /**
   * Apply human escalation fix
   */
  private async applyHumanEscalation(action: HealingAction, error: DetectedErrorWithContext) {
    console.log(`[AutoHealing] Escalating to human: ${action.implementation.escalationReason}`);
    console.log(`[AutoHealing] Fix applied for conversation: ${error.conversationId}`);
  }

  /**
   * Increment healing attempts for a conversation
   */
  private incrementHealingAttempts(conversationId: string) {
    const current = this.healingAttempts.get(conversationId) || 0;
    this.healingAttempts.set(conversationId, current + 1);
  }

  /**
   * Subscribe to healing results
   */
  subscribe(callback: (result: HealingResult) => void): () => void {
    this.subscribers.push(callback);

    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify subscribers of healing result
   */
  private notifySubscribers(result: HealingResult) {
    this.subscribers.forEach(callback => {
      try {
        callback(result);
      } catch (err) {
        console.error('[AutoHealing] Subscriber error:', err);
      }
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutoHealConfig>) {
    this.config = { ...this.config, ...config };
    console.log('[AutoHealing] Configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoHealConfig {
    return { ...this.config };
  }

  /**
   * Get healing statistics
   */
  getStatistics() {
    const healingService = getSelfHealingService();
    return healingService.getStatistics();
  }

  /**
   * Reset healing attempts for a conversation
   */
  resetAttempts(conversationId: string) {
    this.healingAttempts.delete(conversationId);
  }

  /**
   * Clear all healing attempts
   */
  clearAllAttempts() {
    this.healingAttempts.clear();
  }
}

/**
 * Initialize auto-healing service
 */
export function initializeAutoHealing(config?: Partial<AutoHealConfig>): AutoHealingService {
  const service = AutoHealingService.getInstance(config);
  console.log('[AutoHealing] Service started');
  return service;
}

/**
 * Get auto-healing service instance
 */
export function getAutoHealingService(): AutoHealingService {
  return AutoHealingService.getInstance();
}
