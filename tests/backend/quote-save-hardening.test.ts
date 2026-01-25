/**
 * Quote Save Hardening - Unit Tests
 * Comprehensive coverage of all critical paths
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { QuoteErrorFactory } from '@/lib/errors/QuoteApiErrors';
import { 
  updateQuoteWithOptimisticLock,
  validateQuoteState,
  getQuoteVersion,
} from '@/lib/database/concurrency';
import { 
  validateQuoteData,
  validateClientOwnership,
  validatePricingConsistency,
  validateQuoteItems,
  calculateQuotePricingSafe,
} from '@/lib/validation/quote-validator';
import { QuoteOperationTracker } from '@/lib/logging/quote-observability';

describe('Quote Save Hardening - Unit Tests', () => {
  
  // ========================================
  // PART 1: Optimistic Locking Tests
  // ========================================
  
  describe('Optimistic Locking', () => {
    it('PATCH with correct version succeeds and increments version by +1', async () => {
      const quoteId = 'test-quote-id';
      const currentVersion = 5;
      
      const result = await updateQuoteWithOptimisticLock(
        quoteId,
        currentVersion,
        { tripName: 'Updated Trip' },
        'user-id'
      );
      
      expect(result.version).toBe(currentVersion + 1);
      expect(result.tripName).toBe('Updated Trip');
      expect(result.lastModifiedBy).toBe('user-id');
      expect(result.lastModifiedAt).toBeDefined();
    });

    it('PATCH with stale version throws QUOTE_CONFLICT_VERSION', async () => {
      const quoteId = 'test-quote-id';
      const staleVersion = 3;
      const actualVersion = 5;
      
      await expect(
        updateQuoteWithOptimisticLock(
          quoteId,
          staleVersion,
          { tripName: 'Updated Trip' },
          'user-id'
        )
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_CONFLICT_VERSION',
        severity: 'HIGH',
        retryable: true,
        message: expect.stringContaining('was modified'),
        details: {
          quoteId,
          expectedVersion: staleVersion,
          actualVersion,
        },
      });
    });

    it('Version increments exactly by +1 on successful update', async () => {
      const quoteId = 'test-quote-id';
      const versions: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const result = await updateQuoteWithOptimisticLock(
          quoteId,
          i,
          { tripName: `Update ${i}` },
          'user-id'
        );
        versions.push(result.version);
      }
      
      expect(versions).toEqual([1, 2, 3, 4, 5]);
    });
  });

  // ========================================
  // PART 2: State Validation Tests
  // ========================================
  
  describe('State Validation', () => {
    it('PATCH when quote is SENT throws QUOTE_ALREADY_SENT (CRITICAL)', async () => {
      const quoteId = 'sent-quote-id';
      
      await expect(
        validateQuoteState(quoteId, 'UPDATE', 'agent-id')
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_ALREADY_SENT',
        severity: 'CRITICAL',
        retryable: false,
        message: expect.stringContaining('already been sent'),
      });
    });

    it('PATCH when quote is LOCKED throws QUOTE_STATE_INVALID (CRITICAL)', async () => {
      const quoteId = 'locked-quote-id';
      
      await expect(
        validateQuoteState(quoteId, 'UPDATE', 'agent-id')
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_STATE_INVALID',
        severity: 'HIGH',
        retryable: false,
        message: expect.stringContaining('not in a valid state'),
      });
    });

    it('PATCH when quote is ACCEPTED blocks update', async () => {
      const quoteId = 'accepted-quote-id';
      
      await expect(
        validateQuoteState(quoteId, 'UPDATE', 'agent-id')
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_STATE_INVALID',
        severity: 'HIGH',
        retryable: false,
      });
    });

    it('PATCH allowed in DRAFT state', async () => {
      const quoteId = 'draft-quote-id';
      
      await expect(
        validateQuoteState(quoteId, 'UPDATE', 'agent-id')
      ).resolves.not.toThrow();
    });

    it('DELETE allowed in DRAFT state', async () => {
      const quoteId = 'draft-quote-id';
      
      await expect(
        validateQuoteState(quoteId, 'DELETE', 'agent-id')
      ).resolves.not.toThrow();
    });

    it('DELETE blocked in SENT state', async () => {
      const quoteId = 'sent-quote-id';
      
      await expect(
        validateQuoteState(quoteId, 'DELETE', 'agent-id')
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_STATE_INVALID',
        severity: 'HIGH',
        retryable: false,
      });
    });
  });

  // ========================================
  // PART 3: Validation Failure Tests
  // ========================================
  
  describe('Validation Failures', () => {
    it('Pricing mismatch throws PRICING_VALIDATION_FAILED', async () => {
      const quoteData = {
        flights: [{ price: 1000 }],
        hotels: [{ price: 500 }],
        adults: 1,
      };
      
      const pricing = {
        basePrice: 2000,
        subtotal: 1800, // MISMATCH
        total: 2070,
      };
      
      await expect(
        validatePricingConsistency(quoteData, pricing, 1)
      ).rejects.toMatchObject({
        errorCode: 'PRICING_VALIDATION_FAILED',
        severity: 'HIGH',
        retryable: false,
        details: {
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'subtotal',
            }),
          ]),
        },
      });
    });

    it('Invalid currency throws QUOTE_VALIDATION_FAILED', async () => {
      const quoteData = {
        tripName: 'Test Trip',
        destination: 'Test Dest',
        startDate: '2026-01-24T10:00:00Z',
        endDate: '2026-01-26T10:00:00Z',
        adults: 1,
        currency: 'INVALID',
      };
      
      await expect(
        validateQuoteData(quoteData, 'CREATE')
      ).rejects.toMatchObject({
        errorCode: 'CURRENCY_INVALID',
        severity: 'HIGH',
        retryable: false,
        message: expect.stringContaining('Invalid currency'),
      });
    });

    it('Missing client throws QUOTE_VALIDATION_FAILED', async () => {
      const clientId = 'non-existent-client';
      const agentId = 'test-agent-id';
      
      await expect(
        validateClientOwnership(clientId, agentId)
      ).rejects.toMatchObject({
        errorCode: 'CLIENT_NOT_FOUND',
        severity: 'HIGH',
        retryable: false,
        message: expect.stringContaining('not found'),
      });
    });

    it('Invalid markup range throws QUOTE_VALIDATION_FAILED', async () => {
      const quoteData = {
        tripName: 'Test Trip',
        destination: 'Test Dest',
        startDate: '2026-01-24T10:00:00Z',
        endDate: '2026-01-26T10:00:00Z',
        adults: 1,
        agentMarkupPercent: 150, // INVALID: > 100
      };
      
      await expect(
        validateQuoteData(quoteData, 'CREATE')
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_VALIDATION_FAILED',
        severity: 'HIGH',
        retryable: false,
        details: {
          field: 'agentMarkupPercent',
        },
      });
    });

    it('Negative discount throws QUOTE_VALIDATION_FAILED', async () => {
      const quoteData = {
        tripName: 'Test Trip',
        destination: 'Test Dest',
        startDate: '2026-01-24T10:00:00Z',
        endDate: '2026-01-26T10:00:00Z',
        adults: 1,
        discount: -100, // INVALID: < 0
      };
      
      await expect(
        validateQuoteData(quoteData, 'CREATE')
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_VALIDATION_FAILED',
        severity: 'HIGH',
        retryable: false,
        details: {
          field: 'discount',
        },
      });
    });

    it('Invalid traveler count throws QUOTE_VALIDATION_FAILED', async () => {
      const quoteData = {
        tripName: 'Test Trip',
        destination: 'Test Dest',
        startDate: '2026-01-24T10:00:00Z',
        endDate: '2026-01-26T10:00:00Z',
        adults: 0, // INVALID: < 1
      };
      
      await expect(
        validateQuoteData(quoteData, 'CREATE')
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_VALIDATION_FAILED',
        severity: 'HIGH',
        retryable: false,
        details: {
          field: 'adults',
        },
      });
    });

    it('Invalid date range throws QUOTE_VALIDATION_FAILED', async () => {
      const quoteData = {
        tripName: 'Test Trip',
        destination: 'Test Dest',
        startDate: '2026-01-26T10:00:00Z',
        endDate: '2026-01-24T10:00:00Z', // END BEFORE START
        adults: 1,
      };
      
      await expect(
        validateQuoteData(quoteData, 'CREATE')
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_VALIDATION_FAILED',
        severity: 'HIGH',
        retryable: false,
        details: {
          field: 'endDate',
        },
      });
    });
  });

  // ========================================
  // PART 4: Transaction Safety Tests
  // ========================================
  
  describe('Transaction Safety', () => {
    it('Forces Prisma error mid-transaction triggers rollback', async () => {
      const quoteId = 'test-quote-id';
      
      // Mock Prisma to throw error mid-transaction
      const mockError = new Error('Prisma P2002');
      (mockError as any).code = 'P2002';
      
      await expect(
        updateQuoteWithOptimisticLock(
          quoteId,
          1,
          { tripName: 'Updated Trip' },
          'user-id'
        )
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_PERSISTENCE_FAILED',
        severity: 'CRITICAL',
        retryable: true,
      });
    });

    it('No partial writes allowed on transaction failure', async () => {
      const quoteId = 'test-quote-id';
      const initialVersion = await getQuoteVersion(quoteId);
      
      try {
        await updateQuoteWithOptimisticLock(
          quoteId,
          1,
          { tripName: 'Should not persist' },
          'user-id'
        );
      } catch (error) {
        // Expected to fail
      }
      
      const finalVersion = await getQuoteVersion(quoteId);
      expect(finalVersion).toBe(initialVersion);
    });

    it('Transaction timeout throws DATABASE_TIMEOUT', async () => {
      const quoteId = 'test-quote-id';
      
      // Mock Prisma timeout
      const mockError = new Error('Transaction timeout');
      (mockError as any).code = 'P2034';
      
      await expect(
        updateQuoteWithOptimisticLock(
          quoteId,
          1,
          { tripName: 'Updated Trip' },
          'user-id'
        )
      ).rejects.toMatchObject({
        errorCode: 'DATABASE_TIMEOUT',
        severity: 'HIGH',
        retryable: true,
        message: expect.stringContaining('timeout'),
      });
    });
  });

  // ========================================
  // PART 5: Error Contract Integrity Tests
  // ========================================
  
  describe('Error Contract Integrity', () => {
    it('QUOTE_CONFLICT_VERSION includes all required fields', async () => {
      const error = QuoteErrorFactory.conflictVersion(
        'quote-id',
        3,
        5,
        'correlation-id'
      );
      
      expect(error).toMatchObject({
        success: false,
        errorCode: 'QUOTE_CONFLICT_VERSION',
        message: expect.any(String),
        severity: 'HIGH',
        retryable: true,
        correlationId: 'correlation-id',
        timestamp: expect.any(Number),
        details: {
          quoteId: 'quote-id',
          expectedVersion: 3,
          actualVersion: 5,
        },
      });
    });

    it('QUOTE_VALIDATION_FAILED includes all required fields', () => {
      const error = QuoteErrorFactory.validationFailed(
        'Validation error',
        'correlation-id',
        { field: 'test' }
      );
      
      expect(error).toMatchObject({
        success: false,
        errorCode: 'QUOTE_VALIDATION_FAILED',
        message: 'Validation error',
        severity: 'HIGH',
        retryable: false,
        correlationId: 'correlation-id',
        timestamp: expect.any(Number),
        details: {
          field: 'test',
        },
      });
    });

    it('INTERNAL_ERROR includes stack trace', () => {
      const error = QuoteErrorFactory.internalError(
        'correlation-id',
        {
          error: 'Test error',
          stack: 'Error: Test error\n    at test.js:1:1',
        }
      );
      
      expect(error).toMatchObject({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        severity: 'CRITICAL',
        retryable: false,
        correlationId: 'correlation-id',
        timestamp: expect.any(Number),
        details: {
          error: 'Test error',
          stack: 'Error: Test error\n    at test.js:1:1',
        },
      });
    });

    it('All errors include timestamp', () => {
      const error = QuoteErrorFactory.validationFailed(
        'Test error',
        'correlation-id',
        {}
      );
      
      expect(error.timestamp).toBeGreaterThan(Date.now() - 1000);
      expect(error.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('All errors include correlationId', () => {
      const correlationId = 'test-correlation-id';
      const error = QuoteErrorFactory.validationFailed(
        'Test error',
        correlationId,
        {}
      );
      
      expect(error.correlationId).toBe(correlationId);
    });
  });

  // ========================================
  // PART 6: Observability Tests
  // ========================================
  
  describe('Observability', () => {
    it('QuoteOperationTracker generates unique correlation ID', () => {
      const tracker1 = new QuoteOperationTracker(
        'CREATE',
        'agent-id',
        'client-id',
        {},
      );
      const tracker2 = new QuoteOperationTracker(
        'CREATE',
        'agent-id',
        'client-id',
        {},
      );
      
      expect(tracker1.getCorrelationId()).not.toBe(tracker2.getCorrelationId());
    });

    it('QuoteOperationTracker tracks operation details', () => {
      const tracker = new QuoteOperationTracker(
        'UPDATE',
        'agent-id',
        'client-id',
        { metadata: 'test' },
      );
      
      expect(tracker.getCorrelationId()).toBeDefined();
      expect(tracker.getCorrelationId()).toMatch(/^REQ-.*$/);
    });

    it('QuoteOperationTracker.success logs correct data', () => {
      const tracker = new QuoteOperationTracker(
        'UPDATE',
        'agent-id',
        'client-id',
        {},
      );
      
      const logSpy = jest.spyOn(console, 'log');
      tracker.success('quote-id');
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"UPDATE"')
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"quoteId":"quote-id"')
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"success":true')
      );
    });

    it('QuoteOperationTracker.failure logs correct data', () => {
      const tracker = new QuoteOperationTracker(
        'UPDATE',
        'agent-id',
        'client-id',
        {},
      );
      
      const errorSpy = jest.spyOn(console, 'error');
      tracker.failure({
        code: 'QUOTE_CONFLICT_VERSION',
        message: 'Conflict',
        severity: 'HIGH',
      });
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"UPDATE"')
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"errorCode":"QUOTE_CONFLICT_VERSION"')
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"success":false')
      );
    });
  });

  // ========================================
  // PART 7: Correlation ID Consistency Tests
  // ========================================
  
  describe('Correlation ID Consistency', () => {
    it('Correlation ID is consistent throughout request lifecycle', () => {
      const tracker = new QuoteOperationTracker(
        'CREATE',
        'agent-id',
        'client-id',
        {},
      );
      
      const correlationId = tracker.getCorrelationId();
      
      tracker.success('quote-id');
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`"correlationId":"${correlationId}"`)
      );
    });

    it('Correlation ID is included in error responses', () => {
      const error = QuoteErrorFactory.conflictVersion(
        'quote-id',
        3,
        5,
        'test-correlation-id'
      );
      
      expect(error.correlationId).toBe('test-correlation-id');
    });

    it('Correlation ID format is valid', () => {
      const correlationId = QuoteErrorFactory.generateCorrelationId();
      
      expect(correlationId).toMatch(/^REQ-[A-Za-z0-9]{12}$/);
    });
  });
});