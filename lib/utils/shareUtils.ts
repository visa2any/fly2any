/**
 * Flight Sharing Utilities
 * Comprehensive sharing system with conversion optimization
 */

import type { FlightOffer } from '@/lib/flights/types';
import { normalizePrice } from '@/lib/flights/types';

export type SharePlatform =
  | 'whatsapp'
  | 'telegram'
  | 'facebook'
  | 'twitter'
  | 'tiktok'
  | 'linkedin'
  | 'sms'
  | 'email'
  | 'copy'
  | 'download'
  | 'image_captured'
  | 'image_native_share'
  | 'image_download'
  | 'image_whatsapp'
  | 'image_facebook'
  | 'image_twitter'
  | 'image_instagram';

export interface ShareData {
  flightId: string;
  route: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  originalPrice?: number;
  savings?: number;
  savingsPercent?: number;
  dealScore?: number;
  dealTier?: string;
  airline: string;
  airlineName: string;
  airlineRating?: number;
  onTimePerformance?: number;
  duration: string;
  stops: number;
  isDirect: boolean;
  layoverInfo?: string;
  seatsLeft?: number;
  carryOnIncluded: boolean;
  carryOnWeight?: string;
  checkedBags: number;
  checkedWeight?: string;
  cabinClass: string;
  fareType: string;
  brandedFareName?: string;
  isRefundable?: boolean;
  isChangeable?: boolean;
  priceDropping?: boolean;
  bookingsToday?: number;
  viewingCount?: number;
  // Extended card data
  amenities?: {
    wifi: boolean;
    power: boolean;
    meals: string;
    entertainment: boolean;
    isEstimated: boolean;
  };
  co2Emissions?: number;
  co2Comparison?: number; // % vs average
  aircraft?: string;
  terminals?: {
    departure?: string;
    arrival?: string;
  };
  priceVsMarket?: number;
}

/**
 * Generate deep link URL for shared flight
 */
export function generateShareUrl(
  flightId: string,
  platform: SharePlatform,
  userId?: string
): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://fly2any.com';

  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: 'social_share',
    utm_campaign: 'flight_sharing',
  });

  if (userId) {
    params.append('sharedBy', userId);
  }

  // Add referral tracking
  params.append('ref', generateReferralCode(flightId, platform));

  return `${baseUrl}/flight/${flightId}?${params.toString()}`;
}

/**
 * Generate unique referral code for tracking
 */
function generateReferralCode(flightId: string, platform: SharePlatform): string {
  const timestamp = Date.now().toString(36);
  const platformCode = platform.substring(0, 2).toUpperCase();
  const flightCode = flightId.substring(0, 6);
  return `${platformCode}${flightCode}${timestamp}`;
}

/**
 * Generate persuasive share text based on platform
 */
