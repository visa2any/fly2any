// Force NextAuth API routes to use Node.js runtime to avoid Edge Runtime crypto issues  
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Additional config to prevent worker issues
export const maxDuration = 30
export const fetchCache = 'force-no-store'

import { NextRequest } from 'next/server';

// Lazy load handlers to prevent build-time execution
export async function GET(request: NextRequest) {
  // Prevent execution during build time
  if (typeof process === 'undefined' || process.env.NODE_ENV === undefined) {
    return new Response('Build time execution prevented', { status: 503 });
  }
  
  const { handlers } = await import("@/auth");
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  // Prevent execution during build time
  if (typeof process === 'undefined' || process.env.NODE_ENV === undefined) {
    return new Response('Build time execution prevented', { status: 503 });
  }
  
  const { handlers } = await import("@/auth");
  return handlers.POST(request);
}