#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting comprehensive TypeScript error fixes...\n');

// Step 1: Fix Event Handler Type Mismatches
function fixEventHandlerTypes(content) {
  let fixed = content;
  
  // Fix select elements - change HTMLInputElement to HTMLSelectElement
  fixed = fixed.replace(
    /onChange=\{\(e:\s*(?:React\.)?ChangeEvent<HTMLInputElement>\)/g,
    (match, offset) => {
      // Check if this is actually a select element by looking backwards
      const beforeMatch = content.substring(Math.max(0, offset - 200), offset);
      if (beforeMatch.includes('<select') || beforeMatch.includes('Select') || beforeMatch.includes('Dropdown')) {
        return match.replace('HTMLInputElement', 'HTMLSelectElement');
      }
      return match;
    }
  );
  
  // Fix textarea elements - change HTMLInputElement to HTMLTextAreaElement  
  fixed = fixed.replace(
    /onChange=\{\(e:\s*(?:React\.)?ChangeEvent<HTMLInputElement>\)/g,
    (match, offset) => {
      // Check if this is actually a textarea element
      const beforeMatch = fixed.substring(Math.max(0, offset - 200), offset);
      if (beforeMatch.includes('<textarea') || beforeMatch.includes('TextArea')) {
        return match.replace('HTMLInputElement', 'HTMLTextAreaElement');
      }
      return match;
    }
  );
  
  // Fix mouse event type mismatches
  fixed = fixed.replace(
    /onMouse(Enter|Leave)=\{\(e:\s*React\.MouseEvent<HTMLDivElement>\)/g,
    (match, eventType, offset) => {
      const beforeMatch = fixed.substring(Math.max(0, offset - 100), offset);
      if (beforeMatch.includes('<button') || beforeMatch.includes('Button')) {
        return match.replace('HTMLDivElement', 'HTMLButtonElement');
      }
      if (beforeMatch.includes('<Link') || beforeMatch.includes('<a ')) {
        return match.replace('HTMLDivElement', 'HTMLAnchorElement');
      }
      return match;
    }
  );
  
  return fixed;
}

// Step 2: Fix Set and Map type issues
function fixCollectionTypes(content) {
  let fixed = content;
  
  // Fix Set<unknown> issues
  fixed = fixed.replace(
    /\(prev:\s*any\)\s*=>\s*\{[\s\S]*?new\s+Set\(/g,
    (match) => {
      if (match.includes('prev.has') || match.includes('prev.delete') || match.includes('prev.add')) {
        return match.replace('(prev: any)', '(prev: Set<string>)');
      }
      return match;
    }
  );
  
  // Fix Map<unknown, unknown> issues
  fixed = fixed.replace(
    /\(prev:\s*any\)\s*=>\s*\{[\s\S]*?new\s+Map\(/g,
    (match) => {
      return match.replace('(prev: any)', '(prev: Map<string, any>)');
    }
  );
  
  return fixed;
}

// Step 3: Fix missing variable declarations
function fixMissingVariables(content) {
  let fixed = content;
  
  // Fix isTabletDevice issue
  if (content.includes('isMobileDevice, isTabletDevice')) {
    fixed = fixed.replace(
      'console.log(\'🔍 Mobile Detection:\', { isMobileDevice, isTabletDevice, isPortraitMobile });',
      'console.log(\'🔍 Mobile Detection:\', { isMobileDevice, isTabletDevice: false, isPortraitMobile });'
    );
    fixed = fixed.replace(
      '}, [isMobileDevice, isTabletDevice, isPortraitMobile]);',
      '}, [isMobileDevice, isPortraitMobile]);'
    );
  }
  
  return fixed;
}

// Step 4: Fix duplicate React imports
function fixDuplicateImports(content) {
  let fixed = content;
  
  // Remove duplicate React imports
  const lines = fixed.split('\n');
  const reactImportLines = [];
  let hasReactImport = false;
  
  const filteredLines = lines.filter((line, index) => {
    if (line.includes('import * as React from') && hasReactImport) {
      return false; // Remove duplicate
    }
    if (line.includes('import React') || line.includes('import * as React')) {
      hasReactImport = true;
    }
    return true;
  });
  
  fixed = filteredLines.join('\n');
  return fixed;
}

// Step 5: Fix duplicate exports
function fixDuplicateExports(content) {
  let fixed = content;
  
  // Fix multiple default exports
  const exportDefaultMatches = [...fixed.matchAll(/export default (function )?(\w+)/g)];
  if (exportDefaultMatches.length > 1) {
    // Keep the last export default and remove others
    for (let i = 0; i < exportDefaultMatches.length - 1; i++) {
      const match = exportDefaultMatches[i];
      if (match[1]) { // If it's "export default function"
        fixed = fixed.replace(match[0], match[2]); // Replace with just function name
      } else {
        fixed = fixed.replace(match[0], `// ${match[0]}`); // Comment out
      }
    }
  }
  
  return fixed;
}

// Files to process
const filesToProcess = [
  // Admin pages
  'src/app/account/bookings/page.tsx',
  'src/app/admin/analytics/page.tsx', 
  'src/app/admin/campaigns/page.tsx',
  'src/app/admin/customers/page.tsx',
  'src/app/admin/email-analytics/page.tsx',
  'src/app/admin/email-campaigns/page.tsx',
  'src/app/admin/email-marketing/monitoring/page.tsx',
  'src/app/admin/email-marketing/page.tsx',
  'src/app/admin/email-providers/page.tsx',
  'src/app/admin/email-templates/page.tsx',
  'src/app/admin/leads/page.tsx',
  'src/app/admin/omnichannel-test/page.tsx',
  'src/app/admin/phone-management/contacts/page.tsx',
  'src/app/admin/phone-management/lists/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/support/page.tsx',
  
  // App pages
  'src/app/en/page.tsx',
  'src/app/es/page.tsx',
  'src/app/page.tsx',
  'src/app/travel/page.tsx',
  
  // Components
  'src/components/admin/AIPerformanceDashboard.tsx',
  'src/components/admin/EmailMetricsWidget.tsx',
  'src/components/admin/leads/LeadEditModal.tsx',
  'src/components/admin/leads/LeadFilters.tsx',
  'src/components/analytics/FilterPanel.tsx',
  'src/components/customers/Timeline360.tsx',
  'src/components/ExitIntentPopup.tsx',
  'src/components/flights/FareCustomizer.tsx',
  'src/components/flights/FareCustomizerSimple.tsx',
  'src/components/flights/FlightBookingForm.tsx',
  'src/components/flights/FlightDestinationsInspiration.tsx',
  'src/components/flights/FlightDetailsPage.tsx',
  'src/components/flights/FlightOrderStatus.tsx',
  'src/components/flights/FlightResultsList.tsx',
  'src/components/flights/FlightSearchForm.tsx',
  'src/components/flights/FlightSearchFormSimple.tsx',
  'src/components/flights/MultiCitySearchForm.tsx',
  'src/components/flights/UltraOptimizedFlightSearchForm.tsx',
  'src/components/hotels/HotelBookingFlow.tsx',
  'src/components/hotels/HotelSearchForm.tsx',
  'src/components/LeadCapture.tsx',
  'src/components/LeadCaptureSimple.tsx',
  'src/components/mobile/MobileAppForm.tsx',
  'src/components/mobile/MobileBottomNav.tsx',
  'src/components/mobile/PremiumMobileLeadForm.tsx',
  'src/components/omnichannel/CustomStyledChat.tsx',
  'src/components/omnichannel/ModernUnifiedChat.tsx',
  'src/components/omnichannel/NotificationSystem.tsx',
  'src/components/omnichannel/ResponseTemplates.tsx',
  'src/components/omnichannel/UnifiedChat.tsx',
  'src/components/travel/PremiumTravelSearch.tsx',
  'src/components/travel/UnifiedTravelSearch.tsx',
  'src/components/ui/brazilian-form.tsx',
  'src/components/ui/price-calculator.tsx'
];

function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  File ${filePath} does not exist, skipping`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply all fixes
    content = fixEventHandlerTypes(content);
    content = fixCollectionTypes(content);
    content = fixMissingVariables(content);
    content = fixDuplicateImports(content);
    content = fixDuplicateExports(content);
    
    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Fixed ${filePath}`);
      return true;
    } else {
      console.log(`  ➖ No changes needed for ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process all files
console.log('📝 Processing TypeScript files...\n');
let processedCount = 0;
let fixedCount = 0;

filesToProcess.forEach(filePath => {
  processedCount++;
  if (processFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${processedCount}`);
console.log(`   Files fixed: ${fixedCount}`);

console.log('\n✅ TypeScript error fixes completed!');