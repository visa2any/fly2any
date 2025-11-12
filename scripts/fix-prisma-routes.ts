/**
 * Script to fix Prisma null check issues in API routes
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const files = [
  'app/api/referrals/generate/route.ts',
  'app/api/user/onboarding/route.ts',
  'app/api/user/credits/route.ts',
  'app/api/tripmatch/activity/route.ts',
  'app/api/tripmatch/trips/[id]/checkout/route.ts',
  'app/api/tripmatch/trips/[id]/recent-activity/route.ts',
  'app/api/webhooks/stripe/route.ts',
];

files.forEach((filePath) => {
  try {
    const fullPath = join(process.cwd(), filePath);
    let content = readFileSync(fullPath, 'utf-8');

    // Add const prisma = getPrismaClient(); after "try {" in POST and GET functions
    content = content.replace(
      /(export async function (?:POST|GET|PUT|DELETE)\([^)]*\) \{\s*try \{)/g,
      '$1\n    const prisma = getPrismaClient();'
    );

    writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
  }
});

console.log('\n✅ All files processed!');
