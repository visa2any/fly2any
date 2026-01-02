// Quote Workspace Hooks - Future-Ready Architecture

// Accessibility
export {
  useAnnounce,
  useFocusTrap,
  useReducedMotion,
  useKeyboardNavigation,
  useKeyboardDnd,
} from './useA11y';

// Persistence
export {
  useQuotePersistence,
  useQuoteRealtime,
} from './useQuotePersistence';

// Performance
export {
  useVirtualTimeline,
  usePaginatedTimeline,
} from './useVirtualTimeline';

// Destination Hero
export { useDestinationHero } from './useDestinationHero';
export type { DestinationHeroData, DestinationImage } from './useDestinationHero';
