import { prisma, isPrismaAvailable } from '@/lib/prisma';

/**
 * User Preferences Service
 * Handles all operations related to user preferences
 */

export type UserPreferences = {
  id: string;
  userId: string;

  // Travel preferences
  preferredCabinClass: string | null;
  preferredAirlines: string[];
  homeAirport: string | null;

  // Notification preferences
  emailNotifications: boolean;
  priceAlertEmails: boolean;
  dealAlerts: boolean;
  newsletterOptIn: boolean;
  notifications: any; // JsonValue - Advanced notification settings

  // UI preferences
  currency: string;
  language: string;
  theme: string;

  createdAt: Date;
  updatedAt: Date;
};

export type UpdatePreferencesData = {
  // Travel preferences
  preferredCabinClass?: string | null;
  preferredAirlines?: string[];
  homeAirport?: string | null;

  // Notification preferences
  emailNotifications?: boolean;
  priceAlertEmails?: boolean;
  dealAlerts?: boolean;
  newsletterOptIn?: boolean;

  // UI preferences
  currency?: string;
  language?: string;
  theme?: string;
};

class PreferencesService {
  /**
   * Get user preferences by user ID
   * Creates default preferences if they don't exist
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    if (!isPrismaAvailable() || !prisma) {
      console.warn('Database not available. Returning null preferences.');
      return null;
    }

    try {
      // Try to find existing preferences
      let preferences = await prisma!.userPreferences.findUnique({
        where: { userId },
      });

      // If preferences don't exist, create default ones
      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId);
      }

      return preferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw new Error('Failed to get user preferences');
    }
  }

  /**
   * Create default preferences for a user
   */
  async createDefaultPreferences(
    userId: string,
    initialData?: Partial<UpdatePreferencesData>
  ): Promise<UserPreferences> {
    if (!isPrismaAvailable() || !prisma) {
      throw new Error('Database not available');
    }

    try {
      // Verify user exists before creating preferences
      const user = await prisma!.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} does not exist`);
      }

      const preferences = await prisma!.userPreferences.create({
        data: {
          userId,
          // Travel preferences
          preferredCabinClass: initialData?.preferredCabinClass ?? null,
          preferredAirlines: initialData?.preferredAirlines ?? [],
          homeAirport: initialData?.homeAirport ?? null,

          // Notification preferences (defaults from schema)
          emailNotifications: initialData?.emailNotifications ?? true,
          priceAlertEmails: initialData?.priceAlertEmails ?? true,
          dealAlerts: initialData?.dealAlerts ?? true,
          newsletterOptIn: initialData?.newsletterOptIn ?? false,
          notifications: undefined, // Advanced notification settings (JSON)

          // UI preferences (defaults from schema)
          currency: initialData?.currency ?? 'USD',
          language: initialData?.language ?? 'en',
          theme: initialData?.theme ?? 'light',
        },
      });

      return preferences;
    } catch (error) {
      console.error('Error creating preferences:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    data: UpdatePreferencesData
  ): Promise<UserPreferences> {
    if (!isPrismaAvailable() || !prisma) {
      throw new Error('Database not available');
    }

    try {
      // Filter out undefined values
      const updateData: any = {};

      Object.keys(data).forEach((key) => {
        const value = (data as any)[key];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      const preferences = await prisma!.userPreferences.update({
        where: { userId },
        data: updateData,
      });

      return preferences;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Delete user preferences
   */
  async deletePreferences(userId: string): Promise<void> {
    if (!isPrismaAvailable() || !prisma) {
      throw new Error('Database not available');
    }

    try {
      await prisma!.userPreferences.delete({
        where: { userId },
      });
    } catch (error) {
      console.error('Error deleting preferences:', error);
      throw error;
    }
  }

  /**
   * Check if user has preferences
   */
  async hasPreferences(userId: string): Promise<boolean> {
    if (!isPrismaAvailable() || !prisma) {
      return false;
    }

    try {
      const count = await prisma!.userPreferences.count({
        where: { userId },
      });

      return count > 0;
    } catch (error) {
      console.error('Error checking preferences:', error);
      return false;
    }
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
