// app/agent/suppliers/page.tsx
// Agent Suppliers Directory - Partner supplier information
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SuppliersClient from "@/components/agent/SuppliersClient";

export const metadata = {
  title: "Suppliers - Agent Portal",
  description: "View partner suppliers and service providers",
};

export default async function AgentSuppliersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/suppliers");
  }

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch suppliers - for now using static data
  const suppliers = [
    {
      id: "amadeus",
      name: "Amadeus",
      type: "GDS",
      description: "Global distribution system for flights and hotels",
      services: ["Flights", "Hotels", "Car Rentals"],
      contact: "api.support@amadeus.com",
      website: "https://developers.amadeus.com",
    },
    {
      id: "duffel",
      name: "Duffel",
      type: "Flight API",
      description: "Modern flight booking API with real-time inventory",
      services: ["Flights"],
      contact: "support@duffel.com",
      website: "https://duffel.com",
    },
    {
      id: "viator",
      name: "Viator",
      type: "Activities",
      description: "World's largest activities and experiences platform",
      services: ["Tours", "Activities", "Attractions"],
      contact: "partners@viator.com",
      website: "https://www.viator.com",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supplier Directory</h1>
        <p className="mt-1 text-sm text-gray-500">
          Partner suppliers and service providers
        </p>
      </div>

      <SuppliersClient suppliers={suppliers} />
    </div>
  );
}
