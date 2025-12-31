// app/agent/layout.tsx
// Agent Portal Layout with Sidebar Navigation
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAgentWithAdminFallback } from "@/lib/auth-helpers";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgentTopBar from "@/components/agent/AgentTopBar";
import AdminModeBanner from "@/components/agent/AdminModeBanner";
import AgentMobileNav from "@/components/agent/AgentMobileNav";
import AgentContentWrapper from "@/components/agent/AgentContentWrapper";
import { prisma } from "@/lib/prisma";

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

  // Redirect if not authenticated
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent");
  }

  // Check if user is a registered travel agent (with admin fallback)
  const agent = await getAgentWithAdminFallback(session.user.id);

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch ONLY needed fields - avoid DateTime/non-serializable types
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

  // Status checks using primitive values
  const status = String(fullAgent.status || "");
  const isTest = Boolean(fullAgent.isTestAccount);

  if (status === "BANNED" && !isTest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Banned</h2>
          <p className="text-gray-600">Contact support@fly2any.com</p>
        </div>
      </div>
    );
  }

  if (status === "SUSPENDED" && !isTest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>
          <p className="text-gray-600">Contact support@fly2any.com</p>
        </div>
      </div>
    );
  }

  // FORCE FULL SERIALIZATION - create plain objects
  const serializedAgent = {
    id: String(fullAgent.id || ""),
    tier: String(fullAgent.tier || "INDEPENDENT"),
    status: String(fullAgent.status || "PENDING"),
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
