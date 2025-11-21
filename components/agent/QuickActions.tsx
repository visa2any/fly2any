// components/agent/QuickActions.tsx
"use client";

import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      name: "Create Quote",
      description: "Build a new multi-product quote",
      href: "/agent/quotes/create",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: "bg-gradient-to-br from-primary-500 to-primary-600",
      hoverColor: "hover:from-primary-600 hover:to-primary-700",
    },
    {
      name: "Add Client",
      description: "Add a new client to your CRM",
      href: "/agent/clients/create",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: "bg-gradient-to-br from-info-500 to-info-600",
      hoverColor: "hover:from-info-600 hover:to-info-700",
    },
    {
      name: "View Bookings",
      description: "Manage active bookings",
      href: "/agent/bookings",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "bg-gradient-to-br from-success-500 to-success-600",
      hoverColor: "hover:from-success-600 hover:to-success-700",
    },
    {
      name: "Request Payout",
      description: "Withdraw available earnings",
      href: "/agent/payouts/request",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-gradient-to-br from-secondary-500 to-secondary-600",
      hoverColor: "hover:from-secondary-600 hover:to-secondary-700",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group relative overflow-hidden rounded-lg p-4 text-white transition-all hover:shadow-lg"
            aria-label={`${action.name}: ${action.description}`}
          >
            <div className={`absolute inset-0 ${action.color} ${action.hoverColor} transition-all`}></div>
            <div className="relative z-10">
              <div className="mb-3 w-6 h-6">{action.icon}</div>
              <h3 className="font-semibold text-sm">{action.name}</h3>
              <p className="text-xs opacity-90 mt-1">{action.description}</p>
            </div>
            <div className="absolute bottom-0 right-0 opacity-10 z-0">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
