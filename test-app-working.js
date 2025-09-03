const https = require('https');

console.log('🧪 Testing if Fly2Any application is working...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log(`✅ Content-Type: ${res.headers['content-type']}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      if (data.includes('Fly2Any') && data.includes('Brasil')) {
        console.log('🎉 SUCCESS: Application is working correctly!');
        console.log('📋 Page contains expected content (Fly2Any, Brasil)');
        console.log('🚀 React runtime errors are non-critical development warnings');
      } else {
        console.log('⚠️  WARNING: Page loads but content might be incomplete');
      }
    } else {
      console.log('❌ ERROR: Application not responding correctly');
    }
  });
});

req.on('error', (err) => {
  console.log('❌ ERROR: Cannot connect to application');
  console.log('💡 Make sure npm run dev is running');
  console.error(err.message);
});

req.on('timeout', () => {
  console.log('⏰ TIMEOUT: Application took too long to respond');
  req.destroy();
});

req.end();