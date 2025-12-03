/**
 * Prisma Seed Script
 * Seeds the database with initial promo codes and data
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create WELCOME5 promo code
  const welcome5 = await prisma.promoCode.upsert({
    where: { code: 'WELCOME5' },
    update: {},
    create: {
      code: 'WELCOME5',
      type: 'percentage',
      value: 5,
      currency: 'USD',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 years
      usageLimit: null, // Unlimited usage
      perUserLimit: 1, // Once per user
      applicableProducts: ['hotel', 'flight', 'car', 'activity'],
      newUsersOnly: true,
      description: '5% off your first booking - Welcome offer for new customers!',
      isActive: true,
    },
  });
  console.log('Created/Updated WELCOME5 promo code:', welcome5.code);

  // Create additional promo codes
  const promoCodes = [
    {
      code: 'HOTEL10',
      type: 'percentage',
      value: 10,
      currency: 'USD',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      usageLimit: 1000,
      perUserLimit: 3,
      applicableProducts: ['hotel'],
      newUsersOnly: false,
      description: '10% off hotel bookings',
      isActive: true,
    },
    {
      code: 'SUMMER2024',
      type: 'percentage',
      value: 15,
      maxDiscount: 100,
      currency: 'USD',
      validFrom: new Date(),
      validUntil: new Date('2024-09-30'),
      usageLimit: 500,
      perUserLimit: 1,
      applicableProducts: ['hotel', 'flight'],
      newUsersOnly: false,
      description: '15% off summer bookings (max $100)',
      isActive: true,
    },
    {
      code: 'FLY2ANYLOYALTY',
      type: 'percentage',
      value: 5,
      currency: 'USD',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      usageLimit: null,
      perUserLimit: 10,
      applicableProducts: ['hotel', 'flight', 'car', 'activity'],
      newUsersOnly: false,
      description: '5% loyalty member discount',
      isActive: true,
    },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo as any,
    });
    console.log('Created/Updated promo code:', promo.code);
  }

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
