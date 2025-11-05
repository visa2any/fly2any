# AI Travel Assistant - Professional Avatar System

## Overview

The AI Travel Assistant now features a professional consultant avatar/profile picture system that replaces emoji avatars with real, professional images for each consultant.

## Features

### 1. **Professional Avatars**
- Each consultant has a unique, professional avatar image
- Color-coded by role for visual consistency
- Fallback to gradient avatars with initials if image is unavailable
- Online status indicator (green dot)
- Optimized Next.js Image component for performance
- Lazy loading for better performance

### 2. **Consultant Profile Modal**
- Click any consultant avatar to view their full profile
- Displays:
  - Large professional photo
  - Full name and title
  - Personality description
  - Areas of expertise
  - Specialties
  - Suggested questions specific to their expertise
  - Contact options

### 3. **Avatar Components**

#### `ConsultantAvatar`
```typescript
<ConsultantAvatar
  consultantId="sarah-flight"
  name="Sarah Chen"
  size="sm" | "md" | "lg" | "xl"
  showStatus={true}
  onClick={() => handleClick()}
  className="optional-classes"
/>
```

**Props:**
- `consultantId`: ID of the consultant (e.g., "sarah-flight", "marcus-hotel")
- `name`: Full name of the consultant
- `size`: Avatar size (sm=32px, md=40px, lg=64px, xl=96px)
- `showStatus`: Show online status indicator (default: true)
- `onClick`: Optional click handler for opening profile modal
- `className`: Optional additional CSS classes

**Features:**
- Tries to load real photo from `/public/consultants/{consultantId}.jpg` or `.png`
- Falls back to gradient avatar with initials if photo not found
- Generates consistent gradient colors based on name
- Shows online status indicator
- Accessible with proper alt text and ARIA labels

#### `UserAvatar`
```typescript
<UserAvatar
  name="John Doe"
  size="sm" | "md" | "lg" | "xl"
  className="optional-classes"
/>
```

Displays the user's avatar in the chat (currently uses generic user icon).

#### `ConsultantProfileModal`
```typescript
<ConsultantProfileModal
  consultant={consultantProfile}
  isOpen={true}
  onClose={() => setIsOpen(false)}
  language="en" | "pt" | "es"
/>
```

Shows detailed consultant profile when avatar is clicked.

## Directory Structure

```
fly2any-fresh/
├── components/
│   └── ai/
│       ├── AITravelAssistant.tsx          # Main chat component (updated)
│       ├── ConsultantAvatar.tsx           # Avatar component
│       ├── ConsultantProfileModal.tsx     # Profile modal
│       └── AVATAR_SYSTEM_README.md        # This file
├── public/
│   └── consultants/                        # Avatar images directory
│       ├── sarah-flight.png
│       ├── marcus-hotel.png
│       ├── emily-legal.png
│       ├── david-payment.png
│       ├── lisa-service.png
│       ├── robert-insurance.png
│       ├── sophia-visa.png
│       ├── james-car.png
│       ├── amanda-loyalty.png
│       ├── captain-mike.png
│       ├── alex-tech.png
│       └── nina-special.png
├── lib/
│   ├── ai/
│   │   └── consultant-profiles.ts         # Consultant data
│   └── utils/
│       └── generate-placeholder-avatars.ts # Avatar URL generator
└── scripts/
    └── generate-avatars.js                # Avatar download script
```

## Consultant Avatars

### Current Placeholder Avatars

All consultants currently have placeholder avatars generated using UI Avatars API. Each has a unique color representing their role:

| Consultant ID | Name | Role | Color | File |
|--------------|------|------|-------|------|
| `sarah-flight` | Sarah Chen | Flight Operations | Blue | `sarah-flight.png` |
| `marcus-hotel` | Marcus Rodriguez | Hotel Accommodations | Purple | `marcus-hotel.png` |
| `emily-legal` | Dr. Emily Watson | Legal & Compliance | Dark Blue | `emily-legal.png` |
| `david-payment` | David Park | Payment & Billing | Green | `david-payment.png` |
| `lisa-service` | Lisa Thompson | Customer Service | Pink | `lisa-service.png` |
| `robert-insurance` | Robert Martinez | Travel Insurance | Teal | `robert-insurance.png` |
| `sophia-visa` | Sophia Nguyen | Visa & Documentation | Indigo | `sophia-visa.png` |
| `james-car` | James Anderson | Car Rental | Orange | `james-car.png` |
| `amanda-loyalty` | Amanda Foster | Loyalty & Rewards | Amber | `amanda-loyalty.png` |
| `captain-mike` | Mike Johnson | Crisis Management | Red | `captain-mike.png` |
| `alex-tech` | Alex Kumar | Technical Support | Cyan | `alex-tech.png` |
| `nina-special` | Nina Davis | Special Services | Lime | `nina-special.png` |

### Replacing with Real Photos

To replace placeholder avatars with real photos:

1. **Prepare Photos:**
   - Professional headshots
   - Square aspect ratio (1:1)
   - Minimum 256x256px, recommended 512x512px
   - High quality, well-lit, professional attire
   - Plain or blurred background
   - Format: JPG or PNG

2. **File Naming:**
   - Use the exact consultant ID as filename
   - Examples: `sarah-flight.jpg`, `marcus-hotel.png`

3. **Upload:**
   - Place files in `public/consultants/` directory
   - The avatar component will automatically use the real photo
   - No code changes needed

4. **Optimization:**
   - Next.js will automatically optimize images
   - Images are lazy-loaded for performance
   - WebP format served when supported

## Avatar Generation

### Regenerate Placeholder Avatars

If you need to regenerate the placeholder avatars:

```bash
node scripts/generate-avatars.js
```

This will download all 12 consultant placeholder avatars to `public/consultants/`.

### Custom Avatar URLs

To generate custom placeholder avatar URLs programmatically:

```typescript
import { getConsultantPlaceholderAvatar } from '@/lib/utils/generate-placeholder-avatars';

const avatarUrl = getConsultantPlaceholderAvatar(
  'sarah-flight',  // consultant ID
  'Sarah Chen',    // consultant name
  256              // size in pixels
);
```

## Implementation Details

### Avatar Loading Strategy

1. **Try Real Photo First:**
   - Attempts to load `/consultants/{consultantId}.jpg`
   - Falls back to `.png` extension if `.jpg` fails

2. **Fallback to Gradient:**
   - If no photo found, displays gradient background
   - Shows initials extracted from name
   - Gradient color is consistent for each consultant

3. **Loading States:**
   - Shows gradient with initials while loading
   - Smooth transition when image loads
   - No layout shift

### Performance Optimizations

- **Next.js Image Component:** Automatic optimization and responsive images
- **Lazy Loading:** Images load only when visible
- **Caching:** Browser caching enabled for avatar images
- **WebP Support:** Automatically serves WebP when supported
- **Size Variants:** Multiple size props to load appropriately sized images

### Accessibility

- **Alt Text:** Descriptive alt text for all avatars
- **ARIA Labels:** Proper labels for interactive elements
- **Keyboard Navigation:** Profile modal fully keyboard accessible
- **Screen Reader Support:** All interactive elements properly labeled

## Usage in AITravelAssistant

The main chat component has been updated to use the new avatar system:

```typescript
// In message rendering
{message.role === 'user' ? (
  <UserAvatar size="sm" />
) : message.consultant ? (
  <ConsultantAvatar
    consultantId={message.consultant.id}
    name={message.consultant.name}
    size="sm"
    showStatus={true}
    onClick={() => handleAvatarClick(message.consultant!)}
  />
) : (
  // Fallback
  <Bot className="w-4 h-4" />
)}
```

## Future Enhancements

### Potential Upgrades

1. **Real Professional Photos:**
   - Commission professional headshots
   - Use AI-generated realistic portraits
   - Stock photo library integration

2. **User Avatars:**
   - Allow users to upload custom avatars
   - Generate avatars from initials/email
   - Integrate with social login (Google, Facebook)

3. **Dynamic Status:**
   - Real online/offline status
   - Away/busy indicators
   - Last active timestamp

4. **Animations:**
   - Subtle hover effects
   - Typing indicator in avatar
   - Pulse animation for active consultant

5. **Personalization:**
   - Remember favorite consultants
   - Show recently contacted consultants
   - Consultant ratings and reviews

## Troubleshooting

### Avatar Not Loading

1. **Check File Path:**
   - Ensure file is in `public/consultants/`
   - Verify filename matches consultant ID exactly
   - Check file extension (.jpg or .png)

2. **Check Console:**
   - Open browser DevTools
   - Look for 404 errors on image requests
   - Verify image URL is correct

3. **Clear Cache:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Restart development server

### Gradient Not Showing

- Ensure consultant has a valid name
- Check that gradient generation function is working
- Verify Tailwind CSS classes are compiling

### Modal Not Opening

- Check that onClick handler is properly bound
- Verify consultant profile data is complete
- Ensure modal component is rendered

## API Reference

### ConsultantAvatar Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `consultantId` | string | Yes | - | Unique consultant identifier |
| `name` | string | Yes | - | Full name of consultant |
| `size` | 'sm' \| 'md' \| 'lg' \| 'xl' | No | 'md' | Avatar size |
| `showStatus` | boolean | No | true | Show online status indicator |
| `onClick` | () => void | No | - | Click handler for avatar |
| `className` | string | No | '' | Additional CSS classes |

### Size Specifications

| Size | Dimensions | Image Size | Use Case |
|------|-----------|------------|----------|
| `sm` | 32x32px | 32px | Chat messages |
| `md` | 40x40px | 40px | Chat header, lists |
| `lg` | 64x64px | 64px | Profile previews |
| `xl` | 96x96px | 96px | Profile modals |

## License & Credits

- Placeholder avatars generated using [UI Avatars](https://ui-avatars.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated:** November 4, 2025
**Version:** 1.0.0
**Status:** ✅ Complete and Production Ready
