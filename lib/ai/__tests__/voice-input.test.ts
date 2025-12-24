/**
 * Voice Input Layer Tests
 *
 * Validates: Normalization, Emotion Detection, Partial Handling, No PII
 */

import {
  normalizeVoiceInput,
  detectLanguage,
  detectEmotion,
  isPartialSentence,
  processVoiceInput,
  needsClarification,
  getClarificationPrompt,
} from '../voice-input';

describe('Voice Input Normalization', () => {
  describe('Filler Word Removal', () => {
    it('should remove English fillers', () => {
      const result = normalizeVoiceInput('Um like I want to uh travel now');
      expect(result.normalizedText.toLowerCase()).not.toContain('um');
      expect(result.normalizedText.toLowerCase()).not.toContain('uh');
      expect(result.normalizedText.toLowerCase()).toContain('want to travel');
    });

    it('should remove Portuguese fillers', () => {
      const result = normalizeVoiceInput('Então tipo quero reservar um voo né');
      expect(result.normalizedText.toLowerCase()).not.toContain('então');
      expect(result.normalizedText.toLowerCase()).not.toContain('tipo');
      expect(result.normalizedText.toLowerCase()).toContain('quero');
    });

    it('should remove multiple consecutive fillers', () => {
      const result = normalizeVoiceInput('Um uh er I need help');
      expect(result.normalizedText).toBe('I need help');
    });
  });

  describe('STT Error Correction', () => {
    it('should fix "round trip" to "round-trip"', () => {
      const result = normalizeVoiceInput('I need a round trip ticket');
      expect(result.normalizedText.toLowerCase()).toContain('round-trip');
    });

    it('should fix "one way" to "one-way"', () => {
      const result = normalizeVoiceInput('one way flight to Miami');
      expect(result.normalizedText.toLowerCase()).toContain('one-way');
    });

    it('should recognize Fly2Any brand', () => {
      const result = normalizeVoiceInput('I found fly to any online');
      expect(result.normalizedText).toContain('Fly2Any');
    });
  });

  describe('Voice Metadata', () => {
    it('should always set origin to "voice"', () => {
      const result = normalizeVoiceInput('Book a flight');
      expect(result.metadata.origin).toBe('voice');
    });

    it('should calculate word count', () => {
      const result = normalizeVoiceInput('I want to fly to Paris tomorrow');
      expect(result.metadata.wordCount).toBe(7);
    });

    it('should pass through confidence score', () => {
      const result = normalizeVoiceInput('Test', 0.75);
      expect(result.metadata.confidence).toBe(0.75);
    });
  });
});

describe('Language Detection', () => {
  it('should detect English', () => {
    expect(detectLanguage('I want to book a flight to London')).toBe('en');
  });

  it('should detect Portuguese', () => {
    expect(detectLanguage('Quero reservar uma passagem para Lisboa')).toBe('pt');
  });

  it('should detect Spanish', () => {
    expect(detectLanguage('Necesito un vuelo a Madrid')).toBe('es');
  });

  it('should default to English for unknown', () => {
    expect(detectLanguage('Xyz abc 123')).toBe('en');
  });
});

describe('Emotion Detection', () => {
  it('should detect neutral by default', () => {
    expect(detectEmotion('Book a flight to Paris')).toBe('neutral');
  });

  it('should detect urgency', () => {
    expect(detectEmotion('I need a flight urgently')).toBe('urgent');
    expect(detectEmotion('Quick I need to fly now')).toBe('urgent');
  });

  it('should detect frustration', () => {
    expect(detectEmotion('This is terrible I am so frustrated')).toBe('frustrated');
    expect(detectEmotion('I hate this damn website')).toBe('frustrated');
  });

  it('should detect confusion', () => {
    expect(detectEmotion("I don't understand how this works")).toBe('confused');
  });

  it('should detect happiness', () => {
    expect(detectEmotion('Thanks this is awesome')).toBe('happy');
  });

  it('should prioritize frustration over urgency', () => {
    expect(detectEmotion('I am frustrated and need help now urgently')).toBe('frustrated');
  });
});

describe('Partial Sentence Detection', () => {
  it('should detect trailing dots', () => {
    expect(isPartialSentence('I want to book...')).toBe(true);
  });

  it('should detect trailing dashes', () => {
    expect(isPartialSentence('The flight to—')).toBe(true);
  });

  it('should detect ending conjunctions', () => {
    expect(isPartialSentence('I need a flight and')).toBe(true);
    expect(isPartialSentence('Going to Paris but')).toBe(true);
  });

  it('should detect lowercase start (mid-sentence)', () => {
    expect(isPartialSentence('need to book a flight')).toBe(true);
  });

  it('should pass complete sentences', () => {
    expect(isPartialSentence('I want to book a flight to Paris')).toBe(false);
  });
});

