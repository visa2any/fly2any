const fs = require('fs');
const path = require('path');

// Pattern replacements for remaining pages
const patterns = {
  // Pattern 2: Firefox vendor prefixes (apply to hero-title and hero-subtitle in style tags)
  heroTitleVendor: {
    from: /(\.hero-title.*?transform: translateZ\(0\);)/g,
    to: (match) => match.replace('transform: translateZ(0);', 'transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0);')
  },
  heroSubtitleVendor: {
    from: /(\.hero-subtitle.*?transform: translateZ\(0\);)/g,
    to: (match) => match.replace('transform: translateZ(0);', 'transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0);')
  },
  backfaceVisibility: {
    from: /backface-visibility: hidden;(?! -webkit-backface-visibility)/g,
    to: 'backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden;'
  },

  // Pattern 3: Full-width cards and containers
  sectionPadding: {
    from: /className="py-8 md:py-12/g,
    to: 'className="py-6 sm:py-8 md:py-12'
  },
  containerClass: {
    from: /<div className="container mx-auto px-4">/g,
    to: '<MaxWidthContainer className="px-0 md:px-6" noPadding={true}>'
  },
  containerClose: {
    from: /<\/div>\s*<\/section>/g,
    to: '</MaxWidthContainer>\n      </section>'
  },
  sectionHeader: {
    from: /<div className="mb-8">/g,
    to: '<div className="px-4 md:px-0 mb-6 sm:mb-8">'
  },

  // Pattern 4: Compact typography
  sectionTitle: {
    from: /className="text-2xl md:text-3xl/g,
    to: 'className="text-lg sm:text-xl md:text-3xl'
  },
  sectionDescription: {
    from: /(className="text-gray-600">)/g,
    to: 'className="text-xs sm:text-sm md:text-base text-gray-600">'
  },
  gridGap: {
    from: /grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6/g,
    to: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3">\n            <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }
};

console.log('Mobile pattern application script created. Run with node if needed.');
