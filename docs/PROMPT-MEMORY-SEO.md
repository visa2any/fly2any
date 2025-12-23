# PROMPT MEMORY: Fly2Any SEO/AEO/GEO/LLMCO
## Reusable Context for AI Assistants

**Purpose:** Provide persistent context for Claude, GPT, or other AI assistants working on Fly2Any SEO tasks.

---

## SYSTEM CONTEXT

```
Project: Fly2Any.com
Type: Large-scale travel booking platform
Stack: Next.js 14+ (App Router), TypeScript, Vercel Edge
Scale: 10,000+ programmatic SEO pages
Market: US primary, Global secondary
```

---

## SEO ARCHITECTURE

### Sitemap Structure
```
/sitemap-index.xml     → Master index
├── /sitemap.xml       → Core pages (~20)
├── /sitemaps/routes.xml → Flight routes (~8,350)
├── /sitemaps/cities.xml → City pages (~150)
├── /sitemaps/destinations.xml → Destinations
└── /sitemaps/blog.xml → Blog content
```

### Canonical Pattern
```typescript
// All pages use absolute self-referencing canonicals
const SITE_URL = 'https://www.fly2any.com';
alternates: { canonical: `${SITE_URL}/path` }
```

### Indexation Rules
- **Index:** /flights/*, /hotels/*, /blog/*, /destinations/*
- **Noindex:** /results/*, /auth/*, /account/*, /admin/*, /checkout/*
- **404:** Invalid route slugs via notFound()

---

## KEY FILES

| Purpose | File |
|---------|------|
| Robots.txt | `app/robots.ts` |
| Sitemap index | `app/sitemap-index.xml/route.ts` |
| Routes sitemap | `app/sitemaps/routes/route.ts` |
| Metadata utils | `lib/seo/metadata.ts` |
| Sitemap helpers | `lib/seo/sitemap-helpers.ts` |
| Flight routes | `app/flights/[route]/page.tsx` |

---

## CONSTRAINTS (STRICT)

1. **DO NOT** create new pages without canonical tags
2. **DO NOT** delete existing indexed URLs
3. **DO NOT** change URL structure without redirects
4. **DO NOT** add noindex to currently indexed pages
5. **DO NOT** modify robots.txt without review
6. **ALWAYS** use absolute URLs for canonicals
7. **ALWAYS** validate schema.org changes
8. **NEVER** show placeholder data in production

---

## SOFT 404 RULES

| Scenario | Response |
|----------|----------|
| Invalid route slug | `notFound()` → 404 |
| Valid route, no inventory | 200 + alternative content + NO Offer schema |
| Valid route with data | 200 + full content + Offer schema |

---

## AI/LLM OPTIMIZATION

### Allowed Bots
- GPTBot ✅
- ChatGPT-User ✅
- Claude-Web ✅
- PerplexityBot ✅
- Google-Extended ❌ (blocked)

### Content Guidelines
- Use declarative, factual statements
- Include FAQ schema for direct answers
- Avoid promotional superlatives
- Structure content for extraction

---

## SCHEMA.ORG STANDARDS

### Always Include
- BreadcrumbList
- FAQPage (where applicable)
- Organization (homepage)

### Conditional Include
- Offer (only with real pricing)
- FlightReservation (only with inventory)
- Product (only with availability)

---

## QUICK REFERENCE

### Add Canonical to New Page
```typescript
// In layout.tsx
export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/new-page`,
  },
};

// In dynamic page.tsx
export async function generateMetadata({ params }) {
  return {
    alternates: {
      canonical: `${SITE_URL}/path/${params.slug}`,
    },
  };
}
```

### Check if Route Valid
```typescript
import { notFound } from 'next/navigation';

const parsed = parseRouteSlug(params.route);
if (!parsed) {
  notFound(); // Returns 404
}
```

### Conditional Schema
```typescript
const schemas = [breadcrumbSchema, faqSchema];
if (hasRealPricing && price > 0) {
  schemas.push(offerSchema);
}
return <StructuredData schema={schemas} />;
```

---

## USAGE INSTRUCTIONS

When working on Fly2Any SEO:

1. **Read this document first** - Understand constraints
2. **Check existing implementation** - Don't rebuild what exists
3. **Follow canonical pattern** - Absolute self-referencing URLs
4. **Test schema changes** - Use schema.org/validator
5. **Avoid soft 404s** - Never show placeholder data
6. **Update sitemaps** - Include new indexable URLs

---

## VERSION
- Created: 2025-01-23
- Last Updated: 2025-01-23
- Maintainer: SEO Platform Engineering
