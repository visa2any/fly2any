/**
 * Atomic Transaction Wrapper
 * Ensures database operations are executed atomically
 * Either ALL succeed or ALL rollback
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  QuoteErrorFactory,
  generateCorrelationId,
} from "@/lib/errors/QuoteApiErrors";

/**
 * Execute database operations atomically with timeout
 * @param operation - Function that receives transaction client
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Result of operation
 * @throws QuoteApiError on transaction failure
 */
export async function executeAtomicTransaction<T>(
  operation: (tx: Omit<typeof prisma, '$transaction' | '$use' | '$extends' | '$disconnect'>) => Promise<T>,
  timeout: number = 10000 // 10 seconds default
): Promise<T> {
  const correlationId = generateCorrelationId();

  const client = prisma;
  if (!client) {
    throw QuoteErrorFactory.persistenceFailed(
      correlationId,
      { reason: 'Database client not initialized' }
    );
  }

  const transaction = client.$transaction(
    async (tx) => {
      return await operation(tx);
    },
    {
      maxWait: timeout,
      timeout: timeout,
    }
  );

  try {
    const result = await transaction;
    return result;
  } catch (error) {
    // Transaction automatically rolled back by Prisma
    // Handle specific error types
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2034') {
        // Transaction timeout
        throw QuoteErrorFactory.databaseTimeout(
          correlationId,
          { timeout: `${timeout}ms` }
        );
      }
      if (error.code === 'P2002') {
        // Unique constraint violation
        throw QuoteErrorFactory.persistenceFailed(
          correlationId,
          {
            reason: 'Unique constraint violation',
            target: error.meta?.target,
            constraint: error.meta?.constraint_name,
          }
        );
      }
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw QuoteErrorFactory.persistenceFailed(
          correlationId,
          {
            reason: 'Foreign key constraint violation',
            field: error.meta?.field_name,
          }
        );
      }
      if (error.code === 'P2014') {
        // Required value not provided
        throw QuoteErrorFactory.validationFailed(
          'Required field is missing',
          correlationId,
          {
            field: error.meta?.field_name,
            reason: 'Value required',
          }
        );
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      // Validation error
      throw QuoteErrorFactory.validationFailed(
        error.message,
        correlationId,
        {
          validation: error.name,
        }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      // Initialization error
      throw QuoteErrorFactory.persistenceFailed(
        correlationId,
        {
          reason: 'Database client initialization failed',
          error: error.message,
        }
      );
    }

    // Unknown error - wrap in generic error
    throw QuoteErrorFactory.internalError(
      correlationId,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }
    );
  }
}

/**
 * Execute with automatic retry on transient errors
 * @param operation - Function to execute
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @param delay - Base delay in milliseconds (default: 100)
 * @returns Result of operation
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 100
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          error.code === 'P2002' || // Unique constraint
          error.code === 'P2003' || // Foreign key
          error.code === 'P2014'    // Required value
        ) {
          throw error; // Don't retry validation errors
        }
      }
      
      // Retry on transient errors
      if (attempt < maxRetries) {
        continue;
      }
    }
  }
  
  // All retries exhausted
  throw lastError;
}