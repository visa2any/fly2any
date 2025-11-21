// app/api/agents/clients/route.ts
// Client Management - List and Create
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

// GET /api/agents/clients - List all clients for agent
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const segment = searchParams.get("segment");
    const status = searchParams.get("status") || "ACTIVE";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {
      agentId: agent.id,
      status: status ? status : undefined,
    };

    if (segment) {
      where.segment = segment;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get clients with pagination
    const [clients, totalCount] = await Promise.all([
      prisma!.agentClient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              quotes: true,
              bookings: true,
            },
          },
        },
      }),
      prisma!.agentClient.count({ where }),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error("[CLIENTS_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/agents/clients - Create new client
const CreateClientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  dateOfBirth: z.string().optional(),
  anniversary: z.string().optional(),
  preferredLanguage: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  // Travel preferences
  cabinClass: z.string().optional(),
  preferredAirlines: z.array(z.string()).optional(),
  homeAirport: z.string().optional(),
  seatPreference: z.string().optional(),
  mealPreference: z.string().optional(),
  specialNeeds: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  // Travel documents
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  passportCountry: z.string().optional(),
  tsaPrecheck: z.boolean().optional(),
  globalEntry: z.boolean().optional(),
  // Preferences
  budgetRange: z.string().optional(),
  tripTypes: z.array(z.string()).optional(),
  favoriteDestinations: z.array(z.string()).optional(),
  travelStyle: z.string().optional(),
  // Communication
  preferredChannel: z.string().optional(),
  bestTimeToContact: z.string().optional(),
  // Segmentation
  segment: z.enum(["STANDARD", "VIP", "HONEYMOON", "FAMILY", "BUSINESS", "GROUP_ORGANIZER", "CORPORATE", "LUXURY"]).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      );
    }

    // Check client limit
    const clientCount = await prisma!.agentClient.count({
      where: { agentId: agent.id, status: "ACTIVE" },
    });

    if (clientCount >= agent.maxClients) {
      return NextResponse.json(
        {
          error: `Client limit reached (${agent.maxClients} clients). Upgrade your tier for more clients.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = CreateClientSchema.parse(body);

    // Check for duplicate email
    const existingClient = await prisma!.agentClient.findFirst({
      where: {
        agentId: agent.id,
        email: validatedData.email,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 400 }
      );
    }

    // Parse dates - convert non-empty strings to Date objects
    const data: any = { ...validatedData, agentId: agent.id };

    // Convert empty strings to undefined (Prisma doesn't accept empty strings for DateTime fields)
    if (validatedData.dateOfBirth && validatedData.dateOfBirth.trim() !== '') {
      data.dateOfBirth = new Date(validatedData.dateOfBirth);
    } else {
      data.dateOfBirth = undefined;
    }

    if (validatedData.anniversary && validatedData.anniversary.trim() !== '') {
      data.anniversary = new Date(validatedData.anniversary);
    } else {
      data.anniversary = undefined;
    }

    if (validatedData.passportExpiry && validatedData.passportExpiry.trim() !== '') {
      data.passportExpiry = new Date(validatedData.passportExpiry);
    } else {
      data.passportExpiry = undefined;
    }

    // Create client
    const client = await prisma!.agentClient.create({
      data,
      include: {
        _count: {
          select: {
            quotes: true,
            bookings: true,
          },
        },
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "client_added",
        description: `New client added: ${client.firstName} ${client.lastName}`,
        entityType: "client",
        entityId: client.id,
      },
    });

    return NextResponse.json({ client }, { status: 201 });

  } catch (error) {
    console.error("[CLIENT_CREATE_ERROR]", error);

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
