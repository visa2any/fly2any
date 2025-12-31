// app/agent/page.tsx
// Agent Dashboard - SIMPLIFIED for debugging
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAgentWithAdminFallback } from "@/lib/auth-helpers";

export const metadata = {
  title: "Dashboard - Agent Portal",
  description: "Travel agent dashboard",
};

export default async function AgentDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent");
  }

  // Get agent with admin fallback
  const agent = await getAgentWithAdminFallback(session.user.id);

  if (!agent) {
    redirect("/agent/register");
  }

  // Return minimal UI to test
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome back, {agent.agencyName || session.user.name || "Agent"}!
      </h1>
      <p className="text-gray-600">Agent ID: {agent.id}</p>
      <p className="text-gray-600">Status: {agent.status}</p>
      <p className="text-gray-600 mt-4">Dashboard is loading...</p>
      <a href="/agent/quotes" className="text-blue-600 hover:underline block mt-4">Go to Quotes</a>
      <a href="/agent/bookings" className="text-blue-600 hover:underline block mt-2">Go to Bookings</a>
    </div>
  );
}
