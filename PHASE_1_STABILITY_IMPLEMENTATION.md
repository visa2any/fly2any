# Phase 1: Stability Implementation Guide
## Quote Save Reliability ≥95%

**Status:** Ready for Implementation  
**Target:** 2 weeks (Week 1-2)  
**Goal:** Eliminate save failures, ensure data integrity, provide agent confidence

---

## TABLE OF CONTENTS

1. [QuoteSchemaMapper Implementation](#1-quoteschemamapper-implementation)
2. [API Error Handling](#2-api-error-handling)
3. [Frontend Save Flow](#3-frontend-save-flow)
4. [Save State Indicator Component](#4-save-state-indicator-component)
5. [Testing Strategy](#5-testing-strategy)
6. [Definition of Done](#6-definition-of-done)

---

## 1. QuoteSchemaMapper Implementation

### File Location
`lib/quotes/QuoteSchemaMapper.ts` ✅ **COMPLETED**

### What It Does

The `QuoteSchemaMapper` is the **Single Source of Truth** for transforming workspace state into API-compatible format.

**Key Functions:**

#### `workspaceToApiQuote(state: QuoteWorkspaceState): CreateQuoteApiInput`

- Transforms entire workspace state to API format
- Validates prerequisites (client selected, not empty)
- Normalizes dates to ISO format
- Transforms all item types using specialized transformers
- **Throws errors early** before API call

**Example Usage:**
```typescript
import { workspaceToApiQuote, validateMappedQuote } from '@/lib/quotes/QuoteSchemaMapper';

try {
  // Transform workspace state
  const apiPayload = workspaceToApiQuote(workspaceState);
  
  // Validate transformed payload
  const errors = validateMappedQuote(apiPayload);
  if (errors.length > 0) {
    return { success: false, error: formatValidationErrors(errors) };
  }
  
  // Send to API
  const res = await fetch('/api/agents/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiPayload),
  });
  
  // Handle response...
  
} catch (error) {
  // Handle transformation errors (e.g., no client selected)
  return { success: false, error: error.message };
}
```

#### Item Transformers (6 total)

Each transformer extracts data from nested `details` object and adds required API fields:

1. **`flightToApiFormat(item: QuoteItem): ApiFlightItem`**
   - Adds `priceType: "total"` (default for flights)
   - Adds `priceAppliesTo: 1` (applies to all travelers)
   - Extracts: airline, flightNumber, origin, destination, times, duration, stops, cabinClass, passengers
   - Handles multiple property name variations (e.g., `airline` vs `carrier`)

2. **`hotelToApiFormat(item: QuoteItem): ApiHotelItem`**
   - Adds `priceType: "per_night"` (default for hotels)
   - Calculates nights from details
   - Infers room type from stars (Suite/Deluxe/Standard)
   - Extracts: name, location, checkIn/checkOut, stars, amenities, guests

3. **`activityToApiFormat(item: QuoteItem): ApiActivityItem`**
   - Adds `priceType: "per_person"` (default for activities)
   - Extracts: name, location, description, duration, time, participants, includes

4. **`transferToApiFormat(item: QuoteItem): ApiTransferItem`**
   - Adds `priceType: "total"` (default for transfers)
   - Extracts: provider, vehicleType, pickup/dropoff locations, time, passengers, meetAndGreet

5. **`carToApiFormat(item: QuoteItem): ApiCarItem`**
   - Adds `priceType: "per_day"` (default for car rentals)
   - Calculates days from date range
   - Extracts: company, carType, carClass, pickup/dropoff locations, dates, days, features

6. **`customToApiFormat(item: QuoteItem): ApiCustomItem`**
   - Adds `priceType: "total"` (default for custom items)
   - Extracts: name, description, category, quantity

#### Validation Helpers

**`validateMappedQuote(quote: CreateQuoteApiInput): QuoteValidationError[]`**

Validates transformed payload before API submission:

**Checks:**
- Required fields: clientId, tripName, startDate, endDate
- Date validation: not in past, end after start, valid format
- Item validation: at least 1 item, required fields per item type
- Pricing validation: markup 0-100%, non-negative discount/taxes/fees
- Traveler validation: at least 1 adult, non-negative children/infants

**Returns:** Array of errors with field, message, and code

**Example Errors:**
```typescript
[
  {
    field: "clientId",
    message: "Client is required",
    code: "REQUIRED_FIELD_MISSING"
  },
  {
    field: "startDate",
    message: "Start date cannot be in past",
    code: "DATE_IN_PAST"
  }
]
```

**`formatValidationErrors(errors: QuoteValidationError[]): string`**

Formats validation errors into user-friendly messages for display to agents.

---

## 2. API Error Handling

### File Location
`app/api/agents/quotes/route.ts` ✅ **UPDATED**

### What Changed

**Before:**
```typescript
catch (error) {
  console.error("[QUOTE_CREATE_ERROR]", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

**After:**
```typescript
catch (error) {
  console.error("[QUOTE_CREATE_ERROR]", error);

  // 1. Check for Zod validation errors
  if (error instanceof z.ZodError) {
    const fieldErrors = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
    
    return NextResponse.json(
      { 
        error: "Validation failed", 
        details: fieldErrors,
        hint: "Check that all required fields are present and formatted correctly"
      },
      { status: 400 }
    );
  }

  // 2. Check for Prisma database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any };
    
    // Unique constraint violations
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { 
          error: "Duplicate record", 
          details: prismaError.meta?.target,
          hint: "A quote with this information already exists"
        },
        { status: 409 }
      );
    }
    
    // Foreign key constraint violations
    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        { 
          error: "Invalid reference", 
          details: prismaError.meta?.field_name,
          hint: "Check that client ID is valid"
        },
        { status: 400 }
      );
    }
  }

  // 3. Check for known application errors
  if (error instanceof Error) {
    // Custom validation errors from QuoteSchemaMapper
    if (error.message.includes("Cannot save quote")) {
      return NextResponse.json(
        { 
          error: "Quote validation failed", 
          hint: error.message
        },
        { status: 400 }
      );
    }
  }

  // 4. Generic error (last resort)
  return NextResponse.json(
    { 
      error: "Unable to save quote", 
      hint: "Please try again. If the problem persists, contact support.",
      supportEmail: "support@fly2any.com"
    },
    { status: 500 }
  );
}
```

### Error Response Structure

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "flights[0].flightNumber",
      "message": "Required",
      "code": "invalid_type"
    }
  ],
  "hint": "Check that all required fields are present and formatted correctly"
}
```

**Database Error (409):**
```json
{
  "error": "Duplicate record",
  "details": ["quoteNumber"],
  "hint": "A quote with this information already exists"
}
```

**Custom Validation Error (400):**
```json
{
  "error": "Quote validation failed",
  "hint": "Cannot save quote: No client selected"
}
```

**Generic Error (500):**
```json
{
  "error": "Unable to save quote",
  "hint": "Please try again. If the problem persists, contact support.",
  "supportEmail": "support@fly2any.com"
}
```

---

## 3. Frontend Save Flow

### File Location
`components/agent/quote-workspace/QuoteWorkspaceProvider.tsx` ⚠️ **NEEDS UPDATE**

### Required Changes

#### 1. Import QuoteSchemaMapper

```typescript
import { 
  workspaceToApiQuote, 
  validateMappedQuote, 
  formatValidationErrors 
} from "@/lib/quotes/QuoteSchemaMapper";
```

#### 2. Update saveQuote Function

**Current Implementation (Lines ~360-430):**
- Manually transforms items by type
- Manually formats dates
- Direct API call with manual payload

**New Implementation:**

```typescript
const saveQuote = useCallback(async () => {
  // ===== PRECONDITION VALIDATION =====
  // Validate prerequisites BEFORE API call
  if (state.items.length === 0 && !state.tripName) {
    return { 
      success: false, 
      error: 'Cannot save empty quote. Add items or trip name first.' 
    };
  }

  if (!state.client?.id) {
    return { 
      success: false, 
      error: 'Please select a client before saving.' 
    };
  }

  dispatch({ type: "SET_SAVING", payload: true });
  
  try {
    // ===== SCHEMA MAPPING =====
    // Use QuoteSchemaMapper for consistent transformation
    // This throws errors for invalid state (no client, empty quote)
    const apiPayload = workspaceToApiQuote(state);
    
    // ===== VALIDATION =====
    // Validate mapped payload before API submission
    const validationErrors = validateMappedQuote(apiPayload);
    if (validationErrors.length > 0) {
      const errorMessage = formatValidationErrors(validationErrors);
      console.error("Quote validation failed:", validationErrors);
      return { 
        success: false, 
        error: errorMessage || 'Quote validation failed. Check console for details.' 
      };
    }
    
    // ===== API CALL =====
    const url = state.id ? `/api/agents/quotes/${state.id}` : "/api/agents/quotes";
    const method = state.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    // ===== SUCCESS HANDLING =====
    if (res.ok) {
      const data = await res.json();
      const savedQuote = data.quote;
      
      // Update state with saved quote ID
      if (!state.id && savedQuote?.id) {
        dispatch({ 
          type: "LOAD_QUOTE", 
          payload: { 
            id: savedQuote.id,
            viewToken: savedQuote.viewToken 
          } 
        });
      }
      
      // Update last saved timestamp
      dispatch({ 
        type: "SET_LAST_SAVED", 
        payload: new Date().toISOString() 
      });
      
      return { success: true, quote: savedQuote };
    } 
    // ===== ERROR HANDLING =====
    else {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error("Save quote failed:", errorData);
      
      // Extract actionable message from enhanced API
      const errorMsg = errorData.hint || 
                     errorData.details?.[0]?.message || 
                     errorData.error || 
                     'Failed to save quote';
      
      return { success: false, error: errorMsg };
    }
  } 
  // ===== EXCEPTION HANDLING =====
  catch (error) {
    console.error("Save quote error:", error);
    
    // Handle QuoteSchemaMapper errors (thrown before API call)
    if (error instanceof Error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    // Handle network/other errors
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  } 
  // ===== CLEANUP =====
  finally {
    dispatch({ type: "SET_SAVING", payload: false });
  }
}, [state]);
```

#### 3. Update Autosave Behavior

**Current Implementation (Lines ~425-435):**
```typescript
useEffect(() => {
  const hasItems = state.items.length > 0;
  if ((hasItems || state.tripName) && state.client?.id) {
    debouncedSave();
  }
}, [state.items, state.tripName, state.destination, state.startDate, state.endDate, state.travelers, state.pricing.markupPercent, state.client, debouncedSave]);
```

**Enhanced Implementation:**

```typescript
useEffect(() => {
  const hasItems = state.items.length > 0;
  const isClientSelected = !!state.client?.id;
  const hasValidData = hasItems || state.tripName;
  
  // Only autosave if:
  // 1. Client is selected (prerequisite)
  // 2. Has valid data (items or trip name)
  // 3. NOT in the middle of a manual save (isSaving)
  // 4. NOT in edit mode (id exists - manual save only)
  if (isClientSelected && hasValidData && !state.ui.isSaving && !state.id) {
    debouncedSave();
  }
}, [
  state.items, 
  state.tripName, 
  state.destination, 
  state.startDate, 
  state.endDate, 
  state.travelers, 
  state.pricing.markupPercent, 
  state.client?.id,
  state.ui.isSaving,
  state.id,
  debouncedSave
]);
```

**Key Improvements:**
1. Check `state.ui.isSaving` to prevent race conditions
2. Check `!state.id` to only autosave new quotes (not edits)
3. Explicit variable names for clarity
4. Separate conditions for easier debugging

---

## 4. Save State Indicator Component

### File Location
**NEW FILE:** `components/agent/quote-workspace/SaveIndicator.tsx`

### Component Implementation

```typescript
"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";

export function SaveIndicator() {
  const { state } = useQuoteWorkspace();
  const [timeAgo, setTimeAgo] = useState<string>("Not saved");
  
  // Update "time ago" display every minute
  useEffect(() => {
    if (!state.ui.lastSavedAt) {
      setTimeAgo("Not saved");
      return;
    }
    
    const updateAgo = () => {
      const saved = new Date(state.ui.lastSavedAt!);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - saved.getTime()) / 1000);
      
      if (seconds < 60) {
        setTimeAgo("Just saved");
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`Saved ${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        setTimeAgo(`Saved ${hours} hour${hours !== 1 ? 's' : ''} ago`);
      } else {
        const days = Math.floor(seconds / 86400);
        setTimeAgo(`Saved ${days} day${days !== 1 ? 's' : ''} ago`);
      }
    };
    
    // Initial update
    updateAgo();
    
    // Update every minute
    const interval = setInterval(updateAgo, 60000);
    
    return () => clearInterval(interval);
  }, [state.ui.lastSavedAt]);
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all">
      {/* Saving state */}
      {state.ui.isSaving && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="text-gray-600">Saving...</span>
        </>
      )}
      
      {/* Saved state */}
      {!state.ui.isSaving && state.ui.lastSavedAt && (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-gray-700 font-medium">{timeAgo}</span>
        </>
      )}
      
      {/* Unsaved state */}
      {!state.ui.isSaving && !state.ui.lastSavedAt && (
        <>
          <Circle className="w-4 h-4 text-gray-300" />
          <span className="text-gray-500">Unsaved changes</span>
        </>
      )}
    </div>
  );
}
```

### Integration into Quote Workspace

**File:** `components/agent/quote-workspace/QuoteWorkspace.tsx`

**Add to header:**

```typescript
import { SaveIndicator } from "./SaveIndicator";

