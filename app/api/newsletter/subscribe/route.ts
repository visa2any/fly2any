import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export async function POST(request: NextRequest) {
  return handleApiError(
    request,
    async () => {
      const { email, source = 'blog' } = await request.json();

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email address' },
          { status: 400 }
        );
      }

      // Generate confirmation token
      const token = crypto.randomUUID();
      const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirm?token=${token}`;

      // TODO: Database - Save subscription with pending status
      // TODO: Email - Send double opt-in confirmation

      console.log(`Newsletter signup: ${email} | Source: ${source} | Token: ${token}`);

      return NextResponse.json({
        success: true,
        message: 'Check your email to confirm subscription',
        requiresConfirmation: true,
      });
    },
    { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.NORMAL }
  );
}
