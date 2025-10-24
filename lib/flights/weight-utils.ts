/**
 * Baggage Weight Formatting Utilities
 *
 * Provides user-friendly weight display in both pounds and kilograms
 * for better UX across US and international markets
 */

/**
 * Format baggage weight with both pounds and kilograms
 * @param kg - Weight in kilograms
 * @param lbsFirst - If true, shows lbs first (US-optimized). If false, shows kg first (international)
 * @returns Formatted weight string (e.g., "50 lbs (23 kg)" or "23 kg (50 lbs)")
 */
export function formatBaggageWeight(kg: number, lbsFirst: boolean = true): string {
  if (!kg || kg === 0) return '';

  const lbs = Math.round(kg * 2.20462);

  if (lbsFirst) {
    return `${lbs} lbs (${kg} kg)`;
  }
  return `${kg} kg (${lbs} lbs)`;
}

/**
 * Format baggage weight - compact version (slash separator)
 * @param kg - Weight in kilograms
 * @param lbsFirst - If true, shows lbs first
 * @returns Compact formatted weight (e.g., "50 lbs / 23 kg")
 */
export function formatBaggageWeightCompact(kg: number, lbsFirst: boolean = true): string {
  if (!kg || kg === 0) return '';

  const lbs = Math.round(kg * 2.20462);

  if (lbsFirst) {
    return `${lbs} lbs / ${kg} kg`;
  }
  return `${kg} kg / ${lbs} lbs`;
}

/**
 * Get weight from string (extracts numeric value from strings like "23kg" or "50 lbs")
 * @param weightString - Weight string (e.g., "23kg", "50lbs")
 * @returns Numeric weight value
 */
export function extractWeight(weightString: string): number {
  const match = weightString.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Check if weight string is in kilograms
 * @param weightString - Weight string
 * @returns True if kg, false otherwise
 */
export function isKilograms(weightString: string): boolean {
  return weightString.toLowerCase().includes('kg');
}
