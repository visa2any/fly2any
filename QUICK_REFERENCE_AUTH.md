# Quick Reference: Using Auth in Next.js App

## When to Use Which Auth Import

### 🔵 Use `lib/auth-edge.ts`
**For: Middleware and Edge Runtime**

```typescript
// middleware.ts
import { authEdge } from '@/lib/auth-edge';

export default authEdge((req) => {
  // Your middleware logic
});
```

**Key points:**
- JWT-only sessions
- No database access
- Must be under 1 MB
- Fast edge execution

---

### 🟢 Use `lib/auth.ts`
**For: API Routes and Server Components**

```typescript
// app/api/some-route/route.ts
import { auth } from '@/lib/auth';

export const runtime = 'nodejs'; // ⚠️ REQUIRED

export async function GET() {
  const session = await auth();
  // Your logic with full database access
}
```

```typescript
// app/some-page/page.tsx
import { auth } from '@/lib/auth';

export const runtime = 'nodejs'; // ⚠️ REQUIRED

export default async function Page() {
  const session = await auth();
  // Your logic with full database access
}
```

**Key points:**
- Full Prisma database access
- Bcryptjs password hashing
- Must export `runtime = 'nodejs'`
- Runs on serverless functions

---

## Common Patterns

### Protected Server Component
```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export default async function ProtectedPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return <div>Welcome {session.user.name}</div>;
}
```

### Protected API Route
```typescript
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your protected logic
  return Response.json({ data: 'Protected data' });
}
```

### Middleware Route Protection
```typescript
// middleware.ts
import { authEdge } from '@/lib/auth-edge';
import { NextResponse } from 'next/server';

export default authEdge((req) => {
  const isProtected = req.nextUrl.pathname.startsWith('/dashboard');

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
```

---

## Troubleshooting

### ❌ Error: "Edge Function size exceeded"
**Problem:** You imported `@/lib/auth` in middleware.ts

**Solution:** Use `@/lib/auth-edge` instead
```typescript
// ❌ Wrong
import { auth } from '@/lib/auth';

// ✅ Correct
import { authEdge } from '@/lib/auth-edge';
```

---

### ❌ Error: "PrismaClient is not supported in Edge Runtime"
**Problem:** Your file is running in Edge Runtime but uses Prisma

**Solution:** Add `export const runtime = 'nodejs'`
```typescript
// Add this line at the top of your file
export const runtime = 'nodejs';
```

---

### ❌ Error: "bcryptjs cannot be used in Edge Runtime"
**Problem:** Your file is running in Edge Runtime but uses password hashing

**Solution:** Add `export const runtime = 'nodejs'`
```typescript
export const runtime = 'nodejs';
```

---

## File Structure

```
lib/
├── auth-edge.ts        → Edge-compatible (middleware)
├── auth.ts            → Node.js runtime (API routes, pages)
└── auth.config.ts     → Shared configuration

app/
├── middleware.ts      → Uses auth-edge.ts
├── api/
│   └── */route.ts    → Uses auth.ts + runtime = 'nodejs'
└── **/page.tsx       → Uses auth.ts + runtime = 'nodejs' (if Prisma)
```

---

## Decision Tree

```
Do you need auth?
│
├─ In middleware.ts?
│  └─ Use: lib/auth-edge.ts
│
├─ In API route?
│  └─ Use: lib/auth.ts + export runtime = 'nodejs'
│
├─ In server component?
│  ├─ Need database access?
│  │  └─ Use: lib/auth.ts + export runtime = 'nodejs'
│  └─ Just need session?
│     └─ Use: lib/auth.ts + export runtime = 'nodejs'
│
└─ In client component?
   └─ Use: useSession() from next-auth/react
```

---

## Quick Checklist

Before deploying:
- [ ] Middleware imports `authEdge` from `lib/auth-edge.ts`
- [ ] API routes using Prisma have `export const runtime = 'nodejs'`
- [ ] Server components using Prisma have `export const runtime = 'nodejs'`
- [ ] Build completes without "Edge Function size exceeded" error
- [ ] Middleware bundle shows < 1 MB in build output

---

## Need Help?

See `EDGE_RUNTIME_FIX.md` for detailed explanation of the architecture.
