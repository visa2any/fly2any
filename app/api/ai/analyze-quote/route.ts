
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { callGroq } from "@/lib/ai/groq-client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quote = await request.json();

    // Prepare context for the AI
    const context = JSON.stringify({
      tripName: quote.tripName,
      destination: quote.destination,
      dates: { start: quote.startDate, end: quote.endDate },
      travelers: quote.travelers,
      items: quote.items.map((item: any) => ({
        type: item.type,
        title: item.title || item.name || item.airline,
        price: item.price,
        details: item.details || item.description
      }))
    });

    const messages = [
      {
        role: "user" as const,
        content: `Analyze this travel quote and provide optimization suggestions:\n\n${context}`
      }
    ];

    const response = await callGroq(messages, {
      model: "llama-3.3-70b-versatile",
      agentType: "quote-optimizer",
      temperature: 0.3, // Lower temperature for structured JSON
      maxTokens: 1024
    });

    if (!response.success || !response.message) {
      throw new Error(response.error || "Failed to generate analysis");
    }

    // Parse JSON from the response (handle potential markdown fences)
    const cleanJson = response.message.replace(/```json\n?|\n?```/g, "").trim();
    const analysis = JSON.parse(cleanJson);

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error("Quote analysis failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze quote", details: error.message },
      { status: 500 }
    );
  }
}
