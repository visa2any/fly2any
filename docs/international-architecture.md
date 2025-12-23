# Fly2Any International Architecture

## Current State Audit (December 2025)

### URL Structure
| Pattern | Current | Status |
|---------|---------|--------|
| Homepage | `fly2any.com` | Single-language |
| Flights | `/flights/[route]` | No locale prefix |
| Destinations | `/destinations/[city]` | No locale prefix |
| Airlines | `/airlines/[code]` | No locale prefix |

### Language Handling
- **Detection**: Browser `Accept-Language` header
- **Storage**: Cookie `fly2any_language`
- **Supported**: `en`, `pt`, `es`
- **URL-based**: NO (cookie-based only)
- **Content**: English only

### Currency Handling
- **Detection**: Vercel Edge geo-location
- **Storage**: Cookie `fly2any_currency`
- **Supported**: 35+ currencies
- **Conversion**: ExchangeRate-API (1hr cache)
- **Status**: FULLY IMPLEMENTED

### hreflang Status
- **Declared**: In metadata types
- **Implemented**: NO
- **x-default**: Missing

---

## Risks & Gaps

### Critical Gaps
| Gap | Risk | Priority |
|-----|------|----------|
| No hreflang tags | Authority dilution, duplicate content | HIGH |
| No URL-based locale | Poor international SEO | HIGH |
| Single-language content | Limited market reach | MEDIUM |
| No locale-aware schema | Missing structured data for locales | MEDIUM |

### Opportunities
| Opportunity | Impact |
|-------------|--------|
| PT-BR market (220M) | Large Portuguese-speaking market |
| ES market (500M+) | Spanish-speaking Americas |
| EUR market | High purchasing power |

---

## Recommended URL Strategy

### Option A: Language-First Subfolders (RECOMMENDED)
```
fly2any.com/           → en-US (default, x-default)
fly2any.com/pt-br/     → Portuguese Brazil
fly2any.com/es-mx/     → Spanish Mexico
fly2any.com/es-es/     → Spanish Spain (future)
```

### Rationale
1. **Single domain** - Preserves domain authority
2. **Clear language signal** - Google understands locale
3. **Scalable** - Easy to add new markets
4. **No IP redirects** - User choice respected
5. **Consolidated GSC** - Single property management

### Rejected Options
| Option | Reason |
|--------|--------|
| Subdomains (pt.fly2any.com) | Splits authority, complex setup |
| ccTLDs (fly2any.com.br) | Expensive, hard to manage |
| Query params (?lang=pt) | Poor SEO signal |
| Cookie-only (current) | Invisible to crawlers |

---

## Migration Plan

### Phase 1: Foundation (Week 1-2)
1. Implement locale routing middleware
2. Create hreflang generation system
3. Set up URL structure `/[locale]/path`
4. Default (/) redirects to /en-us/ for new users OR serves x-default

### Phase 2: Content (Week 3-4)
1. Set up translation workflow
2. Implement locale-aware metadata
3. Create localized answer blocks
4. Update schema for locale

### Phase 3: Launch (Week 5)
1. Deploy locale routing
2. Submit hreflang sitemap
3. Announce in GSC
4. Monitor coverage

---

## Technical Requirements

### Middleware Changes
```typescript
// Add locale detection to existing middleware
const SUPPORTED_LOCALES = ['en-us', 'pt-br', 'es-mx'] as const;
const DEFAULT_LOCALE = 'en-us';

// Detect from URL path first, then cookie, then browser
function getLocale(req: NextRequest): string {
  const pathLocale = req.nextUrl.pathname.split('/')[1];
  if (SUPPORTED_LOCALES.includes(pathLocale)) return pathLocale;

  const cookieLocale = req.cookies.get('fly2any_locale')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;

  // Browser detection fallback
  return detectBrowserLocale(req.headers.get('accept-language'));
}
```

### Next.js Config
```typescript
// next.config.js - DO NOT use built-in i18n (deprecated in App Router)
// Use middleware + folder structure instead
```

### Folder Structure
```
app/
├── [locale]/
│   ├── flights/
│   │   └── [route]/
│   ├── destinations/
│   │   └── [city]/
│   └── page.tsx (homepage)
├── layout.tsx (root - handles locale detection)
```

---

## Do NOT Break

- Existing canonical system
- Entity graph @id references
- Schema.org markup
- Conversion tracking
- Search governance rules
- LLM governance

---

## Version
- Created: 2025-12-23
- Status: AUDIT COMPLETE
- Owner: SEO Platform Engineering
