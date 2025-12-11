/**
 * Fly2Any Airline Knowledge Base Service
 *
 * Generates and manages airline knowledge entries for AI/ML systems.
 * Creates semantic embeddings for intelligent airline recommendations.
 */

import { getPrismaClient } from '@/lib/prisma';
import type { AirlineProfileInput } from './airline-data-service';

const prisma = getPrismaClient();

// ==========================================
// Types
// ==========================================

export interface KnowledgeEntry {
  iataCode: string;
  category: 'overview' | 'service' | 'baggage' | 'loyalty' | 'fleet' | 'routes' | 'ratings';
  title: string;
  content: string;
  tags: string[];
  embedding?: number[];
}

export interface AirlineInsight {
  iataCode: string;
  name: string;
  recommendation: string;
  strengths: string[];
  considerations: string[];
  bestFor: string[];
  score: number;
}

// ==========================================
// Knowledge Generation
// ==========================================

/**
 * Generate comprehensive knowledge entries for an airline
 */
export function generateAirlineKnowledge(airline: AirlineProfileInput): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];
  const code = airline.iataCode;

  // Overview entry
  entries.push({
    iataCode: code,
    category: 'overview',
    title: `${airline.name} Overview`,
    content: generateOverviewContent(airline),
    tags: ['airline', 'overview', airline.airlineType || 'fsc', airline.alliance || 'independent'].filter(Boolean),
  });

  // Service entry
  if (airline.hasWifi !== undefined || airline.hasIFE !== undefined || airline.mealService) {
    entries.push({
      iataCode: code,
      category: 'service',
      title: `${airline.name} In-Flight Services`,
      content: generateServiceContent(airline),
      tags: ['airline', 'service', 'amenities', 'inflight'],
    });
  }

  // Baggage entry
  if (airline.carryOnIncluded !== undefined || airline.firstBagFeeUSD !== undefined) {
    entries.push({
      iataCode: code,
      category: 'baggage',
      title: `${airline.name} Baggage Policy`,
      content: generateBaggageContent(airline),
      tags: ['airline', 'baggage', 'luggage', 'fees'],
    });
  }

  // Loyalty entry
  if (airline.loyaltyProgramName) {
    entries.push({
      iataCode: code,
      category: 'loyalty',
      title: `${airline.name} Loyalty Program`,
      content: generateLoyaltyContent(airline),
      tags: ['airline', 'loyalty', 'miles', 'frequent-flyer'],
    });
  }

  // Ratings entry
  if (airline.overallRating !== undefined) {
    entries.push({
      iataCode: code,
      category: 'ratings',
      title: `${airline.name} Ratings & Reviews`,
      content: generateRatingsContent(airline),
      tags: ['airline', 'ratings', 'reviews', 'quality'],
    });
  }

  return entries;
}

function generateOverviewContent(airline: AirlineProfileInput): string {
  const parts: string[] = [];

  parts.push(`${airline.name} (${airline.iataCode}) is a ${getAirlineTypeDescription(airline.airlineType)} airline.`);

  if (airline.country) {
    parts.push(`Based in ${airline.countryName || airline.country}.`);
  }

  if (airline.alliance) {
    parts.push(`Member of ${formatAlliance(airline.alliance)} alliance.`);
  }

  if (airline.hubAirports && airline.hubAirports.length > 0) {
    parts.push(`Hub airports: ${airline.hubAirports.join(', ')}.`);
  }

  if (airline.foundedYear) {
    parts.push(`Founded in ${airline.foundedYear}.`);
  }

  if (airline.fleetSize) {
    parts.push(`Operates a fleet of ${airline.fleetSize} aircraft.`);
  }

  return parts.join(' ');
}

function generateServiceContent(airline: AirlineProfileInput): string {
  const parts: string[] = [];

  parts.push(`${airline.name} in-flight service includes:`);

  if (airline.hasWifi) {
    parts.push(`WiFi available${airline.wifiType ? ` (${airline.wifiType})` : ''}.`);
  }

  if (airline.hasIFE) {
    parts.push('Personal in-flight entertainment system.');
  }

  if (airline.hasPowerOutlets) {
    parts.push('Power outlets at seats.');
  }

  if (airline.mealService) {
    parts.push(`Meal service: ${airline.mealService}.`);
  }

  if (airline.cabinClasses && airline.cabinClasses.length > 0) {
    parts.push(`Cabin classes: ${airline.cabinClasses.join(', ')}.`);
  }

  if (airline.hasPremiumEconomy) {
    parts.push('Premium Economy class available.');
  }

  if (airline.hasLieFlat) {
    parts.push('Lie-flat seats available in Business/First.');
  }

  return parts.join(' ');
}

