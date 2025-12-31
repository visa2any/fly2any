export const dynamic = 'force-dynamic';

// app/api/agents/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma!.notification.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATION_READ_ERROR]", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
