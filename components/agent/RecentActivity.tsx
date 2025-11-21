// components/agent/RecentActivity.tsx
import Link from "next/link";

interface RecentActivityProps {
  quotes: Array<{
    id: string;
    quoteNumber: string;
    tripName: string;
    destination: string;
    total: number;
    status: string;
    createdAt: Date;
    client: {
      firstName: string;
      lastName: string;
    };
  }>;
  bookings: Array<{
    id: string;
    confirmationNumber: string;
    tripName: string;
    total: number;
    status: string;
    createdAt: Date;
    client: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function RecentActivity({ quotes, bookings }: RecentActivityProps) {
  // Combine and sort by date
  const activities = [
    ...quotes.map((q) => ({
      ...q,
      type: "quote" as const,
      identifier: q.quoteNumber,
      link: `/agent/quotes/${q.id}`,
    })),
    ...bookings.map((b) => ({
      ...b,
      type: "booking" as const,
      identifier: b.confirmationNumber,
      link: `/agent/bookings/${b.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string, type: string) => {
    if (type === "quote") {
      switch (status) {
        case "ACCEPTED":
          return "bg-success-100 text-success-800";
        case "SENT":
          return "bg-info-100 text-info-800";
        case "VIEWED":
          return "bg-primary-100 text-primary-800";
        case "DECLINED":
          return "bg-error-100 text-error-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    } else {
      switch (status) {
        case "CONFIRMED":
          return "bg-success-100 text-success-800";
        case "PENDING":
          return "bg-warning-100 text-warning-800";
        case "COMPLETED":
          return "bg-info-100 text-info-800";
        case "CANCELLED":
          return "bg-error-100 text-error-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    if (type === "quote") {
      return (
        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      );
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Latest quotes and bookings</p>
          </div>
          <Link
            href="/agent/activity"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-600 text-sm">No recent activity</p>
            <Link
              href="/agent/quotes/create"
              className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Create a quote to get started →
            </Link>
          </div>
        ) : (
          activities.map((activity) => (
            <Link
              key={`${activity.type}-${activity.id}`}
              href={activity.link}
              className="p-4 hover:bg-gray-50 transition-colors block"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {activity.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                        activity.status,
                        activity.type
                      )}`}
                    >
                      {activity.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {activity.tripName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.client.firstName} {activity.client.lastName} • {activity.identifier}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {getRelativeTime(activity.createdAt)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${activity.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
