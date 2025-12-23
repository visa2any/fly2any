import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { EmailService } from '@/lib/services/email-service';

// Force Node.js runtime (required for Prisma and bcryptjs)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema for password change
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
  logoutOtherSessions: z.boolean().optional().default(false),
});

// PUT /api/account/password - Change password
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    const body = await req.json();

    // Validate input
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, logoutOtherSessions } = validation.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a password (might be using OAuth)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Cannot change password for OAuth accounts' },
        { status: 400 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    // Revoke all other sessions if requested
    if (logoutOtherSessions) {
      // Get current session token (if available)
      const currentSessionToken = req.cookies.get('next-auth.session-token')?.value;

      // Delete all user sessions except current one
      if (currentSessionToken) {
        await prisma.session.deleteMany({
          where: {
            userId: session.user.id,
            sessionToken: { not: currentSessionToken },
          },
        });
      } else {
        // If no current session token, delete all sessions
        await prisma.session.deleteMany({
          where: { userId: session.user.id },
        });
      }

      // Also delete custom user sessions
      await prisma.userSession.deleteMany({
        where: { userId: session.user.id },
      });
    }

    // Send password change confirmation email
    await EmailService.sendPasswordChangeConfirmation(user.email, {
      userName: session.user.name || user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
