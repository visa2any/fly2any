// app/agency/team/page.tsx
// Team Management Page - Level 6 Ultra-Premium
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TeamManagementContent from "@/components/agency/TeamManagementContent";

export const metadata = {
  title: "Team Management - Agency Portal",
  description: "Manage your agency team members",
};

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
    redirect("/agent");
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

  return (
    <TeamManagementContent
      teamMembers={teamMembers}
      maxTeamMembers={agent.maxTeamMembers}
    />
  );
}
