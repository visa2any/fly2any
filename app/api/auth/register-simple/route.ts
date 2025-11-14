import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createReferralRelationship } from '@/lib/services/referralNetworkService';
import { generateReferralCode } from '@/lib/utils';

/**
 * Simple User Registration for AuthModal
 *
 * Creates a user with email/password for NextAuth credentials provider
 * Supports referral code integration for Fly2Any Rewards Network
 */

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, referralCode } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    // Generate unique referral code for new user
    const newUserReferralCode = await generateUniqueCode();

    // Create user with preferences
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        emailVerified: null, // Can be verified later
        referralCode: newUserReferralCode, // Assign referral code
        preferences: {
          create: {}, // Create default preferences
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log('✅ User registered:', user.email);

    // If referral code provided, create referral relationship
    if (referralCode && referralCode.trim()) {
      try {
        await createReferralRelationship({
          refereeEmail: email,
          referralCode: referralCode.trim().toUpperCase(),
        });
        console.log(`✅ Referral relationship created for ${email} using code ${referralCode}`);
      } catch (referralError: any) {
        console.error('Failed to create referral relationship:', referralError);
        // Don't fail registration if referral fails - just log it
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Generate unique referral code
 */
async function generateUniqueCode(): Promise<string> {
  if (!prisma) throw new Error('Database not configured');

  let code = generateReferralCode();
  let attempts = 0;

  while (attempts < 10) {
    const exists = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    if (!exists) {
      return code;
    }

    code = generateReferralCode();
    attempts++;
  }

  // Fallback: add timestamp
  return `${code}${Date.now().toString(36).slice(-3)}`;
}
