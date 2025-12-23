/**
 * Emotion Detection System - Test Suite
 *
 * Run with: npm test lib/ai/emotion-detection.test.ts
 * Or manually verify by running these test functions
 */

import {
  detectEmotion,
  getEmpathyMarker,
  getConsultantForEmotion,
  getEmotionVisualIndicator,
  type EmotionalState
} from './emotion-detection';

import {
  formatEmotionalResponse,
  getOpeningPhrase,
  getClosingPhrase
} from './response-templates';

import {
  processEmotionalMessage,
  analyzeUserEmotion,
  shouldEscalateToCrisis,
  getEmotionBehaviorFlags
} from './emotion-aware-assistant';

// ============================================================================
// TEST CASES FOR EMOTION DETECTION
// ============================================================================

export interface TestCase {
  message: string;
  expectedEmotion: EmotionalState;
  expectedUrgency: 'low' | 'medium' | 'high';
  minConfidence: number;
  description: string;
}

export const EMOTION_TEST_CASES: TestCase[] = [
  // URGENT CASES
  {
    message: "Help! My flight is in 2 hours and I lost my passport!",
    expectedEmotion: 'urgent',
    expectedUrgency: 'high',
    minConfidence: 0.8,
    description: 'Emergency situation with lost document'
  },
  {
    message: "URGENT - need to cancel my booking ASAP!",
    expectedEmotion: 'urgent',
    expectedUrgency: 'high',
    minConfidence: 0.8,
    description: 'Urgent cancellation request'
  },
  {
    message: "Emergency! I'm stranded at the airport!",
    expectedEmotion: 'urgent',
    expectedUrgency: 'high',
    minConfidence: 0.85,
    description: 'Airport emergency'
  },

  // FRUSTRATED CASES
  {
    message: "This is unacceptable! I've been waiting for 2 hours!",
    expectedEmotion: 'frustrated',
    expectedUrgency: 'high',
    minConfidence: 0.75,
    description: 'Customer frustration with wait time'
  },
  {
    message: "I'm so frustrated with this terrible service!",
    expectedEmotion: 'frustrated',
    expectedUrgency: 'high',
    minConfidence: 0.8,
    description: 'Direct expression of frustration'
  },
  {
    message: "What the hell is going on? This is ridiculous!",
    expectedEmotion: 'frustrated',
    expectedUrgency: 'high',
    minConfidence: 0.75,
    description: 'Angry outburst'
  },

  // WORRIED CASES
  {
    message: "I'm worried about the cancellation policy. What if I need to cancel?",
    expectedEmotion: 'worried',
    expectedUrgency: 'medium',
    minConfidence: 0.7,
    description: 'Concern about policy'
  },
  {
    message: "I'm concerned about the safety of this flight",
    expectedEmotion: 'worried',
    expectedUrgency: 'medium',
    minConfidence: 0.7,
    description: 'Safety concern'
  },
  {
    message: "What if my connecting flight gets delayed? I'm anxious about it",
    expectedEmotion: 'worried',
    expectedUrgency: 'medium',
    minConfidence: 0.7,
    description: 'Travel anxiety'
  },

  // CONFUSED CASES
  {
    message: "I don't understand how the baggage fees work. Can you explain?",
    expectedEmotion: 'confused',
    expectedUrgency: 'medium',
    minConfidence: 0.7,
    description: 'Request for explanation'
  },
  {
    message: "What does 'basic economy' mean exactly?",
    expectedEmotion: 'confused',
    expectedUrgency: 'medium',
    minConfidence: 0.65,
    description: 'Terminology confusion'
  },
  {
    message: "I'm confused about this - how do I check in?",
    expectedEmotion: 'confused',
    expectedUrgency: 'medium',
    minConfidence: 0.7,
    description: 'Process confusion'
  },

  // EXCITED CASES
  {
    message: "I'm so excited! This is going to be my dream vacation!",
    expectedEmotion: 'excited',
    expectedUrgency: 'low',
    minConfidence: 0.75,
    description: 'Vacation excitement'
  },
  {
    message: "This is amazing! Perfect timing for the sale!",
    expectedEmotion: 'excited',
    expectedUrgency: 'low',
    minConfidence: 0.75,
    description: 'Enthusiasm about deal'
  },
  {
    message: "Yay! I can't wait to book this trip!!!",
    expectedEmotion: 'excited',
    expectedUrgency: 'low',
    minConfidence: 0.75,
    description: 'Enthusiastic booking intent'
  },

  // SATISFIED CASES
  {
    message: "Thank you so much! This was exactly what I needed!",
    expectedEmotion: 'satisfied',
    expectedUrgency: 'low',
    minConfidence: 0.65,
    description: 'Gratitude expression'
  },
  {
    message: "Perfect! Great service, appreciate your help!",
    expectedEmotion: 'satisfied',
    expectedUrgency: 'low',
    minConfidence: 0.65,
    description: 'Satisfaction with service'
  },

  // CASUAL CASES
  {
    message: "Hey, just wondering if you have any deals to Paris?",
    expectedEmotion: 'casual',
    expectedUrgency: 'low',
    minConfidence: 0.55,
    description: 'Casual inquiry'
  },
  {
    message: "Hi there! Just browsing for now, lol",
    expectedEmotion: 'casual',
    expectedUrgency: 'low',
    minConfidence: 0.55,
    description: 'Casual browsing'
  },

  // NEUTRAL CASES
  {
    message: "I need a flight from NYC to Paris on May 15th",
    expectedEmotion: 'neutral',
    expectedUrgency: 'low',
    minConfidence: 0.4,
    description: 'Simple factual request'
  },
  {
    message: "What time does the flight depart?",
    expectedEmotion: 'neutral',
    expectedUrgency: 'low',
    minConfidence: 0.4,
    description: 'Information request'
  }
];

