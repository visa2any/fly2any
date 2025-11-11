'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PreferenceSection } from '@/components/account/PreferenceSection';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Zod validation schema
const preferencesSchema = z.object({
  preferredCabinClass: z.enum(['economy', 'premium', 'business', 'first']).nullable(),
  preferredAirlines: z.array(z.string()),
  homeAirport: z.string().nullable(),
  emailNotifications: z.boolean(),
  priceAlertEmails: z.boolean(),
  dealAlerts: z.boolean(),
  newsletterOptIn: z.boolean(),
  currency: z.string(),
  language: z.string(),
  theme: z.enum(['light', 'dark', 'auto']),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface UserPreferences extends PreferencesFormData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Cabin class options
const CABIN_CLASS_OPTIONS = [
  { value: '', label: 'No preference' },
  { value: 'economy', label: 'Economy' },
  { value: 'premium', label: 'Premium Economy' },
  { value: 'business', label: 'Business Class' },
  { value: 'first', label: 'First Class' },
];

// Popular airlines
const POPULAR_AIRLINES = [
  'AA', 'UA', 'DL', 'WN', 'AS', 'B6', 'NK', 'F9', // US Airlines
  'BA', 'LH', 'AF', 'KL', 'IB', 'AZ', 'VS', // European Airlines
  'EK', 'QR', 'EY', 'SV', 'MS', // Middle East Airlines
  'SQ', 'CX', 'TG', 'NH', 'JL', // Asian Airlines
];

// Currency options
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
];

// Language options
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

// Theme options
const THEME_OPTIONS = [
  { value: 'light', label: 'Light Mode' },
  { value: 'dark', label: 'Dark Mode' },
  { value: 'auto', label: 'Auto (System)' },
];

export default function PreferencesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesFormData>({
    preferredCabinClass: null,
    preferredAirlines: [],
    homeAirport: null,
    emailNotifications: true,
    priceAlertEmails: true,
    dealAlerts: true,
    newsletterOptIn: false,
    currency: 'USD',
    language: 'en',
    theme: 'light',
  });
  const [airlineInput, setAirlineInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/preferences');

      if (response.status === 401) {
        toast.error('Please log in to view preferences');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load preferences');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setPreferences({
          preferredCabinClass: result.data.preferredCabinClass,
          preferredAirlines: result.data.preferredAirlines || [],
          homeAirport: result.data.homeAirport,
          emailNotifications: result.data.emailNotifications,
          priceAlertEmails: result.data.priceAlertEmails,
          dealAlerts: result.data.dealAlerts,
          newsletterOptIn: result.data.newsletterOptIn,
          currency: result.data.currency,
          language: result.data.language,
          theme: result.data.theme,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors({});

      // Validate form data
      const validationResult = preferencesSchema.safeParse(preferences);

      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.issues.forEach((err) => {
          const field = err.path.join('.');
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        toast.error('Please fix validation errors');
        return;
      }

      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to save preferences');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Preferences saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAirline = () => {
    const code = airlineInput.trim().toUpperCase();
    if (code && code.length === 2 && !preferences.preferredAirlines.includes(code)) {
      setPreferences({
        ...preferences,
        preferredAirlines: [...preferences.preferredAirlines, code],
      });
      setAirlineInput('');
    }
  };

  const handleRemoveAirline = (code: string) => {
    setPreferences({
      ...preferences,
      preferredAirlines: preferences.preferredAirlines.filter((a) => a !== code),
    });
  };

  const handleAirlineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAirline();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <p className="text-gray-600 mt-2">
            Customize your experience and manage your notification settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Travel Preferences */}
          <PreferenceSection
            title="Travel Preferences"
            description="Set your default travel preferences to personalize your flight search"
          >
            <Select
              label="Preferred Cabin Class"
              options={CABIN_CLASS_OPTIONS}
              value={preferences.preferredCabinClass || ''}
              onChange={(value) =>
                setPreferences({
                  ...preferences,
                  preferredCabinClass: (value || null) as 'economy' | 'premium' | 'business' | 'first' | null,
                })
              }
              fullWidth
              hint="Select your preferred cabin class for flight searches"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Airlines
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Enter airline code (e.g., AA, UA)"
                  value={airlineInput}
                  onChange={(e) => setAirlineInput(e.target.value.toUpperCase())}
                  onKeyDown={handleAirlineKeyDown}
                  maxLength={2}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleAddAirline}
                  disabled={!airlineInput.trim() || airlineInput.trim().length !== 2}
                >
                  Add
                </Button>
              </div>
              {preferences.preferredAirlines.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferences.preferredAirlines.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium"
                    >
                      {code}
                      <button
                        type="button"
                        onClick={() => handleRemoveAirline(code)}
                        className="ml-1 hover:text-primary-900"
                        aria-label={`Remove ${code}`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Popular airlines: {POPULAR_AIRLINES.slice(0, 8).join(', ')}
              </p>
            </div>

            <Input
              label="Home Airport"
              placeholder="Enter airport code (e.g., JFK, LAX)"
              value={preferences.homeAirport || ''}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  homeAirport: e.target.value.toUpperCase() || null,
                })
              }
              maxLength={3}
              fullWidth
              hint="Your default departure airport"
            />
          </PreferenceSection>

          {/* Notification Preferences */}
          <PreferenceSection
            title="Notification Preferences"
            description="Choose how you want to receive updates and communications"
          >
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, emailNotifications: checked })
              }
              label="Email Notifications"
              description="Receive general email notifications about your bookings and account"
              id="emailNotifications"
            />

            <Switch
              checked={preferences.priceAlertEmails}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, priceAlertEmails: checked })
              }
              label="Price Alert Emails"
              description="Get notified when prices drop for your saved searches"
              id="priceAlertEmails"
            />

            <Switch
              checked={preferences.dealAlerts}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, dealAlerts: checked })
              }
              label="Deal Alerts"
              description="Receive notifications about special deals and promotions"
              id="dealAlerts"
            />

            <Switch
              checked={preferences.newsletterOptIn}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, newsletterOptIn: checked })
              }
              label="Newsletter Subscription"
              description="Subscribe to our weekly travel newsletter with tips and destinations"
              id="newsletterOptIn"
            />
          </PreferenceSection>

          {/* UI Preferences */}
          <PreferenceSection
            title="Display Preferences"
            description="Customize how information is displayed across the platform"
          >
            <Select
              label="Currency"
              options={CURRENCY_OPTIONS}
              value={preferences.currency}
              onChange={(value) =>
                setPreferences({ ...preferences, currency: value })
              }
              fullWidth
              hint="All prices will be displayed in this currency"
            />

            <Select
              label="Language"
              options={LANGUAGE_OPTIONS}
              value={preferences.language}
              onChange={(value) =>
                setPreferences({ ...preferences, language: value })
              }
              fullWidth
              hint="Choose your preferred language for the interface"
            />

            <Select
              label="Theme"
              options={THEME_OPTIONS}
              value={preferences.theme}
              onChange={(value) =>
                setPreferences({
                  ...preferences,
                  theme: value as 'light' | 'dark' | 'auto',
                })
              }
              fullWidth
              hint="Choose between light mode, dark mode, or automatic based on system settings"
            />
          </PreferenceSection>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={loadPreferences}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