// In header area:
<div className="flex items-center gap-4">
  <SaveIndicator />
  {/* Other header elements */}
</div>
```

**Visual States:**

1. **Saving:**
   - Spinner icon
   - Gray text: "Saving..."
   - Active during API call

2. **Saved:**
   - Green checkmark icon
   - Black text: "Saved X minutes ago"
   - Updates every minute
   - Shows relative time

3. **Unsaved:**
   - Gray circle icon
   - Gray text: "Unsaved changes"
   - Shown when quote has changes but not yet saved

---

## 5. Testing Strategy

### Unit Tests

**QuoteSchemaMapper Tests**

```typescript
// __tests__/lib/quotes/QuoteSchemaMapper.test.ts

describe('QuoteSchemaMapper', () => {
  describe('workspaceToApiQuote', () => {
    it('should throw error when no client selected', () => {
      const state = {
        client: null,
        items: [{ type: 'flight', price: 1000 }],
        // ... other fields
      };
      
      expect(() => workspaceToApiQuote(state)).toThrow(
        'Cannot save quote: No client selected'
      );
    });
    
    it('should throw error when empty quote', () => {
      const state = {
        client: { id: '123' },
        items: [],
        tripName: '',
        // ... other fields
      };
      
      expect(() => workspaceToApiQuote(state)).toThrow(
        'Cannot save empty quote: Add items or trip name first'
      );
    });
    
    it('should transform flight item correctly', () => {
      const state = {
        client: { id: '123' },
        items: [{
          type: 'flight',
          price: 1000,
          details: {
            airline: 'United',
            flightNumber: 'UA123',
            origin: 'JFK',
            destination: 'LAX',
            departureTime: '2026-01-23T10:00:00Z',
            arrivalTime: '2026-01-23T13:00:00Z',
            duration: '3h 0m',
            stops: 0,
            cabinClass: 'economy',
          },
        }],
        // ... other fields
      };
      
      const result = workspaceToApiQuote(state);
      
      expect(result.flights).toHaveLength(1);
      expect(result.flights[0].type).toBe('flight');
      expect(result.flights[0].priceType).toBe('total');
      expect(result.flights[0].priceAppliesTo).toBe(1);
      expect(result.flights[0].airline).toBe('United');
      expect(result.flights[0].flightNumber).toBe('UA123');
      // ... assert all fields
    });
    
    it('should normalize dates to ISO format', () => {
      const state = {
        client: { id: '123' },
        startDate: '2026-01-23', // Date string
        endDate: '2026-01-30',
        items: [{ type: 'flight', price: 1000 }],
        // ... other fields
      };
      
      const result = workspaceToApiQuote(state);
      
      expect(result.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
  
  describe('validateMappedQuote', () => {
    it('should return empty array for valid quote', () => {
      const validQuote = {
        clientId: '123',
        tripName: 'Paris Trip',
        startDate: '2026-02-01T00:00:00Z',
        endDate: '2026-02-07T00:00:00Z',
        adults: 2,
        children: 0,
        infants: 0,
        flights: [{
          type: 'flight',
          airline: 'United',
          flightNumber: 'UA123',
          // ... all required fields
        }],
        // ... other arrays
        agentMarkupPercent: 15,
        discount: 0,
        taxes: 100,
        fees: 50,
      };
      
      const errors = validateMappedQuote(validQuote);
      expect(errors).toHaveLength(0);
    });
    
    it('should detect missing required fields', () => {
      const invalidQuote = {
        clientId: '', // Missing
        tripName: '', // Missing
        // ... rest
      };
      
      const errors = validateMappedQuote(invalidQuote);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'clientId')).toBe(true);
      expect(errors.some(e => e.field === 'tripName')).toBe(true);
    });
    
    it('should detect invalid dates', () => {
      const invalidQuote = {
        clientId: '123',
        tripName: 'Trip',
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-01-01T00:00:00Z', // Same as start
        // ... rest
      };
      
      const errors = validateMappedQuote(invalidQuote);
      expect(errors.some(e => e.code === 'END_DATE_BEFORE_START')).toBe(true);
    });
    
    it('should detect past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const invalidQuote = {
        clientId: '123',
        tripName: 'Trip',
        startDate: yesterday.toISOString(), // In past
        endDate: new Date().toISOString(),
        // ... rest
      };
      
      const errors = validateMappedQuote(invalidQuote);
      expect(errors.some(e => e.code === 'DATE_IN_PAST')).toBe(true);
    });
  });
  
  describe('formatValidationErrors', () => {
    it('should format single error', () => {
      const errors = [{
        field: 'clientId',
        message: 'Client is required',
        code: 'REQUIRED_FIELD_MISSING',
      }];
      
      const formatted = formatValidationErrors(errors);
      expect(formatted).toBe('client id: client is required');
    });
    
    it('should format multiple errors', () => {
      const errors = [
        {
          field: 'clientId',
          message: 'Client is required',
          code: 'REQUIRED_FIELD_MISSING',
        },
        {
          field: 'startDate',
          message: 'Start date cannot be in past',
          code: 'DATE_IN_PAST',
        },
      ];
      
      const formatted = formatValidationErrors(errors);
      expect(formatted).toContain('client id: client is required');
      expect(formatted).toContain('start date: start date cannot be in past');
    });
  });
});
```

### Integration Tests

**API Endpoint Tests**

```typescript
// __tests__/api/agents/quotes.test.ts

describe('POST /api/agents/quotes', () => {
  it('should create quote with valid payload', async () => {
    const payload = {
      clientId: '123',
      tripName: 'Paris Trip',
      destination: 'Paris',
      startDate: '2026-02-01T00:00:00Z',
      endDate: '2026-02-07T00:00:00Z',
      adults: 2,
      children: 0,
      infants: 0,
      flights: [{
        type: 'flight',
        price: 1000,
        priceType: 'total',
        priceAppliesTo: 1,
        currency: 'USD',
        airline: 'United',
        flightNumber: 'UA123',
        origin: 'JFK',
        originCity: 'New York',
        destination: 'CDG',
        destinationCity: 'Paris',
        departureTime: '2026-02-01T10:00:00Z',
        arrivalTime: '2026-02-01T13:00:00Z',
        duration: '3h 0m',
        stops: 0,
        cabinClass: 'economy',
        passengers: 2,
        date: '2026-02-01T00:00:00Z',
        createdAt: new Date().toISOString(),
      }],
      // ... other arrays
      agentMarkupPercent: 15,
      discount: 0,
      taxes: 100,
      fees: 50,
    };
    
    const response = await fetch('/api/agents/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.quote).toBeDefined();
    expect(data.quote.id).toBeDefined();
    expect(data.quote.quoteNumber).toMatch(/^QT-\d{4}-\d{6}$/);
  });
  
  it('should return 400 for invalid payload', async () => {
    const payload = {
      clientId: '', // Invalid
      tripName: '', // Invalid
      // ... rest
    };
    
    const response = await fetch('/api/agents/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
    expect(data.details.length).toBeGreaterThan(0);
  });
  
  it('should return 400 for past dates', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const payload = {
      clientId: '123',
      tripName: 'Trip',
      startDate: yesterday.toISOString(), // In past
      endDate: new Date().toISOString(),
      // ... rest
    };
    
    const response = await fetch('/api/agents/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.details.some(d => d.code === 'DATE_IN_PAST')).toBe(true);
  });
});
```

### Manual Testing Checklist

**Pre-Deployment Checklist:**

- [ ] Create new quote with flights only
- [ ] Create new quote with hotels only
- [ ] Create new quote with mixed items (flights + hotels + activities)
- [ ] Create quote without client selected → should show error
- [ ] Create empty quote → should show error
- [ ] Create quote with past dates → should show error
- [ ] Create quote with end date before start date → should show error
- [ ] Create valid quote → should save successfully
- [ ] Edit saved quote → should update successfully
- [ ] Save indicator shows "Saving..." during API call
- [ ] Save indicator shows "Saved X minutes ago" after successful save
- [ ] Save indicator shows "Unsaved changes" when unsaved
- [ ] Autosave works for new quotes (client selected, has items)
- [ ] Autosave does NOT trigger for edited quotes
- [ ] Autosave does NOT trigger during manual save
- [ ] Multiple rapid saves do not cause race conditions
- [ ] Validation errors display actionable messages
- [ ] Generic errors show support email
- [ ] Saved quote ID persists in state
- [ ] Reloaded quote data matches saved data

---

## 6. Definition of Done

Phase 1 is **COMPLETE** when:

### Functional Requirements

✅ **Save Reliability ≥95%**
- Measured by: 100 save attempts across different scenarios
- Success criteria: ≥95 successful saves with valid data

✅ **No Generic "Internal Server Error"**
- All validation failures return specific error messages
- All database errors return specific hints
- Generic errors only as last resort

✅ **Actionable Error Messages**
- Every failed save shows specific reason
- Agent knows exactly what to fix
- Console logs detailed error context

✅ **Visible Save State**
- Agent knows if quote is saved, saving, or unsaved
- Save indicator always visible and up-to-date
- "Time ago" updates correctly every minute

✅ **No Silent Failures**
- Every save attempt returns success/failure
- Error messages displayed to agent
- Errors logged server-side with context

✅ **Autosave Safety**
- Only autosaves new quotes (not edits)
- Only autosaves when client is selected
- Only autosaves when has valid data
- No race conditions with manual save

✅ **Data Integrity**
- Saved data reloads correctly
- Same quote can be saved repeatedly without corruption
- All required fields present in saved quote
- Pricing calculated correctly on both sides

### Technical Requirements

✅ **QuoteSchemaMapper Complete**
- All 6 item transformers implemented and tested
- Validation function covers all scenarios
- Error formatting produces user-friendly messages

✅ **API Error Handling Enhanced**
- Zod errors handled with field-level details
- Prisma errors handled with specific codes
- Custom errors handled appropriately
- Generic errors include support email

✅ **Frontend Save Flow Updated**
- Uses QuoteSchemaMapper before API call
- Validates transformed payload
- Handles all error types
- Updates state correctly

✅ **Save State Indicator Integrated**
- Component created and integrated
- Shows 3 states (saving, saved, unsaved)
- Updates "time ago" every minute

### Testing Requirements

✅ **Unit Tests**
- QuoteSchemaMapper transformers tested
- Validation function tested
- Error formatter tested

✅ **Integration Tests**
- API endpoint tested with valid payload
- API endpoint tested with invalid payloads
- Error responses tested

✅ **Manual Testing**
- All manual test scenarios passed
- No critical bugs found
- User experience validated

### Documentation Requirements

✅ **Code Comments**
- All functions have JSDoc comments
- Complex logic explained inline
- Edge cases documented

✅ **Implementation Guide**
- This document complete
- Code examples provided
- Testing strategy documented

---

## Success Metrics Tracking

During Phase 1, track:

| Metric | Target | Current | Status |
|--------|---------|---------|--------|
| Save Reliability | ≥95% | TBD | 📊 |
| Generic Errors | 0% | TBD | 📊 |
| Actionable Errors | 100% | TBD | 📊 |
| Save Visibility | 100% | TBD | 📊 |
| Silent Failures | 0% | TBD | 📊 |
| Autosave Safety | 100% | TBD | 📊 |
| Data Integrity | 100% | TBD | 📊 |

---

## Next Steps

After Phase 1 completion:

1. ✅ Deploy to staging environment
2. ✅ QA team validates all test scenarios
3. ✅ Monitor save success rate for 24 hours
4. ✅ Fix any bugs found in testing
5. ✅ Deploy to production
6. ✅ Monitor save success rate for 7 days
7. ✅ Proceed to Phase 2: Sending

---

## Rollback Plan

If critical issues arise:

1. Revert API error handling to previous version
2. Remove QuoteSchemaMapper integration from frontend
3. Remove SaveIndicator component
4. Disable autosave temporarily
5. Alert team to monitor for issues

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** January 23, 2026
