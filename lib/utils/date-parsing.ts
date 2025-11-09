/**
 * Shared date parsing utilities for AI chat
 * Handles natural language date formats including ordinals (1st, 2nd, 3rd, etc.)
 */

export interface ParsedDate {
  isoDate: string; // YYYY-MM-DD format
  displayDate: string; // "Dec 1, 2025"
  rawInput: string;
}

const MONTHS: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11
};

/**
 * Parse natural language date with ordinals
 * Examples: "dec 1st", "december 25th", "1st december", "jan 15"
 */
export function parseNaturalDate(dateString: string): ParsedDate | null {
  if (!dateString) return null;

  const normalized = dateString.toLowerCase().trim();
  const now = new Date();

  // Patterns to match various date formats
  const patterns = [
    // "dec 1st", "december 1st", "dec 1"
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
    // "1st dec", "1 december"
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\b/i,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = normalized.match(patterns[i]);
    if (match) {
      let monthName: string;
      let day: number;

      if (i === 0) {
        // Pattern: "month day"
        monthName = match[1].toLowerCase();
        day = parseInt(match[2], 10);
      } else {
        // Pattern: "day month"
        monthName = match[2].toLowerCase();
        day = parseInt(match[1], 10);
      }

      const month = MONTHS[monthName];
      if (month === undefined) continue;

      // Validate day
      if (day < 1 || day > 31) continue;

      // Calculate year (assume next occurrence)
      let year = now.getFullYear();
      let date = new Date(year, month, day);

      // If date is in the past, assume next year
      if (date < now) {
        year++;
        date = new Date(year, month, day);
      }

      const isoDate = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return {
        isoDate,
        displayDate,
        rawInput: dateString
      };
    }
  }

  // Try parsing as ISO date (YYYY-MM-DD)
  const isoMatch = normalized.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const date = new Date(normalized);
    if (!isNaN(date.getTime())) {
      return {
        isoDate: normalized,
        displayDate: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        rawInput: dateString
      };
    }
  }

  // Try JavaScript Date parser as fallback
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return {
      isoDate: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      rawInput: dateString
    };
  }

  return null;
}

/**
 * Extract date from query for specific purpose (departure, return, checkin, checkout)
 */
export function extractDateFromQuery(
  query: string,
  type: 'departure' | 'return' | 'checkin' | 'checkout'
): ParsedDate | null {
  const lowerQuery = query.toLowerCase();

  let keywords: string[];
  switch (type) {
    case 'departure':
      keywords = ['leaving', 'departing', 'depart', 'on'];
      break;
    case 'return':
      keywords = ['returning', 'return', 'until', 'through', 'back'];
      break;
    case 'checkin':
      keywords = ['check-in', 'checkin', 'checking in', 'from'];
      break;
    case 'checkout':
      keywords = ['check-out', 'checkout', 'checking out', 'to', 'until'];
      break;
  }

  // Build regex pattern to find dates after keywords
  const keywordPattern = keywords.join('|');
  const datePattern = new RegExp(
    `(?:${keywordPattern})\\s+(?:on\\s+)?([a-z]+\\s+\\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}(?:st|nd|rd|th)?\\s+[a-z]+)`,
    'i'
  );

  const match = lowerQuery.match(datePattern);
  if (match && match[1]) {
    return parseNaturalDate(match[1]);
  }

  // Fallback: try to find any date in the query
  const anyDatePattern = /\b([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}(?:st|nd|rd|th)?\s+[a-z]+)\b/i;
  const anyMatch = lowerQuery.match(anyDatePattern);
  if (anyMatch && anyMatch[1]) {
    return parseNaturalDate(anyMatch[1]);
  }

  return null;
}

/**
 * Safe date formatter that handles invalid dates
 */
export function formatDateSafe(dateString: string | undefined | null): string {
  if (!dateString) return 'Not specified';

  // Try parsing as natural language first
  const parsed = parseNaturalDate(dateString);
  if (parsed) return parsed.displayDate;

  // Try ISO format
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch {
    // Fall through to return raw string
  }

  return dateString;
}
