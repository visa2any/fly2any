import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { callGroq } from '@/lib/ai/groq-client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, location, specs, amenities, style = 'professional' } = body;

    if (!type || !location) {
        return NextResponse.json({ error: 'Missing property details' }, { status: 400 });
    }

    const prompt = `
    Write a ${style} real estate listing description for a ${type} in ${location.city || 'the city'}.
    
    Property Details:
    - ${specs.bedrooms} bedrooms, ${specs.bathrooms} bathrooms
    - Max guests: ${specs.guests}
    - Key Amenities: ${amenities.slice(0, 5).join(', ')}
    - Address: ${location.address}

    Requirements:
    - Highlight the key amenities.
    - Mention local vibe if city is known.
    - Keep it engaging but accurate.
    - Max 2 paragraphs.
    - Do NOT comprise false information.
    `;

    const aiRes = await callGroq([
        { role: 'system', content: 'You are a professional real estate copywriter. Output only the description text.' },
        { role: 'user', content: prompt }
    ], {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        maxTokens: 500
    });

    if (!aiRes.success || !aiRes.message) {
        throw new Error("AI Generation Failed");
    }

    return NextResponse.json({
        success: true,
        description: aiRes.message.replace(/"/g, '').trim()
    });

  } catch (error: any) {
    console.error('AI Description Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
