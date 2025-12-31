// app/agent/products/page.tsx
// Agent Products Catalog - Browse available travel products
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Products - Agent Portal",
  description: "Browse available travel products and services",
};

export default async function AgentProductsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/products");
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

  // Product categories with static data
  const products = [
    {
      id: "flights",
      name: "Flights",
      description: "Access to global flight inventory via Amadeus and Duffel APIs",
      icon: "✈️",
      features: ["Real-time pricing", "Multiple airlines", "Flexible booking"],
      commission: "2-5%",
      status: "active",
    },
    {
      id: "hotels",
      name: "Hotels",
      description: "180+ cities worldwide hotel inventory via Amadeus",
      icon: "🏨",
      features: ["Best rate guarantee", "Instant confirmation", "Flexible cancellation"],
      commission: "8-15%",
      status: "active",
    },
    {
      id: "activities",
      name: "Tours & Activities",
      description: "Curated experiences and activities",
      icon: "🎫",
      features: ["Skip-the-line tickets", "Expert guides", "Instant booking"],
      commission: "10-20%",
      status: "active",
    },
    {
      id: "transfers",
      name: "Airport Transfers",
      description: "Reliable ground transportation services",
      icon: "🚐",
      features: ["Meet & greet", "Professional drivers", "Fixed prices"],
      commission: "10-15%",
      status: "active",
    },
    {
      id: "insurance",
      name: "Travel Insurance",
      description: "Comprehensive travel protection plans",
      icon: "🛡️",
      features: ["Medical coverage", "Trip cancellation", "24/7 assistance"],
      commission: "20-30%",
      status: "coming_soon",
    },
    {
      id: "car_rentals",
      name: "Car Rentals",
      description: "Vehicle rentals from major providers",
      icon: "🚗",
      features: ["Wide selection", "Competitive rates", "Easy pickup"],
      commission: "8-12%",
      status: "coming_soon",
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

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-lg border p-6 ${
              product.status === "coming_soon" ? "opacity-60" : "hover:shadow-md transition-shadow"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{product.icon}</span>
              {product.status === "coming_soon" && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  Coming Soon
                </span>
              )}
              {product.status === "active" && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  Active
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{product.description}</p>

            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Features:</p>
              <div className="flex flex-wrap gap-1">
                {product.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Commission</p>
                <p className="text-sm font-medium text-green-600">{product.commission}</p>
              </div>
              {product.status === "active" && (
                <Link
                  href={`/agent/quotes/workspace?product=${product.id}`}
                  className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  Add to Quote
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Commission Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-blue-800">Commission Rates</p>
            <p className="text-sm text-blue-700 mt-1">
              Commission rates vary by product type and booking value. Higher-tier agents receive better rates.
              View your personalized rates in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
