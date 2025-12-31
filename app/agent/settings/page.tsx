// app/agent/settings/page.tsx
// Agent Settings - Profile and preferences management
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/agent/SettingsClient";

export const metadata = {
  title: "Settings - Agent Portal",
  description: "Manage your profile and preferences",
};

export default async function AgentSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/settings");
  }

  // Use select: to avoid DateTime fields
  const agentRaw = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      tier: true,
      status: true,
      businessName: true,
      contactName: true,
      phone: true,
      website: true,
      address: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
      bio: true,
      specializations: true,
      languages: true,
      certifications: true,
      payoutMethod: true,
      paypalEmail: true,
      bankName: true,
      bankAccountLast4: true,
      commissionRate: true,
      notificationPreferences: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!agentRaw) {
    redirect("/agent/register");
  }

  // Explicit primitive serialization
  const serializedAgent = {
    id: String(agentRaw.id || ""),
    tier: String(agentRaw.tier || "STARTER"),
    status: String(agentRaw.status || "PENDING"),
    businessName: agentRaw.businessName ? String(agentRaw.businessName) : null,
    contactName: agentRaw.contactName ? String(agentRaw.contactName) : null,
    phone: agentRaw.phone ? String(agentRaw.phone) : null,
    website: agentRaw.website ? String(agentRaw.website) : null,
    address: agentRaw.address ? String(agentRaw.address) : null,
    city: agentRaw.city ? String(agentRaw.city) : null,
    state: agentRaw.state ? String(agentRaw.state) : null,
    country: agentRaw.country ? String(agentRaw.country) : null,
    postalCode: agentRaw.postalCode ? String(agentRaw.postalCode) : null,
    bio: agentRaw.bio ? String(agentRaw.bio) : null,
    specializations: Array.isArray(agentRaw.specializations)
      ? agentRaw.specializations.map((s: any) => String(s))
      : [],
    languages: Array.isArray(agentRaw.languages)
      ? agentRaw.languages.map((l: any) => String(l))
      : [],
    certifications: Array.isArray(agentRaw.certifications)
      ? agentRaw.certifications.map((c: any) => String(c))
      : [],
    payoutMethod: agentRaw.payoutMethod ? String(agentRaw.payoutMethod) : null,
    paypalEmail: agentRaw.paypalEmail ? String(agentRaw.paypalEmail) : null,
    bankName: agentRaw.bankName ? String(agentRaw.bankName) : null,
    bankAccountLast4: agentRaw.bankAccountLast4 ? String(agentRaw.bankAccountLast4) : null,
    commissionRate: Number(agentRaw.commissionRate) || 0,
    notificationPreferences: agentRaw.notificationPreferences || {},
  };

  const serializedUser = {
    id: String(agentRaw.user?.id || ""),
    name: agentRaw.user?.name ? String(agentRaw.user.name) : null,
    email: agentRaw.user?.email ? String(agentRaw.user.email) : "",
    image: agentRaw.user?.image ? String(agentRaw.user.image) : null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile, preferences, and account settings
        </p>
      </div>

      <SettingsClient agent={serializedAgent} user={serializedUser} />
    </div>
  );
}
