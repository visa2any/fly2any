import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

/**
 * Edge-compatible auth configuration for middleware
 *
 * IMPORTANT: This configuration is used in Edge Runtime (middleware.ts)
 * - NO Prisma imports (database adapters not supported in edge)
 * - NO bcryptjs imports (Node.js crypto not available in edge)
 * - NO database lookups in callbacks
 * - JWT-only session strategy
 */
export const authEdgeConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
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
    // Edge-safe callbacks - NO database access
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAccountPage = nextUrl.pathname.startsWith('/account');
      const isAuthPage = nextUrl.pathname.startsWith('/auth/signin');

      if (isAccountPage) {
        return isLoggedIn; // Only authenticated users can access account pages
      }

      // Don't handle auth page redirects here - let middleware handle it
      // This allows middleware to properly process callbackUrl parameters
      return true;
    },
    async jwt({ token, user }) {
      // Only store essential data in JWT for edge runtime
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Populate session from JWT (no database lookups)
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.name = token.name;
        session.user.image = token.picture as string | null;
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

export const { auth: authEdge, handlers, signIn, signOut } = NextAuth(authEdgeConfig);
