#!/usr/bin/env tsx

// Production Contact Import Script for Fly2Any
// Imports 14,237 high-quality Brazilian-American contacts into email marketing system

import { ContactImportCLI } from '../src/lib/contact-import-runner';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const filePath = args[1];

  console.log(`
🛫 FLY2ANY CONTACT IMPORT SYSTEM
===============================
🎯 Target: 14,237 Brazilian-American Contacts
🗺️  Focus: USA-Brazil Travel Market
📊 Quality: High-confidence Google Contacts data
  `);

  if (!command) {
    await ContactImportCLI.runCommand('help');
    return;
  }

  // Resolve file path if provided
  let resolvedFilePath: string | undefined;
  if (filePath) {
    resolvedFilePath = path.resolve(filePath);
    console.log(`📁 File: ${resolvedFilePath}\n`);
  }

  try {
    await ContactImportCLI.runCommand(command, resolvedFilePath);
  } catch (error: any) {
    console.error(`\n❌ Command failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}