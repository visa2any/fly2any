const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Fly2Any Theme Colors
const THEME = {
  primaryRed: { r: 214, g: 58, b: 53 },      // #D63A35
  secondaryYellow: { r: 232, g: 197, b: 42 } // #E8C52A
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = path.join(__dirname, 'public', 'fly2any-logo.png');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  const input = sharp(inputPath);

  // Standard icons (with red background - matches theme)
  for (const size of sizes) {
    await input
      .clone()
      .resize(size, size, { fit: 'cover', background: { ...THEME.primaryRed, alpha: 1 } })
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  // Maskable icons (40% safe zone with theme red background)
  for (const size of [192, 512]) {
    const padding = Math.floor(size * 0.1); // 10% padding for safe zone
    await input
      .clone()
      .resize(size - padding * 2, size - padding * 2, { fit: 'cover', background: { ...THEME.primaryRed, alpha: 1 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { ...THEME.primaryRed, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, `icon-maskable-${size}.png`));
    console.log(`✓ icon-maskable-${size}.png`);
  }

  // Also update icon.png source
  await input
    .clone()
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log(`✓ icon.png (source updated)`);

  // Apple touch icon
  await input
    .clone()
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log(`✓ apple-touch-icon.png`);

  // Favicons
  await input.clone().resize(32, 32, { fit: 'cover' }).png().toFile(path.join(outputDir, 'favicon-32x32.png'));
  await input.clone().resize(16, 16, { fit: 'cover' }).png().toFile(path.join(outputDir, 'favicon-16x16.png'));
  console.log(`✓ favicon-32x32.png`);
  console.log(`✓ favicon-16x16.png`);

  console.log('\n🎉 All PWA icons regenerated with Fly2Any theme!');
}

generateIcons().catch(console.error);
