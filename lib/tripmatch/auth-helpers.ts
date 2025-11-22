/**
 * TripMatch Authentication Helpers
 *
 * Helper functions for authentication in API routes
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Get authenticated user from request
 *
 * @returns User ID if authenticated, null otherwise
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get authenticated user or throw error
 *
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  return userId !== null;
}

/**
 * Get session object
 */
export async function getSession() {
  return await auth();
}
