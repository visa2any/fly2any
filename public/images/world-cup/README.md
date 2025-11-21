# World Cup 2026 Hero Images

## Current Status
Currently using SVG gradient placeholders for instant loading and zero dependencies.

## To Add Real Images

Replace the SVG files with high-quality stadium/World Cup images:

### Image Specifications
- **Format**: JPG or WebP (for best performance)
- **Dimensions**: 1920x1080px minimum (16:9 aspect ratio)
- **File Size**: Optimize to under 500KB each
- **Quality**: 80-85% compression

### Recommended Sources (Free, High-Quality)
1. **Unsplash**: https://unsplash.com/s/photos/stadium
2. **Pexels**: https://www.pexels.com/search/soccer%20stadium/
3. **Pixabay**: https://pixabay.com/images/search/world%20cup/

### File Names
- `hero-1.jpg` - Main stadium crowd scene
- `hero-2.jpg` - Fan celebration
- `hero-3.jpg` - Trophy/victory moment
- `hero-4.jpg` - Stadium at night
- `hero-5.jpg` - Massive crowd energy
- `hero-6.jpg` - Team celebration

### After Adding Images
1. Delete the `.svg` files
2. Update `lib/utils/stadium-images.ts` to use `.jpg` extensions
3. Test locally with `npm run dev`
4. Commit and deploy

### Image Optimization
Before adding, optimize your images:
```bash
# Using ImageMagick
convert hero-1-original.jpg -resize 1920x1080 -quality 82 hero-1.jpg

# Using online tool
# Visit: https://squoosh.app/
```

## Why SVG Placeholders?
- ⚡ Instant loading (< 1KB each)
- 🚀 Zero external dependencies
- 💯 Always works (no broken links)
- 🎨 Professional gradient designs
- 📱 Perfect for all screen sizes
