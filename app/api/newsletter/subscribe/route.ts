import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { getPrismaClient } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
  return handleApiError(
    request,
    async () => {
      const { email, source = 'blog', firstName } = await request.json();

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email address' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const prisma = getPrismaClient();

      // Check for existing subscriber
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        if (existing.status === 'ACTIVE') {
          // Already subscribed and verified
          return NextResponse.json({
            success: true,
            message: 'You\'re already subscribed! Check your inbox for our latest deals.',
            alreadySubscribed: true,
          });
        }

        if (existing.status === 'UNSUBSCRIBED') {
          // Re-subscribe: generate new token and re-activate flow
          const token = crypto.randomUUID();
          const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify?token=${token}`;

          await prisma.newsletterSubscriber.update({
            where: { id: existing.id },
            data: {
              status: 'PENDING',
              verificationToken: token,
              tokenExpiry,
              reactivatedAt: new Date(),
              source,
              firstName: firstName || existing.firstName,
              unsubscribedAt: null,
            },
          });

          // Send double opt-in email
          await EmailService.sendVerificationEmail(normalizedEmail, {
            email: normalizedEmail,
            firstName: firstName || existing.firstName || undefined,
            verifyUrl,
          });

          console.log(`📧 [NEWSLETTER] Re-subscribe verification sent: ${normalizedEmail} | Source: ${source}`);

          return NextResponse.json({
            success: true,
            message: 'Check your email to confirm subscription',
            requiresConfirmation: true,
          });
        }

        if (existing.status === 'PENDING') {
          // Already pending — resend verification
          const token = crypto.randomUUID();
          const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
          const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify?token=${token}`;

          await prisma.newsletterSubscriber.update({
            where: { id: existing.id },
            data: {
              verificationToken: token,
              tokenExpiry,
              source,
              firstName: firstName || existing.firstName,
            },
          });

          await EmailService.sendVerificationEmail(normalizedEmail, {
            email: normalizedEmail,
            firstName: firstName || existing.firstName || undefined,
            verifyUrl,
          });

          console.log(`📧 [NEWSLETTER] Resent verification: ${normalizedEmail} | Source: ${source}`);

          return NextResponse.json({
            success: true,
            message: 'Check your email to confirm subscription',
            requiresConfirmation: true,
          });
        }
      }

      // New subscriber — create record and send verification
      const token = crypto.randomUUID();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify?token=${token}`;

      await prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          firstName: firstName || null,
          source,
          status: 'PENDING',
          verificationToken: token,
          tokenExpiry,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
        },
      });

      // Send double opt-in verification email
      await EmailService.sendVerificationEmail(normalizedEmail, {
        email: normalizedEmail,
        firstName: firstName || undefined,
        verifyUrl,
      });

      console.log(`📧 [NEWSLETTER] New signup, verification sent: ${normalizedEmail} | Source: ${source}`);

      return NextResponse.json({
        success: true,
        message: 'Check your email to confirm subscription',
        requiresConfirmation: true,
      });
    },
    { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.NORMAL }
  );
}
