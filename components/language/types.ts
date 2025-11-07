/**
 * Type definitions for Language Detection components
 */

import { SupportedLanguage } from '@/lib/ai/language-detection';

/**
 * Props for the LanguageDetectionPopup component
 */
export interface LanguageDetectionPopupProps {
  /** The detected language code (en, es, or pt) */
  detectedLanguage: 'en' | 'es' | 'pt';

  /** Confidence level of the detection (0-1). Popup only shows if > 0.8 */
  confidence: number;

  /** Callback function when user confirms the language switch */
  onConfirm: (language: string) => void;

  /** Callback function when user dismisses the popup */
  onDismiss: () => void;

  /** Current application language (optional, defaults to 'en') */
  currentLanguage?: string;
}

/**
 * Content structure for popup messages in different languages
 */
export interface PopupContent {
  /** Title text shown in the popup header */
  title: string;

  /** Main message asking if user wants to switch languages */
  message: string;

  /** Text for the confirm/accept button */
  confirmButton: string;

  /** Text for the dismiss/cancel button */
  dismissButton: string;
}

/**
 * Language detection state for UI components
 */
export interface LanguageDetectionState {
  /** Whether the popup is currently visible */
  isVisible: boolean;

  /** The language that was detected */
  detectedLanguage: SupportedLanguage;

  /** Confidence level of the detection (0-1) */
  confidence: number;

  /** Current application language */
  currentLanguage: SupportedLanguage;

  /** Whether language detection has been triggered in this session */
  hasDetectedOnce: boolean;
}

/**
 * Return type for the useLanguageDetection hook
 */
export interface UseLanguageDetectionReturn {
  /** Whether to show the popup */
  showPopup: boolean;

  /** The detected language */
  detectedLang: SupportedLanguage;

  /** Detection confidence level */
  confidence: number;

  /** Function to trigger language detection and show popup */
  triggerLanguageDetection: (language: SupportedLanguage, confidenceLevel: number) => void;

  /** Function to handle user confirming language switch */
  handleConfirm: (language: string) => void;

  /** Function to handle user dismissing popup */
  handleDismiss: () => void;
}

/**
 * Storage structure for dismissed languages in localStorage
 */
export interface LanguageDismissalStorage {
  /** Key is language code, value is whether it was dismissed */
  [languageCode: string]: boolean;
}

/**
 * Configuration options for language detection behavior
 */
export interface LanguageDetectionConfig {
  /** Minimum confidence threshold to show popup (default: 0.8) */
  minConfidence?: number;

  /** Auto-dismiss timeout in milliseconds (default: 10000) */
  autoDismissDelay?: number;

  /** Whether to remember dismissals across sessions (default: true) */
  persistDismissals?: boolean;

  /** Whether to show popup only once per session (default: true) */
  oncePerSession?: boolean;

  /** Custom storage key for dismissals (default: 'fly2any_language_detection_dismissed') */
  storageKey?: string;

  /** Custom session storage key (default: 'fly2any_language_popup_shown') */
  sessionKey?: string;
}

/**
 * Language information for display
 */
export interface LanguageInfo {
  /** Language code */
  code: SupportedLanguage;

  /** Display name in the language itself */
  name: string;

  /** Flag emoji for the language */
  flag: string;

  /** English name of the language */
  englishName: string;
}

/**
 * Available language info
 */
export const LANGUAGE_INFO: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    englishName: 'English',
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    englishName: 'Spanish',
  },
  pt: {
    code: 'pt',
    name: 'Português',
    flag: '🇧🇷',
    englishName: 'Portuguese',
  },
};

/**
 * Type guard to check if a string is a valid SupportedLanguage
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return ['en', 'es', 'pt'].includes(lang);
}

/**
 * Type for language change event
 */
export interface LanguageChangeEvent {
  /** Previous language */
  from: SupportedLanguage;

  /** New language */
  to: SupportedLanguage;

  /** Timestamp of the change */
  timestamp: Date;

  /** How the change was triggered */
  source: 'popup' | 'manual' | 'auto-detect';
}

/**
 * Callback type for language change events
 */
export type LanguageChangeCallback = (event: LanguageChangeEvent) => void;
