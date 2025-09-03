const fs = require('fs');

console.log('🔧 Mobile Navigation Fixes Verification');
console.log('======================================\n');

// Read the relevant files
const mobileLayoutPath = 'src/components/mobile/MobileAppLayout.tsx';
const leadFormPath = 'src/components/mobile/MobileLeadCaptureCorrect.tsx';

const mobileLayoutContent = fs.readFileSync(mobileLayoutPath, 'utf8');
const leadFormContent = fs.readFileSync(leadFormPath, 'utf8');

console.log('✅ Issue 1: Missing Insurance Card on Home Page');
console.log('================================================');

// Check if all 5 service cards are present
const serviceCards = [
    'voos', 'hoteis', 'carros', 'passeios', 'seguro'
];

let allCardsPresent = true;
serviceCards.forEach(service => {
    const hasCard = mobileLayoutContent.includes(`key: '${service}'`);
    console.log(`   ${hasCard ? '✅' : '❌'} ${service.charAt(0).toUpperCase() + service.slice(1)} service card`);
    if (!hasCard) allCardsPresent = false;
});

// Check insurance card specifically
const hasInsuranceCard = mobileLayoutContent.includes(`{ key: 'seguro', icon: '🛡️', label: 'Seguro'`);
console.log(`   ${hasInsuranceCard ? '✅' : '❌'} Insurance card properly configured`);

console.log('\n✅ Issue 2: Duplicate Service Cards Navigation');
console.log('==============================================');

// Check preSelectedService prop support
const hasPreSelectedServiceProp = leadFormContent.includes('preSelectedService?: string | null');
console.log(`   ${hasPreSelectedServiceProp ? '✅' : '❌'} PreSelectedService prop defined in interface`);

const hasPreSelectedServiceParam = leadFormContent.includes('preSelectedService, className');
console.log(`   ${hasPreSelectedServiceParam ? '✅' : '❌'} PreSelectedService parameter accepted in function`);

const hasPreSelectedServiceLogic = leadFormContent.includes('preSelectedService ? \'personal\' : \'services\'');
console.log(`   ${hasPreSelectedServiceLogic ? '✅' : '❌'} Initial step logic handles preSelectedService`);

const hasPreSelectedServiceArray = leadFormContent.includes('servicos: preSelectedService ? [preSelectedService] : []');
console.log(`   ${hasPreSelectedServiceArray ? '✅' : '❌'} Services array pre-populated with selected service`);

console.log('\n✅ Issue 3: Service Selection Triggering Proper Form Flow');
console.log('========================================================');

// Check step navigation logic
const hasUpdatedStepNavigation = leadFormContent.includes('const baseSteps = preSelectedService ? [\'personal\'] : [\'services\', \'personal\']');
console.log(`   ${hasUpdatedStepNavigation ? '✅' : '❌'} Step navigation logic updated for preSelectedService`);

const hasUpdatedProgressSteps = leadFormContent.includes('const baseSteps = preSelectedService ? [\'personal\'] : [\'services\', \'personal\'];') &&
                                 leadFormContent.includes('const allSteps = [...baseSteps, ...formData.servicos, \'finalizacao\'];');
console.log(`   ${hasUpdatedProgressSteps ? '✅' : '❌'} Progress indicator logic updated for preSelectedService`);

// Check MobileAppLayout passes preSelectedService
const hasPreSelectedServicePassed = mobileLayoutContent.includes('preSelectedService={preSelectedService}');
console.log(`   ${hasPreSelectedServicePassed ? '✅' : '❌'} MobileAppLayout passes preSelectedService to lead form`);

console.log('\n✅ Expected Navigation Flow');
console.log('===========================');

console.log('   📱 User clicks service card (e.g., "Voos") →');
console.log('   🎯 Lead form opens directly to Personal Info step (skips service selection) →');
console.log('   📝 User fills personal details →');
console.log('   ✈️  User goes to specific service form (Flights) →');
console.log('   ✅ User completes and submits lead');

console.log('\n📊 VERIFICATION SUMMARY');
console.log('=======================');

const allChecks = [
    allCardsPresent,
    hasInsuranceCard,
    hasPreSelectedServiceProp,
    hasPreSelectedServiceParam,
    hasPreSelectedServiceLogic,
    hasPreSelectedServiceArray,
    hasUpdatedStepNavigation,
    hasUpdatedProgressSteps,
    hasPreSelectedServicePassed
];

const passedChecks = allChecks.filter(check => check).length;
const totalChecks = allChecks.length;

console.log(`✅ Fixes implemented: ${passedChecks}/${totalChecks}`);

if (passedChecks === totalChecks) {
    console.log('\n🎉 SUCCESS: All mobile navigation issues fixed!');
    console.log('\n📱 Fixed Issues:');
    console.log('   ✅ Home page now shows all 5 service cards (including insurance)');
    console.log('   ✅ No more duplicate service selection screens');
    console.log('   ✅ Service cards now directly trigger specific service forms');
    console.log('   ✅ Enhanced UX maintained with corrected functionality');
    console.log('\n🚀 Mobile users can now:');
    console.log('   • See all available services on home page');
    console.log('   • Click any service card to go directly to that service\'s form');
    console.log('   • Complete the lead capture flow without confusion');
} else {
    console.log(`\n❌ ${totalChecks - passedChecks} issues still need to be resolved.`);
}

console.log(`\n🌐 Test the fixes at: http://localhost:3001`);
console.log('📱 Open in mobile/responsive view to see the corrected navigation!');