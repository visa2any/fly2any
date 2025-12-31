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
import prisma from "@/lib/prisma";

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

  // Fetch full agent details with user info
  const fullAgent = agent ? await prisma!.travelAgent.findUnique({
    where: { id: agent.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  }) : null;

  // If not an agent, redirect to registration or homepage
  if (!fullAgent) {
    redirect("/agent/register");
  }

  // If agent status is REJECTED or SUSPENDED (skip for admin test accounts)
  if (fullAgent.status === "BANNED" && !fullAgent.isTestAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your travel agent application has been rejected. Please contact support for more information.
          </p>
          <a
            href="mailto:support@fly2any.com"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  if (fullAgent.status === "SUSPENDED" && !fullAgent.isTestAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>
          <p className="text-gray-600 mb-6">
            Your travel agent account has been temporarily suspended. Please contact support to resolve this issue.
          </p>
          <a
            href="mailto:support@fly2any.com"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // SERIALIZE for client components - handle Date objects safely
  // Note: session.user and Prisma objects may have non-serializable types
  const serializedAgent = {
    id: fullAgent.id,
    tier: fullAgent.tier,
    status: fullAgent.status,
    businessName: fullAgent.businessName,
    isTestAccount: fullAgent.isTestAccount,
    availableBalance: fullAgent.availableBalance ?? 0,
    pendingBalance: fullAgent.pendingBalance ?? 0,
    currentBalance: fullAgent.currentBalance ?? 0,
    user: {
      name: fullAgent.user?.name ?? null,
      email: fullAgent.user?.email ?? '',
      image: fullAgent.user?.image ?? null,
    },
  };

  // Serialize session user separately for AgentTopBar
  const serializedUser = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Mode Banner (shows when admin is accessing agent portal) */}
      {fullAgent.isTestAccount && <AdminModeBanner />}

      {/* Sidebar */}
      <AgentSidebar agent={serializedAgent} />

      {/* Main Content Area - Dynamic padding based on sidebar */}
      <AgentContentWrapper>
        {/* Top Bar */}
        <AgentTopBar agent={serializedAgent} user={serializedUser} />

        {/* Page Content */}
        <main className="py-4 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-6">
          {/* Pending Approval Banner */}
          {fullAgent.status === "PENDING" && !fullAgent.isTestAccount && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-yellow-800">Your account is pending approval. Some features are limited.</p>
              </div>
            </div>
          )}

          {children}
        </main>
      </AgentContentWrapper>

      {/* Mobile Bottom Navigation */}
      <AgentMobileNav />
    </div>
  );
}
