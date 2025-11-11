import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

const prisma = getPrismaClient()

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/admin')
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

  // If not admin, redirect to home
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
          <div className="max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
