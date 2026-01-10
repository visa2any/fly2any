import type { QuoteItem, FlightItem, HotelItem, ActivityItem, TransferItem, CarItem } from '../types/quote-workspace.types';
import { parseISO, isSameDay, addMinutes, isWithinInterval, differenceInMinutes } from 'date-fns';

export interface TimeConflict {
  itemId: string;
  conflictsWith: string[];
  type: 'overlap' | 'tight_connection';
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Extract time range from a quote item
 */
function extractTimeRange(item: QuoteItem): TimeRange | null {
  try {
    switch (item.type) {
      case 'flight': {
        const flight = item as FlightItem;
        // Parse departure and arrival times
        const start = parseISO(`${flight.date}T${flight.departureTime}`);
        const end = parseISO(`${flight.date}T${flight.arrivalTime}`);
        return { start, end };
      }

      case 'hotel': {
        const hotel = item as HotelItem;
        // Hotels occupy full days from checkIn to checkOut
        const start = parseISO(hotel.checkIn);
        const end = parseISO(hotel.checkOut);
        return { start, end };
      }

      case 'activity': {
        const activity = item as ActivityItem;
        // Activities have start time and duration
        if (activity.time) {
          const start = parseISO(`${activity.date}T${activity.time}`);
          // Parse duration (e.g., "2 hours", "3h", "90 minutes")
          const durationMinutes = parseDuration(activity.duration);
          const end = addMinutes(start, durationMinutes);
          return { start, end };
        }
        // If no time, treat as whole day event
        const start = parseISO(activity.date);
        const end = addMinutes(start, 60); // Default 1 hour
        return { start, end };
      }

      case 'transfer': {
        const transfer = item as TransferItem;
        // Transfers have pickup time
        const start = parseISO(`${item.date}T${transfer.pickupTime}`);
        const end = addMinutes(start, 60); // Assume 1 hour transfer
        return { start, end };
      }

      case 'car': {
        const car = item as CarItem;
        // Cars occupy time from pickup to dropoff
        const start = parseISO(car.pickupDate);
        const end = parseISO(car.dropoffDate);
        return { start, end };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error(`Error extracting time range for item ${item.id}:`, error);
    return null;
  }
}

/**
 * Parse duration string to minutes
 * Supports: "2 hours", "3h", "90 minutes", "1.5h", "2h 30m"
 */
function parseDuration(duration: string): number {
  if (!duration) return 60; // Default 1 hour

  const cleanDuration = duration.toLowerCase().trim();

  // Match patterns like "2 hours 30 minutes" or "2h 30m"
  const hoursMinutesMatch = cleanDuration.match(/(\d+\.?\d*)\s*(?:hours?|h)\s*(\d+)?\s*(?:minutes?|m)?/);
  if (hoursMinutesMatch) {
    const hours = parseFloat(hoursMinutesMatch[1]);
    const minutes = hoursMinutesMatch[2] ? parseInt(hoursMinutesMatch[2]) : 0;
    return Math.round(hours * 60 + minutes);
  }

  // Match just hours: "2 hours", "3h", "1.5h"
  const hoursMatch = cleanDuration.match(/(\d+\.?\d*)\s*(?:hours?|h)/);
  if (hoursMatch) {
    return Math.round(parseFloat(hoursMatch[1]) * 60);
  }

  // Match just minutes: "90 minutes", "45m"
  const minutesMatch = cleanDuration.match(/(\d+)\s*(?:minutes?|m)/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1]);
  }

  // Default fallback
  return 60;
}

/**
 * Check if two time ranges overlap
 */
function rangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
  return (
    isWithinInterval(range1.start, { start: range2.start, end: range2.end }) ||
    isWithinInterval(range1.end, { start: range2.start, end: range2.end }) ||
    isWithinInterval(range2.start, { start: range1.start, end: range1.end }) ||
    isWithinInterval(range2.end, { start: range1.start, end: range1.end })
  );
}

/**
 * Check if connection between two items is too tight
 * Returns true if less than 2 hours between items
 */
