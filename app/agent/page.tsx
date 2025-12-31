// app/agent/page.tsx
// MINIMAL TEST - No database, no components
export const metadata = {
  title: "Dashboard - Agent Portal",
  description: "Travel agent dashboard",
};

export default function AgentDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
      <p className="text-gray-600 mt-2">Minimal test page - if you see this, layout works!</p>
    </div>
  );
}