// ============================================================================
// TEST RUNNER
// ============================================================================

export function runEmotionDetectionTests(): {
  passed: number;
  failed: number;
  results: Array<{
    testCase: TestCase;
    result: 'PASS' | 'FAIL';
    detected: ReturnType<typeof detectEmotion>;
    reason?: string;
  }>;
} {
  const results: Array<{
    testCase: TestCase;
    result: 'PASS' | 'FAIL';
    detected: ReturnType<typeof detectEmotion>;
    reason?: string;
  }> = [];

  let passed = 0;
  let failed = 0;

  console.log('\n🧪 Running Emotion Detection Tests...\n');
  console.log('='.repeat(80));

  EMOTION_TEST_CASES.forEach((testCase, index) => {
    const detected = detectEmotion(testCase.message);

    let result: 'PASS' | 'FAIL' = 'PASS';
    let reason: string | undefined;

    // Check emotion match
    if (detected.emotion !== testCase.expectedEmotion) {
      result = 'FAIL';
      reason = `Expected emotion '${testCase.expectedEmotion}' but got '${detected.emotion}'`;
    }

    // Check urgency match
    else if (detected.urgency !== testCase.expectedUrgency) {
      result = 'FAIL';
      reason = `Expected urgency '${testCase.expectedUrgency}' but got '${detected.urgency}'`;
    }

    // Check minimum confidence
    else if (detected.confidence < testCase.minConfidence) {
      result = 'FAIL';
      reason = `Confidence ${detected.confidence.toFixed(2)} is below minimum ${testCase.minConfidence}`;
    }

    if (result === 'PASS') {
      passed++;
      console.log(`✅ Test ${index + 1}: PASS - ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: FAIL - ${testCase.description}`);
      console.log(`   Reason: ${reason}`);
      console.log(`   Message: "${testCase.message}"`);
      console.log(`   Detected: ${JSON.stringify(detected, null, 2)}`);
    }

    results.push({
      testCase,
      result,
      detected,
      reason
    });
  });

  console.log('='.repeat(80));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${EMOTION_TEST_CASES.length} total\n`);

  return { passed, failed, results };
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

export function testEmotionalResponseGeneration() {
  console.log('\n🔧 Testing Emotional Response Generation...\n');
  console.log('='.repeat(80));

  const testMessages = [
    "Help! My flight was cancelled!",
    "I'm confused about the refund policy",
    "I'm so excited for my trip!",
    "I need a flight to London"
  ];

  testMessages.forEach((message, index) => {
    console.log(`\nTest ${index + 1}: "${message}"`);
    console.log('-'.repeat(80));

    const response = processEmotionalMessage({
      userMessage: message,
      baseConsultantTeam: 'customer-service',
      language: 'en',
      mainContent: "I can help you with that. Let me find the best options for you."
    });

    console.log(`Detected Emotion: ${response.emotionAnalysis.emotion}`);
    console.log(`Confidence: ${(response.emotionAnalysis.confidence * 100).toFixed(1)}%`);
    console.log(`Urgency: ${response.emotionAnalysis.urgency}`);
    console.log(`Consultant: ${response.consultant.name} (${response.consultant.team})`);
    console.log(`Typing Delay: ${response.typingDelay}ms`);
    console.log(`Thinking Delay: ${response.thinkingDelay}ms`);
    console.log(`\nResponse:\n${response.content}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================================================
// ESCALATION TESTS
// ============================================================================

export function testEscalationLogic() {
  console.log('\n🚨 Testing Escalation Logic...\n');
  console.log('='.repeat(80));

  const escalationTestCases = [
    {
      message: "URGENT! Help me now!",
      shouldEscalate: true
    },
    {
      message: "I'm furious with this service!",
      shouldEscalate: true
    },
    {
      message: "I'm a bit confused",
      shouldEscalate: false
    },
    {
      message: "I need a flight to Paris",
      shouldEscalate: false
    }
  ];

  escalationTestCases.forEach((testCase, index) => {
    const emotion = analyzeUserEmotion(testCase.message);
    const willEscalate = shouldEscalateToCrisis(emotion);

    const result = willEscalate === testCase.shouldEscalate ? '✅ PASS' : '❌ FAIL';

    console.log(`${result} - "${testCase.message}"`);
    console.log(`   Emotion: ${emotion.emotion} (${(emotion.confidence * 100).toFixed(1)}%)`);
    console.log(`   Urgency: ${emotion.urgency}`);
    console.log(`   Should Escalate: ${testCase.shouldEscalate}, Will Escalate: ${willEscalate}`);
    console.log();
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================================================
// VISUAL INDICATOR TESTS
// ============================================================================

export function testVisualIndicators() {
  console.log('\n🎨 Testing Visual Indicators...\n');
  console.log('='.repeat(80));

  const emotions: EmotionalState[] = [
    'urgent',
    'frustrated',
    'worried',
    'confused',
    'excited',
    'satisfied',
    'casual',
    'neutral'
  ];

  emotions.forEach(emotion => {
    const visual = getEmotionVisualIndicator(emotion);
    console.log(`\n${emotion.toUpperCase()}:`);
    console.log(`  Background: ${visual.bgColor}`);
    console.log(`  Text: ${visual.color}`);
    console.log(`  Border: ${visual.borderColor}`);
    console.log(`  Pulse: ${visual.pulseAnimation ? 'Yes' : 'No'}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================================================
// MULTILINGUAL TESTS
// ============================================================================

export function testMultilingualResponses() {
  console.log('\n🌍 Testing Multilingual Responses...\n');
  console.log('='.repeat(80));

  const message = "I'm frustrated with this!";
  const languages: Array<'en' | 'pt' | 'es'> = ['en', 'pt', 'es'];

  languages.forEach(lang => {
    console.log(`\n${lang.toUpperCase()}:`);
    console.log('-'.repeat(80));

    const empathy = getEmpathyMarker('frustrated', lang);
    console.log(`Empathy: ${empathy}`);

    const opening = getOpeningPhrase('frustrated', lang);
    console.log(`Opening: ${opening}`);

    const closing = getClosingPhrase('frustrated', lang);
    console.log(`Closing: ${closing}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================================================
// BEHAVIOR FLAGS TESTS
// ============================================================================

export function testBehaviorFlags() {
  console.log('\n⚙️  Testing Behavior Flags...\n');
  console.log('='.repeat(80));

  const testCases = [
    { message: "Help urgently!", emotion: 'urgent' },
    { message: "I'm confused", emotion: 'confused' },
    { message: "I'm excited!", emotion: 'excited' }
  ];

  testCases.forEach(({ message, emotion }) => {
    const analysis = analyzeUserEmotion(message);
    const flags = getEmotionBehaviorFlags(analysis);

    console.log(`\n${message} (${emotion}):`);
    console.log(`  Use Bullet Points: ${flags.useBulletPoints}`);
    console.log(`  Use Exclamation: ${flags.useExclamation}`);
    console.log(`  Detailed Explanation: ${flags.provideDetailedExplanation}`);
    console.log(`  Immediate Action: ${flags.focusOnImmediateAction}`);
    console.log(`  Offer Reassurance: ${flags.offerReassurance}`);
    console.log(`  Match Enthusiasm: ${flags.matchEnthusiasm}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('EMOTION DETECTION SYSTEM - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(80));

  runEmotionDetectionTests();
  testEmotionalResponseGeneration();
  testEscalationLogic();
  testVisualIndicators();
  testMultilingualResponses();
  testBehaviorFlags();

  console.log('='.repeat(80));
  console.log('ALL TESTS COMPLETE');
  console.log('='.repeat(80) + '\n');
}

// ============================================================================
// JEST TEST SUITE
// ============================================================================

describe('Emotion Detection System', () => {
  describe('detectEmotion', () => {
    test('should detect urgent emotions', () => {
      const result = detectEmotion('Help! My flight is in 2 hours and I lost my passport!');
      expect(result.emotion).toBe('urgent');
      expect(result.urgency).toBe('high');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect frustrated emotions', () => {
      const result = detectEmotion("This is unacceptable! I've been waiting for 2 hours!");
      expect(result.emotion).toBe('frustrated');
      expect(result.urgency).toBe('high');
    });

    test('should detect worried emotions', () => {
      const result = detectEmotion("I'm worried about the cancellation policy");
      expect(result.emotion).toBe('worried');
      expect(result.urgency).toBe('medium');
    });

    test('should detect neutral emotions', () => {
      const result = detectEmotion('I need a flight from NYC to Paris');
      expect(result.emotion).toBe('neutral');
      expect(result.urgency).toBe('low');
    });
  });

  describe('getEmpathyMarker', () => {
    test('should return empathy marker for urgent emotion', () => {
      const marker = getEmpathyMarker('urgent', 'en');
      expect(marker).toBeTruthy();
      expect(typeof marker).toBe('string');
    });
  });

  describe('getEmotionVisualIndicator', () => {
    test('should return visual indicator for each emotion', () => {
      const emotions: EmotionalState[] = ['urgent', 'frustrated', 'neutral'];
      emotions.forEach(emotion => {
        const indicator = getEmotionVisualIndicator(emotion);
        expect(indicator).toHaveProperty('bgColor');
        expect(indicator).toHaveProperty('color');
      });
    });
  });

  describe('processEmotionalMessage', () => {
    test('should process emotional message and return response', () => {
      const response = processEmotionalMessage({
        userMessage: 'Help! My flight was cancelled!',
        baseConsultantTeam: 'customer-service',
        language: 'en',
        mainContent: 'I can help you with that.'
      });
      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('emotionAnalysis');
      expect(response).toHaveProperty('consultant');
    });
  });
});

// Export test functions for manual execution
export {
  runEmotionDetectionTests,
  testEmotionalResponseGeneration,
  testEscalationLogic,
  testVisualIndicators,
  testMultilingualResponses,
  testBehaviorFlags,
  runAllTests
};
