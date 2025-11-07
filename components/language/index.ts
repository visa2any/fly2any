/**
 * Language Detection Components
 *
 * Export all language detection related components and utilities
 */

export { default as LanguageDetectionPopup, useLanguageDetection } from './LanguageDetectionPopup';

export type {
  LanguageDetectionPopupProps,
  PopupContent,
  LanguageDetectionState,
  UseLanguageDetectionReturn,
  LanguageDismissalStorage,
  LanguageDetectionConfig,
  LanguageInfo,
  LanguageChangeEvent,
  LanguageChangeCallback,
} from './types';

export { LANGUAGE_INFO, isSupportedLanguage } from './types';

// Re-export types from language detection library for convenience
export type { SupportedLanguage, LanguageDetectionResult } from '@/lib/ai/language-detection';
export { LANGUAGE_FLAGS, LANGUAGE_NAMES } from '@/lib/ai/language-detection';
