import { NextRequest, NextResponse } from 'next/server'

// This endpoint will be called by external cron services (like Vercel Cron, cron-job.org, etc.)
// Or can be triggered manually for immediate RSS ping notifications

export async function POST(request: NextRequest) {
  const { authorization } = Object.fromEntries(request.headers.entries());
  
  // Basic security check (in production, use environment variable)
  const expectedAuth = process.env.CRON_SECRET || 'fly2any-rss-cron-2025';
  if (authorization !== `Bearer ${expectedAuth}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fly2any.com';
    
    // Ping all feed types
    const feedTypes = ['main', 'blog', 'deals'];
    const pingResults = [];

    for (const feedType of feedTypes) {
      try {
        const pingResponse = await fetch(`${baseUrl}/api/rss/ping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedType, manual: false })
        });

        if (pingResponse.ok) {
          const result = await pingResponse.json();
          pingResults.push({
            feedType,
            status: 'success',
            summary: result.summary
          });
        } else {
          pingResults.push({
            feedType,
            status: 'error',
            error: `HTTP ${pingResponse.status}`
          });
        }
      } catch (error: any) {
        pingResults.push({
          feedType,
          status: 'error',
          error: error.message
        });
      }

      // Small delay between feed types
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const successfulPings = pingResults.filter(r => r.status === 'success').length;
    const totalFeeds = pingResults.length;

    console.log(`🔄 Automated RSS Ping completed: ${successfulPings}/${totalFeeds} feeds processed`);

    return NextResponse.json({
      message: 'Automated RSS ping completed',
      timestamp: new Date().toISOString(),
      summary: {
        totalFeeds,
        successfulFeeds: successfulPings,
        failedFeeds: totalFeeds - successfulPings,
        successRate: `${((successfulPings / totalFeeds) * 100).toFixed(1)}%`
      },
      results: pingResults
    });

  } catch (error: any) {
    console.error('❌ Automated RSS Ping failed:', error);
    
    return NextResponse.json({
      error: 'Automated RSS ping failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for manual testing and status check
  return NextResponse.json({
    service: 'RSS Ping Automation',
    status: 'active',
    description: 'Automated RSS ping service for fly2any.com feeds',
    feeds: [
      'https://fly2any.com/feed.xml',
      'https://fly2any.com/feeds/blog', 
      'https://fly2any.com/feeds/deals'
    ],
    usage: {
      method: 'POST',
      authentication: 'Bearer token required',
      frequency: 'Recommended: 4-6 times daily for optimal indexing'
    },
    lastRun: 'Use POST method to execute ping'
  });
}