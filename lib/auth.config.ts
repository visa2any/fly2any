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

// Lazy import bcryptjs to avoid bundling in edge runtime
// This is only evaluated when Credentials provider is used
const getBcrypt = async () => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default;
};

export const authConfig = {
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

        const user = await prisma.user.findUnique({
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
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create user preferences for new users
            await prisma.user.create({
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
          }
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }
      return true;
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

        // Update last login
        if (prisma) {
          try {
            await prisma.user.update({
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
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
