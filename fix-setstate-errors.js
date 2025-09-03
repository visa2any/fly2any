#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix the content
function fixContent(content, filePath) {
  let modified = false;
  let fixedContent = content;

  // Fix doubled setState function names (setsetXxx => setXxx)
  const doubledSetPattern = /setset([A-Z]\w*)/g;
  if (doubledSetPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(/setset([A-Z]\w*)/g, 'set$1');
    modified = true;
    console.log(`  ✓ Fixed doubled setState patterns`);
  }

  // Fix double parentheses pattern: "prev =>((prev: any) =>" to "(prev: any) =>"
  const doublePrevPattern = /(\w+)\s*=>\s*\(\s*\(\s*\1:\s*any\s*\)\s*=>/g;
  if (doublePrevPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(doublePrevPattern, '($1: any) =>');
    modified = true;
    console.log(`  ✓ Fixed double parentheses in callbacks`);
  }

  // Fix specific pattern: setState(prev =>((prev: any) => 
  const setStateDoublePattern = /set([A-Z]\w*)\s*\(\s*prev\s*=>\s*\(\s*\(prev:\s*any\)\s*=>/g;
  if (setStateDoublePattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(setStateDoublePattern, 'set$1((prev: any) =>');
    modified = true;
    console.log(`  ✓ Fixed setState double callback pattern`);
  }

  // Fix extra closing parentheses at the end
  // This is more complex - need to balance parentheses
  const lines = fixedContent.split('\n');
  const fixedLines = lines.map((line, index) => {
    // Count parentheses
    let openCount = (line.match(/\(/g) || []).length;
    let closeCount = (line.match(/\)/g) || []).length;
    
    // If there's an imbalance and the line ends with extra )
    if (closeCount > openCount && line.trim().endsWith(')')) {
      // Check if removing one ) would balance it
      const trimmed = line.replace(/\)(\s*)$/, '$1');
      const newOpenCount = (trimmed.match(/\(/g) || []).length;
      const newCloseCount = (trimmed.match(/\)/g) || []).length;
      
      if (newOpenCount === newCloseCount) {
        modified = true;
        return trimmed;
      }
    }
    
    return line;
  });

  if (modified && lines.some((line, i) => line !== fixedLines[i])) {
    fixedContent = fixedLines.join('\n');
    console.log(`  ✓ Fixed unbalanced parentheses`);
  }

  return { content: fixedContent, modified };
}

// Process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: fixedContent, modified } = fixContent(content, filePath);

    if (modified) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Get list of files with errors from the TypeScript output
const errorFiles = [
  'src/app/admin/leads/page.tsx',
  'src/app/admin/login/page.tsx',
  'src/app/admin/phone-management/contacts/page.tsx',
  'src/app/admin/phone-management/lists/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/cotacao/carros/page.tsx',
  'src/app/cotacao/hoteis/page.tsx',
  'src/app/cotacao/passeios/page.tsx',
  'src/app/cotacao/seguro/page.tsx',
  'src/app/cotacao/voos/page.tsx',
  'src/app/en/page.tsx',
  'src/app/es/page.tsx',
  'src/app/flights/page-debug.tsx',
  'src/app/flights/page.tsx',
  'src/app/flights/seat-selection/[id]/page.tsx',
  'src/app/hoteis/page.tsx',
  'src/app/page-simple.tsx',
  'src/app/page.tsx',
  'src/app/register/page.tsx',
  'src/app/travel/page.tsx',
  'src/components/admin/leads/LeadTableView.tsx',
  'src/components/ai/AIEnhancedFlightSearch.tsx',
  'src/components/ai/ConversationalSearchInterface.tsx',
  'src/components/CityAutocomplete.tsx',
  'src/components/DatePicker.tsx',
  'src/components/DatePickerFixed.tsx',
  'src/components/ExitIntentPopup.tsx',
  'src/components/flights/AirportAutocomplete.tsx',
  'src/components/flights/CinematicFlightTransition.tsx',
  'src/components/flights/CompetitiveHeroSection.tsx',
  'src/components/flights/EnterpriseFlightSearchForm.tsx',
  'src/components/flights/FareCustomizer.tsx',
  'src/components/flights/FareCustomizerSimple.tsx',
  'src/components/flights/FlightBookingForm.tsx',
  'src/components/flights/FlightDetailsPage.tsx',
  'src/components/flights/FlightResultsList.tsx',
  'src/components/flights/FlightSearchForm.tsx',
  'src/components/flights/FlightSearchFormSimple.tsx',
  'src/components/flights/FlightSearchTransition.tsx',
  'src/components/flights/modals/PriceAlertsModal.tsx',
  'src/components/flights/MultiCitySearchForm.tsx',
  'src/components/flights/PremiumFlightTransition.tsx',
  'src/components/flights/SocialProofFeed.tsx',
  'src/components/flights/UltraOptimizedFlightSearchForm.tsx',
  'src/components/flights/VoiceSearch.tsx',
  'src/components/forms/ConversionAnalytics.tsx',
  'src/components/forms/IntegratedIntelligentForm.tsx',
  'src/components/forms/IntelligentFormSystem.tsx',
  'src/components/forms/MobileOptimizedFormUX.tsx',
  'src/components/hotels/HotelBookingFlow.tsx',
  'src/components/hotels/HotelSearchForm.tsx',
  'src/components/hotels/PaymentForm.tsx',
  'src/components/LeadCapture.tsx',
  'src/components/LeadCaptureSimple.tsx',
  'src/components/LeadCaptureSimpleMobile.tsx',
  'src/components/mobile/MobileAppForm.tsx',
  'src/components/mobile/MobileBottomNav.tsx',
  'src/components/mobile/MobileFlightForm.tsx',
  'src/components/mobile/MobileHeroSection.tsx',
  'src/components/mobile/PremiumMobileLeadForm.tsx',
  'src/components/omnichannel/NotificationCenter.tsx',
  'src/components/omnichannel/NotificationSystem.tsx',
  'src/components/omnichannel/ResponseTemplates.tsx',
  'src/components/pwa/PWAInstallPrompt.tsx',
  'src/components/pwa/PWAProvider.tsx',
  'src/components/ResponsiveHeader.tsx',
  'src/components/travel/ConversionOptimizer.tsx',
  'src/components/travel/PremiumTravelSearch.tsx',
  'src/components/travel/PricingDisplay.tsx',
  'src/components/travel/UnifiedTravelSearch.tsx',
  'src/components/ui/brazilian-form.tsx',
  'src/components/ui/urgency-banners.tsx',
  'src/components/ui/us-airport-autocomplete.tsx',
  'src/components/ui/whatsapp-chat.tsx',
  'src/hooks/usePerformanceMonitoring.ts'
];

// Main execution
console.log('🔧 Fixing setState errors...\n');

let totalFixed = 0;
errorFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    if (processFile(fullPath)) {
      totalFixed++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log(`\n✨ Fixed ${totalFixed} files!`);

// Also check for any other files that might have the pattern
console.log('\n🔍 Scanning for other files with setset pattern...');

const allTsFiles = glob.sync('src/**/*.{ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'] 
});

let additionalFixed = 0;
allTsFiles.forEach(file => {
  if (!errorFiles.includes(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (/setset[A-Z]/.test(content)) {
      console.log(`Found setset pattern in: ${file}`);
      if (processFile(file)) {
        additionalFixed++;
      }
    }
  }
});

if (additionalFixed > 0) {
  console.log(`\n✨ Fixed ${additionalFixed} additional files!`);
}

console.log('\n✅ Fix complete!');