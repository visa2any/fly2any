// app/api/agents/clients/[id]/notes/route.ts
// Client Notes - Communication Log
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// GET /api/agents/clients/[id]/notes - Get all notes for client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Verify client belongs to agent
    const client = await prisma!.agentClient.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const notes = await prisma!.agentClientNote.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("[CLIENT_NOTES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/agents/clients/[id]/notes - Create new note
const CreateNoteSchema = z.object({
  note: z.string().min(1),
  noteType: z.enum(["general", "call", "email", "meeting", "follow_up", "issue"]).default("general"),
  isImportant: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  contactMethod: z.enum(["phone", "email", "sms", "whatsapp", "in_person"]).optional(),
  duration: z.number().optional(), // minutes
  outcome: z.string().optional(),
  requiresFollowUp: z.boolean().default(false),
  followUpDate: z.string().datetime().optional(),
  quoteId: z.string().optional(),
  bookingId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Verify client belongs to agent
    const client = await prisma!.agentClient.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = CreateNoteSchema.parse(body);

    const data: any = {
      ...validatedData,
      clientId: params.id,
      agentId: agent.id,
    };

    if (validatedData.followUpDate) {
      data.followUpDate = new Date(validatedData.followUpDate);
    }

    const note = await prisma!.agentClientNote.create({
      data,
    });

    // Update client's last contact date
    await prisma!.agentClient.update({
      where: { id: params.id },
      data: { lastContactDate: new Date() },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "client_note_added",
        description: `Note added for ${client.firstName} ${client.lastName}`,
        entityType: "client",
        entityId: client.id,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("[CLIENT_NOTE_CREATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
