/**
 * Auto-Initialize Admin User
 *
 * Automatically creates a default admin user on server startup if none exists
 */

import { getPrismaClient } from '@/lib/prisma';

const prisma = getPrismaClient();

export async function autoInitializeAdmin() {
  try {
    // Check if any admin exists
    const adminCount = await prisma!.adminUser.count();

    if (adminCount > 0) {
      console.log('✅ Admin users already exist. Skipping auto-initialization.');
      return { exists: true, created: false };
    }

    console.log('🔧 No admin users found. Creating default admin...');

    // Admin credentials
    const ADMIN_EMAIL = 'admin@fly2any.com';
    const ADMIN_PASSWORD = 'admin123';
    const ADMIN_NAME = 'Admin User';

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Check if user exists
    let user = await prisma!.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma!.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });
      console.log(`✅ Created user: ${ADMIN_EMAIL}`);
    }

    // Create admin role
    await prisma!.adminUser.create({
      data: {
        userId: user.id,
        role: 'super_admin',
      },
    });

    // Create user preferences if don't exist
    const existingPreferences = await prisma!.userPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!existingPreferences) {
      await prisma!.userPreferences.create({
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
    }

    console.log('✅ ========================================');
    console.log('✅ DEFAULT ADMIN CREATED SUCCESSFULLY!');
    console.log('✅ ========================================');
    console.log(`✅ Email:    ${ADMIN_EMAIL}`);
    console.log(`✅ Password: ${ADMIN_PASSWORD}`);
    console.log('✅ ========================================');
    console.log('✅ Go to: http://localhost:3000/auth/signin');
    console.log('✅ ========================================');

    return {
      exists: false,
      created: true,
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    };

  } catch (error: any) {
    console.error('❌ Failed to auto-initialize admin:', error.message);
    return { exists: false, created: false, error: error.message };
  }
}
