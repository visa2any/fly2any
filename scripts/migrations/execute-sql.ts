import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function executeSQLFile() {
  try {
    let sqlContent = fs.readFileSync(path.join(__dirname, 'create-auth-tables.sql'), 'utf-8')

    // Remove SQL comments (lines starting with --)
    sqlContent = sqlContent.replace(/^--.*$/gm, '')

    // Split by semicolons and filter out empty statements
    const allStatements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    // Separate statements by type to ensure correct execution order
    const createTables = allStatements.filter(s => /CREATE\s+TABLE/is.test(s))
    const createIndexes = allStatements.filter(s => /CREATE\s+(UNIQUE\s+)?INDEX/is.test(s))
    const alterTables = allStatements.filter(s => /ALTER\s+TABLE/is.test(s))

    const orderedStatements = [...createTables, ...createIndexes, ...alterTables]

    console.log(`Executing ${orderedStatements.length} SQL statements...`)
    console.log(`  - ${createTables.length} CREATE TABLE`)
    console.log(`  - ${createIndexes.length} CREATE INDEX`)
    console.log(`  - ${alterTables.length} ALTER TABLE\n`)

    for (let i = 0; i < orderedStatements.length; i++) {
      const statement = orderedStatements[i]
      if (statement.trim().length === 0) continue

      try {
        await prisma.$executeRawUnsafe(statement)

        // Extract table/index name for better logging
        const match = statement.match(/(?:CREATE|ALTER)\s+(TABLE|INDEX|UNIQUE\s+INDEX)\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?/i)
        const type = match ? match[1] : 'statement'
        const name = match ? match[2] : `#${i + 1}`

        console.log(`✓ ${type}: ${name}`)
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists')) {
          console.log(`⊘ Skipping (already exists)`)
        } else {
          console.error(`✗ Failed statement ${i + 1}:`, error.message)
          console.error(`Statement:`, statement.substring(0, 100))
          throw error
        }
      }
    }

    console.log('\n✅ Auth tables setup complete!')
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

executeSQLFile()
