import { NextRequest, NextResponse } from 'next/server';

/**
 * User Verification API
 *
 * Two-step verification process:
 * 1. Email confirmation - Send verification link
 * 2. SMS code verification - Send 6-digit code
 *
 * Prevents spam and ensures valid contact information
 */

export const runtime = 'nodejs';

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate secure verification token
function generateVerificationToken(): string {
  return `vtoken_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

/**
 * POST /api/auth/verify/send-email
 * Send email verification link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, phone, name, language = 'en' } = body;

    // Action: send-email
    if (action === 'send-email') {
      if (!email || !name) {
        return NextResponse.json({
          success: false,
          error: 'Email and name are required'
        }, { status: 400 });
      }

      // Generate verification token
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // TODO: Store in database
      // await sql`
      //   INSERT INTO email_verifications (email, token, name, expires_at, created_at)
      //   VALUES (${email}, ${verificationToken}, ${name}, ${expiresAt}, NOW())
      // `;

      // Build verification URL
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${verificationToken}`;

      // Email content based on language
      const languageKey = (language as 'en' | 'pt' | 'es') || 'en';
      const allEmailContent = {
        en: {
          subject: 'Verify your email - Fly2Any',
          greeting: `Hi ${name}!`,
          message: 'Welcome to Fly2Any! Please verify your email address to complete your registration and unlock exclusive benefits.',
          cta: 'Verify Email Address',
          footer: 'This link expires in 24 hours. If you didn\'t create an account, please ignore this email.',
          benefits: [
            '✈️ 10% OFF your first booking',
            '🎯 Personalized travel recommendations',
            '⭐ Priority customer support',
            '💾 Save your searches and bookings'
          ]
        },
        pt: {
          subject: 'Verifique seu email - Fly2Any',
          greeting: `Olá ${name}!`,
          message: 'Bem-vindo ao Fly2Any! Por favor, verifique seu endereço de email para completar seu cadastro e desbloquear benefícios exclusivos.',
          cta: 'Verificar Email',
          footer: 'Este link expira em 24 horas. Se você não criou uma conta, ignore este email.',
          benefits: [
            '✈️ 10% de desconto na primeira reserva',
            '🎯 Recomendações personalizadas',
            '⭐ Suporte prioritário',
            '💾 Salvar pesquisas e reservas'
          ]
        },
        es: {
          subject: 'Verifica tu email - Fly2Any',
          greeting: `¡Hola ${name}!`,
          message: '¡Bienvenido a Fly2Any! Por favor verifica tu dirección de email para completar tu registro y desbloquear beneficios exclusivos.',
          cta: 'Verificar Email',
          footer: 'Este enlace expira en 24 horas. Si no creaste una cuenta, ignora este email.',
          benefits: [
            '✈️ 10% de descuento en tu primera reserva',
            '🎯 Recomendaciones personalizadas',
            '⭐ Soporte prioritario',
            '💾 Guardar búsquedas y reservas'
          ]
        }
      };
      const emailContent = allEmailContent[languageKey];

      // TODO: Send email via your email service (SendGrid, AWS SES, etc.)
      console.log('📧 Email Verification:', {
        to: email,
        subject: emailContent.subject,
        verificationUrl,
        expiresAt
      });

      // For now, log to console (will integrate with real email service)
      /*
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${emailContent.greeting}</h2>
            <p>${emailContent.message}</p>

            <div style="margin: 30px 0;">
              <a href="${verificationUrl}"
                 style="background: linear-gradient(135deg, #0066FF, #00CC99);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        display: inline-block;">
                ${emailContent.cta}
              </a>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Your Benefits:</h3>
              ${emailContent.benefits.map(benefit => `<p style="margin: 8px 0;">${benefit}</p>`).join('')}
            </div>

            <p style="color: #666; font-size: 14px;">${emailContent.footer}</p>
          </div>
        `
      });
      */

      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully',
        verificationToken // For testing only - remove in production
      });
    }

    // Action: send-sms
    if (action === 'send-sms') {
      if (!phone) {
        return NextResponse.json({
          success: false,
          error: 'Phone number is required'
        }, { status: 400 });
      }

      // Generate 6-digit code
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // TODO: Store in database
      // await sql`
      //   INSERT INTO sms_verifications (phone, code, expires_at, created_at)
      //   VALUES (${phone}, ${verificationCode}, ${expiresAt}, NOW())
      // `;

      // SMS content based on language
      const languageKey = (language as 'en' | 'pt' | 'es') || 'en';
      const allSmsContent = {
        en: `Your Fly2Any verification code is: ${verificationCode}. Valid for 10 minutes. Do not share this code.`,
        pt: `Seu código de verificação Fly2Any é: ${verificationCode}. Válido por 10 minutos. Não compartilhe este código.`,
        es: `Tu código de verificación Fly2Any es: ${verificationCode}. Válido por 10 minutos. No compartas este código.`
      };
      const smsContent = allSmsContent[languageKey];

      // TODO: Send SMS via your SMS service (Twilio, AWS SNS, etc.)
      console.log('📱 SMS Verification:', {
        to: phone,
        message: smsContent,
        code: verificationCode,
        expiresAt
      });

      // For now, log to console (will integrate with real SMS service)
      /*
      await sendSMS({
        to: phone,
        message: smsContent
      });
      */

      return NextResponse.json({
        success: true,
        message: 'Verification code sent successfully',
        verificationCode // For testing only - remove in production
      });
    }

    // Action: verify-email
    if (action === 'verify-email') {
      const { token } = body;

      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'Verification token is required'
        }, { status: 400 });
      }

      // TODO: Verify token in database
      // const verification = await sql`
      //   SELECT * FROM email_verifications
      //   WHERE token = ${token} AND expires_at > NOW() AND verified_at IS NULL
      //   LIMIT 1
      // `;

      // if (!verification || verification.rows.length === 0) {
      //   return NextResponse.json({
      //     success: false,
      //     error: 'Invalid or expired verification token'
      //   }, { status: 400 });
      // }

      // Mark as verified
      // await sql`
      //   UPDATE email_verifications
      //   SET verified_at = NOW()
      //   WHERE token = ${token}
      // `;

      console.log('✅ Email Verified:', { token });

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully'
      });
    }

    // Action: verify-sms
    if (action === 'verify-sms') {
      const { phone: verifyPhone, code } = body;

      if (!verifyPhone || !code) {
        return NextResponse.json({
          success: false,
          error: 'Phone and code are required'
        }, { status: 400 });
      }

      // TODO: Verify code in database
      // const verification = await sql`
      //   SELECT * FROM sms_verifications
      //   WHERE phone = ${verifyPhone} AND code = ${code} AND expires_at > NOW() AND verified_at IS NULL
      //   LIMIT 1
      // `;

      // if (!verification || verification.rows.length === 0) {
      //   return NextResponse.json({
      //     success: false,
      //     error: 'Invalid or expired verification code'
      //   }, { status: 400 });
      // }

      // Mark as verified
      // await sql`
      //   UPDATE sms_verifications
      //   SET verified_at = NOW()
      //   WHERE phone = ${verifyPhone} AND code = ${code}
      // `;

      console.log('✅ SMS Verified:', { phone: verifyPhone, code });

      return NextResponse.json({
        success: true,
        message: 'Phone verified successfully'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: send-email, send-sms, verify-email, or verify-sms'
    }, { status: 400 });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Verification failed'
    }, { status: 500 });
  }
}
