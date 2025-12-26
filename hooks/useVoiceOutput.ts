/**
 * Voice Output Hook - Browser Text-to-Speech
 *
 * Uses Web Speech Synthesis API
 * Integrates with voice-output.ts for stage-aware filtering
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { formatForVoice, getVoiceLanguageCode } from '@/lib/ai/voice-output';
import type { ConversationStage } from '@/lib/ai/reasoning-layer';

export interface VoiceOutputState {
  isSpeaking: boolean;
  isSupported: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  error: string | null;
}

export interface UseVoiceOutputOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  autoSelectVoice?: boolean;
}

export function useVoiceOutput(options: UseVoiceOutputOptions = {}) {
  const {
    language = 'en-US',
    rate = 1,
    pitch = 1,
    volume = 1,
    autoSelectVoice = true,
  } = options;

  const [state, setState] = useState<VoiceOutputState>({
    isSpeaking: false,
    isSupported: false,
    isPaused: false,
    voices: [],
    selectedVoice: null,
    error: null,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support and load voices
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setState(s => ({ ...s, isSupported: false }));
      return;
    }

    setState(s => ({ ...s, isSupported: true }));

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setState(s => ({ ...s, voices: availableVoices }));

      // Auto-select best voice for language (prefer most human-like voices)
      if (autoSelectVoice && availableVoices.length > 0) {
        const langCode = getVoiceLanguageCode(language.split('-')[0]);
        const langVoices = availableVoices.filter(v =>
          v.lang.startsWith(langCode.split('-')[0])
        );

        // PRIORITY ORDER: Most human-like voices first
        // 1. Microsoft Edge Neural voices (best quality on Windows)
        // 2. macOS Enhanced voices (best on Mac)
        // 3. Google Cloud voices
        // 4. Any Neural/Natural voice
        // 5. Online voices (cloud-based = better quality)
        // 6. Local voices as fallback

        const preferredVoice =
          // Microsoft Edge Neural voices - MOST HUMAN (Windows 10/11 + Edge)
          langVoices.find(v => v.name.includes('Microsoft') && v.name.includes('Online') && v.name.includes('Natural')) ||
          langVoices.find(v => v.name.includes('Microsoft Aria')) ||
          langVoices.find(v => v.name.includes('Microsoft Jenny')) ||
          langVoices.find(v => v.name.includes('Microsoft Guy')) ||
          langVoices.find(v => v.name.includes('Microsoft') && v.name.includes('Online')) ||
          // macOS Premium voices
          langVoices.find(v => v.name.includes('Samantha') && v.name.includes('Enhanced')) ||
          langVoices.find(v => v.name.includes('Ava') && !v.name.includes('Compact')) ||
          langVoices.find(v => v.name.includes('Samantha')) ||
          langVoices.find(v => v.name.includes('Alex')) ||
          langVoices.find(v => v.name.includes('Karen') || v.name.includes('Daniel')) || // UK English
          // Any Neural/Natural voice
          langVoices.find(v => v.name.includes('Neural') || v.name.includes('Natural')) ||
          // Google Chrome voices
          langVoices.find(v => v.name.includes('Google') && v.lang.includes('en')) ||
          // Cloud voices (usually better than local)
          langVoices.find(v => !v.localService) ||
          // Local voices as last resort
          langVoices.find(v => v.localService) ||
          availableVoices[0];

        setState(s => ({ ...s, selectedVoice: preferredVoice }));
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, [language, autoSelectVoice]);

  // Speak text with stage-aware filtering
  const speak = useCallback((
    text: string,
    stage: ConversationStage = 'DISCOVERY',
    emotion?: string
  ) => {
    const synth = window.speechSynthesis;
    if (!synth || !text.trim()) return;

    // Stop any current speech
    synth.cancel();

    // Process through voice-output layer (stage-aware filtering)
    const processed = formatForVoice(text, stage, { emotion });

    if (!processed.canSpeak) {
      console.log('[VoiceOutput] Text too short or blocked:', processed.blockReason);
      return;
    }

    // Create utterance with emotional modulation for natural human feel
    const utterance = new SpeechSynthesisUtterance(processed.text);
    utterance.lang = getVoiceLanguageCode(language.split('-')[0]);

    // Apply emotional voice modulation for more human-like delivery
    // Base rates adjusted per emotion for natural prosody
    let emotionalRate = rate;
    let emotionalPitch = pitch;

    if (emotion) {
      switch (emotion) {
        case 'happy':
        case 'excited':
          emotionalRate = 1.05;   // Slightly faster, energetic
          emotionalPitch = 1.08;  // Slightly higher, cheerful
          break;
        case 'frustrated':
        case 'angry':
          emotionalRate = 0.88;   // Slower, calming
          emotionalPitch = 0.95;  // Slightly lower, soothing
          break;
        case 'confused':
        case 'uncertain':
          emotionalRate = 0.90;   // Slower for clarity
          emotionalPitch = 1.02;  // Slight uptick, reassuring
          break;
        case 'urgent':
          emotionalRate = 1.08;   // Faster to match urgency
          emotionalPitch = 1.02;  // Slight emphasis
          break;
        case 'sad':
        case 'disappointed':
          emotionalRate = 0.85;   // Slower, empathetic
          emotionalPitch = 0.92;  // Lower, warm
          break;
        default:
          // Professional neutral - slight warmth
          emotionalRate = 0.95;
          emotionalPitch = 1.0;
      }
    }

    // Apply speed override from processed config
    if (processed.config.speed === 'fast') emotionalRate = Math.min(emotionalRate + 0.1, 1.2);
    if (processed.config.speed === 'slow') emotionalRate = Math.max(emotionalRate - 0.1, 0.75);

    utterance.rate = emotionalRate;
    utterance.pitch = emotionalPitch;
    utterance.volume = volume;

    if (state.selectedVoice) {
      utterance.voice = state.selectedVoice;
    }

    utterance.onstart = () => {
      setState(s => ({ ...s, isSpeaking: true, isPaused: false, error: null }));
    };

    utterance.onend = () => {
      setState(s => ({ ...s, isSpeaking: false, isPaused: false }));
    };

    utterance.onerror = (event) => {
      setState(s => ({
        ...s,
        isSpeaking: false,
        isPaused: false,
        error: `Speech error: ${event.error}`,
      }));
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [language, rate, pitch, volume, state.selectedVoice]);

  // Stop speaking
  const stop = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      setState(s => ({ ...s, isSpeaking: false, isPaused: false }));
    }
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth && state.isSpeaking) {
      synth.pause();
      setState(s => ({ ...s, isPaused: true }));
    }
  }, [state.isSpeaking]);

  // Resume speaking
  const resume = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth && state.isPaused) {
      synth.resume();
      setState(s => ({ ...s, isPaused: false }));
    }
  }, [state.isPaused]);

  // Select voice
  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState(s => ({ ...s, selectedVoice: voice }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const synth = window.speechSynthesis;
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  return {
    ...state,
    speak,
    stop,
    pause,
    resume,
    selectVoice,
  };
}
