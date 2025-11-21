import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ClientFormClient from "@/components/agent/ClientFormClient";

export const metadata = {
  title: "Add Client | Agent Portal",
  description: "Add a new client to your portfolio",
};

export default async function CreateClientPage() {
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

  if (agent.status !== "ACTIVE") {
    redirect("/agent/pending");
  }

  // Check client limit
  const clientCount = await prisma!.agentClient.count({
    where: {
      agentId: agent.id,
      status: { not: "ARCHIVED" },
    },
  });

  if (clientCount >= agent.maxClients) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Limit Reached</h2>
          <p className="text-gray-600 mb-6">
            You've reached your maximum of {agent.maxClients} clients. Please upgrade your plan to add
            more clients.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/agent/clients"
              className="inline-block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back to Clients
            </a>
            <a
              href="/agent/settings/plan"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Upgrade Plan
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
            <p className="text-gray-600 mt-2">Start with just the essentials or create a complete profile</p>
          </div>
          <a
            href="/agent/clients"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Clients
          </a>
        </div>
      </div>

      {/* Client Form Component - Now with full-width layout and quick mode support */}
      <ClientFormClient mode="create" quickMode={true} />
    </div>
  );
}
