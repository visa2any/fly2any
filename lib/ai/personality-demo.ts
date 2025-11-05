/**
 * Personality System Demo
 *
 * Run this file to see the personality system in action!
 * Shows dramatic before/after comparisons for all consultants.
 */

import { generateCompleteResponse, createConversationContext } from './response-generator';
import { getConsultantPersonality } from './consultant-personalities';
import type { TeamType } from './consultant-profiles';

/**
 * Demo: Show same message to all 12 consultants
 */
export function demoAllConsultants() {
  const userMessage = "Hi! How are you today?";
  const context = createConversationContext(true, 0);

  console.log('\n' + '='.repeat(80));
  console.log('DEMO: Same message to all 12 consultants');
  console.log('='.repeat(80));
  console.log(`\nUser: "${userMessage}"\n`);

  const teams: TeamType[] = [
    'customer-service',
    'flight-operations',
    'hotel-accommodations',
    'legal-compliance',
    'crisis-management',
    'payment-billing',
    'travel-insurance',
    'visa-documentation',
    'car-rental',
    'loyalty-rewards',
    'technical-support',
    'special-services',
  ];

  teams.forEach(team => {
    const personality = getConsultantPersonality(team);
    const response = generateCompleteResponse(team, userMessage, context);

    console.log(`${personality.name} (${personality.archetype}):`);
    console.log(`  ${response}`);
    console.log('');
  });
}

/**
 * Demo: Before and After for key consultants
 */
export function demoBeforeAfter() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO: Before/After Comparison');
  console.log('='.repeat(80));

  const scenarios = [
    {
      team: 'customer-service' as TeamType,
      message: "I'm frustrated with my booking!",
      before: "I understand you are frustrated. I will help you resolve this issue.",
    },
    {
      team: 'flight-operations' as TeamType,
      message: "I need a flight to Paris.",
      before: "I will search for flights to Paris for you.",
    },
    {
      team: 'crisis-management' as TeamType,
      message: "My flight was cancelled and I'm stranded!",
      before: "I will help you find an alternative flight.",
    },
    {
      team: 'legal-compliance' as TeamType,
      message: "Can I get compensation for my delay?",
      before: "You may be entitled to compensation depending on the circumstances.",
    },
  ];

  scenarios.forEach(scenario => {
    const personality = getConsultantPersonality(scenario.team);
    const context = createConversationContext(false, 2);
    const after = generateCompleteResponse(scenario.team, scenario.message, context);

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`${personality.name} (${personality.archetype})`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`\nUser: "${scenario.message}"\n`);
    console.log('❌ BEFORE (Generic):');
    console.log(`   ${scenario.before}\n`);
    console.log('✅ AFTER (Personality):');
    console.log(`   ${after}\n`);
  });
}

/**
 * Demo: Multi-turn conversation with one consultant
 */
export function demoConversation() {
  const team: TeamType = 'customer-service';
  const personality = getConsultantPersonality(team);

  console.log('\n' + '='.repeat(80));
  console.log(`DEMO: Multi-turn Conversation with ${personality.name}`);
  console.log('='.repeat(80) + '\n');

  const conversation = [
    "Hi there!",
    "How are you?",
    "I need help with my flight booking.",
    "My confirmation number is ABC123.",
    "Thank you so much for your help!",
  ];

  let conversationLength = 0;

  conversation.forEach((msg, index) => {
    const context = createConversationContext(index === 0, conversationLength++);
    const response = generateCompleteResponse(team, msg, context);

    console.log(`User: ${msg}`);
    console.log(`${personality.name}: ${response}\n`);
  });
}

/**
 * Demo: Emotion-aware responses
 */
export function demoEmotionAware() {
  const team: TeamType = 'customer-service';
  const personality = getConsultantPersonality(team);

  console.log('\n' + '='.repeat(80));
  console.log(`DEMO: Emotion-Aware Responses (${personality.name})`);
  console.log('='.repeat(80) + '\n');

  const emotions = [
    { message: "This is ridiculous! It's been 3 days!", emotion: 'Frustrated' },
    { message: "I'm so excited for my trip to Paris!", emotion: 'Excited' },
    { message: "I don't understand how this works.", emotion: 'Confused' },
    { message: "URGENT! Need help NOW!", emotion: 'Urgent' },
    { message: "Everything looks good, thanks!", emotion: 'Satisfied' },
  ];

  emotions.forEach(({ message, emotion }) => {
    const context = createConversationContext(false, 2);
    const response = generateCompleteResponse(team, message, context);

    console.log(`[${emotion}] User: ${message}`);
    console.log(`${personality.name}: ${response}\n`);
  });
}

/**
 * Demo: Compare warmth levels
 */
