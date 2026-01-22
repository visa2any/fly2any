# Schema Validation CI/CD Safety Gate
## Production-Grade SEO Governance for Fly2Any

**Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Status:** ✅ Active

---

## Overview

This document describes the CI/CD safety gate that validates JSON-LD Schema.org data before deployment. Invalid schemas **BLOCK** deployment, ensuring SEO integrity in production.

---

## What is Validated

The validation gate checks all Schema.org types used in the application:

| Schema Type | Purpose | Components |
|-------------|---------|-------------|
| **Organization** | Google Knowledge Graph | Homepage |
| **WebSite** | SearchAction potentialAction | Homepage |
| **FAQPage** | Rich Results eligibility | FAQ page |
| **LodgingBusiness** | Google Hotel Pack | Hotels section |
| **TouristTrip** | Google Activity Pack | Tours section |
| **Flight** | Flight rich results | Flight cards |
| **Product** | Shopping results | Pricing pages |
| **Review** | Rating stars | All review sections |
| **BreadcrumbList** | Navigation breadcrumbs | All pages |
| **Event** | Event listings | Tours/Activities |

---

## How It Works

### 1. Validation Trigger

The validation runs in two places:

#### Local Development
```bash
npm run validate:schemas
```

#### CI/CD Pipeline (GitHub Actions)
Runs automatically on:
- Push to `main` branch
- Push to `develop` branch
- Pull requests to `main` or `develop`

### 2. Validation Logic

The validator checks each schema for:

✅ **Required Fields** (CRITICAL - Blocks Deployment)
- `@type` must be valid Schema.org type
- `@context` must be `https://schema.org`
- Type-specific required fields (e.g., `name`, `url`)

✅ **Optional Fields** (HIGH - Blocks Deployment)
- URLs must be valid and accessible
- Dates must be ISO 8601 format
- Emails must be RFC 5322 format
- Prices must be positive numbers

⚠️ **Recommended Fields** (WARNING - Allows Deployment)
- `logo`, `image` for better appearance
- `description` for context
- `aggregateRating` for social proof
- `contactPoint` for trust signals

### 3. Severity Levels

| Severity | Impact | CI/CD Action |
|----------|---------|---------------|
| **CRITICAL** | Missing required fields | ❌ BLOCKS deployment |
| **HIGH** | Invalid URL, date, email | ❌ BLOCKS deployment |
| **MEDIUM** | Inconsistent data | ⚠️ Warning only |
| **LOW** | Missing recommended fields | ⚠️ Warning only |

---

## File Structure

```
fly2any-fresh/
├── scripts/
│   └── validate-schemas.ts          # Main validation script
├── lib/
│   └── seo/
│       └── schema-validator.ts        # Validation logic
├── .github/
│   └── workflows/
│       └── ci-cd.yml               # GitHub Actions workflow
└── package.json                    # NPM scripts
```

---

## CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Validate SEO Schemas │
              └────────────────────────┘
                           │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
         ✅ PASS               ❌ FAIL
              │                     │
              ▼                     ▼
    ┌─────────────┐         ┌─────────────┐
    │   Lint      │         │  STOP BUILD │
    └─────────────┘         └─────────────┘
              │
              ▼
    ┌─────────────┐
    │   Build     │
    └─────────────┘
              │
              ▼
    ┌─────────────┐
    │  Deploy     │
    └─────────────┘
```

---

## Usage Examples

### Local Testing

**Validate all schemas:**
```bash
npm run validate:schemas
```

**Expected output (valid):**
```
======================================================================
🔍 SCHEMA VALIDATION - CI/CD SAFETY GATE
======================================================================

✅ ALL SCHEMAS VALID - DEPLOYMENT APPROVED
======================================================================

✅ Schema validation completed successfully.
```

**Expected output (invalid):**
```
======================================================================
❌ SCHEMA VALIDATION FAILED - DEPLOYMENT BLOCKED
======================================================================

