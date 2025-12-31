import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteListClient from "@/components/agent/QuoteListClient";

export const metadata = {
  title: "My Quotes | Agent Portal",
  description: "View and manage your travel quotes",
};

export default async function QuotesPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Get agent
  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
    include: {
      quotes: {
        include: {
          client: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Layout already shows pending banner for non-active agents
  // No need to block access - they can view quotes even while pending

  // Calculate quote statistics
  const stats = {
    total: agent.quotes.length,
    draft: agent.quotes.filter((q) => q.status === "DRAFT").length,
    sent: agent.quotes.filter((q) => q.status === "SENT").length,
    viewed: agent.quotes.filter((q) => q.status === "VIEWED").length,
    accepted: agent.quotes.filter((q) => q.status === "ACCEPTED").length,
    declined: agent.quotes.filter((q) => q.status === "DECLINED").length,
    expired: agent.quotes.filter((q) => q.status === "EXPIRED").length,
    converted: agent.quotes.filter((q) => q.status === "CONVERTED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Quotes</h1>
          <p className="text-gray-600 mt-1">View and manage your travel quotes</p>
        </div>
        <a
          href="/agent/quotes/workspace"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm shadow-primary-500/25"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Quote
        </a>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard label="Total" value={stats.total} color="gray" />
        <StatCard label="Draft" value={stats.draft} color="gray" />
        <StatCard label="Sent" value={stats.sent} color="blue" />
        <StatCard label="Viewed" value={stats.viewed} color="purple" />
        <StatCard label="Accepted" value={stats.accepted} color="green" />
        <StatCard label="Declined" value={stats.declined} color="red" />
        <StatCard label="Expired" value={stats.expired} color="orange" />
        <StatCard label="Converted" value={stats.converted} color="teal" />
      </div>

      {/* Quote List with Filters */}
      <QuoteListClient quotes={agent.quotes} />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    gray: "bg-gray-50 border-gray-200 text-gray-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    green: "bg-green-50 border-green-200 text-green-900",
    red: "bg-red-50 border-red-200 text-red-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    teal: "bg-teal-50 border-teal-200 text-teal-900",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-sm opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
