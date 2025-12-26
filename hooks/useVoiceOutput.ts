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

      // Auto-select best voice for language (prefer natural/premium voices)
      if (autoSelectVoice && availableVoices.length > 0) {
        const langCode = getVoiceLanguageCode(language.split('-')[0]);
        const langVoices = availableVoices.filter(v =>
          v.lang.startsWith(langCode.split('-')[0])
        );

        // Priority: Google/Microsoft premium > Natural > Online > Local > Any
        const preferredVoice =
          langVoices.find(v => v.name.includes('Natural') || v.name.includes('Neural')) ||
          langVoices.find(v => v.name.includes('Google') && !v.localService) ||
          langVoices.find(v => v.name.includes('Microsoft') && v.name.includes('Online')) ||
          langVoices.find(v => v.name.includes('Samantha') || v.name.includes('Alex')) || // macOS
          langVoices.find(v => !v.localService) || // Cloud voices
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

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(processed.text);
    utterance.lang = getVoiceLanguageCode(language.split('-')[0]);
    utterance.rate = processed.config.speed === 'fast' ? 1.1 : processed.config.speed === 'slow' ? 0.9 : rate;
    utterance.pitch = pitch;
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
