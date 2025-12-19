// Bulk Welcome Back Campaign Sender
const { PrismaClient } = require('@prisma/client');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

const DOMAIN = process.env.MAILGUN_DOMAIN || 'mail.fly2any.com';
const FROM = process.env.EMAIL_FROM || 'Fly2Any <noreply@mail.fly2any.com>';
const BATCH_SIZE = 1; // 1 email at a time (probation: 100/hour limit)
const DELAY_MS = 37000; // 37 sec between emails = ~97/hour (under 100 limit)

async function sendCampaign() {
  // Load template
  const templatePath = path.join(__dirname, '..', 'emails', 'templates', 'welcome-back.html');
  const template = fs.readFileSync(templatePath, 'utf8');

  // Get active subscribers NOT yet sent (skip duplicates)
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: 'ACTIVE', emailsSent: 0 },
    select: { id: true, email: true, firstName: true }
  });

  console.log(`\n📧 WELCOME BACK CAMPAIGN`);
  console.log(`   Total recipients: ${subscribers.length}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Starting...\n`);

  let sent = 0, failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    for (const sub of batch) {
      try {
        // Personalize template
        let html = template
          .replace(/\{\{firstName\}\}/g, sub.firstName || 'Traveler')
          .replace(/\{\{unsubscribe\}\}/g, `https://www.fly2any.com/unsubscribe?email=${encodeURIComponent(sub.email)}`);

        await mg.messages.create(DOMAIN, {
          from: FROM,
          to: [sub.email],
          subject: 'Welcome Back! ✨ Your next adventure awaits + Exclusive Deals Inside',
          html: html,
          'o:tag': ['welcome-back', 'campaign-dec-2024'],
          'o:tracking': true,
          'o:tracking-clicks': false,
          'o:tracking-opens': true,
        });

        // Update DB
        await prisma.newsletterSubscriber.update({
          where: { id: sub.id },
          data: {
            lastEmailSentAt: new Date(),
            emailsSent: { increment: 1 }
          }
        });

        sent++;
      } catch (e) {
        failed++;
        console.log(`   ✗ ${sub.email}: ${e.message}`);
      }
    }

    console.log(`   ✓ ${Math.min(i + BATCH_SIZE, subscribers.length)}/${subscribers.length} sent...`);

    // Delay between batches
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n✅ CAMPAIGN COMPLETE`);
  console.log(`   Sent: ${sent}`);
  console.log(`   Failed: ${failed}`);

  await prisma.$disconnect();
}

sendCampaign().catch(e => { console.error(e); process.exit(1); });
