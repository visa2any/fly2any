// app/agency/markup-rules/page.tsx
// Markup Rules Page - Level 6 Ultra-Premium
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import MarkupRulesContent from "@/components/agency/MarkupRulesContent";

export const metadata = {
  title: "Markup Rules - Agency Portal",
  description: "Configure markup rules for your agency",
};

export default async function MarkupRulesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
    redirect("/agent");
  }

  const markupRules = await prisma!.agencyMarkupRule.findMany({
    where: { agencyId: agent.id },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  const teamMembers = await prisma!.agentTeamMember.findMany({
    where: { agencyId: agent.id, active: true },
    include: {
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return (
    <MarkupRulesContent
      markupRules={markupRules}
      teamMembers={teamMembers}
    />
  );
}
