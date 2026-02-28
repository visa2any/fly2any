/**
 * User Signup API
 *
 * POST /api/auth/signup
 * Creates a new user account with email/password credentials
 *
 * Security:
 * - Rate limited: 5 signups/hour per IP, 3 attempts/day per email
 * - Honeypot field rejection (anti-bot)
 * - Server-side password strength enforcement
 *
 * Body: { name: string, email: string, password: string, website?: string (honeypot) }
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, website } = body;

    // ── Honeypot check ──────────────────────────────────────────────
    // Hidden field that humans never fill — bots auto-fill it
    // Return fake 200 to not tip off bots
    if (website) {
      console.warn(`🤖 [SIGNUP] Honeypot triggered from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`);
      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: { id: 'ok', name: 'ok', email: 'ok' },
      });
    }

    // ── Rate limiting ───────────────────────────────────────────────
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // IP-based: max 5 signups per hour
    const ipLimit = await checkRateLimit(`signup:ip:${ip}`, 'hour', 5);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(ipLimit.retryAfter || 3600) },
        }
      );
    }

    // ── Validation ──────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Server-side password strength enforcement
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Email-based rate limit: max 3 attempts per day per email
    const emailLimit = await checkRateLimit(`signup:email:${normalizedEmail}`, 'day', 3);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts for this email. Please try again tomorrow.' },
        {
          status: 429,
          headers: { 'Retry-After': String(emailLimit.retryAfter || 86400) },
        }
      );
    }

    // Check if user already exists
    const existingUser = await prisma?.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with preferences
    const user = await prisma?.user.create({
      data: {
        name: name || null,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: null, // Will be verified later if needed
        preferences: {
          create: {}, // Create default preferences
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log(`✅ [SIGNUP] New user created: ${normalizedEmail} (IP: ${ip})`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      },
    });

  } catch (error: any) {
    console.error('[SIGNUP_ERROR]', error);

    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
