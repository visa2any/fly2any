/**
 * Database Security Utilities
 *
 * Safe query builders and utilities to prevent SQL injection and ensure secure database operations.
 * All functions use Prisma's parameterized queries by default.
 *
 * @module security/database-security
 */

import { Prisma } from '@prisma/client';

// ==========================================
// SQL INJECTION PREVENTION
// ==========================================

/**
 * IMPORTANT: Always use Prisma's parameterized queries
 *
 * GOOD (Safe):
 * prisma.user.findMany({
 *   where: { email: userInput }
 * })
 *
 * BAD (Unsafe):
 * prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`
 *
 * GOOD (Raw query with parameterization):
 * prisma.$queryRaw`SELECT * FROM users WHERE email = ${Prisma.raw(sanitizedInput)}`
 */

/**
 * Sanitize input for raw SQL queries
 * Note: Prefer parameterized queries over this
 *
 * @param input - User input to sanitize
 * @returns Sanitized input
 */
export function sanitizeSQLInput(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\0/g, '\\0') // Escape null bytes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\x1a/g, '\\Z'); // Escape Ctrl+Z
}

/**
 * Safe LIKE pattern builder (prevents SQL injection in LIKE queries)
 *
 * @param pattern - Search pattern
 * @returns Safe LIKE pattern
 *
 * @example
 * const pattern = buildSafeLikePattern(userInput);
 * prisma.user.findMany({
 *   where: { name: { contains: pattern } }
 * })
 */
export function buildSafeLikePattern(pattern: string): string {
  return pattern
    .replace(/[%_\\]/g, '\\$&') // Escape LIKE special characters
    .trim()
    .substring(0, 100); // Limit length
}

// ==========================================
// SAFE QUERY BUILDERS
// ==========================================

/**
 * Build safe WHERE clause for user searches
 *
 * @param searchTerm - User search term
 * @param fields - Fields to search
 * @returns Prisma where clause
 */
export function buildSafeSearchWhere<T>(
  searchTerm: string,
  fields: string[]
): Prisma.UserWhereInput {
  const safePattern = buildSafeLikePattern(searchTerm);

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: safePattern,
        mode: Prisma.QueryMode.insensitive,
      },
    })),
  } as Prisma.UserWhereInput;
}

/**
 * Build safe pagination parameters
 *
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Prisma skip and take parameters
 */
export function buildSafePagination(
  page: number,
  pageSize: number
): { skip: number; take: number } {
  // Validate and constrain inputs
  const safePage = Math.max(1, Math.min(page, 1000)); // Max 1000 pages
  const safePageSize = Math.max(1, Math.min(pageSize, 100)); // Max 100 items per page

  return {
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}

/**
 * Build safe ORDER BY clause
 *
 * @param sortField - Field to sort by
 * @param sortOrder - Sort order (asc/desc)
 * @param allowedFields - List of allowed sort fields
 * @returns Prisma orderBy clause
 */
export function buildSafeOrderBy(
  sortField: string,
  sortOrder: 'asc' | 'desc',
  allowedFields: string[]
): Record<string, 'asc' | 'desc'> {
  // Only allow sorting by whitelisted fields
  if (!allowedFields.includes(sortField)) {
    return { createdAt: 'desc' }; // Default safe sort
  }

  const safeOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  return { [sortField]: safeOrder };
}

// ==========================================
// TRANSACTION HELPERS
// ==========================================

/**
 * Execute operations in a transaction safely
 *
 * @param operations - Operations to execute
 * @returns Transaction result
 *
 * @example
 * await safeTransaction([
 *   prisma.booking.create({ data: bookingData }),
 *   prisma.payment.create({ data: paymentData }),
 * ])
 */
export async function safeTransaction<T>(
  prisma: any,
  operations: ((tx: any) => Promise<T>)[]
): Promise<T[]> {
  try {
    return await prisma.$transaction(
      operations.map((op) => op(prisma)),
      {
        maxWait: 5000, // 5 seconds max wait
        timeout: 10000, // 10 seconds max execution
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Database transaction failed');
  }
}

// ==========================================
// DATA ACCESS CONTROL
// ==========================================

/**
 * Check if user has access to resource
 *
 * @param userId - User ID
 * @param resourceUserId - Resource owner ID
 * @returns True if user has access
 */
export function hasAccess(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}

/**
 * Build WHERE clause with user access control
 *
 * @param userId - Current user ID
 * @param additionalWhere - Additional where conditions
 * @returns WHERE clause with access control
 *
 * @example
 * const where = buildAccessControlWhere(userId, { status: 'active' });
 * const bookings = await prisma.booking.findMany({ where });
 */
export function buildAccessControlWhere(
  userId: string,
  additionalWhere?: Record<string, any>
): Record<string, any> {
  return {
    userId,
    ...additionalWhere,
  };
}

// ==========================================
// SENSITIVE DATA HANDLING
// ==========================================

/**
 * Fields that should never be returned to client
 */
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'resetToken',
  'verificationToken',
  'apiKey',
  'apiSecret',
];

/**
 * Remove sensitive fields from object
 *
 * @param data - Data object
 * @returns Data without sensitive fields
 */
export function removeSensitiveFields<T extends Record<string, any>>(
  data: T
): Omit<T, typeof SENSITIVE_FIELDS[number]> {
  const result = { ...data };

  SENSITIVE_FIELDS.forEach((field) => {
    delete result[field];
  });

  return result as Omit<T, typeof SENSITIVE_FIELDS[number]>;
}

/**
 * Prisma select object that excludes sensitive fields
 */
export const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  // Explicitly exclude sensitive fields
  password: false,
  emailVerified: true,
  lastLoginAt: true,
};

// ==========================================
// QUERY PERFORMANCE & SECURITY
// ==========================================

/**
 * Maximum number of items that can be fetched at once
 */
export const MAX_QUERY_LIMIT = 1000;

/**
 * Validate and constrain query limit
 *
 * @param limit - Requested limit
 * @returns Safe limit
 */
export function validateQueryLimit(limit: number): number {
  return Math.max(1, Math.min(limit, MAX_QUERY_LIMIT));
}

/**
 * Check if query is too complex (prevent DoS)
 *
 * @param whereClause - Prisma where clause
 * @returns True if query is safe
 */
export function isQuerySafe(whereClause: any): boolean {
  // Check nesting depth
  const depth = getObjectDepth(whereClause);
  if (depth > 5) {
    console.warn('Query too complex: excessive nesting');
    return false;
  }

  // Check number of OR conditions
  if (whereClause.OR && whereClause.OR.length > 20) {
    console.warn('Query too complex: too many OR conditions');
    return false;
  }

  return true;
}

/**
 * Get object nesting depth
 */
function getObjectDepth(obj: any, currentDepth = 0): number {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth;
  }

  const depths = Object.values(obj).map((value) =>
    getObjectDepth(value, currentDepth + 1)
  );

  return Math.max(currentDepth, ...depths);
}

