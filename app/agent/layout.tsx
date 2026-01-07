// app/agent/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAgentWithAdminFallback } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
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
    // Normal flow - fetch from DB
    const agent = await getAgentWithAdminFallback(session.user.id);

    if (!agent) {
      redirect("/agent/register");
    }

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

    serializedAgent = {
      id: String(fullAgent.id),
      tier: String(fullAgent.tier),
      status: String(fullAgent.status),
      businessName: fullAgent.businessName ? String(fullAgent.businessName) : null,
      isTestAccount: Boolean(fullAgent.isTestAccount),
      isDemo: false,
      availableBalance: Number(fullAgent.availableBalance) || 0,
      pendingBalance: Number(fullAgent.pendingBalance) || 0,
      currentBalance: Number(fullAgent.currentBalance) || 0,
      user: {
        name: fullAgent.user?.name ? String(fullAgent.user.name) : null,
        email: fullAgent.user?.email ? String(fullAgent.user.email) : "",
        image: fullAgent.user?.image ? String(fullAgent.user.image) : null,
      },
    };

    serializedUser = {
      name: session.user.name ? String(session.user.name) : null,
      email: session.user.email ? String(session.user.email) : null,
      image: session.user.image ? String(session.user.image) : null,
    };
  }

  const pendingMessage = serializedAgent.status === "PENDING" && !serializedAgent.isTestAccount && !isDemo ? (
    <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="text-sm text-yellow-800">Your account is pending approval.</p>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {isDemo && <DemoBanner />}
      <AgentSidebar agent={serializedAgent} />
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
