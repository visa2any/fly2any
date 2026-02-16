import { z } from 'zod';
import type { WizardStep } from '@/lib/properties/types';

// --- Per-Step Validation Schemas ---

export const basicsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.string().min(1, 'Select a property type'),
});

export const locationSchema = z.object({
  location: z.object({
    address: z.string().min(3, 'Enter a street address'),
    city: z.string().min(2, 'Enter a city'),
    country: z.string().min(2, 'Select a country'),
  }),
});

export const spacesSchema = z.object({
  specs: z.object({
    guests: z.number().min(1, 'At least 1 guest required'),
    bedrooms: z.number().min(0),
    beds: z.number().min(1, 'At least 1 bed required'),
    bathrooms: z.number().min(1, 'At least 1 bathroom required'),
  }),
});

export const amenitiesSchema = z.object({
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
});

export const photosSchema = z.object({
  images: z.array(z.any()).min(1, 'Upload at least one photo'),
});

export const policiesSchema = z.object({
  policies: z.object({
    checkInTime: z.string().min(1, 'Set a check-in time'),
    checkOutTime: z.string().min(1, 'Set a check-out time'),
    cancellationPolicy: z.string().min(1, 'Select a cancellation policy'),
  }),
});

export const pricingSchema = z.object({
  pricing: z.object({
    basePrice: z.number().min(1, 'Set a base price greater than $0'),
    currency: z.string().min(1, 'Select a currency'),
  }),
});

// --- Schema Map ---

const stepSchemaMap: Partial<Record<WizardStep, z.ZodSchema>> = {
  basics: basicsSchema,
  location: locationSchema,
  spaces: spacesSchema,
  amenities: amenitiesSchema,
  photos: photosSchema,
  policies: policiesSchema,
  pricing: pricingSchema,
  // 'review' has no validation (it's the final review screen)
};

// --- Validate Function ---

export type StepValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateStep(step: WizardStep, formData: Record<string, any>): StepValidationResult {
  const schema = stepSchemaMap[step];
  if (!schema) return { valid: true, errors: [] };

  const result = schema.safeParse(formData);
  if (result.success) return { valid: true, errors: [] };

  const errors = result.error.issues.map(issue => issue.message);
  return { valid: false, errors };
}
