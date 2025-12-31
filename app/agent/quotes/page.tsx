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

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Get agent with quotes - NO DateTime fields
  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      quotes: {
        select: {
          id: true,
          title: true,
          status: true,
          total: true,
          currency: true,
          shareableLink: true,
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
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

  // Serialize with explicit primitives - NO DateTime
  const serializedQuotes = (agent.quotes || []).map((q: any) => ({
    id: String(q.id || ""),
    title: q.title ? String(q.title) : null,
    status: String(q.status || "DRAFT"),
    total: Number(q.total) || 0,
    currency: String(q.currency || "USD"),
    shareableLink: q.shareableLink ? String(q.shareableLink) : null,
    client: q.client ? {
      id: String(q.client.id || ""),
      firstName: q.client.firstName ? String(q.client.firstName) : null,
      lastName: q.client.lastName ? String(q.client.lastName) : null,
      email: q.client.email ? String(q.client.email) : null,
    } : null,
  }));

  const stats = {
    total: serializedQuotes.length,
    draft: serializedQuotes.filter((q) => q.status === "DRAFT").length,
    sent: serializedQuotes.filter((q) => q.status === "SENT").length,
    viewed: serializedQuotes.filter((q) => q.status === "VIEWED").length,
    accepted: serializedQuotes.filter((q) => q.status === "ACCEPTED").length,
    declined: serializedQuotes.filter((q) => q.status === "DECLINED").length,
    expired: serializedQuotes.filter((q) => q.status === "EXPIRED").length,
    converted: serializedQuotes.filter((q) => q.status === "CONVERTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Quotes</h1>
          <p className="text-gray-600 mt-1">View and manage your travel quotes</p>
        </div>
        <a
          href="/agent/quotes/workspace"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Quote
        </a>
      </div>

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

      <QuoteListClient quotes={serializedQuotes} />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    gray: "bg-gray-50 border-gray-200 text-gray-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    green: "bg-green-50 border-green-200 text-green-900",
    red: "bg-red-50 border-red-200 text-red-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    teal: "bg-teal-50 border-teal-200 text-teal-900",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color] || colorClasses.gray}`}>
      <p className="text-sm opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
