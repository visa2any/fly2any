import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
          sender: { select: { id: true, name: true, image: true } }
      }
    });

    // Mark as read (optimistic)
    // We should check if user is recipient before resetting unread count
    // Skipping complex logic for MVP

    return NextResponse.json({ data: messages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content } = await req.json();

    const conversation = await prisma.conversation.findUnique({ where: { id: params.id } });
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Determine roles
    const isHost = session.user.id === conversation.hostId;
    
    // Create message
    const message = await prisma.message.create({
        data: {
            conversationId: params.id,
            senderId: session.user.id,
            content
        }
    });

    // Update conversation metrics
    await prisma.conversation.update({
        where: { id: params.id },
        data: {
            lastMessage: content,
            lastMessageAt: new Date(),
            unreadCountGuest: isHost ? { increment: 1 } : conversation.unreadCountGuest,
            unreadCountHost: !isHost ? { increment: 1 } : conversation.unreadCountHost
        }
    });

    return NextResponse.json({ data: message });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
