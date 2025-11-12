/**
 * Migration Script: Add TripMatch Credit Fields to User Model
 *
 * Run this script to add credit fields to the User table
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function migrateTripMatchCredits() {
  console.log('🚀 Starting TripMatch Credits Migration...\n');

  try {
    // Step 1: Generate migration
    console.log('📝 Step 1: Generating Prisma migration...');
    const { stdout: genOutput, stderr: genError } = await execAsync(
      'npx prisma migrate dev --name add_tripmatch_credits --create-only'
    );

    if (genError) {
      console.error('Error generating migration:', genError);
    } else {
      console.log(genOutput);
      console.log('✅ Migration file created\n');
    }

    // Step 2: Apply migration
    console.log('📝 Step 2: Applying migration to database...');
    const { stdout: applyOutput, stderr: applyError } = await execAsync(
      'npx prisma migrate dev'
    );

    if (applyError) {
      console.error('Error applying migration:', applyError);
    } else {
      console.log(applyOutput);
      console.log('✅ Migration applied successfully\n');
    }

    // Step 3: Generate Prisma Client
    console.log('📝 Step 3: Generating Prisma Client...');
    const { stdout: clientOutput } = await execAsync('npx prisma generate');
    console.log(clientOutput);
    console.log('✅ Prisma Client generated\n');

    console.log('🎉 TripMatch Credits Migration Complete!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server');
    console.log('2. Visit /tripmatch to see the new landing page');
    console.log('3. Sign in to see your credit balance in TripMatchNav');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateTripMatchCredits();
