import { NextRequest, NextResponse } from 'next/server';
import { prisma, isPrismaAvailable } from '@/lib/db/prisma';

// Force Node.js runtime for database access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Get All Users
 * GET /api/admin/users?search=...&role=...&limit=50&offset=0
 *
 * Returns list of users with statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📊 Fetching users with filters:', { search, role, limit, offset });

    // Mock user data - replace with real database queries
    const mockUsers = generateMockUsers();

    // Filter users
    let filteredUsers = mockUsers;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    // Pagination
    const total = filteredUsers.length;
    const users = filteredUsers.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching users:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Admin API - Update User
 * PUT /api/admin/users
 *
 * Updates user information (role, status, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    console.log('✏️ Updating user:', userId, updates);

    // In production, update user in database
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: updates,
    // });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('❌ Error updating user:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Admin API - Delete User
 * DELETE /api/admin/users?userId=...
 *
 * Deletes a user (soft delete recommended in production)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting user:', userId);

    // In production, soft delete user
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { deletedAt: new Date() },
    // });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting user:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to generate mock users
function generateMockUsers() {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const roles = ['user', 'admin', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'user'];

  const users = [];

  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

    users.push({
      id: `user_${i + 1}`,
      name: `${firstName} ${lastName}`,
      email,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      bookingsCount: Math.floor(Math.random() * 20),
      totalSpent: Math.floor(Math.random() * 10000),
      lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    });
  }

  return users;
}
