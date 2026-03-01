// app/api/agents/quotes/[id]/follow-up/route.ts
// Schedule a follow-up reminder — creates an AgentClientNote record
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { followUpDate, channel, note, daysFromNow } = body;

    if (!followUpDate) {
      return NextResponse.json({ error: "followUpDate is required" }, { status: 400 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Verify the quote belongs to this agent
    const quote = await prisma!.agentQuote.findFirst({
      where: { id, agentId: agent.id },
      select: { id: true, clientId: true, tripName: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (!quote.clientId) {
      // No client attached — skip note creation, just return success
      return NextResponse.json({ success: true, persisted: false });
    }

    const noteText = note
      ? `Follow-up via ${channel || "email"}: ${note}`
      : `Follow-up scheduled via ${channel || "email"} — ${daysFromNow ? `${daysFromNow} day(s) from now` : ""}`.trim();

    const clientNote = await prisma!.agentClientNote.create({
      data: {
        clientId: quote.clientId,
        agentId: agent.id,
        quoteId: quote.id,
        note: noteText,
        noteType: "follow-up",
        contactMethod: channel || "email",
        requiresFollowUp: true,
        followUpDate: new Date(followUpDate),
      },
    });

    return NextResponse.json({ success: true, persisted: true, noteId: clientNote.id });
  } catch (err) {
    console.error("[FOLLOW_UP_ERROR]", err);
    return NextResponse.json({ error: "Failed to schedule follow-up" }, { status: 500 });
  }
}
