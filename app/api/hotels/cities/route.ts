import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Please provide at least 2 characters to search' },
        { status: 400 }
      );
    }

    const results = await liteAPI.searchCities(query);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('City search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search cities' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
