#!/usr/bin/env node

/**
 * Test script to verify if Amadeus detailed-fare-rules API is working
 * and returning real fare rules data
 */

const https = require('https');
const querystring = require('querystring');

// Load environment variables
require('dotenv').config();

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;
const BASE_URL = 'https://test.api.amadeus.com';

console.log('🧪 Testing Amadeus detailed-fare-rules API...\n');

if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
  console.error('❌ AMADEUS_API_KEY and AMADEUS_API_SECRET must be set in .env file');
  process.exit(1);
}

// Step 1: Get access token
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: AMADEUS_API_KEY,
      client_secret: AMADEUS_API_SECRET
    });

    const options = {
      hostname: 'test.api.amadeus.com',
      port: 443,
      path: '/v1/security/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            console.log('✅ Access token obtained');
            resolve(response.access_token);
          } else {
            reject(new Error('No access token in response'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 2: Search for flights
async function searchFlights(accessToken) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      originLocationCode: 'NYC',
      destinationLocationCode: 'GRU', 
      departureDate: '2025-02-15',
      adults: '1',
      max: '3'
    });

    const options = {
      hostname: 'test.api.amadeus.com',
      port: 443,
      path: `/v1/shopping/flight-offers?${params}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data && response.data.length > 0) {
            console.log(`✅ Found ${response.data.length} flight offers`);
            resolve(response.data[0]); // Return first offer for pricing
          } else {
            reject(new Error('No flight offers found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Step 3: Get detailed fare rules using Flight Offers Price API
async function getDetailedFareRules(accessToken, flightOffer) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      data: {
        type: 'flight-offers-pricing',
        flightOffers: [flightOffer]
      }
    });

    const options = {
      hostname: 'test.api.amadeus.com',
      port: 443,
      path: '/v1/shopping/flight-offers/pricing?include=detailed-fare-rules',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n📋 DETAILED FARE RULES RESPONSE:');
          console.log('=====================================');
          
          if (response.data && response.data.flightOffers) {
            const offer = response.data.flightOffers[0];
            
            // Check for detailed fare rules
            if (offer.detailedFareRules) {
              console.log('🎯 DETAILED FARE RULES FOUND:');
              console.log(JSON.stringify(offer.detailedFareRules, null, 2));
            } else {
              console.log('⚠️ No detailedFareRules field in response');
            }
            
            // Check pricing options for basic fare info
            if (offer.pricingOptions) {
              console.log('\n💰 PRICING OPTIONS:');
              console.log(JSON.stringify(offer.pricingOptions, null, 2));
            }
            
            // Check traveler pricing for fare details
            if (offer.travelerPricings) {
              console.log('\n👥 TRAVELER PRICING DETAILS:');
              offer.travelerPricings.forEach((tp, i) => {
                console.log(`Traveler ${i + 1}:`);
                if (tp.fareDetailsBySegment) {
                  tp.fareDetailsBySegment.forEach((segment, j) => {
                    console.log(`  Segment ${j + 1}:`);
                    console.log(`    - Fare Basis: ${segment.fareBasis || 'N/A'}`);
                    console.log(`    - Cabin: ${segment.cabin || 'N/A'}`);
                    console.log(`    - Class: ${segment.class || 'N/A'}`);
                    console.log(`    - Branded Fare: ${segment.brandedFare || 'N/A'}`);
                    if (segment.includedCheckedBags) {
                      console.log(`    - Checked Bags: ${segment.includedCheckedBags.quantity || 0} x ${segment.includedCheckedBags.weight || 'N/A'}${segment.includedCheckedBags.weightUnit || ''}`);
                    }
                  });
                }
              });
            }
            
            resolve(response);
          } else {
            reject(new Error('Invalid response format'));
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Main test function
async function runTest() {
  try {
    console.log('1️⃣ Getting access token...');
    const accessToken = await getAccessToken();
    
    console.log('\n2️⃣ Searching for flights...');
    const flightOffer = await searchFlights(accessToken);
    
    console.log('\n3️⃣ Getting detailed fare rules...');
    await getDetailedFareRules(accessToken, flightOffer);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();