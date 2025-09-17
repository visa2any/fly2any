'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { format, addHours, addDays } from 'date-fns';
import { Contact, Segment } from '../../lib/email-marketing/utils';
import { 
  sanitizeEmailList, 
  sanitizeUserInput, 
  sanitizePreviewContent,
  globalRateLimiter
} from '../../lib/security/sanitization';
import { useSecureNotifications } from '../../hooks/useSecureNotifications';

interface CampaignSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    name: string;
    subject: string;
    content: string;
    previewText?: string;
  };
  onSend: (sendOptions: SendOptions) => Promise<void>;
}

interface SendOptions {
  recipientType: 'all' | 'segment' | 'custom';
  segmentIds?: string[];
  customEmails?: string[];
  testEmail?: string;
  sendTiming: 'immediate' | 'scheduled';
  scheduledDate?: Date;
  skipValidation?: boolean;
}

interface RecipientStats {
  total: number;
  active: number;
  segments: { id: string; name: string; count: number }[];
  recentEngagement: number;
}

export default function SecureCampaignSendDialog({
  isOpen,
  onClose,
  campaign,
  onSend
}: CampaignSendDialogProps) {
  const [step, setStep] = useState<'recipients' | 'test' | 'confirm' | 'schedule'>('recipients');
  const [loading, setLoading] = useState(false);
  const [sendOptions, setSendOptions] = useState<SendOptions>({
    recipientType: 'all',
    sendTiming: 'immediate'
  });
  
  // Data states
  const [recipientStats, setRecipientStats] = useState<RecipientStats | null>(null);
  const [availableSegments, setAvailableSegments] = useState<Segment[]>([]);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  // UI states
  const [showPreview, setShowPreview] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Security states
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const notifications = useSecureNotifications();

  // Load initial data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadRecipientData();
      loadAvailableSegments();
      // Reset state
      setStep('recipients');
      setTestEmailSent(false);
      setSendOptions({
        recipientType: 'all',
        sendTiming: 'immediate'
      });
      setValidationErrors([]);
    }
  }, [isOpen]);

  const loadRecipientData = async () => {
    try {
      // Rate limiting
      if (globalRateLimiter.isRateLimited('recipient_stats', 10, 60000)) {
        notifications.rateLimitExceeded('recipient data loading');
        return;
      }

      const response = await fetch('/api/email-marketing/v2?action=recipient_stats', {
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && (window as any).csrfToken && {
            'X-CSRF-Token': (window as any).csrfToken
          })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Validate and sanitize recipient stats
        const stats: RecipientStats = {
          total: Math.max(0, Number(data.data.total) || 0),
          active: Math.max(0, Number(data.data.active) || 0),
          segments: Array.isArray(data.data.segments) 
            ? data.data.segments.map((seg: any) => ({
                id: sanitizeUserInput(seg.id || ''),
                name: sanitizeUserInput(seg.name || ''),
                count: Math.max(0, Number(seg.count) || 0)
              }))
            : [],
          recentEngagement: Math.max(0, Math.min(100, Number(data.data.recentEngagement) || 0))
        };
        setRecipientStats(stats);
      } else {
        throw new Error(data.error || 'Failed to load recipient stats');
      }
    } catch (error) {
      console.error('Error loading recipient stats:', error);
      notifications.error('Data Loading Error', 'Unable to load recipient statistics');
    }
  };

  const loadAvailableSegments = async () => {
    try {
      // Rate limiting
      if (globalRateLimiter.isRateLimited('segments_load', 10, 60000)) {
        notifications.rateLimitExceeded('segments loading');
        return;
      }

      const response = await fetch('/api/email-marketing/v2?action=segments', {
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && (window as any).csrfToken && {
            'X-CSRF-Token': (window as any).csrfToken
          })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Sanitize segment data
        const segments = Array.isArray(data.data.segments)
          ? data.data.segments.map((seg: any) => ({
              id: sanitizeUserInput(seg.id || ''),
              name: sanitizeUserInput(seg.name || 'Unnamed Segment'),
              contactCount: Math.max(0, Number(seg.contactCount) || 0),
              description: sanitizeUserInput(seg.description || ''),
              createdAt: seg.createdAt ? new Date(seg.createdAt) : new Date(),
              updatedAt: seg.updatedAt ? new Date(seg.updatedAt) : new Date()
            }))
          : [];
        setAvailableSegments(segments);
      } else {
        throw new Error(data.error || 'Failed to load segments');
      }
    } catch (error) {
      console.error('Error loading segments:', error);
      notifications.error('Data Loading Error', 'Unable to load segments');
    }
  };

  const validateTestEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  const handleSendTestEmail = async () => {
    const trimmedEmail = testEmail.trim();
    
    // Validation
    if (!trimmedEmail) {
      notifications.invalidInput('test email (required)');
      return;
    }

    if (!validateTestEmail(trimmedEmail)) {
      notifications.invalidInput('test email (invalid format)');
      return;
    }

    // Rate limiting
    if (globalRateLimiter.isRateLimited('test_email_send', 5, 300000)) { // 5 per 5 minutes
      notifications.rateLimitExceeded('test email sending');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/email-marketing/v2?action=send_test_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && (window as any).csrfToken && {
            'X-CSRF-Token': (window as any).csrfToken
          })
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          campaign_id: sanitizeUserInput(campaign.id),
          test_email: trimmedEmail,
          campaign_content: sanitizePreviewContent(campaign.content)
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTestEmailSent(true);
        notifications.success('Test Email Sent', `Test email sent to ${trimmedEmail}`);
        setTimeout(() => setStep('confirm'), 1000);
      } else {
        notifications.error('Test Email Failed', data.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      notifications.error('Test Email Error', 'Failed to send test email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateRecipientCount = (): number => {
    if (!recipientStats) return 0;
    
    switch (sendOptions.recipientType) {
      case 'all':
        return recipientStats.active;
      case 'segment':
        if (!sendOptions.segmentIds) return 0;
        return sendOptions.segmentIds.reduce((total, segmentId) => {
          const segment = recipientStats.segments.find(s => s.id === segmentId);
          return total + (segment?.count || 0);
        }, 0);
      case 'custom':
        return sendOptions.customEmails?.length || 0;
      default:
        return 0;
    }
  };

  const validateSendOptions = (): string[] => {
    const errors: string[] = [];
    
    // Validate recipient count
    const recipientCount = calculateRecipientCount();
    if (recipientCount === 0) {
      errors.push('No recipients selected');
    }

    // Validate campaign content
    if (!campaign.content || campaign.content.trim().length === 0) {
      errors.push('Campaign has no content');
    }

    // Validate custom emails if selected
    if (sendOptions.recipientType === 'custom' && sendOptions.customEmails) {
      const invalidEmails = sendOptions.customEmails.filter(email => !validateTestEmail(email));
      if (invalidEmails.length > 0) {
        errors.push(`Invalid email addresses: ${invalidEmails.slice(0, 3).join(', ')}`);
      }
    }

    // Validate scheduled date
    if (sendOptions.sendTiming === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        errors.push('Scheduled date and time are required');
      } else {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        if (scheduledDateTime <= new Date()) {
          errors.push('Scheduled time must be in the future');
        }
      }
    }

    return errors;
  };

  const handleFinalSend = async () => {
    const recipientCount = calculateRecipientCount();
    const validationErrors = validateSendOptions();
    
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      notifications.error('Validation Error', validationErrors.join(', '));
      return;
    }

    // Rate limiting for campaign sends
    if (globalRateLimiter.isRateLimited('campaign_send_' + campaign.id, 3, 3600000)) { // 3 per hour
      notifications.rateLimitExceeded('campaign sending');
      return;
    }

    // Final confirmation for large sends using secure notification system
    if (recipientCount > 1000) {
      const confirmed = notifications.showConfirmDialog({
        title: 'Confirm Large Campaign Send',
        message: `You are about to send "${campaign.name}" to ${recipientCount.toLocaleString()} recipients. This action cannot be undone. Are you sure you want to continue?`,
        confirmText: 'Send Campaign',
        cancelText: 'Cancel',
        variant: 'danger',
        onConfirm: async () => {
          // The actual send will happen after this confirmation
        }
      });

      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const finalOptions: SendOptions = {
        ...sendOptions,
        scheduledDate: sendOptions.sendTiming === 'scheduled' && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`)
          : undefined
      };

      await onSend(finalOptions);
      notifications.success('Campaign Sent Successfully', `Campaign "${campaign.name}" has been sent to ${recipientCount} recipients`);
      onClose();
    } catch (error) {
      console.error('Error sending campaign:', error);
      notifications.error('Campaign Send Error', 'Failed to send campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom email input with security validation
  const handleCustomEmailChange = useCallback((value: string) => {
    // Rate limiting for email input processing
    if (globalRateLimiter.isRateLimited('email_input_processing', 50, 60000)) {
      notifications.rateLimitExceeded('email input processing');
      return;
    }

    // Limit input length to prevent DoS
    if (value.length > 10000) {
      notifications.invalidInput('email list (too long)');
      return;
    }

    setCustomEmailInput(value);
    const sanitizedEmails = sanitizeEmailList(value);
    setSendOptions({...sendOptions, customEmails: sanitizedEmails});
  }, [sendOptions, notifications]);

  const renderStepIndicator = () => {
    const steps = [
      { id: 'recipients', name: 'Recipients', icon: '👥' },
      { id: 'test', name: 'Test Email', icon: '🧪' },
      { id: 'confirm', name: 'Confirm', icon: '✅' }
    ];

    return (
      <div className="flex items-center justify-center mb-6" role="navigation" aria-label="Send campaign progress">
        {steps.map((stepItem, index) => (
          <div key={stepItem.id} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step === stepItem.id 
                ? 'bg-blue-500 text-white' 
                : steps.findIndex(s => s.id === step) > index
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {steps.findIndex(s => s.id === step) > index ? '✓' : <span aria-hidden="true">{stepItem.icon}</span>}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step === stepItem.id ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {stepItem.name}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${
                steps.findIndex(s => s.id === step) > index ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderRecipientsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients</h3>
        
        {recipientStats && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{recipientStats.total.toLocaleString()}</div>
                <div className="text-sm text-blue-800">Total Contacts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{recipientStats.active.toLocaleString()}</div>
                <div className="text-sm text-green-800">Active Contacts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{recipientStats.segments.length}</div>
                <div className="text-sm text-purple-800">Segments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{Math.round(recipientStats.recentEngagement)}%</div>
                <div className="text-sm text-orange-800">Recent Engagement</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4" role="radiogroup" aria-labelledby="recipient-type-label">
        <h4 id="recipient-type-label" className="sr-only">Choose recipient type</h4>
        
        {/* All Active Contacts */}
        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="recipientType"
            value="all"
            checked={sendOptions.recipientType === 'all'}
            onChange={(e) => setSendOptions({...sendOptions, recipientType: e.target.value as any})}
            className="mt-1"
            aria-describedby="all-contacts-desc"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">All Active Contacts</div>
            <div id="all-contacts-desc" className="text-sm text-gray-600">
              Send to all {recipientStats?.active.toLocaleString() || 0} active contacts in your database
            </div>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {recipientStats?.active.toLocaleString() || 0}
          </div>
        </label>

        {/* Specific Segments */}
        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="recipientType"
            value="segment"
            checked={sendOptions.recipientType === 'segment'}
            onChange={(e) => setSendOptions({...sendOptions, recipientType: e.target.value as any})}
            className="mt-1"
            aria-describedby="segments-desc"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Specific Segments</div>
            <div id="segments-desc" className="text-sm text-gray-600 mb-3">
              Choose one or more segments to target specific groups
            </div>
            
            {sendOptions.recipientType === 'segment' && (
              <div className="space-y-2 mt-3" role="group" aria-label="Available segments">
                {availableSegments.map((segment) => (
                  <label key={segment.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sendOptions.segmentIds?.includes(segment.id) || false}
                      onChange={(e) => {
                        const currentIds = sendOptions.segmentIds || [];
                        const newIds = e.target.checked
                          ? [...currentIds, segment.id]
                          : currentIds.filter(id => id !== segment.id);
                        setSendOptions({...sendOptions, segmentIds: newIds});
                      }}
                      className="rounded"
                    />
                    <span className="font-medium">{segment.name}</span>
                    <span className="text-gray-500">({segment.contactCount?.toLocaleString() || 0} contacts)</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="text-lg font-bold text-purple-600">
            {sendOptions.recipientType === 'segment' ? calculateRecipientCount().toLocaleString() : '0'}
          </div>
        </label>

        {/* Custom Email List */}
        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="recipientType"
            value="custom"
            checked={sendOptions.recipientType === 'custom'}
            onChange={(e) => setSendOptions({...sendOptions, recipientType: e.target.value as any})}
            className="mt-1"
            aria-describedby="custom-emails-desc"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Custom Email List</div>
            <div id="custom-emails-desc" className="text-sm text-gray-600 mb-3">
              Enter specific email addresses (one per line)
            </div>
            
            {sendOptions.recipientType === 'custom' && (
              <div>
                <label htmlFor="custom-email-input" className="sr-only">
                  Enter email addresses, one per line
                </label>
                <textarea
                  id="custom-email-input"
                  value={customEmailInput}
                  onChange={(e) => handleCustomEmailChange(e.target.value)}
                  placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none"
                  maxLength={10000}
                  aria-describedby="email-input-help"
                />
                <div id="email-input-help" className="text-xs text-gray-500 mt-1">
                  Maximum 10,000 characters. Invalid email addresses will be filtered out automatically.
                </div>
              </div>
            )}
          </div>
          <div className="text-lg font-bold text-green-600">
            {sendOptions.recipientType === 'custom' ? calculateRecipientCount().toLocaleString() : '0'}
          </div>
        </label>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <h4 className="text-red-800 font-medium mb-2">Please fix the following issues:</h4>
          <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep('test')}
          disabled={calculateRecipientCount() === 0}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          type="button"
        >
          Continue to Test Email ({calculateRecipientCount().toLocaleString()} recipients)
        </button>
      </div>
    </div>
  );

  const renderTestStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Send Test Email</h3>
        <p className="text-gray-600 text-sm mb-4">
          It's recommended to send a test email before sending to all recipients to verify formatting and content.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="alert">
        <div className="flex items-start gap-3">
          <div className="text-yellow-600 text-xl" aria-hidden="true">⚠️</div>
          <div>
            <div className="font-medium text-yellow-800 mb-1">Important: Test Before Sending</div>
            <div className="text-sm text-yellow-700">
              Test emails help you verify that your campaign looks correct across different email clients and devices.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="test-email-input" className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address
          </label>
          <input
            id="test-email-input"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg"
            maxLength={254} // RFC compliant email max length
            aria-describedby="test-email-help"
            autoComplete="email"
          />
          <p id="test-email-help" className="text-xs text-gray-500 mt-1">
            Enter your email address to receive a test version of this campaign
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSendTestEmail}
            disabled={!testEmail.trim() || loading || !validateTestEmail(testEmail)}
            className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            type="button"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
                Sending Test...
              </>
            ) : (
              <>
                <span aria-hidden="true">🧪</span> Send Test Email
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            type="button"
            aria-pressed={showPreview}
          >
            {showPreview ? 'Hide Preview' : <><span aria-hidden="true">👁️</span> Preview</>}
          </button>
        </div>

        {showPreview && (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Email Preview:</div>
            <div className="bg-white border rounded p-4 text-sm">
              <div className="font-bold text-lg mb-2">{campaign.subject}</div>
              {campaign.previewText && (
                <div className="text-gray-600 text-sm mb-4">{campaign.previewText}</div>
              )}
              <div 
                dangerouslySetInnerHTML={{ __html: sanitizePreviewContent(campaign.content.substring(0, 500) + '...') }} 
                role="document"
                aria-label="Campaign preview content"
              />
            </div>
          </div>
        )}

        {testEmailSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4" role="alert">
            <div className="flex items-center gap-2">
              <div className="text-green-600" aria-hidden="true">✅</div>
              <div className="text-green-800 font-medium">Test email sent successfully!</div>
            </div>
            <div className="text-sm text-green-700 mt-1">
              Check your inbox at {testEmail} to verify the campaign appearance.
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setStep('recipients')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          type="button"
        >
          <span aria-hidden="true">←</span> Back to Recipients
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('confirm')}
            className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium"
            type="button"
          >
            Skip Test Email
          </button>
          <button
            onClick={() => setStep('confirm')}
            disabled={!testEmailSent}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            type="button"
          >
            Continue to Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Campaign Send</h3>
        <p className="text-gray-600 text-sm">
          Review your campaign details before sending. This action cannot be undone.
        </p>
      </div>

      {/* Campaign Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-700">Campaign Name</div>
            <div className="text-lg font-bold text-gray-900">{campaign.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Subject Line</div>
            <div className="text-lg font-bold text-gray-900">{campaign.subject}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Recipients</div>
            <div className="text-lg font-bold text-blue-600">{calculateRecipientCount().toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Recipient Type</div>
            <div className="text-lg font-bold text-gray-900 capitalize">
              {sendOptions.recipientType === 'all' ? 'All Active Contacts' : 
               sendOptions.recipientType === 'segment' ? 'Selected Segments' : 'Custom List'}
            </div>
          </div>
        </div>

        {sendOptions.recipientType === 'segment' && sendOptions.segmentIds && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Selected Segments</div>
            <div className="flex flex-wrap gap-2">
              {sendOptions.segmentIds.map(segmentId => {
                const segment = availableSegments.find(s => s.id === segmentId);
                return segment ? (
                  <span key={segmentId} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {segment.name} ({segment.contactCount?.toLocaleString() || 0})
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sending Options */}
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">When to Send</div>
          <div className="space-y-3" role="radiogroup" aria-labelledby="send-timing-label">
            <h4 id="send-timing-label" className="sr-only">Choose when to send</h4>
            
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="sendTiming"
                value="immediate"
                checked={sendOptions.sendTiming === 'immediate'}
                onChange={(e) => setSendOptions({...sendOptions, sendTiming: e.target.value as any})}
              />
              <div>
                <div className="font-medium">Send Immediately</div>
                <div className="text-sm text-gray-600">Campaign will be sent right away</div>
              </div>
            </label>
            
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="sendTiming"
                value="scheduled"
                checked={sendOptions.sendTiming === 'scheduled'}
                onChange={(e) => setSendOptions({...sendOptions, sendTiming: e.target.value as any})}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">Schedule for Later</div>
                <div className="text-sm text-gray-600 mb-2">Choose a specific date and time to send</div>
                
                {sendOptions.sendTiming === 'scheduled' && (
                  <div className="flex gap-3">
                    <div>
                      <label htmlFor="schedule-date" className="sr-only">Schedule date</label>
                      <input
                        id="schedule-date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="p-2 border border-gray-300 rounded text-sm"
                        aria-describedby="schedule-date-help"
                      />
                      <div id="schedule-date-help" className="sr-only">
                        Choose the date to send the campaign
                      </div>
                    </div>
                    <div>
                      <label htmlFor="schedule-time" className="sr-only">Schedule time</label>
                      <input
                        id="schedule-time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="p-2 border border-gray-300 rounded text-sm"
                        aria-describedby="schedule-time-help"
                      />
                      <div id="schedule-time-help" className="sr-only">
                        Choose the time to send the campaign
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <h4 className="text-red-800 font-medium mb-2">Please fix the following issues:</h4>
          <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Final Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
        <div className="flex items-start gap-3">
          <div className="text-red-600 text-xl" aria-hidden="true">🚨</div>
          <div>
            <div className="font-medium text-red-800 mb-1">Final Warning</div>
            <div className="text-sm text-red-700">
              You are about to send "{campaign.name}" to {calculateRecipientCount().toLocaleString()} recipients. 
              {sendOptions.sendTiming === 'scheduled' ? ` The campaign will be sent on ${scheduledDate} at ${scheduledTime}.` : ' The campaign will be sent immediately.'}
              {' '}This action cannot be undone.
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setStep('test')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          type="button"
        >
          <span aria-hidden="true">←</span> Back to Test
        </button>
        <button
          onClick={handleFinalSend}
          disabled={loading || (sendOptions.sendTiming === 'scheduled' && (!scheduledDate || !scheduledTime))}
          className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          type="button"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
              Sending Campaign...
            </>
          ) : (
            <>
              <span aria-hidden="true">🚀</span> {sendOptions.sendTiming === 'scheduled' ? 'Schedule' : 'Send'} Campaign to {calculateRecipientCount().toLocaleString()} Recipients
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="dialog-title" className="text-2xl font-bold text-gray-900">Send Campaign: {campaign.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              aria-label="Close dialog"
              type="button"
            >
              ×
            </button>
          </div>

          {renderStepIndicator()}

          <div className="min-h-[500px]">
            {step === 'recipients' && renderRecipientsStep()}
            {step === 'test' && renderTestStep()}
            {step === 'confirm' && renderConfirmStep()}
          </div>
        </div>
      </div>
    </div>
  );
}