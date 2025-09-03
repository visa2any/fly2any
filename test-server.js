/**
 * 🚀 Simple HTTP Server for Testing Hero Component
 * ULTRATHINK: Bypass Next.js completely to test React fiber issues
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
  console.log(`🔍 Request: ${req.method} ${req.url}`);

  // Serve the standalone hero test
  if (req.url === '/' || req.url === '/hero-test') {
    const filePath = path.join(__dirname, 'public', 'hero-test-standalone.html');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('✅ Test server running!');
  console.log(`🔗 Hero test: http://localhost:${PORT}/hero-test`);
  console.log(`🔗 Direct URL: http://localhost:${PORT}/`);
  console.log('');
  console.log('🧪 This server bypasses Next.js to test React fiber errors');
  console.log('📝 Open the URL above to test the hero section');
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});