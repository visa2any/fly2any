// app/agent/register/page.tsx
// Agent Registration Page
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AgentRegistrationForm from "@/components/agent/AgentRegistrationForm";

export const metadata = {
  title: "Register as Travel Agent - Fly2Any",
  description: "Join Fly2Any's travel agent program and start earning commissions",
};

export default async function AgentRegisterPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/register");
  }

  // Check if already registered
  const existingAgent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (existingAgent) {
    redirect("/agent");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join the Fly2Any Agent Program
          </h1>
          <p className="text-lg text-gray-600">
            Start building amazing travel experiences and earning competitive commissions
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Competitive Commissions</h3>
            <p className="text-sm text-gray-600">
              Start at 95% revenue share (5% platform fee) and grow to 98.5%
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Powerful Tools</h3>
            <p className="text-sm text-gray-600">
              Multi-product quote builder, CRM, and booking management in one platform
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Setup</h3>
            <p className="text-sm text-gray-600">
              Get approved in 24-48 hours and start creating quotes immediately
            </p>
          </div>
        </div>

        {/* Tier Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Tier</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-4">Tier</th>
                  <th className="text-left py-3 px-4">Platform Fee</th>
                  <th className="text-left py-3 px-4">Max Clients</th>
                  <th className="text-left py-3 px-4">Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 pr-4">
                    <span className="font-medium text-gray-900">Independent</span>
                    <p className="text-xs text-gray-500">Perfect for solo agents</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">5%</td>
                  <td className="py-3 px-4">100</td>
                  <td className="py-3 px-4 text-gray-600">Full platform access</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    <span className="font-medium text-gray-900">Professional</span>
                    <p className="text-xs text-gray-500">$10K+ monthly sales</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">3%</td>
                  <td className="py-3 px-4">500</td>
                  <td className="py-3 px-4 text-gray-600">+ Priority support</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    <span className="font-medium text-gray-900">Agency Partner</span>
                    <p className="text-xs text-gray-500">$50K+ monthly sales</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">2%</td>
                  <td className="py-3 px-4">2,000</td>
                  <td className="py-3 px-4 text-gray-600">+ Team management</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    <span className="font-medium text-gray-900">White Label</span>
                    <p className="text-xs text-gray-500">Application required</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">1.5%</td>
                  <td className="py-3 px-4">Unlimited</td>
                  <td className="py-3 px-4 text-gray-600">+ Custom branding</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * You'll start in the Independent tier and can upgrade as your sales grow
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Registration Details</h2>
          <AgentRegistrationForm user={session.user} />
        </div>

        {/* Terms */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By registering, you agree to our{" "}
          <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
