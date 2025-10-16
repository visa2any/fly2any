import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 2) {
      return NextResponse.json(
        { error: 'Please provide at least 2 characters to search' },
        { status: 400 }
      );
    }

    const results = await amadeusAPI.searchAirports(keyword);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Airport search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search airports' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
