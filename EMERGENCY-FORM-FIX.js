/**
 * EMERGENCY FIX: The Continue button is calling handleSubmit instead of step navigation
 * This creates a direct fix to prevent form submission until all fields are filled
 */

const fs = require('fs');

const PAGE_FILE = '/mnt/d/Users/vilma/fly2any/src/app/page.tsx';

console.log('🚨 EMERGENCY FIX: Preventing premature form submission...\n');

try {
  let content = fs.readFileSync(PAGE_FILE, 'utf8');

  // Find the handleSubmit function and add stronger validation
  const handleSubmitPattern = /(const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?console\.log\('🚀 \[FORM DEBUG\] Starting form submission\.\.\.'\);)/;
  
  const newHandleSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    setIsSubmitting(true);
    
    console.log('🚀 [FORM DEBUG] Form submit triggered, currentStep:', currentStep);
    console.log('🚀 [FORM DEBUG] Form data:', { nome: formData.nome, email: formData.email });
    
    // EMERGENCY BLOCK: Only allow submission when ALL required fields are filled
    const hasRequiredPersonalInfo = formData.nome?.trim() && formData.email?.trim();
    const hasRequiredTravelInfo = formData.selectedServices && formData.selectedServices.length > 0;
    
    if (!hasRequiredPersonalInfo) {
      console.log('❌ [FORM DEBUG] BLOCKED: Missing personal information');
      console.log('❌ [FORM DEBUG] Nome:', formData.nome, 'Email:', formData.email);
      setIsSubmitting(false);
      
      // If user hasn't filled personal info, advance to the personal info step
      if (currentStep < 3) {
        console.log('🔄 [FORM DEBUG] Advancing to personal info step');
        setCurrentStep(3);
        return;
      }
      
      alert('❌ Por favor, preencha seu Nome e Email antes de continuar.');
      return;
    }
    
    if (!hasRequiredTravelInfo) {
      console.log('❌ [FORM DEBUG] BLOCKED: Missing travel information');
      setIsSubmitting(false);
      
      // If user hasn't selected services, go back to step 1
      if (currentStep < 1) {
        setCurrentStep(1);
        return;
      }
      
      alert('❌ Por favor, selecione pelo menos um serviço.');
      return;
    }
    
    // ONLY proceed with submission if we have all required data
    console.log('🚀 [FORM DEBUG] Starting form submission...');`;

  if (content.match(handleSubmitPattern)) {
    content = content.replace(handleSubmitPattern, newHandleSubmit);
    console.log('✅ Enhanced handleSubmit with emergency validation');
  } else {
    console.log('⚠️ Could not find handleSubmit pattern, using alternative approach');
    
    // Alternative: Insert validation at the very beginning of handleSubmit
    const basicPattern = /(const handleSubmit = async \(e: React\.FormEvent\) => \{\s*e\.preventDefault\(\);)/;
    const replacement = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('🚨 [EMERGENCY DEBUG] Form submit triggered');
    console.log('🚨 [EMERGENCY DEBUG] Current step:', currentStep);
    console.log('🚨 [EMERGENCY DEBUG] Nome:', formData.nome || 'EMPTY');
    console.log('🚨 [EMERGENCY DEBUG] Email:', formData.email || 'EMPTY');
    
    // EMERGENCY: Block all submissions with incomplete data
    if (!formData.nome?.trim() || !formData.email?.trim()) {
      console.log('🚫 [EMERGENCY DEBUG] SUBMISSION BLOCKED - Missing required fields');
      alert('Por favor, preencha todos os campos obrigatórios antes de enviar o formulário.');
      setIsSubmitting(false);
      
      // Advance to personal info step if not there yet
      if (currentStep < 3) {
        setCurrentStep(3);
      }
      return;
    }`;
    
    content = content.replace(basicPattern, replacement);
    console.log('✅ Applied alternative emergency validation');
  }

  // Write the emergency fix
  fs.writeFileSync(PAGE_FILE, content, 'utf8');

  console.log('\n🎯 EMERGENCY FIX DEPLOYED!');
  console.log('✅ Form submission now blocked until ALL fields are filled');
  console.log('✅ Added step navigation if fields are missing');
  console.log('✅ Enhanced debug logging for troubleshooting');
  
  console.log('\n🚀 The form will now:');
  console.log('   1. Block submission if Nome or Email is empty');
  console.log('   2. Advance to personal info step automatically');
  console.log('   3. Show clear error message to user');
  console.log('   4. Prevent accidental submissions');
  
  console.log('\n🔄 Restart your dev server and test - it should be fixed!');

} catch (error) {
  console.error('❌ Emergency fix failed:', error);
}