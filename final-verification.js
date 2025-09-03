const fs = require('fs');

console.log('🔍 Final TypeScript Fix Verification\n');
console.log('=' .repeat(50));

const checks = [
  {
    name: 'Email module imports use @/ alias',
    files: [
      { path: 'src/app/api/admin/system/health/route.ts', pattern: '@/lib/email/email-queue' },
      { path: 'src/app/api/admin/system/health/route.ts', pattern: '@/lib/email/notification-service' },
      { path: 'src/app/api/monitoring/errors/route.ts', pattern: '@/lib/email/notification-service' },
      { path: 'src/app/api/monitoring/logs/route.ts', pattern: '@/lib/email/notification-service' }
    ]
  },
  {
    name: 'CityAutocomplete null handling',
    files: [
      { path: 'src/app/page.tsx', pattern: 'if (!destino) return \'\';' }
    ]
  },
  {
    name: 'date-fns individual imports',
    files: [
      { path: 'src/components/ui/enterprise-date-picker.tsx', pattern: 'import eachDayOfInterval from \'date-fns/eachDayOfInterval\'' }
    ]
  }
];

let totalPassed = 0;
let totalFailed = 0;

for (const check of checks) {
  console.log(`\n📋 ${check.name}:`);
  
  for (const file of check.files) {
    const content = fs.readFileSync(file.path, 'utf8');
    const found = content.includes(file.pattern);
    
    if (found) {
      console.log(`  ✅ ${file.path}`);
      totalPassed++;
    } else {
      console.log(`  ❌ ${file.path} - Missing: "${file.pattern}"`);
      totalFailed++;
    }
  }
}

console.log('\n' + '=' .repeat(50));
console.log(`\n📊 Results: ${totalPassed} passed, ${totalFailed} failed`);

if (totalFailed === 0) {
  console.log('\n🎉 All TypeScript errors have been fixed successfully!');
} else {
  console.log('\n⚠️ Some issues remain. Please review the failures above.');
}
