/**
 * Seed Demo Admin User - DEV ONLY
 *
 * Creates a demo admin account you can use to access the admin panel
 * ⚠️ REMOVE THIS IN PRODUCTION
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

const prisma = getPrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse request body (optional - can override default admin)
    const body = await request.json().catch(() => ({}));

    // Admin credentials (use provided or default)
    const ADMIN_EMAIL = body.email || 'admin@fly2any.com';
    const ADMIN_PASSWORD = body.password || 'admin123';
    const ADMIN_NAME = body.name || 'Admin User';

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Check if admin already exists
    const existingUser = await prisma!.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    let userId: string;

    if (existingUser) {
      console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`);
      userId = existingUser.id;
    } else {
      // Create user
      const newUser = await prisma!.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: hashedPassword,
          emailVerified: new Date(), // Auto-verify
        },
      });

      userId = newUser.id;
      console.log(`✅ Created admin user: ${ADMIN_EMAIL}`);
    }

    // Check if admin role exists
    const existingAdmin = await prisma!.adminUser.findUnique({
      where: { userId },
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists! Use these credentials to log in:',
        credentials: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        },
        admin: {
          userId,
          role: existingAdmin.role,
          createdAt: existingAdmin.createdAt,
        },
      });
    }

    // Create admin role
    const adminUser = await prisma!.adminUser.create({
      data: {
        userId,
        role: 'super_admin',
      },
    });

    console.log(`✅ Created super admin role for: ${ADMIN_EMAIL}`);

    // Also create user preferences if they don't exist
    const existingPreferences = await prisma!.userPreferences.findUnique({
      where: { userId },
    });

    if (!existingPreferences) {
      await prisma!.userPreferences.create({
        data: {
          userId,
          currency: 'USD',
          language: 'en',
          emailNotifications: true,
          priceAlertEmails: true,
          dealAlerts: true,
          newsletterOptIn: false,
        },
      });
      console.log(`✅ Created preferences for: ${ADMIN_EMAIL}`);
    }

    return NextResponse.json({
      success: true,
      message: '🎉 Admin user created successfully! Use these credentials to log in:',
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      admin: {
        userId,
        role: adminUser.role,
        createdAt: adminUser.createdAt,
      },
      nextSteps: [
        '1. Go to http://localhost:3000/auth/signin',
        `2. Sign in with email: ${ADMIN_EMAIL}`,
        `3. Password: ${ADMIN_PASSWORD}`,
        '4. You will be redirected to /admin',
        '5. Access /admin/affiliates',
      ],
    });

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create admin user',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Call POST to this endpoint to create a demo admin user',
    hint: 'curl -X POST http://localhost:3000/api/admin/seed-admin',
  });
}
