/**
 * Seat Map Parser
 * Utilities for parsing and analyzing seat configurations
 */

import { SeatInfo, SeatRow, CabinConfig, AircraftConfig, SeatRecommendation, SeatFilter, CabinClass } from './types';

export class SeatMapParser {
  private aircraft: AircraftConfig;
  private selectedCabin: CabinClass;

  constructor(aircraft: AircraftConfig, cabinClass: CabinClass) {
    this.aircraft = aircraft;
    this.selectedCabin = cabinClass;
  }

  // Get cabin configuration for selected class
  getCabinConfig(): CabinConfig | undefined {
    return this.aircraft.cabins.find(cabin => cabin.class === this.selectedCabin);
  }

  // Get all seats in the cabin
  getAllSeats(): SeatInfo[] {
    const cabin = this.getCabinConfig();
    if (!cabin) return [];

    const seats: SeatInfo[] = [];
    cabin.rows.forEach(row => {
      row.seats.forEach(seat => {
        if (seat !== null) {
          seats.push(seat);
        }
      });
    });
    return seats;
  }

  // Get available seats only
  getAvailableSeats(): SeatInfo[] {
    return this.getAllSeats().filter(seat => seat.status === 'available');
  }

  // Filter seats based on criteria
  filterSeats(filter: SeatFilter): SeatInfo[] {
    let seats = this.getAvailableSeats();

    if (filter.position && filter.position.length > 0) {
      seats = seats.filter(seat => filter.position!.includes(seat.position));
    }

    if (filter.minLegroom) {
      seats = seats.filter(seat => seat.legroom >= filter.minLegroom!);
    }

    if (filter.requirePower) {
      seats = seats.filter(seat => seat.features.includes('power'));
    }

    if (filter.avoidLavatory) {
      seats = seats.filter(seat => !seat.warnings.includes('nearLavatory'));
    }

    if (filter.exitRowOnly) {
      seats = seats.filter(seat => seat.isExit);
    }

    return seats;
  }

  // Get seat recommendations
  getRecommendations(lang: 'en' | 'pt' | 'es' = 'en'): SeatRecommendation[] {
    const availableSeats = this.getAvailableSeats();
    const recommendations: SeatRecommendation[] = [];

    const translations = {
      en: {
        best: 'Best available seat - Window with extra legroom',
        popular: 'Popular choice - Frequently selected',
        avoid: 'Avoid - Limited recline and near lavatory',
        upgrade: 'Consider upgrading - Extra legroom for',
      },
      pt: {
        best: 'Melhor assento disponível - Janela com espaço extra',
        popular: 'Escolha popular - Frequentemente selecionado',
        avoid: 'Evitar - Recline limitado e perto do banheiro',
        upgrade: 'Considere atualizar - Espaço extra por',
      },
      es: {
        best: 'Mejor asiento disponible - Ventana con espacio extra',
        popular: 'Opción popular - Frecuentemente seleccionado',
        avoid: 'Evitar - Reclinación limitada y cerca del baño',
        upgrade: 'Considere actualizar - Espacio extra por',
      },
    };

    const t = translations[lang];

    // Find best available seat (window, high rating, extra legroom)
    const bestSeat = availableSeats
      .filter(s => s.position === 'window' && s.legroom >= 35)
      .sort((a, b) => b.rating - a.rating)[0];

    if (bestSeat) {
      recommendations.push({
        seatNumber: bestSeat.number,
        reason: t.best,
        type: 'best',
      });
    }

    // Find popular seats (high rating, aisle or window, no warnings)
    const popularSeat = availableSeats
      .filter(s =>
        s.position !== 'middle' &&
        s.warnings.length === 0 &&
        s.rating >= 4.0 &&
        s.number !== bestSeat?.number
      )
      .sort((a, b) => b.rating - a.rating)[0];

    if (popularSeat) {
      recommendations.push({
        seatNumber: popularSeat.number,
        reason: t.popular,
        type: 'popular',
      });
    }

    // Find seats to avoid (low rating, near lavatory, limited recline)
    const avoidSeats = availableSeats
      .filter(s =>
        s.rating < 3.0 &&
        (s.warnings.includes('nearLavatory') || s.recline === 'limited' || s.recline === 'none')
      )
      .slice(0, 2);

    avoidSeats.forEach(seat => {
      recommendations.push({
        seatNumber: seat.number,
        reason: t.avoid,
        type: 'avoid',
      });
    });

    // Find upgrade opportunities (exit row, extra legroom with price)
    const upgradeSeats = availableSeats
      .filter(s => s.isExit && s.price && s.price > 0)
      .sort((a, b) => (a.price || 0) - (b.price || 0))
      .slice(0, 2);

    upgradeSeats.forEach(seat => {
      recommendations.push({
        seatNumber: seat.number,
        reason: `${t.upgrade} $${seat.price}`,
        type: 'upgrade',
      });
    });

    return recommendations;
  }

