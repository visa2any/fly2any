/**
 * Knowledge Base Index
 * Central export point for all travel knowledge
 */

// Export all knowledge modules
export * from './flights';
export * from './hotels';
export * from './legal';
export * from './visa';
export * from './travel-tips';
export * from './query';

// Re-export commonly used functions
export {
  queryKnowledge,
  type QueryResult
} from './query';

export {
  getBaggagePolicy,
  getFareClass,
  getAirlineAlliance
} from './flights';

export {
  getHotelChain,
  getAmenity
} from './hotels';

export {
  getCompensationAmount,
  isEligibleEU261
} from './legal';

export {
  getPassportValidityRequirement
} from './visa';

export {
  getTipsByCategory
} from './travel-tips';
