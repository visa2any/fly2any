#!/usr/bin/env node

console.log('🌐 Network Connectivity Diagnostic');
console.log('==================================');

async function testConnectivity() {
  const urls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD', 
        timeout: 3000 
      });
      console.log(`✅ ${url}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
}

testConnectivity();