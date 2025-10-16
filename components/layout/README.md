# Global Layout Components

This directory contains reusable layout components that can be used across the entire application.

## Footer Component

A beautiful, responsive, and feature-rich footer component with trilingual support (English, Portuguese, Spanish).

### Features

- **Trilingual Support**: Full support for EN, PT, and ES languages
- **Newsletter Subscription**: Built-in email subscription form with validation
- **App Download Banner**: Optional section for mobile app promotion
- **Social Media Links**: Integrated social media icons with hover effects
- **Payment Methods Display**: Shows accepted payment methods
- **Responsive Design**: Fully responsive from mobile to desktop
- **Beautiful Animations**: Smooth hover effects and transitions
- **WhatsApp Integration**: Direct link to WhatsApp support
- **Customizable**: Extensive props for customization
- **TypeScript**: Fully typed with TypeScript

### Basic Usage

```tsx
import { Footer } from '@/components/layout/Footer';

const content = {
  company: 'Company',
  about: 'About Us',
  careers: 'Careers',
  press: 'Press',
  blog: 'Blog',
  support: 'Support',
  help: 'Help Center',
  contact: 'Contact Us',
  faq: 'FAQ',
  destinations: 'Top Destinations',
  legal: 'Legal',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookie Policy',
  newsletter: 'Subscribe to our newsletter',
  emailPlaceholder: 'Enter your email',
  subscribe: 'Subscribe',
  copyright: '© 2025 Fly2Any Travel - Based in USA',
  payments: 'We accept',
};

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <Footer content={content} />
    </div>
  );
}
```

### Advanced Usage with All Options

```tsx
import { Footer } from '@/components/layout/Footer';

const content = {
  // ... all content fields
  newsletterDescription: 'Get exclusive deals delivered to your inbox',
  followUs: 'Follow Us',
  downloadApp: 'Download Our App',
};

const customDestinations = [
  { name: 'Paris', url: '/destinations/paris' },
  { name: 'Tokyo', url: '/destinations/tokyo' },
  { name: 'New York', url: '/destinations/new-york' },
  { name: 'Dubai', url: '/destinations/dubai' },
  { name: 'London', url: '/destinations/london' },
  { name: 'Barcelona', url: '/destinations/barcelona' },
];

export default function MyPage() {
  return (
    <Footer
      content={content}
      language="en"
      destinations={customDestinations}
      showLogo={true}
      showSocial={true}
      showPayments={true}
      showNewsletter={true}
      showAppDownload={true}
      className="custom-footer-class"
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `FooterContent` | required | Object containing all footer text content |
| `language` | `'en' \| 'pt' \| 'es'` | `'en'` | Current language for the footer |
| `destinations` | `FooterDestination[]` | Built-in list | Custom list of destinations to display |
| `showLogo` | `boolean` | `true` | Whether to show the Fly2Any logo |
| `showSocial` | `boolean` | `true` | Whether to show social media links |
| `showPayments` | `boolean` | `true` | Whether to show payment methods |
| `showNewsletter` | `boolean` | `true` | Whether to show newsletter subscription |
| `showAppDownload` | `boolean` | `false` | Whether to show app download banner |
| `className` | `string` | `''` | Additional CSS classes for the footer |

### FooterContent Interface

```typescript
interface FooterContent {
  company: string;
  about: string;
  careers: string;
  press: string;
  blog: string;
  support: string;
  help: string;
  contact: string;
  faq: string;
  destinations: string;
  legal: string;
  privacy: string;
  terms: string;
  cookies: string;
  newsletter: string;
  newsletterDescription?: string;
  emailPlaceholder: string;
  subscribe: string;
  copyright: string;
  payments: string;
  followUs?: string;
  downloadApp?: string;
}
```

### FooterDestination Interface

```typescript
interface FooterDestination {
  name: string;
  url: string;
}
```

### Trilingual Content Example

```typescript
const footerContent = {
  en: {
    company: 'Company',
    about: 'About Us',
    careers: 'Careers',
    press: 'Press',
    blog: 'Blog',
    support: 'Support',
    help: 'Help Center',
    contact: 'Contact Us',
    faq: 'FAQ',
    destinations: 'Top Destinations',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
    newsletter: 'Subscribe to our newsletter',
    emailPlaceholder: 'Enter your email',
    subscribe: 'Subscribe',
    copyright: '© 2025 Fly2Any Travel - Based in USA',
    payments: 'We accept',
  },
  pt: {
    company: 'Empresa',
    about: 'Sobre Nós',
    careers: 'Carreiras',
    press: 'Imprensa',
    blog: 'Blog',
    support: 'Suporte',
    help: 'Central de Ajuda',
    contact: 'Contato',
    faq: 'FAQ',
    destinations: 'Principais Destinos',
    legal: 'Legal',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Serviço',
    cookies: 'Política de Cookies',
    newsletter: 'Assine nossa newsletter',
    emailPlaceholder: 'Digite seu e-mail',
    subscribe: 'Assinar',
    copyright: '© 2025 Fly2Any Travel - Baseado nos EUA',
    payments: 'Aceitamos',
  },
  es: {
    company: 'Empresa',
    about: 'Sobre Nosotros',
    careers: 'Carreras',
    press: 'Prensa',
    blog: 'Blog',
    support: 'Soporte',
    help: 'Centro de Ayuda',
    contact: 'Contacto',
    faq: 'FAQ',
    destinations: 'Destinos Principales',
    legal: 'Legal',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio',
    cookies: 'Política de Cookies',
    newsletter: 'Suscríbete a nuestro boletín',
    emailPlaceholder: 'Ingresa tu correo',
    subscribe: 'Suscribirse',
    copyright: '© 2025 Fly2Any Travel - Con sede en EE.UU.',
    payments: 'Aceptamos',
  },
};

