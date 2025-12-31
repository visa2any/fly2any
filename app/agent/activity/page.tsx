// app/agent/activity/page.tsx
// Agent Activity Log - Timeline of all agent actions
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Activity Log - Agent Portal",
  description: "View your complete activity history",
};

export default async function AgentActivityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/activity");
  }

  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch activity logs with explicit field selection (no DateTime)
  const activitiesRaw = await prisma?.agentActivityLog.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      action: true,
      category: true,
      description: true,
      metadata: true,
      ipAddress: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Explicit primitive serialization
  const activities = (activitiesRaw || []).map((a: any) => ({
    id: String(a.id || ""),
    action: String(a.action || ""),
    category: a.category ? String(a.category) : null,
    description: a.description ? String(a.description) : null,
    metadata: a.metadata || {},
    ipAddress: a.ipAddress ? String(a.ipAddress) : null,
  }));

  const categoryColors: Record<string, string> = {
    QUOTE: "bg-blue-100 text-blue-700",
    BOOKING: "bg-green-100 text-green-700",
    CLIENT: "bg-purple-100 text-purple-700",
    PAYMENT: "bg-yellow-100 text-yellow-700",
    COMMISSION: "bg-orange-100 text-orange-700",
    PAYOUT: "bg-emerald-100 text-emerald-700",
    SETTINGS: "bg-gray-100 text-gray-700",
    AUTH: "bg-indigo-100 text-indigo-700",
    SYSTEM: "bg-slate-100 text-slate-700",
  };

  const actionIcons: Record<string, string> = {
    CREATE: "➕",
    UPDATE: "✏️",
    DELETE: "🗑️",
    VIEW: "👁️",
    SEND: "📤",
    ACCEPT: "✅",
    DECLINE: "❌",
    LOGIN: "🔐",
    LOGOUT: "🚪",
    DOWNLOAD: "📥",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete timeline of your actions and system events
        </p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Activities</p>
          <p className="text-2xl font-bold">{activities.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Quote Actions</p>
          <p className="text-2xl font-bold text-blue-900">
            {activities.filter((a) => a.category === "QUOTE").length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Booking Actions</p>
          <p className="text-2xl font-bold text-green-900">
            {activities.filter((a) => a.category === "BOOKING").length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">Client Actions</p>
          <p className="text-2xl font-bold text-purple-900">
            {activities.filter((a) => a.category === "CLIENT").length}
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-medium text-gray-900">Recent Activity</h2>
        </div>

        {activities.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No activity recorded yet. Your actions will appear here.
          </div>
        ) : (
          <div className="divide-y">
            {activities.map((activity) => (
              <div key={activity.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {actionIcons[activity.action] || "📋"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {activity.action.replace(/_/g, " ")}
                      </span>
                      {activity.category && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[activity.category] || "bg-gray-100 text-gray-700"}`}>
                          {activity.category}
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info about activity logging */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-blue-800">Activity Tracking</p>
            <p className="text-sm text-blue-700 mt-1">
              All your actions in the agent portal are logged for security and audit purposes.
              Activities are retained for 90 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