export function demoWarmthLevels() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO: Different Warmth Levels');
  console.log('='.repeat(80));

  const userMessage = "Thanks for your help!";
  const context = createConversationContext(false, 3);

  const consultants: Array<{ team: TeamType; warmth: string }> = [
    { team: 'customer-service', warmth: 'Very Warm (Lisa)' },
    { team: 'hotel-accommodations', warmth: 'Warm (Marcus)' },
    { team: 'flight-operations', warmth: 'Friendly (Sarah)' },
    { team: 'legal-compliance', warmth: 'Professional (Dr. Watson)' },
  ];

  console.log(`\nUser: "${userMessage}"\n`);

  consultants.forEach(({ team, warmth }) => {
    const personality = getConsultantPersonality(team);
    const response = generateCompleteResponse(team, userMessage, context);

    console.log(`${warmth}:`);
    console.log(`  ${response}\n`);
  });
}

/**
 * Demo: Compare formality levels
 */
export function demoFormalityLevels() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO: Different Formality Levels');
  console.log('='.repeat(80));

  const userMessage = "What can you help me with?";
  const context = createConversationContext(false, 1);

  const consultants: Array<{ team: TeamType; formality: string }> = [
    { team: 'legal-compliance', formality: 'Formal (Dr. Watson)' },
    { team: 'flight-operations', formality: 'Professional (Sarah)' },
    { team: 'car-rental', formality: 'Casual (James)' },
  ];

  console.log(`\nUser: "${userMessage}"\n`);

  consultants.forEach(({ team, formality }) => {
    const personality = getConsultantPersonality(team);
    const response = generateCompleteResponse(team, userMessage, context);

    console.log(`${formality}:`);
    console.log(`  ${response}\n`);
  });
}

/**
 * Demo: Terms of endearment usage
 */
export function demoTermsOfEndearment() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO: Terms of Endearment');
  console.log('='.repeat(80));

  const userMessage = "Can you help me?";
  const context = createConversationContext(false, 2);

  const consultants: TeamType[] = [
    'customer-service', // "sweetie", "hon"
    'hotel-accommodations', // "my friend", "amigo"
    'crisis-management', // "sir", "ma'am"
    'special-services', // "my dear"
  ];

  console.log(`\nUser: "${userMessage}"\n`);
  console.log('Note: Terms of endearment appear probabilistically\n');

  // Run 3 times to show variation
  for (let i = 0; i < 3; i++) {
    console.log(`\nVariation ${i + 1}:`);
    consultants.forEach(team => {
      const personality = getConsultantPersonality(team);
      const response = generateCompleteResponse(team, userMessage, context);

      console.log(`  ${personality.name}: ${response}`);
    });
  }
}

/**
 * Demo: Professional terminology
 */
export function demoProfessionalTerms() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO: Professional Terminology');
  console.log('='.repeat(80));

  const scenarios = [
    {
      team: 'flight-operations' as TeamType,
      message: "Tell me about the flight",
      terms: ['routes', 'connections', 'fare class'],
    },
    {
      team: 'legal-compliance' as TeamType,
      message: "What are my rights?",
      terms: ['regulation', 'entitled', 'statutory'],
    },
    {
      team: 'payment-billing' as TeamType,
      message: "Is my payment safe?",
      terms: ['PCI-DSS', 'encrypted', 'verified'],
    },
    {
      team: 'loyalty-rewards' as TeamType,
      message: "How can I use my points?",
      terms: ['sweet spot', 'maximize', 'redemption'],
    },
  ];

  scenarios.forEach(({ team, message, terms }) => {
    const personality = getConsultantPersonality(team);
    const context = createConversationContext(false, 1);
    const response = generateCompleteResponse(team, message, context);

    console.log(`\n${personality.name}:`);
    console.log(`  Signature terms: ${terms.join(', ')}`);
    console.log(`  User: "${message}"`);
    console.log(`  Response: ${response}`);
  });
}

/**
 * Run all demos
 */
export function runAllDemos() {
  console.clear();
  console.log('\n' + '█'.repeat(80));
  console.log('█' + ' '.repeat(78) + '█');
  console.log('█' + ' '.repeat(20) + 'CONSULTANT PERSONALITY SYSTEM DEMO' + ' '.repeat(24) + '█');
  console.log('█' + ' '.repeat(78) + '█');
  console.log('█'.repeat(80));

  demoAllConsultants();
  demoBeforeAfter();
  demoConversation();
  demoEmotionAware();
  demoWarmthLevels();
  demoFormalityLevels();
  demoTermsOfEndearment();
  demoProfessionalTerms();

  console.log('\n' + '█'.repeat(80));
  console.log('█' + ' '.repeat(78) + '█');
  console.log('█' + ' '.repeat(32) + 'DEMO COMPLETE' + ' '.repeat(33) + '█');
  console.log('█' + ' '.repeat(78) + '█');
  console.log('█'.repeat(80) + '\n');
}

// Export for command-line usage
if (require.main === module) {
  runAllDemos();
}

/**
 * Quick test function for development
 */
export function quickTest() {
  const team: TeamType = 'customer-service';
  const message = "Hi! How are you?";
  const context = createConversationContext(true, 0);

  console.log('\n=== QUICK TEST ===\n');
  console.log('User:', message);
  console.log('Lisa:', generateCompleteResponse(team, message, context));
  console.log('');
}
