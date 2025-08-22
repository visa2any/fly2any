import { NextRequest, NextResponse } from 'next/server';
import { campaignManager } from '@/lib/email/campaign-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Launching campaign: ${campaignId}`);

    // Launch the campaign
    const result = await campaignManager.launchCampaign(campaignId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          campaignId,
          status: 'running',
          launchedAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Failed to launch campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to launch campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}