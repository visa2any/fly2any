/**
 * Admin Audit Logger
 * Records all admin actions for compliance and dispute resolution
 */
import { getPrismaClient, isPrismaAvailable } from '@/lib/prisma';

export interface AuditEntry {
  adminUserId: string;
  adminEmail?: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
}

/**
 * Log an admin action. Fire-and-forget — never throws.
 */
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  if (!isPrismaAvailable()) return;
  try {
    const prisma = getPrismaClient();
    await prisma.notification.create({
      data: {
        userId: entry.adminUserId,
        type: 'admin_audit',
        title: `Admin Action: ${entry.action}`,
        message: `[${entry.resource}/${entry.resourceId}] ${entry.action} by ${entry.adminEmail || entry.adminUserId}`,
        priority: 'low',
        actionUrl: `/admin/${entry.resource}`,
        metadata: {
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details || {},
          before: entry.before || {},
          after: entry.after || {},
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('[AuditLogger] Failed to log action:', error);
  }
}
