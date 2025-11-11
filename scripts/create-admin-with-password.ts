/**
 * Create Admin User with Password
 * Creates a new user account + promotes to admin in one step
 */

// Load environment variables FIRST before any imports
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Also load .env if it exists
dotenv.config({ path: path.join(__dirname, '../.env') })

// CRITICAL: lib/prisma.ts uses DATABASE_URL, but Vercel sets POSTGRES_URL
// Ensure DATABASE_URL is set from POSTGRES_URL
console.log('DEBUG: POSTGRES_URL exists?', !!process.env.POSTGRES_URL)
console.log('DEBUG: DATABASE_URL exists?', !!process.env.DATABASE_URL)
console.log('DEBUG: DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 50))
console.log('DEBUG: POSTGRES_URL value:', process.env.POSTGRES_URL?.substring(0, 50))

if (process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL
  console.log('✓ Set DATABASE_URL from POSTGRES_URL')
} else if (process.env.POSTGRES_URL) {
  // DATABASE_URL exists but might be wrong, override it
  console.log('⚠️  Overriding DATABASE_URL with POSTGRES_URL')
  process.env.DATABASE_URL = process.env.POSTGRES_URL
}

async function createAdminWithPassword(email: string, password: string, role: string) {
  // Dynamic imports AFTER dotenv is configured
  const { getPrismaClient } = await import('../lib/prisma.js')
  const bcrypt = await import('bcryptjs')

  const prisma = getPrismaClient()

  console.log('🔐 Creating admin user with credentials...')
  console.log(`Email: ${email}`)
  console.log(`Role: ${role}`)

  // Validate role
  const validRoles = ['super_admin', 'admin', 'moderator']
  if (!validRoles.includes(role)) {
    console.error(`❌ Invalid role. Must be one of: ${validRoles.join(', ')}`)
    process.exit(1)
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    let userId: string

    if (existingUser) {
      console.log(`⚠️  User already exists with ID: ${existingUser.id}`)
      console.log('Updating password and promoting to admin...')

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Update user with new password
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      })

      userId = existingUser.id
      console.log('✅ Password updated')
    } else {
      console.log('Creating new user account...')

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          emailVerified: new Date(), // Auto-verify admin users
          name: email.split('@')[0], // Use email prefix as name
          profileCompleted: true
        }
      })

      userId = newUser.id
      console.log(`✅ User account created (ID: ${userId})`)
    }

    // Check if already admin
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { userId }
    })

    if (existingAdmin) {
      console.log(`⚠️  User is already an admin with role: ${existingAdmin.role}`)
      console.log('Updating role...')

      await prisma.adminUser.update({
        where: { userId },
        data: {
          role,
          updatedAt: new Date()
        }
      })

      console.log(`✅ Admin role updated to: ${role}`)
    } else {
      // Create admin user
      await prisma.adminUser.create({
        data: {
          userId,
          role
        }
      })

      console.log(`✅ User promoted to ${role}`)
    }

    // Log audit trail
    console.log('\n📊 Creating audit log entry...')
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: email,
        userRole: role,
        action: existingUser ? 'update' : 'create',
        resource: 'admin_user',
        resourceId: userId,
        changes: {
          role,
          createdBy: 'setup-script',
          timestamp: new Date().toISOString(),
          passwordSet: true
        },
        ipAddress: 'localhost',
        userAgent: 'CLI Script',
        requestId: `script-${Date.now()}`,
        success: true
      }
    })

    console.log('✅ Audit log created')

    console.log('\n✨ Admin user setup complete!')
    console.log(`\n📧 Email: ${email}`)
    console.log(`🔐 Password: ${password}`)
    console.log(`👑 Role: ${role}`)
    console.log(`\n🎉 You can now login at /admin`)
    console.log(`\n⚠️  IMPORTANT: Save these credentials securely and change the password after first login!`)

    await prisma.$disconnect()
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

// Parse command line arguments
const [,, email, password, role = 'super_admin'] = process.argv

if (!email || !password) {
  console.error('❌ Email and password are required')
  console.log('\nUsage:')
  console.log('  npx tsx scripts/create-admin-with-password.ts <email> <password> [role]')
  console.log('\nRoles: super_admin, admin, moderator')
  console.log('\nExample:')
  console.log('  npx tsx scripts/create-admin-with-password.ts admin@fly2any.com SecurePass123! super_admin')
  process.exit(1)
}

createAdminWithPassword(email, password, role)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error.message)
    process.exit(1)
  })