describe('Voice Quality Assessment', () => {
  it('should mark low confidence as noisy', () => {
    const result = normalizeVoiceInput('Book flight', 0.4);
    expect(result.metadata.quality).toBe('noisy');
  });

  it('should mark partial sentences', () => {
    const result = normalizeVoiceInput('I want to go and', 0.9);
    expect(result.metadata.quality).toBe('partial');
  });

  it('should mark clear for good input', () => {
    const result = normalizeVoiceInput('I want to book a flight to London', 0.95);
    expect(result.metadata.quality).toBe('clear');
  });
});

describe('Clarification Detection', () => {
  it('should need clarification for partial input ending with conjunction', () => {
    const result = normalizeVoiceInput('I want to go and');
    expect(needsClarification(result)).toBe(true);
  });

  it('should need clarification for noisy input', () => {
    const result = normalizeVoiceInput('Flight', 0.3);
    expect(needsClarification(result)).toBe(true);
  });

  it('should need clarification for very short input', () => {
    const result = normalizeVoiceInput('Hi', 0.9);
    expect(needsClarification(result)).toBe(true);
  });

  it('should NOT need clarification for clear input', () => {
    const result = normalizeVoiceInput('I want to book a flight to Paris tomorrow', 0.95);
    expect(needsClarification(result)).toBe(false);
  });
});

describe('Clarification Prompts', () => {
  it('should return partial prompt in English', () => {
    const result = normalizeVoiceInput('I want to go and');
    const prompt = getClarificationPrompt(result, 'en');
    expect(prompt).toContain('repeat');
  });

  it('should return prompt in Portuguese', () => {
    const result = normalizeVoiceInput('Quero ir e', 0.9);
    const prompt = getClarificationPrompt(result, 'pt');
    expect(prompt.length).toBeGreaterThan(10);
  });

  it('should return prompt in Spanish', () => {
    const result = normalizeVoiceInput('Quiero ir y', 0.9);
    const prompt = getClarificationPrompt(result, 'es');
    expect(prompt.length).toBeGreaterThan(10);
  });
});

describe('Full Processing Pipeline', () => {
  it('should produce ReasoningInput from voice', () => {
    const result = processVoiceInput({
      rawTranscript: 'Um like I want to fly to Paris',
      confidence: 0.92,
      duration: 3.5,
    });

    expect(result.input.message).toBe('I want to fly to Paris');
    expect(result.input.language).toBe('en');
    expect(result.voiceMetadata.origin).toBe('voice');
    expect(result.voiceMetadata.confidence).toBe(0.92);
    expect(result.voiceMetadata.duration).toBe(3.5);
  });

  it('should preserve session state', () => {
    const result = processVoiceInput({
      rawTranscript: 'Show me flights',
      sessionState: {
        currentStage: 'NARROWING',
        collectedContext: { destination: 'Paris' },
      },
    });

    expect(result.input.sessionState?.currentStage).toBe('NARROWING');
    expect(result.input.sessionState?.collectedContext?.destination).toBe('Paris');
  });

  it('should handle Portuguese voice input', () => {
    const result = processVoiceInput({
      rawTranscript: 'Então tipo quero viajar para Lisboa',
    });

    expect(result.input.message).toBe('Quero viajar para Lisboa');
    expect(result.input.language).toBe('pt');
  });
});

describe('Edge Cases', () => {
  it('should handle empty input', () => {
    const result = normalizeVoiceInput('');
    expect(result.normalizedText).toBe('');
    expect(needsClarification(result)).toBe(true);
  });

  it('should handle only filler words', () => {
    const result = normalizeVoiceInput('Um uh er like');
    expect(result.normalizedText.length).toBeLessThan(5);
  });

  it('should handle mixed language input', () => {
    const result = normalizeVoiceInput('I want um voo para London');
    expect(result.metadata.language).toBeDefined();
  });

  it('should handle special characters', () => {
    const result = normalizeVoiceInput("Book flight for O'Brien");
    expect(result.normalizedText).toContain("O'Brien");
  });

  it('should generate warnings for issues', () => {
    const result = normalizeVoiceInput('This is terrible...', 0.4);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('confidence'))).toBe(true);
    expect(result.warnings.some(w => w.includes('frustrated'))).toBe(true);
  });
});
