// components/agent/DashboardStats.tsx
interface DashboardStatsProps {
  data: {
    totalQuotes: number;
    totalBookings: number;
    totalClients: number;
    totalRevenue: number;
    thisMonth: {
      quotes: number;
      bookings: number;
      revenue: number;
    };
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      name: "Total Revenue",
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: data.thisMonth.revenue > 0 ? `$${data.thisMonth.revenue.toLocaleString()} this month` : "No revenue this month",
      changeType: data.thisMonth.revenue > 0 ? "positive" : "neutral",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-success-500",
    },
    {
      name: "Total Bookings",
      value: data.totalBookings.toLocaleString(),
      change: `${data.thisMonth.bookings} this month`,
      changeType: data.thisMonth.bookings > 0 ? "positive" : "neutral",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      bgColor: "bg-info-500",
    },
    {
      name: "Active Quotes",
      value: data.totalQuotes.toLocaleString(),
      change: `${data.thisMonth.quotes} created this month`,
      changeType: data.thisMonth.quotes > 0 ? "positive" : "neutral",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: "bg-primary-500",
    },
    {
      name: "Total Clients",
      value: data.totalClients.toLocaleString(),
      change: "View all clients",
      changeType: "neutral",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: "bg-secondary-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate" title={stat.name}>{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 truncate" title={stat.value}>{stat.value}</p>
              <p
                className={`text-sm mt-2 truncate ${
                  stat.changeType === "positive"
                    ? "text-success-600"
                    : stat.changeType === "negative"
                    ? "text-error-600"
                    : "text-gray-500"
                }`}
                title={stat.change}
              >
                {stat.change}
              </p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg flex-shrink-0`}>
              <div className="text-white">{stat.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
