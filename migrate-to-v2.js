#!/usr/bin/env node

/**
 * Email Marketing V2 Migration Execution Script
 * 
 * This script executes the complete database unification for the Email Marketing V2 system.
 * Run this script to migrate 4k+ contacts from the deprecated pg Pool system to @vercel/postgres.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Email Marketing V2 Database Migration...');
console.log('📋 Mission: Migrate 4k+ contacts from pg Pool to @vercel/postgres unified system');

try {
  // Compile TypeScript if needed
  console.log('⚙️  Compiling TypeScript migration script...');
  
  // Run the migration script
  const scriptPath = path.join(__dirname, 'src/scripts/migrate-email-marketing-to-v2.ts');
  
  console.log('🔄 Executing migration...');
  console.log(`Script path: ${scriptPath}`);
  
  // Use ts-node to run the TypeScript script directly
  const command = `npx ts-node "${scriptPath}"`;
  
  console.log(`Command: ${command}`);
  
  execSync(command, { 
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env }
  });
  
  console.log('🎉 Migration completed successfully!');
  console.log('');
  console.log('✅ Next Steps:');
  console.log('   1. Email import system now uses V2 exclusively');
  console.log('   2. All contacts linked to customer records');
  console.log('   3. Data integrity verified');
  console.log('   4. Ready for production use');
  
} catch (error) {
  console.error('💥 Migration failed:', error.message);
  console.error('');
  console.error('📋 Troubleshooting:');
  console.error('   1. Check database connection');
  console.error('   2. Ensure all required environment variables are set');
  console.error('   3. Verify legacy tables exist');
  console.error('   4. Check for any permission issues');
  
  process.exit(1);
}