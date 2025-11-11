/**
 * Admin Middleware
 * Protects admin routes and checks permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { Role, hasPermission, Resource, Action } from './rbac'

const prisma = getPrismaClient()

export interface AdminContext {
  userId: string
  userEmail: string
  role: Role
  permissions: any
}

/**
 * Require admin authentication
 */
export async function requireAdmin(request: NextRequest): Promise<AdminContext | NextResponse> {
  const session = await auth()

  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const adminUser = await prisma.adminUser.findUnique({
    where: { userId: session.user.id }
  })

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  return {
    userId: session.user.id,
    userEmail: session.user.email,
    role: adminUser.role as Role,
    permissions: adminUser.permissions
  }
}

/**
 * Require specific permission
 */
export async function requirePermission(
  request: NextRequest,
  resource: Resource | string,
  action: Action
): Promise<AdminContext | NextResponse> {
  const result = await requireAdmin(request)

  if (result instanceof NextResponse) {
    return result // Already an error response
  }

  const context = result as AdminContext

  if (!hasPermission(context.role, resource, action, context.permissions)) {
    return NextResponse.json(
      {
        error: 'Forbidden - Insufficient permissions',
        required: { resource, action }
      },
      { status: 403 }
    )
  }

  return context
}

/**
 * Log admin action to audit trail
 */
export async function logAdminAction(
  context: AdminContext,
  action: string,
  resource: string,
  resourceId: string,
  request: NextRequest,
  changes?: any,
  success: boolean = true,
  errorMessage?: string
) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

    await prisma.auditLog.create({
      data: {
        userId: context.userId,
        userEmail: context.userEmail,
        userRole: context.role,
        action,
        resource,
        resourceId,
        changes,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        requestId,
        success,
        errorMessage
      }
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // Don't throw - logging failure shouldn't break the request
  }
}

/**
 * Helper to wrap admin API handlers
 */
export function withAdmin(
  handler: (request: NextRequest, context: AdminContext) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const result = await requireAdmin(request)

    if (result instanceof NextResponse) {
      return result
    }

    return handler(request, result as AdminContext)
  }
}

/**
 * Helper to wrap admin API handlers with permission check
 */
export function withPermission(
  resource: Resource | string,
  action: Action,
  handler: (request: NextRequest, context: AdminContext) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const result = await requirePermission(request, resource, action)

    if (result instanceof NextResponse) {
      return result
    }

    return handler(request, result as AdminContext)
  }
}
