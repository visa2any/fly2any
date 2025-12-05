/**
 * Parser for Amadeus and Duffel Seat Map API responses
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
 * Determine seat type based on column letter and row layout
 */
function determineSeatType(column: string, characteristicsCodes: string[], totalSeatsInRow: number): {
  type: 'window' | 'aisle' | 'middle';
  hasWindow: boolean;
  hasAisle: boolean;
} {
  // Check characteristic codes first
  const hasWindowCode = characteristicsCodes.includes('W');
  const hasAisleCode = characteristicsCodes.includes('A');

  if (hasWindowCode) {
    return { type: 'window', hasWindow: true, hasAisle: false };
  }
  if (hasAisleCode) {
    return { type: 'aisle', hasWindow: false, hasAisle: true };
  }

  // Infer from column letter and layout
  const colUpper = column.toUpperCase();

  // Common window seats (first and last letter per section)
  const windowLetters = ['A', 'F', 'K', 'L']; // A, F for 3-3; K, L for wide bodies
  // Common aisle seats
  const aisleLetters = ['C', 'D', 'G', 'H'];  // C, D for 3-3; G, H for wide bodies

  if (windowLetters.includes(colUpper)) {
    return { type: 'window', hasWindow: true, hasAisle: false };
  }
  if (aisleLetters.includes(colUpper)) {
    return { type: 'aisle', hasWindow: false, hasAisle: true };
  }

  // Everything else is middle
  return { type: 'middle', hasWindow: false, hasAisle: false };
}

/**
 * Parse Amadeus or Duffel seat map response
 * Supports both API formats (Duffel is pre-converted to Amadeus-like format)
 */
