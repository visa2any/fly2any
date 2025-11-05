# Authentication Modals System

A comprehensive, conversion-optimized authentication modal system for Fly2Any with beautiful design, multi-language support, and seamless integration capabilities.

## Features

### 🎨 **Beautiful Design**
- Modern, glass-morphism inspired UI
- Smooth animations and transitions
- Mobile-responsive layout
- Matches Fly2Any brand colors and design language
- Split-view design with benefits showcase

### 🌍 **Multi-Language Support**
- English (EN)
- Portuguese (PT)
- Spanish (ES)
- Easy to add more languages

### 🔐 **Security & Validation**
- Email format validation
- Password strength indicator
- Real-time form validation
- Secure password toggle
- ARIA labels for accessibility

### 💰 **Conversion Optimized**
- Prominent 10% off incentive for signups
- Social proof (stats, testimonials)
- Feature benefits highlighted
- Trust badges and security indicators
- Smooth success animations

### 🚀 **Integration Ready**
- React Context API for global state
- NextAuth.js compatible (placeholder included)
- Custom auth backend compatible
- Easy to integrate anywhere in your app

### ⚡ **User Experience**
- ESC key to close
- Click backdrop to close
- Loading states
- Success animations
- Error handling
- Password strength meter
- Auto-focus on first input

## Installation

The component is already created at:
```
C:\Users\Power\fly2any-fresh\components\auth\AuthModals.tsx
```

## Quick Start

### 1. Wrap Your App

Add the `AuthModalProvider` to your root layout or specific pages:

```tsx
// app/layout.tsx or any page
import { AuthModalProvider } from '@/components/auth/AuthModals';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthModalProvider defaultLanguage="en">
          {children}
        </AuthModalProvider>
      </body>
    </html>
  );
}
```

### 2. Use the Hook

In any component within the provider:

```tsx
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';

export function MyComponent() {
  const { showSignup, showLogin, closeModal } = useAuthModal();

  return (
    <div>
      <button onClick={showSignup}>Sign Up</button>
      <button onClick={showLogin}>Sign In</button>
    </div>
  );
}
```

## API Reference

### AuthModalProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Your app content |
| `defaultLanguage` | 'en' \| 'pt' \| 'es' | 'en' | Default language |

### useAuthModal Hook

Returns an object with:

| Method/Property | Type | Description |
|----------------|------|-------------|
| `showSignup()` | Function | Opens the signup modal |
| `showLogin()` | Function | Opens the login modal |
| `closeModal()` | Function | Closes any open modal |
| `currentModal` | 'signup' \| 'login' \| null | Current modal state |
| `language` | 'en' \| 'pt' \| 'es' | Current language |
| `setLanguage(lang)` | Function | Changes the language |

## Common Use Cases

### 1. Navigation Bar

```tsx
export function Header() {
  const { showSignup, showLogin } = useAuthModal();

  return (
    <nav>
      <button onClick={showLogin}>Sign In</button>
      <button onClick={showSignup}>Sign Up</button>
    </nav>
  );
}
```

### 2. Protected Content

```tsx
export function ProtectedFeature() {
  const { showLogin } = useAuthModal();
  const session = useSession();

  if (!session) {
    return (
      <div>
        <p>Sign in to access this feature</p>
        <button onClick={showLogin}>Sign In</button>
      </div>
    );
  }

  return <div>Protected content here</div>;
}
```

### 3. Booking Flow

```tsx
export function BookingButton() {
  const { showSignup } = useAuthModal();
  const session = useSession();

  const handleBooking = () => {
    if (!session) {
      showSignup(); // Show incentive to create account
    } else {
      // Proceed with booking
    }
  };

  return (
    <button onClick={handleBooking}>
      Book Now - Get 10% Off
    </button>
  );
}
```

### 4. AI Assistant Integration

```tsx
// In your AI assistant component
export function AIAssistant() {
  const { showSignup, showLogin } = useAuthModal();

  // When AI detects user needs to authenticate
  const handleAuthPrompt = () => {
    showSignup(); // or showLogin()
  };

  return (
    <div>
      {/* AI chat interface */}
      <button onClick={handleAuthPrompt}>
        Create Account for 10% Off
      </button>
    </div>
  );
}
```

### 5. Language Switcher

```tsx
export function LanguagePicker() {
  const { language, setLanguage } = useAuthModal();

  return (
    <div>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('pt')}>Português</button>
      <button onClick={() => setLanguage('es')}>Español</button>
    </div>
  );
}
```

## NextAuth Integration

To integrate with NextAuth, update the TODO sections in `AuthModals.tsx`:

