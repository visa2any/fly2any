/**
 * Generate TheBestAgent consolidator search URL
 * Pattern: https://air.thebestagent.pro/#search/jfk-bos-220126-bos-jfk-290126-100-Y
 */

interface FlightSegment {
  origin: string;
  destination: string;
  departureDate: string; // ISO format
}

interface ConsolidatorLinkParams {
  segments: FlightSegment[];
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: 'economy' | 'business' | 'first' | string;
}

// Format date to DDMMYY
function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().slice(-2);
  return `${day}${month}${year}`;
}

// Convert cabin class to TBA code
function getCabinCode(cabin?: string): string {
  if (!cabin) return 'Y';
  const c = cabin.toLowerCase();
  if (c.includes('first')) return 'F';
  if (c.includes('business')) return 'C';
  return 'Y'; // Economy default
}

// Format passengers: 1 adult = 100, 2 adults = 200, 1 adult + 1 child = 110
function formatPassengers(adults = 1, children = 0, infants = 0): string {
  return `${adults}${children}${infants}`;
}

export function generateConsolidatorLink(params: ConsolidatorLinkParams): string {
  const { segments, adults = 1, children = 0, infants = 0, cabinClass } = params;

  if (!segments || segments.length === 0) return '';

  const parts: string[] = [];

  // Add each segment
  segments.forEach(seg => {
    const origin = seg.origin.toLowerCase();
    const dest = seg.destination.toLowerCase();
    const date = formatDate(seg.departureDate);
    parts.push(`${origin}-${dest}-${date}`);
  });

  // Add passengers and cabin
  parts.push(formatPassengers(adults, children, infants));
  parts.push(getCabinCode(cabinClass));

  return `https://air.thebestagent.pro/#search/${parts.join('-')}`;
}

// Helper to extract segments from booking flight data
export function getConsolidatorLinkFromBooking(booking: any): string | null {
  try {
    const flight = booking?.flight;
    if (!flight) return null;

    const segments: FlightSegment[] = [];

    // Outbound
    if (flight.outbound?.segments?.[0]) {
      segments.push({
        origin: flight.outbound.segments[0].origin,
        destination: flight.outbound.segments[flight.outbound.segments.length - 1].destination,
        departureDate: flight.outbound.segments[0].departureTime,
      });
    }

    // Return flight
    if (flight.return?.segments?.[0]) {
      segments.push({
        origin: flight.return.segments[0].origin,
        destination: flight.return.segments[flight.return.segments.length - 1].destination,
        departureDate: flight.return.segments[0].departureTime,
      });
    }

    if (segments.length === 0) return null;

    // Get passengers
    const passengers = booking.passengers || [];
    const adults = passengers.filter((p: any) => p.type === 'adult').length || 1;
    const children = passengers.filter((p: any) => p.type === 'child').length || 0;
    const infants = passengers.filter((p: any) => p.type === 'infant').length || 0;

    // Get cabin
    const cabinClass = flight.cabinClass || flight.outbound?.cabinClass || 'economy';

    return generateConsolidatorLink({ segments, adults, children, infants, cabinClass });
  } catch (e) {
    console.error('Error generating consolidator link:', e);
    return null;
  }
}
