
import { NextRequest, NextResponse } from 'next/server';
import { autoInitializeAdmin } from '@/lib/admin/auto-init';
import { isPrismaAvailable } from '@/lib/prisma';

/**
 * Emergency Admin Setup Route
 * 
 * Allows triggering admin auto-initialization explicitly.
 * In production, this should be guarded by a secret key if possible,
 * but autoInitializeAdmin already has its own safety checks.
 */
export async function GET(request: NextRequest) {
  // Simple security: check for a setup key if provided in env
  const setupKey = request.nextUrl.searchParams.get('key');
  const internalSecret = process.env.NEXTAUTH_SECRET;
  
  // Basic protection: must provide first 8 chars of NEXTAUTH_SECRET as key to trigger in non-dev
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && setupKey !== internalSecret?.substring(0, 8)) {
    return NextResponse.json(
      { error: 'Unauthorized handle setup' },
      { status: 401 }
    );
  }

  if (!isPrismaAvailable()) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 500 }
    );
  }

  try {
    const result = await autoInitializeAdmin();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}
