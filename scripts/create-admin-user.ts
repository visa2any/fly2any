/**
 * Create Admin User Script
 *
 * Usage:
 *   npx tsx scripts/create-admin-user.ts
 *
 * Creates admin user: support@fly2any.com
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'support@fly2any.com';
  const password = 'Fly2n.';
  const name = 'Admin Support';

  try {
    console.log('🔍 Checking if user already exists...');

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('ℹ️  User already exists. Updating to admin role...');

      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'admin',
          password: hashedPassword,
          name,
        },
      });

      console.log('✅ User updated successfully!');
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   Role: ${updatedUser.role}`);
      console.log(`\n⚠️  Password updated. User must use new password: Fly2n.`);
      return;
    }

    console.log('📝 Creating new admin user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with admin role
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date(), // Mark as verified
        preferences: {
          create: {}, // Create default preferences
        },
      },
    });

    console.log('\n🎉 SUCCESS! Admin user created:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: Fly2n.`);
    console.log('\n✅ User can now sign in at /auth/signin');
    console.log('✅ User has full admin access to /admin routes');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
