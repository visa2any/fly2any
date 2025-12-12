# Fly2Any — Claude Code Master Instructions

> **MANDATORY**: All code, layouts, components, animations, and UI decisions must follow these standards.
> **Quality Level**: 🔵⚡ Level 6 — Ultra-Premium / Apple-Class

---

## 🎯 CORE IDENTITY

**Brand**: Fly2Any — Ultra-Premium Travel Platform
**Philosophy**: Premium, trustworthy, fluid, globally confident
**Standard**: Every screen, component, layout = Apple-Class quality

---

## 🎨 1. OFFICIAL COLOR SYSTEM (UNIVERSAL SOURCE OF TRUTH)

> **MANDATORY**: These colors MUST be applied to ALL UI, components, layouts, animations, and generated code.
> No exceptions. This overrides ALL defaults.

### Primary Brand Colors
```css
/* Fly2Any Red - Primary Brand (CTA buttons, primary surfaces, highlights) */
--fly2any-red: #E74035;        /* HEX: #E74035 | RGB: 231, 64, 53 */
--fly2any-red-hover: #D63930;  /* Darker hover state */

/* Fly2Any Yellow - Premium Accent (icons, accents, positive status) */
--fly2any-yellow: #F7C928;     /* HEX: #F7C928 | RGB: 247, 201, 40 */
```

### Neutral Layer System (Apple-Grade)
```css
/* Light Mode Layers */
--layer-0: #FAFAFA;  /* Base background */
--layer-1: #F2F2F2;  /* Cards */
--layer-2: #E6E6E6;  /* Elevated surfaces */
--layer-3: #DCDCDC;  /* Modal/Sheet */

/* Dark Mode Layers */
--layer-0-dark: #0E0E0E;
--layer-1-dark: #1A1A1A;
--layer-2-dark: #222222;
--layer-3-dark: #2B2B2B;
```

### Support Colors
```css
--success: #27C56B;  /* Positive actions, confirmations */
--warning: #FFC043;  /* Warnings, cautions */
--error: #E5484D;    /* Errors, destructive actions */
--info: #3A7BFF;     /* Informational elements */
```

### Typography Colors (Apple-Class)
```css
--text-heading: #0A0A0A;     /* Headings, primary text */
--text-body: #1C1C1C;        /* Body text */
--text-secondary: #6B6B6B;   /* Secondary text, labels */
--text-placeholder: #9F9F9F; /* Placeholder text (38% opacity recommended) */
```

