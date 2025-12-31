// app/agent/suppliers/page.tsx
// Agent Suppliers Directory - Partner supplier information
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Suppliers - Agent Portal",
  description: "View partner suppliers and service providers",
};

export default async function AgentSuppliersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/suppliers");
  }

  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Static supplier data
  const suppliers = [
    {
      id: "amadeus",
      name: "Amadeus",
      type: "GDS",
      description: "Global distribution system for flights and hotels",
      services: ["Flights", "Hotels", "Car Rentals"],
      status: "active",
      logo: "🌐",
    },
    {
      id: "duffel",
      name: "Duffel",
      type: "Flight API",
      description: "Modern flight booking API with real-time inventory",
      services: ["Flights"],
      status: "active",
      logo: "✈️",
    },
    {
      id: "liteapi",
      name: "LiteAPI",
      type: "Hotel API",
      description: "Premium hotel inventory aggregator",
      services: ["Hotels"],
      status: "active",
      logo: "🏨",
    },
    {
      id: "viator",
      name: "Viator",
      type: "Activities",
      description: "World's largest activities and experiences platform",
      services: ["Tours", "Activities", "Attractions"],
      status: "active",
      logo: "🎫",
    },
    {
      id: "transferz",
      name: "TransferZ",
      type: "Transfers",
      description: "Global airport transfer services",
      services: ["Airport Transfers", "Private Transfers"],
      status: "active",
      logo: "🚐",
    },
  ];

  const typeColors: Record<string, string> = {
    GDS: "bg-purple-100 text-purple-700",
    "Flight API": "bg-blue-100 text-blue-700",
    "Hotel API": "bg-green-100 text-green-700",
    Activities: "bg-orange-100 text-orange-700",
    Transfers: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supplier Directory</h1>
        <p className="mt-1 text-sm text-gray-500">
          Partner suppliers and service providers
        </p>
      </div>

      {/* Supplier Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Suppliers</p>
          <p className="text-2xl font-bold">{suppliers.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-900">
            {suppliers.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Service Types</p>
          <p className="text-2xl font-bold text-blue-900">
            {new Set(suppliers.map((s) => s.type)).size}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">Total Services</p>
          <p className="text-2xl font-bold text-purple-900">
            {suppliers.reduce((sum, s) => sum + s.services.length, 0)}
          </p>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{supplier.logo}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${typeColors[supplier.type] || "bg-gray-100 text-gray-700"}`}>
                  {supplier.type}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{supplier.description}</p>

            <div>
              <p className="text-xs text-gray-500 mb-2">Services:</p>
              <div className="flex flex-wrap gap-1">
                {supplier.services.map((service) => (
                  <span
                    key={service}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connected
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-blue-800">Supplier Integrations</p>
            <p className="text-sm text-blue-700 mt-1">
              All supplier integrations are managed by Fly2Any. You have instant access to all
              available inventory through your agent portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
