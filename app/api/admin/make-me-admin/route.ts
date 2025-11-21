/**
 * Make Current User Admin - DEV ONLY
 *
 * This endpoint makes the currently authenticated user a super admin.
 * ⚠️ REMOVE THIS IN PRODUCTION OR PROTECT WITH SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

const prisma = getPrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated. Please sign in first.'
        },
        { status: 401 }
      );
    }

    // Check if already admin
    const existingAdmin = await prisma!.adminUser.findUnique({
      where: { userId: session.user.id },
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'You are already an admin!',
        role: existingAdmin.role,
        userId: session.user.id,
        userEmail: session.user.email,
      });
    }

    // Create admin user
    const adminUser = await prisma!.adminUser.create({
      data: {
        userId: session.user.id,
        role: 'super_admin',
      },
    });

    console.log(`✅ Created super admin: ${session.user.email} (${session.user.id})`);

    return NextResponse.json({
      success: true,
      message: 'You are now a super admin! 🎉',
      adminUser: {
        id: adminUser.id,
        userId: adminUser.userId,
        role: adminUser.role,
        createdAt: adminUser.createdAt,
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    });

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create admin user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          hint: 'Sign in first, then call POST /api/admin/make-me-admin'
        },
        { status: 401 }
      );
    }

    // Check if admin
    const adminUser = await prisma!.adminUser.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      isAdmin: !!adminUser,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      adminRole: adminUser?.role || null,
      message: adminUser
        ? `You are an admin (${adminUser.role})`
        : 'You are NOT an admin. Call POST to this endpoint to become admin.',
    });

  } catch (error: any) {
    console.error('❌ Error checking admin status:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check admin status',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
