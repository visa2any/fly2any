const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');

    const ADMIN_EMAIL = 'admin@fly2any.com';
    const ADMIN_PASSWORD = 'admin123';
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create or find user
    let user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {},
      create: {
        email: ADMIN_EMAIL,
        name: 'Admin User',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    console.log('✅ User created/found');

    // Create admin role
    await prisma.adminUser.upsert({
      where: { userId: user.id },
      update: { role: 'super_admin' },
      create: {
        userId: user.id,
        role: 'super_admin',
      },
    });

    console.log('✅ Admin role created');

    // Create preferences
    try {
      await prisma.userPreferences.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          currency: 'USD',
          language: 'en',
          emailNotifications: true,
          priceAlertEmails: true,
          dealAlerts: true,
        },
      });
    } catch (e) {
      console.log('⚠️  Skipping preferences (already exists or schema mismatch)');
    }

    console.log('');
    console.log('=========================================');
    console.log('✅ ADMIN READY!');
    console.log('=========================================');
    console.log('Email:    admin@fly2any.com');
    console.log('Password: admin123');
    console.log('=========================================');
    console.log('Go to: http://localhost:3000/auth/signin');
    console.log('=========================================');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
