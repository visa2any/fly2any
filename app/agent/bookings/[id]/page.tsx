// app/agent/bookings/[id]/page.tsx
// Agent Booking Detail Page — Level 6 / Level 3-4 Hybrid
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import BookingDetailClient from "./BookingDetailClient";

export const metadata = {
  title: "Booking Details - Agent Portal",
};

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/bookings");
  }

  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!agent || agent.status !== "ACTIVE") {
    redirect("/agent");
  }

  const booking = await prisma?.agentBooking.findFirst({
    where: {
      id: params.id,
      agentId: agent.id,
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      quote: {
        select: {
          id: true,
          quoteNumber: true,
          createdAt: true,
          sentAt: true,
          acceptedAt: true,
          agentMarkupPercent: true,
        },
      },
      commissions: {
        select: {
          id: true,
          agentEarnings: true,
          platformFee: true,
          status: true,
          holdUntil: true,
          grossProfit: true,
        },
      },
    },
  });

  if (!booking) {
    redirect("/agent/bookings");
  }

  // Serialize for client component
  const serialized = JSON.parse(JSON.stringify(booking));

  return <BookingDetailClient booking={serialized} />;
}