function generateBaggageContent(airline: AirlineProfileInput): string {
  const parts: string[] = [];

  parts.push(`${airline.name} baggage policy:`);

  if (airline.carryOnIncluded !== undefined) {
    parts.push(airline.carryOnIncluded ? 'Carry-on bag included.' : 'Carry-on may require additional fee.');
  }

  if (airline.checkedBagIncluded !== undefined) {
    parts.push(airline.checkedBagIncluded ? 'First checked bag included.' : 'Checked bags are not included in base fare.');
  }

  if (airline.firstBagFeeUSD !== undefined) {
    parts.push(`First checked bag fee: $${airline.firstBagFeeUSD} USD.`);
  }

  if (airline.secondBagFeeUSD !== undefined) {
    parts.push(`Second checked bag fee: $${airline.secondBagFeeUSD} USD.`);
  }

  return parts.join(' ');
}

function generateLoyaltyContent(airline: AirlineProfileInput): string {
  const parts: string[] = [];

  parts.push(`${airline.name} loyalty program: ${airline.loyaltyProgramName}.`);

  if (airline.alliance) {
    parts.push(`Earn and redeem across ${formatAlliance(airline.alliance)} partner airlines.`);
  }

  if (airline.loyaltyTiers) {
    const tiers = Array.isArray(airline.loyaltyTiers) ? airline.loyaltyTiers : Object.keys(airline.loyaltyTiers);
    if (tiers.length > 0) {
      parts.push(`Elite status tiers: ${tiers.join(', ')}.`);
    }
  }

  return parts.join(' ');
}

function generateRatingsContent(airline: AirlineProfileInput): string {
  const parts: string[] = [];

  if (airline.overallRating !== undefined) {
    parts.push(`${airline.name} overall rating: ${airline.overallRating}/5.`);
  }

  if (airline.onTimeRating !== undefined) {
    parts.push(`On-time performance: ${airline.onTimeRating}/5.`);
  }

  if (airline.comfortRating !== undefined) {
    parts.push(`Seat comfort: ${airline.comfortRating}/5.`);
  }

  if (airline.serviceRating !== undefined) {
    parts.push(`Service quality: ${airline.serviceRating}/5.`);
  }

  if (airline.valueRating !== undefined) {
    parts.push(`Value for money: ${airline.valueRating}/5.`);
  }

  if (airline.onTimePercentage !== undefined) {
    parts.push(`On-time arrival rate: ${airline.onTimePercentage}%.`);
  }

  return parts.join(' ');
}

function getAirlineTypeDescription(type?: string): string {
  const types: Record<string, string> = {
    FSC: 'full-service carrier',
    LCC: 'low-cost carrier',
    ULCC: 'ultra-low-cost carrier',
    HYBRID: 'hybrid carrier',
    REGIONAL: 'regional',
    CHARTER: 'charter',
    CARGO: 'cargo',
  };
  return types[type || 'FSC'] || 'full-service carrier';
}

function formatAlliance(alliance: string): string {
  const alliances: Record<string, string> = {
    star_alliance: 'Star Alliance',
    oneworld: 'Oneworld',
    skyteam: 'SkyTeam',
  };
  return alliances[alliance.toLowerCase()] || alliance;
}

// ==========================================
// Knowledge Base Operations
// ==========================================

/**
 * Save knowledge entries to database
 */
export async function saveKnowledgeEntries(entries: KnowledgeEntry[]): Promise<number> {
  if (!prisma) return 0;

  let saved = 0;

  // Group entries by airline to batch lookups
  const entriesByAirline = new Map<string, KnowledgeEntry[]>();
  for (const entry of entries) {
    const existing = entriesByAirline.get(entry.iataCode) || [];
    existing.push(entry);
    entriesByAirline.set(entry.iataCode, existing);
  }

  for (const [iataCode, airlineEntries] of entriesByAirline) {
    try {
      // Look up airline ID
      const airline = await prisma.airlineProfile.findUnique({
        where: { iataCode },
        select: { id: true },
      });

      if (!airline) {
        console.warn(`Airline not found for ${iataCode}, skipping knowledge entries`);
        continue;
      }

      for (const entry of airlineEntries) {
        // Check if entry exists
        const existing = await prisma.airlineKnowledgeEntry.findFirst({
          where: { airlineId: airline.id, category: entry.category },
        });

        if (existing) {
          await prisma.airlineKnowledgeEntry.update({
            where: { id: existing.id },
            data: {
              title: entry.title,
              content: entry.content,
              embedding: entry.embedding || [],
            },
          });
        } else {
          await prisma.airlineKnowledgeEntry.create({
            data: {
              airlineId: airline.id,
              category: entry.category,
              title: entry.title,
              content: entry.content,
              embedding: entry.embedding || [],
            },
          });
        }
        saved++;
      }
    } catch (error) {
      console.error(`Error saving knowledge entries for ${iataCode}:`, error);
    }
  }

  return saved;
}

/**
 * Search knowledge base by query
 */
export async function searchKnowledge(query: string, limit: number = 10): Promise<KnowledgeEntry[]> {
  if (!prisma) return [];

  try {
    const results = await prisma.airlineKnowledgeEntry.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { airline: { select: { iataCode: true } } },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    return results.map((r) => ({
      iataCode: r.airline?.iataCode || '',
      category: r.category as KnowledgeEntry['category'],
      title: r.title,
      content: r.content,
      tags: [],
    }));
  } catch (error) {
    console.error('Error searching knowledge:', error);
    return [];
  }
}

