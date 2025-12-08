/**
 * Generate PWA Icons from Source Logo
 *
 * This script creates all required PWA icons from the fly2any-logo.png source.
 * Uses sharp for image processing.
 *
 * Run with: node scripts/generate-pwa-icons.js
 *
 * Required: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SOURCE_LOGO = path.join(PUBLIC_DIR, 'fly2any-logo.png');

// Icon configurations
const icons = [
  // Standard PWA icons
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },

  // Maskable icons (with padding for safe zone)
  { name: 'icon-maskable-192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },

  // Additional sizes for various devices
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-128.png', size: 128 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-384.png', size: 384 },

  // Browser favicon sizes
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from source logo...\n');

  // Check if source exists
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error('❌ Source logo not found:', SOURCE_LOGO);
    console.log('   Creating placeholder icons...\n');
    await createPlaceholderIcons();
    return;
  }

  console.log('📁 Source:', SOURCE_LOGO);
  console.log('📁 Output:', PUBLIC_DIR);
  console.log('');

  for (const icon of icons) {
    const outputPath = path.join(PUBLIC_DIR, icon.name);

    try {
      if (icon.maskable) {
        // Maskable icons need 10% padding for safe zone
        const padding = Math.round(icon.size * 0.1);
        const innerSize = icon.size - padding * 2;

        await sharp(SOURCE_LOGO)
          .resize(innerSize, innerSize, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .png()
          .toFile(outputPath);
      } else {
        // Standard icons - resize directly
        await sharp(SOURCE_LOGO)
          .resize(icon.size, icon.size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .png()
          .toFile(outputPath);
      }

      console.log(`✅ Created ${icon.name} (${icon.size}x${icon.size}${icon.maskable ? ' maskable' : ''})`);
    } catch (error) {
      console.error(`❌ Failed to create ${icon.name}:`, error.message);
    }
  }

  // Generate favicon.ico (32x32 standard size)
  console.log('\n📦 Generating favicon.ico...');
  try {
    await sharp(SOURCE_LOGO)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFormat('png')
      .toFile(path.join(PUBLIC_DIR, 'favicon-temp.png'));

    console.log('✅ Generated favicon-temp.png');
    console.log('⚠️  Convert to .ico: https://favicon.io/favicon-converter/');
    console.log('   Or use: npx sharp-cli -i public/favicon-temp.png -o public/favicon.ico');
  } catch (error) {
    console.error('❌ Failed to create favicon:', error.message);
  }

  console.log('\n🎉 PWA icon generation complete!');
}

async function createPlaceholderIcons() {
  // Create simple placeholder icons with SVG
  const createPlaceholder = async (size, outputPath) => {
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0066cc"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}"
              fill="white" text-anchor="middle" dominant-baseline="middle">F2A</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
  };

  for (const icon of icons) {
    const outputPath = path.join(PUBLIC_DIR, icon.name);
    try {
      await createPlaceholder(icon.size, outputPath);
      console.log(`✅ Created placeholder ${icon.name}`);
    } catch (error) {
      console.error(`❌ Failed to create ${icon.name}:`, error.message);
    }
  }

  console.log('\n⚠️  Placeholder icons created. Replace with real icons for production.');
}

// Run
generateIcons().catch(console.error);
