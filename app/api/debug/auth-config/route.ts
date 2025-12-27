/**
 * Auth Configuration Debug Endpoint
 * Shows what auth providers are configured (without exposing secrets)
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    auth: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? '✓ SET' : '✗ MISSING',
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID ? '✓ SET' : '✗ MISSING',
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✓ SET' : '✗ MISSING',
    },
    expectedCallbackUrl: 'https://www.fly2any.com/api/auth/callback/google',
    note: 'Add this URL to Google Cloud Console → Credentials → OAuth 2.0 → Authorized redirect URIs'
  });
}
