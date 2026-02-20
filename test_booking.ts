import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPropertyBooking() {
  console.log('Fetching properties to find a native property...');
  const property = await prisma.property.findFirst({
    include: { rooms: true }
  });

  if (!property) {
    console.error('No properties found in DB to test with.');
    return;
  }

  // Find a test user or just use null if optional
  // Our new schema allows userId to be optional!

  console.log(`Found Property: ${property.name} (${property.id})`);

  try {
    const payload = {
      source: 'Fly2Any',
      hotelId: property.id,
      hotelName: property.name,
      hotelCity: property.city,
      hotelCountry: property.country,
      roomId: property.rooms[0]?.id || 'standard',
      roomName: property.rooms[0]?.name || 'Entire Property',
      checkInDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      nights: 2,
      pricePerNight: property.basePricePerNight?.toString() || '150.00',
      subtotal: ( (property.basePricePerNight || 150) * 2).toString(),
      taxesAndFees: '0',
      totalPrice: ( (property.basePricePerNight || 150) * 2).toString(),
      currency: property.currency,
      guestTitle: 'Mr',
      guestFirstName: 'Test',
      guestLastName: 'User',
      guestEmail: 'test@fly2any.com',
      guestPhone: '+1234567890',
      specialRequests: 'Test booking',
      paymentIntentId: 'demo_test_123',
      cancellable: true,
      breakfastIncluded: false
    };

    console.log('Sending booking request...');
    const response = await fetch('http://localhost:3000/api/hotels/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (response.ok) {
      console.log('✅ API returned success. Verifying in DB...');
      const propertyBooking = await prisma.propertyBooking.findFirst({
        where: { guestEmail: 'test@fly2any.com' },
        orderBy: { createdAt: 'desc' }
      });

      if (propertyBooking) {
        console.log('🎉 SUCCESS! PropertyBooking found in database:');
        console.log(propertyBooking);
        
        // Cleanup test data
        await prisma.propertyBooking.delete({ where: { id: propertyBooking.id }});
        console.log('Test booking cleaned up.');
      } else {
        console.error('❌ FAILED: PropertyBooking was not found in the database despite API success.');
      }
    } else {
      console.error('❌ FAILED: API request failed.');
    }
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testPropertyBooking();
