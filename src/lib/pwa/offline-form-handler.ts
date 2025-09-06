/**
 * Offline Form Handler for Fly2Any PWA
 * Handles form submissions when offline with background sync
 */

import { getPWAManager } from './pwa-manager';

export interface OfflineFormData {
  id?: string;
  type: 'lead-form' | 'quote-request' | 'newsletter' | 'contact-form';
  data: any;
  endpoint: string;
  method?: string;
  timestamp: number;
}

export interface FormSubmissionResult {
  success: boolean;
  submitted: boolean;
  queued: boolean;
  message: string;
  queueId?: string;
}

class OfflineFormHandler {
  private queueKey = 'fly2any-form-queue';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  /**
   * Submit form with offline support
   */
  async submitForm(
    endpoint: string,
    formData: any,
    type: OfflineFormData['type'] = 'lead-form',
    options: {
      method?: string;
      headers?: Record<string, string>;
      showOfflineMessage?: boolean;
    } = {}
  ): Promise<FormSubmissionResult> {
    const { method = 'POST', headers = {}, showOfflineMessage = true } = options;
    
    // Check if online
    if (navigator.onLine) {
      try {
        // Try immediate submission
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          return {
            success: true,
            submitted: true,
            queued: false,
            message: 'Form submitted successfully!'
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Form submission failed, queuing for offline:', error);
        // Fall through to offline handling
      }
    }

    // Queue for offline submission
    try {
      const queueId = await this.queueFormSubmission({
        type,
        data: formData,
        endpoint,
        method,
        timestamp: Date.now()
      });

      // Store in IndexedDB for background sync
      // TODO: Implement background sync for offline form submissions
      console.log('Form stored for offline submission:', { type, timestamp: Date.now() });

      // Show offline message if requested
      if (showOfflineMessage) {
        this.showOfflineNotification(type);
      }

      return {
        success: true,
        submitted: false,
        queued: true,
        message: navigator.onLine 
          ? 'Form queued for submission. Please check your connection.'
          : 'Form saved! It will be submitted when you\'re back online.',
        queueId
      };
    } catch (error) {
      console.error('Failed to queue form submission:', error);
      
      return {
        success: false,
        submitted: false,
        queued: false,
        message: 'Failed to save form. Please try again.'
      };
    }
  }

  /**
   * Queue form submission in localStorage
   */
  private async queueFormSubmission(formData: OfflineFormData): Promise<string> {
    const queueId = this.generateQueueId();
    const queuedForm = { ...formData, id: queueId };

    try {
      const existingQueue = this.getQueue();
      existingQueue.push(queuedForm);
      localStorage.setItem(this.queueKey, JSON.stringify(existingQueue));
      
      console.log('Form queued for offline submission:', queueId);
      return queueId;
    } catch (error) {
      throw new Error('Failed to queue form submission');
    }
  }

  /**
   * Process queued forms when online
   */
  async processQueue(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Still offline, skipping queue processing');
      return;
    }

    const queue = this.getQueue();
    if (queue.length === 0) {
      return;
    }

    console.log(`Processing ${queue.length} queued forms`);

    const processedIds: string[] = [];
    const failedForms: OfflineFormData[] = [];

    for (const form of queue) {
      try {
        await this.submitQueuedForm(form);
        processedIds.push(form.id!);
        console.log('Successfully submitted queued form:', form.id);
      } catch (error) {
        console.error('Failed to submit queued form:', form.id, error);
        
        // Increment retry count
        const updatedForm = { ...form, retries: (form.retries || 0) + 1 };
        
        if (updatedForm.retries < this.maxRetries) {
          failedForms.push(updatedForm);
        } else {
          console.error('Max retries reached for form:', form.id);
          processedIds.push(form.id!); // Remove from queue
        }
      }
    }

    // Update queue - remove processed forms, keep failed ones for retry
    const newQueue = failedForms.filter(form => !processedIds.includes(form.id!));
    localStorage.setItem(this.queueKey, JSON.stringify(newQueue));

    if (processedIds.length > 0) {
      this.showSyncSuccessNotification(processedIds.length);
    }
  }

  /**
   * Submit a queued form
   */
  private async submitQueuedForm(form: OfflineFormData): Promise<void> {
    const response = await fetch(form.endpoint, {
      method: form.method || 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get current queue
   */
  private getQueue(): (OfflineFormData & { id?: string; retries?: number })[] {
    try {
      const queueData = localStorage.getItem(this.queueKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Failed to parse form queue:', error);
      return [];
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    count: number;
    forms: (OfflineFormData & { id?: string; retries?: number })[];
    totalSize: number;
  } {
    const forms = this.getQueue();
    const totalSize = JSON.stringify(forms).length;
    
    return {
      count: forms.length,
      forms,
      totalSize
    };
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    localStorage.removeItem(this.queueKey);
    console.log('Form queue cleared');
  }

  /**
   * Remove specific form from queue
   */
  removeFromQueue(queueId: string): boolean {
    try {
      const queue = this.getQueue();
      const filteredQueue = queue.filter(form => form.id !== queueId);
      
      if (filteredQueue.length < queue.length) {
        localStorage.setItem(this.queueKey, JSON.stringify(filteredQueue));
        console.log('Removed form from queue:', queueId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove form from queue:', error);
      return false;
    }
  }

  /**
   * Initialize offline form handler
   */
  initialize(): void {
    // Process queue when coming online
    window.addEventListener('online', () => {
      console.log('Connection restored - processing form queue');
      setTimeout(() => this.processQueue(), 1000);
    });

    // Process queue on page load if online
    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 2000);
    }

    console.log('Offline form handler initialized');
  }

  /**
   * Generate unique queue ID
   */
  private generateQueueId(): string {
    return `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show offline notification
   */
  private showOfflineNotification(type: OfflineFormData['type']): void {
    const messages = {
      'lead-form': '📝 Your inquiry has been saved and will be sent when you\'re back online.',
      'quote-request': '💼 Your quote request has been saved and will be processed when connection is restored.',
      'newsletter': '📧 Newsletter subscription saved! You\'ll be subscribed when back online.',
      'contact-form': '📞 Your message has been saved and will be sent when connection is restored.'
    };

    this.showNotification('Form Saved Offline', messages[type]);
  }

  /**
   * Show sync success notification
   */
  private showSyncSuccessNotification(count: number): void {
    const message = count === 1 
      ? 'Your saved form has been submitted successfully!'
      : `${count} saved forms have been submitted successfully!`;
    
    this.showNotification('✅ Forms Synced', message);
  }

  /**
   * Show browser notification
   */
  private showNotification(title: string, message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon-32x32.png',
        tag: 'offline-form-sync'
      });
    } else {
      // Fallback to console log
      console.log(`${title}: ${message}`);
    }
  }
}

// Export singleton instance
export const offlineFormHandler = new OfflineFormHandler();

// Initialize when imported
if (typeof window !== 'undefined') {
  offlineFormHandler.initialize();
}

// Utility function for React components
export function useOfflineFormSubmission() {
  // Create serialization-safe function references
  return {
    submitForm: (formData: FormData, endpoint: string, metadata?: any) => 
      offlineFormHandler.submitForm(formData, endpoint, metadata),
    getQueueStatus: () => 
      offlineFormHandler.getQueueStatus(),
    processQueue: () => 
      offlineFormHandler.processQueue(),
    clearQueue: () => 
      offlineFormHandler.clearQueue()
  };
}

export default offlineFormHandler;