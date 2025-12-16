import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json();

    // Log for monitoring (integrate with your preferred service)
    console.log('[Web Vitals]', {
      name: metrics.name,
      value: metrics.value?.toFixed(2),
      rating: metrics.rating,
      url: metrics.url,
      timestamp: new Date().toISOString()
    });

    // Alert on poor metrics
    if (metrics.rating === 'poor') {
      console.warn(`[Web Vitals POOR] ${metrics.name}: ${metrics.value}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
