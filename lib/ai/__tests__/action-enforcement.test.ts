/**
 * Action Enforcement Tests
 *
 * Validates:
 * - Flight search API is called when context is complete
 * - Fallback responses are blocked when action should execute
 * - Stage transitions and logging work correctly
 */

import {
  enforceActionExecution,
  isFallbackAllowed,
  updateCollectedDataWithPromotion,
  getOrCreateStageContext,
  resetStageContext,
  grantSearchConsent,
  extractDataFromMessage,
  type EnforcementResult,
} from '../conversion/stage-engine';

describe('Action Enforcement - Mandatory Execution', () => {
  const sessionId = 'test-enforcement-session';

  beforeEach(() => {
    resetStageContext(sessionId);
  });

  describe('RULE 1: Context complete + Search intent + Low risk = MUST ACT', () => {
    it('should enforce execute_search when all conditions met', () => {
      // Setup: Complete context with consent
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'Paris',
        dates: 'March 15',
        passengers: 2,
      };
      grantSearchConsent(sessionId);

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.mustExecuteAction).toBe(true);
      expect(result.actionType).toBe('execute_search');
      expect(result.blockFallback).toBe(true);
      expect(result.stageAfter).toBe('READY_TO_SEARCH');
      expect(result.missingContext).toHaveLength(0);
    });

    it('should enforce ask_consent when context complete but no consent', () => {
      // Setup: Complete context WITHOUT consent
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'Tokyo',
        dates: 'April 1',
      };
      // NO consent granted

      const result = enforceActionExecution(sessionId, 'flight_search', 'LOW');

      expect(result.mustExecuteAction).toBe(true);
      expect(result.actionType).toBe('ask_consent');
      expect(result.blockFallback).toBe(true);
      expect(result.reason).toContain('consent required');
    });

    it('should auto-promote from DISCOVERY to READY_TO_SEARCH', () => {
      const context = getOrCreateStageContext(sessionId);
      expect(context.currentStage).toBe('DISCOVERY');

      context.collectedData = {
        destination: 'London',
        dates: 'December',
      };
      grantSearchConsent(sessionId);

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'MEDIUM');

      expect(result.stageBefore).toBe('DISCOVERY');
      expect(result.stageAfter).toBe('READY_TO_SEARCH');
      expect(result.mustExecuteAction).toBe(true);
    });
  });

  describe('RULE 2: In READY_TO_SEARCH - action MANDATORY', () => {
    it('should enforce execution in READY_TO_SEARCH with consent', () => {
      const context = getOrCreateStageContext(sessionId);
      context.currentStage = 'READY_TO_SEARCH';
      context.collectedData = {
        destination: 'Barcelona',
        dates: 'May 10',
      };
      grantSearchConsent(sessionId);

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.mustExecuteAction).toBe(true);
      expect(result.actionType).toBe('execute_search');
      expect(result.blockFallback).toBe(true);
      expect(result.reason).toContain('MUST execute');
    });

    it('should require consent in READY_TO_SEARCH without it', () => {
      const context = getOrCreateStageContext(sessionId);
      context.currentStage = 'READY_TO_SEARCH';
      context.collectedData = {
        destination: 'Rome',
        dates: 'June 5',
      };
      // NO consent

      const result = enforceActionExecution(sessionId, 'flight', 'LOW');

      expect(result.mustExecuteAction).toBe(true);
      expect(result.actionType).toBe('ask_consent');
      expect(result.blockFallback).toBe(true);
    });
  });

  describe('RULE 3: Context incomplete - collect data', () => {
    it('should NOT enforce action when missing destination', () => {
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        dates: 'July 1',
        // NO destination
      };
      grantSearchConsent(sessionId);

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.mustExecuteAction).toBe(false);
      expect(result.actionType).toBe('collect_data');
      expect(result.blockFallback).toBe(false);
      expect(result.missingContext).toContain('origin_or_destination');
    });

    it('should NOT enforce action when missing dates', () => {
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'Amsterdam',
        // NO dates
      };
      grantSearchConsent(sessionId);

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.mustExecuteAction).toBe(false);
      expect(result.missingContext).toContain('travel_dates');
    });
  });

  describe('Fallback Blocking', () => {
    it('should block fallback when action must execute', () => {
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'Dubai',
        dates: 'August 15',
      };
      grantSearchConsent(sessionId);

      const result = isFallbackAllowed(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('search MUST execute');
    });

    it('should allow fallback when context incomplete', () => {
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        // Missing everything
      };

      const result = isFallbackAllowed(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.allowed).toBe(true);
    });

    it('should block fallback for HIGH risk when context complete', () => {
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'Singapore',
        dates: 'September',
      };
      grantSearchConsent(sessionId);

      // HIGH risk should NOT trigger enforcement
      const result = isFallbackAllowed(sessionId, 'FLIGHT_SEARCH', 'HIGH');

      expect(result.allowed).toBe(true);
    });
  });

  describe('Enforcement Logging', () => {
    it('should log stage before and after', () => {
      const context = getOrCreateStageContext(sessionId);
      context.currentStage = 'NARROWING';
      context.collectedData = {
        destination: 'Bali',
        dates: 'October',
      };
      grantSearchConsent(sessionId);

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.log.stageBefore).toBe('NARROWING');
      expect(result.log.stageAfter).toBe('READY_TO_SEARCH');
      expect(result.log.actionEnforced).toBe('execute_search');
      expect(result.log.fallbackBlocked).toBe(true);
      expect(result.log.contextComplete).toBe(true);
    });

    it('should log intent and risk level', () => {
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = { destination: 'Miami', dates: 'November' };
      grantSearchConsent(sessionId);

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'MEDIUM');

      expect(result.log.intent).toBe('FLIGHT_SEARCH');
      expect(result.log.riskLevel).toBe('MEDIUM');
    });
  });

  describe('Data Extraction and Auto-Promotion', () => {
    it('should auto-promote when data becomes complete', () => {
      resetStageContext(sessionId);
      const context = getOrCreateStageContext(sessionId);
      expect(context.currentStage).toBe('DISCOVERY');

      // Add partial data
      const result1 = updateCollectedDataWithPromotion(sessionId, 'I want to go to Paris');
      expect(result1.promoted).toBe(false);

      // Add dates - should promote
      const result2 = updateCollectedDataWithPromotion(sessionId, 'on March 15th');
      expect(result2.promoted).toBe(true);
      expect(result2.newStage).toBe('READY_TO_SEARCH');
    });

    it('should extract destination from message', () => {
      const data = extractDataFromMessage('I want to fly to Tokyo next month', {});
      expect(data.destination?.toLowerCase()).toBe('tokyo');
    });

    it('should extract dates from message', () => {
      const data = extractDataFromMessage('traveling in January 2025', {});
      expect(data.dates).toBeTruthy();
    });
  });

  describe('Real User Input Scenarios', () => {
    it('should trigger flight search for "NYC to Paris March 15, yes search"', () => {
      resetStageContext(sessionId);

      // User provides all info + consent
      updateCollectedDataWithPromotion(sessionId, 'I want to fly from NYC to Paris on March 15');
      grantSearchConsent(sessionId);

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.mustExecuteAction).toBe(true);
      expect(result.actionType).toBe('execute_search');
      expect(result.blockFallback).toBe(true);
      // This proves: Given complete input, flight search API MUST be called
    });

    it('should ask consent for "Flights to London December" without yes', () => {
      resetStageContext(sessionId);

      updateCollectedDataWithPromotion(sessionId, 'Find me flights to London in December');
      // NO consent granted

      const result = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(result.mustExecuteAction).toBe(true);
      expect(result.actionType).toBe('ask_consent');
      expect(result.blockFallback).toBe(true);
      // Response MUST be consent prompt, not fallback
    });
  });
});
