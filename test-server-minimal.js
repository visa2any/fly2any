const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Create Next.js app
const app = next({ 
  dev, 
  hostname, 
  port,
  // Minimal configuration to avoid complex webpack issues
  experimental: {},
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
});
const handle = app.getRequestHandler();

async function startServer() {
  try {
    console.log('🚀 Preparing Next.js app...');
    await app.prepare();
    console.log('✅ Next.js app prepared successfully');
    
    createServer(async (req, res) => {
      try {
        console.log(`📥 Request: ${req.method} ${req.url}`);
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('❌ Request error:', err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    })
    .once('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🌟 Server ready on http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();