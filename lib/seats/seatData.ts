/**
 * Seat Intelligence Database
 * Comprehensive seat quality data inspired by SeatGuru
 */

import { AircraftConfig, SeatInfo, CabinConfig } from './types';

// Seat features translations
export const seatFeatures = {
  en: {
    power: 'Power Outlet',
    wifi: 'WiFi Available',
    extraLegroom: 'Extra Legroom',
    exitRow: 'Exit Row',
    bulkhead: 'Bulkhead',
    storage: 'Overhead Storage',
    windowMisaligned: 'Misaligned Window',
    nearLavatory: 'Near Lavatory',
    nearGalley: 'Near Galley',
    limitedRecline: 'Limited Recline',
    noRecline: 'No Recline',
    bassinet: 'Bassinet Available',
    closet: 'Near Closet',
  },
  pt: {
    power: 'Tomada Elétrica',
    wifi: 'WiFi Disponível',
    extraLegroom: 'Espaço Extra para Pernas',
    exitRow: 'Fila de Saída',
    bulkhead: 'Primeira Fila',
    storage: 'Bagageiro Superior',
    windowMisaligned: 'Janela Desalinhada',
    nearLavatory: 'Perto do Banheiro',
    nearGalley: 'Perto da Cozinha',
    limitedRecline: 'Recline Limitado',
    noRecline: 'Sem Recline',
    bassinet: 'Berço Disponível',
    closet: 'Perto do Armário',
  },
  es: {
    power: 'Toma de Corriente',
    wifi: 'WiFi Disponible',
    extraLegroom: 'Espacio Extra para Piernas',
    exitRow: 'Fila de Salida',
    bulkhead: 'Primera Fila',
    storage: 'Compartimento Superior',
    windowMisaligned: 'Ventana Desalineada',
    nearLavatory: 'Cerca del Baño',
    nearGalley: 'Cerca de la Cocina',
    limitedRecline: 'Reclinación Limitada',
    noRecline: 'Sin Reclinación',
    bassinet: 'Cuna Disponible',
    closet: 'Cerca del Armario',
  },
};

// Helper function to generate seat letter based on position
function getSeatLetter(index: number, layout: string): string {
  const letters = 'ABCDEFGHJK'; // I is skipped in aviation
  return letters[index];
}

// Helper to create a seat
function createSeat(
  row: number,
  seatIndex: number,
  position: 'window' | 'middle' | 'aisle',
  overrides?: Partial<SeatInfo>
): SeatInfo {
  const seatLetter = getSeatLetter(seatIndex, '');
  return {
    number: `${row}${seatLetter}`,
    row,
    position,
    status: Math.random() > 0.35 ? 'available' : 'taken', // 65% available
    legroom: 31,
    recline: 'full',
    features: [],
    warnings: [],
    rating: 3.5,
    isPremium: false,
    isExit: false,
    reviewCount: Math.floor(Math.random() * 50) + 10,
    ...overrides,
  };
}

