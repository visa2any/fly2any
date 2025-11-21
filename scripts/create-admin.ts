/**
 * Direct Admin Creation Script
 *
 * Run this script directly to create an admin user in the database
 * Usage: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Starting admin creation...');

    // Admin credentials
    const ADMIN_EMAIL = 'admin@fly2any.com';
    const ADMIN_PASSWORD = 'admin123';
    const ADMIN_NAME = 'Admin User';

    // Import bcrypt
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    console.log('✅ Password hashed');

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (user) {
      console.log(`✅ User already exists: ${ADMIN_EMAIL}`);
    } else {
      // Create user
      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });
      console.log(`✅ Created user: ${ADMIN_EMAIL}`);
    }

    // Check if admin role exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { userId: user.id },
    });

    if (existingAdmin) {
      console.log('✅ Admin role already exists');
      console.log('=========================================');
      console.log('✅ USE THESE CREDENTIALS:');
      console.log('=========================================');
      console.log(`Email:    ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      console.log('=========================================');
      return;
    }

    // Create admin role
    await prisma.adminUser.create({
      data: {
        userId: user.id,
        role: 'super_admin',
      },
    });

    console.log('✅ Created admin role');

    // Create user preferences if don't exist
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!existingPreferences) {
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
          currency: 'USD',
          language: 'en',
          notifications: {
            email: true,
            push: false,
            sms: false,
          },
        },
      });
      console.log('✅ Created user preferences');
    }

    console.log('');
    console.log('=========================================');
    console.log('✅ ADMIN CREATED SUCCESSFULLY!');
    console.log('=========================================');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('=========================================');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to http://localhost:3000/auth/signin');
    console.log(`2. Sign in with: ${ADMIN_EMAIL}`);
    console.log(`3. Password: ${ADMIN_PASSWORD}`);
    console.log('4. Access /admin/affiliates');
    console.log('=========================================');

  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
