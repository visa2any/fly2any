# Consultant Avatars Directory

This directory contains professional avatar images for all AI Travel Assistant consultants.

## Current Avatars (Placeholders)

All 12 consultants have professional placeholder avatars generated using UI Avatars API.

### Avatar Specifications

- **Format:** PNG
- **Dimensions:** 256x256px
- **Color Depth:** 8-bit RGBA
- **Size:** 4-8 KB each
- **Total:** ~85 KB (all 12 avatars)

### Consultant List

| File | Consultant | Role | Color | Size |
|------|-----------|------|-------|------|
| `sarah-flight.png` | Sarah Chen | Flight Operations | Blue | 8.4 KB |
| `marcus-hotel.png` | Marcus Rodriguez | Hotel Accommodations | Purple | 7.8 KB |
| `emily-legal.png` | Dr. Emily Watson | Legal & Compliance | Dark Blue | 7.5 KB |
| `david-payment.png` | David Park | Payment & Billing | Green | 6.8 KB |
| `lisa-service.png` | Lisa Thompson | Customer Service | Pink | 4.4 KB |
| `robert-insurance.png` | Robert Martinez | Travel Insurance | Teal | 7.8 KB |
| `sophia-visa.png` | Sophia Nguyen | Visa & Documentation | Indigo | 8.1 KB |
| `james-car.png` | James Anderson | Car Rental | Orange | 6.7 KB |
| `amanda-loyalty.png` | Amanda Foster | Loyalty & Rewards | Amber | 6.4 KB |
| `captain-mike.png` | Captain Mike Johnson | Crisis Management | Red | 6.7 KB |
| `alex-tech.png` | Alex Kumar | Technical Support | Cyan | 7.8 KB |
| `nina-special.png` | Nina Davis | Special Services | Lime | 7.6 KB |

## Replacing Placeholders

To replace placeholder avatars with real professional photos:

### 1. Prepare Photos

- Professional headshots
- Square aspect ratio (1:1)
- Minimum 512x512px (recommended 1024x1024px)
- High quality, well-lit
- Professional attire
- Plain or blurred background
- Format: JPG or PNG

### 2. File Naming

Use the exact filename from the table above:
- `sarah-flight.jpg` or `sarah-flight.png`
- `marcus-hotel.jpg` or `marcus-hotel.png`
- etc.

### 3. Upload

Simply replace the existing `.png` file with your photo:
```bash
# Example
cp /path/to/professional-photo.jpg public/consultants/sarah-flight.jpg
```

### 4. Optimization

Next.js will automatically:
- Optimize image size
- Convert to WebP when supported
- Generate responsive sizes
- Lazy load images

## Image Guidelines

### Professional Headshots

✅ **Good:**
- Professional attire
- Neutral background
- Good lighting
- Clear face visibility
- Friendly expression
- Square crop
- High resolution

❌ **Avoid:**
- Casual photos
- Busy backgrounds
- Poor lighting
- Sunglasses
- Group photos
- Landscape crop
- Low resolution

### Style Consistency

All photos should maintain:
- Similar background style
- Consistent lighting
- Same framing/zoom level
- Professional appearance
- Diverse representation

## Regenerating Placeholders

To regenerate all placeholder avatars:

```bash
node scripts/generate-avatars.js
```

This will download fresh placeholders from UI Avatars API with the configured colors.

## Avatar Usage

Avatars are automatically used by the `ConsultantAvatar` component:

```typescript
import { ConsultantAvatar } from '@/components/ai/ConsultantAvatar';

<ConsultantAvatar
  consultantId="sarah-flight"  // Loads: public/consultants/sarah-flight.png
  name="Sarah Chen"
  size="md"
/>
```

## Fallback Behavior

If an avatar image is not found:
1. Component tries `.jpg` extension
2. Falls back to `.png` extension
3. Shows gradient avatar with initials
4. Displays online status indicator

This ensures the UI never breaks, even if images are missing.

## Performance

Avatar images are optimized for web delivery:

- **Next.js Image Component:** Automatic optimization
- **Lazy Loading:** Load only when visible
- **WebP Conversion:** Modern browsers get WebP
- **Caching:** Browser caching enabled
- **CDN Ready:** Can be served from CDN

## Questions?

See the main documentation:
- `components/ai/AVATAR_SYSTEM_README.md`
- `CONSULTANT_AVATAR_SYSTEM_IMPLEMENTATION.md`

---

**Last Updated:** November 4, 2025
**Total Files:** 12 avatars
**Total Size:** ~85 KB