// Boeing 737-800 Configuration (Most common narrow-body)
export const boeing737800: AircraftConfig = {
  type: '737-800',
  name: 'Boeing 737-800',
  manufacturer: 'Boeing',
  totalSeats: 175,
  wifiAvailable: true,
  powerOutlets: true,
  cabins: [
    // First Class
    {
      class: 'FIRST',
      seatsPerRow: 4,
      aislePositions: [2],
      rows: Array.from({ length: 4 }, (_, i) => {
        const rowNum = i + 1;
        return {
          rowNumber: rowNum,
          isBulkhead: i === 0,
          seats: [
            createSeat(rowNum, 0, 'window', {
              legroom: 38,
              features: ['power', 'wifi', 'storage'],
              rating: 4.5,
              isPremium: true,
              price: rowNum === 1 ? 75 : 50,
              windowAlignment: true,
            }),
            createSeat(rowNum, 1, 'aisle', {
              legroom: 38,
              features: ['power', 'wifi'],
              rating: 4.3,
              isPremium: true,
              price: rowNum === 1 ? 70 : 45,
            }),
            null, // aisle
            createSeat(rowNum, 3, 'aisle', {
              legroom: 38,
              features: ['power', 'wifi'],
              rating: 4.3,
              isPremium: true,
              price: rowNum === 1 ? 70 : 45,
            }),
            createSeat(rowNum, 4, 'window', {
              legroom: 38,
              features: ['power', 'wifi', 'storage'],
              rating: 4.5,
              isPremium: true,
              price: rowNum === 1 ? 75 : 50,
              windowAlignment: true,
            }),
          ],
        };
      }),
    },
    // Economy
    {
      class: 'ECONOMY',
      seatsPerRow: 6,
      aislePositions: [3],
      rows: Array.from({ length: 27 }, (_, i) => {
        const rowNum = i + 5; // Start from row 5
        const isExitRow = rowNum === 16 || rowNum === 17;
        const isBulkhead = rowNum === 5;
        const nearLavatory = rowNum >= 30;
        const nearGalley = rowNum === 5 || rowNum >= 30;
        const lastRow = rowNum === 31;

        return {
          rowNumber: rowNum,
          isExitRow,
          isBulkhead,
          seats: [
            createSeat(rowNum, 0, 'window', {
              legroom: isExitRow ? 38 : isBulkhead ? 35 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow
                ? ['exitRow', 'extraLegroom', 'power']
                : isBulkhead
                ? ['bulkhead', 'bassinet']
                : ['power'],
              warnings: nearLavatory
                ? ['nearLavatory']
                : lastRow
                ? ['limitedRecline']
                : [],
              rating: isExitRow ? 4.2 : nearLavatory ? 2.8 : 3.5,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 35 : undefined,
              windowAlignment: rowNum !== 10, // Row 10 has misaligned window
            }),
            createSeat(rowNum, 1, 'middle', {
              legroom: isExitRow ? 38 : isBulkhead ? 35 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory
                ? ['nearLavatory']
                : lastRow
                ? ['limitedRecline']
                : [],
              rating: isExitRow ? 3.8 : nearLavatory ? 2.5 : 3.0,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 30 : undefined,
            }),
            createSeat(rowNum, 2, 'aisle', {
              legroom: isExitRow ? 38 : isBulkhead ? 35 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory
                ? ['nearLavatory']
                : lastRow
                ? ['limitedRecline']
                : [],
              rating: isExitRow ? 4.0 : nearLavatory ? 2.9 : 3.6,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 35 : undefined,
            }),
            null, // aisle
            createSeat(rowNum, 4, 'aisle', {
              legroom: isExitRow ? 38 : isBulkhead ? 35 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory
                ? ['nearLavatory']
                : lastRow
                ? ['limitedRecline']
                : [],
              rating: isExitRow ? 4.0 : nearLavatory ? 2.9 : 3.6,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 35 : undefined,
            }),
            createSeat(rowNum, 5, 'middle', {
              legroom: isExitRow ? 38 : isBulkhead ? 35 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory
                ? ['nearLavatory']
                : lastRow
                ? ['limitedRecline']
                : [],
              rating: isExitRow ? 3.8 : nearLavatory ? 2.5 : 3.0,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 30 : undefined,
            }),
            createSeat(rowNum, 6, 'window', {
              legroom: isExitRow ? 38 : isBulkhead ? 35 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow
                ? ['exitRow', 'extraLegroom', 'power']
                : isBulkhead
                ? ['bulkhead', 'bassinet']
                : ['power'],
              warnings: nearLavatory
                ? ['nearLavatory']
                : lastRow
                ? ['limitedRecline']
                : [],
              rating: isExitRow ? 4.2 : nearLavatory ? 2.8 : 3.5,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 35 : undefined,
              windowAlignment: true,
            }),
          ],
        };
      }),
    },
  ],
};

