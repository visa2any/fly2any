import { NextRequest, NextResponse } from 'next/server'

// Active RSS Ping Services for 2025 (verified working)
const PING_SERVICES = [
  // Core Services (High Priority)
  'http://rpc.pingomatic.com/',
  'http://ping.feedburner.com',
  'http://rpc.weblogs.com/RPC2',
  
  // Search Engine Services
  'http://blogsearch.google.com/ping/RPC2',
  'http://blogsearch.google.ca/ping/RPC2',
  'http://blogsearch.google.co.uk/ping/RPC2',
  'https://ping.blogs.yandex.ru/RPC2',
  
  // Blog Services
  'http://api.my.yahoo.com/rss/ping',
  'http://blog.goo.ne.jp/XMLRPC',
  'http://rpc.technorati.com/rpc/ping',
  'http://ping.blo.gs/',
  'http://services.newsgator.com/ngws/xmlrpcping.aspx',
  
  // Additional Services
  'http://xmlrpc.blogg.de/ping/',
  'http://1470.net/api/ping',
  'http://ping.syndic8.com/xmlrpc.php',
  'http://ping.blogmura.jp/rpc/',
  'http://rpc.blogrolling.com/pinger/',
  
  // Travel-specific and Directory Services
  'http://www.blogdigger.com/RPC2',
  'http://www.blogsnow.com/ping',
  'http://ping.cocolog-nifty.com/xmlrpc',
  'http://ping.rootblog.com/rpc.php',
  'http://rpc.blogbuzzmachine.com/RPC2'
];

interface PingResult {
  service: string;
  success: boolean;
  error?: string;
  responseTime?: number;
}

async function pingService(serviceUrl: string, feedUrl: string, siteName: string, siteUrl: string): Promise<PingResult> {
  const startTime = Date.now();
  
  try {
    const xmlRpcPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param>
      <value><string>${siteName}</string></value>
    </param>
    <param>
      <value><string>${siteUrl}</string></value>
    </param>
    <param>
      <value><string>${feedUrl}</string></value>
    </param>
  </params>
</methodCall>`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'User-Agent': 'Fly2Any RSS Ping Bot/1.0'
      },
      body: xmlRpcPayload,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return { service: serviceUrl, success: true, responseTime };
    } else {
      return { service: serviceUrl, success: false, error: `HTTP ${response.status}`, responseTime };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return { 
      service: serviceUrl, 
      success: false, 
      error: error.name === 'AbortError' ? 'Timeout' : error.message,
      responseTime 
    };
  }
}

async function pingAllServices(feedUrl: string, siteName: string, siteUrl: string): Promise<PingResult[]> {
  // Ping services in batches to avoid overwhelming servers
  const batchSize = 5;
  const results: PingResult[] = [];
  
  for (let i = 0; i < PING_SERVICES.length; i += batchSize) {
    const batch = PING_SERVICES.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(service => pingService(service, feedUrl, siteName, siteUrl))
    );
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < PING_SERVICES.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { feedType = 'main', manual = false } = await request.json();
    
    const baseUrl = 'https://fly2any.com';
    const feedUrls = {
      main: `${baseUrl}/feed.xml`,
      blog: `${baseUrl}/feeds/blog`,
      deals: `${baseUrl}/feeds/deals`
    };
    
    const siteNames = {
      main: 'Fly2Any - Viagens Brasil-EUA',
      blog: 'Blog Fly2Any - Guias de Viagem',
      deals: 'Fly2Any Ofertas - Promoções de Passagens'
    };
    
    const feedUrl = feedUrls[feedType as keyof typeof feedUrls] || feedUrls.main;
    const siteName = siteNames[feedType as keyof typeof siteNames] || siteNames.main;
    
    console.log(`🚀 RSS Ping started for ${feedType} feed: ${feedUrl}`);
    
    const results = await pingAllServices(feedUrl, siteName, baseUrl);
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const averageResponseTime = results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.filter(r => r.responseTime).length;

    const report = {
      feedType,
      feedUrl,
      siteName,
      timestamp: new Date().toISOString(),
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
        successRate: `${((successCount / totalCount) * 100).toFixed(1)}%`,
        averageResponseTime: `${Math.round(averageResponseTime)}ms`
      },
      results: results.map(r => ({
        service: r.service,
        status: r.success ? '✅ Success' : '❌ Failed',
        error: r.error || null,
        responseTime: r.responseTime ? `${r.responseTime}ms` : null
      }))
    };

    console.log(`✅ RSS Ping completed: ${successCount}/${totalCount} services notified successfully`);

    return NextResponse.json(report, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error: any) {
    console.error('❌ RSS Ping error:', error);
    
    return NextResponse.json({
      error: 'RSS ping failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const feedType = searchParams.get('feedType') || 'main';
  
  try {
    const results = await pingAllServices(
      `https://fly2any.com/feed.xml`,
      'Fly2Any - Viagens Brasil-EUA',
      'https://fly2any.com'
    );
    
    return NextResponse.json({
      message: 'RSS ping test completed',
      feedType,
      services: PING_SERVICES.length,
      results: results.slice(0, 5) // Show first 5 results for GET request
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'RSS ping test failed',
      message: error.message
    }, { status: 500 });
  }
}