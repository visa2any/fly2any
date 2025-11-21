// app/api/agents/clients/[id]/route.ts
// Client Detail, Update, Delete
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

// GET /api/agents/clients/[id] - Get client details
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

    const client = await prisma!.agentClient.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        _count: {
          select: {
            quotes: true,
            bookings: true,
            clientNotes: true,
            documents: true,
          },
        },
        quotes: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            quoteNumber: true,
            tripName: true,
            destination: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        bookings: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            confirmationNumber: true,
            tripName: true,
            destination: true,
            startDate: true,
            total: true,
            status: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("[CLIENT_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/clients/[id] - Update client
const UpdateClientSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  anniversary: z.string().datetime().optional(),
  preferredLanguage: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  cabinClass: z.string().optional(),
  preferredAirlines: z.array(z.string()).optional(),
  homeAirport: z.string().optional(),
  seatPreference: z.string().optional(),
  mealPreference: z.string().optional(),
  specialNeeds: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().datetime().optional(),
  passportCountry: z.string().optional(),
  tsaPrecheck: z.boolean().optional(),
  globalEntry: z.boolean().optional(),
  budgetRange: z.string().optional(),
  tripTypes: z.array(z.string()).optional(),
  favoriteDestinations: z.array(z.string()).optional(),
  travelStyle: z.string().optional(),
  preferredChannel: z.string().optional(),
  bestTimeToContact: z.string().optional(),
  segment: z.enum(["STANDARD", "VIP", "HONEYMOON", "FAMILY", "BUSINESS", "GROUP_ORGANIZER", "CORPORATE", "LUXURY"]).optional(),
  tags: z.array(z.string()).optional(),
  isVip: z.boolean().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export async function PATCH(
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
    const validatedData = UpdateClientSchema.parse(body);

    // Parse dates
    const data: any = { ...validatedData };
    if (validatedData.dateOfBirth) {
      data.dateOfBirth = new Date(validatedData.dateOfBirth);
    }
    if (validatedData.anniversary) {
      data.anniversary = new Date(validatedData.anniversary);
    }
    if (validatedData.passportExpiry) {
      data.passportExpiry = new Date(validatedData.passportExpiry);
    }

    const updatedClient = await prisma!.agentClient.update({
      where: { id: params.id },
      data,
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "client_updated",
        description: `Client updated: ${updatedClient.firstName} ${updatedClient.lastName}`,
        entityType: "client",
        entityId: updatedClient.id,
      },
    });

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error("[CLIENT_UPDATE_ERROR]", error);

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

// DELETE /api/agents/clients/[id] - Delete (soft delete) client
export async function DELETE(
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

    const client = await prisma!.agentClient.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Soft delete - set status to ARCHIVED
    await prisma!.agentClient.update({
      where: { id: params.id },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date(),
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "client_deleted",
        description: `Client archived: ${client.firstName} ${client.lastName}`,
        entityType: "client",
        entityId: client.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLIENT_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
