# NextAuth v5 Import Fix Guide

## Problem
Build fails with error: `Module '"next-auth"' has no exported member 'getServerSession'`

## Root Cause
The project uses **NextAuth v5** which has a different auth pattern than v4:
- ❌ Old (v4): `getServerSession(authOptions)`
- ✅ New (v5): `auth()`

## Solution

### In Server Components & API Routes

**BEFORE (v4 pattern - WRONG):**
```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  // ...
}
```

**AFTER (v5 pattern - CORRECT):**
```typescript
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  // ...
}
```

### Files That Need Updating

#### Phase 8 - Client Management Files:
- ❌ `app/agent/clients/page.tsx` (line 1)
- ❌ `app/agent/clients/[id]/page.tsx` (line 1)
- ❌ `app/api/agents/clients/[id]/notes/route.ts` (lines 1-2)

#### Phase 10 - PDF Generation Files:
- ❌ `app/api/agents/quotes/[id]/pdf/route.ts` (lines 4-5)
- ❌ `app/api/agents/quotes/[id]/email-pdf/route.ts` (lines 4-5)

### Quick Fix Script

Run this to fix all Phase 8 and 10 files:

```bash
# Find all files with old pattern
grep -r "getServerSession" app/agent/clients app/api/agents/quotes --include="*.tsx" --include="*.ts"

# Manual replacement needed in each file:
# 1. Replace: import { getServerSession } from "next-auth/next";
#    With:    import { auth } from "@/lib/auth";
#
# 2. Replace: import { getServerSession } from "next-auth";
#    With:    import { auth } from "@/lib/auth";
#
# 3. Remove:  import { authOptions } from "@/lib/auth";
#
# 4. Replace: const session = await getServerSession(authOptions);
#    With:    const session = await auth();
```

## Files Already Using Correct Pattern

These files already use `auth()` and don't need changes:
- ✅ All Phase 7 files (agent portal)
- ✅ All Phase 9 files (quote builder)
- ✅ All Phase 11 files (client portal)
- ✅ All core API files created before Phase 8

## Why This Happened

Phase 8 and Phase 10 were created using the older NextAuth v4 pattern for imports. The rest of the codebase uses NextAuth v5's `auth()` function correctly.

## Testing After Fix

```bash
# Should pass without errors
npm run build

# Should show no warnings about getServerSession
npx tsc --noEmit
```

## Notes

- NextAuth v5 is still in beta but is production-ready
- The `auth()` function is simpler and more performant
- No need to pass `authOptions` around anymore
- Session handling is identical, just different import pattern
