import { NextRequest, NextResponse } from 'next/server';

/**
 * Hotel Q&A API Endpoint
 * Answers questions about a specific hotel using its data
 */

interface HotelQARequest {
  question: string;
  hotelId: string;
  hotelData?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: HotelQARequest = await request.json();
    const { question, hotelId, hotelData } = body;

    if (!question || !hotelId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: question and hotelId'
      }, { status: 400 });
    }

    // Generate answer based on hotel data and question
    const answer = generateAnswer(question, hotelData);

    return NextResponse.json({
      success: true,
      answer,
      hotelId,
    });

  } catch (error: any) {
    console.error('Hotel Q&A Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process question',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Generate answer based on question pattern matching and hotel data
 * In a production environment, this would use an LLM like OpenAI GPT or Anthropic Claude
 */
function generateAnswer(question: string, hotelData: any): string {
  const q = question.toLowerCase();

  // Amenities questions
  if (q.includes('amenities') || q.includes('facilities') || q.includes('features')) {
    if (hotelData?.facilities && hotelData.facilities.length > 0) {
      const amenityList = hotelData.facilities
        .map((f: any) => f.name || f)
        .filter((name: string) => name)
        .slice(0, 10)
        .join(', ');
      return `This hotel offers the following amenities: ${amenityList}. ${
        hotelData.facilities.length > 10 ? `And ${hotelData.facilities.length - 10} more!` : ''
      }`;
    }
    return 'Amenities information is not currently available for this hotel. Please contact the hotel directly for details.';
  }

  // Breakfast questions
  if (q.includes('breakfast') || q.includes('meal') || q.includes('food')) {
    if (hotelData?.facilities?.some((f: any) =>
      (f.name || f).toLowerCase().includes('breakfast') ||
      (f.name || f).toLowerCase().includes('restaurant')
    )) {
      return 'Yes, this hotel offers breakfast facilities! Check the room rates for specific breakfast inclusions, as some rooms include breakfast while others may charge separately.';
    }
    return 'Breakfast information varies by room type. Please check individual room descriptions for meal inclusions, or contact the hotel directly.';
  }

  // Cancellation policy
  if (q.includes('cancel') || q.includes('refund') || q.includes('policy')) {
    if (hotelData?.rates?.[0]?.cancellationPolicies) {
      const policy = hotelData.rates[0].cancellationPolicies;
      if (policy.refundableTag === 'NRF') {
        return 'This reservation is non-refundable. No cancellation or modification is allowed.';
      } else if (policy.cancelPolicyInfos?.[0]) {
        const cancelInfo = policy.cancelPolicyInfos[0];
        const cancelDate = new Date(cancelInfo.cancelTime);
        return `You can cancel for free until ${cancelDate.toLocaleDateString()} at ${cancelDate.toLocaleTimeString()}. After this time, a cancellation fee of $${cancelInfo.amount} will apply.`;
      }
    }
    return 'Cancellation policies vary by room type and rate. Please check the specific cancellation terms for your selected room when booking.';
  }

  // Location/Distance questions
  if (q.includes('airport') || q.includes('distance') || q.includes('location') || q.includes('far') || q.includes('close')) {
    if (hotelData?.distance) {
      return `The hotel is located ${hotelData.distance}. ${hotelData?.address || ''}`;
    }
    if (hotelData?.address) {
      return `The hotel is located at ${hotelData.address}. For precise distance information to specific locations, you can use mapping services or contact the hotel directly.`;
    }
    return 'Specific distance information is not available. The hotel\'s address will be provided in your booking confirmation.';
  }

  // Parking questions
  if (q.includes('parking') || q.includes('park')) {
    if (hotelData?.facilities?.some((f: any) =>
      (f.name || f).toLowerCase().includes('parking')
    )) {
      return 'Yes, this hotel offers parking facilities. Contact the hotel directly for rates and availability.';
    }
    return 'Parking information is not currently available. Please contact the hotel directly for details about parking options and fees.';
  }

  // WiFi/Internet questions
  if (q.includes('wifi') || q.includes('wi-fi') || q.includes('internet')) {
    if (hotelData?.facilities?.some((f: any) =>
      (f.name || f).toLowerCase().includes('wifi') ||
      (f.name || f).toLowerCase().includes('internet')
    )) {
      return 'Yes, WiFi is available at this hotel! Many hotels offer free WiFi, but please check with the property for specific details and any potential charges.';
    }
    return 'WiFi availability information is not confirmed. Most modern hotels offer WiFi - please contact the hotel for specific details.';
  }

  // Pet questions
  if (q.includes('pet') || q.includes('dog') || q.includes('cat') || q.includes('animal')) {
    if (hotelData?.facilities?.some((f: any) =>
      (f.name || f).toLowerCase().includes('pet')
    )) {
      return 'This hotel appears to be pet-friendly! Contact the hotel directly for their specific pet policy, any size restrictions, and associated fees.';
    }
    return 'Pet policy information is not confirmed. Please contact the hotel directly to inquire about their pet policy and any associated fees.';
  }

  // Pool questions
  if (q.includes('pool') || q.includes('swim')) {
    if (hotelData?.facilities?.some((f: any) =>
      (f.name || f).toLowerCase().includes('pool')
    )) {
      return 'Yes, this hotel has a pool! Contact the hotel for details about pool hours, if it\'s indoor or outdoor, and whether it\'s heated.';
    }
    return 'Pool information is not currently available. Please contact the hotel directly for details about swimming facilities.';
  }

  // Gym/Fitness questions
  if (q.includes('gym') || q.includes('fitness') || q.includes('exercise')) {
    if (hotelData?.facilities?.some((f: any) =>
      (f.name || f).toLowerCase().includes('gym') ||
      (f.name || f).toLowerCase().includes('fitness')
    )) {
      return 'Yes, this hotel has fitness facilities! Contact the hotel for details about gym hours and available equipment.';
    }
    return 'Fitness facility information is not currently available. Please contact the hotel directly.';
  }

  // Check-in/Check-out time
  if (q.includes('check') && (q.includes('in') || q.includes('out') || q.includes('time'))) {
    const checkIn = hotelData?.checkInTime || hotelData?.checkIn || '15:00';
    const checkOut = hotelData?.checkOutTime || hotelData?.checkOut || '11:00';
    return `Standard check-in time is ${checkIn} and check-out time is ${checkOut}. Early check-in or late check-out may be available upon request and subject to availability - please contact the hotel directly to arrange this.`;
  }

  // Room questions
  if (q.includes('room') && (q.includes('size') || q.includes('big') || q.includes('large') || q.includes('small'))) {
    return 'Room sizes vary by room type. Please check the specific room descriptions when selecting your accommodation. The hotel listing will include details about bed types and occupancy limits.';
  }

  // Rating/Review questions
  if (q.includes('rating') || q.includes('review') || q.includes('recommend')) {
    if (hotelData?.rating) {
      return `This hotel has a rating of ${hotelData.rating} out of 5 stars based on guest reviews. You can read detailed reviews from previous guests to make an informed decision.`;
    }
    return 'Guest ratings and reviews will help you make an informed decision. Check the hotel details page for comprehensive guest feedback.';
  }

  // Price questions
  if (q.includes('price') || q.includes('cost') || q.includes('expensive') || q.includes('cheap')) {
    if (hotelData?.rates?.[0]?.retailRate?.total?.[0]) {
      const price = hotelData.rates[0].retailRate.total[0];
      return `Prices start from $${price.amount} ${price.currency || 'USD'} for your selected dates. Final price may vary based on room type, dates, and current availability. Taxes and fees may apply.`;
    }
    return 'Prices vary based on room type, dates, and availability. Please check the available rooms and rates for your specific travel dates.';
  }

  // Default response for unrecognized questions
  return `That's a great question! For the most accurate and up-to-date information about "${question}", I recommend:

1. Checking the hotel's detailed amenities and policies on this page
2. Contacting the hotel directly - they can provide the most specific information
3. Reading recent guest reviews for first-hand experiences

Is there anything else I can help you with?`;
}
