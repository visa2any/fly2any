// app/agent/settings/page.tsx
// Agent Settings - Profile and preferences management
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
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

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
    include: {
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

  if (!agent) {
    redirect("/agent/register");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile, preferences, and account settings
        </p>
      </div>

      <SettingsClient agent={agent} user={agent.user} />
    </div>
  );
}
