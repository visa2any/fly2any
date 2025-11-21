// app/agent/quotes/create/page.tsx
// Multi-Step Quote Builder - Main Page
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import QuoteBuilder from "@/components/agent/QuoteBuilder";

export const metadata = {
  title: "Create Quote - Agent Portal",
  description: "Build a comprehensive travel quote for your client",
};

export default async function CreateQuotePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/quotes/create");
  }

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
    include: {
      clients: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          lastName: "asc",
        },
      },
    },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Check if agent can create quotes
  if (agent.status !== "ACTIVE" && agent.status !== "PENDING") {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Status: {agent.status}</h2>
          <p className="text-gray-600 mb-6">
            Your account needs to be approved before you can create quotes.
          </p>
          <a
            href="/agent"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Quote</h1>
            <p className="text-gray-600 mt-1">
              Build a comprehensive travel quote for your client
            </p>
          </div>
          <a
            href="/agent/quotes"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Quotes
          </a>
        </div>
      </div>

      {/* Quote Builder Component */}
      <QuoteBuilder
        agent={agent}
        clients={agent.clients}
        products={[]}
        suppliers={[]}
      />
    </div>
  );
}
