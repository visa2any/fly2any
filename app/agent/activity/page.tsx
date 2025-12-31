// app/agent/activity/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Activity Log - Agent Portal",
  description: "View your activity history",
};

export default async function AgentActivityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/activity");
  }

  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  const activitiesRaw = await prisma?.agentActivityLog.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      activityType: true,
      description: true,
      entityType: true,
      location: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const activities = (activitiesRaw || []).map((a: any) => ({
    id: String(a.id),
    activityType: String(a.activityType || ""),
    description: a.description ? String(a.description) : "",
    entityType: a.entityType ? String(a.entityType) : null,
    location: a.location ? String(a.location) : null,
  }));

  const typeIcons: Record<string, string> = {
    quote_created: "📋",
    quote_sent: "📤",
    quote_viewed: "👁️",
    quote_accepted: "✅",
    booking_created: "✈️",
    client_added: "👤",
    payout_requested: "💵",
    login: "🔐",
    settings_updated: "⚙️",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Activities</p>
          <p className="text-2xl font-bold">{activities.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-medium">Recent Activity</h2>
        </div>
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No activity recorded yet.</div>
        ) : (
          <div className="divide-y">
            {activities.map((activity) => (
              <div key={activity.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{typeIcons[activity.activityType] || "📋"}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.activityType.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.location && (
                      <p className="text-xs text-gray-400 mt-1">{activity.location}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
