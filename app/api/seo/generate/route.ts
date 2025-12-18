/**
 * SEO Content Generator API
 * POST: Generate content for programmatic pages
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateCheapFlightsContent,
  validateContent,
  type ContentInput,
} from '@/lib/seo/agent/generator';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.SEO_MONITOR_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, input } = body as { type: string; input: ContentInput };

    if (type !== 'cheap-flights') {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    // Generate content
    const content = await generateCheapFlightsContent(input);

    // Validate
    const validation = validateContent(content, input);

    // Determine action
    let action: 'auto-publish' | 'review' | 'reject';
    if (validation.score >= 95 && validation.valid) {
      action = 'auto-publish';
    } else if (validation.score >= 70) {
      action = 'review';
    } else {
      action = 'reject';
    }

    return NextResponse.json({
      success: true,
      content,
      validation,
      action,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
