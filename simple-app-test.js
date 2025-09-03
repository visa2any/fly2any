const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 SIMPLE APPLICATION TEST');
console.log('==========================');

// Test if we can start a basic server
async function testBasicApp() {
  console.log('1️⃣ Testing basic Next.js compilation...');
  
  return new Promise((resolve) => {
    // Try to start the server with more verbose output
    const server = spawn('npx', ['next', 'dev', '--port', '3002'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let output = '';
    let hasError = false;

    server.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('📤 STDOUT:', text.trim());
      
      // Check for successful startup indicators
      if (text.includes('ready') || text.includes('Ready') || text.includes('started server')) {
        console.log('✅ Server appears to be starting successfully');
        setTimeout(() => {
          server.kill();
          resolve({ success: true, output });
        }, 3000);
      }
    });

    server.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('📥 STDERR:', text.trim());
      
      if (text.includes('error') || text.includes('Error') || text.includes('failed')) {
        hasError = true;
      }
    });

    server.on('close', (code) => {
      console.log(`🔚 Server process closed with code: ${code}`);
      resolve({ 
        success: code === 0 && !hasError, 
        output, 
        exitCode: code,
        hasError 
      });
    });

    server.on('error', (error) => {
      console.log('💥 Server startup error:', error.message);
      resolve({ 
        success: false, 
        output: output + error.message, 
        error: error.message 
      });
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      console.log('⏱️ Test timeout reached');
      server.kill();
      resolve({ 
        success: false, 
        output: output + 'TIMEOUT', 
        timeout: true 
      });
    }, 30000);
  });
}

// Test basic HTTP connectivity
async function testHTTPConnectivity() {
  console.log('2️⃣ Testing HTTP connectivity...');
  
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Test Server Working</h1>');
    });
    
    server.listen(3003, (err) => {
      if (err) {
        console.log('❌ HTTP test failed:', err.message);
        resolve({ success: false, error: err.message });
      } else {
        console.log('✅ Basic HTTP server working on port 3003');
        server.close();
        resolve({ success: true });
      }
    });
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting application diagnosis...\n');
  
  // Test 1: HTTP connectivity
  const httpTest = await testHTTPConnectivity();
  console.log('HTTP Test Result:', httpTest.success ? '✅ PASS' : '❌ FAIL');
  
  // Test 2: Next.js app
  const appTest = await testBasicApp();
  console.log('Next.js Test Result:', appTest.success ? '✅ PASS' : '❌ FAIL');
  
  console.log('\n📋 DIAGNOSIS SUMMARY');
  console.log('==================');
  
  if (httpTest.success && appTest.success) {
    console.log('🟢 APPLICATION STATUS: Ready for testing');
  } else if (httpTest.success && !appTest.success) {
    console.log('🟡 APPLICATION STATUS: Network OK, Next.js has issues');
    console.log('🔧 RECOMMENDATION: Check Next.js configuration and dependencies');
  } else {
    console.log('🔴 APPLICATION STATUS: Critical issues detected');
    console.log('🔧 RECOMMENDATION: Check system configuration and ports');
  }
  
  if (appTest.output) {
    console.log('\n📝 DETAILED OUTPUT:');
    console.log(appTest.output);
  }
  
  return {
    httpWorking: httpTest.success,
    nextjsWorking: appTest.success,
    canProceedWithTesting: httpTest.success,
    output: appTest.output
  };
}

if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };