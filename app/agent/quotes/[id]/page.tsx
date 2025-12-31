import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteDetailClient from "@/components/agent/QuoteDetailClient";

export const metadata = {
  title: "Quote Details | Agent Portal",
  description: "View quote details",
};

interface Props {
  params: {
    id: string;
  };
}

export default async function QuoteDetailPage({ params }: Props) {
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
  // No need to block access - they can view quotes even while pending

  // Get quote with payment link fields
  const quote = await prisma!.agentQuote.findUnique({
    where: {
      id: params.id,
      agentId: agent.id,
    },
    include: {
      client: true,
      booking: {
        select: { id: true, confirmationNumber: true },
      },
    },
  });

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{quote.tripName}</h1>
            <StatusBadge status={quote.status} />
          </div>
          <p className="text-gray-600">Quote #{quote.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <a
          href="/agent/quotes"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back to Quotes
        </a>
      </div>

      {/* Quote Detail Component */}
      <QuoteDetailClient quote={quote} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const badges = {
    DRAFT: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
    SENT: { bg: "bg-blue-100", text: "text-blue-800", label: "Sent" },
    VIEWED: { bg: "bg-purple-100", text: "text-purple-800", label: "Viewed" },
    ACCEPTED: { bg: "bg-green-100", text: "text-green-800", label: "Accepted" },
    DECLINED: { bg: "bg-red-100", text: "text-red-800", label: "Declined" },
    EXPIRED: { bg: "bg-orange-100", text: "text-orange-800", label: "Expired" },
    CONVERTED: { bg: "bg-teal-100", text: "text-teal-800", label: "Converted" },
  };

  const badge = badges[status as keyof typeof badges] || badges.DRAFT;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
}
