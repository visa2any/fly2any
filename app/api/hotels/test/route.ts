import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

/**
 * Hotel API Diagnostic Endpoint
 *
 * GET /api/hotels/test
 *
 * This endpoint tests the LiteAPI connection and credentials
 * Use this to diagnose production issues
 */
export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  try {
    // Check if API keys are set
    const hasPublicKey = !!process.env.LITEAPI_SANDBOX_PUBLIC_KEY;
    const hasPrivateKey = !!process.env.LITEAPI_SANDBOX_PRIVATE_KEY;
    const hasProductionKey = !!process.env.LITEAPI_PUBLIC_KEY;

    diagnostics.credentials = {
      sandboxPublicKey: hasPublicKey ? 'SET' : 'MISSING',
      sandboxPublicKeyLength: process.env.LITEAPI_SANDBOX_PUBLIC_KEY?.length || 0,
      sandboxPublicKeyFirst10: process.env.LITEAPI_SANDBOX_PUBLIC_KEY?.substring(0, 10) || 'N/A',
      sandboxPrivateKey: hasPrivateKey ? 'SET' : 'MISSING',
      sandboxPrivateKeyLength: process.env.LITEAPI_SANDBOX_PRIVATE_KEY?.length || 0,
      sandboxPrivateKeyFirst10: process.env.LITEAPI_SANDBOX_PRIVATE_KEY?.substring(0, 10) || 'N/A',
      productionKey: hasProductionKey ? 'SET' : 'MISSING',
    };

    // Check for malformed values
    const publicKey = process.env.LITEAPI_SANDBOX_PUBLIC_KEY || '';
    const privateKey = process.env.LITEAPI_SANDBOX_PRIVATE_KEY || '';

    diagnostics.validation = {
      publicKeyHasQuotes: publicKey.includes('"'),
      publicKeyHasLineBreaks: publicKey.includes('\\r') || publicKey.includes('\\n'),
      privateKeyHasQuotes: privateKey.includes('"'),
      privateKeyHasLineBreaks: privateKey.includes('\\r') || privateKey.includes('\\n'),
    };

    // Test API connection
    diagnostics.apiTest = {
      status: 'testing',
      message: 'Attempting to fetch hotel list...',
    };

    try {
      const testResult = await liteAPI.getHotelsByLocation({
        latitude: 40.7128,
        longitude: -74.0060,
        limit: 5,
      });

      diagnostics.apiTest = {
        status: 'SUCCESS',
        hotelCount: testResult.hotelIds.length,
        message: `Successfully fetched ${testResult.hotelIds.length} hotels`,
      };
    } catch (apiError: any) {
      diagnostics.apiTest = {
        status: 'FAILED',
        error: apiError.message,
        code: apiError.code,
        response: apiError.response?.data,
        statusCode: apiError.response?.status,
      };
    }

    // Overall status
    const hasIssues =
      !hasPublicKey ||
      !hasPrivateKey ||
      diagnostics.validation.publicKeyHasQuotes ||
      diagnostics.validation.publicKeyHasLineBreaks ||
      diagnostics.validation.privateKeyHasQuotes ||
      diagnostics.validation.privateKeyHasLineBreaks ||
      diagnostics.apiTest.status === 'FAILED';

    diagnostics.overall = {
      status: hasIssues ? 'ISSUES_DETECTED' : 'OK',
      message: hasIssues
        ? 'Environment variable issues detected. See details below.'
        : 'All checks passed. LiteAPI is working correctly.',
    };

    return NextResponse.json({
      success: !hasIssues,
      diagnostics,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (error: any) {
    console.error('❌ Diagnostic test error:', error);

    return NextResponse.json({
      success: false,
      diagnostics: {
        ...diagnostics,
        error: {
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      },
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}
