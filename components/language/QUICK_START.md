# Quick Start Guide: Language Detection Popup

Get the language detection popup running in **5 minutes**!

## 🚀 Quick Integration

### 1. Import the Component

```tsx
import LanguageDetectionPopup from '@/components/language/LanguageDetectionPopup';
import { detectLanguage } from '@/lib/ai/language-detection';
```

### 2. Add State Management

```tsx
const [showPopup, setShowPopup] = useState(false);
const [detectedLang, setDetectedLang] = useState<'en' | 'es' | 'pt'>('en');
const [confidence, setConfidence] = useState(0);
```

### 3. Detect Language (First User Message)

```tsx
const handleUserMessage = (message: string) => {
  // Detect language
  const detection = detectLanguage(message);

  // Show popup if confidence > 80%
  if (detection.confidence > 0.8) {
    setDetectedLang(detection.language);
    setConfidence(detection.confidence);
    setShowPopup(true);
  }
};
```

### 4. Add Popup to Your JSX

```tsx
{showPopup && (
  <LanguageDetectionPopup
    detectedLanguage={detectedLang}
    confidence={confidence}
    onConfirm={(lang) => {
      setCurrentLanguage(lang);
      setShowPopup(false);
    }}
    onDismiss={() => setShowPopup(false)}
    currentLanguage="en"
  />
)}
```

Done! The popup will automatically:
- Show after first message (if language detected)
- Auto-dismiss after 10 seconds
- Remember user preferences
- Never show again if dismissed

## 📱 Test It Now

Visit the demo page:
```
http://localhost:3000/demo/language-detection
```

Or test with these messages:

**Spanish:**
```
¡Hola! Necesito un vuelo a Madrid
```

**Portuguese:**
```
Olá! Preciso de um voo para São Paulo
```

**English:**
```
Hi! I need a flight to New York
```

## 🎯 Real Example (AI Chat)

```tsx
'use client';

import { useState } from 'react';
import LanguageDetectionPopup from '@/components/language/LanguageDetectionPopup';
import { detectLanguage } from '@/lib/ai/language-detection';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [currentLang, setCurrentLang] = useState('en');
  const [showPopup, setShowPopup] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');
  const [confidence, setConfidence] = useState(0);

  const handleSendMessage = async (text: string) => {
    // Add to messages
    setMessages([...messages, { role: 'user', content: text }]);

    // Detect language on first user message
    if (messages.filter(m => m.role === 'user').length === 0) {
      const result = detectLanguage(text);

      if (result.confidence > 0.8 && result.language !== currentLang) {
        setDetectedLang(result.language);
        setConfidence(result.confidence);
        setShowPopup(true);
      }
    }

    // Send to AI...
  };

  return (
    <div>
      {/* Your chat UI */}

      {showPopup && (
        <LanguageDetectionPopup
          detectedLanguage={detectedLang}
          confidence={confidence}
          onConfirm={(lang) => {
            setCurrentLang(lang);
            setShowPopup(false);
            // Update AI to respond in this language
          }}
          onDismiss={() => setShowPopup(false)}
          currentLanguage={currentLang}
        />
      )}
    </div>
  );
}
```

## 🔧 Customization

### Change Auto-Dismiss Time

Edit in `LanguageDetectionPopup.tsx`:
```tsx
const dismissTimer = setTimeout(() => {
  handleDismiss();
}, 15000); // Change to 15 seconds
```

### Change Minimum Confidence

```tsx
if (detection.confidence > 0.9) { // Change from 0.8 to 0.9
  setShowPopup(true);
}
```

### Custom Styling

The component uses Tailwind CSS. Edit classes in `LanguageDetectionPopup.tsx`:
```tsx
// Change button colors
className="bg-gradient-to-r from-green-600 to-blue-600"

// Change popup size
className="md:max-w-lg" // Instead of md:max-w-md
```

### Add More Languages

1. Add language to `lib/ai/language-detection.ts`
2. Add messages to `POPUP_MESSAGES` in `LanguageDetectionPopup.tsx`
3. Add flag emoji to `LANGUAGE_FLAGS`

## 🐛 Common Issues

### Popup doesn't show
```tsx
// Check these:
console.log('Confidence:', detection.confidence); // Must be > 0.8
console.log('Languages:', detection.language, currentLang); // Must be different
console.log('Session:', sessionStorage.getItem('fly2any_language_popup_shown')); // Should be null
```

### Reset for testing
```tsx
// Add this button in your dev environment:
<button onClick={() => {
  localStorage.removeItem('fly2any_language_detection_dismissed');
  sessionStorage.removeItem('fly2any_language_popup_shown');
}}>
  Reset Popup
</button>
```

### TypeScript errors
```tsx
// Make sure imports are correct:
import type { SupportedLanguage } from '@/lib/ai/language-detection';
```

## 📚 More Examples

See full examples in:
- `/components/language/LanguageDetectionExample.tsx`
- `/app/demo/language-detection/page.tsx`
- `/components/language/README.md`

## 🎨 Features Checklist

- ✅ Auto-detect from user message
- ✅ 80%+ confidence threshold
- ✅ Shows once per session
- ✅ Remembers dismissals
- ✅ Auto-dismiss (10s)
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ 3 languages (EN, ES, PT)
- ✅ Fully accessible
- ✅ TypeScript support

## 💡 Pro Tips

1. **Test with real messages**: Users type naturally, not perfectly
2. **Don't force language**: Let users dismiss if they prefer English
3. **Monitor confidence**: Log detection results to improve accuracy
4. **Consider context**: Maybe don't show on homepage, only in chat
5. **A/B test timing**: Try showing after 2nd or 3rd message instead

## 🆘 Need Help?

- Check the demo: `/demo/language-detection`
- Read full docs: `/components/language/README.md`
- View examples: `/components/language/LanguageDetectionExample.tsx`

---

**Ready to go!** 🚀 The component is production-ready and fully tested.
