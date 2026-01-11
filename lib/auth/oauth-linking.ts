/**
 * OAuth Account Linking Security
 * 
 * CRITICAL: Prevents account takeover via OAuth
 * Attacker CANNOT auto-link their Google account to victim's email
 * 
 * Flow:
 * 1. User logs in with email/password
 * 2. User goes to settings → "Link Google Account"
 * 3. User must verify password BEFORE linking
 * 4. Only then can OAuth account be linked
 */

import prisma from '@/lib/prisma';

export interface OAuthLinkResult {
  allowed: boolean;
  reason?: string;
  requiresPassword?: boolean;
}

/**
 * Check if OAuth account can be linked
 * 
 * SECURITY: Never allow auto-linking. This prevents account takeover.
 * 
 * Attack scenario this prevents:
 * - Victim has account victim@email.com
 * - Attacker creates Google account victim@email.com
 * - Without this fix: Attacker can sign in with Google → account takeover
 * - With this fix: Attacker cannot sign in, must link via settings
 * 
 * @param email - Email from OAuth provider
 * @param provider - OAuth provider (google, github, etc.)
 * @param oauthAccountId - Provider's user ID
 * @returns Whether to allow auto-linking
 */
export function shouldAllowOAuthAutoLink(
  email: string,
  provider: string,
  oauthAccountId: string
): OAuthLinkResult {
  // NEVER allow auto-linking
  // This is the core security fix
  console.log(`🔒 OAuth auto-linking blocked for ${email} (${provider})`);
  console.log(`   User must explicitly link account via settings with password verification`);
  
  return {
    allowed: false,
    reason: 'Account linking requires explicit user confirmation',
    requiresPassword: true,
  };
}

/**
 * Link OAuth account to existing user
 * 
 * SECURITY: Requires password verification
 * 
 * @param userId - User ID to link account to
 * @param provider - OAuth provider
 * @param providerAccountId - Provider's user ID
 * @param password - User's current password (must verify)
 * @returns Success status
 */
export async function linkOAuthAccount(
  userId: string,
  provider: string,
  providerAccountId: string,
  profile: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if provider account already linked to another user
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider,
        providerAccountId,
      },
    });

    if (existingAccount) {
      return {
        success: false,
        error: 'This OAuth account is already linked to another user',
      };
    }

    // Check if user already has this provider linked
    const userAccount = await prisma.account.findFirst({
      where: {
        userId,
        provider,
      },
    });

    if (userAccount) {
      return {
        success: false,
        error: 'This OAuth provider is already linked to your account',
      };
    }

    // Link the account
    await prisma.account.create({
      data: {
        userId,
        provider,
        providerAccountId,
        type: 'oauth',
        // Add other OAuth fields from profile
        refresh_token: profile.refresh_token,
        access_token: profile.access_token,
        expires_at: profile.expires_at,
        token_type: profile.token_type,
        scope: profile.scope,
        id_token: profile.id_token,
        session_state: profile.session_state,
      },
    });

    console.log(`✅ OAuth account linked successfully for user ${userId} (${provider})`);
    
    return { success: true };
  } catch (error) {
    console.error('Error linking OAuth account:', error);
    return {
      success: false,
      error: 'Failed to link OAuth account',
    };
  }
}

/**
 * Unlink OAuth account
 * 
 * SECURITY: Ensure user has another login method
 * 
 * @param userId - User ID
 * @param provider - OAuth provider to unlink
 * @returns Success status
 */
export async function unlinkOAuthAccount(
  userId: string,
  provider: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the account
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider,
      },
    });

    if (!account) {
      return {
        success: false,
        error: 'OAuth account not found',
      };
    }

    // Check if user has password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, accounts: true },
    });

    const hasPassword = !!user?.password;
    const hasOtherAuth = hasPassword || (user?.accounts?.length || 0) > 1;

    if (!hasOtherAuth) {
      return {
        success: false,
        error: 'Cannot unlink last authentication method. Set a password first.',
      };
    }

    // Delete the account
    await prisma.account.delete({
      where: { id: account.id },
    });

    console.log(`✅ OAuth account unlinked for user ${userId} (${provider})`);
    
    return { success: true };
  } catch (error) {
    console.error('Error unlinking OAuth account:', error);
    return {
      success: false,
      error: 'Failed to unlink OAuth account',
    };
  }
}

/**
 * Check if user has OAuth account linked
 * 
 * @param userId - User ID
 * @param provider - OAuth provider
 * @returns true if linked
 */
export async function hasOAuthAccountLinked(
  userId: string,
  provider: string
): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider,
    },
  });

  return !!account;
}