🚫 Critical or High severity errors must be fixed before deployment.
🔧 Review the errors above and update the schemas.
======================================================================

Process exited with code 1
```

### Adding New Schema Validation

To add a new schema to the validation gate:

1. **Open** `scripts/validate-schemas.ts`
2. **Add** entry to `SCHEMA_VALIDATION_TARGETS`:

```typescript
const SCHEMA_VALIDATION_TARGETS = {
  // ... existing schemas ...
  
  myNewPage: {
    name: 'My New Page Schema',
    validate: () => {
      const mySchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'My Product',
        // ... other fields
      };
      
      return validateSchema(mySchema);
    },
  },
};
```

3. **Run** validation locally:
```bash
npm run validate:schemas
```

4. **Commit** and push - CI/CD will validate automatically

---

## Troubleshooting

### Issue: Validation fails locally

**Solution:**
1. Review the error message in the validation output
2. Check the schema structure in `lib/seo/geo-optimization.ts`
3. Ensure all required fields are present
4. Verify URLs, dates, emails are properly formatted

### Issue: Validation fails in CI but passes locally

**Solution:**
1. Ensure `tsx` is installed: `npm install tsx --save-dev`
2. Check that dependencies are installed in CI
3. Verify the script path is correct in `.github/workflows/ci-cd.yml`

### Issue: Want to deploy despite warnings

**Solution:**
- Warnings (MEDIUM/LOW severity) do NOT block deployment
- Only CRITICAL and HIGH severity errors block deployment
- Review warnings and fix them when possible, but deployment will proceed

### Issue: Need to temporarily disable validation

**Warning:** This is NOT recommended for production.

**For emergency only:**
1. Comment out the validation step in `.github/workflows/ci-cd.yml`
2. Push changes
3. Fix the schema issue
4. Uncomment validation step
5. Push again

---

## Best Practices

### DO ✅

- ✅ Run `npm run validate:schemas` before committing
- ✅ Fix all CRITICAL and HIGH severity errors
- ✅ Review and address warnings when possible
- ✅ Add new schemas to the validation gate immediately
- ✅ Keep schema validators up to date with Schema.org changes

### DON'T ❌

- ❌ Comment out validation in CI/CD
- ❌ Push code with CRITICAL errors
- ❌ Ignore HIGH severity errors (URLs, dates, emails)
- ❌ Skip validation for "quick fixes"
- ❌ Deploy schemas without testing locally

---

## Performance

| Metric | Value |
|--------|-------|
| Execution Time | < 2 seconds |
| Memory Usage | < 50MB |
| CI/CD Impact | Minimal |
| Build Time Overhead | ~2 seconds |

---

## Maintenance

### Monthly Tasks

- [ ] Review schema.org for type updates
- [ ] Update validator types if needed
- [ ] Add new schemas to validation targets
- [ ] Review warnings and prioritize fixes

### On Schema Changes

When adding new schema types to the application:

1. Add to `lib/seo/schema-validator.ts` if not supported
2. Add validation target to `scripts/validate-schemas.ts`
3. Run validation locally
4. Update this documentation

---

## References

- [Schema.org Documentation](https://schema.org/)
- [Google Rich Results Testing Tool](https://search.google.com/test/rich-results)
- [Google Structured Data Markup Helper](https://www.google.com/webmasters/markup-helper/)

---

## Support

For issues or questions about the schema validation system:

1. Check this documentation first
2. Review error messages carefully
3. Check `lib/seo/schema-validator.ts` for validator logic
4. Contact the SEO team for schema-specific questions

---

## Changelog

### Version 1.0.0 (2026-01-22)
- ✅ Initial implementation
- ✅ CI/CD integration with GitHub Actions
- ✅ Support for 10 Schema.org types
- ✅ Exit code integration for pipeline failures
- ✅ Color-coded console output
- ✅ Validation summary with errors/warnings count

---

**End of Documentation**
