import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient, isPrismaAvailable } from '@/lib/prisma';
import { callGroq } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, messages } = body;

    if (!conversationId || !messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 1. Fetch Property details and AI Rules for context (if DB available)
    let aiRules = 'Be polite, concise, and helpful. Always confirm checking details if asked.';
    let propertyName = 'the property';
    
    if (isPrismaAvailable()) {
       const prisma = getPrismaClient();
       const conversation = await prisma.conversation.findUnique({
           where: { id: conversationId },
           include: { property: { select: { name: true, aiCoHostRules: true } } }
       });
       if (conversation?.property) {
           propertyName = conversation.property.name;
           if (conversation.property.aiCoHostRules) {
               aiRules += `\\n\\nHost Specific Directives:\\n${conversation.property.aiCoHostRules}`;
           }
       }
    }

    // 2. Prepare System Prompt
    const systemPrompt = `You are an AI Co-Host for a short-term rental property named "${propertyName}".
Your goal is to draft a helpful, friendly, and highly accurate reply to the guest's latest message based on the conversation history.

Rules:
1. ${aiRules}
2. Keep the response concise—ideally 2-3 short sentences.
3. Do NOT make up information (like door codes or wifi passwords) if they aren't explicitly provided in the rules. If you don't know, tell the guest that you (the host) will check and get back to them shortly.
4. Output ONLY the raw message text. No pleasantries like "Here is the draft:" or quotes. Just the exact text to be sent.`;

    // 3. Format Messages for Groq
    const chatHistory = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
    }));

    // 4. Call Groq
    const groqResponse = await callGroq([
        { role: 'system', content: systemPrompt },
        ...chatHistory
    ], {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3, // Lower temp for more factual, less hallucination-prone answers
        maxTokens: 300
    });

    if (!groqResponse.success || !groqResponse.message) {
        throw new Error("AI failed to generate a response");
    }

    // 5. Return Draft to Client
    return NextResponse.json({
        success: true,
        reply: groqResponse.message.trim().replace(/^["']|["']$/g, '') // Strip edge quotes just in case
    });

  } catch (error: any) {
    console.error('Co-Host AI Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
