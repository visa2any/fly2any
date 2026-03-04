/**
 * Node.js runtime auth configuration
 *
 * WARNING: This file is NOT edge-compatible
 * - Uses Prisma for database access
 * - Uses bcryptjs for password hashing (Node.js only)
 * - ONLY use in Node.js runtime (API routes, server components)
 * - DO NOT import in middleware.ts or edge runtime files
 * 
 * SECURITY: Validates environment on import
 */
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';

// CRITICAL: Security validation on module load
import { validateSecurityEnvironment } from './security/startup-validation';
validateSecurityEnvironment();

// Security modules
import { isSessionRevoked } from './auth/session';
import { checkLoginRateLimit, recordFailedLogin, clearLoginAttempts } from './security/rate-limit';

// Lazy import bcryptjs to avoid bundling in edge runtime
// This is only evaluated when Credentials provider is used
const getBcrypt = async () => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default;
};

// DEBUG: Check if env vars are loaded
/*
console.log('--- AUTH CONFIG LOADING ---');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set (Length: ' + process.env.GOOGLE_CLIENT_ID.length + ')' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'NOT SET');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('-------------------------');
*/

export const authConfig = {
  providers: [
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

        const email = (credentials.email as string).toLowerCase();

        // Rate limit check (keyed by email to prevent brute-force per account)
        try {
          const rateCheck = await checkLoginRateLimit(email);
          if (!rateCheck.allowed) {
            throw new Error(`Too many login attempts. Try again in ${Math.ceil((rateCheck.retryAfter || 900) / 60)} minutes`);
          }
        } catch (e: any) {
          // If Redis is down, allow login but log warning
          if (!e.message?.includes('Too many')) {
            console.warn('Rate limit check failed (Redis may be down):', e.message);
          } else {
            throw e;
          }
        }

        const user = await prisma!.user.findUnique({
          where: { email },
        });

        if (!user) {
          await recordFailedLogin(email).catch(() => {});
          throw new Error('User not found');
        }

        if (!user.password) {
          await recordFailedLogin(email).catch(() => {});
          throw new Error('Please sign in with Google');
        }

        // Dynamically import bcryptjs (Node.js only)
        const bcrypt = await getBcrypt();
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          await recordFailedLogin(email).catch(() => {});
          throw new Error('Invalid credentials');
        }

        // Clear rate limit on successful login
        await clearLoginAttempts(email).catch(() => {});

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
    async signIn({ user }) {
      // Track last login
      if (prisma && user?.id) {
        try {
          await prisma.user.updateMany({
            where: { id: user.id as string },
            data: { lastLoginAt: new Date() },
          });
        } catch (e) {
          console.error('Error updating lastLoginAt:', e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      // Check session revocation on every token refresh
      if (token.jti) {
        try {
          const revoked = await isSessionRevoked(token.jti);
          if (revoked) return null as any;
        } catch {
          // Redis unavailable — allow session to continue
        }
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
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
        // lastLoginAt is now updated in signIn callback (not here)
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  // Required for CSRF to work correctly in all environments (local dev, proxies, Vercel)
  trustHost: true,
  // Fix MissingCSRF on HTTP (localhost): __Host- prefix cookies require HTTPS/Secure flag.
  // Explicitly set cookie names without the __Host- prefix so they work on HTTP.
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
    callbackUrl: {
      name: 'authjs.callback-url',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
    csrfToken: {
      name: 'authjs.csrf-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
  },
} satisfies NextAuthConfig;
