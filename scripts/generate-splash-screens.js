#!/usr/bin/env node

/**
 * Splash Screen Generation Script
 *
 * Generates all required splash screens for iOS and Android from source assets.
 *
 * iOS Splash Screens (Launch Storyboard):
 * - Uses 1x, 2x, 3x scaling for different device resolutions
 * - Supports all iPhone and iPad sizes
 *
 * Android Splash Screens (Density-specific):
 * - ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
 * - Portrait and landscape orientations
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Source image paths
const LOGO_PATH = path.join(__dirname, '../public/logo.png');
const ICON_SOURCE = path.join(__dirname, '../resources/icons/icon-source.png');

// iOS splash screen sizes (width x height)
const IOS_SPLASH_SIZES = [
  // iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max
  { width: 1290, height: 2796, scale: '3x', name: 'Default-2796h@3x' },
  // iPhone 15 Pro, 14 Pro, 13 Pro, 12 Pro
  { width: 1179, height: 2556, scale: '3x', name: 'Default-2556h@3x' },
  // iPhone 15, 14, 13, 12
  { width: 1170, height: 2532, scale: '3x', name: 'Default-2532h@3x' },
  // iPhone SE (3rd gen), 8, 7, 6s
  { width: 750, height: 1334, scale: '2x', name: 'Default-667h@2x' },
  // iPhone SE (1st gen), 5s, 5c, 5
  { width: 640, height: 1136, scale: '2x', name: 'Default-568h@2x' },
  // iPad Pro 12.9"
  { width: 2048, height: 2732, scale: '2x', name: 'Default-2732h@2x' },
  // iPad Pro 11", iPad Air
  { width: 1668, height: 2388, scale: '2x', name: 'Default-2388h@2x' },
  // iPad 10.9"
  { width: 1640, height: 2360, scale: '2x', name: 'Default-2360h@2x' },
  // iPad Mini
  { width: 1536, height: 2048, scale: '2x', name: 'Default-2048h@2x' },
];

// Android splash screen densities
const ANDROID_DENSITIES = [
  { density: 'ldpi', width: 320, height: 480 },
  { density: 'mdpi', width: 480, height: 800 },
  { density: 'hdpi', width: 800, height: 1280 },
  { density: 'xhdpi', width: 1080, height: 1920 },
  { density: 'xxhdpi', width: 1440, height: 2560 },
  { density: 'xxxhdpi', width: 1920, height: 3840 },
];

// Output directories
const IOS_OUTPUT_DIR = path.join(__dirname, '../resources/splash/ios');
const ANDROID_OUTPUT_DIR = path.join(__dirname, '../resources/splash/android');

function createDirectories() {
  [IOS_OUTPUT_DIR, ANDROID_OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Create Android density-specific directories
  ANDROID_DENSITIES.forEach(({ density }) => {
    const dir = path.join(ANDROID_OUTPUT_DIR, `drawable-${density}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('✅ Created splash screen directories\n');
}

async function generateIOSSplashScreens() {
  console.log('📱 Generating iOS splash screens...\n');

  for (const { width, height, scale, name } of IOS_SPLASH_SIZES) {
    try {
      const outputPath = path.join(IOS_OUTPUT_DIR, `${name}.png`);

      // Calculate logo size (30% of screen height)
      const logoHeight = Math.round(height * 0.25);
      const logoWidth = Math.round(logoHeight * (949 / 236)); // Maintain aspect ratio

      // Resize logo
      const logo = await sharp(LOGO_PATH)
        .resize(logoWidth, logoHeight, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      // Create splash screen with centered logo
      await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 0, g: 102, b: 204, alpha: 1 }, // #0066cc
        },
      })
        .composite([
          {
            input: logo,
            top: Math.round((height - logoHeight) / 2),
            left: Math.round((width - logoWidth) / 2),
          },
        ])
        .png()
        .toFile(outputPath);

      console.log(`✓ ${name}.png (${width}x${height}) ${scale}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n✅ iOS splash screens generated\n');
}

async function generateAndroidSplashScreens() {
  console.log('🤖 Generating Android splash screens...\n');

  for (const { density, width, height } of ANDROID_DENSITIES) {
    try {
      const outputDir = path.join(ANDROID_OUTPUT_DIR, `drawable-${density}`);
      const outputPath = path.join(outputDir, 'splash.png');

      // Calculate logo size (25% of screen height)
      const logoHeight = Math.round(height * 0.20);
      const logoWidth = Math.round(logoHeight * (949 / 236));

      // Resize logo
      const logo = await sharp(LOGO_PATH)
        .resize(logoWidth, logoHeight, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      // Create splash screen
      await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 0, g: 102, b: 204, alpha: 1 },
        },
      })
        .composite([
          {
            input: logo,
            top: Math.round((height - logoHeight) / 2),
            left: Math.round((width - logoWidth) / 2),
          },
        ])
        .png()
        .toFile(outputPath);

      console.log(`✓ splash.png (${density}) - ${width}x${height}`);
    } catch (error) {
      console.error(`✗ Failed to generate Android splash (${density}):`, error.message);
    }
  }

  console.log('\n✅ Android splash screens generated\n');
}

async function main() {
  console.log('🎨 Fly2Any Splash Screen Generator\n');

  // Verify source files
  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`❌ Logo not found: ${LOGO_PATH}`);
    process.exit(1);
  }

  createDirectories();
  await generateIOSSplashScreens();
  await generateAndroidSplashScreens();

  console.log('🎉 All splash screens generated successfully!\n');
  console.log('📂 Output locations:');
  console.log(`   iOS:     ${IOS_OUTPUT_DIR}`);
  console.log(`   Android: ${ANDROID_OUTPUT_DIR}\n`);
  console.log('💡 Next step: Run "npx cap sync" to copy to native projects');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