### 1. Update Form Submission

```tsx
// In handleSubmit function
import { signIn } from 'next-auth/react';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    if (currentModal === 'signup') {
      // Create user via your API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (!response.ok) throw new Error('Signup failed');

      // Sign in after signup
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) throw new Error(result.error);
    } else {
      // Sign in
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) throw new Error(result.error);
    }

    setShowSuccess(true);

    setTimeout(() => {
      closeModal();
      window.location.reload(); // Refresh to update session
    }, 2000);

  } catch (error) {
    console.error('Authentication error:', error);
    setErrors({ email: 'Authentication failed. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Update Social Auth

```tsx
// In handleSocialAuth function
const handleSocialAuth = async (provider: 'google' | 'apple') => {
  setIsLoading(true);
  try {
    await signIn(provider, { callbackUrl: '/' });
  } catch (error) {
    console.error(`${provider} auth error:`, error);
  } finally {
    setIsLoading(false);
  }
};
```

## Customization

### Update Colors

The component uses Tailwind classes with your theme colors:
- `primary-*` - Main brand color
- `secondary-*` - Accent color

To customize, update your `tailwind.config.ts`.

### Update Translations

Add or modify translations in the `translations` object:

```tsx
const translations = {
  en: {
    signupTitle: 'Your Custom Title',
    // ... other translations
  },
  // Add new languages
  fr: {
    signupTitle: 'Créez Votre Compte',
    // ...
  }
};
```

### Update Incentive

Modify the incentive section:

```tsx
incentiveTitle: '10% OFF',
incentiveSubtitle: 'Your First Booking',
incentiveDetails: 'Exclusive welcome discount for new members',
```

### Update Features

Modify the features displayed on the right side:

```tsx
feature1: 'Access exclusive member-only deals',
feature2: 'Track your bookings in one place',
feature3: 'Earn rewards on every purchase',
feature4: 'Get personalized travel recommendations',
```

### Update Stats

Modify the statistics shown at the bottom:

```tsx
<div className="text-3xl font-bold mb-1">500K+</div>
<div className="text-xs text-white/80">Happy Travelers</div>
```

## Validation Rules

### Email
- Required
- Must match regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Password
- Required
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

### Password Strength
- 0-2 points: Weak (red)
- 3 points: Fair (orange)
- 4 points: Good (yellow)
- 5-6 points: Strong (green)

Points awarded for:
- Length ≥ 8 characters (+1)
- Length ≥ 12 characters (+1)
- Contains lowercase (+1)
- Contains uppercase (+1)
- Contains numbers (+1)
- Contains special characters (+1)

## Accessibility

The component includes:
- ARIA labels on interactive elements
- Keyboard navigation (ESC to close)
- Focus management (auto-focus on first input)
- Screen reader friendly error messages
- Proper form labels

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Breakpoints

- Mobile: < 768px (single column, no right panel)
- Desktop: ≥ 768px (split view with benefits panel)

## Performance

- Lazy loaded (only rendered when modal is open)
- No body scroll when open
- Optimized animations
- Minimal re-renders

## Security Best Practices

1. **Never store passwords in state longer than necessary**
2. **Always validate on backend** (client validation is for UX only)
3. **Use HTTPS** in production
4. **Implement rate limiting** on auth endpoints
5. **Use secure session management** (NextAuth handles this)

## Testing Checklist

- [ ] Signup flow works
- [ ] Login flow works
- [ ] Validation shows correct errors
- [ ] Password strength meter updates
- [ ] Social auth buttons work
- [ ] Mobile responsive
- [ ] ESC key closes modal
- [ ] Backdrop click closes modal
- [ ] Success animation displays
- [ ] Language switching works
- [ ] All translations are correct
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

## Troubleshooting

### Modal doesn't appear
- Ensure `AuthModalProvider` wraps your component
- Check z-index conflicts (modal uses `z-modal-backdrop`)

### Hook throws error
- Must use `useAuthModal` inside `AuthModalProvider`
- Don't use in server components (add 'use client')

### Styling issues
- Check Tailwind classes are being compiled
- Verify theme colors in `tailwind.config.ts`
- Clear Next.js cache: `rm -rf .next`

### Form submission fails
- Check console for errors
- Verify API endpoints exist
- Test with mock data first

## Examples

See `AuthModalsExample.tsx` for complete working examples of all integration patterns.

## Support

For issues or questions:
1. Check this README
2. Review the example file
3. Search existing codebase for similar patterns
4. Contact the development team

## License

Part of the Fly2Any project - Internal use only.

---

**Created for Fly2Any** | Last Updated: 2025-11-04
