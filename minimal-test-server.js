const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a minimal layout for testing
const minimalLayout = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fly2Any Test",
  description: "Testing minimal setup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}`;

// Create a minimal page for testing
const minimalPage = `export default function Home() {
  return (
    <div>
      <h1>Minimal Test Page</h1>
      <p>Testing basic Next.js functionality</p>
    </div>
  );
}`;

// Create a minimal next.config.js
const minimalConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Let's see TypeScript errors
  },
}

module.exports = nextConfig`;

async function createMinimalTest() {
  console.log('🧪 Creating minimal test environment...');
  
  // Backup existing files
  if (fs.existsSync('src/app/layout.tsx')) {
    fs.copyFileSync('src/app/layout.tsx', 'src/app/layout.tsx.backup-minimal');
    console.log('📦 Backed up layout.tsx');
  }
  
  if (fs.existsSync('src/app/page.tsx')) {
    fs.copyFileSync('src/app/page.tsx', 'src/app/page.tsx.backup-minimal');
    console.log('📦 Backed up page.tsx');
  }
  
  if (fs.existsSync('next.config.js')) {
    fs.copyFileSync('next.config.js', 'next.config.js.backup-minimal');
    console.log('📦 Backed up next.config.js');
  }
  
  // Create minimal files
  fs.writeFileSync('src/app/layout.tsx', minimalLayout);
  fs.writeFileSync('src/app/page.tsx', minimalPage);
  fs.writeFileSync('next.config.js', minimalConfig);
  
  console.log('✅ Created minimal test files');
  
  // Start server
  console.log('🚀 Starting minimal test server...');
  
  const serverProcess = spawn('npx', ['next', 'dev', '--port', '3001'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' }
  });
  
  let hasStarted = false;
  let hasError = false;
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📡 SERVER:', output.trim());
    
    if (output.includes('Local:') && output.includes('3001') && !hasStarted) {
      hasStarted = true;
      console.log('🎉 Minimal server started successfully!');
      
      // Test the server after a delay
      setTimeout(() => testMinimalServer(), 2000);
    }
    
    if (output.includes('Failed to compile') || output.includes('Error:')) {
      hasError = true;
      console.log('🔥 COMPILATION ERROR DETECTED');
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    console.log('🚨 ERROR:', output.trim());
    hasError = true;
  });
  
  serverProcess.on('close', (code, signal) => {
    console.log(`🏁 Minimal server process exited with code ${code}, signal ${signal}`);
  });
  
  // Auto-kill after testing
  setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      console.log('⏰ Auto-stopping minimal server...');
      serverProcess.kill('SIGINT');
      restoreOriginalFiles();
    }
  }, 30000);
  
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down minimal server...');
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGINT');
    }
    restoreOriginalFiles();
    process.exit(0);
  });
}

async function testMinimalServer() {
  console.log('🔍 Testing minimal server response...');
  
  try {
    const { execSync } = require('child_process');
    const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001', 
      { timeout: 5000 });
    
    const statusCode = result.toString().trim();
    console.log(`📊 Server response: ${statusCode}`);
    
    if (statusCode === '200') {
      console.log('✅ Minimal server is working correctly!');
      
      // Now test with Playwright
      setTimeout(() => runMinimalPlaywrightTest(), 1000);
    } else {
      console.log(`❌ Server returned status code: ${statusCode}`);
    }
  } catch (error) {
    console.log('❌ Failed to test server:', error.message);
  }
}

async function runMinimalPlaywrightTest() {
  console.log('🎭 Running minimal Playwright test...');
  
  try {
    const { chromium } = require('playwright');
    
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
      console.log(`🔍 Console ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`🚨 Page Error: ${error.message}`);
    });
    
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    await page.screenshot({ path: 'minimal-test-screenshot.png' });
    
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    const content = await page.textContent('body');
    console.log(`📝 Page content: ${content}`);
    
    await browser.close();
    
    console.log('📊 Test Results:');
    console.log(`- Console messages: ${consoleMessages.length}`);
    console.log(`- JavaScript errors: ${errors.length}`);
    console.log(`- Page loaded successfully: ${title.includes('Fly2Any')}`);
    
    // Report findings
    const report = {
      consoleMessages,
      errors,
      pageTitle: title,
      successful: errors.length === 0
    };
    
    fs.writeFileSync('minimal-test-report.json', JSON.stringify(report, null, 2));
    console.log('📁 Test report saved to minimal-test-report.json');
    
  } catch (error) {
    console.log('❌ Playwright test failed:', error.message);
  }
}

function restoreOriginalFiles() {
  console.log('🔄 Restoring original files...');
  
  const filesToRestore = [
    'src/app/layout.tsx',
    'src/app/page.tsx', 
    'next.config.js'
  ];
  
  filesToRestore.forEach(file => {
    const backupFile = file + '.backup-minimal';
    if (fs.existsSync(backupFile)) {
      fs.copyFileSync(backupFile, file);
      fs.unlinkSync(backupFile);
      console.log(`✅ Restored ${file}`);
    }
  });
}

createMinimalTest().catch(console.error);