export function parseSeatMap(
  seatMapResponse: any,
  cabinClass: string = 'ECONOMY'
): ParsedSeatMap {
  const data = seatMapResponse?.data || [];
  const hasRealData = Array.isArray(data) && data.length > 0;
  const source = seatMapResponse?.meta?.source || 'amadeus';

  console.log('🪑 Parsing seat map:', {
    hasData: hasRealData,
    dataLength: data.length,
    source,
    firstItemKeys: data[0] ? Object.keys(data[0]) : [],
  });

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

  console.log('🪑 Seat map structure:', {
    decksCount: decksData.length,
    aircraftCode,
    firstDeckRows: decksData[0]?.seatRows?.length || 0,
  });

  const decks: SeatMapDeck[] = [];
  const allSeats: Seat[] = [];
  let totalSeats = 0;
  let availableSeats = 0;

  // Parse each deck (main cabin, upper deck, etc.)
  decksData.forEach((deck: any, deckIndex: number) => {
    const rows: SeatRow[] = [];
    const seatRowsData = deck?.seatRows || [];

    console.log(`🪑 Processing deck ${deckIndex}: ${seatRowsData.length} rows`);

    seatRowsData.forEach((seatRow: any, rowIdx: number) => {
      // Handle row number - can be string or number
      let rowNumber = seatRow.rowNumber;
      if (typeof rowNumber === 'string') {
        rowNumber = parseInt(rowNumber, 10);
      }
      if (isNaN(rowNumber) || rowNumber < 1) {
        rowNumber = rowIdx + 1;
      }

      const seatsData = seatRow?.seats || [];
      const hasExitRow = seatRow?.hasExitRow === true || seatRow?.exitRow === true;

      if (seatsData.length === 0) {
        console.log(`🪑 Row ${rowNumber}: No seats data`);
        return;
      }

      const seats: Seat[] = [];

      seatsData.forEach((seatData: any, seatIndex: number) => {
        // Extract seat number - try multiple formats
        const designator = seatData.number || seatData.designator || '';
        const seatNumber = designator || `${rowNumber}${seatData.column || String.fromCharCode(65 + seatIndex)}`;

        // Check availability - handle multiple formats
        let available = false;
        if (seatData.travelerPricing?.[0]) {
          const status = seatData.travelerPricing[0].seatAvailabilityStatus;
          available = status === 'AVAILABLE' || status === 'available';
        } else if (seatData.available !== undefined) {
          available = seatData.available === true;
        } else if (seatData._duffelData?.hasServices) {
          available = true;
        }

        // Extract price - handle multiple formats
        let price: number | null = null;
        let currency = 'USD';

        if (seatData.travelerPricing?.[0]?.price) {
          const priceData = seatData.travelerPricing[0].price;
          const priceStr = priceData.total || priceData.amount;
          price = priceStr ? parseFloat(priceStr) : null;
          currency = priceData.currency || 'USD';
        } else if (seatData.price) {
          price = typeof seatData.price === 'number' ? seatData.price : parseFloat(seatData.price);
        }

        // Extract characteristics
        const characteristicsCodes: string[] = seatData.characteristicsCodes || [];

        // Determine seat column
        const column = seatData.column ||
          designator.match(/[A-Z]+$/)?.[0] ||
          String.fromCharCode(65 + seatIndex);

        // Determine seat type
        const seatTypeInfo = determineSeatType(column, characteristicsCodes, seatsData.length);
        const hasExtraLegroom = characteristicsCodes.includes('L') ||
          characteristicsCodes.includes('E') ||
          hasExitRow;
        const hasPower = characteristicsCodes.includes('Q');

        const seat: Seat = {
          number: seatNumber,
          available,
          price,
          currency,
          characteristicsCodes,
          type: seatTypeInfo.type,
          hasWindow: seatTypeInfo.hasWindow,
          hasAisle: seatTypeInfo.hasAisle,
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

      // Only add rows with seats
      if (seats.length > 0) {
        rows.push({
          rowNumber,
          seats,
          hasExitRow,
        });
      }
    });

    // Only add decks with rows
    if (rows.length > 0) {
      decks.push({
        deckName: deck.deckConfiguration?.deckName || 'MAIN',
        rows: rows.sort((a, b) => a.rowNumber - b.rowNumber),
        layout: deck.deckConfiguration?.width || calculateLayout(rows),
      });
    }
  });

  console.log('🪑 Parsing complete:', {
    decksCount: decks.length,
    totalSeats,
    availableSeats,
    rowsCount: decks[0]?.rows?.length || 0,
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
    : seatsWithPrice[0] || null;

  // Find recommended seat (window, cheap, good location)
  const avgRow = allSeats.length > 0
    ? allSeats.reduce((sum, s) => sum + s.row, 0) / allSeats.length
    : 15;

  const recommendedSeats = windowSeats.filter(s =>
    s.row >= Math.floor(avgRow * 0.4) &&
    s.row <= Math.ceil(avgRow * 1.3) &&
    s.price! <= (averagePrice || 100)
  );

  const recommendedSeat = recommendedSeats.length > 0
    ? recommendedSeats.sort((a, b) => a.price! - b.price!)[0]
    : cheapestSeat;

  return {
    decks,
    hasRealData: decks.length > 0 && totalSeats > 0,
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
 * Calculate layout string from row data
 */
function calculateLayout(rows: SeatRow[]): string {
  if (rows.length === 0) return '3-3';

  const maxSeats = Math.max(...rows.map(r => r.seats.length));

  if (maxSeats <= 4) return '2-2';
  if (maxSeats === 6) return '3-3';
  if (maxSeats === 8) return '2-4-2';
  if (maxSeats === 9) return '3-3-3';
  if (maxSeats === 10) return '3-4-3';

  return `${Math.floor(maxSeats / 2)}-${Math.ceil(maxSeats / 2)}`;
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

  const { recommendedSeat, averagePrice, priceRange } = parsedSeatMap;

  const priceText = recommendedSeat.price
    ? `$${Math.round(recommendedSeat.price)}`
    : 'Included';

  const rangeText = priceRange
    ? `$${priceRange.min}-$${priceRange.max}`
    : '';

  return {
    displayText: `${recommendedSeat.number} ${recommendedSeat.type} ${priceText}${rangeText ? ` • ${rangeText} range` : ''}`,
    hasData: true,
  };
}
