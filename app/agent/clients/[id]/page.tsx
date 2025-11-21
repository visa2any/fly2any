import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ClientDetailClient from "@/components/agent/ClientDetailClient";

export const metadata = {
  title: "Client Profile | Agent Portal",
  description: "View client details",
};

interface Props {
  params: {
    id: string;
  };
}

export default async function ClientDetailPage({ params }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Get agent
  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Layout already shows pending banner for non-active agents
  // No need to block access - they can view client details even while pending

  // Get client with all related data
  const client = await prisma!.agentClient.findFirst({
    where: {
      id: params.id,
      agentId: agent.id, // Ensure agent owns this client
    },
    include: {
      _count: {
        select: {
          quotes: true,
          bookings: true,
          clientNotes: true,
          documents: true,
        },
      },
      quotes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quoteNumber: true,
          tripName: true,
          destination: true,
          startDate: true,
          endDate: true,
          travelers: true,
          total: true,
          currency: true,
          status: true,
          createdAt: true,
          sentAt: true,
          acceptedAt: true,
          declinedAt: true,
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          confirmationNumber: true,
          tripName: true,
          destination: true,
          startDate: true,
          endDate: true,
          travelers: true,
          totalPrice: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      },
      clientNotes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
            {client.isVip && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                ⭐ VIP Client
              </span>
            )}
            <SegmentBadge segment={client.segment} />
          </div>
          <p className="text-gray-600">{client.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/agent/quotes/create?clientId=${client.id}`}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Create Quote
          </a>
          <a
            href="/agent/clients"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ← Back to Clients
          </a>
        </div>
      </div>

      {/* Client Detail Component */}
      <ClientDetailClient client={client} />
    </div>
  );
}

function SegmentBadge({ segment }: { segment: string }) {
  const badges = {
    STANDARD: { bg: "bg-gray-100", text: "text-gray-800", label: "Standard" },
    VIP: { bg: "bg-purple-100", text: "text-purple-800", label: "VIP" },
    HONEYMOON: { bg: "bg-pink-100", text: "text-pink-800", label: "Honeymoon" },
    FAMILY: { bg: "bg-blue-100", text: "text-blue-800", label: "Family" },
    BUSINESS: { bg: "bg-teal-100", text: "text-teal-800", label: "Business" },
    GROUP_ORGANIZER: { bg: "bg-orange-100", text: "text-orange-800", label: "Group" },
    CORPORATE: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Corporate" },
    LUXURY: { bg: "bg-amber-100", text: "text-amber-800", label: "Luxury" },
  };

  const badge = badges[segment as keyof typeof badges] || badges.STANDARD;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}
    >
      {badge.label}
    </span>
  );
}