### Shadow System (Apple Physics - Multi-Layer)
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
--shadow-md: 0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg: 0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.03);
--shadow-xl: 0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.08), 0 20px 25px rgba(0,0,0,0.04);
```

### Premium Gradient (Hero Sections)
```css
--gradient-prime: linear-gradient(135deg, #E74035 0%, #F7C928 100%);
```

### Color Usage Rules (MANDATORY)
```
✔ ALWAYS use Fly2Any Red (#E74035) for primary CTAs and actions
✔ ALWAYS use Fly2Any Yellow (#F7C928) for accents and icons
✔ ALWAYS apply neutral layers correctly for depth
✔ ALWAYS follow Apple-Class shadow rules
✔ NEVER introduce new colors unless explicitly allowed
✔ NEVER change luminosity without instruction
✔ ENSURE AAA contrast when possible
✔ ENSURE consistent, premium, calm visual identity
```

---

## 🔤 2. TYPOGRAPHY (Ultra Precision)

### Font Stack
- **Primary**: `Inter`, `SF Pro Display`, system-ui
- **Secondary**: `Inter Tight`
- **Monospace**: `JetBrains Mono`, `SF Mono`

### Modular Scale (Mathematically precise)
| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| H1 | 32px | 700 | +1% |
| H2 | 26px | 600 | +1% |
| H3 | 22px | 600 | +1% |
| Body L | 18px | 400 | +0.5% |
| Body M | 16px | 400 | +0.5% |
| Body S | 14px | 400 | +0.5% |
| Caption | 12px | 400 | +0.5% |

**RULE**: Never use negative letter-spacing.

---

## 📱 3. MOBILE-FIRST — FULL-WIDTH SYSTEM (Non-Negotiable)

### Absolute Rules
```
✓ All components: 100% screen width
✓ No unnecessary horizontal padding
✓ No unnecessary borders for spacing
✓ Depth created through elevation, NOT margins
✓ No dead space on either side
```

### Layout Requirements
- Containers: **full width**
- Cards: **full width**
- Inputs: **full width**
- Buttons: **full width**
- Grids: auto-responsive (2-3 columns)

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## 🌀 4. MOTION — Apple-Level Physics

### Default Easing (ALWAYS USE)
```css
transition-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
```

### iOS-like Spring (Framer Motion)
```typescript
const springConfig = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 1,
  overshootClamping: true
};
```

### Duration Guidelines
| Type | Duration |
|------|----------|
| Microinteractions | 130-160ms |
| Screen transitions | 240-280ms |
| Gestures | 90-120ms |
| Loading states | 200ms |

### Standard Animations
```typescript
// Fade in up (default entry)
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}

// Scale tap feedback
whileTap={{ scale: 0.97 }}

// Hover lift (desktop)
whileHover={{ y: -2 }}
```

---

## 🧩 5. COMPONENT STANDARDS

### Buttons
```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  className="
    w-full                    /* Full width */
    rounded-xl                /* 12px radius */
    py-3 px-6                 /* Generous padding */
    font-medium               /* 500 weight */
    shadow-md                 /* Multi-layer shadow */
    transition-all duration-150
    bg-primary-500 text-white
    hover:bg-primary-600
  "
>
```

### Inputs
```tsx
<input className="
  w-full                    /* Full width */
  rounded-xl                /* 12px radius */
  border-[1.5px] border-gray-200
  py-3 px-4                 /* Comfortable padding */
  bg-white/50               /* Subtle background */
  shadow-inner              /* 2% inner shadow */
  placeholder:opacity-[0.38]
  focus:ring-2 focus:ring-primary-500/20
  focus:border-primary-500
"/>
```

### Cards
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="
    w-full                  /* NO lateral margins */
    rounded-2xl             /* 16px radius */
    bg-white                /* Layer 1 */
    p-4 md:p-6              /* Generous internal spacing */
    shadow-lg               /* Multi-layer depth */
    border border-gray-100
  "
>
```

### Lists
```tsx
<div className="
  divide-y divide-gray-100  /* Soft separators */
">
  <motion.div
    whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
    className="py-4 px-4"   /* Comfortable spacing */
  >
```

---

## 🌫 6. ELEVATION & SHADOWS

### Elevation Levels
| Level | Use Case | Shadow Class |
|-------|----------|--------------|
| 0 | Base elements | none |
| 1-2 | Interactive | shadow-sm |
| 3-4 | Cards | shadow-md / shadow-lg |
| 8 | Dropdowns/Modals | shadow-xl |
| 12 | Bottom sheets | shadow-2xl |

### Rule: No flat UI, no skeuomorphism
Apple-premium = balanced natural realism

---

## ⚡ 7. MICROINTERACTIONS (Ultra-Premium Feedback)

### Required for Every Action
| Action | Feedback |
|--------|----------|
| Tap | Scale to 0.97 |
| Hover (desktop) | Shadow grows +3%, lift -2px |
| Selection | Subtle bounce |
| Loading | Gentle pulse/spin |
| Success | Check + green flash |
| Error | Shake + red highlight |
| Swipe | 86% friction (Uber-style) |

---

## 🔁 8. ALIGNMENT — ZERO TOLERANCE

```
✗ NO 1px inconsistencies
✓ Everything on 8pt grid
✓ Icons aligned to baseline
✓ Visual/optical alignment mandatory
✓ Nothing should visually "float"
```

---

## 🧱 9. CODE ARCHITECTURE

### Atomic Design
```
components/
├── atoms/        # Button, Input, Icon, Badge
├── molecules/    # SearchBar, Card, ListItem
├── organisms/    # Header, FlightCard, Form
├── templates/    # PageLayout, DashboardLayout
└── ui/           # Shared primitives
```

### Component Pattern
```typescript
'use client'

import { motion } from 'framer-motion'

interface Props {
  // Typed props always
}

export function Component({ ...props }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full"
    >
      {/* Content */}
    </motion.div>
  )
}
```

---

## ♿ 10. ACCESSIBILITY — REQUIRED

- **Contrast**: AAA (7:1 for text, brand red may use fallback)
- **Text**: Fully scalable
- **Focus**: Visible focus rings
- **ARIA**: Labels on all interactive elements
- **Keyboard**: Full navigation support
- **Touch**: Hit area ≥ **44px**
- **Motion**: `prefers-reduced-motion` support

---

## ❤️ 11. EMOTIONAL EXPERIENCE

Fly2Any must evoke:
- **Safety** — Trustworthy design
- **Luxury** — Premium feel
- **Fluidity** — Smooth interactions
- **Global Presence** — Confident, international
- **Total Trust** — Calm, premium interface

### Apply Through
- Soft, natural transitions
- Subtle gradients (not harsh)
- Alive surfaces (micro-animations)
- Balanced depth
- Generous whitespace
- Reduced visual noise

---

## ✅ MANDATORY CHECKLIST (Every Code Generation)

Claude MUST always:

- [ ] Apply Ultra-Premium standard
- [ ] Use 100% width layouts
- [ ] Auto-adjust typography scale
- [ ] Apply depth logic (multi-layer shadows)
- [ ] Apply motion physics (cubic-bezier)
- [ ] Use design tokens
- [ ] Fix any alignment issues
- [ ] Improve emotional experience
- [ ] Maximize usability
- [ ] Reduce visual noise
- [ ] Guarantee absolute consistency
- [ ] Support dark mode
- [ ] Meet 44px touch targets

---

## 🚫 NEVER DO

- Horizontal padding that wastes space
- Flat, shadowless cards
- Harsh color contrasts
- Instant (0ms) transitions
- Small touch targets (< 44px)
- Negative letter-spacing
- 1px misalignments
- Desktop-first layouts
- Ignored dark mode

---

---

# 🏗️ BACKEND & ARCHITECTURE STANDARDS

---

## 🗂️ 12. PROJECT STRUCTURE

```
fly2any-fresh/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public pages
│   ├── (auth)/             # Auth pages
│   ├── account/            # User dashboard
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # React components (Atomic)
│   ├── ui/                 # Base primitives
│   ├── flights/            # Flight-specific
│   ├── account/            # Account-specific
│   └── admin/              # Admin-specific
├── lib/                    # Core business logic
│   ├── api/                # External API clients
│   ├── growth/             # Growth OS modules
│   ├── agents/             # AI agents
│   ├── email/              # Email services
│   ├── notifications/      # Notification system
│   └── utils/              # Utilities
├── prisma/                 # Database schema
├── public/                 # Static assets
└── tests/                  # E2E & unit tests
```

---

## 🔌 13. API DESIGN PATTERNS

### Route Handler Structure
```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Business logic
    const data = await getPrismaClient().resource.findMany()

    // 3. Success response
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    // 4. Error handling
    console.error('[API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

### Response Format (Consistent)
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: 'message', details?: {...} }

// Paginated
{ success: true, data: [...], pagination: { page, limit, total } }
```

---

## 🗄️ 14. DATABASE PATTERNS

### Prisma Best Practices
```typescript
// Always use getPrismaClient() for connection pooling
import { getPrismaClient } from '@/lib/prisma'

// Use select for performance
const users = await getPrismaClient().user.findMany({
  select: { id: true, email: true, name: true }
})

// Use transactions for related operations
await getPrismaClient().$transaction([
  prisma.booking.create({ data: bookingData }),
  prisma.payment.create({ data: paymentData })
])
```

### Naming Conventions
- Tables: `PascalCase` (User, Booking, PriceAlert)
- Fields: `camelCase` (userId, createdAt)
- Relations: descriptive (user, booking, alerts)

---

## ⚡ 15. PERFORMANCE STANDARDS

### Caching Strategy
```typescript
// ISR for dynamic pages
export const revalidate = 3600 // 1 hour

// Edge caching headers
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
  }
})
```

### Database Optimization
- Always use indexes on queried fields
- Use `select` to limit returned fields
- Paginate large result sets
- Use connection pooling

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={isAboveFold}
  placeholder="blur"
/>
```

---

## 🔐 16. SECURITY STANDARDS

### Authentication
```typescript
// Always check auth at route level
const session = await auth()
if (!session?.user) {
  redirect('/login')
}
```

### Input Validation
```typescript
// Use Zod for validation
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive()
})

