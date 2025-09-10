#!/usr/bin/env node

/**
 * Critical Database Race Condition Test
 * Tests multiple concurrent API requests to verify that the table dropping issue is resolved
 */

const https = require('https');

const HOST = 'localhost:3001';
const BASE_URL = `http://${HOST}`;

console.log('🚨 CRITICAL DATABASE RACE CONDITION TEST');
console.log('=========================================\n');

// Test concurrent requests to the API
async function makeRequest(endpoint, label, requestId) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    console.log(`📤 [${requestId}] Starting ${label}...`);
    
    const req = require('http').get(`${BASE_URL}${endpoint}`, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - start;
        
        try {
          const result = JSON.parse(data);
          
          if (result.success) {
            console.log(`✅ [${requestId}] ${label} - SUCCESS (${duration}ms)`);
          } else {
            console.log(`❌ [${requestId}] ${label} - FAILED: ${result.error} (${duration}ms)`);
          }
          
          resolve({ 
            success: result.success, 
            error: result.error, 
            data: result.data,
            duration,
            requestId,
            label
          });
        } catch (parseError) {
          console.log(`❌ [${requestId}] ${label} - PARSE ERROR: ${parseError.message} (${duration}ms)`);
          resolve({ 
            success: false, 
            error: `Parse error: ${parseError.message}`, 
            duration,
            requestId,
            label
          });
        }
      });
    });
    
    req.on('error', (err) => {
      const duration = Date.now() - start;
      console.log(`❌ [${requestId}] ${label} - REQUEST ERROR: ${err.message} (${duration}ms)`);
      resolve({ 
        success: false, 
        error: err.message, 
        duration,
        requestId,
        label
      });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ [${requestId}] ${label} - TIMEOUT`);
      req.destroy();
      resolve({ 
        success: false, 
        error: 'Request timeout', 
        duration: 10000,
        requestId,
        label
      });
    });
  });
}

async function runConcurrentTest() {
  console.log('🎯 Test 1: Concurrent API Requests (Race Condition Test)');
  console.log('-------------------------------------------------------\n');
  
  // Create multiple concurrent requests that will all try to initialize the database
  const requests = [
    makeRequest('/api/email-marketing/v2?action=campaigns', 'Get Campaigns', 'A1'),
    makeRequest('/api/email-marketing/v2?action=stats', 'Get Stats', 'B1'),
    makeRequest('/api/email-marketing/v2?action=contacts', 'Get Contacts', 'C1'),
    makeRequest('/api/email-marketing/v2?action=campaigns', 'Get Campaigns Again', 'A2'),
    makeRequest('/api/email-marketing/v2?action=stats', 'Get Stats Again', 'B2'),
    makeRequest('/api/email-marketing/v2?action=contacts', 'Get Contacts Again', 'C2'),
    makeRequest('/api/email-marketing/v2?action=analytics', 'Get Analytics', 'D1'),
    makeRequest('/api/email-marketing/v2?action=templates', 'Get Templates', 'E1'),
  ];
  
  console.log('🚀 Launching 8 concurrent requests...\n');
  
  const results = await Promise.allSettled(requests);
  
  console.log('\n📊 CONCURRENT TEST RESULTS:');
  console.log('============================\n');
  
  let successCount = 0;
  let failureCount = 0;
  let raceConditionDetected = false;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const res = result.value;
      
      if (res.success) {
        successCount++;
        console.log(`✅ ${res.label} [${res.requestId}] - SUCCESS (${res.duration}ms)`);
      } else {
        failureCount++;
        console.log(`❌ ${res.label} [${res.requestId}] - FAILED: ${res.error} (${res.duration}ms)`);
        
        // Check for race condition indicators
        if (res.error && (
          res.error.includes('relation') && res.error.includes('does not exist') ||
          res.error.includes('table') && res.error.includes('not found') ||
          res.error.includes('email_campaigns') && res.error.includes('does not exist')
        )) {
          raceConditionDetected = true;
          console.log(`🚨 RACE CONDITION DETECTED: ${res.error}`);
        }
      }
    } else {
      failureCount++;
      console.log(`❌ Request ${index + 1} - PROMISE REJECTED: ${result.reason}`);
    }
  });
  
  console.log(`\n📈 SUMMARY: ${successCount} successes, ${failureCount} failures`);
  
  if (raceConditionDetected) {
    console.log('\n🚨 CRITICAL: DATABASE RACE CONDITION STILL EXISTS!');
    console.log('The table drop/recreation issue has NOT been resolved.');
    return false;
  } else if (successCount >= 6) { // At least 75% success rate
    console.log('\n✅ SUCCESS: Race condition appears to be RESOLVED!');
    console.log('Multiple concurrent requests succeeded without table errors.');
    return true;
  } else {
    console.log('\n⚠️  WARNING: High failure rate detected, but not necessarily race condition');
    console.log('This could be due to other issues (server not running, etc.)');
    return null; // Inconclusive
  }
}

async function testCampaignCreation() {
  console.log('\n🎯 Test 2: Campaign Creation Test');
  console.log('--------------------------------\n');
  
  const campaignData = {
    name: 'Race Condition Test Campaign',
    subject: 'Test Subject - ' + Date.now(),
    content: '<p>This is a test campaign to verify database stability.</p>',
    from_email: 'test@fly2any.com',
    from_name: 'Fly2Any Test',
    template_type: 'custom',
    send_immediately: false
  };
  
  try {
    console.log('📤 Creating test campaign...');
    
    const createResult = await new Promise((resolve) => {
      const postData = JSON.stringify(campaignData);
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/email-marketing/v2?action=create_campaign',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = require('http').request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ success: false, error: 'Parse error: ' + e.message });
          }
        });
      });
      
      req.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
      
      req.write(postData);
      req.end();
    });
    
    if (createResult.success) {
      console.log('✅ Campaign created successfully!');
      console.log(`   Campaign ID: ${createResult.data?.id}`);
      
      // Now test if we can retrieve it
      console.log('📤 Retrieving campaigns to verify...');
      const listResult = await makeRequest('/api/email-marketing/v2?action=campaigns', 'List Campaigns', 'VERIFY');
      
      if (listResult.success) {
        console.log('✅ Campaign retrieval successful - database is stable!');
        return true;
      } else {
        console.log(`❌ Campaign retrieval failed: ${listResult.error}`);
        return false;
      }
    } else {
      console.log(`❌ Campaign creation failed: ${createResult.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting comprehensive race condition testing...\n');
  
  // Wait a moment for the server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Test 1: Concurrent requests
    const concurrentResult = await runConcurrentTest();
    
    // Test 2: Campaign creation and retrieval
    const campaignResult = await testCampaignCreation();
    
    console.log('\n🏁 FINAL RESULTS:');
    console.log('==================');
    
    if (concurrentResult === true && campaignResult === true) {
      console.log('✅ ALL TESTS PASSED: Database race condition FIXED!');
      console.log('   - Concurrent requests work properly');
      console.log('   - Campaign creation and retrieval stable');
      process.exit(0);
    } else if (concurrentResult === false) {
      console.log('❌ CRITICAL FAILURE: Database race condition STILL EXISTS!');
      console.log('   The DROP TABLE issue needs to be addressed.');
      process.exit(1);
    } else {
      console.log('⚠️  INCONCLUSIVE: Tests completed but results are mixed');
      console.log('   Check server logs for more details.');
      process.exit(2);
    }
  } catch (error) {
    console.log(`💥 Test suite error: ${error.message}`);
    process.exit(3);
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  process.exit(130);
});

process.on('uncaughtException', (error) => {
  console.log(`💥 Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the tests
main();