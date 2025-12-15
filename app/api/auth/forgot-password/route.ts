import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    // In production, send actual reset email if user exists
    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (user) {
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        // Store token in verification_tokens table
        await prisma.verificationToken.create({
          data: {
            identifier: email.toLowerCase(),
            token: resetToken,
            expires: resetExpires,
          },
        });

        // TODO: Send email with reset link
        // For now, log it in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV] Password reset link: /auth/reset-password?token=${resetToken}`);
        }

        // In production, use your email service:
        // await sendPasswordResetEmail(email, resetToken);
      }
    }

    // Always return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: true }); // Don't reveal errors
  }
}
