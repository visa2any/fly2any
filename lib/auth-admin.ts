/**
 * Admin authentication utilities
 * Handles admin-only Google OAuth validation
 */
import { prisma } from './prisma'

/**
 * Check if user can sign in via Google for admin
 * Only allows existing users, blocks auto-signup
 */
export async function validateAdminGoogleAuth(email: string): Promise<boolean> {
  if (!email) return false

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })

    // Only allow if user exists
    if (!user) {
      console.warn(`[Admin Auth] Google sign-in attempt for non-existent user: ${email}`)
      return false
    }

    return true
  } catch (error) {
    console.error('[Admin Auth] Error validating user:', error)
    return false
  }
}

/**
 * Store admin-only auth context in session
 */
export function isAdminAuthContext(callbackUrl?: string): boolean {
  if (!callbackUrl) return false
  return callbackUrl.includes('/admin') || callbackUrl.includes('admin-signin')
}
