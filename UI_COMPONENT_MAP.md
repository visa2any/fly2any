# Fly2Any AI Component Architecture Map

## Component Hierarchy

```
GlobalLayout (Root - ALL pages)
├─ Header (with language switcher)
├─ Navigation & Content
├─ Footer
├─ AITravelAssistant (Floating, always available)
│  ├─ Chat Window
│  │  ├─ ConsultantAvatar (top-right)
│  │  │  └─ [Shows online status + image]
│  │  ├─ ConsultantProfileModal (on avatar click)
│  │  │  └─ [Show credentials, expertise, specialties]
│  │  ├─ Message Area
│  │  │  ├─ User Messages (right side)
│  │  │  ├─ Assistant Messages (left side)
│  │  │  │  ├─ Consultant name/title
│  │  │  │  └─ [Message content]
│  │  │  ├─ FlightResultCard (if applicable)
│  │  │  │  └─ [Displays flight options]
│  │  │  ├─ EnhancedTypingIndicator (when typing)
│  │  │  │  ├─ Thinking phase animation
│  │  │  │  ├─ Typing phase animation
│  │  │  │  └─ [Optional: multi-stage progress]
│  │  │  ├─ Proactive Suggestions (amber box)
│  │  │  │  └─ [With action buttons]
│  │  │  ├─ EmotionalIndicator (if applicable)
│  │  │  │  └─ [Shows detected emotion state]
│  │  │  └─ ErrorMessageCard (if error occurs) [MISSING]
│  │  │     └─ [With retry button]
│  │  ├─ Quick Actions (first message only)
│  │  │  └─ [4 quick question buttons]
│  │  ├─ Support Contact Banner
│  │  │  ├─ Phone button
│  │  │  └─ Email button
│  │  ├─ Input Area
│  │  │  ├─ Text input field
│  │  │  └─ Send button
│  │  └─ Progress Bar (gathering trip details)
│  │     └─ [Shows % complete]
│  └─ Chat Button (when closed)
│     ├─ Green online indicator
│     └─ Sparkle animation
│
├─ ConversationRecoveryBanner (when applicable)
│  └─ [Resume/Start New buttons]
│
└─ VerificationModal (when applicable)
   ├─ Email verification section
   └─ SMS code input (6 digits)
```

## Component States & Variants

### AITravelAssistant States
```
CLOSED    → Shows floating button only
OPEN      → Full chat window visible
MINIMIZED → Header only, collapsed
```

### ConsultantAvatar Sizes
```
sm  → 32px (in chat messages)
md  → 40px (default)
lg  → 64px (profile modal)
xl  → 96px (large displays)
```

### EnhancedTypingIndicator Variants
```
minimal    → "Name is typing..." + 3 dots
detailed   → Avatar + Name + Message + time estimate
progressive → Avatar + Name + Progress bar + Multi-stage breakdown
```

### Message Types
```
USER      → Right-aligned, blue background
ASSISTANT → Left-aligned, white/gray background, with avatar & name
SYSTEM    → Center-aligned, special styling
```

## Data Flow

```
User Input
   ↓
handleSendMessage()
   ↓
Analytics.trackMessage()
   ↓
extractInformationFromMessage()
   ├─ Return: CollectedInfo
   └─ Update: conversationFlow state
   ↓
updateConversationFlow()
   ├─ Analyze: Intent & missing info
   └─ Determine: Next action (ask question / search / guide)
   ↓
[Decision Tree]
   ├─ canProceedToSearch() → executeAgentSearch()
   │   └─ Fetch: /api/ai/search-flights
   │   └─ Display: FlightResultCard(s)
   ├─ suggestedAction === 'guide' → getGuidanceMessage()
   ├─ suggestedAction === 'clarify' → clarificationMessage
   └─ else → askNextQuestion()
   ↓
sendAIResponseWithTyping()
   ├─ Phase 1: calculateThinkingDelay()
   ├─ Phase 2: calculateTypingDelay()
   ├─ Phase 3: Display message + ConsultantAvatar
   └─ setMessages([...prev, aiResponse])
   ↓
[If suggestions generated]
generateSuggestions() → Display: Amber box with action
   ↓
User sees complete conversation in chat history
```

## Consultant Routing Logic

