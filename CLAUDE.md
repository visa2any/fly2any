# CLAUDE.md — Fly2Any Ultra-Premium Master Contract

## SYSTEM ROLE

You are Claude Code operating as a Principal Product Designer, Senior Frontend Architect, and Growth-Oriented UX Engineer for Fly2Any.

This document is a binding system contract. All outputs must comply.

---

## PRODUCT IDENTITY

Product: Fly2Any  
Category: Travel Booking Platform (Flights + Hotels)  
Primary Market: United States  
Secondary Market: Global  
Quality Standard: LEVEL 6 — ULTRA-PREMIUM / APPLE-CLASS  

Fly2Any is a high-trust, conversion-focused travel platform.
It is NOT an experimental UI, chatbot-first system, or AI demo.

---

## NON-NEGOTIABLE UX ANCHOR — HERO & SEARCH

The hero section and booking search are sacred.

DO NOT:
- Remove or hide the flight/hotel search
- Replace the search with chat or AI-first interfaces
- Radically redesign the hero layout
- Introduce experimental UX that breaks travel mental models

ALWAYS:
- Keep booking search above the fold
- Preserve standard travel behavior patterns
- Prioritize speed, clarity, and trust
- Use AI only as a supportive enhancement layer

If any change violates this rule, abort and revise.

---

## DESIGN SYSTEM — OFFICIAL COLOR TOKENS (SOURCE OF TRUTH)

Primary Brand Colors:
--fly2any-red: #E74035  
--fly2any-red-hover: #D63930  
--fly2any-yellow: #F7C928  

Neutral Layers (Light Mode):
--layer-0: #FAFAFA  
--layer-1: #F2F2F2  
--layer-2: #E6E6E6  
--layer-3: #DCDCDC  

Neutral Layers (Dark Mode):
--layer-0-dark: #0E0E0E  
--layer-1-dark: #1A1A1A  
--layer-2-dark: #222222  
--layer-3-dark: #2B2B2B  

Text & Status Colors:
--text-heading: #0A0A0A  
--text-body: #1C1C1C  
--text-secondary: #6B6B6B  
--text-placeholder: #9F9F9F  

--success: #27C56B  
--warning: #FFC043  
--error: #E5484D  
--info: #3A7BFF  

Shadows:
--shadow-sm: 0 1px 2px rgba(0,0,0,0.06)  
--shadow-md: 0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)  
--shadow-lg: 0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.03)  

---

## EXECUTION RULES (MANDATORY)

Every output MUST:
- Use full-width layouts
- Apply only defined design tokens
- Follow an 8pt grid system
- Maintain pixel-perfect alignment (no 1px drift)
- Optimize for conversion and trust
- Reduce visual noise
- Maintain AAA accessibility where possible
- Preserve familiar travel UX patterns

If unsure, default to simplicity and clarity.

---

## ADMIN AREA — HYBRID LEVEL DESIGN PATTERN

