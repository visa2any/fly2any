import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkTables() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    console.log('Tables in database:', result)
  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()
