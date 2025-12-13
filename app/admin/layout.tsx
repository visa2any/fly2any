import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { autoInitializeAdmin } from '@/lib/admin/auto-init'

const prisma = getPrismaClient()

// Whitelisted admin emails - these users automatically get super_admin access
const ADMIN_WHITELIST = [
  'support@fly2any.com',
  'admin@fly2any.com',
  'team@fly2any.com',
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await auth()

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

  // Check if user is admin
  let adminUser = null
  try {
    adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })
  } catch (error) {
    console.error('Error checking admin status:', error)
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
        adminUser = await prisma.adminUser.findUnique({
          where: { userId: session.user.id },
          include: { user: true }
        })
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
