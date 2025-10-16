# FlightSearchForm Component

A comprehensive, reusable flight search form component with full validation, trilingual support, and seamless integration.

## Location
`components/search/FlightSearchForm.tsx`

## Features

### Core Functionality
- **Complete Form Fields**: Origin, destination, dates, passengers, class
- **Airport Autocomplete**: Integration with AirportAutocomplete component
- **Date Validation**: Future dates only, return after departure
- **Passenger Selector**: +/- buttons with smart validation
- **Class Selector**: Economy, Premium Economy, Business, First Class
- **Trip Type Toggle**: Roundtrip/One-way switching
- **Direct Flights**: Optional checkbox filter

### Advanced Features
- **TypeScript**: Full type safety with proper interfaces
- **Error Management**: Real-time validation with error messages
- **Loading State**: Visual feedback during submission
- **Responsive Design**: Mobile-first, adapts to all screens
- **Glass-morphism Styling**: Modern backdrop-blur effects
- **Smooth Animations**: Transitions on all interactions
- **Trilingual Support**: English, Portuguese, Spanish
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

### Navigation
- Uses Next.js `useRouter` for client-side navigation
- Builds query string from form data
- Navigates to `/flights/results` with all parameters
- Handles both roundtrip and one-way trips

## Usage

### Basic Usage

```tsx
import FlightSearchForm from '@/components/search/FlightSearchForm';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <FlightSearchForm />
    </div>
  );
}
```

### With Language Control

```tsx
import { useState } from 'react';
import FlightSearchForm from '@/components/search/FlightSearchForm';

export default function Page() {
  const [language, setLanguage] = useState<'en' | 'pt' | 'es'>('en');

  return (
    <div className="container mx-auto p-4">
      <FlightSearchForm
        language={language}
        onLanguageChange={setLanguage}
      />
    </div>
  );
}
```

### With Custom Styling

```tsx
import FlightSearchForm from '@/components/search/FlightSearchForm';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <FlightSearchForm
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `language` | `'en' \| 'pt' \| 'es'` | `'en'` | Current interface language |
| `onLanguageChange` | `(lang: Language) => void` | `undefined` | Callback when language changes |
| `className` | `string` | `''` | Additional CSS classes |

## Form Data Structure

The form submits with the following query parameters:

```
/flights/results?origin=JFK&destination=LAX&departureDate=2025-10-15&returnDate=2025-10-22&adults=2&children=1&infants=0&class=economy&tripType=roundtrip&direct=false
```

### Query Parameters

- `origin`: Airport code (e.g., "JFK")
- `destination`: Airport code (e.g., "LAX")
- `departureDate`: ISO date format (YYYY-MM-DD)
- `returnDate`: ISO date format (only for roundtrip)
- `adults`: Number of adult passengers (1-9)
- `children`: Number of children (0-9)
- `infants`: Number of infants (0-9, max = adults)
- `class`: Travel class (economy|premium|business|first)
- `tripType`: Trip type (roundtrip|oneway)
- `direct`: Direct flights filter (true|false)

## Validation Rules

### Origin & Destination
- Both fields are required
- Must select from autocomplete options

### Departure Date
- Required
- Must be today or in the future

### Return Date (Roundtrip only)
- Required for roundtrip
- Must be after departure date

### Passengers
- Adults: Minimum 1, Maximum 9
- Children: Minimum 0, Maximum 9
- Infants: Minimum 0, Maximum = number of adults

## Error Messages

All error messages are displayed inline below the affected field with red text and appropriate ARIA attributes for accessibility.

## Accessibility Features

- **ARIA Labels**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Management**: Proper focus indicators and tab order
- **Screen Readers**: Semantic HTML and ARIA attributes
- **Error Announcements**: Errors are announced to assistive technologies

## Dependencies

- `next/navigation` - For routing
- `lucide-react` - For icons
- `./AirportAutocomplete` - For airport selection

## Styling

The component uses Tailwind CSS with:
- Glass-morphism effects (`backdrop-blur-lg`)
- Gradient backgrounds
- Smooth transitions
- Responsive grid layouts
- Custom focus states

## Examples in Project

You can see the component in action at:
- `/flights` - Main flights search page
- Integration ready for homepage and other pages

## Customization

### Changing Default Language

```tsx
<FlightSearchForm language="pt" />
```

### Adding Custom Validation

Extend the `validateForm` function in the component to add custom rules.

### Modifying Travel Classes

Edit the `TravelClass` type and `content` translations to add/remove classes.

## Notes

- The component handles its own state management
- Form data is validated before submission
- Loading state prevents multiple submissions
- Dropdown closes when clicking outside
- All dates are validated against browser timezone
