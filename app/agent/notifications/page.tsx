// app/agent/notifications/page.tsx
// Agent Notifications Page - Level 6 Ultra-Premium
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Notifications - Agent Portal",
  description: "View your notifications",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  // Fetch notifications with explicit field selection (no DateTime)
  const notificationsRaw = await prisma?.notification.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      read: true,
      actionUrl: true,
      metadata: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Explicit primitive serialization
  const notifications = (notificationsRaw || []).map((n: any) => ({
    id: String(n.id || ""),
    type: String(n.type || "INFO"),
    title: n.title ? String(n.title) : null,
    message: n.message ? String(n.message) : "",
    read: Boolean(n.read),
    actionUrl: n.actionUrl ? String(n.actionUrl) : null,
    metadata: n.metadata || {},
  }));

  // Mark all as read
  if (notifications.length > 0) {
    await prisma?.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  const typeIcons: Record<string, string> = {
    INFO: "ℹ️",
    SUCCESS: "✅",
    WARNING: "⚠️",
    ERROR: "❌",
    QUOTE: "📋",
    BOOKING: "✈️",
    COMMISSION: "💰",
    PAYOUT: "💵",
    CLIENT: "👤",
    SYSTEM: "🔔",
  };

  const typeColors: Record<string, string> = {
    INFO: "bg-blue-50 border-blue-200",
    SUCCESS: "bg-green-50 border-green-200",
    WARNING: "bg-yellow-50 border-yellow-200",
    ERROR: "bg-red-50 border-red-200",
    QUOTE: "bg-indigo-50 border-indigo-200",
    BOOKING: "bg-purple-50 border-purple-200",
    COMMISSION: "bg-emerald-50 border-emerald-200",
    PAYOUT: "bg-teal-50 border-teal-200",
    CLIENT: "bg-orange-50 border-orange-200",
    SYSTEM: "bg-gray-50 border-gray-200",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{notifications.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Info</p>
          <p className="text-2xl font-bold text-blue-900">
            {notifications.filter((n) => n.type === "INFO").length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Success</p>
          <p className="text-2xl font-bold text-green-900">
            {notifications.filter((n) => n.type === "SUCCESS").length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">Warnings</p>
          <p className="text-2xl font-bold text-yellow-900">
            {notifications.filter((n) => n.type === "WARNING").length}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-medium text-gray-900">Recent Notifications</h2>
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <span className="text-4xl mb-4 block">🔔</span>
            <p>No notifications yet</p>
            <p className="text-sm mt-1">You'll see updates about your quotes, bookings, and more here.</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">
                    {typeIcons[notification.type] || "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notification.title && (
                        <span className="font-medium text-gray-900">
                          {notification.title}
                        </span>
                      )}
                      {!notification.read && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    {notification.actionUrl && (
                      <Link
                        href={notification.actionUrl}
                        className="inline-block mt-2 text-sm text-primary-600 hover:underline"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-blue-800">Notification Settings</p>
            <p className="text-sm text-blue-700 mt-1">
              Manage your notification preferences in{" "}
              <Link href="/agent/settings" className="underline">
                Settings
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
