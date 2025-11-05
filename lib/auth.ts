/**
 * Node.js runtime NextAuth instance
 *
 * CRITICAL: This file uses Prisma and is NOT edge-compatible
 * - Uses PrismaAdapter for database operations (if DATABASE_URL is configured)
 * - Includes Credentials provider with bcryptjs
 * - Database callbacks for user creation and last login tracking
 *
 * Usage:
 * - API routes: Import and use (will run in Node.js runtime)
 * - Server components: Import and use with 'nodejs' runtime export
 * - Edge runtime/middleware: DO NOT import (use lib/auth-edge.ts instead)
 */
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma, isPrismaAvailable } from './db/prisma';
import { authConfig } from './auth.config';

// Only use PrismaAdapter if DATABASE_URL is configured
const authOptions = isPrismaAvailable() && prisma
  ? {
      adapter: PrismaAdapter(prisma),
      ...authConfig,
    }
  : {
      ...authConfig,
      // No adapter - auth will work but won't persist to database
    };

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
