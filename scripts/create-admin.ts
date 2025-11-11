/**
 * Create Admin User Script
 *
 * Usage:
 * npx tsx scripts/create-admin.ts <email> <role>
 *
 * Examples:
 * npx tsx scripts/create-admin.ts admin@fly2any.com super_admin
 * npx tsx scripts/create-admin.ts manager@fly2any.com admin
 * npx tsx scripts/create-admin.ts support@fly2any.com moderator
 */

import { getPrismaClient } from '../lib/prisma'

const prisma = getPrismaClient()

async function createAdminUser(email: string, role: string) {
  console.log('🔍 Creating admin user...')
  console.log(`Email: ${email}`)
  console.log(`Role: ${role}`)

  // Validate role
  const validRoles = ['super_admin', 'admin', 'moderator']
  if (!validRoles.includes(role)) {
    console.error(`❌ Invalid role. Must be one of: ${validRoles.join(', ')}`)
    process.exit(1)
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ User with email ${email} not found.`)
      console.log('\n💡 Make sure the user has signed up first at /auth/signin')
      process.exit(1)
    }

    // Check if already admin
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { userId: user.id }
    })

    if (existingAdmin) {
      console.log(`⚠️  User is already an admin with role: ${existingAdmin.role}`)
      console.log('Updating role...')

      const updated = await prisma.adminUser.update({
        where: { userId: user.id },
        data: {
          role,
          updatedAt: new Date()
        }
      })

      console.log(`✅ Admin user updated!`)
      console.log(`   User ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${updated.role}`)
      console.log(`\n🎉 ${user.name || user.email} can now access /admin`)
    } else {
      // Create new admin user
      const adminUser = await prisma.adminUser.create({
        data: {
          userId: user.id,
          role,
          permissions: null // null = all permissions for the role
        }
      })

      console.log(`✅ Admin user created successfully!`)
      console.log(`   User ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name || 'Not set'}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`\n🎉 ${user.name || user.email} can now access /admin`)
    }

    // Log audit trail
    console.log('\n📊 Creating audit log entry...')
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email!,
        userRole: role,
        action: existingAdmin ? 'update' : 'create',
        resource: 'admin_user',
        resourceId: user.id,
        changes: {
          role,
          createdBy: 'setup-script',
          timestamp: new Date().toISOString()
        },
        ipAddress: 'localhost',
        userAgent: 'CLI Script',
        requestId: `script-${Date.now()}`,
        success: true
      }
    })

    console.log('✅ Audit log created')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
const [,, email, role = 'admin'] = process.argv

if (!email) {
  console.error('❌ Email is required')
  console.log('\nUsage:')
  console.log('  npx tsx scripts/create-admin.ts <email> [role]')
  console.log('\nRoles: super_admin, admin, moderator')
  console.log('\nExamples:')
  console.log('  npx tsx scripts/create-admin.ts admin@fly2any.com super_admin')
  console.log('  npx tsx scripts/create-admin.ts manager@fly2any.com admin')
  process.exit(1)
}

createAdminUser(email, role)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error.message)
    process.exit(1)
  })
