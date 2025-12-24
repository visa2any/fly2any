/**
 * Voice Output Layer Tests
 *
 * Validates: Stage rules, Content filtering, Tone mapping, Fallbacks
 */

import {
  formatForVoice,
  prepareVoiceOutput,
  shouldUseVoice,
  getVoiceLanguageCode,
} from '../voice-output';
import type { ReasoningOutput, ConversationStage } from '../reasoning-layer';

// Helper to create mock reasoning output
function mockReasoning(stage: ConversationStage, tone = 'professional'): ReasoningOutput {
  return {
    interpreted_intent: 'test',
    confidence_level: 'high',
    chaos_classification: 'CLEAR_INTENT',
    conversation_stage: stage,
    stage_actions: [],
    stage_forbidden: [],
    missing_context: [],
    recommended_primary_agent: 'flights',
    recommended_secondary_agent: null,
    response_strategy: 'direct',
    clarifying_questions: [],
    tone_guidance: tone,
    allowed_actions: [],
    forbidden_actions: [],
    conversion_hint: null,
    risk_flags: [],
  };
}

describe('Voice Output Formatting', () => {
  describe('Content Cleaning', () => {
    it('should remove markdown formatting', () => {
      const result = formatForVoice(
        'Here are **great** options for your *trip*',
        'DISCOVERY'
      );
      expect(result.text).not.toContain('**');
      expect(result.text).not.toContain('*');
      expect(result.text).toContain('great');
    });

    it('should remove URLs', () => {
      const result = formatForVoice(
        'Check details at https://fly2any.com/flights',
        'DISCOVERY'
      );
      expect(result.text).not.toContain('https://');
      expect(result.text).not.toContain('fly2any.com');
    });

    it('should clean code backticks', () => {
      const result = formatForVoice(
        'Use code `SUMMER20` for discount',
        'READY_TO_SEARCH'
      );
      expect(result.text).not.toContain('`');
      expect(result.text).toContain('SUMMER20');
    });
  });

  describe('Price Filtering by Stage', () => {
    it('should remove prices in DISCOVERY stage', () => {
      const result = formatForVoice(
        'Flights start from $299 USD',
        'DISCOVERY'
      );
      expect(result.text).not.toContain('$299');
      expect(result.text).toContain('[price available on screen]');
    });

    it('should remove prices in NARROWING stage', () => {
      const result = formatForVoice(
        'Great deal at $450.00!',
        'NARROWING'
      );
      expect(result.text).not.toContain('$450');
    });

    it('should ALLOW prices in READY_TO_SEARCH stage', () => {
      const result = formatForVoice(
        'Flights from $299 USD available',
        'READY_TO_SEARCH'
      );
      expect(result.text).toContain('$299');
    });

    it('should ALLOW prices in READY_TO_BOOK stage', () => {
      const result = formatForVoice(
        'Your total is $599.00',
        'READY_TO_BOOK'
      );
      expect(result.text).toContain('$599');
    });
  });

  describe('Legal Content Filtering', () => {
    it('should remove legal terms in early stages', () => {
      const result = formatForVoice(
        'Please review our terms and conditions',
        'DISCOVERY'
      );
      expect(result.text).not.toContain('terms');
      expect(result.text).not.toContain('conditions');
    });

    it('should remove policy mentions in booking stage', () => {
      const result = formatForVoice(
        'Check our cancellation policy before booking',
        'READY_TO_BOOK'
      );
      expect(result.text).not.toContain('cancellation policy');
    });

    it('should ALLOW legal in POST_BOOKING (escalation)', () => {
      const result = formatForVoice(
        'Here is our refund policy information',
        'POST_BOOKING'
      );
      expect(result.text).toContain('refund policy');
    });
  });

  describe('Length Shortening', () => {
    it('should shorten long responses for DISCOVERY', () => {
      const longText = 'This is a great destination. '.repeat(20);
      const result = formatForVoice(longText, 'DISCOVERY');
      expect(result.text.length).toBeLessThanOrEqual(155);
    });

    it('should preserve complete sentences when possible', () => {
      const text = 'Paris is beautiful. The weather is great. Many attractions await.';
      const result = formatForVoice(text, 'DISCOVERY');
      expect(result.text).toMatch(/\.$/);
    });
  });
});

describe('Tone and Emotion Mapping', () => {
  it('should set empathetic tone for frustrated users', () => {
    const result = formatForVoice(
      'I understand your concern',
      'DISCOVERY',
      { emotion: 'frustrated' }
    );
    expect(result.config.tone).toBe('empathetic');
    expect(result.config.speed).toBe('slow');
  });

  it('should set urgent tone for urgent users', () => {
    const result = formatForVoice(
      'Let me help you quickly',
      'DISCOVERY',
      { emotion: 'urgent' }
    );
    expect(result.config.tone).toBe('urgent');
    expect(result.config.speed).toBe('fast');
  });

  it('should set calm tone for confused users', () => {
    const result = formatForVoice(
      'Let me explain step by step',
      'DISCOVERY',
      { emotion: 'confused' }
    );
    expect(result.config.tone).toBe('calm');
    expect(result.config.speed).toBe('slow');
  });

  it('should use warm tone for happy users', () => {
    const result = formatForVoice(
      'Great choice!',
      'DISCOVERY',
      { emotion: 'happy' }
    );
    expect(result.config.tone).toBe('warm');
  });

  it('should use professional as default when no emotion', () => {
    const result = formatForVoice('Hello traveler welcome', 'DISCOVERY');
    expect(result.config.tone).toBe('professional');
  });
});

