/**
 * Make User Admin Script
 *
 * Usage:
 *   npx tsx scripts/make-admin.ts user@example.com
 *
 * This script promotes a user to admin role by their email address.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    console.log(`🔍 Looking for user: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('\n💡 Make sure the user has signed in at least once.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️  User ${email} is already an admin.`);
      process.exit(0);
    }

    console.log(`✅ User found: ${user.name || user.email}`);
    console.log(`📝 Current role: ${user.role || 'user'}`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });

    console.log(`\n🎉 SUCCESS! User ${email} is now an admin.`);
    console.log(`📋 Updated role: ${updatedUser.role}`);
    console.log(`\n⚠️  IMPORTANT: User must sign out and sign in again for changes to take effect.`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address required');
  console.log('\nUsage:');
  console.log('  npx tsx scripts/make-admin.ts user@example.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Error: Invalid email format: ${email}`);
  process.exit(1);
}

makeAdmin(email);
