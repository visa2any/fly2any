import { NextRequest, NextResponse } from 'next/server';
import { campaignManager } from '@/lib/email/campaign-manager';

export async function GET(
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

    console.log(`📊 Fetching analytics for campaign: ${campaignId}`);

    // Get campaign analytics
    const metrics = await campaignManager.getCampaignAnalytics(campaignId);

    // Calculate additional metrics
    const deliveryRate = metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0;
    const clickThroughRate = metrics.delivered > 0 ? (metrics.clicked / metrics.delivered) * 100 : 0;

    const analyticsData = {
      ...metrics,
      deliveryRate: parseFloat(deliveryRate.toFixed(2)),
      clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
      
      // Performance indicators
      performance: {
        openRateGrade: getPerformanceGrade(metrics.openRate),
        clickRateGrade: getPerformanceGrade(metrics.clickRate),
        bounceRateGrade: getPerformanceGrade(100 - metrics.bounceRate), // Invert for grading
        overallGrade: getOverallGrade(metrics)
      },
      
      // Engagement timeline (mock data - would be real data in production)
      timeline: generateEngagementTimeline(campaignId),
      
      // Device and client breakdown (mock data)
      deviceBreakdown: {
        mobile: 65,
        desktop: 28,
        tablet: 7
      },
      
      clientBreakdown: {
        gmail: 45,
        outlook: 25,
        apple_mail: 15,
        yahoo: 10,
        other: 5
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to fetch campaign analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getPerformanceGrade(rate: number): string {
  if (rate >= 25) return 'Excellent';
  if (rate >= 20) return 'Good';
  if (rate >= 15) return 'Average';
  if (rate >= 10) return 'Below Average';
  return 'Poor';
}

function getOverallGrade(metrics: any): string {
  const avgScore = (
    (metrics.openRate >= 20 ? 1 : 0) +
    (metrics.clickRate >= 3 ? 1 : 0) +
    (metrics.bounceRate <= 5 ? 1 : 0) +
    (metrics.unsubscribeRate <= 2 ? 1 : 0)
  );
  
  if (avgScore >= 3) return 'Excellent';
  if (avgScore >= 2) return 'Good';
  if (avgScore >= 1) return 'Average';
  return 'Needs Improvement';
}

function generateEngagementTimeline(campaignId: string) {
  // Mock data - in production this would come from the database
  return [
    { time: '0h', opens: 0, clicks: 0 },
    { time: '1h', opens: 120, clicks: 8 },
    { time: '2h', opens: 280, clicks: 22 },
    { time: '6h', opens: 450, clicks: 45 },
    { time: '12h', opens: 650, clicks: 72 },
    { time: '24h', opens: 850, clicks: 95 },
    { time: '48h', opens: 920, clicks: 108 },
    { time: '72h', opens: 945, clicks: 115 }
  ];
}