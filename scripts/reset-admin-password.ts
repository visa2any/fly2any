/**
 * Admin Password Reset Script
 * Run: npx tsx scripts/reset-admin-password.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@fly2any.com';
  const newPassword = process.argv[3] || 'Admin123!';

  console.log(`\n🔐 Resetting password for: ${email}`);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`\n⚠️  User not found. Creating admin user...`);
    await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Admin user created: ${email}`);
  } else {
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log(`✅ Password updated for: ${email}`);
  }

  console.log(`\n📋 Login credentials:`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${newPassword}`);
  console.log(`\n⚠️  Change this password after first login!\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
