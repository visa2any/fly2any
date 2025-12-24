/**
 * Mandatory Action Enforcement Tests
 *
 * Validates:
 * - READY_TO_SEARCH + FLIGHT_SEARCH = searchFlights() MUST execute
 * - Fallback is impossible when action is required
 * - Runtime assertions throw on violations
 * - Proper response generation for results/empty/error
 */

import {
  enforceActionExecution,
  assertMandatoryActionExecuted,
  generateActionBasedResponse,
  MandatoryActionViolation,
  getOrCreateStageContext,
  resetStageContext,
  grantSearchConsent,
  updateCollectedDataWithPromotion,
  type ActionExecutionStatus,
} from '../conversion/stage-engine';

describe('Mandatory Action Enforcement - Runtime Assertions', () => {
  const sessionId = 'test-mandatory-action';

  beforeEach(() => {
    resetStageContext(sessionId);
  });

  describe('CRITICAL: READY_TO_SEARCH + FLIGHT_SEARCH = MUST execute search', () => {
    it('should THROW when action required but not executed', () => {
      // Setup: Complete context with consent in READY_TO_SEARCH
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'Paris',
        dates: 'March 15',
      };
      grantSearchConsent(sessionId);
      updateCollectedDataWithPromotion(sessionId, 'Paris March 15');

      // Action NOT executed
      const actionStatus: ActionExecutionStatus = {
        actionExecuted: false,
        actionType: null,
      };

      // MUST throw
      expect(() => {
        assertMandatoryActionExecuted(sessionId, 'FLIGHT_SEARCH', 'LOW', actionStatus);
      }).toThrow(MandatoryActionViolation);
    });

    it('should PASS when action was executed', () => {
      // Setup: Complete context
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'Tokyo',
        dates: 'April 1',
      };
      grantSearchConsent(sessionId);

      // Action WAS executed
      const actionStatus: ActionExecutionStatus = {
        actionExecuted: true,
        actionType: 'execute_search',
        results: { count: 5, data: [] },
      };

      // Should NOT throw
      expect(() => {
        assertMandatoryActionExecuted(sessionId, 'FLIGHT_SEARCH', 'LOW', actionStatus);
      }).not.toThrow();
    });

    it('should PASS when no enforcement required (missing data)', () => {
      // Setup: Missing destination
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        dates: 'May 1',
        // NO destination
      };
      grantSearchConsent(sessionId);

      // Action not executed but that's OK
      const actionStatus: ActionExecutionStatus = {
        actionExecuted: false,
        actionType: null,
      };

      // Should NOT throw - missing data means collect first
      expect(() => {
        assertMandatoryActionExecuted(sessionId, 'FLIGHT_SEARCH', 'LOW', actionStatus);
      }).not.toThrow();
    });
  });

  describe('Fallback Blocking', () => {
    it('should block fallback when context complete + consent granted', () => {
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'London',
        dates: 'June 10',
      };
      grantSearchConsent(sessionId);

      const enforcement = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(enforcement.mustExecuteAction).toBe(true);
      expect(enforcement.blockFallback).toBe(true);
      expect(enforcement.actionType).toBe('execute_search');
    });

    it('should allow fallback when HIGH risk', () => {
      const context = getOrCreateStageContext(sessionId);
      context.collectedData = {
        destination: 'Rome',
        dates: 'July 1',
      };
      grantSearchConsent(sessionId);

      // HIGH risk = user protection, may need human review
      const enforcement = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'HIGH');

      // For HIGH risk, we don't auto-enforce
      expect(enforcement.blockFallback).toBe(false);
    });
  });

  describe('Response Generation - No Fallback', () => {
    it('should generate results response when search returns data', () => {
      const actionStatus: ActionExecutionStatus = {
        actionExecuted: true,
        actionType: 'execute_search',
        results: { count: 12, data: [] },
      };

      const response = generateActionBasedResponse(actionStatus, 'en');

      expect(response.type).toBe('results');
      expect(response.response).toContain('12 options');
    });

    it('should generate PT-BR response for Portuguese users', () => {
      const actionStatus: ActionExecutionStatus = {
        actionExecuted: true,
        actionType: 'execute_search',
        results: { count: 8, data: [] },
      };

      const response = generateActionBasedResponse(actionStatus, 'pt');

      expect(response.type).toBe('results');
      expect(response.response).toContain('8 opções');
    });

    it('should generate empty response when no results', () => {
      const actionStatus: ActionExecutionStatus = {
        actionExecuted: true,
        actionType: 'execute_search',
        results: { count: 0, data: [] },
      };

      const response = generateActionBasedResponse(actionStatus, 'en');

      expect(response.type).toBe('empty');
      expect(response.response).toContain("couldn't find");
      expect(response.response).toContain('alternative dates');
    });

    it('should generate error response on API failure', () => {
      const actionStatus: ActionExecutionStatus = {
        actionExecuted: true,
        actionType: 'execute_search',
        error: 'API timeout',
      };

      const response = generateActionBasedResponse(actionStatus, 'en');

      expect(response.type).toBe('error');
      expect(response.response).toContain('issue');
      expect(response.response).toContain('try again');
    });

    it('should generate consent response when asking permission', () => {
      const actionStatus: ActionExecutionStatus = {
        actionExecuted: false,
        actionType: 'ask_consent',
      };

      const response = generateActionBasedResponse(actionStatus, 'en');

      expect(response.type).toBe('consent');
      expect(response.response).toContain('search');
      expect(response.response).toContain('?');
    });
  });

  describe('Real Conversation Flow', () => {
    it('should enforce search for "NYC to Paris March 15, yes search"', () => {
      resetStageContext(sessionId);

      // User provides complete info
      updateCollectedDataWithPromotion(sessionId, 'I want to fly from NYC to Paris on March 15');
      grantSearchConsent(sessionId);

      const enforcement = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(enforcement.mustExecuteAction).toBe(true);
      expect(enforcement.actionType).toBe('execute_search');
      expect(enforcement.blockFallback).toBe(true);
      expect(enforcement.stageAfter).toBe('READY_TO_SEARCH');
    });

    it('should request consent for "Flights to London December" without yes', () => {
      resetStageContext(sessionId);

      // User provides info but NO consent
      updateCollectedDataWithPromotion(sessionId, 'Find me flights to London in December');
      // NO grantSearchConsent

      const enforcement = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(enforcement.mustExecuteAction).toBe(true);
      expect(enforcement.actionType).toBe('ask_consent');
      expect(enforcement.blockFallback).toBe(true);
    });

    it('should collect data for "I want to travel"', () => {
      resetStageContext(sessionId);

      // User is vague
      updateCollectedDataWithPromotion(sessionId, 'I want to travel');

      const enforcement = enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(enforcement.mustExecuteAction).toBe(false);
      expect(enforcement.actionType).toBe('collect_data');
      expect(enforcement.blockFallback).toBe(false);
      expect(enforcement.missingContext).toContain('origin_or_destination');
    });
  });

  describe('MandatoryActionViolation Error Class', () => {
    it('should contain session and stage info', () => {
      const error = new MandatoryActionViolation(
        'test-session',
        'READY_TO_SEARCH',
        'execute_search',
        'Test reason'
      );

      expect(error.name).toBe('MandatoryActionViolation');
      expect(error.sessionId).toBe('test-session');
      expect(error.stage).toBe('READY_TO_SEARCH');
      expect(error.expectedAction).toBe('execute_search');
      expect(error.message).toContain('MANDATORY_ACTION_VIOLATION');
    });
  });

  describe('Logging', () => {
    it('should log action_started, action_completed events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const context = getOrCreateStageContext(sessionId);
      context.collectedData = { destination: 'Bali', dates: 'August' };
      grantSearchConsent(sessionId);

      enforceActionExecution(sessionId, 'FLIGHT_SEARCH', 'LOW');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[STAGE-ENGINE-ENFORCE]')
      );

      consoleSpy.mockRestore();
    });

    it('should log assertion pass/fail', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const actionStatus: ActionExecutionStatus = {
        actionExecuted: true,
        actionType: 'execute_search',
        results: { count: 3, data: [] },
      };

      assertMandatoryActionExecuted(sessionId, 'HOTEL_SEARCH', 'MEDIUM', actionStatus);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ASSERT-ACTION]')
      );

      consoleSpy.mockRestore();
    });
  });
});
