# Fly2Any Hreflang Strategy

## Purpose
Ensure correct language/region targeting, prevent duplicate content penalties,
and preserve authority across international versions.

---

## 1. SUPPORTED LOCALES

### Phase 1 (Launch)
| Locale | Language | Region | URL Prefix | Status |
|--------|----------|--------|------------|--------|
| en-us | English | USA | `/` or `/en-us/` | x-default |
| pt-br | Portuguese | Brazil | `/pt-br/` | Launch |
| es-mx | Spanish | Mexico | `/es-mx/` | Launch |

### Phase 2 (Future)
| Locale | Language | Region | URL Prefix |
|--------|----------|--------|------------|
| es-es | Spanish | Spain | `/es-es/` |
| en-gb | English | UK | `/en-gb/` |
| fr-fr | French | France | `/fr-fr/` |

---

## 2. HREFLANG RULES

### Self-Referencing (REQUIRED)
Every page MUST include hreflang pointing to itself:
```html
<!-- On /pt-br/flights/gru-to-mia -->
<link rel="alternate" hreflang="pt-br" href="https://www.fly2any.com/pt-br/flights/gru-to-mia" />
```

### x-default (REQUIRED)
Always include x-default pointing to the fallback version:
```html
<link rel="alternate" hreflang="x-default" href="https://www.fly2any.com/flights/gru-to-mia" />
```

### Complete Cluster (REQUIRED)
Every localized page MUST list ALL available versions:
```html
<!-- Full hreflang cluster for a route page -->
<link rel="alternate" hreflang="x-default" href="https://www.fly2any.com/flights/jfk-to-lax" />
<link rel="alternate" hreflang="en-us" href="https://www.fly2any.com/flights/jfk-to-lax" />
<link rel="alternate" hreflang="pt-br" href="https://www.fly2any.com/pt-br/flights/jfk-to-lax" />
<link rel="alternate" hreflang="es-mx" href="https://www.fly2any.com/es-mx/flights/jfk-to-lax" />
```

---

## 3. CANONICAL + HREFLANG HARMONY

### Rule: Canonical is LOCALE-SPECIFIC
```html
<!-- On /pt-br/flights/gru-to-mia -->
<link rel="canonical" href="https://www.fly2any.com/pt-br/flights/gru-to-mia" />
<link rel="alternate" hreflang="pt-br" href="https://www.fly2any.com/pt-br/flights/gru-to-mia" />
<link rel="alternate" hreflang="en-us" href="https://www.fly2any.com/flights/gru-to-mia" />
<link rel="alternate" hreflang="x-default" href="https://www.fly2any.com/flights/gru-to-mia" />
```

### Forbidden Patterns
- Canonical pointing to different locale
- Canonical to noindex page
- Circular hreflang references
- Missing self-reference

---

## 4. IMPLEMENTATION

### Generation Function
```typescript
// lib/seo/hreflang.ts
export const LOCALES = {
  'en-us': { lang: 'en', region: 'US', prefix: '', default: true },
  'pt-br': { lang: 'pt', region: 'BR', prefix: '/pt-br' },
  'es-mx': { lang: 'es', region: 'MX', prefix: '/es-mx' },
} as const;

export type LocaleCode = keyof typeof LOCALES;

const SITE_URL = 'https://www.fly2any.com';

export function generateHreflangTags(
  path: string,
  currentLocale: LocaleCode,
  availableLocales: LocaleCode[] = Object.keys(LOCALES) as LocaleCode[]
): { hreflang: string; href: string }[] {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remove any existing locale prefix
  const pathWithoutLocale = cleanPath.replace(/^\/(en-us|pt-br|es-mx)/, '');

  const tags: { hreflang: string; href: string }[] = [];

  // x-default (always en-us)
  tags.push({
    hreflang: 'x-default',
    href: `${SITE_URL}${pathWithoutLocale}`,
  });

  // All available locales
  for (const locale of availableLocales) {
    const config = LOCALES[locale];
    tags.push({
      hreflang: locale,
      href: `${SITE_URL}${config.prefix}${pathWithoutLocale}`,
    });
  }

  return tags;
}

export function getCanonicalForLocale(path: string, locale: LocaleCode): string {
  const config = LOCALES[locale];
  const cleanPath = path.replace(/^\/(en-us|pt-br|es-mx)/, '');
  return `${SITE_URL}${config.prefix}${cleanPath}`;
}
```

### Metadata Integration
```typescript
// In page metadata generation
import { generateHreflangTags, getCanonicalForLocale, LocaleCode } from '@/lib/seo/hreflang';

export function generateLocalizedMetadata(
  path: string,
  locale: LocaleCode,
  baseMetadata: Metadata
): Metadata {
  const hreflangTags = generateHreflangTags(path, locale);
  const canonical = getCanonicalForLocale(path, locale);

  return {
    ...baseMetadata,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        hreflangTags.map(tag => [tag.hreflang, tag.href])
      ),
    },
  };
}
```

---

## 5. SITEMAP HREFLANG

### Sitemap Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.fly2any.com/flights/jfk-to-lax</loc>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.fly2any.com/flights/jfk-to-lax"/>
    <xhtml:link rel="alternate" hreflang="en-us" href="https://www.fly2any.com/flights/jfk-to-lax"/>
    <xhtml:link rel="alternate" hreflang="pt-br" href="https://www.fly2any.com/pt-br/flights/jfk-to-lax"/>
    <xhtml:link rel="alternate" hreflang="es-mx" href="https://www.fly2any.com/es-mx/flights/jfk-to-lax"/>
    <lastmod>2025-12-23</lastmod>
  </url>
</urlset>
```

---

## 6. VALIDATION CHECKLIST

### Pre-Launch
- [ ] Every page has self-referencing hreflang
- [ ] Every page has x-default
- [ ] Canonical matches hreflang self-reference
- [ ] All cluster pages link to each other
- [ ] Sitemap includes hreflang annotations
- [ ] No 4xx pages in hreflang clusters

### Post-Launch Monitoring
- [ ] GSC International Targeting report
- [ ] Hreflang errors in GSC
- [ ] Index coverage per locale
- [ ] Traffic by locale

---

## 7. COMMON ERRORS TO AVOID

| Error | Prevention |
|-------|------------|
| Missing self-reference | Automated generation |
| Return links missing | Generate full clusters |
| Incorrect language codes | Use ISO 639-1 + ISO 3166-1 |
| x-default pointing to noindex | x-default must be indexable |
| Canonical conflicts | Canonical = locale-specific URL |

---

## Version
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Quarterly