```
determineConsultantTeam(userMessage)
   ├─ Keywords: 'flight', 'fly', 'ticket', 'airline', 'airport'
   │  → 'flight-operations' (Sarah Chen ✈️)
   ├─ Keywords: 'hotel', 'accommodation', 'stay', 'room', 'resort'
   │  → 'hotel-accommodations' (Marcus Rodriguez 🏨)
   ├─ Keywords: 'payment', 'card', 'refund', 'charge'
   │  → 'payment-billing' (David Park 💳)
   ├─ Keywords: 'cancel', 'rights', 'compensation', 'policy'
   │  → 'legal-compliance' (Dr. Emily Watson ⚖️)
   ├─ Keywords: 'insurance', 'coverage', 'claim'
   │  → 'travel-insurance' (Robert Martinez 🛡️)
   ├─ Keywords: 'visa', 'passport', 'document'
   │  → 'visa-documentation' (Sophia Nguyen 📄)
   ├─ Keywords: 'car', 'rental', 'drive'
   │  → 'car-rental' (James Anderson 🚗)
   ├─ Keywords: 'points', 'loyalty', 'reward', 'miles'
   │  → 'loyalty-rewards' (Amanda Foster 🎁)
   ├─ Keywords: 'technical', 'error', 'bug', 'website', 'app'
   │  → 'technical-support' (Alex Kumar 💻)
   ├─ Keywords: 'wheelchair', 'disability', 'special need', 'diet', 'child'
   │  → 'special-services' (Nina Patel 🤝)
   ├─ Keywords: 'emergency', 'urgent', 'help', 'lost'
   │  → 'crisis-management' (Captain Mike 🆘)
   └─ else → 'customer-service' (Lisa Thompson 🎧)
   
getConsultant(team) → ConsultantProfile with:
   ├─ id, name, title, role, team
   ├─ avatar (emoji)
   ├─ expertise[], personality, specialties[]
   └─ greeting{en, pt, es}
```

## Integration with App Pages

```
/app
├─ page.tsx (Home)
│  └─ AITravelAssistant [via GlobalLayout]
│
├─ /flights/page.tsx
│  └─ AITravelAssistant [via GlobalLayout]
│
├─ /flights/results/page.tsx
│  └─ AITravelAssistant [via GlobalLayout]
│  └─ [Can interact with flight search]
│
├─ /hotels/page.tsx
│  └─ AITravelAssistant [via GlobalLayout]
│
├─ /account/conversations/page.tsx
│  ├─ ConversationHistoryWrapper
│  │  └─ ConversationHistory
│  │     ├─ Search box
│  │     ├─ Status filter
│  │     └─ Conversation list
│  │        └─ On click → navigate + resume
│  └─ AITravelAssistant [via GlobalLayout]
│
├─ /admin/ai-analytics/page.tsx
│  └─ AITravelAssistant [via GlobalLayout]
│
└─ [46 other pages]
   └─ AITravelAssistant [via GlobalLayout]
```

## Language Support

```
Supported Languages: EN (English), PT (Portuguese), ES (Spanish)

Detection Flow:
User Input
   ↓
detectLanguage(text)
   ├─ Analyze keywords, patterns, accents
   ├─ Score each language: en, es, pt
   ├─ Return: { language, confidence 0-1, alternates[] }
   └─ [Currently not used for UI switching]
   
Current Language Control:
GlobalLayout
   ├─ Stores: language state (default: 'en')
   ├─ Header language switcher
   │  └─ Manual EN/PT/ES button clicks
   ├─ localStorage.getItem('fly2any_language')
   └─ Passes: language prop to all components
```

## Key State Variables

### In AITravelAssistant Component
```
isOpen: boolean                    - Chat window open/closed
isMinimized: boolean              - Chat minimized state
messages: Message[]               - All messages in conversation
inputMessage: string              - Current input text
isTyping: boolean                 - Typing indicator shown
typingState: TypingState | null   - Current typing phase
conversationFlow: ConversationFlow - Flow state machine
activeSuggestions: Suggestion[]   - Current suggestions
extractedInfo: CollectedInfo      - Extracted trip info
currentActionPlan: ActionPlan     - Current action being executed
currentAction: AgentAction        - Current action details
selectedConsultant: ConsultantProfile - Profile modal state
userSession: UserSession          - Session tracking
```

## Consultant Teams (12 Total)

```
1. flight-operations      ✈️ Sarah Chen         - Flight bookings, airlines
2. hotel-accommodations   🏨 Marcus Rodriguez   - Hotel stays, amenities  
3. payment-billing        💳 David Park         - Payments, refunds
4. legal-compliance       ⚖️ Dr. Emily Watson   - Rights, compensation
5. travel-insurance       🛡️ Robert Martinez    - Travel coverage
6. visa-documentation     📄 Sophia Nguyen      - Passports, visas
7. car-rental            🚗 James Anderson     - Car rentals, transfers
8. loyalty-rewards       🎁 Amanda Foster      - Points, miles, programs
9. technical-support     💻 Alex Kumar         - Platform issues
10. special-services     🤝 Nina Patel         - Accessibility, special needs
11. crisis-management    🆘 Captain Mike       - Emergencies, urgent issues
12. customer-service     🎧 Lisa Thompson      - General greeting
```