function isTightConnection(range1: TimeRange, range2: TimeRange): boolean {
  const gap1 = differenceInMinutes(range2.start, range1.end);
  const gap2 = differenceInMinutes(range1.start, range2.end);
  const minGap = Math.min(Math.abs(gap1), Math.abs(gap2));

  return minGap > 0 && minGap < 120; // Less than 2 hours gap
}

/**
 * Get conflict severity based on item types
 */
function getConflictSeverity(
  item1: QuoteItem,
  item2: QuoteItem,
  isOverlap: boolean
): 'critical' | 'warning' | 'info' {
  // Critical: Flight overlaps with anything
  if (item1.type === 'flight' || item2.type === 'flight') {
    return 'critical';
  }

  // Critical: Complete overlap of activities
  if (isOverlap && item1.type === 'activity' && item2.type === 'activity') {
    return 'critical';
  }

  // Warning: Tight connections
  if (!isOverlap) {
    return 'warning';
  }

  // Info: Other overlaps
  return 'info';
}

/**
 * Generate conflict message
 */
function getConflictMessage(
  item1: QuoteItem,
  item2: QuoteItem,
  isOverlap: boolean
): string {
  const name1 = getItemName(item1);
  const name2 = getItemName(item2);

  if (isOverlap) {
    return `Overlaps with ${name2}`;
  } else {
    return `Tight connection with ${name2} (< 2h gap)`;
  }
}

/**
 * Get item display name
 */
function getItemName(item: QuoteItem): string {
  switch (item.type) {
    case 'flight':
      return `Flight ${(item as FlightItem).flightNumber}`;
    case 'hotel':
      return (item as HotelItem).name;
    case 'activity':
      return (item as ActivityItem).name;
    case 'transfer':
      return `Transfer to ${(item as TransferItem).dropoffLocation}`;
    case 'car':
      return `${(item as CarItem).company} Rental`;
    default:
      return 'Item';
  }
}

/**
 * Detect conflicts in quote items
 */
export function detectConflicts(items: QuoteItem[]): Map<string, TimeConflict> {
  const conflicts = new Map<string, TimeConflict>();

  // Extract time ranges for all items
  const itemRanges = new Map<string, TimeRange>();
  items.forEach(item => {
    const range = extractTimeRange(item);
    if (range) {
      itemRanges.set(item.id, range);
    }
  });

  // Compare each pair of items
  items.forEach((item1, i) => {
    const range1 = itemRanges.get(item1.id);
    if (!range1) return;

    const conflictsWith: string[] = [];

    items.forEach((item2, j) => {
      if (i >= j) return; // Skip self and already compared pairs

      const range2 = itemRanges.get(item2.id);
      if (!range2) return;

      // Check if items are on the same day (for activities)
      if (!isSameDay(range1.start, range2.start)) return;

      // Check for overlap
      const overlap = rangesOverlap(range1, range2);
      const tight = !overlap && isTightConnection(range1, range2);

      if (overlap || tight) {
        conflictsWith.push(item2.id);

        // Store conflict for item1
        if (!conflicts.has(item1.id)) {
          conflicts.set(item1.id, {
            itemId: item1.id,
            conflictsWith: [],
            type: overlap ? 'overlap' : 'tight_connection',
            severity: getConflictSeverity(item1, item2, overlap),
            message: getConflictMessage(item1, item2, overlap),
          });
        }
        conflicts.get(item1.id)!.conflictsWith.push(item2.id);

        // Store conflict for item2
        if (!conflicts.has(item2.id)) {
          conflicts.set(item2.id, {
            itemId: item2.id,
            conflictsWith: [],
            type: overlap ? 'overlap' : 'tight_connection',
            severity: getConflictSeverity(item2, item1, overlap),
            message: getConflictMessage(item2, item1, overlap),
          });
        }
        conflicts.get(item2.id)!.conflictsWith.push(item1.id);
      }
    });
  });

  return conflicts;
}
