import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tripName, destination, startDate, endDate, travelers, items, tone, clientName } = body;

    if (!destination && (!items || items.length === 0)) {
      return NextResponse.json({ error: "Provide destination or items" }, { status: 400 });
    }

    // Build trip summary for Claude
    const nights = startDate && endDate
      ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
      : null;

    const itemSummary = (items || [])
      .slice(0, 10)
      .map((item: any) => {
        if (item.type === "flight") return `Flight: ${item.origin || ""} → ${item.destination || ""} on ${item.date || ""}`;
        if (item.type === "hotel") return `Hotel: ${item.name || "accommodation"}`;
        if (item.type === "activity") return `Activity: ${item.name || "experience"}`;
        if (item.type === "transfer") return `Transfer service`;
        if (item.type === "car") return `Car rental`;
        return null;
      })
      .filter(Boolean)
      .join("\n");

    const toneGuide: Record<string, string> = {
      luxury: "sophisticated, elegant, and aspirational — like a Forbes Travel Guide",
      family: "warm, exciting for kids, and reassuring for parents",
      adventure: "energetic, bold, and inspiring — like National Geographic",
      romantic: "intimate, poetic, and emotionally evocative",
      business: "efficient, professional, and value-focused",
    };

    const prompt = `You are a world-class travel copywriter for a US-based travel agency.

Trip Details:
- Name: ${tripName || "Custom Trip"}
- Destination: ${destination || "Multiple destinations"}
- Duration: ${nights ? `${nights} nights` : "TBD"}
- Travelers: ${travelers || 1}
- Client: ${clientName || "Traveler"}
- Tone: ${toneGuide[tone] || "warm and professional"}

Itinerary:
${itemSummary || "A custom travel package"}

Write a compelling 3-paragraph trip narrative (120–180 words) that:
1. Opens with a vivid destination-specific hook
2. Highlights key experiences that make this trip special
3. Closes with an emotional pull about memories they'll bring home

Rules: Use "you/your". No prices or logistics. No generic phrases. Plain prose, no bullets. Under 180 words.

Return ONLY the narrative text.`;

    // Use fetch to call the Anthropic API directly (no SDK needed)
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!anthropicRes.ok) {
      console.error("[Narrative API] Anthropic error:", anthropicRes.status);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    const data = await anthropicRes.json();
    const narrative = data.content?.[0]?.type === "text" ? data.content[0].text.trim() : null;

    if (!narrative) {
      return NextResponse.json({ error: "Failed to generate narrative" }, { status: 500 });
    }

    return NextResponse.json({ narrative });
  } catch (error) {
    console.error("[Narrative API]", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
