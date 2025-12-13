import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

/**
 * Admin-only auth check for Google OAuth
 * Prevents Google signup for admin area - only allows existing users
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      )
    }

    const prisma = getPrismaClient()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    })

    // For admin auth, only allow existing users
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Admin accounts must be created by administrators.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error('[Admin Auth Check] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication check failed' },
      { status: 500 }
    )
  }
}
