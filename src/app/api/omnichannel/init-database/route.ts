import { NextRequest, NextResponse } from 'next/server';
import OmnichannelDatabaseInit from '@/lib/omnichannel-database-init';

/**
 * Initialize Omnichannel Database
 * POST /api/omnichannel/init-database
 * 
 * Creates all required database tables for the Communication Center
 * This is a one-time setup endpoint that should be called during deployment
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting omnichannel database initialization via API...');
    
    // Check if tables already exist first
    const verification = await OmnichannelDatabaseInit.verifyTables();
    
    if (verification.success && verification.missing.length === 0) {
      console.log('✅ All omnichannel tables already exist');
      
      const stats = await OmnichannelDatabaseInit.getTableStats();
      
      return NextResponse.json({
        success: true,
        message: 'Omnichannel database already initialized',
        alreadyExists: true,
        verification,
        stats
      });
    }

    // Initialize the database
    await OmnichannelDatabaseInit.initializeAll();
    
    // Verify the creation
    const postVerification = await OmnichannelDatabaseInit.verifyTables();
    const stats = await OmnichannelDatabaseInit.getTableStats();

    console.log('🎉 Omnichannel database initialization completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Omnichannel database initialized successfully',
      verification: postVerification,
      stats
    });

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { 
      status: 500 
    });
  }
}

/**
 * Get database status
 * GET /api/omnichannel/init-database
 */
export async function GET(request: NextRequest) {
  try {
    const verification = await OmnichannelDatabaseInit.verifyTables();
    const stats = await OmnichannelDatabaseInit.getTableStats();

    return NextResponse.json({
      success: true,
      verification,
      stats,
      isInitialized: verification.success && verification.missing.length === 0
    });

  } catch (error) {
    console.error('Error checking database status:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isInitialized: false
    }, { 
      status: 500 
    });
  }
}