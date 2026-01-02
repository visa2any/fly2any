// Timeline Components - Apple-class Quote Experience

// Core timeline components
export { default as ItineraryTimeline } from "./ItineraryTimeline";
export { default as ItineraryCard } from "./ItineraryCard";
export { default as SortableItineraryCard } from "./SortableItineraryCard";
export { default as TimelineDayAnchor } from "./TimelineDayAnchor";
export { default as FreeTimeBlock } from "./FreeTimeBlock";

// View mode context
export { ViewModeProvider, useViewMode, ViewModeToggle } from "./ViewModeContext";

// Tone system
export {
  type ToneProfile,
  type ProductType,
  type DayMood,
  getToneVocabulary,
  getDayOneLiner,
  getDayOneLinerSeeded,
  getProductCopy,
  getClosingMessage,
  getClosingMessageSeeded,
  detectTone,
  getTimeBasedGreeting,
  getTripDurationCopy,
} from "./ToneSystem";
