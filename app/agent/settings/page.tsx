// app/agent/settings/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings - Agent Portal",
  description: "Manage your profile and preferences",
};

export default async function AgentSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/settings");
  }

  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      tier: true,
      status: true,
      businessName: true,
      agencyName: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      website: true,
      address: true,
      city: true,
      state: true,
      country: true,
      payoutMethod: true,
      payoutEmail: true,
      emailNotifications: true,
      smsNotifications: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  const settings = {
    id: String(agent.id),
    tier: String(agent.tier || "INDEPENDENT"),
    status: String(agent.status || "PENDING"),
    businessName: agent.businessName ? String(agent.businessName) : null,
    agencyName: agent.agencyName ? String(agent.agencyName) : null,
    firstName: agent.firstName ? String(agent.firstName) : null,
    lastName: agent.lastName ? String(agent.lastName) : null,
    email: agent.email ? String(agent.email) : null,
    phone: agent.phone ? String(agent.phone) : null,
    website: agent.website ? String(agent.website) : null,
    address: agent.address ? String(agent.address) : null,
    city: agent.city ? String(agent.city) : null,
    state: agent.state ? String(agent.state) : null,
    country: agent.country ? String(agent.country) : null,
    payoutMethod: agent.payoutMethod ? String(agent.payoutMethod) : "stripe",
    payoutEmail: agent.payoutEmail ? String(agent.payoutEmail) : null,
    emailNotifications: Boolean(agent.emailNotifications),
    smsNotifications: Boolean(agent.smsNotifications),
    userName: agent.user?.name ? String(agent.user.name) : null,
    userEmail: agent.user?.email ? String(agent.user.email) : null,
    userImage: agent.user?.image ? String(agent.user.image) : null,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{settings.firstName} {settings.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{settings.email || settings.userEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{settings.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Business Name</p>
            <p className="font-medium">{settings.businessName || settings.agencyName || "-"}</p>
          </div>
        </div>
      </div>

      {/* Business Address */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Business Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{settings.address || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">City</p>
            <p className="font-medium">{settings.city || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">State</p>
            <p className="font-medium">{settings.state || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="font-medium">{settings.country || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <p className="font-medium">{settings.website || "-"}</p>
          </div>
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Payout Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Payout Method</p>
            <p className="font-medium capitalize">{settings.payoutMethod}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payout Email</p>
            <p className="font-medium">{settings.payoutEmail || "Not set"}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Email Notifications</span>
            <span className={`px-2 py-1 text-xs rounded-full ${settings.emailNotifications ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {settings.emailNotifications ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>SMS Notifications</span>
            <span className={`px-2 py-1 text-xs rounded-full ${settings.smsNotifications ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {settings.smsNotifications ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Account Tier</p>
            <p className="text-2xl font-bold">{settings.tier}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm ${settings.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"}`}>
              {settings.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
