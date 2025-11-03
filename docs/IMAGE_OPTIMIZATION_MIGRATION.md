# Image Optimization Migration Guide

## Quick Start

Replace standard `<img>` tags with optimized Next.js Images in 3 easy steps.

---

## Step 1: Import the Component

```tsx
// Option A: Use preset components (recommended)
import { HotelImage, DestinationImage, HeroImage } from '@/components/ui/OptimizedImage';

// Option B: Use utility function
import Image from 'next/image';
import { getOptimizedImageProps } from '@/lib/utils/image-optimization';

// Option C: Manual implementation
import Image from 'next/image';
import { generateShimmerSVG } from '@/lib/utils/image-optimization';
```

---

## Step 2: Replace `<img>` with Optimized Image

### Before:
```tsx
<img
  src={hotel.photos[0]}
  alt={hotel.name}
  className="w-full h-64 object-cover"
/>
```

### After (Option A - Preset):
```tsx
<HotelImage
  src={hotel.photos[0]}
  alt={hotel.name}
  priority={isFirstCard}
  className="object-cover"
/>
```

### After (Option B - Utility):
```tsx
<Image
  {...getOptimizedImageProps(
    hotel.photos[0],
    hotel.name,
    'hotelCard',
    { priority: isFirstCard }
  )}
  className="object-cover"
/>
```

### After (Option C - Manual):
```tsx
<Image
  src={hotel.photos[0]}
  alt={hotel.name}
  width={400}
  height={300}
  loading={isFirstCard ? 'eager' : 'lazy'}
  priority={isFirstCard}
  placeholder="blur"
  blurDataURL={generateShimmerSVG(400, 300)}
  sizes="(max-width: 768px) 100vw, 400px"
  className="object-cover"
/>
```

---

## Step 3: Update Container (if needed)

If using `fill` prop, parent must have `position: relative`:

```tsx
{/* Container with relative positioning */}
<div className="relative w-full h-64 overflow-hidden">
  <Image
    src={photo}
    alt={name}
    fill
    className="object-cover"
  />
</div>
```

---

## Common Patterns

### 1. Hotel Card Image

```tsx
<div className="relative w-full h-64 bg-gray-100">
  <Image
    {...getOptimizedImageProps(hotel.photo, hotel.name, 'hotelCard')}
    fill
    className="object-cover"
  />
</div>
```

### 2. Image Carousel

```tsx
{/* First image: priority loading */}
<Image
  {...getOptimizedImageProps(
    photos[currentIndex],
    `${name} - Photo ${currentIndex + 1}`,
    'hotelCard',
    { priority: currentIndex === 0 }
  )}
  fill
  className="object-cover"
/>
```

### 3. Hero Banner

```tsx
<div className="relative w-full h-[600px]">
  <HeroImage
    src="/hero.jpg"
    alt="Travel the world with Fly2Any"
  />
</div>
```

### 4. Destination Grid

```tsx
{destinations.map((dest, index) => (
  <DestinationImage
    key={dest.id}
    src={dest.image}
    alt={dest.name}
    priority={index < 3} // First 3 cards only
  />
))}
```

---

## Priority Loading Rules

**Always set `priority={true}` for:**
- ✅ Hero/banner images
- ✅ First 3 images in a grid/list (above the fold)
- ✅ Images visible on initial viewport

**Use `loading="lazy"` for:**
- ✅ Images below the fold
- ✅ Carousel images (except first)
- ✅ Modal/tab content (not immediately visible)

---

## Responsive Sizing

### Sizes Prop Examples

```tsx
// Full width on mobile, half on tablet, fixed on desktop
sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"

// Two columns on mobile, three on tablet, four on desktop
sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"

// Always full width
sizes="100vw"

// Fixed size (thumbnails)
sizes="200px"
```

---

## Error Handling

### With Fallback Image

```tsx
<OptimizedImage
  src={hotel.photo}
  alt={hotel.name}
  preset="hotelCard"
  fallbackSrc="/images/placeholder-hotel.jpg"
  onError={() => console.log('Image failed to load')}
/>
```

---

## External Images

For external image URLs (Amadeus, Duffel, etc.), ensure domain is whitelisted:

**File:** `next.config.mjs`
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-image-cdn.com',
      pathname: '/**',
    },
  ],
}
```

**Common Travel APIs Already Configured:**
- ✅ assets.duffel.com
- ✅ **.amadeus.com
- ✅ images.booking.com
- ✅ pix*.agoda.net
- ✅ images.trvl-media.com

---

## Performance Checklist

Before marking migration complete:

- [ ] All `<img>` tags replaced with `Image`
- [ ] Priority loading on first 3 cards
- [ ] Blur placeholders working
- [ ] No console errors about missing domains
- [ ] No layout shift (CLS) during load
- [ ] Images lazy load below fold
- [ ] Responsive sizing configured
- [ ] Alt text provided for accessibility
- [ ] Error fallbacks in place

---

## Testing

### 1. Visual Check
```bash
npm run dev
# Open http://localhost:3000
# Check Network tab: images should load as WebP/AVIF
```

### 2. Lighthouse Audit
```bash
npm run build
npm run start
# Open DevTools > Lighthouse > Run audit
# Target: Performance 90+, CLS < 0.1
```

### 3. Network Throttling
```
Chrome DevTools > Network > Fast 3G
# Images should load progressively
# First 3 should load immediately
```

---

## Common Issues

### Issue 1: "Invalid src prop"
```
Error: Invalid src prop (https://external.com/image.jpg)
```
**Fix:** Add domain to `next.config.mjs` remotePatterns

### Issue 2: Layout shift
```
CLS score still high
```
**Fix:** Always specify width/height or use `fill` with relative parent

### Issue 3: Blur placeholder not showing
```
No shimmer effect during load
```
**Fix:** Ensure `blurDataURL` is set or use preset components

### Issue 4: Images not lazy loading
```
All images load at once
```
**Fix:** Set `loading="lazy"` and `priority={false}` for below-fold images

---

## Migration Checklist by Component

### High Priority (Above the Fold)
- [ ] `app/page.tsx` - Hero image
- [ ] `app/home-new/page.tsx` - Hero section
- [ ] `components/hotels/HotelCard.tsx` ✅ DONE
- [ ] `components/home/DestinationsSectionEnhanced.tsx`
- [ ] `components/home/FlashDealsSectionEnhanced.tsx`

### Medium Priority (Below the Fold)
- [ ] `components/home/HotelsSectionEnhanced.tsx`
- [ ] `components/home/CarRentalsSectionEnhanced.tsx`
- [ ] `components/flights/FlightCard.tsx` (if images)
- [ ] `components/cars/CarCard.tsx`

### Low Priority
- [ ] Blog images
- [ ] User avatars
- [ ] Modal images
- [ ] Tab content images

---

## Support

Questions? Check:
1. **Main Report:** `IMAGE_OPTIMIZATION_REPORT.md`
2. **Utility Docs:** `lib/utils/image-optimization.ts`
3. **Component Code:** `components/ui/OptimizedImage.tsx`
4. **Next.js Docs:** https://nextjs.org/docs/app/building-your-application/optimizing/images

---

**Last Updated:** 2025-11-03
**Version:** 1.0
