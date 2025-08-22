import { NextRequest, NextResponse } from 'next/server';
import { campaignManager, Campaign, CampaignType, CampaignStatus } from '@/lib/email/campaign-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as CampaignStatus | null;
    const type = searchParams.get('type') as CampaignType | null;
    const createdBy = searchParams.get('createdBy') || undefined;

    const campaigns = await campaignManager.getCampaigns({
      status: status || undefined,
      type: type || undefined,
      createdBy
    });

    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    console.error('❌ Failed to fetch campaigns:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaigns',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      templates,
      audience,
      schedule,
      automation,
      abTest,
      startDate,
      endDate,
      createdBy
    } = body;

    // Validate required fields
    if (!name || !type || !templates || !audience || !schedule) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['name', 'type', 'templates', 'audience', 'schedule']
        },
        { status: 400 }
      );
    }

    const campaign = await campaignManager.createCampaign({
      name,
      type,
      status: 'draft',
      templates,
      audience,
      schedule,
      automation,
      abTest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: createdBy || 'anonymous'
    });

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('❌ Failed to create campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}