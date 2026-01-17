// app/agent/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DEMO_STATS, DEMO_RECENT_QUOTES } from "@/lib/demo/agent-demo-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard - Agent Portal",
  description: "Travel agent dashboard",
};

export default async function AgentDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent");
  }

  // Check if demo mode
  const isDemo = session.user.id === 'demo-agent-001' || session.user.email === 'demo@fly2any.com';

  let agent: { id: string; tier: string; businessName: string | null };
  let quotesCount: number;
  let bookingsCount: number;
  let clientsCount: number;
  let totalEarnings: number;
  let recentQuotes: Array<{ id: string; tripName: string; status: string; total: number; destination: string | null }>;

  if (isDemo) {
    // Use demo data
    agent = { id: 'demo-agent-001', tier: 'DEMO', businessName: 'Demo Travel Agency' };
    quotesCount = DEMO_STATS.quotesCount;
    bookingsCount = DEMO_STATS.bookingsCount;
    clientsCount = DEMO_STATS.clientsCount;
    totalEarnings = DEMO_STATS.totalEarnings;
    recentQuotes = DEMO_RECENT_QUOTES.map(q => ({
      id: q.id,
      tripName: q.tripName,
      status: q.status,
      total: q.total,
      destination: q.destination,
    }));
  } else {
    // Normal flow - fetch from DB
    const dbAgent = await prisma?.travelAgent.findUnique({
      where: { userId: session.user.id },
      select: { id: true, tier: true, businessName: true },
    });

    if (!dbAgent) {
      redirect("/agent/register");
    }

    agent = { id: dbAgent.id, tier: dbAgent.tier, businessName: dbAgent.businessName };

    const [qc, bc, cc, cd] = await Promise.all([
      prisma?.agentQuote.count({ where: { agentId: agent.id } }) || 0,
      prisma?.agentBooking.count({ where: { agentId: agent.id } }) || 0,
      prisma?.agentClient.count({ where: { agentId: agent.id, status: { not: "ARCHIVED" } } }) || 0,
      prisma?.agentCommission.aggregate({
        where: { agentId: agent.id, status: { not: "CANCELLED" } },
        _sum: { agentEarnings: true },
      }),
    ]);

    quotesCount = qc;
    bookingsCount = bc;
    clientsCount = cc;
    totalEarnings = Number(cd?._sum?.agentEarnings) || 0;

    const recentQuotesRaw = await prisma?.agentQuote.findMany({
      where: { agentId: agent.id },
      select: { id: true, tripName: true, status: true, total: true, destination: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    recentQuotes = (recentQuotesRaw || []).map((q: any) => ({
      id: String(q.id),
      tripName: String(q.tripName || "Untitled"),
      status: String(q.status || "DRAFT"),
      total: Number(q.total) || 0,
      destination: q.destination ? String(q.destination) : null,
    }));
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SENT: "bg-blue-100 text-blue-700",
    VIEWED: "bg-purple-100 text-purple-700",
    ACCEPTED: "bg-green-100 text-green-700",
    DECLINED: "bg-red-100 text-red-700",
    EXPIRED: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-4">
      {/* Hero Header with Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80')] bg-cover bg-center" />
        </div>
        <div className="relative">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-blue-100 text-sm mt-1">
            Welcome back{agent.businessName ? `, ${agent.businessName}` : ""}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/agent/quotes" className="relative overflow-hidden bg-white p-4 rounded-xl border hover:shadow-lg transition-all group">
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80')] bg-cover bg-center" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Quotes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{quotesCount}</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
        </Link>

        <Link href="/agent/bookings" className="relative overflow-hidden bg-white p-4 rounded-xl border hover:shadow-lg transition-all group">
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80')] bg-cover bg-center" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{bookingsCount}</p>
            </div>
            <span className="text-2xl">✈️</span>
          </div>
        </Link>

        <Link href="/agent/clients" className="relative overflow-hidden bg-white p-4 rounded-xl border hover:shadow-lg transition-all group">
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=80')] bg-cover bg-center" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{clientsCount}</p>
            </div>
            <span className="text-2xl">👥</span>
          </div>
        </Link>

        <Link href="/agent/commissions" className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl text-white hover:shadow-xl transition-all group">
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80')] bg-cover bg-center" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-100 font-medium">Earnings</p>
              <p className="text-2xl font-bold mt-1" suppressHydrationWarning>${totalEarnings.toLocaleString()}</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </Link>
      </div>

      {/* Quick Actions & Recent Quotes - Side by Side */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/agent/quotes/workspace"
              className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <span className="text-xl">✨</span>
              <span className="text-sm font-medium text-primary-700">New Quote</span>
            </Link>
            <Link
              href="/agent/clients/create"
              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-xl">👤</span>
              <span className="text-sm font-medium text-blue-700">Add Client</span>
            </Link>
            <Link
              href="/agent/products"
              className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-xl">🎫</span>
              <span className="text-sm font-medium text-purple-700">Products</span>
            </Link>
            <Link
              href="/agent/payouts"
              className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-xl">💵</span>
              <span className="text-sm font-medium text-green-700">Payouts</span>
            </Link>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Quotes</h2>
            <Link href="/agent/quotes" className="text-xs text-primary-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          {recentQuotes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">No quotes yet.</p>
              <Link href="/agent/quotes/workspace" className="text-primary-600 hover:underline mt-2 inline-block text-xs">
                Create your first quote
              </Link>
            </div>
          ) : (
            <div className="divide-y max-h-[200px] overflow-y-auto">
              {recentQuotes.slice(0, 3).map((quote) => (
                <Link
                  key={quote.id}
                  href={`/agent/quotes/${quote.id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">{quote.tripName}</p>
                    {quote.destination && (
                      <p className="text-xs text-gray-500 truncate">{quote.destination}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${statusColors[quote.status] || "bg-gray-100"} whitespace-nowrap`}>
                      {quote.status}
                    </span>
                    <span className="font-medium text-gray-900 text-sm whitespace-nowrap" suppressHydrationWarning>${quote.total.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
