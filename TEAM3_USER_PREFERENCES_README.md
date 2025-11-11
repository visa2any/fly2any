# Team 3: Backend + UI - User Preferences

Complete implementation of the User Preferences API and UI for Fly2Any.

## Implementation Summary

This implementation provides a complete user preferences management system with:
- RESTful API endpoints for CRUD operations
- Type-safe service layer with Prisma
- Modern, accessible UI with form validation
- Toast notifications for user feedback
- Loading states and error handling

---

## Files Created

### 1. Backend API
**File**: `C:\Users\Power\fly2any-fresh\app\api\preferences\route.ts`

RESTful API endpoints for user preferences:
- **GET /api/preferences** - Retrieve user preferences (creates defaults if none exist)
- **POST /api/preferences** - Create initial preferences
- **PUT /api/preferences** - Update existing preferences

**Features**:
- Authentication required (uses NextAuth session)
- Zod validation for all request bodies
- Detailed error responses with codes
- Handles edge cases (not found, duplicates, unauthorized)

**Example Usage**:
```typescript
// GET preferences
const response = await fetch('/api/preferences');
const { data } = await response.json();

// UPDATE preferences
const response = await fetch('/api/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    preferredCabinClass: 'business',
    emailNotifications: true,
    currency: 'USD',
  })
});
```

---

### 2. Service Layer
**File**: `C:\Users\Power\fly2any-fresh\lib\services\preferences.ts`

Type-safe preferences service with the following methods:

#### Methods:
- `getPreferences(userId: string)` - Get user preferences (auto-creates if missing)
- `createDefaultPreferences(userId: string, initialData?)` - Create new preferences
- `updatePreferences(userId: string, data: UpdatePreferencesData)` - Update preferences
- `deletePreferences(userId: string)` - Delete preferences
- `hasPreferences(userId: string)` - Check if preferences exist

**Features**:
- Full TypeScript type safety
- Prisma integration with fallback for missing DB
- Singleton pattern for efficient reuse
- Error handling and logging

**Example Usage**:
```typescript
import { preferencesService } from '@/lib/services/preferences';

// Get preferences
const prefs = await preferencesService.getPreferences(userId);

// Update preferences
const updated = await preferencesService.updatePreferences(userId, {
  preferredCabinClass: 'economy',
  dealAlerts: true,
});
```

---

### 3. User Interface Components

#### Main Page
**File**: `C:\Users\Power\fly2any-fresh\app\account\preferences\page.tsx`

Full-featured preferences management page with three main sections:

**Travel Preferences**:
- Preferred cabin class dropdown (Economy, Premium, Business, First)
- Preferred airlines multi-select with add/remove functionality
- Home airport input with 3-letter code validation

**Notification Preferences**:
- Email notifications toggle
- Price alert emails toggle
- Deal alerts toggle
- Newsletter opt-in toggle

**Display Preferences**:
- Currency selector (USD, EUR, GBP, CAD, AUD, JPY, CNY, INR)
- Language selector (EN, ES, FR, DE, IT, PT, ZH, JA)
- Theme selector (Light, Dark, Auto)

**Features**:
- Real-time form validation with Zod
- Loading states during data fetch
- Save and Reset functionality
- Toast notifications for success/error feedback
- Responsive design
- Accessible form controls

---

#### Reusable Components

**PreferenceSection Component**
**File**: `C:\Users\Power\fly2any-fresh\components\account\PreferenceSection.tsx`

Reusable section wrapper for grouping related preferences:
```tsx
<PreferenceSection
  title="Travel Preferences"
  description="Set your default travel preferences"
>
  {/* Form fields */}
</PreferenceSection>
```

**Switch Component**
**File**: `C:\Users\Power\fly2any-fresh\components\ui\Switch.tsx`

Accessible toggle switch with label and description:
```tsx
<Switch
  checked={emailNotifications}
  onCheckedChange={setEmailNotifications}
  label="Email Notifications"
  description="Receive updates about your bookings"
  id="emailNotifications"
/>
```

