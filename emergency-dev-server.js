const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function startEmergencyDevServer() {
  console.log('🚨 Emergency Dev Server Starting...');
  
  // Check if essential files exist
  const essentialFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'src/app/layout.tsx',
    'src/app/page.tsx'
  ];
  
  console.log('📋 Checking essential files...');
  for (const file of essentialFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - EXISTS`);
    } else {
      console.log(`❌ ${file} - MISSING`);
    }
  }
  
  // Create a minimal Next.js config for emergency testing
  const emergencyConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    forceSwcTransforms: false,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Emergency webpack configuration to handle compilation issues
    if (dev && !isServer) {
      config.devtool = 'cheap-module-source-map';
      
      // Add error overlay configuration
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      };
    }
    
    return config;
  },
}

module.exports = nextConfig`;
  
  // Backup current config and create emergency one
  if (fs.existsSync('next.config.js')) {
    fs.copyFileSync('next.config.js', 'next.config.js.backup-emergency');
    console.log('📦 Backed up current next.config.js');
  }
  
  // Replace current config with emergency one
  fs.writeFileSync('next.config.js', emergencyConfig);
  console.log('🚨 Applied emergency Next.js configuration');
  
  console.log('🔧 Starting server with emergency configuration...');
  
  // Try to start server with emergency config
  const serverProcess = spawn('npx', ['next', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' }
  });
  
  let serverOutput = '';
  let errorOutput = '';
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    console.log('📡 SERVER:', output.trim());
    
    // Check for successful startup
    if (output.includes('Local:') && output.includes('http://localhost:3000')) {
      console.log('🎉 Server started successfully!');
      console.log('🌐 Server is running at: http://localhost:3000');
      
      // Now run console analysis after a delay
      setTimeout(() => {
        console.log('🔍 Running console analysis...');
        runConsoleAnalysis();
      }, 3000);
    }
    
    // Check for compilation errors
    if (output.includes('Failed to compile') || output.includes('Error:') || output.includes('SyntaxError')) {
      console.log('🔥 COMPILATION ERROR DETECTED:');
      console.log(output);
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    errorOutput += output;
    console.log('🚨 ERROR:', output.trim());
  });
  
  serverProcess.on('close', (code, signal) => {
    console.log(`🏁 Server process exited with code ${code}, signal ${signal}`);
    
    if (code !== 0) {
      console.log('📝 Server Output:');
      console.log(serverOutput);
      console.log('📝 Error Output:');
      console.log(errorOutput);
    }
  });
  
  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down emergency server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
  
  return serverProcess;
}

async function runConsoleAnalysis() {
  try {
    const { analyzeConsoleErrors } = require('./playwright-console-analysis.js');
    const report = await analyzeConsoleErrors();
    console.log('📊 Console analysis completed!');
    return report;
  } catch (error) {
    console.log('⚠️ Console analysis failed:', error.message);
  }
}

// Start emergency server
startEmergencyDevServer().catch(console.error);