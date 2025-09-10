/**
 * ULTRATHINK BASIC FAVICON CREATOR
 * Creates simple text-based favicons for immediate use
 */

const fs = require('fs');
const path = require('path');

// Create a simple SVG favicon
const createSvgFavicon = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="4" fill="url(#grad1)"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">F2A</text>
</svg>`;
};

// Create simple HTML favicon code
const createHtmlFaviconCode = () => {
  return `data:image/svg+xml;base64,${Buffer.from(createSvgFavicon()).toString('base64')}`;
};

// Create a basic ICO file content (simplified)
const createBasicIcoContent = () => {
  // This is a very basic ICO file structure for 16x16 pixels
  // In production, you'd want to use a proper ICO generator
  const header = Buffer.from([
    0x00, 0x00, // Reserved
    0x01, 0x00, // Image type (1 = ICO)
    0x01, 0x00, // Number of images
  ]);
  
  const dirEntry = Buffer.from([
    0x10, // Width (16)
    0x10, // Height (16) 
    0x00, // Color palette size
    0x00, // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32)
    0x00, 0x04, 0x00, 0x00, // Image data size (1024 bytes)
    0x16, 0x00, 0x00, 0x00, // Offset to image data
  ]);
  
  // Create a simple 16x16 RGBA bitmap (1024 bytes)
  const bitmapHeader = Buffer.from([
    0x28, 0x00, 0x00, 0x00, // DIB header size
    0x10, 0x00, 0x00, 0x00, // Width
    0x20, 0x00, 0x00, 0x00, // Height (32 = 16*2 for ICO format)
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel
    0x00, 0x00, 0x00, 0x00, // Compression
    0x00, 0x04, 0x00, 0x00, // Image size
    0x00, 0x00, 0x00, 0x00, // X pixels per meter
    0x00, 0x00, 0x00, 0x00, // Y pixels per meter
    0x00, 0x00, 0x00, 0x00, // Colors used
    0x00, 0x00, 0x00, 0x00, // Important colors
  ]);
  
  // Create simple blue/orange gradient pixels (very basic)
  const pixels = Buffer.alloc(16 * 16 * 4); // 16x16 RGBA
  for (let i = 0; i < 16 * 16; i++) {
    const x = i % 16;
    const y = Math.floor(i / 16);
    const offset = i * 4;
    
    if (x < 8) {
      // Blue side
      pixels[offset] = 0x1E;     // B
      pixels[offset + 1] = 0x40; // G  
      pixels[offset + 2] = 0xAF; // R
      pixels[offset + 3] = 0xFF; // A
    } else {
      // Orange side
      pixels[offset] = 0xFF;     // B
      pixels[offset + 1] = 0x6B; // G
      pixels[offset + 2] = 0x35; // R
      pixels[offset + 3] = 0xFF; // A
    }
  }
  
  const mask = Buffer.alloc(16 * 4); // AND mask (all transparent)
  
  return Buffer.concat([header, dirEntry, bitmapHeader, pixels, mask]);
};

// Create all favicon files
const createFaviconFiles = () => {
  const publicDir = path.join(__dirname, 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  try {
    // Create SVG favicon
    const svgContent = createSvgFavicon();
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
    console.log('✅ Created favicon.svg');
    
    // Create basic ICO file
    const icoContent = createBasicIcoContent();
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoContent);
    console.log('✅ Created favicon.ico (basic)');
    
    // Create HTML data URL for immediate use
    const dataUrl = createHtmlFaviconCode();
    console.log('\n📋 DATA URL FOR IMMEDIATE USE:');
    console.log(dataUrl);
    
    // Create sizes info
    console.log('\n📝 HTML FAVICON TAGS TO ADD:');
    console.log('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
    console.log('<link rel="icon" type="image/x-icon" href="/favicon.ico">');
    console.log('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">');
    
    console.log('\n🚨 NEXT STEPS:');
    console.log('1. Basic favicons created for immediate use');
    console.log('2. For production: Generate professional favicons with proper tools');
    console.log('3. Add apple-touch-icon.png and android-chrome icons');
    console.log('4. Use RealFaviconGenerator.net for complete set');
    
    return {
      success: true,
      files: ['favicon.svg', 'favicon.ico'],
      dataUrl
    };
    
  } catch (error) {
    console.error('❌ Error creating favicon files:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the favicon creation
console.log('🎨 ULTRATHINK FAVICON CREATOR');
console.log('='.repeat(50));
const result = createFaviconFiles();

if (result.success) {
  console.log('\n✅ BASIC FAVICONS READY FOR IMMEDIATE USE!');
} else {
  console.log('\n❌ FAVICON CREATION FAILED:', result.error);
}

module.exports = { createSvgFavicon, createFaviconFiles };