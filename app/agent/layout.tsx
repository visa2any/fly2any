// app/agent/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAgentWithAdminFallback } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { safeDbOperation } from "@/lib/monitoring/global-error-handler";
import AgentSidebar from "@/components/agent/AgentSidebar";
import ConditionalTopBar from "@/components/agent/ConditionalTopBar";
import AgentMobileNav from "@/components/agent/AgentMobileNav";
import AgentContentWrapper from "@/components/agent/AgentContentWrapper";
import DemoBanner from "@/components/agent/DemoBanner";
import ConditionalMain from "@/components/agent/ConditionalMain";

// Demo agent data
const DEMO_AGENT = {
  id: 'demo-agent-001',
  tier: 'DEMO',
  status: 'ACTIVE',
  businessName: 'Demo Travel Agency',
  isTestAccount: false,
  isDemo: true,
  availableBalance: 2450.00,
  pendingBalance: 890.00,
  currentBalance: 3340.00,
  user: {
    name: 'Demo Agent',
    email: 'demo@fly2any.com',
    image: null,
  },
};

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

  // Check if demo user
  const isDemo = session.user.id === 'demo-agent-001' || session.user.email === 'demo@fly2any.com';
  
  // SECURITY: Block demo account in production
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  if (isDemo && isProduction) {
    console.error('❌ Demo account attempted in production');
    redirect('/auth/signin?error=demo-not-allowed');
  }

  let serializedAgent;
  let serializedUser;

  if (isDemo) {
    // Use demo data - no DB calls
    serializedAgent = DEMO_AGENT;
    serializedUser = {
      name: 'Demo Agent',
      email: 'demo@fly2any.com',
      image: null,
    };
  } else {
    // Normal flow - fetch from DB with error handling
    let agent = null;
    try {
      agent = await safeDbOperation(
        () => getAgentWithAdminFallback(session.user.id),
        'Get Agent with Fallback',
        { userId: session.user.id }
      );
    } catch {
      // DB unavailable — render children so the page handles its own error state
      return <>{children}</>;
    }

    // No agent profile: render children only — page will redirect to /agent/register
    if (!agent) {
      return <>{children}</>;
    }

    // Guard against prisma being null/undefined with error handling
    let fullAgent = null;
    try {
      fullAgent = await safeDbOperation(
        async () => {
          if (!prisma) return null;
          return prisma.travelAgent.findUnique({
            where: { id: agent!.id },
            select: {
              id: true,
              tier: true,
              status: true,
              businessName: true,
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
        },
        'Fetch Agent Details',
        { agentId: agent.id }
      );
    } catch {
      // DB unavailable — render children
      return <>{children}</>;
    }

    // No full agent or non-active status: render children only — page handles redirect
    if (!fullAgent || fullAgent.status === 'SUSPENDED' || fullAgent.status === 'BANNED' || fullAgent.status === 'INACTIVE') {
      return <>{children}</>;
    }

    // Safely serialize with null checks
    serializedAgent = {
      id: String(fullAgent?.id || agent.id),
      tier: String(fullAgent?.tier || 'STANDARD'),
      status: String(fullAgent?.status || 'PENDING'),
      businessName: fullAgent?.businessName ? String(fullAgent.businessName) : null,
      availableBalance: Number(fullAgent?.availableBalance) || 0,
      pendingBalance: Number(fullAgent?.pendingBalance) || 0,
      currentBalance: Number(fullAgent?.currentBalance) || 0,
      user: {
        name: fullAgent?.user?.name ? String(fullAgent.user.name) : null,
        email: fullAgent?.user?.email ? String(fullAgent.user.email) : "",
        image: fullAgent?.user?.image ? String(fullAgent.user.image) : null,
      },
    };

    serializedUser = {
      name: session.user.name ? String(session.user.name) : null,
      email: session.user.email ? String(session.user.email) : null,
      image: session.user.image ? String(session.user.image) : null,
    };
  }

  const pendingMessage = serializedAgent.status === "PENDING" && !isDemo ? (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-amber-600 text-sm font-bold">!</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-amber-800">Account Pending Approval</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Your agent profile is under review. You can explore the workspace, but booking and quoting features will be unlocked once approved (typically within 24–48 hours).
        </p>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {isDemo && <DemoBanner />}
      <AgentSidebar agent={serializedAgent as any} />
      <AgentContentWrapper>
        <ConditionalTopBar agent={serializedAgent} user={serializedUser} />
        <ConditionalMain pendingMessage={pendingMessage}>
          {children}
        </ConditionalMain>
      </AgentContentWrapper>
      <AgentMobileNav />
    </div>
  );
}
