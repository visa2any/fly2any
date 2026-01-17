# Newsletter System - Implementation Guide

## ✅ Current Status (Phase 1 - Completed)

- API route created: `/api/newsletter/subscribe`
- Form validation & error handling
- Loading states & user feedback
- GDPR compliance notice
- Double opt-in architecture (ready for Phase 2)

## 🔧 Phase 2 - Database Integration (TODO)

### Database Schema (Prisma/PostgreSQL)

```prisma
model NewsletterSubscriber {
  id            String   @id @default(uuid())
  email         String   @unique
  source        String   // "blog-article", "homepage", etc.
  confirmToken  String?  @unique
  confirmed     Boolean  @default(false)
  subscribedAt  DateTime @default(now())
  confirmedAt   DateTime?
  unsubscribedAt DateTime?
  preferences   Json?    // {"frequency": "weekly", "topics": ["flights", "hotels"]}
  
  @@index([email])
  @@index([confirmed])
}
```

### Implementation Steps:

1. **Add to `prisma/schema.prisma`**
2. **Run migration**: `npx prisma migrate dev --name add_newsletter`
3. **Update API route** to save subscriptions
4. **Create confirmation route**: `/app/api/newsletter/confirm/route.ts`
5. **Create unsubscribe route**: `/app/api/newsletter/unsubscribe/route.ts`

## 📧 Phase 3 - Email Integration (TODO)

### Provider Options:
- **Resend** (recommended) - Modern, affordable, great DX
- **SendGrid** - Enterprise-grade, complex
- **Postmark** - Transactional focus
- **Mailchimp** - Marketing focus

### Email Templates Needed:

1. **Confirmation Email**
   - Subject: "Confirm Your Fly2Any Newsletter Subscription"
   - CTA button to `/newsletter/confirm?token=xxx`
   - Unsubscribe link

2. **Welcome Email**
   - Sent after confirmation
   - Set expectations
   - First value delivery

3. **Weekly Newsletter**
   - Curated flight deals
   - Blog highlights
   - Travel tips

### Resend Implementation Example:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Fly2Any <newsletter@fly2any.com>',
  to: email,
  subject: 'Confirm Your Subscription',
  react: ConfirmationEmailTemplate({ confirmUrl }),
});
```

## 🛡️ Compliance Checklist

✅ **CAN-SPAM Act (US)**
- Clear sender identity
- Physical address in footer
- One-click unsubscribe
- Honor opt-outs within 10 days

✅ **GDPR (EU)**
- Explicit consent (double opt-in)
- Right to access data
- Right to deletion
- Privacy policy link

✅ **CASL (Canada)**
- Express consent required
- Unsubscribe mechanism

## 🔒 Security Best Practices

- Rate limiting (max 5 signups per IP/hour)
- Email validation (regex + DNS check)
- Token expiry (24 hours for confirmation)
- Unsubscribe tokens (never expire)
- HTTPS only
- No PII in logs

## 📊 Analytics to Track

- Subscription rate (form submissions vs confirms)
- Source attribution (blog vs homepage)
- Open rates
- Click rates
- Unsubscribe rate
- Bounce rate

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install @prisma/client resend

# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev

# Seed test data
npx prisma db seed
```

## 🔗 Required Environment Variables

```env
DATABASE_URL="postgresql://..."
RESEND_API_KEY="re_..."
NEXT_PUBLIC_APP_URL="https://www.fly2any.com"
```

## 📝 Testing Checklist

- [ ] Valid email submission works
- [ ] Invalid email shows error
- [ ] Duplicate email shows proper message
- [ ] Confirmation email sent
- [ ] Confirmation link works
- [ ] Unsubscribe link works
- [ ] Rate limiting prevents spam
- [ ] Mobile responsive
- [ ] Loading states work
- [ ] Error states work

---

**Current Phase**: Phase 1 ✅ (Frontend + API scaffold)  
**Next Phase**: Phase 2 (Database integration)  
**Timeline**: 2-4 hours for full implementation
