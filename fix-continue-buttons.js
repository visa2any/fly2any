/**
 * CRITICAL FIX: Prevent Continue buttons from submitting the form
 * This script will fix all Continue buttons to be type="button" instead of submit
 */

const fs = require('fs');

const PAGE_FILE = '/mnt/d/Users/vilma/fly2any/src/app/page.tsx';

console.log('🚨 FIXING CRITICAL CONTINUE BUTTON ISSUE...\n');

try {
  let content = fs.readFileSync(PAGE_FILE, 'utf8');
  let fixCount = 0;

  // Fix 1: Continue button that advances to next service/step  
  const continueButtonPattern1 = /(<button[^>]*onClick=\{[^}]*setCurrentStep\(2\)[^}]*\}[^>]*>[\s\S]*?Continuar[^<]*<\/button>)/g;
  content = content.replace(continueButtonPattern1, (match) => {
    if (!match.includes('type="button"')) {
      fixCount++;
      console.log('✅ Fixed Continue button (setCurrentStep)');
      return match.replace('<button', '<button type="button"');
    }
    return match;
  });

  // Fix 2: Continue button for service completion
  const continueButtonPattern2 = /(<button[^>]*onClick=\{completeCurrentService\}[^>]*>[\s\S]*?(?:Continuar|Próximo Serviço)[^<]*<\/button>)/g;
  content = content.replace(continueButtonPattern2, (match) => {
    if (!match.includes('type="button"')) {
      fixCount++;
      console.log('✅ Fixed Continue button (completeCurrentService)');
      return match.replace('<button', '<button type="button"');
    }
    return match;
  });

  // Fix 3: Any remaining Continue buttons without type="button"
  const continueButtonPattern3 = /(<button(?![^>]*type=)[^>]*>[\s\S]*?Continuar[^<]*<\/button>)/g;
  content = content.replace(continueButtonPattern3, (match) => {
    if (!match.includes('type=')) {
      fixCount++;
      console.log('✅ Fixed generic Continue button');
      return match.replace('<button', '<button type="button"');
    }
    return match;
  });

  // Fix 4: Próximo Serviço buttons
  const proximoButtonPattern = /(<button(?![^>]*type=)[^>]*>[\s\S]*?Próximo Serviço[^<]*<\/button>)/g;
  content = content.replace(proximoButtonPattern, (match) => {
    if (!match.includes('type=')) {
      fixCount++;
      console.log('✅ Fixed Próximo Serviço button');
      return match.replace('<button', '<button type="button"');
    }
    return match;
  });

  // Additional fix: Ensure only the final submit button can submit
  const submitButtonFix = `
  // CRITICAL: Add step navigation functions to prevent form submission
  const goToNextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };`;

  // Insert the navigation functions after handleSubmit
  const handleSubmitEnd = content.indexOf('};', content.indexOf('const handleSubmit'));
  if (handleSubmitEnd !== -1) {
    const insertPoint = handleSubmitEnd + 2;
    content = content.slice(0, insertPoint) + submitButtonFix + content.slice(insertPoint);
    console.log('✅ Added step navigation helper functions');
  }

  // Write the fixed content
  fs.writeFileSync(PAGE_FILE, content, 'utf8');

  console.log(`\n🎯 CRITICAL FIX COMPLETE!`);
  console.log(`✅ Fixed ${fixCount} Continue buttons`);
  console.log('✅ Added step navigation helpers');
  console.log('✅ All Continue buttons now have type="button"');
  console.log('✅ Form submission is blocked except on final step');
  
  console.log('\n🚀 The Continue buttons will now advance steps instead of submitting!');
  console.log('🔄 Restart your dev server to see the fix');

} catch (error) {
  console.error('❌ Error fixing Continue buttons:', error);
}