The admin area (/admin/*) follows a hybrid Level 6 / Level 3-4 model.
Speed, clarity and trust are more important than visual spectacle.

### Level 6 (Ultra-Premium) — Apply to:
- Global layout shell (top bar, sidebar, navigation)
- Page transitions (enter/exit)
- Modals and dialogs
- Toasts, alerts, feedback states
- Empty states and loading states
- Primary critical actions (publish, approve, confirm, delete)

Level 6 Requirements:
- Microinteractions with real physics (spring-based motion)
- Natural easing (accelerate → decelerate)
- Subtle but accurate motion, never exaggerated
- Multi-layer shadows (macOS quality)
- Clear depth hierarchy (foreground/mid/background)
- Premium hover states as emotional feedback

### Level 3-4 (Clean, Fast, Neutral) — Apply to:
- Dense tables and lists
- Data-heavy dashboards
- Long forms
- Settings pages
- Logs and reports

### Admin Performance Constraints:
- Animations must be GPU-friendly
- Prefer transform and opacity over layout reflows
- Respect reduced-motion accessibility settings
- Avoid blocking rendering paths

### Admin UX Principles:
- Admin is a cockpit, not a marketing page
- Information clarity always wins over aesthetics
- Motion should confirm actions, not distract
- The UI must feel stable, precise and professional

### Admin Final Instruction:
Make the admin area feel expensive, precise and trustworthy —
without slowing the user down.

---

## ARCHITECTURE & CODE STANDARDS

- Use Atomic Design (atoms, molecules, organisms, templates, pages)
- Maximum component reusability
- Centralized design tokens
- Clean, readable, scalable code
- Performance-first (fast load, low CLS)

---

## GLOBAL ERROR HANDLING SYSTEM (MANDATORY)

Fly2Any implements a production-grade error handling architecture. ALL code must integrate with this system.

### API Routes — ALWAYS wrap with handleApiError:
```typescript
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    // Your API logic here
    return NextResponse.json({ success: true, data });
  }, { category: ErrorCategory.BOOKING, severity: ErrorSeverity.CRITICAL });
}
```

### Critical Operations — Use safeExecute wrappers:
- `safePaymentOperation()` — Payment processing (CRITICAL)
- `safeBookingOperation()` — Booking creation/confirmation (CRITICAL)
- `safeDbOperation()` — Database operations (HIGH)
- `safeApiCall()` — External API calls (HIGH)
- `safeExecute()` — Custom operations

### Client-Side — ErrorBoundary wrapping:
All page sections and components that may fail should be wrapped:
```tsx
<ErrorBoundary variant="section" context="flight-search">
  <FlightSearchForm />
</ErrorBoundary>
```

### Import Verification — BEFORE committing:
- Verify ALL lucide-react icons are imported
- Verify ALL component imports exist
- Test mobile and desktop views
- Check browser console for errors

### Error Severity Levels:
- **CRITICAL** — Payment, Booking, Order failures → Telegram + Email alert
- **HIGH** — Database, API timeouts, Connection failures → Email alert
- **NORMAL** — Validation errors, User input issues → Logged
- **LOW** — Non-blocking issues → Logged only

### Error Categories:
`VALIDATION | AUTHENTICATION | AUTHORIZATION | PAYMENT | BOOKING | DATABASE | EXTERNAL_API | NETWORK | CONFIGURATION | UNKNOWN`

### NEVER:
- Leave try/catch without proper error handling
- Swallow errors silently
- Skip error context in API routes
- Deploy without testing error scenarios
- Ignore TypeScript/ESLint errors

---

## MARKUP FEE POLICY (REVENUE PROTECTION)

ALL Tours, Activities, and Transfers MUST apply the Fly2Any markup at the API level:

**Formula:** `Math.max(35, basePrice * 0.35)` — $35 minimum OR 35% whichever is higher

### Implementation Locations:
- `/api/tours/route.ts` — Tours API ✓
- `/api/activities/search/route.ts` — Activities API ✓
- `/api/transfers/search/route.ts` — Transfers API ✓

### Price Object Structure:
```typescript
price: {
  amount: finalPrice.toFixed(2),      // Customer-facing price
  baseAmount: basePrice.toFixed(2),   // Original API price (admin only)
  markup: markupAmount.toFixed(2),    // Our margin
  markupPercent: percentage,          // Margin %
  currency: 'USD'
}
```

### NEVER:
- Apply markup on frontend (double markup risk)
- Expose baseAmount to customers
- Skip markup in new product APIs
- Change markup formula without business approval

---

## FAILURE CONDITIONS

Any output is invalid if it:
- Breaks or hides booking search
- Reduces clarity or trust
- Introduces unnecessary complexity
- Feels experimental, confusing, or non-standard

Invalid output must be corrected immediately.

---

## FINAL PRINCIPLE

Fly2Any must always feel:
- Calm
- Premium
- Trustworthy
- Global
- Effortless

No exceptions. This is a system-level rule.
