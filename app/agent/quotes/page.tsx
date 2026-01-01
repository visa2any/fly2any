import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Quotes | Agent Portal",
  description: "View and manage your travel quotes",
};

export default async function QuotesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch quotes separately with correct field names
  const quotesRaw = await prisma?.agentQuote.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      tripName: true,
      quoteNumber: true,
      status: true,
      total: true,
      currency: true,
      destination: true,
      client: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const quotes = (quotesRaw || []).map((q: any) => ({
    id: String(q.id || ""),
    title: q.tripName ? String(q.tripName) : "Untitled Quote",
    quoteNumber: q.quoteNumber ? String(q.quoteNumber) : null,
    status: String(q.status || "DRAFT"),
    total: Number(q.total) || 0,
    currency: String(q.currency || "USD"),
    destination: q.destination ? String(q.destination) : null,
    clientName: q.client
      ? `${q.client.firstName || ""} ${q.client.lastName || ""}`.trim() || "No Client"
      : "No Client",
  }));

  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === "DRAFT").length,
    sent: quotes.filter((q) => q.status === "SENT").length,
    accepted: quotes.filter((q) => q.status === "ACCEPTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Quotes</h1>
          <p className="text-gray-600">Manage your travel quotes</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/agent/quotes/analytics"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>
          <Link
            href="/agent/quotes/workspace"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Quote
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Sent</p>
          <p className="text-2xl font-bold text-blue-900">{stats.sent}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Accepted</p>
          <p className="text-2xl font-bold text-green-900">{stats.accepted}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold">{stats.draft}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No quotes yet. Create your first quote!
                </td>
              </tr>
            ) : (
              quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{quote.title}</td>
                  <td className="px-4 py-3 text-gray-600">{quote.clientName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quote.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                      quote.status === "SENT" ? "bg-blue-100 text-blue-700" :
                      quote.status === "DECLINED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${quote.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/agent/quotes/${quote.id}`}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
