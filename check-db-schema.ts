import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    // Check trip_groups table structure
    const tripGroups = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'trip_groups' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📊 trip_groups table structure:');
    console.log(JSON.stringify(tripGroups, null, 2));
    
    // Check group_members table structure
    const groupMembers = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'group_members' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📊 group_members table structure:');
    console.log(JSON.stringify(groupMembers, null, 2));
    
    // Check if referrals table exists
    const referrals = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'referrals' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📊 referrals table structure:');
    console.log(JSON.stringify(referrals, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