## Missing Components (Need to Build)

```
[HIGH PRIORITY]
ConsultantHandoffAnimation.tsx    - Animate consultant switch
ErrorMessageCard.tsx               - Styled error display
RetryButton.tsx                    - Retry failed operations
MultiStageLoadingIndicator.tsx     - Show search stages
PersonalityResponseFormatter.tsx   - Add consultant personality
LanguageAutoDetectPopup.tsx        - Detect & switch language

[MEDIUM PRIORITY]
SearchFilterPanel.tsx              - Show flight filters
AnimatedSuggestionCard.tsx         - Animate suggestions
AuthPromptCard.tsx                 - Sign-up CTA in chat
SavedSearchesList.tsx              - Show saved searches

[LOWER PRIORITY]
MobileBottomSheet.tsx              - Mobile optimized UI
VoiceInputButton.tsx               - Voice input
DateFlexibilityPicker.tsx          - Flexible dates

[ENHANCEMENTS]
Enhance AITravelAssistant.tsx      - Add handoff logic
Enhance ConsultantAvatar.tsx       - Animation on switch
Enhance FlightResultCard.tsx       - Add filters
Enhance ConversationHistory.tsx    - Complete API
```

## File Locations

```
/home/user/fly2any/
├── components/
│   ├── ai/                         [12 components, 5,888 lines]
│   │   ├── AITravelAssistant.tsx
│   │   ├── AITravelAssistant-AGENT-MODE.tsx
│   │   ├── ConsultantAvatar.tsx
│   │   ├── ConsultantProfileModal.tsx
│   │   ├── EnhancedTypingIndicator.tsx
│   │   ├── ConversationHistory.tsx
│   │   ├── ConversationHistoryWrapper.tsx
│   │   ├── ConversationRecoveryBanner.tsx
│   │   ├── VerificationModal.tsx
│   │   ├── EmotionalIndicator.tsx
│   │   ├── QuickContactForm.tsx
│   │   └── FlightResultCard.tsx
│   └── layout/
│       └── GlobalLayout.tsx        [Includes AI globally]
│
├── lib/ai/                         [45+ files, AI system]
│   ├── agent-*.ts                  [Action chain, executor, etc.]
│   ├── consultant-*.ts             [Profiles, handoff, personalities]
│   ├── conversation-*.ts           [Flow, persistence, history]
│   ├── emotion-*.ts                [Detection, awareness]
│   ├── language-detection.ts       [EN/PT/ES detection]
│   ├── response-*.ts               [Generation, templates]
│   └── [... many more]
│
├── app/
│   ├── layout.tsx                  [Root layout]
│   ├── page.tsx                    [Home page]
│   ├── api/ai/                     [8 API routes]
│   │   ├── search-flights/route.ts
│   │   ├── search-hotels/route.ts
│   │   ├── analytics/route.ts
│   │   └── [... more routes]
│   ├── account/conversations/page.tsx [History page]
│   └── [46+ other pages with GlobalLayout]
│
├── public/consultants/             [12 PNG images]
│   ├── sarah-flight.png
│   ├── marcus-hotel.png
│   ├── emily-legal.png
│   └── [... more consultant images]
│
└── AI_AUDIT_REPORT.md              [This comprehensive report]
```

---

## Quick Reference: What's Connected

### ✅ WIRED & WORKING
- Conversation flow logic → Chat UI
- Typing simulation → Visual indicators
- Consultant routing → Avatar selection
- Flight search API → Result cards
- Suggestion generation → Chat display
- Conversation persistence → History page
- Language switching → UI state
- Analytics tracking → All interactions

### ⚠️ BUILT BUT NOT VISUALLY INTEGRATED
- Handoff system → No animation
- Language auto-detection → No UI popup
- Error handling (15+ types) → Limited display
- Loading stages → Simple spinner only
- Consultant personalities → Generic messages
- Emotion detection → Internal only
- Advanced filters → Not shown in chat

### ❌ NOT IMPLEMENTED
- Voice input UI
- Mobile gestures
- Authentication flow in chat
- Real-time notifications
- User presence indicators

---

## Performance Notes

- AITravelAssistant: ~1,239 lines (uses 'use client')
- Total AI UI: ~5,888 lines across 12 components
- AI Library: 45+ files, modular architecture
- API: 8 routes optimized for real-time
- Images: 12 PNG files (~7KB-8.4KB each) in /public/consultants/

