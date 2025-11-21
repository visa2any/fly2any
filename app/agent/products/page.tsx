// app/agent/products/page.tsx
// Agent Products Catalog - Browse available travel products
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductsClient from "@/components/agent/ProductsClient";

export const metadata = {
  title: "Products - Agent Portal",
  description: "Browse available travel products and services",
};

export default async function AgentProductsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/products");
  }

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch products from integration APIs
  // For now, returning static product categories
  const products = [
    {
      id: "flights",
      name: "Flights",
      description: "Access to global flight inventory via Amadeus and Duffel APIs",
      icon: "✈️",
      features: ["Real-time pricing", "Multiple airlines", "Flexible booking"],
    },
    {
      id: "hotels",
      description: "180+ cities worldwide hotel inventory via Amadeus",
      icon: "🏨",
      features: ["Best rate guarantee", "Instant confirmation", "Flexible cancellation"],
    },
    {
      id: "activities",
      name: "Tours & Activities",
      description: "Curated experiences and activities",
      icon: "🎫",
      features: ["Skip-the-line tickets", "Expert guides", "Instant booking"],
    },
    {
      id: "transfers",
      name: "Airport Transfers",
      description: "Reliable ground transportation services",
      icon: "🚐",
      features: ["Meet & greet", "Professional drivers", "Fixed prices"],
    },
    {
      id: "insurance",
      name: "Travel Insurance",
      description: "Comprehensive travel protection plans",
      icon: "🛡️",
      features: ["Medical coverage", "Trip cancellation", "24/7 assistance"],
    },
    {
      id: "car_rentals",
      name: "Car Rentals",
      description: "Vehicle rentals from major providers",
      icon: "🚗",
      features: ["Wide selection", "Competitive rates", "Easy pickup"],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products Catalog</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and learn about available travel products and services
        </p>
      </div>

      <ProductsClient products={products} />
    </div>
  );
}
