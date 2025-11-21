// lib/auth-helpers.ts
// Authentication helper functions for role-based access control

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Check if user is an admin (any level)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const admin = await prisma!.adminUser.findUnique({
    where: { userId },
  });
  return !!admin;
}

/**
 * Check if user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const admin = await prisma!.adminUser.findUnique({
    where: { userId },
  });
  return admin?.role === "super_admin";
}

/**
 * Get or create test agent for admin users
 * Allows admins to access agent portal without registration
 */
export async function getOrCreateAdminAgent(userId: string) {
  // Check if user is admin
  const admin = await prisma!.adminUser.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!admin) return null;

  // Check if agent already exists
  let agent = await prisma!.travelAgent.findUnique({
    where: { userId },
  });

  // If admin doesn't have agent profile, create one
  if (!agent && admin.role === "super_admin") {
    agent = await prisma!.travelAgent.create({
      data: {
        userId: userId,
        agencyName: "Platform Administration",
        businessType: "ADMINISTRATION",
        licenseNumber: `ADMIN-${admin.id.slice(0, 8).toUpperCase()}`,
        status: "ACTIVE", // Auto-approve for admins
        tier: "WHITE_LABEL", // Highest tier
        defaultCommission: 0.15, // 15% commission rate
        isTestAccount: true, // Mark as test account
        // Enable all premium features for superadmin
        hasClientPortal: true,
        hasTeamManagement: true,
        hasAdvancedAnalytics: true,
        hasWhiteLabel: true,
        hasApiAccess: true,
        hasPrioritySupport: true,
        hasCustomBranding: true,
        hasSmsNotifications: true,
        hasWhatsappIntegration: true,
      },
    });
  }

  return agent;
}

/**
 * Get agent with admin fallback
 * If user is admin but not agent, auto-creates agent profile
 */
export async function getAgentWithAdminFallback(userId: string) {
  // First, try to get existing agent
  let agent = await prisma!.travelAgent.findUnique({
    where: { userId },
  });

  // If no agent, check if user is admin
  if (!agent) {
    const adminUser = await prisma!.adminUser.findUnique({
      where: { userId },
    });

    if (adminUser && adminUser.role === "super_admin") {
      // Auto-create agent profile for super admin
      agent = await getOrCreateAdminAgent(userId);
    }
  }

  return agent;
}

/**
 * Check if current session has admin access
 */
export async function checkAdminAccess(): Promise<{
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminUser: any;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    return { isAdmin: false, isSuperAdmin: false, adminUser: null };
  }

  const adminUser = await prisma!.adminUser.findUnique({
    where: { userId: session.user.id },
  });

  return {
    isAdmin: !!adminUser,
    isSuperAdmin: adminUser?.role === "super_admin",
    adminUser,
  };
}

/**
 * Check if current session has agent access (includes admin override)
 */
export async function checkAgentAccess(): Promise<{
  hasAccess: boolean;
  agent: any;
  isAdminOverride: boolean;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    return { hasAccess: false, agent: null, isAdminOverride: false };
  }

  // Try to get agent (with admin fallback)
  const agent = await getAgentWithAdminFallback(session.user.id);

  // Check if this is an admin override
  const isAdminOverride = agent?.isTestAccount === true;

  return {
    hasAccess: !!agent,
    agent,
    isAdminOverride,
  };
}
