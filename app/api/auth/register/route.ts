import { NextRequest, NextResponse } from 'next/server';

/**
 * User Registration API with Two-Step Verification
 *
 * Flow:
 * 1. User submits name, email, phone via QuickContactForm
 * 2. Create pending user in database
 * 3. Send email verification link
 * 4. Send SMS verification code
 * 5. User verifies both (can do in any order)
 * 6. Mark user as verified and activate account
 * 7. Award 10% discount coupon
 */

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, sessionId, language = 'en' } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and phone are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate phone format (basic check)
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone format'
      }, { status: 400 });
    }

    // Check if user already exists
    // TODO: Implement database check
    // const existingUser = await sql`
    //   SELECT * FROM users WHERE email = ${email} OR phone = ${phone} LIMIT 1
    // `;

    // if (existingUser && existingUser.rows.length > 0) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'User with this email or phone already exists'
    //   }, { status: 409 });
    // }

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create pending user in database
    // TODO: Implement database insert
    // await sql`
    //   INSERT INTO users (
    //     id, name, email, phone, session_id,
    //     email_verified, phone_verified, status,
    //     preferred_language, created_at
    //   ) VALUES (
    //     ${userId}, ${name}, ${email}, ${phone}, ${sessionId},
    //     FALSE, FALSE, 'pending',
    //     ${language}, NOW()
    //   )
    // `;

    console.log('👤 User Registration:', {
      userId,
      name,
      email,
      phone,
      sessionId,
      language
    });

    // Send email verification
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-email',
          email,
          name,
          language
        })
      });

      const emailData = await emailResponse.json();
      if (!emailData.success) {
        console.error('Failed to send email verification:', emailData.error);
      }
    } catch (error) {
      console.error('Email verification error:', error);
    }

    // Send SMS verification
    try {
      const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-sms',
          phone,
          language
        })
      });

      const smsData = await smsResponse.json();
      if (!smsData.success) {
        console.error('Failed to send SMS verification:', smsData.error);
      }
    } catch (error) {
      console.error('SMS verification error:', error);
    }

    // Upgrade session to authenticated (but not yet verified)
    // TODO: Update session in database
    // await sql`
    //   UPDATE user_sessions
    //   SET user_id = ${userId}, is_authenticated = TRUE
    //   WHERE session_id = ${sessionId}
    // `;

    // Response messages
    const languageKey = (language as 'en' | 'pt' | 'es') || 'en';
    const allMessages = {
      en: {
        success: 'Registration successful! Please check your email and phone for verification codes.',
        nextSteps: [
          '📧 Check your email for a verification link',
          '📱 Check your phone for a 6-digit code',
          '🎁 After verification, you\'ll get 10% OFF your first booking!'
        ]
      },
      pt: {
        success: 'Registro bem-sucedido! Verifique seu email e telefone para os códigos de verificação.',
        nextSteps: [
          '📧 Verifique seu email para o link de verificação',
          '📱 Verifique seu telefone para o código de 6 dígitos',
          '🎁 Após a verificação, você receberá 10% de desconto na primeira reserva!'
        ]
      },
      es: {
        success: '¡Registro exitoso! Por favor revisa tu email y teléfono para los códigos de verificación.',
        nextSteps: [
          '📧 Revisa tu email para el enlace de verificación',
          '📱 Revisa tu teléfono para el código de 6 dígitos',
          '🎁 ¡Después de la verificación, obtendrás 10% de descuento en tu primera reserva!'
        ]
      }
    };
    const messages = allMessages[languageKey];

    return NextResponse.json({
      success: true,
      message: messages.success,
      nextSteps: messages.nextSteps,
      userId,
      requiresVerification: true,
      verifications: {
        email: {
          sent: true,
          verified: false
        },
        phone: {
          sent: true,
          verified: false
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}

/**
 * GET /api/auth/register/check-verification
 * Check if user has completed both verifications
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({
      success: false,
      error: 'User ID is required'
    }, { status: 400 });
  }

  // TODO: Check verification status in database
  // const user = await sql`
  //   SELECT email_verified, phone_verified FROM users WHERE id = ${userId} LIMIT 1
  // `;

  // const emailVerified = user.rows[0]?.email_verified || false;
  // const phoneVerified = user.rows[0]?.phone_verified || false;
  // const fullyVerified = emailVerified && phoneVerified;

  // Mock for now
  const emailVerified = false;
  const phoneVerified = false;
  const fullyVerified = false;

  // If fully verified, activate account and award discount
  // if (fullyVerified) {
  //   await sql`UPDATE users SET status = 'active' WHERE id = ${userId}`;
  //
  //   // Award 10% discount coupon
  //   await sql`
  //     INSERT INTO user_coupons (user_id, code, discount_percent, valid_until)
  //     VALUES (${userId}, 'WELCOME10', 10, NOW() + INTERVAL '30 days')
  //   `;
  // }

  return NextResponse.json({
    success: true,
    emailVerified,
    phoneVerified,
    fullyVerified,
    message: fullyVerified
      ? '🎉 Account fully verified! Your 10% discount has been applied.'
      : 'Please complete email and phone verification to unlock your benefits.'
  });
}