// Boeing 777-300ER (Long-haul wide-body)
export const boeing777300: AircraftConfig = {
  type: '777-300ER',
  name: 'Boeing 777-300ER',
  manufacturer: 'Boeing',
  totalSeats: 358,
  wifiAvailable: true,
  powerOutlets: true,
  cabins: [
    // First Class
    {
      class: 'FIRST',
      seatsPerRow: 4,
      aislePositions: [1, 3],
      rows: Array.from({ length: 2 }, (_, i) => ({
        rowNumber: i + 1,
        isBulkhead: i === 0,
        seats: [
          createSeat(i + 1, 0, 'window', {
            legroom: 80,
            features: ['power', 'wifi', 'storage', 'closet'],
            rating: 4.8,
            isPremium: true,
            price: 150,
          }),
          null,
          createSeat(i + 1, 2, 'aisle', {
            legroom: 80,
            features: ['power', 'wifi'],
            rating: 4.6,
            isPremium: true,
            price: 140,
          }),
          null,
          createSeat(i + 1, 4, 'aisle', {
            legroom: 80,
            features: ['power', 'wifi'],
            rating: 4.6,
            isPremium: true,
            price: 140,
          }),
          null,
          createSeat(i + 1, 6, 'window', {
            legroom: 80,
            features: ['power', 'wifi', 'storage'],
            rating: 4.8,
            isPremium: true,
            price: 150,
          }),
        ],
      })),
    },
    // Business Class
    {
      class: 'BUSINESS',
      seatsPerRow: 7,
      aislePositions: [2, 5],
      rows: Array.from({ length: 8 }, (_, i) => ({
        rowNumber: i + 3,
        isBulkhead: i === 0,
        seats: [
          createSeat(i + 3, 0, 'window', {
            legroom: 60,
            features: ['power', 'wifi', 'storage'],
            rating: 4.5,
            isPremium: true,
            price: 100,
          }),
          createSeat(i + 3, 1, 'aisle', {
            legroom: 60,
            features: ['power', 'wifi'],
            rating: 4.3,
            isPremium: true,
            price: 95,
          }),
          null,
          createSeat(i + 3, 3, 'middle', {
            legroom: 60,
            features: ['power', 'wifi'],
            rating: 4.0,
            isPremium: true,
            price: 90,
          }),
          null,
          createSeat(i + 3, 5, 'aisle', {
            legroom: 60,
            features: ['power', 'wifi'],
            rating: 4.3,
            isPremium: true,
            price: 95,
          }),
          createSeat(i + 3, 6, 'window', {
            legroom: 60,
            features: ['power', 'wifi', 'storage'],
            rating: 4.5,
            isPremium: true,
            price: 100,
          }),
        ],
      })),
    },
    // Premium Economy
    {
      class: 'PREMIUM_ECONOMY',
      seatsPerRow: 7,
      aislePositions: [2, 5],
      rows: Array.from({ length: 5 }, (_, i) => ({
        rowNumber: i + 11,
        isBulkhead: i === 0,
        seats: [
          createSeat(i + 11, 0, 'window', {
            legroom: 38,
            features: ['power', 'wifi'],
            rating: 4.0,
            isPremium: true,
            price: 50,
          }),
          createSeat(i + 11, 1, 'middle', {
            legroom: 38,
            features: ['power', 'wifi'],
            rating: 3.7,
            isPremium: true,
            price: 45,
          }),
          createSeat(i + 11, 2, 'aisle', {
            legroom: 38,
            features: ['power', 'wifi'],
            rating: 3.9,
            isPremium: true,
            price: 50,
          }),
          null,
          createSeat(i + 11, 4, 'aisle', {
            legroom: 38,
            features: ['power', 'wifi'],
            rating: 3.9,
            isPremium: true,
            price: 50,
          }),
          createSeat(i + 11, 5, 'middle', {
            legroom: 38,
            features: ['power', 'wifi'],
            rating: 3.7,
            isPremium: true,
            price: 45,
          }),
          createSeat(i + 11, 6, 'window', {
            legroom: 38,
            features: ['power', 'wifi'],
            rating: 4.0,
            isPremium: true,
            price: 50,
          }),
        ],
      })),
    },
    // Economy
    {
      class: 'ECONOMY',
      seatsPerRow: 9,
      aislePositions: [3, 6],
      rows: Array.from({ length: 35 }, (_, i) => {
        const rowNum = i + 16;
        const isExitRow = rowNum === 30 || rowNum === 31;
        const nearLavatory = rowNum >= 48;
        const lastRow = rowNum === 50;

        return {
          rowNumber: rowNum,
          isExitRow,
          seats: [
            createSeat(rowNum, 0, 'window', {
              legroom: isExitRow ? 38 : 32,
              recline: lastRow ? 'none' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['noRecline'] : [],
              rating: isExitRow ? 4.1 : nearLavatory ? 2.7 : 3.4,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 40 : undefined,
            }),
            createSeat(rowNum, 1, 'middle', {
              legroom: isExitRow ? 38 : 32,
              recline: lastRow ? 'none' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['noRecline'] : [],
              rating: isExitRow ? 3.7 : nearLavatory ? 2.4 : 2.9,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 35 : undefined,
            }),
            createSeat(rowNum, 2, 'aisle', {
              legroom: isExitRow ? 38 : 32,
              recline: lastRow ? 'none' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['noRecline'] : [],
              rating: isExitRow ? 3.9 : nearLavatory ? 2.8 : 3.5,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 40 : undefined,
            }),
            null,
            createSeat(rowNum, 4, 'aisle', {
              legroom: isExitRow ? 38 : 32,
              recline: lastRow ? 'none' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['noRecline'] : [],
              rating: isExitRow ? 3.9 : nearLavatory ? 2.8 : 3.5,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 40 : undefined,
            }),
            createSeat(rowNum, 5, 'middle', {
              legroom: isExitRow ? 38 : 32,
              recline: lastRow ? 'none' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['noRecline'] : [],
              rating: isExitRow ? 3.7 : nearLavatory ? 2.4 : 2.9,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 35 : undefined,
            }),
            createSeat(rowNum, 6, 'middle', {
              legroom: isExitRow ? 38 : 32,
              recline: lastRow ? 'none' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['noRecline'] : [],
              rating: isExitRow ? 3.7 : nearLavatory ? 2.4 : 2.9,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 35 : undefined,
            }),
            null,
            createSeat(rowNum, 8, 'aisle', {
              legroom: isExitRow ? 38 : 32,
              recline: lastRow ? 'none' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['noRecline'] : [],
              rating: isExitRow ? 3.9 : nearLavatory ? 2.8 : 3.5,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 40 : undefined,
            }),
            createSeat(rowNum, 9, 'window', {
              legroom: isExitRow ? 38 : 32,
              recline: lastRow ? 'none' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['noRecline'] : [],
              rating: isExitRow ? 4.1 : nearLavatory ? 2.7 : 3.4,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 40 : undefined,
            }),
          ],
        };
      }),
    },
  ],
};