  // Get seat statistics
  getStatistics() {
    const allSeats = this.getAllSeats();
    const availableSeats = this.getAvailableSeats();
    const takenSeats = allSeats.filter(s => s.status === 'taken');
    const paidSeats = availableSeats.filter(s => s.price && s.price > 0);
    const exitRowSeats = availableSeats.filter(s => s.isExit);

    const totalSeats = allSeats.length;
    const availableCount = availableSeats.length;
    const occupancyRate = ((takenSeats.length / totalSeats) * 100).toFixed(0);

    const avgRating = (
      allSeats.reduce((sum, seat) => sum + seat.rating, 0) / totalSeats
    ).toFixed(1);

    const lowestPaidSeat = paidSeats.length > 0
      ? Math.min(...paidSeats.map(s => s.price!))
      : 0;

    return {
      totalSeats,
      availableCount,
      takenCount: takenSeats.length,
      occupancyRate: `${occupancyRate}%`,
      avgRating: parseFloat(avgRating),
      paidSeatsAvailable: paidSeats.length,
      exitRowSeatsAvailable: exitRowSeats.length,
      lowestPaidSeatPrice: lowestPaidSeat,
    };
  }

  // Get seat by number
  getSeatByNumber(seatNumber: string): SeatInfo | undefined {
    return this.getAllSeats().find(seat => seat.number === seatNumber);
  }

  // Get adjacent seats
  getAdjacentSeats(seatNumber: string): SeatInfo[] {
    const seat = this.getSeatByNumber(seatNumber);
    if (!seat) return [];

    const cabin = this.getCabinConfig();
    if (!cabin) return [];

    const row = cabin.rows.find(r => r.rowNumber === seat.row);
    if (!row) return [];

    const seatIndex = row.seats.findIndex(s => s?.number === seatNumber);
    if (seatIndex === -1) return [];

    const adjacent: SeatInfo[] = [];

    // Left seat
    if (seatIndex > 0 && row.seats[seatIndex - 1]) {
      adjacent.push(row.seats[seatIndex - 1]!);
    }

    // Right seat
    if (seatIndex < row.seats.length - 1 && row.seats[seatIndex + 1]) {
      adjacent.push(row.seats[seatIndex + 1]!);
    }

    return adjacent;
  }

  // Check if seats are together (for families/groups)
  findAdjacentAvailableSeats(count: number): SeatInfo[][] {
    const cabin = this.getCabinConfig();
    if (!cabin) return [];

    const groups: SeatInfo[][] = [];

    cabin.rows.forEach(row => {
      let currentGroup: SeatInfo[] = [];

      row.seats.forEach(seat => {
        if (seat === null) {
          // Aisle - reset group
          if (currentGroup.length >= count) {
            groups.push([...currentGroup]);
          }
          currentGroup = [];
        } else if (seat.status === 'available') {
          currentGroup.push(seat);
          if (currentGroup.length >= count) {
            groups.push([...currentGroup.slice(0, count)]);
            currentGroup = currentGroup.slice(1); // Sliding window
          }
        } else {
          currentGroup = [];
        }
      });

      // Check final group
      if (currentGroup.length >= count) {
        groups.push([...currentGroup.slice(0, count)]);
      }
    });

    return groups;
  }

