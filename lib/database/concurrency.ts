/**
 * Concurrency Control - Optimistic Locking
 * Prevents race conditions and lost updates
 */

import {
  QuoteErrorFactory,
  generateCorrelationId,
} from "@/lib/errors/QuoteApiErrors";
import { executeAtomicTransaction } from "./transaction";
import prisma from "@/lib/prisma";

/**
 * Update quote with optimistic locking
 * Ensures no concurrent modifications occurred
 * 
 * @param quoteId - Quote to update
 * @param expectedVersion - Expected current version
 * @param updateData - Data to update
 * @param userId - User performing the update
 * @returns Updated quote
 * @throws QuoteApiError with QUOTE_CONFLICT_VERSION if version mismatch
 */
export async function updateQuoteWithOptimisticLock(
  quoteId: string,
  expectedVersion: number,
  updateData: any,
  userId?: string
): Promise<any> {
  const correlationId = generateCorrelationId();

  // Atomic check-and-update
  const result = await executeAtomicTransaction(async (tx) => {
    // Lock row for update
    const currentQuote = await tx.agentQuote.findUnique({
      where: { id: quoteId },
      select: {
        version: true,
        status: true,
        agentId: true,
      }
    });

    if (!currentQuote) {
      throw QuoteErrorFactory.persistenceFailed(
        correlationId,
        {
          reason: 'Quote not found during update',
          quoteId,
        }
      );
    }

    // Validate quote is in editable state
    const editableStates = ['DRAFT'];
    if (!editableStates.includes(currentQuote.status)) {
      throw QuoteErrorFactory.stateInvalid(
        currentQuote.status,
        'DRAFT',
        correlationId
      );
    }

    // Check version - CONCURRENCY CONTROL
    if (currentQuote.version !== expectedVersion) {
      throw QuoteErrorFactory.conflictVersion(
        quoteId,
        expectedVersion,
        currentQuote.version,
        correlationId
      );
    }

    // Update with version increment
    const updated = await tx.agentQuote.update({
      where: { id: quoteId },
      data: {
        ...updateData,
        version: { increment: 1 }, // ATOMIC INCREMENT
        lastModifiedBy: userId,
        lastModifiedAt: new Date(),
      }
    });

    return updated;
  });

  return result;
}

/**
 * Check if quote can be modified
 * Returns true if quote is in editable state
 * 
 * @param quoteId - Quote to check
 * @returns True if editable
 */
export async function isQuoteEditable(quoteId: string): Promise<boolean> {
  const quote = await prisma.agentQuote.findUnique({
    where: { id: quoteId },
    select: { status: true }
  });

  if (!quote) {
    return false;
  }

  const editableStates = ['DRAFT'];
  return editableStates.includes(quote.status);
}

/**
 * Get current quote version
 * 
 * @param quoteId - Quote to check
 * @returns Current version number
 */
export async function getQuoteVersion(quoteId: string): Promise<number | null> {
  const quote = await prisma.agentQuote.findUnique({
    where: { id: quoteId },
    select: { version: true }
  });

  return quote?.version ?? null;
}

/**
 * Validate quote state for operations
 * 
 * @param quoteId - Quote to validate
 * @param operation - Operation being performed
 * @param userId - User performing operation
 * @throws QuoteApiError if state is invalid
 */
export async function validateQuoteState(
  quoteId: string,
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SEND',
  userId?: string
): Promise<void> {
  const correlationId = generateCorrelationId();

  if (operation === 'CREATE') {
    // For CREATE, we're validating prerequisites, not quote state
    return;
  }

  const quote = await prisma.agentQuote.findUnique({
    where: { id: quoteId },
    select: {
      status: true,
      agentId: true,
      version: true,
    }
  });

  if (!quote) {
    throw QuoteErrorFactory.persistenceFailed(
      correlationId,
      {
        reason: 'Quote not found',
        quoteId,
      }
    );
  }

  // Validate ownership
  if (userId && quote.agentId !== userId) {
    throw QuoteErrorFactory.persistenceFailed(
      correlationId,
      {
        reason: 'Quote does not belong to agent',
        quoteId,
      }
    );
  }

  // Validate state transition
  const validTransitions: Record<string, string[]> = {
    'DRAFT': ['UPDATE', 'DELETE', 'SEND'],
    'SENT': [],
    'ACCEPTED': [],
    'REJECTED': ['UPDATE', 'DELETE'],
    'EXPIRED': [],
    'CANCELLED': [],
  };

  const allowedOperations = validTransitions[quote.status] || [];

  if (!allowedOperations.includes(operation)) {
    if (quote.status === 'SENT') {
      throw QuoteErrorFactory.alreadySent(quoteId, correlationId);
    }

    throw QuoteErrorFactory.stateInvalid(
      quote.status,
      allowedOperations.length > 0 ? allowedOperations[0] : 'DRAFT',
      correlationId
    );
  }
}