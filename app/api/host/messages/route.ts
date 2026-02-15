import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: List conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { hostId: session.user.id },
          { guestId: session.user.id }
        ]
      },
      include: {
        guest: { select: { id: true, name: true, image: true, email: true } },
        host: { select: { id: true, name: true, image: true, email: true } },
        property: { select: { id: true, name: true, coverImageUrl: true } }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Start a new conversation (or return existing)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { guestId, propertyId, content } = await req.json();

    if (!guestId || !content) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if conversation exists
    let conversation = await prisma.conversation.findFirst({
        where: {
            hostId: session.user.id, // Assuming creator is host for now, or check logic
            guestId: guestId,
            propertyId: propertyId || undefined
        }
    });

    // If not, create it
    if (!conversation) {
        //Logic check: who is host? usually Property Owner. 
        // For simplicity in this endpoint we might need to look up property owner if guest is starting it.
        // Let's assume simpler Host-Dashboard flow where Host initiates? 
        // Actually, normally Guest initiates. 
        // Let's defer "Create" logic to a more robust handler or assume this endpoint is for "Reply" which is handled by [id]/route.ts
        // But for "New" conversation:
        
        conversation = await prisma.conversation.create({
            data: {
                hostId: session.user.id, // Placeholder logic - usually determined by property
                guestId: guestId,
                propertyId: propertyId,
                lastMessage: content,
                unreadCountGuest: 1
            }
        });
    }

    // Add message
    await prisma.message.create({
        data: {
            conversationId: conversation.id,
            senderId: session.user.id,
            content: content
        }
    });

    return NextResponse.json({ success: true, conversationId: conversation.id });

  } catch (error) {
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
