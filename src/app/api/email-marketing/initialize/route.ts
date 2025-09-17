import { NextRequest, NextResponse } from 'next/server';
import { initializeEmailMarketingDatabase } from '@/lib/email-marketing/init-database';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting Email Marketing Database initialization...');

    const result = await initializeEmailMarketingDatabase();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ Email Marketing Database initialized successfully! Ready for production.',
        features: [
          '📧 Campaign Management',
          '👥 Contact Segmentation',
          '🎨 Email Templates',
          '🤖 Automation Workflows',
          '📊 Analytics & Tracking',
          '🔄 Redis Email Queue',
          '📝 Rich Content Editor',
          '🎯 A/B Testing',
          '📈 Deliverability Tools'
        ]
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to initialize the Email Marketing Database',
    features: [
      'Email Campaigns',
      'Contact Management',
      'Email Templates',
      'Automation Workflows',
      'Analytics Dashboard',
      'A/B Testing',
      'Segmentation Engine'
    ]
  });
}