// Airbus A320 (Common narrow-body)
export const airbusA320: AircraftConfig = {
  type: 'A320',
  name: 'Airbus A320',
  manufacturer: 'Airbus',
  totalSeats: 180,
  wifiAvailable: true,
  powerOutlets: true,
  cabins: [
    // Business Class
    {
      class: 'BUSINESS',
      seatsPerRow: 4,
      aislePositions: [2],
      rows: Array.from({ length: 3 }, (_, i) => ({
        rowNumber: i + 1,
        isBulkhead: i === 0,
        seats: [
          createSeat(i + 1, 0, 'window', {
            legroom: 42,
            features: ['power', 'wifi', 'storage'],
            rating: 4.4,
            isPremium: true,
            price: 80,
          }),
          createSeat(i + 1, 1, 'aisle', {
            legroom: 42,
            features: ['power', 'wifi'],
            rating: 4.2,
            isPremium: true,
            price: 75,
          }),
          null,
          createSeat(i + 1, 3, 'aisle', {
            legroom: 42,
            features: ['power', 'wifi'],
            rating: 4.2,
            isPremium: true,
            price: 75,
          }),
          createSeat(i + 1, 4, 'window', {
            legroom: 42,
            features: ['power', 'wifi', 'storage'],
            rating: 4.4,
            isPremium: true,
            price: 80,
          }),
        ],
      })),
    },
    // Economy
    {
      class: 'ECONOMY',
      seatsPerRow: 6,
      aislePositions: [3],
      rows: Array.from({ length: 27 }, (_, i) => {
        const rowNum = i + 4;
        const isExitRow = rowNum === 12 || rowNum === 13;
        const isBulkhead = rowNum === 4;
        const nearLavatory = rowNum >= 28;
        const lastRow = rowNum === 30;

        return {
          rowNumber: rowNum,
          isExitRow,
          isBulkhead,
          seats: [
            createSeat(rowNum, 0, 'window', {
              legroom: isExitRow ? 36 : isBulkhead ? 34 : 30,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 4.3 : nearLavatory ? 2.9 : 3.6,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 30 : undefined,
            }),
            createSeat(rowNum, 1, 'middle', {
              legroom: isExitRow ? 36 : isBulkhead ? 34 : 30,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 3.9 : nearLavatory ? 2.6 : 3.1,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 25 : undefined,
            }),
            createSeat(rowNum, 2, 'aisle', {
              legroom: isExitRow ? 36 : isBulkhead ? 34 : 30,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 4.1 : nearLavatory ? 3.0 : 3.7,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 30 : undefined,
            }),
            null,
            createSeat(rowNum, 4, 'aisle', {
              legroom: isExitRow ? 36 : isBulkhead ? 34 : 30,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 4.1 : nearLavatory ? 3.0 : 3.7,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 30 : undefined,
            }),
            createSeat(rowNum, 5, 'middle', {
              legroom: isExitRow ? 36 : isBulkhead ? 34 : 30,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 3.9 : nearLavatory ? 2.6 : 3.1,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 25 : undefined,
            }),
            createSeat(rowNum, 6, 'window', {
              legroom: isExitRow ? 36 : isBulkhead ? 34 : 30,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom', 'power'] : ['power'],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 4.3 : nearLavatory ? 2.9 : 3.6,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 30 : undefined,
            }),
          ],
        };
      }),
    },
  ],
};

