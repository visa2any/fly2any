/**
 * SEO Metadata Utilities
 *
 * Re-exports structured data schemas from entity-schema.ts (canonical source)
 * and provides metadata generation helpers unique to this module.
 *
 * @version 3.0.0 - Consolidated: all schemas now live in entity-schema.ts
 */

// ============================================================================
// RE-EXPORTS from entity-schema.ts (canonical source of truth)
// ============================================================================

export {
  getOrganizationSchema,
  getWebSiteSchema,
  getFAQSchema,
  getFlightSchema,
  getBreadcrumbSchema,
  getFlightServiceSchema,
  getLocalBusinessSchema,
  getReviewSchema,
  getEventSchema,
  getSoftwareApplicationSchema,
  getTravelAgencySchema,
  getProductSchema,
  getHowToSchema,
} from './entity-schema';

// Alias for backward compatibility (some files import getWebsiteSchema lowercase)
export { getWebSiteSchema as getWebsiteSchema } from './entity-schema';

// Alias: some files import getBreadcrumbSchema via getBreadcrumbListSchema
export { getBreadcrumbSchema as getBreadcrumbListSchema } from './entity-schema';

// ============================================================================
// METADATA GENERATION (unique to this module)
// ============================================================================

// Generic metadata generator
export function generateMetadata(config: any) {
  return {
    title: config.title || 'Fly2Any',
    description: config.description || 'Premium travel booking platform',
    ...config
  };
}

// ============================================================================
// WORLD CUP METADATA (stubs for compatibility)
// ============================================================================

export const worldCupMainMetadata = () => ({ title: 'World Cup 2026', description: 'FIFA World Cup 2026' });
export const worldCupPackagesMetadata = () => ({ title: 'World Cup Packages', description: 'Travel packages for World Cup 2026' });
export const worldCupScheduleMetadata = () => ({ title: 'World Cup Schedule', description: 'FIFA World Cup 2026 schedule' });
export const worldCupStadiumMetadata = (slug: string) => ({ title: `${slug} Stadium`, description: 'World Cup stadium' });
export const worldCupTeamMetadata = (slug: string) => ({ title: `${slug} Team`, description: 'World Cup team' });

// World Cup schema aliases
export { getEventSchema as getWorldCupEventSchema } from './entity-schema';
export { getProductSchema as getTravelPackageSchema } from './entity-schema';
export { getLocalBusinessSchema as getStadiumSchema } from './entity-schema';
export { getOrganizationSchema as getSportsTeamSchema } from './entity-schema';

export default {
  generateMetadata,
};
