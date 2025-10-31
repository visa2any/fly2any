/**
 * Parser for Amadeus Seat Map API responses
 * Converts seat map data into user-friendly format
 */

export interface Seat {
  number: string;           // '12A', '15F'
  available: boolean;       // Is seat available?
  price: number | null;     // Seat selection fee
  currency: string;         // 'USD'
  characteristicsCodes: string[]; // ['W', 'L', 'Q'] - Window, Legroom, Quiet
  type: 'window' | 'aisle' | 'middle';
  hasWindow: boolean;
  hasAisle: boolean;
  hasExtraLegroom: boolean;
  hasPower: boolean;
  row: number;
  column: string;           // 'A', 'B', 'C', etc.
}

export interface SeatRow {
  rowNumber: number;
  seats: Seat[];
  hasExitRow: boolean;
}

export interface SeatMapDeck {
  deckName: string;         // 'MAIN', 'UPPER'
  rows: SeatRow[];
  layout: string;           // '3-3', '2-4-2'
}

export interface ParsedSeatMap {
  decks: SeatMapDeck[];
  hasRealData: boolean;
  averagePrice: number | null;     // Average seat price
  cheapestSeat: Seat | null;       // Best value window seat
  priceRange: {
    min: number;
    max: number;
  } | null;
  aircraftCode: string;             // '738', '77W'
  cabinClass: string;               // 'ECONOMY', 'BUSINESS'
  totalSeats: number;
  availableSeats: number;
  recommendedSeat: Seat | null;     // Best overall seat (window, cheap, good location)
  source?: 'amadeus' | 'duffel';    // API source
}

/**
 * Parse Amadeus or Duffel seat map response
 * Supports both API formats (unified via conversion)
 */
export function parseSeatMap(
  seatMapResponse: any,
  cabinClass: string = 'ECONOMY'
): ParsedSeatMap {
  const data = seatMapResponse?.data || [];
  const hasRealData = Array.isArray(data) && data.length > 0;
  const source = seatMapResponse?.meta?.source || 'amadeus';

  if (!hasRealData) {
    return {
      decks: [],
      hasRealData: false,
      averagePrice: null,
      cheapestSeat: null,
      priceRange: null,
      aircraftCode: '',
      cabinClass,
      totalSeats: 0,
      availableSeats: 0,
      recommendedSeat: null,
      source: source === 'Duffel' ? 'duffel' : 'amadeus',
    };
  }

  // Parse the first seat map (usually only one per flight offer)
  const seatMapData = data[0];
  const decksData = seatMapData?.decks || [];
  const aircraftCode = seatMapData?.aircraftCabinAmenities?.seat?.aircraftCabinCode || '';

  const decks: SeatMapDeck[] = [];
  const allSeats: Seat[] = [];
  let totalSeats = 0;
  let availableSeats = 0;

  // Parse each deck (main cabin, upper deck, etc.)
  decksData.forEach((deck: any) => {
    const rows: SeatRow[] = [];
    const seatRowsData = deck?.seatRows || [];

    seatRowsData.forEach((seatRow: any) => {
      const rowNumber = parseInt(seatRow.rowNumber || '0', 10);
      const seatsData = seatRow?.seats || [];
      const hasExitRow = seatRow?.exitRow === true;

      const seats: Seat[] = [];

      seatsData.forEach((seatData: any, index: number) => {
        const seatNumber = `${rowNumber}${seatData.column || String.fromCharCode(65 + index)}`;
        const available = seatData.travelerPricing?.[0]?.seatAvailabilityStatus === 'AVAILABLE';
        const priceStr = seatData.travelerPricing?.[0]?.price?.total;
        const price = priceStr ? parseFloat(priceStr) : null;
        const currency = seatData.travelerPricing?.[0]?.price?.currency || 'USD';
        const characteristicsCodes: string[] = seatData.characteristicsCodes || [];

        // Determine seat type
        const column = seatData.column || String.fromCharCode(65 + index);
        const hasWindow = characteristicsCodes.includes('W') || column === 'A' || column === 'F';
        const hasAisle = characteristicsCodes.includes('A');
        const hasExtraLegroom = characteristicsCodes.includes('L') || characteristicsCodes.includes('E');
        const hasPower = characteristicsCodes.includes('Q');

        let type: 'window' | 'aisle' | 'middle' = 'middle';
        if (hasWindow) type = 'window';
        else if (hasAisle) type = 'aisle';

        const seat: Seat = {
          number: seatNumber,
          available,
          price,
          currency,
          characteristicsCodes,
          type,
          hasWindow,
          hasAisle,
          hasExtraLegroom,
          hasPower,
          row: rowNumber,
          column,
        };

        seats.push(seat);
        allSeats.push(seat);
        totalSeats++;
        if (available) availableSeats++;
      });

      rows.push({
        rowNumber,
        seats,
        hasExitRow,
      });
    });

    decks.push({
      deckName: deck.deckConfiguration?.deckName || 'MAIN',
      rows,
      layout: deck.deckConfiguration?.width || '3-3',
    });
  });

  // Calculate price statistics
  const seatsWithPrice = allSeats.filter(s => s.available && s.price !== null && s.price > 0);
  const prices = seatsWithPrice.map(s => s.price!);

  const averagePrice = prices.length > 0
    ? prices.reduce((sum, price) => sum + price, 0) / prices.length
    : null;

  const priceRange = prices.length > 0
    ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
      }
    : null;

  // Find cheapest window seat
  const windowSeats = seatsWithPrice.filter(s => s.hasWindow);
  const cheapestSeat = windowSeats.length > 0
    ? windowSeats.reduce((min, seat) => (seat.price! < min.price! ? seat : min))
    : null;

  // Find recommended seat (window, cheap, good location - rows 10-20)
  const recommendedSeats = windowSeats.filter(s =>
    s.row >= 10 && s.row <= 20 && s.price! <= (averagePrice || 100)
  );
  const recommendedSeat = recommendedSeats.length > 0
    ? recommendedSeats.sort((a, b) => a.price! - b.price!)[0]
    : cheapestSeat;

  return {
    decks,
    hasRealData: true,
    averagePrice: averagePrice ? Math.round(averagePrice) : null,
    cheapestSeat,
    priceRange: priceRange ? {
      min: Math.round(priceRange.min),
      max: Math.round(priceRange.max),
    } : null,
    aircraftCode,
    cabinClass,
    totalSeats,
    availableSeats,
    recommendedSeat,
    source: source === 'Duffel' ? 'duffel' : 'amadeus',
  };
}

/**
 * Format seat map for display in compact single-line view
 */
export function formatSeatMapCompact(parsedSeatMap: ParsedSeatMap): {
  displayText: string;
  hasData: boolean;
} {
  if (!parsedSeatMap.hasRealData || !parsedSeatMap.recommendedSeat) {
    return {
      displayText: 'No seat map available',
      hasData: false,
    };
  }

  const { recommendedSeat, averagePrice } = parsedSeatMap;

  return {
    displayText: `${recommendedSeat.number} Window $${recommendedSeat.price} • $${averagePrice}-${parsedSeatMap.priceRange?.max} avg`,
    hasData: true,
  };
}