// Embraer E175 (Regional jet)
export const embraerE175: AircraftConfig = {
  type: 'E175',
  name: 'Embraer E175',
  manufacturer: 'Embraer',
  totalSeats: 76,
  wifiAvailable: true,
  powerOutlets: false,
  cabins: [
    // First Class
    {
      class: 'FIRST',
      seatsPerRow: 4,
      aislePositions: [2],
      rows: Array.from({ length: 3 }, (_, i) => ({
        rowNumber: i + 1,
        isBulkhead: i === 0,
        seats: [
          createSeat(i + 1, 0, 'window', {
            legroom: 37,
            features: ['wifi', 'storage'],
            rating: 4.2,
            isPremium: true,
            price: 60,
          }),
          createSeat(i + 1, 1, 'aisle', {
            legroom: 37,
            features: ['wifi'],
            rating: 4.0,
            isPremium: true,
            price: 55,
          }),
          null,
          createSeat(i + 1, 3, 'aisle', {
            legroom: 37,
            features: ['wifi'],
            rating: 4.0,
            isPremium: true,
            price: 55,
          }),
          createSeat(i + 1, 4, 'window', {
            legroom: 37,
            features: ['wifi', 'storage'],
            rating: 4.2,
            isPremium: true,
            price: 60,
          }),
        ],
      })),
    },
    // Economy
    {
      class: 'ECONOMY',
      seatsPerRow: 4,
      aislePositions: [2],
      rows: Array.from({ length: 17 }, (_, i) => {
        const rowNum = i + 4;
        const isExitRow = rowNum === 12;
        const nearLavatory = rowNum >= 19;
        const lastRow = rowNum === 20;

        return {
          rowNumber: rowNum,
          isExitRow,
          seats: [
            createSeat(rowNum, 0, 'window', {
              legroom: isExitRow ? 36 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 4.0 : nearLavatory ? 2.8 : 3.5,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 25 : undefined,
            }),
            createSeat(rowNum, 1, 'aisle', {
              legroom: isExitRow ? 36 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 3.8 : nearLavatory ? 2.9 : 3.6,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 25 : undefined,
            }),
            null,
            createSeat(rowNum, 3, 'aisle', {
              legroom: isExitRow ? 36 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 3.8 : nearLavatory ? 2.9 : 3.6,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 25 : undefined,
            }),
            createSeat(rowNum, 4, 'window', {
              legroom: isExitRow ? 36 : 31,
              recline: lastRow ? 'limited' : 'full',
              features: isExitRow ? ['exitRow', 'extraLegroom'] : [],
              warnings: nearLavatory ? ['nearLavatory'] : lastRow ? ['limitedRecline'] : [],
              rating: isExitRow ? 4.0 : nearLavatory ? 2.8 : 3.5,
              isPremium: isExitRow,
              isExit: isExitRow,
              price: isExitRow ? 25 : undefined,
            }),
          ],
        };
      }),
    },
  ],
};

// Aircraft database
export const aircraftDatabase: Record<string, AircraftConfig> = {
  '737-800': boeing737800,
  '737': boeing737800, // alias
  '777-300ER': boeing777300,
  '777': boeing777300, // alias
  'A320': airbusA320,
  '320': airbusA320, // alias
  'E175': embraerE175,
  '175': embraerE175, // alias
};

// Get aircraft by type (with fallback to 737)
export function getAircraftConfig(type: string): AircraftConfig {
  const normalizedType = type.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();

  // Try exact match
  if (aircraftDatabase[normalizedType]) {
    return aircraftDatabase[normalizedType];
  }

  // Try partial match
  for (const key of Object.keys(aircraftDatabase)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return aircraftDatabase[key];
    }
  }

  // Default to 737
  return boeing737800;
}