**Features**:
- Keyboard accessible (Space/Enter to toggle)
- ARIA labels for screen readers
- Disabled state support
- Smooth animations
- Optional label and description

**Select Component**
**File**: `C:\Users\Power\fly2any-fresh\components\ui\Select.tsx`

Custom select dropdown with consistent styling:
```tsx
<Select
  label="Currency"
  options={CURRENCY_OPTIONS}
  value={currency}
  onChange={setCurrency}
  placeholder="Select currency"
  fullWidth
  hint="All prices will be shown in this currency"
/>
```

**Features**:
- Custom styling to match design system
- Error state support
- Optional label and hint text
- Full width option
- Type-safe options array

---

## Database Schema

The UserPreferences model is already defined in `prisma/schema.prisma`:

```prisma
model UserPreferences {
  id     String @id @default(cuid())
  userId String @unique

  // Travel preferences
  preferredCabinClass String?   // economy, premium, business, first
  preferredAirlines   String[]  // ['AA', 'UA', 'DL']
  homeAirport         String?   // 'JFK'

  // Notification preferences
  emailNotifications Boolean @default(true)
  priceAlertEmails   Boolean @default(true)
  dealAlerts         Boolean @default(true)
  newsletterOptIn    Boolean @default(false)

  // UI preferences
  currency String @default("USD")
  language String @default("en")
  theme    String @default("light") // light, dark, auto

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}
```

---

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "userId": "clxxx...",
    "preferredCabinClass": "business",
    "preferredAirlines": ["AA", "UA", "DL"],
    "homeAirport": "JFK",
    "emailNotifications": true,
    "priceAlertEmails": true,
    "dealAlerts": true,
    "newsletterOptIn": false,
    "currency": "USD",
    "language": "en",
    "theme": "light",
    "createdAt": "2025-01-10T12:00:00Z",
    "updatedAt": "2025-01-10T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "preferredCabinClass",
        "message": "Invalid enum value",
        "code": "invalid_enum_value"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

---

## Validation Rules

### Cabin Class
- Must be one of: `economy`, `premium`, `business`, `first`
- Can be null (no preference)

### Preferred Airlines
- Array of 2-letter IATA codes
- Each code must be uppercase
- Maximum 2 characters per code

### Home Airport
- 3-letter IATA airport code
- Uppercase only
- Can be null

### Currency
- Valid ISO currency code
- Defaults to USD

### Language
- Valid language code (en, es, fr, de, etc.)
- Defaults to en

### Theme
- Must be one of: `light`, `dark`, `auto`
- Defaults to light

### Notification Preferences
- All boolean values
- emailNotifications: default true
- priceAlertEmails: default true
- dealAlerts: default true
- newsletterOptIn: default false

---

## User Flow

1. **User navigates to preferences page** (`/account/preferences`)
2. **Page loads existing preferences** (or creates defaults)
3. **User modifies preferences** in any section
4. **User clicks "Save Preferences"**
5. **Client validates data** with Zod schema
6. **API validates and updates** preferences
7. **Success toast displayed** confirming save
8. **User can click "Reset"** to reload from database

---

## Authentication

All API endpoints require authentication:
- Uses NextAuth session
- Returns 401 if not authenticated
- Automatically associates preferences with logged-in user
- User can only view/modify their own preferences

---

## Error Handling

### Client-Side
- Form validation with Zod
- Loading states during API calls
- Toast notifications for errors
- Field-level error messages

### Server-Side
- Authentication checks
- Request validation
- Database error handling
- Detailed error codes:
  - `UNAUTHORIZED` - Not logged in
  - `VALIDATION_ERROR` - Invalid data
  - `NOT_FOUND` - Preferences don't exist
  - `DUPLICATE_PREFERENCES` - Already exists
  - `FETCH_ERROR` - Failed to retrieve
  - `CREATE_ERROR` - Failed to create
  - `UPDATE_ERROR` - Failed to update

---

## Accessibility Features

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader descriptions
- Sufficient color contrast
- Clear error messages

---

## Performance Optimizations

