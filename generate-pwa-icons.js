const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = path.join(__dirname, 'public', 'icon.png');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  const input = sharp(inputPath);

  // Standard icons (transparent background)
  for (const size of sizes) {
    await input
      .clone()
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  // Maskable icons (40% safe zone with blue background)
  for (const size of [192, 512]) {
    const padding = Math.floor(size * 0.2); // 40% safe zone (20% on each side)
    await input
      .clone()
      .resize(size - padding * 2, size - padding * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 111, b: 219, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, `icon-maskable-${size}.png`));
    console.log(`✓ icon-maskable-${size}.png`);
  }

  console.log('\n🎉 All PWA icons generated!');
}

generateIcons().catch(console.error);
