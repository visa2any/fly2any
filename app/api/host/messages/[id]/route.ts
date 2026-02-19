import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify user is a participant in this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      select: { hostId: true, guestId: true },
    });

    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (conversation.hostId !== session.user.id && conversation.guestId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    });

    // Reset unread count for the current user
    const isHost = session.user.id === conversation.hostId;
    await prisma.conversation.update({
      where: { id: params.id },
      data: isHost ? { unreadCountHost: 0 } : { unreadCountGuest: 0 },
    }).catch(() => {});

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content } = await req.json();
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({ where: { id: params.id } });
    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Verify user is a participant
    if (conversation.hostId !== session.user.id && conversation.guestId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isHost = session.user.id === conversation.hostId;
    
    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: session.user.id,
        content: content.trim(),
      }
    });

    // Update conversation: increment unread for the OTHER participant
    await prisma.conversation.update({
      where: { id: params.id },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
        ...(isHost
          ? { unreadCountGuest: { increment: 1 } }
          : { unreadCountHost: { increment: 1 } }
        ),
      }
    });

    return NextResponse.json({ data: message });

  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
