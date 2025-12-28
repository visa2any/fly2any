export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'
import { withPermission, logAdminAction } from '@/lib/admin/middleware'
import { Resource, Action } from '@/lib/admin/rbac'

const prisma = getPrismaClient()

// GET /api/admin/users - List users with filters
export const GET = withPermission(Resource.USERS, Action.READ, async (request, context) => {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse filters
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch users with bookings count
    const [usersRaw, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          adminUser: {
            select: {
              role: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Transform to expected format
    const users = usersRaw.map(u => ({
      id: u.id,
      name: u.name || u.email?.split('@')[0] || 'Unknown',
      email: u.email || '',
      role: u.adminUser?.role || 'user',
      status: u.emailVerified ? 'active' : 'pending',
      bookingsCount: u._count?.bookings || 0,
      totalSpent: 0, // Would need booking amounts aggregation
      lastLogin: u.lastLoginAt?.toISOString() || u.createdAt.toISOString(),
      createdAt: u.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
})
