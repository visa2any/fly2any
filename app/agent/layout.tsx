// app/agent/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAgentWithAdminFallback } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgentTopBar from "@/components/agent/AgentTopBar";
import AdminModeBanner from "@/components/agent/AdminModeBanner";
import AgentMobileNav from "@/components/agent/AgentMobileNav";
import AgentContentWrapper from "@/components/agent/AgentContentWrapper";

export const metadata = {
  title: "Agent Portal - Fly2Any",
  description: "Travel Agent Management Portal",
};

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent");
  }

  const agent = await getAgentWithAdminFallback(session.user.id);

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch with select to avoid DateTime fields
  const fullAgent = await prisma?.travelAgent.findUnique({
    where: { id: agent.id },
    select: {
      id: true,
      tier: true,
      status: true,
      businessName: true,
      isTestAccount: true,
      availableBalance: true,
      pendingBalance: true,
      currentBalance: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!fullAgent) {
    redirect("/agent/register");
  }

  // Explicit primitive serialization
  const serializedAgent = {
    id: String(fullAgent.id),
    tier: String(fullAgent.tier),
    status: String(fullAgent.status),
    businessName: fullAgent.businessName ? String(fullAgent.businessName) : null,
    isTestAccount: Boolean(fullAgent.isTestAccount),
    availableBalance: Number(fullAgent.availableBalance) || 0,
    pendingBalance: Number(fullAgent.pendingBalance) || 0,
    currentBalance: Number(fullAgent.currentBalance) || 0,
    user: {
      name: fullAgent.user?.name ? String(fullAgent.user.name) : null,
      email: fullAgent.user?.email ? String(fullAgent.user.email) : "",
      image: fullAgent.user?.image ? String(fullAgent.user.image) : null,
    },
  };

  const serializedUser = {
    name: session.user.name ? String(session.user.name) : null,
    email: session.user.email ? String(session.user.email) : null,
    image: session.user.image ? String(session.user.image) : null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {serializedAgent.isTestAccount && <AdminModeBanner />}
      <AgentSidebar agent={serializedAgent} />
      <AgentContentWrapper>
        <AgentTopBar agent={serializedAgent} user={serializedUser} />
        <main className="py-4 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-6">
          {serializedAgent.status === "PENDING" && !serializedAgent.isTestAccount && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">Your account is pending approval.</p>
            </div>
          )}
          {children}
        </main>
      </AgentContentWrapper>
      <AgentMobileNav />
    </div>
  );
}
