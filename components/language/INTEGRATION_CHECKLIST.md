# Integration Checklist

Use this checklist to integrate the Language Detection Popup into your application.

## ✅ Pre-Integration Checklist

- [x] Component files created in `/components/language/`
- [x] Dependencies installed (framer-motion, lucide-react, tailwind)
- [x] Language detection system exists at `/lib/ai/language-detection.ts`
- [x] TypeScript configuration is correct
- [x] Demo page available for testing

## 📋 Integration Steps

### Step 1: Import the Component
```tsx
import LanguageDetectionPopup from '@/components/language/LanguageDetectionPopup';
import { detectLanguage } from '@/lib/ai/language-detection';
```
- [ ] Add imports to your component

### Step 2: Add State
```tsx
const [showPopup, setShowPopup] = useState(false);
const [detectedLang, setDetectedLang] = useState<'en' | 'es' | 'pt'>('en');
const [confidence, setConfidence] = useState(0);
const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es' | 'pt'>('en');
```
- [ ] Add state variables

### Step 3: Implement Detection Logic
```tsx
const handleFirstMessage = (message: string) => {
  const detection = detectLanguage(message);

  if (detection.confidence > 0.8 && detection.language !== currentLanguage) {
    setDetectedLang(detection.language);
    setConfidence(detection.confidence);
    setShowPopup(true);
  }
};
```
- [ ] Add detection function
- [ ] Call on first user message
- [ ] Check confidence threshold

### Step 4: Add Popup to JSX
```tsx
{showPopup && (
  <LanguageDetectionPopup
    detectedLanguage={detectedLang}
    confidence={confidence}
    onConfirm={(language) => {
      setCurrentLanguage(language);
      setShowPopup(false);
      // TODO: Update your app's language
    }}
    onDismiss={() => setShowPopup(false)}
    currentLanguage={currentLanguage}
  />
)}
```
- [ ] Add popup to render
- [ ] Implement onConfirm handler
- [ ] Implement onDismiss handler

### Step 5: Connect to Your Language System
```tsx
const handleLanguageChange = (newLanguage: string) => {
  // Update your app's language state
  setCurrentLanguage(newLanguage);

  // Update i18n or language context
  // i18n.changeLanguage(newLanguage);

  // Optionally save to backend
  // updateUserLanguagePreference(newLanguage);
};
```
- [ ] Connect to your language system
- [ ] Update i18n if using
- [ ] Save preference to backend (optional)

### Step 6: Test
- [ ] Test with English message
- [ ] Test with Spanish message
- [ ] Test with Portuguese message
- [ ] Test popup dismissal
- [ ] Test language confirmation
- [ ] Test auto-dismiss (wait 10s)
- [ ] Test session persistence
- [ ] Test localStorage persistence
- [ ] Test mobile responsive design

## 🧪 Testing Checklist

### Functional Testing
- [ ] Popup shows on first message with confidence > 80%
- [ ] Popup doesn't show on subsequent messages
- [ ] Popup doesn't show if dismissed
- [ ] Popup doesn't show if language = current
- [ ] Confirm button switches language
- [ ] Dismiss button hides popup and remembers
- [ ] Auto-dismiss works after 10 seconds
- [ ] Progress bar animates correctly

### Visual Testing
- [ ] Desktop: Centered modal
- [ ] Mobile: Bottom sheet
- [ ] Animations are smooth (60 FPS)
- [ ] Colors match design
- [ ] Text is readable
- [ ] Buttons are clickable
- [ ] Icons display correctly
- [ ] Flag emojis show correctly

### Edge Cases
- [ ] Very short messages
- [ ] Mixed language messages
- [ ] Special characters
- [ ] Empty messages
- [ ] Multiple rapid messages
- [ ] Switching languages multiple times
- [ ] Clearing storage manually

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 🔧 Configuration Options

### Adjust Confidence Threshold
```tsx
// In your detection logic
if (detection.confidence > 0.9) { // Changed from 0.8
  setShowPopup(true);
}
```
- [ ] Set appropriate confidence level for your use case

### Adjust Auto-Dismiss Time
```tsx
// In LanguageDetectionPopup.tsx
const dismissTimer = setTimeout(() => {
  handleDismiss();
}, 15000); // Changed from 10500
```
- [ ] Adjust if needed

### Customize Messages
```tsx
// In LanguageDetectionPopup.tsx, update POPUP_MESSAGES
const POPUP_MESSAGES = {
  en: {
    title: 'Your Custom Title',
    message: 'Your custom message...',
    // ...
  }
};
```
- [ ] Customize messages if needed

## 📊 Analytics Integration (Optional)

```tsx
const handleLanguageConfirm = (language: string) => {
  // Track language change
  analytics.track('language_changed', {
    from: currentLanguage,
    to: language,
    source: 'auto_detection',
    confidence: confidence,
  });

  setCurrentLanguage(language);
  setShowPopup(false);
};

const handleLanguageDismiss = () => {
  // Track dismissal
  analytics.track('language_detection_dismissed', {
    detected: detectedLang,
    confidence: confidence,
  });

  setShowPopup(false);
};
```
- [ ] Add analytics tracking
- [ ] Monitor acceptance rate
- [ ] Track which languages are detected
- [ ] Analyze confidence levels

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No console errors
- [ ] Performance tested
- [ ] Accessibility tested
- [ ] Mobile tested
- [ ] Cross-browser tested

### Deployment
- [ ] Component deployed to staging
- [ ] Tested in staging environment
- [ ] User acceptance testing complete
- [ ] Ready for production deployment

### Post-Deployment
- [ ] Monitor error logs
- [ ] Track user acceptance rate
- [ ] Collect user feedback
- [ ] Iterate based on data

## 📝 Documentation Updates

- [ ] Update project README with language detection feature
- [ ] Document configuration options in team wiki
- [ ] Add to component library documentation
- [ ] Create runbook for support team

## 🎯 Success Metrics

Track these metrics to measure success:

- [ ] **Detection Accuracy**: % of correct language detections
- [ ] **Acceptance Rate**: % of users who confirm language switch
- [ ] **Dismissal Rate**: % of users who dismiss
- [ ] **User Satisfaction**: User feedback/ratings
- [ ] **Error Rate**: Technical errors in detection

## 🆘 Troubleshooting

If something doesn't work, check:

1. [ ] Are all dependencies installed?
2. [ ] Is the import path correct?
3. [ ] Is the language detection module working?
4. [ ] Are there any console errors?
5. [ ] Is localStorage enabled?
6. [ ] Is JavaScript enabled?
7. [ ] Are there CSS conflicts?
8. [ ] Is z-index correct?

## 📞 Support Resources

- **Demo:** `/demo/language-detection`
- **Quick Start:** `/components/language/QUICK_START.md`
- **Full Docs:** `/components/language/README.md`
- **Examples:** `/components/language/LanguageDetectionExample.tsx`
- **Types:** `/components/language/types.ts`

---

## ✨ Integration Complete!

Once all items are checked, your language detection popup is ready for production!

**Estimated Integration Time:** 15-30 minutes
**Difficulty Level:** Easy
**Maintenance Required:** Minimal

Good luck! 🚀