describe('SSML Generation', () => {
  it('should generate valid SSML structure', () => {
    const result = formatForVoice('Hello traveler', 'DISCOVERY');
    expect(result.ssml).toContain('<speak>');
    expect(result.ssml).toContain('</speak>');
    expect(result.ssml).toContain('<prosody');
  });

  it('should adjust rate for urgent emotion', () => {
    const result = formatForVoice('Quick help', 'DISCOVERY', { emotion: 'urgent' });
    expect(result.ssml).toContain('rate="110%"');
  });

  it('should adjust pitch for happy emotion', () => {
    const result = formatForVoice('Great news!', 'DISCOVERY', { emotion: 'happy' });
    expect(result.ssml).toContain('pitch="+5%"');
  });
});

describe('prepareVoiceOutput', () => {
  it('should prepare complete voice output', () => {
    const reasoning = mockReasoning('DISCOVERY');
    const result = prepareVoiceOutput('Welcome to Fly2Any!', reasoning);

    expect(result.success).toBe(true);
    expect(result.spokenText).toBe('Welcome to Fly2Any!');
    expect(result.originalText).toBe('Welcome to Fly2Any!');
    expect(result.duration).toBeGreaterThan(0);
  });

  it('should apply emotion from user input', () => {
    const reasoning = mockReasoning('DISCOVERY');
    const result = prepareVoiceOutput('I will help you', reasoning, 'frustrated');

    expect(result.config.tone).toBe('empathetic');
    expect(result.config.speed).toBe('slow');
  });

  it('should fail for empty content', () => {
    const reasoning = mockReasoning('DISCOVERY');
    const result = prepareVoiceOutput('Hi', reasoning);

    expect(result.success).toBe(false);
    expect(result.fallbackReason).toContain('too short');
  });

  it('should estimate duration based on word count', () => {
    const reasoning = mockReasoning('DISCOVERY');
    const text = 'This is a test sentence with exactly ten words here.';
    const result = prepareVoiceOutput(text, reasoning);

    expect(result.duration).toBeGreaterThan(0);
    expect(result.duration).toBeLessThan(10);
  });
});

describe('shouldUseVoice', () => {
  it('should return false for very long responses', () => {
    expect(shouldUseVoice('DISCOVERY', false, 600)).toBe(false);
  });

  it('should return false for complex booking content', () => {
    expect(shouldUseVoice('READY_TO_BOOK', true, 200)).toBe(false);
  });

  it('should return true for normal responses', () => {
    expect(shouldUseVoice('DISCOVERY', false, 150)).toBe(true);
  });

  it('should return true for POST_BOOKING even with complexity', () => {
    expect(shouldUseVoice('POST_BOOKING', true, 200)).toBe(true);
  });
});

describe('getVoiceLanguageCode', () => {
  it('should map English', () => {
    expect(getVoiceLanguageCode('en')).toBe('en-US');
    expect(getVoiceLanguageCode('en-GB')).toBe('en-US');
  });

  it('should map Portuguese', () => {
    expect(getVoiceLanguageCode('pt')).toBe('pt-BR');
    expect(getVoiceLanguageCode('pt-PT')).toBe('pt-BR');
  });

  it('should map Spanish', () => {
    expect(getVoiceLanguageCode('es')).toBe('es-ES');
  });

  it('should default to en-US for unknown', () => {
    expect(getVoiceLanguageCode('xyz')).toBe('en-US');
  });
});

describe('Canspeak Validation', () => {
  it('should mark speakable for valid text', () => {
    const result = formatForVoice('Welcome to our service', 'DISCOVERY');
    expect(result.canSpeak).toBe(true);
  });

  it('should block very short text', () => {
    const result = formatForVoice('Hi', 'DISCOVERY');
    expect(result.canSpeak).toBe(false);
    expect(result.blockReason).toContain('too short');
  });

  it('should block empty after filtering', () => {
    const result = formatForVoice('   ', 'DISCOVERY');
    expect(result.canSpeak).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('should handle mixed prices and text', () => {
    const result = formatForVoice(
      'Great flights from $199 to $599 available now',
      'DISCOVERY'
    );
    expect(result.text).not.toMatch(/\$\d+/);
    expect(result.text).toContain('available');
  });

  it('should handle multiple URLs', () => {
    const result = formatForVoice(
      'See https://a.com and https://b.com for details',
      'DISCOVERY'
    );
    expect(result.text).not.toContain('https');
  });

  it('should handle special characters', () => {
    const result = formatForVoice(
      "O'Hare to São Paulo flight",
      'DISCOVERY'
    );
    expect(result.text).toContain("O'Hare");
    expect(result.text).toContain('São Paulo');
  });

  it('should handle currency variations', () => {
    const result = formatForVoice(
      'From 299 USD or 280 euros or 1500 reais',
      'DISCOVERY'
    );
    expect(result.text).not.toContain('299');
    expect(result.text).not.toContain('280');
    expect(result.text).not.toContain('1500');
  });
});
