import { NextResponse } from 'next/server';

/**
 * Validates flight search parameters
 */
export function validateSearchParams(body: any) {
  const { origin, destination, departureDate, adults } = body;

  if (!origin || !destination || !departureDate || !adults) {
    return {
      isValid: false,
      response: NextResponse.json(
        {
          error: 'Missing required parameters',
          required: ['origin', 'destination', 'departureDate', 'adults'],
          received: body
        },
        { status: 400 }
      )
    };
  }

  // Parse airport codes helper
  const parseAirportCodes = (codes: string): string[] => {
    const extractSingleCode = (value: string): string => {
      const trimmed = value.trim();
      if (/^[A-Z]{3}$/i.test(trimmed)) {
        return trimmed.toUpperCase();
      }
      const codeMatch = trimmed.match(/\(([A-Z]{3})\)|^([A-Z]{3})\s*-/i);
      if (codeMatch) {
        return (codeMatch[1] || codeMatch[2]).toUpperCase();
      }
      return trimmed.toUpperCase();
    };

    return codes.split(',')
      .map((code: string) => extractSingleCode(code))
      .filter((code: string) => code.length > 0);
  };

  const originCodes = parseAirportCodes(origin);
  const destinationCodes = parseAirportCodes(destination);

  if (originCodes.length === 0 || destinationCodes.length === 0) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Invalid airport codes provided' },
        { status: 400 }
      )
    };
  }

  if (typeof adults !== 'number' || adults < 1 || adults > 9) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Invalid adults parameter. Must be a number between 1 and 9' },
        { status: 400 }
      )
    };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const validateDates = (dateString: string): boolean => {
    const dates = dateString.split(',').map(d => d.trim());
    for (const date of dates) {
      if (!dateRegex.test(date)) {
        return false;
      }
    }
    return true;
  };

  if (!validateDates(departureDate)) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Invalid departureDate format. Expected YYYY-MM-DD or comma-separated dates' },
        { status: 400 }
      )
    };
  }

  if (body.returnDate && !validateDates(body.returnDate)) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Invalid returnDate format. Expected YYYY-MM-DD or comma-separated dates' },
        { status: 400 }
      )
    };
  }

  // 🛡️ Timezone-aware date validation:
  // We use a 24-hour buffer to account for global timezones.
  // If a server is in UTC and it's already "tomorrow", a user in New York
  // might still be on "today". We allow searches for dates that are >= (now - 24h).
  const bufferTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const bufferDateStr = bufferTime.toISOString().split('T')[0];
  const firstDepartureDate = departureDate.split(',')[0].trim();

  if (firstDepartureDate < bufferDateStr) {
    return {
      isValid: false,
      response: NextResponse.json(
        { 
          error: 'Departure date cannot be in the past',
          details: {
            departureDate: firstDepartureDate,
            allowedSince: bufferDateStr,
            message: 'Search dates must be today or in the future (allowing for global timezones)'
          }
        },
        { status: 400 }
      )
    };
  }

  if (body.returnDate) {
    const firstReturnDate = body.returnDate.split(',')[0].trim();
    const retDate = new Date(firstReturnDate);
    retDate.setHours(0, 0, 0, 0);

    const depDate = new Date(firstDepartureDate);
    depDate.setHours(0, 0, 0, 0);

    if (retDate <= depDate) {
      return {
        isValid: false,
        response: NextResponse.json(
          {
            error: 'Return date must be after departure date',
            details: {
              departureDate: firstDepartureDate,
              returnDate: firstReturnDate,
              message: 'For round-trip flights, return date must be chronologically after departure date'
            }
          },
          { status: 400 }
        )
      };
    }
  }

  return {
    isValid: true,
    originCodes,
    destinationCodes,
    departureDate: firstDepartureDate,
    returnDate: body.returnDate,
    adults: Number(adults),
    children: Number(body.children || 0),
    infants: Number(body.infants || 0),
    travelClass: body.travelClass || 'ECONOMY',
    depDate: new Date(firstDepartureDate)
  };
}
