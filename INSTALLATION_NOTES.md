# Installation Notes for Loading Components

## Required Dependencies

The loading components require two utility packages that need to be installed:

```bash
npm install clsx tailwind-merge
```

### What are these packages?

1. **clsx** (~1KB) - Utility for constructing className strings conditionally
   - Used to combine Tailwind classes dynamically
   - Example: `clsx('base-class', condition && 'conditional-class')`

2. **tailwind-merge** (~5KB) - Merges Tailwind CSS classes without conflicts
   - Prevents duplicate/conflicting Tailwind classes
   - Example: `twMerge('p-4 p-6')` → `'p-6'` (keeps the last one)

### How they work together

The `cn()` utility in `lib/utils.ts` combines both:

```tsx
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This allows us to write clean component props:

```tsx
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className // user overrides
)} />
```

---

## Installation Steps

### 1. Install Dependencies

```bash
npm install clsx tailwind-merge
```

### 2. Verify Installation

Check that they appear in `package.json`:

```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  }
}
```

### 3. Test the Components

```tsx
import { LoadingSpinner } from '@/components/loading';

function Test() {
  return <LoadingSpinner size="medium" color="primary" />;
}
```

---

## Alternative: Use Without Dependencies

If you prefer not to install dependencies, you can replace `cn()` with a simpler version:

### Replace `lib/utils.ts`:

```tsx
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
```

**Note**: This won't handle Tailwind class conflicts, but will work for basic usage.

---

## TypeScript Support

Both packages include TypeScript definitions:

- `clsx` - includes `@types/clsx`
- `tailwind-merge` - includes types natively

No additional `@types/` packages needed!

---

## Bundle Size Impact

- **clsx**: ~1KB gzipped
- **tailwind-merge**: ~5KB gzipped
- **Total**: ~6KB gzipped

This is minimal and provides significant developer experience improvements.

---

## Verification Commands

```bash
# Check if installed
npm list clsx tailwind-merge

# Should output:
# ├── clsx@2.x.x
# └── tailwind-merge@2.x.x
```

---

## Troubleshooting

### Error: Cannot find module 'clsx'

**Solution**: Install dependencies
```bash
npm install clsx tailwind-merge
```

### Error: Module not found: Can't resolve '@/lib/utils'

**Solution**: The file exists at `lib/utils.ts` - check your tsconfig.json has the path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### TypeScript errors about ClassValue

**Solution**: Restart TypeScript server in your IDE
- VSCode: Cmd/Ctrl + Shift + P → "Restart TypeScript Server"

---

## Ready to Use!

Once installed, all loading components will work perfectly:

```tsx
import { LoadingSpinner, PrimaryButton, LoadingBar } from '@/components/loading';
import { FlightCardSkeleton, HotelCardSkeleton } from '@/components/skeletons';

// All ready to use!
```
