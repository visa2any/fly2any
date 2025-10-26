import { NextResponse } from 'next/server';
import { initDatabase, checkDatabase } from '@/lib/db/init';

export const dynamic = 'force-dynamic';

/**
 * Initialize database schema
 * This endpoint should be protected in production
 */
export async function POST() {
  try {
    await initDatabase();
    const status = await checkDatabase();

    return NextResponse.json({
      message: 'Database initialized successfully',
      tables: status.tables,
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

/**
 * Check database status
 */
export async function GET() {
  try {
    const status = await checkDatabase();

    return NextResponse.json({
      success: true,
      tables: status.tables,
    });
  } catch (error: any) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check database' },
      { status: 500 }
    );
  }
}
