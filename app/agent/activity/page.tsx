// app/agent/activity/page.tsx
// Agent Activity Log - Timeline of all agent actions
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ActivityClient from "@/components/agent/ActivityClient";

export const metadata = {
  title: "Activity Log - Agent Portal",
  description: "View your complete activity history",
};

export default async function AgentActivityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/activity");
  }

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch activity logs
  const activities = await prisma!.agentActivityLog.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: "desc" },
    take: 100, // Last 100 activities
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete timeline of your actions and system events
        </p>
      </div>

      <ActivityClient activities={activities} />
    </div>
  );
}
