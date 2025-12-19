/**
 * Sync Mailgun Bounces to Database
 * Marks bounced emails as suppressed to prevent future sends
 *
 * Run: npx ts-node scripts/sync-mailgun-bounces.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mail.fly2any.com';

async function fetchMailgunBounces(): Promise<string[]> {
  const emails: string[] = [];
  let page = '';

  do {
    const url = page || `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/bounces?limit=100`;
    const res = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')
      }
    });

    const data = await res.json();
    if (data.items) {
      emails.push(...data.items.map((i: any) => i.address.toLowerCase()));
    }
    page = data.paging?.next || '';
  } while (page && emails.length < 5000);

  return emails;
}

async function syncBounces() {
  console.log('🔄 Fetching bounces from Mailgun...');
  const bounces = await fetchMailgunBounces();
  console.log(`📧 Found ${bounces.length} bounced emails`);

  if (bounces.length === 0) {
    console.log('✅ No bounces to sync');
    return;
  }

  // Batch add to EmailSuppression using createMany
  console.log('💾 Syncing to database (batch mode)...');

  const BATCH_SIZE = 100;
  let added = 0;

  for (let i = 0; i < bounces.length; i += BATCH_SIZE) {
    const batch = bounces.slice(i, i + BATCH_SIZE);
    try {
      const result = await prisma.emailSuppression.createMany({
        data: batch.map(email => ({
          email,
          reason: 'hard_bounce',
          details: 'Mailgun sync'
        })),
        skipDuplicates: true
      });
      added += result.count;
      console.log(`  Progress: ${i + BATCH_SIZE}/${bounces.length} (+${result.count})`);
    } catch (e: any) {
      console.log(`  Batch ${i}: ${e.message?.slice(0, 40)}`);
    }
  }

  console.log(`✅ Added ${added} new suppressions`);

  // Update NewsletterSubscriber status (batch)
  const updated = await prisma.newsletterSubscriber.updateMany({
    where: { email: { in: bounces } },
    data: { status: 'bounced' }
  });

  console.log(`📋 Marked ${updated.count} subscribers as bounced`);
}

syncBounces()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