  // Get seat color based on status and features
  getSeatColor(seat: SeatInfo): string {
    if (seat.status === 'taken') return '#EF4444'; // Red
    if (seat.status === 'blocked') return '#6B7280'; // Gray

    if (seat.isExit || seat.isPremium) return '#8B5CF6'; // Purple
    if (seat.position === 'middle') return '#F59E0B'; // Orange
    if (seat.legroom >= 36) return '#3B82F6'; // Blue
    if (seat.warnings.length > 0) return '#FBBF24'; // Yellow

    return '#10B981'; // Green (available)
  }

  // Get seat icon
  getSeatIcon(seat: SeatInfo): string {
    if (seat.position === 'window') return '🪟';
    if (seat.position === 'aisle') return '🚶';
    return '⬜';
  }

  // Format legroom display
  formatLegroom(inches: number, lang: 'en' | 'pt' | 'es' = 'en'): string {
    const cm = Math.round(inches * 2.54);

    if (lang === 'en') {
      return `${inches}" (${cm}cm)`;
    } else {
      return `${cm}cm (${inches}")`;
    }
  }

  // Get seat quality score (0-100)
  getSeatQualityScore(seat: SeatInfo): number {
    let score = 50; // Base score

    // Rating contribution (max +25)
    score += (seat.rating - 3) * 10;

    // Legroom contribution (max +15)
    if (seat.legroom >= 38) score += 15;
    else if (seat.legroom >= 34) score += 10;
    else if (seat.legroom >= 32) score += 5;

    // Position contribution (max +10)
    if (seat.position === 'window') score += 10;
    else if (seat.position === 'aisle') score += 8;

    // Features contribution (max +20)
    score += Math.min(seat.features.length * 3, 20);

    // Warnings penalty (max -30)
    score -= seat.warnings.length * 10;

    // Recline penalty
    if (seat.recline === 'limited') score -= 5;
    if (seat.recline === 'none') score -= 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

// Utility function to create parser instance
export function createSeatMapParser(aircraft: AircraftConfig, cabinClass: CabinClass): SeatMapParser {
  return new SeatMapParser(aircraft, cabinClass);
}

// Export helper functions
export function formatPrice(price: number | undefined, currency: string = 'USD'): string {
  if (!price) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function getSeatColorLegend(lang: 'en' | 'pt' | 'es' = 'en') {
  const legends = {
    en: [
      { color: '#10B981', label: 'Available' },
      { color: '#3B82F6', label: 'Extra Legroom' },
      { color: '#8B5CF6', label: 'Premium/Exit Row' },
      { color: '#F59E0B', label: 'Middle Seat' },
      { color: '#FBBF24', label: 'Limited Recline' },
      { color: '#EF4444', label: 'Taken' },
      { color: '#6B7280', label: 'Unavailable' },
    ],
    pt: [
      { color: '#10B981', label: 'Disponível' },
      { color: '#3B82F6', label: 'Espaço Extra' },
      { color: '#8B5CF6', label: 'Premium/Saída' },
      { color: '#F59E0B', label: 'Assento do Meio' },
      { color: '#FBBF24', label: 'Recline Limitado' },
      { color: '#EF4444', label: 'Ocupado' },
      { color: '#6B7280', label: 'Indisponível' },
    ],
    es: [
      { color: '#10B981', label: 'Disponible' },
      { color: '#3B82F6', label: 'Espacio Extra' },
      { color: '#8B5CF6', label: 'Premium/Salida' },
      { color: '#F59E0B', label: 'Asiento del Medio' },
      { color: '#FBBF24', label: 'Reclinación Limitada' },
      { color: '#EF4444', label: 'Ocupado' },
      { color: '#6B7280', label: 'No Disponible' },
    ],
  };

  return legends[lang];
}
