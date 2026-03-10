const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const result = await prisma.user.update({
    where: { email: 'admin@fly2any.com' },
    data: { password: hash },
    select: { id: true, email: true, name: true }
  });
  console.log('Password updated for:', result.email);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
