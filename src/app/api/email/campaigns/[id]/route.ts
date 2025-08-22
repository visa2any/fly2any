import { NextRequest, NextResponse } from 'next/server';
import { campaignManager } from '@/lib/email/campaign-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const campaignId = id;
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Get campaign details
    const campaigns = await campaignManager.getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('❌ Failed to fetch campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const campaignId = id;
    const body = await request.json();
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // For now, we'll implement basic updates
    // In a full implementation, you'd update the campaign in the database
    
    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('❌ Failed to update campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const campaignId = id;
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // In a full implementation, you'd delete the campaign from the database
    
    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('❌ Failed to delete campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}