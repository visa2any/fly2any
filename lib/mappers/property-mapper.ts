import { Property, PropertyRoom, PropertyImage } from '@prisma/client';
import { Hotel, HotelRate } from '@/lib/hotels/types';

type PropertyWithDetails = Property & {
  rooms: PropertyRoom[];
  images: PropertyImage[];
};

export function mapPropertyToHotel(
  property: PropertyWithDetails,
  checkIn: string,
  checkOut: string,
  nights: number
): Hotel {
  // Calculate lowest price
  const lowestPricePerNight = property.basePricePerNight ||
    (property.rooms.length > 0 ? Math.min(...property.rooms.map(r => r.basePricePerNight)) : 0);

  const totalPrice = lowestPricePerNight * nights;

  // Map rooms to rates
  const rates: HotelRate[] = property.rooms.map(room => ({
    id: room.id,
    hotelId: property.id,
    roomType: room.name,
    roomDescription: room.description || '',
    bedType: room.bedType || 'queen',
    bedCount: room.bedCount,
    maxOccupancy: room.maxOccupancy,
    price: {
      amount: (room.basePricePerNight * nights).toString(),
      currency: room.currency,
    },
    paymentType: 'prepaid',
    refundable: property.cancellationPolicy !== 'super_strict',
    cancellationPolicy: {
      type: property.cancellationPolicy === 'flexible' ? 'free_cancellation' :
            property.cancellationPolicy === 'moderate' ? 'partial_refund' : 'non_refundable',
      description: property.cancellationDetails?.description || `Cancellation policy: ${property.cancellationPolicy}`,
    },
    amenities: room.amenities,
    available: true, // Assumed available if returned by search query
    rateType: 'standard',
  }));

  // Create virtual rate if no rooms defined but base price exists (e.g. for whole house rental)
  if (rates.length === 0 && property.basePricePerNight) {
    rates.push({
      id: `${property.id}_main`,
      hotelId: property.id,
      roomType: 'Entire Property',
      roomDescription: 'Entire property rental',
      maxOccupancy: property.maxGuests,
      price: {
        amount: totalPrice.toString(),
        currency: property.currency,
      },
      paymentType: 'prepaid',
      refundable: property.cancellationPolicy !== 'super_strict',
      cancellationPolicy: {
        type: property.cancellationPolicy === 'flexible' ? 'free_cancellation' :
              property.cancellationPolicy === 'moderate' ? 'partial_refund' : 'non_refundable',
        description: property.cancellationDetails?.description || 'Standard cancellation policy',
      },
      amenities: property.amenities,
      available: true,
      rateType: 'standard',
    });
  }

  return {
    id: property.id,
    name: property.name,
    description: property.description || '',
    location: {
      latitude: property.latitude,
      longitude: property.longitude,
      address: property.addressLine1,
      city: property.city,
      country: property.country,
      postalCode: property.postalCode || undefined,
    },
    address: {
      street: property.addressLine1,
      city: property.city,
      country: property.country,
      postalCode: property.postalCode || undefined,
    },
    city: property.city,
    countryCode: property.countryCode || 'XX',
    latitude: property.latitude,
    longitude: property.longitude,
    stars: property.starRating || 0,
    rating: property.avgRating,
    reviewCount: property.reviewCount,
    images: property.images.map(img => ({
      url: img.url,
      caption: img.caption || undefined,
      type: 'room', // Simplified
    })),
    image: property.coverImageUrl || property.images[0]?.url || null,
    thumbnail: property.images[0]?.thumbnailUrl || property.images[0]?.url || null,
    amenities: property.amenities,
    lowestPrice: totalPrice,
    lowestPricePerNight: lowestPricePerNight,
    currency: property.currency,
    rates: rates,
    source: 'Fly2Any',
    lastUpdated: new Date().toISOString(),
  };
}
