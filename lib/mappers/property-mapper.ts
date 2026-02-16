import { Property, PropertyRoom, PropertyImage } from '@prisma/client';

type PropertyWithDetails = Property & {
  rooms: PropertyRoom[];
  images: PropertyImage[];
};

/**
 * Maps a Prisma Property into the normalized hotel format used by
 * the search route's final mapper (GET handler lines 1017-1058).
 * 
 * The GET mapper accesses flat fields like hotel.address, hotel.city,
 * hotel.stars, hotel.rooms[].price, so we output that shape here.
 */
export function mapPropertyToHotel(
  property: PropertyWithDetails,
  checkIn: string,
  checkOut: string,
  nights: number
): any {
  // Calculate lowest price
  const lowestPricePerNight = property.basePricePerNight ||
    (property.rooms.length > 0 ? Math.min(...property.rooms.map(r => r.basePricePerNight)) : 0);

  const totalPrice = lowestPricePerNight * nights;

  // Map rooms to the flat rate format the GET mapper expects:
  //   hotel.rooms?.map(room => ({ rateId, name, price, currency, refundable, boardName, maxOccupancy }))
  const rooms = property.rooms.map(room => ({
    rateId: room.id,
    name: room.name,
    price: room.basePricePerNight * nights,
    currency: room.currency,
    refundable: property.cancellationPolicy !== 'super_strict',
    boardName: 'Room Only',
    maxOccupancy: room.maxOccupancy,
  }));

  // Create virtual rate if no rooms defined but base price exists (whole property rental)
  if (rooms.length === 0 && property.basePricePerNight) {
    rooms.push({
      rateId: `${property.id}_main`,
      name: 'Entire Property',
      price: totalPrice,
      currency: property.currency,
      refundable: property.cancellationPolicy !== 'super_strict',
      boardName: 'Room Only',
      maxOccupancy: property.maxGuests,
    });
  }

  // Map images to { url, alt } format matching LiteAPI shape
  const images = property.images.map(img => ({
    url: img.url,
    alt: img.caption || property.name,
  }));

  return {
    id: property.id,
    name: property.name,
    description: property.description || '',

    // Flat location fields (the GET mapper accesses hotel.address, hotel.city, etc.)
    address: property.addressLine1 || '',
    city: property.city,
    country: property.country,
    latitude: property.latitude,
    longitude: property.longitude,

    // Rating fields
    stars: property.starRating || 0,
    rating: property.avgRating || 0,
    reviewCount: property.reviewCount || 0,

    // Media
    images,
    image: property.coverImageUrl || property.images[0]?.url || null,
    thumbnail: property.images[0]?.thumbnailUrl || property.images[0]?.url || null,

    // Amenities
    amenities: property.amenities || [],

    // Pricing
    lowestPrice: totalPrice,
    lowestPricePerNight: lowestPricePerNight,
    currency: property.currency,

    // Rooms (flat rate format for GET mapper)
    rooms,

    // Cancellation
    refundable: property.cancellationPolicy !== 'super_strict' && property.cancellationPolicy !== 'strict',
    hasRefundableRate: property.cancellationPolicy === 'flexible' || property.cancellationPolicy === 'moderate',
    cancellationDeadline: null,
    boardType: 'RO',

    // Hotel policies (matches LiteAPIHotel.hotelPolicies shape)
    hotelPolicies: {
      checkin: property.checkInTime || '15:00',
      checkout: property.checkOutTime || '11:00',
      cancellation: property.cancellationPolicy,
      childPolicy: property.childPolicy || undefined,
      petPolicy: property.petPolicy || undefined,
    },

    // Check-in/out times
    checkInTime: property.checkInTime || '15:00',
    checkOutTime: property.checkOutTime || '11:00',

    // Source identifier
    source: 'Fly2Any',
    lastUpdated: new Date().toISOString(),
  };
}