// Usage
const [lang, setLang] = useState<'en' | 'pt' | 'es'>('en');

<Footer content={footerContent[lang]} language={lang} />
```

### Customization Examples

#### Minimal Footer (No Newsletter, No App Download)

```tsx
<Footer
  content={content}
  showNewsletter={false}
  showAppDownload={false}
/>
```

#### Footer with App Download Banner

```tsx
<Footer
  content={content}
  showAppDownload={true}
/>
```

#### Footer Without Social Media

```tsx
<Footer
  content={content}
  showSocial={false}
/>
```

#### Footer with Custom Destinations

```tsx
const myDestinations = [
  { name: 'Miami', url: '/destinations/miami' },
  { name: 'Los Angeles', url: '/destinations/los-angeles' },
  { name: 'Las Vegas', url: '/destinations/las-vegas' },
];

<Footer
  content={content}
  destinations={myDestinations}
/>
```

### Styling

The Footer component uses Tailwind CSS classes and includes:

- Gradient backgrounds for visual appeal
- Smooth hover animations
- Responsive grid layouts
- Dark theme optimized for readability
- Professional spacing and typography

### Accessibility

- Semantic HTML structure
- Proper ARIA labels for social links
- Keyboard navigation support
- Focus states for interactive elements

### Best Practices

1. **Always provide complete content**: Ensure all required fields in `FooterContent` are provided
2. **Match language prop with content**: When switching languages, update both `content` and `language` props
3. **Custom destinations**: Provide 4-6 destinations for best visual balance
4. **Newsletter integration**: Connect the newsletter form to your email service provider
5. **Social links**: Update social media URLs to your actual company profiles

### Integration with Other Pages

The Footer component is designed to work seamlessly across all pages:

```tsx
// app/layout.tsx
import { Footer } from '@/components/layout/Footer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Footer content={footerContent} />
      </body>
    </html>
  );
}
```

### Newsletter Subscription

The built-in newsletter form includes:
- Email validation
- Loading states
- Success feedback
- Form submission handling (connect to your backend)

To connect to your email service:

```tsx
// Modify the handleNewsletterSubmit function
const handleNewsletterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      setSubscribed(true);
      alert('Successfully subscribed!');
    }
  } catch (error) {
    alert('Subscription failed. Please try again.');
  }
};
```

### Support

For issues or questions, contact the development team or open an issue in the repository.
