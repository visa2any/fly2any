import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

// DELETE /api/account/sessions/[id] - Revoke specific session
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    const sessionId = params.id;

    // Try to delete from NextAuth sessions
    const nextAuthSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (nextAuthSession) {
      // Verify it belongs to the user
      if (nextAuthSession.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Prevent deleting current session
      const currentSessionToken = req.cookies.get('next-auth.session-token')?.value;
      if (nextAuthSession.sessionToken === currentSessionToken) {
        return NextResponse.json(
          { error: 'Cannot revoke current session' },
          { status: 400 }
        );
      }

      await prisma.session.delete({
        where: { id: sessionId },
      });

      return NextResponse.json({ success: true, message: 'Session revoked' });
    }

    // Try to delete from custom user sessions
    const userSession = await prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (userSession) {
      // Verify it belongs to the user
      if (userSession.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await prisma.userSession.delete({
        where: { id: sessionId },
      });

      return NextResponse.json({ success: true, message: 'Session revoked' });
    }

    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
