export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getPrismaClient, isPrismaAvailable } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { autoInitializeAdmin } from '@/lib/admin/auto-init'

// Whitelisted admin emails - these users automatically get super_admin access
const ADMIN_WHITELIST = [
  'support@fly2any.com',
  'admin@fly2any.com',
  'team@fly2any.com',
  'visa2any@gmail.com',
  'fly2any@gmail.com',
  'fly2any.travel@gmail.com',
]

// Timeout helper for SSR to prevent Vercel 504s during cold boots
const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
};

// Global timeout budget for the entire layout processing (SAFE for Vercel Hobby 10s limit)
const SSR_TOTAL_BUDGET = 9000;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const START_TIME = Date.now();
  const getRemainingBudget = () => Math.max(1000, SSR_TOTAL_BUDGET - (Date.now() - START_TIME));
  // Check if database is available
  if (!isPrismaAvailable()) {
    console.error('Database not configured for admin panel')
    redirect('/?error=database_unavailable')
  }

  const prisma = getPrismaClient();

  // Check authentication with remaining budget
  let session;
  try {
    session = await withTimeout(
      auth(), 
      getRemainingBudget(), 
      'Admin Auth request timed out'
    );
  } catch (error) {
    console.error('❌ Admin Auth error or timeout:', error)
    // Avoid double-throwing for Next.js redirects if it happens internally
    return redirect('/auth/admin-signin?callbackUrl=/admin')
  }

  if (!session?.user?.id) {
    redirect('/auth/admin-signin?callbackUrl=/admin')
  }

  // Auto-initialize admin if none exists (DEV ONLY)
  if (process.env.NODE_ENV === 'development') {
    try {
      await autoInitializeAdmin()
    } catch (error) {
      console.error('Auto-init admin failed:', error)
    }
  }

  // Check if user is admin with remaining budget
  let adminUser = null
  try {
    adminUser = await withTimeout(
      prisma.adminUser.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
      }),
      getRemainingBudget(),
      'Admin Database query timed out'
    );
  } catch (error) {
    console.error('❌ Admin status check error or timeout:', error)
    // Database error - redirect to a safe error page
    return redirect('/?error=database_error')
  }

  // If not admin, check if user is in whitelist or can be made admin
  if (!adminUser) {
    const userEmail = session.user.email?.toLowerCase() || ''
    const isWhitelisted = ADMIN_WHITELIST.some(email => email.toLowerCase() === userEmail)

    // Auto-create admin for whitelisted emails
    if (isWhitelisted) {
      try {
        adminUser = await prisma.adminUser.create({
          data: {
            userId: session.user.id,
            role: 'super_admin',
          },
          include: { user: true }
        })
        console.log(`✅ Auto-created admin for whitelisted email: ${session.user.email}`)
      } catch (error) {
        console.error('Error auto-creating whitelisted admin:', error)
        // If creation fails (e.g., race condition), try to fetch again
        try {
          adminUser = await prisma.adminUser.findUnique({
            where: { userId: session.user.id },
            include: { user: true }
          })
        } catch (retryError) {
          console.error('Retry fetch admin failed:', retryError)
          redirect('/?error=database_error')
        }
      }
    }

    // In development, if no admins exist, make current user admin
    if (!adminUser && process.env.NODE_ENV === 'development') {
      try {
        const adminCount = await prisma.adminUser.count()

        if (adminCount === 0) {
          // Make first user super admin
          adminUser = await prisma.adminUser.create({
            data: {
              userId: session.user.id,
              role: 'super_admin',
            },
            include: { user: true }
          })

          console.log(`✅ Made first user admin: ${session.user.email}`)
        } else {
          redirect('/?error=admin_access_required')
        }
      } catch (error) {
        console.error('Error auto-creating admin:', error)
        redirect('/?error=admin_access_required')
      }
    } else if (!adminUser) {
      redirect('/?error=admin_access_required')
    }
  }

  // Final safety check - if still no adminUser, redirect
  if (!adminUser) {
    redirect('/?error=admin_access_required')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width admin header */}
      <AdminHeader user={session.user} adminRole={adminUser.role} />

      <div className="flex">
        {/* Sidebar navigation */}
        <AdminSidebar role={adminUser.role} />

        {/* Main content area - full width minus sidebar */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
