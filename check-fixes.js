const { execSync } = require('child_process');
const fs = require('fs');

const filesToCheck = [
  'src/app/api/admin/system/health/route.ts',
  'src/app/api/monitoring/errors/route.ts', 
  'src/app/api/monitoring/logs/route.ts',
  'src/app/page.tsx',
  'src/components/ui/enterprise-date-picker.tsx'
];

console.log('Checking TypeScript fixes...\n');

// Check imports
const importChecks = [
  { file: 'src/app/api/admin/system/health/route.ts', pattern: '@/lib/email/email-queue' },
  { file: 'src/app/api/admin/system/health/route.ts', pattern: '@/lib/email/notification-service' },
  { file: 'src/app/api/monitoring/errors/route.ts', pattern: '@/lib/email/notification-service' },
  { file: 'src/app/api/monitoring/logs/route.ts', pattern: '@/lib/email/notification-service' },
  { file: 'src/components/ui/enterprise-date-picker.tsx', pattern: 'eachDayOfInterval' }
];

let allGood = true;

for (const check of importChecks) {
  const content = fs.readFileSync(check.file, 'utf8');
  if (content.includes(check.pattern)) {
    console.log(`✓ ${check.file}: Contains '${check.pattern}'`);
  } else {
    console.log(`✗ ${check.file}: Missing '${check.pattern}'`);
    allGood = false;
  }
}

// Check CityAutocomplete null handling
const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
if (pageContent.includes('if (!destino) return \'\';')) {
  console.log('✓ src/app/page.tsx: Proper null handling for destino');
} else {
  console.log('✗ src/app/page.tsx: Missing null handling for destino');
  allGood = false;
}

console.log('\n' + (allGood ? '✅ All fixes verified!' : '❌ Some fixes missing'));
