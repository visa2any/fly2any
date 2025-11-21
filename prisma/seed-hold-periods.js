/**
 * Seed Hold Period Configurations
 *
 * This script populates the HoldPeriodConfig table with default
 * hold period settings for different affiliate categories and trust levels.
 *
 * Hold Period Strategy:
 * - Standard: 30→14→7→3 days (conservative)
 * - Creator: 14→7→3→1 days (moderate)
 * - Influencer: 7→3→1→0 days (fast)
 * - Partner: 7→3→1→0 days (fast)
 * - Enterprise: 3→1→0→0 days (instant for verified)
 *
 * Usage: node prisma/seed-hold-periods.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Hold Period Configurations
const holdPeriodConfigs = [
  // ============================================
  // STANDARD AFFILIATES (Conservative)
  // ============================================
  {
    category: 'standard',
    trustLevel: 'new',
    holdPeriodDays: 30,
    minSuccessfulBookings: 0,
    minTrustScore: 0,
  },
  {
    category: 'standard',
    trustLevel: 'trusted',
    holdPeriodDays: 14,
    minSuccessfulBookings: 10,
    minTrustScore: 60,
  },
  {
    category: 'standard',
    trustLevel: 'verified',
    holdPeriodDays: 7,
    minSuccessfulBookings: 25,
    minTrustScore: 75,
  },
  {
    category: 'standard',
    trustLevel: 'platinum',
    holdPeriodDays: 3,
    minSuccessfulBookings: 50,
    minTrustScore: 90,
  },

  // ============================================
  // CREATORS (Moderate - YouTubers, Bloggers)
  // ============================================
  {
    category: 'creator',
    trustLevel: 'new',
    holdPeriodDays: 14,
    minSuccessfulBookings: 0,
    minTrustScore: 0,
  },
  {
    category: 'creator',
    trustLevel: 'trusted',
    holdPeriodDays: 7,
    minSuccessfulBookings: 15,
    minTrustScore: 65,
  },
  {
    category: 'creator',
    trustLevel: 'verified',
    holdPeriodDays: 3,
    minSuccessfulBookings: 35,
    minTrustScore: 80,
  },
  {
    category: 'creator',
    trustLevel: 'platinum',
    holdPeriodDays: 1,
    minSuccessfulBookings: 75,
    minTrustScore: 95,
  },

  // ============================================
  // INFLUENCERS (Fast - Instagram, TikTok)
  // ============================================
  {
    category: 'influencer',
    trustLevel: 'new',
    holdPeriodDays: 7,
    minSuccessfulBookings: 0,
    minTrustScore: 0,
  },
  {
    category: 'influencer',
    trustLevel: 'trusted',
    holdPeriodDays: 3,
    minSuccessfulBookings: 20,
    minTrustScore: 70,
  },
  {
    category: 'influencer',
    trustLevel: 'verified',
    holdPeriodDays: 1,
    minSuccessfulBookings: 50,
    minTrustScore: 85,
  },
  {
    category: 'influencer',
    trustLevel: 'platinum',
    holdPeriodDays: 0, // Instant payout for platinum influencers
    minSuccessfulBookings: 100,
    minTrustScore: 98,
  },

  // ============================================
  // PARTNERS (Strategic Partnerships)
  // ============================================
  {
    category: 'partner',
    trustLevel: 'new',
    holdPeriodDays: 7,
    minSuccessfulBookings: 0,
    minTrustScore: 0,
  },
  {
    category: 'partner',
    trustLevel: 'trusted',
    holdPeriodDays: 3,
    minSuccessfulBookings: 10,
    minTrustScore: 65,
  },
  {
    category: 'partner',
    trustLevel: 'verified',
    holdPeriodDays: 1,
    minSuccessfulBookings: 25,
    minTrustScore: 80,
  },
  {
    category: 'partner',
    trustLevel: 'platinum',
    holdPeriodDays: 0, // Instant payout
    minSuccessfulBookings: 50,
    minTrustScore: 95,
  },

  // ============================================
  // ENTERPRISE (Corporate Partners)
  // ============================================
  {
    category: 'enterprise',
    trustLevel: 'new',
    holdPeriodDays: 3,
    minSuccessfulBookings: 0,
    minTrustScore: 0,
  },
  {
    category: 'enterprise',
    trustLevel: 'trusted',
    holdPeriodDays: 1,
    minSuccessfulBookings: 5,
    minTrustScore: 60,
  },
  {
    category: 'enterprise',
    trustLevel: 'verified',
    holdPeriodDays: 0, // Instant payout
    minSuccessfulBookings: 10,
    minTrustScore: 75,
  },
  {
    category: 'enterprise',
    trustLevel: 'platinum',
    holdPeriodDays: 0, // Instant payout
    minSuccessfulBookings: 25,
    minTrustScore: 90,
  },
]

async function seedHoldPeriods() {
  console.log('🌱 Seeding Hold Period Configurations...\n')

  let created = 0
  let updated = 0

  for (const config of holdPeriodConfigs) {
    try {
      const result = await prisma.holdPeriodConfig.upsert({
        where: {
          category_trustLevel: {
            category: config.category,
            trustLevel: config.trustLevel,
          },
        },
        create: config,
        update: {
          holdPeriodDays: config.holdPeriodDays,
          minSuccessfulBookings: config.minSuccessfulBookings,
          minTrustScore: config.minTrustScore,
        },
      })

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++
        console.log(
          `✅ Created: ${config.category.padEnd(12)} | ${config.trustLevel.padEnd(10)} → ${config.holdPeriodDays} days`
        )
      } else {
        updated++
        console.log(
          `🔄 Updated: ${config.category.padEnd(12)} | ${config.trustLevel.padEnd(10)} → ${config.holdPeriodDays} days`
        )
      }
    } catch (error) {
      console.error(`❌ Error seeding ${config.category}/${config.trustLevel}:`, error.message)
    }
  }

  console.log(`\n✨ Seeding complete!`)
  console.log(`   Created: ${created}`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Total:   ${holdPeriodConfigs.length}\n`)

  // Display summary table
  console.log('📊 Hold Period Summary:')
  console.log('━'.repeat(70))
  console.log('Category'.padEnd(15) + 'New'.padEnd(10) + 'Trusted'.padEnd(10) + 'Verified'.padEnd(10) + 'Platinum')
  console.log('━'.repeat(70))

  const categories = ['standard', 'creator', 'influencer', 'partner', 'enterprise']
  for (const cat of categories) {
    const configs = holdPeriodConfigs.filter((c) => c.category === cat)
    const days = configs.map((c) => `${c.holdPeriodDays}d`)
    console.log(cat.padEnd(15) + days[0].padEnd(10) + days[1].padEnd(10) + days[2].padEnd(10) + days[3])
  }
  console.log('━'.repeat(70))
}

async function main() {
  try {
    await seedHoldPeriods()
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
