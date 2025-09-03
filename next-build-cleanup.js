// Enterprise Next.js Build Cache Cleanup System
// Resolves Next.js 14.2.18 compilation and build manifest issues

const fs = require('fs');
const path = require('path');

function removeRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          removeRecursive(filePath);
        });
        fs.rmdirSync(dirPath);
      } else {
        fs.unlinkSync(dirPath);
      }
    } catch (error) {
      console.log(`⚠️  Could not remove ${dirPath}: ${error.message}`);
    }
  }
}

console.log('🧹 [ENTERPRISE CLEANUP] Starting Next.js build cache cleanup...');

try {
  // Remove Next.js build cache
  const nextDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextDir)) {
    console.log('🗑️  Removing .next directory...');
    removeRecursive(nextDir);
    console.log('✅ .next directory cleaned');
  }

  // Remove TypeScript cache
  const tsBuildInfo = path.join(__dirname, 'tsconfig.tsbuildinfo');
  if (fs.existsSync(tsBuildInfo)) {
    console.log('🗑️  Removing TypeScript cache...');
    fs.unlinkSync(tsBuildInfo);
    console.log('✅ TypeScript cache cleaned');
  }

  // Remove Node.js cache files
  const cacheFiles = [
    path.join(__dirname, 'node_modules/.cache'),
    path.join(__dirname, '.eslintcache')
  ];

  cacheFiles.forEach(cacheFile => {
    if (fs.existsSync(cacheFile)) {
      console.log(`🗑️  Removing ${path.basename(cacheFile)}...`);
      removeRecursive(cacheFile);
      console.log(`✅ ${path.basename(cacheFile)} cleaned`);
    }
  });

  // Create fresh .next directory structure
  fs.mkdirSync(path.join(__dirname, '.next'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, '.next/cache'), { recursive: true });
  
  console.log('📁 Created fresh .next directory structure');
  console.log('🚀 [SUCCESS] Enterprise build cache cleanup completed');
  console.log('💡 [TIP] Next.js should start cleanly now');

} catch (error) {
  console.error('❌ [ERROR] Build cleanup failed:', error.message);
  process.exit(1);
}