export function generateShareText(
  data: ShareData,
  platform: SharePlatform
): string {
  const {
    route,
    from,
    to,
    departureDate,
    price,
    currency,
    savings,
    savingsPercent,
    dealScore,
    dealTier,
    airline,
    airlineRating,
    duration,
    stops,
    isDirect,
    seatsLeft,
    carryOnIncluded,
    checkedBags,
    cabinClass,
    priceDropping,
    bookingsToday,
    viewingCount,
  } = data;

  const formattedDate = new Date(departureDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Get extended data with safe defaults
  const {
    departureTime = '',
    arrivalTime = '',
    airlineName = airline,
    onTimePerformance,
    layoverInfo,
    carryOnWeight,
    checkedWeight,
    brandedFareName,
    isRefundable,
    isChangeable,
    amenities,
    co2Emissions,
    co2Comparison,
    aircraft,
    terminals,
    priceVsMarket,
  } = data;

  // Platform-specific templates
  switch (platform) {
    case 'whatsapp':
    case 'telegram':
      return `*FLY2ANY FLIGHT DEAL*

*${dealScore ? `${dealScore}/100` : 'EXCELLENT'} DEAL SCORE* ${getDealEmoji(dealTier)}

*${from} -> ${to}*
${formattedDate}

*PRICE: ${currency} ${price}*
${savingsPercent ? `*SAVE ${savingsPercent}%* (was ${currency} ${data.originalPrice || Math.round(price * 1.2)})` : ''}
${priceVsMarket && priceVsMarket < 0 ? `${Math.abs(Math.round(priceVsMarket))}% *below market avg*` : ''}

*FLIGHT DETAILS*
Departure: ${departureTime}${terminals?.departure ? ` (Terminal ${terminals.departure})` : ''}
Arrival: ${arrivalTime}${terminals?.arrival ? ` (Terminal ${terminals.arrival})` : ''}
Duration: ${duration}
${isDirect ? '*DIRECT FLIGHT*' : `${stops} stop(s)${layoverInfo ? ` - ${layoverInfo}` : ''}`}

Airline: ${airlineName}
${airlineRating ? `Rating: ${airlineRating}/5.0` : ''}
${onTimePerformance ? `On-time: ${onTimePerformance}%` : ''}
${aircraft ? `Aircraft: ${aircraft}` : ''}

Class: ${cabinClass}
${brandedFareName ? `Fare: ${brandedFareName}` : ''}

*BAGGAGE & AMENITIES*
Carry-on: ${carryOnIncluded ? `✓ Included${carryOnWeight ? ` (${carryOnWeight})` : ''}` : '✗ Not included'}
Checked: ${checkedBags > 0 ? `✓ ${checkedBags} bag(s)${checkedWeight ? ` (${checkedWeight} each)` : ''}` : '✗ Not included'}
${amenities ? `
In-flight:
${amenities.wifi ? '✓ WiFi' : '✗ WiFi'}
${amenities.power ? '✓ Power' : '✗ Power'}
${amenities.meals !== 'None' ? `✓ ${amenities.meals}` : '✗ Meals'}
${amenities.entertainment ? '✓ Entertainment' : '✗ Entertainment'}${amenities.isEstimated ? ' (Estimated)' : ''}` : ''}
${(isRefundable !== undefined || isChangeable !== undefined) ? `
*FARE POLICIES*
${isRefundable ? '✓ Refundable' : '✗ Non-refundable'}
${isChangeable ? '✓ Changes allowed' : '✗ No changes'}
✓ Free cancellation within 24h` : ''}
${co2Emissions ? `
CO2: ${co2Emissions}kg${co2Comparison ? ` (${Math.abs(Math.round(co2Comparison))}% ${co2Comparison < 0 ? 'LESS' : 'more'} than avg)` : ''}` : ''}

*URGENCY*
${seatsLeft && seatsLeft <= 5 ? `*ONLY ${seatsLeft} SEATS LEFT!*\n` : ''}${viewingCount && viewingCount > 20 ? `${viewingCount} people viewing now\n` : ''}${bookingsToday && bookingsToday > 50 ? `${bookingsToday} booked today!\n` : ''}${priceDropping ? `Price dropping - book now!\n` : ''}
*POWERED BY FLY2ANY*
✓ Best Price Guaranteed
✓ Instant Confirmation
✓ 24/7 Support

*BOOK NOW* before price goes up!`;

    case 'twitter':
      // Twitter has character limit - keep it concise
      const twitterText = `✈️ ${from} → ${to} | ${currency} ${price}${savingsPercent && savingsPercent > 15 ? ` 🔥 ${savingsPercent}% OFF!` : ''}
${dealScore && dealScore >= 85 ? '💎 Excellent Deal' : ''}${isDirect ? ' ✅ Direct' : ''}
${seatsLeft && seatsLeft <= 3 ? `⚠️ Only ${seatsLeft} seats left!` : ''}`;
      return twitterText;

    case 'facebook':
    case 'linkedin':
      return `✈️ Flight Deal Alert: ${route}

I found an incredible flight deal I thought you'd want to see:

📍 Route: ${from} → ${to}
📅 Date: ${formattedDate}
💰 Price: ${currency} ${price}${savings ? ` (Save ${currency} ${savings})` : ''}
${dealScore ? `⭐ Deal Score: ${dealScore}/100 - ${dealTier || 'Great'} Deal` : ''}

Flight Details:
✈️ Airline: ${airline}${airlineRating ? ` (${airlineRating}⭐ rating)` : ''}
⏱️ Duration: ${duration}
🛫 ${isDirect ? 'Direct Flight' : `${stops} stop(s)`}
🪑 Class: ${cabinClass}

What's Included:
${carryOnIncluded ? '✅' : '❌'} Carry-on bag
${checkedBags > 0 ? `✅ ${checkedBags} checked bag(s)` : '❌ No checked bags'}

${seatsLeft && seatsLeft <= 5 ? `⚠️ Hurry! Only ${seatsLeft} seats remaining!` : ''}
${priceDropping ? '📉 Price is trending down - great time to book!' : ''}

Check it out before it's gone!`;

    case 'email':
      return `Flight Deal: ${route} - Save ${savingsPercent || 0}%!`;

    default:
      return `Check out this flight: ${route} for ${currency} ${price}`;
  }
}

/**
 * Generate email body (HTML)
 */
export function generateEmailBody(data: ShareData): string {
  const {
    from,
    to,
    departureDate,
    returnDate,
    price,
    currency,
    originalPrice,
    savings,
    savingsPercent,
    dealScore,
    dealTier,
    airline,
    airlineRating,
    duration,
    stops,
    isDirect,
    seatsLeft,
    carryOnIncluded,
    checkedBags,
    cabinClass,
    fareType,
    isRefundable,
    priceDropping,
  } = data;

  const formattedDeparture = new Date(departureDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Deal: ${from} → ${to}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .deal-badge { display: inline-block; background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
    .price { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .original-price { text-decoration: line-through; color: #9ca3af; font-size: 24px; }
    .savings { color: #10b981; font-size: 20px; font-weight: bold; }
    .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { color: #6b7280; }
    .detail-value { font-weight: 600; }
    .urgency { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .included { color: #10b981; }
    .not-included { color: #ef4444; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✈️ Flight Deal Alert</h1>
    ${dealScore ? `<div class="deal-badge">${dealScore}/100 - ${dealTier || 'Great'} Deal ${getDealEmoji(dealTier)}</div>` : ''}
    <div class="price">${currency} ${price}</div>
    ${originalPrice ? `<div class="original-price">${currency} ${originalPrice}</div>` : ''}
    ${savings && savingsPercent ? `<div class="savings">Save ${currency} ${savings} (${savingsPercent}% OFF)</div>` : ''}
  </div>

  <p>I found an amazing flight deal that I thought you'd like:</p>

  <div class="details">
    <div class="detail-row">
      <span class="detail-label">Route</span>
      <span class="detail-value">${from} → ${to}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Departure</span>
      <span class="detail-value">${formattedDeparture}</span>
    </div>
    ${returnDate ? `<div class="detail-row">
      <span class="detail-label">Return</span>
      <span class="detail-value">${new Date(returnDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
    </div>` : ''}
    <div class="detail-row">
      <span class="detail-label">Airline</span>
      <span class="detail-value">${airline}${airlineRating ? ` (${airlineRating}⭐)` : ''}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Flight Time</span>
      <span class="detail-value">${duration}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Stops</span>
      <span class="detail-value">${isDirect ? '✅ Direct Flight' : `${stops} stop(s)`}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Class</span>
      <span class="detail-value">${cabinClass} - ${fareType}</span>
    </div>
  </div>

  <h3>What's Included:</h3>
  <ul>
    <li class="${carryOnIncluded ? 'included' : 'not-included'}">
      ${carryOnIncluded ? '✅' : '❌'} Carry-on bag
    </li>
    <li class="${checkedBags > 0 ? 'included' : 'not-included'}">
      ${checkedBags > 0 ? `✅ ${checkedBags} checked bag(s)` : '❌ No checked bags included'}
    </li>
    ${isRefundable ? '<li class="included">✅ Refundable within 24 hours</li>' : ''}
  </ul>

  ${seatsLeft && seatsLeft <= 5 ? `<div class="urgency">
    <strong>⚠️ Act Fast!</strong> Only ${seatsLeft} seat${seatsLeft > 1 ? 's' : ''} left at this price!
  </div>` : ''}

  ${priceDropping ? `<div class="urgency">
    <strong>📉 Price Alert:</strong> Price is trending down - this is a great time to book!
  </div>` : ''}

  <div style="text-align: center; margin: 30px 0;">
    <p>Ready to book this amazing deal?</p>
  </div>

  <p style="color: #6b7280; font-size: 14px;">
    <strong>Note:</strong> Prices are subject to change and availability. Book soon to secure this rate.
  </p>
</body>
</html>`;
}

/**
 * Get emoji based on deal tier
 */
function getDealEmoji(dealTier?: string): string {
  switch (dealTier) {
    case 'excellent':
      return '💎';
    case 'great':
      return '👍';
    case 'good':
      return '👍';
    default:
      return '👍';
  }
}

/**
 * Share to WhatsApp
 */
export function shareToWhatsApp(data: ShareData, url: string): void {
  const text = generateShareText(data, 'whatsapp');
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Share to Telegram
 */
export function shareToTelegram(data: ShareData, url: string): void {
  const text = generateShareText(data, 'telegram');
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Share to TikTok
 */
export function shareToTikTok(url: string): void {
  // TikTok doesn't have a direct share API for external links
  // Best we can do is copy the link and prompt user to share manually
  const tiktokUrl = `https://www.tiktok.com`;
  window.open(tiktokUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Share via SMS
 */
export function shareViaSMS(data: ShareData, url: string): void {
  const text = `✈️ ${data.route} for ${data.currency} ${data.price}${data.savingsPercent ? ` (${data.savingsPercent}% OFF!)` : ''}! ${url}`;
  const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
  window.location.href = smsUrl;
}

/**
 * Share to Facebook
 */
export function shareToFacebook(url: string): void {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
}

/**
 * Share to Twitter/X
 */
export function shareToTwitter(data: ShareData, url: string): void {
  const text = generateShareText(data, 'twitter');
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
}

/**
 * Share to LinkedIn
 */
export function shareToLinkedIn(url: string, title: string): void {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
}

/**
 * Share via Email
 */
export function shareViaEmail(data: ShareData, url: string): void {
  const subject = generateShareText(data, 'email');
  const body = `${generateShareText(data, 'facebook')}\n\nView full details and book:\n${url}`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

/**
 * Copy link to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Trigger native share (mobile devices)
 */
export async function triggerNativeShare(data: ShareData, url: string): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: `Flight Deal: ${data.route}`,
      text: generateShareText(data, 'twitter'),
      url: url,
    });
    return true;
  } catch (err) {
    // User cancelled or error occurred
    return false;
  }
}

/**
 * Track share event
 */
export function trackShareEvent(
  platform: SharePlatform,
  flightId: string,
  userId?: string
): void {
  // Track with analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share', {
      method: platform,
      content_type: 'flight_offer',
      content_id: flightId,
      user_id: userId,
    });
  }

  // Also track with custom tracking system
  fetch('/api/analytics/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform,
      flightId,
      userId,
      timestamp: new Date().toISOString(),
    }),
  }).catch(err => console.error('Failed to track share:', err));
}

/**
 * Extract share data from flight offer - ULTRA-RICH VERSION
 */
export function extractShareData(flight: FlightOffer): ShareData {
  const outbound = flight.itineraries[0];
  const from = outbound.segments[0].departure.iataCode;
  const to = outbound.segments[outbound.segments.length - 1].arrival.iataCode;
  const departureDate = outbound.segments[0].departure.at;
  const returnDate = flight.itineraries[1]?.segments[0]?.departure.at;

  const price = normalizePrice(flight.price.total);
  const currency = flight.price.currency;

  // Parse duration
  const parseDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return '0h 0m';
    const hours = match[1] ? match[1] : '0H';
    const minutes = match[2] ? match[2] : '0M';
    return `${hours.replace('H', 'h')} ${minutes.replace('M', 'm')}`;
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const stops = outbound.segments.length - 1;
  const isDirect = stops === 0;

  // Get layover info
  let layoverInfo = '';
  if (stops > 0) {
    const layoverAirports = outbound.segments.slice(0, -1).map(seg => seg.arrival.iataCode);
    layoverInfo = `Layover in ${layoverAirports.join(', ')}`;
  }

  // Get airline data
  const primaryAirline = flight.validatingAirlineCodes?.[0] || outbound.segments[0].carrierCode;

  // Import airline data (this would need to be imported at the top of the file)
  // For now, we'll use a simple mapping or default values
  const airlineNames: Record<string, string> = {
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'DL': 'Delta Air Lines',
    'FI': 'Icelandair',
    'B6': 'JetBlue Airways',
    'F9': 'Frontier Airlines',
    // Add more as needed
  };

  const airlineName = airlineNames[primaryAirline] || primaryAirline;

  // Get baggage data
  const firstTraveler = flight.travelerPricings?.[0];
  const fareDetails = firstTraveler?.fareDetailsBySegment?.[0];
  const cabin = fareDetails?.cabin || 'ECONOMY';
  const fareOption = firstTraveler?.fareOption || fareDetails?.brandedFare || fareDetails?.fareBasis || 'STANDARD';
  const brandedFareLabel = (fareDetails as any)?.brandedFareLabel;

  const checkedBags = fareDetails?.includedCheckedBags?.quantity || 0;
  const checkedWeight = fareDetails?.includedCheckedBags?.weight
    ? `${fareDetails.includedCheckedBags.weight}${fareDetails.includedCheckedBags.weightUnit || 'kg'}`
    : undefined;

  const cabinBagsData = (fareDetails as any)?.includedCabinBags;
  const cabinQuantity = cabinBagsData?.quantity || 0;
  const carryOnIncluded = cabinQuantity >= 2 || !fareOption.includes('BASIC');
  const carryOnWeight = cabin === 'PREMIUM_ECONOMY' || cabin === 'BUSINESS' || cabin === 'FIRST' ? '18kg' : '10kg';

  // Get cabin class display name
  const cabinClass = cabin === 'PREMIUM_ECONOMY' ? 'Premium Economy' :
                     cabin === 'BUSINESS' ? 'Business Class' :
                     cabin === 'FIRST' ? 'First Class' : 'Economy Class';

  // Get amenities (if available from flight data)
  const amenitiesArray = (fareDetails as any)?.amenities || [];
  const aircraftCode = outbound.segments[0]?.aircraft?.code;

  let amenities: ShareData['amenities'];
  if (amenitiesArray.length > 0) {
    amenities = {
      wifi: amenitiesArray.some((a: any) =>
        a.description?.toLowerCase().includes('wifi') ||
        a.description?.toLowerCase().includes('wi-fi') ||
        a.description?.toLowerCase().includes('internet')
      ),
      power: amenitiesArray.some((a: any) =>
        a.description?.toLowerCase().includes('power') ||
        a.description?.toLowerCase().includes('outlet') ||
        a.description?.toLowerCase().includes('usb')
      ),
      meals: amenitiesArray.find((a: any) => a.amenityType === 'MEAL')
        ? (amenitiesArray.find((a: any) => a.amenityType === 'MEAL').description?.toLowerCase().includes('hot') ? 'Hot Meal' : 'Meal')
        : 'None',
      entertainment: amenitiesArray.some((a: any) => a.amenityType === 'ENTERTAINMENT'),
      isEstimated: false,
    };
  } else {
    // Estimated amenities based on cabin class and aircraft
    const isWidebody = !!(aircraftCode && (aircraftCode.startsWith('77') || aircraftCode.startsWith('78') || aircraftCode.startsWith('35') || aircraftCode.startsWith('A3')));
    amenities = {
      wifi: cabin !== 'ECONOMY' || isWidebody,
      power: cabin !== 'ECONOMY' || isWidebody,
      meals: cabin === 'BUSINESS' || cabin === 'FIRST' ? 'Hot Meal' : (cabin === 'PREMIUM_ECONOMY' ? 'Meal' : 'Snack'),
      entertainment: isWidebody || cabin !== 'ECONOMY',
      isEstimated: true,
    };
  }

  // Get fare policies (if available)
  const fareRules = (flight as any).fareRules;
  const isRefundable = fareRules?.refundable;
  const isChangeable = fareRules?.changeable;

  // Get CO2 data (if available)
  const co2Emissions = (flight as any).co2Emissions;
  const averageCO2 = (flight as any).averageCO2;
  const co2Comparison = co2Emissions && averageCO2
    ? ((co2Emissions - averageCO2) / averageCO2) * 100
    : undefined;

  return {
    flightId: flight.id,
    route: `${from} → ${to}`,
    from,
    to,
    departureDate,
    returnDate,
    departureTime: formatTime(outbound.segments[0].departure.at),
    arrivalTime: formatTime(outbound.segments[outbound.segments.length - 1].arrival.at),
    price,
    currency,
    // REMOVED: Fake originalPrice calculation - real flight data should not have artificial markup
    // originalPrice: (flight as any).priceVsMarket ? price * 1.25 : undefined,
    // savings: (flight as any).priceVsMarket ? price * 0.25 : undefined,
    // savingsPercent: (flight as any).priceVsMarket ? Math.round(Math.abs((flight as any).priceVsMarket)) : undefined,
    dealScore: (flight as any).dealScore,
    dealTier: (flight as any).dealTier,
    airline: primaryAirline,
    airlineName,
    airlineRating: 4.2, // Default - could be fetched from airline data
    onTimePerformance: 85, // Default - could be fetched from airline data
    duration: parseDuration(outbound.duration),
    stops,
    isDirect,
    layoverInfo: stops > 0 ? layoverInfo : undefined,
    seatsLeft: flight.numberOfBookableSeats,
    carryOnIncluded,
    carryOnWeight,
    checkedBags,
    checkedWeight,
    cabinClass,
    fareType: fareOption,
    brandedFareName: brandedFareLabel,
    isRefundable,
    isChangeable,
    priceDropping: (flight as any).priceVsMarket && (flight as any).priceVsMarket < -5,
    bookingsToday: (flight as any).bookingsToday,
    viewingCount: (flight as any).viewingCount,
    amenities,
    co2Emissions,
    co2Comparison,
    aircraft: aircraftCode,
    terminals: {
      departure: outbound.segments[0].departure.terminal,
      arrival: outbound.segments[outbound.segments.length - 1].arrival.terminal,
    },
    priceVsMarket: (flight as any).priceVsMarket,
  };
}
