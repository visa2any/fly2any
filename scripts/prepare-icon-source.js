#!/usr/bin/env node

/**
 * Prepare Square App Icon
 *
 * Creates a square 1024x1024px icon from the rectangular logo
 * by centering it on a branded background.
 */

const sharp = require('sharp');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/fly2any-logo.png');
const OUTPUT_PATH = path.join(__dirname, '../resources/icons/icon-source.png');

async function createSquareIcon() {
  console.log('Creating square app icon...\n');

  try {
    // Load the logo
    const logo = await sharp(LOGO_PATH).metadata();
    console.log(`Original logo size: ${logo.width}x${logo.height}px`);

    // Calculate scaling to fit within 1024x1024 with padding
    const maxSize = 824; // Leave 100px padding on each side
    const scale = Math.min(maxSize / logo.width, maxSize / logo.height);
    const scaledWidth = Math.round(logo.width * scale);
    const scaledHeight = Math.round(logo.height * scale);

    console.log(`Scaled logo size: ${scaledWidth}x${scaledHeight}px`);

    // Resize logo
    const resizedLogo = await sharp(LOGO_PATH)
      .resize(scaledWidth, scaledHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    // Create square canvas with brand color and centered logo
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 0, g: 102, b: 204, alpha: 1 }, // #0066cc
      },
    })
      .composite([
        {
          input: resizedLogo,
          top: Math.round((1024 - scaledHeight) / 2),
          left: Math.round((1024 - scaledWidth) / 2),
        },
      ])
      .png()
      .toFile(OUTPUT_PATH);

    console.log(`\n✅ Square app icon created: ${OUTPUT_PATH}`);
    console.log('   Size: 1024x1024px');
    console.log('   Background: #0066cc (brand blue)');
    console.log('\n✨ Ready to generate all app icons!');
    console.log('   Run: node scripts/generate-app-icons.js');
  } catch (error) {
    console.error('❌ Error creating square icon:', error);
    process.exit(1);
  }
}

createSquareIcon();
