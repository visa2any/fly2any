/**
 * List Admin Users Script
 *
 * Usage:
 *   npx tsx scripts/list-admins.ts
 *
 * This script lists all users with admin role.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    console.log('🔍 Fetching admin users...\n');

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (admins.length === 0) {
      console.log('ℹ️  No admin users found.');
      console.log('\n💡 To make a user admin, run:');
      console.log('   npx tsx scripts/make-admin.ts user@example.com');
      process.exit(0);
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name || 'Unknown'} (${admin.email})`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
      console.log(`   Last Login: ${admin.lastLoginAt?.toLocaleDateString() || 'Never'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
