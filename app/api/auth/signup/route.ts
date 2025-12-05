/**
 * User Signup API
 *
 * POST /api/auth/signup
 * Creates a new user account with email/password credentials
 *
 * Body: { name: string, email: string, password: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

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

    console.log(`✅ [SIGNUP] New user created: ${normalizedEmail}`);

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