- Client-side caching of preferences
- Optimistic UI updates possible
- Minimal re-renders with React state
- Efficient Prisma queries
- Auto-creation of defaults (no extra round trip)

---

## Testing the Implementation

### Manual Testing Checklist

1. **Authentication**
   - [ ] Redirects to login if not authenticated
   - [ ] Loads preferences after login
   - [ ] Creates defaults on first visit

2. **Travel Preferences**
   - [ ] Can select cabin class
   - [ ] Can add airline codes
   - [ ] Can remove airline codes
   - [ ] Validates 2-letter codes
   - [ ] Can set home airport
   - [ ] Validates 3-letter airport code

3. **Notification Preferences**
   - [ ] All toggles work correctly
   - [ ] State persists after save
   - [ ] Defaults are correct

4. **Display Preferences**
   - [ ] Can change currency
   - [ ] Can change language
   - [ ] Can change theme
   - [ ] Dropdowns show all options

5. **Form Actions**
   - [ ] Save button works
   - [ ] Reset button restores from DB
   - [ ] Loading states display
   - [ ] Success toast shows
   - [ ] Error toast shows on failure

### API Testing

```bash
# Get preferences (requires auth cookie)
curl -X GET http://localhost:3000/api/preferences \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Update preferences
curl -X PUT http://localhost:3000/api/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "preferredCabinClass": "business",
    "emailNotifications": true,
    "currency": "EUR"
  }'
```

---

## Future Enhancements

Potential improvements for future iterations:

1. **Auto-save** - Save preferences automatically on change
2. **Preference History** - Track changes over time
3. **Import/Export** - Allow users to export/import settings
4. **Preset Templates** - Quick preference templates (Business Traveler, Budget Explorer, etc.)
5. **Smart Suggestions** - Recommend preferences based on past bookings
6. **Multi-device Sync** - Real-time sync across devices
7. **Advanced Filters** - More granular travel preferences
8. **Notification Schedule** - Time-based notification preferences
9. **Theme Customization** - Custom color schemes
10. **Accessibility Options** - Font size, high contrast mode

---

## Dependencies

All required dependencies are already installed:
- `next` - Framework
- `react` - UI library
- `react-hot-toast` - Toast notifications
- `zod` - Validation
- `@prisma/client` - Database ORM
- `next-auth` - Authentication
- `tailwind-merge` - CSS utilities
- `clsx` - Conditional classes
- `lucide-react` - Icons (if needed)

---

## Integration Notes

### Accessing Preferences in Other Components

```typescript
// In any server component or API route
import { auth } from '@/lib/auth';
import { preferencesService } from '@/lib/services/preferences';

export async function MyServerComponent() {
  const session = await auth();
  const preferences = await preferencesService.getPreferences(session.user.id);

  // Use preferences
  const currency = preferences?.currency || 'USD';
  const cabinClass = preferences?.preferredCabinClass || 'economy';

  return <div>Currency: {currency}</div>;
}
```

### Using Preferences in Flight Search

```typescript
// Pre-fill search form with user preferences
const preferences = await preferencesService.getPreferences(userId);

const searchDefaults = {
  cabinClass: preferences?.preferredCabinClass || 'economy',
  origin: preferences?.homeAirport || '',
  airlines: preferences?.preferredAirlines || [],
};
```

---

## Support

For questions or issues with this implementation, please refer to:
- Database schema: `prisma/schema.prisma`
- API documentation: This README
- Component props: TypeScript interfaces in each file
- NextAuth setup: `lib/auth.ts`
- Prisma setup: `lib/prisma.ts`

---

## Completion Status

All tasks completed:
- [x] Backend API routes (GET, POST, PUT)
- [x] Service layer with type safety
- [x] Zod validation schemas
- [x] Preferences page UI
- [x] PreferenceSection component
- [x] Switch component
- [x] Select component
- [x] Form validation
- [x] Toast notifications
- [x] Loading states
- [x] Error handling
- [x] Authentication integration
- [x] Accessibility features
- [x] Responsive design
- [x] Documentation
