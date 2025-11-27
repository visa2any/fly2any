/**
 * Duffel Token Diagnostic Script
 *
 * Run with: npx tsx scripts/check-duffel-token.ts
 */

import axios from 'axios';

async function checkDuffelToken() {
  console.log('\n🔍 DUFFEL TOKEN DIAGNOSTIC');
  console.log('='.repeat(50));

  const token = process.env.DUFFEL_ACCESS_TOKEN;

  // Check 1: Token exists
  if (!token) {
    console.log('❌ DUFFEL_ACCESS_TOKEN not found in environment');
    console.log('   Make sure it\'s set in .env.local');
    return;
  }

  console.log('\n📋 Token Analysis:');

  // Check 2: Token length
  console.log(`   Length: ${token.length} characters`);

  // Check 3: Token prefix
  const trimmedToken = token.trim();
  console.log(`   Trimmed Length: ${trimmedToken.length} characters`);
  console.log(`   Has trailing whitespace: ${token !== trimmedToken}`);

  // Check 4: Token format
  const startsWithTest = trimmedToken.startsWith('duffel_test_');
  const startsWithLive = trimmedToken.startsWith('duffel_live_');
  console.log(`   Prefix: ${trimmedToken.substring(0, 15)}...`);
  console.log(`   Is TEST token: ${startsWithTest}`);
  console.log(`   Is LIVE token: ${startsWithLive}`);

  if (!startsWithTest && !startsWithLive) {
    console.log('\n❌ ERROR: Token does not start with duffel_test_ or duffel_live_');
    console.log('   Your token might be:');
    console.log('   - Truncated (cut off during copy/paste)');
    console.log('   - A different type of credential');
    console.log('   - From a different API');
    return;
  }

  // Check 5: Hidden characters
  const hasNewline = token.includes('\n') || token.includes('\r');
  const hasTab = token.includes('\t');
  console.log(`   Contains newline: ${hasNewline}`);
  console.log(`   Contains tab: ${hasTab}`);

  if (hasNewline || hasTab) {
    console.log('\n⚠️  WARNING: Token contains hidden characters!');
    console.log('   This will cause authentication failures.');
    console.log('   Fix: Remove the token and re-paste it carefully.');
  }

  // Check 6: Test API connection
  console.log('\n🌐 Testing API Connection...');

  try {
    // Try to get airlines (a simple read-only endpoint)
    const response = await axios.get('https://api.duffel.com/air/airlines', {
      params: { limit: 1 },
      headers: {
        'Accept': 'application/json',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${trimmedToken}`,
      },
      timeout: 10000,
    });

    console.log('✅ TOKEN IS VALID!');
    console.log(`   API Response: HTTP ${response.status}`);
    console.log(`   Mode: ${startsWithTest ? 'TEST' : 'LIVE'}`);

    // Now test write access (offer request creation)
    console.log('\n🔄 Testing WRITE access...');

    const offerResponse = await axios.post(
      'https://api.duffel.com/air/offer_requests',
      {
        data: {
          slices: [{
            origin: 'JFK',
            destination: 'MIA',
            departure_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy',
        }
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Duffel-Version': 'v2',
          'Authorization': `Bearer ${trimmedToken}`,
        },
        timeout: 30000,
      }
    );

    console.log('✅ WRITE ACCESS CONFIRMED!');
    console.log(`   Offer Request ID: ${offerResponse.data.data.id}`);
    console.log(`   Live Mode: ${offerResponse.data.data.live_mode}`);

  } catch (error: any) {
    console.log('\n❌ API TEST FAILED');

    if (axios.isAxiosError(error)) {
      console.log(`   HTTP Status: ${error.response?.status}`);

      const errors = error.response?.data?.errors || [];
      if (errors.length > 0) {
        console.log('\n   Duffel Error Details:');
        errors.forEach((e: any, i: number) => {
          console.log(`   [${i + 1}] Code: ${e.code}`);
          console.log(`       Title: ${e.title}`);
          console.log(`       Message: ${e.message || 'N/A'}`);
        });

        // Specific error guidance
        const errorCode = errors[0]?.code;

        if (errorCode === 'expired_access_token') {
          console.log('\n💡 SOLUTION: Your token has expired.');
          console.log('   1. Go to https://app.duffel.com/');
          console.log('   2. Navigate to Settings → Access Tokens');
          console.log('   3. IMPORTANT: Check if you\'re in "Developer Test Mode" or "Live Mode"');
          console.log('   4. Create a NEW token (don\'t regenerate the old one)');
          console.log('   5. Make sure to select "Read-Write" scope');
          console.log('   6. Copy the ENTIRE token carefully');
          console.log('   7. Update .env.local with the new token');
        } else if (errorCode === 'unauthorized') {
          console.log('\n💡 SOLUTION: Token is invalid.');
          console.log('   - Check if you copied the entire token');
          console.log('   - Make sure there are no extra spaces');
        }
      } else {
        console.log(`   Error: ${error.message}`);
      }
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
}

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

checkDuffelToken().catch(console.error);
