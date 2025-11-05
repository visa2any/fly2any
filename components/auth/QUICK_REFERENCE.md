# Auth Modals - Quick Reference Card

## 🚀 5-Second Start

```tsx
// 1. Wrap app
<AuthModalProvider>{children}</AuthModalProvider>

// 2. Use hook
const { showSignup, showLogin } = useAuthModal();

// 3. Trigger
<button onClick={showSignup}>Sign Up</button>
```

---

## 📦 Import

```tsx
import { AuthModalProvider, useAuthModal } from '@/components/auth/AuthModals';
```

---

## 🎯 Hook API

```tsx
const {
  showSignup,    // () => void - Opens signup modal
  showLogin,     // () => void - Opens login modal
  closeModal,    // () => void - Closes any modal
  currentModal,  // 'signup' | 'login' | null
  language,      // 'en' | 'pt' | 'es'
  setLanguage,   // (lang) => void - Change language
} = useAuthModal();
```

---

## 📍 Files

| File | Purpose |
|------|---------|
| `AuthModals.tsx` | Main component |
| `AUTH_MODALS_README.md` | Full documentation |
| `IMPLEMENTATION_GUIDE.md` | Integration steps |
| `AuthModalsExample.tsx` | Code examples |
| `app/auth-demo/page.tsx` | Live demo |

---

## 🎨 Features

- ✅ Signup & Login modals
- ✅ Multi-language (EN/PT/ES)
- ✅ Form validation
- ✅ Password strength meter
- ✅ Social auth (Google, Apple)
- ✅ 10% off incentive
- ✅ Mobile responsive
- ✅ Keyboard shortcuts (ESC)
- ✅ Success animations

---

## 🔧 Common Use Cases

### Header/Nav
```tsx
const { showLogin, showSignup } = useAuthModal();
<button onClick={showLogin}>Sign In</button>
```

### Protected Content
```tsx
if (!session) return <button onClick={showLogin}>Sign In</button>;
```

### Booking Flow
```tsx
if (!session) showSignup(); else proceedToCheckout();
```

### Language Switcher
```tsx
const { setLanguage } = useAuthModal();
<button onClick={() => setLanguage('pt')}>PT</button>
```

---

## ⚙️ Customization

### Change Discount
```tsx
// In translations object
incentiveTitle: '15% OFF',  // Change from 10%
```

### Update Features
```tsx
feature1: 'Your custom feature',
```

### Add Language
```tsx
const translations = {
  en: { /* ... */ },
  pt: { /* ... */ },
  es: { /* ... */ },
  fr: { /* Add French */ },
};
```

---

## 🔌 NextAuth Integration

### 1. Signup
```tsx
await fetch('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ email, password, firstName, lastName }),
});
```

### 2. Sign In
```tsx
import { signIn } from 'next-auth/react';
await signIn('credentials', { email, password });
```

### 3. Social
```tsx
await signIn('google'); // or 'apple'
```

---

## 🧪 Testing

```bash
# Start dev server
npm run dev

# Visit demo
http://localhost:3000/auth-demo

# Test scenarios
- Click "Sign Up"
- Click "Sign In"
- Switch languages
- Fill forms
- Check validation
- Test mobile
- Try ESC key
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Modal doesn't appear | Wrap with `AuthModalProvider` |
| Hook error | Use inside provider |
| Styling broken | Clear cache: `rm -rf .next` |
| Form doesn't submit | Check console, verify API |

---

## 📱 Responsive

- **Desktop:** Split view with benefits panel
- **Mobile:** Single column, no right panel
- **Breakpoint:** 768px (md)

---

## ♿ Accessibility

- ✅ ARIA labels
- ✅ Keyboard nav
- ✅ Focus management
- ✅ Screen reader friendly

---

## 🎯 Conversion Features

1. **10% OFF badge** - New user incentive
2. **Feature benefits** - 4 highlighted features
3. **Social proof** - "500K+ travelers"
4. **Trust indicators** - "Secure & Private"
5. **Stats** - "$50M+ Saved"
6. **Social auth** - Google & Apple

---

## 📊 Validation Rules

### Email
- Required
- Valid format: `user@domain.com`

### Password
- 8+ characters
- Uppercase letter
- Lowercase letter
- Number

### Strength
- 0-2: Weak (red)
- 3: Fair (orange)
- 4: Good (yellow)
- 5-6: Strong (green)

---

## 🎨 Design Tokens

Uses your Tailwind theme:
- `primary-*` - Main actions
- `secondary-*` - Accents
- `gray-*` - Neutrals

---

## 💡 Pro Tips

1. **Show signup before checkout** - Offer 10% off
2. **Use exit intent** - Show modal on mouse leave
3. **Time-based** - Show after 30s browsing
4. **Progressive** - Request auth when valuable
5. **Track conversions** - Monitor signup rates

---

## 🔗 Quick Links

- **Demo:** `/auth-demo`
- **Full Docs:** `AUTH_MODALS_README.md`
- **Guide:** `IMPLEMENTATION_GUIDE.md`
- **Examples:** `AuthModalsExample.tsx`

---

## 📋 Integration Checklist

- [ ] Add `AuthModalProvider` to layout
- [ ] Replace sign in button with hook
- [ ] Update AI assistant (TODO comments)
- [ ] Add to booking flow
- [ ] Set up NextAuth integration
- [ ] Configure OAuth providers
- [ ] Test all scenarios
- [ ] Deploy!

---

## 🎓 Code Snippets

### Basic Setup
```tsx
// app/layout.tsx
import { AuthModalProvider } from '@/components/auth/AuthModals';

export default function Layout({ children }) {
  return (
    <AuthModalProvider defaultLanguage="en">
      {children}
    </AuthModalProvider>
  );
}
```

### Use in Component
```tsx
'use client';
import { useAuthModal } from '@/components/auth/AuthModals';

export function Nav() {
  const { showLogin, showSignup } = useAuthModal();

  return (
    <>
      <button onClick={showLogin}>Sign In</button>
      <button onClick={showSignup}>Sign Up</button>
    </>
  );
}
```

### Protected Route
```tsx
'use client';
import { useAuthModal } from '@/components/auth/AuthModals';
import { useSession } from 'next-auth/react';

export default function ProtectedPage() {
  const { showLogin } = useAuthModal();
  const { data: session } = useSession();

  if (!session) {
    showLogin();
    return <div>Please sign in...</div>;
  }

  return <div>Protected content</div>;
}
```

---

## 📞 Support

**Issues?**
1. Check this reference
2. Read full README
3. Review examples
4. Check implementation guide

---

**Quick Reference v1.0** | Created for Fly2Any | 2025-11-04

---

### Remember:
- ✅ Simple hook API
- ✅ Zero config needed
- ✅ Works everywhere
- ✅ Beautiful by default
- ✅ Conversion optimized

**Just import, wrap, and use!** 🚀
