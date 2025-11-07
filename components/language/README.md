# Language Detection Popup Component

A sophisticated, user-friendly language detection popup that automatically detects and offers to switch the application language based on user input.

## Features

- **Smart Detection**: Only shows when confidence > 80%
- **Session-Based**: Appears once per session after first user message
- **Persistent Preferences**: Remembers dismissals in localStorage
- **Smooth Animations**: Beautiful slide-up animation with Framer Motion
- **Auto-Dismiss**: Automatically dismisses after 10 seconds
- **Mobile Responsive**: Bottom sheet on mobile, centered popup on desktop
- **Multilingual**: Built-in support for English, Spanish, and Portuguese
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Installation

The component is already set up in your project with all required dependencies:

- `framer-motion` - For smooth animations
- `lucide-react` - For icons
- Tailwind CSS - For styling

## Usage

### Basic Usage

```tsx
import LanguageDetectionPopup from '@/components/language/LanguageDetectionPopup';
import { detectLanguage } from '@/lib/ai/language-detection';

function ChatComponent() {
  const [showPopup, setShowPopup] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');
  const [confidence, setConfidence] = useState(0);

  const handleUserMessage = (message: string) => {
    // Detect language from first message
    const detection = detectLanguage(message);

    if (detection.confidence > 0.8) {
      setDetectedLang(detection.language);
      setConfidence(detection.confidence);
      setShowPopup(true);
    }
  };

  const handleConfirm = (language: string) => {
    // Switch app language
    setCurrentLanguage(language);
    setShowPopup(false);
  };

  const handleDismiss = () => {
    setShowPopup(false);
  };

  return (
    <>
      {/* Your chat UI */}

      {showPopup && (
        <LanguageDetectionPopup
          detectedLanguage={detectedLang}
          confidence={confidence}
          onConfirm={handleConfirm}
          onDismiss={handleDismiss}
          currentLanguage="en"
        />
      )}
    </>
  );
}
```

### Using the Hook (Simplified)

```tsx
import LanguageDetectionPopup, { useLanguageDetection } from '@/components/language/LanguageDetectionPopup';

function ChatComponent() {
  const {
    showPopup,
    detectedLang,
    confidence,
    triggerLanguageDetection,
    handleConfirm,
    handleDismiss,
  } = useLanguageDetection();

  const onUserMessage = (text: string) => {
    const detection = detectLanguage(text);
    if (detection.confidence > 0.8) {
      triggerLanguageDetection(detection.language, detection.confidence);
    }
  };

  return (
    <>
      {/* Your UI */}

      {showPopup && (
        <LanguageDetectionPopup
          detectedLanguage={detectedLang}
          confidence={confidence}
          onConfirm={handleConfirm}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
```

## API Reference

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `detectedLanguage` | `'en' \| 'es' \| 'pt'` | Yes | The detected language code |
| `confidence` | `number` | Yes | Confidence level (0-1). Only shows if > 0.8 |
| `onConfirm` | `(language: string) => void` | Yes | Callback when user confirms language switch |
| `onDismiss` | `() => void` | Yes | Callback when user dismisses popup |
| `currentLanguage` | `string` | No | Current app language (default: 'en') |

### Messages

The component displays localized messages based on the detected language:

**English:**
- Title: "English Detected"
- Message: "We detected you speak English. Would you like to continue in English?"
- Confirm: "Yes, switch to English"
- Dismiss: "No, stay in current language"

**Spanish:**
- Title: "Español Detectado"
- Message: "Detectamos que hablas Español. ¿Quieres continuar en Español?"
- Confirm: "Sí, cambiar a Español"
- Dismiss: "No, mantener idioma actual"

**Portuguese:**
- Title: "Português Detectado"
- Message: "Detectamos que você fala Português. Quer continuar em Português?"
- Confirm: "Sim, mudar para Português"
- Dismiss: "Não, manter idioma atual"

## Behavior

### When the Popup Shows

The popup will show when **ALL** conditions are met:

1. Language confidence > 80%
2. Detected language ≠ current language
3. Not already shown in this session
4. User hasn't dismissed this language before (localStorage)

### Auto-Dismiss

- Popup automatically dismisses after **10 seconds**
- Shows countdown with progress bar at bottom
- User can manually dismiss anytime

### Persistence

The component uses two storage mechanisms:

- **sessionStorage**: Prevents showing multiple times in same session
- **localStorage**: Remembers language dismissals across sessions

Storage keys:
- `fly2any_language_detection_dismissed` - Permanent dismissals
- `fly2any_language_popup_shown` - Session flag

### Resetting User Preferences

If a user wants to see the popup again:

```javascript
// Clear for specific language
const dismissals = JSON.parse(localStorage.getItem('fly2any_language_detection_dismissed') || '{}');
delete dismissals['es']; // Remove Spanish dismissal
localStorage.setItem('fly2any_language_detection_dismissed', JSON.stringify(dismissals));

// Clear all language preferences
localStorage.removeItem('fly2any_language_detection_dismissed');
sessionStorage.removeItem('fly2any_language_popup_shown');
```

## Styling

The component uses Tailwind CSS and is fully customizable. Key style features:

- **Gradient backgrounds**: Blue to purple gradients
- **Smooth animations**: Spring-based with Framer Motion
- **Responsive**: Mobile-first design
  - Mobile: Full-width bottom sheet with rounded top
  - Desktop: Centered modal with max-width
- **Dark mode**: Ready (add dark: classes as needed)

### Customizing Colors

Edit the gradient classes in the component:

```tsx
// Primary gradient (header)
className="bg-gradient-to-r from-blue-50 to-purple-50"

// Button gradient
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

## Integration Examples

### With AI Chat

```tsx
// In your AI chat component
const [messageHistory, setMessageHistory] = useState([]);

const handleSendMessage = async (message: string) => {
  // Detect language on first user message
  if (messageHistory.filter(m => m.role === 'user').length === 0) {
    const detection = detectLanguage(message);

    if (detection.confidence > 0.8 && detection.language !== currentLanguage) {
      setShowLanguagePopup(true);
      setDetectedLanguage(detection.language);
      setConfidence(detection.confidence);
    }
  }

  // Continue with normal message handling...
};
```

### With Form Input

```tsx
// In a travel search form
const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
  const text = event.target.value;

  // Detect after user types enough text
  if (text.length > 20 && !hasDetectedLanguage) {
    const detection = detectLanguage(text);

    if (detection.confidence > 0.8) {
      triggerLanguageDetection(detection.language, detection.confidence);
      setHasDetectedLanguage(true);
    }
  }
};
```

## Accessibility

The component includes:

- Proper ARIA labels
- Semantic HTML
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## Performance

- Lightweight component (~8KB gzipped)
- No external API calls
- Uses localStorage (5-10MB limit)
- Smooth 60fps animations

## Troubleshooting

### Popup doesn't show

1. Check confidence level: Must be > 0.8
2. Verify language is different from current
3. Clear sessionStorage for testing
4. Check browser console for errors

### Popup shows too often

- The component should only show once per session
- Check if sessionStorage is working in browser
- Verify `SESSION_SHOWN_KEY` is being set

### Animation issues

- Ensure Framer Motion is installed
- Check for CSS conflicts
- Verify z-index hierarchy (popup uses z-[9999])

## Related Files

- `/lib/ai/language-detection.ts` - Language detection engine
- `/components/language/LanguageDetectionExample.tsx` - Usage examples
- `/components/language/LanguageDetectionPopup.tsx` - Main component

## License

Part of the Fly2Any project.
