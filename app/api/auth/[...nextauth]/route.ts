/**
 * NextAuth API route handler
 *
 * Uses Node.js runtime for Prisma adapter and bcryptjs support
 */
import { GET, POST } from '@/lib/auth';

// Force Node.js runtime (required for Prisma and bcryptjs)
export const runtime = 'nodejs';

export { GET, POST };
