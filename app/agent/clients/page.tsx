import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientListClient from "@/components/agent/ClientListClient";
import { isDemoSession, DEMO_CLIENTS } from "@/lib/demo/agent-demo-data";

export const metadata = {
  title: "Client Management | Agent Portal",
  description: "Manage your travel clients",
};

export default async function ClientsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const isDemo = isDemoSession(session);
  let serializedClients: any[];
  let maxClients = 500;

  if (isDemo) {
    serializedClients = DEMO_CLIENTS.map(c => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      segment: c.segment,
      status: c.status,
      _count: { quotes: c.quotesCount, bookings: c.bookingsCount },
    }));
  } else {
    const agent = await prisma?.travelAgent.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        maxClients: true,
        clients: {
          where: { status: { not: "ARCHIVED" } },
          select: {
            id: true, firstName: true, lastName: true, email: true, phone: true, segment: true, status: true,
            _count: { select: { quotes: true, bookings: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!agent) {
      redirect("/agent/register");
    }
    maxClients = agent.maxClients || 500;

    serializedClients = (agent.clients || []).map((c: any) => ({
      id: String(c.id || ""),
      firstName: c.firstName ? String(c.firstName) : null,
      lastName: c.lastName ? String(c.lastName) : null,
      email: c.email ? String(c.email) : null,
      phone: c.phone ? String(c.phone) : null,
      segment: String(c.segment || "STANDARD"),
      status: String(c.status || "ACTIVE"),
      _count: { quotes: Number(c._count?.quotes) || 0, bookings: Number(c._count?.bookings) || 0 },
    }));
  }

  const stats = {
    total: serializedClients.length,
    standard: serializedClients.filter((c) => c.segment === "STANDARD").length,
    vip: serializedClients.filter((c) => c.segment === "VIP").length,
    luxury: serializedClients.filter((c) => c.segment === "LUXURY").length,
    business: serializedClients.filter((c) => c.segment === "BUSINESS").length,
    withQuotes: serializedClients.filter((c) => c._count.quotes > 0).length,
    withBookings: serializedClients.filter((c) => c._count.bookings > 0).length,
    maxClients,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage your travel clients</p>
        </div>
        <a
          href="/agent/clients/create"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Client
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard label="Total Clients" value={stats.total} max={stats.maxClients} color="blue" icon="👥" />
        <StatCard label="VIP Clients" value={stats.vip} color="purple" icon="⭐" />
        <StatCard label="Active Quotes" value={stats.withQuotes} color="orange" icon="📋" />
        <StatCard label="Booked Trips" value={stats.withBookings} color="green" icon="✈️" />
        <StatCard label="Business" value={stats.business} color="teal" icon="💼" />
      </div>

      <ClientListClient clients={serializedClients} />
    </div>
  );
}

function StatCard({ label, value, max, color, icon }: { label: string; value: number; max?: number; color: string; icon: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
    green: "bg-green-50 border-green-200",
    teal: "bg-teal-50 border-teal-200",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {max && <span className="text-xs text-gray-600">/ {max}</span>}
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
