/**
 * Test AI imports to isolate what's causing the timeout
 */

console.log('Testing AI imports...');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Add timeout to each test
const testWithTimeout = async (name, importFn, timeoutMs = 10000) => {
  console.log(`Testing ${name}...`);
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`${name} import timed out`)), timeoutMs)
  );
  
  try {
    await Promise.race([importFn(), timeoutPromise]);
    console.log(`✅ ${name} imported successfully`);
  } catch (error) {
    console.log(`❌ ${name} failed:`, error.message);
  }
};

// Test each AI component separately
await testWithTimeout('UnifiedAIOrchestrator', () => import('./src/lib/ai/unified-ai-orchestrator.ts'));
await testWithTimeout('GPT4TravelAssistant', () => import('./src/lib/ai/gpt4-travel-assistant.ts'));
await testWithTimeout('AdvancedPricePredictor', () => import('./src/lib/ai/advanced-price-predictor.ts'));
await testWithTimeout('IntelligentAutomation', () => import('./src/lib/ai/intelligent-automation.ts'));
await testWithTimeout('UnifiedAIAssistant', () => import('./src/lib/chat/unified-ai-assistant.ts'));

console.log('AI import tests completed.');