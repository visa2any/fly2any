import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ClientListClient from "@/components/agent/ClientListClient";

export const metadata = {
  title: "Client Management | Agent Portal",
  description: "Manage your travel clients",
};

export default async function ClientsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Get agent
  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
    include: {
      clients: {
        where: {
          status: { not: "ARCHIVED" },
        },
        include: {
          _count: {
            select: {
              quotes: true,
              bookings: true,
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

  // Layout already shows pending banner for non-active agents
  // No need to block access - they can manage clients even while pending

  // SERIALIZE clients for client component
  const serializedClients = JSON.parse(JSON.stringify(agent.clients || []));

  // Calculate client statistics
  const stats = {
    total: serializedClients.length,
    standard: serializedClients.filter((c: any) => c.segment === "STANDARD").length,
    vip: serializedClients.filter((c: any) => c.segment === "VIP").length,
    honeymoon: serializedClients.filter((c: any) => c.segment === "HONEYMOON").length,
    family: serializedClients.filter((c: any) => c.segment === "FAMILY").length,
    business: serializedClients.filter((c: any) => c.segment === "BUSINESS").length,
    corporate: serializedClients.filter((c: any) => c.segment === "CORPORATE").length,
    luxury: serializedClients.filter((c: any) => c.segment === "LUXURY").length,
    withQuotes: serializedClients.filter((c: any) => c._count?.quotes > 0).length,
    withBookings: serializedClients.filter((c: any) => c._count?.bookings > 0).length,
    maxClients: Number(agent.maxClients) || 100,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your travel clients and build lasting relationships
          </p>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Clients"
          value={stats.total}
          max={stats.maxClients}
          color="blue"
          icon="👥"
        />
        <StatCard label="VIP Clients" value={stats.vip} color="purple" icon="⭐" />
        <StatCard label="Active Quotes" value={stats.withQuotes} color="orange" icon="📋" />
        <StatCard label="Booked Trips" value={stats.withBookings} color="green" icon="✈️" />
        <StatCard
          label="Business/Corporate"
          value={stats.business + stats.corporate}
          color="teal"
          icon="💼"
        />
      </div>

      {/* Segment Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Segments</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <SegmentBadge label="Standard" count={stats.standard} />
          <SegmentBadge label="VIP" count={stats.vip} />
          <SegmentBadge label="Honeymoon" count={stats.honeymoon} />
          <SegmentBadge label="Family" count={stats.family} />
          <SegmentBadge label="Business" count={stats.business} />
          <SegmentBadge label="Corporate" count={stats.corporate} />
          <SegmentBadge label="Luxury" count={stats.luxury} />
        </div>
      </div>

      {/* Client List with Filters */}
      <ClientListClient clients={serializedClients} />
    </div>
  );
}

function StatCard({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max?: number;
  color: string;
  icon: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
    green: "bg-green-50 border-green-200",
    teal: "bg-teal-50 border-teal-200",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {max && (
          <span className="text-xs text-gray-600">
            / {max}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function SegmentBadge({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{count}</p>
    </div>
  );
}
