/**
 * Fly2Any Airline Data Module
 *
 * Comprehensive airline data management system:
 * - Profile storage and retrieval
 * - Multi-source data ingestion (Duffel, Amadeus, static)
 * - ML knowledge base integration
 * - API endpoints for internal and external use
 */

export { airlineDataService, type AirlineProfileInput, type AirlineSearchParams } from './airline-data-service';

export { airlineKnowledgeBase, type KnowledgeEntry, type AirlineInsight } from './airline-knowledge-base';
