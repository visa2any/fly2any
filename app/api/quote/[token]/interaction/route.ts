// POST /api/quote/[token]/interaction - Client reactions & suggestions
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { action, data } = body;

    const quote = await prisma?.agentQuote.findFirst({
      where: { viewToken: token },
      select: { id: true, metadata: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const currentMeta = (quote.metadata as Record<string, any>) || {};
    const interactions = currentMeta.clientInteractions || { reactions: {}, suggestions: [] };

    switch (action) {
      case "reaction": {
        // Store reaction
        if (data.type) {
          interactions.reactions[data.itemId] = {
            type: data.type,
            timestamp: new Date().toISOString(),
          };
        } else {
          delete interactions.reactions[data.itemId];
        }
        break;
      }

      case "suggestion": {
        // Store suggestion
        interactions.suggestions.push({
          ...data.suggestion,
          receivedAt: new Date().toISOString(),
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Update quote metadata
    await prisma?.agentQuote.update({
      where: { id: quote.id },
      data: {
        metadata: {
          ...currentMeta,
          clientInteractions: interactions,
          lastInteractionAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Interaction error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET /api/quote/[token]/interaction - Get interactions (for agent view)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const quote = await prisma?.agentQuote.findFirst({
      where: { viewToken: token },
      select: { metadata: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const meta = (quote.metadata as Record<string, any>) || {};
    return NextResponse.json(meta.clientInteractions || { reactions: {}, suggestions: [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