/**
 * Get knowledge entries for an airline
 */
export async function getAirlineKnowledge(iataCode: string): Promise<KnowledgeEntry[]> {
  if (!prisma) return [];

  try {
    const airline = await prisma.airlineProfile.findUnique({
      where: { iataCode: iataCode.toUpperCase() },
      select: { id: true },
    });

    if (!airline) return [];

    const results = await prisma.airlineKnowledgeEntry.findMany({
      where: { airlineId: airline.id },
      orderBy: { category: 'asc' },
    });

    return results.map((r) => ({
      iataCode: iataCode.toUpperCase(),
      category: r.category as KnowledgeEntry['category'],
      title: r.title,
      content: r.content,
      tags: [],
    }));
  } catch (error) {
    console.error('Error getting airline knowledge:', error);
    return [];
  }
}

/**
 * Generate airline recommendation insight
 */
export function generateAirlineInsight(airline: AirlineProfileInput): AirlineInsight {
  const strengths: string[] = [];
  const considerations: string[] = [];
  const bestFor: string[] = [];

  // Analyze ratings
  if (airline.overallRating && airline.overallRating >= 4) {
    strengths.push('Highly rated overall');
  }
  if (airline.onTimeRating && airline.onTimeRating >= 4) {
    strengths.push('Excellent on-time performance');
    bestFor.push('Business travelers');
  }
  if (airline.comfortRating && airline.comfortRating >= 4) {
    strengths.push('Comfortable seating');
    bestFor.push('Long-haul flights');
  }
  if (airline.serviceRating && airline.serviceRating >= 4) {
    strengths.push('Outstanding service');
    bestFor.push('Premium travel');
  }

  // Analyze type
  if (airline.airlineType === 'LCC' || airline.airlineType === 'ULCC') {
    strengths.push('Competitive pricing');
    bestFor.push('Budget-conscious travelers');
    considerations.push('Additional fees may apply for bags and extras');
  }

  // Analyze amenities
  if (airline.hasWifi) {
    strengths.push('In-flight WiFi available');
    bestFor.push('Remote workers');
  }
  if (airline.hasLieFlat) {
    strengths.push('Lie-flat beds in premium cabins');
    bestFor.push('Overnight flights');
  }
  if (airline.hasPremiumEconomy) {
    strengths.push('Premium Economy option');
    bestFor.push('Mid-range comfort seekers');
  }

  // Analyze baggage
  if (airline.checkedBagIncluded) {
    strengths.push('Checked bag included');
  } else if (airline.firstBagFeeUSD !== undefined && airline.firstBagFeeUSD > 0) {
    considerations.push(`First bag fee: $${airline.firstBagFeeUSD}`);
  }

  // Alliance benefits
  if (airline.alliance) {
    strengths.push(`${formatAlliance(airline.alliance)} member`);
    bestFor.push('Frequent flyers seeking alliance benefits');
  }

  // Calculate score
  let score = 0;
  if (airline.overallRating) score += airline.overallRating * 15;
  if (airline.onTimeRating) score += airline.onTimeRating * 10;
  if (strengths.length > 0) score += strengths.length * 5;
  if (considerations.length > 0) score -= considerations.length * 2;
  score = Math.min(100, Math.max(0, score));

  // Generate recommendation
  let recommendation = '';
  if (score >= 80) {
    recommendation = `${airline.name} is an excellent choice with top-tier service and reliability.`;
  } else if (score >= 60) {
    recommendation = `${airline.name} offers a solid flying experience with good value.`;
  } else if (score >= 40) {
    recommendation = `${airline.name} provides basic service at competitive prices.`;
  } else {
    recommendation = `${airline.name} is a budget option - expect minimal frills.`;
  }

  return {
    iataCode: airline.iataCode,
    name: airline.name,
    recommendation,
    strengths,
    considerations,
    bestFor,
    score,
  };
}

// ==========================================
// Bulk Operations
// ==========================================

/**
 * Generate and save knowledge for all airlines in database
 */
export async function generateAllAirlineKnowledge(): Promise<{ processed: number; entries: number }> {
  if (!prisma) return { processed: 0, entries: 0 };

  const airlines = await prisma.airlineProfile.findMany({
    where: { isActive: true },
  });

  let totalEntries = 0;

  for (const airline of airlines) {
    const entries = generateAirlineKnowledge(airline as unknown as AirlineProfileInput);
    const saved = await saveKnowledgeEntries(entries);
    totalEntries += saved;
  }

  console.log(`Generated ${totalEntries} knowledge entries for ${airlines.length} airlines`);

  return { processed: airlines.length, entries: totalEntries };
}

// ==========================================
// Export
// ==========================================

export const airlineKnowledgeBase = {
  generateKnowledge: generateAirlineKnowledge,
  saveEntries: saveKnowledgeEntries,
  search: searchKnowledge,
  getByAirline: getAirlineKnowledge,
  generateInsight: generateAirlineInsight,
  generateAll: generateAllAirlineKnowledge,
};

export default airlineKnowledgeBase;