const validated = schema.parse(body)
```

### Rate Limiting
```typescript
// Apply to sensitive endpoints
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})
```

---

## 🧪 17. TESTING STANDARDS

### E2E Tests (Playwright)
```typescript
// tests/e2e/[feature].spec.ts
import { test, expect } from '@playwright/test'

test.describe('Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/feature')
    await expect(page.getByText('Expected')).toBeVisible()
  })
})
```

### Test Coverage Requirements
- Critical paths: 100%
- API routes: 80%+
- Components: 60%+

---

## 📊 18. LOGGING & MONITORING

### Log Format
```typescript
console.log(`[Module] Action: ${detail}`)
console.error(`[Module] Error:`, error)

// Examples:
console.log('[Auth] User logged in:', userId)
console.error('[Payment] Failed:', error.message)
```

### Error Tracking
- Use Sentry for production errors
- Include context in error reports
- Set up alerts for critical errors

---

## 🚀 19. DEPLOYMENT STANDARDS

### Environment Variables
```bash
# Required
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# API Keys
DUFFEL_API_TOKEN=
GROQ_API_KEY=
MAILGUN_API_KEY=

# Optional
SENTRY_DSN=
REDIS_URL=
```

### Build Checks
```bash
# Must pass before deploy
npm run lint
npm run type-check
npm run build
npm run test
```

---

## 📝 20. CODE STYLE

### TypeScript
- Strict mode enabled
- No `any` unless absolutely necessary
- Explicit return types for functions
- Interface over type for objects

### Naming
```typescript
// Components: PascalCase
export function FlightCard() {}

// Functions: camelCase
function calculatePrice() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_RESULTS = 50

// Files: kebab-case or PascalCase for components
flight-card.tsx OR FlightCard.tsx
```

### Imports Order
```typescript
// 1. React/Next
import { useState } from 'react'
import { NextRequest } from 'next/server'

// 2. External libraries
import { motion } from 'framer-motion'

// 3. Internal components
import { Button } from '@/components/ui'

// 4. Internal utilities
import { formatPrice } from '@/lib/utils'

// 5. Types
import type { Flight } from '@/types'
```

---

## 🔥 END OF MASTER INSTRUCTIONS

**All Fly2Any code must achieve:**
🔵⚡ **Level 6 — Ultra-Premium / Apple-Class Quality**

**Frontend**: Premium UI/UX, full-width, Apple physics
**Backend**: Clean architecture, secure, performant
**Quality**: Production-ready, tested, documented
