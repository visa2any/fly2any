// app/agent/notifications/page.tsx
// Agent Notifications Page - Level 6 Ultra-Premium
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import NotificationsPageContent from "@/components/agent/NotificationsPageContent";

export const metadata = {
  title: "Notifications - Agent Portal",
  description: "View your notifications",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const notifications = await prisma!.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return <NotificationsPageContent notifications={notifications} />;
}
