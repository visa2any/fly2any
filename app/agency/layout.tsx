// app/agency/layout.tsx
// Agency Portal Layout - Level 6 Ultra-Premium
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AgencySidebar from "@/components/agency/AgencySidebar";
import AgencyTopBar from "@/components/agency/AgencyTopBar";

export const metadata = {
  title: "Agency Portal - Fly2Any",
  description: "Travel Agency Management Portal",
};

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agency");
  }

  // Get agent and check if they're an agency owner
  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      team: { where: { active: true }, include: { agent: { select: { id: true } } } },
    },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Check if agent has team management capability (agency owner)
  const isAgencyOwner = agent.tier === "AGENCY" || agent.hasTeamManagement;

  if (!isAgencyOwner) {
    redirect("/agent?error=no_agency_access");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <AgencySidebar agent={agent} />
      <div className="lg:pl-72">
        <AgencyTopBar agent={agent} user={session.user} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
