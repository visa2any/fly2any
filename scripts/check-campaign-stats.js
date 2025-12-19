const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function checkStats() {
  const total = await prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } });
  const sent = await prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE', emailsSent: { gt: 0 } } });
  const pending = await prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE', emailsSent: 0 } });

  console.log('\n📊 CAMPAIGN STATS');
  console.log('   Total ACTIVE subscribers:', total);
  console.log('   ✅ Already sent:', sent);
  console.log('   ⏳ Still pending:', pending);
  console.log('   Progress:', ((sent / total) * 100).toFixed(1) + '%');

  // Estimate time remaining at 97/hour rate
  const hoursRemaining = pending / 97;
  console.log('\n⏱️  Estimated time to complete:', hoursRemaining.toFixed(1), 'hours at 97/hr rate');

  await prisma.$disconnect();
}

checkStats().catch(e => { console.error(e); process.exit(1); });