// ==========================================
// AUDIT LOGGING
// ==========================================

/**
 * Log sensitive database operations
 *
 * @param operation - Operation type
 * @param userId - User performing operation
 * @param resourceType - Type of resource
 * @param resourceId - Resource ID
 */
export async function logDatabaseOperation(
  prisma: any,
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        operation,
        userId,
        resourceType,
        resourceId,
        timestamp: new Date(),
        ipAddress: '', // Add from request context
      },
    });
  } catch (error) {
    console.error('Failed to log database operation:', error);
    // Don't throw - logging failure shouldn't break the operation
  }
}

// ==========================================
// DATABASE CONNECTION SECURITY
// ==========================================

/**
 * Validate database connection string
 *
 * @param connectionString - Database connection string
 * @returns True if valid
 */
export function validateConnectionString(connectionString: string): boolean {
  try {
    const url = new URL(connectionString);

    // Must use SSL in production
    if (process.env.NODE_ENV === 'production' && !url.searchParams.get('sslmode')) {
      console.error('Database connection must use SSL in production');
      return false;
    }

    return true;
  } catch {
    console.error('Invalid database connection string');
    return false;
  }
}

// ==========================================
// EXPORTS
// ==========================================

export const databaseSecurity = {
  // SQL injection prevention
  sanitizeSQLInput,
  buildSafeLikePattern,

  // Safe query builders
  buildSafeSearchWhere,
  buildSafePagination,
  buildSafeOrderBy,

  // Transactions
  safeTransaction,

  // Access control
  hasAccess,
  buildAccessControlWhere,

  // Sensitive data
  removeSensitiveFields,
  SAFE_USER_SELECT,

  // Query safety
  validateQueryLimit,
  isQuerySafe,

  // Audit logging
  logDatabaseOperation,

  // Connection security
  validateConnectionString,
};

export default databaseSecurity;

// ==========================================
// SECURITY BEST PRACTICES
// ==========================================

/**
 * DATABASE SECURITY CHECKLIST:
 *
 * 1. ALWAYS use parameterized queries (Prisma does this by default)
 * 2. NEVER concatenate user input directly into SQL
 * 3. Use Prisma's type-safe query builders
 * 4. Implement row-level security (check userId)
 * 5. Limit query results (pagination, max limits)
 * 6. Remove sensitive fields from responses
 * 7. Use transactions for multi-step operations
 * 8. Enable SSL for database connections
 * 9. Use read replicas for read-heavy operations
 * 10. Implement audit logging for sensitive operations
 * 11. Regular security audits of database queries
 * 12. Monitor for suspicious query patterns
 */
