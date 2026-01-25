/**
 * Quote Save Hardening - Integration Tests
 * Tests against real database (SQLite/Postgres)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import prisma from '@/lib/prisma';
import { 
  updateQuoteWithOptimisticLock,
  validateQuoteState,
} from '@/lib/database/concurrency';

describe('Quote Save Hardening - Integration Tests', () => {
  let agentId: string;
  let clientId: string;
  let quoteId: string;

  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();

    // Create test agent
    const agent = await prisma.travelAgent.create({
      data: {
        userId: 'test-user-id',
        email: 'test@agent.com',
        firstName: 'Test',
        lastName: 'Agent',
        companyName: 'Test Agency',
      },
    });
    agentId = agent.id;

    // Create test client
    const client = await prisma.agentClient.create({
      data: {
        agentId,
        firstName: 'Test',
        lastName: 'Client',
        email: 'test@client.com',
      },
    });
    clientId = client.id;
  });

  beforeEach(async () => {
    // Create a fresh quote for each test
    const quote = await prisma.agentQuote.create({
      data: {
        agentId,
        clientId,
        quoteNumber: 'QT-TEST-001',
        tripName: 'Test Trip',
        destination: 'Paris',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-05'),
        duration: 4,
        travelers: 2,
        adults: 2,
        children: 0,
        infants: 0,
        basePrice: 2000,
        subtotal: 2300,
        agentMarkup: 300,
        total: 2600,
        currency: 'USD',
        status: 'DRAFT',
        version: 1,
      },
    });
    quoteId = quote.id;
  });

  afterAll(async () => {
    // Cleanup test database
    await prisma.$disconnect();
  });

  // ========================================
  // INTEGRATION SCENARIO 1: Concurrent PATCH Requests
  // ========================================
  
  describe('Concurrent PATCH Requests', () => {
    it('Two PATCH requests with same version - exactly one succeeds', async () => {
      const version = 1;
      const updateData = { tripName: 'Concurrent Update' };

      // Launch two concurrent PATCH requests
      const [result1, result2] = await Promise.allSettled([
        updateQuoteWithOptimisticLock(quoteId, version, updateData, 'user-id'),
        updateQuoteWithOptimisticLock(quoteId, version, updateData, 'user-id'),
      ]);

      // Exactly one should succeed
      const successes = [result1, result2].filter(
        r => r.status === 'fulfilled'
      );
      const failures = [result1, result2].filter(
        r => r.status === 'rejected'
      );

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1);

      // The failure should be QUOTE_CONFLICT_VERSION
      const failure = failures[0] as PromiseRejectedResult;
      expect(failure.reason).toMatchObject({
        errorCode: 'QUOTE_CONFLICT_VERSION',
        severity: 'HIGH',
        retryable: true,
      });

      // Verify final state
      const finalQuote = await prisma.agentQuote.findUnique({
        where: { id: quoteId },
      });
      expect(finalQuote.version).toBe(2);
      expect(finalQuote.tripName).toBe('Concurrent Update');
    });

    it('Three concurrent PATCH requests - one succeeds, two fail', async () => {
      const version = 1;
      const updateData = { tripName: 'Triple Concurrent Update' };

      const results = await Promise.allSettled([
        updateQuoteWithOptimisticLock(quoteId, version, updateData, 'user-id'),
        updateQuoteWithOptimisticLock(quoteId, version, updateData, 'user-id'),
        updateQuoteWithOptimisticLock(quoteId, version, updateData, 'user-id'),
      ]);

      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(2);

      // All failures should be QUOTE_CONFLICT_VERSION
      failures.forEach((failure) => {
        const error = (failure as PromiseRejectedResult).reason;
        expect(error).toMatchObject({
          errorCode: 'QUOTE_CONFLICT_VERSION',
          severity: 'HIGH',
          retryable: true,
        });
      });
    });
  });

  // ========================================
  // INTEGRATION SCENARIO 2: POST → PATCH → PATCH
  // ========================================
  
  describe('POST → PATCH → PATCH Flow', () => {
    it('Create quote, update success, update with stale version fails', async () => {
      // Step 1: Create quote (version 1)
      const createdQuote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-FLOW-001',
          tripName: 'Initial Trip',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'DRAFT',
          version: 1,
        },
      });

      expect(createdQuote.version).toBe(1);

      // Step 2: Update quote (version 1 → 2)
      const updatedQuote = await updateQuoteWithOptimisticLock(
        createdQuote.id,
        1,
        { tripName: 'First Update' },
        'user-id'
      );

      expect(updatedQuote.version).toBe(2);
      expect(updatedQuote.tripName).toBe('First Update');

      // Step 3: Update with stale version (should fail)
      await expect(
        updateQuoteWithOptimisticLock(
          createdQuote.id,
          1, // STALE VERSION
          { tripName: 'Should Not Persist' },
          'user-id'
        )
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_CONFLICT_VERSION',
        severity: 'HIGH',
        retryable: true,
        details: {
          expectedVersion: 1,
          actualVersion: 2,
        },
      });

      // Verify final state
      const finalQuote = await prisma.agentQuote.findUnique({
        where: { id: createdQuote.id },
      });

      expect(finalQuote.version).toBe(2);
      expect(finalQuote.tripName).toBe('First Update'); // First update persisted
      expect(finalQuote.tripName).not.toBe('Should Not Persist'); // Second update rejected
    });

    it('Sequential updates with correct versions succeed', async () => {
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-SEQ-001',
          tripName: 'Sequential Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'DRAFT',
          version: 1,
        },
      });

      // Sequential updates
      const updates = [
        { version: 1, tripName: 'Update 1' },
        { version: 2, tripName: 'Update 2' },
        { version: 3, tripName: 'Update 3' },
      ];

      for (const update of updates) {
        const result = await updateQuoteWithOptimisticLock(
          quote.id,
          update.version,
          { tripName: update.tripName },
          'user-id'
        );
        expect(result.version).toBe(update.version + 1);
        expect(result.tripName).toBe(update.tripName);
      }

      // Final state
      const finalQuote = await prisma.agentQuote.findUnique({
        where: { id: quote.id },
      });

      expect(finalQuote.version).toBe(4);
      expect(finalQuote.tripName).toBe('Update 3');
    });
  });

  // ========================================
  // INTEGRATION SCENARIO 3: Rollback Verification
  // ========================================
  
  describe('Rollback Verification', () => {
    it('Inject failure during update - quote remains unchanged', async () => {
      // Create quote
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-ROLLBACK-001',
          tripName: 'Rollback Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'DRAFT',
          version: 1,
        },
      });

      const initialVersion = quote.version;
      const initialTripName = quote.tripName;

      // Attempt update with invalid data (will fail)
      await expect(
        updateQuoteWithOptimisticLock(
          quote.id,
          1,
          { tripName: 'Should Not Persist' },
          'wrong-user-id' // This will fail ownership check
        )
      ).rejects.toThrow();

      // Verify quote remains unchanged
      const finalQuote = await prisma.agentQuote.findUnique({
        where: { id: quote.id },
      });

      expect(finalQuote.version).toBe(initialVersion);
      expect(finalQuote.tripName).toBe(initialTripName);
    });

    it('Multiple concurrent failures - all roll back', async () => {
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-MULTI-ROLLBACK-001',
          tripName: 'Multi Rollback Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'DRAFT',
          version: 1,
        },
      });

      const initialVersion = quote.version;

      // Launch multiple concurrent invalid updates
      const results = await Promise.allSettled([
        updateQuoteWithOptimisticLock(
          quote.id,
          1,
          { tripName: 'Failed 1' },
          'wrong-user-1'
        ),
        updateQuoteWithOptimisticLock(
          quote.id,
          1,
          { tripName: 'Failed 2' },
          'wrong-user-2'
        ),
        updateQuoteWithOptimisticLock(
          quote.id,
          1,
          { tripName: 'Failed 3' },
          'wrong-user-3'
        ),
      ]);

      // All should fail
      const failures = results.filter(r => r.status === 'rejected');
      expect(failures.length).toBe(3);

      // Verify quote remains unchanged
      const finalQuote = await prisma.agentQuote.findUnique({
        where: { id: quote.id },
      });

      expect(finalQuote.version).toBe(initialVersion);
      expect(finalQuote.tripName).toBe('Multi Rollback Test');
    });
  });

  // ========================================
  // INTEGRATION SCENARIO 4: State Transition Safety
  // ========================================
  
  describe('State Transition Safety', () => {
    it('PATCH allowed in DRAFT state', async () => {
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-DRAFT-001',
          tripName: 'Draft Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'DRAFT',
          version: 1,
        },
      });

      // Should succeed
      await validateQuoteState(quote.id, 'UPDATE', agentId);
      
      const result = await updateQuoteWithOptimisticLock(
        quote.id,
        1,
        { tripName: 'Updated in DRAFT' },
        'user-id'
      );

      expect(result.version).toBe(2);
      expect(result.status).toBe('DRAFT');
    });

    it('PATCH blocked after SENT', async () => {
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-SENT-001',
          tripName: 'Sent Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'SENT',
          version: 1,
        },
      });

      // Should fail with QUOTE_ALREADY_SENT
      await expect(
        validateQuoteState(quote.id, 'UPDATE', agentId)
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_ALREADY_SENT',
        severity: 'CRITICAL',
        retryable: false,
      });

      // Attempting to update should also fail
      await expect(
        updateQuoteWithOptimisticLock(
          quote.id,
          1,
          { tripName: 'Should Not Persist' },
          'user-id'
        )
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_STATE_INVALID',
        severity: 'HIGH',
        retryable: false,
      });
    });

    it('PATCH blocked after ACCEPTED', async () => {
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-ACCEPTED-001',
          tripName: 'Accepted Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'ACCEPTED',
          version: 1,
        },
      });

      // Should fail with QUOTE_STATE_INVALID
      await expect(
        validateQuoteState(quote.id, 'UPDATE', agentId)
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_STATE_INVALID',
        severity: 'HIGH',
        retryable: false,
      });

      // Attempting to update should also fail
      await expect(
        updateQuoteWithOptimisticLock(
          quote.id,
          1,
          { tripName: 'Should Not Persist' },
          'user-id'
        )
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_STATE_INVALID',
        severity: 'HIGH',
        retryable: false,
      });
    });

    it('PATCH allowed in REJECTED state', async () => {
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-REJECTED-001',
          tripName: 'Rejected Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'REJECTED',
          version: 1,
        },
      });

      // Should succeed
      await validateQuoteState(quote.id, 'UPDATE', agentId);
      
      const result = await updateQuoteWithOptimisticLock(
        quote.id,
        1,
        { tripName: 'Updated after REJECTED' },
        'user-id'
      );

      expect(result.version).toBe(2);
      expect(result.status).toBe('REJECTED');
    });

    it('DELETE allowed in DRAFT state', async () => {
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-DELETE-001',
          tripName: 'Delete Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'DRAFT',
          version: 1,
        },
      });

      // Should succeed
      await validateQuoteState(quote.id, 'DELETE', agentId);
    });

    it('DELETE blocked in SENT state', async () => {
      const quote = await prisma.agentQuote.create({
        data: {
          agentId,
          clientId,
          quoteNumber: 'QT-DELETE-SENT-001',
          tripName: 'Delete Sent Test',
          destination: 'Paris',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-05'),
          duration: 4,
          travelers: 2,
          adults: 2,
          children: 0,
          infants: 0,
          basePrice: 2000,
          subtotal: 2300,
          agentMarkup: 300,
          total: 2600,
          currency: 'USD',
          status: 'SENT',
          version: 1,
        },
      });

      // Should fail
      await expect(
        validateQuoteState(quote.id, 'DELETE', agentId)
      ).rejects.toMatchObject({
        errorCode: 'QUOTE_STATE_INVALID',
        severity: 'HIGH',
        retryable: false,
      });
    });
  });
});