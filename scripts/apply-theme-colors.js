const fs = require('fs');
const path = require('path');

// Files to update with theme colors (customer-facing booking journey + flights)
const files = [
  // Home sections - apply theme
  'components/home/CarRentalsSectionEnhanced.tsx',
  'components/home/BlogPreviewSection.tsx',
  'components/home/AirlinesPreviewSection.tsx',
  'components/home/CarRentalsSection.tsx',
  'components/home/DestinationsSection.tsx',
  'components/home/FlashDeals.tsx',
  'components/home/FlashDealsSection.tsx',
  'components/home/HotelsSectionEnhanced.tsx',
  'components/home/RecentlyViewedSection.tsx',
  // Mobile components
  'components/mobile/MobileBottomNav.tsx',
  'components/mobile/NavigationDrawer.tsx',
  'components/mobile/MobileFilterSheet.tsx',
  // Conversion components
  'components/conversion/CompactTrustBar.tsx',
  'components/conversion/FAQ.tsx',
  // World Cup
  'components/world-cup/WorldCupHeroSectionEnhanced.tsx',
];

// Replacements: blue -> theme colors
const replacements = [
  // Backgrounds
  ['bg-blue-50', 'bg-info-50'],
  ['bg-blue-100', 'bg-info-100'],
  ['bg-blue-500', 'bg-primary-500'],
  ['bg-blue-600', 'bg-primary-500'],
  ['bg-blue-700', 'bg-primary-600'],
  // Text
  ['text-blue-50', 'text-info-50'],
  ['text-blue-100', 'text-info-100'],
  ['text-blue-500', 'text-info-500'],
  ['text-blue-600', 'text-primary-500'],
  ['text-blue-700', 'text-primary-600'],
  ['text-blue-800', 'text-neutral-700'],
  ['text-blue-900', 'text-neutral-800'],
  // Borders
  ['border-blue-200', 'border-info-200'],
  ['border-blue-300', 'border-info-300'],
  ['border-blue-500', 'border-primary-500'],
  ['border-blue-600', 'border-primary-500'],
  // Hover states
  ['hover:bg-blue-600', 'hover:bg-primary-600'],
  ['hover:bg-blue-700', 'hover:bg-primary-600'],
  ['hover:bg-blue-50', 'hover:bg-primary-50'],
  ['hover:border-blue-500', 'hover:border-primary-500'],
  // Focus states
  ['focus:ring-blue-500', 'focus:ring-primary-500'],
  ['focus:ring-blue-400', 'focus:ring-primary-400'],
  ['ring-blue-500', 'ring-primary-500'],
  // Gradients
  ['from-blue-50', 'from-info-50'],
  ['from-blue-600', 'from-primary-500'],
  ['from-blue-500', 'from-primary-500'],
  ['to-blue-400', 'to-primary-400'],
  ['to-blue-500', 'to-primary-500'],
  ['via-blue-500', 'via-primary-500'],
  // Indigo replacements
  ['bg-indigo-50', 'bg-primary-50'],
  ['bg-indigo-100', 'bg-primary-100'],
  ['from-indigo-50', 'from-primary-50'],
  ['to-indigo-50', 'to-primary-50'],
  ['from-indigo-100', 'from-primary-100'],
  ['to-indigo-100', 'to-primary-100'],
  ['bg-indigo-700', 'bg-primary-600'],
  ['to-indigo-700', 'to-primary-600'],
  // Border-t specific
  ['border-t-blue-600', 'border-t-primary-500'],
  ['border-t-blue-500', 'border-t-primary-500'],
];

let totalChanges = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileChanges = 0;

  replacements.forEach(([from, to]) => {
    const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      fileChanges += matches.length;
      content = content.replace(regex, to);
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`✓ ${file}: ${fileChanges} changes`);
    totalChanges += fileChanges;
  } else {
    console.log(`- ${file}: no changes needed`);
  }
});

console.log(`\n✅ Total changes: ${totalChanges}`);
