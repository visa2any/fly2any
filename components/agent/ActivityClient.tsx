"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

export default function ActivityClient({ activities }: any) {
  const [filter, setFilter] = useState("ALL");

  const filteredActivities = activities.filter((activity: any) =>
    filter === "ALL" ? true : activity.activityType === filter
  );

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      quote_created: "📝",
      quote_sent: "📧",
      quote_pdf_emailed: "📄",
      booking_confirmed: "✅",
      client_added: "👤",
      payout_requested: "💰",
      commission_earned: "💵",
    };
    return icons[type] || "📌";
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {["ALL", "quote_created", "booking_confirmed", "client_added", "payout_requested"].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type === "ALL" ? "All Activity" : type.replace("_", " ").toUpperCase()}
              </button>
            )
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No activity found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="text-2xl">{getActivityIcon(activity.activityType)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(activity.createdAt)}</p>
                  {activity.entityType && (
                    <p className="text-xs text-gray-600 mt-1">
                      Type: {activity.entityType} | ID: {activity.entityId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
