import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

const columns = [
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "firstName" TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastName" TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "phone" TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3)',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "gender" TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "country" TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "timezone" TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "bio" TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3)'
]

async function addColumns() {
  for (const sql of columns) {
    await prisma.$executeRawUnsafe(sql)
    console.log('✓', sql.match(/ADD COLUMN.*"(\w+)"/)?.[1])
  }
  console.log('\n✅ All columns added')
  await prisma.$disconnect()
}

addColumns().catch(e => { console.error(e); process.exit(1) })
