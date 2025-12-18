/**
 * SEO Content Generator Cron
 * Vercel Cron: runs daily at 2 AM UTC
 *
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/seo-generate",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateCheapFlightsContent,
  validateContent,
  type ContentInput,
} from '@/lib/seo/agent/generator';
import { dispatchAlert } from '@/lib/seo/agent/monitor';

// Destinations and months to generate
const DESTINATIONS = ['paris', 'london', 'tokyo', 'cancun', 'miami', 'dubai'];
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december'];

// Rate limits
const MAX_PAGES_PER_RUN = 10;
const DELAY_BETWEEN_GENERATIONS = 2000; // 2 seconds

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    generated: 0,
    autoPublished: 0,
    needsReview: 0,
    rejected: 0,
    errors: [] as string[],
  };

  try {
    // Get pending pages (in production, query from DB)
    const pendingPages = getPendingPages().slice(0, MAX_PAGES_PER_RUN);

    for (const page of pendingPages) {
      try {
        // Fetch price data (mock - replace with real API)
        const priceData = await fetchPriceData(page.destination, page.month);

        const input: ContentInput = {
          destination: page.destination,
          month: page.month,
          avgPrice: priceData.avgPrice,
          minPrice: priceData.minPrice,
          maxPrice: priceData.maxPrice,
          trend: priceData.trend,
          airlines: priceData.airlines,
          bookingWindow: priceData.bookingWindow,
        };

        // Generate content
        const content = await generateCheapFlightsContent(input);

        // Validate
        const validation = validateContent(content, input);

        // Determine action
        if (validation.score >= 95 && validation.valid) {
          // Auto-publish (in production, save to DB/CMS)
          results.autoPublished++;
          console.log(`[SEO-GEN] Auto-published: /cheap-flights/${page.destination}/${page.month}`);
        } else if (validation.score >= 70) {
          // Queue for review
          results.needsReview++;
          console.log(`[SEO-GEN] Needs review: /cheap-flights/${page.destination}/${page.month}`, validation.issues);
        } else {
          // Reject
          results.rejected++;
          console.log(`[SEO-GEN] Rejected: /cheap-flights/${page.destination}/${page.month}`, validation.issues);
        }

        results.generated++;

        // Rate limit
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_GENERATIONS));

      } catch (error: any) {
        results.errors.push(`${page.destination}/${page.month}: ${error.message}`);
      }
    }

    // Report summary
    if (results.needsReview > 3) {
      await dispatchAlert('medium', `${results.needsReview} pages need human review`, {
        total: results.generated,
        autoPublished: results.autoPublished,
      });
    }

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error: any) {
    await dispatchAlert('high', `Content generation cron failed: ${error.message}`, {
      error: error.stack,
    });

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Mock: Get pending pages to generate
function getPendingPages(): { destination: string; month: string }[] {
  const pages: { destination: string; month: string }[] = [];

  for (const dest of DESTINATIONS) {
    for (const month of MONTHS) {
      pages.push({ destination: dest, month });
    }
  }

  // Shuffle and return
  return pages.sort(() => Math.random() - 0.5);
}

// Mock: Fetch price data
async function fetchPriceData(destination: string, month: string) {
  // Replace with real API call
  return {
    avgPrice: 450 + Math.floor(Math.random() * 300),
    minPrice: 199 + Math.floor(Math.random() * 100),
    maxPrice: 899 + Math.floor(Math.random() * 400),
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
    airlines: ['Delta', 'United', 'American', 'JetBlue', 'Southwest'].slice(0, 3 + Math.floor(Math.random() * 3)),
    bookingWindow: '6-8 weeks',
  };
}
