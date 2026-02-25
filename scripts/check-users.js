const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({
    take: 10,
    select: { id: true, email: true, name: true, password: true }
  });
  
  console.log('\n=== Users in database ===');
  if (users.length === 0) {
    console.log('No users found!');
  } else {
    users.forEach(u => {
      console.log(`${u.email} | ${u.name} | has_password: ${!!u.password}`);
    });
  }
  
  await p.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
