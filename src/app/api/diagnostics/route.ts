import { NextRequest, NextResponse } from 'next/server';
import { DiagnosticReport } from '@/lib/nextjs-diagnostics';

// POST handler for receiving diagnostic reports
export async function POST(request: NextRequest) {
  try {
    const report: DiagnosticReport = await request.json();
    
    // Log the diagnostic report
    console.group('📋 Next.js Diagnostic Report Received');
    console.log('Timestamp:', report.timestamp);
    console.log('Environment:', report.environment);
    console.log('Next.js Version:', report.nextjsVersion);
    console.log('React Version:', report.reactVersion);
    console.log('Errors:', report.errors.length);
    console.log('Warnings:', report.warnings.length);
    
    if (report.errors.length > 0) {
      console.log('🚨 Errors:');
      report.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type.toUpperCase()}] ${error.message}`);
        if (error.context) {
          console.log('   Context:', error.context);
        }
      });
    }
    
    if (report.warnings.length > 0) {
      console.log('⚠️ Warnings:');
      report.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.type}] ${warning.message}`);
      });
    }
    
    console.log('Performance:', report.performance);
    console.log('Webpack Info:', report.webpackInfo);
    console.log('Hydration Info:', report.hydrationInfo);
    console.groupEnd();
    
    // In a real production environment, you would:
    // 1. Store this data in a database
    // 2. Send alerts for critical errors
    // 3. Generate dashboards and metrics
    // 4. Integrate with monitoring services like Sentry, DataDog, etc.
    
    // For now, we'll just acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Diagnostic report received',
      reportId: `report-${Date.now()}`,
      processed: {
        errors: report.errors.length,
        warnings: report.warnings.length,
        severity: report.errors.some(e => e.severity === 'critical') ? 'critical' : 
                 report.errors.some(e => e.severity === 'high') ? 'high' : 'low'
      }
    });
    
  } catch (error) {
    console.error('Failed to process diagnostic report:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process diagnostic report',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// GET handler for retrieving diagnostic information
export async function GET() {
  return NextResponse.json({
    service: 'Next.js Diagnostics API',
    version: '1.0.0',
    endpoints: {
      POST: 'Submit diagnostic reports',
      GET: 'Service information'
    },
    timestamp: new Date().toISOString()
  });
}