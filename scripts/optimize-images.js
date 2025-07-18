const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const publicDir = path.join(__dirname, '../public');
  const imagesDir = path.join(publicDir, 'images');
  
  // Create images directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Convert PNG OG image to WebP
  console.log('Converting OG image to WebP...');
  
  const ogImagePath = path.join(publicDir, 'og-image.png');
  const ogImageWebpPath = path.join(publicDir, 'og-image.webp');
  
  if (fs.existsSync(ogImagePath)) {
    await sharp(ogImagePath)
      .webp({ quality: 85 })
      .toFile(ogImageWebpPath);
    console.log('✓ OG image converted to WebP');
  }

  // Convert apple-touch-icon to WebP
  const appleIconPath = path.join(publicDir, 'apple-touch-icon.png');
  const appleIconWebpPath = path.join(publicDir, 'apple-touch-icon.webp');
  
  if (fs.existsSync(appleIconPath)) {
    try {
      await sharp(appleIconPath)
        .webp({ quality: 85 })
        .toFile(appleIconWebpPath);
      console.log('✓ Apple touch icon converted to WebP');
    } catch (error) {
      console.log('⚠ Apple touch icon conversion skipped (unsupported format)');
    }
  }

  // Generate optimized favicon sizes
  console.log('Generating optimized favicon sizes...');
  
  const faviconPath = path.join(publicDir, 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    try {
      // Generate multiple sizes for better performance
      const sizes = [16, 32, 48, 64, 96, 128, 256];
      
      for (const size of sizes) {
        const outputPath = path.join(publicDir, `favicon-${size}.png`);
        const webpPath = path.join(publicDir, `favicon-${size}.webp`);
        
        await sharp(faviconPath)
          .resize(size, size)
          .png({ quality: 90 })
          .toFile(outputPath);
          
        await sharp(faviconPath)
          .resize(size, size)
          .webp({ quality: 85 })
          .toFile(webpPath);
      }
      console.log('✓ Favicon sizes generated');
    } catch (error) {
      console.log('⚠ Favicon optimization skipped (unsupported format)');
    }
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(console.error);