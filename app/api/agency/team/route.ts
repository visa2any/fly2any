export const dynamic = 'force-dynamic';

// app/api/agency/team/route.ts
// Agency Team Management API
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["AGENT", "ADMIN"]).default("AGENT"),
  commissionSplit: z.number().min(0).max(100).default(70),
  canManageClients: z.boolean().default(true),
  canCreateQuotes: z.boolean().default(true),
  canAcceptBookings: z.boolean().default(true),
  canViewReports: z.boolean().default(false),
});

// GET /api/agency/team - List team members
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
      return NextResponse.json({ error: "Not an agency owner" }, { status: 403 });
    }

    const teamMembers = await prisma!.agentTeamMember.findMany({
      where: { agencyId: agent.id },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            totalSales: true,
            totalCommissions: true,
            quotesSent: true,
            quotesAccepted: true,
            status: true,
            user: { select: { image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ team: teamMembers });
  } catch (error) {
    console.error("[TEAM_LIST_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

// POST /api/agency/team - Invite team member
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
      return NextResponse.json({ error: "Not an agency owner" }, { status: 403 });
    }

    // Check team member limit
    const currentCount = await prisma!.agentTeamMember.count({
      where: { agencyId: agent.id, active: true },
    });

    if (currentCount >= agent.maxTeamMembers) {
      return NextResponse.json(
        { error: `Team member limit reached (${agent.maxTeamMembers})` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = InviteSchema.parse(body);

    // Check if user exists
    let invitedUser = await prisma!.user.findUnique({
      where: { email: data.email },
    });

    // Check if already a team member
    if (invitedUser) {
      const existingAgent = await prisma!.travelAgent.findUnique({
        where: { userId: invitedUser.id },
      });

      if (existingAgent) {
        const existingMembership = await prisma!.agentTeamMember.findUnique({
          where: {
            agencyId_agentId: { agencyId: agent.id, agentId: existingAgent.id },
          },
        });

        if (existingMembership) {
          return NextResponse.json(
            { error: "User is already a team member" },
            { status: 400 }
          );
        }

        // Add existing agent to team
        const teamMember = await prisma!.agentTeamMember.create({
          data: {
            agencyId: agent.id,
            agentId: existingAgent.id,
            role: data.role,
            commissionSplit: data.commissionSplit / 100,
            canManageClients: data.canManageClients,
            canCreateQuotes: data.canCreateQuotes,
            canAcceptBookings: data.canAcceptBookings,
            canViewReports: data.canViewReports,
            joinedAt: new Date(),
          },
          include: {
            agent: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        });

        return NextResponse.json({ success: true, member: teamMember }, { status: 201 });
      }
    }

    // Create new user and agent
    if (!invitedUser) {
      invitedUser = await prisma!.user.create({
        data: {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    }

    // Create travel agent profile
    const newAgent = await prisma!.travelAgent.create({
      data: {
        userId: invitedUser.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        tier: "INDEPENDENT",
        status: "PENDING",
        defaultCommission: agent.defaultCommission,
      },
    });

    // Add to team
    const teamMember = await prisma!.agentTeamMember.create({
      data: {
        agencyId: agent.id,
        agentId: newAgent.id,
        role: data.role,
        commissionSplit: data.commissionSplit / 100,
        canManageClients: data.canManageClients,
        canCreateQuotes: data.canCreateQuotes,
        canAcceptBookings: data.canAcceptBookings,
        canViewReports: data.canViewReports,
      },
    });

    // TODO: Send invitation email

    return NextResponse.json({ success: true, member: teamMember }, { status: 201 });
  } catch (error) {
    console.error("[TEAM_INVITE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to invite team member" }, { status: 500 });
  }
}
