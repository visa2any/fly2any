/**
 * Node.js runtime auth configuration
 *
 * WARNING: This file is NOT edge-compatible
 * - Uses Prisma for database access
 * - Uses bcryptjs for password hashing (Node.js only)
 * - ONLY use in Node.js runtime (API routes, server components)
 * - DO NOT import in middleware.ts or edge runtime files
 */
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { validateAdminGoogleAuth, isAdminAuthContext } from './auth-admin';

// Lazy import bcryptjs to avoid bundling in edge runtime
// This is only evaluated when Credentials provider is used
const getBcrypt = async () => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default;
};

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      // Security fix: Disallow dangerous email account linking to prevent account takeover
      // Instead, handle OAuthAccountNotLinked error with proper user messaging
      allowDangerousEmailAccountLinking: false,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        if (!prisma) {
          throw new Error('Database not configured');
        }

        const user = await prisma!.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        // Dynamically import bcryptjs (Node.js only)
        const bcrypt = await getBcrypt();
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/account',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (!prisma) {
          console.error('Database not configured');
          return false;
        }

        try {
          const existingUser = await prisma!.user.findUnique({
            where: { email: user.email! },
            include: { accounts: true },
          });

          if (existingUser) {
            // Check if Google account is already linked
            const hasGoogleAccount = existingUser.accounts?.some(
              (acc: { provider: string }) => acc.provider === 'google'
            );

            if (!hasGoogleAccount) {
              // AUTO-LINK: Link Google account to existing user (FIX for OAuthAccountNotLinked)
              await prisma!.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
              console.log(`✅ Auto-linked Google account to existing user: ${user.email}`);
            }
            // Update user.id to match existing user for proper session
            user.id = existingUser.id;
          } else {
            // Create new user with preferences
            const newUser = await prisma!.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                preferences: {
                  create: {},
                },
              },
            });
            user.id = newUser.id;
          }
        } catch (error) {
          console.error('Error in Google signIn:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile, isNewUser, trigger }) {
      // Mark if this is an admin auth attempt
      if (account?.provider === 'google') {
        token.adminAuth = true;
      }
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Check if this is an admin-only auth request that failed
      if (url.includes('/auth/admin-signin') && url.includes('error=')) {
        return `${baseUrl}/auth/admin-signin`;
      }

      // POPUP MODE: Redirect to popup callback page for seamless auth
      if (url.includes('popup=true') || url.includes('/auth/popup-callback')) {
        return `${baseUrl}/auth/popup-callback`;
      }

      // Allow any valid URL for redirects (including /admin with callbackUrl)
      // If url starts with baseUrl, allow it
      if (url.startsWith(baseUrl)) return url;
      // If url is relative (starts with /), prepend baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Default to baseUrl
      return baseUrl;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;

        // Update last login
        if (prisma) {
          try {
            // Use updateMany to avoid throwing errors if user doesn't exist
            await prisma!.user.updateMany({
              where: { id: token.sub! },
              data: { lastLoginAt: new Date() },
            });
          } catch (error) {
            console.error('Error updating last login:', error);
          }
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;