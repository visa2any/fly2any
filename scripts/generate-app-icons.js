#!/usr/bin/env node

/**
 * App Icon Generation Script
 *
 * Generates all required app icons for iOS and Android from a single source image.
 *
 * Requirements:
 * - Node.js 18+
 * - Sharp (npm install sharp --save-dev)
 * - Source image: resources/icons/icon-source.png (minimum 1024x1024px)
 *
 * Usage:
 *   node scripts/generate-app-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if Sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp is not installed. Install it with: npm install sharp --save-dev');
  process.exit(1);
}

// Source image path
const SOURCE_IMAGE = path.join(__dirname, '../resources/icons/icon-source.png');

// iOS icon sizes (App Icons)
const IOS_SIZES = [
  { size: 1024, name: 'AppIcon-1024' }, // App Store
  { size: 180, name: 'AppIcon-60@3x' }, // iPhone Pro Max
  { size: 167, name: 'AppIcon-83.5@2x' }, // iPad Pro
  { size: 152, name: 'AppIcon-76@2x' }, // iPad, iPad mini
  { size: 120, name: 'AppIcon-60@2x' }, // iPhone
  { size: 87, name: 'AppIcon-29@3x' }, // iPhone
  { size: 80, name: 'AppIcon-40@2x' }, // iPad, iPad mini
  { size: 76, name: 'AppIcon-76' }, // iPad
  { size: 60, name: 'AppIcon-60' }, // iPhone
  { size: 58, name: 'AppIcon-29@2x' }, // iPhone
  { size: 40, name: 'AppIcon-40' }, // iPad, iPad mini, iPhone
  { size: 29, name: 'AppIcon-29' }, // iPhone, iPad
  { size: 20, name: 'AppIcon-20' }, // iPad, iPhone
];

// Android icon sizes (mipmap)
const ANDROID_SIZES = [
  { size: 512, name: 'ic_launcher' }, // Play Store
  { size: 192, name: 'ic_launcher', density: 'xxxhdpi' },
  { size: 144, name: 'ic_launcher', density: 'xxhdpi' },
  { size: 96, name: 'ic_launcher', density: 'xhdpi' },
  { size: 72, name: 'ic_launcher', density: 'hdpi' },
  { size: 48, name: 'ic_launcher', density: 'mdpi' },
];

// Android adaptive icon sizes (foreground/background)
const ANDROID_ADAPTIVE_SIZES = [
  { size: 432, density: 'xxxhdpi' },
  { size: 324, density: 'xxhdpi' },
  { size: 216, density: 'xhdpi' },
  { size: 162, density: 'hdpi' },
  { size: 108, density: 'mdpi' },
];

// Create output directories
const IOS_OUTPUT_DIR = path.join(__dirname, '../resources/ios/icon');
const ANDROID_OUTPUT_DIR = path.join(__dirname, '../resources/android/icon');

function createDirectories() {
  [IOS_OUTPUT_DIR, ANDROID_OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Create density-specific Android directories
  ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'].forEach(density => {
    const dir = path.join(ANDROID_OUTPUT_DIR, `mipmap-${density}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('✅ Created output directories');
}

async function generateIcons() {
  console.log('\n📱 Generating iOS icons...');

  for (const { size, name } of IOS_SIZES) {
    try {
      const outputPath = path.join(IOS_OUTPUT_DIR, `${name}.png`);
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ ${name}.png (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}.png:`, error.message);
    }
  }

  console.log('✅ iOS icons generated');
}

async function generateAndroidIcons() {
  console.log('\n🤖 Generating Android icons...');

  // Generate standard launcher icons
  for (const { size, name, density } of ANDROID_SIZES) {
    try {
      const outputDir = density
        ? path.join(ANDROID_OUTPUT_DIR, `mipmap-${density}`)
        : ANDROID_OUTPUT_DIR;
      const outputPath = path.join(outputDir, `${name}.png`);

      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toFile(outputPath);

      const densityLabel = density ? `(${density})` : '(Play Store)';
      console.log(`✓ ${name}.png ${densityLabel} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate Android icon:`, error.message);
    }
  }

  // Generate adaptive icons (foreground)
  console.log('\n🎨 Generating Android adaptive icons (foreground)...');
  for (const { size, density } of ANDROID_ADAPTIVE_SIZES) {
    try {
      const outputDir = path.join(ANDROID_OUTPUT_DIR, `mipmap-${density}`);
      const outputPath = path.join(outputDir, 'ic_launcher_foreground.png');

      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ ic_launcher_foreground.png (${density}) (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate adaptive icon:`, error.message);
    }
  }

  // Generate adaptive icons (background) - solid color
  console.log('\n🎨 Generating Android adaptive icons (background)...');
  for (const { size, density } of ANDROID_ADAPTIVE_SIZES) {
    try {
      const outputDir = path.join(ANDROID_OUTPUT_DIR, `mipmap-${density}`);
      const outputPath = path.join(outputDir, 'ic_launcher_background.png');

      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 102, b: 204, alpha: 1 }, // #0066cc
        },
      })
        .png()
        .toFile(outputPath);

      console.log(`✓ ic_launcher_background.png (${density}) (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate background icon:`, error.message);
    }
  }

  console.log('✅ Android icons generated');
}

async function generateWebIcons() {
  console.log('\n🌐 Generating PWA icons...');

  const PWA_SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 192, 256, 384, 512];
  const outputDir = path.join(__dirname, '../public/icons');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of PWA_SIZES) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate PWA icon:`, error.message);
    }
  }

  console.log('✅ PWA icons generated');
}

async function main() {
  console.log('🎨 Fly2Any App Icon Generator\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`❌ Source image not found: ${SOURCE_IMAGE}`);
    console.error('\n📝 Instructions:');
    console.error('   1. Create a 1024x1024px PNG image');
    console.error('   2. Save it as: resources/icons/icon-source.png');
    console.error('   3. Run this script again');
    process.exit(1);
  }

  // Verify source image dimensions
  try {
    const metadata = await sharp(SOURCE_IMAGE).metadata();
    if (metadata.width < 1024 || metadata.height < 1024) {
      console.error('❌ Source image must be at least 1024x1024px');
      console.error(`   Current size: ${metadata.width}x${metadata.height}px`);
      process.exit(1);
    }
    console.log(`✅ Source image verified: ${metadata.width}x${metadata.height}px\n`);
  } catch (error) {
    console.error('❌ Failed to read source image:', error.message);
    process.exit(1);
  }

  // Create directories
  createDirectories();

  // Generate all icons
  await generateIcons();
  await generateAndroidIcons();
  await generateWebIcons();

  console.log('\n🎉 All icons generated successfully!');
  console.log('\n📂 Output locations:');
  console.log(`   iOS:     ${IOS_OUTPUT_DIR}`);
  console.log(`   Android: ${ANDROID_OUTPUT_DIR}`);
  console.log(`   PWA:     ${path.join(__dirname, '../public/icons')}`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
