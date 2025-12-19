// Import contacts to production newsletter_subscribers table
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function importContacts() {
  const csvPath = 'C:\\Users\\Power\\Downloads\\valid_emails_for_reactivation.csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  // Skip header
  const dataLines = lines.slice(1);
  console.log(`📊 Found ${dataLines.length} contacts to import`);

  let imported = 0, skipped = 0, errors = 0;

  for (const line of dataLines) {
    // Parse CSV (handle quoted fields)
    const match = line.match(/^"([^"]+)","([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)"$/);
    if (!match) continue;

    const [, email, firstName, lastName, fullName, phone, segment] = match;

    try {
      await prisma.newsletterSubscriber.upsert({
        where: { email: email.toLowerCase() },
        update: {
          firstName: firstName || null,
          status: 'ACTIVE',
          reactivatedAt: new Date(),
        },
        create: {
          email: email.toLowerCase(),
          firstName: firstName || null,
          source: `import_${segment || 'general'}`,
          status: 'ACTIVE',
          dealAlerts: true,
          newRoutes: true,
          weeklyDigest: true,
          worldCupUpdates: true,
        }
      });
      imported++;
      if (imported % 500 === 0) console.log(`   ✓ ${imported} imported...`);
    } catch (e) {
      if (e.code === 'P2002') skipped++;
      else { errors++; console.error(`   ✗ ${email}: ${e.message}`); }
    }
  }

  console.log(`\n✅ IMPORT COMPLETE`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped (dupes): ${skipped}`);
  console.log(`   Errors: ${errors}`);

  // Verify total
  const total = await prisma.newsletterSubscriber.count();
  console.log(`\n📧 Total subscribers in DB: ${total}`);

  await prisma.$disconnect();
}

importContacts().catch(e => { console.error(e); process.exit(1); });
