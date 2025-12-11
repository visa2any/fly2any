/**
 * Fly2Any Airline Data Sync Script
 * Run with: npx tsx scripts/sync-airlines.ts
 */

import { syncStaticAirlineData } from '../lib/airlines/airline-data-service';
import { generateAllAirlineKnowledge } from '../lib/airlines/airline-knowledge-base';

async function main() {
  console.log('🚀 Starting Airline Data Sync...\n');

  try {
    // Step 1: Sync static airline data
    console.log('📦 Syncing static airline data from lib/flights/airline-data.ts...');
    const syncResult = await syncStaticAirlineData();
    console.log(`   ✅ Created: ${syncResult.created}`);
    console.log(`   ✅ Updated: ${syncResult.updated}`);
    if (syncResult.failed > 0) {
      console.log(`   ⚠️  Failed: ${syncResult.failed}`);
    }

    // Step 2: Generate knowledge base
    console.log('\n🧠 Generating ML knowledge base entries...');
    const kbResult = await generateAllAirlineKnowledge();
    console.log(`   ✅ Processed: ${kbResult.processed} airlines`);
    console.log(`   ✅ Entries: ${kbResult.entries} knowledge entries`);

    console.log('\n✨ Airline Data Sync Complete!');
  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  }
}

main();
