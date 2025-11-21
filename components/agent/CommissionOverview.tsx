// components/agent/CommissionOverview.tsx
"use client";

import Link from "next/link";

interface CommissionOverviewProps {
  data: {
    available: number;
    pending: number;
    paid: number;
    total: number;
  };
}

export default function CommissionOverview({ data }: CommissionOverviewProps) {
  const commissionBreakdown = [
    {
      label: "Available for Payout",
      amount: data.available,
      color: "text-success-600",
      bgColor: "bg-success-50",
      borderColor: "border-success-200",
      icon: (
        <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Ready to withdraw",
    },
    {
      label: "Pending Commissions",
      amount: data.pending,
      color: "text-warning-600",
      bgColor: "bg-warning-50",
      borderColor: "border-warning-200",
      icon: (
        <svg className="w-5 h-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "In hold period or trip in progress",
    },
    {
      label: "Total Paid Out",
      amount: data.paid,
      color: "text-info-600",
      bgColor: "bg-info-50",
      borderColor: "border-info-200",
      icon: (
        <svg className="w-5 h-5 text-info-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: "Lifetime payouts received",
    },
  ];

  const totalPercentage = data.total > 0 ? (data.available / data.total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Commission Overview</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Lifetime: <span className="font-semibold text-gray-900">${data.total.toLocaleString()}</span>
          </p>
        </div>
        <Link
          href="/agent/commissions"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {commissionBreakdown.map((item) => (
          <div
            key={item.label}
            className={`${item.bgColor} ${item.borderColor} border rounded-lg p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              {item.icon}
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>
              ${item.amount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {data.total > 0 && (
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Availability Progress</span>
            <span className="font-medium text-gray-900">{totalPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-success-500 to-success-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {data.available > 0
              ? "You have funds available for payout"
              : "Commissions will become available after hold periods"}
          </p>
        </div>
      )}

      {/* Request Payout Button */}
      {data.available > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/agent/payouts/request"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-success-600 to-success-700 text-white text-sm font-medium rounded-lg hover:from-success-700 hover:to-success-800 shadow-sm transition-all"
            aria-label={`Request payout of $${data.available.toLocaleString()}`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Request Payout (${data.available.toLocaleString()} Available)
          </Link>
        </div>
      )}
    </div>
  );
}
